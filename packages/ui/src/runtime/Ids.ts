/**
 * Unique element ids, as `UI.ids`.
 * - Why:  `aria-labelledby` / `aria-describedby` / `aria-controls` / `for` need ids, and generated ids
 *   must never collide across components -- or with ids the app wrote by hand.
 * - Ids only need to be unique within a tree scope (document or shadow root), but uniqueness per page is
 *   simpler and costs nothing.
 */
export class Ids {
  /** last number handed out */
  private counter = 0

  /**
   * Fresh id like `ui-dropdown-3`.
   * - Skips any number already used in the document, so hand-written ids can't collide.
   */
  next(prefix = "ui"): string {
    let id: string
    do id = `${prefix}-${++this.counter}`
    while (typeof document !== "undefined" && document.getElementById(id))
    return id
  }

  /** `element`'s id, assigning `next(prefix)` first if it has none. */
  ensure(element: Element, prefix = "ui"): string {
    if (!element.id) element.id = this.next(prefix)
    return element.id
  }
}
