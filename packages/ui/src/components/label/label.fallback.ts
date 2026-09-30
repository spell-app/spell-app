import { NativeFallback, proto } from "$/core"

import { labelVocabulary } from "./label.vocabulary.en"

/****************
 * ### `LabelFallback`
 * `<span part="label" class="ui ... label">` (`<a>` with `href`) around a `<slot>`, then the `detail` shorthand.
 ****************/
export class LabelFallback extends NativeFallback<typeof labelVocabulary> {
  @proto static vocabulary = labelVocabulary
  @proto static degraded = ["`removable` delete button and `ui-remove`", "`icon` glyph", "`image` shorthand"]

  protected override build() {
    const href = this.attr("href")
    const disabled = this.flag("disabled")
    const detail = this.attr("detail")
    const label = this.create(
      href === null ? "span" : "a",
      href === null
        ? { class: this.classes() }
        : {
            class: this.classes(),
            href: disabled ? null : href,
            target: this.attr("target"),
            "aria-disabled": disabled ? "true" : null
          },
      this.slot()
    )
    if (detail) label.append(this.create("span", { class: "detail", part: "detail" }, detail))
    return [this.decorate(label, "label")]
  }
}
