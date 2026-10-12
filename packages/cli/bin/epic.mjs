#!/usr/bin/env node
/**
 * `epic` command-line tool:  the epic tools (epic pages, the pages Owen answers on, agents, airplane mode), from
 * THIS checkout, through `tsx` -- no build step.  `epic --help` lists them.
 * - Runs `src/epicMain.ts`, the lean entry:  it loads no spell, so a call starts in a fraction of a second.
 * - A second bin of the `spell` CLI's package:  `yarn cli:install` links both onto your `PATH`
 *   (`scripts/install-cli.mjs`).
 * - NOTE: a symlink to this file works:  node runs the real path, so `import.meta.url` is in the repo.
 */
import { dirname, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { register } from "tsx/esm/api"

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
register({ tsconfig: resolve(packageRoot, "tsconfig.json") })
await import(pathToFileURL(resolve(packageRoot, "src/epicMain.ts")).href)
