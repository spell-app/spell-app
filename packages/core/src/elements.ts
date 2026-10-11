/**
 * A drawable thing's own custom element:  `a card is a drawable thing` in a solitaire app is `<solitaire-card>`.
 * - A drawable class defines its element as it's declared, in a static field spell writes in it:
 *   `static elementTag = spellCore.defineElement(this, "Solitaire")` -- so before the program draws anything.
 * - Core only names the tag and keeps it on the class.
 *   - The element itself is Spell UI's, made by the page running the program.
 *   - The page plugs in through `spellCore.elementDefiner`, which app's `SpellElement.tsx` fills in.
 *   - Why:  core never imports Spell UI.
 *   - No definer (a runner without Spell UI, a test):  the tag is named, nothing is defined.
 * - Part of `spellCore`:  imported by `$/core`'s barrel for its side effect.
 */

import { instanceCase, kebabCase, schemaOf, singularize, type Schema } from "$/util"

import { spellCore } from "./core"
import { defineSpellCoreModule } from "./spellCore.types"
import { Drawable } from "./classes/Drawable"
import { DrawableList } from "./classes/DrawableList"
import { List } from "./classes/List"

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
   * - The page's `elementDefiner` hears of it once its class is whole:
   *   when one of its things is first drawn (`elementFor()`), else in a microtask.
   *   Not now:  the class's later statics, e.g. its `css`, aren't set yet.
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
   * Tag of `drawable`'s element, defined on the page.
   * - `undefined` if its class has none, or the page can't define one (no `elementDefiner`):
   *   then it draws as any thing does.
   * - What `drawThing()` asks.
   * - SIDE EFFECT:  the page's `elementDefiner` hears of its class, if it hasn't yet.
   */
  elementFor(drawable: unknown): string | undefined {
    const tag = spellCore.elementTagOf(drawable)
    if (!tag || !spellCore.elementDefiner) return undefined
    tellDefiner((drawable as object).constructor, tag)
    return tag
  },

  /**
   * What drawable class `Class` shows on the outside of its element (epic `drawable-thing` P8):
   * - `properties`:  each property it declares (`a card has a rank as a number`), its own and its super-types',
   *   with its declared type, e.g. `{ name: "rank", type: "number" }`
   *   - a list it makes for itself, e.g. `a hand has cards as a list of cards`, is `type: "list"`
   *   - then each list it belongs to (`a card belongs to one pile`):  `{ name: "pile", type: "Pile", owner: true }`,
   *     the list holding it (P18) -- see `ownerPropertiesOf()`
   * - `methods`:  each method it has, its own and its super-types', down to `Drawable` / `DrawableList`,
   *   e.g. `turn_over` -- NOT `draw()`, nor a method of several words with values in them (`is_a_$suit`)
   * - Names as compiled:  the page names them as it likes, e.g. `turnOver()`.
   */
  elementApiOf(Class: Function): ElementApi {
    const properties: ElementApi["properties"] = []
    const seen = new Set<string>()
    for (let schema: Schema | undefined = schemaOf(Class); schema; schema = schema.parent) {
      for (const [name, info] of schema.declared) {
        if (seen.has(name)) continue
        seen.add(name)
        const values = typeof info.oneOf === "function" ? info.oneOf() : info.oneOf
        const type = info.type ?? (info.init ? "list" : undefined)
        properties.push({ name, ...(type ? { type } : {}), ...(values ? { values: [...values] } : {}) })
      }
    }
    for (const owner of ownerPropertiesOf(Class)) {
      if (!seen.has(owner.name)) properties.push(owner)
    }
    const methods: string[] = []
    for (let proto = Class.prototype; proto && !BASE_PROTOTYPES.includes(proto); proto = Object.getPrototypeOf(proto)) {
      for (const [name, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(proto))) {
        if (typeof descriptor.value !== "function" || NOT_METHODS.has(name) || name.includes("$")) continue
        if (!methods.includes(name)) methods.push(name)
      }
    }
    return { properties, methods }
  },

  /**
   * The program's thing of class `Class` named `name`, e.g. the tableau named `T1` -- for a tag in a page's layout,
   * `<solitaire-tableau id="T1">` (epic `drawable-thing` P9, Q9).
   * - With `name`:  the thing `thingNamed()` finds, so a sub-class's too:
   *   `<solitaire-pile id="stock">` finds the stock, a `StockPile` (P18).
   * - No `name`:  its one thing of `Class` EXACTLY, if it made exactly one.
   * - `undefined` if none matches.
   * - Reads the registry's `version`:  a reader re-runs as things are made.
   */
  thingFor(Class: Function, name?: string): object | undefined {
    if (name !== undefined) return spellCore.thingNamed(Class as abstract new () => object, name)
    const things = spellCore.things.all().filter((thing) => thing.constructor === Class)
    return things.length === 1 ? things[0] : undefined
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
 * A drawable type's style sheet, as TEXT:  what its `<css>` block compiles to (epic `drawable-thing`, P10, J14).
 *
 * ```ts
 * export class Card extends Drawable {
 *   static css = css`
 *     :host { display: inline-block }
 *     .red { color: crimson }
 *   `
 * }
 * Card.css   // ":host { display: inline-block }\n.red { color: crimson }"
 * ```
 *
 * - Takes off the indent its lines share, and the blank first and last lines:
 *   so the compiled file can indent the sheet inside its class, and the sheet is still exactly as written.
 * - Reads the template's RAW text, so CSS's own escapes stay as written, e.g. `content: "\201C"`.
 * - Text, not a `CSSStyleSheet`:  what reads a type's CSS takes text (app's `SpellElement.cssOf()`),
 *   and it works with no browser, e.g. in tests.
 * - Its name lets an editor colour the template as CSS, as Lit's `css` does:  spell's VS Code extension does.
 */
