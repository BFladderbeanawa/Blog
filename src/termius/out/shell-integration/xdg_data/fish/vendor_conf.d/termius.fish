# Copyright (c) 2023 Termius Corporation.

# Inspired by implementation in Visual Studio Code
# ---------------------------------------------------------------------------------------------
#   Copyright (c) Microsoft Corporation. All rights reserved.
#   Licensed under the MIT License.
# ---------------------------------------------------------------------------------------------

status is-interactive
and string match --quiet "$TERM_PROGRAM" "Termius"
and ! set --query _termius_integration_installed
or exit

function _termius_encode
  builtin echo -n "$argv[1]" | command base64
end

function _termius_current_cwd
  builtin printf "\e]4545;SetCwd;%s\a" (_termius_encode "$PWD")
end

function _termius_prompt_begins
	builtin printf "\e]4545;ShellPromptBegins\a"
end

function _termius_prompt_ends
	builtin printf "\e]4545;ShellPromptEnds\a"
end

function _termius_command_started
  builtin printf "\e]4545;CommandStarted;%s\a" (_termius_encode "$argv[1]")
end

function _termius_command_exited
  builtin printf "\e]4545;CommandExited;%s\a" "$argv[1]"
end

# Sent right before executing an interactive command.
# Marks the beginning of command output.
function _termius_cmd_executed --on-event fish_preexec
	set --global _termius_current_command "$argv[1]"

	if test -n "$_termius_current_command"
		_termius_command_started "$_termius_current_command"
	end
end

# Sent right after an interactive command has finished executing.
# Marks the end of command output.
function _termius_cmd_finished --on-event fish_postexec
	set -l exit_code $status

	if test -n "$_termius_current_command"
		_termius_command_exited "$exit_code"
	end
end

# Preserve the user's existing prompt, to wrap in our escape sequences.
function __preserve_fish_prompt --on-event fish_prompt
	if functions --query fish_prompt
		if functions --query _termius_fish_prompt
			# Erase the fallback so it can be set to the user's prompt
			functions --erase _termius_fish_prompt
		end
		functions --copy fish_prompt _termius_fish_prompt
		functions --erase __preserve_fish_prompt
		# Now _termius_fish_prompt is guaranteed to be defined
		__init_termius_shell_integration
	else
		if functions --query _termius_fish_prompt
			functions --erase __preserve_fish_prompt
			__init_termius_shell_integration
		else
			# There is no fish_prompt set, so stick with the default
			# Now _termius_fish_prompt is guaranteed to be defined
			function _termius_fish_prompt
				echo -n (whoami)@(prompt_hostname) (prompt_pwd) '~> '
			end
		end
	end
end

# Sent whenever a new fish prompt is about to be displayed.
# Updates the current working directory.
function _termius_update_cwd --on-event fish_prompt
	_termius_current_cwd
end

function _termius_fish_has_mode_prompt -d "Returns true if fish_mode_prompt is defined and not empty"
	functions fish_mode_prompt | string match -rvq '^ *(#|function |end$|$)'
end

# Preserve and wrap fish_mode_prompt (which appears to the left of the regular
# prompt), but only if it's not defined as an empty function (which is the
# officially documented way to disable that feature).
function __init_termius_shell_integration
	if _termius_fish_has_mode_prompt
		functions --copy fish_mode_prompt _termius_fish_mode_prompt

		function fish_mode_prompt
			_termius_prompt_begins
			_termius_fish_mode_prompt
		end

		function fish_prompt
			_termius_fish_prompt
			_termius_prompt_ends
		end
	else
		# No fish_mode_prompt, so put everything in fish_prompt.
		function fish_prompt
			_termius_prompt_begins
			_termius_fish_prompt
			_termius_prompt_ends
		end
	end
end
__preserve_fish_prompt

set --global _termius_integration_installed