import { flush } from "solid-js"
import { afterEach, beforeEach, describe, expect, it, onTestFinished } from "vitest"

import { expectAccessible } from "$/ui/test/a11y"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { Fixture } from "$/ui/test/fixture"
import type { UIHost } from "$/ui/elements"
import { SiteData, type SiteDataFile, type SiteSearchFile, type SiteTag } from "$/ui/docs-components"

import { PageOutline } from "./PageOutline"
import { SearchData } from "./SearchData"
import { SearchIndex } from "./SearchIndex"
import type { DocsSearchHost } from "./DocsSearchHost"

import "$/ui/docs-components/ui-docs-search"
import "$/ui/components/ui-flyout"

/** Element-markup examples, by path. */
const EXAMPLES = import.meta.glob<string>("/src/docs-components/ui-docs-search/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A tag of the test data. */
function tag(name: string, tagName: string, extra: Partial<SiteTag> = {}): SiteTag {
  const folder = extra.folder ?? tagName
  return {
    tag: tagName,
    name,
    folder,
    mainTag: folder,
    main: folder === tagName,
    page: folder === tagName,
    href: folder === tagName ? `components/${folder}.html` : `components/${folder}.html#${tagName}`,
    topics: [],
    aka: [],
    noun: name.toLowerCase(),
    attributes: [],
    slots: [],
    events: [],
    parts: [],
    states: [],
    texts: [],
    ...extra
  }
}

/** An attribute of the test data. */
function attribute(name: string, aliases?: string[]) {
  return { name, kind: "keyOnly", description: "", ...(aliases && { aliases }) }
}

/** A family of the test data. */
function family(folder: string, title: string) {
  return {
    folder,
    mainTag: folder,
    title,
    summary: "",
    status: "done" as const,
    docs: false,
    tags: [folder],
    tokens: []
  }
}

/** The test data:  Button (+ Or), Divider, Modal, Label;  each with a few attributes. */
const DATA: SiteDataFile = {
  $comment: "test",
  version: 1,
  topics: [
    { id: "buttons", title: "Buttons" },
    { id: "dialogs", title: "Dialogs" }
  ],
  components: [
    tag("Button", "ui-button", { topics: ["buttons"], attributes: [attribute("circular"), attribute("color")] }),
    tag("Divider", "ui-divider", { attributes: [attribute("vertical"), attribute("horizontal")] }),
    tag("Label", "ui-label", { attributes: [attribute("circular"), attribute("color")] }),
    tag("Modal", "ui-modal", { topics: ["dialogs"], aka: ["dialog", "lightbox"] }),
    tag("Or", "ui-or", { folder: "ui-button" })
  ],
  docs: [],
  families: {
    "ui-button": family("ui-button", "Button"),
    "ui-divider": family("ui-divider", "Divider"),
    "ui-label": family("ui-label", "Label"),
    "ui-modal": family("ui-modal", "Modal")
  },
  foundation: [],
  themes: []
}

/** The test search file:  the overview, Theming, Button's page and Divider's. */
const SEARCH: SiteSearchFile = {
  $comment: "test",
  pages: [
    { path: "index.html", title: "Overview", summary: "What it is.", sections: [{ id: "design", title: "Design" }] },
    {
      path: "theming.html",
      title: "Theming",
      summary: "Tokens and themes.",
      sections: [
        { id: "tokens", title: "Tokens" },
        { id: "tokens-vertical-rhythm", title: "Vertical rhythm", parent: 0 }
      ]
    },
    {
      path: "components/ui-button.html",
      title: "Button",
      tag: "ui-button",
      tabs: { examples: "Examples", usage: "Usage" },
      sections: [
        { id: "examples-variations", title: "Variations", tab: "examples" },
        { id: "examples-variations-circular", title: "Circular", parent: 0 },
        { id: "usage-keyboard", title: "Keyboard", tab: "usage" }
      ]
    },
    {
      path: "components/ui-divider.html",
      title: "Divider",
      tag: "ui-divider",
      tabs: { examples: "Examples" },
      sections: [
        { id: "examples-types", title: "Types", tab: "examples" },
        { id: "examples-types-vertical-divider", title: "Vertical Divider", parent: 0 }
      ]
    }
  ]
}

/** The page shown in the element's tests:  Divider's, as tabs of sections (an example's demo section ignored). */
const PAGE = `
  <main id="test-page">
    <ui-tabs id="site-tabs">
      <ui-tab value="examples" label="Examples">
        <ui-section id="examples-types" header="Types">
          <ui-section id="examples-types-divider" header="Divider"></ui-section>
          <ui-section id="examples-types-vertical-divider" header="Vertical Divider">
            <ui-docs-example><ui-section id="demo" header="Vertical demo"></ui-section></ui-docs-example>
          </ui-section>
        </ui-section>
      </ui-tab>
      <ui-tab value="usage" label="Usage">
        <ui-section id="usage-keyboard" header="Keyboard"></ui-section>
      </ui-tab>
    </ui-tabs>
  </main>`

/** A blob URL serving `data` as JSON. */
function serve(data: unknown): string {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: "application/json" }))
  onTestFinished(() => URL.revokeObjectURL(url))
  return url
}

