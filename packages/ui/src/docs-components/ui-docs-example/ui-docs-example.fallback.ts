import { NativeFallback, proto } from "$/ui/core"

import { docsExampleVocabulary } from "./ui-docs-example.vocabulary.en"
import { ExampleSource } from "./ExampleSource"
import { CODE_PANE_ID, DEFAULT_LEVEL, MAX_LEVEL, MIN_LEVEL } from "./ui-docs-example.types"

/****************
 * ### `DocsExampleFallback`
 * `<section part="example" class="ui ... example">`:  an `<hN part="header">`, a `<p part="description">`, the live
 * example in `<div part="demo">` (`<slot>`), and, with `code`, the markup in `<pre part="code"><code>`.
 * - Native elements only:  no widgets, no highlighting, no code button (the `code` attribute alone opens it).
 ****************/
export class DocsExampleFallback extends NativeFallback<typeof docsExampleVocabulary> {
  @proto static vocabulary = docsExampleVocabulary
  @proto static degraded = [
    "plain heading and paragraph, no `<ui-header>`",
    "no code button:  only the `code` attribute shows the code",
    "unhighlighted code, no copy button",
    "the description's backticks stay as typed;  the `description` slot is ignored"
  ]

  protected override build() {
    const header = this.attr("header")
    const description = this.attr("description")
    const level = Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Number(this.attr("level")) || DEFAULT_LEVEL))
    const children: Node[] = []
    if (header) children.push(this.decorate(this.create(`h${level}` as "h4", {}, header), "header"))
    if (description) children.push(this.decorate(this.create("p", {}, description), "description"))
    children.push(this.decorate(this.create("div", {}, this.slot()), "demo"))
    if (this.flag("code")) {
      const pre = this.create("pre", { id: CODE_PANE_ID }, this.create("code", {}, ExampleSource.of(this.host)))
      children.push(this.decorate(pre, "code"))
    }
    return [this.decorate(this.create("section", { class: this.classes() }, ...children), "example")]
  }
}
