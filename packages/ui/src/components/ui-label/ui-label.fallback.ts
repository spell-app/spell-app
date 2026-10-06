import { E, UIT } from "$/ui/core"
import { DETAIL } from "./ui-label.types"
import { labelVocabulary } from "./ui-label.vocabulary.en"

/****************
 * ### `LabelFallback`
 * `<span part="label" class="ui ... label">` (`<a>` with `href`) around a `<slot>`, then the `detail` shorthand.
 ****************/
export class LabelFallback extends E.NativeFallback<typeof labelVocabulary> {
  @E.proto static vocabulary = labelVocabulary
  @E.proto static degraded = ["`removable` delete button and `ui-remove`", "`icon` glyph", "`image` shorthand"]

  protected override build() {
    const href = this.attr("href")
    const disabled = this.flag("disabled")
    const detail = this.attr("detail")
    const label = this.create(
      href === undefined ? "span" : "a",
      href === undefined
        ? { class: this.classes() }
        : {
            class: this.classes(),
            href: disabled ? undefined : href,
            target: this.attr("target"),
            "aria-disabled": disabled ? UIT.TRUE : undefined
          },
      this.slot()
    )
    if (detail) label.append(this.create("span", { class: DETAIL, part: DETAIL }, detail))
    return [this.decorate(label, "label")]
  }
}
