import { NativeFallback, proto, SourceElement } from "$/ui/core"

import { codeVocabulary } from "./ui-code.vocabulary.en"

/****************
 * ### `CodeFallback`
 * `<div part="box" class="ui ... code"><pre part="pre"><code part="code">` with the element's own text, uncoloured:
 * the code still reads.
 ****************/
export class CodeFallback extends NativeFallback<typeof codeVocabulary> {
  @proto static vocabulary = codeVocabulary
  @proto static degraded = [
    "colours, `source` (only the element's own text shows), the copy button",
    "`content`, `save()`, `reload()` and their events, `detectedLanguage`"
  ]

  protected override build() {
    const code = this.create("code", { part: "code" }, SourceElement.inlineTextFor(this.host))
    const pre = this.create("pre", { part: "pre", tabindex: "0" }, code)
    return [this.decorate(this.create("div", { class: this.classes() }, pre), "box")]
  }
}
