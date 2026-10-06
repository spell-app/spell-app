import { E } from "$/ui/core"
import { codeVocabulary } from "./ui-code.vocabulary.en"

/****************
 * ### `CodeFallback`
 * `<div part="box" class="ui ... code"><pre part="pre"><code part="code">` with the element's own text, uncoloured:
 * the code still reads.
 ****************/
export class CodeFallback extends E.NativeFallback<typeof codeVocabulary> {
  @E.proto static vocabulary = codeVocabulary
  @E.proto static degraded = [
    "colours, `source` (only the element's own text shows), the copy button",
    "`content`, `save()`, `reload()` and their events, `detectedLanguage`"
  ]

  protected override build() {
    const code = this.create("code", { part: CODE_PART }, E.SourceElement.inlineTextFor(this.host))
    const pre = this.create("pre", { part: PRE_PART, tabindex: "0" }, code)
    return [this.decorate(this.create("div", { class: this.classes() }, pre), "box")]
  }
}

/** Part of the `<code>`;  checked against the vocabulary. */
const CODE_PART: E.PartName<typeof codeVocabulary> = "code"

/** Part of the `<pre>`;  checked against the vocabulary. */
const PRE_PART: E.PartName<typeof codeVocabulary> = "pre"
