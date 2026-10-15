import { afterEach, describe, expect, test, vi } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import "$/epics/components/epic-link"

/** `<epic-link>`'s drawn link (or plain text) in its shadow root. */
function linkOf(element: Element): HTMLElement {
  return element.shadowRoot!.querySelector<HTMLElement>('[part~="base"]')!
}

/** What a link shows:  its href, title, text (its slot's fallback when it holds none) and whether it's broken. */
function shown(element: Element) {
  const link = linkOf(element)
  const slot = link.querySelector("slot")!
  const text = slot.assignedNodes().length ? element.textContent : slot.textContent
  return {
    href: link.getAttribute("href"),
    title: link.getAttribute("title"),
    text,
    broken: (element as HTMLElement & { matches(s: string): boolean }).matches(":state(broken)")
  }
}

/** A page with phases and an item, and `links` in it. */
function page(links: string): string {
  return (
    `<epic-page epic="demo" title="Demo"><epic-section id="phases" kind="phases">` +
    `<epic-phase id="p1" title="First Step"></epic-phase><epic-phase id="p-epic-migrate" title="Epic Migrate"></epic-phase>` +
    `</epic-section><epic-section id="todos" kind="todos"><epic-item id="t3" title="Write the docs"></epic-item>` +
    `</epic-section><p>${links}</p></epic-page>`
  )
}

afterEach(() => vi.unstubAllGlobals())

describe("<epic-link>", () => {
  test("an item on its own page:  a `#id` link, the short form, the item's title as its tooltip", async () => {
    const root = await ElementFixture.render(page(`<epic-link item="T3"></epic-link>`))
    const link = root.querySelector("epic-link")!
    expect(shown(link)).toEqual({ href: "#t3", title: "Write the docs", text: "T3", broken: false })
    await expectAccessible(link)
  })

  test("a phase by name or number:  today's number and its title;  its own text when it has some", async () => {
    const root = await ElementFixture.render(
      page(`<epic-link phase="epic-migrate"></epic-link><epic-link phase="1">the first</epic-link>`)
    )
    const [byName, byNumber] = root.querySelectorAll("epic-link")
    expect(shown(byName!)).toMatchObject({ href: "#p-epic-migrate", text: "P2 · Epic Migrate", title: "Epic Migrate" })
    expect(shown(byNumber!)).toMatchObject({ href: "#p1", text: "the first" })
  })

  test("an id the page doesn't have:  broken, struck through, saying so", async () => {
    const root = await ElementFixture.render(page(`<epic-link item="T9"></epic-link>`))
    const link = root.querySelector("epic-link")!
    expect(shown(link)).toMatchObject({ broken: true, title: 'Not found:  <epic-link item="T9">' })
    expect(getComputedStyle(linkOf(link)).textDecorationLine).toBe("line-through")
  })

  test("another page:  its address from the checkout's root, the epic's tab;  the server's title and short form", async () => {
    const fetched = vi.fn(async () =>
      Response.json({ href: "epics/seo/seo.plan.html#j3", title: "Titles from the page", label: "seo J3", found: true })
    )
    vi.stubGlobal("fetch", fetched)
    const link = await ElementFixture.render(`<epic-link saga="spell-ui" epic="seo" item="J3"></epic-link>`)
    await vi.waitFor(() => expect(linkOf(link).getAttribute("title")).toBe("Titles from the page"))
    expect((fetched.mock.calls[0] as unknown[])[0]).toBe("/api/epics/target?saga=spell-ui&epic=seo&item=J3")
    expect(shown(link)).toMatchObject({ href: `${location.origin}/epics/seo/seo.plan.html#j3`, text: "seo J3" })
    expect(linkOf(link).getAttribute("target")).toBe("seo")
  })

  test("another page the server can't find:  broken;  no server:  the short form as written, no tooltip", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ href: "sagas/nope/nope.saga.html#t3", label: "nope T3", found: false }))
    )
    const broken = await ElementFixture.render(`<epic-link saga="nope" item="T3"></epic-link>`)
    await vi.waitFor(() => expect(shown(broken).broken).toBe(true))
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 404 }))
    )
    const quiet = await ElementFixture.render(`<epic-link epic="seo" phase="P7"></epic-link>`)
    expect(shown(quiet)).toMatchObject({ text: "seo P7", title: null, broken: false })
  })
})
