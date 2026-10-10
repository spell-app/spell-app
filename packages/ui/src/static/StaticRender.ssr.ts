import { createComponent, createRoot, untrack } from "solid-js"
import { NoHydration, renderToString } from "@solidjs/web"
import { parseHTML } from "linkedom"

import { E } from "$/ui/core"
import { SSR } from "$/ui/static"

/****************
 * ### `StaticRender`
 * A page of `ui-*` elements => plain light-DOM HTML:  no shadow DOM, no scripts, for crawlers and no-JS readers.
 * - Server-side (node, `@solidjs/web`'s server build):  the components render with `renderToString`.
 * - Steps:
 *   1. parse the page (linkedom);
 *      every element of a `define()`d family becomes a stand-in DOM element (`ServerDOMElement`)
 *   2. build EVERY component, in document order (owners first), before any renders:
 *      items need their list, tab buttons their panes, a section's heading level its parent
 *   3. render each component's view to HTML
 *   4. flatten (`StaticFlattener`):  DOM elements replaced by their roots, slots by their children
 *   5. wire what works without scripts (`StaticInteractions`:  dialogs, popovers, unique ids)
 *   6. rewrite the page's own `<style>`s for that (`StaticPageStyles`:  `::part()`, `:state()`, `ui-*` tags)
 * - Families are opt-in (`define()`):  a `ui-*` tag without one stays as it is.
 * - NOTE: the page MUST NOT load the elements too:  an upgrade would take the flattened markup for slotted content.
 * - The TOP of `$/ui/static`'s graph (with `StaticCatalog`):  uses `$/ui/core` and every peer, but no family.
 *   Node only, NEVER imported by a component or `$/ui`.
 * - STATIC:  one set of families per process, as `customElements` is one registry per page.
 ****************/
export class StaticRender {
  /** Families this render knows, by tag:  page-wide, as `define()` is. */
  static readonly families = new Map<string, SSR.StaticFamily>()

  /**
   * Tags the LAST `page()` / `fragment()` rendered:  a page's stylesheet needs only their families
   * (`StaticStylesheet.build([...lastTags].map((tag) => families.get(tag)!), sheetUsage)`).
   */
  static lastTags: ReadonlySet<string> = new Set()

  /**
   * Which sheets rendered elements adopted, and in what order, over every render so far.
   * - Static:  it accumulates across renders until `resetUsage()`, so one stylesheet can serve many pages.
   */
  static readonly sheetUsage: SSR.StaticSheetUsage = { users: new Map(), orders: new Map() }

  /**
   * Make `classes` renderable, under their vocabularies' tags.
   * - SIDE EFFECT:  installs the server runtime first (`ServerRuntime`),
   *   then records each definition page-wide (`UIComponent.register()`), as `define()` would in a browser.
   * - Idempotent per tag.
   */
  static define(...classes: E.UIComponentClass[]) {
    SSR.ServerRuntime.install()
    for (const Class of classes) {
      const definition = new E.ElementDefinition(Class.prototype.vocabulary)
      if (StaticRender.families.has(definition.tag)) continue
      E.UIComponent.register.call(Class, definition)
      StaticRender.families.set(definition.tag, { Class, definition, kind: StaticRender.kindFor(definition.tag) })
    }
  }

  /**
   * Load what `html`'s render will read synchronously, before `page()` / `fragment()`:
   * - the icon packs (`ServerRuntime.icons()`)
   * - each defined family's own data, through its optional `static preload(html, tag)`
   *   (`UIEmoji`:  the emoji names the page uses)
   * - MUST be awaited:  data loads asynchronously, the render is synchronous.
   */
  static async prepare(html: string, icons?: readonly string[]): Promise<void> {
    await SSR.ServerRuntime.icons(icons)
    const loads: Promise<unknown>[] = []
    for (const [tag, { Class }] of StaticRender.families) {
      const preload = (Class as Partial<SSR.StaticPreload>).preload
      if (typeof preload === "function" && html.includes(`<${tag}`)) loads.push(preload.call(Class, html, tag))
    }
    await Promise.all(loads)
  }

