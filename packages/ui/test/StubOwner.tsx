import type { JSX } from "@solidjs/web"

import { protoMerged } from "$/ui/util"
import { PartVocabularies } from "$/ui/components/ui-parts/UIParts.types"
import type { ComponentVocabulary } from "$/ui/vocabulary"
import { UIComponent, type ElementSetup, type UIComponentClass } from "$/ui/elements"

/** Host layout of a stub:  a block, like the static `<div class="ui card">` it replaces. */
const STUB_CSS = ":host { display: block }"

/**
 * A stand-in OWNER component for tests and the demo, for owners of the content parts that aren't real (or aren't
 * visible) yet:  modal and popup (overlays, hidden until opened), accordion, toast and search.
 * - Renders `<div class="ui <noun>" style="display: contents"><slot>`, so the class grammar's colour / size
 *   remaps reach the parts while the HOST takes the layout (`display: block` default, overridable with an inline
 *   `style`).
 * - `StubOwner.defineFor(vocabulary)` defines one tag;  its vocabulary's `ownsParts` registers it as an owner.
 * - NOTE: test / demo scaffolding, not a component.
 */
export class StubOwner extends UIComponent {
  @protoMerged static elementSetup = { styleSheets: { "stub-owner": STUB_CSS } } satisfies Partial<ElementSetup>

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.vocabulary.noun} style={{ display: "contents" }}>
        <slot />
      </div>
    )
  }

  /** Define `vocabulary.tag` as a stub owner;  idempotent. */
  static defineFor(vocabulary: ComponentVocabulary): CustomElementConstructor {
    const existing = customElements.get(vocabulary.tag)
    if (existing) return existing
    const Stub = class extends StubOwner {}
    Object.defineProperty(Stub.prototype, "vocabulary", { value: vocabulary })
    return (Stub as unknown as UIComponentClass & typeof StubOwner).define(vocabulary.tag)
  }

  /**
   * Define `stub-<owner>` for every owner Fomantic styles parts in -- read from the parts' `in-<owner>` states --
   * except those that exist as real elements (`REAL_OWNERS`).
   */
  static defineFomanticOwners() {
    const owned = new Map<string, Set<string>>()
    for (const vocabulary of PartVocabularies) {
      for (const { name } of vocabulary.states) {
        const owner = name.slice(IN.length)
        if (!name.startsWith(IN) || REAL_OWNERS.has(owner)) continue
        if (!owned.has(owner)) owned.set(owner, new Set())
        owned.get(owner)!.add(vocabulary.noun)
      }
    }
    for (const [owner, parts] of owned) StubOwner.defineFor(StubOwner.vocabulary(`stub-${owner}`, owner, [...parts]))
  }

  /** Vocabulary for a stub owner `tag` owning `parts`. */
  static vocabulary(tag: string, noun: string, parts: readonly string[]): ComponentVocabulary {
    return {
      tag,
      noun,
      attributes: STUB_ATTRIBUTES,
      events: [],
      slots: [],
      parts: [],
      states: [],
      texts: [],
      ownsParts: parts
    }
  }
}

/** Prefix of an owner state, `in-card`. */
const IN = "in-"

/**
 * Owners that are real elements already, owning their parts:  examples and tests use those.
 * - `item`:  `<ui-item>` in `<ui-items>`.
 */
const REAL_OWNERS = new Set([
  "header",
  "label",
  "card",
  "item",
  "feed",
  "comment",
  "message",
  "list",
  "step",
  "statistic"
])

/** Attributes every stub understands. */
const STUB_ATTRIBUTES = [
  { name: "color", kind: "color", description: "Hue." },
  { name: "inverted", kind: "keyOnly", description: "Dark scheme." },
  { name: "horizontal", kind: "keyOnly", description: "Horizontal layout." }
] as const satisfies ComponentVocabulary["attributes"]
