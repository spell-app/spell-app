import { describe, expect, it, onTestFinished } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"

import type {
  FormFailureDetail,
  FormInvalidDetail,
  FormRules,
  FormSuccessDetail,
  FormValues
} from "$/ui/components/components.types"
import { expectAccessible } from "$/ui/test/a11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { Viewport } from "$/ui/test/viewport"

import "$/ui/components/ui-form"
import "$/ui/components/ui-input"
import "$/ui/components/ui-checkbox"
import "$/ui/components/ui-dropdown"
import "$/ui/components/ui-button"
import "$/ui/components/ui-message"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-form/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A `<ui-form>` host with its API. */
type Form = HTMLElement & {
  rules: FormRules | undefined
  values: FormValues
  nativeForm: HTMLFormElement | null
  validate(): boolean
  isValid(): boolean
  reset(): void
  clear(): void
}

/** A text control host. */
type Control = HTMLElement & { value: unknown; selected?: boolean; focus(): void }

/** Render a form;  returns the `<ui-form>`, its native form and root. */
async function form(html: string) {
  const first = await ElementFixture.render<HTMLElement>(html)
  const host = (first.localName === "ui-form" ? first : first.querySelector("ui-form")!) as Form
  await ElementFixture.tick()
  const native = host.querySelector("form") ?? host.closest("form")!
  const root = host.shadowRoot!.querySelector<HTMLElement>("[part~=form]")!
  return { host, native, root }
}

/** The inline prompt a field shows, or `null`. */
function prompt(field: Element): string | null {
  const label = field.shadowRoot!.querySelector("[part~=prompt]")
  return label ? [...label.querySelectorAll(".message")].map((line) => line.textContent).join(" | ") : null
}

/** Wait for the form's deferred (blur / change) validation. */
function later() {
  return new Promise((resolve) => setTimeout(resolve, 10))
}

/** Collect `detail`s of `name` events. */
function record<T>(host: Element, name: string) {
  const details: T[] = []
  host.addEventListener(name, (event) => details.push((event as CustomEvent).detail))
  return details
}

/** A sign-up form with every kind of control. */
const SIGN_UP = `<ui-form>
  <form>
    <ui-fields widths="2">
      <ui-field required>
        <label for="su-name">Name</label>
        <ui-input id="su-name" name="name"></ui-input>
      </ui-field>
      <ui-field>
        <label for="su-email">E-mail</label>
        <ui-input id="su-email" name="email" type="email"></ui-input>
      </ui-field>
    </ui-fields>
    <ui-field>
      <label for="su-password">Password</label>
      <ui-input id="su-password" name="password" type="password"></ui-input>
    </ui-field>
    <ui-field>
      <label for="su-confirm">Confirm</label>
      <ui-input id="su-confirm" name="confirm" type="password"></ui-input>
    </ui-field>
    <ui-field><ui-checkbox name="terms">I agree to the terms</ui-checkbox></ui-field>
    <ui-message state="error" header="Please fix the fields"></ui-message>
    <ui-button type="submit">Sign up</ui-button>
  </form>
</ui-form>`

/** Rules for `SIGN_UP`, every shape. */
const SIGN_UP_RULES: FormRules = {
  name: "empty",
  email: ["notEmpty", "email"],
  password: { rules: [{ type: "minLength[6]", prompt: "Your password must be at least {ruleValue} characters" }] },
  confirm: "match[password]",
  terms: "checked"
}

/** Set a `ui-*` control's value and let it settle. */
async function set(control: Element | null, value: unknown) {
  const host = control as Control
  if ("checkable" in host) host.selected = !!value
  else host.value = value
  await ElementFixture.tick()
  await ElementFixture.tick()
}