beforeEach(() => {
  SiteData.reset(serve(DATA))
  SearchData.reset(serve(SEARCH))
})

afterEach(() => {
  SiteData.reset()
  SiteData.url = undefined
  SearchData.reset()
})

/** Render the page and a field reading it (links under `#/`). */
async function render(attributes = "") {
  const page = Fixture.render(PAGE)
  const field = await ElementFixture.render<DocsSearchHost>(
    `<ui-docs-search base="#/" page="#test-page" ${attributes}></ui-docs-search>`
  )
  return { page, field }
}

/** The element in `field`'s shadow root matching `selector`. */
function find<T extends Element = HTMLElement>(field: Element, selector: string): T {
  const element = field.shadowRoot!.querySelector<T>(selector)
  if (!element) throw new Error(`no ${selector}`)
  return element
}

/** The field's `<input>`. */
function input(field: Element): HTMLInputElement {
  return find<HTMLInputElement>(field, "input")
}

/** Focus the field and type `text`, then wait for the index and the card. */
async function type(field: Element, text: string) {
  const control = input(field)
  control.focus()
  control.value = text
  control.dispatchEvent(new Event("input", { bubbles: true, composed: true }))
  await expect.poll(() => (field as Element).matches(":state(loading)")).toBe(false)
  await settle(field)
  // the card fades in:  measure (contrast, boxes) once it has
  for (const animation of field.shadowRoot!.getAnimations()) animation.finish()
}

/** Wait for every element in `field`'s shadow root, then flush. */
async function settle(field: Element) {
  for (let round = 0; round < 3; round++) {
    const hosts = [...field.shadowRoot!.querySelectorAll("*")].filter(
      (element): element is UIHost => "ready" in element
    )
    await Promise.all(hosts.map((host) => host.ready))
    await ElementFixture.tick()
  }
  flush()
}

/** A key on the field's `<input>`. */
async function press(field: Element, key: string, init: KeyboardEventInit = {}) {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, composed: true, cancelable: true, ...init })
  input(field).dispatchEvent(event)
  await settle(field)
  return event
}

/** Every group:  its label and its options' titles. */
function groups(field: Element): { label: string; titles: string[] }[] {
  return [...field.shadowRoot!.querySelectorAll("[role=group]")].map((group) => ({
    label: group.querySelector(".label")!.textContent!,
    titles: [...group.querySelectorAll("[role=option] .name")].map((name) => name.textContent!)
  }))
}

/** The options, in order. */
function options(field: Element): HTMLAnchorElement[] {
  return [...field.shadowRoot!.querySelectorAll<HTMLAnchorElement>("[role=option]")]
}

/** The card is open (a popover in the top layer). */
function open(field: Element): boolean {
  return find(field, "[part~=results]").matches(":popover-open")
}

