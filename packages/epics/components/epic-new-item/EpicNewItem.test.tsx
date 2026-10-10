import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import { ReviewClient } from "$/epics/review"

import "$/ui/components/ui-icon"
import "$/epics/components/epic-new-item"

// the form and its saves, inside a page:  `EpicReview.test.tsx` (a Todos section) and `EpicPage.test.tsx` (the `+`)

/** `host`'s shadow element matching `selector`. */
function find<T extends Element = HTMLElement>(host: Element, selector: string): T | null {
  return host.shadowRoot!.querySelector<T>(selector)
}

beforeEach(async () => {
  // a page not served:  nothing is saved, nothing is fetched
  const client = new ReviewClient({
    page: "/epics/sample/sample.plan.html",
    server: undefined,
    protocol: "http:",
    fetch: vi.fn() as unknown as typeof fetch,
    storage: null
  })
  await client.start()
  ReviewClient.adopt(client)
})

afterEach(() => {
  ReviewClient.adopt(undefined)
})

describe("<epic-new-item>", () => {
  test("a section's:  the `+` and its words;  open, the form takes its place, on its own kind;  Cancel closes it", async () => {
    const host = await ElementFixture.render(`<epic-new-item adds="question"></epic-new-item>`)
    const button = find<HTMLButtonElement>(host, "[part~='button']")!
    expect([button.textContent, button.getAttribute("aria-expanded")]).toEqual(["New question", "false"])
    button.click()
    await ElementFixture.tick()
    const form = find<HTMLFormElement>(host, "[part~='form']")!
    expect(find(host, "[part~='button']")).toBeNull()
    expect(form.querySelector("[aria-pressed='true']")!.textContent).toBe("Question")
    expect(host.matches(":state(open)")).toBe(true)
    await vi.waitFor(() => expect(host.shadowRoot!.activeElement?.getAttribute("data-field")).toBe("title"))
    await expectAccessible(host)
    Array.from(form.querySelectorAll("button"))
      .find((it) => it.textContent === "Cancel")!
      .click()
    await ElementFixture.tick()
    expect([find(host, "[part~='form']"), (host as HTMLElement & { open: boolean }).open]).toEqual([null, false])
    expect(find(host, "[part~='button']")).not.toBeNull()
  })

  test("the page's (`open`):  the form alone, on a todo;  `near` starts About;  Escape cancels, `epic-new-closed`", async () => {
    const host = await ElementFixture.render(`<epic-new-item open near="p3"></epic-new-item>`)
    const closed: unknown[] = []
    host.addEventListener("epic-new-closed", (event) => closed.push((event as CustomEvent).detail))
    expect(find(host, "[part~='button']")).toBeNull()
    const form = find<HTMLFormElement>(host, "[part~='form']")!
    expect(form.querySelector("[aria-pressed='true']")!.textContent).toBe("Todo")
    expect(form.querySelector<HTMLInputElement>("[data-field='near']")!.value).toBe("P3")
    form.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, composed: true }))
    await ElementFixture.tick()
    expect([find(host, "[part~='form']"), closed]).toEqual([null, [{ saved: false }]])
  })
})
