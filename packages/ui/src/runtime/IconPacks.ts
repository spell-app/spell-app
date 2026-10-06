import { Warnings } from "$/ui/util"
import { BuiltInPacks, DEFAULT_ICON_PACK, IconName } from "$/ui/icons"

import type { IconPackOptions, ResolvedIcon } from "./runtime.types"
import { IconPack } from "./IconPack"

/****************
 * ### `IconPacks`
 * Icon packs and the SVG cache, as `UI.icons` (`docs/icons.md`).
 * - In the runtime's lazy chunk;  imports the icon PACK format (`$/ui/icons`) and `IconPack`, never a pack itself.
 * - A pack is a folder of SVGs plus its index, `pack.js`.  Packs are added in order and the LAST one added wins a
 *   name;  `prefix:name` asks one pack.
 * - Starts on first use (any lookup or `use()`), not on construction, so a page that never draws an icon loads no
 *   index.  Then, in order:  the default pack (`fa7-free`), unless an `only` replaces it;  `use()` calls, in call order.
 * - Per `<ui-root>`:  a root's `icons="..."` makes a CHILD set (`scope()`) over its parent's -- the outer root's, else
 *   the page's.  Its packs win, the parent's answer what they don't;  `IconGlyph.packsFor(element)` is the set an
 *   element draws from (`RootSettings`).
 * - NOTE:  a pack added or removed later affects later lookups only:  icons already drawn keep their SVG (a root's
 *   change redraws its icons, through `RootSettings.generation`).
 * - One SVG cache per PAGE, shared by every child set (the runtime is page-wide), so two roots, or two bundles,
 *   fetch an SVG once.
 * - No sanitizing:  a pack's SVGs are verified when it's built (`IconPackBuilder`), and adding a pack runs its
 *   `pack.js`, so the page trusts it like any script it adds.
 ****************/
export class IconPacks {
  /** every pack source in order, loaded or not */
  private sources: IconPackSource[] = []
  /** `start()` has run */
  private started = false
  /** SVG templates by URL;  an entry with no `svg` once settled is a known miss.  Shared with child sets. */
  private readonly templates: Map<string, IconTemplate>
  /** `register()`ed icons, by normalized name;  consulted before any pack.  Shared with child sets. */
  private readonly registered: Map<string, SVGSVGElement>
  /** a child set's parent set, asked at each lookup (see `IconPacksProps.parent`);  none for the page's */
  private readonly parent?: () => IconPacks

  /** The page's set (`UI.icons`), or a child set (`scope()`) over `parent`. */
  constructor({ parent }: IconPacksProps = {}) {
    this.parent = parent
    const top = parent?.()
    this.templates = top?.templates ?? new Map()
    this.registered = top?.registered ?? new Map()
    // a child has no default pack:  its parent's answer what its own don't
    this.started = !!parent
  }

  /**
   * A child set:  `sources` (built-in ids or `pack.js` URLs) over `parent`'s packs -- what a `<ui-root icons="...">`
   * draws from.
   * - `assets`:  the folder built-in packs load from (`<assets>icon-packs/<id>/pack.js`), relative to the page.
   */
  scope(sources: readonly string[], { assets, parent }: { assets?: string; parent?: () => IconPacks } = {}): IconPacks {
    const child = new IconPacks({ parent: parent ?? (() => this) })
    for (const source of sources) child.add({ source, options: {} }, assets)
    return child
  }

  /**
   * Add a pack:  a URL of its `pack.js`, or a built-in id (`"fa7-brands"`, `"fomantic"`).
   * - Resolves with the pack, or `undefined` if its index failed to load (warned once).
   * - `only` ~== `reset().use(...)`:  drops every pack before it, including the default.
   */
  use(source: string, options: IconPackOptions = {}): Promise<IconPack | undefined> {
    if (options.only) this.reset()
    this.start()
    return this.add({ source, options }).promise
  }

  /**
   * Drop every pack -- the default and `use()`d ones -- including any still loading;  returns `this`, so
   * `UI.icons.reset().use("/icons/lucide/pack.js")`.
   * - Before first use, the default is never loaded at all.
   * - A pack still loading is forgotten:  its index may still arrive, but is never used.
   * - Keeps `register()`ed icons and the SVG cache (a URL still means the same file).
   */
  reset(): this {
    this.start({ empty: true })
    this.sources = []
    return this
  }

