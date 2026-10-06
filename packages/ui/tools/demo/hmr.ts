/**
 * Hot module replacement demo, and the page `tools/hmr.e2e.ts` drives (`yarn test:hmr`).
 * - A translated alias (`<ie-boton>`), a dropdown whose `options` and `value` are PROPERTIES (rich data a hot
 *   update must keep), a segment that no button edit may touch.
 * - `window.hmr`:  counters of Vite's HMR events, so the test can wait for "the update was applied".
 * - NOTE: this module is not an HMR boundary:  editing it reloads the page.
 */

import { UIButton } from "$/ui/components/ui-button"
import { es } from "$/ui/test/dictionary.es"

import "$/ui/components/ui-dropdown"
import "$/ui/components/ui-segment"

UIButton.define("ie-boton", es)

/** The dropdown's rich data, set as properties. */
const dropdown = document.getElementById("dropdown") as HTMLElement & { options: unknown; value: unknown }
dropdown.options = [
  { value: "de", text: "Germany" },
  { value: "fr", text: "France" },
  { value: "gh", text: "Ghana" }
]
dropdown.value = "fr"

/** Counters the e2e test waits on. */
const hmr = { updates: 0, errors: 0, ready: Promise.resolve() }
;(globalThis as unknown as { hmr: typeof hmr }).hmr = hmr
hmr.ready = Promise.all(
  [...document.querySelectorAll<HTMLElement & { ready?: Promise<void> }>("[id]")].map(
    (element) => element.ready ?? Promise.resolve()
  )
).then(() => undefined)

const log = document.getElementById("log")!
if (import.meta.hot) {
  import.meta.hot.on("vite:afterUpdate", (payload) => {
    hmr.updates++
    log.textContent += `update ${payload.updates.map((update) => update.path).join(", ")}\n`
  })
  import.meta.hot.on("vite:error", () => {
    hmr.errors++
    log.textContent += "error\n"
  })
}
