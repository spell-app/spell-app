/**
 * Names for a drawable thing's own custom element (epic `drawable-thing`):
 * `a card is a drawable thing` in a solitaire app is `<solitaire-card>`, and its `rank` is the attribute `rank`.
 * - Here, not in `core` or `app`, so every side names them alike:
 *   - core names the tag as the class is declared (`spellCore.defineElement()`)
 *   - app's `SpellElement` makes the element, with an attribute per property
 *   - the TypeScript writer (`P.TSWriter`, in `parser`, which can't import either) writes each type's element class
 */

import { camelCase, kebabCase } from "$/util/string"
import { singularize } from "./string"

/**
 * Tag of the element for class `className` in project `project`:
 * the project's name made singular, then the class's, kebab-cased.
 * - e.g. `Solitaire`, `Card` => `solitaire-card`;  `games`, `BankAccount` => `game-bank-account`
 * - The word "drawable" in the project's name is left out, so its tags don't all say it (epic `drawable-thing` P18):
 *   `Drawable Solitaire`, `Tableau` => `solitaire-tableau`, never `drawable-solitaire-tableau`.
 * - Only letters, digits and dashes, starting with a letter:  always a valid custom element name, as it has a dash.
 */
export function elementTagFor(project: string, className: string): string {
  const projectWords = tagWords(project)
    .split("-")
    .filter((word) => !DRAWABLE_WORD.test(word))
    .join("-")
  const prefix = singularize(tagWords(projectWords)) || "spell"
  return `${prefix}-${tagWords(className)}`
}

/** The word left out of a project's name in its tags:  "drawable", or "drawables". */
const DRAWABLE_WORD = /^drawables?$/

/** `name` as a tag's words:  kebab-case, lowercase, only letters, digits and single dashes. */
function tagWords(name: string): string {
  return kebabCase(name.replace(/_/g, "-"))
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[^a-z]+|-+$/g, "")
}

/**
 * The attribute a drawable type's property `name` is on its element, e.g. `short-rank` for `shortRank` --
 * `undefined` for a name the page or Spell UI already means something by (`id`, `hidden` ...).
 * - `type`:  the property's declared type, as `spellCore.elementApiOf()` gives it:
 *   e.g. `number`, `Pile`, `list`;  none is text.
 * - `owner`:  is it the list holding the thing, e.g. a card's `pile` for `a card belongs to one pile`?
 * - Its kind, as a Spell UI vocabulary says it:
 *   - text, a number or a choice:  `string`, `number`, `boolean` -- an attribute and a property
 *   - a thing, e.g. a pile, or the list holding it:  `string`, holding the thing's reference, `pile="Tableau#T1"`
 *   - anything else, e.g. a list:  `json`, a property only
 */
export function drawableAttributeFor(name: string, type?: string, owner?: boolean): DrawableAttribute | undefined {
  const attribute = kebabCase(name.replace(/_/g, "-"))
  if (TAKEN_ATTRIBUTES.has(attribute)) return undefined
  const reference = owner ? "owner" : type && THING_TYPE.test(type) ? "thing" : undefined
  const kind = reference ? "string" : (ATTRIBUTE_KINDS[type ?? "text"] ?? "json")
  return {
    name: attribute,
    property: camelCase(attribute),
    kind,
    description: `Its ${name.replace(/_/g, " ")}.`,
    ...(reference ? { reference } : {})
  }
}

/** A drawable type's property, as its element's attribute -- see `drawableAttributeFor()`. */
export type DrawableAttribute = {
  /** The attribute, e.g. `short-rank`. */
  name: string
  /** The element's property, e.g. `shortRank`. */
  property: string
  /** Its kind, as a Spell UI vocabulary says it. */
  kind: "string" | "number" | "boolean" | "json"
  /** What it is, for the element's docs, e.g. `Its rank.` */
  description: string
  /**
   * Does it hold a thing, shown as the thing's reference (P18)?
   * - `thing`:  a property declared as a thing, e.g. `a card has a home as a pile`
   * - `owner`:  the list holding it, e.g. a card's `pile`, for `a card belongs to one pile`:  set by a move
   */
  reference?: "thing" | "owner"
}

/**
 * The kind of attribute for each type a property is declared as.
 * - A thing, e.g. a pile, is a reference instead (`THING_TYPE`).
 * - Any other type, e.g. a list:  `json`.
 */
const ATTRIBUTE_KINDS: Record<string, DrawableAttribute["kind"]> = {
  text: "string",
  character: "string",
  date: "string",
  number: "number",
  integer: "number",
  choice: "boolean"
}

/** A declared type that's a thing's, e.g. `Pile`:  a class's name, where spell's own types are lowercase (`text`). */
const THING_TYPE = /^[A-Z]/

/** Attributes the page or Spell UI already means something by:  never a type's. */
const TAKEN_ATTRIBUTES = new Set([
  "thing",
  "id",
  "class",
  "style",
  "slot",
  "part",
  "is",
  "lang",
  "dir",
  "title",
  "hidden",
  "inert",
  "disabled",
  "loading",
  "visible",
  "animation"
])