describe("<ui-docs-search>", () => {
  it("is a pill:  a labelled combobox, the shortcut hint, the card shut", async () => {
    const { field } = await render()
    const control = input(field)
    expect(control.getAttribute("role")).toBe("combobox")
    expect(control.getAttribute("aria-label")).toBe("Search the docs")
    expect(control.getAttribute("aria-expanded")).toBe("false")
    expect(control.getAttribute("placeholder")).toBe("Search")
    expect(control.getAttribute("aria-keyshortcuts")).toBe("/ Meta+K Control+K")
    expect([...find(field, "[part~=keys]").querySelectorAll("kbd")].map((key) => key.textContent)).toHaveLength(2)
    expect(find(field, ".ui.finder").getAttribute("part")).toBe("search")
    expect(open(field)).toBe(false)
  })

  it("finds a component by name:  its group first, the best match highlighted and marked", async () => {
    const { field } = await render()
    await type(field, "or")
    expect(open(field)).toBe(true)
    expect(groups(field)[0]).toEqual({ label: "Components", titles: ["Or"] })
    const first = options(field)[0]!
    expect(first.getAttribute("aria-selected")).toBe("true")
    expect(input(field).getAttribute("aria-activedescendant")).toBe(first.id)
    expect(input(field).getAttribute("aria-expanded")).toBe("true")
    expect(first.querySelector("mark")!.textContent).toBe("Or")
    expect(first.querySelector("code")!.textContent).toBe("<ui-or>")
    expect(first.getAttribute("href")).toBe("#/components/ui-button.html#ui-or")
    expect(field.matches(":state(open)")).toBe(true)
    expect(find(field, "[role=status]").textContent).toMatch(/results?$/)
  })

  it("puts the page shown's section first for its title, with where it is", async () => {
    const { field } = await render()
    await type(field, "vertical")
    const [here] = groups(field)
    expect(here).toEqual({ label: "On this page", titles: ["Vertical Divider"] })
    const option = options(field)[0]!
    expect(option.querySelector(".context")!.textContent).toBe("Examples › Types")
    expect(option.getAttribute("href")).toBe("#examples-types-vertical-divider")
    // the search file's copy of THIS page is skipped;  the demo section inside an example never shows
    expect(groups(field).flatMap((group) => group.titles)).not.toContain("Vertical demo")
  })

  it("finds attributes, by name and by tag and name", async () => {
    const { field } = await render()
    await type(field, "circular")
    expect(groups(field).find((group) => group.label === "Attributes")!.titles).toEqual(["circular", "circular"])
    await type(field, "button circular")
    const attribute = options(field).find((option) => option.classList.contains("attribute"))!
    expect(attribute.querySelector("code")!.textContent).toBe("<ui-button>")
    expect(attribute.getAttribute("href")).toBe("#/components/ui-button.html#ui-button")
  })

  it("finds other pages and their sections", async () => {
    const { field } = await render()
    await type(field, "theming")
    expect(groups(field)[0]).toEqual({ label: "Pages", titles: ["Theming"] })
    await type(field, "rhythm")
    const section = options(field)[0]!
    expect(section.querySelector(".context")!.textContent).toBe("Theming › Tokens")
    expect(section.getAttribute("href")).toBe("#/theming.html#tokens-vertical-rhythm")
  })

  it("says when nothing matches", async () => {
    const { field } = await render()
    await type(field, "zzzz")
    expect(open(field)).toBe(true)
    expect(field.matches(":state(empty)")).toBe(true)
    expect(find(field, ".note.empty").textContent).toBe("Nothing matches “zzzz”")
    expect(input(field).hasAttribute("aria-controls")).toBe(false)
  })

  it("fires `ui-input` on every keystroke, and clearing", async () => {
    const { field } = await render()
    const values: string[] = []
    field.addEventListener("ui-input", (event) => values.push((event as CustomEvent<{ value: string }>).detail.value))
    await type(field, "b")
    await type(field, "bu")
    find(field, ".clear").click()
    await settle(field)
    expect(values).toEqual(["b", "bu", ""])
    expect(input(field).value).toBe("")
    expect(field.shadowRoot!.activeElement).toBe(input(field))
  })
})

