import { describe, expect, it, onTestFinished } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"

import type { DOMFormControl } from "$/ui/elements"
import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"

import "$/ui/components/ui-input"
import "$/ui/components/ui-button"
import "$/ui/components/ui-icon"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-input/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A text control's DOM element, with its properties. */
type Input = DOMFormControl & { value: string; rules: unknown; type: string; disabled: boolean }

/** Render one control;  returns the DOM element, its root and its native control. */
async function input(html: string) {
  const host = await ElementFixture.render<Input>(html)
  const root = host.shadowRoot!.querySelector<HTMLElement>("[part~=input]")!
  const control = root.querySelector<HTMLInputElement>("[part~=control]")!
  return { host, root, control }
}

/** Collect `detail`s of `name` events. */
function record(host: Element, name: string) {
  const details: { value: string; originalEvent?: Event }[] = []
  host.addEventListener(name, (event) => details.push((event as CustomEvent).detail))
  return details
}

////////////////
// ## Classes
////////////////

describe("<ui-input> classes", () => {
  it.each([
    ["", "ui input"],
    ['size="small"', "ui small input"],
    ['size="medium"', "ui input"],
    ['state="error"', "ui error input"],
    ['color="teal" type="file"', "ui teal file input"],
    ["transparent fluid inverted", "ui fluid inverted transparent input"],
    ['fluid="yes" transparent="no"', "ui fluid input"],
    ["disabled", "ui disabled input"],
    ['icon="search"', "ui icon input"],
    ['icon="search" icon-position="left"', "ui left icon input"],
    ["loading", "ui loading icon input"],
    ['label="http://"', "ui labeled input"],
    ['labeled="right" label="kg"', "ui right labeled input"],
    ['labeled="corner" label="asterisk"', "ui corner labeled input"],
    [
      'labeled="left corner" label="asterisk" icon="user" icon-position="left"',
      "ui left icon left corner labeled input"
    ],
    ["action", "ui action input"],
    ['action="left"', "ui left action input"]
  ])("<ui-input %s>", async (attributes, classes) => {
    const { root, control } = await input(`<ui-input ${attributes} aria-label="Field"></ui-input>`)
    expect(root.localName).toBe("div")
    expect(root.className).toBe(classes)
    expect(control.localName).toBe("input")
  })

  it("adds `action` / `labeled` for slotted content without the attribute", async () => {
    const { root } = await input(`<ui-input aria-label="Search">
      <span slot="label">$</span><ui-button slot="action">Go</ui-button>
    </ui-input>`)
    expect(root.className).toBe("ui labeled action input")
  })

  it("renders the contract order:  label, control, icon;  action after, left action before", async () => {
    const { root } = await input(`<ui-input label="http://" icon="search" aria-label="Site">
      <ui-button slot="action">Go</ui-button></ui-input>`)
    const order = [...root.children].map((child) => child.getAttribute("part") ?? child.localName)
    expect(order).toEqual(["label", "control", "icon", "slot"])
    expect(root.querySelector("[part~=label]")!.className).toBe("ui label")
    await expect.poll(() => root.querySelector("[part~=icon] svg")).not.toBeNull()
    const { root: left } = await input(
      `<ui-input action="left" aria-label="x"><ui-button slot="action">Go</ui-button></ui-input>`
    )
    expect([...left.children].map((child) => child.localName)).toEqual(["slot", "input"])
  })

  it("draws a corner label from an icon name, hidden from assistive tech", async () => {
    const { root } = await input(`<ui-input labeled="corner" label="asterisk" aria-label="x"></ui-input>`)
    const corner = root.querySelector<HTMLElement>("[part~=label]")!
    expect(corner.className).toBe("ui corner label")
    expect(corner.getAttribute("aria-hidden")).toBe("true")
    await expect.poll(() => corner.querySelector(".icon svg")).not.toBeNull()
  })

  it("passes type and constraints to the native control", async () => {
    const { control, host } = await input(
      `<ui-input type="number" min="1" max="9" step="2" required placeholder="Qty" autocomplete="off"></ui-input>`
    )
    expect(control.type).toBe("number")
    expect([control.min, control.max, control.step, control.required]).toEqual(["1", "9", "2", true])
    expect(control.placeholder).toBe("Qty")
    expect(control.getAttribute("autocomplete")).toBe("off")
    expect(host.type).toBe("number")
  })

  it("sets host states:  disabled, fluid, loading", async () => {
    const { host } = await input(`<ui-input disabled fluid loading aria-label="x"></ui-input>`)
    expect(host.matches(":state(disabled)")).toBe(true)
    expect(host.matches(":state(fluid)")).toBe(true)
    expect(host.matches(":state(loading)")).toBe(true)
  })
})

