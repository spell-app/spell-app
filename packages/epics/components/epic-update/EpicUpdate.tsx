import { Show } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"

// the fold pieces every `<epic-*>` fold shares:  their files, not `epic-item`'s barrel (which would define it here)
import { FOLDS, Fold } from "$/epics/components/epic-item/Fold"

import { epicUpdateVocabulary } from "./EpicUpdate.en"

import updateCSS from "./EpicUpdate.css?inline"
import foldCSS from "$/epics/components/epic-item/Fold.css?inline"

/****************
 * ### `EpicUpdate`
 * The component behind `<epic-update>`:
 * an UPDATE marker, while a phase is active (`phase <N> done` removes its phase's):
 * - empty:  an orange `UPDATE` label, inline (on a new or changed item's line, in prose)
 * - with children:  a NOTE (`:state(note)`), just before the prose it's about
 *   - a warning-tinted box headed by the fold chevron and the label, its children inside
 *   - it folds by its heading (Owen, 2026-10-08:  everything in a section box folds):
 *     open to start with;  page state;  folded, `hidden="until-found"`
 * - Its tooltip names the phase:  `Changed during P3`.
 ****************/
export class EpicUpdate extends E.UIComponent<typeof epicUpdateVocabulary> {
  @E.proto static vocabulary = epicUpdateVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "epic-fold-button": foldCSS, "epic-update": updateCSS }
  } satisfies Partial<E.ElementSetup>

  /** A note's open or folded state:  open to start with. */
  readonly fold = new Fold(() => true)

  /** A note, unfolded. */
  @E.cssState("open")
  get isOpen(): boolean {
    return this.isNote && this.fold.isOpen()
  }

  /** Has it children:  a note, not a bare label?  Follows its children;  never on a server. */
  @E.cssState("note")
  @E.watches({ childList: true, characterData: true, subtree: true })
  get isNote(): boolean {
    return !isServer && EpicUpdate.hasContent(this.domElement)
  }

  render(): JSX.Element {
    return (
      <span class={this.rootClass} part={this.partForName("base")}>
        <span ref={this.fold.heading} class={[HEAD, { [FOLDS]: this.isNote }]}>
          <Show when={this.isNote}>
            {this.fold.button({ controls: BODY_ID, labelledBy: LABEL_ID, part: this.partForName("toggle") })}
          </Show>
          <span
            id={LABEL_ID}
            class={LABEL}
            part={this.partForName("label")}
            title={this.phase === undefined ? undefined : this.translationForKey("tip", { phase: this.phase })}
          >
            {this.translationForKey("label")}
          </span>
        </span>
        <span
          ref={this.fold.watch}
          id={BODY_ID}
          class={BODY}
          part={this.partForName("body")}
          hidden={this.isNote ? this.fold.hidden() : undefined}
        >
          <slot />
        </span>
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

/** Classes of the shadow markup:  the heading (the chevron and the label), the label, the note's text. */
const HEAD = "head"
const LABEL = "label"
const BODY = "body"

/** Ids of the shadow markup:  the label (the fold button's name), the box it folds. */
const LABEL_ID = "label"
const BODY_ID = "body"
