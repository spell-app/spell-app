import { Show, createEffect, createMemo } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, IconGlyph, proto, SlotContent, type AttributeName, UI, UIElement, UIT } from "$/ui/core"

import { buttonVocabulary } from "./ui-button.vocabulary.en"
import { DEFAULT_TYPE, FORM_ATTRIBUTES } from "./ui-button.types"
import { ButtonFallback } from "./ui-button.fallback"
import { Invoker } from "./Invoker"

import buttonCSS from "./ui-button.css?inline"

/****************
 * ### `<ui-button>`
 * A button:  a semantic `<button>` (or `<a>` with `href`) in the shadow root, in Fomantic's class grammar.
 * - Form-associated (the fork's `formAssociated`) only so `type=submit|reset` can reach `internals.form`;  it
 *   submits no value of its own except while it is the submitter (see `submit()`).  No `FormHost`:  a page with
 *   buttons only never loads the `forms` entry.
 * - `active` is auto-controlled:  `toggle` flips it on click and dispatches `ui-toggle` first.
 * - Fomantic's `state` behaviour is two attributes, not an element:  `active-text` / `inactive-text` replace the
 *   content while `active` is on / off (`Follow` => `Following`).  A label that SAYS the state must not also be
 *   `aria-pressed` (WAI-ARIA APG, toggle button), so a toggle with a state text leaves it off.
 * - Invoker commands:  `commandfor` / `command` go to the inner `<button>`, whose `commandForElement` is the element
 *   `commandfor` names in the host's own tree (re-resolved when the attribute changes, and at click time, for a
 *   target that arrived late).  Browsers without invokers (`UI.browser.supports.invokers`) get `Invoker.run()`.
 * - Icons come from the page's icon packs (`IconGlyph`) asynchronously;  the `.icon` box is sized by CSS, so the SVG arriving shifts nothing.
 * - Static server render (`$/ui/server`):  the inner `<button>` IS the submitter -- the host's `type`, `name`,
 *   `value`, `form*` attributes -- so a no-JS form submits as the element would (`nativeType()`, `staticControl()`).
 ****************/
export class UIButton extends UIElement<typeof buttonVocabulary> {
  @proto static vocabulary = buttonVocabulary
  @proto static styles = { button: buttonCSS }
  @proto static formAssociated = true
  @proto static Fallback = ButtonFallback

  /** `active`:  host-controlled, or toggled internally. */
  readonly active = this.controlled("active", false)

  /** Light-DOM slot occupancy. */
  readonly slots = new SlotContent(this.host)

  /** Glyph of the `icon` attribute;  starts from the cache, so a known icon draws at once. */
  readonly glyph = new IconGlyph(this, () => this.attrs.icon)

  /** Host `aria-label`, forwarded to the inner control (an icon-only button's name). */
  private readonly ariaLabel = new Cell(this.host.getAttribute(UIT.ARIA_LABEL))

  /** The inner `<button>` / `<a>`. */
  private control?: HTMLElement

  constructor(...args: ConstructorParameters<typeof UIElement>) {
    super(...args)
    if (isServer) return
    const observer = new MutationObserver(() => this.ariaLabel.set(this.host.getAttribute(UIT.ARIA_LABEL)))
    observer.observe(this.host, { attributeFilter: [UIT.ARIA_LABEL] })
    this.host.addReleaseCallback(() => observer.disconnect())
  }

  ////////////////
  // ## Derived state
  ////////////////

  /** Text for the current `active`, from `active-text` / `inactive-text`;  `undefined` shows the content. */
  readonly stateText = createMemo(() => (this.active.get() ? this.attrs.activeText : this.attrs.inactiveText))

  /** Uses state texts at all (either one set)? */
  readonly hasStateText = createMemo(() => this.attrs.activeText != null || this.attrs.inactiveText != null)

  /** Has text content (slotted, the `content` shorthand, or a state text)? */
  readonly hasText = createMemo(() => this.slots.has("") || !!this.attrs.content || !!this.stateText())

