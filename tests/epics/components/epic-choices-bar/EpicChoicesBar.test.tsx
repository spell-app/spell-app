import { afterEach, describe, expect, test, vi } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import { ChoicesForm } from "$/epics/answers"

import "$/epics/components/epic-choices-bar"
import "$/epics/components/epic-choice-rows"

////////////////
// ## Fakes
////////////////

/** The choices routes, as `fetch`:  a draft to bring back;  "Do it" answered as sent. */
function fakeRoutes() {
  return vi.fn(async (url: string, init?: RequestInit): Promise<Response> => {
    if (!init?.method)
      return Response.json(
        url.includes("/draft")
          ? { draft: { values: { r1: "mine" }, feedback: "so far", saved: "2026-10-14T04:00:00.000Z" } }
          : { answer: null }
      )
    const body = JSON.parse(init.body as string) as Record<string, unknown>
    return Response.json({ ok: true, answer: { ...body, answered: "2026-10-14T04:05:00.000Z", changes: 0 } })
  })
}

/** The page's form, on the fake routes, at a details page's address. */
function adoptForm(route = fakeRoutes()) {
  const form = new ChoicesForm({
    page: "/pages/details/names.html",
    server: { token: "t" },
    protocol: "http:",
    fetch: route as unknown as typeof fetch
  })
  ChoicesForm.adopt(form)
  return { form, fetch: route }
}

afterEach(() => ChoicesForm.adopt(undefined))

/** `host`'s shadow part `name`. */
function part(host: Element, name: string): HTMLElement | null {
  return host.shadowRoot!.querySelector<HTMLElement>(`[part~="${name}"]`)
}

/** A section of one row, then the bar. */
const PAGE =
  `<div><ui-section id="q1" header="Q1"><epic-choice-rows><epic-choice-row name="r1" file="a.ts" line="1" ` +
  `purpose="p" current="a" recommended="b"></epic-choice-row></epic-choice-rows></ui-section>` +
  `<epic-choices-bar></epic-choices-bar></div>`

////////////////
// ## Tests
////////////////

describe("<epic-choices-bar>", () => {
  test("brings back the draft:  the row's box and the feedback;  Do it's tooltip counts;  axe", async () => {
    adoptForm()
    const root = await ElementFixture.render(PAGE)
    const bar = root.querySelector("epic-choices-bar")!
    const row = root.querySelector("epic-choice-row")!
    await vi.waitFor(() => expect((part(bar, "feedback") as HTMLElement & { value: string }).value).toBe("so far"))
    expect(row.shadowRoot!.querySelector("textarea")!.value).toBe("mine")
    expect(part(bar, "send")!.title).toBe("Send 1 changed of 1, and the feedback, to Claude")
    expect(getComputedStyle(bar).position).toBe("sticky")
    await expectAccessible(bar)
  })

  test("Do it:  sends the changed boxes and the feedback;  says what went", async () => {
    const { fetch } = adoptForm()
    const root = await ElementFixture.render(PAGE)
    const bar = root.querySelector("epic-choices-bar")!
    await vi.waitFor(() => expect(part(bar, "send")!.title).toMatch(/1 changed/))
    part(bar, "send")!.click()
    await vi.waitFor(() => expect(part(bar, "sent")?.textContent).toMatch(/^Sent to Claude at \d\d:\d\d:  1 changed/))
    const [url, init] = fetch.mock.calls.at(-1)!
    expect(url).toBe("/api/docs/choices/answer")
    expect(JSON.parse(init!.body as string)).toEqual({
      page: "/pages/details/names.html",
      values: { r1: "mine" },
      feedback: "so far"
    })
  })
})
