import { userEvent } from "vite-plus/test/browser"
import { describe, expect, it } from "vite-plus/test"

import type { SectionToggleDetail } from "$/ui/components/components.types"
import { UI } from "$/ui/runtime"
import { expectAccessible } from "$/ui/test/a11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"

import "$/ui/components/ui-section"
import "$/ui/components/ui-icon"
import "$/ui/components/ui-label"
import "$/ui/components/ui-button"
import "$/ui/components/ui-segment"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-section/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A `<ui-section>` host with its controlled `collapsed` property. */
type SectionHost = UIHost & { collapsed: boolean }

/** Render one `<ui-section>`;  returns it with its shadow parts. */
async function section(html: string) {
  const host = await ElementFixture.render<SectionHost>(html)
  return { host, ...parts(host) }
}

/** Shadow parts of a section host;  absent ones are `null`. */
function parts(host: Element) {
  const shadow = host.shadowRoot!
  return {
    root: part("section")!,
    title: part("title")!,
    heading: part("heading")!,
    toggle: part("toggle")!,
    header: part("header")!,
    content: part("content")!,
    foldIcon: part("fold-icon"),
    icon: part("icon"),
    badge: part("badge"),
    actions: part("actions"),
    subhead: part("subhead")
  }

  /** The shadow element with part `name`, or `null`. */
  function part(name: string) {
    return shadow.querySelector<HTMLElement>(`[part~=${name}]`)
  }
}

/** `tag.class` of `element`'s children that are parts, in order (skips helpers such as a sticky sentinel). */
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

/** Whether the content box is folded:  `hidden="until-found"`, drawing nothing. */
function folded(content: HTMLElement) {
  return content.getAttribute("hidden") === "until-found" && content.getBoundingClientRect().height === 0
}

describe("<ui-section> definition", () => {
  it("registers its texts with UI.i18n when DEFINED", async () => {
    await UI.load()
    expect(UI.i18n.t("fold")).toBe("Fold")
    expect(UI.i18n.t("unfold")).toBe("Unfold")
  })
})

describe("<ui-section> classes", () => {
  it.each([
    ["", "ui section"],
    ['color="teal" dividing sticky', "ui teal dividing sticky section"],
    ['size="small" block', "ui small block section"],
    ['size="medium"', "ui section"],
    ["bordered raised compact", "ui bordered compact raised section"],
    ['padded="very" attached="top" bordered', "ui bordered very padded top attached section"],
    ['scrolling="very short"', "ui very short scrolling section"],
    ['text-align="center" inverted', "ui inverted center aligned section"],
    ["styled basic loading disabled", "ui basic disabled loading styled section"],
    ['collapsible collapsed header="H" subhead="S" level="3" badge="2" icon="bug" offset="4"', "ui section"]
  ])("<ui-section %s>", async (attributes, classes) => {
    const { root } = await section(`<ui-section ${attributes}>Body</ui-section>`)
    expect(root.localName).toBe("section")
    expect(root.className).toBe(classes)
  })

  it("`height` implies `scrolling`", async () => {
    const { root } = await section(`<ui-section height="40px">Body</ui-section>`)
    expect(root.classList.contains("scrolling")).toBe(true)
  })
})

