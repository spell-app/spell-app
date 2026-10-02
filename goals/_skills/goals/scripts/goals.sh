#!/bin/sh
# Run the goals tool of the nearest goals folder:  goals.sh <command> ...   (commands:  goals.sh help)
# - The goals folder holds `goals.preferences.json5`;  its tool is `_tools/goals.js` (see its `AGENTS.md`).
# - Looks UP from the current folder for `goals/goals.preferences.json5` (or a `goals.preferences.json5` here),
#   then DOWN three levels.  Several found below:  lists them and exits 3, so the caller can ask which.
# - `GOALS_DIR=<folder>` skips the search.
set -e

find_up() {
  dir=$(pwd)
  while [ "$dir" != "/" ]; do
    if [ -f "$dir/goals.preferences.json5" ]; then echo "$dir"; return 0; fi
    if [ -f "$dir/goals/goals.preferences.json5" ]; then echo "$dir/goals"; return 0; fi
    dir=$(dirname "$dir")
  done
  return 1
}

if [ -n "$GOALS_DIR" ]; then
  goals="$GOALS_DIR"
elif ! goals=$(find_up); then
  found=$(find . -maxdepth 4 \( -name node_modules -o -name .git \) -prune -o -name goals.preferences.json5 -print 2>/dev/null || true)
  count=$(printf '%s' "$found" | grep -c . || true)
  if [ "$count" = "0" ]; then
    echo "goals:  no goals folder here (no goals.preferences.json5 above or below $(pwd))" >&2
    exit 2
  fi
  if [ "$count" != "1" ]; then
    echo "goals:  several goals folders;  set GOALS_DIR to one of:" >&2
    printf '%s\n' "$found" | sed 's#/goals.preferences.json5$##' >&2
    exit 3
  fi
  goals=$(dirname "$found")
fi

# under `tsx`, from the project's own node_modules, with the goals folder's `tsconfig.json`:  the tools import the
# page server's code (`$/server`)
root=$(dirname "$goals")
TSX_TSCONFIG_PATH="$goals/tsconfig.json" exec node --import "file://$root/node_modules/tsx/dist/loader.mjs" "$goals/_tools/goals.js" "$@"
