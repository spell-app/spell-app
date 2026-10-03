import { beforeEach, describe, expect, it, onTestFinished } from "vitest"
import { page, userEvent } from "vitest/browser"

import { UI } from "$/ui/runtime"
import type { TableColumn, TableRow, TableSortDetail } from "$/ui/components/components.types"
import type { UIHost } from "$/ui/elements"
import { expectAccessible } from "$/ui/test/a11y"
import { ElementFixture } from "$/ui/test/ElementFixture"

import "$/ui/components/ui-table"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-table/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** `<ui-table>` host, with its properties. */
type TableHost = UIHost & {
  rows?: TableRow[]
  columnDefs?: TableColumn[]
  sortColumn?: number
  sortDirection?: string
  sortable: boolean
  celled: boolean
}

/** A three-row body:  names, numbers that sort differently as text, and notes. */
const BODY =
  `<tbody><tr><td>Jamie</td><td>10</td><td>b</td></tr>` +
  `<tr><td>Jill</td><td>9</td><td>c</td></tr>` +
  `<tr><td>John</td><td>100</td><td>a</td></tr></tbody>`

/** Header row:  a button header, a bare header, an opted-out header. */
const HEAD =
  `<thead><tr><th data-key="name"><button type="button">Name</button></th><th data-key="count">Count</th>` +
  `<th data-sortable="false">Notes</th></tr></thead>`

/**
 * Render a `<ui-table>` around a native table, in a 1000px wrapper (wide enough not to stack);  returns host and
 * table.
 */
async function table(attributes = "", inner = HEAD + BODY, tableAttributes = "") {
  const wrapper = await ElementFixture.render<HTMLElement>(
    `<div style="width: ${WIDE}px"><ui-table ${attributes}><table ${tableAttributes}>${inner}</table></ui-table></div>`
  )
  await settle()
  const host = wrapper.querySelector<TableHost>("ui-table")!
  return { host, table: host.querySelector("table")! }
}

/** A viewport no table stacks in:  tables stack by the VIEWPORT unless they opt in to their own width. */
beforeEach(async () => {
  await page.viewport(1200, 900)
})

/** Wrapper width that never stacks (tablet and up). */
const WIDE = 1000

/** Wrapper width every stackable table stacks at. */
const NARROW = 500

/** Let observers, queued writes and effects run. */
async function settle() {
  await ElementFixture.tick()
  await new Promise((resolve) => setTimeout(resolve, 0))
  await ElementFixture.tick()
}

/** The shadow scroller. */
function scroller(host: Element): HTMLElement {
  return host.shadowRoot!.querySelector<HTMLElement>("[part~=scroller]")!
}

/** Body texts of column `index`, top to bottom. */
function column(tableElement: HTMLTableElement, index: number): string[] {
  return [...tableElement.tBodies[0]!.rows].map((row) => row.cells[index]!.textContent!)
}

/** Collect `ui-sort` details;  `cancel` vetoes them. */
function sorts(host: Element, cancel = false): TableSortDetail[] {
  const seen: TableSortDetail[] = []
  host.addEventListener("ui-sort", (event) => {
    seen.push((event as CustomEvent<TableSortDetail>).detail)
    if (cancel) event.preventDefault()
  })
  return seen
}