describe("<ui-docs-search> keyboard", () => {
  it("moves with ↑ / ↓ (wrapping), the active option named by `aria-activedescendant`", async () => {
    const { field } = await render()
    await type(field, "circular")
    const all = options(field)
    expect(all.length).toBeGreaterThan(2)
    await press(field, "ArrowDown")
    expect(input(field).getAttribute("aria-activedescendant")).toBe(all[1]!.id)
    expect(all[1]!.getAttribute("aria-selected")).toBe("true")
    expect(all[0]!.getAttribute("aria-selected")).toBe("false")
    await press(field, "ArrowUp")
    await press(field, "ArrowUp")
    expect(input(field).getAttribute("aria-activedescendant")).toBe(all.at(-1)!.id)
  })

  it("Escape closes, then clears, then leaves for where a shortcut came from", async () => {
    const { field } = await render()
    const before = Fixture.render<HTMLButtonElement>(`<button>before</button>`)
    before.focus()
    document.body.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true, cancelable: true })
    )
    await settle(field)
    expect(field.shadowRoot!.activeElement).toBe(input(field))
    await type(field, "or")
    expect((await press(field, "Escape")).defaultPrevented).toBe(true)
    expect(open(field)).toBe(false)
    expect(input(field).value).toBe("or")
    await press(field, "ArrowDown")
    expect(open(field)).toBe(true)
    await press(field, "Escape")
    await press(field, "Escape")
    expect(input(field).value).toBe("")
    await press(field, "Escape")
    expect(document.activeElement).toBe(before)
  })

  it("Tab closes the card and moves on;  focusing again reopens it", async () => {
    const { field } = await render()
    await type(field, "or")
    const tab = await press(field, "Tab")
    expect(tab.defaultPrevented).toBe(false)
    expect(open(field)).toBe(false)
    input(field).blur()
    input(field).focus()
    await settle(field)
    expect(open(field)).toBe(true)
  })

  it("Enter picks the active result:  a cancelable `ui-navigate`;  vetoed, the page stays;  the field empties", async () => {
    const { field } = await render()
    const picked: { href: string; kind: string }[] = []
    field.addEventListener("ui-navigate", (event) => {
      picked.push((event as CustomEvent<{ href: string; kind: string }>).detail)
      event.preventDefault()
    })
    await type(field, "or")
    const enter = await press(field, "Enter")
    expect(enter.defaultPrevented).toBe(true)
    expect(picked).toHaveLength(1)
    expect(picked[0]!.kind).toBe("component")
    expect(picked[0]!.href).toBe(new URL("#/components/ui-button.html#ui-or", location.href).href)
    await expect.poll(() => input(field).value).toBe("")
    expect(open(field)).toBe(false)
  })

  it("Enter on the page shown's section sets the hash;  the same one again re-announces it", async () => {
    const { field } = await render()
    const hash = location.hash
    onTestFinished(() => history.replaceState(history.state, "", location.pathname + location.search + hash))
    let changes = 0
    const onHash = () => changes++
    window.addEventListener("hashchange", onHash)
    onTestFinished(() => window.removeEventListener("hashchange", onHash))
    await type(field, "vertical divider")
    await press(field, "Enter")
    expect(location.hash).toBe("#examples-types-vertical-divider")
    await expect.poll(() => changes).toBe(1)
    await type(field, "vertical divider")
    await press(field, "Enter")
    await expect.poll(() => changes).toBe(2)
  })

  it("a click on an option picks it;  hovering highlights", async () => {
    const { field } = await render()
    const picked: string[] = []
    field.addEventListener("ui-navigate", (event) => {
      picked.push((event as CustomEvent<{ kind: string }>).detail.kind)
      event.preventDefault()
    })
    await type(field, "circular")
    const second = options(field)[1]!
    second.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, composed: true }))
    await settle(field)
    expect(second.getAttribute("aria-selected")).toBe("true")
    second.click()
    expect(picked).toHaveLength(1)
  })
})

