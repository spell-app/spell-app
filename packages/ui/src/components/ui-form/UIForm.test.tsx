import { createSignal, flush } from "solid-js"
import { describe, expect, it, onTestFinished, vi } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"

import type {
  FormFailureDetail,
  FormInvalidDetail,
  FormRules,
  FormSuccessDetail,
  FormValues
} from "$/ui/components/components.types"
import { E } from "$/ui/core"
import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { Viewport } from "$/ui/test/Viewport"

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

/** A `<ui-form>` DOM element with its API. */
type Form = HTMLElement & {
  rules: FormRules | undefined
  values: FormValues
  nativeForm: HTMLFormElement | undefined
  validate(): boolean
  isValid(): boolean
  reset(): void
  clear(): void
  value: unknown
  debug: boolean
}

/** A text control DOM element. */
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

/**
 * Fake `setTimeout` for the rest of the test:  the form defers a blur / change validation to a timer
 * (`UIForm.checkFieldSoon()`), which `later()` then runs.
 */
function fakeTimers() {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })
  onTestFinished(() => {
    vi.useRealTimers()
  })
}

/** Run the form's deferred (blur / change) validation (after `fakeTimers()`), then flush. */
async function later() {
  await vi.runOnlyPendingTimersAsync()
  await ElementFixture.tick()
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

////////////////
// ## Classes
////////////////

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

  it("sets the DOM element's states:  loading, disabled, the form states", async () => {
    const { host } = await form(`<ui-form loading state="success"><form></form></ui-form>`)
    expect(host.matches(":state(loading)")).toBe(true)
    expect(host.matches(":state(success)")).toBe(true)
  })
})

////////////////
// ## Layout
////////////////

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
    await Viewport.resize(1200)
    await expect.poll(() => forms.map((host) => stacked(host))).toEqual([false, false, true])
    await Viewport.resize(500)
    await expect.poll(() => forms.map((host) => stacked(host))).toEqual([true, true, true])

    /** Whether `host`'s row is stacked. */
    function stacked(host: Element) {
      const [a, b] = [...host.querySelectorAll("ui-field")].map((field) =>
        field.shadowRoot!.querySelector("[part~=field]")!.getBoundingClientRect()
      )
      return b!.top > a!.top
    }
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

////////////////
// ## <ui-fields> equal
////////////////