////////////////
// ## Value
////////////////

describe("<ui-input> value", () => {
  it("starts from the attribute;  the property is live and never reflects", async () => {
    const { host, control } = await input(`<ui-input value="Ada" aria-label="Name"></ui-input>`)
    expect(control.value).toBe("Ada")
    expect(host.value).toBe("Ada")
    host.value = "Grace"
    await ElementFixture.tick()
    expect(control.value).toBe("Grace")
    expect(host.getAttribute("value")).toBe("Ada")
  })

  it("typing dispatches ui-input per keystroke, then ui-change on commit", async () => {
    const { host, control } = await input(`<ui-input aria-label="Name"></ui-input>`)
    const inputs = record(host, "ui-input")
    const changes = record(host, "ui-change")
    await userEvent.type(control, "Ada")
    expect(inputs.map((detail) => detail.value)).toEqual(["A", "Ad", "Ada"])
    expect(inputs[0]!.originalEvent).toBeInstanceOf(Event)
    expect(host.value).toBe("Ada")
    control.blur()
    expect(changes).toEqual([expect.objectContaining({ value: "Ada" })])
  })

  it("keeps the host's value when a ui-input handler re-sets it", async () => {
    const { host, control } = await input(`<ui-input value="x" aria-label="Name"></ui-input>`)
    host.addEventListener("ui-input", () => (host.value = "x"))
    await userEvent.type(control, "y")
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(host.value).toBe("x")
    expect(control.value).toBe("x")
  })

  it("follows a handler that transforms the value", async () => {
    const { host, control } = await input(`<ui-input aria-label="Code"></ui-input>`)
    host.addEventListener("ui-input", (event) => (host.value = (event as CustomEvent).detail.value.toUpperCase()))
    await userEvent.type(control, "ab")
    await ElementFixture.tick()
    expect(host.value).toBe("AB")
    expect(control.value).toBe("AB")
  })
})

////////////////
// ## Forms
////////////////

