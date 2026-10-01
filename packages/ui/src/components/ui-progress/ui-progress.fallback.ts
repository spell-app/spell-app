import { NativeFallback, proto } from "$/ui/core"

import { progressVocabulary } from "./ui-progress.vocabulary.en"
import { ProgressValues } from "./ProgressValues"

/****************
 * ### `ProgressFallback`
 * A native `<progress part="bar">` in the element's root (`<div class="ui … progress" part="progress">`), with the
 * label `<div class="label" part="label">` around the slot.
 * - Value and range:  `total` (else `100`) and the bars' sum (`ProgressValues`);  no `value` while `indeterminate`,
 *   so the browser draws its own indeterminate bar.
 * - Named by the host's `aria-*` (copied), else the label (`aria-labelledby` inside the shadow root).
 * - Reads the attributes ONCE:  later changes don't update it.
 ****************/
export class ProgressFallback extends NativeFallback<typeof progressVocabulary> {
  @proto static vocabulary = progressVocabulary
  @proto static degraded = [
    "several bars (one native bar shows their sum), `bar-text`, `bar-colors`",
    "the `indicating`, `active` and indeterminate looks (the browser's own bar)",
    "`{placeholders}` in `label`, `ui-change` / `ui-complete`, later attribute changes"
  ]

  protected override build() {
    const numbers = new ProgressValues({
      value: this.attr("value"),
      total: Number(this.attr("total")) || undefined,
      percent: this.attr("percent")
    })
    const max = numbers.total ?? 100
    const id = `${this.host.localName}-fallback-${++counter}`
    const bar = this.create("progress", {
      max: String(max),
      value: this.attr("indeterminate") === null ? String(numbers.value ?? numbers.percent) : null,
      "aria-labelledby": this.host.hasAttribute("aria-label") ? null : id
    })
    this.decorate(bar, "bar")
    const label = this.create("div", { class: "label", id, part: "label" }, this.slot(this.attr("label")))
    return [this.create("div", { class: this.classes(), part: "progress" }, bar, label)]
  }
}

/** Ids of fallback labels. */
let counter = 0
