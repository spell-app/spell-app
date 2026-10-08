import { Show } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { buttonVocabulary } from "./ui-button.vocabulary.en"
import { DEFAULT_TYPE, HostPress, RESET } from "./ui-button.types"
import { ButtonFallback } from "./ui-button.fallback"
import { Invoker } from "./Invoker"

import buttonCSS from "./ui-button.css?inline"

/****************
 * ### `<ui-button>`
 * A button:  a semantic `<button>` (or `<a>` with `href`) in the shadow root, in Fomantic's class grammar.
 * - Form-associated (the fork's `formAssociated`) only so `type=submit|reset` can reach `internals.form`;  it
 *   submits no value of its own except while it is the submitter (see `submit()`).  No `FormHost`:  a page with
 *   buttons only never loads the `forms` entry.
 * - `active` is auto-controlled (`isActive`):  `toggle` flips it on click and dispatches `ui-toggle` first.
 * - Fomantic's `state` behaviour is two attributes, not an element:  `active-text` / `inactive-text` replace the
 *   content while `active` is on / off (`Follow` => `Following`).  A label that SAYS the state must not also be
 *   `aria-pressed` (WAI-ARIA APG, toggle button), so a toggle with a state text leaves it off.
 * - Invoker commands:  `commandfor` / `command` go to the inner `<button>`, whose `commandForElement` is the element
 *   `commandfor` names in the host's own tree (re-resolved when the attribute changes, and at click time, for a
 *   target that arrived late).  Browsers without invokers (`UI.browser.supports.invokers`) get `Invoker.run()`.
 * - Icons come from the page's icon packs (`IconGlyph`) asynchronously;  the `.icon` box is sized by CSS, so the SVG
 *   arriving shifts nothing.  `icon-position="right"` puts the box after the text, as Fomantic's
 *   `<i class="right ... icon">`.
 * - `host.click()` (a click dispatched at the HOST, e.g. `<ui-input>`'s implicit submission) presses the inner
 *   control, as `click()` on a native button does;  the page sees only the host's click (`onHostClick`).
 * - Static server render (`$/ui/static`):  the inner `<button>` IS the submitter -- the host's `type`, `name`,
 *   `value`, `form*` attributes -- so a no-JS form submits as the element would (`nativeType`, `staticControl`).
 ****************/
