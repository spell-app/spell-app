#!/usr/bin/env node
/**
 * `spell` command-line tool:  runs `src/main.ts` from THIS checkout, through `tsx` -- no build step.
 * - The parser's source runs the same way, from its own checkout beside this one:  `../parser`.
 * - `tsx` gets our `tsconfig.json` explicitly, so `~/...` imports resolve from ANY current folder,
 *   while relative paths on the command line still resolve against the caller's.
 * - Install on your `PATH` with `yarn cli:install` -- see `scripts/install-cli.mjs`.
 * - NOTE: a symlink to this file works:  node runs the real path, so `import.meta.url` is in the repo.
 */
import { dirname, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { register } from "tsx/esm/api"

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
register({ tsconfig: resolve(repoRoot, "tsconfig.json") })
await import(pathToFileURL(resolve(repoRoot, "src/main.ts")).href)
