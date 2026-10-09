import { Show, onSettled } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { PlanDates } from "$/epics/dates"

import { epicVersionVocabulary } from "./EpicVersion.en"

import originalCSS from "./EpicOriginal.css?inline"

/****************
 * ### `EpicVersion`
 * The component behind `<epic-version>`:  one earlier version of an item's text, in its Original Discussion -- a
 * small heading, then the text as it was.
 * - Heading:  `As of <as-of>` (when it was replaced, `10/4/26 20:49`:  `PlanDates`);  the first version, undated,
 *   `As first written` -- but only once there's a second:  a lone version needs no heading (plan-doc.md, "Markup
 *   the script writes").
 ****************/
export class EpicVersion extends E.UIComponent<typeof epicVersionVocabulary> {
  @E.proto static vocabulary = epicVersionVocabulary
  @E.proto static styleSheets = { "epic-original": originalCSS }
  @E.proto static elementSetup = { delegatesFocus: false } satisfies Partial<E.ElementSetup>

  /** Versions beside it, itself included:  followed as its parent's children change. */
  @E.state accessor versionCount = this.countVersions()

  /** Its heading, or `undefined` for a lone first version. */
  get heading(): string | undefined {
    const asOf = this.asOf
    if (asOf) return this.translationForKey("asOf", { asOf: PlanDates.format(asOf) })
    return this.versionCount > 1 ? this.translationForKey("firstWritten") : undefined
  }

  onMount(): JSX.Element {
    if (!isServer) {
      onSettled(() => {
        const parent = this.domElement.parentElement
        if (!parent) return undefined
        const observer = new MutationObserver(() => (this.versionCount = this.countVersions()))
        observer.observe(parent, { childList: true })
        this.versionCount = this.countVersions()
        return () => observer.disconnect()
      })
    }
    return super.onMount()
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("base")}>
        <Show when={this.heading}>
          <div class={HEADING} part={this.partForName("heading")}>
            {this.heading}
          </div>
        </Show>
        <div class={BODY} part={this.partForName("body")}>
          <slot />
        </div>
      </div>
    )
  }

  /** `<epic-version>`s in its parent, read now. */
  private countVersions(): number {
    return this.domElement.parentElement?.querySelectorAll(`:scope > ${VERSION_TAG}`).length ?? 1
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicVersion extends E.AttributeValues<typeof epicVersionVocabulary> {}

/** A version's tag:  a lone first version needs no heading. */
const VERSION_TAG = "epic-version"

/** Class names inside the shadow root. */
const HEADING = "heading"
const BODY = "body"
