import { existsSync, readdirSync } from "fs"
import { join, relative } from "path"

// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { CliError, EXIT } from "$/cli/cli.types"
import type { PackBuildReport, PackCheckReport } from "$/cli/dev/dev.types"
import { ComponentPack } from "spell-kit/element/tools/ComponentPack"
import { ComponentPackError } from "spell-kit/element/tools/tools.types"

/**
 * `spell dev pack build <pack>`:  pack `name` of checkout `root` built by the kit's pack tooling,
 * `ComponentPack` (`spell-kit/element/tools/ComponentPack`;  Spell UI's from epic `repo-split` P5 to P10), which
 * spell-epic and the brand run themselves (`spell-pack build`).
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
 * epic `epic-eject` J14);  else its folder (`packFolders()`).
 * - Throws `CliError` when there's no such package, or it isn't a pack.
 */
export function readPack(root: string, name: string): ComponentPack {
  const own = rootPack(root)
  if (own?.name === name) return own
  const folder = packFolders(root, name).find((each) => ComponentPack.prefixOf(each) !== undefined) ?? join(root, name)
  if (ComponentPack.prefixOf(folder) === undefined) {
    throw new CliError(
      `pack '${name}':  ${name}/package.json has no "spellPack": { "prefix" }, so it isn't a component pack;  ` +
        `make one with \`spell dev pack new ${name} --prefix <x->\``
    )
  }
  return ComponentPack.read(folder)
}

/**
 * Where pack `name` may be, for checkout `root`, in order:
 * - `packages/<name>/`:  a monorepo's (spell-app's, before epic `repo-split` P8;  a test's made-up checkout)
 * - `<name>/`:  a package of this repo, at its root
 * - `../spell-<name>/`:  a repo of its own beside this one, in the top repo `spell` (the brand's, `spell-brand`)
 */
function packFolders(root: string, name: string): string[] {
  return [join(root, "packages", name), join(root, name), join(root, "..", `spell-${name}`)]
}

/**
 * Every component pack in checkout `root`, sorted:  each folder `packFolders()` names whose `package.json` has a
 * `spellPack`, and the checkout itself when it's one (`rootPack()`).
 * - Named by their pack name, `ComponentPack.read()`'s (the brand's:  `brand`, in `spell-brand/`).
 */
export function packNames(root: string): string[] {
  const own = rootPack(root)?.name
  const named: string[] = []
  const packages = join(root, "packages")
  if (existsSync(packages)) named.push(...readdirSync(packages).map((name) => join(packages, name)))
  named.push(...readdirSync(root).map((name) => join(root, name)))
  const top = join(root, "..")
  named.push(
    ...readdirSync(top)
      .filter((name) => name.startsWith("spell-"))
      .map((name) => join(top, name))
  )
  const packs = named.filter((folder) => ComponentPack.prefixOf(folder) !== undefined && folder !== root)
  return [...new Set([...(own ? [own] : []), ...packs.map((folder) => ComponentPack.read(folder).name)])].sort()
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
