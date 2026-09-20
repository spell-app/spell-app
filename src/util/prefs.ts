//
// "Preferences" specific to this client.
// Cover for `localStorage` so:
// - we can make sure all keys start with an application-specific prefix
// - we can go to/from JSON automatically to preserve input/output data format
// - uniform interface makes this easier to test
//

import global from "global"

// Fall back to plain object when there's no global `localStorage`, e.g. server-side rendering or tests.
const localStorage = global.localStorage || {}

/**
 * Prefix applied to every stored key, to avoid contention between apps sharing `localStorage`.
 * - MUST call `setPrefKey()` once before using prefs -- the sentinel default doubles as
 *   a visible warning if you forget.
 */
let APP_PREF_PREFIX = "call_setPrefKey_to_set_up_prefs!!!"

/** Set `APP_PREF_PREFIX` used to namespace all stored keys -- call once, e.g. at app startup. */
export function setPrefKey(key: string) {
  APP_PREF_PREFIX = key
}

/** Preface `key` with `APP_PREF_PREFIX` to avoid contention between apps. */
export function getPrefKey(key: string) {
  return `${APP_PREF_PREFIX}${key}`
}

/**
 * Return app pref value stored under `key`, or `defaultValue` if not found.
 * - Throws if `key` is falsy.
 * - Translates to/from JSON automatically.
 */
export function getPref(key: string, defaultValue: any) {
  if (!key) throw new TypeError(`getPref('${key}') called with invalid key.`)
  try {
    const storedValue = localStorage[getPrefKey(key)]
    if (storedValue !== undefined) return JSON.parse(storedValue)
  } catch (e) {
    console.error(`getPref('${key}'): Error parsing pref:`, e)
  }
  return defaultValue
}

/**
 * Set app pref `value` under `key`.
 * - `value` of `undefined` clears the pref instead.
 * - Returns `value`.
 * - Throws if `key` is falsy.
 * - Translates to JSON automatically.
 */
export function setPref(key: string, value: any) {
  if (!key) throw new TypeError(`getPref('${key}') called with invalid key.`)
  try {
    if (value === undefined) delete localStorage[getPrefKey(key)]
    else localStorage[getPrefKey(key)] = JSON.stringify(value)
  } catch (e) {
    console.error(`setPref('${key}'): Error saving pref:`, e)
  }
  return value
}

/**
 * Reset (clear) app pref value under `key`.
 * - Throws if `key` is falsy.
 */
export function resetPref(key: string) {
  return setPref(key, undefined)
}

/** Clear ALL application-level prefs. */
export function clearAllPrefs() {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(APP_PREF_PREFIX)) delete localStorage[key]
    })
  } catch (e) {
    console.error("clearAllPrefs(): Error clearing prefs:", e)
  }
}
