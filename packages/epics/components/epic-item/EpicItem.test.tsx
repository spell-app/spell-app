import { afterEach, beforeAll, describe, expect, test, vi } from "vite-plus/test"

import { E, UI } from "$/ui/core"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import "$/epics/components/epic-item"

////////////////
// ## Helpers
////////////////

/** An `<epic-item>` host:  its `open`, and its source API. */
type ItemHost = E.DOMElement & { open: boolean; load(): Promise<void>; reload(): Promise<void> }

/** The part file the source tests serve. */
const PART = "/demo/parts/items-q6.html"

/** A part's markup, as the fetch answers it. */
const PART_HTML = `<!-- part -->\n<p class="from-part">From the part.</p><epic-answer id="d9" title="Yes"></epic-answer>`

/** Render `html`;  returns the host and its shadow pieces. */
async function item(html: string) {
  const host = await ElementFixture.render<ItemHost>(html)
  const root = host.shadowRoot!
  const line = root.querySelector<HTMLElement>("[part~='line']")!
  return {
    host,
    line,
    chip: root.querySelector<HTMLAnchorElement>("[part~='id']")!,
    title: root.querySelector<HTMLElement>("[part~='title']")!,
    toggle: () => root.querySelector<HTMLButtonElement>("[part~='toggle']"),
    review: () => root.querySelector<HTMLElement>("[part~='review']"),
    details: root.querySelector<HTMLElement>("[part~='details']")!,
    label: () => root.querySelector<HTMLElement>("[part~='label']")?.textContent ?? null,
    error: () => root.querySelector<HTMLElement>("[part~='error']")?.textContent ?? null
  }
}

/** The slots in `host`'s shadow root, by name (`""`:  the default one), in order. */
function slotNames(host: Element): string[] {
  return Array.from(host.shadowRoot!.querySelectorAll("slot"), (slot) => slot.getAttribute("name") ?? "")
}

/** What CSS colour `color` (`var(--ui-orange)`) computes to in this document, as `getComputedStyle()` says it. */
function colorOf(color: string): string {
  const probe = document.body.appendChild(document.createElement("div"))
  probe.style.color = color
  const computed = getComputedStyle(probe).color
  probe.remove()
  return computed
}

/** Answer every fetch of `url` with `html` (status `status`). */
function serve(url: string, html: string, status = 200) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const href = typeof input === "string" ? input : input instanceof URL ? input.href : input.url
    if (!href.endsWith(url)) return new Response("", { status: 404 })
    return new Response(html, { status, headers: { "content-type": "text/html" } })
  })
}

////////////////
// ## Tests
////////////////