describe("<ui-fields> equal", () => {
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

////////////////
// ## Tokens from outside
////////////////

describe("<ui-form> tokens from outside", () => {
  /** A row of two fields (in a form) whose row margin `--ui-form-gutter` drives. */
  const ROW = `<ui-fields><ui-field>A</ui-field><ui-field>B</ui-field></ui-fields>`

  /** The first row's start margin:  minus half the gutter. */
  function rowMargin(host: Element): string {
    return getComputedStyle(host.querySelector("ui-fields")!.shadowRoot!.querySelector("[part~=fields]")!).marginLeft
  }

  it("takes a token set on the DOM element, and hands it to its rows (an owner token)", async () => {
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

////////////////
// ## Native form
////////////////

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

////////////////
// ## Values
////////////////

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

  it("reads `off-value`:  a lone unchosen box reports it;  several of one name list what each submits", async () => {
    const { host } = await form(`<ui-form><form>
      <ui-checkbox name="panel" value="open" off-value="closed">Panel</ui-checkbox>
      <ui-checkbox name="lamp" value="lit" off-value="dark" selected>Lamp</ui-checkbox>
      <ui-checkbox name="sizes" value="s" selected>S</ui-checkbox><ui-checkbox name="sizes" value="m" off-value="no m">M</ui-checkbox>
      <input type="checkbox" name="native" aria-label="Native">
    </form></ui-form>`)
    expect(host.values).toEqual({ panel: "closed", lamp: "lit", sizes: ["s", "no m"], native: false })
  })
})

////////////////
// ## Validation
////////////////

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
    fakeTimers()
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

  it('validate-on="blur" validates a field as it loses focus;  validate-on="change" as it changes', async () => {
    const { host, native } = await form(SIGN_UP.replace("<ui-form>", `<ui-form validate-on="blur">`))
    fakeTimers()
    host.rules = { email: "email" }
    const input = native.querySelector("[name=email]")!.shadowRoot!.querySelector("input")!
    await userEvent.type(input, "nope")
    await later()
    const field = native.querySelectorAll("ui-field")[1]!
    expect(prompt(field)).toBeNull()
    await userEvent.tab()
    await later()
    expect(prompt(field)).toBe("E-mail must be a valid e-mail")
    host.setAttribute("validate-on", "change")
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
    expect(host.nativeForm).toBeUndefined()
    expect(host.validate()).toBe(false)
    await ElementFixture.tick()
    expect(prompt(host.querySelector("ui-field")!)).toBe("A must have a value")
  })

  it("prevent-leaving asks while values changed", async () => {
    const { host, native } = await form(
      `<ui-form prevent-leaving><form><ui-input name="a" aria-label="A"></ui-input></form></ui-form>`
    )
    expect(leave()).toBe(false)
    await set(native.querySelector("[name=a]"), "dirty")
    expect(leave()).toBe(true)
    host.removeAttribute("prevent-leaving")
    await ElementFixture.tick()
    expect(leave()).toBe(false)

    /** Whether leaving the page now is held back:  a cancelable `beforeunload`, prevented. */
    function leave() {
      const event = new Event("beforeunload", { cancelable: true })
      window.dispatchEvent(event)
      return event.defaultPrevented
    }
  })
})

////////////////
// ## Bound to an object (`value`)
////////////////

/** A to-do whose properties are reactive members (`@E.state`);  `toJSON()` for `debug`. */
class Todo {
  @E.state accessor title = "Milk"
  @E.state accessor completed = false
  @E.state accessor count = 2

  toJSON() {
    return { title: this.title, completed: this.completed, count: this.count }
  }
}

/** A to-do whose `title` is a getter / setter pair over a Solid signal;  records every write. */
class SignalTodo {
  private readonly titleSignal = createSignal("Eggs")
  readonly writes: string[] = []

  get title(): string {
    return this.titleSignal[0]()
  }
  set title(title: string) {
    this.writes.push(title)
    this.titleSignal[1](title)
  }
}

/** A form-associated control of the barest kind, defined by a test after the form has bound. */
class LateInput extends HTMLElement {
  static formAssociated = true
  private readonly internals = this.attachInternals()
  value = ""

  get validity(): ValidityState {
    return this.internals.validity
  }
}

/** A form of `fields`, bound to `value`;  returns the form and its `named(name)` control. */
async function bound(fields: string, value: unknown) {
  const { host, native } = await form(`<ui-form><form>${fields}</form></ui-form>`)
  host.value = value
  await settle()
  return { host, native, named: (name: string) => native.querySelector(`[name=${name}]`) as Control }
}

/** Let the form bind, write back and redraw:  a mutation, a microtask, a Solid flush. */
async function settle() {
  for (let round = 0; round < 3; round++) await ElementFixture.tick()
}

/** The `<input>` inside a `<ui-input>`. */
function inner(control: Element): HTMLInputElement {
  return control.shadowRoot!.querySelector("input")!
}

/** A text field, a checkbox and a number field, by name. */
const TODO_FIELDS = `<ui-input name="title" aria-label="Title"></ui-input>
  <ui-checkbox name="completed">Done</ui-checkbox>
  <ui-input name="count" type="number" aria-label="Count"></ui-input>`

describe("<ui-form> value", () => {
  it("shows a reactive object's properties in its named controls, and follows them as they change", async () => {
    const todo = new Todo()
    const { named } = await bound(TODO_FIELDS, todo)
    expect([named("title").value, named("completed").selected, named("count").value]).toEqual(["Milk", false, "2"])
    todo.title = "Bread"
    todo.completed = true
    todo.count = 7
    await settle()
    expect([named("title").value, named("completed").selected, named("count").value]).toEqual(["Bread", true, "7"])
  })

  it("writes what the person types and clicks back to the object;  a number stays a number", async () => {
    const todo = new Todo()
    const { named } = await bound(TODO_FIELDS, todo)
    await userEvent.type(inner(named("title")), "!")
    named("completed").shadowRoot!.querySelector("input")!.click()
    await userEvent.clear(inner(named("count")))
    await userEvent.type(inner(named("count")), "12")
    await settle()
    expect(todo.toJSON()).toEqual({ title: "Milk!", completed: true, count: 12 })
    expect(document.activeElement).toBe(named("count"))
  })

  it("binds a getter / setter over a Solid signal both ways, writing once per change (no echo)", async () => {
    const todo = new SignalTodo()
    const { named } = await bound(`<ui-input name="title" aria-label="Title"></ui-input>`, todo)
    expect(named("title").value).toBe("Eggs")
    todo.title = "Ham"
    flush()
    await settle()
    expect(named("title").value).toBe("Ham")
    await userEvent.type(inner(named("title")), "s!")
    await settle()
    expect(todo.title).toBe("Hams!")
    expect(todo.writes).toEqual(["Ham", "Hams", "Hams!"])
  })

  it("binds controls that come later, and lets go of those removed", async () => {
    const todo = new Todo()
    const { native, named } = await bound(`<ui-input name="title" aria-label="Title"></ui-input>`, todo)
    native.insertAdjacentHTML("beforeend", `<ui-checkbox name="completed" selected>Done</ui-checkbox>`)
    await ElementFixture.settle(native)
    await settle()
    const done = named("completed")
    expect(done.selected).toBe(false)
    done.remove()
    await settle()
    todo.completed = true
    await settle()
    expect(done.selected).toBe(false)
  })

  it("binds a control whose tag is defined only later (a family loaded on demand)", async () => {
    const todo = new Todo()
    const { named } = await bound(`<late-title-input name="title"></late-title-input>`, todo)
    customElements.define("late-title-input", LateInput)
    await settle()
    expect(named("title").value).toBe("Milk")
  })

  it("binds nothing without `value`, binds once it's set, and lets go when it's unset", async () => {
    const { host, native } = await form(`<ui-form><form>
      <ui-input name="title" value="Plain" aria-label="Title"></ui-input>
    </form></ui-form>`)
    const title = native.querySelector("[name=title]") as Control
    expect(host.values).toEqual({ title: "Plain" })
    const todo = new Todo()
    host.value = todo
    await settle()
    expect(title.value).toBe("Milk")
    host.value = undefined
    await settle()
    await userEvent.type(inner(title), "?")
    await settle()
    expect([title.value, todo.title]).toEqual(["Milk?", "Milk"])
  })

  it("radios:  the one whose value it is is chosen;  choosing one writes its value", async () => {
    const plan = { name: "pro" }
    const { native } = await bound(
      `<ui-radio name="name" value="free">Free</ui-radio><ui-radio name="name" value="pro">Pro</ui-radio>`,
      plan
    )
    const [free, pro] = [...native.querySelectorAll<Control>("ui-radio")]
    expect([free!.selected, pro!.selected]).toEqual([false, true])
    free!.shadowRoot!.querySelector("input")!.click()
    await settle()
    expect(plan.name).toBe("free")
  })

  it("keeps validation, `values` and `reset()`;  a reset writes the starting values back to the object", async () => {
    const todo = new Todo()
    todo.title = ""
    const { host, named } = await bound(
      `<ui-field><label for="b-title">Title</label><ui-input id="b-title" name="title" value="Start"></ui-input></ui-field>`,
      todo
    )
    host.rules = { title: "notEmpty" }
    expect(host.validate()).toBe(false)
    todo.title = "Tea"
    await settle()
    expect(host.validate()).toBe(true)
    expect(host.values).toEqual({ title: "Tea" })
    host.reset()
    await settle()
    expect([named("title").value, todo.title]).toEqual(["Start", "Start"])
  })
})

describe("<ui-form> debug", () => {
  it("shows the bound object as JSON (its `toJSON()`), live;  without `value`, the form's `values`", async () => {
    const { host, native } = await form(`<ui-form debug><form>
      <ui-input name="title" value="Plain" aria-label="Title"></ui-input>
    </form></ui-form>`)
    const shown = () => JSON.parse(host.shadowRoot!.querySelector("[part~=debug]")!.textContent!)
    expect(shown()).toEqual({ title: "Plain" })
    await userEvent.type(inner(native.querySelector("[name=title]")!), "!")
    await settle()
    expect(shown()).toEqual({ title: "Plain!" })
    const todo = new Todo()
    host.value = todo
    await settle()
    expect(shown()).toEqual({ title: "Milk", completed: false, count: 2 })
    todo.count = 3
    await settle()
    expect(shown().count).toBe(3)
    host.debug = false
    await settle()
    expect(host.shadowRoot!.querySelector("[part~=debug]")).toBeNull()
  })
})

////////////////
// ## Accessibility
////////////////

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