describe("<ui-form> classes", () => {
  it.each([
    ["", "ui form"],
    ['size="large"', "ui large form"],
    ['size="medium"', "ui form"],
    ['state="warning"', "ui warning form"],
    ["equal-width inverted", "ui equal width inverted form"],
    ['loading disabled="no" unstackable="yes"', "ui loading unstackable form"]
  ])("<ui-form %s>", async (attributes, classes) => {
    const { root } = await form(`<ui-form ${attributes}><form></form></ui-form>`)
    expect(root.className).toBe(classes)
  })

  it.each([
    ["", "field"],
    ['state="error" inline required', "error inline required field"],
    ['width="4"', "four wide field"],
    ['width="1/2"', "eight wide field"],
    ['width="25%" disabled', "disabled four wide field"]
  ])("<ui-field %s>", async (attributes, classes) => {
    const host = await ElementFixture.render(`<ui-field ${attributes}></ui-field>`)
    expect(host.shadowRoot!.querySelector("[part~=field]")!.className).toBe(classes)
    expect(host.matches(":state(field)")).toBe(true)
  })

  it.each([
    ["", "fields"],
    ['widths="2"', "two fields"],
    ['widths="equal"', "equal width fields"],
    ["inline required", "inline required fields"],
    ['grouped state="info" unstackable', "info grouped unstackable fields"]
  ])("<ui-fields %s>", async (attributes, classes) => {
    const host = await ElementFixture.render(`<ui-fields ${attributes}></ui-fields>`)
    expect(host.shadowRoot!.querySelector("[part~=fields]")!.className).toBe(classes)
  })

  it("sets host states:  loading, disabled, the form states", async () => {
    const { host } = await form(`<ui-form loading state="success"><form></form></ui-form>`)
    expect(host.matches(":state(loading)")).toBe(true)
    expect(host.matches(":state(success)")).toBe(true)
  })
})

describe("<ui-form> layout", () => {
  it("shares a row:  `widths` halves, `width` quarters, equal width fills", async () => {
    const { host } = await form(`<div style="width: 800px"><ui-form><form>
      <ui-fields widths="2"><ui-field>A</ui-field><ui-field>B</ui-field></ui-fields>
      <ui-fields><ui-field width="4">C</ui-field><ui-field width="12">D</ui-field></ui-fields>
      <ui-fields widths="equal"><ui-field>E</ui-field><ui-field>F</ui-field><ui-field>G</ui-field></ui-fields>
    </form></ui-form></div>`)
    const widths = [...host.querySelectorAll("ui-field")].map(
      (field) => field.shadowRoot!.querySelector("[part~=field]")!.getBoundingClientRect().width
    )
    const [a, b, c, d, e, f, g] = widths as [number, number, number, number, number, number, number]
    expect(a).toBeCloseTo(b, 0)
    expect(a + b).toBeGreaterThan(790)
    expect(d / c).toBeCloseTo(3, 1)
    expect(e).toBeCloseTo(f, 0)
    expect(e).toBeCloseTo(g, 0)
    expect(e + f + g).toBeGreaterThan(790)
  })

  it("stacks rows on a narrow form, not an unstackable one", async () => {
    const { host } = await form(`<div style="width: 400px"><ui-form><form>
      <ui-fields widths="2"><ui-field>A</ui-field><ui-field>B</ui-field></ui-fields>
      <ui-fields widths="2" unstackable><ui-field>C</ui-field><ui-field>D</ui-field></ui-fields>
    </form></ui-form></div>`)
    const [a, b, c, d] = [...host.querySelectorAll("ui-field")].map((field) =>
      field.shadowRoot!.querySelector("[part~=field]")!.getBoundingClientRect()
    )
    expect(b!.top).toBeGreaterThan(a!.top)
    expect(c!.top).toBe(d!.top)
  })

  it('`stack-with="page"` stacks rows by the SCREEN;  the token too, and the attribute beats it', async () => {
    const row = `<ui-fields widths="2"><ui-field>A</ui-field><ui-field>B</ui-field></ui-fields>`
    const wrapper = await ElementFixture.render<HTMLElement>(
      `<div style="width: 500px"><ui-form stack-with="page"><form>${row}</form></ui-form>` +
        `<div style="--ui-stack-with: page"><ui-form><form>${row}</form></ui-form>` +
        `<ui-form stack-with="container"><form>${row}</form></ui-form></div></div>`
    )
    const forms = [...wrapper.querySelectorAll("ui-form")]
    expect(forms[0]!.shadowRoot!.querySelector("[part~=form]")!.className).toBe("ui form stack-with-page")
    /** Whether `host`'s row is stacked. */
    const stacked = (host: Element) => {
      const [a, b] = [...host.querySelectorAll("ui-field")].map((field) =>
        field.shadowRoot!.querySelector("[part~=field]")!.getBoundingClientRect()
      )
      return b!.top > a!.top
    }
    await Viewport.resize(1200)
    await expect.poll(() => forms.map(stacked)).toEqual([false, false, true])
    await Viewport.resize(500)
    await expect.poll(() => forms.map(stacked)).toEqual([true, true, true])
  })

  it("makes its controls fill the field", async () => {
    const { host } = await form(`<div style="width: 600px"><ui-form><form>
      <ui-field><label for="l-a">A</label><ui-input id="l-a"></ui-input></ui-field>
    </form></ui-form></div>`)
    const input = host.querySelector("ui-input")!.shadowRoot!.querySelector("input")!
    expect(input.getBoundingClientRect().width).toBeGreaterThan(590)
  })

  it("shows only the messages of its state", async () => {
    const { host } = await form(`<ui-form state="success"><form>
      <ui-message state="success">Yay</ui-message><ui-message state="error">Nay</ui-message><ui-message>Plain</ui-message>
    </form></ui-form>`)
    const [success, error, plain] = host.querySelectorAll("ui-message")
    expect(getComputedStyle(success!).display).toBe("contents")
    expect(getComputedStyle(error!).display).toBe("none")
    expect(getComputedStyle(plain!).display).toBe("contents")
  })
})

