# shellcheck shell=bash
# Copyright (c) 2023 Termius Corporation.

# Inspired by implementation in Visual Studio Code
# ---------------------------------------------------------------------------------------------
#   Copyright (c) Microsoft Corporation. All rights reserved.
#   Licensed under the MIT License.
# ---------------------------------------------------------------------------------------------

if [[ -n "$_termius_integration_installed" ]]; then
  ZDOTDIR=$ORIGINAL_ZDOTDIR
  builtin return
fi

builtin autoload -Uz add-zsh-hook

# By default, zsh will set the $HISTFILE to the $ZDOTDIR location automatically. In the case of the
# shell integration being injected, this means that the terminal will use a different history file
# to other terminals. To fix this issue, set $HISTFILE back to the default location before ~/.zshrc
# is called as that may depend upon the value.
HISTFILE=$ORIGINAL_ZDOTDIR/.zsh_history

# shellcheck disable=SC2154 # Options are built-in table in ZSH
if [[ ${options[norcs]} = off && -f "$ORIGINAL_ZDOTDIR/.zshrc" && "$ORIGINAL_ZDOTDIR" != "$ZDOTDIR" ]]; then
  # Set original ZDOTDIR when sourcing the user's .zshrc
  _termius_zdotdir=$ZDOTDIR
  ZDOTDIR=$ORIGINAL_ZDOTDIR
  # shellcheck disable=SC1091 # don't check user's configuration
  . "$ORIGINAL_ZDOTDIR/.zshrc"
  ZDOTDIR=$_termius_zdotdir
fi

_termius_original_PS1="$PS1"
_termius_custom_PS1=""
_termius_in_command_execution="1"
_termius_current_command=""

function _termius_encode() {
  builtin echo -n "$1" | command base64
}

function _termius_current_cwd() {
  builtin printf "\e]4545;SetCwd;%s\a" "$(_termius_encode "$PWD")"
}

function _termius_prompt_begins() {
  builtin printf "\e]4545;ShellPromptBegins\a"
}

function _termius_prompt_ends() {
  builtin printf "\e]4545;ShellPromptEnds\a"
}

function _termius_wrap_prompt() {
  builtin print "%{$(_termius_prompt_begins)%}$1%{$(_termius_prompt_ends)%}"
}

function _termius_command_started() {
  builtin printf "\e]4545;CommandStarted;%s\a" "$(_termius_encode "$1")"
}

function _termius_command_exited() {
  builtin printf "\e]4545;CommandExited;%s\a" "$1"
}

_termius_update_prompt() {
  # in command execution
  if [ "$_termius_in_command_execution" = "1" ]; then
    # Wrap the prompt if it is not yet wrapped, if the PS1 changed this this was last set it
    # means the user re-exported the PS1 so we should re-wrap it
    if [[ "$_termius_custom_PS1" == "" || "$_termius_custom_PS1" != "$PS1" ]]; then
      _termius_prompt_begins
      _termius_original_PS1=$PS1
      _termius_custom_PS1=$(_termius_wrap_prompt "$_termius_original_PS1")
      PS1=$_termius_custom_PS1
      _termius_prompt_ends
    fi
    _termius_in_command_execution="0"
  fi
}

function _termius_precmd() {
  exit_status=$?

  if [ "$_termius_current_command" != "" ]; then
    _termius_command_exited "$exit_status"
  fi

  _termius_current_cwd
  _termius_current_command=""
  _termius_update_prompt

  unset exit_status
}

function _termius_preexec() {
  _termius_in_command_execution="1"
  _termius_current_command="$1"

  if [ "$_termius_current_command" != "" ]; then
    _termius_command_started "$_termius_current_command"
  fi
}

add-zsh-hook preexec _termius_preexec

add-zsh-hook precmd _termius_precmd

if [[ ${options[login]} = off ]]; then
  # .zshrc is the last startup file if shell is non-login.
  # Restore original ZDOTDIR
  ZDOTDIR=$ORIGINAL_ZDOTDIR
fi

_termius_update_prompt
_termius_integration_installed="yes"