describe("<ui-docs-search> shortcuts", () => {
  it("`/` focuses the field, unless typing in a field;  Cmd / Ctrl+K even then", async () => {
    const { field } = await render()
    const other = Fixture.render<HTMLInputElement>(`<input type="text" aria-label="other">`)
    other.focus()
    const slash = new KeyboardEvent("keydown", { key: "/", bubbles: true, composed: true, cancelable: true })
    other.dispatchEvent(slash)
    expect(slash.defaultPrevented).toBe(false)
    expect(document.activeElement).toBe(other)
    other.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true, cancelable: true }))
    await settle(field)
    expect(field.shadowRoot!.activeElement).toBe(input(field))
    other.focus()
    other.blur()
    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "/", bubbles: true, cancelable: true }))
    expect(field.shadowRoot!.activeElement).toBe(input(field))
  })

  it('`shortcuts="false"` turns them off', async () => {
    const { field } = await render(`shortcuts="false"`)
    document.body.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true, cancelable: true })
    )
    await settle(field)
    expect(field.shadowRoot!.activeElement).toBeNull()
    expect(field.shadowRoot!.querySelector("[part~=keys]")).toBeNull()
    expect(input(field).hasAttribute("aria-keyshortcuts")).toBe(false)
  })

  it("summons a field hidden in a closed flyout:  the flyout opens, the field gets focus", async () => {
    const flyout = await ElementFixture.render<UIHost>(
      `<ui-flyout aria-label="Menu"><ui-docs-search base="#/"></ui-docs-search></ui-flyout>`
    )
    const field = flyout.querySelector<DocsSearchHost>("ui-docs-search")!
    await ElementFixture.settle(flyout)
    expect(field.checkVisibility()).toBe(false)
    document.body.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true, cancelable: true })
    )
    await expect.poll(() => field.shadowRoot!.activeElement === input(field)).toBe(true)
    expect(flyout.hasAttribute("open")).toBe(true)
    flyout.removeAttribute("open")
    await settle(field)
  })
})

describe("<ui-docs-search> data", () => {
  it("searches the page shown when the site's data doesn't load", async () => {
    SiteData.reset("/no-such-folder/_data/components.json")
    SearchData.reset("/no-such-folder/_data/search.json")
    const { field } = await render()
    await type(field, "keyboard")
    expect(groups(field)).toEqual([{ label: "On this page", titles: ["Keyboard"] }])
    expect(field.matches(":state(loading)")).toBe(false)
  })
})