describe("<ui-fields equal>", () => {
  it('is Fomantic\'s `equal width fields`:  an equal share of the row each, as `widths="equal"`', async () => {
    const { host } = await form(
      `<div style="width: 900px"><ui-form><form><ui-fields equal>` +
        `<ui-field><label for="eq-a">A</label><ui-input id="eq-a"></ui-input></ui-field>` +
        `<ui-field><label for="eq-b">B</label><ui-input id="eq-b"></ui-input></ui-field>` +
        `<ui-field><label for="eq-c">C</label><ui-input id="eq-c"></ui-input></ui-field>` +
        `</ui-fields></form></ui-form></div>`
    )
    const fields = host.querySelector<HTMLElement>("ui-fields")!
    expect(fields.shadowRoot!.querySelector("[part~=fields]")!.className).toBe("equal width fields")
    const widths = [...fields.querySelectorAll("ui-field")].map((field) =>
      Math.round(field.shadowRoot!.firstElementChild!.getBoundingClientRect().width)
    )
    expect(new Set(widths).size).toBe(1)
    expect(widths[0]).toBeGreaterThan(250)
  })
})

describe("<ui-form> tokens from outside", () => {
  /** A row of two fields (in a form) whose row margin `--ui-form-gutter` drives. */
  const ROW = `<ui-fields><ui-field>A</ui-field><ui-field>B</ui-field></ui-fields>`

  /** The first row's start margin:  minus half the gutter. */
  function rowMargin(host: Element): string {
    return getComputedStyle(host.querySelector("ui-fields")!.shadowRoot!.querySelector("[part~=fields]")!).marginLeft
  }

  it("takes a token set on the HOST, and hands it to its rows (an owner token)", async () => {
    const { host } = await form(`<ui-form style="--ui-form-gutter: 40px"><form>${ROW}</form></ui-form>`)
    expect(rowMargin(host)).toBe("-20px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const { host } = await form(
      `<section style="--ui-form-gutter: 40px"><ui-form><form>${ROW}</form></ui-form></section>`
    )
    expect(rowMargin(host)).toBe("-20px")
  })

  it("takes a token set through `::part(form)`", async () => {
    const { host } = await form(
      `<div><style>.themed::part(form) { --ui-form-gutter: 40px }</style><ui-form class="themed"><form>${ROW}</form></ui-form></div>`
    )
    expect(rowMargin(host)).toBe("-20px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-form-gutter", "40px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-form-gutter")
    })
    const { host } = await form(`<ui-form><form>${ROW}</form></ui-form>`)
    expect(rowMargin(host)).toBe("-20px")
  })

  it("keeps its defaults when nothing is set;  a row outside a form reads the public token", async () => {
    const { host } = await form(`<ui-form><form>${ROW}</form></ui-form>`)
    expect(rowMargin(host)).toBe("-8px")
    const alone = await ElementFixture.render(`<div style="--ui-form-gutter: 40px">${ROW}</div>`)
    expect(rowMargin(alone)).toBe("-20px")
  })

  it("variations:  `inverted` swaps the label colour for its own token", async () => {
    const red = "rgb(255, 0, 0)"
    const label = (host: Element) => getComputedStyle(host.querySelector("label")!).color
    const field = `<form><ui-field><label for="t-a">A</label><ui-input id="t-a"></ui-input></ui-field></form>`
    const { host: plain } = await form(`<ui-form style="--ui-form-label-color: ${red}">${field}</ui-form>`)
    expect(label(plain)).toBe(red)
    const { host: inverted } = await form(`<ui-form inverted style="--ui-form-label-color: ${red}">${field}</ui-form>`)
    expect(label(inverted)).not.toBe(red)
    const { host: themed } = await form(
      `<ui-form inverted style="--ui-form-inverted-label-color: ${red}">${field}</ui-form>`
    )
    expect(label(themed)).toBe(red)
  })
})

