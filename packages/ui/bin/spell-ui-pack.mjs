#!/usr/bin/env node
/**
 * `spell-ui-pack build | check [<folder>]`:  a component pack's build, or whether it's current -- Spell UI's own pack
 * tooling (`tools/ComponentPack.ts`), from any folder of any repo that links Spell UI in.
 * - `<folder>`:  the pack's package, the folder of its `package.json`;  default the current folder.
 * - spell-epic and the brand build their packs with it (their `yarn pack:build` / `pack:check`);
 *   spell-app's `spell dev pack build` calls the same tool.
 * - Runs the tool's source through `tsx`, no build step, with the PACK's own `tsconfig.json` when it has one
 *   (else Spell UI's):  the catalog imports the pack's vocabularies, whose `$/<pack>/...` imports resolve as the
 *   pack's own build resolves them.
 * - Exits 0 built or current, 1 stale or failed, 2 bad arguments.
 * - NOTE: a link to this file works (a repo's `node_modules/.bin`):  node runs the real path, so `import.meta.url`
 *   is in Spell UI's folder.
 */
import { existsSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { register } from "tsx/esm/api"

/** Spell UI's package folder. */
const UI = resolve(dirname(fileURLToPath(import.meta.url)), "..")

const args = process.argv.slice(2)
const ownConfig = join(resolve(args[1] ?? "."), "tsconfig.json")
register({ tsconfig: existsSync(ownConfig) ? ownConfig : join(UI, "tsconfig.json") })
const { ComponentPack } = await import(pathToFileURL(join(UI, "tools", "ComponentPack.ts")).href)
process.exitCode = await ComponentPack.main(args)
