import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { expectAccessible } from "$/ui/test/a11y"
import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"
import { SiteData, type SiteDataFile, type SiteTag } from "$/ui/docs-components"

import type { UIDocsApi } from "./UIDocsApi"
import { ApiModel } from "./ApiModel"
import { InlineCode } from "./InlineCode"

import "$/ui/docs-components/ui-docs-api"

/** Element-markup examples, by path. */
const EXAMPLES = import.meta.glob<string>("/src/docs-components/ui-docs-api/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** The real `components.json`, as a served URL (the examples document real tags). */
const REAL_DATA = Object.values(
  import.meta.glob<string>("/site/_data/components.json", { query: "?url", import: "default", eager: true })
)[0]!

/** A tag entry with nothing but `overrides`. */
function tagOf(tag: string, folder: string, overrides: Partial<SiteTag> = {}): SiteTag {
  return {
    tag,
    name: tag,
    folder,
    mainTag: folder,
    main: tag === folder,
    page: tag === folder,
    topics: [],
    aka: [],
    noun: tag.replace(/^x-/, ""),
    attributes: [],
    slots: [],
    events: [],
    parts: [],
    states: [],
    texts: [],
    ...overrides
  }
}

/** `<x-button>` / `<x-or>`:  every kind of row the tables draw. */
const BUTTON = tagOf("x-button", "x-button", {
  description: "A button `does` things.",
  attributes: [
    {
      name: "color",
      kind: "color",
      values: ["red", "blue"],
      valueSet: "hues",
      description: "Hue."
    },
    { name: "size", kind: "size", values: ["small", "large"], valueSet: "sizes", description: "Size." },
    {
      name: "width",
      kind: "width",
      values: ["1", "2", "3", "4", "5"],
      valueSet: "widths",
      description: "Columns."
    },
    { name: "basic", kind: "keyOnly", description: "Less `pronounced`." },
    { name: "selected", kind: "keyOnly", aliases: ["checked"], description: "On." },
    { name: "type", kind: "enum", values: ["button", "submit"], default: "button", description: "Form role." },
    {
      name: "heading-offset",
      kind: "number",
      property: "headingLevelOffset",
      default: 0,
      description: "Shift."
    },
    { name: "text", kind: "string", reflect: false, description: "Shown text." },
    { name: "options", kind: "json", reflect: false, description: "Rich `MenuOption[]`." }
  ],
  events: [
    { name: "ui-toggle", detail: "{ active: boolean }", cancelable: true, description: "Toggled." },
    { name: "ui-click", detail: "{}", description: "Clicked." }
  ],
  slots: [
    { name: "", description: "Content." },
    { name: "icon", description: "Icon." }
  ],
  parts: [{ name: "button", description: "The `<button>`." }],
  states: [{ name: "pressed", description: "Pressed." }],
  texts: [{ key: "busy", text: "Busy `now`", description: "Loading label." }]
})
const OR = tagOf("x-or", "x-button", { description: "An or.", parts: [{ name: "or", description: "The or." }] })

/** The fixture data file. */
const DATA: SiteDataFile = {
  $comment: "test",
  version: 1,
  topics: [],
  components: [BUTTON, OR],
  docs: [],
  families: {
    "x-button": {
      folder: "x-button",
      mainTag: "x-button",
      title: "Button",
      summary: "",
      status: "done",
      docs: false,
      tags: ["x-button", "x-or"],
      tokens: []
    }
  }
} as unknown as SiteDataFile

/** `DATA` as a URL `SiteData` can fetch. */
const DATA_URL = `data:application/json,${encodeURIComponent(JSON.stringify(DATA))}`

/** Render `html` with `url` as the data, and wait for the tables (and every widget in them) to draw. */
async function render(html: string, url = DATA_URL) {
  SiteData.reset(url)
  const host = await ElementFixture.render<UIHost>(html)
  await drawn(host)
  return host
}

/** Wait for `host`'s data and every widget in its shadow root. */
async function drawn(host: UIHost) {
  await (host.controller as UIDocsApi).fetched
  await ElementFixture.tick()
  await ElementFixture.settle(host)
  const hosts = [...host.shadowRoot!.querySelectorAll("*")].filter((element) => "ready" in element) as UIHost[]
  await Promise.all(hosts.map((element) => element.ready))
  await ElementFixture.settle(host)
}

/** `host`'s tables, by title. */
function tablesOf(host: Element): Map<string, HTMLTableElement> {
  const titles = [...host.shadowRoot!.querySelectorAll("[part~=title]")]
  return new Map(titles.map((title) => [title.textContent!, tableAfter(title)]))
}

/** The `<table>` of the `<ui-table>` after `title` (past its note). */
function tableAfter(title: Element): HTMLTableElement {
  let next = title.nextElementSibling
  while (next && next.localName !== "ui-table") next = next.nextElementSibling
  return next!.querySelector("table")!
}

/** The body row of `table` whose name is `name`. */
function rowOf(table: HTMLTableElement, name: string): HTMLTableRowElement {
  return [...table.tBodies[0]!.rows].find((row) => row.cells[0]!.querySelector("code, em")?.textContent === name)!
}

afterAll(() => SiteData.reset())

describe("<ui-docs-api tag>", () => {
  it("draws only the tables the tag has, in order, under titles;  no tag header", async () => {
    const host = await render(`<ui-docs-api tag="x-button"></ui-docs-api>`)
    const section = host.shadowRoot!.querySelector("[part~=api]")!
    expect(section.className).toBe("ui api")
    expect([...tablesOf(host).keys()]).toEqual([
      "Attributes",
      "Properties",
      "Events",
      "Slots",
      "Parts",
      "States",
      "Texts"
    ])
    expect(host.shadowRoot!.querySelector("[part~=header]")).toBeNull()
    expect(host.shadowRoot!.querySelector("[part~=title]")!.getAttribute("level")).toBe("3")

    const other = await render(`<ui-docs-api tag="x-or"></ui-docs-api>`)
    expect([...tablesOf(other).keys()]).toEqual(["Parts"])
  })

  it("draws Fomantic's compact celled definition tables, stacking by their own width", async () => {
    const host = await render(`<ui-docs-api tag="x-or"></ui-docs-api>`)
    const table = host.shadowRoot!.querySelector("ui-table")!
    for (const name of ["celled", "compact", "definition", "stackable"]) expect(table.hasAttribute(name)).toBe(true)
    expect(table.getAttribute("stack-by")).toBe("container")
    const native = table.querySelector("table")!
    expect(native.classList.contains("definition")).toBe(true)
    expect(native.getAttribute("aria-label")).toBe("Parts of <x-or>")
    expect(getComputedStyle(native).borderCollapse).toBeTruthy()
  })

  it("draws each attribute:  name and notes, kind, values, default, description with code", async () => {
    const host = await render(`<ui-docs-api tag="x-button"></ui-docs-api>`)
    const attributes = tablesOf(host).get("Attributes")!
    expect([...attributes.tHead!.rows[0]!.cells].map((cell) => cell.textContent)).toEqual([
      "Attribute",
      "Kind",
      "Values",
      "Default",
      "Description"
    ])
    expect(rowOf(attributes, "options")).toBeUndefined()

    const basic = rowOf(attributes, "basic")
    expect(basic.cells[0]!.localName).toBe("th")
    expect(basic.cells[0]!.getAttribute("scope")).toBe("row")
    expect(basic.cells[1]!.textContent).toBe("boolean")
    expect(basic.cells[3]!.querySelector("code")!.textContent).toBe("false")
    expect(basic.cells[4]!.querySelector("code")!.textContent).toBe("pronounced")
    expect(basic.cells[4]!.textContent).toBe("Less pronounced.")

    const selected = rowOf(attributes, "selected").cells[0]!
    expect(selected.querySelector("small")!.textContent).toBe("alias checked")
    const offset = rowOf(attributes, "heading-offset").cells[0]!
    expect(offset.querySelector("small")!.textContent).toBe("property headingLevelOffset")
    expect(rowOf(attributes, "text").cells[0]!.querySelector("small")!.textContent).toBe("not reflected")
    expect(rowOf(attributes, "type").cells[3]!.textContent).toBe("button")
  })

  it("draws values as mini labels:  hues in their colour, a numeric run as one label, the set named", async () => {
    const host = await render(`<ui-docs-api tag="x-button"></ui-docs-api>`)
    const attributes = tablesOf(host).get("Attributes")!
    const labels = (name: string) => [...rowOf(attributes, name).cells[2]!.querySelectorAll("ui-label")]

    const hues = labels("color")
    expect(hues.map((label) => [label.textContent, label.getAttribute("color"), label.hasAttribute("basic")])).toEqual([
      ["red", "red", false],
      ["blue", "blue", false]
    ])
    expect(rowOf(attributes, "color").cells[2]!.querySelector("ui-labels")!.getAttribute("size")).toBe("mini")
    expect(rowOf(attributes, "color").cells[2]!.querySelector("small")!.textContent).toBe("set hues")

    const sizes = labels("size")
    expect(sizes.map((label) => [label.textContent, label.hasAttribute("basic")])).toEqual([
      ["small", true],
      ["large", true]
    ])
    expect(labels("width").map((label) => label.textContent)).toEqual(["1 … 5"])
    expect(labels("type").map((label) => label.textContent)).toEqual(["button", "submit"])
    expect(rowOf(attributes, "type").cells[2]!.querySelector("small")).toBeNull()
    expect(labels("basic")).toEqual([])
  })

  it("splits rich data into Properties;  events, slots, parts, states and texts as their own tables", async () => {
    const host = await render(`<ui-docs-api tag="x-button"></ui-docs-api>`)
    const tables = tablesOf(host)

    const properties = tables.get("Properties")!
    expect(rowOf(properties, "options").cells[1]!.querySelector("code")!.textContent).toBe("MenuOption[]")

    const events = tables.get("Events")!
    const toggle = rowOf(events, "ui-toggle")
    expect(toggle.cells[0]!.querySelector("small")!.textContent).toBe("cancelable")
    expect(toggle.cells[1]!.querySelector("code")!.textContent).toBe("{ active: boolean }")
    expect(rowOf(events, "ui-click").cells[0]!.querySelector("small")).toBeNull()

    const slots = tables.get("Slots")!
    expect(rowOf(slots, "(default)").cells[0]!.querySelector("em")).not.toBeNull()
    expect(rowOf(slots, "icon")).toBeDefined()

    expect(rowOf(tables.get("Parts")!, "button").cells[1]!.querySelector("code")!.textContent).toBe("<button>")
    expect(rowOf(tables.get("States")!, ":state(pressed)")).toBeDefined()
    const busy = rowOf(tables.get("Texts")!, "busy")
    expect(busy.cells[1]!.querySelector("code")!.textContent).toBe("Busy `now`")
  })

  it("notes how events, parts, states, properties and texts work, under their titles", async () => {
    const host = await render(`<ui-docs-api tag="x-button"></ui-docs-api>`)
    const notes = [...host.shadowRoot!.querySelectorAll("[part~=note]")]
    expect(notes).toHaveLength(5)
    const parts = notes.find((note) => note.textContent!.includes("::part()"))!
    expect(parts.querySelector("code")!.textContent).toBe("::part()")
  })

  it("fires `ui-render` with the tags drawn", async () => {
    SiteData.reset(DATA_URL)
    const tags: string[][] = []
    document.addEventListener("ui-render", record)
    try {
      const host = await ElementFixture.render<UIHost>(`<ui-docs-api tag="x-or"></ui-docs-api>`)
      await drawn(host)
      await ElementFixture.tick()
    } finally {
      document.removeEventListener("ui-render", record)
    }
    expect(tags).toEqual([["x-or"]])

    /** Keep one event's tags. */
    function record(event: Event) {
      tags.push((event as CustomEvent<{ tags: string[] }>).detail.tags)
    }
  })
})

describe("<ui-docs-api family>", () => {
  afterEach(() => history.replaceState(null, "", location.pathname + location.search))

  it("draws every tag of the family under its own linked header, its id the tag", async () => {
    const host = await render(`<ui-docs-api family="x-button"></ui-docs-api>`)
    const blocks = [...host.shadowRoot!.querySelectorAll("[part~=tag]")]
    expect(blocks).toHaveLength(2)
    const headers = [...host.shadowRoot!.querySelectorAll("[part~=header]")]
    expect(
      headers.map((header) => [header.id, header.querySelector("a")!.getAttribute("href"), header.textContent])
    ).toEqual([
      ["x-button", "#x-button", "<x-button>"],
      ["x-or", "#x-or", "<x-or>"]
    ])
    expect(headers[0]!.getAttribute("level")).toBe("3")
    expect(headers[0]!.hasAttribute("dividing")).toBe(true)
    expect(blocks[0]!.querySelector("[part~=title]")!.getAttribute("level")).toBe("4")
    const description = blocks[0]!.querySelector("[part~=description]")!
    expect(description.querySelector("code")!.textContent).toBe("does")
  })

  it("takes any tag of the family, and `level`", async () => {
    const host = await render(`<ui-docs-api family="x-or" level="2"></ui-docs-api>`)
    const headers = [...host.shadowRoot!.querySelectorAll("[part~=header]")]
    expect(headers.map((header) => header.id)).toEqual(["x-button", "x-or"])
    expect(headers[0]!.getAttribute("level")).toBe("2")
    expect(host.shadowRoot!.querySelector("[part~=title]")!.getAttribute("level")).toBe("3")
  })

  it("scrolls to the tag `location.hash` names, at start and on `hashchange`", async () => {
    const scrolled: Element[] = []
    const spy = vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(function (this: Element) {
      scrolled.push(this)
    })
    try {
      history.replaceState(null, "", "#x-or")
      const host = await render(`<ui-docs-api family="x-button"></ui-docs-api>`)
      await frame()
      const or = host.shadowRoot!.getElementById("x-or")!
      expect(scrolled.some((element) => element === or || element === or.parentElement)).toBe(true)

      scrolled.length = 0
      location.hash = "#x-button"
      await new Promise((resolve) => window.addEventListener("hashchange", resolve, { once: true }))
      await ElementFixture.tick()
      await frame()
      const button = host.shadowRoot!.getElementById("x-button")!
      expect(scrolled.some((element) => element === button || element === button.parentElement)).toBe(true)
    } finally {
      spy.mockRestore()
    }

    /** One animation frame. */
    function frame() {
      return new Promise((resolve) => requestAnimationFrame(resolve))
    }
  })
})

describe("<ui-docs-api> messages and states", () => {
  beforeEach(() => SiteData.reset(DATA_URL))

  it("says when the data has no such tag", async () => {
    const host = await render(`<ui-docs-api tag="x-nope"></ui-docs-api>`)
    const message = host.shadowRoot!.querySelector("[part~=message]")!
    expect(message.localName).toBe("ui-message")
    expect(message.getAttribute("state")).toBe("warning")
    expect(message.textContent).toBe("No API data for x-nope.")
    expect(message.querySelector("code")!.textContent).toBe("x-nope")
    expect(host.matches(":state(error)")).toBe(true)
    expect(host.matches(":state(loading)")).toBe(false)
  })

  it("says when neither `tag` nor `family` is set", async () => {
    const host = await render(`<ui-docs-api></ui-docs-api>`)
    expect(host.shadowRoot!.querySelector("[part~=message]")!.textContent).toBe("Set tag or family.")
  })

  it("says when the data can't be loaded", async () => {
    const host = await render(`<ui-docs-api tag="x-or"></ui-docs-api>`, "/no/such/components.json")
    const message = host.shadowRoot!.querySelector("[part~=message]")!
    expect(message.getAttribute("state")).toBe("negative")
    expect(message.textContent).toContain("Couldn't load the API data")
    expect(host.matches(":state(error)")).toBe(true)
  })

  it("is `:state(loading)` until the data is in, then follows `tag`", async () => {
    SiteData.reset(DATA_URL)
    const host = await ElementFixture.render<UIHost>(`<ui-docs-api tag="x-or"></ui-docs-api>`)
    expect(host.matches(":state(loading)")).toBe(true)
    await drawn(host)
    expect(host.matches(":state(loading)")).toBe(false)
    expect([...tablesOf(host).keys()]).toEqual(["Parts"])

    host.setAttribute("tag", "x-button")
    await drawn(host)
    expect(tablesOf(host).size).toBe(7)
  })
})

describe("InlineCode", () => {
  it.each([
    ["plain", [{ text: "plain", code: false }]],
    [
      "a `b` c",
      [
        { text: "a ", code: false },
        { text: "b", code: true },
        { text: " c", code: false }
      ]
    ],
    [
      "`` `x` `` becomes code",
      [
        { text: "`x`", code: true },
        { text: " becomes code", code: false }
      ]
    ],
    ["an `unclosed span", [{ text: "an `unclosed span", code: false }]],
    [
      "`a` and `<b>`",
      [
        { text: "a", code: true },
        { text: " and ", code: false },
        { text: "<b>", code: true }
      ]
    ]
  ])("parses %j", (text, pieces) => {
    expect(InlineCode.parse(text)).toEqual(pieces)
  })

  it.each(["x", "`x`", "a `` b", "{ a: 1 }"])("wraps %j so it parses back as one code piece", (code) => {
    expect(InlineCode.parse(InlineCode.wrap(code))).toEqual([{ text: code, code: true }])
  })
})

describe("ApiModel", () => {
  it("leaves out empty tables and keeps rich data apart", () => {
    expect(ApiModel.sections(OR).map((section) => section.id)).toEqual(["parts"])
    const sections = ApiModel.sections(BUTTON)
    expect(sections.find((section) => section.id === "properties")!.rows.map((row) => row.key)).toEqual(["options"])
    expect(sections.find((section) => section.id === "attributes")!.rows.map((row) => row.key)).not.toContain("options")
  })

  it("names properties and defaults as the old Astro table did", () => {
    expect(ApiModel.propertyOf({ name: "column-defs", kind: "json", description: "" })).toBe("columnDefs")
    expect(ApiModel.propertyOf({ name: "x", kind: "number", property: "y", description: "" })).toBe("y")
    expect(ApiModel.defaultOf({ name: "x", kind: "keyOnly", description: "" })).toBe("false")
    expect(ApiModel.defaultOf({ name: "x", kind: "string", description: "" })).toBeUndefined()
    expect(ApiModel.defaultOf({ name: "x", kind: "number", default: 0, description: "" })).toBe("0")
    expect(ApiModel.kindLabel("keyOrValueAndKey")).toBe("boolean or value")
  })
})

describe("<ui-docs-api> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    SiteData.reset(REAL_DATA)
    const root = await ElementFixture.render(EXAMPLES[path]!)
    for (const host of root.querySelectorAll<UIHost>("ui-docs-api")) await drawn(host)
    await expectAccessible(root)
  })
})