describe("SearchIndex", () => {
  const index = new SearchIndex(DATA, SEARCH)

  /** The titles found for `query`, group by group. */
  function found(query: string, current?: string) {
    return index.search(query, [], current).map((group) => [group.kind, group.hits.map((hit) => hit.entry.title)])
  }

  it("builds a component per tag, an attribute per tag attribute, a page per hand-written page, a section each", () => {
    const kinds = index.entries.map((entry) => entry.kind)
    expect(kinds.filter((kind) => kind === "component")).toHaveLength(5)
    expect(kinds.filter((kind) => kind === "attribute")).toHaveLength(6)
    expect(index.entries.filter((entry) => entry.kind === "page").map((entry) => entry.title)).toEqual([
      "Overview",
      "Theming"
    ])
    expect(kinds.filter((kind) => kind === "section")).toHaveLength(8)
  })

  it.each([
    ["or", "component", "Or"],
    ["OR", "component", "Or"],
    ["ui-or", "component", "Or"],
    ["uior", "component", "Or"],
    ["dialog", "component", "Modal"],
    ["light", "component", "Modal"],
    ["modal", "component", "Modal"],
    ["over", "page", "Overview"],
    ["rhythm", "section", "Vertical rhythm"]
  ])("ranks %j's best match first:  a %s, %s", (query, kind, title) => {
    const [group] = index.search(query)
    expect(group!.kind).toBe(kind)
    expect(group!.hits[0]!.entry.title).toBe(title)
  })

  it("matches short queries only at word starts:  `or` never finds every `color`", () => {
    expect(found("or").flatMap(([, titles]) => titles)).not.toContain("color")
    expect(found("olo")).toEqual([["attribute", ["color", "color"]]])
  })

  it("needs every word of a query, found at word starts, across title and terms", () => {
    const [group] = index.search("label circ")
    expect(group!.kind).toBe("attribute")
    expect(group!.hits.map((hit) => hit.entry.code)).toEqual(["<ui-label>"])
    expect(group!.hits[0]!.marks).toEqual([[0, 4]])
    expect(index.search("label zebra")).toEqual([])
  })

  it("marks the matched text:  the whole query, else each word", () => {
    expect(SearchIndex.marks("vertical divider", ["div"])).toEqual([[9, 12]])
    expect(SearchIndex.marks("vertical divider", ["ver", "div"])).toEqual([
      [0, 3],
      [9, 12]
    ])
    expect(SearchIndex.marks("abc", ["zz"])).toEqual([])
  })

  it("skips the search file's copy of the page shown, and boosts its own attributes", () => {
    expect(found("vertical divider", "components/ui-divider.html").flatMap(([, titles]) => titles)).not.toContain(
      "Vertical Divider"
    )
    const [attributes] = index.search("circular", [], "components/ui-label.html").filter((g) => g.kind === "attribute")
    expect(attributes!.hits[0]!.entry.code).toBe("<ui-label>")
  })

  it("orders groups by their best hit;  the page shown's sections win a tie", () => {
    const here = PageOutline.read(Fixture.render(PAGE))
    const groups = index.search("vertical divider", here, "components/ui-divider.html")
    expect(groups[0]!.kind).toBe("here")
  })

  it("finds nothing for an empty query, and caps each group", () => {
    expect(index.search("  ")).toEqual([])
    const many = new SearchIndex({
      ...DATA,
      components: Array.from({ length: 12 }, (_, at) => tag(`Thing ${at}`, `ui-thing-${at}`))
    })
    expect(many.search("thing")[0]!.hits).toHaveLength(5)
  })

  it("is blind to accents and case", () => {
    expect(SearchIndex.fold("  Ça  VA ")).toBe("ca va")
    expect(SearchIndex.compact("UI-Or")).toBe("uior")
    expect(SearchIndex.words("ui-button › circular")).toEqual(["ui-button", "circular"])
  })
})

describe("PageOutline", () => {
  it("reads sections and headers with ids, their trail through tabs and parents, never a demo's", () => {
    const page = Fixture.render(`
      <main>
        ${PAGE}
        <ui-header level="2" id="intro">Intro <ui-header>sub</ui-header></ui-header>
        <h3 id="more">More</h3>
        <ui-section id="untitled"></ui-section>
      </main>`)
    const entries = PageOutline.read(page)
    expect(entries.map((entry) => [entry.title, entry.context ?? "", entry.href])).toEqual([
      ["Types", "Examples", "#examples-types"],
      ["Divider", "Examples › Types", "#examples-types-divider"],
      ["Vertical Divider", "Examples › Types", "#examples-types-vertical-divider"],
      ["Keyboard", "Usage", "#usage-keyboard"],
      ["Intro", "", "#intro"],
      ["More", "", "#more"]
    ])
    expect(PageOutline.read(null)).toEqual([])
  })
})

describe("<ui-docs-search> a11y", () => {
  it("axe passes shut, open with results, and with no match", async () => {
    const { field } = await render()
    await expectAccessible(field)
    await type(field, "vertical")
    await expectAccessible(field)
    await type(field, "zzzz")
    await expectAccessible(field)
  })

  it("axe passes on every element example", async () => {
    expect(Object.keys(EXAMPLES).length).toBeGreaterThan(0)
    for (const html of Object.values(EXAMPLES)) {
      const root = Fixture.render(`<div>${html}</div>`)
      await ElementFixture.settle(root)
      await expectAccessible(root)
    }
  })
})
