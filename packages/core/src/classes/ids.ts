/**
 * Every spell thing's `id`, built in:  what a thing is saved and referred to by (epic `people-and-orgs`, Q9).
 * - `Thing` and `List` each declare it, the same way:  `static { this.declareProp("id", ID_PROP) }`.
 * - A program never declares it:  it's there on every thing, and on every list.
 * - Imports only `$/util` and lodash:  `Thing.ts` and `List.ts` both import it.
 */
import _ from "lodash"

import type { PropInfo } from "$/util"

/** Characters a made-up id's random part is written in:  base 36, lower case. */
const ID_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz"

/** How many random characters a made-up id ends with:  36^8, about 2.8 million million. */
const ID_LENGTH = 8

/**
 * A new id for `thing`:  its kind, then 8 random base-36 characters, e.g. `dated-event-k3x9q2mf`.
 * - Its kind is its class's name in lower kebab case:  `DatedEvent` => `dated-event`.
 * - Random from `crypto.getRandomValues()`, NEVER the core's seeded random (`ParkMiller`) or `Math.random()`:
 *   ids get saved, so they must differ from run to run, even when a seeded run repeats everything else.
 */
export function newThingId(thing: object): string {
  const kind = _.kebabCase(thing.constructor.name) || "thing"
  return `${kind}-${randomBase36(ID_LENGTH)}`
}

/**
 * How `Thing` and `List` declare their `id`:  text, made on first read (`newThingId()`), then kept.
 * - Made only when read:  a thing whose id nobody reads has none, so its JSON has none either.
 * - Settable, e.g. `new Person({ id: "owen" })` or `person.id = "owen"`:  a set id wins.
 */
export const ID_PROP: PropInfo = {
  type: "text",
  init(this: object) {
    return newThingId(this)
  }
}

/**
 * `length` random base-36 characters, from `crypto.getRandomValues()`.
 * - Each byte of 252 or more is skipped, so every character is equally likely:  252 is 36 * 7.
 */
function randomBase36(length: number): string {
  let text = ""
  while (text.length < length) {
    for (const byte of crypto.getRandomValues(new Uint8Array(length))) {
      if (byte < 252 && text.length < length) text += ID_ALPHABET[byte % 36]
    }
  }
  return text
}