export function css(strings: TemplateStringsArray, ...values: unknown[]): string {
  const lines = String.raw({ raw: strings.raw }, ...values).split("\n")
  if (lines.length > 1 && !lines[0]!.trim()) lines.shift()
  if (lines.length > 1 && !lines.at(-1)!.trim()) lines.pop()
  const indents = lines.filter((line) => line.trim()).map((line) => /^[ \t]*/.exec(line)![0].length)
  const indent = indents.length ? Math.min(...indents) : 0
  return lines.map((line) => line.slice(indent)).join("\n")
}

/**
 * What a drawable class shows on the outside of its element -- see `spellCore.elementApiOf()`.
 */
export type ElementApi = {
  /**
   * Its declared properties, as compiled, e.g. `short_rank`, with their declared types, e.g. `number`,
   * and their legal values if they have some, e.g. `[ace, 2, 3 ...]` for a rank.
   * - A type that's a class's name, e.g. `Pile`, holds a thing:  its element shows it as a reference, `Pile#T1`.
   */
  properties: Array<{
    name: string
    type?: string
    values?: unknown[]
    /** A list it belongs to, holding it (`a card belongs to one pile`):  read only, worked out by the list. */
    owner?: true
  }>
  /** Its methods, as compiled, e.g. `turn_over`. */
  methods: string[]
}

/**
 * The lists of `Class`'s things that each hold one at most, as properties of `Class`:
 * `a card belongs to one pile` is `{ name: "pile", type: "Pile", owner: true }` on `Card`.
 * - Compiled spell gives the card a getter for it, `the pile of a card` (`Pile.ownerOf(card)`), but declares nothing:
 *   so it's found here, from the program's classes.
 *   - an exclusive list class, the root of its family:  `Pile.exclusive = true`
 *   - whose items are `Class`, or a type it extends:  `Pile.instanceType = Card`
 *   - and `Class`'s things have the getter, named as spell names it:  `pile`
 * - Only the list classes the program's registry knows of so far (`spellCore.things.knownClasses()`):
 *   a class is known once one of its things is made, or the program has run.
 *   A drawable class's element asks once the program's code has run, so in practice they're all known.
 */
function ownerPropertiesOf(Class: Function): ElementApi["properties"] {
  const owners: ElementApi["properties"] = []
  for (const ListClass of spellCore.things.knownClasses()) {
    const { exclusive, instanceType } = ListClass as unknown as { exclusive?: boolean; instanceType?: unknown }
    if (!(ListClass.prototype instanceof List) || !Object.hasOwn(ListClass, "exclusive") || !exclusive) continue
    if (typeof instanceType !== "function") continue
    if (Class !== instanceType && !(Class.prototype instanceof instanceType)) continue
    const name = instanceCase(ListClass.name)
    if (hasGetter(Class.prototype as object, name)) owners.push({ name, type: ListClass.name, owner: true })
  }
  return owners
}

/** Does `prototype`, or one up its chain, have a getter `name`? */
function hasGetter(prototype: object, name: string): boolean {
  for (let at: object | null = prototype; at; at = Object.getPrototypeOf(at)) {
    const descriptor = Object.getOwnPropertyDescriptor(at, name)
    if (descriptor) return !!descriptor.get
  }
  return false
}

/** Where `elementApiOf()` stops looking for methods:  spell's own drawable classes, and what they're built on. */
const BASE_PROTOTYPES: object[] = [Drawable.prototype, DrawableList.prototype, Object.prototype]

/** Methods that aren't a type's own API:  its drawing, and the class's own. */
const NOT_METHODS = new Set(["constructor", "draw"])

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
