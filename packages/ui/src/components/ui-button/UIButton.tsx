import { Show } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { buttonVocabulary } from "./UIButton.en"
import { DOMElementClick } from "./UIButton.types"
import { ButtonFallback } from "./UIButton.fallback"
import { Invoker } from "./Invoker"

import buttonCSS from "./UIButton.css?inline"

/****************
 * ### `UIButton`
 * The component behind `<ui-button>`:  a button, drawn as a native `<button>` (or an `<a>` with `href`)
 * in Fomantic's class grammar.
 *
 * - A form control only so `type="submit"` / `"reset"` can reach its form (`internals.form`).
 *   It sends no value of its own, except while it is the submitter (`submit()`).
 *   It doesn't use `DOMFormControl`, so a page with only buttons never loads the `forms` entry.
 *
 * - `active` (`isActive`) is controlled:  `toggle` flips it on click, sending `ui-toggle` first.
 *
 * - Fomantic's `state` behaviour is two attributes here, not an element:
 *   `active-text` / `inactive-text` replace the content while `active` is on / off (`Follow` => `Following`).
 *   A label that SAYS the state must not also be `aria-pressed` (WAI-ARIA APG, toggle button),
 *   so a toggle with a state text leaves it off.
 *
 * - Invoker commands:  `commandfor` / `command` go to the inner `<button>`,
 *   whose `commandForElement` is the element `commandfor` names in the DOM element's own tree.
 *   It's found again when the attribute changes, and at click time, for a target that arrived late.
 *   Browsers without invokers (`UI.browser.supports.invokers`) get `Invoker.run()`.
 *
 * - Icons come from the page's icon packs (`IconGlyph`), asynchronously.
 *   CSS sizes the `.icon` box, so the SVG arriving shifts nothing.
 *   `icon-position="right"` puts the box after the text, as Fomantic's `<i class="right … icon">`.
 *
 * - `click()` on the DOM element (`<ui-input>`'s implicit submission sends one) presses the inner control,
 *   as `click()` on a native button does;  the page sees only the DOM element's own click (`onDOMElementClick`).
 *
 * - In a static server render (`$/ui/static`), the inner `<button>` IS the submitter:
 *   it carries the DOM element's `type`, `name`, `value` and `form*` attributes,
 *   so a form without script submits as the element would (`nativeType`, `staticControl`).
 ****************/