describe("<ui-section> markup", () => {
  it("renders the title bar and the content box;  a plain title is a <span class=toggle>", async () => {
    const { root, title, heading, toggle, header, content } = await section(
      `<ui-section header="Title">Body</ui-section>`
    )
    expect(shape(root)).toEqual(["header.title", "div.content"])
    expect(title.getAttribute("part")).toBe("title")
    expect(shape(title)).toEqual(["h2.heading"])
    expect(heading.firstElementChild).toBe(toggle)
    expect(toggle.localName).toBe("span")
    expect(toggle.className).toBe("toggle")
    expect(shape(toggle)).toEqual(["span.header"])
    const headerSlot = header.querySelector("slot")!
    expect(headerSlot.name).toBe("header")
    expect(headerSlot.textContent).toBe("Title")
    expect(content.querySelector("slot:not([name])")).not.toBeNull()
  })

  it("renders every piece in contract order", async () => {
    const { root, title, toggle, foldIcon, icon, badge, actions, subhead } = await section(
      `<ui-section header="Tasks" icon="list check" badge="3/7" subhead="Sub" collapsible>` +
        `<ui-button slot="actions" size="mini">Edit</ui-button>Body</ui-section>`
    )
    expect(shape(root)).toEqual(["header.title", "div.subhead", "div.content"])
    expect(shape(title)).toEqual(["h2.heading", "span.badge", "span.actions"])
    expect(toggle.localName).toBe("button")
    expect(shape(toggle)).toEqual(["span.fold icon", "span.icon", "span.header"])
    expect(foldIcon!.className).toBe("fold icon")
    expect(icon!.querySelector("slot")!.name).toBe("icon")
    expect(badge!.querySelector("slot")!.name).toBe("badge")
    expect(badge!.textContent).toBe("3/7")
    expect(actions!.querySelector("slot")!.name).toBe("actions")
    expect(subhead!.querySelector("slot")!.name).toBe("subhead")
    expect(subhead!.textContent).toBe("Sub")
    await expect.poll(() => icon!.querySelector("svg")).not.toBeNull()
    await expect.poll(() => foldIcon!.querySelector("svg")).not.toBeNull()
  })

  it("renders the icon, badge, subhead and actions wrappers only when used", async () => {
    const { foldIcon, icon, badge, actions, subhead } = await section(`<ui-section header="H">Body</ui-section>`)
    expect([foldIcon, icon, badge, actions, subhead]).toEqual([null, null, null, null, null])
  })

  it("renders the wrappers for slotted content too", async () => {
    const { host, icon, badge, subhead, header } = await section(
      `<ui-section><ui-icon slot="icon" name="flask"></ui-icon><ui-label slot="badge" size="mini">New</ui-label>` +
        `<span slot="subhead">Rich subhead</span><span slot="header">Rich <code>title</code></span>Body</ui-section>`
    )
    expect(icon).not.toBeNull()
    expect(badge).not.toBeNull()
    expect(subhead).not.toBeNull()
    expect(host.querySelector("ui-icon")!.assignedSlot!.closest("[part~=icon]")).toBe(icon)
    expect(host.querySelector("ui-label")!.assignedSlot!.closest("[part~=badge]")).toBe(badge)
    expect(host.querySelector("[slot=header]")!.assignedSlot!.closest("[part~=header]")).toBe(header)
  })

  it("adds a wrapper when its slot gains a child", async () => {
    const { host } = await section(`<ui-section header="H">Body</ui-section>`)
    const badge = document.createElement("span")
    badge.slot = "badge"
    badge.textContent = "1"
    host.append(badge)
    await expect.poll(() => parts(host).badge).not.toBeNull()
    expect(badge.assignedSlot!.closest("[part~=badge]")).toBe(parts(host).badge)
  })

  it("is a block box, so its id is an anchor target", async () => {
    const { host } = await section(`<ui-section id="anchor" header="H">Body</ui-section>`)
    expect(getComputedStyle(host).display).toBe("block")
    expect(host.getBoundingClientRect().height).toBeGreaterThan(0)
  })

  it("draws the icon glyph from the attribute", async () => {
    const { icon } = await section(`<ui-section header="H" icon="lightbulb">Body</ui-section>`)
    await expect.poll(() => icon!.querySelector("svg")).not.toBeNull()
  })
})

describe("<ui-section> levels", () => {
  it("defaults to h2;  `level` sets it", async () => {
    expect((await section(`<ui-section header="H">x</ui-section>`)).heading.localName).toBe("h2")
    expect((await section(`<ui-section header="H" level="4">x</ui-section>`)).heading.localName).toBe("h4")
    expect((await section(`<ui-section header="H" level="1">x</ui-section>`)).heading.localName).toBe("h1")
  })

  it("nests one level below the enclosing section, with :state(in-section)", async () => {
    const { host } = await section(
      `<ui-section header="A"><ui-section id="b" header="B"><ui-section id="c" header="C">x</ui-section></ui-section></ui-section>`
    )
    const [b, c] = [host.querySelector("#b")!, host.querySelector("#c")!]
    await expect.poll(() => parts(b).heading.localName).toBe("h3")
    await expect.poll(() => parts(c).heading.localName).toBe("h4")
    expect(b.matches(":state(in-section)")).toBe(true)
    expect(c.matches(":state(in-section)")).toBe(true)
    expect(host.matches(":state(in-section)")).toBe(false)
  })

  it("counts from the parent's `level`, capped at h6", async () => {
    const { host } = await section(
      `<ui-section header="A" level="4"><ui-section id="b" header="B">x</ui-section></ui-section>`
    )
    await expect.poll(() => parts(host.querySelector("#b")!).heading.localName).toBe("h5")
    const deep = await section(
      `<ui-section header="A" level="6"><ui-section id="b" header="B">x</ui-section></ui-section>`
    )
    await expect.poll(() => parts(deep.host.querySelector("#b")!).heading.localName).toBe("h6")
  })

  it("an explicit `level` wins over nesting", async () => {
    const { host } = await section(
      `<ui-section header="A"><ui-section id="b" header="B" level="5">x</ui-section></ui-section>`
    )
    await expect.poll(() => parts(host.querySelector("#b")!).heading.localName).toBe("h5")
  })
})

