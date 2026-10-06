import { E } from "$/ui/core"
import { POLITE, SIDE, SIDES } from "./ui-shape.types"
import { shapeVocabulary } from "./ui-shape.vocabulary.en"
import { sideVocabulary } from "./ui-side.vocabulary.en"

/****************
 * ### `ShapeFallback`
 * A shape or a side without Solid, keyed by the host's tag -- one class for both, as they share `ui-shape.css`:
 * - `<ui-shape>`:  `<div class="ui ... shape" part="shape"><div class="sides" part="sides"><slot>`
 * - `<ui-side>`:  `<div class="side" part="side"><slot>`;  a working shape still shows / hides it (its states are
 *   on the host)
 ****************/
export class ShapeFallback extends E.NativeFallback<FallbackVocabulary> {
  @E.proto static vocabularies = [shapeVocabulary, sideVocabulary]
  @E.proto static degraded = [
    "a failed shape:  every side shows, stacked;  no flips, `ui-change` or `flip()` / `next()` / `previous()` " +
      "(they resolve `false`)"
  ]

  protected override build() {
    if (this.vocabulary === sideVocabulary) {
      return [this.decorate(this.create("div", { class: SIDE }, this.slot()), SIDE)]
    }
    const sides = this.create("div", { class: SIDES, part: SIDES, "aria-live": POLITE }, this.slot())
    return [this.decorate(this.create("div", { class: this.classes() }, sides), SHAPE)]
  }
}

/** Either vocabulary:  the fallback serves both tags. */
type FallbackVocabulary = typeof shapeVocabulary | typeof sideVocabulary

/** The shape's class noun and part. */
const SHAPE = "shape"
