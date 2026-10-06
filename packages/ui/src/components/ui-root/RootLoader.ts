import { ROOT_CATALOG } from "./ui-root.catalog"

/**
 * Every family's barrel, loaded on demand (`import.meta.glob`, lazy):  `../ui-card/index.ts` => `import()` of it.
 * - A LITERAL glob, so each becomes a literal `import()`:  the lib build reuses each family's own entry chunk
 *   (`ui-card.js`), and the docs' single-file bundle (`packages/docs/tools/bundle-spell-ui.js`) inlines them.
 * - Relative on purpose, the one `../` in `ui`'s components:  Vite resolves a glob's literal pattern, not an alias,
 *   and its keys (`../ui-card/index.ts`) are what `load()` looks up.
 * - The root's own folder is left out:  it is loaded already.
 * - ONLY the library's families.  The doc-only `<ui-docs-*>` ones (`src/docs-components/`) are added by the docs
 *   site's bundle (`add()`, `DocsFamilies`).  Why:  a glob of them HERE made each a dynamic entry of the lib build
 *   that imports the core and other families, and Rolldown then moved core's modules out of `core.js` into shared
 *   chunks every page loads (epic `wwod-spell-ui`, I12;  `yarn measure`'s `coreOutsideCore`).
 * - Above the class:  a module-level call, made once as the module loads.
 */
const FAMILIES = import.meta.glob(["../*/index.ts", "!../ui-root/index.ts"])

/****************
 * ### `RootLoader`
 * Tag => family => `import()`, once per family for the whole page (every root shares the loads).
 * - Which family defines a tag comes from `ROOT_CATALOG` (generated from the vocabularies, `yarn gen:root`), never
 *   from guessing at the tag's name.
 * - The catalog knows the `<ui-docs-*>` tags too;  they load only on a page whose bundle `add()`ed their families
 *   (the docs site's), and fail like any unknown family elsewhere.
 * - Static:  the loads are page-wide, shared by every root (and the docs site's router).
 ****************/
export class RootLoader {
  /** Folder => its import, started once.  Page-wide, never reset:  a family defines its tags once per page. */
  private static readonly loads = new Map<string, Promise<void>>()

  /** Folder => importer of its barrel, for the families a bundle added (`add()`).  Page-wide. */
  private static readonly added = new Map<string, () => Promise<unknown>>()

  /** The folder (family) that defines `tag`;  `undefined` for a tag no family defines. */
  static folderFor(tag: string): string | undefined {
    return Object.hasOwn(ROOT_CATALOG, tag) ? ROOT_CATALOG[tag].folder : undefined
  }

  /**
   * Import `folder`'s family (which defines its tags), once.
   * - Rejects if it can't be imported, or no glob or `add()` knows the folder.
   */
  static load(folder: string): Promise<void> {
    let load = RootLoader.loads.get(folder)
    if (!load) {
      const importer = FAMILIES[`../${folder}/index.ts`] ?? RootLoader.added.get(folder)
      load = importer
        ? importer().then(() => undefined)
        : Promise.reject(
            new Error(`RootLoader.load():  no family "${folder}";  add() its barrel before a root needs its tags`)
          )
      RootLoader.loads.set(folder, load)
    }
    return load
  }

  /**
   * Let roots load more families:  `barrels`, a literal `import.meta.glob()` of family barrels
   * (`".../ui-docs-example/index.ts" => import()`), each keyed by its folder.
   * - Call it BEFORE a root needs one:  a tag whose family failed to load stays failed.
   */
  static add(barrels: Record<string, () => Promise<unknown>>): void {
    for (const [path, importer] of Object.entries(barrels)) {
      const folder = BARREL.exec(path)?.[1]
      if (folder) RootLoader.added.set(folder, importer)
    }
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

/** A family barrel's path:  its folder. */
const BARREL = /([\w-]+)\/index\.ts$/

/** Prefix of the tags a root loads:  anything else undefined (an app's own element) is not ours. */
const TAG_PREFIX = "ui-"
