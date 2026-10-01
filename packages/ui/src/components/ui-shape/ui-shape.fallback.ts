import { NativeFallback, proto, type NativeFallbackRoot } from "$/ui/core"

import { shapeVocabulary, sideVocabulary } from "./ui-shape.vocabulary.en"

/** Either vocabulary, for brevity. */
type Vocabulary = typeof shapeVocabulary | typeof sideVocabulary

/****************
 * ### `ShapeFallback`
 * A shape or a side without Solid, keyed by the host's tag -- one class for both, as they share `ui-shape.css`:
 * - `<ui-shape>`:  `<div class="ui ... shape" part="shape"><div class="sides" part="sides"><slot>`
 * - `<ui-side>`:  `<div class="side" part="side"><slot>`;  a working shape still shows / hides it (its states are
 *   on the host)
 ****************/
export class ShapeFallback extends NativeFallback<Vocabulary> {
  @proto static degraded = [
    "a failed shape:  every side shows, stacked;  no flips, `ui-change` or `flip()` / `next()` / `previous()` " +
      "(they resolve `false`)"
  ]

  constructor(host: HTMLElement, root: NativeFallbackRoot, error?: unknown, internals?: ElementInternals) {
    super(host, root, error, internals)
    // Shadows the prototype's placeholder vocabulary, see `@proto`.
    this.vocabulary = host.localName === sideVocabulary.tag ? sideVocabulary : shapeVocabulary
  }

  protected override build() {
    if (this.vocabulary === sideVocabulary) {
      return [this.decorate(this.create("div", { class: SIDE }, this.slot()), SIDE)]
    }
    const sides = this.create("div", { class: SIDES, part: SIDES, "aria-live": POLITE }, this.slot())
    return [this.decorate(this.create("div", { class: this.classes() }, sides), SHAPE)]
  }
}

/** Classes and parts of the markup contract (`ui-shape.css`). */
const SHAPE = "shape"
const SIDES = "sides"
const SIDE = "side"

/** Live region politeness of the sides box, as the element's. */
const POLITE = "polite"
