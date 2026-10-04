import { NativeFallback, proto } from "$/ui/core"

import { includeVocabulary } from "./ui-include.vocabulary.en"

/****************
 * ### `IncludeFallback`
 * `<div part="content" class="ui include">` holding the placeholder (`<slot>`) and a link to `source`, so the
 * included page is still one click away.
 ****************/
export class IncludeFallback extends NativeFallback<typeof includeVocabulary> {
  @proto static vocabulary = includeVocabulary
  @proto static degraded = [
    "the included markup itself (a link to `source` instead), `load`, `select`, `page-styles`",
    "`content`, `save()`, `reload()` and their events"
  ]

  protected override build() {
    const box = this.decorate(this.create("div", { class: this.classes() }, this.slot()), "content")
    const source = this.attr("source")
    if (source) box.append(this.create("a", { href: source }, source))
    return [box]
  }
}
