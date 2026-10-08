import { E } from "$/ui/core"
import { ROOT_CATALOG } from "./UIRoot.catalog"
import type { RootPackTag } from "./UIRoot.types"

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
 * - Which family defines a tag comes from `ROOT_CATALOG` (generated from the vocabularies, `yarn gen:root`),
 *   never from guessing at the tag's name.
 * - The catalog knows the `<ui-docs-*>` tags too;  they load only on a page whose bundle `add()`ed their families
 *   (the docs site's), and fail like any unknown family elsewhere.
 * - Component packs (`<ui-components>`, `ComponentPack`) add tags of their own (`addTags()`):
 *   any custom-element name, each with its own module and skeleton.  A pack's word on a tag wins over the catalog's.
 *   While a pack is on its way (`adding()`), roots wait for it before calling a tag unknown (`whenAdded()`).
 * - Static:  the loads are page-wide, shared by every root (and the docs site's router).
 ****************/
export class RootLoader {
  /**
   * Folder (or a pack tag's module URL) => its import, started once.  Page-wide, never reset:  a family defines its
   * tags once per page.  A folder name has no `:`, so it never meets a URL.
   */
  private static readonly loads = new Map<string, Promise<void>>()

  /** Folder => importer of its barrel, for the families a bundle added (`add()`).  Page-wide. */
  private static readonly added = new Map<string, () => Promise<unknown>>()

  /** Tag => what a component pack said about it (`addTags()`).  Page-wide;  wins over the catalog. */
  private static readonly packTags = new Map<string, RootPackTag>()

  /** Packs on their way (`adding()`), each settling once its tags are added (or it failed).  Page-wide. */
  private static readonly pending = new Set<Promise<void>>()

  ////////////////
  // ## Tags
  ////////////////

  /** The folder (family) that defines `tag`;  `undefined` for a tag no family defines. */
  static folderFor(tag: string): string | undefined {
    return Object.hasOwn(ROOT_CATALOG, tag) ? ROOT_CATALOG[tag].folder : undefined
  }

  /** Does a pack or the catalog know `tag`? */
  static knows(tag: string): boolean {
    return RootLoader.packTags.has(tag) || RootLoader.folderFor(tag) !== undefined
  }

  /** What a root draws for `tag` while it loads:  the pack's word, else the catalog's;  `undefined` for none. */
  static skeletonFor(tag: string): E.SkeletonSpec | undefined {
    const packTag = RootLoader.packTags.get(tag)
    if (packTag) return packTag.skeleton
    return Object.hasOwn(ROOT_CATALOG, tag) ? ROOT_CATALOG[tag].skeleton : undefined
  }

  /** The distinct undefined tags under `root` that a root loads:  every `ui-*` one, and every tag a pack added. */
  static undefinedTags(root: ParentNode): Set<string> {
    const tags = new Set<string>()
    for (const element of root.querySelectorAll(":not(:defined)")) {
      const tag = element.localName
      if (tag.startsWith(TAG_PREFIX) || RootLoader.packTags.has(tag)) tags.add(tag)
    }
    return tags
  }

  ////////////////
  // ## Loading
  ////////////////

  /**
   * Import what defines `tag`, once:  its pack's module, else its family;  `undefined` when nobody knows the tag.
   * - The promise rejects if the import fails, and stays rejected:  a failed tag stays failed.
   */
  static loadTag(tag: string): Promise<void> | undefined {
    const packTag = RootLoader.packTags.get(tag)
    if (packTag) return RootLoader.once(packTag.source, () => import(/* @vite-ignore */ packTag.source))
    const folder = RootLoader.folderFor(tag)
    return folder === undefined ? undefined : RootLoader.load(folder)
  }

  /**
   * Import `folder`'s family (which defines its tags), once.
   * - Rejects if it can't be imported, or no glob or `add()` knows the folder.
   */
  static load(folder: string): Promise<void> {
    const importer = FAMILIES[`../${folder}/index.ts`] ?? RootLoader.added.get(folder)
    return RootLoader.once(folder, importer ?? (() => Promise.reject(RootLoader.noFamily(folder))))
  }

  ////////////////
  // ## Adding
  ////////////////

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

  /**
   * Let roots load a component pack's tags (`ComponentPack`):  each from its own module, with its own skeleton.
   * - SIDE EFFECT:  `eager` tags are imported now;  one that fails is a warning, and fails again where it's used.
   * - Adds, never removes:  a tag added again takes the later entry, unless it's loaded already.
   */
  static addTags(tags: readonly RootPackTag[]): void {
    for (const packTag of tags) RootLoader.packTags.set(packTag.tag, packTag)
    for (const { tag, load } of tags) {
      if (load !== EAGER) continue
      RootLoader.loadTag(tag)?.catch((error: unknown) =>
        E.Warnings.warn("RootLoader", `<${tag}> didn't load (eager):`, error)
      )
    }
  }

  /**
   * Tags are on their way:  `adding` settles once a pack's tags are added, or it failed.
   * - Until every such promise settles, roots wait (`whenAdded()`) before calling a tag unknown.
   * - Call it SYNCHRONOUSLY, as the pack is asked for, so a root that looks next finds it.
   */
  static adding(adding: Promise<unknown>): void {
    const settled = adding.then(
      () => undefined,
      () => undefined
    )
    RootLoader.pending.add(settled)
    void settled.then(() => RootLoader.pending.delete(settled))
  }

  /**
   * Resolves once every pack on its way has settled (and any asked for meanwhile);  `undefined` when none is.
   * - NEVER rejects:  a pack that failed is its element's to report.
   */
  static whenAdded(): Promise<void> | undefined {
    if (!RootLoader.pending.size) return undefined
    return Promise.all(RootLoader.pending).then(() => RootLoader.whenAdded())
  }

  ////////////////
  // ## Internal
  ////////////////

  /** `importer()` under `key`, started once;  resolves with nothing. */
  private static once(key: string, importer: () => Promise<unknown>): Promise<void> {
    let load = RootLoader.loads.get(key)
    if (!load) {
      load = importer().then(() => undefined)
      RootLoader.loads.set(key, load)
    }
    return load
  }

  /** The error for a folder no glob or `add()` knows. */
  private static noFamily(folder: string): Error {
    return new Error(`RootLoader.load():  no family "${folder}";  add() its barrel before a root needs its tags`)
  }
}

/** A family barrel's path:  its folder. */
const BARREL = /([\w-]+)\/index\.ts$/

/**
 * Prefix of the catalog's tags:  any other undefined tag (an app's own element) is not ours, unless a pack added it.
 */
const TAG_PREFIX = "ui-"

/** The load policy that imports a pack's tag at once. */
const EAGER: RootPackTag["load"] = "eager"
