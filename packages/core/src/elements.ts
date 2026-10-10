/**
 * A drawable thing's own custom element:  `a card is a drawable thing` in a solitaire app is `<solitaire-card>`.
 * - A compiled project defines its drawable classes' elements as its last line (`defineElements()`),
 *   written by spell's `SpellProject`:  `spellCore.defineElements("Solitaire", { Card, Pile })`.
 * - Core only names the tag and keeps it on the class.
 *   The element itself is Spell UI's, made by the page running the program:  `spellCore.elementDefiner`,
 *   which app's `spellElements.ts` fills in.  Why:  core never imports Spell UI.
 *   No definer (a runner without Spell UI, a test):  the tag is named, nothing is defined.
 * - Part of `spellCore`:  imported by `$/core`'s barrel for its side effect.
 */

import { kebabCase, singularize } from "$/util"

import { spellCore } from "./core"
import { defineSpellCoreModule } from "./spellCore.types"
import { Drawable } from "./classes/Drawable"
import { DrawableList } from "./classes/DrawableList"

/** `spellCore`'s methods for drawable things' elements. */
export const elementsMethods = defineSpellCoreModule({
  /**
   * How the page defines the element for a drawable class -- `undefined` until the page running programs sets it.
   * - app's `spellElements.ts` sets it, for every runner:  it builds a Spell UI component for the tag.
   * - Called once per class `defineElements()` hands it.
   */
  elementDefiner: undefined as ElementDefiner | undefined,

  /**
   * Define the element of each drawable class in `classes`, for project `project`, e.g. `<solitaire-card>`.
   * - What a compiled project's last line calls:  `spellCore.defineElements("Solitaire", { Card, Pile })`.
   * - Any other value in `classes` is skipped, so a module's exports can be passed as they are.
   * - SIDE EFFECT:  each class keeps its tag (`elementTagOf()`), and the page's `elementDefiner` hears of it.
   */
  defineElements(project: string, classes: Record<string, unknown>): void {
    for (const value of Object.values(classes)) {
      if (!isDrawableClass(value)) continue
      const tag = elementTagFor(project, value.name)
      Object.defineProperty(value, ELEMENT_TAG, { value: tag, configurable: true })
      spellCore.elementDefiner?.(tag, value)
    }
  },

  /** Tag of `drawable`'s element, e.g. `solitaire-card` -- `undefined` if its class has none. */
  elementTagOf(drawable: unknown): string | undefined {
    if (!drawable || typeof drawable !== "object") return undefined
    return (drawable.constructor as { [ELEMENT_TAG]?: string })[ELEMENT_TAG]
  }
})
Object.assign(spellCore, elementsMethods)

/**
 * Tag of the element for class `className` in project `project`:
 * the project's name made singular, then the class's, kebab-cased.
 * - e.g. `Solitaire`, `Card` => `solitaire-card`;  `games`, `Bank_Account` => `game-bank-account`
 * - Only letters, digits and dashes, starting with a letter:  always a valid custom element name, as it has a dash.
 */
export function elementTagFor(project: string, className: string): string {
  const prefix = singularize(tagWords(project)) || "spell"
  return `${prefix}-${tagWords(className)}`
}

/** `name` as a tag's words:  kebab-case, lowercase, only letters, digits and single dashes. */
function tagWords(name: string): string {
  return kebabCase(name.replace(/_/g, "-"))
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[^a-z]+|-+$/g, "")
}

/** Is `value` a class of drawable things:  `Drawable`, `DrawableList`, or below them? */
function isDrawableClass(value: unknown): value is Function {
  if (typeof value !== "function" || !value.name) return false
  const { prototype } = value as { prototype?: unknown }
  return prototype instanceof Drawable || prototype instanceof DrawableList
}

/**
 * How the page defines the element for drawable class `Class`, as tag `tag` -- see `spellCore.elementDefiner`.
 * - Called again for the same tag when a program is compiled again:  the new class takes the tag over.
 */
export type ElementDefiner = (tag: string, Class: Function) => void

/** Where a drawable class keeps its tag. */
const ELEMENT_TAG = Symbol.for("@spell-app/element-tag")
