import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"

import { UI } from "$/ui/runtime"
import type { DropdownOptions } from "$/ui/components/components.types"
import { FlagCountry } from "$/ui/components/ui-flag"
import { expectAccessible } from "$/ui/test/a11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"

import "$/ui/components/ui-dropdown"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-dropdown/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A dropdown host with its rich properties. */
type Dropdown = UIHost & { value: unknown; options: DropdownOptions | undefined; open: unknown }

/** Pieces of a rendered dropdown. */
function parts(host: Dropdown) {
  const root = host.shadowRoot!.firstElementChild as HTMLElement
  return {
    root,
    combobox: root.querySelector<HTMLElement>("[role=combobox]")!,
    menu: root.querySelector<HTMLElement>("[role=listbox]")!,
    text: root.querySelector<HTMLElement>("[part~=text]")!,
    rows: () => [...root.querySelectorAll<HTMLElement>("[role=option]")],
    labels: () => [...root.querySelectorAll<HTMLElement>("[part~=label]")].map((label) => label.textContent),
    highlighted: () => root.querySelector<HTMLElement>(".selected.item")?.textContent ?? undefined
  }
}

/** Render a dropdown and return it. */
async function dropdown(html: string) {
  const host = await ElementFixture.render<Dropdown>(html)
  return { host, ...parts(host) }
}

/** Gender selection with two slotted items. */
const GENDER = `<ui-dropdown selection placeholder="Gender" name="gender">
  <ui-item value="male">Male</ui-item><ui-item value="female">Female</ui-item><ui-item value="other">Other</ui-item>
</ui-dropdown>`

/** Collect `detail`s of `name` events. */
function record(host: Element, name: string) {
  const details: unknown[] = []
  host.addEventListener(name, (event) => details.push((event as CustomEvent).detail))
  return details
}

beforeEach(async () => {
  await UI.load()
  // Escape through a keyboard binding rather than `CloseWatcher`, so every test can press it
  UI.overlays.useCloseWatcher = false
})

afterEach(() => UI.overlays.dispose())

describe("<ui-dropdown> markup", () => {
  it("renders the contract:  classes, order, combobox ARIA", async () => {
    const { root, combobox, menu, text } = await dropdown(GENDER)
    expect(root.className).toBe("ui selection dropdown")
    expect([...root.children].map((child) => child.className)).toEqual([
      "trigger",
      "text default",
      "dropdown icon",
      "menu",
      ""
    ])
    expect(text.textContent).toBe("Gender")
    expect(combobox.localName).toBe("button")
    expect(combobox.getAttribute("aria-expanded")).toBe("false")
    expect(combobox.getAttribute("aria-controls")).toBe(menu.id)
    expect(combobox.getAttribute("aria-label")).toBe("Gender")
    expect(menu.getAttribute("popover")).toBe("manual")
  })

  it("renders the `icon` slot inside `.dropdown.icon` only while it is occupied (the caret is `:empty`)", async () => {
    const { host, root } = await dropdown(GENDER)
    const icon = root.querySelector(".dropdown.icon")!
    expect(icon.matches(":empty")).toBe(true)
    expect(getComputedStyle(icon, "::before").content).not.toBe("none")
    const custom = document.createElement("span")
    custom.slot = "icon"
    custom.textContent = "v"
    host.append(custom)
    await expect.poll(() => icon.querySelector("slot")).not.toBeNull()
    expect(icon.matches(":empty")).toBe(false)
    custom.remove()
    await expect.poll(() => icon.matches(":empty")).toBe(true)
  })

  it("draws an option's `flag` as <ui-flag> does:  codes, ZWJ and subdivision flags;  other text as is", async () => {
    const { combobox, rows } = await dropdown(`<ui-dropdown selection>
      <ui-item flag="FR">France</ui-item><ui-item flag="gb-eng">England</ui-item>
      <ui-item flag="rainbow">Pride</ui-item><ui-item flag="atlantis">Atlantis</ui-item>
    </ui-dropdown>`)
    combobox.click()
    await ElementFixture.tick()
    const flags = rows().map((row) => row.querySelector(".flag")!.textContent)
    const country = ["fr", "gb-eng", "rainbow"].map((code) => new FlagCountry(code).emoji)
    expect(flags).toEqual([...country, "atlantis"])
    expect(country.every(Boolean)).toBe(true)
  })

  it("anchors the menu to the root", async () => {
    const { root, menu, combobox } = await dropdown(GENDER)
    const anchor = root.style.getPropertyValue("--_ui-dropdown-anchor")
    expect(anchor).toMatch(/^--ui-dropdown-\d+$/)
    combobox.click()
    await ElementFixture.tick()
    expect(getComputedStyle(root).anchorName).toBe(anchor)
    expect(getComputedStyle(menu).positionAnchor).toBe(anchor)
  })
})

