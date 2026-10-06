import { Warnings } from "$/ui/util"

import type { ShorthandMapper, ShorthandOptions, ShorthandProps, ShorthandValue } from "./elements.types"

/**
 * SUI React's shorthand contract (`createShorthand()` in `lib/factories.js`) for properties like
 * `icon`, `image`, `label`, `header`:  one value may be a primitive, a props object, or nothing.
 * - `undefined` / `null` / booleans => nothing
 * - string / number / array => `mapPrimitive(value)`, e.g. `"check"` => `{ name: "check" }` for an icon
 * - plain object => props as given
 * - Merge order `defaults < value props < overrides`;  `class` is merged and de-duplicated,
 *   object `style`s merge key by key.
 * - Returns plain props;  the renderer (a Solid component) turns them into an element.  NO DOM.
 * - NOTE: dropped from SUI:  React elements, render functions, `key` / `childKey`.  Children (slotted content)
 *   win over shorthand -- that's the renderer's job.
 */
export class Shorthand {
  /** Common primitive mappers, so components don't each write `(value) => ({ content: value })`. */
  static readonly map = {
    /** Button, label, header ... text. */
    content: (content: unknown): ShorthandProps => ({ content }),
    /** Icon, flag. */
    name: (name: unknown): ShorthandProps => ({ name }),
    /** Image, embed. */
    src: (src: unknown): ShorthandProps => ({ src }),
    /** Input. */
    type: (type: unknown): ShorthandProps => ({ type })
  } satisfies Record<string, ShorthandMapper>

  /**
   * Props for shorthand `value`, or `undefined` when it renders nothing.
   * - SIDE EFFECT (dev only): warns about values of other types (functions, symbols ...) and renders nothing.
   */
  static resolve(
    value: ShorthandValue,
    mapPrimitive: ShorthandMapper,
    options: ShorthandOptions = {}
  ): ShorthandProps | undefined {
    if (value == null || typeof value === "boolean") return undefined
    let user: ShorthandProps
    if (typeof value === "string" || typeof value === "number" || Array.isArray(value)) user = mapPrimitive(value)
    else if (Shorthand.isPlainObject(value)) user = value
    else {
      Warnings.devWarn("Shorthand", `expected string | number | array | object, got ${typeof value}`)
      return undefined
    }
    const defaults = options.defaults ?? {}
    const overrides =
      typeof options.overrides === "function" ? options.overrides({ ...defaults, ...user }) : (options.overrides ?? {})
    const props: ShorthandProps = { ...defaults, ...user, ...overrides }
    const classes = Shorthand.mergeClasses(defaults.class, user.class, overrides.class)
    if (classes) props.class = classes
    const style = Shorthand.mergeStyles(defaults.style, user.style, overrides.style)
    if (style !== undefined) props.style = style
    return props
  }

  /**
   * Space-separated classes of all `lists`, first occurrence kept, e.g. `("ui icon", "icon red")` => `"ui icon red"`.
   * - `undefined` when there are none.
   */
  static mergeClasses(...lists: (string | undefined)[]): string | undefined {
    const classes = new Set<string>()
    for (const list of lists) {
      if (!list) continue
      for (const name of list.split(WHITESPACE)) if (name) classes.add(name)
    }
    return classes.size ? [...classes].join(" ") : undefined
  }

  ////////////////
  // ## Internals
  ////////////////

  /**
   * Merge `style`s, later winning:  objects key by key;  if any is a string, strings join with `;`
   * (objects are then ignored -- mixing both is a caller bug).
   */
  private static mergeStyles(...styles: ShorthandProps["style"][]): ShorthandProps["style"] | undefined {
    const present = styles.filter((style) => style !== undefined && style !== "")
    if (!present.length) return undefined
    if (present.every((style) => typeof style === "object"))
      return Object.assign({}, ...present) as Record<string, string>
    return present.filter((style) => typeof style === "string").join("; ")
  }

  /** True for `{}` literals and `Object.create(null)`, not class instances or arrays. */
  private static isPlainObject(value: unknown): value is ShorthandProps {
    if (typeof value !== "object" || value === null) return false
    const prototype = Object.getPrototypeOf(value) as unknown
    return prototype === Object.prototype || prototype === null
  }
}

/** Runs of whitespace. */
const WHITESPACE = /\s+/
