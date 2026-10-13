/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UICalendar } from "$/ui/components/ui-calendar/UICalendar"

/**
 * `<ui-calendar>` in a static server render (`$/ui/static`):  the text field showing the value as a browser formats
 * it, the ISO value as a hidden input (so a no-JS form submits it), the popup closed.
 * - The picker needs `Temporal`, which a server render may not have:  these hold either way.
 */
describe("<ui-calendar> static render", () => {
  beforeAll(() => {
    StaticRender.define(UICalendar)
  })

  it("renders the field with the formatted value, the ISO value in a hidden input", () => {
    const html = StaticRender.fragment(
      `<ui-calendar id="due" type="date" name="due" value="2026-09-30" placeholder="Due"></ui-calendar>`
    )
    expect(html).toMatch(/^<div [^>]*class="ui calendar"[^>]*><div class="ui left icon input" part="input"><input /)
    const field = html.match(/<input [^>]*part="control"[^>]*>/)?.[0] ?? ""
    expect(field).toContain(`value="September 30, 2026"`)
    // the flattener's mark, used and dropped:  the DOM element's id went to the field, not the root
    expect(field).toContain(`id="due"`)
    expect(html.match(/^<div [^>]*>/)?.[0]).not.toContain(` id=`)
    expect(html).not.toContain("data-ui-control")
    expect(field).not.toContain(`name=`)
    expect(html).toContain(`<input type="hidden" name="due" value="2026-09-30">`)
    expect(html).toMatch(/<div [^>]*class="ui calendar popup bottom left"[^>]*popover="manual"[^>]*role="dialog"/)
    expect(html).not.toContain("<ui-")
  })

  it("formats each type's value", () => {
    const fields = StaticRender.fragment(
      `<ui-calendar value="2026-09-30T14:30"></ui-calendar><ui-calendar type="time" value="09:05"></ui-calendar>` +
        `<ui-calendar type="month" value="2026-09"></ui-calendar><ui-calendar type="year" value="2026"></ui-calendar>`
    ).match(/<input [^>]*part="control"[^>]*>/g)!
    expect(fields.map((field) => field.match(/value="([^"]*)"/)?.[1])).toEqual([
      "September 30, 2026 at 2:30 PM",
      "9:05 AM",
      "September 2026",
      "2026"
    ])
  })

  it("renders an inline calendar's box and hidden value", () => {
    const html = StaticRender.fragment(`<ui-calendar inline type="date" name="day" value="2026-09-30"></ui-calendar>`)
    expect(html).toMatch(/^<div [^>]*data-state="inline"[^>]*class="ui calendar"[^>]*><div class="calendar"/)
    expect(html).toContain(`<input type="hidden" name="day" value="2026-09-30">`)
  })
})

/**
 * With `Temporal` loaded first (`StaticRender.prepare()` => `UICalendar.preload()`), as a static page render does:
 * the inline picker renders in full (seo plan, T7).
 * - Its own `describe`, AFTER the ones above:  once loaded, the polyfill stays for the rest of the file.
 */
describe("<ui-calendar> static render, Temporal preloaded", () => {
  const SOURCE = `<ui-calendar inline type="date" name="day" value="2026-09-30"></ui-calendar>`

  beforeAll(async () => {
    StaticRender.define(UICalendar)
    await StaticRender.prepare(SOURCE)
  })

  it("renders an inline picker's header and day grid, the value's cell selected", () => {
    const html = StaticRender.fragment(SOURCE)
    expect(html).toMatch(/<table [^>]*role="grid"/)
    expect(html).toContain("September 2026")
    expect(html.match(/role="gridcell"/g)?.length).toBeGreaterThanOrEqual(28)
    expect(html).toMatch(/<td [^>]*aria-selected="true"[^>]*>/)
    expect(html).toContain(`<input type="hidden" name="day" value="2026-09-30">`)
  })
})
