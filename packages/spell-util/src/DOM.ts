/** Browser DOM utilities. */

/**
 * Scroll metrics for `element` in given `direction`, or `undefined` if `element` is falsy.
 * - `direction` is `"vertical"` (default) or anything else for horizontal.
 */
export function scrollForElement(element: Element, direction = "vertical") {
  if (!element) return undefined
  // Allocate this way to make `percent` and `max` first thing displayed in console.
  const scroll = { percent: 0, max: 0 } as ElementScroll
  if (direction === "vertical") {
    scroll.current = element.scrollTop
    scroll.total = element.scrollHeight
    scroll.visible = element.clientHeight
  } else {
    scroll.current = element.scrollLeft
    scroll.total = element.scrollWidth
    scroll.visible = element.clientWidth
  }
  scroll.max = scroll.total - scroll.visible
  scroll.percent = parseFloat((scroll.current / scroll.max).toPrecision(4))
  return scroll
}

/** Return value of `scrollForElement()`. */
export type ElementScroll = {
  /** `current / max`, rounded to 4 decimal places -- `NaN` if `max` is `0`. */
  percent: number
  /** Furthest `current` can scroll to, i.e. `total - visible`. */
  max: number
  /** Current scroll position, i.e. `scrollTop`/`scrollLeft`. */
  current: number
  /** Full scrollable size, i.e. `scrollHeight`/`scrollWidth`. */
  total: number
  /** Visible viewport size, i.e. `clientHeight`/`clientWidth`. */
  visible: number
}

/**
 * `offsetTop` of `element` relative to `parent` element (which defaults to `<body>`).
 * - Will not be accurate if `parent` is not an ancestor, or is not `position: relative`/`position: absolute`.
 */
export function offsetTopRelativeTo(
  element: Element | null,
  parent: HTMLElement | null = document.querySelector("body")
) {
  let top = 0
  while (element && element instanceof HTMLElement && element !== parent) {
    top += element.offsetTop
    element = element.offsetParent
  }
  return top
}

/**
 * Center `element` vertically in its `parent` element by scrolling `parent`.
 * - SIDE EFFECT: scrolls `parent` (smoothly, via `scrollTo()`).
 * - NOTE: always scrolls to far left horizontally.
 * - No-op if either `element` or `parent` is falsy.
 */
export function centerElementInParent(element: Element | null, parent?: HTMLElement | null) {
  if (!element || !parent) return
  const elementTop = offsetTopRelativeTo(element, parent)
  const elementHeight = element.clientHeight
  const parentHeight = parent.clientHeight
  const delta =
    elementHeight < parentHeight
      ? // If element is smaller than parent, center within parent vertically.
        (parentHeight - elementHeight) / 2
      : // Otherwise scroll just below top of parent.
        10
  parent.scrollTo({ left: 0, top: elementTop - delta, behavior: "smooth" })
}

/**
 * `styleDeclaration` for an `element`, or `{}` if there's an error accessing it.
 * - `element` can be actual DOM element or a previously generated `computedStyle` -- if you're getting
 *   lots of computed properties, get this once and pass to routines below (`getMargin()` etc).
 * - NOTE: these objects may not be completely consistent cross-browser.
 *   See https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle#Notes
 * - NOTE: uses ambient `global` (from `@types/node`) rather than an explicit `window`, unlike
 *   `abortableFetch.ts` which imports npm package `global` for the same purpose.
 *   TODO: confirm this resolves correctly at runtime in browser build; consider importing `global` package
 *   here too for consistency.
 */
export function getComputedStyle(element: Element | CSSStyleDeclaration) {
  try {
    if (element instanceof global.CSSStyleDeclaration) return element
    return global.getComputedStyle(element)
  } catch (e) {
    return {}
  }
}

/**
 * Generic class for efficiently working with T/L/B/R sizes for an `element`, based on `getComputedStyle()`,
 * e.g. for `padding` or `margin` -- see `getMargin()`/`getBorderSize()`/`getPadding()` below for concrete uses.
 */
export class CSS_TLBR_VALUES {
  #top: string
  #right: string
  #bottom: string
  #left: string

  /**
   * `prefix` and `suffix` are stitched around each side name to build style property, e.g.
   * `prefix="margin-"`, side `"top"` => `margin-top`; `prefix="border-"`, `suffix="-width"`, side `"top"`
   * => `border-top-width`.
   */
  constructor(prefix = "", elementOrStyle: Element | CSSStyleDeclaration, suffix = "") {
    const style = getComputedStyle(elementOrStyle) as Record<string, string>
    this.#top = style[`${prefix}top${suffix}`]
    this.#right = style[`${prefix}right${suffix}`]
    this.#bottom = style[`${prefix}bottom${suffix}`]
    this.#left = style[`${prefix}left${suffix}`]
  }
  /** Top value, parsed to a number -- `NaN` if `element` was invalid. */
  get top() {
    return parseFloat(this.#top)
  }
  /** Right value, parsed to a number -- `NaN` if `element` was invalid. */
  get right() {
    return parseFloat(this.#right)
  }
  /** Bottom value, parsed to a number -- `NaN` if `element` was invalid. */
  get bottom() {
    return parseFloat(this.#bottom)
  }
  /** Left value, parsed to a number -- `NaN` if `element` was invalid. */
  get left() {
    return parseFloat(this.#left)
  }
  /** `top + bottom`. */
  get vertical() {
    return this.top + this.bottom
  }
  /** `left + right`. */
  get horizontal() {
    return this.left + this.right
  }
}

// TODO: CASE?  -- these class names are lowercase, unlike rest of codebase's `PascalCase` classes.
/** Internal subclass of `CSS_TLBR_VALUES` fixed to `margin-*` properties -- use `getMargin()` instead. */
class margin extends CSS_TLBR_VALUES {}

/**
 * `margin` object for an `element` according to its computed style, as `{ top, right, bottom, left,
 * vertical, horizontal }`.
 * - NOTE: `element` can be a DOM element or a previously obtained `styleDeclaration`.
 * - NOTE: values will be `NaN` if you pass an invalid `element`.
 */
export function getMargin(element: Element) {
  return new margin("margin-", element)
}

// TODO: CASE?  -- lowercase class name, unlike rest of codebase's `PascalCase` classes.
/** Internal subclass of `CSS_TLBR_VALUES` fixed to `border-*-width` properties -- use `getBorderSize()` instead. */
class borderSize extends CSS_TLBR_VALUES {}

/**
 * `border` size object for an `element` according to its computed style, as `{ top, right, bottom, left,
 * vertical, horizontal }`.
 * - NOTE: `element` can be a DOM element or a previously obtained `styleDeclaration`.
 * - NOTE: values will be `NaN` if you pass an invalid `element`.
 */
export function getBorderSize(element: Element) {
  return new borderSize("border-", element, "-width")
}

// TODO: CASE?  -- lowercase class name, unlike rest of codebase's `PascalCase` classes.
/** Internal subclass of `CSS_TLBR_VALUES` fixed to `padding-*` properties -- use `getPadding()` instead. */
class padding extends CSS_TLBR_VALUES {}

/**
 * `padding` object for an `element` according to its computed style, as `{ top, right, bottom, left,
 * vertical, horizontal }`.
 * - NOTE: `element` can be a DOM element or a previously obtained `styleDeclaration`.
 * - NOTE: values will be `NaN` if you pass an invalid `element`.
 */
export function getPadding(element: Element) {
  return new padding("padding-", element)
}
