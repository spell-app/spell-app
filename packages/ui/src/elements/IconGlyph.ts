import { createEffect, createMemo, untrack, type Accessor } from "solid-js"
import { isServer, ssr } from "@solidjs/web"

import { RUNTIME_KEY, UI, type IconPacks, type RuntimeGlobal } from "$/ui/runtime"

import { Cell } from "./Cell"
import { RootSettings } from "./RootSettings"

/** What an `IconGlyph` needs of the component drawing it:  its element, and whether it's in the document. */
export type IconGlyphOwner = {
  readonly host: Element
  readonly connected: Cell<boolean>
}

/**
 * An icon NAME (attribute, shorthand) turned into an `<svg>`, loaded through the icon packs the OWNER's element draws
 * from -- its nearest `<ui-root icons>`'s, else the page's (`UI.icons`) -- shared by `<ui-icon>` and every component's
 * `icon` shorthand, close / delete icons and the like.
 * - Starts from a cached template when the runtime is already loaded, so a cached icon draws in the first frame.
 * - Reloads when the name changes, when the element is (re)connected (it may have moved under another root), and
 *   when any root's settings change (`RootSettings.generation`).
 * - A later request wins over an earlier, slower load.
 * - `svg()` is a fresh `aria-hidden` clone per change;  the box around it is the caller's.
 * - MUST be created under the element's owner:  it creates a signal, a memo and an effect.
 * - Server render (`$/ui/server`):  `svg()` is the SVG as markup, read synchronously through `serverMarkup`;
 *   `data` stays empty.
 */
export class IconGlyph {
  /**
   * The cached `<svg>` for the name, `undefined` until loaded (or for an unknown name);  tracked.
   * - A shared TEMPLATE:  NEVER insert it -- `svg()` / `IconGlyph.draw()` clone it.
   */
  readonly data: Cell<SVGSVGElement | undefined>

  /** A fresh `<svg>` to insert, or `undefined`;  tracked. */
  readonly svg: Accessor<SVGSVGElement | undefined>

  /** Request counter, so a slower earlier load can't win. */
  private request = 0

  /**
   * Server hook, set by `$/ui/server` (`ServerRuntime`):  an icon name => its SVG markup, from `packs`.
   * - Why a hook:  the server reads SVG files from disk (`node:fs`), which browser code must never import.
   */
  static serverMarkup?: (packs: IconPacks, name: string) => string | undefined

  constructor(
    private readonly owner: IconGlyphOwner,
    name: Accessor<string | undefined>
  ) {
    if (isServer) {
      // no DOM to clone into, and the render is synchronous:  the SVG as markup, read now
      this.data = new Cell<SVGSVGElement | undefined>(undefined)
      this.svg = () => IconGlyph.serverSvg(owner.host, name())
      return
    }
    this.data = new Cell(untrack(() => IconGlyph.peek(owner.host, name())))
    this.svg = createMemo(() => {
      const template = this.data.get()
      return template ? IconGlyph.draw(template) : undefined
    })
    createEffect(
      () => ({ name: name(), connected: owner.connected.get(), generation: RootSettings.generation.get() }),
      ({ name: nameNow, connected }) => {
        if (connected || !this.request) void this.load(nameNow)
      }
    )
  }

  /**
   * Load `name`'s SVG;  writes only if it is still the latest request.
   * - Never rejects (it's fire-and-forget):  a runtime chunk that won't load draws no icon, not a page error.
   */
  private async load(name: string | undefined) {
    const request = ++this.request
    const template = name
      ? await UI.load()
          .then((ui) => IconGlyph.packsFor(this.owner.host, ui.icons).get(name))
          .catch(() => undefined)
      : undefined
    if (this.request === request && untrack(this.data.get) !== template) this.data.set(template)
  }

  /** The icon packs `element` draws from:  its nearest `<ui-root icons>`'s (`RootSettings`), else `page`. */
  static packsFor(element: Element, page: IconPacks): IconPacks {
    return RootSettings.nearest(element, "icons") ?? page
  }

  /** An insertable, decorative copy of `template` (`aria-hidden`:  the accessible name is the caller's). */
  static draw(template: SVGSVGElement): SVGSVGElement {
    const svg = template.cloneNode(true) as SVGSVGElement
    svg.setAttribute(ARIA_HIDDEN, TRUE)
    return svg
  }

  /**
   * Server render:  `name`'s SVG as `element` sees it (`serverMarkup`), as a node Solid's server build emits
   * verbatim (`ssr()`), `aria-hidden` like `draw()`'s;  `undefined` without a hook, a name or an icon.
   * - Typed as the `<svg>` the browser branch returns:  only ever inserted into JSX.
   */
  private static serverSvg(element: Element, name: string | undefined): SVGSVGElement | undefined {
    const page = (globalThis as RuntimeGlobal)[RUNTIME_KEY]?.icons
    if (!name || !page || !IconGlyph.serverMarkup) return undefined
    const markup = IconGlyph.serverMarkup(IconGlyph.packsFor(element, page), name)
    if (!markup) return undefined
    return ssr([markup.replace(SVG_OPEN, `<svg ${ARIA_HIDDEN}="${TRUE}"`)]) as unknown as SVGSVGElement
  }

  /** Cached template for `name` as `element` sees it, or `undefined` -- also before the runtime loads (or on a server). */
  private static peek(element: Element, name: string | undefined): SVGSVGElement | undefined {
    const page = (globalThis as RuntimeGlobal)[RUNTIME_KEY]?.icons
    return name && page ? IconGlyph.packsFor(element, page).peek(name) : undefined
  }
}

/** Hides a decorative icon from assistive technology. */
const ARIA_HIDDEN = "aria-hidden"

/** ARIA boolean. */
const TRUE = "true"

/** An SVG file's opening tag. */
const SVG_OPEN = /<svg\b/