describe("<ui-dropdown> open / close", () => {
  it("opens and closes with clicks, with ui-open / ui-close", async () => {
    const { host, root, menu, combobox, rows } = await dropdown(GENDER)
    const opens = record(host, "ui-open")
    const closes = record(host, "ui-close")
    combobox.click()
    await ElementFixture.tick()
    expect(menu.matches(":popover-open")).toBe(true)
    expect(root.classList.contains("active")).toBe(true)
    expect(host.matches(":state(open)")).toBe(true)
    expect(combobox.getAttribute("aria-expanded")).toBe("true")
    expect(rows().map((row) => row.textContent)).toEqual(["Male", "Female", "Other"])
    expect(opens).toEqual([expect.objectContaining({ open: true })])
    combobox.click()
    await ElementFixture.tick()
    expect(menu.matches(":popover-open")).toBe(false)
    expect(closes).toEqual([expect.objectContaining({ open: false })])
  })

  it("stays closed when ui-open is cancelled", async () => {
    const { host, menu, combobox } = await dropdown(GENDER)
    host.addEventListener("ui-open", (event) => event.preventDefault())
    combobox.click()
    await ElementFixture.tick()
    expect(menu.matches(":popover-open")).toBe(false)
  })

  it("stays open when ui-close is cancelled", async () => {
    const { host, menu, combobox } = await dropdown(GENDER)
    host.addEventListener("ui-close", (event) => event.preventDefault())
    combobox.click()
    await ElementFixture.tick()
    combobox.click()
    await ElementFixture.tick()
    expect(menu.matches(":popover-open")).toBe(true)
  })

  it("opens and closes from the `open` property", async () => {
    const { host, menu } = await dropdown(GENDER)
    host.open = true
    await ElementFixture.tick()
    expect(menu.matches(":popover-open")).toBe(true)
    expect(host.getAttribute("open")).toBe("")
    host.open = false
    await ElementFixture.tick()
    expect(menu.matches(":popover-open")).toBe(false)
  })

  it("closes on an outside click", async () => {
    const { menu, combobox } = await dropdown(GENDER)
    await userEvent.click(combobox)
    await ElementFixture.tick()
    expect(menu.matches(":popover-open")).toBe(true)
    // a real element below the dropdown:  a click at the body's corner can land ON the dropdown (WebKit's layout)
    const outside = await ElementFixture.render(`<p style="margin-top: 200px">Outside</p>`)
    await userEvent.click(outside)
    await ElementFixture.tick()
    expect(menu.matches(":popover-open")).toBe(false)
  })

  it("releases its overlay when removed while open, and takes it back when re-attached (keepAlive)", async () => {
    const { host, combobox } = await dropdown(GENDER)
    combobox.click()
    await ElementFixture.tick()
    expect(UI.overlays.entries).toHaveLength(1)
    const parent = host.parentElement!
    host.remove()
    // `connected` follows a microtask late (the fork's hooks may run inside a Solid render)
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(UI.overlays.entries).toHaveLength(0)
    // `keepAlive`:  the SAME controller, still open, comes back with the element
    parent.append(host)
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(host.matches(":state(open)")).toBe(true)
    expect(UI.overlays.entries).toHaveLength(1)
    host.remove()
    await ElementFixture.tick()
    await ElementFixture.tick()
  })

  it("keeps its state when moved to another container (keepAlive:  no re-render)", async () => {
    const page = await ElementFixture.render(`<main><div>${GENDER}</div><section></section></main>`)
    const host = page.querySelector<Dropdown>("ui-dropdown")!
    const controller = host.controller
    parts(host).combobox.click()
    await ElementFixture.tick()
    const { rows } = parts(host)
    rows()[1]!.click()
    await ElementFixture.tick()
    expect(host.value).toBe("female")
    const button = host.shadowRoot!.querySelector("[role=combobox]")
    page.querySelector("section")!.append(host)
    await ElementFixture.tick()
    expect(host.controller).toBe(controller)
    expect(host.shadowRoot!.querySelector("[role=combobox]")).toBe(button)
    expect(parts(host).text.textContent).toBe("Female")
  })

  it("Escape closes only the top overlay", async () => {
    const { menu, combobox } = await dropdown(GENDER)
    await userEvent.click(combobox)
    await ElementFixture.tick()
    const onDismiss = vi.fn()
    const top = { element: document.createElement("div"), kind: "modal" as const, onDismiss }
    UI.overlays.open(top)
    await userEvent.keyboard("{Escape}")
    await ElementFixture.tick()
    expect(onDismiss).toHaveBeenCalledOnce()
    expect(menu.matches(":popover-open")).toBe(true)
    UI.overlays.close(top)
    combobox.focus()
    await userEvent.keyboard("{Escape}")
    await ElementFixture.tick()
    expect(menu.matches(":popover-open")).toBe(false)
  })
})

