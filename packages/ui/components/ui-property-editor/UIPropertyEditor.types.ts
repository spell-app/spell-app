/**
 * The `ui-property-editor` family's shared pieces:  what its three vocabularies and components share.
 * - Pure data, at the bottom of the folder's imports (`import type` only):  node loads it (`yarn site:data`).
 */

import type { E } from "$/ui/core"

/**
 * A vocabulary's names, minus `skip`'s and those `own` names already:  what an element PASSES THROUGH
 * from the element it's built on (the editor from `<ui-section>` and `<ui-form>`, the group from `<ui-section>`).
 * - Its own come first, in their order;  then each base's, in theirs.
 */
export function passThrough<T extends { name?: string; key?: string }>(
  own: readonly T[],
  bases: readonly (readonly T[])[],
  skip: readonly string[] = []
): T[] {
  const taken = new Set([...own.map(nameOf), ...skip])
  const names: T[] = [...own]
  for (const base of bases) {
    for (const item of base) {
      if (taken.has(nameOf(item))) continue
      taken.add(nameOf(item))
      names.push(item)
    }
  }
  return names
}

/** An attribute's, event's, slot's, part's or state's `name`, or a text's `key`. */
function nameOf(item: { name?: string; key?: string }): string {
  return item.name ?? item.key ?? ""
}

/** A vocabulary item list, as the vocabularies here build them. */
export type Names<K extends keyof E.ComponentVocabulary> = E.ComponentVocabulary[K]

/** The tags of the family, for `closest()`. */
export const EDITOR_TAG = "ui-property-editor"
export const GROUP_TAG = "ui-property-group"
export const PROPERTY_TAG = "ui-property"

/** Marks what an editor or a property added to its own light DOM, so it can take it away again. */
export const MADE_ATTRIBUTE = "data-ui-made"

/** `MADE_ATTRIBUTE`'s values on what an editor added:  from its schema (empty, `""`), or from its source page. */
export const MADE_FROM = { schema: "", source: "source" } as const

/**
 * On a nested editor a property made (`as="editor"`):  the property, whose value (a thing) it edits.
 * - Read from the editor or row around it, as the outer form's binding would.
 */
export const VALUE_FROM_ATTRIBUTE = "data-value-from"