  /** Has an icon (attribute or `icon` slot)? */
  readonly hasIcon = createMemo(() => !!this.attrs.icon || this.slots.has(this.slot("icon")))

  /** Has a joined label (attribute or `label` slot)? */
  readonly hasLabel = createMemo(() => !!this.attrs.label || this.slots.has(this.slot("label")))

  isDisabled(): boolean {
    return this.attrs.disabled || this.formDisabled.get()
  }

  protected classValue(name: AttributeName<typeof buttonVocabulary>): unknown {
    if (name === "active") return this.active.get()
    if (name === "disabled") return this.isDisabled()
    // with a joined label, `labeled` goes on the wrapper, not the inner button
    if (name === "labeled" && this.hasLabel()) return false
    return super.classValue(name)
  }

  /** `icon` for icon-only buttons and for `labeled icon` buttons. */
  protected extraClasses(): string | undefined {
    if (!this.hasIcon() || this.attrs.animated) return undefined
    const labeledIcon = !!this.attrs.labeled && !this.hasLabel()
    return !this.hasText() || labeledIcon ? UIT.ICON_CLASS : undefined
  }

  protected hostStates() {
    const { attached, floated } = this.attrs
    return {
      active: this.active.get(),
      disabled: this.isDisabled(),
      loading: this.attrs.loading,
      fluid: this.attrs.fluid || attached === true || attached === "top" || attached === "bottom",
      "left-floated": floated === "left",
      "right-floated": floated === "right"
    }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    this.invokerEffect()
    return (
      <Show when={this.hasLabel()} fallback={this.control_()}>
        <div
          class={this.buildClasses({
            size: this.attrs.size,
            color: this.attrs.color,
            labeled: this.attrs.labeled || true
          })}
        >
          {this.control_()}
          <span class="ui basic label" part={this.part("label")}>
            <slot name={this.slot("label")}>{this.attrs.label}</slot>
          </span>
        </div>
      </Show>
    )
  }

  /** The inner `<button>`, or `<a>` with `href`. */
  private control_(): JSX.Element {
    const content = () => this.content()
    return (
      <Show
        when={this.attrs.href}
        fallback={
          <button
            ref={(element) => {
              this.control = element
              this.resolveInvoker()
            }}
            type={this.nativeType()}
            class={this.classes()}
            part={this.part("button")}
            disabled={this.isDisabled()}
            {...this.staticControl()}
            aria-pressed={
              this.attrs.toggle && !this.hasStateText() ? (this.active.get() ? "true" : "false") : undefined
            }
            aria-busy={this.attrs.loading ? "true" : undefined}
            aria-label={this.ariaLabel.get() ?? undefined}
            command={isServer || this.invokers() ? this.attrs.command : undefined}
            onClick={this.onClick}
          >
            {content()}
          </button>
        }
      >
        <a
          ref={(element) => (this.control = element)}
          class={this.classes()}
          part={this.part("button")}
          href={this.isDisabled() ? undefined : this.attrs.href}
          target={this.attrs.target}
          role={this.isDisabled() ? "link" : undefined}
          aria-disabled={this.isDisabled() ? "true" : undefined}
          aria-busy={this.attrs.loading ? "true" : undefined}
          aria-label={this.ariaLabel.get() ?? undefined}
          onClick={this.onClick}
        >
          {content()}
        </a>
      </Show>
    )
  }

  /**
   * The inner `<button>`'s `type`:  `button` in a browser, where a click submits / resets through `internals.form`
   * (`onClick`);  the host's `type` in a server render (`$/ui/server`), where no script runs, so a static form's
   * `<button type="submit">` submits it natively.
   */
  private nativeType(): "button" | "submit" | "reset" {
    return isServer ? (this.attrs.type ?? DEFAULT_TYPE) : DEFAULT_TYPE
  }

