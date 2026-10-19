import { spawnSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"

import JSON5 from "json5"

/**
 * The shared content folder of the checkout at `root`:  where its epics, guides, pages, sagas and brand pages are;
 * `undefined` when the repo names none.
 *
 * ```ts
 * contentFolderOf("/Users/owen/www/spell-app/spell-app.worktrees/seo")   // => "/Users/owen/www/spell-app/spell-app.epics"
 * ```
 *
 * - `contentFolder` in the MAIN checkout's `.epic/config.json5`, relative to the main checkout
 *   - every worktree reads the main checkout's copy, as spell-epic's `EpicConfig` does (its one reader in the engine)
 *   - the main checkout:  git's common folder's parent (`git rev-parse --git-common-dir`);  outside git, `root`
 * - `SPELL_SHARED_DIR` overrides it, as it does for `epic shared` (tests, a scratch repo)
 * - so spell-app's tools find the content with no link at the checkout's root (epic `epic-eject` P12):
 *   the commands page's data, the WWOD check's citers, the `Linker`'s pages
 * - `undefined`:  no config file, or no `contentFolder` in it;  callers then look in the checkout (an old link)
 * - NEVER throws:  a config file it can't read names none
 * - Its position:  imports only node's own modules and `json5`, so plain `node` loads it by path;
 *   NOT in the `$/assembler` barrel (`$/assembler/contentFolder`), so the CLI's lean `spell dev` loads no linkedom
 */
export function contentFolderOf(root: string): string | undefined {
  const given = process.env.SPELL_SHARED_DIR
  if (given) return resolve(given)
  const main = mainCheckoutOf(root)
  const file = join(main, EPIC_CONFIG)
  if (!existsSync(file)) return undefined
  try {
    const folder = (JSON5.parse(readFileSync(file, "utf8")) as { contentFolder?: unknown }).contentFolder
    return typeof folder === "string" && folder ? resolve(main, folder) : undefined
  } catch {
    return undefined
  }
}

/** The main checkout of the checkout at `root`:  git's common folder's parent;  `root` itself outside git. */
function mainCheckoutOf(root: string): string {
  const run = spawnSync("git", ["-C", root, "rev-parse", "--path-format=absolute", "--git-common-dir"], {
    encoding: "utf8"
  })
  return run.status === 0 && run.stdout.trim() ? dirname(run.stdout.trim()) : resolve(root)
}

/** The repo's epic settings, from a checkout's root:  spell-epic's `EpicConfig` reads them. */
const EPIC_CONFIG = ".epic/config.json5"