describe("<ui-section> folding", () => {
  it("makes the title a button controlling the content", async () => {
    const { toggle, content } = await section(`<ui-section header="H" collapsible>Body</ui-section>`)
    expect(toggle.localName).toBe("button")
    expect(toggle.getAttribute("type")).toBe("button")
    expect(toggle.getAttribute("aria-expanded")).toBe("true")
    expect(toggle.getAttribute("aria-controls")).toBe(content.id)
    expect(content.id).not.toBe("")
    expect(content.hasAttribute("hidden")).toBe(false)
  })

  it("leaves a click on a link inside a rich title to the link:  no fold", async () => {
    const { host } = await section(
      `<ui-section collapsible><span slot="header">See <a href="#nowhere">this</a></span>Body</ui-section>`
    )
    const seen = record(host)
    await userEvent.click(host.querySelector("a")!)
    await ElementFixture.tick()
    expect(seen).toEqual([])
    expect(host.collapsed).toBeFalsy()
  })

  it("folds on a click:  a cancelable, composed ui-close first, then `collapsed`", async () => {
    const { host, toggle, content } = await section(`<ui-section header="H" collapsible>Body</ui-section>`)
    const seen = record(host)
    await userEvent.click(toggle)
    await ElementFixture.tick()
    expect(seen.map(({ type }) => type)).toEqual(["ui-close"])
    const { event } = seen[0]!
    expect(event.target).toBe(host)
    expect(event.cancelable).toBe(true)
    expect(event.composed).toBe(true)
    expect(event.bubbles).toBe(true)
    expect(event.detail.open).toBe(false)
    expect(event.detail.section).toBe(host)
    expect(event.detail.originalEvent).toBeInstanceOf(MouseEvent)
    expect(host.collapsed).toBe(true)
    expect(host.hasAttribute("collapsed")).toBe(true)
    expect(host.matches(":state(collapsed)")).toBe(true)
    expect(toggle.getAttribute("aria-expanded")).toBe("false")
    await expect.poll(() => folded(content)).toBe(true)
  })

  it("unfolds on the next click, announcing ui-open", async () => {
    const { host, toggle, content } = await section(`<ui-section header="H" collapsible collapsed>Body</ui-section>`)
    expect(folded(content)).toBe(true)
    expect(toggle.getAttribute("aria-expanded")).toBe("false")
    const seen = record(host)
    await userEvent.click(toggle)
    await ElementFixture.tick()
    expect(seen.map(({ type, event }) => [type, event.detail.open])).toEqual([["ui-open", true]])
    expect(host.collapsed).toBe(false)
    expect(host.hasAttribute("collapsed")).toBe(false)
    expect(host.matches(":state(collapsed)")).toBe(false)
    expect(toggle.getAttribute("aria-expanded")).toBe("true")
    expect(content.hasAttribute("hidden")).toBe(false)
  })

  it("toggles with Enter and Space", async () => {
    const { host, toggle } = await section(`<ui-section header="H" collapsible>Body</ui-section>`)
    const seen = record(host)
    toggle.focus()
    await userEvent.keyboard("{Enter}")
    await ElementFixture.tick()
    expect(host.collapsed).toBe(true)
    await userEvent.keyboard(" ")
    await ElementFixture.tick()
    expect(host.collapsed).toBe(false)
    expect(seen.map(({ type }) => type)).toEqual(["ui-close", "ui-open"])
  })

  it("is reached with Tab", async () => {
    const { host, toggle } = await section(`<ui-section header="H" collapsible>Body</ui-section>`)
    const before = document.createElement("button")
    before.textContent = "before"
    host.before(before)
    before.focus()
    await userEvent.tab()
    expect(host.shadowRoot!.activeElement).toBe(toggle)
  })

  it("keeps its state when a handler cancels", async () => {
    const { host, toggle, content } = await section(`<ui-section header="H" collapsible>Body</ui-section>`)
    host.addEventListener("ui-close", (event) => event.preventDefault(), { once: true })
    await userEvent.click(toggle)
    await ElementFixture.tick()
    expect(host.collapsed).toBe(false)
    expect(toggle.getAttribute("aria-expanded")).toBe("true")
    expect(content.hasAttribute("hidden")).toBe(false)
    host.collapsed = true
    await ElementFixture.tick()
    host.addEventListener("ui-open", (event) => event.preventDefault(), { once: true })
    await userEvent.click(toggle)
    await ElementFixture.tick()
    expect(host.collapsed).toBe(true)
  })

  it("is controlled:  `collapsed` set by the page folds and unfolds without events", async () => {
    const { host, toggle, content } = await section(`<ui-section header="H" collapsible>Body</ui-section>`)
    const seen = record(host)
    host.collapsed = true
    await ElementFixture.tick()
    expect(toggle.getAttribute("aria-expanded")).toBe("false")
    await expect.poll(() => folded(content)).toBe(true)
    host.removeAttribute("collapsed")
    await ElementFixture.tick()
    expect(host.collapsed).toBe(false)
    expect(toggle.getAttribute("aria-expanded")).toBe("true")
    expect(content.hasAttribute("hidden")).toBe(false)
    host.setAttribute("collapsed", "")
    await ElementFixture.tick()
    expect(host.collapsed).toBe(true)
    expect(seen).toEqual([])
  })

  it("doesn't fold while `disabled`", async () => {
    const { host, toggle, content } = await section(`<ui-section header="H" collapsible disabled>Body</ui-section>`)
    const seen = record(host)
    expect(host.matches(":state(disabled)")).toBe(true)
    toggle.click()
    await ElementFixture.tick()
    expect(seen).toEqual([])
    expect(host.collapsed).toBe(false)
    expect(content.hasAttribute("hidden")).toBe(false)
  })

  it("without `collapsible`:  no button, and the content always shows", async () => {
    const { toggle, content, foldIcon } = await section(`<ui-section header="H" collapsed>Body</ui-section>`)
    expect(toggle.localName).toBe("span")
    expect(foldIcon).toBeNull()
    expect(content.hasAttribute("hidden")).toBe(false)
    expect(content.getBoundingClientRect().height).toBeGreaterThan(0)
  })

  it("unfolds when find-in-page matches inside, announcing an uncancelable ui-open", async () => {
    const { host, toggle, content } = await section(`<ui-section header="H" collapsible collapsed>Needle</ui-section>`)
    const seen = record(host)
    // what find-in-page does on a match in `hidden="until-found"`:  `beforematch`, then the browser drops `hidden`
    content.dispatchEvent(new Event("beforematch", { bubbles: true }))
    content.removeAttribute("hidden")
    await ElementFixture.tick()
    expect(seen.map(({ type }) => type)).toEqual(["ui-open"])
    expect(seen[0]!.event.cancelable).toBe(false)
    expect(seen[0]!.event.detail.originalEvent).toBeUndefined()
    await expect.poll(() => host.collapsed).toBe(false)
    expect(toggle.getAttribute("aria-expanded")).toBe("true")
  })

  it("animates the fold when the browser can grow to `auto`", async () => {
    const { host } = await section(`<ui-section header="H" collapsible>Body</ui-section>`)
    expect(host.matches(":state(animated)")).toBe(CSS.supports("interpolate-size: allow-keywords"))
  })
})

