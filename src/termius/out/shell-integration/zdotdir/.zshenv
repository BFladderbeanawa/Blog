# shellcheck shell=bash
# Copyright (c) 2023 Termius Corporation.

# Inspired by implementation in Visual Studio Code
# ---------------------------------------------------------------------------------------------
#   Copyright (c) Microsoft Corporation. All rights reserved.
#   Licensed under the MIT License.
# ---------------------------------------------------------------------------------------------

if [[ -f $ORIGINAL_ZDOTDIR/.zshenv && $ORIGINAL_ZDOTDIR != "$ZDOTDIR" ]]; then
  # Set original ZDOTDIR when sourcing the user's .zshenv
  _termius_zdotdir=$ZDOTDIR
  ZDOTDIR=$ORIGINAL_ZDOTDIR
  # shellcheck disable=SC1091 # don't check user's configuration
  . "$ORIGINAL_ZDOTDIR/.zshenv"
  ZDOTDIR=$_termius_zdotdir
fi
