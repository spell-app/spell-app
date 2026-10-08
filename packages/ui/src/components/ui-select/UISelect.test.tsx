import { beforeEach, describe, expect, it, onTestFinished } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"

import { UI } from "$/ui/runtime"
import type { SelectOptions } from "$/ui/components/components.types"
import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { DOMElement } from "$/ui/elements"

import "$/ui/components/ui-select"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-select/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** Customizable `<select>` (`appearance: base-select`) drawn?  Chromium only so far. */
const BASE_SELECT = (await UI.load()).browser.supports.baseSelect

/** A select's DOM element, with its rich properties. */
type Select = DOMElement & { value: unknown; options: SelectOptions | undefined }

/** Render a select and return it with its native `<select>`. */
async function select(html: string) {
  const host = await ElementFixture.render<Select>(html)
  const native = () => host.shadowRoot!.querySelector("select")!
  return {
    host,
    native,
    texts: () => [...native().options].map((option) => option.text.trim()),
    shown: () => native().selectedOptions[0]?.text.trim()
  }
}

/** Gender select with three slotted items. */
const GENDER = `<ui-select placeholder="Gender" name="gender">
  <ui-item value="male">Male</ui-item><ui-item value="female">Female</ui-item><ui-item value="other">Other</ui-item>
</ui-select>`

/** Collect `detail`s of `name` events. */
function record(host: Element, name: string) {
  const details: unknown[] = []
  host.addEventListener(name, (event) => details.push((event as CustomEvent).detail))
  return details
}

/** Choose `values` in `native` as a user would, firing `input` + `change`. */
function choose(native: HTMLSelectElement, ...values: string[]) {
  for (const option of native.options) option.selected = values.includes(option.value)
  native.dispatchEvent(new Event("input", { bubbles: true }))
  native.dispatchEvent(new Event("change", { bubbles: true }))
}

beforeEach(async () => {
  await UI.load()
})

////////////////
// ## Rendering
////////////////

describe("<ui-select> markup", () => {
  it("renders a native select in the class grammar, the placeholder first", async () => {
    const { host, native, texts, shown } = await select(GENDER)
    expect(native().className).toBe("ui select")
    expect(native().getAttribute("part")).toBe("select")
    expect(native().getAttribute("aria-label")).toBe("Gender")
    expect(texts()).toEqual(["Gender", "Male", "Female", "Other"])
    expect(shown()).toBe("Gender")
    expect(native().options[0]!.className).toBe("placeholder")
    expect(host.matches(":state(customizable)")).toBe(BASE_SELECT)
  })

  // customizable select (`appearance: base-select`):  Chromium only so far, flagged by `BASE_SELECT`
  it.skipIf(!BASE_SELECT)("draws the customizable select's button, with the chosen option's content", async () => {
    const { host, native } = await select(GENDER.replace("<ui-select", `<ui-select value="female"`))
    const button = native().querySelector(":scope > button")!
    expect(button.getAttribute("part")).toBe("button")
    expect(button.querySelector("selectedcontent")).not.toBeNull()
    await expect.poll(() => button.textContent).toContain("Female")
    expect(getComputedStyle(native()).appearance).toBe("base-select")
    host.setAttribute("size", "large")
    host.setAttribute("state", "error")
    host.setAttribute("fluid", "")
    await ElementFixture.tick()
    expect(native().className).toBe("ui large error fluid select")
    expect(host.matches(":state(fluid)")).toBe(true)
  })

  it("renders a plain select without the customizable one:  no button, every option keeps its text", async () => {
    const supports = UI.browser.supports as { baseSelect: boolean }
    const before = supports.baseSelect
    supports.baseSelect = false
    onTestFinished(() => void (supports.baseSelect = before))
    const { host, native, texts } = await select(`<ui-select placeholder="Country">
      <ui-item value="fr" flag="fr" description="EU">France</ui-item><ui-item value="jp" icon="sun">Japan</ui-item>
    </ui-select>`)
    expect(native().querySelector("button")).toBeNull()
    expect(host.matches(":state(customizable)")).toBe(false)
    expect(texts()).toEqual(["Country", "🇫🇷France EU", "Japan"])
  })

  it("builds groups from header items and an <hr> from a divider", async () => {
    const { native } = await select(`<ui-select placeholder="Food">
      <ui-item type="header">Fruit</ui-item><ui-item value="apple">Apple</ui-item><ui-item value="pear">Pear</ui-item>
      <ui-item type="divider"></ui-item><ui-item value="none" disabled>Nothing</ui-item>
    </ui-select>`)
    const group = native().querySelector("optgroup")!
    expect(group.label).toBe("Fruit")
    expect(group.getAttribute("part")).toBe("group")
    expect([...group.querySelectorAll("option")].map((option) => option.value)).toEqual(["apple", "pear"])
    expect(native().querySelector(":scope > hr.divider")).not.toBeNull()
    const none = native().querySelector<HTMLOptionElement>(":scope > option[value=none]")!
    expect(none.disabled).toBe(true)
  })

  it("renders icons, images, flags and descriptions inside options", async () => {
    const { native } = await select(`<ui-select aria-label="Pick">
      <ui-item value="a" icon="sun" description="bright">Sun</ui-item>
      <ui-item value="b" image="data:image/gif;base64,R0lGODlhAQABAAAAACw=">Dot</ui-item>
      <ui-item value="c" flag="fr">France</ui-item>
    </ui-select>`)
    const [, sun, dot, france] = native().options
    expect(sun!.querySelector(".icon")!.getAttribute("aria-hidden")).toBe("true")
    await expect.poll(() => sun!.querySelector(".icon svg")).not.toBeNull()
    expect(sun!.querySelector(".description")!.textContent).toBe("bright")
    expect(dot!.querySelector("img.image")!.getAttribute("alt")).toBe("")
    expect(france!.querySelector(".flag")!.textContent).toBe("🇫🇷")
  })

  it("adds the `options` property after slotted items", async () => {
    const { host, texts } = await select(`<ui-select placeholder="Pick"><ui-item value="a">A</ui-item></ui-select>`)
    host.options = [
      { value: "b", text: "Bee" },
      { value: "c", text: "Sea" }
    ]
    await ElementFixture.tick()
    expect(texts()).toEqual(["Pick", "A", "Bee", "Sea"])
  })

  it("is named by a <label for>", async () => {
    const page = await ElementFixture.render(
      `<div><label for="fruit">Favourite fruit</label><ui-select id="fruit"><ui-item>Apple</ui-item></ui-select></div>`
    )
    const native = page.querySelector("ui-select")!.shadowRoot!.querySelector("select")!
    await expect.poll(() => native.getAttribute("aria-label")).toBe("Favourite fruit")
  })
})

