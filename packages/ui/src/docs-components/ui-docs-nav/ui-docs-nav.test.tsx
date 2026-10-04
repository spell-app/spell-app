import { flush } from "solid-js"
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from "vitest"

import { expectAccessible } from "$/ui/test/a11y"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { Fixture } from "$/ui/test/fixture"
import type { UIHost } from "$/ui/elements"
import { SiteData, type SiteDataFile, type SiteTag } from "$/ui/docs-components"

import { NavIndex } from "./NavIndex"
import { STORAGE_KEYS } from "./ui-docs-nav.types"
import type { DocsNavHost } from "./DocsNavHost"

import "$/ui/docs-components/ui-docs-nav"

/** Element-markup examples, by path. */
const EXAMPLES = import.meta.glob<string>("/src/docs-components/ui-docs-nav/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A tag of the test data. */
function tag(name: string, tagName: string, topics: string[], extra: Partial<SiteTag> = {}): SiteTag {
  const folder = extra.folder ?? tagName
  return {
    tag: tagName,
    name,
    folder,
    mainTag: folder,
    main: folder === tagName,
    page: folder === tagName,
    href: folder === tagName ? `components/${folder}.html` : `components/${folder}.html#${tagName}`,
    topics,
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

/** A family of the test data. */
function family(folder: string, status: "done" | "in-progress" | "planned" = "done") {
  return { folder, mainTag: folder, title: folder, summary: "", status, docs: false, tags: [folder], tokens: [] }
}

/** The test data:  5 components (one a sub-tag, one in progress), a docs tag, 4 topics (one unused). */
const DATA: SiteDataFile = {
  $comment: "test",
  version: 1,
  topics: [
    { id: "buttons", title: "Buttons" },
    { id: "forms", title: "Forms" },
    { id: "date & time", title: "Date & time" },
    { id: "unused", title: "Unused" }
  ],
  components: [
    tag("Button", "ui-button", ["buttons"]),
    tag("Buttons", "ui-buttons", ["buttons"], { folder: "ui-button" }),
    tag("Calendar", "ui-calendar", ["forms", "date & time"], { aka: ["date picker"] }),
    tag("Input", "ui-input", ["forms"], { aka: ["text field"] }),
    tag("Checkbox", "ui-checkbox", ["forms", "buttons"])
  ],
  docs: [tag("Docs example", "ui-docs-example", ["documentation"])],
  families: {
    "ui-button": family("ui-button"),
    "ui-calendar": family("ui-calendar", "in-progress"),
    "ui-input": family("ui-input"),
    "ui-checkbox": family("ui-checkbox")
  },
  foundation: [],
  themes: []
}

/** A blob URL serving `data` as the site's data file. */
function serve(data: unknown): string {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: "application/json" }))
  onTestFinished(() => URL.revokeObjectURL(url))
  return url
}

beforeEach(() => {
  localStorage.clear()
  // most cases read the A-Z list;  the default (Topics) has its own case
  localStorage.setItem(STORAGE_KEYS.view, "az")
  SiteData.reset(serve(DATA))
})

afterEach(() => {
  localStorage.clear()
  SiteData.reset()
  SiteData.url = undefined
})

/** Render a nav (links under `#/`, so following one only changes the hash), wait for its list. */
async function render(attributes = "", html?: string) {
  const nav = await ElementFixture.render<DocsNavHost>(html ?? `<ui-docs-nav base="#/" ${attributes}></ui-docs-nav>`)
  await nav.listed
  await settle(nav)
  return nav
}

/** Wait for every element in `nav`'s shadow root, then flush. */
async function settle(nav: Element) {
  for (let round = 0; round < 3; round++) {
    const hosts = [...nav.shadowRoot!.querySelectorAll("*")].filter((element): element is UIHost => "ready" in element)
    await Promise.all(hosts.map((host) => host.ready))
    await ElementFixture.tick()
  }
  flush()
}

/** The nav's SHOWN links (none in a shut, `inert` fold), by `data-nav-link`, in order. */
function links(nav: Element, scope = ""): string[] {
  return [...nav.shadowRoot!.querySelectorAll(`${scope} [data-nav-link]`)]
    .filter((link) => !link.closest("[inert]"))
    .map((link) => link.getAttribute("data-nav-link")!)
}

