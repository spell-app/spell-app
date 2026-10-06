/****************
 * ### `Ids`
 * Unique element ids, as `UI.ids`.
 * - In the runtime's lazy chunk;  imports nothing.
 * - Why:  `aria-labelledby` / `aria-describedby` / `aria-controls` / `for` need ids, and generated ids
 *   must never collide across components -- or with ids the app wrote by hand.
 * - Ids only need to be unique within a tree scope (document or shadow root), but uniqueness per page is
 *   simpler and costs nothing.
 ****************/
export class Ids {
  /** last number handed out */
  private counter = 0

  /**
   * Fresh id like `ui-dropdown-3`.
   * - Skips any number already used in `root` (default the document), so hand-written ids can't collide.
   */
  next(prefix = DEFAULT_PREFIX, root: NonElementParentNode | undefined = globalThis.document): string {
    let id: string
    do id = `${prefix}-${++this.counter}`
    while (root?.getElementById(id))
    return id
  }

  /** `element`'s id, assigning `next(prefix)` first if it has none. */
  ensure(element: Element, prefix = DEFAULT_PREFIX): string {
    if (!element.id) element.id = this.next(prefix)
    return element.id
  }
}

/** Prefix of an id nobody named:  `ui-1`. */
const DEFAULT_PREFIX = "ui"