  /** Drop pack `id` (the first one loaded under it), e.g. `remove("fa7-free")`. */
  remove(id: string) {
    const at = this.sources.findIndex((entry) => entry.pack?.id === id)
    if (at >= 0) this.sources.splice(at, 1)
  }

  /** Loaded packs, in order (last wins):  a child set's parent's first, then its own. */
  get packs(): IconPack[] {
    this.start()
    const own = this.sources.flatMap((entry) => (entry.pack ? [entry.pack] : []))
    return this.parent ? [...this.parent().packs, ...own] : own
  }

  /** Resolves once every pack added so far has loaded (or failed), a child set's parent's too. */
  get ready(): Promise<void> {
    this.start()
    const own = Promise.all(this.sources.map((entry) => entry.promise))
    return Promise.all([own, this.parent?.().ready]).then(() => undefined)
  }

  /**
   * Where `name` leads, synchronously:  the last loaded pack that has it, or the pack its `prefix:` names.
   * - Packs still loading are skipped:  `await ready` first for a settled answer.
   * - `register()`ed icons have no URL, so they aren't answered here (`peek()` / `get()` find them).
   */
  resolve(name: string): ResolvedIcon | undefined {
    this.start()
    const { prefix, name: wanted } = IconName.split(name)
    for (const pack of this.packs.toReversed()) {
      if (prefix !== undefined && !pack.answers(prefix)) continue
      const found = pack.resolve(wanted)
      if (found) return found
    }
    return undefined
  }

  /**
   * The cached `<svg>` for `name`, synchronously, or `undefined` if it hasn't loaded.
   * - The shared TEMPLATE:  NEVER insert it;  clone it (`IconGlyph.draw()`).
   */
  peek(name: string): SVGSVGElement | undefined {
    const { prefix, name: wanted } = IconName.split(name)
    if (prefix === undefined && this.registered.has(wanted)) return this.registered.get(wanted)
    const url = this.resolve(name)?.url
    return url === undefined ? undefined : this.templates.get(url)?.svg
  }

  /**
   * The `<svg>` template for `name`, loading packs and the SVG as needed;  `undefined` for an unknown name or a
   * file that won't load.
   * - Never rejects.  Clone the result before inserting it (`IconGlyph.draw()`).
   */
  async get(name: string): Promise<SVGSVGElement | undefined> {
    const { prefix, name: wanted } = IconName.split(name)
    if (prefix === undefined && this.registered.has(wanted)) return this.registered.get(wanted)
    await this.ready
    const url = this.resolve(name)?.url
    return url === undefined ? undefined : this.load(url)
  }

  /**
   * Add one icon under `name`, from SVG text or an `<svg>` element, ahead of every pack.
   * - How an app bundles a few known icons instead of deploying a pack.
   * - Replaces an earlier registration under the same name.
   */
  register(name: string, svg: string | SVGSVGElement) {
    const template = typeof svg === "string" ? IconPacks.parse(svg) : IconPacks.adopt(svg)
    if (!template) {
      throw new TypeError(`UI.icons.register():  "${name}" is not an <svg>;  pass SVG text or an <svg> element`)
    }
    this.registered.set(IconName.normalize(name), template)
  }

  ////////////////
  // ## Sources
  ////////////////

  /**
   * First use of the page's set:  the default pack.
   * - `empty` (a `reset()` before first use):  nothing.
   */
  private start({ empty = false } = {}) {
    if (this.started) return
    this.started = true
    if (typeof document === "undefined" || empty) return
    this.add({ source: DEFAULT_ICON_PACK, options: {} })
  }

  /**
   * Append `source` (dropping everything before it for `only`) and start loading its index.
   * - A source with no usable URL settles as a failed pack (warned), never a throw:  `ready` / `get()` never reject.
   */
  private add(source: Omit<IconPackSource, "promise" | "pack">, assets?: string): IconPackSource {
    const entry = source as IconPackSource
    const url = IconPacks.urlFor(entry.source, assets)
    entry.promise =
      url === undefined
        ? Promise.resolve(undefined)
        : IconPack.load(url, entry.options).then(
            (pack) => (entry.pack = pack),
            (error: unknown) => {
              Warnings.warn(WARNING_SOURCE, `icon pack ${url} didn't load:`, error)
              return undefined
            }
          )
    if (entry.options.only) this.sources = []
    this.sources.push(entry)
    return entry
  }

