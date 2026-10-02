import { createComponent, createRoot } from "solid-js"
import { NoHydration, renderToString } from "@solidjs/web"
import { createProps, type SolidElement } from "@spell-app/solid-element"
import { ServerElement } from "@spell-app/solid-element/server"
import { parseHTML } from "linkedom"

import { ElementDefinition, UIElement, type UIElementClass, type UIHost } from "$/ui/elements"

import type { StaticFamily, StaticView } from "./server.types"
import { ServerHost } from "./ServerHost"
import { ServerRuntime } from "./ServerRuntime"
import { StaticFlattener } from "./StaticFlattener"

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
 * - Families are opt-in (`define()`):  a `ui-*` tag without one stays as it is.
 * - NOTE: the page MUST NOT load the elements too:  an upgrade would take the flattened markup for slotted content.
 ****************/
export class StaticRender {
  /** Families this render knows, by tag. */
  static readonly families = new Map<string, StaticFamily>()

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
      StaticRender.families.set(definition.tag, { Class, definition })
    }
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

  /** Steps 2-4 on a parsed `document`. */
  private static render(document: Document) {
    ServerRuntime.install()
    const elements = [...document.querySelectorAll("*")].filter((element) =>
      StaticRender.families.has(element.localName)
    )
    const { hosts, dispose } = createRoot((dispose) => ({
      hosts: elements.map((element) => StaticRender.build(element)),
      dispose
    }))
    try {
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
    } finally {
      dispose()
    }
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