export class UIButton extends E.UIElement<typeof buttonVocabulary> {
  @E.proto static vocabulary = buttonVocabulary
  @E.proto static styleSheets = { button: buttonCSS }
  @E.proto static elementSetup = { Fallback: ButtonFallback, isAFormControl: true }

  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
    super(...args)
    if (isServer) return
    this.on("click", this.onHostClick)
  }

  ////////////////
  // ## Pressed (`active`)
  ////////////////

  /** `active`:  host-controlled, or toggled internally (`toggle`). */
  @E.cssState("active")
  @E.controlled("active")
  accessor isActive = false

  /** Text for the current `active`, from `active-text` / `inactive-text`;  `undefined` shows the content. */
  get stateText(): string | undefined {
    return this.isActive ? this.activeText : this.inactiveText
  }

  /** Uses state texts at all (either one set)? */
  get hasStateText(): boolean {
    return this.activeText != null || this.inactiveText != null
  }

  ////////////////
  // ## Content
  ////////////////

  /** Light-DOM slot occupancy. */
  readonly slots = new E.SlotContent(this.host)

  /** Glyph of the `icon` attribute;  starts from the cache, so a known icon draws at once. */
  readonly iconGlyph = new E.IconGlyph({ owner: this, name: () => this.icon })

  /** Host `aria-label`, forwarded to the inner control (an icon-only button's name). */
  private get ariaLabel(): string | undefined {
    return this.attributes[UIT.ARIA_LABEL] ?? undefined
  }

  /** Has text content (slotted, the `content` shorthand, or a state text)? */
  get hasText(): boolean {
    return this.slots.hasContent("") || !!this.content || !!this.stateText
  }

  /** Has an icon (attribute or `icon` slot)? */
  get hasIcon(): boolean {
    return !!this.icon || this.slots.hasContent(this.slotForName("icon"))
  }

  /** Has a joined label (attribute or `label` slot)? */
  get hasLabel(): boolean {
    return !!this.label || this.slots.hasContent(this.slotForName("label"))
  }

  ////////////////
  // ## Disabled, loading, layout
  ////////////////

  /** Disabled by its attribute, or by a disabled fieldset. */
  @E.cssState("disabled")
  get isDisabled(): boolean {
    return this.disabled || this.formIsDisabled
  }

  /** Showing a spinner (`loading`)? */
  @E.cssState("loading")
  get isLoading(): boolean {
    return this.loading
  }

  /** Full width:  `fluid`, or attached as a whole row (`attached`, `top`, `bottom`). */
  @E.cssState("fluid")
  get isFluid(): boolean {
    const { attached } = this
    return this.fluid || attached === true || attached === "top" || attached === "bottom"
  }

  /** `floated="left"`:  the host floats. */
  @E.cssState("left-floated")
  get floatsLeft(): boolean {
    return this.floated === "left"
  }

  /** `floated="right"`:  the host floats. */
  @E.cssState("right-floated")
  get floatsRight(): boolean {
    return this.floated === "right"
  }

  ////////////////
  // ## Classes
  ////////////////

  /** `active` and `disabled` follow the state, not the attribute;  a joined label takes `labeled` to the wrapper. */
  protected classValue(name: E.AttributeName<typeof buttonVocabulary>): unknown {
    if (name === "active") return this.isActive
    if (name === "disabled") return this.isDisabled
    if (name === "labeled" && this.hasLabel) return false
    return super.classValue(name)
  }

  /** `icon` for icon-only buttons and for `labeled icon` buttons. */
  protected get extraClasses(): string | undefined {
    if (!this.hasIcon || this.animated) return undefined
    const isLabeledIcon = !!this.labeled && !this.hasLabel
    return !this.hasText || isLabeledIcon ? UIT.ICON_CLASS : undefined
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <Show when={this.hasLabel} fallback={this.control()}>
        <div
          class={this.buildClasses({
            size: this.size,
            color: this.color,
            labeled: this.labeled || true
          })}
        >
          {this.control()}
          <span class={LABEL_CLASS} part={this.partForName("label")}>
            <slot name={this.slotForName("label")}>{this.label}</slot>
          </span>
        </div>
      </Show>
    )
  }

  /** The inner `<button>`, or `<a>` with `href`. */
  private control(): JSX.Element {
    const iconAndText = () => this.iconAndText()
    return (
      <Show
        when={this.href}
        fallback={
          <button
            ref={(element) => {
              this.innerControl = element
              this.resolveInvoker()
            }}
            type={this.nativeType}
            class={this.rootClasses}
            part={this.partForName("button")}
            disabled={this.isDisabled}
            {...this.staticControl}
            aria-pressed={this.toggle && !this.hasStateText ? (this.isActive ? UIT.TRUE : UIT.FALSE) : undefined}
            aria-busy={this.loading ? UIT.TRUE : undefined}
            aria-label={this.ariaLabel}
            command={isServer || this.hasNativeInvokers ? this.command : undefined}
            onClick={this.onClick}
          >
            {iconAndText()}
          </button>
        }
      >
        <a
          ref={(element) => (this.innerControl = element)}
          class={this.rootClasses}
          part={this.partForName("button")}
          href={this.isDisabled ? undefined : this.href}
          target={this.target}
          download={this.download}
          role={this.isDisabled ? LINK_ROLE : undefined}
          aria-disabled={this.isDisabled ? UIT.TRUE : undefined}
          aria-busy={this.loading ? UIT.TRUE : undefined}
          aria-label={this.ariaLabel}
          onClick={this.onClick}
        >
          {iconAndText()}
        </a>
      </Show>
    )
  }

  /** The inner `<button>` / `<a>`, once rendered. */
  private innerControl?: HTMLElement

  /**
   * The inner `<button>`'s `type`:  `button` in a browser, where a click submits / resets through `internals.form`
   * (`onClick`);  the host's `type` in a server render (`$/ui/static`), where no script runs, so a static form's
   * `<button type="submit">` submits it natively.
   */
  private get nativeType(): "button" | "submit" | "reset" {
    return isServer ? (this.type ?? DEFAULT_TYPE) : DEFAULT_TYPE
  }

  /**
   * Server render only:  what a native submitter carries -- `name`, `value`, the host's own `form` / `formaction` ...
   * (`FORM_ATTRIBUTES`) -- and the `STATIC_CONTROL` mark (the host's `id` and ARIA names go there, under a joined
   * label too);  `{}` in a browser, where the HOST submits (`submit()`).
   * - Also `commandfor` as written (with `command`, rendered on a server too):  a static page's invoker, for the
   *   server's no-JS pass (`$/ui/static`) to point at its target;  a browser sets `commandForElement` instead.
   */
  private get staticControl(): Record<string, unknown> {
    if (!isServer) return {}
    const native: Record<string, unknown> = {
      [UIT.STATIC_CONTROL]: "",
      name: this.name,
      value: this.value,
      commandfor: this.commandfor
    }
    for (const name of FORM_ATTRIBUTES) {
      const value = this.host.getAttribute(name)
      if (value !== null) native[name] = value
    }
    return native
  }

  /**
   * Icon + text (the state text, else the slot) -- text + icon for `icon-position="right"` -- or the two `.content`
   * boxes of an `animated` button.
   */
  private iconAndText(): JSX.Element {
    const text = (
      <Show when={this.stateText} fallback={<slot>{this.content}</slot>}>
        {this.stateText}
      </Show>
    )
    const isTrailing = () => this.iconPosition === ICON_END
    const plain = [
      <Show when={this.hasIcon && !isTrailing()}>{this.iconBox()}</Show>,
      text,
      <Show when={this.hasIcon && isTrailing()}>{this.iconBox(RIGHT_ICON_CLASS)}</Show>
    ]
    return (
      <Show when={this.animated} fallback={plain}>
        <span class={VISIBLE_CONTENT_CLASS}>{text}</span>
        <span class={HIDDEN_CONTENT_CLASS}>{this.iconBox()}</span>
      </Show>
    )
  }

  /**
   * The icon box:  the `icon` slot, falling back to the `icon` attribute's SVG.
   * - `classes`:  `right icon` for a trailing box, which `ui-button.css` spaces on its start side.
   */
  private iconBox(classes: string = UIT.ICON_CLASS): JSX.Element {
    return (
      <span class={classes} part={this.partForName("icon")}>
        <slot name={this.slotForName("icon")}>{this.iconGlyph.svg}</slot>
      </span>
    )
  }

  ////////////////
  // ## Invoker commands
  ////////////////

  // The platform's Invoker Commands API (`<button commandfor="dialog-id" command="show-modal">`), not shortcut
  // keys:  a button that opens, closes or toggles another element with no script.  A shadow `<button>` can't name a
  // light-DOM id, so the element points the inner button's `commandForElement` at the element itself.

  /**
   * Native invokers?  `undefined` until the runtime is loaded (`UI.browser` throws before that), and on the server.
   * - Render-safe:  reads `isReady` first, so a button rendered before `UI.load()` settles never touches `UI`.
   */
  private get hasNativeInvokers(): boolean | undefined {
    return !isServer && this.isReady ? UI.browser.supports.invokers : undefined
  }

  /**
   * `commandfor` changed, or the runtime loaded and says the browser has invokers:  point the inner `<button>` at
   * the element `commandfor` names again.
   */
  @E.onChange("commandfor", "hasNativeInvokers")
  protected onCommandTargetChanged() {
    this.resolveInvoker()
  }

  /**
   * Point the inner `<button>` at the element `commandfor` names.
   * - Native invokers only;  no target clears it.  The browser's activation runs AFTER the click event, so the
   *   click handler can call this again for a target that arrived after the last attribute change.
   */
  private resolveInvoker() {
    const control = this.innerControl
    if (!control || !this.hasNativeInvokers || !(control instanceof HTMLButtonElement)) return
    // `null`:  the platform's "no target"
    control.commandForElement = Invoker.resolve(this.host, this.commandfor) ?? null
  }

  /** Browsers without invokers:  run the command on the target, as the browser would. */
  private runInvoker(event: MouseEvent) {
    const { command, commandfor } = this
    if (this.hasNativeInvokers !== false || !command || event.defaultPrevented) return
    const target = Invoker.resolve(this.host, commandfor)
    if (target) Invoker.run(target, command, this.host)
  }

  ////////////////
  // ## Clicks
  ////////////////

  /** Click:  invoker command, toggle, then submit / reset the form for those types. */
  private readonly onClick = (event: MouseEvent) => {
    if (this.isDisabled) {
      event.preventDefault()
      return
    }
    this.resolveInvoker()
    this.runInvoker(event)
    if (this.toggle) {
      const next = !this.isActive
      this.requestChange("isActive", next, () => this.send("ui-toggle", { active: next, originalEvent: event }))
    }
    const { form } = this.host.internals
    if (!form) return
    if (this.type === UIT.SUBMIT) this.submit(form)
    else if (this.type === RESET) form.reset()
  }

  /**
   * A click dispatched at the HOST itself (`host.click()`:  `<ui-input>`'s implicit submission, a modal's Enter):
   * press the inner control too, so it submits, toggles, invokes or follows its link as a real click would.
   * - The control's click stays INSIDE the shadow root (`HostPress.press()`), so the page sees ONE click:  the
   *   host's own, whatever order its listeners were added in.  Clicks from inside (the control, a joined label)
   *   start below the host and are left alone.
   * - A disabled host never gets here:  `click()` on a disabled form-associated element does nothing.  A listener
   *   that ran first and called `preventDefault()` vetoes the press.
   * - No connected control (the render threw):  left to the native fallback's own listener.
   */
  private readonly onHostClick = (event: MouseEvent) => {
    const control = this.innerControl
    if (event.composedPath()[0] !== this.host || !control?.isConnected) return
    if (this.isDisabled || event.defaultPrevented) return
    HostPress.press(control)
  }

  /**
   * `form.requestSubmit()`, with this button's `name=value` in the submission.
   * - A custom element can't be `requestSubmit()`'s submitter (it throws), so the button sets its own form
   *   value for the duration of the synchronous submit algorithm, then clears it.
   */
  private submit(form: HTMLFormElement) {
    const { name, value } = this
    const { internals } = this.host
    if (name) internals.setFormValue(value ?? "")
    try {
      form.requestSubmit()
    } finally {
      if (name) internals.setFormValue(null)
    }
  }

  /** Focus the inner control. */
  focus() {
    this.innerControl?.focus()
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIButton extends E.AttributeValues<typeof buttonVocabulary> {}

/**
 * The native submitter's attributes a server render (`$/ui/static`) copies from the host onto the inner `<button>`,
 * so a static form submits as the browser would with that button:  not vocabulary, read off the host as written.
 */
const FORM_ATTRIBUTES = ["form", "formaction", "formenctype", "formmethod", "formnovalidate", "formtarget"] as const

/** `icon-position` that puts the icon after the text. */
const ICON_END = "right"

/** Class words of a trailing icon box:  Fomantic's `<i class="right ... icon">`, spaced on its start side. */
const RIGHT_ICON_CLASS = "right icon"

/** Class words of a joined label's box (`labeled` buttons with `label`). */
const LABEL_CLASS = "ui basic label"

/** Class words of an `animated` button's resting content. */
const VISIBLE_CONTENT_CLASS = "visible content"

/** Class words of an `animated` button's content shown on hover. */
const HIDDEN_CONTENT_CLASS = "hidden content"

/** ARIA role of a disabled link button:  its `href` is gone, so it's no longer a link by itself. */
const LINK_ROLE = "link"
