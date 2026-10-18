import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/spell-solid"

// the folded panel, shared with `<epic-aside>`:  its file, not the `epic-aside` barrel (which would define it here)
import { EpicPanel } from "$/epics/components/epic-aside/EpicPanel"

import { epicCodeVocabulary } from "./EpicCode.en"

import panelCSS from "$/epics/components/epic-aside/EpicPanel.css?inline"
import codeCSS from "./EpicCode.css?inline"
import tooltipCSS from "$/epics/components/epic-item/Tooltip.css?inline"

/****************
 * ### `EpicCode`
 * The component behind `<epic-code>`:  a folded code block in prose (an `EpicPanel`).
 * - the brand's code well, its heading the `title` in mono, the code inside on a card, highlighted
 * - The code is the element's OWN text:  its `<pre>` child's (else its whole text), which stays in the doc as written.
 *   - never the text of what's slotted in its title row (`slot="actions"`, `EpicPanel`)
 *   - Spell UI's `<ui-code>` in the shadow root draws it:  the colours (`language`, else guessed), the copy button
 *   - the `<pre>` itself isn't slotted, so the code shows once
 *   - followed:  a live update or a part loading changes what's drawn
 * - Folded to start with, unless `open`;  find-in-page and a click unfold it.
 * - Before the pack loads (or without it), the `<pre>` shows as the page's own code block.
 * - SIDE EFFECT:  observes its own children, from its first read of them on (`@watches`).
 ****************/
export class EpicCode extends EpicPanel<typeof epicCodeVocabulary> {
  @E.proto static vocabulary = epicCodeVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "epic-tooltip": tooltipCSS, "epic-panel": panelCSS, "epic-code": codeCSS },
    // `disabled`:  unusable, its fold and copy buttons too;  `loading`:  the shared spinner
    disabled: "unusable",
    loading: "loader"
  } satisfies Partial<E.ElementSetup>

  /** The code, as the doc holds it:  its children's text, followed as they change;  none on a server. */
  @E.watches({ childList: true, characterData: true, subtree: true })
  get code(): string {
    return isServer ? "" : EpicCode.codeOf(this.domElement)
  }

  /** Open to start with when the doc says `open`. */
  protected startsOpen(): boolean {
    return !!this.open
  }

  /** Its `title`, or `Code`. */
  protected heading(): string {
    return this.title || this.translationForKey("code")
  }

  /** The code, highlighted, with a copy button. */
  protected body(): JSX.Element {
    return (
      <ui-code class={CODE} part={this.partForName("code")} language={this.language} copy="">
        {this.code}
      </ui-code>
    )
  }

  /** The code in `element`:  its `<pre>` child's text, else all of its text but its slotted buttons' (`actions`). */
  private static codeOf(element: Element): string {
    const pre = element.querySelector(":scope > pre")
    if (pre) return pre.textContent ?? ""
    return Array.from(element.childNodes)
      .filter((node) => node.nodeType !== Node.ELEMENT_NODE || !(node as Element).hasAttribute("slot"))
      .map((node) => node.textContent ?? "")
      .join("")
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicCode extends E.AttributeValues<typeof epicCodeVocabulary> {}

/** Class of the `<ui-code>`. */
const CODE = "code"
