import { Converters } from "$/ui/vocabulary"
import { BuiltInPacks, DEFAULT_ICON_PACK, ICON_SET_ATTRIBUTES, ICON_SET_TAG, IconName } from "$/ui/icons"

import type { IconPackOptions, ResolvedIcon } from "./runtime.types"
import { IconPack } from "./IconPack"

/**
 * Icon packs and the SVG cache, as `UI.icons` (`docs/icons.md`).
 * - A pack is a folder of SVGs plus its index, `pack.js`.  Packs are added in order and the LAST one added wins a
 *   name;  `prefix:name` asks one pack.
 * - Starts on first use (any lookup or `use()`), not on construction, so a page that never draws an icon loads no
 *   index.  Then, in order:
 *   - the default pack (`fa7-free`), unless an `only` replaces it
 *   - every `<ui-icon-set>` in the document, in document order
 *   - `use()` calls, in call order
 * - Watches the document for `<ui-icon-set>`s added, removed or changed later.
 * - NOTE:  a pack added or removed later affects later lookups only:  icons already drawn keep their SVG.
 * - One cache per PAGE (the runtime is page-wide), so two bundles fetch an SVG once.
 * - No sanitizing:  a pack's SVGs are verified when it's built (`IconPackBuilder`), and adding a pack runs its
 *   `pack.js`, so the page trusts it like any script it adds.
 */
export class IconPacks {
  /** every pack source in order, loaded or not */
  private sources: IconPackSource[] = []
  /** `start()` has run */
  private started = false
  /** SVG templates by URL;  an entry with no `svg` once settled is a known miss */
  private readonly templates = new Map<string, IconTemplate>()
  /** `register()`ed icons, by normalized name;  consulted before any pack */
  private readonly registered = new Map<string, SVGSVGElement>()

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
   * Drop every pack -- the default, the document's `<ui-icon-set>`s, `use()`d ones -- including any still loading;
   * returns `this`, so `UI.icons.reset().use("/icons/lucide/pack.js")`.
   * - Before first use, the default and the document's sets are never loaded at all.
   * - A pack still loading is forgotten:  its index may still arrive, but is never used.
   * - `<ui-icon-set>`s added AFTER a reset still count.
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

  /** Loaded packs, in order (last wins). */
  get packs(): IconPack[] {
    this.start()
    return this.sources.flatMap((entry) => (entry.pack ? [entry.pack] : []))
  }

  /** Resolves once every pack added so far has loaded (or failed). */
  get ready(): Promise<void> {
    this.start()
    return Promise.all(this.sources.map((entry) => entry.promise)).then(() => undefined)
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
    if (!template) throw new Error(`UI.icons.register("${name}"):  not an <svg>`)
    this.registered.set(IconName.normalize(name), template)
  }

  ////////////////
  // ## Sources
  ////////////////