describe("<ui-dropdown> keyboard", () => {
  it("opens, navigates and selects (combobox pattern)", async () => {
    const { host, combobox, text, highlighted } = await dropdown(GENDER)
    const changes = record(host, "ui-change")
    combobox.focus()
    await userEvent.keyboard("{ArrowDown}")
    await ElementFixture.tick()
    expect(combobox.getAttribute("aria-expanded")).toBe("true")
    expect(highlighted()).toBe("Male")
    await userEvent.keyboard("{ArrowDown}")
    await ElementFixture.tick()
    expect(highlighted()).toBe("Female")
    const active = combobox.getAttribute("aria-activedescendant")!
    expect(host.shadowRoot!.getElementById(active)!.textContent).toBe("Female")
    await userEvent.keyboard("{End}")
    await ElementFixture.tick()
    expect(highlighted()).toBe("Other")
    await userEvent.keyboard("{Home}")
    await ElementFixture.tick()
    expect(highlighted()).toBe("Male")
    await userEvent.keyboard("{PageDown}")
    await ElementFixture.tick()
    expect(highlighted()).toBe("Other")
    await userEvent.keyboard("{ArrowUp}{Enter}")
    await ElementFixture.tick()
    expect(changes).toEqual([expect.objectContaining({ value: "female" })])
    expect(text.textContent).toBe("Female")
    expect(combobox.getAttribute("aria-expanded")).toBe("false")
    expect(host.value).toBe("female")
  })

  it("Space selects the highlighted option and closes", async () => {
    const { host, combobox, text } = await dropdown(GENDER)
    combobox.focus()
    await userEvent.keyboard("{ArrowDown}{ArrowDown}")
    await ElementFixture.tick()
    await userEvent.keyboard(" ")
    await ElementFixture.tick()
    expect(host.value).toBe("female")
    expect(text.textContent).toBe("Female")
    expect(combobox.getAttribute("aria-expanded")).toBe("false")
  })

  it("type-ahead highlights by text", async () => {
    const { combobox, highlighted } = await dropdown(GENDER)
    combobox.focus()
    await userEvent.keyboard("o")
    await ElementFixture.tick()
    expect(highlighted()).toBe("Other")
    await userEvent.keyboard("{ArrowUp}")
    await new Promise((resolve) => setTimeout(resolve, 600))
    await userEvent.keyboard("f")
    await ElementFixture.tick()
    expect(highlighted()).toBe("Female")
  })
})

