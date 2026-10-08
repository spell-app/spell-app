import { userEvent } from "vite-plus/test/browser"
import { Keys } from "$/ui/test/Keys"
import { afterEach, describe, expect, it, onTestFinished, vi } from "vite-plus/test"

import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { UI } from "$/ui/runtime"
import type { DOMElement } from "$/ui/elements"
import type { TabChangeDetail, TabShowDetail } from "$/ui/components/components.types"

import "$/ui/components/ui-tab"
import "$/ui/components/ui-segment"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-tab/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** Three panes. */
const PANES =
  `<ui-tab label="First" value="first">One</ui-tab>` +
  `<ui-tab label="Second" value="second">Two</ui-tab>` +
  `<ui-tab label="Third" value="third">Three</ui-tab>`

/** A tabs DOM element, with its `value`. */
type TabsHost = DOMElement & { value: string | undefined }

/** Render one `<ui-tabs>`;  returns it, its root, menu, tab buttons and pane DOM elements. */
async function tabs(attributes = "", panes = PANES) {
  const host = await ElementFixture.render<TabsHost>(`<ui-tabs aria-label="Test" ${attributes}>${panes}</ui-tabs>`)
  await ElementFixture.tick()
  return { host, ...parts(host) }
}

/** Shadow parts of a tabs DOM element. */
function parts(host: Element) {
  const root = host.shadowRoot!.querySelector<HTMLElement>("[part~=tabs]")!
  const menu = root.querySelector<HTMLElement>("[part~=menu]")!
  const buttons = [...menu.querySelectorAll<HTMLButtonElement>("[role=tab]")]
  const panes = [...host.querySelectorAll<DOMElement>(":scope > ui-tab")]
  return { root, menu, buttons, panes }
}

/** Width of the box `wide()` renders a tab set in. */
const WIDTH = 800

/** Three panes with labels of very different widths. */
const UNEVEN =
  `<ui-tab label="A" value="a">A</ui-tab>` +
  `<ui-tab label="A much longer label" value="b">B</ui-tab>` +
  `<ui-tab label="C" value="c">C</ui-tab>`

/** Render one `<ui-tabs>` in a `WIDTH`-wide box;  returns it and its parts. */
async function wide(attributes = "", panes = PANES) {
  const box = await ElementFixture.render(
    `<div style="width: ${WIDTH}px"><ui-tabs aria-label="Test" ${attributes}>${panes}</ui-tabs></div>`
  )
  await ElementFixture.tick()
  const host = box.querySelector<TabsHost>("ui-tabs")!
  return { host, ...parts(host) }
}