/** The element in `nav`'s shadow root matching `selector`. */
function find<T extends Element = HTMLElement>(nav: Element, selector: string): T {
  const element = nav.shadowRoot!.querySelector<T>(selector)
  if (!element) throw new Error(`no ${selector}`)
  return element
}

/** Type `text` into the search box. */
async function search(nav: Element, text: string) {
  const input = find(nav, "[part~=search]")
  const control = input.shadowRoot!.querySelector("input")!
  control.value = text
  control.dispatchEvent(new Event("input", { bubbles: true, composed: true }))
  await settle(nav)
}

/** Click `nav`'s element matching `selector` (an item's box, a button's `<button>`). */
async function click(nav: Element, selector: string) {
  const element = find(nav, selector)
  const target = element.shadowRoot?.querySelector<HTMLElement>("[part~=item], [part~=button]") ?? element
  target.click()
  await settle(nav)
}

describe("<ui-docs-nav> lists", () => {
  it("lists the top links, every component A-Z (no docs tags), then Foundation", async () => {
    const nav = await render()
    expect(links(nav)).toEqual([
      "index",
      "getting-started",
      "grammar",
      "components",
      "ui-button",
      "ui-buttons",
      "ui-calendar",
      "ui-checkbox",
      "ui-input",
      "theming",
      "utilities",
      "icons",
      "kitchen-sink"
    ])
    const menu = find(nav, "[part~=menu]")
    expect(menu.localName).toBe("nav")
    expect(menu.getAttribute("aria-label")).toBe("Documentation")
    expect(find(nav, "[part~=count]").textContent).toBe("5")
    expect([...nav.shadowRoot!.querySelectorAll(".group .band")].map((band) => band.textContent)).toEqual([
      "Get started",
      "Components5",
      "Foundation"
    ])
  })

  it("is a panel:  the header band (slot, search, view switch) above the scrolling list", async () => {
    const nav = await render("", `<ui-docs-nav base="#/"><b slot="header">Spell UI</b></ui-docs-nav>`)
    const panel = find(nav, "[part~=nav]")
    expect([...panel.children].map((child) => child.getAttribute("part"))).toEqual(["header", "menu"])
    const header = find(nav, "[part~=header]")
    expect(header.querySelector("slot")!.assignedElements()[0]!.textContent).toBe("Spell UI")
    expect(header.querySelector("[part~=search]")).not.toBeNull()
    expect(header.querySelector("[part~=views]")).not.toBeNull()
    expect(getComputedStyle(find(nav, "[part~=menu]")).overflowY).toBe("auto")
  })

  it("links relative to `base`:  a sub-tag to its heading on its family's page", async () => {
    const nav = await render()
    expect(find(nav, '[data-nav-link="index"]').getAttribute("href")).toBe("#/index.html")
    expect(find(nav, '[data-nav-link="ui-button"]').getAttribute("href")).toBe("#/components/ui-button.html")
    expect(find(nav, '[data-nav-link="ui-buttons"]').getAttribute("href")).toBe(
      "#/components/ui-button.html#ui-buttons"
    )
    expect(find(nav, '[data-nav-link="ui-buttons"]').localName).toBe("a")
  })

  it("defaults `base` to the site root above the data file", async () => {
    SiteData.reset("/somewhere/site/_data/components.json")
    expect(SiteData.root()).toBe(`${location.origin}/somewhere/site/`)
  })

  it("badges a family that isn't done", async () => {
    const nav = await render()
    const badge = find(nav, '[data-nav-link="ui-calendar"] .status')
    expect(badge.localName).toBe("ui-label")
    expect(badge.textContent).toBe("in progress")
    expect(nav.shadowRoot!.querySelector('[data-nav-link="ui-input"] .status')).toBeNull()
  })

  it("marks the current component page:  `aria-current=page`, only its main tag;  moves with `current`", async () => {
    const nav = await render(`current="ui-button"`)
    expect(find(nav, '[data-nav-link="ui-button"]').getAttribute("aria-current")).toBe("page")
    expect(find(nav, '[data-nav-link="ui-buttons"]').hasAttribute("aria-current")).toBe(false)
    expect(find(nav, '[data-nav-link="index"]').hasAttribute("aria-current")).toBe(false)
    nav.setAttribute("current", "ui-input")
    await settle(nav)
    expect(find(nav, '[data-nav-link="ui-button"]').hasAttribute("aria-current")).toBe(false)
    expect(find(nav, '[data-nav-link="ui-input"]').getAttribute("aria-current")).toBe("page")
  })

  it("links a sub-tag with its own page there, and marks it current;  a sub-tag on its family page never", async () => {
    const radio = tag("Radio", "ui-radio", ["forms"], {
      folder: "ui-checkbox",
      page: true,
      href: "components/ui-radio.html"
    })
    const pages = { "ui-radio": { title: "Radio", summary: "", status: "planned" as const } }
    SiteData.reset(
      serve({
        ...DATA,
        components: [...DATA.components, radio],
        families: { ...DATA.families, "ui-checkbox": { ...family("ui-checkbox"), pages } }
      })
    )
    const nav = await render(`current="ui-radio"`)
    const row = find(nav, '[data-nav-link="ui-radio"]')
    expect(row.getAttribute("href")).toBe("#/components/ui-radio.html")
    expect(row.getAttribute("aria-current")).toBe("page")
    // its own page's status, not its family's
    expect(find(nav, '[data-nav-link="ui-radio"] .status').textContent).toBe("planned")
    nav.setAttribute("current", "ui-buttons")
    await settle(nav)
    expect(find(nav, '[data-nav-link="ui-buttons"]').hasAttribute("aria-current")).toBe(false)
  })

  it("marks a hand-written page, and shows a load error", async () => {
    const nav = await render(`current="getting-started"`)
    expect(find(nav, '[data-nav-link="getting-started"]').getAttribute("aria-current")).toBe("page")

    SiteData.reset("/no-such-folder/_data/components.json")
    const broken = await render()
    expect(find(broken, "ui-message").getAttribute("header")).toBe("The component list didn't load")
    expect(broken.matches(":state(listed)")).toBe(true)
    expect(links(broken)).toContain("theming")
  })
})

