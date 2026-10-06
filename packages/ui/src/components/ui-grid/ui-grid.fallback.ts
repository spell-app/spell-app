import { E } from "$/ui/core"
import { gridVocabulary } from "./ui-grid.vocabulary.en"
import { rowVocabulary } from "./ui-row.vocabulary.en"
import { columnVocabulary } from "./ui-column.vocabulary.en"

/****************
 * ### `GridFallback`
 * `<div part="<noun>" class="ui ... <noun>"><slot></slot></div>` for a grid, row or column -- keyed by the host's
 * tag.  The same markup as the elements, so `ui-grid.css` lays it out unchanged.
 ****************/
export class GridFallback extends E.NativeFallback {
  @E.proto static vocabularies = [gridVocabulary, rowVocabulary, columnVocabulary]
  @E.proto static degraded = []

  protected override build() {
    return [this.decorate(this.create("div", { class: this.classes() }, this.slot()), this.vocabulary.noun)]
  }
}