describe("<ui-dropdown> search", () => {
  it("filters, marks matches and dispatches ui-search", async () => {
    const { host, combobox, rows } = await dropdown(
      `<ui-dropdown search selection placeholder="Country"></ui-dropdown>`
    )
    host.options = [
      { value: "de", text: "Germany" },
      { value: "fr", text: "France" },
      { value: "gh", text: "Ghana" }
    ]
    const searches = record(host, "ui-search")
    expect(combobox.localName).toBe("input")
    await userEvent.type(combobox, "an")
    await ElementFixture.tick()
    expect(rows().map((row) => row.textContent)).toEqual(["Germany", "France", "Ghana"])
    await userEvent.type(combobox, "a")
    await ElementFixture.tick()
    expect(rows().map((row) => row.textContent)).toEqual(["Ghana"])
    expect(rows()[0]!.querySelector("mark")!.textContent).toBe("ana")
    expect(searches.map((detail) => (detail as { query: string }).query)).toEqual(["a", "an", "ana"])
    await userEvent.keyboard("{Enter}")
    await ElementFixture.tick()
    expect(host.value).toBe("gh")
    expect((combobox as HTMLInputElement).value).toBe("")
  })

  it("shows the no-results message", async () => {
    const { host, combobox, root } = await dropdown(
      `<ui-dropdown search selection no-results-text="Nada"></ui-dropdown>`
    )
    host.options = [{ value: "a", text: "Alpha" }]
    await userEvent.type(combobox, "zz")
    await ElementFixture.tick()
    expect(root.querySelector(".message")!.textContent).toBe("Nada")
  })

  it("adds new values with allow-additions", async () => {
    const { host, combobox, rows, labels } = await dropdown(
      `<ui-dropdown search multiple selection allow-additions placeholder="Tags"><ui-item>React</ui-item></ui-dropdown>`
    )
    const adds = record(host, "ui-add")
    await userEvent.type(combobox, "Svelte")
    await ElementFixture.tick()
    expect(rows()[0]!.textContent).toBe("Add Svelte")
    await userEvent.keyboard("{Enter}")
    await ElementFixture.tick()
    expect(adds).toEqual([expect.objectContaining({ value: "Svelte" })])
    expect(host.value).toEqual(["Svelte"])
    expect(labels()).toEqual(["Svelte"])
  })
})

describe("<ui-dropdown> multiple", () => {
  const SKILLS = `<ui-dropdown multiple search selection placeholder="Skills" name="skills" value="css">
    <ui-item value="angular">Angular</ui-item><ui-item value="css">CSS</ui-item><ui-item value="html">HTML</ui-item>
  </ui-dropdown>`

  it("adds and removes labels, with ui-add / ui-remove", async () => {
    const { host, combobox, rows, labels, root } = await dropdown(SKILLS)
    const adds = record(host, "ui-add")
    const removes = record(host, "ui-remove")
    expect(labels()).toEqual(["CSS"])
    combobox.focus()
    combobox.click()
    await ElementFixture.tick()
    expect(rows().map((row) => row.textContent)).toEqual(["Angular", "HTML"])
    rows()[1]!.click()
    await ElementFixture.tick()
    expect(labels()).toEqual(["CSS", "HTML"])
    expect(adds).toEqual([expect.objectContaining({ value: "html" })])
    root.querySelector<HTMLElement>("[part~=label] .delete")!.click()
    await ElementFixture.tick()
    expect(labels()).toEqual(["HTML"])
    expect(removes).toEqual([expect.objectContaining({ value: "css" })])
    expect(host.value).toEqual(["html"])
  })

  it("Backspace in an empty search removes the last label", async () => {
    const { host, combobox, labels } = await dropdown(SKILLS)
    combobox.focus()
    await userEvent.keyboard("{Backspace}")
    await ElementFixture.tick()
    expect(labels()).toEqual([])
    expect(host.value).toEqual([])
  })

  it("respects max-selections", async () => {
    const { host, combobox, rows, labels } = await dropdown(SKILLS.replace("multiple", 'multiple max-selections="1"'))
    combobox.click()
    await ElementFixture.tick()
    rows()[0]!.click()
    await ElementFixture.tick()
    expect(labels()).toEqual(["CSS"])
    expect(host.value).toBe("css")
  })
})

