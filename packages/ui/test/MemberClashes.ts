import type { DOMElement, UIComponentClass } from "@spell-app/spell-element"
import type { ComponentVocabulary } from "$/ui/vocabulary"
import { E } from "$/ui/core"
import { F } from "$/ui/forms"
import { ElementFixture } from "$/ui/test/ElementFixture"

/****************
 * ### `MemberClashes`
 * The attributes of a set's vocabularies named like a member of `UIComponent` or `FormComponent`:
 * a base's member wins over the attribute's getter, so the attribute would read wrong.
 * - Each set runs it over its own vocabularies, in its own tests:  Spell UI's (`tests/ui/test/vocabularies.test.ts`),
 *   the brand's and the app's.
 * - A browser test helper:  it draws a bare element once, to read `UIComponent`'s instance fields.
 ****************/
export class MemberClashes {
  /**
   * `<tag> member` for each attribute of `modules`' vocabularies that a base's member hides;  and how many
   * vocabularies it read.
   * - `modules`:  an eager `import.meta.glob()` of the set's `<Name>.en.ts` files.
   */
  static async find(
    modules: Record<string, Record<string, unknown>>
  ): Promise<{ vocabularies: number; clashes: string[] }> {
    const vocabularies = Object.values(modules).flatMap((module) =>
      Object.values(module).filter(MemberClashes.isVocabulary)
    )
    const taken = await MemberClashes.baseMembers()
    const clashes = vocabularies.flatMap(({ tag, attributes }) =>
      attributes
        .map(({ name }) => name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase()))
        .filter((key) => taken.has(key))
        .map((key) => `<${tag}> ${key}`)
    )
    return { vocabularies: vocabularies.length, clashes }
  }

  /** Is `value` a vocabulary (a `tag` and `attributes`)? */
  static isVocabulary(value: unknown): value is ComponentVocabulary {
    return typeof value === "object" && value !== null && "tag" in value && "attributes" in value
  }

  /** Every member name of the bases:  `UIComponent`'s instance fields, and both bases' prototype chains. */
  private static async baseMembers(): Promise<Set<string>> {
    if (!customElements.get(BARE_TAG)) {
      Object.defineProperty(BareComponent.prototype, "vocabulary", { value: BARE_VOCABULARY })
      ;(BareComponent as unknown as UIComponentClass & typeof E.UIComponent).define()
    }
    const { component } = await ElementFixture.render<DOMElement>(`<${BARE_TAG}></${BARE_TAG}>`)
    return new Set([
      ...Object.keys(component!),
      ...namesOf(E.UIComponent.prototype),
      ...namesOf(F.FormComponent.prototype)
    ])
  }
}

/** A component with no members of its own:  its own keys are `UIComponent`'s instance fields. */
class BareComponent extends E.UIComponent<any> {
  render() {
    return document.createElement("span")
  }
}

/** The bare component's tag. */
const BARE_TAG = "x-member-clashes"

/** The bare component's vocabulary:  nothing of its own. */
const BARE_VOCABULARY = {
  tag: BARE_TAG,
  noun: "bare",
  attributes: [],
  events: [],
  slots: [],
  parts: [],
  states: [],
  texts: []
} satisfies ComponentVocabulary

/** Every member name on `prototype` and the prototypes above it, up to `Object`. */
function namesOf(prototype: object): string[] {
  const names: string[] = []
  for (let current = prototype; current !== Object.prototype; current = Object.getPrototypeOf(current))
    names.push(...Object.getOwnPropertyNames(current))
  return names
}
