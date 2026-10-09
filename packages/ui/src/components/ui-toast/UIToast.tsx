import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { toastVocabulary } from "./UIToast.en"
import { ACTIONS, ATTACHED, INVERTED, UI_WORD, VERTICAL, type Vocabulary } from "./UIToast.types"

import toastCSS from "./UIToast.css?inline"

/****************
 * ### `DOMToastElement`
 * The DOM element of `<ui-toast>`:  it adds `close()`, the toast's script API, which its component does.
 *
 * - NOTE: `DOMElement` checks its members against the attributes' property names;  `close` isn't one.
 * - Above the component:  its `elementSetup` reads this class while the component is defined.
 ****************/
export class DOMToastElement extends E.DOMElement {
  /** Close it now, reason `dismiss` (the cancelable `ui-close` first);  true when it closes. */
  close(): boolean {
    return this.toast?.close() ?? false
  }

  /** Its component. */
  private get toast(): UIToast | undefined {
    return this.component as UIToast | undefined
  }
}

/****************
 * ### `UIToast`
 * The component behind `<ui-toast>`:  a toast, a short message that shows for a while,
 * `<div class="floating toast-box" part="box">` around `<div class="ui … toast" part="toast">`
 * (icon, content block, close icon, actions), with an optional progress bar above or below and `attached` actions.
 *
 * - Where it shows:  where it is.
 *   `UI.toast({…})` (`ToastStack`) puts the ones it builds in a container per position, a popover in the top layer;
 *   a `<ui-toast>` written in the page is an ordinary block.
 *
 * - Its life:  once connected it animates in (Fomantic's `scale`), fires `ui-show`,
 *   and starts counting down `display-time` (absent or `0`:  it stays).
 *   - Closing (the countdown, the close icon, a click, Escape inside it, an action, `domElement.close()`)
 *     fires the cancelable `ui-close` (with a `reason`), animates out,
 *     sets `hidden` on the DOM element and fires `ui-hide`.
 *   - It never removes itself:  whoever inserted it owns the node.
 *
 * - The countdown pauses while the pointer moves over it (`pause-on-hover`, on by default)
 *   and ALWAYS while focus is inside (WCAG 2.2.1), with `:state(paused)`;  the progress bar pauses with it.
 *
 * - Accessibility:  the toast is `role=status` (polite), `alert` for `type="error"`;  it never takes focus.
 *   - The close icon is a real `<button>`.
 *   - Escape closes it while focus is inside:  no page-wide Escape (kind `toast` in `UI.overlays`,
 *     which also lets `UI.overlays.closeAll("toast")` close every one).
 *   - Motion follows `UI.transitions` (reduced motion:  none);
 *     the progress bar is `data-ui-motion="essential"`:  it IS the time left.
 *
 * - Invoker commands (`<button commandfor="id" command="--close">`):  `--close` closes it, reason `close`,
 *   as its close icon does.  Nothing shows it again (a closed toast stays closed, `hidden`:  the app inserts a new
 *   one), so `--show` and `--toggle` are not answered.
 *
 * - Actions:  a slotted button closes the toast unless its click was `preventDefault()`ed;
 *   approve / deny ones (`UIT.ModalActionSelectors`) fire the cancelable `ui-approve` / `ui-deny` first.
 ****************/
