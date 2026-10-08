import { Show, createMemo, onSettled, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, proto, UIElement } from "$/ui/core"

import { epicVersionVocabulary } from "./epic-version.vocabulary.en"
import { BODY, HEADING, VERSION_TAG, type EpicVersionVocabulary } from "./epic-original.types"

import originalCSS from "./epic-original.css?inline"

/****************
 * ### `<epic-version>`
 * One earlier version of an item's text, in its Original Discussion:  a small heading, then the text as it was.
 * - Heading:  `As of <as-of>` (when it was replaced);  the first version, undated, `As first written` -- but only once
 *   there's a second:  a lone version needs no heading (plan-doc.md, "Markup the script writes").
 ****************/
export class EpicVersion extends UIElement<EpicVersionVocabulary> {
  @proto static vocabulary = epicVersionVocabulary
  @proto static styles = { original: originalCSS }
  @proto static delegatesFocus = false

  /** Versions beside it, itself included:  followed as its parent's children change. */
  readonly versions = new Cell(untrack(() => this.countVersions()))

  /** Its heading, or `undefined` for a lone first version. */
  readonly heading = createMemo(() => {
    const asOf = this.attrs.asOf
    if (asOf) return this.text("asOf", { asOf })
    return this.versions.get() > 1 ? this.text("firstWritten") : undefined
  })

  mount(): JSX.Element {
    if (!isServer) {
      onSettled(() => {
        const parent = this.host.parentElement
        if (!parent) return undefined
        const observer = new MutationObserver(() => this.versions.set(this.countVersions()))
        observer.observe(parent, { childList: true })
        this.versions.set(this.countVersions())
        return () => observer.disconnect()
      })
    }
    return super.mount()
  }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <Show when={this.heading()}>
          <div class={HEADING} part={this.part("heading")}>
            {this.heading()}
          </div>
        </Show>
        <div class={BODY} part={this.part("body")}>
          <slot />
        </div>
      </div>
    )
  }

  /** `<epic-version>`s in its parent, read now. */
  private countVersions(): number {
    return this.host.parentElement?.querySelectorAll(`:scope > ${VERSION_TAG}`).length ?? 1
  }
}
