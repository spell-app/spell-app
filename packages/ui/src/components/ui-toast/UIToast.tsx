import { Show, createEffect, createMemo, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { toastVocabulary } from "./ui-toast.vocabulary.en"
import { ToastFallback } from "./ui-toast.fallback"
import { UIToastHost } from "./UIToastHost"
import {
  ACTIONS,
  ATTACHED,
  COMPACT,
  ERROR,
  FLOATING,
  FOCUS_WITHIN,
  INVERTED,
  TOAST_BOX,
  UI_WORD,
  UNCLICKABLE,
  type Vocabulary
} from "./ui-toast.types"

import toastCSS from "./ui-toast.css?inline"

/****************
 * ### `<ui-toast>`
 * A toast:  `<div class="floating toast-box" part="box">` around `<div class="ui ... toast" part="toast">` (icon,
 * content block, close icon, actions), with an optional progress bar above or below and `attached` actions.
 * - Where it shows:  where it is.  `UI.toast({...})` (`ToastStack`) puts the ones it builds in a container per
 *   position, a popover in the top layer;  a `<ui-toast>` written in the page is an ordinary block.
 * - Life:  once connected it animates in (Fomantic's `scale`), fires `ui-show` and starts counting down
 *   `display-time` (absent / `0`:  it stays).  Closing -- the countdown, the close icon, a click, Escape inside it,
 *   an action, `host.close()` -- fires the cancelable `ui-close` (with a `reason`), animates out, sets `hidden` on
 *   the HOST and fires `ui-hide`.  It never removes itself:  whoever inserted it owns the node.
 * - Countdown pauses while the pointer is moving over it (`pause-on-hover`, default on) and ALWAYS while focus is
 *   inside (WCAG 2.2.1), with `:state(paused)`;  the progress bar pauses with it.
 * - Accessibility:  the toast is `role=status` (polite), `alert` for `type="error"`;  it never takes focus.  The
 *   close icon is a real `<button>`;  Escape closes it while focus is inside (no page-wide Escape:  kind `toast`
 *   in `UI.overlays`, which also lets `UI.overlays.closeAll("toast")` close every one).  Motion follows
 *   `UI.transitions` (reduced motion:  none);  the progress bar is `data-ui-motion="essential"`:  it IS the
 *   remaining time.
 * - Invoker commands (`<button commandfor="id" command="--close">`):  `--close` closes it, reason `close`, as its
 *   close icon does.  Nothing shows it again (a closed toast stays closed, `hidden`:  the app inserts a new one), so
 *   `--show` and `--toggle` are not answered.
 * - Actions:  a slotted button closes the toast unless its click was `preventDefault()`ed;  approve / deny ones
 *   (`MODAL_ACTION_SELECTORS`) fire the cancelable `ui-approve` / `ui-deny` first.
 ****************/
export class UIToast extends E.UIElement<Vocabulary> {
  @E.proto static vocabulary = toastVocabulary
  @E.proto static styles = { toast: toastCSS }
  @E.proto static Fallback = ToastFallback
  @E.proto static Host = UIToastHost
  // nothing to delegate to:  a click on the text must not jump to an action button
  @E.proto static delegatesFocus = false

  ////////////////
  // ## State
  ////////////////

  /** Light-DOM slot occupancy:  slotted actions. */
  readonly slots = new E.SlotContent(this.host)

  /** Countdown paused:  pointer over it or focus inside. */
  readonly isPaused = new E.Cell(false)

  /** The countdown has started:  the progress bar runs. */
  readonly isCounting = new E.Cell(false)

  /**
   * `isClosing`, tracked:  drives `:state(closing)`.
   * - Handlers read `isClosing`:  a read right after a write still sees a cell's old value.
   */
  readonly isClosingTracked = new E.Cell(false)

  /** Glyph of the icon:  the `icon` name, or the type's own for a bare `icon`. */
  readonly glyph = new E.IconGlyph({ owner: this, name: () => this.iconName() })

  /** Glyph of the close icon. */
  readonly closeGlyph = new E.IconGlyph({ owner: this, name: () => (this.attrs.closable ? UIT.CLOSE_ICON : undefined) })

  /** Has slotted actions? */
  readonly hasActions = createMemo(() => this.slots.has(this.slot(ACTIONS)))

  /** Layout words of the `actions` attribute, only the ones its vocabulary allows. */
  readonly actionWords = createMemo((): ReadonlySet<string> => {
    const allowed = E.ValueSets.get(this.definition.attribute(ACTIONS).spec.values ?? [])
    const words = (this.attrs.actions ?? "").split(UIT.WHITESPACE).filter((word) => allowed.includes(word))
    return new Set(words)
  })

  /** Actions joined to the toast's edge (`attached`). */
  readonly isAttached = createMemo(() => this.hasActions() && this.actionWords().has(ATTACHED))

  /** Actions in a column beside the content (`vertical`). */
  readonly isVertical = createMemo(() => this.hasActions() && this.actionWords().has(UIT.VERTICAL))

  /** Milliseconds it stays;  `0` for "until closed". */
  readonly displayTime = createMemo(() => {
    const value = this.attrs.displayTime
    if (value === UIT.AUTO) return this.readingTime()
    const time = Number(value)
    return Number.isFinite(time) && time > 0 ? time : 0
  })

  /** A click anywhere closes it:  `close-on-click`, no close icon, no actions (Fomantic's rule). */
  readonly canClickClose = createMemo(() => !!this.attrs.closeOnClick && !this.attrs.closable && !this.hasActions())

  /** The box. */
  private box?: HTMLDivElement

  /** Pending countdown. */
  private timer?: ReturnType<typeof setTimeout>

  /** ms left on the countdown. */
  private remaining = 0

  /** When the running countdown (re)started, `performance.now()`. */
  private startedAt = 0

  /** Has appeared once:  `ui-show` fired, the countdown started. */
  private hasShown = false

  /** Closing (or closed):  no further closes, no restarts.  `isClosingTracked` follows it. */
  private isClosing = false

  /** The pointer entered it (maybe without moving). */
  private hasPointerEntered = false

  /** The pointer is over it and has really moved:  the countdown pauses. */
  private isHovered = false

  /** Focus is inside it. */
  private isFocused = false

  /** This element's `UI.overlays` entry:  no Escape, no outside clicks, no focus restore (kind `toast`). */
  private readonly overlay: E.OverlayEntry = {
    element: this.host,
    kind: "toast",
    restoreFocus: false,
    onDismiss: (reason) => void this.close(reason === "close-all" ? "close-all" : "dismiss")
  }

  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
    super(...args)
    const { host } = this
    const listeners = new AbortController()
    const options = { signal: listeners.signal }
    host.addEventListener("pointerenter", this.onPointerEnter, options)
    host.addEventListener("pointermove", this.onPointerMove, options)
    host.addEventListener("pointerleave", this.onPointerLeave, options)
    host.addEventListener("focusin", this.onFocusIn, options)
    host.addEventListener("focusout", this.onFocusOut, options)
    host.addEventListener("command", this.onCommand, options)
    host.addReleaseCallback(() => {
      listeners.abort()
      clearTimeout(this.timer)
    })
  }

  ////////////////
  // ## Element hooks
  ////////////////

  /** Layout words after the noun, as Fomantic's JS added them:  `vertical`, `actions`, `attached top`, `compact`. */
  protected extraClasses(): string | undefined {
    const words: string[] = []
    const actions = this.actionWords()
    if (this.isVertical()) words.push(UIT.VERTICAL)
    if (this.hasActions() && !this.isAttached() && (!actions.has(UIT.BASIC) || actions.has(UIT.LEFT))) {
      words.push(ACTIONS)
    }
    if (this.isAttached()) {
      words.push(ATTACHED)
      if (this.isVertical()) {
        if (actions.has(UIT.LEFT)) words.push(UIT.LEFT)
      } else words.push(actions.has(UIT.TOP) ? UIT.BOTTOM : UIT.TOP)
    }
    if (this.attrs.compact) words.push(COMPACT)
    return words.join(" ") || undefined
  }

  protected hostStates() {
    return { paused: this.isPaused.get(), closing: this.isClosingTracked.get() }
  }

  ////////////////
  // ## Rendering
  ////////////////

  /**
   * Adds the effect that makes it appear while connected (`appear()` / `disappear()`), then the content.
   * - It waits for the runtime (`isLoaded`) too, as the render does:  appearing animates the rendered box.
   */
  mount(): JSX.Element {
    createEffect(
      () => this.isConnected.get() && this.isLoaded(),
      (isShowing) => {
        if (!isShowing) return
        this.appear()
        return () => this.disappear()
      }
    )
    return super.mount()
  }

  render(): JSX.Element {
    return (
      <div
        ref={(element) => (this.box = element)}
        class={this.boxClasses()}
        part={this.part("box")}
        onClick={this.onClick}
        onKeyDown={this.onKeyDown}
      >
        <Show when={this.attrs.progress === UIT.TOP}>{this.progressBar()}</Show>
        <Show when={this.isAttached() && !this.isVertical() && this.actionWords().has(UIT.TOP)}>
          {this.actionsBox()}
        </Show>
        <Show when={this.isAttached() && this.isVertical()} fallback={this.toast()}>
          <div class={this.verticalClasses()}>
            <Show when={this.actionWords().has(UIT.LEFT)}>{this.actionsBox()}</Show>
            {this.toast()}
            <Show when={!this.actionWords().has(UIT.LEFT)}>{this.actionsBox()}</Show>
          </div>
        </Show>
        <Show when={this.isAttached() && !this.isVertical() && !this.actionWords().has(UIT.TOP)}>
          {this.actionsBox()}
        </Show>
        <Show when={this.attrs.progress === UIT.BOTTOM}>{this.progressBar()}</Show>
      </div>
    )
  }

  /** The toast itself:  icon, content (header, message, slot), close icon, inline actions. */
  private toast(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("toast")} role={this.attrs.type === ERROR ? UIT.ALERT : UIT.STATUS}>
        <Show when={this.iconName() !== undefined}>
          <span class={ICON_BOX_CLASS} part={this.part("icon")}>
            {this.glyph.svg()}
          </span>
        </Show>
        <div class={UIT.CONTENT} part={this.part("content")}>
          <Show when={this.attrs.header}>
            <div class={UIT.HEADER} part={this.part("header")}>
              {this.attrs.header}
            </div>
          </Show>
          <Show when={this.attrs.message}>
            <div class={UIT.MESSAGE} part={this.part("message")}>
              {this.attrs.message}
            </div>
          </Show>
          <slot />
        </div>
        <Show when={this.attrs.closable}>
          <button
            type="button"
            class={UIT.CLOSE_CLASS}
            part={this.part("close")}
            aria-label={this.text("close")}
            onClick={this.onCloseIcon}
          >
            {this.closeGlyph.svg()}
          </button>
        </Show>
        <Show when={this.hasActions() && !this.isAttached()}>{this.actionsBox()}</Show>
      </div>
    )
  }

  /** The box around the `actions` slot;  rendered in ONE place at a time (a slot name must be unique). */
  private actionsBox(): JSX.Element {
    return (
      <div class={this.actionsClasses()} part={this.part("actions")}>
        <slot name={this.slot(ACTIONS)} />
      </div>
    )
  }

  /** The progress track and bar;  the bar runs once the countdown has started. */
  private progressBar(): JSX.Element {
    return (
      <Show when={this.displayTime() > 0}>
        <div class={this.progressClasses()} part={this.part("progress")}>
          <div
            class={this.barClasses()}
            part={this.part("bar")}
            data-ui-motion={ESSENTIAL}
            style={{ "animation-duration": `${this.displayTime()}ms` }}
          />
        </div>
      </Show>
    )
  }

  /** Classes of the box. */
  private boxClasses(): string {
    const words = [FLOATING, TOAST_BOX]
    if (this.attrs.compact) words.push(COMPACT)
    if (!this.canClickClose()) words.push(UNCLICKABLE)
    return words.join(" ")
  }

  /** Classes of the wrapper of `vertical attached` actions. */
  private verticalClasses(): string {
    return [UIT.VERTICAL, ATTACHED, ...(this.attrs.compact ? [COMPACT] : [])].join(" ")
  }

  /** Classes of the actions box:  its layout words, and `ui buttons` when attached (Fomantic's). */
  private actionsClasses(): string {
    const words = [...this.actionWords()]
    return (this.isAttached() ? [UI_BUTTONS, ...words, ACTIONS] : [...words, ACTIONS]).join(" ")
  }

  /** Classes of the progress track:  its edge and the toast's colour words. */
  private progressClasses(): string {
    const words = [UI_WORD, ATTACHED, UIT.ACTIVE, PROGRESS, this.attrs.progress ?? UIT.BOTTOM]
    if (this.attrs.type) words.push(this.attrs.type)
    if (this.attrs.color) words.push(this.attrs.color)
    if (this.attrs.inverted) words.push(INVERTED)
    return words.join(" ")
  }

  /** Classes of the bar:  its direction, and `progressing` once the countdown runs. */
  private barClasses(): string {
    const words = [UIT.BAR, this.attrs.progressUp ? UP : DOWN]
    if (this.isCounting.get()) words.push(PROGRESSING)
    return words.join(" ")
  }

  ////////////////
  // ## Appearing
  ////////////////

  /** Connected:  join `UI.overlays`;  the first time, animate in, start counting, `ui-show`. */
  private appear() {
    if (this.isClosing) return
    UI.overlays.open(this.overlay)
    if (this.hasShown) return this.resumeTimer()
    this.hasShown = true
    this.startTimer()
    const box = this.box
    const entered = box
      ? UI.transitions.animate({ element: box, name: SCALE, direction: UIT.IN })
      : Promise.resolve(true)
    void entered.then(() => {
      const detail: UIT.ToastShowDetail = { displayTime: untrack(this.displayTime) }
      if (!this.isClosing) this.emit("ui-show", detail)
    })
  }

  /** Disconnected:  leave `UI.overlays`, hold the countdown. */
  private disappear() {
    UI.overlays.close(this.overlay)
    this.pauseTimer()
  }

  ////////////////
  // ## Closing
  ////////////////

  /**
   * Close for `reason`:  the cancelable `ui-close`, then the exit animation, `hidden` on the host and `ui-hide`.
   * - True when it closes;  false when vetoed or already closing.
   */
  close(reason: UIT.ToastCloseReason = "dismiss", originalEvent?: Event): boolean {
    if (this.isClosing) return false
    const detail: UIT.ToastCloseDetail = { reason, originalEvent }
    if (!this.emit("ui-close", detail)) return false
    this.isClosing = true
    this.isClosingTracked.set(true)
    this.stopTimer()
    UI.overlays.close(this.overlay)
    const box = this.box
    const exited = box
      ? UI.transitions.animate({ element: box, name: SCALE, direction: UIT.OUT })
      : Promise.resolve(true)
    void exited.then(() => {
      this.host.hidden = true
      const hidden: UIT.ToastCloseDetail = { reason }
      this.emit("ui-hide", hidden)
    })
    return true
  }

  ////////////////
  // ## Countdown
  ////////////////

  /** Start counting `displayTime` down (nothing for `0`). */
  private startTimer() {
    const time = untrack(this.displayTime)
    if (time <= 0) return
    this.remaining = time
    this.isCounting.set(true)
    if (!this.isHovered && !this.isFocused) this.resumeTimer()
  }

  /** Run the countdown from where it stopped. */
  private resumeTimer() {
    if (this.timer || this.isClosing || this.remaining <= 0 || !this.host.isConnected) return
    this.startedAt = performance.now()
    this.timer = setTimeout(() => {
      this.timer = undefined
      this.remaining = 0
      this.close("timeout")
    }, this.remaining)
  }

  /** Hold the countdown, keeping what's left. */
  private pauseTimer() {
    if (!this.timer) return
    clearTimeout(this.timer)
    this.timer = undefined
    this.remaining = Math.max(0, this.remaining - (performance.now() - this.startedAt))
  }

  /** Stop counting for good. */
  private stopTimer() {
    clearTimeout(this.timer)
    this.timer = undefined
    this.remaining = 0
  }

  /** Pause or resume after the pointer / focus moved. */
  private updatePause() {
    const isPaused = this.isHovered || this.isFocused
    this.isPaused.set(isPaused)
    if (isPaused) this.pauseTimer()
    else this.resumeTimer()
  }

  /**
   * `display-time="auto"`:  reading time of its message at `WORDS_PER_MINUTE`, at least `MIN_DISPLAY_TIME`.
   * - The message:  `header`, `message` and the default slot's content, never the slotted actions' labels.
   */
  private readingTime(): number {
    const actions = this.slot(ACTIONS)
    const body = [...this.host.childNodes].filter((node) =>
      node.nodeType === E.NodeType.element ? (node as Element).slot !== actions : node.nodeType === E.NodeType.text
    )
    const text = [this.attrs.header, this.attrs.message, ...body.map((node) => node.textContent)].join(" ")
    const words = text.split(UIT.WHITESPACE).filter(Boolean).length
    return Math.max(MIN_DISPLAY_TIME, (words / WORDS_PER_MINUTE) * 60_000)
  }

  /** Icon name:  `icon`, or the type's own for a bare `icon`;  `undefined` for none. */
  private iconName(): string | undefined {
    const icon = this.attrs.icon
    if (icon === undefined || icon === null) return undefined
    return icon || TYPE_ICONS[this.attrs.type ?? NEUTRAL]
  }

  ////////////////
  // ## Handlers
  ////////////////

  /**
   * Pointer entered it:  only noted.  A toast appearing under a RESTING pointer gets a `pointerenter` (the browser's
   * synthetic move) with no real move;  pausing on that alone could hold it forever, so `onPointerMove` pauses.
   */
  private readonly onPointerEnter = () => {
    this.hasPointerEntered = true
  }

  /** A real pointer move over it (`movementX/Y` nonzero:  synthetic ones have none):  pause (with `pause-on-hover`). */
  private readonly onPointerMove = (event: PointerEvent) => {
    if (!this.hasPointerEntered || this.isHovered || (!event.movementX && !event.movementY)) return
    if (!untrack(() => this.attrs.pauseOnHover)) return
    this.isHovered = true
    this.updatePause()
  }

  /** Pointer off it:  resume. */
  private readonly onPointerLeave = () => {
    this.hasPointerEntered = false
    this.isHovered = false
    this.updatePause()
  }

  /** Focus came in:  pause. */
  private readonly onFocusIn = () => {
    this.isFocused = true
    this.updatePause()
  }

  /** Focus moved:  resume once it has really left (a move inside refocuses before the microtask). */
  private readonly onFocusOut = () => {
    queueMicrotask(() => {
      this.isFocused = this.host.matches(FOCUS_WITHIN)
      this.updatePause()
    })
  }

  /** An invoker command aimed at the host:  only `TOGGLE_COMMANDS.close`. */
  private readonly onCommand = (event: Event) => {
    if ((event as Event & { command?: string }).command === UIT.TOGGLE_COMMANDS.close) this.close("close", event)
  }

  /** Close icon. */
  private readonly onCloseIcon = (event: MouseEvent) => {
    event.stopPropagation()
    this.close("close", event)
  }

  /** Escape with focus inside:  close (unless something earlier handled it, e.g. a modal). */
  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== UIT.Key.escape || event.defaultPrevented) return
    if (this.close("escape", event)) event.preventDefault()
  }

  /**
   * A click inside:  an action closes (approve / deny ask first);  elsewhere a click closes a `close-on-click`
   * toast unless it landed on something interactive or the toast holds form controls.
   */
  private readonly onClick = (event: MouseEvent) => {
    if (this.isClosing) return
    const found = this.actionFor(event)
    if (found) {
      if (event.defaultPrevented) return
      const [kind, action] = found
      if (kind !== "action") {
        const detail: UIT.ToastActionDetail = { action, originalEvent: event }
        if (!this.emit(kind === "approve" ? "ui-approve" : "ui-deny", detail)) return
      }
      this.close(kind, event)
      return
    }
    if (!untrack(this.canClickClose) || this.host.querySelector(FORM_CONTROLS) || this.isOnClickable(event)) return
    this.close("click", event)
  }

  ////////////////
  // ## Reading the light DOM
  ////////////////

  /**
   * The action `event` activated:  walking the composed path up to the host, the innermost light-DOM element that
   * approves / denies (`MODAL_ACTION_SELECTORS`) or is a button -- counted only inside a child slotted as `actions`.
   */
  private actionFor(event: Event): [ToastAction, Element] | undefined {
    const scope = this.host.getRootNode()
    const slotName = this.slot(ACTIONS)
    let found: [ToastAction, Element] | undefined
    for (const target of event.composedPath()) {
      if (target === this.host) return undefined
      if (!(target instanceof Element) || target.getRootNode() !== scope) continue
      if (!found) {
        if (target.matches(UIT.MODAL_ACTION_SELECTORS.approve)) found = ["approve", target]
        else if (target.matches(UIT.MODAL_ACTION_SELECTORS.deny)) found = ["deny", target]
        else if (UIToast.isButton(target)) found = ["action", target]
      }
      if (target.parentElement === this.host) return target.slot === slotName ? found : undefined
    }
    return undefined
  }

  /** Did `event` land on something interactive inside the toast (`CLICKABLE`)? */
  private isOnClickable(event: Event): boolean {
    for (const target of event.composedPath()) {
      if (target === this.host) return false
      if (target instanceof Element && target.matches(CLICKABLE)) return true
    }
    return false
  }

  /**
   * A native button / link, or an element whose definition's noun is `button` (`<ui-button>`, translated too).
   * - Static:  it reads only the element and the page-wide `UIElement.definitions`.
   */
  private static isButton(element: Element): boolean {
    return element.matches(BUTTONS) || E.UIElement.definitions.get(element.localName)?.vocabulary.noun === UIT.BUTTON
  }
}

