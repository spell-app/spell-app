import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"

import "$/ui/components/ui-flag"
import "$/ui/components/ui-dropdown"
import "$/ui/components/ui-select"

/**
 * `--ui-flag-font-family` (epic `wwod-spell-ui`, J47):  a page that loads a flag font names it once, on an ancestor,
 * and EVERY flag draws with it -- `<ui-flag>`'s box and the flag spans of `<ui-dropdown>` / `<ui-select>` rows.
 * - Cross-family:  one token, read by three sheets.
 */

/** A font no machine has:  only the token can put it first. */
const FLAG_FONT = "Test Country Flags"

/** Every flag of the three families, under one ancestor that sets the token. */
const PAGE = `<div style='--ui-flag-font-family: "${FLAG_FONT}", var(--ui-font-family-emoji)'>
  <ui-flag country="fr"></ui-flag>
  <ui-dropdown selection aria-label="Country"><ui-item value="fr" flag="fr">France</ui-item></ui-dropdown>
  <ui-select aria-label="Country"><ui-item value="fr" flag="fr">France</ui-item></ui-select>
</div>`

describe("--ui-flag-font-family", () => {
  test("reaches <ui-flag> and the dropdown's and select's flag spans, from an ancestor", async () => {
    const page = await ElementFixture.render<HTMLElement>(PAGE)
    const dropdown = page.querySelector("ui-dropdown")!
    dropdown.shadowRoot!.querySelector<HTMLElement>("[role=combobox]")!.click()
    await ElementFixture.tick()
    const spans = {
      flag: page.querySelector("ui-flag")!.shadowRoot!.querySelector(".ui.flag")!,
      dropdown: dropdown.shadowRoot!.querySelector("[role=option] > .flag")!,
      select: page.querySelector("ui-select")!.shadowRoot!.querySelector("option > .flag")!
    }
    const fonts = Object.fromEntries(
      Object.entries(spans).map(([family, span]) => [family, getComputedStyle(span).fontFamily])
    )
    const first = expect.stringMatching(new RegExp(`^"${FLAG_FONT}", "Apple Color Emoji"`))
    expect(fonts).toEqual({ flag: first, dropdown: first, select: first })
  })

  test("defaults to the colour emoji fonts (`--ui-font-family-emoji`) where no page sets it", async () => {
    const host = await ElementFixture.render<HTMLElement>(`<ui-flag country="fr"></ui-flag>`)
    const span = host.shadowRoot!.querySelector(".ui.flag")!
    expect(getComputedStyle(span).fontFamily).toMatch(/^"Apple Color Emoji", "Segoe UI Emoji"/)
  })
})
