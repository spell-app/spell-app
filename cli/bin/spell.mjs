#!/usr/bin/env node
/**
 * `spell` command-line tool:  runs `src/main.ts` from THIS checkout, through `tsx` -- no build step.
 * - The parser's source runs the same way, from spell-lang's `spell` package (`@spell-app/spell`).
 * - `tsx` gets our `tsconfig.json` explicitly, so the CLI's settings hold from ANY current folder,
 *   while relative paths on the command line still resolve against the caller's.
 * - `$/` imports go by the importing file's own repo (`spell-kit/toolchain/aliases`, epic `repo-split` I12):  the
 *   CLI runs other repos' source (spell-lang's spell, spell-server's server), each with its own alias table.
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
// then every `$/` import by its OWN repo's alias table:  the CLI runs spell-lang's, spell-server's ... source too
await import("spell-kit/toolchain/aliases")
const entry = Object.hasOwn(LEAN, process.argv[2] ?? "") ? LEAN[process.argv[2]] : "src/main.ts"
await import(pathToFileURL(resolve(repoRoot, entry)).href)
