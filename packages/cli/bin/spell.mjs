#!/usr/bin/env node
/**
 * `spell` command-line tool:  runs `src/main.ts` from THIS checkout, through `tsx` -- no build step.
 * - The parser's source runs the same way, from the `spell` package beside this one:  `../spell`.
 * - `tsx` gets our `tsconfig.json` explicitly, so `~/...` imports resolve from ANY current folder,
 *   while relative paths on the command line still resolve against the caller's.
 * - `spell dev ...` runs `src/devMain.ts` instead:  it loads no spell, so a repo tool starts in a fraction of
 *   the time.
 * - `spell epic ...`, the old spelling of the `epic` command (spell-epic's), runs `src/devMain.ts` too, which hands
 *   it on to `epic`.
 * - Install on your `PATH` with `yarn cli:install` -- see `scripts/install-cli.mjs`.
 * - NOTE: a symlink to this file works:  node runs the real path, so `import.meta.url` is in the repo.
 */
import { dirname, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { register } from "tsx/esm/api"

/** The lean entries, by first word:  they load no spell. */
const LEAN = { dev: "src/devMain.ts", epic: "src/devMain.ts" }

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
register({ tsconfig: resolve(repoRoot, "tsconfig.json") })
const entry = Object.hasOwn(LEAN, process.argv[2] ?? "") ? LEAN[process.argv[2]] : "src/main.ts"
await import(pathToFileURL(resolve(repoRoot, entry)).href)
