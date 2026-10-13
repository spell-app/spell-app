import { beforeEach, describe, expect, it, vi } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"

import { UI } from "$/ui/runtime"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { DOMElement } from "$/ui/elements"

import { Browser } from "$/ui/runtime/Browser"
import { I18n } from "$/ui/runtime/I18n"

import "$/ui/components/ui-calendar"

/**
 * `<ui-calendar>` in a browser WITHOUT `Temporal`:  the global is removed before any module runs (`vi.hoisted`,
 * and each test file has its own page), so `UI.browser.supports.temporal` is `false` and `UI.i18n.loadTemporal()`
 * imports `temporal-polyfill` -- the path Safari 26 takes.
 */
const NATIVE_TEMPORAL = vi.hoisted(() => {
  const global = globalThis as { Temporal?: unknown }
  const found = global.Temporal
  delete global.Temporal
  return found
})

/** A calendar DOM element. */
type Calendar = DOMElement & { value: string | undefined }

/** Render `html` and wait for the polyfill and the grid. */
async function calendar(html: string) {
  const host = await ElementFixture.render<Calendar>(html)
  await expect.poll(() => host.shadowRoot!.querySelector("table[role=grid], input")).not.toBeNull()
  return host
}

beforeEach(async () => {
  await UI.load()
})

describe("<ui-calendar> without a native Temporal", () => {
  it("the browser really has none here, and the flag says so", () => {
    expect(NATIVE_TEMPORAL === undefined || typeof NATIVE_TEMPORAL === "object").toBe(true)
    expect("Temporal" in globalThis).toBe(false)
    expect(UI.browser.supports.temporal).toBe(false)
  })

  it("UI.i18n loads the polyfill once, lazily, without installing it", async () => {
    const i18n = new I18n({ browser: new Browser() })
    expect(i18n.temporal).toBeUndefined()
    const [first, second] = await Promise.all([i18n.loadTemporal(), i18n.loadTemporal()])
    expect(first).toBe(second)
    expect(i18n.temporal).toBe(first)
    expect(first.PlainDate.from("2026-09-30").add({ months: 5 }).toString()).toBe("2027-02-28")
    expect("Temporal" in globalThis).toBe(false)
  })

  it("renders, pages and picks on the polyfill", async () => {
    const host = await calendar(
      `<ui-calendar inline type="date" value="2026-09-30" locale="en-US" aria-label="Day"></ui-calendar>`
    )
    const root = host.shadowRoot!
    expect(UI.i18n.temporal).toBeDefined()
    expect(root.querySelector("[part~=title]")!.textContent).toBe("September 2026")
    root.querySelector<HTMLElement>("td[tabindex='0']")!.focus()
    await userEvent.keyboard("{PageDown}{ArrowRight}{Enter}")
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(host.value).toBe("2026-10-31")
  })

  it("reads typed text and submits the ISO value on the polyfill", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(
      `<form><ui-calendar name="at" value="2026-09-30T09:00" locale="de-DE" placeholder="Wann"></ui-calendar></form>`
    )
    const host = form.querySelector<Calendar>("ui-calendar")!
    const input = await vi.waitFor(() => {
      const found = host.shadowRoot!.querySelector<HTMLInputElement>("input")
      if (!found?.value) throw new Error("no text yet")
      return found
    })
    expect(input.value).toBe("30. September 2026 um 09:00")
    await userEvent.clear(input)
    await userEvent.type(input, "1.2.2027 18:45{Enter}")
    await ElementFixture.tick()
    expect(new FormData(form).get("at")).toBe("2027-02-01T18:45")
  })
})
