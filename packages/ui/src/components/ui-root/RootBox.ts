import { WINDOW } from "./ui-root.types"

/****************
 * ### `RootBox`
 * One root's own sheet:  `:host { width; height; --ui-scale }` from its `width`, `height` and `size`.
 * - A constructed sheet adopted into the root's shadow (`UI.styles.adoptInto()` keeps sheets it didn't make), not an
 *   inline `style`:  the host's `style` attribute is the author's.
 * - Lengths are checked with `CSS.supports()`, so an attribute can never inject other declarations.
 ****************/
export class RootBox {
  /** Created on first use (never on the server). */
  private sheet?: CSSStyleSheet

  constructor(private readonly root: ShadowRoot) {}

  /** The declarations for these values;  `""` when there's nothing to set. */
  static css({ width, height, size }: { width?: string; height?: string; size?: string }): string {
    const declarations: string[] = []
    const w = RootBox.length("width", width, "100dvw")
    const h = RootBox.length("height", height, "100dvh")
    if (w) declarations.push(`width: ${w}`)
    if (h) declarations.push(`height: ${h}`)
    if (size && size !== "medium") declarations.push(`--ui-scale: var(--ui-size-${size})`)
    return declarations.join("; ")
  }

  /** A box (block, scrolling) when a width or height is set. */
  static isBox(width?: string, height?: string): boolean {
    return !!(RootBox.length("width", width, "100dvw") || RootBox.length("height", height, "100dvh"))
  }

  /** Apply `declarations` to the host. */
  set(declarations: string) {
    if (!declarations && !this.sheet) return
    if (!this.sheet) {
      this.sheet = new CSSStyleSheet()
      this.root.adoptedStyleSheets = [...this.root.adoptedStyleSheets, this.sheet]
    }
    this.sheet.replaceSync(declarations ? `:host { ${declarations} }` : "")
  }

  /** `value` as a CSS `property` value:  `window` => `viewport`, a valid length as is, else nothing. */
  private static length(property: string, value: string | undefined, viewport: string): string | undefined {
    const trimmed = value?.trim()
    if (!trimmed) return undefined
    if (trimmed === WINDOW) return viewport
    return CSS.supports(property, trimmed) ? trimmed : undefined
  }
}
