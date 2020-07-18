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
