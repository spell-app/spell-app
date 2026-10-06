import { E } from "$/ui/core"
import { markdownVocabulary } from "./ui-markdown.vocabulary.en"

/****************
 * ### `MarkdownFallback`
 * `<article part="body" class="ui ... markdown">` with the element's own text, unrendered, in a `<pre>`:  markdown
 * reads well enough as it's written.
 ****************/
export class MarkdownFallback extends E.NativeFallback<typeof markdownVocabulary> {
  @E.proto static vocabulary = markdownVocabulary
  @E.proto static degraded = [
    "rendering (the markdown shows as written), `source`, `headings`",
    "`content`, `save()`, `reload()` and their events"
  ]

  protected override build() {
    const text = this.create("pre", { class: SOURCE_CLASS }, E.SourceElement.inlineTextFor(this.host))
    return [this.decorate(this.create("article", { class: this.classes() }, text), "body")]
  }
}

/** Class of the `<pre>` holding the text as written. */
const SOURCE_CLASS = "source"
