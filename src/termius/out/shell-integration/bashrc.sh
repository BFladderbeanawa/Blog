# shellcheck shell=bash
# Copyright (c) 2023 Termius Corporation.

# Inspired by implementation in Visual Studio Code
# ---------------------------------------------------------------------------------------------
#   Copyright (c) Microsoft Corporation. All rights reserved.
#   Licensed under the MIT License.
# ---------------------------------------------------------------------------------------------

if [[ -n "$_termius_integration_installed" ]]; then
  builtin return
fi

if [ -z "$TERMIUS_SIMULATE_SHELL_LOGIN" ]; then
  # shellcheck disable=SC1091
  [ -r "$HOME/.bashrc" ] && . "$HOME/.bashrc"
else
  # Imitate -l because --rcfile doesn't support it
  # https://www.gnu.org/software/bash/manual/html_node/Bash-Startup-Files.html
  # shellcheck disable=SC1091 # don't check user's configuration
  [ -r /etc/profile ] && . /etc/profile
  if [ -r "$HOME/.bash_profile" ]; then
    # shellcheck disable=SC1091 # don't check user's configuration
    . "$HOME/.bash_profile"
  elif [ -r "$HOME/.bash_login" ]; then
    # shellcheck disable=SC1091 # don't check user's configuration
    . "$HOME/.bash_login"
  elif [ -r "$HOME/.profile" ]; then
    # shellcheck disable=SC1091 # don't check user's configuration
    . "$HOME/.profile"
  fi
  builtin unset TERMIUS_SIMULATE_SHELL_LOGIN
fi

_termius_encode() {
  builtin echo -n "$1" | command base64
}

_termius_get_trap() {
  # 'trap -p DEBUG' outputs a shell command like `trap -- '…shellcode…' DEBUG`.
  # The terms are quoted literals, but are not guaranteed to be on a single line.
  # (Consider a trap like $'echo foo\necho \'bar\'').
  # To parse, we splice those terms into an expression capturing them into an array.
  # This preserves the quoting of those terms: when we `eval` that expression, they are preserved exactly.
  # This is different than simply exploding the string, which would split everything on IFS, oblivious to quoting.
  builtin local -a terms
  builtin eval "terms=( $(trap -p "${1:-DEBUG}") )"
  #                    |________________________|
  #                            |
  #        \-------------------*--------------------/
  # terms=( trap  --  '…arbitrary shellcode…'  DEBUG )
  #        |____||__| |_____________________| |_____|
  #          |    |            |                |
  #          0    1            2                3
  #                            |
  #                   \--------*----/
  builtin printf '%s' "${terms[2]:-}"
}

# Allow verifying $BASH_COMMAND doesn't have aliases resolved via history when the right HISTCONTROL
# configuration is used
if [[ "$HISTCONTROL" =~ .*(erasedups|ignoreboth|ignoredups).* ]]; then
  _termius_history_verify=0
else
  _termius_history_verify=1
fi

_termius_original_PS1="$PS1"
_termius_custom_PS1=""
_termius_in_command_execution="1"
_termius_current_command=""

_termius_current_cwd() {
  builtin printf "\e]4545;SetCwd;%s\a" "$(_termius_encode "$PWD")"
}

_termius_prompt_begins() {
  builtin printf "\e]4545;ShellPromptBegins\a"
}

_termius_prompt_ends() {
  builtin printf "\e]4545;ShellPromptEnds\a"
}

_termius_wrap_prompt() {
  builtin printf "\[$(_termius_prompt_begins)\]%s\[$(_termius_prompt_ends)\]" "$1"
}

_termius_command_started() {
  builtin printf "\e]4545;CommandStarted;%s\a" "$(_termius_encode "$1")"
}

_termius_command_exited() {
  builtin printf "\e]4545;CommandExited;%s\a" "$1"
}

_termius_update_prompt() {
  # in command execution
  if [ "$_termius_in_command_execution" = "1" ]; then
    # Wrap the prompt if it is not yet wrapped, if the PS1 changed this this was last set it
    # means the user re-exported the PS1 so we should re-wrap it
    if [[ "$_termius_custom_PS1" == "" || "$_termius_custom_PS1" != "$PS1" ]]; then
      _termius_original_PS1=$PS1
      _termius_custom_PS1=$(_termius_wrap_prompt "$_termius_original_PS1")
      PS1="$_termius_custom_PS1"
    fi
    _termius_in_command_execution="0"
  fi
}

_termius_precmd() {
  if [ "$_termius_current_command" != "" ]; then
    _termius_command_exited "$_termius_status"
  fi

  _termius_current_cwd
  _termius_current_command=""
  _termius_update_prompt
}

_termius_preexec() {
  if [[ ! "$BASH_COMMAND" == _termius_prompt* ]]; then
    # Use history if it's available to verify the command as BASH_COMMAND comes in with aliases resolved
    if [ "$_termius_history_verify" = "1" ]; then
      _termius_current_command="$(builtin history 1 | sed 's/ *[0-9]* *//')"
    else
      _termius_current_command=$BASH_COMMAND
    fi
  else
    _termius_current_command=""
  fi

  if [ "$_termius_current_command" != "" ]; then
    _termius_command_started "$_termius_current_command"
  fi
}

# Debug trapping/preexec inspired by starship (ISC)
if [[ -n "${bash_preexec_imported:-}" ]]; then
  _termius_preexec_only() {
    if [ "$_termius_in_command_execution" = "0" ]; then
      _termius_in_command_execution="1"
      _termius_preexec
    fi
  }
  precmd_functions+=(_termius_prompt_cmd)
  preexec_functions+=(_termius_preexec_only)
else
  _termius_dbg_trap="$(_termius_get_trap DEBUG)"

  # shellcheck disable=SC2016
  if [[ -z "$_termius_dbg_trap" ]]; then
    _termius_preexec_only() {
      if [ "$_termius_in_command_execution" = "0" ]; then
        _termius_in_command_execution="1"
        _termius_preexec
      fi
    }
    trap '_termius_preexec_only "$_"' DEBUG
  elif [[ "$_termius_dbg_trap" != '_termius_preexec "$_"' && "$_termius_dbg_trap" != '_termius_preexec_all "$_"' ]]; then
    _termius_preexec_all() {
      if [ "$_termius_in_command_execution" = "0" ]; then
        _termius_in_command_execution="1"
        builtin eval "${_termius_dbg_trap}"
        _termius_preexec
      fi
    }
    trap '_termius_preexec_all "$_"' DEBUG
  fi
fi

_termius_update_prompt

_termius_restore_exit_code() {
  return "$1"
}

_termius_prompt_cmd_original() {
  _termius_status="$?"
  _termius_restore_exit_code "${_termius_status}"
  # Evaluate the original PROMPT_COMMAND similarly to how bash would normally
  # See https://unix.stackexchange.com/a/672843 for technique
  for cmd in "${_termius_original_prompt_command[@]}"; do
    eval "${cmd:-}"
  done
  _termius_precmd
}

_termius_prompt_cmd() {
  _termius_status="$?"
  _termius_precmd
}

# PROMPT_COMMAND arrays and strings seem to be handled the same (handling only the first entry of
# the array?)
_termius_original_prompt_command=${PROMPT_COMMAND:-}

if [[ -z "${bash_preexec_imported:-}" ]]; then
  if [[ -n "${_termius_original_prompt_command:-}" && "${_termius_original_prompt_command:-}" != "_termius_prompt_cmd" ]]; then
    PROMPT_COMMAND=_termius_prompt_cmd_original
  else
    PROMPT_COMMAND=_termius_prompt_cmd
  fi
fi

_termius_integration_installed="yes"
