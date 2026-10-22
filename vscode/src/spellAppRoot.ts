/**
 * Which spell-app checkout the extension runs:  its language server (`src/lsp/`) and its runner bundle (`app/`).
 * - Decided when the server starts, from the window, NOT from where the extension was built:
 *   one installed copy works for the kit's main checkout, every epic's worktree, and a checkout you've moved.
 * - Plain node (`fs`, `path`), NO `vscode`:  `extension.ts` hands it the setting and the window's folders,
 *   so a script can check it without VS Code.
 */
import { existsSync, readFileSync } from "fs"
import { dirname, join, resolve } from "path"

/** spell-app's package name:  its `package.json` says so, wherever the checkout lives. */
const SPELL_APP = "spell-app"

/**
 * The spell-app checkout to run, and why it was picked;  `undefined` when none of `places` leads to one.
 * - In this order:
 *   1. `configured`, the `spell.parserRoot` setting:  if it's set, it's the only place looked at
 *   2. the window's folders, each one's checkout (see `spellAppAbove()`), the folders after the FIRST before it:
 *      a worktree's window lists the MAIN checkout first only so its Claude panel lists every session,
 *      and the worktree, the one being worked on, right after it
 *   3. `builtIn`, the checkout the extension was built in, if it's still a spell-app checkout:
 *      for a spell file opened in a window with no checkout in it
 * - A folder leads to a checkout when it's spell-app itself, holds it (the kit's folder, `spell-app/` in it),
 *   or is anywhere inside one of those, e.g. a spell project in the kit's `spell-lang/`.
 */
export function findSpellApp({ configured, workspaceFolders, builtIn }: SpellAppPlaces): SpellAppChoice | undefined {
  if (configured) {
    const root = spellAppAbove(resolve(configured))
    return root ? { root, reason: `setting \`spell.parserRoot\` (${configured})` } : undefined
  }
  const [first, ...rest] = workspaceFolders
  for (const folder of [...rest, ...(first ? [first] : [])]) {
    const root = spellAppAbove(folder)
    if (root) return { root, reason: `window folder ${folder}` }
  }
  if (spellAppAt(builtIn) === builtIn) return { root: builtIn, reason: "the checkout the extension was built in" }
  return undefined
}

/**
 * The spell-app checkout at `folder` or the nearest folder above it (see `spellAppAt()`);  `undefined` if none.
 */
export function spellAppAbove(folder: string): string | undefined {
  for (let dir = folder; ; dir = dirname(dir)) {
    const root = spellAppAt(dir)
    if (root) return root
    if (dirname(dir) === dir) return undefined
  }
}

/**
 * The spell-app checkout `folder` is or holds:
 * - `folder` itself, if its `package.json` is spell-app's
 * - else `folder/spell-app`, if that's spell-app's:  the kit's folder, main checkout or an epic's worktree
 * - else `undefined`
 */
export function spellAppAt(folder: string): string | undefined {
  for (const candidate of [folder, join(folder, SPELL_APP)]) {
    if (packageNameOf(candidate) === SPELL_APP) return candidate
  }
  return undefined
}

/** The `name` in `folder`'s `package.json`;  `undefined` if it has none, or it can't be read. */
function packageNameOf(folder: string): string | undefined {
  const file = join(folder, "package.json")
  if (!existsSync(file)) return undefined
  try {
    return (JSON.parse(readFileSync(file, "utf8")) as { name?: string }).name
  } catch {
    return undefined
  }
}

/** Where `findSpellApp()` looks for a spell-app checkout. */
export type SpellAppPlaces = {
  /** the `spell.parserRoot` setting, if set:  spell-app, the kit holding it, or a folder inside one */
  configured?: string
  /** the window's folders, in the window's order */
  workspaceFolders: string[]
  /** the spell-app checkout the extension was built in -- set by `build.mjs` */
  builtIn: string
}

/** The spell-app checkout `findSpellApp()` picked. */
export type SpellAppChoice = {
  /** spell-app's folder:  holds `src/lsp/` and `app/` */
  root: string
  /** how it was found, for the extension's output */
  reason: string
}
