/**
 * Airplane mode on the page server (epic `airplane`):  a ROUTE MODULE (`$/server/page`'s `RouteModule`), listed in
 * the repo root's `package.json` `"pageServer": { "routes": [...] }`.
 * - Every page it serves is told, as it's served, when airplane mode is on:  `window.SPELL_SERVER.airplane`
 *   (`AirplaneMode.isOn`, read on every page).  The review controls then say "queued for when you land".
 * - No routes of its own:  only that field (`addPageConfig()`).
 * - Here, not in the server, since epic `epic-eject` P4:  the switch is epics' (`AirplaneMode`), and the server
 *   imports no other package.
 */
import type { RouteModule } from "$/server/page"

import { AirplaneMode } from "./AirplaneMode"

const airplaneRoutes: RouteModule = {
  name: "airplane mode",
  setup({ addPageConfig }) {
    // Owen is offline, no Claude:  pages say "queued for when you land"
    addPageConfig(() => (AirplaneMode.isOn ? { airplane: true } : {}))
  }
}

export default airplaneRoutes