////////////////
// ## Behaviour
////////////////

describe("<ui-select> value", () => {
  it("starts from the attribute, else from a `selected` item", async () => {
    const fromAttribute = await select(GENDER.replace("<ui-select", `<ui-select value="other"`))
    expect(fromAttribute.shown()).toBe("Other")
    const fromItem = await select(
      `<ui-select aria-label="x"><ui-item>A</ui-item><ui-item selected>B</ui-item></ui-select>`
    )
    expect(fromItem.shown()).toBe("B")
    expect(fromItem.host.value).toBeUndefined()
  })

  it("dispatches ui-change and sets `value` when the user chooses", async () => {
    const { host, native, shown } = await select(GENDER)
    const changes = record(host, "ui-change")
    choose(native(), "female")
    await ElementFixture.tick()
    expect(changes).toEqual([expect.objectContaining({ value: "female", originalEvent: expect.any(Event) })])
    expect(host.value).toBe("female")
    expect(host.getAttribute("value")).toBe("female")
    expect(shown()).toBe("Female")
  })

  it("follows the host's `value` property", async () => {
    const { host, shown } = await select(GENDER)
    host.value = "other"
    await ElementFixture.tick()
    expect(shown()).toBe("Other")
    host.value = ""
    await ElementFixture.tick()
    expect(shown()).toBe("Gender")
  })

  it("reverts when the host re-sets the old value in its ui-change handler", async () => {
    const { host, native, shown } = await select(GENDER)
    host.value = "male"
    await ElementFixture.tick()
    host.addEventListener("ui-change", () => (host.value = "male"))
    choose(native(), "other")
    await ElementFixture.tick()
    expect(host.value).toBe("male")
    expect(shown()).toBe("Male")
  })

  it("keeps an `options` property set before upgrade", async () => {
    const container = document.createElement("div")
    container.innerHTML = `<ui-late-select placeholder="Late"></ui-late-select>`
    const late = container.firstElementChild as Select
    late.options = [{ value: "a", text: "Alpha" }]
    late.value = "a"
    const { UISelect } = await import("$/ui/components/ui-select")
    UISelect.define("ui-late-select")
    document.body.append(container)
    await ElementFixture.settle(container)
    expect(late.shadowRoot!.querySelector("select")!.selectedOptions[0]!.text).toBe("Alpha")
    container.remove()
  })
})

describe("<ui-select> keyboard", () => {
  it.skipIf(!BASE_SELECT)(
    "opens the customizable picker, moves and chooses with the keys (the browser's own pattern)",
    async () => {
      const { host, native, shown } = await select(GENDER)
      const changes = record(host, "ui-change")
      native().focus()
      await userEvent.keyboard("{ArrowDown}")
      await expect.poll(() => native().matches(":open")).toBe(true)
      await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}")
      await ElementFixture.tick()
      expect(native().matches(":open")).toBe(false)
      expect(changes).toEqual([expect.objectContaining({ value: "female" })])
      expect(host.value).toBe("female")
      expect(shown()).toBe("Female")
      await userEvent.keyboard("{ArrowDown}")
      await expect.poll(() => native().matches(":open")).toBe(true)
      await userEvent.keyboard("{Escape}")
      await expect.poll(() => native().matches(":open")).toBe(false)
      expect(host.value).toBe("female")
    }
  )

  it("focuses the select through the host (`delegatesFocus`)", async () => {
    const { host, native } = await select(GENDER)
    host.focus()
    expect(host.shadowRoot!.activeElement).toBe(native())
  })
})

