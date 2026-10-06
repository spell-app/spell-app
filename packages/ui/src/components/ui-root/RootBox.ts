import { isServer } from "@solidjs/web"

import { UIT } from "$/ui/core"

/****************
 * ### `RootBox`
 * One root's own sheet:  `:host { width; height; --ui-scale; --ui-stack-with }` from its `width`, `height`, `size`
 * and `stack-with`.
 * - A constructed sheet adopted into the root's shadow (`UI.styles.adoptInto()` keeps sheets it didn't make), not an
 *   inline `style`:  the host's `style` attribute is the author's.  Not a host state either:  the token is read by
 *   style queries inside `@media`, which a `:state()` rule left stale in WebKit (`UIT.STACK_WITH_CLASS`).
 * - Lengths are checked with `CSS.supports()`, `stack-with` against its values, so an attribute can never inject
 *   other declarations;  a static server render (no `CSS` in node) checks lengths against `SERVER_LENGTH` instead.
 * - `css()` / `isBox()` are static:  pure, and the static server render needs them with no sheet to write.
 ****************/
export class RootBox {
  /** Shadow root the sheet is adopted into:  STATIC for the box's life. */
  private readonly root: ShadowRoot

  /** Created on first use (never on the server). */
  private sheet?: CSSStyleSheet

  constructor({ root }: RootBoxProps) {
    this.root = root
  }

  /** The declarations for these values;  `""` when there's nothing to set. */
  static css({ width, height, size, stackWith }: RootBoxValues): string {
    const declarations = RootBox.lengths({ width, height }).map(([property, value]) => `${property}: ${value}`)
    if (size && size !== MEDIUM) declarations.push(`--ui-scale: var(--ui-size-${size})`)
    if (UIT.StackWithValues.includes(stackWith as UIT.StackWith)) {
      declarations.push(`${UIT.STACK_WITH_TOKEN}: ${stackWith}`)
    }
    return declarations.join("; ")
  }

  /** A box (block, scrolling) when a width or height is set. */
  static isBox({ width, height }: Pick<RootBoxValues, "width" | "height">): boolean {
    return RootBox.lengths({ width, height }).length > 0
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

  /** `[property, value]` for each of `width` / `height` that is a valid length (`window`:  the viewport's). */
  private static lengths(values: Pick<RootBoxValues, "width" | "height">): [string, string][] {
    const lengths: [string, string][] = []
    for (const property of LENGTH_PROPERTIES) {
      const value = RootBox.length(property, values[property])
      if (value) lengths.push([property, value])
    }
    return lengths
  }

  /** `value` as a CSS `property` value:  `window` => the viewport's, a valid length as is, else nothing. */
  private static length(property: LengthProperty, value: string | undefined): string | undefined {
    const trimmed = value?.trim()
    if (!trimmed) return undefined
    if (trimmed === WINDOW) return VIEWPORT[property]
    if (isServer) return SERVER_LENGTH.test(trimmed) ? trimmed : undefined
    return CSS.supports(property, trimmed) ? trimmed : undefined
  }
}

/** What a `RootBox` is made from. */
export type RootBoxProps = {
  /** The root's shadow root, where its sheet is adopted. */
  root: ShadowRoot
}

/** A root's attributes the box is built from. */
export type RootBoxValues = {
  /** `width`:  a CSS length or `window`. */
  width?: string
  /** `height`:  a CSS length or `window`. */
  height?: string
  /** `size`:  scales the subtree;  `medium` is no change. */
  size?: string
  /** `stack-with`:  one of `UIT.StackWithValues`. */
  stackWith?: string
}

/** The two lengths a root takes, in declaration order. */
const LENGTH_PROPERTIES = ["width", "height"] as const

/** One of `LENGTH_PROPERTIES`. */
type LengthProperty = (typeof LENGTH_PROPERTIES)[number]

/** `width` / `height` value meaning "the viewport's". */
const WINDOW = "window"

/** The viewport's length, per property:  `dvh` follows a phone's address bar. */
const VIEWPORT = { width: "100dvw", height: "100dvh" } as const

/** The size that changes nothing. */
const MEDIUM = "medium"

/**
 * A length a static server render accepts for `width` / `height` (node has no `CSS.supports()`):  numbers, units,
 * `%`, `calc()` / `var()` / `min()` ... -- never `;`, `:`, braces or quotes, which could inject other declarations.
 */
const SERVER_LENGTH = /^[\w.%+\-*/(), ]+$/