describe("<epic-item>", () => {
  test("draws its line -- id chip linking to it, title -- and shows its prose through its slots;  passes axe", async () => {
    const { host, chip, title } = await item(
      `<epic-item id="q1" title="Which colour names?" status="open" state="attention"><p>Hello</p></epic-item>`
    )
    expect([chip.textContent, chip.getAttribute("href")]).toEqual(["Q1", "#q1"])
    expect(title.textContent).toBe("Which colour names?")
    expect(slotNames(host)).toEqual(["title", "", "status"])
    expect(host.querySelector("p")!.assignedSlot!.getAttribute("name")).toBeNull()
    expect(chip.title).toBe("Needs attention · not reviewed yet")
    await expectAccessible(host)
  })

  test("its `id` and `title` stay the platform's:  links land, nothing is added to the markup;  the shadow wrapper's EMPTY title stops the host's tooltip", async () => {
    const html = `<epic-item id="q1" title="Which colour names?" status="open" answered="" phase="2"></epic-item>`
    const { host } = await item(html)
    expect(host.outerHTML).toBe(html)
    expect(document.getElementById("q1")).toBe(host)
    expect(host.shadowRoot!.querySelector("[part~='base']")!.getAttribute("title")).toBe("")
  })

  test("the chip's colour follows `state`;  without one, decided or done is `recent` (green), canceled `old`, open `open`", async () => {
    const states = await Promise.all(
      [
        `<epic-item id="q1" title="A" status="open" state="attention"></epic-item>`,
        `<epic-item id="q2" title="B" status="decided"></epic-item>`,
        `<epic-item id="q3" title="C" status="open"></epic-item>`,
        `<epic-item id="q4" title="D" status="canceled" state="old"></epic-item>`,
        `<epic-item id="j5" title="E" status="done"></epic-item>`,
        `<epic-item id="j6" title="F" status="canceled"></epic-item>`
      ].map(async (html) => (await item(html)).host.shadowRoot!.querySelector("[part~='base']")!.className)
    )
    expect(states).toEqual([
      "attention item",
      "recent item",
      "open item",
      "old canceled item",
      "recent item",
      "old canceled item"
    ])
  })

  test("`replied` (Owen, 2026-10-09):  an orange chip with dark text, Owen's turn to pick, in its tooltip", async () => {
    const { host, chip } = await item(
      `<epic-item id="j17" title="A call" status="open" state="replied" reviewed="2026-10-09"></epic-item>`
    )
    expect(host.shadowRoot!.querySelector("[part~='base']")!.className).toBe("replied item")
    expect(chip.title).toBe("Claude answered:  your turn to pick · reviewed 10/9/26")
    const [orange, ink] = [colorOf("var(--ui-orange)"), colorOf("var(--ui-orange-on)")]
    expect(orange).not.toBe(colorOf("transparent"))
    expect([getComputedStyle(chip).backgroundColor, getComputedStyle(chip).color]).toEqual([orange, ink])
  })

  test("the review label:  `to do` (queued), else `deferred`, else `reviewed 10/6/26`;  none when unmarked", async () => {
    const labels = []
    for (const marks of [`queued="2026-10-06" work="Skip it"`, `deferred="2026-10-05"`, `reviewed="2026-10-06"`, ""]) {
      const { review } = await item(`<epic-item id="j1" title="A" status="open" state="recent" ${marks}></epic-item>`)
      labels.push(review() ? [review()!.textContent, review()!.className, review()!.title] : null)
    }
    expect(labels).toEqual([
      ["to do", "review todo", "Skip it"],
      ["deferred", "review deferred", "deferred 10/5/26"],
      ["reviewed 10/6/26", "review recent", ""],
      null
    ])
  })

  test("starts folded (details `hidden=until-found`);  a click on the line unfolds it through `ui-open`, again folds", async () => {
    const { host, line, details, toggle } = await item(
      `<epic-item id="c1" title="A caveat" status="open"><p>Why</p></epic-item>`
    )
    const opened = vi.fn()
    host.addEventListener("ui-open", opened)
    expect([host.open, details.getAttribute("hidden")]).toEqual([false, "until-found"])
    expect(toggle()!.getAttribute("aria-expanded")).toBe("false")
    line.click()
    await ElementFixture.tick()
    expect([host.open, host.matches(":state(open)"), details.hasAttribute("hidden")]).toEqual([true, true, false])
    expect(opened).toHaveBeenCalledOnce()
    toggle()!.click()
    await ElementFixture.tick()
    expect(host.open).toBe(false)
  })

  test("a click on a link in its line (the chip) doesn't fold;  a cancelled `ui-open` keeps it folded", async () => {
    const { host, chip, line } = await item(`<epic-item id="c2" title="A caveat" status="open"><p>Why</p></epic-item>`)
    chip.addEventListener("click", (event) => event.preventDefault())
    chip.click()
    await ElementFixture.tick()
    expect(host.open).toBe(false)
    host.addEventListener("ui-open", (event) => event.preventDefault())
    line.click()
    await ElementFixture.tick()
    expect(host.open).toBe(false)
  })

  test("an item without details has no chevron and doesn't fold", async () => {
    const { host, line, toggle } = await item(`<epic-item id="q4" title="Named palette" status="decided"></epic-item>`)
    expect(toggle()).toBeNull()
    line.click()
    await ElementFixture.tick()
    expect(host.open).toBe(false)
  })

  test("labels its own text `Original question` once answered, `Original reply` above More Details;  never over a part", async () => {
    const answered = await item(
      `<epic-item id="q5" title="A" status="decided" answered><p>Asked</p><epic-answer title="B"></epic-answer></epic-item>`
    )
    const more = await item(
      `<epic-item id="j6" title="A" status="open"><p>Said</p><epic-more><p>More</p></epic-more></epic-item>`
    )
    const bare = await item(
      `<epic-item id="q6" title="A" status="decided" answered><epic-answer title="B"></epic-answer></epic-item>`
    )
    expect([answered.label(), more.label(), bare.label()]).toEqual(["Original question", "Original reply", null])
  })

  test("a link to it, or to an element inside it, unfolds it (`ui-open` after the fact)", async () => {
    const { host } = await item(`<epic-item id="q7" title="A" status="open"><p id="q7-why">Why</p></epic-item>`)
    location.hash = "#q7-why"
    await new Promise((resolve) => setTimeout(resolve, 0))
    await ElementFixture.tick()
    expect(host.open).toBe(true)
    history.replaceState(null, "", location.pathname + location.search)
  })

  test('Claude\'s status cards (`slot="status"`) show after its text;  a card alone is details to fold (P13)', async () => {
    const card = `<epic-status slot="status" state="underway" at="2026-10-08 14:20"><p>On it</p></epic-status>`
    const { host } = await item(`<epic-item id="j2" title="A" status="open">${card}<p>Text</p></epic-item>`)
    const bare = await item(`<epic-item id="j3" title="B" status="open">${card}</epic-item>`)
    const slots = Array.from(
      host.shadowRoot!.querySelectorAll<HTMLSlotElement>("[part~='details'] slot"),
      (slot) => slot.name
    )
    expect([slots, host.querySelector("epic-status")!.assignedSlot!.name]).toEqual([["", "status"], "status"])
    expect(bare.host.shadowRoot!.querySelector("[part~='toggle']")).not.toBeNull()
  })

  test("shows its children through a bare slot when its render throws (no fallback of its own)", async () => {
    const { host } = await item(`<epic-item id="i1" title="Broken" status="open"><p>Still here</p></epic-item>`)
    await ElementFixture.breakRender(host)
    expect(host.matches(":state(errored)")).toBe(true)
    expect(host.shadowRoot!.querySelector("[part~='id']")).toBeNull()
    expect(host.querySelector("p")!.assignedSlot).not.toBeNull()
  })

  test("with commits, a git icon on its line (T17):  a click opens it and shows its own commits, again hides them", async () => {
    const { host, line, details } = await item(
      `<epic-item id="i2" title="Fixed" status="done"><p>Why.</p><epic-commit sha="abc1234">Fix it</epic-commit></epic-item>`
    )
    const git = () => host.shadowRoot!.querySelector<HTMLButtonElement>("[part~='git']")
    const shown = () => details.style.getPropertyValue("--epic-commits-display")
    expect(git()?.getAttribute("aria-pressed")).toBe("false")
    expect([host.open, shown()]).toEqual([false, ""])
    git()!.click()
    await ElementFixture.tick()
    expect([host.open, shown(), git()!.getAttribute("aria-pressed")]).toEqual([true, "block", "true"])
    expect(host.matches(":state(commits)")).toBe(true)
    git()!.click()
    await ElementFixture.tick()
    // its own commits hidden again, the item still open:  the git icon never folds it
    expect([host.open, shown(), git()!.getAttribute("title")]).toEqual([true, "", "Show this item's commits"])
    expect(line.contains(git())).toBe(true)
    const bare = await item(`<epic-item id="i3" title="No commits" status="open"><p>Why.</p></epic-item>`)
    expect(bare.host.shadowRoot!.querySelector("[part~='git']")).toBeNull()
    const marked = await item(`<epic-item id="i4" title="In its part" status="done" commits=""></epic-item>`)
    expect(marked.host.shadowRoot!.querySelector("[part~='git']")).not.toBeNull()
  })

  test("made overnight (`overnight`, I3):  a bed icon at the line's end, `made overnight`;  none by day", async () => {
    const { host, line } = await item(`<epic-item id="j8" title="By night" status="open" overnight></epic-item>`)
    const bed = host.shadowRoot!.querySelector<HTMLElement>("[part~='overnight']")!
    expect([bed.title, bed.getAttribute("aria-label"), line.contains(bed)]).toEqual([
      "made overnight",
      "made overnight",
      true
    ])
    await vi.waitFor(() => expect(bed.querySelector("svg")).not.toBeNull())
    const day = await item(`<epic-item id="j9" title="By day" status="open"></epic-item>`)
    expect(day.host.shadowRoot!.querySelector("[part~='overnight']")).toBeNull()
  })

  test("`calm`:  the chip follows the script's `state` (open:  yellow), and stays a link without a review", async () => {
    const { chip } = await item(`<epic-item id="j10" title="Follows WWOD" status="open" state="open" calm></epic-item>`)
    expect([chip.localName, chip.title]).toEqual(["a", "Open, still undecided · not reviewed yet"])
  })

  test("the chip's colours (Q20):  open yellow with DARK text, progress blue;  both readable (axe's contrast)", async () => {
    const open = await item(`<epic-item id="t1" title="Later" status="open" state="open"></epic-item>`)
    const working = await item(`<epic-item id="t2" title="Now" status="open" state="progress"></epic-item>`)
    expect(getComputedStyle(working.chip).backgroundColor).not.toBe(getComputedStyle(open.chip).backgroundColor)
    await expectAccessible(open.host)
    await expectAccessible(working.host)
  })
})