  /** Render a whole document;  returns its HTML. */
  static page(html: string): string {
    const { document } = parseHTML(html)
    StaticRender.render(document)
    return (document.doctype ? "<!doctype html>\n" : "") + document.documentElement.outerHTML
  }

  /** Render a fragment (body content);  returns its HTML. */
  static fragment(html: string): string {
    const { document } = parseHTML(`<!doctype html><html><head></head><body>${html}</body></html>`)
    StaticRender.render(document)
    return document.body.innerHTML
  }

  /** Every defined tag => the `data-ui` kind of its roots, for `StaticPageStyles.rewrite()`. */
  static tags(): Map<string, string> {
    return new Map([...StaticRender.families].map(([tag, { kind }]) => [tag, kind]))
  }

  /** The `data-ui` mark of `tag`'s roots:  the tag without its `ui-` prefix. */
  static kindFor(tag: string): string {
    return tag.replace(/^ui-/, "")
  }

  /** Forget which sheets elements adopted (`sheetUsage`), so the next stylesheet covers only what renders next. */
  static resetUsage() {
    StaticRender.sheetUsage.users.clear()
    StaticRender.sheetUsage.orders.clear()
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** Every step after parsing (the class docs' "Steps"), on a parsed `document`. */
  private static render(document: Document) {
    const ids = SSR.ServerRuntime.install().ids as unknown as SSR.ServerIds
    // generated ids skip the page's own, numbered from 1 per page
    ids.reset(document)
    const elements = [...document.querySelectorAll("*")].filter((element) =>
      StaticRender.families.has(element.localName)
    )
    StaticRender.lastTags = new Set(elements.map((element) => element.localName))
    const { built, dispose } = createRoot((dispose) => ({
      built: elements.map((element) => StaticRender.build(element)),
      dispose
    }))
    try {
      for (const { domElement, family } of built) StaticRender.recordSheets(domElement, family)
      const views: SSR.StaticView[] = built.map(({ domElement, family }) => ({
        element: domElement as unknown as Element,
        family,
        // `NoHydration`:  nothing hydrates a static page, so no `_hk` keys
        html: renderToString(() =>
          createComponent(NoHydration, {
            get children() {
              return untrack(() => domElement.component!.onMount())
            }
          })
        )
      }))
      SSR.StaticFlattener.flatten(document, views)
      SSR.StaticInteractions.wire(document, ids)
      StaticRender.rewriteStyles(document)
    } finally {
      dispose()
    }
  }

  /** Stand-in DOM element + component for one element;  MUST run under the render's root. */
  private static build(element: Element): { domElement: E.DOMElement; family: SSR.StaticFamily } {
    const family = StaticRender.families.get(element.localName)!
    const { Class, definition } = family
    const domElement = SSR.ServerDOMElement.attach(element, definition, Class.prototype.elementSetup.visible)

    untrack(() => new Class(domElement, definition))
    return { domElement, family }
  }

  /** Add `domElement`'s adopted sheets to `sheetUsage`:  under its family's kind, and their order. */
  private static recordSheets(domElement: E.DOMElement, family: SSR.StaticFamily) {
    const { users, orders } = StaticRender.sheetUsage
    const names = untrack(() => domElement.component?.styleSheetNames) ?? []
    for (const name of names) {
      let kinds = users.get(name)
      if (!kinds) users.set(name, (kinds = new Set()))
      kinds.add(family.kind)
    }
    if (names.length > 1) orders.set(names.join(" "), names)
  }

  /**
   * The page's own `<style>`s, rewritten for the flattened output (`StaticPageStyles`).
   * - A sheet that doesn't parse is left as written:  a page's broken CSS must not fail its render.
   */
  private static rewriteStyles(document: Document) {
    const tags = StaticRender.tags()
    for (const style of document.querySelectorAll("style")) {
      try {
        style.textContent = SSR.StaticPageStyles.rewrite(style.textContent ?? "", tags)
      } catch {
        // left as written
      }
    }
  }
}
