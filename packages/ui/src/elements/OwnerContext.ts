import type { ComponentVocabulary } from "$/ui/vocabulary"

import type { OwnerFindOptions, OwnerLookup, OwnerMatch } from "./elements.types"

/**
 * Finds the component that OWNS a generic content part, so `<ui-header>` styles itself as a card header,
 * a modal header or an item header by context (`:state(in-card)`), never as `ui-card-header`.
 * - Rules:
 *   - the NEAREST owner wins:  a header in a card inside a modal is the card's
 *   - parts don't own parts:  `card > content > header` resolves to the card, mirroring Fomantic's
 *     `.ui.card > .content > .header`, with `depth` saying how many custom elements sit between
 *   - an optional `barrier` stops the climb, e.g. at a component that doesn't own this part
 * - Climbs the FLAT tree, so slotting and shadow roots don't hide the owner:  `assignedSlot`, then
 *   `parentElement`, then the shadow root's `host` -- the same order as `$/ui/util`'s `closestAcrossShadow()`,
 *   which can't be reused because it matches a selector and doesn't count or stop.
 * - Call on `connectedCallback` and `slotchange`:  moving or re-slotting a part changes its owner.
 */
export class OwnerContext {
  /**
   * Nearest owner of `element`, or `undefined`.
   * - Starts at the parent:  an element never owns itself.
   * - `owners` says which tags own this part, see `OwnerLookup`;  `OwnerContext.ownersOf()` builds one
   *   from vocabularies.
   */
  static find(element: Element, owners: OwnerLookup, options: OwnerFindOptions = {}): OwnerMatch | undefined {
    let depth = 0
    for (let current = OwnerContext.parentOf(element); current; current = OwnerContext.parentOf(current)) {
      const tag = current.localName
      const noun = OwnerContext.nounOf(current, owners)
      if (noun) return { owner: current, ownerNoun: noun, depth }
      if (options.barrier?.(current)) return undefined
      if (tag.includes("-")) depth++
    }
    return undefined
  }

  /** Custom state an owned part sets:  `card` => `in-card`, matched in CSS by `:host(:state(in-card))`. */
  static stateName(ownerNoun: string) {
    return `in-${ownerNoun}`
  }

  /**
   * `OwnerLookup` for part `partNoun`:  canonical tag => noun of every vocabulary whose `ownsParts` lists it.
   * - Pass translated tags in `tags` (canonical => localized) to match `ie-tarjeta` as `card`.
   */
  static ownersOf(
    partNoun: string,
    vocabularies: Iterable<ComponentVocabulary>,
    tags?: ReadonlyMap<string, string>
  ): Map<string, string> {
    const owners = new Map<string, string>()
    for (const vocabulary of vocabularies) {
      if (!vocabulary.ownsParts?.includes(partNoun)) continue
      owners.set(tags?.get(vocabulary.tag) ?? vocabulary.tag, vocabulary.noun)
    }
    return owners
  }

  ////////////////
  // ## Internals
  ////////////////

  /**
   * Flat-tree parent:  slot (if slotted), else light parent, else shadow host.
   * - No `ShadowRoot` global:  the server render climbs linkedom elements in node (`$/ui/server`).
   */
  private static parentOf(element: Element): Element | null {
    if (element.assignedSlot) return element.assignedSlot
    if (element.parentElement) return element.parentElement
    const root = element.getRootNode() as Partial<ShadowRoot>
    return root.nodeType === DOCUMENT_FRAGMENT_NODE && root.host ? root.host : null
  }

  /** Owner noun of `element` (by its tag) per `owners`, or `undefined` if it isn't an owner. */
  private static nounOf(element: Element, owners: OwnerLookup): string | undefined {
    const tag = element.localName
    if (owners instanceof Map) return owners.get(tag)
    if (owners instanceof Set) return owners.has(tag) ? OwnerContext.stem(tag) : undefined
    const result = (owners as (tag: string, element: Element) => unknown)(tag, element)
    if (typeof result === "string") return result || undefined
    return result ? OwnerContext.stem(tag) : undefined
  }

  /** Tag without its prefix:  `ui-card` => `card`. */
  private static stem(tag: string) {
    return tag.slice(tag.indexOf("-") + 1)
  }
}

/** `Node.DOCUMENT_FRAGMENT_NODE`, without the `Node` global. */
const DOCUMENT_FRAGMENT_NODE = 11