describe("<ui-dropdown> value", () => {
  it("takes a slotted item's `selected`, or its alias `active`, as the value", async () => {
    const { host, text } = await dropdown(GENDER.replace('value="female"', 'value="female" active'))
    await ElementFixture.settle(host)
    expect(text.textContent).toBe("Female")
  })

  it('reads a slotted item\'s bare `icon="true"` as no glyph name, before and after the item upgrades', async () => {
    const { host } = await dropdown(
      `<ui-dropdown selection placeholder="Pick"><ui-item value="a" icon="true">A</ui-item></ui-dropdown>`
    )
    const controller = host.controller as unknown as { items: { entries(): readonly { icon?: unknown }[] } }
    expect(controller.items.entries()[0]!.icon).toBeUndefined()
    await ElementFixture.settle(host)
    expect(controller.items.entries()[0]!.icon).toBeUndefined()
  })

  it("clears with the clear button", async () => {
    const { host, root, text } = await dropdown(GENDER.replace("selection", 'clearable selection value="male"'))
    expect(text.textContent).toBe("Male")
    root.querySelector<HTMLElement>("[part~=clear]")!.click()
    await ElementFixture.tick()
    expect(host.value).toBe("")
    expect(text.textContent).toBe("Gender")
  })

  it("follows the host's `value` property", async () => {
    const { host, text } = await dropdown(GENDER)
    host.value = "other"
    await ElementFixture.tick()
    expect(text.textContent).toBe("Other")
  })

  it("reverts when the host re-sets the old value in its ui-change handler", async () => {
    const { host, combobox, rows, text } = await dropdown(GENDER)
    host.value = "male"
    await ElementFixture.tick()
    const changes = record(host, "ui-change")
    host.addEventListener("ui-change", () => (host.value = "male"))
    combobox.click()
    await ElementFixture.tick()
    rows()[1]!.click()
    await ElementFixture.tick()
    expect(changes).toEqual([expect.objectContaining({ value: "female" })])
    expect(host.value).toBe("male")
    expect(text.textContent).toBe("Male")
  })

  it("keeps an `options` property set before upgrade", async () => {
    const container = document.createElement("div")
    container.innerHTML = `<ui-late-dropdown selection placeholder="Late"></ui-late-dropdown>`
    const late = container.firstElementChild as Dropdown
    late.options = [{ value: "a", text: "Alpha" }]
    late.value = "a"
    const { UIDropdown } = await import("$/ui/components/ui-dropdown")
    UIDropdown.define("ui-late-dropdown")
    document.body.append(container)
    await ElementFixture.settle(container)
    expect(parts(late).text.textContent).toBe("Alpha")
    container.remove()
  })
})

describe("<ui-dropdown> forms", () => {
  it("submits one entry per value, validates `required`, resets", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(`<form>
      <ui-dropdown multiple selection name="skills" value="a,b" placeholder="Skills">
        <ui-item value="a">A</ui-item><ui-item value="b">B</ui-item><ui-item value="c">C</ui-item>
      </ui-dropdown>
      <ui-dropdown selection name="size" required placeholder="Size"><ui-item value="s">S</ui-item></ui-dropdown>
    </form>`)
    const [skills, size] = form.querySelectorAll<Dropdown>("ui-dropdown")
    expect(new FormData(form).getAll("skills")).toEqual(["a", "b"])
    expect(new FormData(form).has("size")).toBe(false)
    expect(form.checkValidity()).toBe(false)
    expect(size!.matches(":state(invalid)")).toBe(true)
    expect((size as unknown as { validity: ValidityState }).validity.valueMissing).toBe(true)
    size!.value = "s"
    skills!.value = ["c"]
    await ElementFixture.tick()
    expect(form.checkValidity()).toBe(true)
    expect(size!.matches(":state(invalid)")).toBe(false)
    expect([...new FormData(form)]).toEqual([
      ["skills", "c"],
      ["size", "s"]
    ])
    form.reset()
    await ElementFixture.tick()
    expect(new FormData(form).getAll("skills")).toEqual(["a", "b"])
  })

  it("is left out of the form when disabled by a fieldset", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(`<form><fieldset disabled>
      <ui-dropdown selection name="size" value="s" placeholder="Size"><ui-item value="s">S</ui-item></ui-dropdown>
    </fieldset></form>`)
    await ElementFixture.tick()
    const host = form.querySelector<Dropdown>("ui-dropdown")!
    expect(new FormData(form).has("size")).toBe(false)
    expect(parts(host).root.classList.contains("disabled")).toBe(true)
  })
})

