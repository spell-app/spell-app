import { onSettled } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { epicUpdateVocabulary } from "./EpicUpdate.en"

import updateCSS from "./EpicUpdate.css?inline"

/****************
 * ### `EpicUpdate`
 * The component behind `<epic-update>`:  an UPDATE marker, while a phase is active (`phase <N> done` removes its
 * phase's):
 * - empty:  an orange `UPDATE` label, inline (on a new or changed item's line, in prose)
 * - with children:  a NOTE -- a warning-tinted box headed by the label, its children inside -- just before the
 *   prose it's about (`:state(note)`)
 * - Its tooltip names the phase:  `Changed during P3`.
 ****************/
export class EpicUpdate extends E.UIComponent<typeof epicUpdateVocabulary> {
  @E.proto static vocabulary = epicUpdateVocabulary
  @E.protoMerged static elementSetup = { styleSheets: { "epic-update": updateCSS } } satisfies Partial<E.ElementSetup>

  /** Has it children:  a note, not a bare label? */
  @E.cssState("note")
  @E.state
  accessor isNote = false

  /** Follow its children:  a note while it has any. */
  onMount(): JSX.Element {
    if (!isServer) {
      onSettled(() => {
        const update = () => (this.isNote = EpicUpdate.hasContent(this.domElement))
        const observer = new MutationObserver(update)
        observer.observe(this.domElement, { childList: true, characterData: true, subtree: true })
        update()
        return () => observer.disconnect()
      })
    }
    return super.onMount()
  }

  render(): JSX.Element {
    return (
      <span class={this.rootClass} part={this.partForName("base")}>
        <span
          class={LABEL}
          part={this.partForName("label")}
          title={this.phase === undefined ? undefined : this.translationForKey("tip", { phase: this.phase })}
        >
          {this.translationForKey("label")}
        </span>
        <slot />
      </span>
    )
  }

  /** Has `element` any content:  an element, or text that isn't blank? */
  private static hasContent(element: Element): boolean {
    return Array.from(element.childNodes).some(
      (node) => node.nodeType === Node.ELEMENT_NODE || !!node.textContent?.trim()
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicUpdate extends E.AttributeValues<typeof epicUpdateVocabulary> {}

/** Class of the label. */
const LABEL = "label"
