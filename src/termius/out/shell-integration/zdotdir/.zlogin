# shellcheck shell=bash
# Copyright (c) 2023 Termius Corporation.

# Inspired by implementation in Visual Studio Code
# ---------------------------------------------------------------------------------------------
#   Copyright (c) Microsoft Corporation. All rights reserved.
#   Licensed under the MIT License.
# ---------------------------------------------------------------------------------------------

# Restore original ZDOTDIR since .zlogin is the last startup file
ZDOTDIR=$ORIGINAL_ZDOTDIR
# shellcheck disable=SC2154 # Options are built-in table in ZSH
if [[ ${options[norcs]} = off && -o "login" &&  -f $ZDOTDIR/.zlogin ]]; then
  # shellcheck disable=SC1091 # don't check user's configuration
  . "$ZDOTDIR/.zlogin"
fi
