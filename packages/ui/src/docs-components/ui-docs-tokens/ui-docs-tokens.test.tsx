import { afterAll, describe, expect, it, onTestFinished } from "vitest"

import { expectAccessible } from "$/ui/test/a11y"
import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"
import { SiteData } from "$/ui/docs-components/SiteData"
import type { SiteDataFile, SiteTag, SiteToken } from "$/ui/docs-components/docs-components.types"

import { UIDocsTokens } from "./UIDocsTokens"
import { TokenRows } from "./TokenRows"
import { ColorProbe } from "./ColorProbe"

import "$/ui/docs-components/ui-docs-tokens"

/** Element-markup examples, by path. */
const EXAMPLES = import.meta.glob<string>("/src/docs-components/ui-docs-tokens/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** The real `components.json`, as a served URL (the examples document real families). */
const REAL_DATA = Object.values(
  import.meta.glob<string>("/site/_data/components.json", { query: "?url", import: "default", eager: true })
)[0]!

/** A tag entry with nothing but its names. */
function tagOf(tag: string, folder: string): SiteTag {
  return {
    tag,
    name: tag,
    folder,
    mainTag: folder,
    main: tag === folder,
    topics: [],
    aka: [],
    noun: tag,
    attributes: [],
    slots: [],
    events: [],
    parts: [],
    states: [],
    texts: []
  }
}

/** A family with `tokens`. */
function familyOf(folder: string, tags: string[], tokens: SiteToken[]) {
  return { folder, mainTag: folder, title: folder, summary: "", status: "done", docs: false, tags, tokens }
}

/** Small data:  `x-button` (with `x-or`) has three tokens, `x-plain` none;  two foundation groups. */
const DATA = {
  $comment: "test",
  version: 1,
  topics: [],
  components: [tagOf("x-button", "x-button"), tagOf("x-or", "x-button"), tagOf("x-plain", "x-plain")],
  docs: [],
  families: {
    "x-button": familyOf(
      "x-button",
      ["x-button", "x-or"],
      [
        { name: "--x-button-radius", default: "0.5em", description: "Corner `radius`.", type: "length" },
        { name: "--x-button-background", default: "rgb(0, 128, 0)", description: "Fill.", type: "color" },
        { name: "--x-button-padding-block", default: "1em", type: "length" }
      ]
    ),
    "x-plain": familyOf("x-plain", ["x-plain"], [])
  },
  foundation: [
    {
      id: "typography",
      title: "Typography",
      description: "Font `size` and more.",
      tokens: [{ name: "--ui-font-size", default: "16px", description: "Base size.", type: "length" }]
    },
    {
      id: "palette",
      title: "Palette",
      description: "Hues.",
      tokens: [
        { name: "--ui-red", default: "light-dark(...)", description: "Red.", type: "color" },
        { name: "--ui-blue", default: "light-dark(...)", description: "Blue.", type: "color" }
      ]
    }
  ]
} as unknown as SiteDataFile

/** `DATA` as a URL `SiteData` can fetch. */
const DATA_URL = `data:application/json,${encodeURIComponent(JSON.stringify(DATA))}`

/** Render `html` with `url` as the data, and wait for the tables (and every widget in them) to draw. */
async function render(html: string, url = DATA_URL) {
  SiteData.reset(url)
  const root = await ElementFixture.render<HTMLElement>(html)
  const host = (root.localName === "ui-docs-tokens" ? root : root.querySelector("ui-docs-tokens")!) as UIHost
  await drawn(host)
  return host
}

/** Wait for `host`'s data and every widget in its shadow root. */
async function drawn(host: UIHost) {
  await (host.controller as UIDocsTokens).fetched
  await ElementFixture.tick()
  await ElementFixture.settle(host)
  const hosts = [...host.shadowRoot!.querySelectorAll("*")].filter((element) => "ready" in element) as UIHost[]
  await Promise.all(hosts.map((element) => element.ready))
  await ElementFixture.settle(host)
}

/** `host`'s native tables. */
function tablesOf(host: Element): HTMLTableElement[] {
  return [...host.shadowRoot!.querySelectorAll<HTMLTableElement>("ui-table > table")]
}

/** The token names of `table`'s body rows. */
function namesOf(table: HTMLTableElement): string[] {
  return [...table.tBodies[0]!.rows].map((row) => row.cells[0]!.textContent!)
}

/** The body row of `host` whose token is `name`. */
function rowOf(host: Element, name: string): HTMLTableRowElement {
  const rows = tablesOf(host).flatMap((table) => [...table.tBodies[0]!.rows])
  return rows.find((row) => row.cells[0]!.textContent === name)!
}

/** The inner `<ui-label>` box of a row's swatch. */
function swatchBox(row: HTMLTableRowElement): HTMLElement {
  const label = row.querySelector<UIHost>("[part~=swatch]")!
  return label.shadowRoot!.querySelector<HTMLElement>("[part~=label]")!
}

/** Type `value` into a `<ui-input>`'s native input, as the user does. */
async function type(input: Element, value: string) {
  const control = input.shadowRoot!.querySelector("input")!
  control.value = value
  control.dispatchEvent(new Event("input", { bubbles: true, composed: true }))
  await ElementFixture.settle(
    input.getRootNode() instanceof ShadowRoot ? (input.getRootNode() as ShadowRoot).host : input
  )
}

afterAll(() => SiteData.reset())

describe("<ui-docs-tokens family>", () => {
  it("draws one table:  name, default, description (code spans), caption", async () => {
    const host = await render(`<ui-docs-tokens family="x-button" caption="Button tokens"></ui-docs-tokens>`)
    expect(host.shadowRoot!.querySelector("[part~=tokens]")!.className).toBe("ui tokens")
    const tables = tablesOf(host)
    expect(tables).toHaveLength(1)
    const table = tables[0]!
    expect(table.caption!.textContent).toBe("Button tokens")
    expect([...table.tHead!.rows[0]!.cells].map((cell) => cell.textContent)).toEqual([
      "Token",
      "Default",
      "Description"
    ])
    expect(namesOf(table)).toEqual(["--x-button-radius", "--x-button-background", "--x-button-padding-block"])
    const radius = rowOf(host, "--x-button-radius")
    expect(radius.cells[0]!.localName).toBe("th")
    expect(radius.cells[1]!.textContent).toBe("0.5em")
    expect(radius.cells[2]!.querySelector("code")!.textContent).toBe("radius")
    expect(host.shadowRoot!.querySelector("[part~=search]")).toBeNull()
    expect(host.shadowRoot!.querySelector("[part~=playground]")).toBeNull()
  })

  it("stacks its tables by their own width, unless the page-wide token says `page`", async () => {
    const host = await render(`<ui-docs-tokens family="x-button"></ui-docs-tokens>`)
    const table = host.shadowRoot!.querySelector("ui-table")!
    expect(getComputedStyle(table).getPropertyValue("--ui-table-stack-by").trim()).toBe("container")
    expect(tablesOf(host)[0]!.classList.contains("table")).toBe(true) // the table sheet reaches it in here
    host.style.setProperty("--ui-stack-with", "page")
    expect(getComputedStyle(table).getPropertyValue("--ui-table-stack-by").trim()).toBe("page")
  })

  it("gives colour rows a LIVE swatch:  the default, then whatever the page sets", async () => {
    const host = await render(`<ui-docs-tokens family="x-button"></ui-docs-tokens>`)
    expect(rowOf(host, "--x-button-radius").querySelector("[part~=swatch]")).toBeNull()
    const row = rowOf(host, "--x-button-background")
    expect(getComputedStyle(swatchBox(row)).backgroundColor).toBe("rgb(0, 128, 0)")
    document.documentElement.style.setProperty("--x-button-background", "rgb(255, 0, 0)")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--x-button-background")
    })
    expect(getComputedStyle(swatchBox(row)).backgroundColor).toBe("rgb(255, 0, 0)")
  })

  it("finds the family of `tag`", async () => {
    const host = await render(`<ui-docs-tokens tag="x-or"></ui-docs-tokens>`)
    expect(namesOf(tablesOf(host)[0]!)).toContain("--x-button-radius")
  })

  it("keeps only `tokens`:  names and prefixes", async () => {
    const host = await render(
      `<ui-docs-tokens family="x-button" tokens="--x-button-padding-* --x-button-radius"></ui-docs-tokens>`
    )
    expect(namesOf(tablesOf(host)[0]!)).toEqual(["--x-button-radius", "--x-button-padding-block"])
  })

  it("drops the description column when no row has one", async () => {
    const host = await render(`<ui-docs-tokens family="x-button" tokens="--x-button-padding-block"></ui-docs-tokens>`)
    const table = tablesOf(host)[0]!
    expect([...table.tHead!.rows[0]!.cells].map((cell) => cell.textContent)).toEqual(["Token", "Default"])
    expect(table.tBodies[0]!.rows[0]!.cells).toHaveLength(2)
  })

  it.each([
    [`family="x-nope"`, "No family x-nope in the site data.", "negative", true],
    [`tag="x-nope"`, "No family x-nope in the site data.", "negative", true],
    [`family="x-plain"`, "<x-plain> exposes no tokens of its own.", "info", false],
    ["", "Name a family, a tag, or global.", "negative", true]
  ])("<ui-docs-tokens %s> shows a message", async (attributes, text, state, error) => {
    const host = await render(`<ui-docs-tokens ${attributes}></ui-docs-tokens>`)
    const message = host.shadowRoot!.querySelector("[part~=message]")!
    expect(message.localName).toBe("ui-message")
    expect(message.textContent).toBe(text)
    expect(message.getAttribute("state")).toBe(state)
    expect(tablesOf(host)).toEqual([])
    expect(host.matches(":state(error)")).toBe(error)
  })

  it("says when the data can't load", async () => {
    const host = await render(`<ui-docs-tokens family="x-button"></ui-docs-tokens>`, "/no/such/components.json")
    expect(host.shadowRoot!.querySelector("[part~=message]")!.textContent).toMatch(/^Couldn't load the token data:/)
    expect(host.matches(":state(error)")).toBe(true)
  })
})