describe("<ui-form> native form", () => {
  it("works with a <form> inside it or around it, and turns its bubbles off", async () => {
    const inside = await form(`<ui-form><form></form></ui-form>`)
    expect(inside.host.nativeForm).toBe(inside.native)
    expect(inside.native.noValidate).toBe(true)
    const around = await ElementFixture.render<HTMLFormElement>(`<form><ui-form></ui-form></form>`)
    await ElementFixture.tick()
    const host = around.querySelector<Form>("ui-form")!
    expect(host.nativeForm).toBe(around)
    expect(around.noValidate).toBe(true)
    host.remove()
    await ElementFixture.tick()
    expect(around.noValidate).toBe(false)
  })

  it("submits every control type through the native form (FormData)", async () => {
    const { native } = await form(`<ui-form><form>
      <ui-input name="text" value="Ada"></ui-input>
      <ui-textarea name="bio" value="Hello"></ui-textarea>
      <ui-checkbox name="terms" selected>Terms</ui-checkbox>
      <ui-checkbox name="spam">Spam</ui-checkbox>
      <ui-radio name="plan" value="free">Free</ui-radio><ui-radio name="plan" value="pro" selected>Pro</ui-radio>
      <ui-dropdown name="size" value="m" selection><ui-item value="m">M</ui-item></ui-dropdown>
      <ui-dropdown name="tags" value="a,b" multiple selection><ui-item value="a">A</ui-item><ui-item value="b">B</ui-item></ui-dropdown>
      <input name="native" value="plain" aria-label="Native">
      <select name="pick" aria-label="Pick"><option value="x">X</option><option value="y" selected>Y</option></select>
      <ui-button type="submit" name="go" value="1">Go</ui-button>
    </form></ui-form>`)
    const submitted: [string, FormDataEntryValue][][] = []
    native.addEventListener("submit", (event) => {
      event.preventDefault()
      submitted.push([...new FormData(native, (event as SubmitEvent).submitter)])
    })
    native.querySelector("ui-button")!.shadowRoot!.querySelector("button")!.click()
    await ElementFixture.tick()
    const expected = [
      ["text", "Ada"],
      ["bio", "Hello"],
      ["terms", "on"],
      ["plan", "pro"],
      ["size", "m"],
      ["tags", "a"],
      ["tags", "b"],
      ["native", "plain"],
      ["pick", "y"]
    ]
    expect(submitted).toHaveLength(1)
    expect(submitted[0]!.filter(([name]) => name !== "go")).toEqual(expected)
    expect([...new FormData(native)]).toEqual(expected)
  })
})

describe("<ui-form> values", () => {
  it("reads Fomantic's shapes:  booleans, lists, the chosen radio", async () => {
    const { host } = await form(`<ui-form><form>
      <ui-input name="name" value="Ada"></ui-input>
      <ui-checkbox name="terms" selected>Terms</ui-checkbox>
      <ui-checkbox name="news" value="weekly">News</ui-checkbox>
      <ui-checkbox name="topics" value="a" selected>A</ui-checkbox><ui-checkbox name="topics" value="b" selected>B</ui-checkbox>
      <ui-radio name="plan" value="free">Free</ui-radio><ui-radio name="plan" value="pro" selected>Pro</ui-radio>
      <ui-dropdown name="tags" value="x,y" multiple selection><ui-item value="x">X</ui-item><ui-item value="y">Y</ui-item></ui-dropdown>
      <input id="nameless" value="by id" aria-label="Nameless">
    </form></ui-form>`)
    expect(host.values).toEqual({
      name: "Ada",
      terms: true,
      news: false,
      topics: ["a", "b"],
      plan: "pro",
      tags: ["x", "y"],
      nameless: "by id"
    })
  })
})