describe("<epic-item source>", () => {
  beforeAll(async () => {
    await UI.load()
  })

  afterEach(() => {
    UI.sources.forget()
    vi.restoreAllMocks()
  })

  test("fetches nothing while folded;  the first unfold loads the part into its LIGHT children, then `ui-load`", async () => {
    const fetches = serve(PART, PART_HTML)
    const { host, line } = await item(
      `<epic-item id="q6" title="Parts" status="decided" answered source="${PART}"><p class="placeholder">Wait</p></epic-item>`
    )
    const loads: string[] = []
    host.addEventListener("ui-load", (event) => loads.push((event as CustomEvent<{ source: string }>).detail.source))
    await ElementFixture.tick()
    expect(fetches).not.toHaveBeenCalled()
    line.click()
    await host.load()
    await ElementFixture.tick()
    expect(loads).toEqual([PART])
    expect(host.matches(":state(loaded)")).toBe(true)
    expect(host.querySelector(".placeholder")).toBeNull()
    expect(host.querySelector(":scope > p.from-part")).not.toBeNull()
    expect(document.getElementById("d9")).not.toBeNull()
  })

  test("a link to an id in `part-ids` unfolds it and loads the part, so the link lands", async () => {
    serve(PART, PART_HTML)
    const { host } = await item(
      `<epic-item id="q8" title="Parts" status="decided" source="${PART}" part-ids="d9"></epic-item>`
    )
    location.hash = "#d9"
    await new Promise((resolve) => setTimeout(resolve, 0))
    await host.load()
    await ElementFixture.tick()
    expect([host.open, !!document.getElementById("d9")]).toEqual([true, true])
    history.replaceState(null, "", location.pathname + location.search)
  })

  test("a part that won't load:  `ui-error`, and a note in its details saying so", async () => {
    serve(PART, "", 500)
    const errors = vi.fn()
    document.addEventListener("ui-error", errors)
    const { host, error } = await item(
      `<epic-item id="q9" title="Parts" status="open" source="${PART}" open></epic-item>`
    )
    await host.load().catch(() => undefined)
    document.removeEventListener("ui-error", errors)
    await ElementFixture.tick()
    expect(host.matches(":state(error)")).toBe(true)
    expect(errors).toHaveBeenCalled()
    expect(error()).toBe(`Couldn't load ${PART}.`)
  })
})
