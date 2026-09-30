/**
 * Round trip shared by every framework host page, library-agnostic (DOM and ARIA only, no `updateComplete` /
 * `flush()`):  the host has mounted ONE `<ui-dropdown>` with `options` (a PROPERTY), `value="b"` and `open`, an
 * `<output id="value">` showing its own state, and buttons `#set` (host state => `"c"`) and `#open`.
 * - Checks, in order:
 *   - `initialValue` -- the trigger text shows the host's value (`Banana`)
 *   - `initiallyOpen` -- `open` is true and the listbox is `:popover-open`
 *   - `optionsIsProperty` -- `options` arrived as an array property, never an attribute
 *   - `pickUpdatesHost` -- a pick (`Apple`) round-trips:  `ui-change` => host state => `value` => text
 *   - `hostSetsValue` -- host state => the element's `value` and text (`Cherry`)
 *   - `closesAfterPick` -- the menu closed after the pick
 *   - `hostOpens` -- host state `open` => the listbox opens
 *   - plus whatever `extra()` returns (the Solid app's identity / context / unmount checks)
 * - A check that times out is `false`;  a value other than `true` / `false` (e.g. `"n/a ..."`) is informational.
 * - Publishes `{ ok, label, checks }` as `window.smokeResult` (read by `SmokeRunner`) and in `#result`.
 */
export async function roundTrip(label, extra) {
  const checks = {}
  let ok = false
  try {
    const dropdown = await until(() => document.querySelector("ui-dropdown"))
    const root = () => dropdown.shadowRoot
    const text = () => root()?.querySelector('[part~="text"]')?.textContent?.trim()
    const menuOpen = () => !!root()?.querySelector("[role=listbox]")?.matches(":popover-open")
    const hostValue = () => document.querySelector("#value")?.textContent?.trim()
    await until(() => root()?.querySelectorAll("[role=option]").length === OPTIONS.length)

    checks.initialValue = await settled(() => text() === "Banana")
    checks.initiallyOpen = await settled(() => dropdown.open === true && menuOpen())
    checks.optionsIsProperty = Array.isArray(dropdown.options) && !dropdown.hasAttribute("options")

    press(root().querySelector("[role=option]"))
    checks.pickUpdatesHost = await settled(() => hostValue() === "a" && dropdown.value === "a" && text() === "Apple")
    checks.closesAfterPick = await settled(() => !menuOpen())

    document.querySelector("#set").click()
    checks.hostSetsValue = await settled(() => hostValue() === "c" && dropdown.value === "c" && text() === "Cherry")

    document.querySelector("#open").click()
    checks.hostOpens = await settled(() => dropdown.open === true && menuOpen())

    if (extra) Object.assign(checks, await extra())
    ok = Object.values(checks).every((value) => value !== false)
  } catch (error) {
    checks.error = String(error)
  }
  const result = { ok, label, checks }
  window.smokeResult = result
  document.querySelector("#result").textContent = `${ok ? "PASS" : "FAIL"} ${label} ${JSON.stringify(checks)}`
  return result
}

/** The options every page passes as a PROPERTY. */
export const OPTIONS = [
  { value: "a", text: "Apple" },
  { value: "b", text: "Banana" },
  { value: "c", text: "Cherry" }
]

/**
 * A user's press on `element`:  pointer and mouse down / up, then `click`.
 * - Libraries pick on different events (`pointerdown`, `mousedown`, `click`);  the full sequence works for all.
 */
export function press(element) {
  const init = { bubbles: true, composed: true, cancelable: true, button: 0 }
  element.dispatchEvent(new PointerEvent("pointerdown", init))
  element.dispatchEvent(new MouseEvent("mousedown", init))
  element.dispatchEvent(new PointerEvent("pointerup", init))
  element.dispatchEvent(new MouseEvent("mouseup", init))
  element.click()
}

/** Resolve with `test()`'s first truthy value, polling every 20 ms;  reject after `ms`. */
export function until(test, ms = 8000) {
  return new Promise((resolve, reject) => {
    const start = performance.now()
    poll()

    /** One try. */
    function poll() {
      const value = test()
      if (value) resolve(value)
      else if (performance.now() - start > ms) reject(new Error(`timed out waiting for ${test}`))
      else setTimeout(poll, 20)
    }
  })
}

/** `true` once `test()` holds, `false` if it doesn't within `ms`. */
export function settled(test, ms = 5000) {
  return until(test, ms).then(
    () => true,
    () => false
  )
}