describe("<ui-dropdown> tokens from outside", () => {
  /** A selection box's top-left radius, which `--ui-dropdown-radius` drives. */
  function radius(host: Element): string {
    return getComputedStyle(parts(host as Dropdown).root).borderTopLeftRadius
  }

  it("takes a token set on the HOST", async () => {
    const { host } = await dropdown(GENDER.replace("<ui-dropdown", `<ui-dropdown style="--ui-dropdown-radius: 12px"`))
    expect(radius(host)).toBe("12px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-dropdown-radius: 12px"><div>${GENDER}</div></section>`
    )
    expect(radius(wrapper.querySelector("ui-dropdown")!)).toBe("12px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-dropdown-radius", "12px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-dropdown-radius")
    })
    const { host } = await dropdown(GENDER)
    expect(radius(host)).toBe("12px")
  })

  it("variations:  `floating` swaps the menu shadow for its own token", async () => {
    const shadow = (host: Dropdown) => getComputedStyle(parts(host).menu).boxShadow
    const { host: plain } = await dropdown(
      GENDER.replace("<ui-dropdown", `<ui-dropdown style="--ui-dropdown-menu-shadow: none"`)
    )
    expect(shadow(plain)).toBe("none")
    const { host: floating } = await dropdown(
      GENDER.replace("<ui-dropdown", `<ui-dropdown floating style="--ui-dropdown-menu-shadow: none"`)
    )
    expect(shadow(floating)).not.toBe("none")
    const { host: themed } = await dropdown(
      GENDER.replace("<ui-dropdown", `<ui-dropdown floating style="--ui-dropdown-floating-shadow: none"`)
    )
    expect(shadow(themed)).toBe("none")
  })
})

describe("<ui-dropdown> multiple search", () => {
  it("hides the placeholder text once a value's chip is shown (it drew over the chip)", async () => {
    const { host } = await dropdown(
      `<ui-dropdown multiple search selection placeholder="Skills" value="a"><ui-item value="a">Ember</ui-item><ui-item value="b">Meteor</ui-item></ui-dropdown>`
    )
    const text = host.shadowRoot!.querySelector<HTMLElement>(".text")!
    expect(getComputedStyle(text).display).toBe("none")
  })
})

describe("<ui-dropdown> menu placement", () => {
  it("a dropdown below the first screenful, scrolled into view, opens its menu downwards (webkit measured an absolute popover against the origin screenful)", async () => {
    await ElementFixture.render(
      `<div style="height: ${innerHeight + 200}px"></div>${GENDER}<div style="height: 600px"></div>`
    )
    const host = document.querySelector<Dropdown>("ui-dropdown")!
    const { menu } = parts(host)
    // WebKit resets the page scroll once, shortly after the previous tests (focused dropdowns, now removed):
    // let that pass before scrolling
    await new Promise((resolve) => setTimeout(resolve, 100))
    host.scrollIntoView({ block: "center" })
    host.open = true
    await ElementFixture.tick()
    await new Promise((resolve) => setTimeout(resolve, 300))
    expect(menu.getBoundingClientRect().top).toBeGreaterThan(host.getBoundingClientRect().bottom - 1)
  })
})

describe("<ui-dropdown> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await ElementFixture.tick()
    await expectAccessible(root)
  })
})

describe("<ui-dropdown> invoker commands", () => {
  const NATIVE = "commandForElement" in HTMLButtonElement.prototype

  /** Render a dropdown `d` with `attrs`, and buttons that command it. */
  async function commanded(attrs = "") {
    const wrapper = await ElementFixture.render<HTMLElement>(
      `<div><ui-dropdown id="d" selection ${attrs}>
         <ui-item value="a">Alpha</ui-item><ui-item value="b">Beta</ui-item></ui-dropdown>
       <button id="show" commandfor="d" command="--show">Show</button>
       <button id="flip" commandfor="d" command="--toggle">Flip</button>
       <button id="hide" commandfor="d" command="--close">Hide</button></div>`
    )
    const host = wrapper.querySelector<Dropdown>("ui-dropdown")!
    await ElementFixture.tick()
    return { wrapper, host, ...parts(host) }
  }

  it.skipIf(!NATIVE)("native buttons:  --show opens the menu (a cancelable ui-open) and focuses it", async () => {
    const { host, wrapper, menu, combobox } = await commanded()
    const opens = record(host, "ui-open")
    wrapper.querySelector<HTMLButtonElement>("#show")!.click()
    await ElementFixture.tick()
    expect(opens).toHaveLength(1)
    expect(host.open).toBe(true)
    expect(menu.matches(":popover-open")).toBe(true)
    expect(host.shadowRoot!.activeElement).toBe(combobox)
  })

  it.skipIf(!NATIVE)("native buttons:  --close closes, --toggle flips, a veto keeps it", async () => {
    const { host, wrapper } = await commanded()
    const press = (id: string) => wrapper.querySelector<HTMLButtonElement>(`#${id}`)!.click()
    const closes = record(host, "ui-close")
    press("show")
    await ElementFixture.tick()
    expect(host.open).toBe(true)
    press("hide")
    await ElementFixture.tick()
    expect(host.open).toBe(false)
    expect(closes).toHaveLength(1)
    press("flip")
    await ElementFixture.tick()
    expect(host.open).toBe(true)
    host.addEventListener("ui-close", (event) => event.preventDefault())
    press("flip")
    await ElementFixture.tick()
    expect(host.open).toBe(true)
  })

  it.skipIf(!NATIVE)(
    "a REAL click on --toggle closes an open menu (the blur it causes doesn't close + reopen)",
    async () => {
      const { host, wrapper } = await commanded()
      await userEvent.click(wrapper.querySelector("#show")!)
      await ElementFixture.tick()
      expect(host.open).toBe(true)
      await userEvent.click(wrapper.querySelector("#flip")!)
      await ElementFixture.tick()
      expect(host.open).toBe(false)
      await userEvent.click(wrapper.querySelector("#flip")!)
      await ElementFixture.tick()
      expect(host.open).toBe(true)
    }
  )

  it.skipIf(!NATIVE)("a disabled or read-only dropdown ignores commands", async () => {
    for (const attrs of ["disabled", "readonly"]) {
      const { host, wrapper } = await commanded(attrs)
      const opens = record(host, "ui-open")
      wrapper.querySelector<HTMLButtonElement>("#show")!.click()
      wrapper.querySelector<HTMLButtonElement>("#flip")!.click()
      await ElementFixture.tick()
      expect(host.open).toBe(false)
      expect(opens).toHaveLength(0)
    }
  })

  it("the `Invoker.run()` fallback of a <ui-button> (no native invokers) opens it;  a plain event closes it", async () => {
    await UI.load()
    const supports = UI.browser.supports
    const was = supports.invokers
    supports.invokers = false
    try {
      await import("$/ui/components/ui-button")
      const wrapper = await ElementFixture.render<HTMLElement>(
        `<div><ui-dropdown id="d" selection><ui-item value="a">Alpha</ui-item></ui-dropdown>
         <ui-button id="flip" commandfor="d" command="--toggle">Flip</ui-button></div>`
      )
      const host = wrapper.querySelector<Dropdown>("ui-dropdown")!
      await ElementFixture.tick()
      const flip = wrapper.querySelector<HTMLElement>("#flip")!.shadowRoot!.querySelector<HTMLButtonElement>("button")!
      flip.click()
      await ElementFixture.tick()
      expect(host.open).toBe(true)
      host.dispatchEvent(Object.assign(new Event("command", { cancelable: true }), { command: "--close" }))
      await ElementFixture.tick()
      expect(host.open).toBe(false)
    } finally {
      supports.invokers = was
    }
  })
})