describe("<ui-select> multiple", () => {
  const SKILLS = `<ui-select multiple name="skills" aria-label="Skills" value="css">
    <ui-item value="angular">Angular</ui-item><ui-item value="css">CSS</ui-item><ui-item value="html">HTML</ui-item>
  </ui-select>`

  it("is a list box with no placeholder, and changes as a set", async () => {
    const { host, native } = await select(SKILLS)
    expect(native().multiple).toBe(true)
    expect(native().className).toBe("ui multiple select")
    expect(native().querySelector("button, option.placeholder")).toBeNull()
    expect(getComputedStyle(native()).appearance).not.toBe("base-select")
    expect([...native().selectedOptions].map((option) => option.value)).toEqual(["css"])
    const changes = record(host, "ui-change")
    choose(native(), "angular", "html")
    await ElementFixture.tick()
    expect(changes).toEqual([expect.objectContaining({ value: ["angular", "html"] })])
    expect(host.value).toEqual(["angular", "html"])
  })
})

////////////////
// ## Forms
////////////////

describe("<ui-select> forms", () => {
  it("submits one entry per value, validates `required`, resets", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(`<form>
      <ui-select multiple name="skills" value="a,b" aria-label="Skills">
        <ui-item value="a">A</ui-item><ui-item value="b">B</ui-item><ui-item value="c">C</ui-item>
      </ui-select>
      <ui-select name="size" required placeholder="Size"><ui-item value="s">S</ui-item></ui-select>
    </form>`)
    const [skills, size] = form.querySelectorAll<Select>("ui-select")
    expect(new FormData(form).getAll("skills")).toEqual(["a", "b"])
    expect(new FormData(form).has("size")).toBe(false)
    expect(form.checkValidity()).toBe(false)
    expect(size!.matches(":state(invalid)")).toBe(true)
    expect((size as unknown as { validity: ValidityState }).validity.valueMissing).toBe(true)
    const placeholder = size!.shadowRoot!.querySelector<HTMLOptionElement>("option.placeholder")!
    expect(placeholder.disabled).toBe(true)
    choose(size!.shadowRoot!.querySelector("select")!, "s")
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
    expect(new FormData(form).has("size")).toBe(false)
    expect(size!.shadowRoot!.querySelector("select")!.selectedOptions[0]!.text).toBe("Size")
  })

  it("is left out of the form when disabled by a fieldset", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(`<form><fieldset disabled>
      <ui-select name="size" value="s" aria-label="Size"><ui-item value="s">S</ui-item></ui-select>
    </fieldset></form>`)
    await ElementFixture.tick()
    const host = form.querySelector<Select>("ui-select")!
    const native = host.shadowRoot!.querySelector("select")!
    expect(new FormData(form).has("size")).toBe(false)
    expect(native.disabled).toBe(true)
    expect(native.classList.contains("disabled")).toBe(true)
    expect(host.matches(":state(disabled)")).toBe(true)
  })
})

////////////////
// ## Tokens
////////////////

describe("<ui-select> tokens from outside", () => {
  /** The native select's top-left radius, which `--ui-select-radius` drives. */
  function radius(host: Element): string {
    return getComputedStyle(host.shadowRoot!.querySelector("select")!).borderTopLeftRadius
  }

  it("takes a token set on the HOST", async () => {
    const { host } = await select(`<ui-select style="--ui-select-radius: 12px" placeholder="A"></ui-select>`)
    expect(radius(host)).toBe("12px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-select-radius: 12px"><div><ui-select placeholder="A"></ui-select></div></section>`
    )
    expect(radius(wrapper.querySelector("ui-select")!)).toBe("12px")
  })

  it("takes a token set through `::part(select)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(select) { --ui-select-radius: 12px }</style><ui-select class="themed" placeholder="A"></ui-select></div>`
    )
    expect(radius(wrapper.querySelector("ui-select")!)).toBe("12px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-select-radius", "12px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-select-radius")
    })
    const { host } = await select(`<ui-select placeholder="A"></ui-select>`)
    expect(radius(host)).toBe("12px")
  })

  it("variations:  a form state swaps the border colour", async () => {
    const red = "rgb(255, 0, 0)"
    const border = (host: Element) => getComputedStyle(host.shadowRoot!.querySelector("select")!).borderTopColor
    const { host: plain } = await select(`<ui-select style="--ui-select-border-color: ${red}"></ui-select>`)
    expect(border(plain)).toBe(red)
    const { host: error } = await select(
      `<ui-select state="error" style="--ui-select-border-color: ${red}"></ui-select>`
    )
    expect(border(error)).not.toBe(red)
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-select> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await ElementFixture.tick()
    await expectAccessible(root)
  })
})
