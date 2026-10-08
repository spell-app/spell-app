import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { epicAsideVocabulary } from "./EpicAside.en"
import { EpicPanel } from "./EpicPanel"

import panelCSS from "./EpicPanel.css?inline"
import asideCSS from "./EpicAside.css?inline"

/****************
 * ### `EpicAside`
 * The component behind `<epic-aside>`:  a folded aside in prose (an `EpicPanel`) -- the brand's ivory panel, headed
 * `Aside:  <title>` in the headings' italic serif, its children inside.
 * - Folded to start with:  a digression the main text can skip.  Find-in-page and a click unfold it.
 ****************/
export class EpicAside extends EpicPanel<typeof epicAsideVocabulary> {
  @E.proto static vocabulary = epicAsideVocabulary
  @E.proto static styleSheets = { "epic-panel": panelCSS, "epic-aside": asideCSS }

  /** `Aside:  <title>`, or `Aside` without one. */
  protected heading(): JSX.Element {
    const title = this.title
    return title ? this.translationForKey("heading", { title }) : this.translationForKey("aside")
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicAside extends E.AttributeValues<typeof epicAsideVocabulary> {}
