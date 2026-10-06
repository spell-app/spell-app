import { E, UIT } from "$/ui/core"
import { dividerVocabulary } from "./ui-divider.vocabulary.en"
import { SEPARATOR } from "./ui-divider.types"

/****************
 * ### `DividerFallback`
 * `<div role="separator" part="divider" class="ui ... divider"><slot></slot></div>`.
 * - `vertical` adds `aria-orientation`;  `hidden` (spacing only) is `role="none"`, as the real element.
 ****************/
export class DividerFallback extends E.NativeFallback<typeof dividerVocabulary> {
  @E.proto static vocabulary = dividerVocabulary
  @E.proto static degraded = ["`icon` shorthand"]

  protected override build() {
    const isSpacing = this.flag("hidden")
    const divider = this.create(
      "div",
      {
        class: this.classes(),
        role: isSpacing ? UIT.NONE : SEPARATOR,
        "aria-orientation": this.flag("vertical") && !isSpacing ? UIT.VERTICAL : undefined
      },
      this.slot()
    )
    return [this.decorate(divider, "divider")]
  }
}
