import { userEvent } from "vite-plus/test/browser"

import { UI } from "$/ui/runtime"

/**
 * Keyboard helpers for tests that must behave the same in every browser.
 */
export class Keys {
  /**
   * Press Tab (or Shift+Tab) so it reaches links and buttons too.
   * - Safari / WebKit's Tab skips links and buttons unless the user turned on "Press Tab to highlight each item"
   *   (macOS default:  off);  Option+Tab is the inverse, so there it reaches every control, like Tab in Chromium
   *   and Firefox.  Playwright's WebKit follows the default.
   */
  static async tab(shift = false): Promise<void> {
    const keys = [...(UI.browser.isSafari ? ["Alt"] : []), ...(shift ? ["Shift"] : [])]
    const down = keys.map((key) => `{${key}>}`).join("")
    const up = keys
      .toReversed()
      .map((key) => `{/${key}}`)
      .join("")
    await userEvent.keyboard(`${down}{Tab}${up}`)
  }
}
