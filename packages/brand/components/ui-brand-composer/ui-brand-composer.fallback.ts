import { NativeFallback, proto } from "$/ui/core"

import { brandComposerVocabulary } from "./ui-brand-composer.vocabulary.en"
import { BRAND, DEFAULT_ROWS, ENTER } from "./ui-brand-composer.types"

/****************
 * ### `BrandComposerFallback`
 * A native `<textarea part="textarea">` and a `<button part="cast">Cast spell</button>` in the element's root
 * (`<div class="composer brand" part="composer">`).
 * - Still a form control:  typing sets `host.value`, pushes it into the host's form value and dispatches a composed
 *   `ui-input`;  leaving it edited `ui-change`.
 * - Still casts:  the button or Cmd / Ctrl+Enter dispatch a cancelable `ui-cast` (not with blank text), then submit
 *   the host's form.
 * - Starting value:  the host's `value` PROPERTY, else its attribute.
 * - Named by `label`, else `eyebrow`, else "Your spell".
 ****************/
export class BrandComposerFallback extends NativeFallback<typeof brandComposerVocabulary> {
  @proto static vocabulary = brandComposerVocabulary

  @proto static degraded = [
    "the card's look, the eyebrow, the tools slot and the hint",
    "`casting` (the button stays a plain button), growing with the text",
    "vetoing by re-setting `value`, form reset of the value"
  ]

  /** The text box, for `attached()` and the handlers. */
  private control?: HTMLTextAreaElement

  protected override build() {
    const host = this.host as HTMLElement & { value?: unknown }
    const disabled = this.flag("disabled")
    const control = this.create("textarea", {
      rows: this.attr("rows") ?? String(DEFAULT_ROWS),
      placeholder: this.attr("placeholder") ?? "Describe what you want to build…",
      disabled,
      "aria-label": this.attr("label") || this.attr("eyebrow") || "Your spell"
    })
    this.decorate(control, "textarea")
    control.value = typeof host.value === "string" ? host.value : (this.attr("value") ?? "")
    const button = this.create("button", { type: "button", disabled }, "Cast spell")
    this.decorate(button, "cast")
    this.listen(control, "input", (event) => {
      host.value = control.value
      this.sync()
      this.announce("ui-input", event)
    })
    this.listen(control, "change", (event) => this.announce("ui-change", event))
    this.listen<KeyboardEvent>(control, "keydown", (event) => {
      if (event.key !== ENTER || !(event.metaKey || event.ctrlKey)) return
      event.preventDefault()
      this.cast(event)
    })
    this.listen(button, "click", (event) => this.cast(event))
    this.control = control
    return [this.create("div", { class: this.classes(BRAND), part: "composer" }, control, button)]
  }

  /** First form value, which needs the text box built. */
  protected override attached() {
    this.sync()
  }

  /** Cast:  `ui-cast` (cancelable), then the form's submit;  never with blank text. */
  private cast(originalEvent: Event) {
    const value = this.control!.value
    if (!value.trim()) return
    const event = new CustomEvent("ui-cast", {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { value, originalEvent }
    })
    if (this.host.dispatchEvent(event)) this.form()?.requestSubmit()
  }

  /** Dispatch `name` with the text. */
  private announce(name: string, originalEvent: Event) {
    const detail = { value: this.control!.value, originalEvent }
    this.host.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true, detail }))
  }

  /** Push the text into the host's form value. */
  private sync() {
    this.formInternals?.setFormValue(this.control!.value)
  }
}