describe("<ui-input> forms", () => {
  it("submits its value, resets to the attribute, skips a nameless field", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(`<form>
      <ui-input name="first" value="Ada" aria-label="First"></ui-input>
      <ui-input value="none" aria-label="Unnamed"></ui-input>
      <ui-textarea name="bio" value="Hi" aria-label="Bio"></ui-textarea>
    </form>`)
    const [first] = form.querySelectorAll<Input>("ui-input")
    expect([...new FormData(form)]).toEqual([
      ["first", "Ada"],
      ["bio", "Hi"]
    ])
    first!.value = "Grace"
    await ElementFixture.tick()
    expect(new FormData(form).get("first")).toBe("Grace")
    form.reset()
    await ElementFixture.tick()
    expect(first!.value).toBe("Ada")
    expect(new FormData(form).get("first")).toBe("Ada")
  })

  it("is left out when disabled or inside a disabled fieldset;  readonly still submits", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(`<form>
      <fieldset disabled><ui-input name="a" value="1" aria-label="A"></ui-input></fieldset>
      <ui-input name="b" value="2" disabled aria-label="B"></ui-input>
      <ui-input name="c" value="3" readonly aria-label="C"></ui-input>
    </form>`)
    await ElementFixture.tick()
    expect([...new FormData(form)]).toEqual([["c", "3"]])
    const inFieldset = form.querySelector<Input>("ui-input")!
    const control = inFieldset.shadowRoot!.querySelector("input")!
    expect(control.disabled).toBe(true)
    expect(inFieldset.shadowRoot!.querySelector("[part~=input]")!.classList.contains("disabled")).toBe(true)
  })

  it("submits chosen files as File entries", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(
      `<form><ui-input type="file" name="upload" multiple aria-label="Upload"></ui-input></form>`
    )
    const host = form.querySelector<Input>("ui-input")!
    const control = host.shadowRoot!.querySelector("input")!
    const transfer = new DataTransfer()
    transfer.items.add(new File(["a"], "a.txt", { type: "text/plain" }))
    transfer.items.add(new File(["b"], "b.txt", { type: "text/plain" }))
    control.files = transfer.files
    control.dispatchEvent(new Event("change", { bubbles: true }))
    await ElementFixture.tick()
    const files = new FormData(form).getAll("upload") as File[]
    expect(files.map((file) => file.name)).toEqual(["a.txt", "b.txt"])
    form.reset()
    await ElementFixture.tick()
    expect(new FormData(form).has("upload")).toBe(false)
  })

  it("Enter submits the form (implicit submission);  a textarea's Enter types a newline", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(`<form>
      <ui-input name="q" aria-label="Query"></ui-input>
      <ui-textarea name="t" aria-label="Text"></ui-textarea>
    </form>`)
    const submits: SubmitEvent[] = []
    form.addEventListener("submit", (event) => {
      event.preventDefault()
      submits.push(event as SubmitEvent)
    })
    const [inputHost] = form.querySelectorAll<Input>("ui-input")
    await userEvent.type(inputHost!.shadowRoot!.querySelector("input")!, "cats{Enter}")
    expect(submits).toHaveLength(1)
    const textarea = form.querySelector("ui-textarea")!.shadowRoot!.querySelector("textarea")!
    await userEvent.type(textarea, "a{Enter}b")
    expect(submits).toHaveLength(1)
    expect(textarea.value).toBe("a\nb")
  })

  it("Enter clicks the form's default submit button, so its name=value is sent", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(`<form>
      <ui-input name="q" aria-label="Query"></ui-input>
      <button type="submit" name="go" value="yes">Go</button>
    </form>`)
    let submitter: HTMLElement | null = null
    form.addEventListener("submit", (event) => {
      event.preventDefault()
      submitter = (event as SubmitEvent).submitter
    })
    await userEvent.type(form.querySelector("ui-input")!.shadowRoot!.querySelector("input")!, "x{Enter}")
    expect(submitter).toBe(form.querySelector("button"))
  })

  it("numbers (`type=number`, `inputmode` decimal / numeric):  end-aligned tabular figures;  text stays at the start", async () => {
    expect(look((await input(`<ui-input type="number" aria-label="Size"></ui-input>`)).control)).toEqual([
      "end",
      "tabular-nums"
    ])
    const { control: decimal } = await input(
      `<ui-input inputmode="decimal" labeled="right" label="%" aria-label="C"></ui-input>`
    )
    expect(decimal.inputMode).toBe("decimal")
    expect(look(decimal)).toEqual(["end", "tabular-nums"])
    expect(look((await input(`<ui-input aria-label="Name"></ui-input>`)).control)).toEqual(["start", "normal"])
    const { control: optedOut } = await input(
      `<ui-input type="number" style="--ui-input-numeric-align: start" aria-label="Size"></ui-input>`
    )
    expect(look(optedOut)).toEqual(["start", "tabular-nums"])

    /** `control`'s text alignment and number figures. */
    function look(control: HTMLInputElement) {
      const style = getComputedStyle(control)
      return [style.textAlign, style.fontVariantNumeric]
    }
  })

  it("Enter submits through a `<ui-button type=submit>`, with its name=value", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(`<form>
      <ui-input name="q" aria-label="Query"></ui-input>
      <ui-button type="submit" name="go" value="yes">Add</ui-button>
    </form>`)
    const entries: [string, FormDataEntryValue][][] = []
    form.addEventListener("submit", (event) => {
      event.preventDefault()
      entries.push([...new FormData(form)])
    })
    await userEvent.type(form.querySelector("ui-input")!.shadowRoot!.querySelector("input")!, "x{Enter}")
    expect(entries).toEqual([
      [
        ["q", "x"],
        ["go", "yes"]
      ]
    ])
  })
})

////////////////
// ## Validation
////////////////