export class UIToast extends E.UIComponent<Vocabulary> {
  @E.proto static vocabulary = toastVocabulary
  @E.proto static styleSheets = { toast: toastCSS }
  @E.proto static elementSetup = {
    DOMElement: DOMToastElement,
    // nothing to delegate to:  a click on the text must not jump to an action button
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  constructor(...args: ConstructorParameters<typeof E.UIComponent>) {
    super(...args)
    this.on("pointerenter", this.onPointerEnter)
    this.on("pointermove", this.onPointerMove)
    this.on("pointerleave", this.onPointerLeave)
    this.on("focusin", this.onFocusIn)
    this.on("focusout", this.onFocusOut)
    this.on("command", this.onCommand)
    this.domElement.addReleaseCallback(() => clearTimeout(this.countdownTimer))
  }

  ////////////////
  // ## Actions
  ////////////////

  /** Light-DOM slot occupancy:  slotted actions. */
  readonly slots = new E.SlotContent(this.domElement)

  /** Has slotted actions? */
  get hasActions(): boolean {
    return this.slots.hasContent(this.slotForName(ACTIONS))
  }

  /** Layout words of the `actions` attribute, only the ones its vocabulary allows. */
  @E.derived
  get actionWords(): ReadonlySet<string> {
    const allowed = E.ValueSets.get(this.elementDefinition.attribute(ACTIONS).spec.values ?? [])
    const words = (this.actions ?? "").split(UIT.WHITESPACE).filter((word) => allowed.includes(word))
    return new Set(words)
  }

  /** Actions joined to the toast's edge (`attached`). */
  get actionsAreAttached(): boolean {
    return this.hasActions && this.actionWords.has(ATTACHED)
  }

  /** Actions in a column beside the content (`vertical`). */
  get actionsAreVertical(): boolean {
    return this.hasActions && this.actionWords.has(VERTICAL)
  }

  ////////////////
  // ## Classes
  ////////////////

  /** Layout words after the noun, as Fomantic's JS added them:  `vertical`, `actions`, `attached top`, `compact`. */
  protected get extraClass(): string | undefined {
    const words: string[] = []
    const actions = this.actionWords
    if (this.actionsAreVertical) words.push(VERTICAL)
    if (this.hasActions && !this.actionsAreAttached && (!actions.has(UIT.BASIC) || actions.has(UIT.LEFT))) {
      words.push(ACTIONS)
    }
    if (this.actionsAreAttached) {
      words.push(ATTACHED)
      if (this.actionsAreVertical) {
        if (actions.has(UIT.LEFT)) words.push(UIT.LEFT)
      } else words.push(actions.has(UIT.TOP) ? UIT.BOTTOM : UIT.TOP)
    }
    if (this.compact) words.push(COMPACT)
    return words.join(" ") || undefined
  }

  /** Classes of the box. */
  @E.derived
  private get boxClasses(): string {
    const words = [FLOATING, TOAST_BOX]
    if (this.compact) words.push(COMPACT)
    if (!this.anyClickCloses) words.push(UNCLICKABLE)
    return words.join(" ")
  }

  /** Classes of the wrapper of `vertical attached` actions. */
  @E.derived
  private get verticalClasses(): string {
    return [VERTICAL, ATTACHED, ...(this.compact ? [COMPACT] : [])].join(" ")
  }

  /** Classes of the actions box:  its layout words, and `ui buttons` when attached (Fomantic's). */
  @E.derived
  private get actionsClasses(): string {
    const words = [...this.actionWords]
    return (this.actionsAreAttached ? [UI_BUTTONS, ...words, ACTIONS] : [...words, ACTIONS]).join(" ")
  }

  /** Classes of the progress track:  its edge and the toast's colour words. */
  @E.derived
  private get progressClasses(): string {
    const words = [UI_WORD, ATTACHED, UIT.ACTIVE, PROGRESS, this.progress ?? UIT.BOTTOM]
    if (this.type) words.push(this.type)
    if (this.color) words.push(this.color)
    if (this.inverted) words.push(INVERTED)
    return words.join(" ")
  }

  /** Classes of the bar:  its direction, and `progressing` once the countdown runs. */
  @E.derived
  private get barClasses(): string {
    const words = [UIT.BAR, this.progressUp ? UP : DOWN]
    if (this.countdownHasStarted) words.push(PROGRESSING)
    return words.join(" ")
  }

  ////////////////
  // ## Icons
  ////////////////

  /** Glyph of the icon:  the `icon` name, or the type's own for a bare `icon`. */
  readonly iconGlyph = new E.IconGlyph({ owner: this, name: () => this.iconName })

  /** Glyph of the close icon. */
  readonly closeGlyph = new E.IconGlyph({ owner: this, name: () => (this.closable ? UIT.CLOSE_ICON : undefined) })

  /** Icon name:  `icon`, or the type's own for a bare `icon`;  `undefined` for none. */
  private get iconName(): string | undefined {
    const icon = this.icon
    if (icon === undefined || icon === null) return undefined
    return icon || TYPE_ICONS[this.type ?? NEUTRAL]
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** The box. */
  private box?: HTMLDivElement

  render(): JSX.Element {
    return (
      <div
        ref={(element) => (this.box = element)}
        class={this.boxClasses}
        part={this.partForName("box")}
        onClick={this.onClick}
        onKeyDown={this.onKeyDown}
      >
        <Show when={this.progress === UIT.TOP}>{this.progressBar()}</Show>
        <Show when={this.actionsAreAttached && !this.actionsAreVertical && this.actionWords.has(UIT.TOP)}>
          {this.actionsBox()}
        </Show>
        <Show when={this.actionsAreAttached && this.actionsAreVertical} fallback={this.toast()}>
          <div class={this.verticalClasses}>
            <Show when={this.actionWords.has(UIT.LEFT)}>{this.actionsBox()}</Show>
            {this.toast()}
            <Show when={!this.actionWords.has(UIT.LEFT)}>{this.actionsBox()}</Show>
          </div>
        </Show>
        <Show when={this.actionsAreAttached && !this.actionsAreVertical && !this.actionWords.has(UIT.TOP)}>
          {this.actionsBox()}
        </Show>
        <Show when={this.progress === UIT.BOTTOM}>{this.progressBar()}</Show>
      </div>
    )
  }

  /** The toast itself:  icon, content (header, message, slot), close icon, inline actions. */
  private toast(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("toast")} role={this.type === ERROR ? "alert" : "status"}>
        <Show when={this.iconName !== undefined}>
          <span class={ICON_BOX_CLASS} part={this.partForName("icon")}>
            {this.iconGlyph.svg}
          </span>
        </Show>
        <div class={UIT.CONTENT} part={this.partForName("content")}>
          <Show when={this.header}>
            <div class={UIT.HEADER} part={this.partForName("header")}>
              {this.header}
            </div>
          </Show>
          <Show when={this.message}>
            <div class={UIT.MESSAGE} part={this.partForName("message")}>
              {this.message}
            </div>
          </Show>
          <slot />
        </div>
        <Show when={this.closable}>
          <button
            type="button"
            class={UIT.CLOSE_CLASS}
            part={this.partForName("close")}
            aria-label={this.translationForKey("close")}
            onClick={this.onCloseIcon}
          >
            {this.closeGlyph.svg}
          </button>
        </Show>
        <Show when={this.hasActions && !this.actionsAreAttached}>{this.actionsBox()}</Show>
      </div>
    )
  }

