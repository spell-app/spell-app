#!/bin/sh
# Run the goals tool of the checkout this script lives in:  goals.sh <command> ...   (commands:  goals.sh help)
# - The tool is `packages/docs/tools/goals/goals.js`;  it edits that checkout's `goals/` folder (see its `AGENTS.md`).
# - Finds the checkout from this script's REAL path:  it's reached through `.claude/skills/goals`, a symlink to
#   `packages/docs/tools/goals/skills/goals`, so `scripts/` is seven folders below the checkout's root.
set -e

here=$(cd -P "$(dirname "$0")" && pwd)
root=$(cd "$here/../../../../../../.." && pwd)
tool="$root/packages/docs/tools/goals/goals.js"
if [ ! -f "$tool" ]; then
  echo "goals:  no goals tool at $tool" >&2
  exit 2
fi

# under `tsx`, from the checkout's own node_modules, with the docs package's `tsconfig.json`:  the tools import the
# page server's code (`$/server`)
TSX_TSCONFIG_PATH="$root/packages/docs/tsconfig.json" exec node --import "file://$root/node_modules/tsx/dist/loader.mjs" "$tool" "$@"
