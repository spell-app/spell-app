import { afterEach, describe, expect, test, vi } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import { ReviewClient } from "$/epics/review"

// NOT `epic-item`:  the options read only their item's attributes, so an undefined `<epic-item>` does
import "$/epics/components/epic-choices"

////////////////
// ## Fakes
////////////////

/** The page the fake routes serve. */
const PAGE = "/epics/sample/sample.plan.html"

/** A mark as the fake routes keep it. */
type FakeMark = { action: string; pick?: string; note?: string; when?: string; at: string }

/**
 * The page server's review routes, as `fetch`:  `GET inbox`, `POST mark` and `POST send`, every reply the whole
 * inbox;  a session listening.
 */
class FakeRoutes {
  inbox = {
    marks: {} as Record<string, FakeMark>,
    drafts: {},
    sent: null as string | null,
    now: [],
    working: {},
    listening: { session: "s1", seen: new Date().toISOString() }
  }
  /** every POST, as `[route, body]` */
  posts: [string, Record<string, unknown>][] = []

  // the client fetches by URL string, a POST's body a JSON string
  readonly fetch = vi.fn(async (url: string, init?: RequestInit): Promise<Response> => {
    if (url.startsWith("/api/review/inbox")) return Response.json(this.inbox)
    const route = url.replace("/api/review/", "")
    const body = JSON.parse(init?.body as string) as Record<string, unknown>
    this.posts.push([route, body])
    const id = body.id as string
    if (route === "mark") {
      const mark = body.mark as Omit<FakeMark, "at"> | null
      if (mark) this.inbox.marks[id] = { ...mark, at: new Date().toISOString() }
      else delete this.inbox.marks[id]
    }
    if (route === "send") this.inbox.sent = new Date(Date.now() + 1000).toISOString()
    return Response.json(this.inbox)
  })
}

/** A reviewing page:  the fake routes, and the page's client on them (`ReviewClient.forPage()` returns it). */
async function reviewing(routes = new FakeRoutes()) {
  const client = new ReviewClient({
    page: PAGE,
    server: { token: "t1" },
    protocol: "http:",
    fetch: routes.fetch as unknown as typeof fetch,
    storage: null
  })
  expect(await client.start()).toBe(true)
  ReviewClient.adopt(client)
  return { routes, client }
}

/** `option`'s Choose pill, if it has one. */
function pillOf(option: Element): HTMLButtonElement | null {
  return option.shadowRoot!.querySelector<HTMLButtonElement>("[part~='choose']")
}

/** Each option's pill as `[text, aria-pressed]`, or `null` without one. */
function pills(options: Element[]) {
  return options.map((option) => {
    const pill = pillOf(option)
    return pill && [pill.textContent, pill.getAttribute("aria-pressed")]
  })
}

/** Let a click's write land, and the elements redraw. */
async function settle() {
  for (let round = 0; round < 3; round++) await ElementFixture.tick()
}

afterEach(() => ReviewClient.adopt(undefined))

/** Two options, `B` recommended. */
const OPTIONS =
  `<epic-option letter="A" title="A named palette"><ul><li>short</li></ul></epic-option>` +
  `<epic-option letter="B" title="Any CSS colour" recommended><ul><li>free</li></ul></epic-option>`

/** Render `html`;  returns its `<epic-choices>` and the option hosts. */
async function choices(html: string) {
  const first = await ElementFixture.render(html)
  const host = first.localName === "epic-choices" ? first : first.querySelector("epic-choices")!
  return { host, options: Array.from(host.querySelectorAll("epic-option")) }
}

/** `element`'s shadow part `name`. */
function part(element: Element, name: string): HTMLElement | null {
  return element.shadowRoot!.querySelector<HTMLElement>(`[part~='${name}']`)
}

describe("<epic-choices>", () => {
  test("an open question:  cards side by side, each headed `A · title`, a violet thumbs-up after the recommended one, no word;  passes axe", async () => {
    const { host, options } = await choices(`<epic-choices>${OPTIONS}</epic-choices>`)
    expect(host.matches(":state(answered)")).toBe(false)
    expect(getComputedStyle(part(host, "base")!).display).toBe("grid")
    expect(options.map((option) => part(option, "title")!.textContent!.trim())).toEqual([
      "A · A named palette",
      "B · Any CSS colour"
    ])
    const thumb = part(options[1]!, "recommended")!
    expect([part(options[0]!, "recommended"), thumb.getAttribute("aria-label"), thumb.title]).toEqual([
      null,
      "Recommended",
      "Recommended"
    ])
    await vi.waitFor(() => expect(thumb.querySelector("svg")).not.toBeNull())
    expect(options.map((option) => part(option, "base")!.className)).toEqual(["option card", "option card"])
    expect(part(host, "toggle")).toBeNull()
    await expectAccessible(host)
  })

  test("answered:  folded under `Choices`;  the chosen option a panel marked with a check, and open;  passes axe", async () => {
    const { host, options } = await choices(`<epic-choices chosen="B">${OPTIONS}</epic-choices>`)
    const [a, b] = options
    expect(host.matches(":state(answered)")).toBe(true)
    expect([part(host, "toggle")!.textContent, part(host, "panels")!.getAttribute("hidden")]).toEqual([
      "Choices",
      "until-found"
    ])
    expect([a.matches(":state(chosen)"), b.matches(":state(chosen)")]).toEqual([false, true])
    expect([part(a, "check"), part(b, "check")?.localName]).toEqual([null, "svg"])
    expect([part(a, "body")!.getAttribute("hidden"), part(b, "body")!.hasAttribute("hidden")]).toEqual([
      "until-found",
      false
    ])
    part(host, "toggle")!.click()
    await ElementFixture.tick()
    expect([host.matches(":state(open)"), part(host, "panels")!.hasAttribute("hidden")]).toEqual([true, false])
    await expectAccessible(host)
  })

  test("a panel's header folds and unfolds it", async () => {
    const { options } = await choices(`<epic-choices chosen="A">${OPTIONS}</epic-choices>`)
    const [, b] = options
    part(b, "toggle")!.click()
    await ElementFixture.tick()
    expect([b.matches(":state(open)"), part(b, "body")!.hasAttribute("hidden")]).toEqual([true, false])
    part(b, "toggle")!.click()
    await ElementFixture.tick()
    expect(b.matches(":state(open)")).toBe(false)
  })

  test("answered without a pick (`answered` on its item):  folded too, nothing marked;  follows `chosen` as it's set", async () => {
    const { host, options } = await choices(
      `<epic-item id="q1" title="Which?" status="decided" answered><epic-choices>${OPTIONS}</epic-choices></epic-item>`
    )
    expect(host.matches(":state(answered)")).toBe(true)
    expect(options.some((option) => option.matches(":state(chosen)"))).toBe(false)
    host.setAttribute("chosen", "A")
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(options[0].matches(":state(chosen)")).toBe(true)
  })

  test("an option's title with markup comes through its `title` slot", async () => {
    const { options } = await choices(
      `<epic-choices><epic-option letter="A"><span slot="title">The <code>x</code> API</span><p>Why</p></epic-option></epic-choices>`
    )
    const slot = part(options[0], "title")!.querySelector<HTMLSlotElement>("slot")!
    expect(slot.assignedElements()[0].textContent).toBe("The x API")
  })
})