  /** The box around the `actions` slot;  rendered in ONE place at a time (a slot name must be unique). */
  private actionsBox(): JSX.Element {
    return (
      <div class={this.actionsClasses} part={this.partForName("actions")}>
        <slot name={this.slotForName(ACTIONS)} />
      </div>
    )
  }

  /** The progress track and bar;  the bar runs once the countdown has started. */
  private progressBar(): JSX.Element {
    return (
      <Show when={this.displayDuration > 0}>
        <div class={this.progressClasses} part={this.partForName("progress")}>
          <div
            class={this.barClasses}
            part={this.partForName("bar")}
            data-ui-motion={ESSENTIAL}
            style={{ "animation-duration": `${this.displayDuration}ms` }}
          />
        </div>
      </Show>
    )
  }

  ////////////////
  // ## Appearing
  ////////////////

  /** Has appeared once:  `ui-show` fired, the countdown started. */
  private hasShown = false

  /** This element's `UI.overlays` entry:  no Escape, no outside clicks, no focus restore (kind `toast`). */
  private readonly overlay: E.OverlayEntry = {
    element: this.domElement,
    kind: "toast",
    restoreFocus: false,
    onDismiss: (reason) => void this.close(reason === "close-all" ? "close-all" : "dismiss")
  }

  /**
   * Connected and ready:  appear;  the cleanup disappears.
   * - It waits for the runtime (`isReady`) too, as the render does:  appearing animates the rendered box.
   */
  @E.onChange("isConnected", "isReady")
  protected onConnectedChanged(isConnected: boolean, isReady: boolean) {
    if (!isConnected || !isReady) return
    this.appear()
    return () => this.disappear()
  }

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
      const detail: UIT.ToastShowDetail = { displayTime: this.displayDuration }
      if (!this.isClosing) this.send("ui-show", detail)
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

