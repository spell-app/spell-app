import { flush } from "solid-js"
import { afterEach, beforeEach, describe, expect, it, onTestFinished } from "vite-plus/test"

import { expectAccessible } from "$/ui/test/A11y"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { Fixture } from "$/ui/test/Fixture"
import type { DOMElement } from "$/ui/elements"
import { DATA, PAGE, SEARCH } from "$/ui/test/docsSearch.fixtures"
import { SiteData } from "$/ui/docs-components"

import { SearchData } from "./SearchData"
import type { DOMDocsSearchElement } from "./UIDocsSearch"

import "$/ui/docs-components/ui-docs-search"
import "$/ui/components/ui-flyout"

////////////////
// ## Fixtures
////////////////

/** Element-markup examples, by path. */
const EXAMPLES = import.meta.glob<string>("/src/docs-components/ui-docs-search/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

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

////////////////
// ## Helpers
////////////////

/** Render the page and a field reading it (links under `#/`). */
async function render(attributes = "") {
  const page = Fixture.render(PAGE)
  const field = await ElementFixture.render<DOMDocsSearchElement>(
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
      (element): element is DOMElement => "ready" in element
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

////////////////
// ## Finding
////////////////

describe("<ui-docs-search>", () => {
  it("is a pill:  a labelled combobox, the shortcut hint, the card shut", async () => {
    const { field } = await render()
    const control = input(field)
    expect(
      Object.fromEntries(
        ["role", "aria-label", "aria-expanded", "placeholder", "aria-keyshortcuts"].map((name) => [
          name,
          control.getAttribute(name)
        ])
      )
    ).toEqual({
      role: "combobox",
      "aria-label": "Search the docs",
      "aria-expanded": "false",
      placeholder: "Search",
      "aria-keyshortcuts": "/ Meta+K Control+K"
    })
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
    expect({
      mark: first.querySelector("mark")!.textContent,
      code: first.querySelector("code")!.textContent,
      href: first.getAttribute("href")
    }).toEqual({ mark: "Or", code: "<ui-or>", href: "#/components/ui-button.html#ui-or" })
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

////////////////
// ## Keyboard and shortcuts
////////////////

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
    const flyout = await ElementFixture.render<DOMElement>(
      `<ui-flyout aria-label="Menu"><ui-docs-search base="#/"></ui-docs-search></ui-flyout>`
    )
    const field = flyout.querySelector<DOMDocsSearchElement>("ui-docs-search")!
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

////////////////
// ## Data
////////////////

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

////////////////
// ## Accessibility
////////////////

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
