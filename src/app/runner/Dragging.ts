import { E } from "spell-ui/core"

/****************
 * ### `Dragging`
 * One drag of a drawable thing's element, from pointer down to pointer up:  a mouse and a finger alike.
 *
 * - What it moves:  the element, and its list's items after it, e.g. a tableau's face-up card and the cards on it.
 *   They follow the pointer by their `translate`, raised above the board, and ignore the pointer meanwhile,
 *   so what's under it can be found.
 * - Where it lands:  the drawable list's element under the pointer, as `dropTargetAt()` finds it.
 * - It sends the web's own drag events, as `DragEvent`s with no `dataTransfer`, so a page can follow it as it would
 *   the browser's drag and drop:
 *   - on the dragged element:  `dragstart`, `drag` as it moves, `dragend`
 *   - on the list under the pointer:  `dragenter`, `dragover` as it moves over it, `dragleave`, and `drop`
 *   - What's being dragged meanwhile:  `Dragging.current`.
 *   - Why not the browser's own drag and drop (`draggable="true"`):  it's patchy on phones, only a faded picture of one
 *     element follows the pointer, and it can't glide or slide back.
 * - A press that doesn't move past `DRAG_START_PX` is no drag:  its click goes through as ever.
 *   A real drag swallows the click that follows it.
 * - What happens on the drop is its owner's to say (`onDrop`), e.g. `SpellElement`'s:  the program's `card-drop`.
 *   - What still sits where it was dragged from afterwards, a drop nobody took, slides back.
 *   - What moved is drawn again in its new list, and glides there from where it was dropped (`Glides`).
 * - Plain DOM:  no Solid, no core.  Its owner hands it the element and what to do.
 ****************/
export class Dragging {
  /** The drag in progress, if any:  a list under the pointer asks it what's coming. */
  static current: Dragging | undefined

  /** Start watching a press on `element`, `event` its `pointerdown`:  a drag once it moves far enough. */
  constructor(
    readonly element: HTMLElement,
    event: PointerEvent,
    private readonly onDrop: (target: HTMLElement | undefined) => void
  ) {
    this.startX = event.clientX
    this.startY = event.clientY
    this.pointerId = event.pointerId
    const options = { signal: this.listening.signal }
    window.addEventListener("pointermove", this.onMove, options)
    window.addEventListener("pointerup", this.onUp, options)
    window.addEventListener("pointercancel", this.onCancel, options)
  }

  /** Where the press started. */
  private readonly startX: number
  private readonly startY: number
  /** The pointer pressing:  a second finger is ignored. */
  private readonly pointerId: number
  /** Ends the window listeners. */
  private readonly listening = new AbortController()
  /** What's being dragged, once it's a drag:  the element, then its list's items after it. */
  private moving: HTMLElement[] = []
  /** The drop target under the pointer now, if any:  it's had `dragenter`, and gets `dragleave` as the pointer leaves. */
  private over: HTMLElement | undefined

  /** The pointer moved:  past `DRAG_START_PX`, a drag starts;  during one, what's dragged follows it. */
  private readonly onMove = (event: PointerEvent) => {
    if (event.pointerId !== this.pointerId) return
    const dx = event.clientX - this.startX
    const dy = event.clientY - this.startY
    if (!this.moving.length) {
      if (Math.hypot(dx, dy) < DRAG_START_PX) return
      this.start()
    }
    for (const element of this.moving) element.style.translate = `${dx}px ${dy}px`
    event.preventDefault()
    Dragging.send(this.element, "drag", event)
    this.moveOver(Dragging.dropTargetAt(this.element, event.clientX, event.clientY), event)
  }

  /** The pointer is over `target` now:  `dragleave` on the one it left, `dragenter` on a new one, `dragover` on it. */
  private moveOver(target: HTMLElement | undefined, event: PointerEvent) {
    if (target !== this.over) {
      if (this.over) Dragging.send(this.over, "dragleave", event)
      this.over = target
      if (target) Dragging.send(target, "dragenter", event)
    }
    if (target) Dragging.send(target, "dragover", event)
  }