describe("<ui-table> classes, mirrored onto the table", () => {
  it.each([
    ["", "ui table"],
    ["celled", "ui celled table"],
    ['celled="yes"', "ui celled table"],
    ['celled="no"', "ui table"],
    ['size="medium"', "ui table"],
    ['size="small" color="red"', "ui small red table"],
    ["sortable celled striped", "ui celled sortable striped table"],
    ["single-line", "ui single line table"],
    ['basic="very"', "ui very basic table"],
    ['compact="very" padded', "ui very compact padded table"],
    ['attached="top"', "ui top attached table"],
    ['stackable="tablet"', "ui tablet stackable table"],
    ["unstackable", "ui unstackable table"],
    ['scrolling="very short"', "ui very short scrolling table"],
    ['overflowing="long"', "ui long overflowing table"],
    ['stuck="head first"', "ui head stuck first stuck table"],
    ['columns="4"', "ui four column table"],
    ['text-align="center" vertical-align="top"', "ui center aligned top aligned table"],
    ["inverted definition structured fixed", "ui definition fixed inverted structured table"]
  ])("<ui-table %s>", async (attributes, classes) => {
    const { table: element } = await table(attributes)
    expect(element.className).toBe(classes)
  })

  it("keeps the author's own classes and puts its phrase after them", async () => {
    const { host, table: element } = await table('basic="very"', HEAD + BODY, 'class="mine celled"')
    expect(element.className).toBe("mine celled ui very basic table")
    host.setAttribute("celled", "")
    await settle()
    expect(element.className).toBe("mine ui celled very basic table")
    host.removeAttribute("celled")
    host.removeAttribute("basic")
    await settle()
    // `celled` was the author's before the element emitted it:  it stays
    expect(element.className).toBe("mine celled ui table")
  })

  it("re-applies its words after a framework rewrites className", async () => {
    const { table: element } = await table("celled striped")
    element.className = "x"
    await settle()
    expect(element.className).toBe("x ui celled striped table")
  })

  it("owns the words an SSR table already carries, so they go with their attribute", async () => {
    const { host, table: element } = await table("celled", HEAD + BODY, 'class="ui celled table"')
    expect(element.className).toBe("ui celled table")
    host.removeAttribute("celled")
    await settle()
    expect(element.className).toBe("ui table")
  })

  it("registers ui-table.css as a page sheet", async () => {
    await table()
    expect(document.adoptedStyleSheets).toContain(UI.styles.sheet("table"))
  })

  it("styles the light-DOM table from the page sheet", async () => {
    const { table: element } = await table("celled striped")
    const [first, second] = element.tBodies[0]!.rows[1]!.cells
    expect(getComputedStyle(second!).borderLeftStyle).toBe("solid")
    expect(getComputedStyle(first!).borderLeftStyle).toBe("none")
    expect(getComputedStyle(element.tBodies[0]!.rows[1]!).backgroundColor).not.toBe("rgba(0, 0, 0, 0)")
  })
})