@E.cssStates("loading")
export class UIButton extends E.UIComponent<typeof buttonVocabulary> {
  @E.proto static vocabulary = buttonVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { button: buttonCSS },
    Fallback: ButtonFallback,
    isAFormControl: true
  } satisfies Partial<E.ElementSetup>

  constructor(...args: ConstructorParameters<typeof E.UIComponent>) {
    super(...args)
    if (isServer) return
    this.on("click", this.onDOMElementClick)
  }

  ////////////////
  // ## Pressed (`active`)
  ////////////////

  /** `active`:  set by the page, or toggled by a click (`toggle`). */
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

  /** Which slots have light-DOM children. */
  readonly slots = new E.SlotContent(this.domElement)

  /** The glyph of the `icon` attribute;  starts from the cache, so a known icon draws at once. */
  readonly iconGlyph = new E.IconGlyph({ owner: this, name: () => this.icon })

  /** The DOM element's `aria-label`, passed on to the inner control (an icon-only button's name). */
  private get ariaLabel(): string | undefined {
    return this.attributes["aria-label"] ?? undefined
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

  /** Full width:  `fluid`, or attached as a whole row (`attached`, `top`, `bottom`). */
  @E.cssState("fluid")
  get isFluid(): boolean {
    const { attached } = this
    return this.fluid || attached === true || attached === "top" || attached === "bottom"
  }

  /** `floated="left"`:  the whole element floats left. */
  @E.cssState("left-floated")
  get floatsLeft(): boolean {
    return this.floated === "left"
  }

  /** `floated="right"`:  the whole element floats right. */
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
  protected get extraClass(): string | undefined {
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
          class={this.wrapperClass({
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
            class={this.rootClass}
            part={this.partForName("button")}
            disabled={this.isDisabled}
            {...this.staticControl}
            aria-pressed={this.toggle && !this.hasStateText ? (this.isActive ? "true" : "false") : undefined}
            aria-busy={this.loading ? "true" : undefined}
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
          class={this.rootClass}
          part={this.partForName("button")}
          href={this.isDisabled ? undefined : this.href}
          target={this.target}
          download={this.download}
          role={this.isDisabled ? "link" : undefined}
          aria-disabled={this.isDisabled ? "true" : undefined}
          aria-busy={this.loading ? "true" : undefined}
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
   * The inner `<button>`'s `type`.
   * - In a browser, `button`:  a click submits or resets through `internals.form` (`onClick`).
   * - In a server render (`$/ui/static`), the DOM element's own `type`:  no script runs there,
   *   so a static form's `<button type="submit">` submits it natively.
   */
  private get nativeType(): "button" | "submit" | "reset" {
    return isServer ? (this.type ?? "button") : "button"
  }

  /**
   * The inner `<button>`'s extra attributes in a server render:  what a native submitter carries.
   * - `name`, `value`, and the DOM element's own `form` / `formaction` ... (`FORM_ATTRIBUTES`).
   * - The `STATIC_CONTROL` mark:  the DOM element's `id` and ARIA names go there, under a joined label too.
   * - `commandfor` as written (`command` renders on a server too):  a static page's invoker,
   *   for the server's no-script pass (`$/ui/static`) to point at its target.
   *   A browser sets `commandForElement` instead.
   * - `{}` in a browser, where the DOM element itself submits (`submit()`).
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
      const value = this.domElement.getAttribute(name)
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
   * - `classes`:  `right icon` for a trailing box, which `UIButton.css` spaces on its start side.
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

  // The platform's Invoker Commands API (`<button commandfor="dialog-id" command="show-modal">`),
  // not shortcut keys:  a button that opens, closes or toggles another element with no script.
  // A shadow `<button>` can't name a light-DOM id, so the element points the inner button's `commandForElement` at the
  // element itself.

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
   * - Native invokers only;  no target clears it.  The browser's activation runs AFTER the click event,
   *   so the click handler can call this again for a target that arrived after the last attribute change.
   */
  private resolveInvoker() {
    const control = this.innerControl
    if (!control || !this.hasNativeInvokers || !(control instanceof HTMLButtonElement)) return
    // `null`:  the platform's "no target"
    control.commandForElement = Invoker.resolve(this.domElement, this.commandfor) ?? null
  }

  /** Browsers without invokers:  run the command on the target, as the browser would. */
  private runInvoker(event: MouseEvent) {
    const { command, commandfor } = this
    if (this.hasNativeInvokers !== false || !command || event.defaultPrevented) return
    const target = Invoker.resolve(this.domElement, commandfor)
    if (target) Invoker.run(target, command, this.domElement)
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
    const { form } = this.domElement.internals
    if (!form) return
    if (this.type === "submit") this.submit(form)
    else if (this.type === "reset") form.reset()
  }

  /**
   * A click sent at the DOM element itself (`click()`:  `<ui-input>`'s implicit submission, a modal's Enter):
   * press the inner control too, so it submits, toggles, invokes or follows its link as a real click would.
   * - The control's click stays INSIDE the shadow root (`DOMElementClick.press()`),
   *   so the page sees ONE click:  the DOM element's own, whatever order its listeners were added in.
   * - Clicks from inside (the control, a joined label) start below the DOM element, and are left alone.
   * - A disabled button never gets here:  `click()` on a disabled form-associated element does nothing.
   *   A listener that ran first and called `preventDefault()` cancels the press.
   * - No connected control (the render threw):  left to the native fallback's own listener.
   */
  private readonly onDOMElementClick = (event: MouseEvent) => {
    const control = this.innerControl
    if (event.composedPath()[0] !== this.domElement || !control?.isConnected) return
    if (this.isDisabled || event.defaultPrevented) return
    DOMElementClick.press(control)
  }

  /**
   * `form.requestSubmit()`, with this button's `name=value` in the submission.
   * - A custom element can't be `requestSubmit()`'s submitter (it throws), so the button sets its own form
   *   value for the duration of the synchronous submit algorithm, then clears it.
   */
  private submit(form: HTMLFormElement) {
    const { name, value } = this
    const { internals } = this.domElement
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

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIButton extends E.AttributeValues<typeof buttonVocabulary> {}

/**
 * The native submitter's attributes, which a server render (`$/ui/static`) copies from the DOM element
 * onto the inner `<button>`, so a static form submits as the browser would with that button.
 * - Not in the vocabulary:  read off the DOM element as written.
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
