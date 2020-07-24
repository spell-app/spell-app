//----------------------------
//
//  "Preferences" specific to this client
//  Cover for localStorage so:
//    - we can make sure all keys start with an application-specific prefix
//    - we can go to/from JSON automatically to preserve input/output data format
//    - uniform interface makes this things easier to test
//

import global from "global"

const localStorage = global.localStorage || {}

let APP_PREF_PREFIX = "call_setPrefKey_to_set_up_prefs!!!"

export function setPrefKey(key) {
  APP_PREF_PREFIX = key
}

// Preface all actual storage keys with 'APP_PREF_PREFIX' to avoid contention between apps.
export function getPrefKey(key) {
  return `${APP_PREF_PREFIX}${key}`
}

// Return app pref value stored under `key`, or `defaultValue` if not found.
// Throws if `key` is falsy.
// Translates to/from JSON automatically.
export function getPref(key, defaultValue) {
  if (!key) throw new TypeError(`getPref('${key}') called with invalid key.`)
  try {
    const storedValue = localStorage[getPrefKey(key)]
    if (storedValue !== undefined) return JSON.parse(storedValue)
  } catch (e) {
    console.error(`getPref('${key}'): Error parsing pref:`, e)
  }
  return defaultValue
}

// Set app pref `value` under `key`.
// Set `value` of `undefined` to clear the pref.
// Returns `value`.
// Throws if `key` is falsy.
// Translates to JSON automatically.
export function setPref(key, value) {
  if (!key) throw new TypeError(`getPref('${key}') called with invalid key.`)
  try {
    if (value === undefined) delete localStorage[getPrefKey(key)]
    else localStorage[getPrefKey(key)] = JSON.stringify(value)
  } catch (e) {
    console.error(`setPref('${key}'): Error saving pref:`, e)
  }
  return value
}

// Reset (clear) app pref `value` under `key`.
// Throws if `key` is falsy.
// Translates to JSON automatically.
export function resetPref(key) {
  return setPref(key, undefined)
}

// Clear ALL application-level prefs.
export function clearAllPrefs() {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(APP_PREF_PREFIX)) delete localStorage[key]
    })
  } catch (e) {
    console.error("clearAllPrefs(): Error clearing prefs:", e)
  }
}

/**
 * Return a function to get/set pref:
 *  - If fn passed single `prefKey` argument, return stored pref value or `undefined`.
 *  - If fn is passed a second `newValue` (including `undefined`), we'll `setPref()` instead.
 *
 * Note: the `keyExpectation` and `valueExpectation` strings passed to this argument
 * are to serve as documentation for the expected values of the prefs.
 *
 * TODO: this is squirrely...
 */
export function getSetPref(keyExpectation, valueExpectation) {
  return function (prefKey, newValue) {
    if (arguments.length === 1) return getPref(prefKey)
    return setPref(prefKey, newValue)
  }
}