describe("<ui-docs-nav> topics", () => {
  it("starts on Topics when neither the page nor the viewer chose a view", async () => {
    localStorage.removeItem(STORAGE_KEYS.view)
    const nav = await render()
    expect(nav.shadowRoot!.querySelectorAll(".topic")).toHaveLength(3)
  })

  it("groups by topic:  a band per used topic with its count, a tag under each of its topics", async () => {
    const nav = await render(`view="topics"`)
    const toggles = [...nav.shadowRoot!.querySelectorAll(".topic")]
    expect(toggles.map((toggle) => toggle.getAttribute("data-nav-topic"))).toEqual(["buttons", "forms", "date & time"])
    expect(toggles.map((toggle) => toggle.querySelector(".count")!.textContent)).toEqual(["3", "3", "1"])
    expect(toggles[0]!.localName).toBe("button")
    expect(toggles[0]!.parentElement!.localName).toBe("h3")
    expect(toggles[0]!.getAttribute("aria-expanded")).toBe("false")
    expect(links(nav, ".topic-rows")).toEqual([])
  })

  it("opens and closes a topic, remembered", async () => {
    const nav = await render(`view="topics"`)
    await click(nav, '[data-nav-topic="forms"]')
    expect(links(nav, ".topic-rows")).toEqual(["ui-calendar", "ui-checkbox", "ui-input"])
    const toggle = find(nav, '[data-nav-topic="forms"]')
    expect(toggle.getAttribute("aria-expanded")).toBe("true")
    expect(find(nav, `#${toggle.getAttribute("aria-controls")}`).classList.contains("open")).toBe(true)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.openTopics)!)).toEqual(["forms"])

    const again = await render(`view="topics"`)
    expect(links(again, ".topic-rows")).toEqual(["ui-calendar", "ui-checkbox", "ui-input"])
    await click(again, '[data-nav-topic="forms"]')
    expect(links(again, ".topic-rows")).toEqual([])
    expect(localStorage.getItem(STORAGE_KEYS.openTopics)).toBeNull()
  })

  it("opens the current page's first topic, unremembered;  closing it sticks", async () => {
    const nav = await render(`view="topics" current="ui-calendar"`)
    expect(links(nav, ".topic-rows")).toEqual(["ui-calendar", "ui-checkbox", "ui-input"])
    expect(localStorage.getItem(STORAGE_KEYS.openTopics)).toBeNull()
    await click(nav, '[data-nav-topic="forms"]')
    expect(links(nav, ".topic-rows")).toEqual([])
  })

  it("switches views with the A-Z / Topics buttons:  `ui-change`, reflected, remembered", async () => {
    const nav = await render()
    const views: string[] = []
    nav.addEventListener("ui-change", (event) => views.push((event as CustomEvent<{ view: string }>).detail.view))
    const az = find(nav, '[data-nav-view="az"]')
    expect(az.shadowRoot!.querySelector("button")!.getAttribute("aria-pressed")).toBe("true")

    await click(nav, '[data-nav-view="topics"]')
    expect(views).toEqual(["topics"])
    expect(nav.getAttribute("view")).toBe("topics")
    expect(localStorage.getItem(STORAGE_KEYS.view)).toBe("topics")
    expect(nav.shadowRoot!.querySelectorAll(".topic")).toHaveLength(3)
    expect(az.shadowRoot!.querySelector("button")!.getAttribute("aria-pressed")).toBe("false")

    // the pressed button stays pressed
    await click(nav, '[data-nav-view="topics"]')
    expect(views).toEqual(["topics"])
    const topics = find(nav, '[data-nav-view="topics"]')
    expect(topics.shadowRoot!.querySelector("button")!.getAttribute("aria-pressed")).toBe("true")

    nav.remove()
    const again = await render()
    expect(again.shadowRoot!.querySelectorAll(".topic")).toHaveLength(3)
  })
})