  /**
   * First use:  the default pack, the document's `<ui-icon-set>`s, and a watch for later ones.
   * - Sets before the last `only` one are skipped (never loaded), and so is the default.
   * - `empty` (a `reset()` before first use):  only the watch.
   */
  private start({ empty = false } = {}) {
    if (this.started) return
    this.started = true
    if (typeof document === "undefined") return
    const elements = empty ? [] : [...document.getElementsByTagName(ICON_SET_TAG)]
    const lastOnly = elements.findLastIndex((element) => IconPacks.only(element))
    if (!empty && lastOnly < 0) this.add({ source: DEFAULT_ICON_PACK, options: {} })
    for (const element of elements.slice(Math.max(lastOnly, 0))) this.add(IconPacks.fromElement(element))
    new MutationObserver((records) => this.onMutations(records)).observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: Object.values(ICON_SET_ATTRIBUTES)
    })
  }

  /** Append `source` (dropping everything before it for `only`) and start loading its index. */
  private add(source: Omit<IconPackSource, "promise" | "pack">): IconPackSource {
    const entry = source as IconPackSource
    const url = BuiltInPacks.has(entry.source)
      ? BuiltInPacks.url(entry.source)
      : new URL(entry.source, typeof document === "undefined" ? undefined : document.baseURI).href
    entry.promise = IconPack.load(url, entry.options).then(
      (pack) => (entry.pack = pack),
      (error: unknown) => {
        console.warn(`UI.icons:  icon pack ${url} didn't load`, error)
        return undefined
      }
    )
    if (entry.options.only) this.sources = []
    this.sources.push(entry)
    return entry
  }

  /**
   * `<ui-icon-set>`s added, removed or re-pointed after start.
   * - Added:  appended (last wins).  Removed:  its pack goes.  Attribute change:  re-added, as if new.
   */
  private onMutations(records: MutationRecord[]) {
    for (const record of records) {
      if (record.type === "attributes") {
        if ((record.target as Element).localName !== ICON_SET_TAG) continue
        this.drop(record.target as Element)
        if (record.target.isConnected) this.add(IconPacks.fromElement(record.target as Element))
        continue
      }
      for (const node of record.removedNodes) for (const element of IconPacks.sets(node)) this.drop(element)
      for (const node of record.addedNodes) {
        for (const element of IconPacks.sets(node)) if (element.isConnected) this.add(IconPacks.fromElement(element))
      }
    }
  }

  /** Remove the source `element` added. */
  private drop(element: Element) {
    this.sources = this.sources.filter((entry) => entry.element !== element)
  }

  /** A source from a `<ui-icon-set>`'s attributes. */
  private static fromElement(element: Element): Omit<IconPackSource, "promise" | "pack"> {
    return {
      element,
      source: element.getAttribute(ICON_SET_ATTRIBUTES.src) ?? "",
      options: {
        prefix: element.getAttribute(ICON_SET_ATTRIBUTES.prefix) ?? undefined,
        base: element.getAttribute(ICON_SET_ATTRIBUTES.base) ?? undefined,
        only: IconPacks.only(element)
      }
    }
  }

  /** A `<ui-icon-set>`'s `only`, as any boolean attribute reads (`only="false"` ~== absent). */
  private static only(element: Element): boolean {
    return Converters.boolean(element.getAttribute(ICON_SET_ATTRIBUTES.only), ICON_SET_ATTRIBUTES.only)
  }

  /** `<ui-icon-set>`s in or under an added / removed `node`. */
  private static sets(node: Node): Element[] {
    if (!(node instanceof Element)) return []
    const inside = [...node.getElementsByTagName(ICON_SET_TAG)]
    return node.localName === ICON_SET_TAG ? [node, ...inside] : inside
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

  /** SVG text -> a template owned by the page's document, or `undefined` if it isn't an `<svg>`. */
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
   */
  private static adopt(svg: SVGSVGElement): SVGSVGElement {
    const copy = document.importNode(svg, true)
    const fill = copy.getAttribute(FILL)
    if (fill === null) copy.setAttribute(FILL, CURRENT_COLOR)
    else copy.style.setProperty(FILL, fill)
    return copy
  }
}

/** One added pack:  where from, how, and its load. */
type IconPackSource = {
  /** URL or built-in id */
  source: string
  options: IconPackOptions
  /** the `<ui-icon-set>` that added it, if any */
  element?: Element
  /** settles with the pack, or `undefined` if it failed */
  promise: Promise<IconPack | undefined>
  /** once loaded */
  pack?: IconPack
}

/** One cached SVG. */
type IconTemplate = {
  promise: Promise<SVGSVGElement | undefined>
  /** once loaded;  `undefined` after settling ~== miss */
  svg?: SVGSVGElement
}

/** MIME type `DOMParser` needs for SVG. */
const SVG_TYPE = "image/svg+xml"

/** Presentation attribute set on a root with none. */
const FILL = "fill"

/** Its value:  the icon takes the text colour. */
const CURRENT_COLOR = "currentColor"