  /** Closing (or closed):  no further closes, no restarts.  `:state(closing)`. */
  @E.cssState("closing")
  @E.state
  accessor isClosing = false

  /** A click anywhere closes it:  `close-on-click`, no close icon, no actions (Fomantic's rule). */
  get anyClickCloses(): boolean {
    return !!this.closeOnClick && !this.closable && !this.hasActions
  }

  /**
   * Close for `reason`:  the cancelable `ui-close`, then the exit animation, `hidden` on the DOM element and `ui-hide`.
   * - True when it closes;  false when vetoed or already closing.
   */
  close(reason: UIT.ToastCloseReason = "dismiss", originalEvent?: Event): boolean {
    if (this.isClosing) return false
    const detail: UIT.ToastCloseDetail = { reason, originalEvent }
    if (!this.send("ui-close", detail)) return false
    this.isClosing = true
    this.stopTimer()
    UI.overlays.close(this.overlay)
    const box = this.box
    const exited = box
      ? UI.transitions.animate({ element: box, name: SCALE, direction: UIT.OUT })
      : Promise.resolve(true)
    void exited.then(() => {
      this.domElement.hidden = true
      const hidden: UIT.ToastCloseDetail = { reason }
      this.send("ui-hide", hidden)
    })
    return true
  }

  ////////////////
  // ## Countdown
  ////////////////

  /**
   * Milliseconds it stays;  `0` for "until closed".
   * - `@derived`:  `auto` walks the light DOM and counts words.
   */
  @E.derived
  get displayDuration(): number {
    const value = this.displayTime
    if (value === "auto") return this.readingTime
    const time = Number(value)
    return Number.isFinite(time) && time > 0 ? time : 0
  }

  /**
   * `display-time="auto"`:  reading time of its message at `WORDS_PER_MINUTE`, at least `MIN_DISPLAY_TIME`.
   * - The message:  `header`, `message` and the default slot's content, never the slotted actions' labels.
   */
  private get readingTime(): number {
    const actions = this.slotForName(ACTIONS)
    const body = [...this.domElement.childNodes].filter((node) =>
      node.nodeType === E.NodeType.element ? (node as Element).slot !== actions : node.nodeType === E.NodeType.text
    )
    const text = [this.header, this.message, ...body.map((node) => node.textContent)].join(" ")
    const words = text.split(UIT.WHITESPACE).filter(Boolean).length
    return Math.max(MIN_DISPLAY_TIME, (words / WORDS_PER_MINUTE) * 60_000)
  }

  /** The countdown has started:  the progress bar runs.  Never cleared. */
  @E.state accessor countdownHasStarted = false

  /** Countdown paused:  pointer over it or focus inside.  `:state(paused)`. */
  @E.cssState("paused")
  @E.state
  accessor isPaused = false

  /** Pending countdown. */
  private countdownTimer?: ReturnType<typeof setTimeout>

  /** ms left on the countdown. */
  private timeLeft = 0

  /** When the running countdown (re)started, `performance.now()`. */
  private startedAt = 0

  /** Start counting `displayDuration` down (nothing for `0`). */
  private startTimer() {
    const time = this.displayDuration
    if (time <= 0) return
    this.timeLeft = time
    this.countdownHasStarted = true
    if (!this.isHovered && !this.focusIsInside) this.resumeTimer()
  }

  /** Run the countdown from where it stopped. */
  private resumeTimer() {
    if (this.countdownTimer || this.isClosing || this.timeLeft <= 0 || !this.domElement.isConnected) return
    this.startedAt = performance.now()
    this.countdownTimer = setTimeout(() => {
      this.countdownTimer = undefined
      this.timeLeft = 0
      this.close("timeout")
    }, this.timeLeft)
  }

  /** Hold the countdown, keeping what's left. */
  private pauseTimer() {
    if (!this.countdownTimer) return
    clearTimeout(this.countdownTimer)
    this.countdownTimer = undefined
    this.timeLeft = Math.max(0, this.timeLeft - (performance.now() - this.startedAt))
  }