describe("<ui-docs-nav> folding groups", () => {
  it("folds a group away from its band:  `aria-expanded`, the fold `inert`, remembered", async () => {
    const nav = await render()
    const band = find(nav, '[data-nav-group="start"]')
    expect(band.parentElement!.localName).toBe("h2")
    expect(band.getAttribute("aria-expanded")).toBe("true")
    await click(nav, '[data-nav-group="start"]')
    expect(band.getAttribute("aria-expanded")).toBe("false")
    expect(find(nav, `#${band.getAttribute("aria-controls")}`).hasAttribute("inert")).toBe(true)
    expect(links(nav)).not.toContain("getting-started")
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.closedGroups)!)).toEqual(["start"])

    const again = await render()
    expect(find(again, '[data-nav-group="start"]').getAttribute("aria-expanded")).toBe("false")
    await click(again, '[data-nav-group="start"]')
    expect(links(again)).toContain("getting-started")
    expect(localStorage.getItem(STORAGE_KEYS.closedGroups)).toBeNull()
  })

  it("opens a folded Components group while searching, unremembered;  clearing folds it again", async () => {
    localStorage.setItem(STORAGE_KEYS.closedGroups, JSON.stringify(["components"]))
    const nav = await render()
    expect(links(nav, ".components")).toEqual([])
    await search(nav, "inp")
    expect(links(nav, ".components")).toEqual(["ui-input"])
    await click(nav, '[data-nav-group="components"]')
    expect(links(nav, ".components")).toEqual([])
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.closedGroups)!)).toEqual(["components"])
    await search(nav, "")
    expect(links(nav, ".components")).toEqual([])
  })

  it("keeps a shut topic's rows until its fold has eased shut (with motion), then drops them", async () => {
    const nav = await render(`view="topics"`)
    await click(nav, '[data-nav-topic="forms"]')
    // let it ease open first (the fold's style computed, its opening finished)
    const fold = find(nav, '[data-nav-fold="forms"]')
    await Promise.all(fold.getAnimations().map((animation) => animation.finished))
    await click(nav, '[data-nav-topic="forms"]')
    expect(links(nav, ".topic-rows")).toEqual([])
    const rendered = () => nav.shadowRoot!.querySelectorAll(".topic-rows [data-nav-link]").length
    if (matchMedia("(prefers-reduced-motion: no-preference)").matches) {
      expect(rendered()).toBe(3)
      expect(fold.hasAttribute("inert")).toBe(true)
    }
    await expect.poll(rendered).toBe(0)
  })

  it("drops a topic shut while it eases open at once:  no `transitionend` comes", async () => {
    const nav = await render(`view="topics"`)
    await click(nav, '[data-nav-topic="forms"]')
    await click(nav, '[data-nav-topic="forms"]')
    await expect.poll(() => nav.shadowRoot!.querySelectorAll(".topic-rows").length).toBe(0)
  })

  it("is `settled` once the list is ready and the current page revealed", async () => {
    const nav = await render(`current="ui-input"`)
    expect(nav.matches(":state(settled)")).toBe(true)
  })
})

