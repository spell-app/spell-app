import { Converters, NativeFallback, proto, UI } from "$/ui/core"

import { buttonVocabulary } from "./ui-button.vocabulary.en"
import { HostPress } from "./ui-button.types"
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
export class ButtonFallback extends NativeFallback<typeof buttonVocabulary> {
  @proto static vocabulary = buttonVocabulary
  @proto static degraded = [
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
    const disabled = this.flag("disabled")
    const toggle = this.flag("toggle")
    const link = href !== null
    // a bare `icon` (`"true"`) names no glyph, so it can't name the button either
    const icon = Converters.icon(this.attr("icon"))
    const iconOnly = icon && !this.attr("content") && !host.textContent?.trim()
    const control = link
      ? this.create("a", {
          href: disabled ? null : href,
          target: this.attr("target"),
          download: this.attr("download"),
          rel: this.attr("target") === "_blank" ? "noopener" : null,
          "aria-disabled": disabled ? "true" : null,
          tabindex: disabled ? "-1" : null
        })
      : this.create("button", { type: "button", disabled })
    control.className = this.classes()
    this.decorate(control, "button")
    if (toggle) control.setAttribute("aria-pressed", String(this.flag("active")))
    // An icon-only button has no glyph here, so its name would be empty.
    if (iconOnly && !control.hasAttribute("aria-label")) control.setAttribute("aria-label", icon)
    control.append(this.slot(this.attr("content")))

    this.listen<MouseEvent>(control, "click", (event) => {
      if (disabled) return event.preventDefault()
      if (toggle) control.setAttribute("aria-pressed", String(control.classList.toggle("active")))
      this.invoke(control, event)
      this.activate()
    })
    // `host.click()` presses the control, as in the element (only the host's click reaches the page)
    this.listen<MouseEvent>(host, "click", (event) => {
      if (event.composedPath()[0] === host && !disabled && !event.defaultPrevented) HostPress.press(control)
    })
    return [control]
  }

  /**
   * Invoker command:  natively through the inner button's `commandForElement` (set now, the browser acts after this
   * click), else run by `Invoker`.
   */
  private invoke(control: HTMLElement, event: MouseEvent) {
    const command = this.attr("command")
    if (!command) return
    const target = Invoker.resolve(this.host, this.attr("commandfor") ?? undefined)
    if (UI.browser.supports.invokers && control instanceof HTMLButtonElement) {
      control.setAttribute("command", command)
      control.commandForElement = target
    } else if (target && !event.defaultPrevented) Invoker.run(target, command, this.host)
  }

  /** Submit or reset the host's form, by `type`. */
  private activate() {
    const type = this.attr("type")
    const form = this.form()
    if (!form) return
    if (type === "reset") return form.reset()
    if (type !== "submit") return
    // `requestSubmit()` builds the entries synchronously, so the value need only exist during the call.
    const submitted = this.formInternals && this.attr("name") !== null
    if (submitted) this.formInternals!.setFormValue(this.attr("value") ?? "")
    try {
      form.requestSubmit()
    } finally {
      if (submitted) this.formInternals!.setFormValue(null)
    }
  }
}
