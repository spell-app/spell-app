/** Browser DOM Utilities */

export function scrollForElement(element, direction = "vertical") {
  if (!element) return undefined
  let size
  if (direction === "vertical") {
    size = {
      scroll: element.scrollTop,
      total: element.scrollHeight,
      visible: element.clientHeight
    }
  } else {
    size = {
      scroll: element.scrollLeft,
      total: element.scrollWidth,
      visible: element.clientWidth
    }
  }
  size.available = size.total - size.visible
  size.percent = parseFloat((size.scroll / size.available).toPrecision(4), 10)
  return size
}