describe("<epic-option>'s Choose pill (P10)", () => {
  test("none while the page isn't reviewed (no page server, no inbox)", async () => {
    const { options } = await choices(
      `<epic-item id="q1" title="Which?" status="open"><epic-choices>${OPTIONS}</epic-choices></epic-item>`
    )
    await settle()
    expect(pills(options)).toEqual([null, null])
  })

  test("an open question's cards each take one;  a click picks its letter through the client, again un-picks it;  passes axe", async () => {
    const { routes } = await reviewing()
    const { host, options } = await choices(
      `<epic-item id="q1" title="Which?" status="open"><epic-choices>${OPTIONS}</epic-choices></epic-item>`
    )
    await settle()
    expect(pills(options)).toEqual([
      ["Choose", "false"],
      ["Choose", "false"]
    ])
    pillOf(options[1])!.click()
    await settle()
    expect(routes.posts).toEqual([["mark", { page: PAGE, id: "q1", mark: { action: "pick", pick: "B" } }]])
    expect(pills(options)).toEqual([
      ["Choose", "false"],
      ["Chosen", "true"]
    ])
    expect([options[1].matches(":state(picked)"), part(options[1], "base")!.classList.contains("picked")]).toEqual([
      true,
      true
    ])
    expect(pillOf(options[1])!.title).toBe("B is picked:  click to un-pick · not sent yet")
    // the fill rule (Q20):  a pick not sent is DASHED green, pill and card
    expect([
      getComputedStyle(pillOf(options[1])!).borderTopStyle,
      getComputedStyle(part(options[1], "base")!).borderTopStyle,
      getComputedStyle(pillOf(options[0])!).borderTopStyle
    ]).toEqual(["dashed", "dashed", "solid"])
    await expectAccessible(host)
    pillOf(options[1])!.click()
    await settle()
    expect(routes.posts[1]).toEqual(["mark", { page: PAGE, id: "q1", mark: null }])
    expect(pills(options)).toEqual([
      ["Choose", "false"],
      ["Choose", "false"]
    ])
  })

  test("a pick once sent:  the pill and card outlined, no longer dashed (`sent`), its tooltip says so", async () => {
    const { client } = await reviewing()
    const { options } = await choices(
      `<epic-item id="q1" title="Which?" status="open"><epic-choices>${OPTIONS}</epic-choices></epic-item>`
    )
    await settle()
    pillOf(options[0])!.click()
    await settle()
    await client.send()
    await settle()
    expect([pillOf(options[0])!.classList.contains("sent"), pillOf(options[0])!.title]).toEqual([
      true,
      "A is picked:  click to un-pick · sent"
    ])
    expect([
      part(options[0], "base")!.classList.contains("sent"),
      getComputedStyle(pillOf(options[0])!).borderTopStyle,
      getComputedStyle(part(options[0], "base")!).borderTopStyle
    ]).toEqual([true, "solid", "solid"])
  })

  test("an answered question's panels:  none, until it's revisited;  then all but the chosen one", async () => {
    const { client } = await reviewing()
    const { options } = await choices(
      `<epic-item id="q1" title="Which?" status="decided" answered><epic-choices chosen="A">${OPTIONS}</epic-choices></epic-item>`
    )
    await settle()
    expect(pills(options)).toEqual([null, null])
    await client.save("q1", { action: "revisit", when: "soon", note: "but why?" })
    await settle()
    expect(pills(options)).toEqual([null, ["Choose", "false"]])
  })

  test("never in an Original Discussion:  history, not a choice", async () => {
    await reviewing()
    const item = await ElementFixture.render(
      `<epic-item id="q1" title="Which?" status="open"><epic-original><epic-choices>${OPTIONS}</epic-choices></epic-original></epic-item>`
    )
    await settle()
    expect(pills(Array.from(item.querySelectorAll("epic-option")))).toEqual([null, null])
  })
})
