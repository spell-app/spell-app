import type { AttributeSpec, ComponentVocabulary, StateSpec } from "./vocabulary.types"

/****************
 * ### `SharedVocabulary`
 * The attributes and states EVERY component has, without its vocabulary declaring them:
 * `disabled`, `loading` and `visible` (epic `spell-element`, P8).
 * - `UIComponent` reads them ("Shared states"):  so `<ui-menu disabled>`, `<ui-table loading>` and
 *   `<ui-message visible="false">` work, though those vocabularies never name them.
 * - What each means for a family is a key of its `elementSetup` (`disabled`, `loading`, `visibleAnimation`).
 * - A vocabulary that declares one of them itself keeps its own spec, and its own meaning:
 *   `<ui-sidebar visible>` starts hidden, `<ui-button disabled>` has Fomantic's look.
 *   The shared spec is added only where the vocabulary has none of that name.
 * - The platform's own `hidden` and `inert` need nothing here:  every element has them already.
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
   * Does `vocabulary` take the SHARED attribute `name`?  False when it declares its own of that name
   * (`<ui-sidebar>`'s `visible`), or when `name` isn't a shared attribute.
   */
  static takesShared(vocabulary: ComponentVocabulary, name: string): boolean {
    return SharedVocabulary.withShared(vocabulary).shared.has(name)
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

  /** `withShared()`'s, by vocabulary.  Static:  page-wide. */
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
 * - `visible` defaults to TRUE:  `visible="false"` is how a page hides it (`el.visible = false` writes that).
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
    default: true,
    description:
      '`visible="false"` hides it with a short animation (a fade);  `visible` (or `="true"`) brings it back.  ' +
      "Shared by every element.  The platform's `hidden` hides at once, and wins when both are set."
  }
]

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
  { name: "hidden", description: '`visible="false"`:  hidden, once its animation has run.' }
]