/** What an activated action does:  approve, deny, or just close (any other button). */
type ToastAction = Extract<UIT.ToastCloseReason, "approve" | "deny" | "action">

/** Icons of a bare `icon`, by type (Fomantic's `icons` setting, in Font Awesome names). */
const TYPE_ICONS: Readonly<Record<string, string>> = {
  info: "circle-info",
  success: "circle-check",
  warning: "triangle-exclamation",
  error: "circle-xmark"
}

/** `type` of a toast without one:  its icon is none of `TYPE_ICONS`. */
const NEUTRAL = "neutral"

/** `display-time="auto"`:  reading speed (Fomantic's `wordsPerMinute`). */
const WORDS_PER_MINUTE = 120

/** `display-time="auto"`:  the floor, in ms (Fomantic's `minDisplayTime`). */
const MIN_DISPLAY_TIME = 1000

/** `UI.transitions` animation in and out (Fomantic's `showMethod` / `hideMethod`). */
const SCALE = "scale"

/** Class words of the icon box (`ui-toast.css`). */
const ICON_BOX_CLASS = "centered icon"

/** Class words of `attached` actions:  a button group (Fomantic's). */
const UI_BUTTONS = "ui buttons"

/** Class word of the progress track. */
const PROGRESS = "progress"

/** Class word of a bar that fills up (`progress-up`). */
const UP = "up"

/** Class word of a bar that empties. */
const DOWN = "down"

/** Class word of a running bar. */
const PROGRESSING = "progressing"

/** `data-ui-motion` value that keeps the bar running under reduced motion (`reset.css`). */
const ESSENTIAL = "essential"

/** Buttons an action click can come from, besides `<ui-button>`s. */
const BUTTONS = "button, a[href], [role=button], input[type=button], input[type=submit]"

/** A click on one of these doesn't close a `close-on-click` toast (Fomantic's `selector.clickable`). */
const CLICKABLE = "a, button, details, summary, label, input, select, textarea, [role=button], [tabindex]"

/** Form controls that turn `close-on-click` off (Fomantic's `selector.input`). */
const FORM_CONTROLS = "input:not([type=hidden]), textarea, select, button"