  /** The drag starts:  what's dragged is raised, and leaves the pointer to what's under it. */
  private start() {
    const following: HTMLElement[] = []
    for (let next = this.element.nextElementSibling; next; next = next.nextElementSibling) {
      following.push(next as HTMLElement)
    }
    this.moving = [this.element, ...following]
    for (const element of this.moving) {
      element.style.zIndex = DRAGGING_Z_INDEX
      element.style.pointerEvents = "none"
    }
    Dragging.current = this
    this.element.dispatchEvent(new DragEvent("dragstart", { bubbles: true, composed: true }))
  }

  /** The pointer's let go:  a drag drops where it is;  a press with no drag is left to its click. */
  private readonly onUp = (event: PointerEvent) => {
    if (event.pointerId !== this.pointerId) return
    this.listening.abort()
    if (!this.moving.length) return
    Dragging.swallowNextClick()
    const target = Dragging.dropTargetAt(this.element, event.clientX, event.clientY)
    this.moveOver(target, event)
    try {
      if (target) Dragging.send(target, "drop", event)
      this.onDrop(target)
    } finally {
      // after the move is drawn:  what's still here wasn't taken, and slides back
      E.beforeNextPaint(() => this.settle())
    }
  }

  /** The browser took the pointer away (a scroll, a system gesture):  put everything back. */
  private readonly onCancel = (event: PointerEvent) => {
    if (event.pointerId !== this.pointerId) return
    this.listening.abort()
    if (this.over) Dragging.send(this.over, "dragleave", event)
    this.settle()
  }

  /** What's still where it was dragged from slides back, and takes the pointer again. */
  private settle() {
    for (const element of this.moving) {
      const from = element.style.translate
      element.style.translate = ""
      element.style.pointerEvents = ""
      element.style.zIndex = ""
      if (element.isConnected && from && from !== "0px 0px") {
        element.animate(
          [
            { translate: from, zIndex: DRAGGING_Z_INDEX },
            { translate: "0 0", zIndex: DRAGGING_Z_INDEX }
          ],
          {
            duration: SLIDE_BACK_MS,
            easing: SLIDE_BACK_EASING
          }
        )
      }
    }
    if (Dragging.current === this) Dragging.current = undefined
    this.element.dispatchEvent(new DragEvent("dragend", { bubbles: true, composed: true }))
  }

  /** Send drag event `type` to `target`, where `event`'s pointer is:  a `DragEvent`, as the browser's own. */
  private static send(target: HTMLElement, type: string, event: PointerEvent) {
    const { clientX, clientY } = event
    target.dispatchEvent(new DragEvent(type, { bubbles: true, composed: true, cancelable: true, clientX, clientY }))
  }

  /**
   * The element under (`x`, `y`) that may take the drop, searching up from the topmost there, through shadow roots:
   * the first one `isDropTarget()` accepts -- `undefined` if none.
   * - Looked for in `element`'s own tree, where the board is (a runner's shadow root, or the page).
   */
  static dropTargetAt(element: HTMLElement, x: number, y: number): HTMLElement | undefined {
    const root = element.getRootNode() as Document | ShadowRoot
    for (const hit of root.elementsFromPoint(x, y)) {
      for (let at: Element | null = hit; at; at = at.parentElement ?? (at.getRootNode() as ShadowRoot).host ?? null) {
        if (Dragging.isDropTarget(at)) return at as HTMLElement
      }
    }
    return undefined
  }

  /** May `element` take a drop?  Set by its owner:  `SpellElement` says a drawable list's element may. */
  static isDropTarget: (element: Element) => boolean = () => false

  /** The click a drag's pointer up makes is no click:  swallowed, once, before anything hears it. */
  private static swallowNextClick() {
    const swallow = (event: Event) => {
      event.stopPropagation()
      event.preventDefault()
    }
    window.addEventListener("click", swallow, { capture: true, once: true })
    // a pointer up off the element makes no click:  stop waiting for one
    E.soon(() => window.removeEventListener("click", swallow, { capture: true }))
  }
}

/** How far the pointer moves before a press is a drag, in pixels:  less is a click. */
const DRAG_START_PX = 6

/** Above the board while dragged. */
const DRAGGING_Z_INDEX = "1000"

/** How long a drop nobody took slides back, in milliseconds. */
const SLIDE_BACK_MS = 200

/** How it slides back:  quickly at first, settling into place. */
const SLIDE_BACK_EASING = "cubic-bezier(0.2, 0.7, 0.3, 1)"
