import { NativeFallback, proto } from "$/core"

import { dividerVocabulary } from "./divider.vocabulary.en"

/****************
 * ### `DividerFallback`
 * `<div role="separator" part="divider" class="ui ... divider"><slot></slot></div>`.
 * - `vertical` adds `aria-orientation`;  `hidden` (spacing only) is `role="none"`, as the real element.
 ****************/
export class DividerFallback extends NativeFallback<typeof dividerVocabulary> {
  @proto static vocabulary = dividerVocabulary
  @proto static degraded = ["`icon` shorthand"]

  protected override build() {
    const spacing = this.flag("hidden")
    const divider = this.create(
      "div",
      {
        class: this.classes(),
        role: spacing ? "none" : "separator",
        "aria-orientation": this.flag("vertical") && !spacing ? "vertical" : null
      },
      this.slot()
    )
    return [this.decorate(divider, "divider")]
  }
}