describe("<ui-table> shadow markup", () => {
  it("is a scroller part around a slot, no region while it doesn't scroll", async () => {
    const { host } = await table()
    const box = scroller(host)
    expect(host.shadowRoot!.children).toHaveLength(1)
    expect(box.localName).toBe("div")
    expect(box.className).toBe("scroller")
    expect(box.querySelector("slot")).not.toBeNull()
    expect(box.hasAttribute("role")).toBe(false)
    expect(box.hasAttribute("tabindex")).toBe(false)
    expect(box.hasAttribute("aria-label")).toBe(false)
  })

  it("scrolls as a focusable region named by the caption, else the host's aria-label, else `Table`", async () => {
    const { host, table: element } = await table(
      'scrolling="short" resizable attached="top"',
      `<caption>People</caption>${HEAD}${BODY}`
    )
    const box = scroller(host)
    expect(box.className).toBe("resizable top attached short scrolling scroller")
    expect(box.getAttribute("role")).toBe("region")
    expect(box.getAttribute("tabindex")).toBe("0")
    expect(box.getAttribute("aria-label")).toBe("People")
    expect(getComputedStyle(box).overflowY).toBe("auto")
    host.setAttribute("aria-label", "Everyone")
    await settle()
    expect(box.getAttribute("aria-label")).toBe("Everyone")
    host.removeAttribute("aria-label")
    element.caption!.remove()
    await settle()
    expect(box.getAttribute("aria-label")).toBe("Table")
    host.removeAttribute("scrolling")
    await settle()
    expect(box.hasAttribute("role")).toBe(false)
    expect(box.hasAttribute("tabindex")).toBe(false)
  })

  it("caps the height and keeps the head stuck while scrolling", async () => {
    const rows = Array.from({ length: 30 }, (_, index) => `<tr><td>${index}</td><td>x</td><td>y</td></tr>`).join("")
    const { host, table: element } = await table("scrolling", `${HEAD}<tbody>${rows}</tbody>`)
    const box = scroller(host)
    expect(box.scrollHeight).toBeGreaterThan(box.clientHeight)
    expect(getComputedStyle(element.tHead!).position).toBe("sticky")
    // hosted:  the body is NOT Fomantic's static block scroller
    expect(getComputedStyle(element.tBodies[0]!).display).toBe("table-row-group")
  })

  it("stacks by the VIEWPORT, as in Fomantic, however wide or narrow its own column is", async () => {
    const wrapper = await ElementFixture.render<HTMLElement>(
      `<div style="width: ${NARROW}px"><ui-table><table>${HEAD}${BODY}</table></ui-table></div>`
    )
    await settle()
    const cell = wrapper.querySelector("td")!
    expect(getComputedStyle(cell).display).toBe("table-cell")
    await page.viewport(500, 900)
    wrapper.style.width = `${WIDE}px`
    await new Promise((resolve) => requestAnimationFrame(resolve))
    expect(getComputedStyle(cell).display).toBe("block")
  })

  it('stacks by its own width with `stack-by="container"`, and the attribute beats the token', async () => {
    const wrapper = await ElementFixture.render<HTMLElement>(
      `<div style="width: 500px"><ui-table stack-by="container"><table>${HEAD}${BODY}</table></ui-table>` +
        `<div style="--ui-table-stack-by: container"><ui-table stack-by="viewport"><table>${HEAD}${BODY}</table>` +
        `</ui-table></div></div>`
    )
    await settle()
    const [own, viewport] = wrapper.querySelectorAll("table")
    expect(getComputedStyle(own!.querySelector("td")!).display).toBe("block")
    expect(getComputedStyle(viewport!.querySelector("td")!).display).toBe("table-cell")
    wrapper.style.width = "900px"
    await new Promise((resolve) => requestAnimationFrame(resolve))
    expect(getComputedStyle(own!.querySelector("td")!).display).toBe("table-cell")
  })

  it("stacks by its own width when `--ui-table-stack-by: container` opts in", async () => {
    const wrapper = await ElementFixture.render<HTMLElement>(
      `<div style="width: 500px; --ui-table-stack-by: container"><ui-table><table>${HEAD}${BODY}</table></ui-table>` +
        `<ui-table unstackable><table>${HEAD}${BODY}</table></ui-table></div>`
    )
    await settle()
    const [stacking, unstackable] = wrapper.querySelectorAll("table")
    expect(getComputedStyle(stacking!.querySelector("td")!).display).toBe("block")
    expect(getComputedStyle(unstackable!.querySelector("td")!).display).toBe("table-cell")
    wrapper.style.width = "900px"
    await new Promise((resolve) => requestAnimationFrame(resolve))
    expect(getComputedStyle(stacking!.querySelector("td")!).display).toBe("table-cell")
  })
})

describe("<ui-table> outer margin", () => {
  /** Three tables after a 10px-margin heading;  returns the heading and the hosts. */
  async function tables(attributes: readonly string[]) {
    const wrapper = await ElementFixture.render<HTMLElement>(
      `<div style="width: ${WIDE}px"><h4 style="margin: 0 0 10px">Heading</h4>` +
        attributes.map((each) => `<ui-table ${each}><table>${BODY}</table></ui-table>`).join("") +
        `</div>`
    )
    await settle()
    return { heading: wrapper.querySelector("h4")!, hosts: [...wrapper.querySelectorAll<TableHost>("ui-table")] }
  }

  it("sits on the HOST, so it collapses with the heading above as class grammar's does", async () => {
    const { heading, hosts } = await tables(["", "", ""])
    expect(getComputedStyle(scroller(hosts[0]!)).marginTop).toBe("0px")
    expect(hosts.map((host) => getComputedStyle(host).marginTop)).toEqual(["16px", "16px", "16px"])
    expect(getComputedStyle(hosts[2]!).marginBottom).toBe("0px")
    // max(10px, 16px), not their sum
    expect(hosts[0]!.getBoundingClientRect().top - heading.getBoundingClientRect().bottom).toBeCloseTo(16, 0)
  })

  it("mirrors attached tables:  no margin on a joined edge", async () => {
    const { hosts } = await tables(['attached="top"', "attached", 'attached="bottom"'])
    const margins = hosts.map((host) => [getComputedStyle(host).marginTop, getComputedStyle(host).marginBottom])
    expect(margins).toEqual([
      ["16px", "0px"],
      ["0px", "0px"],
      ["0px", "0px"]
    ])
    expect(hosts[0]!.matches(":state(attached):state(attached-top)")).toBe(true)
    expect(hosts[2]!.matches(":state(attached-bottom)")).toBe(true)
  })
})