describe("<ui-section> look", () => {
  it("`size` scales the content's text, not the title's", async () => {
    const plain = await section(`<ui-section header="H">Body</ui-section>`)
    const large = await section(`<ui-section header="H" size="large">Body</ui-section>`)
    const font = (element: Element) => parseFloat(getComputedStyle(element).fontSize)
    expect(font(large.content)).toBeGreaterThan(font(plain.content))
    expect(font(large.heading)).toBe(font(plain.heading))
    const small = await section(`<ui-section header="H" size="small">Body</ui-section>`)
    expect(font(small.content)).toBeLessThan(font(plain.content))
    expect(font(small.heading)).toBe(font(plain.heading))
  })

  it("`height` caps the content, which scrolls", async () => {
    const { content } = await section(
      `<ui-section header="H" height="50px"><p style="height: 300px; margin: 0">Tall</p></ui-section>`
    )
    expect(content.getBoundingClientRect().height).toBeLessThanOrEqual(50)
    expect(content.scrollHeight).toBeGreaterThan(content.clientHeight)
    expect(["auto", "scroll"]).toContain(getComputedStyle(content).overflowY)
  })

  it("`scrolling` caps the content by its word", async () => {
    const tall = `<p style="height: 2000px; margin: 0">Tall</p>`
    const short = await section(`<ui-section header="H" scrolling="very short">${tall}</ui-section>`)
    const long = await section(`<ui-section header="H" scrolling="long">${tall}</ui-section>`)
    expect(short.content.scrollHeight).toBeGreaterThan(short.content.clientHeight)
    expect(short.content.clientHeight).toBeLessThan(long.content.clientHeight)
  })

  it("`loading` sets aria-busy and :state(loading)", async () => {
    const { host, root } = await section(`<ui-section header="H" loading>Body</ui-section>`)
    expect([host, root].some((element) => element.getAttribute("aria-busy") === "true")).toBe(true)
    expect(host.matches(":state(loading)")).toBe(true)
    host.removeAttribute("loading")
    await ElementFixture.tick()
    expect([host, root].some((element) => element.getAttribute("aria-busy") === "true")).toBe(false)
  })

  it("`inverted` sets :state(inverted) and the dark scheme", async () => {
    const { host, root } = await section(`<ui-section header="H" inverted>Body</ui-section>`)
    expect(host.matches(":state(inverted)")).toBe(true)
    expect(getComputedStyle(root).colorScheme).toBe("dark")
  })

  it("`text-align` aligns the title", async () => {
    const { title } = await section(`<ui-section header="H" text-align="center">Body</ui-section>`)
    const header = title.querySelector<HTMLElement>("[part~=header]")!
    const [bar, text] = [title.getBoundingClientRect(), header.getBoundingClientRect()]
    expect(Math.abs(bar.left + bar.width / 2 - (text.left + text.width / 2))).toBeLessThan(2)
  })
})