describe("<ui-form> validation", () => {
  it("blocks an invalid submit:  prompts, aria-invalid, error state and message, ui-failure, focus", async () => {
    const { host, native } = await form(SIGN_UP)
    host.rules = SIGN_UP_RULES
    const failures = record<FormFailureDetail>(host, "ui-failure")
    const invalid = record<FormInvalidDetail>(host, "ui-invalid")
    let pageSubmits = 0
    native.addEventListener("submit", () => pageSubmits++)
    const message = host.querySelector("ui-message")!
    expect(getComputedStyle(message).display).toBe("none")
    const [password] = [native.querySelector<Control>("[name=password]")]
    await set(password, "abc")
    const submit = new SubmitEvent("submit", { cancelable: true })
    native.dispatchEvent(submit)
    await ElementFixture.tick()
    expect(submit.defaultPrevented).toBe(true)
    expect(pageSubmits).toBe(0)
    expect(failures).toHaveLength(1)
    expect(failures[0]!.errors).toEqual({
      name: ["Name must have a value"],
      email: ["E-mail must have a value", "E-mail must be a valid e-mail"],
      password: ["Your password must be at least 6 characters"],
      confirm: ["Confirm must match Password field"],
      terms: ["I agree to the terms must be checked"]
    })
    expect(failures[0]!.values.password).toBe("abc")
    expect(invalid.map((detail) => detail.field)).toEqual(["name", "email", "password", "confirm", "terms"])
    const fields = [...native.querySelectorAll("ui-field")]
    expect(prompt(fields[0]!)).toBe("Name must have a value")
    expect(prompt(fields[1]!)).toBe("E-mail must have a value | E-mail must be a valid e-mail")
    expect(fields[0]!.shadowRoot!.querySelector("[part~=prompt]")!.className).toBe("ui basic pointing prompt label")
    expect(fields[0]!.shadowRoot!.querySelector("[part~=field]")!.classList.contains("error")).toBe(true)
    expect(fields[0]!.matches(":state(error)")).toBe(true)
    expect(native.querySelector("[name=name]")!.getAttribute("aria-invalid")).toBe("true")
    expect(host.matches(":state(error)")).toBe(true)
    expect(host.shadowRoot!.querySelector("[part~=form]")!.className).toBe("ui error form")
    expect(getComputedStyle(message).display).toBe("contents")
    expect(document.activeElement).toBe(native.querySelector("[name=name]"))
  })

  it("passes a valid submit on to the page, with ui-success;  cancelling it stops the submission", async () => {
    const { host, native } = await form(SIGN_UP)
    host.rules = SIGN_UP_RULES
    await set(native.querySelector("[name=name]"), "Ada")
    await set(native.querySelector("[name=email]"), "ada@example.com")
    await set(native.querySelector("[name=password]"), "secret1")
    await set(native.querySelector("[name=confirm]"), "secret1")
    await set(native.querySelector("[name=terms]"), true)
    const successes = record<FormSuccessDetail>(host, "ui-success")
    let pageSubmits = 0
    native.addEventListener("submit", (event) => {
      pageSubmits++
      event.preventDefault()
    })
    expect(host.isValid()).toBe(true)
    native.requestSubmit()
    expect(pageSubmits).toBe(1)
    expect(successes).toHaveLength(1)
    expect(successes[0]!.values).toEqual(expect.objectContaining({ name: "Ada", terms: true }))
    host.addEventListener("ui-success", (event) => event.preventDefault())
    const submit = new SubmitEvent("submit", { cancelable: true })
    native.dispatchEvent(submit)
    expect(submit.defaultPrevented).toBe(true)
  })

  it("counts each control's own constraints (required, type) with no rules", async () => {
    const { host, native } = await form(`<ui-form><form>
      <ui-field><label for="c-mail">Mail</label><ui-input id="c-mail" name="mail" type="email" required></ui-input></ui-field>
    </form></ui-form>`)
    expect(host.validate()).toBe(false)
    await ElementFixture.tick()
    const field = native.querySelector("ui-field")!
    expect(prompt(field)).toMatch(/\w/)
    await set(native.querySelector("[name=mail]"), "a@b.co")
    expect(host.validate()).toBe(true)
    await ElementFixture.tick()
    expect(prompt(field)).toBeNull()
  })

  it("re-validates a field showing an error as it changes", async () => {
    const { host, native } = await form(SIGN_UP)
    host.rules = { name: "notEmpty" }
    host.validate()
    await ElementFixture.tick()
    const field = native.querySelector("ui-field")!
    expect(prompt(field)).toBe("Name must have a value")
    const input = native.querySelector("[name=name]")!.shadowRoot!.querySelector("input")!
    await userEvent.type(input, "A")
    await later()
    expect(prompt(field)).toBeNull()
    expect(native.querySelector("[name=name]")!.hasAttribute("aria-invalid")).toBe(false)
    expect(host.matches(":state(error)")).toBe(false)
  })

  it('on="blur" validates a field as it loses focus;  on="change" as it changes', async () => {
    const { host, native } = await form(SIGN_UP.replace("<ui-form>", `<ui-form on="blur">`))
    host.rules = { email: "email" }
    const input = native.querySelector("[name=email]")!.shadowRoot!.querySelector("input")!
    await userEvent.type(input, "nope")
    await later()
    const field = native.querySelectorAll("ui-field")[1]!
    expect(prompt(field)).toBeNull()
    await userEvent.tab()
    await later()
    expect(prompt(field)).toBe("E-mail must be a valid e-mail")
    host.setAttribute("on", "change")
    host.rules = { name: "minLength[3]" }
    const name = native.querySelector("[name=name]")!.shadowRoot!.querySelector("input")!
    await userEvent.type(name, "A")
    await later()
    expect(prompt(native.querySelector("ui-field")!)).toBe("Name must be at least 3 characters")
  })

  it("skips `optional` blanks and `depends` on blank fields, and disabled fields", async () => {
    const { host, native } = await form(`<ui-form><form>
      <ui-input name="nick" aria-label="Nick"></ui-input>
      <ui-checkbox name="gift">Gift</ui-checkbox>
      <ui-input name="note" aria-label="Note"></ui-input>
      <ui-field disabled><ui-input name="off" aria-label="Off"></ui-input></ui-field>
    </form></ui-form>`)
    host.rules = {
      nick: { rules: ["minLength[3]"], optional: true },
      note: { rules: ["notEmpty"], depends: "gift" },
      off: "notEmpty"
    }
    expect(host.isValid()).toBe(true)
    await set(native.querySelector("[name=gift]"), true)
    expect(host.isValid()).toBe(false)
    await set(native.querySelector("[name=nick]"), "ab")
    expect(Object.keys(host.values)).toContain("off")
  })

  it("reset() restores the controls and clears the prompts;  clear() empties them", async () => {
    const { host, native } = await form(`<ui-form><form>
      <ui-field><label for="r-a">A</label><ui-input id="r-a" name="a" value="start"></ui-input></ui-field>
      <ui-checkbox name="b" selected>B</ui-checkbox>
    </form></ui-form>`)
    host.rules = { a: "minLength[10]" }
    await set(native.querySelector("[name=a]"), "changed")
    host.validate()
    await ElementFixture.tick()
    expect(prompt(native.querySelector("ui-field")!)).not.toBeNull()
    host.reset()
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(host.values).toEqual({ a: "start", b: true })
    expect(prompt(native.querySelector("ui-field")!)).toBeNull()
    expect(host.matches(":state(error)")).toBe(false)
    host.clear()
    await ElementFixture.tick()
    expect(host.values).toEqual({ a: "", b: false })
  })

  it("validates without a native form, but can't submit", async () => {
    const host = await ElementFixture.render<Form>(`<ui-form>
      <ui-field><label for="nf-a">A</label><ui-input id="nf-a" name="a"></ui-input></ui-field>
    </ui-form>`)
    host.rules = { a: "notEmpty" }
    expect(host.nativeForm).toBeNull()
    expect(host.validate()).toBe(false)
    await ElementFixture.tick()
    expect(prompt(host.querySelector("ui-field")!)).toBe("A must have a value")
  })

  it("prevent-leaving asks while values changed", async () => {
    const { host, native } = await form(
      `<ui-form prevent-leaving><form><ui-input name="a" aria-label="A"></ui-input></form></ui-form>`
    )
    const leave = () => {
      const event = new Event("beforeunload", { cancelable: true })
      window.dispatchEvent(event)
      return event.defaultPrevented
    }
    expect(leave()).toBe(false)
    await set(native.querySelector("[name=a]"), "dirty")
    expect(leave()).toBe(true)
    host.removeAttribute("prevent-leaving")
    await ElementFixture.tick()
    expect(leave()).toBe(false)
  })
})

describe("<ui-form> accessibility", () => {
  it("the prompt is an alert;  axe passes on a failed form", async () => {
    const { host, native } = await form(SIGN_UP)
    host.rules = SIGN_UP_RULES
    host.validate()
    await ElementFixture.tick()
    expect(native.querySelector("ui-field")!.shadowRoot!.querySelector("[part~=prompt]")!.getAttribute("role")).toBe(
      "alert"
    )
    await expectAccessible(host)
  })

  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await ElementFixture.tick()
    await expectAccessible(root)
  })
})
