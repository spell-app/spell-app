import { afterEach, describe, expect, test, vi } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import { AnswerForm } from "$/epics/answers"

import "$/epics/components/epic-send"
import "$/epics/components/epic-text-box"

////////////////
// ## Fakes
////////////////

/** The details routes, as `fetch`:  no answer or draft yet;  a POST answered as saved or sent. */
function fakeRoute() {
  return vi.fn(async (url: string, init?: RequestInit): Promise<Response> => {
    if (!init?.method) return Response.json({ answer: null, draft: null })
    const body = JSON.parse(init.body as string) as Record<string, unknown>
    if (url === "/api/details/draft")
      return Response.json({ ok: true, draft: { ...body, saved: "2026-10-14T04:00:00.000Z" } })
    return Response.json({ ok: true, answer: { ...body, answered: "2026-10-14T04:00:00.000Z", changes: 0 } })
  })
}

/** The page's form, on the fake route. */
function adoptForm(route = fakeRoute()) {
  const form = new AnswerForm({
    page: "/pages/details/x.html",
    server: { token: "t" },
    protocol: "http:",
    fetch: route as unknown as typeof fetch
  })
  AnswerForm.adopt(form)
  return { form, fetch: route }
}

afterEach(() => AnswerForm.adopt(undefined))

/** `host`'s shadow part `name`. */
function part(host: Element, name: string): HTMLElement | null {
  return host.shadowRoot!.querySelector<HTMLElement>(`[part~="${name}"]`)
}

////////////////
// ## Tests
////////////////

describe("<epic-send>", () => {
  test("nothing on the page:  Not sent, grey;  Send a round grey outline with a tooltip and a name;  axe", async () => {
    adoptForm()
    const send = await ElementFixture.render(`<epic-send></epic-send>`)
    await ElementFixture.settle()
    expect(part(send, "state")!.textContent).toBe("Not sent")
    expect(part(send, "state")!.dataset.color).toBe("grey")
    const button = part(send, "send")!
    expect([button.dataset.fill, button.hasAttribute("color"), button.getAttribute("aria-label")]).toEqual([
      "rest",
      false,
      "Send"
    ])
    expect(button.title).toMatch(/partial answer is fine/)
    await expectAccessible(send)
  })

  test("something typed:  dashed blue;  Send posts it;  sent:  green, a blue outline", async () => {
    const { fetch } = adoptForm()
    const root = await ElementFixture.render(
      `<div><epic-send></epic-send><epic-text-box type="notes"></epic-text-box></div>`
    )
    const [send, notes] = Array.from(root.children) as [Element, Element]
    const field = notes.shadowRoot!.querySelector("textarea")!
    field.value = "hi"
    field.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }))
    await ElementFixture.settle()
    expect([part(send, "send")!.dataset.fill, part(send, "state")!.textContent]).toEqual(["pending", "Not sent"])
    expect(send.matches(":state(pending)")).toBe(true)
    part(send, "send")!.click()
    await vi.waitFor(() => expect(part(send, "send")!.dataset.fill).toBe("sent"))
    expect(part(send, "state")!.textContent).toMatch(/^Sent .* · 0 of 0 decided$/)
    const posted = JSON.parse(fetch.mock.calls.at(-1)![1]!.body as string) as Record<string, unknown>
    expect(posted).toEqual({ page: "/pages/details/x.html", answers: {}, comments: {}, notes: "hi" })
  })

  test("the draft's save, muted beside it (P18):  not saved yet, then saved;  sent:  gone", async () => {
    const { form, fetch } = adoptForm()
    const root = await ElementFixture.render(
      `<div><epic-send></epic-send><epic-text-box type="notes"></epic-text-box></div>`
    )
    const [send, notes] = Array.from(root.children) as [Element, Element]
    const field = notes.shadowRoot!.querySelector("textarea")!
    field.value = "half a thought"
    field.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }))
    await ElementFixture.settle()
    expect(part(send, "draft")!.textContent).toBe("draft not saved yet")
    await form.saveDraft()
    await ElementFixture.settle()
    expect(part(send, "draft")!.textContent).toMatch(/^draft saved \d\d:\d\d$/)
    expect([part(send, "draft")!.hasAttribute("data-error"), fetch.mock.calls.at(-1)![0]]).toEqual([
      false,
      "/api/details/draft"
    ])
    part(send, "send")!.click()
    await vi.waitFor(() => expect(part(send, "send")!.dataset.fill).toBe("sent"))
    expect(part(send, "draft")).toBeNull()
  })

  test("an empty page never sent:  Send says what to do first, under it", async () => {
    adoptForm()
    const send = await ElementFixture.render(`<epic-send></epic-send>`)
    part(send, "send")!.click()
    await ElementFixture.settle()
    expect(part(send, "error")!.textContent).toMatch(/^Pick an option, or write something/)
    expect(part(send, "error")!.getAttribute("role")).toBe("alert")
  })
})
