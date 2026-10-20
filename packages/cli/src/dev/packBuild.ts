import { existsSync, readdirSync } from "fs"
import { join, relative } from "path"

// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { CliError, EXIT } from "$/cli/cli.types"
import type { PackBuildReport, PackCheckReport } from "$/cli/dev/dev.types"
import { ComponentPack } from "@spell-app/ui/tools/ComponentPack"
import { ComponentPackError } from "@spell-app/ui/tools/tools.types"

/**
 * `spell dev pack build <pack>`:  pack `name` of checkout `root` built by Spell UI's own pack tooling,
 * `ComponentPack` (`packages/ui/tools/ComponentPack.ts`, epic `repo-split` P5), which spell-epic and the brand run
 * themselves (`spell-ui-pack build`).
 * - What this adds:  the pack found BY NAME in the checkout (`readPack()`), paths relative to it, `CliError`s.
 * - Node built-ins, `ComponentPack` and (only while building) Vite:  no spell, so it runs on the lean `spell dev` entry.
 * - Throws `CliError` for a package that isn't a pack, a tag without the pack's prefix, or an import of Spell UI or
 *   Solid the page can't share.
 */
export async function buildPack(root: string, name: string): Promise<PackBuildReport> {
  const pack = readPack(root, name)
  const report = await asCliError(() => pack.build())
  return { ...report, files: report.files.map((file) => relative(root, file)) }
}

/**
 * `spell dev pack check [<pack>]`:  whether pack `name`'s generated files are CURRENT (`ComponentPack.check()`).
 * - `stale` names each one that isn't, relative to `root`, and why;  none means current.
 */
export async function checkPack(root: string, name: string): Promise<PackCheckReport> {
  const { pack, hash, stale } = await asCliError(() => readPack(root, name).check())
  return { pack, hash, stale: stale.map(({ file, reason }) => `${relative(root, file)}:  ${reason}`) }
}

/**
 * Pack `name` in checkout `root`:  the checkout itself, when its root `package.json` names the pack (spell-epic,
 * epic `epic-eject` J14);  else `packages/<name>/`.
 * - Throws `CliError` when there's no such package, or it isn't a pack.
 */
export function readPack(root: string, name: string): ComponentPack {
  const own = rootPack(root)
  if (own?.name === name) return own
  const folder = join(root, "packages", name)
  if (ComponentPack.prefixOf(folder) === undefined) {
    throw new CliError(
      `pack '${name}':  packages/${name}/package.json has no "spellPack": { "prefix" }, so it isn't a component pack;  ` +
        `make one with \`spell dev pack new ${name} --prefix <x->\``
    )
  }
  return ComponentPack.read(folder)
}

/**
 * Every component pack in checkout `root`, sorted:  the `packages/*` whose `package.json` has a `spellPack`, and the
 * checkout itself when it's one (`rootPack()`).
 */
export function packNames(root: string): string[] {
  const own = rootPack(root)?.name
  const packages = join(root, "packages")
  const named = existsSync(packages)
    ? readdirSync(packages).filter((name) => ComponentPack.prefixOf(join(packages, name)) !== undefined)
    : []
  return [...new Set([...(own ? [own] : []), ...named])].sort()
}

/** The pack checkout `root` IS, when its root `package.json` names one;  `undefined` otherwise.  NEVER throws. */
function rootPack(root: string): ComponentPack | undefined {
  return ComponentPack.prefixOf(root) === undefined ? undefined : ComponentPack.read(root)
}

/** `run()`'s result;  a `ComponentPackError` it throws becomes a `CliError` (exit 1), with the same message. */
async function asCliError<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run()
  } catch (error) {
    if (error instanceof ComponentPackError) throw new CliError(error.message, EXIT.ERRORS)
    throw error
  }
}
