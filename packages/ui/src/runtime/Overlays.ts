// Import directly to avoid circular import
import { proto } from "$/ui/util"
import * as UIT from "$/ui/components/components.types"

import {
  LAYER_ORDER,
  SCROLL_LOCK_CLASS,
  type CloseWatcherConstructor,
  type CloseWatcherLike,
  type DismissReason,
  type OverlayEntry,
  type OverlayKind
} from "./runtime.types"
import type { Browser } from "./Browser"
import type { Focus } from "./Focus"
import type { Keyboard } from "./Keyboard"
import type { Styles } from "./Styles"

/****************
 * ### `Overlays`
 * Top-layer coordination, as `UI.overlays`:  what Fomantic did with event pools and body classes.
 * - In the runtime's lazy chunk;  `UIRuntime` hands it the `Keyboard`, `Focus`, `Browser` and `Styles` it leans on.
 * - Components call `open(entry)` when they show and `close(entry)` when they hide;  `Overlays` keeps the stack
 *   and ASKS the right entry to dismiss itself (`entry.onDismiss(reason)`) -- it never closes or emits anything.
 * - Escape:  only the topmost Escape-handling entry hears it.  Each such entry pushes a `Keyboard` scope,
 *   which also silences page shortcuts while it's open.  With `CloseWatcher` (Chromium) a watcher is used
 *   instead of a key binding, so the Android back button closes overlays too.
 * - Outside clicks:  one capture `pointerdown` + `click` pair on `document`.  Only the topmost entry in each
 *   pool is checked, and a click counts as outside only if it ALSO started outside (the `pointerdown`
 *   origin), so a text-selection drag that ends on the backdrop never dismisses (SUI React's
 *   `doesNodeContainClick`).  Composed paths make clicks inside shadow roots count as inside.
 *   A click on a modal `<dialog>`'s `::backdrop` targets the dialog itself -- detected by the pointer being
 *   outside the dialog's box.
 * - Scroll lock:  reference counted across `modal` entries.  Adds `ui-scroll-locked` to `<html>` and sets
 *   `--ui-scrollbar-width` so the page can pad for the vanished scrollbar and not shift sideways.
 * - Focus restore:  remembers the deep active element on `open()`, refocuses it on `close()` if it's still
 *   connected and focus was inside the overlay (or lost to `<body>`).
 * - TODO: dimmer coordination (one page dimmer shared by stacked modals) lands with `ui-dimmer`.
 ****************/
export class Overlays {
  /**
   * use `CloseWatcher` when the browser has it;  tests turn it off to drive Escape with synthetic events
   * - `@proto` default (on the prototype, not per instance):  an instance or subclass overrides it
   */
  declare useCloseWatcher: boolean
  @proto static useCloseWatcher = true

  /** Escape bindings and scopes */
  private readonly keyboard: Keyboard
  /** active element, containment */
  private readonly focus: Focus
  /** `supports.closeWatcher` */
  private readonly browser: Browser
  /** registers the scroll-lock page sheet, when given */
  private readonly styles?: Styles
  /** open entries, bottom first */
  private readonly stack: OverlayRecord[] = []
  /** number of open `modal` entries */
  private scrollLocks = 0
  /** where the current press started, see class docs */
  private press?: PointerPress
  /** removes the document listeners;  set while they're installed */
  private listeners?: AbortController
  /** for unique keyboard scope ids */
  private counter = 0

  constructor({ keyboard, focus, browser, styles }: OverlaysProps) {
    this.keyboard = keyboard
    this.focus = focus
    this.browser = browser
    this.styles = styles
  }

  ////////////////
  // ## Stack
  ////////////////

  /**
   * Put `entry` on top of the stack.  No-op if it's already open.
   * - SIDE EFFECTS:  keyboard scope, scroll lock, document listeners, as the entry's options say.
   */
  open(entry: OverlayEntry) {
    if (this.recordOf(entry)) return
    const isToast = entry.kind === TOAST
    const record: OverlayRecord = {
      entry,
      pool: entry.pool ?? (isToast ? TOAST : DEFAULT_POOL),
      closeOnEscape: entry.closeOnEscape ?? !isToast,
      closeOnOutsideClick: entry.closeOnOutsideClick ?? !isToast,
      modal: entry.modal ?? MODAL_KINDS.has(entry.kind),
      scope: `overlay-${++this.counter}`,
      restoreTo: entry.restoreFocus === false ? undefined : this.focus.activeElementDeep()
    }
    this.stack.push(record)
    if (record.closeOnEscape || record.modal) this.keyboard.pushScope(record.scope)
    if (record.closeOnEscape) this.watchEscape(record)
    if (record.modal) this.lockScroll()
    this.listen()
  }

  /**
   * Take `entry` off the stack, wherever it is, and undo what `open()` did.  No-op if it isn't open.
   * - Focus is restored AFTER everything else, so a restored element isn't immediately scroll-locked or scoped.
   */
  close(entry: OverlayEntry) {
    const record = this.recordOf(entry)
    if (!record) return
    this.stack.splice(this.stack.indexOf(record), 1)
    record.unwatchEscape?.()
    this.keyboard.popScope(record.scope)
    if (record.modal) this.unlockScroll()
    if (!this.stack.length) this.unlisten()
    this.restoreFocus(record)
  }

