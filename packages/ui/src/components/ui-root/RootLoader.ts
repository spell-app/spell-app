import { ROOT_CATALOG } from "./ui-root.catalog"
import { TAG_PREFIX } from "./ui-root.types"

/**
 * Every family's barrel, loaded on demand (`import.meta.glob`, lazy):  `../ui-card/index.ts` => `import()` of it.
 * - A LITERAL glob, so each becomes a literal `import()`:  the lib build reuses each family's own entry chunk
 *   (`ui-card.js`), and the docs' single-file bundle (`packages/docs/scripts/bundle-spell-ui.js`) inlines them.
 * - The root's own folder is left out:  it is loaded already.
 */
const FAMILIES = import.meta.glob(["../*/index.ts", "!../ui-root/index.ts"])

/****************
 * ### `RootLoader`
 * Tag => family => `import()`, once per family for the whole page (every root shares the loads).
 * - Which family defines a tag comes from `ROOT_CATALOG` (generated from the vocabularies, `yarn gen:root`), never
 *   from guessing at the tag's name.
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
      const importer = FAMILIES[`../${folder}/index.ts`]
      load = importer ? importer().then(() => undefined) : Promise.reject(new Error(`no family "${folder}"`))
      RootLoader.loads.set(folder, load)
    }
    return load
  }

  /** The distinct `ui-*` tags under `root` that aren't defined yet. */
  static undefinedTags(root: ParentNode): Set<string> {
    const tags = new Set<string>()
    for (const element of root.querySelectorAll(":not(:defined)")) {
      if (element.localName.startsWith(TAG_PREFIX)) tags.add(element.localName)
    }
    return tags
  }
}