  /**
   * Where `source` (a built-in id or a URL) loads from, or `undefined` (warned) when that can't be worked out:  a
   * malformed URL, or a built-in pack with no `BuiltInPacks.base` (an IIFE bundle has no `import.meta.url`).
   * - STATIC:  a pure lookup, the same for every set.
   */
  private static urlFor(source: string, assets?: string): string | undefined {
    try {
      const page = IconPack.pageUrl()
      return BuiltInPacks.has(source)
        ? BuiltInPacks.url(source, assets === undefined ? undefined : new URL(assets, page).href)
        : new URL(source, page).href
    } catch (error) {
      Warnings.warn(WARNING_SOURCE, `icon pack ${source} has no usable URL:`, error)
      return undefined
    }
  }

  ////////////////
  // ## SVGs
  ////////////////

  /**
   * The template at `url`:  fetched and parsed once per page;  a failed load is remembered as a miss.
   * - Offline (`navigator.onLine === false`) a failure is forgotten instead, so a later `get()` retries:  `fetch`
   *   can't tell a 404 from a dropped connection any other way.
   */
  private load(url: string): Promise<SVGSVGElement | undefined> {
    const cached = this.templates.get(url)
    if (cached) return cached.promise
    const entry: IconTemplate = {
      promise: fetch(url)
        .then((response) => (response.ok ? response.text() : undefined))
        .then((text) => (entry.svg = text === undefined ? undefined : IconPacks.parse(text)))
        .catch(() => {
          if (typeof navigator !== "undefined" && navigator.onLine === false) this.templates.delete(url)
          return undefined
        })
    }
    this.templates.set(url, entry)
    return entry.promise
  }

  /**
   * SVG text -> a template owned by the page's document, or `undefined` if it isn't an `<svg>`.
   * - STATIC:  pure, the same for every set.
   */
  private static parse(text: string): SVGSVGElement | undefined {
    const root = new DOMParser().parseFromString(text, SVG_TYPE).documentElement
    return root instanceof SVGSVGElement ? IconPacks.adopt(root) : undefined
  }

  /**
   * A page-owned copy of `svg`, whose root keeps the fill its file chose.
   * - No root `fill` (Font Awesome):  `fill="currentColor"`, so the icon takes the text colour anywhere.
   * - A root `fill` (Lucide's `fill="none"`, a stroke set):  copied into the inline style too.  Why:  component
   *   sheets set `fill: currentColor` on icon `<svg>`s (for slotted SVGs without one), and CSS beats a
   *   presentation attribute, but not an inline style.
   * - The file itself is untouched;  its licence comment stays in the copy.
   * - STATIC:  pure, the same for every set.
   */
  private static adopt(svg: SVGSVGElement): SVGSVGElement {
    const copy = document.importNode(svg, true)
    const fill = copy.getAttribute(FILL)
    if (fill === null) copy.setAttribute(FILL, CURRENT_COLOR)
    else copy.style.setProperty(FILL, fill)
    return copy
  }
}

/** Constructor props for `IconPacks`. */
export type IconPacksProps = {
  /**
   * A child set's parent:  a FUNCTION, asked at each lookup, so a root nested in another always sits over the outer
   * root's CURRENT set, even after the outer one changes its packs.
   */
  parent?: () => IconPacks
}

/** One added pack:  where from, how, and its load. */
type IconPackSource = {
  /** URL or built-in id */
  source: string
  /** how `use()` added it */
  options: IconPackOptions
  /** settles with the pack, or `undefined` if it failed */
  promise: Promise<IconPack | undefined>
  /** once loaded */
  pack?: IconPack
}

/** One cached SVG. */
type IconTemplate = {
  /** its load, shared by every caller;  never rejects */
  promise: Promise<SVGSVGElement | undefined>
  /** once loaded;  `undefined` after settling ~== miss */
  svg?: SVGSVGElement
}

/** `Warnings` source of this class's warnings. */
const WARNING_SOURCE = "UI.icons"

/** MIME type `DOMParser` needs for SVG. */
const SVG_TYPE = "image/svg+xml"

/** Presentation attribute set on a root with none. */
const FILL = "fill"

/** Its value:  the icon takes the text colour. */
const CURRENT_COLOR = "currentColor"
