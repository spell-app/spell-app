import * as UIT from "$/ui/components/components.types"

import { sharedEs } from "./SharedVocabulary.es"
import type { AttributeSpec, ComponentVocabulary, SharedDictionary, StateSpec } from "./vocabulary.types"

/****************
 * ### `SharedVocabulary`
 * The attributes and states EVERY component has, without its vocabulary declaring them:
 * `disabled`, `loading`, `visible` and `animation` (epic `spell-element`, P8 and P12).
 * - `UIComponent` reads them ("Shared states", "Shown or hidden"):
 *   so `<ui-menu disabled>`, `<ui-table loading>`, `<ui-message visible="false">`
 *   and `<ui-modal animation="fly down">` work, though those vocabularies never name them.
 * - What each means for a family is a key of its `elementSetup` (`disabled`, `loading`, `visible`, `animation`).
 * - `visible` is the platform's `hidden` turned round:  one fact, two names (`DOMElement`, "Shown or hidden").
 * - A vocabulary that declares one of them itself keeps its own spec, and its own meaning:
 *   `<ui-button disabled>` has Fomantic's look.
 *   - The shared spec is added only where the vocabulary has none of that name.
 *   - NOTE: none declares its own `visible` or `animation` any more (P12):  keep it that way,
 *     or that element loses `visible` / `hidden` as one fact.
 * - The platform's own `hidden` and `inert` need nothing here:  every element has them already.
 * - A translated tag names them in its own language (`<ie-boton desactivado>`):
 *   each language has a small file of them, `SharedVocabulary.<lang>.ts` (`translated()`),
 *   which `Vocabulary.resolve()` reads for every dictionary of that `lang`;  the dictionary's own names win.
 * - Pure data and lookups, no DOM, no element layer:
 *   node reads it with the vocabularies (`yarn site:data` lists them on every tag).
 ****************/
export class SharedVocabulary {
  /**
   * `vocabulary`'s attributes, then each shared one it doesn't declare itself, in `SHARED_ATTRIBUTES` order.
   * - What `ElementDefinition` resolves:  the DOM element observes, converts and reflects these.
   * - The same array for the same vocabulary, every time.
   */
  static attributesFor(vocabulary: ComponentVocabulary): readonly AttributeSpec[] {
    return SharedVocabulary.withShared(vocabulary).attributes
  }

  /** `vocabulary`'s states, then each shared one it doesn't name itself:  for docs and the manifests. */
  static statesFor(vocabulary: ComponentVocabulary): readonly StateSpec[] {
    return SharedVocabulary.withShared(vocabulary).states
  }

  /**
   * Does `vocabulary` take the SHARED attribute `name`?
   * - False when it declares its own of that name, or when `name` isn't a shared attribute.
   */
  static takesShared(vocabulary: ComponentVocabulary, name: string): boolean {
    return SharedVocabulary.withShared(vocabulary).shared.has(name)
  }

  /**
   * The name language `lang` gives the shared attribute `name`, from its `SharedVocabulary.<lang>.ts`:
   * `translated("es", "disabled")` => `"desactivado"`.
   * - `undefined` when the language has no such file, or `name` isn't a shared attribute.
   */
  static translated(lang: string, name: string): string | undefined {
    return SHARED_DICTIONARIES.get(lang)?.attributes[name as keyof SharedDictionary["attributes"]]
  }

  /** Is `name` one of the shared attributes? */
  static isSharedAttribute(name: string): boolean {
    return SHARED_ATTRIBUTES.some((spec) => spec.name === name)
  }