describe("<ui-docs-nav> search", () => {
  it.each([
    ["butt", ["ui-button", "ui-buttons", "ui-checkbox"]],
    ["UI-INPUT", ["ui-input"]],
    ["text field", ["ui-input"]],
    ["date time", ["ui-calendar"]],
    ["Date & Time", ["ui-calendar"]]
  ])("matches name, tag, other names and topics:  %j", async (text, tags) => {
    const nav = await render()
    await search(nav, text)
    expect(links(nav, ".components")).toEqual(tags)
    expect(find(nav, "[part~=count]").textContent).toBe(String(tags.length))
    expect(nav.matches(":state(searching)")).toBe(true)
    expect(find(nav, "[role=status]").textContent).toBe(
      tags.length === 1 ? "1 component matches" : `${tags.length} components match`
    )
  })

  it("says when nothing matches, and restores everything when cleared", async () => {
    const nav = await render()
    await search(nav, "zzz")
    expect(links(nav, ".components")).toEqual([])
    expect(nav.matches(":state(empty)")).toBe(true)
    expect(find(nav, ".empty").textContent).toBe("No components match")
    await search(nav, "")
    expect(links(nav, ".components")).toHaveLength(5)
    expect(nav.matches(":state(searching)")).toBe(false)
    expect(find(nav, "[role=status]").textContent).toBe("")
  })

  it("opens every topic with a match while searching;  a toggle closes one for this search only", async () => {
    const nav = await render(`view="topics"`)
    await search(nav, "cal")
    expect([...nav.shadowRoot!.querySelectorAll(".topic")].map((t) => t.getAttribute("data-nav-topic"))).toEqual([
      "forms",
      "date & time"
    ])
    expect(links(nav, ".topic-rows")).toEqual(["ui-calendar", "ui-calendar"])
    await click(nav, '[data-nav-topic="forms"]')
    expect(links(nav, ".topic-rows")).toEqual(["ui-calendar"])
    expect(localStorage.getItem(STORAGE_KEYS.openTopics)).toBeNull()
    await search(nav, "")
    expect(links(nav, ".topic-rows")).toEqual([])
  })

  it("focuses the search box on `/`, unless typing in a field", async () => {
    const nav = await render()
    const field = Fixture.render<HTMLInputElement>(`<input type="text">`)
    field.focus()
    field.dispatchEvent(new KeyboardEvent("keydown", { key: "/", bubbles: true, composed: true }))
    expect(document.activeElement).toBe(field)
    field.blur()
    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "/", bubbles: true, cancelable: true }))
    expect(nav.shadowRoot!.activeElement).toBe(find(nav, "[part~=search]"))
  })
})

describe("<ui-docs-nav> favourites", () => {
  it("stars a component:  Favourites on top, remembered, `ui-favorite`, the star pressed", async () => {
    const nav = await render()
    const events: unknown[] = []
    nav.addEventListener("ui-favorite", (event) => {
      const { tag, favorite, favorites } = (event as CustomEvent).detail
      events.push({ tag, favorite, favorites })
    })
    await click(nav, '[data-nav-star="ui-input"]')
    expect(links(nav, ".favorites")).toEqual(["ui-input"])
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites)!)).toEqual(["ui-input"])
    expect(events).toEqual([{ tag: "ui-input", favorite: true, favorites: ["ui-input"] }])
    expect(nav.favorites).toEqual(["ui-input"])
    const star = find(nav, '.rows:not(.favorites) [data-nav-star="ui-input"]')
    const button = star.shadowRoot!.querySelector("button")!
    expect(button.getAttribute("aria-pressed")).toBe("true")
    expect(button.getAttribute("aria-label")).toBe("Remove Input from favourites")

    // un-starred from Favourites:  the row goes, focus moves to the tag's star below
    await click(nav, '.favorites [data-nav-star="ui-input"]')
    expect(nav.shadowRoot!.querySelector(".favorites")).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.favorites)).toBeNull()
    expect(nav.shadowRoot!.activeElement).toBe(star)
    expect(button.getAttribute("aria-pressed")).toBe("false")
  })

  it("restores stored favourites, dropping unknown tags;  search filters them too", async () => {
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(["ui-input", "ui-gone", "ui-button"]))
    const nav = await render()
    expect(links(nav, ".favorites")).toEqual(["ui-button", "ui-input"])
    await search(nav, "inp")
    expect(links(nav, ".favorites")).toEqual(["ui-input"])
  })

  it("works without storage:  nothing persists, nothing throws", async () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied")
    })
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied")
    })
    onTestFinished(() => {
      getItem.mockRestore()
      setItem.mockRestore()
    })
    const nav = await render(`view="az"`)
    await click(nav, '[data-nav-star="ui-input"]')
    expect(links(nav, ".favorites")).toEqual(["ui-input"])
  })
})

