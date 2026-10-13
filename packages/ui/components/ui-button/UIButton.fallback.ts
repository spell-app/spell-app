import { E, UI, UIT } from "$/ui/core"
import { buttonVocabulary } from "./UIButton.en"
import { DOMElementClick } from "./UIButton.types"
import { Invoker } from "./Invoker"

/****************
 * ### `ButtonFallback`
 * The native fallback of `<ui-button>`:  what it shows when its component breaks,
 * so a submit or reset button still works in its form.
 *
 * - Its shadow DOM:  a native `<button part="button" class="ui … button">` (an `<a>` with `href`)
 *   around a `<slot>`.
 * - `submit` calls `form.requestSubmit()`, with the button's `name=value` in the submission;
 *   `reset` calls `form.reset()`.
 * - The inner button is always `type="button"`:  a button inside a shadow root belongs to no form,
 *   so the DOM element does the form's work (and a light-DOM root can't submit twice).
 * - `content` is the slot's fallback text, so slotted children win, as in the component.
 ****************/
export class ButtonFallback extends E.NativeFallback<typeof buttonVocabulary> {
  @E.proto static vocabulary = buttonVocabulary
  @E.proto static degraded = [
    "`ui-toggle` event (toggle only flips `aria-pressed` + `active`)",
    "`icon` glyph and `icon` / `label` slots",
    "joined `label`",
    "`animated`",
    "`loading` spinner",
    "`active-text` / `inactive-text` (the content shows;  a toggle keeps `aria-pressed`)",
    "a `click` handler's preventDefault() on the element cannot veto submit / reset"
  ]

  protected override build() {
    const { domElement } = this
    const href = this.attr("href")
    const isDisabled = this.flag("disabled")
    const isToggle = this.flag("toggle")
    // a bare `icon` (`"true"`) names no glyph, so it can't name the button either
    const icon = E.Converters.icon(this.attr("icon"))
    const isIconOnly = icon && !this.attr("content") && !domElement.textContent?.trim()
    const control =
      href !== undefined
        ? this.create("a", {
            href: isDisabled ? undefined : href,
            target: this.attr("target"),
            download: this.attr("download"),
            rel: this.attr("target") === "_blank" ? "noopener" : undefined,
            "aria-disabled": isDisabled ? "true" : undefined,
            tabindex: isDisabled ? "-1" : undefined
          })
        : this.create("button", { type: "button", disabled: isDisabled })
    control.className = this.classes()
    this.decorate(control, "button")
    if (isToggle) control.setAttribute("aria-pressed", String(this.flag("active")))
    // An icon-only button has no glyph here, so its name would be empty.
    if (isIconOnly && !control.hasAttribute("aria-label")) control.setAttribute("aria-label", icon)
    control.append(this.slot(this.attr("content")))

    this.listen<MouseEvent>(control, "click", (event) => {
      if (isDisabled) return event.preventDefault()
      if (isToggle) control.setAttribute("aria-pressed", String(control.classList.toggle(UIT.ACTIVE)))
      this.invoke(control, event)
      this.activate()
    })
    // `click()` on the DOM element presses the control, as in the component
    // (only the DOM element's own click reaches the page)
    this.listen<MouseEvent>(domElement, "click", (event) => {
      if (event.composedPath()[0] === domElement && !isDisabled && !event.defaultPrevented) {
        DOMElementClick.press(control)
      }
    })
    return [control]
  }

  /**
   * Run the invoker command, if any.
   * - Natively through the inner button's `commandForElement`:  set now, the browser acts after this click.
   * - Else `Invoker.run()` does what the browser would.
   */
  private invoke(control: HTMLElement, event: MouseEvent) {
    const command = this.attr(COMMAND)
    if (!command) return
    const target = Invoker.resolve(this.domElement, this.attr("commandfor"))
    if (UI.browser.supports.invokers && control instanceof HTMLButtonElement) {
      control.setAttribute(COMMAND, command)
      // `null`:  the platform's "no target"
      control.commandForElement = target ?? null
    } else if (target && !event.defaultPrevented) Invoker.run(target, command, this.domElement)
  }

  /** Submit or reset the button's form, by `type`. */
  private activate() {
    const type = this.attr("type")
    const form = this.form()
    if (!form) return
    if (type === "reset") return form.reset()
    if (type !== "submit") return
    // `requestSubmit()` builds the entries synchronously, so the value need only exist during the call.
    const isSubmitted = this.formInternals && this.attr("name") !== undefined
    if (isSubmitted) this.formInternals!.setFormValue(this.attr("value") ?? "")
    try {
      form.requestSubmit()
    } finally {
      if (isSubmitted) this.formInternals!.setFormValue(null)
    }
  }
}

/** The invoker attribute:  read off the DOM element, copied onto the native button. */
const COMMAND: E.AttributeNameOf<typeof buttonVocabulary> = "command"
