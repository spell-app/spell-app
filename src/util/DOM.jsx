/** Browser DOM Utilities */

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
