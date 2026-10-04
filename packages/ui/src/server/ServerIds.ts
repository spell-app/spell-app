/****************
 * ### `ServerIds`
 * `UI.ids` in a server render:  fresh ids that never collide with the page being rendered.
 * - Why not `Ids`:  it skips ids already in the GLOBAL `document`, which node doesn't have, so a generated
 *   `ui-modal-1` could repeat an id the page wrote.
 * - `page`:  the document being rendered (`StaticRender` sets it), else nothing to avoid.
 * - Same interface as `Ids` (`next()`, `ensure()`).
 ****************/
export class ServerIds {
  /** The document being rendered;  its ids are taken. */
  page: Document | undefined

  /** Last number handed out. */
  private counter = 0

  /**
   * Start a page:  its ids are taken, and numbering restarts, so the same page renders the same ids however many
   * pages the process rendered before (stable output, diffable, cacheable).
   */
  reset(page: Document | undefined) {
    this.page = page
    this.counter = 0
  }

  /** Fresh id like `ui-dropdown-3`, skipping any the page already has. */
  next(prefix = "ui"): string {
    let id: string
    do {
      id = `${prefix}-${++this.counter}`
    } while (this.page?.getElementById(id))
    return id
  }

  /** `element`'s id, assigning `next(prefix)` first if it has none. */
  ensure(element: Element, prefix = "ui"): string {
    if (!element.id) element.id = this.next(prefix)
    return element.id
  }
}
