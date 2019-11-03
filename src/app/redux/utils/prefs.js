// ///////////////////////////////////
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

// Preface all actual storage keys with 'dspui_' to avoid contention between apps.
export function getPrefKey(key) {
  return `${APP_PREF_PREFIX}${key}`
}

// Return app pref value stored under `key`, or `defaultValue` if not found.
// Translates to/from JSON automatically.
export function getPref(key, defaultValue) {
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
// Translates to JSON automatically.
export function setPref(key, value) {
  try {
    if (value === undefined) delete localStorage[getPrefKey(key)]
    else localStorage[getPrefKey(key)] = JSON.stringify(value)
  } catch (e) {
    console.error(`setPref('${key}'): Error saving pref:`, e)
  }
  return value
}

// Clear ALL application-level prefs.
export function clearAllPrefs() {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(APP_PREF_PREFIX)) delete localStorage[key]
    })
  } catch (e) {
    console.error("clearAllPrefs(): Error clearing prefs:", e)
  }
}