describe("<ui-docs-tokens global>", () => {
  it("draws a table per group, under its header and description", async () => {
    const host = await render(`<ui-docs-tokens global level="4"></ui-docs-tokens>`)
    const groups = [...host.shadowRoot!.querySelectorAll("[part~=group]")]
    expect(groups.map((group) => group.querySelector("[part~=header]")!.textContent)).toEqual(["Typography", "Palette"])
    expect(groups[0]!.querySelector("[part~=header]")!.getAttribute("level")).toBe("4")
    expect(groups[0]!.querySelector("[part~=description] code")!.textContent).toBe("size")
    const palette = tablesOf(host)[1]!
    expect(palette.caption!.textContent).toBe("Palette")
    expect(palette.caption!.className).toBe("ui-visually-hidden")
    expect(
      rowOf(host, "--ui-red")
        .querySelector<HTMLElement>("[part~=swatch]")!
        .style.getPropertyValue("--ui-label-background")
    ).toBe("var(--ui-red)")
  })

  it("shows only `groups`", async () => {
    const host = await render(`<ui-docs-tokens global groups="palette"></ui-docs-tokens>`)
    expect(tablesOf(host).map(namesOf)).toEqual([["--ui-red", "--ui-blue"]])
  })

  it("filters rows with its search input;  the input's own events stay inside", async () => {
    const host = await render(`<ui-docs-tokens global></ui-docs-tokens>`)
    const outside: Event[] = []
    host.addEventListener("ui-input", (event) => outside.push(event))
    const search = host.shadowRoot!.querySelector("[part~=search]")!
    await type(search, "BLUE")
    expect(tablesOf(host).map(namesOf)).toEqual([["--ui-blue"]])
    await type(search, "nothing like it")
    expect(tablesOf(host)).toEqual([])
    expect(host.shadowRoot!.querySelector("[part~=message]")!.textContent).toBe("No token matches.")
    expect(outside).toEqual([])
  })
})