describe("<ui-section> sticky", () => {
  /**
   * A 200px scroll frame:  an outer sticky section holding 100px of text, a nested sticky section (600px of
   * text), then 600px more.
   */
  async function frame(attributes = "") {
    const scroller = await ElementFixture.render(
      `<div style="height: 200px; overflow: auto">` +
        `<ui-section id="outer" header="Outer" sticky ${attributes}>` +
        `<p style="height: 100px; margin: 0">A</p>` +
        `<ui-section id="inner" header="Inner" sticky><p style="height: 600px; margin: 0">B</p></ui-section>` +
        `<p style="height: 600px; margin: 0">C</p>` +
        `</ui-section></div>`
    )
    const [outer, inner] = [
      scroller.querySelector<SectionHost>("#outer")!,
      scroller.querySelector<SectionHost>("#inner")!
    ]
    await ElementFixture.settle(scroller)
    return { scroller, outer, inner }
  }

  it("sticks the title bar while the section is on screen, with :state(stuck)", async () => {
    const { scroller, outer } = await frame()
    const { title } = parts(outer)
    expect(getComputedStyle(title).position).toBe("sticky")
    await new Promise((resolve) => requestAnimationFrame(resolve))
    expect(outer.matches(":state(stuck)")).toBe(false)
    scroller.scrollTop = 300
    await expect.poll(() => outer.matches(":state(stuck)")).toBe(true)
    expect(title.getBoundingClientRect().top).toBeCloseTo(scroller.getBoundingClientRect().top, 0)
    scroller.scrollTop = 0
    await expect.poll(() => outer.matches(":state(stuck)")).toBe(false)
  })

  it("stacks a nested sticky title just below its parent's", async () => {
    const { scroller, outer, inner } = await frame()
    scroller.scrollTop = 300
    await expect.poll(() => inner.matches(":state(stuck)")).toBe(true)
    const outerBar = parts(outer).title.getBoundingClientRect()
    await expect
      .poll(() => Math.abs(parts(inner).title.getBoundingClientRect().top - outerBar.bottom))
      .toBeLessThan(1.5)
  })

  it("keeps a top-level stuck title `offset` pixels down", async () => {
    const { scroller, outer, inner } = await frame(`offset="10"`)
    scroller.scrollTop = 300
    await expect.poll(() => outer.matches(":state(stuck)")).toBe(true)
    const top = scroller.getBoundingClientRect().top
    await expect.poll(() => parts(outer).title.getBoundingClientRect().top - top).toBeCloseTo(10, 0)
    const outerBar = parts(outer).title.getBoundingClientRect()
    await expect
      .poll(() => Math.abs(parts(inner).title.getBoundingClientRect().top - outerBar.bottom))
      .toBeLessThan(1.5)
  })

  it("never sticks the subhead", async () => {
    const { subhead } = await section(`<ui-section header="H" subhead="S" sticky>Body</ui-section>`)
    expect(getComputedStyle(subhead!).position).not.toBe("sticky")
  })
})

