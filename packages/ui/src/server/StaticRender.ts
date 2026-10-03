import { createComponent, createRoot } from "solid-js"
import { NoHydration, renderToString } from "@solidjs/web"
import { createProps, type SolidElement } from "@spell-app/solid-element"
import { ServerElement } from "@spell-app/solid-element/server"
import { parseHTML } from "linkedom"

import { ElementDefinition, UIElement, type UIElementClass, type UIHost } from "$/ui/elements"

import type { StaticFamily, StaticPreload, StaticSheetUsage, StaticView } from "./server.types"
import { ServerHost } from "./ServerHost"
import { ServerRuntime } from "./ServerRuntime"
import type { ServerIds } from "./ServerIds"
import { StaticFlattener } from "./StaticFlattener"
import { StaticInteractions } from "./StaticInteractions"
import { StaticPageStyles } from "./StaticPageStyles"

/****************
 * ### `StaticRender`
 * A page of `ui-*` elements => plain light-DOM HTML:  no shadow DOM, no scripts, for crawlers and no-JS readers.
 * - Server-side (node, `@solidjs/web`'s server build):  the controllers render with `renderToString`.
 * - Steps:
 *   1. parse the page (linkedom);  every element of a `define()`d family becomes a stand-in host (`ServerHost`)
 *   2. build EVERY controller, in document order (owners first), before any renders:  items need their list, tab
 *      buttons their panes, a section's heading level its parent
 *   3. render each controller's view to HTML
 *   4. flatten (`StaticFlattener`):  hosts replaced by their roots, slots by their children
 *   5. wire what works without scripts (`StaticInteractions`:  dialogs, popovers, unique ids);  then the page's own
 *      `<style>`s are rewritten for that (`StaticPageStyles`:  `::part()`, `:state()`, `ui-*` tags)
 * - Families are opt-in (`define()`):  a `ui-*` tag without one stays as it is.
 * - NOTE: the page MUST NOT load the elements too:  an upgrade would take the flattened markup for slotted content.
 ****************/
export class StaticRender {
  /** Families this render knows, by tag. */
  static readonly families = new Map<string, StaticFamily>()

  /**
   * Tags the LAST `page()` / `fragment()` rendered:  a page's stylesheet needs only their families
   * (`StaticStylesheet.build([...lastTags].map((tag) => families.get(tag)!), sheetUsage)`).
   */
  static lastTags: ReadonlySet<string> = new Set()

  /** Which sheets rendered elements adopted, and in what order, over every render so far. */
  static readonly sheetUsage: StaticSheetUsage = { users: new Map(), orders: new Map() }

  /**
   * Make `classes` renderable, under their vocabularies' tags.
   * - SIDE EFFECT:  installs the server runtime first (`ServerRuntime`), then records each definition page-wide
   *   (`UIElement.register()`) as `define()` would in a browser.  Idempotent per tag.
   */
  static define(...classes: UIElementClass[]) {
    ServerRuntime.install()
    for (const Class of classes) {
      const definition = new ElementDefinition(Class.prototype.vocabulary)
      if (StaticRender.families.has(definition.tag)) continue
      UIElement.register.call(Class, definition)
      StaticRender.families.set(definition.tag, { Class, definition, kind: StaticRender.kind(definition.tag) })
    }
  }

  /** The `data-ui` mark of `tag`'s roots:  the tag without its `ui-` prefix. */
  static kind(tag: string): string {
    return tag.replace(/^ui-/, "")
  }

  /**
   * Load what `html`'s render will read synchronously, before `page()` / `fragment()`:  the icon packs
   * (`ServerRuntime.icons()`), and each defined family's own data through its optional `static preload(html, tag)`
   * (`UIEmoji`:  the emoji names the page uses).
   * - MUST be awaited:  data loads asynchronously, the render is synchronous.
   */
  static async prepare(html: string, icons?: readonly string[]): Promise<void> {
    await ServerRuntime.icons(icons)
    const loads: Promise<unknown>[] = []
    for (const [tag, { Class }] of StaticRender.families) {
      const preload = (Class as Partial<StaticPreload>).preload
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

  /** Steps 2-5 on a parsed `document`. */
  private static render(document: Document) {
    const ids = ServerRuntime.install().ids as unknown as ServerIds
    // generated ids skip the page's own, numbered from 1 per page
    ids.reset(document)
    const elements = [...document.querySelectorAll("*")].filter((element) =>
      StaticRender.families.has(element.localName)
    )
    StaticRender.lastTags = new Set(elements.map((element) => element.localName))
    const { hosts, dispose } = createRoot((dispose) => ({
      hosts: elements.map((element) => StaticRender.build(element)),
      dispose
    }))
    try {
      for (const { host, family } of hosts) StaticRender.recordSheets(host, family)
      const views: StaticView[] = hosts.map(({ host, family }) => ({
        element: host as unknown as Element,
        family,
        // `NoHydration`:  nothing hydrates a static page, so no `_hk` keys
        html: renderToString(() =>
          createComponent(NoHydration, {
            get children() {
              return ServerElement.run(host, () => host.controller!.mount())
            }
          })
        )
      }))
      StaticFlattener.flatten(document, views)
      StaticInteractions.wire(document, ids)
      StaticRender.rewriteStyles(document)
    } finally {
      dispose()
    }
  }

  /**
   * The page's own `<style>`s, rewritten for the flattened output (`StaticPageStyles`).
   * - A sheet that doesn't parse is left as written:  a page's broken CSS must not fail its render.
   */
  private static rewriteStyles(document: Document) {
    const tags = StaticRender.tags()
    for (const style of document.querySelectorAll("style")) {
      try {
        style.textContent = StaticPageStyles.rewrite(style.textContent ?? "", tags)
      } catch {
        // left as written
      }
    }
  }

  /** Every defined tag => the `data-ui` kind of its roots, for `StaticPageStyles.rewrite()`. */
  static tags(): Map<string, string> {
    return new Map([...StaticRender.families].map(([tag, { kind }]) => [tag, kind]))
  }

  /** Forget which sheets elements adopted (`sheetUsage`), so the next stylesheet covers only what renders next. */
  static resetUsage() {
    StaticRender.sheetUsage.users.clear()
    StaticRender.sheetUsage.orders.clear()
  }

  /** Add `host`'s adopted sheets to `sheetUsage`:  under its family's noun, and their order. */
  private static recordSheets(host: UIHost, family: StaticFamily) {
    const { users, orders } = StaticRender.sheetUsage
    const noun = family.kind
    const names = host.controller?.sheets() ?? []
    for (const name of names) {
      let nouns = users.get(name)
      if (!nouns) users.set(name, (nouns = new Set()))
      nouns.add(noun)
    }
    if (names.length > 1) orders.set(names.join(" "), names)
  }

  /** Stand-in host + controller for one element;  MUST run under the render's root. */
  private static build(element: Element): { host: UIHost & SolidElement; family: StaticFamily } {
    const family = StaticRender.families.get(element.localName)!
    const { Class, definition } = family
    const host = ServerHost.attach(element, definition)
    const attrs = createProps(ServerElement.props(element, definition.props))
    ServerElement.run(host, () => new Class(host, definition, attrs))
    return { host, family }
  }
}
