import { ComponentPacks } from "$/ui/components/ui-components/ComponentPacks"

import { ROOT_CATALOG } from "./ui-root.catalog"
import { TAG_PREFIX, type RootCatalogEntry } from "./ui-root.types"

/**
 * Every family's barrel, loaded on demand (`import.meta.glob`, lazy):  `../ui-card/index.ts` => `import()` of it.
 * - A LITERAL glob, so each becomes a literal `import()`:  the lib build reuses each family's own entry chunk
 *   (`ui-card.js`), and the docs' single-file bundle (`packages/docs/tools/bundle-spell-ui.js`) inlines them.
 * - The root's own folder is left out:  it is loaded already.
 * - The doc-only `<ui-docs-*>` families (`src/docs-components/`) are a second literal glob, `DOCS_FAMILIES`;  the
 *   catalog names a family by folder alone (`folder: "ui-docs-example"`), so `load()` tries both.
 */
const FAMILIES = import.meta.glob(["../*/index.ts", "!../ui-root/index.ts"])

/** The doc-only families' barrels, lazy like `FAMILIES`:  `../../docs-components/ui-docs-example/index.ts` => its `import()`. */
const DOCS_FAMILIES = import.meta.glob("../../docs-components/*/index.ts")

/****************
 * ### `RootLoader`
 * Tag => family => `import()`, once per family for the whole page (every root shares the loads).
 * - Which family defines a tag comes from `ROOT_CATALOG` (generated from the vocabularies, `yarn gen:root`), never
 *   from guessing at the tag's name.
 * - Component packs' tags (`<ui-components source>`) aren't imported here:  a pack defines them all as its script
 *   registers it (`ComponentPacks`);  this only answers for them (`entryOf()`, `undefinedTags()`).
 ****************/
export class RootLoader {
  /** Folder => its import, started once. */
  private static readonly loads = new Map<string, Promise<void>>()

  /** The folder (family) that defines `tag`;  `undefined` for a tag no family defines. */
  static folderOf(tag: string): string | undefined {
    return Object.hasOwn(ROOT_CATALOG, tag) ? ROOT_CATALOG[tag].folder : undefined
  }

  /** Import `folder`'s family (which defines its tags), once;  rejects if it can't be imported. */
  static load(folder: string): Promise<void> {
    let load = RootLoader.loads.get(folder)
    if (!load) {
      const importer = FAMILIES[`../${folder}/index.ts`] ?? DOCS_FAMILIES[`../../docs-components/${folder}/index.ts`]
      load = importer ? importer().then(() => undefined) : Promise.reject(new Error(`no family "${folder}"`))
      RootLoader.loads.set(folder, load)
    }
    return load
  }

  /** What `<ui-root>` knows about `tag` before it's defined:  Spell UI's catalog, else a registered pack's. */
  static entryOf(tag: string): RootCatalogEntry | undefined {
    return Object.hasOwn(ROOT_CATALOG, tag) ? ROOT_CATALOG[tag] : ComponentPacks.entryOf(tag)
  }

  /** The distinct tags under `root` that aren't defined yet, and are ours:  `ui-*`, or a registered pack's prefix. */
  static undefinedTags(root: ParentNode): Set<string> {
    const tags = new Set<string>()
    for (const { localName } of root.querySelectorAll(":not(:defined)")) {
      if (localName.startsWith(TAG_PREFIX) || ComponentPacks.owns(localName)) tags.add(localName)
    }
    return tags
  }
}
