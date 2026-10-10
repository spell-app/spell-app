/**
 * `spellCore`'s old names, kept for programs compiled before they changed -- nothing recompiles a saved program.
 * - NOT the core contract:  another target's core (Python's, later) needs only the new names.
 * - Epic `output-targets` P16 (Q47):
 *   core says "position" where it means a position, and "item" only for an element of a list.
 *   - e.g. `spellCore.itemOf(pile, card)` was always a POSITION (3), not an item:  now `spellCore.positionOf()`.
 *   - Each old name is the SAME function as its new one, so the two never drift apart.
 *   - Programs compiled before P16 still run:  `cli`'s `contract.test.ts` runs one.
 * - Epic `output-targets` P20:  compiled javascript draws with Solid's own `h()`, not `spellCore.element()`.
 *   - `element()` has no new name for the same function:  it stays here whole, with the helpers only it uses.
 */
import h from "@solidjs/h"

import { spellCore } from "./core"
import { collectionCoreMethods, positionOf } from "./collection-core"
import { collectionOtherMethods } from "./collection-other"
import type { Drawing } from "./drawing"
import { defineSpellCoreModule } from "./spellCore.types"

/** Spec accepted by `spellCore.element()`:  what javascript compiled before epic `output-targets` P20 hands it. */
export type ElementSpec = {
  /** HTML or `ui-*` tag, e.g. `"div"`, `"ui-form"`. */
  tag?: string
  /** Attributes, properties and handlers:  a function for each value that can change, as compiled JSX writes. */
  props?: Record<string, unknown> | null
  /** Children:  elements, text, and a function for each value that can change. */
  children?: unknown[]
}

export const deprecatedMethods = defineSpellCoreModule({
  /**
   * @deprecated  Solid's own `h()`, since epic `output-targets` P20:  `import { h } from "@spell/core"`,
   * then `h("div", { class: "card" }, () => this.rank)`.
   * Kept so javascript compiled before still runs.
   *
   * An element, drawn with Solid (`@solidjs/h`) -- what spell's JSX compiled to before P20, e.g.
   * `spellCore.element({ tag: "div", props: { foo: 1 }, children: [() => expr] })`.
   * - Props and children that are functions are LIVE:  called while drawing, and again when what they read changes.
   *   Handlers (`onClick`) are the exception:  called on the event.
   * - React's spellings, as spell programs write them, become the page's:
   *   - `className` => `class`
   *   - `htmlFor` => `for`
   *   - a camelCase attribute on an HTML tag lowercased:  `colSpan` => `colspan`
   *   - Since P20 the javascript writer writes the page's spellings itself.
   * - On a `ui-*` tag (or any tag with a dash), a live value or an object is a PROPERTY (`prop:value`):
   *   an attribute can only hold text.
   *   - See `isPropertyOf()`.
   *   - Since P20 the writer writes `"prop:value"` itself.
   * - Throws for a dotted tag, e.g. `<UI.Form>`:  Spell UI's elements go by their own tags, `<ui-form>`.
   *   - The error net of the thing drawing it shows a stand-in instead (`drawThing()`).
   *   - Since P20, a compile error.
   * - Made NOW, not left a thunk:  a thunk would be made again each time the net around it re-reads its children.
   */
  element({ tag = "div", props, children = [] }: ElementSpec = {}): Drawing {
    if (!TAG.test(tag)) throw new Error(`<${tag}> isn't an element:  write Spell UI's own tag, e.g. <ui-form>`)
    const thunk = h(tag, solidProps(tag, props), ...children) as unknown as () => Drawing
    return thunk()
  },

  /** @deprecated  `positionOf()`, since epic `output-targets` P16. */
  itemOf: positionOf,
  /** @deprecated  `getItemAt()`, since epic `output-targets` P16. */
  getItemOf: collectionCoreMethods.getItemAt,
  /** @deprecated  `setItemAt()`, since epic `output-targets` P16. */
  setItemOf: collectionCoreMethods.setItemAt,
  /** @deprecated  `removeItemAt()`, since epic `output-targets` P16. */
  removeItemOf: collectionCoreMethods.removeItemAt,
  /** @deprecated  `removeItemsAt()`, since epic `output-targets` P16. */
  removeItemsOf: collectionOtherMethods.removeItemsAt,
  /** @deprecated  `duplicateList()`, since epic `output-targets` P16. */
  duplicateCollection: collectionOtherMethods.duplicateList,
  /** @deprecated  `mergeLists()`, since epic `output-targets` P16. */
  mergeCollections: collectionOtherMethods.mergeLists,
  /** @deprecated  `mergeListsInto()`, since epic `output-targets` P16. */
  mergeCollectionsInto: collectionOtherMethods.mergeListsInto
})
Object.assign(spellCore, deprecatedMethods)

/**
 * @deprecated  `positionOf()`, since epic `output-targets` P16:  TypeScript compiled before it imports
 * `{ itemOf } from "@spell/core"`.
 */
export const itemOf = positionOf

////////////////
// ## `element()`'s helpers
////////////////

/** A camelCase name:  a lowercase letter, then an uppercase one. */
const CAMEL_CASE = /[a-z][A-Z]/

/**
 * A tag `element()` draws:  a name, with dashes for a custom element (`div`, `ui-form`) -- no dots.
 * - `@solidjs/h` would read `UI.Form` as a `<UI>` with class `Form`.
 */
const TAG = /^[a-zA-Z][\w-]*$/

/**
 * `props` as Solid takes them, for `tag` -- see `element()`.
 * - Returns a NEW object;  `null` stays `null`.
 * - Getters are kept as getters:  `@solidjs/h` reads them as live values too.
 */
function solidProps(tag: string, props: Record<string, unknown> | null | undefined) {
  if (!props) return props
  const isCustomElement = tag.includes("-")
  const result: Record<string, unknown> = {}
  for (const [name, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(props))) {
    let key = name
    if (name === "className") key = "class"
    else if (name === "htmlFor") key = "for"
    else if (isCustomElement) {
      if (isPropertyOf(name, descriptor.value)) key = `prop:${name}`
    } else if (!name.startsWith("on") && CAMEL_CASE.test(name)) key = name.toLowerCase()
    Object.defineProperty(result, key, { ...descriptor, enumerable: true })
  }
  return result
}

/**
 * On a tag with a dash, is prop `name` with `value` set as a PROPERTY (`prop:name`), rather than an attribute?
 * - A live value (a function):  yes --
 *   it may be an object at any time, e.g. `<ui-form value={the app}>`, and an attribute holds only text.
 *   Spell UI's elements have a property for every attribute, and keep one set before they're defined.
 * - An object:  yes, the same reason.
 * - Text, a number or a choice written as is (`position="right"`), a handler (`onClick`), and what the page reads
 *   as an attribute (`class`, `style`, `id`, `slot`, `part`, a dashed name like `aria-label`):  no.
 */
function isPropertyOf(name: string, value: unknown): boolean {
  if (name.startsWith("on") || name.includes("-") || ATTRIBUTES_ONLY.has(name)) return false
  return typeof value === "function" || (value !== null && typeof value === "object")
}

/** What stays an attribute on a tag with a dash, whatever its value:  see `isPropertyOf()`. */
const ATTRIBUTES_ONLY = new Set(["class", "className", "style", "id", "slot", "part"])
