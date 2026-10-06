import { E, UIT } from "$/ui/core"
import { ProgressValues } from "./ProgressValues"
import { progressVocabulary } from "./ui-progress.vocabulary.en"

/****************
 * ### `ProgressFallback`
 * A native `<progress part="bar">` in the element's root (`<div class="ui … progress" part="progress">`), with the
 * label `<div class="label" part="label">` around the slot.
 * - Value and range:  `total` (else `100`) and the bars' sum (`ProgressValues`);  no `value` while `indeterminate`,
 *   so the browser draws its own indeterminate bar.
 * - Named by the host's `aria-*` (copied), else the label (`aria-labelledby` inside the shadow root).
 * - Reads the attributes ONCE:  later changes don't update it.
 ****************/
export class ProgressFallback extends E.NativeFallback<typeof progressVocabulary> {
  @E.proto static vocabulary = progressVocabulary
  @E.proto static degraded = [
    "several bars (one native bar shows their sum), `bar-text`, `bar-colors`",
    "the `indicating`, `active` and indeterminate looks (the browser's own bar)",
    "`{placeholders}` in `label`, `ui-change` / `ui-complete`, later attribute changes"
  ]

  protected override build() {
    // `attr()` is `getAttribute()`:  `null` when absent
    const numbers = new ProgressValues({
      value: this.attr("value") ?? undefined,
      total: Number(this.attr("total")) || undefined,
      percent: this.attr("percent") ?? undefined
    })
    const max = numbers.total ?? 100
    const id = `${this.host.localName}-fallback-${++ProgressFallback.labels}`
    const bar = this.create("progress", {
      max: String(max),
      value: this.flag("indeterminate") ? undefined : String(numbers.value ?? numbers.percent),
      "aria-labelledby": this.host.hasAttribute(UIT.ARIA_LABEL) ? undefined : id
    })
    this.decorate(bar, "bar")
    const label = this.create("div", { class: UIT.LABEL, id, part: UIT.LABEL }, this.slot(this.attr("label")))
    return [this.create("div", { class: this.classes(), part: PROGRESS }, bar, label)]
  }

  /** Fallback labels made so far, for their ids.  Static:  ids are unique page-wide. */
  private static labels = 0
}

/** The root's part. */
const PROGRESS = "progress"
