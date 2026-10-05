#!/usr/bin/env node
/**
 * `spell` command-line tool:  runs `src/main.ts` from THIS checkout, through `tsx` -- no build step.
 * - The parser's source runs the same way, from the `spell` package beside this one:  `../spell`.
 * - `tsx` gets our `tsconfig.json` explicitly, so `~/...` imports resolve from ANY current folder,
 *   while relative paths on the command line still resolve against the caller's.
 * - `spell dev ...` (and the deprecated `spell plan-doc` / `spell goals`) runs `src/devMain.ts` instead:  it loads
 *   no spell, so a repo tool starts in a fraction of the time.
 * - Install on your `PATH` with `yarn cli:install` -- see `scripts/install-cli.mjs`.
 * - NOTE: a symlink to this file works:  node runs the real path, so `import.meta.url` is in the repo.
 */
import { dirname, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { register } from "tsx/esm/api"

/** First words `src/devMain.ts` runs. */
const LEAN = ["dev", "plan-doc", "goals"]

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
register({ tsconfig: resolve(repoRoot, "tsconfig.json") })
const entry = LEAN.includes(process.argv[2]) ? "src/devMain.ts" : "src/main.ts"
await import(pathToFileURL(resolve(repoRoot, entry)).href)