describe("<ui-input> validation", () => {
  it("merges native constraints into the host's validity", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(`<form>
      <ui-input name="email" type="email" required aria-label="Email"></ui-input>
    </form>`)
    const host = form.querySelector<Input>("ui-input")!
    expect(host.validity.valueMissing).toBe(true)
    expect(host.validationMessage).not.toBe("")
    expect(form.checkValidity()).toBe(false)
    host.value = "not-an-email"
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(host.validity.valueMissing).toBe(false)
    expect(host.validity.typeMismatch).toBe(true)
    host.value = "ada@example.com"
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(host.validity.valid).toBe(true)
    expect(form.checkValidity()).toBe(true)
  })

  it("checks `pattern` against the whole value", async () => {
    const { host } = await input(`<ui-input pattern="[a-z]+" value="abc1" aria-label="Code"></ui-input>`)
    expect(host.validity.patternMismatch).toBe(true)
  })

  it("adds Fomantic `rules` (property):  their flags and prompts", async () => {
    const { host } = await input(`<ui-input value="abc" aria-label="Password"></ui-input>`)
    host.rules = ["minLength[6]", "contains[1]"]
    await ElementFixture.tick()
    expect(host).toMatchObject({
      validity: { tooShort: true, customError: true },
      validationMessage: "Password must be at least 6 characters"
    })
    host.value = "abc123"
    await ElementFixture.tick()
    expect(host.validity.valid).toBe(true)
  })

  it("accepts `rules` as a JSON attribute", async () => {
    const { host } = await input(`<ui-input rules='"email"' value="x" aria-label="Email"></ui-input>`)
    expect(host.validity.typeMismatch).toBe(true)
  })

  it("accepts a shorthand rule string as the attribute or the property (not JSON)", async () => {
    const { host } = await input(`<ui-input rules="email" value="x" aria-label="Email"></ui-input>`)
    expect(host.rules).toBe("email")
    expect(host.validity.typeMismatch).toBe(true)
    host.rules = "minLength[4]"
    await ElementFixture.tick()
    expect(host.rules).toBe("minLength[4]")
    expect(host.validity.tooShort).toBe(true)
  })

  it("shows :state(invalid) only after interaction (:user-invalid semantics)", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(
      `<form><ui-input name="n" required aria-label="Name"></ui-input><button>Go</button></form>`
    )
    const host = form.querySelector<Input>("ui-input")!
    const control = host.shadowRoot!.querySelector("input")!
    expect(host.validity.valid).toBe(false)
    expect(host.matches(":state(invalid)")).toBe(false)
    expect(control.hasAttribute("aria-invalid")).toBe(false)
    expect(form.reportValidity()).toBe(false)
    await ElementFixture.tick()
    expect(host.matches(":state(invalid)")).toBe(true)
    expect(control.getAttribute("aria-invalid")).toBe("true")
    await userEvent.type(control, "Ada")
    await ElementFixture.tick()
    expect(host.matches(":state(invalid)")).toBe(false)
    form.reset()
    await ElementFixture.tick()
    expect(host.matches(":state(invalid)")).toBe(false)
  })

  it("leaving an edited field counts as interaction", async () => {
    const { host, control } = await input(`<ui-input minlength="3" aria-label="Name"></ui-input>`)
    await userEvent.type(control, "ab")
    expect(host.matches(":state(invalid)")).toBe(false)
    await userEvent.tab()
    await ElementFixture.tick()
    expect(host.validity.tooShort).toBe(true)
    expect(host.matches(":state(invalid)")).toBe(true)
  })
})

////////////////
// ## Labels
////////////////

