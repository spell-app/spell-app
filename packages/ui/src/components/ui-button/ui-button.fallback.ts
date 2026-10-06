import { E, UI, UIT } from "$/ui/core"
import { buttonVocabulary } from "./ui-button.vocabulary.en"
import { DEFAULT_TYPE, HostPress, RESET } from "./ui-button.types"
import { Invoker } from "./Invoker"

/****************
 * ### `ButtonFallback`
 * Native `<button part="button" class="ui ... button">` (`<a>` with `href`) around a `<slot>`.
 * - Still works in a form:  `submit` calls `form.requestSubmit()` (with `name=value` for the trip), `reset`
 *   calls `form.reset()`.
 * - The inner control is always `type="button"`:  a shadow-tree button has no form owner, so the host does the
 *   form work, and a light-DOM root can't submit twice.
 * - `content` is the slot's fallback text, so slotted children win, as in the real element.
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
    "a host `click` handler's preventDefault() cannot veto submit / reset"
  ]

  protected override build() {
    const { host } = this
    const href = this.attr("href")
    const isDisabled = this.flag("disabled")
    const isToggle = this.flag("toggle")
    // a bare `icon` (`"true"`) names no glyph, so it can't name the button either
    const icon = E.Converters.icon(this.attr("icon"))
    const isIconOnly = icon && !this.attr("content") && !host.textContent?.trim()
    const control =
      href !== null
        ? this.create("a", {
            href: isDisabled ? undefined : href,
            target: this.attr("target"),
            download: this.attr("download"),
            rel: this.attr("target") === BLANK_TARGET ? NOOPENER : undefined,
            "aria-disabled": isDisabled ? UIT.TRUE : undefined,
            tabindex: isDisabled ? "-1" : undefined
          })
        : this.create("button", { type: DEFAULT_TYPE, disabled: isDisabled })
    control.className = this.classes()
    this.decorate(control, "button")
    if (isToggle) control.setAttribute(ARIA_PRESSED, String(this.flag("active")))
    // An icon-only button has no glyph here, so its name would be empty.
    if (isIconOnly && !control.hasAttribute(UIT.ARIA_LABEL)) control.setAttribute(UIT.ARIA_LABEL, icon)
    control.append(this.slot(this.attr("content")))

    this.listen<MouseEvent>(control, "click", (event) => {
      if (isDisabled) return event.preventDefault()
      if (isToggle) control.setAttribute(ARIA_PRESSED, String(control.classList.toggle(UIT.ACTIVE)))
      this.invoke(control, event)
      this.activate()
    })
    // `host.click()` presses the control, as in the element (only the host's click reaches the page)
    this.listen<MouseEvent>(host, "click", (event) => {
      if (event.composedPath()[0] === host && !isDisabled && !event.defaultPrevented) HostPress.press(control)
    })
    return [control]
  }

  /**
   * Invoker command:  natively through the inner button's `commandForElement` (set now, the browser acts after this
   * click), else run by `Invoker`.
   */
  private invoke(control: HTMLElement, event: MouseEvent) {
    const command = this.attr(COMMAND)
    if (!command) return
    const target = Invoker.resolve(this.host, this.attr("commandfor") ?? undefined)
    if (UI.browser.supports.invokers && control instanceof HTMLButtonElement) {
      control.setAttribute(COMMAND, command)
      // `null`:  the platform's "no target"
      control.commandForElement = target ?? null
    } else if (target && !event.defaultPrevented) Invoker.run(target, command, this.host)
  }

  /** Submit or reset the host's form, by `type`. */
  private activate() {
    const type = this.attr("type")
    const form = this.form()
    if (!form) return
    if (type === RESET) return form.reset()
    if (type !== UIT.SUBMIT) return
    // `requestSubmit()` builds the entries synchronously, so the value need only exist during the call.
    const isSubmitted = this.formInternals && this.attr("name") !== null
    if (isSubmitted) this.formInternals!.setFormValue(this.attr("value") ?? "")
    try {
      form.requestSubmit()
    } finally {
      if (isSubmitted) this.formInternals!.setFormValue(null)
    }
  }
}

/** The invoker attribute:  read off the host, copied onto the native button. */
const COMMAND: E.AttributeNameOf<typeof buttonVocabulary> = "command"

/** Shows the toggle's state to assistive tech:  `"true"` / `"false"`. */
const ARIA_PRESSED = "aria-pressed"

/** `target` of a link that opens in a new browsing context. */
const BLANK_TARGET = "_blank"

/** `rel` of such a link:  the new page gets no `window.opener`. */
const NOOPENER = "noopener"
