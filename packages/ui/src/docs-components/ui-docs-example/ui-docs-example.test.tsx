import { describe, expect, it, onTestFinished } from "vite-plus/test"

import { expectAccessible } from "$/ui/test/a11y"
import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"

import { ExampleSource } from "./ExampleSource"
import { HtmlFormatter } from "./HtmlFormatter"

import "$/ui/docs-components/ui-docs-example"

/** Element-markup examples, by path. */
const EXAMPLES = import.meta.glob<string>("/src/docs-components/ui-docs-example/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** Render one example;  returns it with its shadow `<section>`. */
async function render(html: string) {
  const host = await ElementFixture.render<UIHost>(html)
  const section = host.shadowRoot!.querySelector<HTMLElement>("[part~=example]")!
  return { host, section }
}

/** The `<ui-code>` of `host`'s code pane, or `null` while it's closed. */
function codeOf(host: Element) {
  return host.shadowRoot!.querySelector<HTMLElement & { content: string }>("[part~=source]")
}

/** `host`'s code button. */
function toggleOf(host: Element) {
  return host.shadowRoot!.querySelector<HTMLElement>("[part~=toggle]")!
}

describe("<ui-docs-example> classes and chrome", () => {
  it.each([
    ["", "ui example"],
    ["bare", "ui bare example"],
    ["variation", "ui variation example"]
  ])("<ui-docs-example %s>", async (attributes, classes) => {
    const { section } = await render(`<ui-docs-example ${attributes}><ui-button>A</ui-button></ui-docs-example>`)
    expect(section.className).toBe(classes)
  })

  it("shows the header, the description (backticks as code) and a closed code button", async () => {
    const { host } = await render(
      `<ui-docs-example header="Emphasis" description="Use \`primary\` once."><ui-button>A</ui-button></ui-docs-example>`
    )
    const header = host.shadowRoot!.querySelector("[part~=header]")!
    expect(header.localName).toBe("ui-header")
    expect(header.getAttribute("level")).toBe("4")
    expect(header.textContent).toBe("Emphasis")
    const description = host.shadowRoot!.querySelector("[part~=description]")!
    expect(description.querySelector("code")?.textContent).toBe("primary")
    expect(description.textContent).toBe("Use primary once.")
    expect(toggleOf(host).getAttribute("aria-expanded")).toBe("false")
    expect(codeOf(host)).toBeNull()
    expect(host.matches(":state(open)")).toBe(false)
  })

  it("leaves the header and description out when there are none", async () => {
    const { host } = await render(`<ui-docs-example><ui-button>A</ui-button></ui-docs-example>`)
    expect(host.shadowRoot!.querySelector("[part~=header]")).toBeNull()
    expect(host.shadowRoot!.querySelector("[part~=description]")).toBeNull()
    expect(toggleOf(host)).not.toBeNull()
  })

  it("shows its children live, in the default slot", async () => {
    const { host } = await render(`<ui-docs-example><ui-button primary>Save</ui-button></ui-docs-example>`)
    const slot = host.shadowRoot!.querySelector<HTMLSlotElement>("[part~=demo] slot:not([name])")!
    expect(slot.assignedElements().map((element) => element.localName)).toEqual(["ui-button"])
  })
})

describe("<ui-docs-example> code pane", () => {
  it("opens at start with `code`:  the children's markup, in html", async () => {
    const { host } = await render(
      `<ui-docs-example header="Emphasis" code>
        <ui-button primary>Save</ui-button>
        <ui-button>Discard</ui-button>
      </ui-docs-example>`
    )
    expect(host.matches(":state(open)")).toBe(true)
    const code = codeOf(host)!
    expect(code.getAttribute("language")).toBe("html")
    expect(code.content).toBe("<ui-button primary>Save</ui-button>\n<ui-button>Discard</ui-button>")
    expect(toggleOf(host).getAttribute("aria-expanded")).toBe("true")
  })

  it("toggles with the code button:  `ui-toggle`, the reflected `code`, frame on and off", async () => {
    const { host } = await render(`<ui-docs-example><ui-button>A</ui-button></ui-docs-example>`)
    const events: boolean[] = []
    host.addEventListener("ui-toggle", (event) => events.push((event as CustomEvent<{ open: boolean }>).detail.open))
    const demo = host.shadowRoot!.querySelector("[part~=demo]")!
    expect(demo.hasAttribute("basic")).toBe(true)

    toggleOf(host).click()
    await ElementFixture.settle(host)
    expect(events).toEqual([true])
    expect(host.hasAttribute("code")).toBe(true)
    expect(codeOf(host)).not.toBeNull()
    expect(demo.getAttribute("attached")).toBe("top")
    expect(demo.hasAttribute("basic")).toBe(false)

    toggleOf(host).click()
    await ElementFixture.settle(host)
    expect(events).toEqual([true, false])
    expect(host.hasAttribute("code")).toBe(false)
    expect(codeOf(host)).toBeNull()
  })

  it("is never framed when `bare`", async () => {
    const { host } = await render(`<ui-docs-example bare code><ui-button>A</ui-button></ui-docs-example>`)
    expect(host.shadowRoot!.querySelector("[part~=demo]")!.hasAttribute("basic")).toBe(true)
    expect(host.shadowRoot!.querySelector("[part~=code]")!.hasAttribute("attached")).toBe(false)
  })

  it("takes `language`", async () => {
    const { host } = await render(`<ui-docs-example code language="xml"><b>x</b></ui-docs-example>`)
    expect(codeOf(host)!.getAttribute("language")).toBe("xml")
  })
})

describe("<ui-docs-example> source capture", () => {
  it("leaves the description slot out of the code", async () => {
    const { host } = await render(
      `<ui-docs-example code><p slot="description">About <a href="#x">this</a></p><ui-button>A</ui-button></ui-docs-example>`
    )
    expect(host.shadowRoot!.querySelector("[part~=description] slot")).not.toBeNull()
    expect(codeOf(host)!.content).toBe("<ui-button>A</ui-button>")
  })

  it("stamps a `<template>` out live, and shows its markup", async () => {
    const { host } = await render(
      `<ui-docs-example code><template><ui-button icon="heart">Like</ui-button></template></ui-docs-example>`
    )
    await ElementFixture.tick()
    await ElementFixture.settle(host)
    const live = host.querySelector(":scope > ui-button")!
    expect(live.textContent).toBe("Like")
    expect(codeOf(host)!.content).toBe(`<ui-button icon="heart">Like</ui-button>`)
  })

  it("reads children upgraded BEFORE it as authored, minus runtime attributes", async () => {
    const holder = await ElementFixture.render<HTMLElement>(
      `<div><ui-button primary data-ui-animation="fade in">Save</ui-button></div>`
    )
    const button = holder.querySelector("ui-button")!
    expect(button.shadowRoot).not.toBeNull()
    const host = document.createElement("ui-docs-example")
    host.setAttribute("code", "")
    host.append(button)
    holder.append(host)
    await ElementFixture.settle(holder)
    expect(codeOf(host)!.content).toBe("<ui-button primary>Save</ui-button>")
  })

  it("prefers the snapshot taken before the family loaded", async () => {
    // a document with no browsing context:  nothing in it upgrades, as a page before its families load
    const page = document.implementation.createHTMLDocument("")
    page.body.innerHTML = `<ui-docs-example code><ui-button>Save</ui-button></ui-docs-example>`
    expect(ExampleSource.snapshot(page)).toBe(1)
    expect(ExampleSource.snapshot(page)).toBe(0)
    const host = page.body.firstElementChild!
    host.firstElementChild!.setAttribute("tabindex", "0") // what a runtime might add afterwards
    const holder = document.createElement("div")
    document.body.append(holder)
    onTestFinished(() => holder.remove())
    holder.append(document.adoptNode(host))
    await ElementFixture.settle(holder)
    expect(codeOf(host)!.content).toBe("<ui-button>Save</ui-button>")
  })

  it("keep():  a fragment's examples, defined or not, with an include's rewritten URLs put back", async () => {
    const fragment = document
      .createRange()
      .createContextualFragment(
        `<ui-docs-example code><ui-image src="/ui/images/a.png" data-ui-include-src="../images/a.png"></ui-image></ui-docs-example>`
      )
    expect(ExampleSource.keep(fragment)).toBe(1)
    expect(ExampleSource.keep(fragment)).toBe(0)
    const host = fragment.firstElementChild!
    const holder = document.createElement("div")
    document.body.append(holder)
    onTestFinished(() => holder.remove())
    holder.append(fragment)
    await ElementFixture.settle(holder)
    expect(codeOf(host)!.content).toBe(`<ui-image src="../images/a.png"></ui-image>`)
  })
})

describe("HtmlFormatter", () => {
  it.each([
    ['<ui-button\n    primary\n    size="small">A</ui-button>', '<ui-button primary size="small">A</ui-button>'],
    ['<ui-button basic="">A</ui-button>', "<ui-button basic>A</ui-button>"],
    [
      "<div><ui-button>A</ui-button><ui-button>B</ui-button></div>",
      "<div>\n  <ui-button>A</ui-button>\n  <ui-button>B</ui-button>\n</div>"
    ],
    [
      '<ui-code language="js">  if (x) {\n    y()\n  }</ui-code>',
      '<ui-code language="js">  if (x) {\n    y()\n  }</ui-code>'
    ],
    ["<p>Some <code>code</code> here</p>", "<p>Some <code>code</code> here</p>"],
    [
      '<div><script type="module">\n          if (x) {\n            y()\n          }\n        </script></div>',
      '<div>\n  <script type="module">\n    if (x) {\n      y()\n    }\n  </script>\n</div>'
    ]
  ])("formats %j", (html, expected) => {
    expect(HtmlFormatter.format(html)).toBe(expected)
  })
})

describe("<ui-docs-example> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await ElementFixture.tick()
    await ElementFixture.settle(root)
    await expectAccessible(root)
  })
})

describe("<ui-docs-example> demo frame", () => {
  it("unpads its own demo box only:  a segment in the example keeps its padding (I18)", async () => {
    const { host } = await render(`<ui-docs-example><ui-segment>Inside</ui-segment></ui-docs-example>`)
    await ElementFixture.settle(host)
    const demo = host.shadowRoot!.querySelector("[part~=demo]")!.shadowRoot!.querySelector("[part~=segment]")!
    expect(getComputedStyle(demo).paddingTop).toBe("0px")
    const inner = host.querySelector("ui-segment")!.shadowRoot!.querySelector("[part~=segment]")!
    expect(parseFloat(getComputedStyle(inner).paddingTop)).toBeGreaterThan(0)
  })
})