describe("<ui-table> tokens from outside", () => {
  /** The table's top-left radius, which `--ui-table-radius` drives. */
  function radius(element: Element): string {
    return getComputedStyle(element).borderTopLeftRadius
  }

  it("takes a token set on the HOST, or on the table itself", async () => {
    const { table: onHost } = await table(`style="--ui-table-radius: 12px"`)
    expect(radius(onHost)).toBe("12px")
    const { table: onTable } = await table("", HEAD + BODY, `style="--ui-table-radius: 12px"`)
    expect(radius(onTable)).toBe("12px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-table-radius: 12px"><div><ui-table><table>${HEAD}${BODY}</table></ui-table></div></section>`
    )
    await settle()
    expect(radius(wrapper.querySelector("table")!)).toBe("12px")
  })

  it("takes a token set through `::part(scroller)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(scroller) { --ui-table-radius: 12px }</style><ui-table class="themed"><table>${HEAD}${BODY}</table></ui-table></div>`
    )
    await settle()
    expect(radius(wrapper.querySelector("table")!)).toBe("12px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-table-radius", "12px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-table-radius")
    })
    const { table: element } = await table()
    expect(radius(element)).toBe("12px")
  })

  it("sizes the scroller by `--ui-table-row-height`", async () => {
    // the scroller's cap is 4 rows on a mobile viewport (more rows on larger ones)
    await page.viewport(414, 900)
    const rows = Array.from({ length: 30 }, (_, index) => `<tr><td>${index}</td><td>x</td><td>y</td></tr>`).join("")
    const { host } = await table(`scrolling style="--ui-table-row-height: 10px"`, `${HEAD}<tbody>${rows}</tbody>`)
    expect(getComputedStyle(scroller(host)).maxBlockSize).toBe("40px")
  })

  it("variations:  `inverted` swaps the header background for its own token", async () => {
    const red = "rgb(255, 0, 0)"
    const head = (element: HTMLTableElement) => getComputedStyle(element.querySelector("th")!).backgroundColor
    const { table: plain } = await table(`style="--ui-table-header-background: ${red}"`)
    expect(head(plain)).toBe(red)
    const { table: inverted } = await table(`inverted style="--ui-table-header-background: ${red}"`)
    expect(head(inverted)).not.toBe(red)
    const { table: themed } = await table(`inverted style="--ui-table-inverted-header-background: ${red}"`)
    expect(head(themed)).toBe(red)
  })
})

describe("<ui-table sortable>", () => {
  it("sorts by a header's button:  ui-sort, aria-sort, reflected state, direction flips", async () => {
    const { host, table: element } = await table("sortable")
    const seen = sorts(host)
    const [name, count] = element.tHead!.rows[0]!.cells
    name!.querySelector("button")!.click()
    await settle()
    expect(seen).toHaveLength(1)
    expect(seen[0]).toMatchObject({ column: 0, key: "name", direction: "ascending" })
    expect(seen[0]!.originalEvent).toBeInstanceOf(MouseEvent)
    expect(name!.getAttribute("aria-sort")).toBe("ascending")
    expect(host.getAttribute("sort-column")).toBe("0")
    expect(host.getAttribute("sort-direction")).toBe("ascending")
    name!.querySelector("button")!.click()
    await settle()
    expect(seen[1]!.direction).toBe("descending")
    expect(name!.getAttribute("aria-sort")).toBe("descending")
    count!.click()
    await settle()
    expect(seen[2]).toMatchObject({ column: 1, key: "count", direction: "ascending" })
    expect(count!.getAttribute("aria-sort")).toBe("ascending")
    expect(name!.hasAttribute("aria-sort")).toBe(false)
    // without `client-sort`, the app owns its rows
    expect(column(element, 0)).toEqual(["Jamie", "Jill", "John"])
  })

  it("makes button-less headers focusable, never the opted-out one, and undoes it when not sortable", async () => {
    const { host, table: element } = await table("sortable")
    const [name, count, notes] = element.tHead!.rows[0]!.cells
    expect(name!.hasAttribute("tabindex")).toBe(false)
    expect(count!.getAttribute("tabindex")).toBe("0")
    expect(notes!.hasAttribute("tabindex")).toBe(false)
    const seen = sorts(host)
    notes!.click()
    await settle()
    expect(seen).toHaveLength(0)
    host.sortable = false
    await settle()
    expect(count!.hasAttribute("tabindex")).toBe(false)
    count!.click()
    await settle()
    expect(seen).toHaveLength(0)
  })

  it("sorts from the keyboard:  Enter / Space on a focusable header, Enter / Space on a header button", async () => {
    const { host, table: element } = await table("sortable")
    const seen = sorts(host)
    const [name, count] = element.tHead!.rows[0]!.cells
    count!.focus()
    await userEvent.keyboard("{Enter}")
    await settle()
    expect(seen.at(-1)).toMatchObject({ column: 1, direction: "ascending" })
    await userEvent.keyboard(" ")
    await settle()
    expect(seen.at(-1)).toMatchObject({ column: 1, direction: "descending" })
    expect(seen.at(-1)!.originalEvent).toBeInstanceOf(KeyboardEvent)
    name!.querySelector("button")!.focus()
    await userEvent.keyboard("{Enter}")
    await settle()
    expect(seen.at(-1)).toMatchObject({ column: 0, direction: "ascending" })
    await userEvent.keyboard(" ")
    await settle()
    expect(seen.at(-1)).toMatchObject({ column: 0, direction: "descending" })
    // one event per key:  the button's click, never also the header's keydown
    expect(seen).toHaveLength(4)
  })

  it("keeps the sort when ui-sort is cancelled", async () => {
    const { host, table: element } = await table("sortable client-sort")
    const seen = sorts(host, true)
    const count = element.tHead!.rows[0]!.cells[1]!
    count.click()
    await settle()
    expect(seen).toHaveLength(1)
    expect(host.hasAttribute("sort-column")).toBe(false)
    expect(count.hasAttribute("aria-sort")).toBe(false)
    expect(column(element, 1)).toEqual(["10", "9", "100"])
  })

  it("reorders body rows by cell text with `client-sort`, numbers numerically", async () => {
    const { table: element } = await table("sortable client-sort")
    const count = element.tHead!.rows[0]!.cells[1]!
    count.click()
    await settle()
    expect(column(element, 1)).toEqual(["9", "10", "100"])
    count.click()
    await settle()
    expect(column(element, 1)).toEqual(["100", "10", "9"])
  })

  it("follows sort-column / sort-direction set by the app", async () => {
    const { host, table: element } = await table("sortable client-sort")
    host.sortColumn = 2
    host.sortDirection = "descending"
    await settle()
    expect(element.tHead!.rows[0]!.cells[2]!.getAttribute("aria-sort")).toBe("descending")
    expect(column(element, 2)).toEqual(["c", "b", "a"])
  })

  it("counts colspans in column indexes", async () => {
    const { host, table: element } = await table(
      "sortable",
      `<thead><tr><th colspan="2">Both</th><th>Third</th></tr></thead>${BODY}`
    )
    const seen = sorts(host)
    element.tHead!.rows[0]!.cells[1]!.click()
    await settle()
    expect(seen[0]!.column).toBe(2)
  })
})

describe("<ui-table> data mode", () => {
  /** Rows with a value that would be markup if injected. */
  const ROWS: TableRow[] = [
    { name: "Jill", count: 9, note: "<b>bold</b>" },
    { name: "Jamie", count: 10, note: null },
    { name: "John", count: 100, note: "a" }
  ]

  it("renders a native table into the light DOM from rows, text only", async () => {
    const host = await ElementFixture.render<TableHost>(`<ui-table celled></ui-table>`)
    host.rows = ROWS
    await settle()
    const element = host.querySelector("table")!
    expect(element.parentElement).toBe(host)
    expect(element.className).toBe("ui celled table")
    const headers = [...element.tHead!.rows[0]!.cells]
    expect(headers.map((header) => header.textContent)).toEqual(["name", "count", "note"])
    expect(headers.every((header) => header.localName === "th" && header.getAttribute("scope") === "col")).toBe(true)
    expect(column(element, 0)).toEqual(["Jill", "Jamie", "John"])
    expect(column(element, 2)).toEqual(["<b>bold</b>", "", "a"])
    expect(element.querySelector("b")).toBeNull()
    await expectAccessible(host)
  })

  it("follows columnDefs:  headers, alignment, widths, opting out of sorting", async () => {
    const host = await ElementFixture.render<TableHost>(`<ui-table sortable></ui-table>`)
    host.columnDefs = [
      { key: "name", header: "Name", width: 4 },
      { key: "count", header: "Count", textAlign: "right", sortable: false }
    ]
    host.rows = ROWS
    await settle()
    const element = host.querySelector("table")!
    const [name, count] = element.tHead!.rows[0]!.cells
    expect(name!.querySelector("button")!.textContent).toBe("Name")
    expect(name!.className).toBe("four wide")
    expect(count!.querySelector("button")).toBeNull()
    expect(count!.textContent).toBe("Count")
    expect(count!.getAttribute("data-sortable")).toBe("false")
    expect(element.tBodies[0]!.rows[0]!.cells[1]!.className).toBe("right aligned")
    expect(element.tBodies[0]!.rows[0]!.cells).toHaveLength(2)
  })

  it("shows its rows sorted, by header clicks", async () => {
    const host = await ElementFixture.render<TableHost>(`<ui-table sortable></ui-table>`)
    host.rows = ROWS
    await settle()
    const element = host.querySelector("table")!
    const seen = sorts(host)
    element.tHead!.rows[0]!.cells[1]!.querySelector("button")!.click()
    await settle()
    expect(seen[0]).toMatchObject({ column: 1, key: "count", direction: "ascending" })
    expect(column(element, 1)).toEqual(["9", "10", "100"])
    element.tHead!.rows[0]!.cells[1]!.querySelector("button")!.click()
    await settle()
    expect(column(element, 1)).toEqual(["100", "10", "9"])
    expect(element.tHead!.rows[0]!.cells[1]!.getAttribute("aria-sort")).toBe("descending")
  })

  it("keeps row order when ui-sort is cancelled", async () => {
    const host = await ElementFixture.render<TableHost>(`<ui-table sortable></ui-table>`)
    host.rows = ROWS
    await settle()
    sorts(host, true)
    host.querySelector("button")!.click()
    await settle()
    expect(column(host.querySelector("table")!, 0)).toEqual(["Jill", "Jamie", "John"])
  })

  it("removes its table when rows is unset, and yields to an author table", async () => {
    const host = await ElementFixture.render<TableHost>(`<ui-table celled></ui-table>`)
    host.rows = ROWS
    await settle()
    expect(host.querySelectorAll("table")).toHaveLength(1)
    const author = document.createElement("table")
    author.innerHTML = HEAD + BODY
    host.append(author)
    await settle()
    expect([...host.querySelectorAll("table")]).toEqual([author])
    expect(author.className).toBe("ui celled table")
    author.remove()
    await settle()
    expect(host.querySelectorAll("table")).toHaveLength(1)
    expect(host.querySelector("table")).not.toBe(author)
    host.rows = undefined
    await settle()
    expect(host.querySelector("table")).toBeNull()
  })

  it("never renders over an author table present from the start", async () => {
    const { host, table: element } = await table("celled")
    host.rows = ROWS
    await settle()
    expect([...host.querySelectorAll("table")]).toEqual([element])
  })
})

describe("<ui-table> accessibility", () => {
  it.each(Object.keys(EXAMPLES).flatMap((path) => [[path, WIDE] as const, [path, NARROW] as const]))(
    "axe passes on %s at %ipx",
    async (path, width) => {
      const root = await ElementFixture.render(`<div style="width: ${width}px">${EXAMPLES[path]!}</div>`)
      await settle()
      await expectAccessible(root)
    }
  )

  it("announces the sorted column with aria-sort on its header only", async () => {
    const { host, table: element } = await table('sortable sort-column="0" sort-direction="descending"')
    const headers = [...element.tHead!.rows[0]!.cells]
    expect(headers.map((header) => header.getAttribute("aria-sort"))).toEqual(["descending", null, null])
    await expectAccessible(host)
  })
})

describe("<ui-table> native fallback", () => {
  it("keeps the scroller, the slot and the mirrored classes when its render fails", async () => {
    const { host, table: element } = await table("celled sortable")
    await ElementFixture.breakRender(host)
    expect(host.matches(":state(errored)")).toBe(true)
    await settle()
    const box = scroller(host)
    expect(box.className).toBe("scroller")
    expect(box.querySelector("slot")).not.toBeNull()
    expect(element.className).toBe("ui celled sortable table")
  })
})
