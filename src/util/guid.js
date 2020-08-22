import { v4 as makeUUID } from "uuid"
import anyBase from "any-base"

/**
 * 64 "user friendly" characters for `getId()` output.
 */
const FRIENDLY_CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ%$"
export const hexToFriendlyChars = anyBase("0123456789abcdef", FRIENDLY_CHARS)
export const decimalToFriendlyChars = anyBase("0123456789", FRIENDLY_CHARS)

/**
 * Standard UUID v4 format as a regex
 * e.g.: `88cf3e49-e28e-4c0e-b95f-6a68a785a89d`
 */
const UUID_PATTERN = /([0-9a-f]{4})([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{4})/

/**
 * Create a globally unique identifier with virtually no chance of collision, ever,
 * as a user-friendly string, based on standard UUID v4, but with friendly encoding.
 *
 * Note that, due to extreme randomness, these won't sort well in a database in terms of time.
 * If this is a problem, use  `getTimeGuid()`.
 */
export function getGuid() {
  const uuid = makeUUID() // NOTE: makeUUID also uses LOWERCASE alpha chars, so we're clear
  const groups = UUID_PATTERN.exec(uuid)
  groups.shift() // remove initial match of the entire string
  const triplets = groups.map(hexToFriendlyChars)
  const result = triplets.join("-") // group by triplets for easier short-term memorization
  console.info({ uuid, groups, triplets, result })
  return result
}

/**
 * Create a globally unique identifier which will sort efficiently according to creation time.
 * Format:  `<time>:<id>` both using FRIENDLY_CHARS encoding.
 */
export function getTimeGuid() {
  const time = decimalToFriendlyChars(`${Date.now()}`)
  return `${time}--${getGuid()}`
}

window.UUID_PATTERN = UUID_PATTERN
window.anyBase = anyBase
window.makeUUID = makeUUID
window.getGuid = getGuid
window.getTimeGuid = getTimeGuid
