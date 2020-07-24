/** Browser DOM Utilities */
import global from "global"

export function scrollForElement(element, direction = "vertical") {
  if (!element) return undefined
  // allocate this way to make percent and max the first thing displayed in console
  const scroll = { percent: 0, max: 0 }
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
  scroll.percent = parseFloat((scroll.current / scroll.max).toPrecision(4), 10)
  return scroll
}

/**
 * Return the `offsetTop` of `element` relative to `parent` element (which defaults to `<body>`)
 * Will not be accurate if `parent` is not an ancestor or not `position:relative` or `position:absolute`.
 */
export function offsetTopRelativeTo(element, parent = document.querySelector("body")) {
  let top = 0
  while (element && element !== parent) {
    top += element.offsetTop
    element = element.offsetParent
  }
  return top
}

/**
 * Center `element` vertically in its `parent` element by scrolling `parent`.
 * NOTE: always scrolls to the far left horizontally.
 */
export function scrollElementToCenterOfParent(element, parent) {
  if (!element || !parent) return
  const elementTop = offsetTopRelativeTo(element, parent)
  const top = elementTop - parent.clientHeight / 2
  parent.scrollTo({ left: 0, top, behavior: "smooth" })
}

/**
 * Return `styleDeclaration` for an `element`, or `{}` if there's an error accessing it.
 *
 * `element` can be an actual DOM element or a previously generated `computedStyle`.
 * If you're getting lots of computed properties, get this once and pass to the routines below.
 *
 * NOTE: These objects may not be completely consistent cross-browser!
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle#Notes
 */
export function getComputedStyle(element) {
  try {
    if (element instanceof global.CSSStyleDeclaration) return element
    return global.getComputedStyle(element)
  } catch (e) {
    return {}
  }
}

/**
 * Generic classes for efficiently working with T/L/B/R sizes for an `element`, based on `getComputedStyle`,
 * e.g. for `padding` or margin.
 */
export class CSS_TLBR_VALUES {
  #top
  #right
  #bottom
  #left
  constructor(prefix = "", elementOrStyle, suffix = "") {
    const style = getComputedStyle(elementOrStyle)
    this.#top = style[`${prefix}top${suffix}`]
    this.#right = style[`${prefix}right${suffix}`]
    this.#bottom = style[`${prefix}bottom${suffix}`]
    this.#left = style[`${prefix}left${suffix}`]
  }
  get top() {
    return parseFloat(this.#top, 10)
  }
  get right() {
    return parseFloat(this.#right, 10)
  }
  get bottom() {
    return parseFloat(this.#bottom, 10)
  }
  get left() {
    return parseFloat(this.#left, 10)
  }
  get vertical() {
    return this.top + this.bottom
  }
  get horizontal() {
    return this.left + this.right
  }
}

/**
 * Return `margin` object for an `element` according to its `computedStyle`,
 * as `{ top, right, bottom, left, vertical, horizontal }`.
 *
 * NOTE: `element` can be a DOM element or a previously obtained `styleDeclaration`.
 * NOTE: Values will be `NaN` if you pass an invalid `element`.
 */
class margin extends CSS_TLBR_VALUES {}
export function getMargin(element) {
  return new margin("margin-", element)
}
global.getMargin = getMargin // DEBUG

/**
 * Return `border` object for an `element` according to its `computedStyle`,
 * as `{ top, right, bottom, left, vertical, horizontal }`.
 *
 * NOTE: `element` can be a DOM element or a previously obtained `styleDeclaration`.
 * NOTE: Values will be `NaN` if you pass an invalid `element`.
 */
class borderSize extends CSS_TLBR_VALUES {}
export function getBorderSize(element) {
  return new borderSize("border-", element, "-width")
}
global.getBorderSize = getBorderSize // DEBUG

/**
 * Return `padding` object for an `element` according to its `computedStyle`,
 * as `{ top, right, bottom, left, vertical, horizontal }`.
 *
 * NOTE: `element` can be a DOM element or a previously obtained `styleDeclaration`.
 * NOTE: Values will be `NaN` if you pass an invalid `element`.
 */
class padding extends CSS_TLBR_VALUES {}
export function getPadding(element) {
  return new padding("padding-", element)
}
global.getPadding = getPadding // DEBUG
