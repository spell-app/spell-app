import { describe, expect, it, onTestFinished, vi } from "vite-plus/test"

import { expectAccessible } from "$/ui/test/A11y"
import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"

import { TocIndex } from "./TocIndex"
import type { TocEntry } from "./ui-docs-toc.types"

import "$/ui/docs-components/ui-docs-toc"
import "$/ui/components/ui-section"
import "$/ui/components/ui-tab"

////////////////
// ## Fixtures
////////////////

/** Element-markup examples, by path. */
const EXAMPLES = import.meta.glob<string>("/src/docs-components/ui-docs-toc/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A page-like fixture:  a toc following `#content`, which holds two sections of examples. */
const PAGE = `
  <div>
    <ui-docs-toc for="content" header="Button"></ui-docs-toc>
    <section id="content">
      <ui-header level="2">Types</ui-header>
      <ui-docs-example header="Button"><ui-button>A</ui-button></ui-docs-example>
      <ui-docs-example header="Labeled Icon"><ui-button>B</ui-button></ui-docs-example>
      <ui-docs-example><ui-button>no header:  not listed</ui-button></ui-docs-example>
      <ui-header level="2" id="states-section">States</ui-header>
      <ui-docs-example header="Disabled">
        <ui-header level="2">A demo heading:  not listed</ui-header>
      </ui-docs-example>
      <ui-header level="3">Loading</ui-header>
    </section>
  </div>`

/**
 * A page of nested `<ui-section>`s, as the site's converter writes them:  a section per example, a rich title, a
 * section inside an example's demo (not listed).
 */
const SECTIONS = `
  <div>
    <ui-docs-toc for="nested"></ui-docs-toc>
    <article id="nested">
      <ui-section id="examples-types" header="Types">
        <ui-section id="examples-types-button" header="Button">
          <ui-docs-example><ui-button>A</ui-button></ui-docs-example>
        </ui-section>
        <ui-section id="examples-types-group">
          <span slot="header">Group <code>ui-buttons</code></span>
          <ui-section id="examples-types-group-or" header="Or"><p>Or</p></ui-section>
        </ui-section>
      </ui-section>
      <ui-section id="examples-states" header="States">
        <ui-docs-example header="Disabled"><ui-section header="Demo">not listed</ui-section></ui-docs-example>
      </ui-section>
    </article>
  </div>`

////////////////
// ## Helpers
////////////////

/** Render `html`;  returns its toc host. */
async function render(html: string) {
  document.scrollingElement!.scrollTo(0, 0)
  const wrapper = await ElementFixture.render<HTMLElement>(html)
  const toc = wrapper.querySelector<UIHost>("ui-docs-toc")!
  await rendered(toc)
  return { wrapper, toc }
}

/** Wait for `toc`'s first scan (a microtask after connect) and its redraw. */
async function rendered(toc: Element) {
  await new Promise((resolve) => requestAnimationFrame(resolve))
  await ElementFixture.settle(toc)
}

/** `entries` as a tree of ids:  `[id, text, [...]]` for an entry with entries under it, else its id. */
function shapeOf(entries: readonly TocEntry[]): unknown[] {
  return entries.map((entry) => (entry.entries.length ? [entry.id, entry.text, shapeOf(entry.entries)] : entry.id))
}

/** The link texts of `toc`, by part (`section` / `entry`), in order. */
function links(toc: Element, part: "section" | "entry") {
  return [...toc.shadowRoot!.querySelectorAll(`[part~=${part}]`)].map((item) => item.textContent!.trim())
}

////////////////
// ## Scanning
////////////////

describe("<ui-docs-toc> scan", () => {
  it("lists level 2 headings as sections and the current one's examples / level 3 headings as entries", async () => {
    const { toc } = await render(PAGE)
    expect(links(toc, "section")).toEqual(["Types", "States"])
    // the first section is in view at the top:  only its entries show
    await vi.waitFor(() => expect(links(toc, "entry")).toEqual(["Button", "Labeled Icon"]))
    expect(toc.shadowRoot!.querySelector("[part~=header]")!.textContent).toBe("Button")
    expect(toc.matches(":state(empty)")).toBe(false)
  })

  it("gives unnamed headings and examples ids (a slug, unique), and keeps existing ones", async () => {
    const { wrapper, toc } = await render(PAGE)
    const ids = [...wrapper.querySelectorAll("#content > [id]")].map((element) => element.id)
    expect(ids).toEqual(["types", "button", "labeled-icon", "states-section", "disabled", "loading"])
    const hrefs = [...toc.shadowRoot!.querySelectorAll("[part~=section]")].map((item) => item.getAttribute("href"))
    expect(hrefs).toEqual(["#types", "#states-section"])
  })

  it("`expanded` shows every section's entries", async () => {
    const { toc } = await render(PAGE.replace("<ui-docs-toc ", "<ui-docs-toc expanded "))
    expect(links(toc, "entry")).toEqual(["Button", "Labeled Icon", "Disabled", "Loading"])
  })

  it("is `:state(empty)` with nothing to list, and fires `ui-render` with the ids", async () => {
    const wrapper = await ElementFixture.render<HTMLElement>(
      `<div><ui-docs-toc for="nothing"></ui-docs-toc><p id="nothing">Text only.</p></div>`
    )
    const toc = wrapper.querySelector("ui-docs-toc")!
    await rendered(toc)
    expect(toc.matches(":state(empty)")).toBe(true)
    expect(links(toc, "section")).toEqual([])
  })

  it("leaves a heading's sub header out of its link text", async () => {
    const { toc } = await render(
      `<div><ui-docs-toc for="subbed"></ui-docs-toc><section id="subbed">` +
        `<ui-header level="2">Tokens <ui-header>Light and dark</ui-header></ui-header></section></div>`
    )
    expect(links(toc, "section")).toEqual(["Tokens"])
  })

  it("lists `<ui-section>`s as a tree:  nested sections and examples under theirs, a slotted title's text", async () => {
    const { wrapper, toc } = await render(SECTIONS)
    expect(shapeOf(TocIndex.scan(wrapper.querySelector("#nested")!))).toEqual([
      [
        "examples-types",
        "Types",
        ["examples-types-button", ["examples-types-group", "Group ui-buttons", ["examples-types-group-or"]]]
      ],
      ["examples-states", "States", ["disabled"]]
    ])
    expect(links(toc, "section")).toEqual(["Types", "States"])
    // the first section is in view:  its entries show, not the ones nested deeper
    await vi.waitFor(() => expect(links(toc, "entry")).toEqual(["Button", "Group ui-buttons"]))
  })

  it("`expanded` opens nested sections' entries too", async () => {
    const { toc } = await render(SECTIONS.replace("<ui-docs-toc ", "<ui-docs-toc expanded "))
    expect(links(toc, "entry")).toEqual(["Button", "Group ui-buttons", "Or", "Disabled"])
  })
})

////////////////
// ## Following the page
////////////////

describe("<ui-docs-toc> following", () => {
  it("marks the entry in view and opens its section as the page scrolls;  fires `ui-change`", async () => {
    const tall = PAGE.replaceAll("<ui-docs-example", '<ui-docs-example style="display: block; min-height: 120vh"')
    const { toc } = await render(tall)
    const changes: string[] = []
    toc.addEventListener("ui-change", (event) => changes.push((event as CustomEvent<{ value: string }>).detail.value))
    const scroller = document.scrollingElement!
    const before = scroller.scrollTop
    onTestFinished(() => scroller.scrollTo(0, before))
    document.getElementById("disabled")!.scrollIntoView({ block: "start" })
    await vi.waitFor(() => expect(changes.at(-1)).toBe("disabled"))
    await rendered(toc)
    expect(links(toc, "entry")).toEqual(["Disabled", "Loading"])
    const current = toc.shadowRoot!.querySelector("[part~=entry]:state(selected)")
    expect(current?.textContent?.trim()).toBe("Disabled")
    expect(toc.shadowRoot!.querySelector("[part~=section]:state(selected)")?.textContent?.trim()).toBe("States")
  })

  it("follows a `<ui-tabs>`:  lists the shown pane, rescans when another shows", async () => {
    const { wrapper, toc } = await render(`
      <div>
        <ui-docs-toc for="tabs"></ui-docs-toc>
        <ui-tabs id="tabs">
          <ui-tab value="examples" label="Examples">
            <ui-header level="2">Types</ui-header>
            <ui-docs-example header="Button"><ui-button>A</ui-button></ui-docs-example>
          </ui-tab>
          <ui-tab value="usage" label="Usage">
            <ui-header level="2">Keyboard</ui-header>
            <ui-header level="2">Examples</ui-header>
          </ui-tab>
        </ui-tabs>
      </div>`)
    expect(links(toc, "section")).toEqual(["Types"])
    const tabs = wrapper.querySelector<HTMLElement & { value: string }>("ui-tabs")!
    tabs.value = "usage"
    await vi.waitFor(() => expect(links(toc, "section")).toEqual(["Keyboard", "Examples"]))
    // a heading never takes a pane's value as its id:  the URL hash names panes
    expect(wrapper.querySelectorAll("#examples").length).toBe(0)
    expect(wrapper.querySelector("ui-tab[value=usage] > ui-header:last-child")!.id).toBe("examples-2")
  })

  it("a hash naming an element in a hidden pane shows that pane", async () => {
    const { wrapper, toc } = await render(`
      <div>
        <ui-docs-toc for="tabs"></ui-docs-toc>
        <ui-tabs id="tabs">
          <ui-tab value="one" label="One"><ui-header level="2">First</ui-header></ui-tab>
          <ui-tab value="two" label="Two"><ui-header level="2" id="far-away">Second</ui-header></ui-tab>
        </ui-tabs>
      </div>`)
    const before = location.hash
    onTestFinished(() => history.replaceState(history.state, "", before || location.pathname + location.search))
    location.hash = "far-away"
    await vi.waitFor(() => expect(links(toc, "section")).toEqual(["Second"]))
    expect(wrapper.querySelector<HTMLElement & { value: string }>("ui-tabs")!.value).toBe("two")
  })
})

////////////////
// ## Examples
////////////////

describe("<ui-docs-toc> examples", () => {
  it.each(Object.entries(EXAMPLES))("%s:  renders and is accessible", async (_path, html) => {
    const wrapper = await ElementFixture.render<HTMLElement>(`<div>${html}</div>`)
    const toc = wrapper.querySelector<UIHost>("ui-docs-toc")!
    await rendered(toc)
    expect(links(toc, "section")).toEqual(["Types", "States"])
    await expectAccessible(toc)
  })
})