describe("<ui-docs-nav> navigation and scrolling", () => {
  it("fires a cancelable `ui-navigate` for a plain click on a link", async () => {
    const nav = await render()
    const seen: string[] = []
    nav.addEventListener("ui-navigate", (event) => {
      const { page, href } = (event as CustomEvent<{ page: string; href: string }>).detail
      seen.push(`${page} ${new URL(href).hash}`)
      event.preventDefault()
    })
    const before = location.href
    await click(nav, '[data-nav-link="ui-input"]')
    expect(seen).toEqual(["ui-input #/components/ui-input.html"])
    expect(location.href).toBe(before)
  })

  it("scrolls the current page's link into view inside the panel's list, never the page", async () => {
    const page = window.scrollY
    const nav = await render(
      "",
      `<ui-docs-nav base="#/" current="ui-input" style="--ui-docs-nav-height: 260px"></ui-docs-nav>`
    )
    expect(find(nav, "[part~=nav]").getBoundingClientRect().height).toBe(260)
    const box = find(nav, "[part~=menu]")
    expect(box.scrollHeight).toBeGreaterThan(box.clientHeight)
    const item = find(nav, '[data-nav-link="ui-input"]').getBoundingClientRect()
    const port = box.getBoundingClientRect()
    expect(item.top).toBeGreaterThanOrEqual(port.top)
    expect(item.bottom).toBeLessThanOrEqual(port.bottom)
    expect(box.scrollTop).toBeGreaterThan(0)
    expect(window.scrollY).toBe(page)
  })

  it("puts slotted header / footer content in boxes of their own", async () => {
    const nav = await render(
      "",
      `<ui-docs-nav base="#/"><b slot="header">Spell UI</b><i slot="footer">v1</i></ui-docs-nav>`
    )
    const slots = [...nav.shadowRoot!.querySelectorAll<HTMLSlotElement>(".slotted slot")]
    expect(slots.map((slot) => slot.assignedElements()[0]!.textContent)).toEqual(["Spell UI", "v1"])
  })
})

describe("NavIndex", () => {
  it.each([
    ["Date & Time", "datetime"],
    ["date-time", "datetime"],
    ["ui-date", "uidate"],
    ["  Ünïcode ", "unicode"]
  ])("normalizes %j", (text, normalized) => {
    expect(NavIndex.normalize(text)).toBe(normalized)
  })

  it("never matches across two terms", () => {
    const key = NavIndex.key(["Button", "ui-button"])
    expect(NavIndex.matches(key, "button")).toBe(true)
    expect(NavIndex.matches(key, "buttonui")).toBe(false)
    expect(NavIndex.matches(key, "")).toBe(true)
  })

  it("builds rows A-Z and the used topics, in the data's order", () => {
    const index = new NavIndex(DATA)
    expect(index.rows.map((row) => row.tag)).toEqual([
      "ui-button",
      "ui-buttons",
      "ui-calendar",
      "ui-checkbox",
      "ui-input"
    ])
    expect(index.topics.map((topic) => topic.id)).toEqual(["buttons", "forms", "date & time"])
    expect(index.row("ui-calendar")!.status).toBe("in-progress")
    expect(index.row("ui-docs-example")).toBeUndefined()
  })
})

describe("<ui-docs-nav> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    for (const nav of root.querySelectorAll<DocsNavHost>("ui-docs-nav")) {
      await nav.listed
      await settle(nav)
    }
    await expectAccessible(root)
  })

  it("axe passes on the topics view, searching, with a favourite", async () => {
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(["ui-input"]))
    const nav = await render(`view="topics" current="ui-input"`)
    await search(nav, "in")
    await expectAccessible(nav)
  })
})