describe("<ui-docs-tokens playground>", () => {
  /** A playground over `x-button`, with a `<span>` preview child. */
  async function playground(attributes = "") {
    return render(
      `<ui-docs-tokens family="x-button" playground ${attributes}><span class="sample">Sample</span></ui-docs-tokens>`
    )
  }

  it("shows the children as the preview, an input per row and a disabled reset", async () => {
    const host = await playground()
    const slot = host.shadowRoot!.querySelector<HTMLSlotElement>("[part~=preview] slot")!
    expect(slot.assignedElements().map((element) => element.className)).toEqual(["sample"])
    expect([...tablesOf(host)[0]!.tHead!.rows[0]!.cells].at(-1)!.textContent).toBe("Value")
    const inputs = [...host.shadowRoot!.querySelectorAll<HTMLElement>("[part~=input]")]
    expect(inputs.map((input) => input.dataset.token)).toEqual([
      "--x-button-radius",
      "--x-button-background",
      "--x-button-padding-block"
    ])
    expect(inputs[0]!.getAttribute("placeholder")).toBe("0.5em")
    expect(inputs[0]!.getAttribute("aria-label")).toBe("Set --x-button-radius")
    expect(host.shadowRoot!.querySelector("[part~=reset]")!.hasAttribute("disabled")).toBe(true)
  })

  it("starts a colour input at the token's current colour", async () => {
    const host = await playground()
    const input = rowOf(host, "--x-button-background").querySelector<HTMLElement & { value: string }>("[part~=input]")!
    expect(input.getAttribute("type")).toBe("color")
    expect(input.value).toBe("#008000")
  })

  it("sets a typed token on the preview (the children inherit it), says so, and resets", async () => {
    const host = await playground()
    const events: unknown[] = []
    host.addEventListener("ui-input", (event) => events.push((event as CustomEvent).detail))
    host.addEventListener("ui-reset", (event) => events.push((event as CustomEvent).detail))
    const sample = host.querySelector(".sample")!
    const input = rowOf(host, "--x-button-radius").querySelector("[part~=input]")!

    await type(input, "2em")
    expect(getComputedStyle(sample).getPropertyValue("--x-button-radius")).toBe("2em")
    expect(getComputedStyle(host).getPropertyValue("--x-button-radius")).toBe("") // the preview only
    expect(events).toMatchObject([{ token: "--x-button-radius", value: "2em" }])
    expect(host.matches(":state(modified)")).toBe(true)
    const reset = host.shadowRoot!.querySelector<HTMLElement>("[part~=reset]")!
    expect(reset.hasAttribute("disabled")).toBe(false)

    reset.click()
    await ElementFixture.settle(host)
    expect(getComputedStyle(sample).getPropertyValue("--x-button-radius")).toBe("")
    expect(events.at(-1)).toMatchObject({ tokens: ["--x-button-radius"] })
    expect((input as HTMLElement & { value: string }).value).toBe("")
    expect(host.matches(":state(modified)")).toBe(false)
  })

  it("an emptied input removes its token", async () => {
    const host = await playground()
    const sample = host.querySelector(".sample")!
    const input = rowOf(host, "--x-button-radius").querySelector("[part~=input]")!
    await type(input, "3px")
    await type(input, "")
    expect(getComputedStyle(sample).getPropertyValue("--x-button-radius")).toBe("")
  })

  it("a picked colour reaches the preview and the swatch", async () => {
    const host = await playground()
    const row = rowOf(host, "--x-button-background")
    await type(row.querySelector("[part~=input]")!, "#ff0000")
    expect(getComputedStyle(host.querySelector(".sample")!).getPropertyValue("--x-button-background")).toBe("#ff0000")
    expect(getComputedStyle(swatchBox(row)).backgroundColor).toBe("rgb(255, 0, 0)")
  })

  it('`target="page"` sets the token on `:root`, and reset removes it', async () => {
    const host = await playground(`target="page"`)
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--x-button-radius")
    })
    await type(rowOf(host, "--x-button-radius").querySelector("[part~=input]")!, "7px")
    expect(document.documentElement.style.getPropertyValue("--x-button-radius")).toBe("7px")
    host.shadowRoot!.querySelector<HTMLElement>("[part~=reset]")!.click()
    await ElementFixture.settle(host)
    expect(document.documentElement.style.getPropertyValue("--x-button-radius")).toBe("")
  })

  it("restyles a real component through its public token", async () => {
    const host = await render(
      `<ui-docs-tokens family="ui-button" playground tokens="--ui-button-radius"><ui-button>Go</ui-button></ui-docs-tokens>`,
      REAL_DATA
    )
    const button = host.querySelector<UIHost>("ui-button")!
    await button.ready
    await type(rowOf(host, "--ui-button-radius").querySelector("[part~=input]")!, "0px")
    await ElementFixture.settle(button)
    expect(getComputedStyle(button.shadowRoot!.querySelector("[part~=button]")!).borderTopLeftRadius).toBe("0px")
  })
})

