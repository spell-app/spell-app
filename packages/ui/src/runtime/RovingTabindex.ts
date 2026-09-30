import type { Disposer, RovingItems, RovingOptions, RovingOrientation } from "./runtime.types"

/**
 * Roving tabindex for composite widgets:  menus, tabs, listboxes, toolbars, radio-like groups.
 * - The WAI-ARIA APG pattern:  the group is ONE tab stop (active item `tabindex="0"`, the rest `-1`),
 *   arrow keys move between items, Home / End jump to the ends.
 * - Items come from a selector under `container`, or a function (for slotted or computed items).
 *   They're re-read on every key press, so items added later just work;  call `refresh()` to fix up
 *   `tabindex`es eagerly after a change.
 * - Disabled items (`:disabled`, `aria-disabled="true"`, `hidden`) are skipped.
 * - Horizontal arrows flip in right-to-left layouts.
 */
export class RovingTabindex {
  /** element holding the items;  listens for `keydown` / `focusin` */
  readonly container: HTMLElement
  /** how to find items */
  private readonly source: RovingItems
  /** which arrows move */
  private readonly orientation: RovingOrientation
  /** wrap from last to first and back */
  private readonly wrap: boolean
  /** told when the active item moves */
  private readonly onChange?: RovingOptions["onChange"]
  /** index into `items` of the current tab stop */
  private current = 0

  /** Create and start a roving tabindex on `container` -- see class docs. */
  static attach(container: HTMLElement, items: RovingItems, options: RovingOptions = {}): RovingTabindex {
    return new RovingTabindex(container, items, options)
  }

  constructor(container: HTMLElement, items: RovingItems, options: RovingOptions = {}) {
    this.container = container
    this.source = items
    this.orientation = options.orientation ?? "vertical"
    this.wrap = options.wrap ?? true
    this.onChange = options.onChange
    this.current = options.activeIndex ?? this.initialIndex()
    container.addEventListener("keydown", this.onKeyDown)
    container.addEventListener("focusin", this.onFocusIn)
    this.refresh()
  }

  /** Current items, in order (disabled ones included -- they keep their index). */
  get items(): HTMLElement[] {
    return typeof this.source === "function"
      ? this.source()
      : Array.from(this.container.querySelectorAll<HTMLElement>(this.source))
  }

  /** Index of the current tab stop. */
  get activeIndex(): number {
    return this.current
  }

  /** The current tab stop, if any items exist. */
  get activeItem(): HTMLElement | undefined {
    return this.items[this.current]
  }

  /** Make item `index` the tab stop and focus it. */
  focus(index: number) {
    const item = this.items[index]
    if (!item) return
    this.setActive(index)
    item.focus()
  }

  /** Re-apply `tabindex`es, e.g. after items were added or removed. */
  refresh() {
    const items = this.items
    if (this.current >= items.length) this.current = Math.max(0, items.length - 1)
    items.forEach((item, index) => item.setAttribute("tabindex", index === this.current ? "0" : "-1"))
  }

  /** Stop listening.  Leaves `tabindex`es as they are. */
  readonly detach: Disposer = () => {
    this.container.removeEventListener("keydown", this.onKeyDown)
    this.container.removeEventListener("focusin", this.onFocusIn)
  }

  ////////////////
  // ## Internals
  ////////////////

  /** Arrow / Home / End handling. */
  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.defaultPrevented) return
    const items = this.items
    const from = this.indexOfEvent(event, items)
    if (from < 0) return
    const next = this.targetIndex(event.key, from, items)
    if (next === undefined || next === from) return
    event.preventDefault()
    this.focus(next)
  }

  /** Focus landing on an item (click, script) makes it the tab stop. */
  private readonly onFocusIn = (event: FocusEvent) => {
    const items = this.items
    const index = this.indexOfEvent(event, items)
    if (index >= 0 && index !== this.current) this.setActive(index)
  }

  /** Where `key` moves from `from`, or `undefined` if it isn't a navigation key for this orientation. */
  private targetIndex(key: string, from: number, items: HTMLElement[]): number | undefined {
    const rtl = getComputedStyle(this.container).direction === "rtl"
    const horizontal = this.orientation !== "vertical"
    const vertical = this.orientation !== "horizontal"
    let step = 0
    if (vertical && key === "ArrowDown") step = 1
    else if (vertical && key === "ArrowUp") step = -1
    else if (horizontal && key === "ArrowRight") step = rtl ? -1 : 1
    else if (horizontal && key === "ArrowLeft") step = rtl ? 1 : -1
    else if (key === "Home") return this.seek(-1, 1, items)
    else if (key === "End") return this.seek(items.length, -1, items)
    else return undefined
    return this.seek(from, step, items)
  }

  /**
   * First enabled item stepping from `from` by `step`, honouring `wrap`.
   * - Home / End start just off the ends (`-1` / `length`);  if every item is disabled, the tab stop stays put.
   * - Without `wrap`, running off an end stays on `from`.
   */
  private seek(from: number, step: number, items: HTMLElement[]): number {
    const count = items.length
    const offEnd = from < 0 || from >= count
    let index = from
    for (let tries = 0; tries < count; tries++) {
      index += step
      if (index < 0 || index >= count) {
        if (offEnd) return this.current
        if (!this.wrap) return from
        index = (index + count) % count
      }
      if (this.isEnabled(items[index]!)) return index
    }
    return offEnd ? this.current : from
  }

  /** Index of the item the event came from (composed path, so events from inside items count). */
  private indexOfEvent(event: Event, items: HTMLElement[]): number {
    const path = event.composedPath()
    return items.findIndex((item) => path.includes(item))
  }

  /** Can focus land on `item`? */
  private isEnabled(item: HTMLElement): boolean {
    return !item.hidden && !item.matches(":disabled") && item.getAttribute("aria-disabled") !== "true"
  }

  /** Make `index` the tab stop and tell `onChange`. */
  private setActive(index: number) {
    this.current = index
    this.refresh()
    const item = this.items[index]
    if (item) this.onChange?.(item, index)
  }

  /** Starting tab stop:  an item already marked current, else the first. */
  private initialIndex(): number {
    const items = this.items
    const marked = items.findIndex(
      (item) => item.getAttribute("tabindex") === "0" || item.getAttribute("aria-selected") === "true"
    )
    return Math.max(0, marked)
  }
}