  /**
   * Server render only:  what a native submitter carries -- `name`, `value`, the host's own `form` / `formaction` ...
   * (`FORM_ATTRIBUTES`) -- and the `STATIC_CONTROL` mark (the host's `id` and ARIA names go there, under a joined
   * label too);  `{}` in a browser, where the HOST submits (`submit()`).
   * - Also `commandfor` as written (with `command`, rendered on a server too):  a static page's invoker, for the
   *   server's no-JS pass (`$/ui/server`) to point at its target;  a browser sets `commandForElement` instead.
   */
  private staticControl(): Record<string, unknown> {
    if (!isServer) return {}
    const native: Record<string, unknown> = {
      [UIT.STATIC_CONTROL]: "",
      name: this.attrs.name,
      value: this.attrs.value,
      commandfor: this.attrs.commandfor
    }
    for (const name of FORM_ATTRIBUTES) {
      const value = this.host.getAttribute(name)
      if (value !== null) native[name] = value
    }
    return native
  }

  /** Icon + text (the state text, else the slot), or the two `.content` boxes of an `animated` button. */
  private content(): JSX.Element {
    const text = (
      <Show when={this.stateText()} fallback={<slot>{this.attrs.content}</slot>}>
        {this.stateText()}
      </Show>
    )
    return (
      <Show when={this.attrs.animated} fallback={[<Show when={this.hasIcon()}>{this.icon()}</Show>, text]}>
        <span class="visible content">{text}</span>
        <span class="hidden content">{this.icon()}</span>
      </Show>
    )
  }

  /** The icon box:  the `icon` slot, falling back to the `icon` attribute's SVG. */
  private icon(): JSX.Element {
    return (
      <span class={UIT.ICON_CLASS} part={this.part("icon")}>
        <slot name={this.slot("icon")}>{this.glyph.svg()}</slot>
      </span>
    )
  }

  ////////////////
  // ## Behaviour
  ////////////////

  /** Keep the inner button's `commandForElement` in step with `commandfor`. */
  private invokerEffect() {
    if (isServer) return
    createEffect(
      () => [this.attrs.commandfor, this.invokers()],
      () => this.resolveInvoker()
    )
  }

  /**
   * Native invokers?  `undefined` until the runtime is loaded (`UI.browser` throws before that), and on the server.
   * - Render-safe:  reads `loaded()` first, so a button rendered before `UI.load()` settles never touches `UI`.
   */
  private invokers(): boolean | undefined {
    return !isServer && this.loaded() ? UI.browser.supports.invokers : undefined
  }

  /**
   * Point the inner `<button>` at the element `commandfor` names.
   * - Native invokers only;  `null` clears it.  The browser's activation runs AFTER the click event, so the
   *   click handler can call this again for a target that arrived after the last attribute change.
   */
  private resolveInvoker() {
    const control = this.control
    if (!control || !this.invokers() || !(control instanceof HTMLButtonElement)) return
    control.commandForElement = Invoker.resolve(this.host, this.attrs.commandfor)
  }

  /** Browsers without invokers:  run the command on the target, as the browser would. */
  private runInvoker(event: MouseEvent) {
    const { command, commandfor } = this.attrs
    if (this.invokers() !== false || !command || event.defaultPrevented) return
    const target = Invoker.resolve(this.host, commandfor)
    if (target) Invoker.run(target, command, this.host)
  }

  /** Click:  invoker command, toggle, then submit / reset the form for those types. */
  private readonly onClick = (event: MouseEvent) => {
    if (this.isDisabled()) {
      event.preventDefault()
      return
    }
    this.resolveInvoker()
    this.runInvoker(event)
    if (this.attrs.toggle) {
      const next = !this.active.get()
      this.active.request(next, () => this.emit("ui-toggle", { active: next, originalEvent: event }))
    }
    const { form } = this.host.internals
    if (!form) return
    if (this.attrs.type === "submit") this.submit(form)
    else if (this.attrs.type === "reset") form.reset()
  }

  /**
   * `form.requestSubmit()`, with this button's `name=value` in the submission.
   * - A custom element can't be `requestSubmit()`'s submitter (it throws), so the button sets its own form
   *   value for the duration of the synchronous submit algorithm, then clears it.
   */
  private submit(form: HTMLFormElement) {
    const { name, value } = this.attrs
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
    this.control?.focus()
  }
}
