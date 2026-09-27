# shellcheck shell=sh
# Copyright (c) 2023 Termius Corporation.

if [ "$_termius_orig_ps1" = "" ]; then
  _termius_orig_ps1="$PS1"
  _termius_encode() {
    \printf "%s" "$1" | \base64
  }
  _termius_set_cwd() {
    # shellcheck disable=SC2016 # we don't need expansion of $() expression in this place, it will be expanded later, when PS1 is evaluated
    \printf '\001\033]4545;P;Cwd=$(_termius_encode "$PWD")\007\002'
  }
  PS1="$(_termius_set_cwd)$_termius_orig_ps1"
fi