  /** Stop counting for good. */
  private stopTimer() {
    clearTimeout(this.countdownTimer)
    this.countdownTimer = undefined
    this.timeLeft = 0
  }

  /** Pause or resume after the pointer / focus moved. */
  private updatePause() {
    this.isPaused = this.isHovered || this.focusIsInside
    if (this.isPaused) this.pauseTimer()
    else this.resumeTimer()
  }

  ////////////////
  // ## Pointer and focus
  ////////////////

  /** The pointer entered it (maybe without moving). */
  private hasPointerEntered = false

  /** The pointer is over it and has really moved:  the countdown pauses. */
  private isHovered = false

  /** Focus is inside it (the toast itself never has it). */
  private focusIsInside = false

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
    if (!this.pauseOnHover) return
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
    this.focusIsInside = true
    this.updatePause()
  }

  /** Focus moved:  resume once it has really left (a move inside refocuses before the microtask). */
  private readonly onFocusOut = () => {
    queueMicrotask(() => {
      this.focusIsInside = this.domElement.matches(":focus-within")
      this.updatePause()
    })
  }

  ////////////////
  // ## Commands, keys and clicks
  ////////////////

  /** An invoker command aimed at the DOM element:  only `ToggleCommands.close`. */
  private readonly onCommand = (event: Event) => {
    if ((event as Event & { command?: string }).command === UIT.ToggleCommands.close) this.close("close", event)
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
        if (!this.send(kind === "approve" ? "ui-approve" : "ui-deny", detail)) return
      }
      this.close(kind, event)
      return
    }
    if (!this.anyClickCloses || this.domElement.querySelector(FORM_CONTROLS) || this.landedOnClickable(event)) return
    this.close("click", event)
  }

  ////////////////
  // ## Reading the light DOM
  ////////////////

  /**
   * The action `event` activated:  walking the composed path up to the DOM element,
   * the innermost light-DOM element that approves / denies (`ModalActionSelectors`) or is a button --
   * counted only inside a child slotted as `actions`.
   */
  private actionFor(event: Event): [ToastAction, Element] | undefined {
    const scope = this.domElement.getRootNode()
    const slotName = this.slotForName(ACTIONS)
    let found: [ToastAction, Element] | undefined
    for (const target of event.composedPath()) {
      if (target === this.domElement) return undefined
      if (!(target instanceof Element) || target.getRootNode() !== scope) continue
      if (!found) {
        if (target.matches(UIT.ModalActionSelectors.approve)) found = ["approve", target]
        else if (target.matches(UIT.ModalActionSelectors.deny)) found = ["deny", target]
        else if (UIToast.isButton(target)) found = ["action", target]
      }
      if (target.parentElement === this.domElement) return target.slot === slotName ? found : undefined
    }
    return undefined
  }

  /** Did `event` land on something interactive inside the toast (`CLICKABLE`)? */
  private landedOnClickable(event: Event): boolean {
    for (const target of event.composedPath()) {
      if (target === this.domElement) return false
      if (target instanceof Element && target.matches(CLICKABLE)) return true
    }
    return false
  }

  /**
   * A native button / link, or an element whose definition's noun is `button` (`<ui-button>`, translated too).
   * - Static:  it reads only the element and the page-wide `UIComponent.registry.definitions`.
   */
  private static isButton(element: Element): boolean {
    return (
      element.matches(BUTTONS) ||
      E.UIComponent.registry.definitions.get(element.localName)?.vocabulary.noun === UIT.BUTTON
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIToast extends E.AttributeValues<Vocabulary> {}

/** What an activated action does:  approve, deny, or just close (any other button). */
type ToastAction = Extract<UIT.ToastCloseReason, "approve" | "deny" | "action">

/** The `type` value announced as an alert (`role=alert`), not a status. */
const ERROR = "error"

/** The class word of the box around the toast:  it floats (`UIToast.css`). */
const FLOATING = "floating"

/** The class word of the box around the toast, its progress bar and attached actions. */
const TOAST_BOX = "toast-box"

/** The class word of a fixed-width toast (`compact`, on by default). */
const COMPACT = "compact"

/** The class word of a box a click doesn't close. */
const UNCLICKABLE = "unclickable"

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

/** Class words of the icon box (`UIToast.css`). */
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