  /** Is `entry` open? */
  isOpen(entry: OverlayEntry): boolean {
    return !!this.recordOf(entry)
  }

  /** Topmost open entry, optionally only of `kind`. */
  topmost(kind?: OverlayKind): OverlayEntry | undefined {
    return this.stack.findLast((record) => !kind || record.entry.kind === kind)?.entry
  }

  /** Open entries, bottom first. */
  get entries(): OverlayEntry[] {
    return this.stack.map((record) => record.entry)
  }

  /**
   * Ask every open entry (optionally only in `pool`) to dismiss, topmost first, with reason `close-all`.
   * - NOTE: asks only;  entries that veto (a cancelled `ui-close`) stay open.
   */
  closeAll(pool?: string) {
    const records = this.stack.filter((record) => !pool || record.pool === pool).reverse()
    for (const record of records) void record.entry.onDismiss("close-all")
  }

  /** Remove listeners, unlock scroll, forget every entry without dismissing;  for tests and teardown. */
  dispose() {
    for (const record of [...this.stack].reverse()) this.close(record.entry)
  }

  ////////////////
  // ## Escape
  ////////////////

  /** Arrange for Escape (or a close request) to dismiss `record` while it's the topmost Escape handler. */
  private watchEscape(record: OverlayRecord) {
    const Watcher = (globalThis as { CloseWatcher?: CloseWatcherConstructor }).CloseWatcher
    if (this.useCloseWatcher && this.browser.supports.closeWatcher && Watcher) {
      this.watchCloseRequests(record, Watcher)
    } else {
      record.unwatchEscape = this.keyboard.register({
        scope: record.scope,
        chord: UIT.Key.escape,
        handler: () => void this.dismiss(record, "escape"),
        inEditable: true
      })
    }
  }

  /**
   * Use a `CloseWatcher` for `record`.
   * - A watcher is spent once it fires:  if the entry vetoed the dismissal and is still open, arm a new one.
   */
  private watchCloseRequests(record: OverlayRecord, Watcher: CloseWatcherConstructor) {
    let watcher: CloseWatcherLike | undefined = new Watcher()
    watcher.addEventListener("close", () => {
      watcher = undefined
      void Promise.resolve(this.dismiss(record, "escape")).then(() => {
        if (this.stack.includes(record)) this.watchCloseRequests(record, Watcher)
      })
    })
    record.unwatchEscape = () => {
      watcher?.destroy()
      watcher = undefined
    }
  }

  /** Ask `record`'s entry to dismiss. */
  private dismiss(record: OverlayRecord, reason: DismissReason): void | Promise<void> {
    return record.entry.onDismiss(reason)
  }

  ////////////////
  // ## Outside clicks
  ////////////////

  /**
   * Is the press in progress on an invoker button of `element` (`commandfor` = its id)?
   * - For a blur that the press caused:  the button's `command` decides what happens, not the lost focus.  Safari
   *   doesn't focus a clicked button, so the blur there has no `relatedTarget` to tell.
   * - Only while an overlay is open (the listeners are installed then).
   */
  pressedInvokerOf(element: Element): boolean {
    return !!this.press && Overlays.invokes(this.press.path, element)
  }

  /** Install the document listeners, once. */
  private listen() {
    if (this.listeners) return
    this.listeners = new AbortController()
    const options = { capture: true, signal: this.listeners.signal }
    document.addEventListener("pointerdown", this.onPointerDown, options)
    document.addEventListener("click", this.onClick, options)
  }

  /** Remove the document listeners. */
  private unlisten() {
    this.listeners?.abort()
    this.listeners = undefined
    this.press = undefined
  }

  /** Remember where the press started. */
  private readonly onPointerDown = (event: PointerEvent) => {
    this.press = { path: event.composedPath(), x: event.clientX, y: event.clientY }
  }

  /** A click:  dismiss the topmost entry of each pool if the click both started and ended outside it. */
  private readonly onClick = (event: MouseEvent) => {
    const press = this.press
    this.press = undefined
    // keyboard-activated clicks (`detail === 0`) have no meaningful coordinates
    const click: PointerPress = {
      path: event.composedPath(),
      x: event.clientX,
      y: event.clientY,
      isKeyboard: !event.detail
    }
    for (const record of this.topmostPerPool()) {
      if (!record.closeOnOutsideClick) continue
      if (this.isInside(record, click) || (press && this.isInside(record, press))) continue
      void this.dismiss(record, "outside")
    }
  }

  /** Topmost record of each pool. */
  private topmostPerPool(): OverlayRecord[] {
    const seen = new Map<string, OverlayRecord>()
    for (const record of this.stack) seen.set(record.pool, record)
    return [...seen.values()]
  }