describe("TokenRows", () => {
  it("reads `tokens` as names and prefixes", () => {
    expect(TokenRows.patterns("--a --b-* ")).toEqual([{ name: "--a" }, { prefix: "--b-" }])
    expect(TokenRows.patterns(undefined)).toEqual([])
  })

  it("searches name, default and description, ignoring case", () => {
    const row = { name: "--x-a", default: "1em", description: "Space around", type: "length" } as const
    expect(TokenRows.found(row, "around")).toBe(true)
    expect(TokenRows.found(row, "1em")).toBe(true)
    expect(TokenRows.found(row, "nope")).toBe(false)
  })
})

describe("ColorProbe", () => {
  it("reads any CSS colour back as #rrggbb", () => {
    expect(ColorProbe.toHex("rgb(255, 0, 0)")).toBe("#ff0000")
    expect(ColorProbe.toHex("oklch(1 0 0)")).toBe("#ffffff")
    expect(ColorProbe.hexes(document.body, new Map([["a", "var(--nope, rgb(0, 0, 255))"]])).get("a")).toBe("#0000ff")
    // translucent:  flattened onto the backdrop, as the reader sees it
    expect(
      ColorProbe.hexes(document.body, new Map([["a", "rgb(0 0 0 / 0.5)"]]), "rgb(255, 255, 255)").get("a")
    ).toMatch(/^#(7f|80){3}$/)
  })
})

describe("<ui-docs-tokens> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    SiteData.reset(REAL_DATA)
    const root = await ElementFixture.render<HTMLElement>(EXAMPLES[path]!)
    for (const host of root.localName === "ui-docs-tokens" ? [root] : [...root.querySelectorAll("ui-docs-tokens")])
      await drawn(host as UIHost)
    await expectAccessible(root)
  })
})