describe("<ui-sections>", () => {
  /** Render a group;  returns it and its sections by id. */
  async function group(html: string) {
    const host = await ElementFixture.render<UIHost & { collapsing: boolean }>(html)
    const byId = (id: string) => host.querySelector<SectionHost>(`#${id}`)!
    return { host, byId }
  }

  /** Does `section` fold:  its toggle is a `<button>`? */
  function foldable(section: Element) {
    return parts(section).toggle.localName === "button"
  }

  /** `section`'s box (the shadow `<section>`):  its page rectangle. */
  function box(section: Element) {
    return parts(section).root.getBoundingClientRect()
  }

  it.each([
    ["", "ui sections"],
    ["collapsing", "ui collapsing sections"]
  ])("<ui-sections %s> renders a group box around a slot", async (attributes, classes) => {
    const { host } = await group(`<ui-sections ${attributes}><ui-section header="A">x</ui-section></ui-sections>`)
    const root = host.shadowRoot!.querySelector<HTMLElement>("[part~=group]")!
    expect(root.localName).toBe("div")
    expect(root.className).toBe(classes)
    expect(root.querySelector("slot:not([name])")).not.toBeNull()
  })

  it("`collapsing`:  every section in it folds by default, sub-sections included", async () => {
    const { byId } = await group(
      `<ui-sections collapsing>` +
        `<ui-section id="a" header="A"><ui-section id="b" header="B"><ui-section id="c" header="C">x</ui-section>` +
        `</ui-section></ui-section><ui-section id="d" header="D" collapsed>y</ui-section></ui-sections>`
    )
    for (const id of ["a", "b", "c", "d"]) await expect.poll(() => foldable(byId(id))).toBe(true)
    expect(folded(parts(byId("d")).content)).toBe(true)
    await userEvent.click(parts(byId("b")).toggle)
    await ElementFixture.tick()
    await expect.poll(() => byId("b").collapsed).toBe(true)
  })

  it('a section opts out with `collapsible="false"`;  its sub-sections still follow the group', async () => {
    const { byId } = await group(
      `<ui-sections collapsing><ui-section id="a" header="A" collapsible="false" collapsed>` +
        `<ui-section id="b" header="B">x</ui-section></ui-section></ui-sections>`
    )
    await expect.poll(() => foldable(byId("b"))).toBe(true)
    expect(foldable(byId("a"))).toBe(false)
    expect(folded(parts(byId("a")).content)).toBe(false)
    expect(byId("a").getAttribute("collapsible")).toBe("false")
  })

  it("a plain group changes nothing:  sections fold only with their own `collapsible`", async () => {
    const { byId } = await group(
      `<ui-sections><ui-section id="a" header="A">x</ui-section>` +
        `<ui-section id="b" header="B" collapsible>y</ui-section></ui-sections>`
    )
    await expect.poll(() => foldable(byId("b"))).toBe(true)
    expect(foldable(byId("a"))).toBe(false)
  })

  it("the NEAREST group decides:  a plain group inside a collapsing one turns the default off", async () => {
    const { byId } = await group(
      `<ui-sections collapsing><ui-section id="a" header="A">` +
        `<ui-sections><ui-section id="b" header="B">x</ui-section></ui-sections></ui-section></ui-sections>`
    )
    await expect.poll(() => foldable(byId("a"))).toBe(true)
    expect(foldable(byId("b"))).toBe(false)
  })

  it("follows `collapsing` set and removed later, and a section moved into the group", async () => {
    const { host, byId } = await group(`<ui-sections><ui-section id="a" header="A">x</ui-section></ui-sections>`)
    expect(foldable(byId("a"))).toBe(false)
    host.toggleAttribute("collapsing", true)
    await ElementFixture.tick()
    await expect.poll(() => foldable(byId("a"))).toBe(true)
    const outside = await ElementFixture.render<SectionHost>(`<ui-section id="moved" header="M">y</ui-section>`)
    expect(foldable(outside)).toBe(false)
    host.append(outside)
    await ElementFixture.tick()
    await expect.poll(() => foldable(outside)).toBe(true)
    host.toggleAttribute("collapsing", false)
    await ElementFixture.tick()
    await expect.poll(() => foldable(byId("a"))).toBe(false)
  })

  it("levels and :state(in-sections):  a group is transparent to nesting", async () => {
    const { host, byId } = await group(
      `<ui-section id="outer" header="Outer"><ui-sections id="inner-group" collapsing>` +
        `<ui-section id="a" header="A"><ui-section id="b" header="B">x</ui-section></ui-section>` +
        `</ui-sections></ui-section>`
    )
    await expect.poll(() => parts(byId("a")).heading.localName).toBe("h3")
    await expect.poll(() => parts(byId("b")).heading.localName).toBe("h4")
    expect(byId("a").matches(":state(in-sections)")).toBe(true)
    expect(byId("a").matches(":state(in-section)")).toBe(false)
    expect(byId("b").matches(":state(in-section)")).toBe(true)
    expect(host.querySelector("#inner-group")!.matches(":state(in-section)")).toBe(true)
    expect(foldable(host)).toBe(false)
  })

  it("stacks folded sections with no space between;  an open one keeps its space below, not above", async () => {
    const { byId } = await group(
      `<ui-sections collapsing>` +
        `<ui-section id="a" header="A" dividing collapsed>x</ui-section>` +
        `<ui-section id="b" header="B" dividing collapsed>x</ui-section>` +
        `<ui-section id="c" header="C" dividing>open</ui-section>` +
        `<ui-section id="d" header="D" dividing collapsed>x</ui-section>` +
        `</ui-sections>`
    )
    await expect.poll(() => folded(parts(byId("a")).content)).toBe(true)
    const [a, b, c, d] = ["a", "b", "c", "d"].map((id) => box(byId(id)))
    expect(b!.top - a!.bottom).toBeCloseTo(0, 0)
    expect(c!.top - b!.bottom).toBeCloseTo(0, 0)
    expect(d!.top - c!.bottom).toBeCloseTo(24, 0)
  })

  it("keeps the usual space in a plain group, and a section's space around the group", async () => {
    const { host, byId } = await group(
      `<div><p style="margin: 0">Before</p><ui-sections id="g">` +
        `<ui-section id="a" header="A" collapsible collapsed>x</ui-section>` +
        `<ui-section id="b" header="B" collapsible collapsed>x</ui-section></ui-sections></div>`
    )
    await expect.poll(() => folded(parts(byId("a")).content)).toBe(true)
    expect(box(byId("b")).top - box(byId("a")).bottom).toBeCloseTo(24, 0)
    const before = host.querySelector("p")!.getBoundingClientRect()
    expect(box(byId("a")).top - before.bottom).toBeCloseTo(24, 0)
  })

  it("overlaps stacked boxes' edges:  no doubled border, and the first box stays inside the group", async () => {
    const { host, byId } = await group(
      `<ui-sections collapsing>` +
        `<ui-section id="a" header="A" styled collapsed>x</ui-section>` +
        `<ui-section id="b" header="B" styled collapsed>x</ui-section>` +
        `<ui-section id="c" header="C" styled>open</ui-section>` +
        `</ui-sections>`
    )
    await expect.poll(() => folded(parts(byId("a")).content)).toBe(true)
    const border = parseFloat(getComputedStyle(parts(byId("a")).root).borderBottomWidth)
    expect(border).toBeGreaterThan(0)
    expect(box(byId("a")).bottom - box(byId("b")).top).toBeCloseTo(border, 1)
    expect(box(byId("b")).bottom - box(byId("c")).top).toBeCloseTo(border, 1)
    expect(box(byId("a")).top).toBeCloseTo(host.getBoundingClientRect().top, 1)
  })
})

