# shellcheck shell=bash
# Copyright (c) 2023 Termius Corporation.

# Inspired by implementation in Visual Studio Code
# ---------------------------------------------------------------------------------------------
#   Copyright (c) Microsoft Corporation. All rights reserved.
#   Licensed under the MIT License.
# ---------------------------------------------------------------------------------------------

# shellcheck disable=SC2154 # Options are built-in table in ZSH
if [[ ${options[norcs]} = off && -o "login" &&  -f $ORIGINAL_ZDOTDIR/.zprofile && $ORIGINAL_ZDOTDIR != "$ZDOTDIR" ]]; then
  # Set original ZDOTDIR when sourcing the user's .zprofile
  _termius_zdotdir=$ZDOTDIR
  ZDOTDIR=$ORIGINAL_ZDOTDIR
  # shellcheck disable=SC1091 # don't check user's configuration
  . "$ORIGINAL_ZDOTDIR/.zprofile"
  ZDOTDIR=$_termius_zdotdir
fi
