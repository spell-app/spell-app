import { onSettled } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, proto, UIElement } from "$/ui/core"

import { epicUpdateVocabulary } from "./epic-update.vocabulary.en"
import { EpicUpdateFallback } from "./epic-update.fallback"
import { LABEL, type EpicUpdateVocabulary } from "./epic-update.types"

import updateCSS from "./epic-update.css?inline"

/****************
 * ### `<epic-update>`
 * An UPDATE marker, while a phase is active (`phase <N> done` removes its phase's):
 * - empty:  an orange `UPDATE` label, inline (on a new or changed item's line, in prose)
 * - with children:  a NOTE -- a warning-tinted box headed by the label, its children inside -- just before the
 *   prose it's about (`:state(note)`)
 * - Its tooltip names the phase:  `Changed during P3`.
 ****************/
export class EpicUpdate extends UIElement<EpicUpdateVocabulary> {
  @proto static vocabulary = epicUpdateVocabulary
  @proto static styles = { "epic-update": updateCSS }
  @proto static Fallback = EpicUpdateFallback

  /** Has it children:  a note, not a bare label? */
  readonly note = new Cell(false)

  protected hostStates() {
    return { note: this.note.get() }
  }

  /** Follow its children:  a note while it has any. */
  mount(): JSX.Element {
    if (!isServer) {
      onSettled(() => {
        const update = () => this.note.set(EpicUpdate.hasContent(this.host))
        const observer = new MutationObserver(update)
        observer.observe(this.host, { childList: true, characterData: true, subtree: true })
        update()
        return () => observer.disconnect()
      })
    }
    return super.mount()
  }

  render(): JSX.Element {
    return (
      <span class={this.classes()} part={this.part("base")}>
        <span
          class={LABEL}
          part={this.part("label")}
          title={this.attrs.phase === undefined ? undefined : this.text("tip", { phase: this.attrs.phase })}
        >
          {this.text("label")}
        </span>
        <slot />
      </span>
    )
  }

  /** Has `host` any content:  an element, or text that isn't blank? */
  private static hasContent(host: Element): boolean {
    return Array.from(host.childNodes).some((node) => node.nodeType === Node.ELEMENT_NODE || !!node.textContent?.trim())
  }
}