/** `value` (a CSS colour, tokens allowed) as computed on a probe in the document. */
function colorOf(value: string): string {
  const probe = document.createElement("span")
  probe.style.color = value
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

/** A pane's box. */
function boxOf(pane: Element): HTMLElement {
  return pane.shadowRoot!.querySelector<HTMLElement>("[part~=tab]")!
}

/** Indexes of the panes on screen. */
function shown(panes: Element[]) {
  return panes.flatMap((pane, index) => (pane.matches(":state(selected)") ? [index] : []))
}

/** The focused tab button's index in `buttons`, or -1. */
function focusedTab(host: Element, buttons: HTMLElement[]) {
  return buttons.indexOf(host.shadowRoot!.activeElement as HTMLElement)
}

/** Collect `ui-change` details from `host`. */
function changes(host: Element) {
  const seen: TabChangeDetail[] = []
  host.addEventListener("ui-change", (event) => seen.push((event as CustomEvent<TabChangeDetail>).detail))
  return seen
}

afterEach(() => {
  vi.restoreAllMocks()
  if (location.hash) history.replaceState(history.state, "", location.pathname + location.search)
})

////////////////
// ## Rendering
////////////////

describe("<ui-tabs> classes", () => {
  it.each([
    ["", "ui tabs", "ui menu"],
    ["tabular attached", "ui tabular top attached tabs", "ui tabular top attached menu"],
    ['tabular attached="bottom"', "ui tabular bottom attached tabs", "ui tabular bottom attached menu"],
    ["pointing secondary", "ui pointing secondary tabs", "ui pointing secondary menu"],
    ['size="small" color="red" text', "ui small red text tabs", "ui small red text menu"],
    ["vertical tabular fluid", "ui fluid tabular vertical tabs", "ui fluid tabular vertical menu"],
    ["vertical tabular attached", "ui tabular vertical tabs", "ui tabular vertical menu"],
    ["inverted basic", "ui basic inverted tabs", "ui inverted menu"],
    ["compact basic", "ui basic compact tabs", "ui compact menu"],
    ['appearance="segmented" basic', "ui segmented basic tabs", "ui segmented menu"],
    ['appearance="tabular" attached', "ui tabular top attached tabs", "ui tabular top attached menu"],
    [
      'appearance="segmented" alignment="fluid" equal',
      "ui segmented equal fluid aligned tabs",
      "ui segmented equal fluid aligned menu"
    ],
    ['vertical alignment="center"', "ui vertical tabs", "ui vertical menu"]
  ])("<ui-tabs %s>", async (attributes, rootClasses, menuClasses) => {
    const { root, menu } = await tabs(attributes)
    expect(root.className).toBe(rootClasses)
    expect(menu.className).toBe(menuClasses)
  })

  it.each([
    ["", "ui active tab segment"],
    ["tabular attached", "ui active bottom attached tab segment"],
    ['attached="bottom"', "ui active top attached tab segment"],
    ["basic inverted", "ui basic inverted active tab segment"]
  ])("panes of <ui-tabs %s>", async (attributes, classes) => {
    const { panes } = await tabs(attributes)
    expect(boxOf(panes[0]!).className).toBe(classes)
    expect(boxOf(panes[1]!).className).toBe(classes.replace(" active", ""))
  })
})

describe("<ui-tabs> semantics", () => {
  it("renders a named tablist of tab buttons, each controlling its pane;  panes are named tabpanels", async () => {
    const { menu, buttons, panes } = await tabs()
    expect(menu.getAttribute("role")).toBe("tablist")
    expect(menu.getAttribute("aria-label")).toBe("Test")
    expect(menu.hasAttribute("aria-orientation")).toBe(false)
    expect(buttons.map((button) => button.textContent)).toEqual(["First", "Second", "Third"])
    expect(buttons.map((button) => button.getAttribute("aria-selected"))).toEqual(["true", "false", "false"])
    expect(buttons[0]!.className).toBe("active item")
    expect(buttons[0]!.getAttribute("type")).toBe("button")
    expect(buttons[1]!.ariaControlsElements).toEqual([panes[1]])
    expect(panes[0]!.internals.role).toBe("tabpanel")
    expect(panes[0]!.internals.ariaLabel).toBe("First")
    expect(panes[0]!.getAttribute("tabindex")).toBe("0")
    expect(panes[0]!.matches(":state(in-tabs)")).toBe(true)
    expect(shown(panes)).toEqual([0])
    expect(panes[1]!.checkVisibility()).toBe(false)
  })

  it("marks vertical tabs aria-orientation=vertical", async () => {
    const { menu, host } = await tabs("vertical tabular")
    expect(menu.getAttribute("aria-orientation")).toBe("vertical")
    expect(host.matches(":state(vertical)")).toBe(true)
  })

  it("labels a tab by its pane's value, then its index, without a label", async () => {
    const { buttons } = await tabs("", `<ui-tab value="alpha">A</ui-tab><ui-tab>B</ui-tab>`)
    expect(buttons.map((button) => button.textContent)).toEqual(["alpha", "1"])
  })

  it("follows a pane's label change, and panes added or removed", async () => {
    const { host, panes } = await tabs()
    panes[1]!.setAttribute("label", "Deuxième")
    await expect.poll(() => parts(host).buttons[1]!.textContent).toBe("Deuxième")
    const pane = document.createElement("ui-tab")
    pane.setAttribute("label", "Fourth")
    host.append(pane)
    await expect.poll(() => parts(host).buttons.length).toBe(4)
    panes[0]!.remove()
    await expect
      .poll(() => parts(host).buttons.map((button) => button.textContent))
      .toEqual(["Deuxième", "Third", "Fourth"])
    // the selected pane went:  the first remaining one shows
    await expect.poll(() => shown(parts(host).panes)).toEqual([0])
  })

  it("draws a tab icon from the pane's `icon`", async () => {
    const { buttons } = await tabs("", `<ui-tab label="Mail" icon="envelope">Inbox</ui-tab>`)
    await expect.poll(() => buttons[0]!.querySelector("[part~=icon] > svg")).not.toBeNull()
    expect(buttons[0]!.textContent).toBe("Mail")
  })
})

////////////////
// ## Selection
////////////////

describe("<ui-tabs> selection", () => {
  it("starts on the first `selected` (or `active`) pane, else the first enabled one", async () => {
    expect(shown((await tabs("", `<ui-tab>A</ui-tab><ui-tab selected>B</ui-tab>`)).panes)).toEqual([1])
    expect(shown((await tabs("", `<ui-tab>A</ui-tab><ui-tab active>B</ui-tab>`)).panes)).toEqual([1])
    expect(shown((await tabs("", `<ui-tab disabled>A</ui-tab><ui-tab>B</ui-tab>`)).panes)).toEqual([1])
  })

  it("shows the pane `value` names;  follows value writes;  falls back for an unknown value", async () => {
    const { host, panes, buttons } = await tabs('value="third"')
    expect(shown(panes)).toEqual([2])
    expect(buttons[2]!.getAttribute("aria-selected")).toBe("true")
    host.value = "second"
    await expect.poll(() => shown(panes)).toEqual([1])
    host.value = "nope"
    await expect.poll(() => shown(panes)).toEqual([0])
  })

  it("selects on a click:  ui-change first, then `value` (reflected), the pane and its tab", async () => {
    const { host, buttons, panes } = await tabs()
    const seen = changes(host)
    await userEvent.click(buttons[1]!)
    await ElementFixture.tick()
    expect(seen.map(({ value, tab }) => [value, tab])).toEqual([["second", panes[1]]])
    expect(seen[0]!.originalEvent).toBeInstanceOf(MouseEvent)
    expect(host.value).toBe("second")
    expect(host.getAttribute("value")).toBe("second")
    await expect.poll(() => shown(panes)).toEqual([1])
    expect(buttons[1]!.getAttribute("aria-selected")).toBe("true")
    expect(boxOf(panes[1]!).classList.contains("active")).toBe(true)
  })

  it("lets ui-change veto;  ignores a disabled tab and the selected one", async () => {
    const { host, buttons, panes } = await tabs("", PANES.replace(`value="third"`, `value="third" disabled`))
    const seen = changes(host)
    host.addEventListener("ui-change", (event) => event.preventDefault(), { once: true })
    await userEvent.click(buttons[1]!)
    // Playwright won't click an `aria-disabled` element:  a DOM click, as a script or assistive tech would
    buttons[2]!.click()
    await userEvent.click(buttons[0]!)
    await ElementFixture.tick()
    expect(seen).toHaveLength(1)
    expect(shown(panes)).toEqual([0])
    expect(buttons[2]!.getAttribute("aria-disabled")).toBe("true")
    expect(buttons[2]!.className).toBe("disabled item")
  })

  it("select() works as the user's click", async () => {
    const { host, panes } = await tabs()
    const component = host.component as unknown as { select(pane: Element): boolean }
    expect(component.select(panes[2]!)).toBe(true)
    await expect.poll(() => shown(panes)).toEqual([2])
    expect(component.select(panes[2]!)).toBe(false)
  })
})

describe("<ui-tabs> keyboard", () => {
  it("is ONE Tab stop -- the selected tab -- then the pane;  arrows / Home / End select (automatic)", async () => {
    const { host, buttons, panes } = await tabs('value="second"')
    await expect.poll(() => buttons.map((button) => button.getAttribute("tabindex"))).toEqual(["-1", "0", "-1"])
    const before = document.createElement("button")
    before.textContent = "before"
    host.before(before)
    before.focus()
    await Keys.tab()
    expect(focusedTab(host, buttons)).toBe(1)
    await userEvent.keyboard("{ArrowRight}")
    expect(focusedTab(host, buttons)).toBe(2)
    await expect.poll(() => shown(panes)).toEqual([2])
    expect(host.value).toBe("third")
    await userEvent.keyboard("{ArrowRight}")
    expect(focusedTab(host, buttons)).toBe(0)
    await userEvent.keyboard("{End}")
    expect(focusedTab(host, buttons)).toBe(2)
    await userEvent.keyboard("{Home}")
    expect(focusedTab(host, buttons)).toBe(0)
    await expect.poll(() => shown(panes)).toEqual([0])
    await userEvent.keyboard("{ArrowLeft}")
    expect(focusedTab(host, buttons)).toBe(2)
    // Tab leaves the list for the shown pane (a tabpanel Tab stop):  once the selection has moved the pane
    await expect.poll(() => shown(panes)).toEqual([2])
    await Keys.tab()
    expect(document.activeElement).toBe(panes[2])
  })

  it("skips disabled tabs", async () => {
    const { host, buttons } = await tabs("", PANES.replace(`value="second"`, `value="second" disabled`))
    await expect.poll(() => buttons[0]!.getAttribute("tabindex")).toBe("0")
    buttons[0]!.focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(focusedTab(host, buttons)).toBe(2)
  })

  it("moves with ArrowDown / ArrowUp when vertical", async () => {
    const { host, buttons, panes } = await tabs("vertical tabular")
    await expect.poll(() => buttons[0]!.getAttribute("tabindex")).toBe("0")
    buttons[0]!.focus()
    await userEvent.keyboard("{ArrowDown}")
    expect(focusedTab(host, buttons)).toBe(1)
    await expect.poll(() => shown(panes)).toEqual([1])
    await userEvent.keyboard("{ArrowUp}")
    expect(focusedTab(host, buttons)).toBe(0)
  })

  it("manual activation:  arrows only move focus;  Enter / Space select;  the Tab stop returns to the selected tab", async () => {
    const { host, buttons, panes } = await tabs('activation="manual"')
    const seen = changes(host)
    await expect.poll(() => buttons[0]!.getAttribute("tabindex")).toBe("0")
    buttons[0]!.focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(focusedTab(host, buttons)).toBe(1)
    await ElementFixture.tick()
    expect(shown(panes)).toEqual([0])
    expect(seen).toHaveLength(0)
    await userEvent.keyboard("{ArrowRight}")
    await userEvent.keyboard("{Enter}")
    await expect.poll(() => shown(panes)).toEqual([2])
    await userEvent.keyboard("{ArrowLeft}")
    await userEvent.keyboard(" ")
    await expect.poll(() => shown(panes)).toEqual([1])
    await userEvent.keyboard("{ArrowLeft}")
    expect(focusedTab(host, buttons)).toBe(0)
    // focus leaves:  the Tab stop goes back to the selected tab
    buttons[0]!.blur()
    await expect.poll(() => buttons.map((button) => button.getAttribute("tabindex"))).toEqual(["-1", "0", "-1"])
    expect(seen.map(({ value, originalEvent }) => [value, originalEvent?.type])).toEqual([
      ["third", "click"],
      ["second", "click"]
    ])
  })
})

////////////////
// ## History and transitions
////////////////

describe("<ui-tabs> history", () => {
  it("pushes the selected value as the URL hash", async () => {
    const { buttons } = await tabs("history")
    const length = history.length
    await userEvent.click(buttons[1]!)
    expect(location.hash).toBe("#second")
    expect(history.length).toBe(length + 1)
  })

  it("selects the pane a hash change names (Back / Forward, links), and starts on the page's hash", async () => {
    history.replaceState(history.state, "", "#third")
    const { panes } = await tabs("history")
    await expect.poll(() => shown(panes)).toEqual([2])
    location.hash = "#second"
    await expect.poll(() => shown(panes)).toEqual([1])
    location.hash = "#nothing"
    await ElementFixture.tick()
    expect(shown(panes)).toEqual([1])
  })

  it("leaves the hash alone without `history`", async () => {
    const { buttons } = await tabs()
    await userEvent.click(buttons[1]!)
    expect(location.hash).toBe("")
  })
})

describe("<ui-tabs> transitions", () => {
  it("swaps panes inside a View Transition when the browser has them", async () => {
    const { buttons, panes } = await tabs()
    const start = vi.spyOn(document, "startViewTransition")
    vi.spyOn(UI.browser, "isReducedMotion", "get").mockReturnValue(false)
    await userEvent.click(buttons[1]!)
    await expect.poll(() => shown(panes)).toEqual([1])
    expect(start).toHaveBeenCalledTimes(UI.browser.supports.viewTransitions ? 1 : 0)
  })

  it("swaps at once for reduced motion", async () => {
    const { buttons, panes } = await tabs()
    const start = vi.spyOn(document, "startViewTransition")
    vi.spyOn(UI.browser, "isReducedMotion", "get").mockReturnValue(true)
    await userEvent.click(buttons[1]!)
    await ElementFixture.tick()
    expect(shown(panes)).toEqual([1])
    expect(start).not.toHaveBeenCalled()
  })
})

////////////////
// ## Panes
////////////////

describe("<ui-tab>", () => {
  it("fires ui-show each time it becomes the shown pane;  `first` the first time", async () => {
    const shows: [string, boolean][] = []
    document.addEventListener("ui-show", (event) => {
      const { value, first } = (event as CustomEvent<TabShowDetail>).detail
      shows.push([value, first])
    })
    const { buttons } = await tabs()
    await userEvent.click(buttons[1]!)
    await userEvent.click(buttons[0]!)
    await userEvent.click(buttons[1]!)
    await expect
      .poll(() => shows)
      .toEqual([
        ["first", true],
        ["second", true],
        ["first", false],
        ["second", false]
      ])
  })

  it("stamps a lazy pane's <template> the first time it's shown, once", async () => {
    const { host, buttons } = await tabs(
      "",
      `<ui-tab label="A">A</ui-tab><ui-tab label="B" lazy><template><p class="late">Late</p></template></ui-tab>`
    )
    const pane = host.querySelectorAll("ui-tab")[1]!
    expect(pane.querySelector(".late")).toBeNull()
    await userEvent.click(buttons[1]!)
    await expect.poll(() => pane.querySelectorAll(":scope > .late").length).toBe(1)
    await userEvent.click(buttons[0]!)
    await userEvent.click(buttons[1]!)
    await ElementFixture.tick()
    expect(pane.querySelectorAll(":scope > .late")).toHaveLength(1)
  })

  it("stands alone:  shown while `selected`, no tabpanel role", async () => {
    const pane = await ElementFixture.render<DOMElement>(`<ui-tab selected>Alone</ui-tab>`)
    expect(pane.matches(":state(selected)")).toBe(true)
    expect(boxOf(pane).className).toBe("ui active tab segment")
    expect(pane.internals.role).toBeNull()
    expect(pane.hasAttribute("tabindex")).toBe(false)
    pane.removeAttribute("selected")
    await expect.poll(() => pane.checkVisibility()).toBe(false)
  })

  it("shows a loading pane busy, its content hidden", async () => {
    const { panes } = await tabs("", `<ui-tab label="A" loading><p>Content</p></ui-tab>`)
    expect(boxOf(panes[0]!).getAttribute("aria-busy")).toBe("true")
    expect(boxOf(panes[0]!).className).toBe("ui loading active tab segment")
    expect(getComputedStyle(panes[0]!.querySelector("p")!).visibility).toBe("hidden")
  })
})

////////////////
// ## Look
////////////////

describe("<ui-tabs> look", () => {
  it("joins a tabular menu and its panes, and lays vertical tabs out beside the pane", async () => {
    const { menu, panes } = await tabs("tabular attached")
    expect(getComputedStyle(boxOf(panes[0]!)).marginTop).toBe("0px")
    expect(Math.round(boxOf(panes[0]!).getBoundingClientRect().top)).toBe(
      Math.round(menu.getBoundingClientRect().bottom)
    )
    const vertical = await tabs("vertical tabular")
    const pane = boxOf(vertical.panes[0]!).getBoundingClientRect()
    expect(pane.left).toBeGreaterThanOrEqual(vertical.menu.getBoundingClientRect().right - 1)
    expect(Math.round(pane.top)).toBe(Math.round(vertical.menu.getBoundingClientRect().top))
  })

  it("spaces an unattached pane below the menu, and puts a bottom-attached menu below the panes", async () => {
    const { menu, panes } = await tabs("pointing secondary")
    expect(getComputedStyle(boxOf(panes[0]!)).marginTop).toBe("16px")
    const bottom = await tabs('tabular attached="bottom"')
    expect(bottom.menu.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      boxOf(bottom.panes[0]!).getBoundingClientRect().bottom - 1
    )
    expect(menu.getBoundingClientRect().height).toBeGreaterThan(0)
  })

  it.each(["secondary", 'pointing secondary color="red"'])(
    "<ui-tabs %s>:  the panes keep a plain top edge (the set's hue is the tabs')",
    async (attributes) => {
      const { panes } = await tabs(attributes)
      const box = getComputedStyle(boxOf(panes[0]!))
      expect(box.borderTopColor).toBe(box.borderBottomColor)
    }
  )

  it("draws the tabs as menu items:  the tabular active tab joins its pane", async () => {
    const { menu, buttons } = await tabs("tabular attached")
    expect(getComputedStyle(buttons[0]!)).toMatchObject({
      borderTopWidth: "1px",
      marginBottom: "-1px",
      fontFamily: getComputedStyle(menu).fontFamily
    })
    expect(getComputedStyle(buttons[1]!).backgroundColor).toBe("rgba(0, 0, 0, 0)")
  })

  it("vertical tabular:  every tab fills the column, and the active one covers the menu's rule to reach its pane", async () => {
    const { menu, buttons, panes } = await tabs("vertical tabular")
    const edge = menu.getBoundingClientRect().right
    const [active, other] = buttons.map((button) => button.getBoundingClientRect())
    expect(Math.round(active!.right)).toBe(Math.round(edge))
    expect(Math.round(other!.right)).toBe(Math.round(edge - 1))
    expect(Math.round(boxOf(panes[0]!).getBoundingClientRect().left)).toBe(Math.round(edge))
  })
})

describe("<ui-tabs> appearance, alignment, equal", () => {
  it("segmented:  the tab list hugs its tabs, the selected one filled with the primary colour", async () => {
    const { menu, buttons } = await wide('appearance="segmented"')
    expect(menu.getBoundingClientRect().width).toBeLessThan(WIDTH / 2)
    expect(getComputedStyle(buttons[0]!).backgroundColor).toBe(colorOf("var(--ui-primary)"))
    expect(getComputedStyle(buttons[0]!).color).toBe(colorOf("var(--ui-primary-on)"))
    expect(getComputedStyle(buttons[1]!).backgroundColor).not.toBe(colorOf("var(--ui-primary)"))
  })

  it("segmented + alignment=center:  the tab list moves to the middle", async () => {
    const { root, menu } = await wide('appearance="segmented" alignment="center"')
    const outer = root.getBoundingClientRect()
    const bar = menu.getBoundingClientRect()
    expect(Math.abs(bar.left - outer.left - (outer.right - bar.right))).toBeLessThan(2)
  })

  it("equal, packed:  every tab as wide as the widest", async () => {
    const natural = await wide("", UNEVEN)
    const widest = Math.max(...natural.buttons.map((button) => button.getBoundingClientRect().width))
    const { menu, buttons } = await wide("equal", UNEVEN)
    for (const button of buttons) expect(button.getBoundingClientRect().width).toBeCloseTo(widest, -0.5)
    expect(menu.getBoundingClientRect().width).toBeLessThan(WIDTH)
  })

  it('equal + alignment="fluid":  an equal share of the row each, and the tab list keeps its tablist semantics', async () => {
    const { host, menu, buttons } = await wide('appearance="segmented" alignment="fluid" equal', UNEVEN)
    const share = menu.clientWidth / buttons.length
    for (const button of buttons) expect(button.getBoundingClientRect().width).toBeCloseTo(share, -0.5)
    expect(menu.getAttribute("role")).toBe("tablist")
    expect(buttons.map((button) => button.getAttribute("role"))).toEqual(["tab", "tab", "tab"])
    expect(buttons[0]!.getAttribute("aria-selected")).toBe("true")
    await expectAccessible(host)
  })
})

////////////////
// ## Tokens
////////////////

describe("<ui-tabs> tokens from outside", () => {
  /** The first pane's top margin. */
  function margin(host: Element): string {
    return getComputedStyle(boxOf(parts(host).panes[0]!)).marginTop
  }

  it("takes a token set on the DOM element", async () => {
    const { host } = await tabs(`style="--ui-tabs-pane-margin: 2em 0 0"`)
    expect(margin(host)).toBe("32px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-tabs-pane-margin: 2em 0 0"><ui-tabs aria-label="Test">${PANES}</ui-tabs></section>`
    )
    await ElementFixture.tick()
    expect(margin(wrapper.querySelector("ui-tabs")!)).toBe("32px")
  })

  it("takes a token set through `::part(tabs)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(tabs) { --ui-tabs-pane-margin: 2em 0 0 }</style>` +
        `<ui-tabs class="themed" aria-label="Test">${PANES}</ui-tabs></div>`
    )
    await ElementFixture.tick()
    expect(margin(wrapper.querySelector("ui-tabs")!)).toBe("32px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-tabs-pane-margin", "2em 0 0")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-tabs-pane-margin")
    })
    const { host } = await tabs()
    expect(margin(host)).toBe("32px")
  })

  it("passes the tab list's `--ui-menu-*` tokens, set on the tab set, to its tabs", async () => {
    const { buttons } = await tabs(`style="--ui-menu-item-padding: 20px"`)
    expect(getComputedStyle(buttons[1]!).paddingTop).toBe("20px")
  })

  it("variations:  `attached` swaps the margin, winning over the base token", async () => {
    const { host } = await tabs(`tabular attached style="--ui-tabs-pane-margin: 2em 0 0"`)
    expect(margin(host)).toBe("0px")
  })

  it("gives the tab list no block margins of a menu's:  the pane margin alone spaces it (design-system I29)", async () => {
    for (const attributes of ["", "pointing secondary", "text"]) {
      const { menu, panes } = await tabs(attributes)
      const style = getComputedStyle(menu)
      expect([style.marginTop, style.marginBottom], attributes).toEqual(["0px", "0px"])
      expect(boxOf(panes[0]!).getBoundingClientRect().top - menu.getBoundingClientRect().bottom).toBeCloseTo(16, 0)
    }
    const { menu } = await tabs(`style="--ui-tabs-menu-margin: 6px"`)
    expect([getComputedStyle(menu).marginTop, getComputedStyle(menu).marginBottom]).toEqual(["6px", "6px"])
  })

  it("takes the tab list's height and its labels' font, case and tracking from `--ui-menu-*` (design-system I29)", async () => {
    const { menu, buttons } = await tabs(
      `style="--ui-menu-min-height: 0px; --ui-menu-font-family: monospace; --ui-menu-item-transform: uppercase; ` +
        `--ui-menu-item-letter-spacing: 2px; --ui-menu-item-padding: 4px 8px"`
    )
    expect(getComputedStyle(menu).minHeight).toBe("0px")
    expect(Math.round(menu.getBoundingClientRect().height)).toBeLessThan(30)
    expect(getComputedStyle(buttons[0]!)).toMatchObject({
      fontFamily: "monospace",
      textTransform: "uppercase",
      letterSpacing: "2px"
    })
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-tabs> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
  })
})