describe("<ui-input> labels", () => {
  it("picks up a <label for> added (or retargeted) AFTER the control:  accessible name and internals.labels", async () => {
    const container = await ElementFixture.render<HTMLDivElement>(`<div><ui-input id="late"></ui-input></div>`)
    const host = container.querySelector<Input>("ui-input")!
    const control = host.shadowRoot!.querySelector("input")!
    await ElementFixture.tick()
    expect(control.getAttribute("aria-label")).toBeNull()
    // nested in an added subtree, as frameworks insert markup
    const row = document.createElement("p")
    row.innerHTML = `<span><label for="late">Late label</label></span>`
    container.prepend(row)
    expect([...host.labels]).toEqual([row.querySelector("label")])
    await expect.poll(() => control.getAttribute("aria-label")).toBe("Late label")
    await expectAccessible(container)
    row.querySelector("label")!.htmlFor = "elsewhere"
    await expect.poll(() => control.getAttribute("aria-label")).toBeNull()
    row.querySelector("label")!.htmlFor = "late"
    await expect.poll(() => control.getAttribute("aria-label")).toBe("Late label")
    row.remove()
    await expect.poll(() => control.getAttribute("aria-label")).toBeNull()
  })

  it("is labelled by <label for> across the shadow boundary (internals.labels)", async () => {
    const container = await ElementFixture.render<HTMLDivElement>(
      `<div><label for="email">E-mail address</label><ui-input id="email" name="email"></ui-input></div>`
    )
    const host = container.querySelector<Input>("ui-input")!
    const control = host.shadowRoot!.querySelector("input")!
    expect([...host.labels]).toEqual([container.querySelector("label")])
    await expect.poll(() => control.getAttribute("aria-label")).toBe("E-mail address")
    container.querySelector("label")!.textContent = "Email"
    await expect.poll(() => control.getAttribute("aria-label")).toBe("Email")
    container.querySelector("label")!.click()
    await expect.poll(() => host.shadowRoot!.activeElement).toBe(control)
    await expectAccessible(container)
  })

  it("takes a wrapping <label>'s text, and the host's aria-label first", async () => {
    const container = await ElementFixture.render<HTMLDivElement>(
      `<div><label>Name <ui-input></ui-input></label><ui-input aria-label="Direct"></ui-input></div>`
    )
    const [wrapped, direct] = container.querySelectorAll<Input>("ui-input")
    await expect.poll(() => wrapped!.shadowRoot!.querySelector("input")!.getAttribute("aria-label")).toBe("Name")
    expect(direct!.shadowRoot!.querySelector("input")!.getAttribute("aria-label")).toBe("Direct")
    direct!.setAttribute("aria-label", "Changed")
    await expect.poll(() => direct!.shadowRoot!.querySelector("input")!.getAttribute("aria-label")).toBe("Changed")
  })

  it("names its validation messages after the label", async () => {
    const container = await ElementFixture.render<HTMLDivElement>(
      `<div><label for="pw">Password</label><ui-input id="pw" value="x"></ui-input></div>`
    )
    const host = container.querySelector<Input>("ui-input")!
    await ElementFixture.tick()
    host.rules = "minLength[4]"
    await expect.poll(() => host.validationMessage).toBe("Password must be at least 4 characters")
  })
})

////////////////
// ## `<ui-textarea>`
////////////////

describe("<ui-textarea>", () => {
  it("renders a native textarea in the input box, with rows", async () => {
    const host = await ElementFixture.render<Input>(
      `<ui-textarea rows="3" state="warning" placeholder="Bio" required></ui-textarea>`
    )
    const root = host.shadowRoot!.querySelector("[part~=input]")!
    expect(root.className).toBe("ui warning input")
    const textarea = root.querySelector("textarea")!
    expect(textarea.rows).toBe(3)
    expect(textarea.required).toBe(true)
    expect(host.validity.valueMissing).toBe(true)
  })
})

////////////////
// ## Tokens from outside
////////////////

describe("<ui-input> tokens from outside", () => {
  /** The native control's top-left radius, which `--ui-input-radius` drives. */
  function radius(host: Element): string {
    return getComputedStyle(host.shadowRoot!.querySelector("[part~=control]")!).borderTopLeftRadius
  }

  it("takes a token set on the HOST", async () => {
    const { host } = await input(`<ui-input style="--ui-input-radius: 12px" aria-label="A"></ui-input>`)
    expect(radius(host)).toBe("12px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-input-radius: 12px"><div><ui-input aria-label="A"></ui-input></div></section>`
    )
    expect(radius(wrapper.querySelector("ui-input")!)).toBe("12px")
  })

  it("takes a token set through `::part(input)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(input) { --ui-input-radius: 12px }</style><ui-input class="themed" aria-label="A"></ui-input></div>`
    )
    expect(radius(wrapper.querySelector("ui-input")!)).toBe("12px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-input-radius", "12px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-input-radius")
    })
    const { host } = await input(`<ui-input aria-label="A"></ui-input>`)
    expect(radius(host)).toBe("12px")
  })

  it("reaches a textarea too", async () => {
    const host = await ElementFixture.render(
      `<ui-textarea style="--ui-input-radius: 12px" aria-label="A"></ui-textarea>`
    )
    expect(radius(host)).toBe("12px")
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-input> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await ElementFixture.tick()
    await expectAccessible(root)
  })
})