  /**
   * `vocabulary` with the shared attributes and states it lacks, worked out once per vocabulary.
   * - Static:  vocabularies are page-wide data, and so is this cache.
   */
  private static withShared(vocabulary: ComponentVocabulary): WithShared {
    let found = SharedVocabulary.cache.get(vocabulary)
    if (found) return found
    const declared = new Set(vocabulary.attributes.map(({ name }) => name))
    const added = SHARED_ATTRIBUTES.filter(({ name }) => !declared.has(name))
    const stateNames = new Set(vocabulary.states.map(({ name }) => name))
    found = {
      attributes: added.length ? [...vocabulary.attributes, ...added] : vocabulary.attributes,
      states: [...vocabulary.states, ...SHARED_STATES.filter(({ name }) => !stateNames.has(name))],
      shared: new Set(added.map(({ name }) => name))
    }
    SharedVocabulary.cache.set(vocabulary, found)
    return found
  }

  /**
   * `withShared()`'s results, by vocabulary.
   * - Static:  page-wide.
   */
  private static readonly cache = new WeakMap<ComponentVocabulary, WithShared>()
}

/** One vocabulary with the shared attributes and states it lacks (`SharedVocabulary.withShared()`). */
type WithShared = {
  /** its own attributes, then the shared ones it lacks */
  readonly attributes: readonly AttributeSpec[]
  /** its own states, then the shared ones it lacks */
  readonly states: readonly StateSpec[]
  /** names of the shared attributes it takes (doesn't declare itself) */
  readonly shared: ReadonlySet<string>
}

/**
 * The attributes every component takes.
 * - `boolean` kinds:  no class word (a vocabulary's own `disabled` / `loading` brings Fomantic's class).
 * - `visible` and `animation` have no default of their own:  the family's (`elementSetup.visible`, `.animation`).
 */
const SHARED_ATTRIBUTES: readonly AttributeSpec[] = [
  {
    name: "disabled",
    kind: "boolean",
    description:
      "Can't be used:  dimmed, out of the tab order, and everything inside it inert;  `aria-disabled`.  " +
      "Shared by every element;  a family may give it a meaning of its own (`elementSetup.disabled`)."
  },
  {
    name: "loading",
    kind: "boolean",
    description:
      "Busy:  dimmed under a loader, and inert;  `aria-busy`.  " +
      "Shared by every element;  a family may draw its own loader (`elementSetup.loading`)."
  },
  {
    name: "visible",
    kind: "boolean",
    description:
      "Shown:  the platform's `hidden`, turned round (`el.visible === !el.hidden`).  " +
      'Writing either one shows or hides the element with its `animation`;  `visible="false"` writes `hidden`.  ' +
      "Neither written:  the family decides (a modal starts hidden, a message shown).  " +
      "Both written in markup and disagreeing:  `hidden` wins."
  },
  {
    name: "animation",
    kind: "enum",
    values: UIT.Animations,
    description:
      "How it shows and hides (Fomantic's names:  `fade up`, `scale`, `fly down` ...);  default its family's, " +
      "else `fade`.  `none` turns motion off for it and everything inside it, as the person's reduced-motion " +
      "setting does;  an element inside can't turn it back on."
  }
]

/** Each language's names for the shared attributes, by `lang`:  one `SharedVocabulary.<lang>.ts` each. */
const SHARED_DICTIONARIES: ReadonlyMap<string, SharedDictionary> = new Map([[sharedEs.lang, sharedEs]])

/** The states `UIComponent` sets on every element, for the shared attributes. */
const SHARED_STATES: readonly StateSpec[] = [
  { name: "disabled", description: "`disabled` is set (or, on a form control, a `<fieldset disabled>` around it)." },
  { name: "loading", description: "`loading` is set." },
  {
    name: "busy",
    description: "`loading`, and the element draws the shared loader:  a spinner over it (`elementSetup.loading`)."
  },
  {
    name: "dimmed",
    description: "Disabled or loading the shared way:  everything inside is inert, and dimmed."
  },
  { name: "hidden", description: 'Hidden (`hidden`, or `visible="false"`), once its animation has run.' },
  {
    name: "hiding",
    description: "Animating out:  `hidden` is already set, and the element stays on screen until it ends."
  }
]
