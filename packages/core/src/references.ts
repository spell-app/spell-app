/**
 * Thing references:  one thing of the running program, named in text by its type and its name or place
 * (epic `drawable-thing` P18, Owen's J23).
 *
 * ```ts
 * spellCore.thingForReference("Tableau#T1")   // the tableau named T1
 * spellCore.thingForReference("Pile#T1")      // the same tableau:  a tableau is a pile
 * spellCore.thingForReference("Tableau#1")    // the first tableau the program made
 * spellCore.referenceFor(tableau)             // "Tableau#T1"
 * ```
 *
 * - A reference reads like CSS's `tag#id`:  the type's name, `#`, then the thing's name or its place.
 * - What it's for:
 *   - a drawable element's attribute can hold a thing:  `<solitaire-card pile="Tableau#T1">`
 *   - a page's layout can say which thing a tag draws:  `<solitaire-pile thing="Pile#stock">`
 *   - spell's words for one thing, `tableau T1` and `the first tableau`, compile to `thingNamed()` and `thingAtPlace()`
 * - Part of `spellCore`:  imported by `$/core`'s barrel for its side effect.
 */

import { spellCore } from "./core"
import { defineSpellCoreModule } from "./spellCore.types"

/** `spellCore`'s methods for thing references. */
export const referencesMethods = defineSpellCoreModule({
  /**
   * The program's thing `reference` names, e.g. the tableau named T1 for `Tableau#T1` -- `undefined` if none.
   * - `Type#name`:  its thing of `Type` or a sub-type with that name, as `thingNamed()` finds it.
   *   So `Pile#T1` finds the tableau named T1.
   * - `Type#1`:  its first thing of `Type` exactly, counting from 1, as `thingAtPlace()` finds it.
   *   - Digits are always a place:  a thing named "3" can't be found by its name.
   *   - A place across sub-types, `Pile#2` for the second pile of any kind, is a todo (T10).
   * - `Type` is a class's name, exactly as the program declares it:  `Tableau`, never `tableau`.
   *   Found by `spellCore.things.classNamed()`, which knows a class once one of its things is made.
   * - Tracked:  a reader re-runs as things are made, so it finds the thing as soon as the program makes it.
   */
  thingForReference(reference: string): object | undefined {
    const parts = REFERENCE.exec(reference.trim())
    if (!parts) return undefined
    const [, type, name] = parts as unknown as [string, string, string]
    const Class = spellCore.things.classNamed(type)
    if (!Class) return undefined
    return PLACE.test(name) ? spellCore.thingAtPlace(Class, Number(name)) : spellCore.thingNamed(Class, name)
  },

  /**
   * The program's thing of class `Class`, or of a sub-class, named `name` -- `undefined` if none.
   * - e.g. `thingNamed(Pile, "T1")` is the tableau named T1;  `tableau T1` in spell compiles to it.
   * - Its `name` property, as text:  a card's worked-out name counts too, e.g. `queen-of-spades`.
   * - Two with the same name:  the first made wins.
   *   The compiler warns where spell names one that two things share (P19).
   * - No thing with that name:  a top-level thing of `Class` that the program keeps under that name,
   *   e.g. `thingNamed(Game, "game")` for `set the game to a new game`.
   * - Tracked, as `thingForReference()`.
   */
  thingNamed<T>(Class: abstract new (...args: never[]) => T, name: string): T | undefined {
    const { things } = spellCore
    for (const thing of things.all()) {
      if (thing instanceof Class && nameOf(thing) === name) return thing
    }
    const kept = things.exported[name]
    return kept instanceof Class ? kept : undefined
  },

  /**
   * The program's thing of class `Class` at place `place`, in the order it made them, counting from 1 --
   * `undefined` if there's none there.
   * - e.g. `thingAtPlace(Tableau, 1)` is the first tableau made;  `the first tableau` in spell compiles to it.
   * - A place from the end is negative:  `-1` is the last one made, `the last tableau`.
   * - Of `Class` EXACTLY:  a sub-class's things aren't counted (T10).
   * - Only things the program made and still holds:  the Thing Explorer's (`spellCore.things.all()`).
   * - Tracked, as `thingForReference()`.
   */
  thingAtPlace<T>(Class: abstract new (...args: never[]) => T, place: number): T | undefined {
    const things = spellCore.things.all().filter((thing) => thing.constructor === Class)
    if (!Number.isInteger(place) || place === 0) return undefined
    return things.at(place > 0 ? place - 1 : place) as T | undefined
  },

  /**
   * The reference that finds `thing` again, e.g. `Tableau#T1` -- `undefined` if no reference does.
   * - Its class's name, then its name:  `Tableau#T1`, `Card#queen-of-spades`.
   *   A thing with no name of its own goes by the top-level name the program keeps it under:  `Game#game`.
   * - A name it shares with an earlier thing, or no name at all:  its place instead, e.g. `Tableau#3`.
   * - None for what isn't the program's thing:  a scratch list, a thing a test made, a number.
   * - Tracked, as `thingForReference()`:  it follows the thing's name.
   */
  referenceFor(thing: unknown): string | undefined {
    const { things } = spellCore
    if (!things.isThing(thing)) return undefined
    const Class = thing.constructor as abstract new (...args: never[]) => unknown
    const name = nameOf(thing) ?? things.nameOf(thing)
    if (name && !PLACE.test(name) && spellCore.thingNamed(Class, name) === thing) return `${Class.name}#${name}`
    const place = things
      .all()
      .filter((each) => each.constructor === Class)
      .indexOf(thing)
    return place < 0 ? undefined : `${Class.name}#${place + 1}`
  }
})
Object.assign(spellCore, referencesMethods)

/** A reference, its type and its name or place captured:  `Tableau#T1`, `Card#queen-of-spades`, `Tableau#1`. */
const REFERENCE = /^([A-Za-z_$][\w$]*)#(.+)$/

/** A place in a reference:  digits, counting from 1. */
const PLACE = /^[1-9]\d*$/

/** `thing`'s name, as text -- `undefined` if it has none, or reading it throws. */
function nameOf(thing: object): string | undefined {
  const read = spellCore.things.read(thing as Parameters<typeof spellCore.things.read>[0], "name")
  if (!("value" in read)) return undefined
  const { value } = read
  return value === undefined || value === null || value === "" ? undefined : `${value as string | number}`
}
