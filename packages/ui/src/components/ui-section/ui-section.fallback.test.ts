import { describe, expect, it } from "vite-plus/test"

import type { SectionToggleDetail } from "$/ui/components/components.types"
import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"

import { SectionFallback } from "./ui-section.fallback"

// defines `<ui-sections>`:  the fallback finds its group through the owner registry
import "$/ui/components/ui-section"

FallbackStub.define("x-fb-section", (host, root, internals) =>
  SectionFallback.render(host, root, new Error("boom"), internals)
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

/** The fallback's `<section>` root in `host`. */
function root(host: Element): HTMLElement {
  return FallbackStub.shadow(host).querySelector<HTMLElement>("[part~=section]")!
}

/** The part `name` in `host`'s fallback, or `null`. */
function part(host: Element, name: string): HTMLElement | null {
  return FallbackStub.shadow(host).querySelector<HTMLElement>(`[part~=${name}]`)
}

/** `tag.class` of `element`'s part children, in order. */
function shape(element: Element) {
  return [...element.children]
    .filter((child) => child.hasAttribute("part"))
    .map((child) => `${child.localName}.${child.className}`)
}

/** Collect `ui-open` / `ui-close` events from `host`. */
function record(host: Element) {
  const seen: { type: string; event: CustomEvent<SectionToggleDetail> }[] = []
  for (const type of ["ui-open", "ui-close"]) {
    host.addEventListener(type, (event) => seen.push({ type, event: event as CustomEvent<SectionToggleDetail> }))
  }
  return seen
}

describe("SectionFallback", () => {
  it("renders the section, title bar, heading, toggle, header and content", async () => {
    const host = Fixture.render<StubHost>(`<x-fb-section header="Intro" color="teal" dividing>Body</x-fb-section>`)
    const section = root(host)
    expect(section.localName).toBe("section")
    expect(section.className).toBe("ui teal dividing section")
    expect(shape(section)).toEqual(["header.title", "div.content"])
    expect(shape(part(host, "title")!)).toEqual(["h2.heading"])
    const toggle = part(host, "toggle")!
    expect(toggle.localName).toBe("span")
    expect(shape(toggle)).toEqual(["span.header"])
    const header = part(host, "header")!.querySelector("slot")!
    expect(header.name).toBe("header")
    expect(header.textContent).toBe("Intro")
    expect(part(host, "content")!.querySelector("slot:not([name])")).not.toBeNull()
    await expectAccessible(host, AXE)
  })

  it("renders the icon, badge, actions and subhead wrappers only when used", () => {
    const bare = Fixture.render<StubHost>(`<x-fb-section header="H">Body</x-fb-section>`)
    expect(["icon", "badge", "actions", "subhead", "fold-icon"].map((name) => part(bare, name))).toEqual([
      null,
      null,
      null,
      null,
      null
    ])
    const host = Fixture.render<StubHost>(
      `<x-fb-section header="H" icon="bug" badge="3/7" subhead="Sub"><button slot="actions">Edit</button>Body</x-fb-section>`
    )
    expect(shape(root(host))).toEqual(["header.title", "div.subhead", "div.content"])
    expect(shape(part(host, "title")!)).toEqual(["h2.heading", "span.badge", "span.actions"])
    expect(shape(part(host, "toggle")!)).toEqual(["span.icon", "span.header"])
    expect(part(host, "badge")!.textContent).toBe("3/7")
    expect(part(host, "subhead")!.textContent).toBe("Sub")
    const slotted = Fixture.render<StubHost>(
      `<x-fb-section><span slot="icon">!</span><span slot="badge">1</span><span slot="subhead">S</span>Body</x-fb-section>`
    )
    expect(part(slotted, "icon")!.querySelector("slot")!.name).toBe("icon")
    expect(part(slotted, "badge")!.querySelector("slot")!.name).toBe("badge")
    expect(part(slotted, "subhead")!.querySelector("slot")!.name).toBe("subhead")
  })

  it("takes its heading level from `level`, else nesting, capped at h6", () => {
    const host = Fixture.render<StubHost>(
      `<x-fb-section header="A"><x-fb-section id="b" header="B"><x-fb-section id="c" header="C" level="6">` +
        `<x-fb-section id="d" header="D">x</x-fb-section></x-fb-section></x-fb-section></x-fb-section>`
    )
    const heading = (element: Element) => part(element, "heading")!.localName
    expect(heading(host)).toBe("h2")
    expect(heading(host.querySelector("#b")!)).toBe("h3")
    expect(heading(host.querySelector("#c")!)).toBe("h6")
    expect(heading(host.querySelector("#d")!)).toBe("h6")
  })

  it("still folds:  a button, a cancelable ui-close / ui-open, then hidden content and the host's `collapsed`", async () => {
    const host = Fixture.render<StubHost>(`<x-fb-section header="H" collapsible>Body</x-fb-section>`)
    const toggle = part(host, "toggle") as HTMLButtonElement
    const content = part(host, "content")!
    expect(toggle.localName).toBe("button")
    expect(toggle.type).toBe("button")
    expect(toggle.getAttribute("aria-expanded")).toBe("true")
    expect(toggle.getAttribute("aria-controls")).toBe(content.id)
    expect(shape(toggle)).toEqual(["span.fold icon", "span.header"])
    expect(part(host, "fold-icon")!.getAttribute("aria-hidden")).toBe("true")
    await expectAccessible(host, AXE)
    const seen = record(host)
    host.addEventListener("ui-close", (event) => event.preventDefault(), { once: true })
    toggle.click()
    expect(content.hasAttribute("hidden")).toBe(false)
    toggle.click()
    expect(content.getAttribute("hidden")).toBe("until-found")
    expect(toggle.getAttribute("aria-expanded")).toBe("false")
    expect(host.hasAttribute("collapsed")).toBe(true)
    toggle.click()
    expect(content.hasAttribute("hidden")).toBe(false)
    expect(host.hasAttribute("collapsed")).toBe(false)
    expect(seen.map(({ type, event }) => [type, event.detail.open, event.cancelable])).toEqual([
      ["ui-close", false, true],
      ["ui-close", false, true],
      ["ui-open", true, true]
    ])
    expect(seen[0]!.event.detail.section).toBe(host)
    expect(seen[0]!.event.detail.originalEvent).toBeInstanceOf(MouseEvent)
    expect(seen[0]!.event.composed).toBe(true)
  })

  it("starts folded with `collapsed`, and find-in-page unfolds it", () => {
    const host = Fixture.render<StubHost>(`<x-fb-section header="H" collapsible collapsed>Needle</x-fb-section>`)
    const content = part(host, "content")!
    expect(content.getAttribute("hidden")).toBe("until-found")
    const seen = record(host)
    content.dispatchEvent(new Event("beforematch", { bubbles: true }))
    expect(content.hasAttribute("hidden")).toBe(false)
    expect(host.hasAttribute("collapsed")).toBe(false)
    expect(seen.map(({ type, event }) => [type, event.cancelable])).toEqual([["ui-open", false]])
  })

  it("ignores `collapsed` without `collapsible`, and can't fold while `disabled`", () => {
    const fixed = Fixture.render<StubHost>(`<x-fb-section header="H" collapsed>Body</x-fb-section>`)
    expect(part(fixed, "toggle")!.localName).toBe("span")
    expect(part(fixed, "content")!.hasAttribute("hidden")).toBe(false)
    const disabled = Fixture.render<StubHost>(`<x-fb-section header="H" collapsible disabled>Body</x-fb-section>`)
    const toggle = part(disabled, "toggle") as HTMLButtonElement
    expect(toggle.disabled).toBe(true)
    expect(root(disabled).className).toBe("ui disabled section")
  })

  it("caps a `height` box (implying `scrolling`) and makes it a tab stop;  `loading` is busy", () => {
    const host = Fixture.render<StubHost>(`<x-fb-section header="H" height="6em" loading>Body</x-fb-section>`)
    const content = part(host, "content")!
    expect(root(host).className).toBe("ui loading section scrolling")
    expect(content.style.getPropertyValue("--_ui-section-height")).toBe("6em")
    expect(content.tabIndex).toBe(0)
    expect(root(host).getAttribute("aria-busy")).toBe("true")
    expect(root(host).querySelector("[role=status]")!.textContent).toBe("Loading…")
  })

  it('folds by default in `<ui-sections collapsing>`, sub-sections too, unless `collapsible="false"`', () => {
    const group = Fixture.render(
      `<ui-sections collapsing><x-fb-section id="a" header="A" collapsed><x-fb-section id="b" header="B">x` +
        `</x-fb-section></x-fb-section><x-fb-section id="c" header="C" collapsible="false">y</x-fb-section></ui-sections>`
    )
    const toggle = (id: string) => part(group.querySelector(`#${id}`)!, "toggle")!.localName
    expect(toggle("a")).toBe("button")
    expect(part(group.querySelector("#a")!, "content")!.getAttribute("hidden")).toBe("until-found")
    expect(toggle("b")).toBe("button")
    expect(toggle("c")).toBe("span")
    const plain = Fixture.render(`<ui-sections><x-fb-section header="P">z</x-fb-section></ui-sections>`)
    expect(part(plain.querySelector("x-fb-section")!, "toggle")!.localName).toBe("span")
  })

  it("keeps a top-level sticky title at `offset`", () => {
    const host = Fixture.render<StubHost>(`<x-fb-section header="H" sticky offset="12">Body</x-fb-section>`)
    expect(root(host).className).toBe("ui sticky section")
    expect(part(host, "title")!.style.getPropertyValue("--_ui-section-top")).toBe("12px")
  })
})