  /**
   * Did `press` land inside `record`'s element (or its anchor)?
   * - A press whose innermost target is a `<dialog>` inside the entry is on its padding OR its `::backdrop`;
   *   the pointer position against the dialog's box tells which.
   */
  private isInside(record: OverlayRecord, press: PointerPress): boolean {
    const { element, anchor } = record.entry
    if (anchor && press.path.includes(anchor)) return true
    // an invoker button (`commandfor`) is the element's own control:  its `command` event decides, not "outside"
    if (Overlays.invokes(press.path, element)) return true
    if (!press.path.includes(element)) return false
    const target = press.path[0]
    if (target instanceof HTMLDialogElement && !press.isKeyboard) {
      const box = target.getBoundingClientRect()
      return press.x >= box.left && press.x <= box.right && press.y >= box.top && press.y <= box.bottom
    }
    return true
  }

  ////////////////
  // ## Scroll lock / focus
  ////////////////

  /** Lock page scroll;  reference counted. */
  private lockScroll() {
    if (this.scrollLocks++ > 0) return
    const html = document.documentElement
    this.styles?.register("scroll-lock", SCROLL_LOCK_CSS, { page: true })
    html.style.setProperty(SCROLLBAR_WIDTH_PROPERTY, `${Math.max(0, window.innerWidth - html.clientWidth)}px`)
    html.classList.add(SCROLL_LOCK_CLASS)
  }

  /** Release one scroll lock;  the last one unlocks. */
  private unlockScroll() {
    if (this.scrollLocks === 0 || --this.scrollLocks > 0) return
    const html = document.documentElement
    html.classList.remove(SCROLL_LOCK_CLASS)
    html.style.removeProperty(SCROLLBAR_WIDTH_PROPERTY)
  }

  /** Refocus what had focus before `record` opened -- see class docs for when. */
  private restoreFocus(record: OverlayRecord) {
    const target = record.restoreTo
    if (!(target instanceof HTMLElement || target instanceof SVGElement) || !target.isConnected) return
    const active = this.focus.activeElementDeep()
    if (active && !this.focus.containsDeep(record.entry.element, active)) return
    target.focus({ preventScroll: true })
  }

  /** Record for `entry`, if open. */
  private recordOf(entry: OverlayEntry): OverlayRecord | undefined {
    return this.stack.find((record) => record.entry === entry)
  }

  ////////////////
  // ## Statics
  ////////////////

  /**
   * Does `path` hold an invoker button (`commandfor`) of `element`?
   * - STATIC:  pure over its arguments;  reads nothing of the instance.
   */
  private static invokes(path: readonly EventTarget[], element: Element): boolean {
    return !!element.id && path.some((node) => (node as Element).getAttribute?.(COMMANDFOR) === element.id)
  }
}

/** Constructor props for `Overlays`:  the services it coordinates. */
export type OverlaysProps = {
  /** Escape bindings and scopes */
  keyboard: Keyboard
  /** active element, containment */
  focus: Focus
  /** `supports.closeWatcher` */
  browser: Browser
  /** registers the scroll-lock page sheet;  optional so `Overlays` can be tested alone */
  styles?: Styles
}

/** An open entry with its defaults resolved. */
type OverlayRecord = {
  /** as passed to `open()` */
  entry: OverlayEntry
  /** resolved `entry.pool` */
  pool: string
  /** resolved `entry.closeOnEscape` */
  closeOnEscape: boolean
  /** resolved `entry.closeOnOutsideClick` */
  closeOnOutsideClick: boolean
  /** resolved `entry.modal` */
  modal: boolean
  /** its `Keyboard` scope id */
  scope: string
  /** deep active element when opened;  `undefined` with `restoreFocus: false` */
  restoreTo?: Element
  /** undoes `watchEscape()` */
  unwatchEscape?: () => void
}

/** Where a press or click happened. */
type PointerPress = {
  /** composed path of the event */
  path: EventTarget[]
  /** viewport x */
  x: number
  /** viewport y */
  y: number
  /** keyboard-activated (no real coordinates) */
  isKeyboard?: boolean
}

/** The toast kind, and the pool toasts default to, so a toast never steals a modal's outside click. */
const TOAST = "toast" satisfies OverlayKind

/** Pool of every entry that doesn't name one, toasts aside. */
const DEFAULT_POOL = "default"

/** Kinds that lock page scroll unless the entry says `modal: false` (a `sidebar` doesn't:  Fomantic's `scrollLock`). */
const MODAL_KINDS = new Set<OverlayKind>(["modal", "flyout", "dimmer"])

/** Custom property on `<html>` holding the scrollbar's width while scroll is locked, so the page can pad for it. */
const SCROLLBAR_WIDTH_PROPERTY = "--ui-scrollbar-width"

/**
 * Page sheet for scroll lock.
 * - In `ui.base` so an app can override it;  re-declares the layer order first, since it may be adopted
 *   before `layers.css`.
 */
const SCROLL_LOCK_CSS = `${LAYER_ORDER}
@layer ui.base {
  html.${SCROLL_LOCK_CLASS} {
    overflow: hidden;
    padding-inline-end: var(${SCROLLBAR_WIDTH_PROPERTY}, 0px);
  }
}`

/** Attribute naming the element an invoker button commands. */
const COMMANDFOR = "commandfor"
