/**
 * A drawable thing's own custom element:  `a card is a drawable thing` in a solitaire app is `<solitaire-card>`.
 * - A drawable class defines its element as it's declared, in a static field spell writes in it:
 *   `static elementTag = spellCore.defineElement(this, "Solitaire")` -- so before the program draws anything.
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
   * - app's `SpellElement.tsx` sets it, for every runner:  it builds a Spell UI component for the tag.
   * - Called once per class `defineElement()` is handed.
   */
  elementDefiner: undefined as ElementDefiner | undefined,

  /**
   * Name the element of drawable class `Class`, in project `project`, e.g. `<solitaire-card>` -- its tag.
   * - What a drawable class's static field calls as it's declared:
   *   `static elementTag = spellCore.defineElement(this, "Solitaire")`.
   * - The page's `elementDefiner` hears of it once its class is whole:  when one of its things is first drawn
   *   (`elementFor()`), else in a microtask.  Not now:  the class's later statics, e.g. its `css`, aren't set yet.
   * - `undefined`, doing nothing, for a class that isn't drawable.
   * - SIDE EFFECT:  the class keeps its tag (`elementTagOf()`).
   */
  defineElement(Class: unknown, project: string): string | undefined {
    if (!isDrawableClass(Class)) return undefined
    const tag = elementTagFor(project, Class.name)
    Object.defineProperty(Class, ELEMENT_TAG, { value: tag, configurable: true })
    queueMicrotask(() => tellDefiner(Class, tag))
    return tag
  },

  /**
   * Tag of `drawable`'s element, defined on the page -- `undefined` if its class has none, or the page can't
   * define one (no `elementDefiner`):  then it draws as any thing does.
   * - What `drawThing()` asks.  SIDE EFFECT:  the page's `elementDefiner` hears of its class, if it hasn't yet.
   */
  elementFor(drawable: unknown): string | undefined {
    const tag = spellCore.elementTagOf(drawable)
    if (!tag || !spellCore.elementDefiner) return undefined
    tellDefiner((drawable as object).constructor, tag)
    return tag
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

/** The classes whose element the page's `elementDefiner` has heard of. */
const DEFINED = new WeakSet<Function>()

/** Tell the page's `elementDefiner` of drawable class `Class`, as tag `tag` -- once. */
function tellDefiner(Class: Function, tag: string): void {
  if (DEFINED.has(Class) || !spellCore.elementDefiner) return
  DEFINED.add(Class)
  spellCore.elementDefiner(tag, Class)
}

/** Is `value` a class of drawable things:  `Drawable`, `DrawableList`, or below them? */
function isDrawableClass(value: unknown): value is Function {
  if (typeof value !== "function" || !value.name) return false
  const { prototype } = value as { prototype?: unknown }
  return prototype instanceof Drawable || prototype instanceof DrawableList
}

/**
 * How the page defines the element for drawable class `Class`, as tag `tag` -- see `spellCore.elementDefiner`.
 * - Called again for the same tag when a program runs again:  the new class takes the tag over.
 */
export type ElementDefiner = (tag: string, Class: Function) => void

/** Where a drawable class keeps its tag. */
const ELEMENT_TAG = Symbol.for("@spell-app/element-tag")
