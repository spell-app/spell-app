import { createEffect, createMemo, untrack, type Accessor } from "solid-js"

import { RUNTIME_KEY, UI, type RuntimeGlobal } from "$/runtime"

import { Cell } from "./Cell"

/**
 * An icon NAME (attribute, shorthand) turned into an `<svg>`, loaded through the page's icon packs (`UI.icons`) --
 * shared by `<ui-icon>` and every component's `icon` shorthand, close / delete icons and the like.
 * - Starts from `UI.icons.peek()` when the runtime is already loaded, so a cached icon draws in the first frame.
 * - A later name wins over an earlier, slower load.
 * - `svg()` is a fresh `aria-hidden` clone per change;  the box around it is the caller's.
 * - MUST be created under the element's owner:  it creates a signal, a memo and an effect.
 */
export class IconGlyph {
  /**
   * The page's cached `<svg>` for the name, `undefined` until loaded (or for an unknown name);  tracked.
   * - A shared TEMPLATE:  NEVER insert it -- `svg()` / `IconGlyph.draw()` clone it.
   */
  readonly data: Cell<SVGSVGElement | undefined>

  /** A fresh `<svg>` to insert, or `undefined`;  tracked. */
  readonly svg: Accessor<SVGSVGElement | undefined>

  /** Name last asked for, so a slower earlier load can't win. */
  private request?: string

  constructor(name: Accessor<string | undefined>) {
    this.data = new Cell(untrack(() => IconGlyph.peek(name())))
    this.svg = createMemo(() => {
      const template = this.data.get()
      return template ? IconGlyph.draw(template) : undefined
    })
    createEffect(
      () => name(),
      (nameNow) => void this.load(nameNow)
    )
  }

  /** Load `name`'s SVG;  writes only if it is still the latest request. */
  private async load(name: string | undefined) {
    this.request = name
    const template = name ? await (await UI.load()).icons.get(name) : undefined
    if (this.request === name) this.data.set(template)
  }

  /** An insertable, decorative copy of `template` (`aria-hidden`:  the accessible name is the caller's). */
  static draw(template: SVGSVGElement): SVGSVGElement {
    const svg = template.cloneNode(true) as SVGSVGElement
    svg.setAttribute(ARIA_HIDDEN, TRUE)
    return svg
  }

  /** Cached template for `name`, or `undefined` -- also when the runtime isn't loaded yet (or on a server). */
  private static peek(name: string | undefined): SVGSVGElement | undefined {
    return name ? (globalThis as RuntimeGlobal)[RUNTIME_KEY]?.icons.peek(name) : undefined
  }
}

/** Hides a decorative icon from assistive technology. */
const ARIA_HIDDEN = "aria-hidden"

/** ARIA boolean. */
const TRUE = "true"