describe("<ui-section> end chevron", () => {
  it('`fold-icon="end"`:  the chevron leaves the button for the far end of the bar, after the actions', async () => {
    const { title, toggle, foldIcon } = await section(
      `<ui-section header="H" collapsible fold-icon="end" style="width: 400px">` +
        `<ui-button slot="actions" size="mini">Edit</ui-button>Body</ui-section>`
    )
    expect(shape(toggle)).toEqual(["span.header"])
    expect(shape(title)).toEqual(["h2.heading", "span.actions", "span.fold icon"])
    expect(foldIcon!.getAttribute("aria-hidden")).toBe("true")
    await expect.poll(() => foldIcon!.querySelector("svg")).not.toBeNull()
    const bar = title.getBoundingClientRect()
    expect(Math.abs(bar.right - foldIcon!.getBoundingClientRect().right)).toBeLessThan(1)
  })

  it("folds on a click on the end chevron, as on the button;  turns while folded", async () => {
    const { host, toggle, foldIcon, content } = await section(
      `<ui-section header="H" collapsible fold-icon="end">Body</ui-section>`
    )
    const seen = record(host)
    await userEvent.click(foldIcon!)
    await ElementFixture.tick()
    expect(seen.map(({ type }) => type)).toEqual(["ui-close"])
    expect(host.collapsed).toBe(true)
    expect(toggle.getAttribute("aria-expanded")).toBe("false")
    await expect.poll(() => folded(content)).toBe(true)
    await expect.poll(() => getComputedStyle(foldIcon!).rotate).toBe("-90deg")
  })

  it('`fold-icon="start"` and no attribute:  the chevron stays first in the button', async () => {
    for (const html of [`fold-icon="start"`, ""]) {
      const { toggle, title } = await section(`<ui-section header="H" collapsible ${html}>Body</ui-section>`)
      expect(shape(toggle)).toEqual(["span.fold icon", "span.header"])
      expect(shape(title)).toEqual(["h2.heading"])
    }
  })

  it("without `collapsible`:  no chevron anywhere", async () => {
    const { foldIcon } = await section(`<ui-section header="H" fold-icon="end">Body</ui-section>`)
    expect(foldIcon).toBeNull()
  })
})

describe("<ui-section> info tip", () => {
  it("`info`:  a tooltip at the end of the title bar that describes the fold button", async () => {
    const { title, toggle, heading } = await section(
      `<ui-section header="Theme" info="The look of an app." collapsible>Body</ui-section>`
    )
    const tip = title.querySelector<HTMLElement>("[part~=tip]")!
    expect(shape(title)).toEqual(["h2.heading", "span.tip"])
    expect(tip.getAttribute("role")).toBe("tooltip")
    expect(tip.id).toBe("tip")
    expect(tip.textContent).toBe("The look of an app.")
    expect(toggle.getAttribute("aria-describedby")).toBe("tip")
    expect(heading.hasAttribute("aria-describedby")).toBe(false)
  })

  it("not collapsible:  the tip describes the heading", async () => {
    const { heading, toggle } = await section(`<ui-section header="H" info="Tip">Body</ui-section>`)
    expect(heading.getAttribute("aria-describedby")).toBe("tip")
    expect(toggle.hasAttribute("aria-describedby")).toBe(false)
  })

  it("is hidden until the pointer is on the title, or the fold button has keyboard focus", async () => {
    const { host, title, toggle } = await section(
      `<ui-section header="H" info="Tip" collapsible>Body</ui-section><button>after</button>`
    )
    const tip = title.querySelector<HTMLElement>("[part~=tip]")!
    expect(getComputedStyle(tip).visibility).toBe("hidden")
    await userEvent.hover(toggle)
    await expect.poll(() => getComputedStyle(tip).visibility).toBe("visible")
    expect(tip.getBoundingClientRect().top).toBeGreaterThanOrEqual(title.getBoundingClientRect().bottom)
    await userEvent.unhover(toggle)
    await expect.poll(() => getComputedStyle(tip).visibility).toBe("hidden")
    host.focus()
    await userEvent.tab()
    await expect.poll(() => getComputedStyle(tip).visibility).toBe("visible")
  })

  it('`slot="info"` is the rich version;  the tip appears when the slot gains a child', async () => {
    const { host } = await section(`<ui-section header="H">Body</ui-section>`)
    expect(parts(host).title.querySelector("[part~=tip]")).toBeNull()
    const rich = document.createElement("span")
    rich.slot = "info"
    rich.innerHTML = "A <b>theme</b> is a look."
    host.append(rich)
    await expect.poll(() => parts(host).title.querySelector("[part~=tip]")).not.toBeNull()
    expect(rich.assignedSlot!.closest("[part~=tip]")).not.toBeNull()
    expect(parts(host).heading.getAttribute("aria-describedby")).toBe("tip")
  })

  it("`--ui-section-tip-*` tokens reach the tip", async () => {
    const { title } = await section(
      `<ui-section header="H" info="Tip" style="--ui-section-tip-background: rgb(1, 2, 3); ` +
        `--ui-section-tip-color: rgb(4, 5, 6); --ui-section-tip-width: 100px">Body</ui-section>`
    )
    const tip = getComputedStyle(title.querySelector("[part~=tip]")!)
    expect(tip.backgroundColor).toBe("rgb(1, 2, 3)")
    expect(tip.color).toBe("rgb(4, 5, 6)")
    expect(tip.maxWidth).toBe("100px")
  })
})

describe("<ui-section> native fallback", () => {
  it("draws the end chevron and the info tip too", async () => {
    const { host } = await section(`<ui-section header="H" info="Tip" fold-icon="end" collapsible>Body</ui-section>`)
    await ElementFixture.breakRender(host)
    const { title, toggle, content } = parts(host)
    expect(shape(title)).toEqual(["h2.heading", "span.fold icon", "span.tip"])
    expect(toggle.getAttribute("aria-describedby")).toBe("tip")
    title.querySelector<HTMLElement>("[part~=fold-icon]")!.click()
    expect(content.getAttribute("hidden")).toBe("until-found")
  })

  it("renders the same class grammar and pieces when its render throws", async () => {
    const { host } = await section(
      `<ui-section header="H" icon="bug" badge="2" subhead="S" dividing color="teal" collapsible>Body</ui-section>`
    )
    await ElementFixture.breakRender(host)
    expect(host.matches(":state(errored)")).toBe(true)
    const { root, title, toggle, content } = parts(host)
    expect(root.className).toBe("ui teal dividing section")
    expect(shape(root)).toEqual(["header.title", "div.subhead", "div.content"])
    expect(shape(title)).toEqual(["h2.heading", "span.badge"])
    expect(toggle.localName).toBe("button")
    toggle.click()
    expect(content.getAttribute("hidden")).toBe("until-found")
  })
})

describe("<ui-section> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    // `heading-order` off:  the examples' `<h4>` labels sit between top-level sections' `<h2>`s, an artifact of the
    // fragments (on a page they'd come under an `h1`), not of the component
    await expectAccessible(root, { rules: { "heading-order": { enabled: false } } })
  })
})
