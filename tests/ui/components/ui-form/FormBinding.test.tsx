import { afterEach, describe, expect, it, vi } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { DOMFormElement } from "$/ui/components/ui-form/UIForm"
import type { FormSaveDetail } from "$/ui/components/components.types"

import "$/ui"

////////////////
// ## Helpers
////////////////

/** A `ui-*` control, as the tests read and set it. */
type Control = HTMLElement & { value: unknown; selected: boolean }

/** A `<ui-form>` of `fields` (with its attributes `formAttributes`), bound to `value`. */
async function bound(fields: string, value: unknown, formAttributes = "") {
  const host = await ElementFixture.render<DOMFormElement & { value: unknown }>(
    `<ui-form ${formAttributes}><form>${fields}</form></ui-form>`
  )
  await ElementFixture.settle(host)
  host.value = value
  await settle()
  const native = host.querySelector("form")!
  return { host, named: (name: string) => native.querySelector(`[name=${name}]`) as Control }
}

/** Let the form bind, write back and redraw:  a mutation, a microtask, a Solid flush. */
async function settle() {
  for (let round = 0; round < 3; round++) await ElementFixture.tick()
}

/** The `<input>` inside a `<ui-input>`. */
function inner(control: Element): HTMLInputElement {
  return control.shadowRoot!.querySelector("input")!
}

afterEach(() => {
  vi.useRealTimers()
})

////////////////
// ## A field's `apply`
////////////////

describe("<ui-field apply>", () => {
  // A 2s pause and ~1s margins either side:  the review runs many browser tests at once, and short waits run long
  it("`delayed`:  writes after a pause in typing;  each keystroke starts the wait again", async () => {
    const thing = { title: "Milk" }
    const { named } = await bound(
      `<ui-field apply="delayed 2000"><ui-input name="title" aria-label="Title"></ui-input></ui-field>`,
      thing
    )
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
    await userEvent.type(inner(named("title")), "!")
    await settle()
    expect(thing.title).toBe("Milk")
    await wait(1000)
    await userEvent.type(inner(named("title")), "?")
    await wait(1100)
    // 2.1s after "!":  its wait would have ended, but "?" started a new one
    expect(thing.title).toBe("Milk")
    await expect.poll(() => thing.title, { timeout: 4000 }).toBe("Milk!?")
  })

  // NOT `name="id"`:  a `<form>` with a control named `id` answers `form.id` with that control
  it("`on leave`:  writes only once the cursor leaves the field", async () => {
    const thing = { slug: "a" }
    const { named } = await bound(
      `<ui-field apply="on leave"><ui-input name="slug" aria-label="Slug"></ui-input></ui-field>
       <ui-input name="other" aria-label="Other"></ui-input>`,
      thing
    )
    await userEvent.type(inner(named("slug")), "bc")
    await settle()
    expect(thing.slug).toBe("a")
    inner(named("other")).focus()
    await settle()
    expect(thing.slug).toBe("abc")
  })

  it("`immediately` (no `apply`):  writes as the person types", async () => {
    const thing = { title: "Milk" }
    const { named } = await bound(`<ui-field><ui-input name="title" aria-label="Title"></ui-input></ui-field>`, thing)
    await userEvent.type(inner(named("title")), "!")
    await settle()
    expect(thing.title).toBe("Milk!")
  })
})

////////////////
// ## The form's `apply="on save"`
////////////////

describe('<ui-form apply="on save">', () => {
  const FIELDS = `<ui-field><ui-input name="title" aria-label="Title"></ui-input></ui-field>`

  it("holds edits (`:state(changed)`) until `save()`:  `ui-saving`, then `ui-saved`, with the changes", async () => {
    const thing = { title: "Milk" }
    const { host, named } = await bound(FIELDS, thing, `apply="on save"`)
    const events: [string, FormSaveDetail][] = []
    for (const type of ["ui-saving", "ui-saved"])
      host.addEventListener(type, (event) => events.push([type, (event as CustomEvent<FormSaveDetail>).detail]))
    await userEvent.type(inner(named("title")), "!")
    await settle()
    expect(thing.title).toBe("Milk")
    expect(host.matches(":state(changed)")).toBe(true)
    expect(host.save()).toBe(true)
    expect(thing.title).toBe("Milk!")
    await settle()
    expect(host.matches(":state(changed)")).toBe(false)
    expect(events.map(([type]) => type)).toEqual(["ui-saving", "ui-saved"])
    expect(events[0]![1].changes).toEqual([{ name: "title", value: "Milk!", target: thing }])
  })

  it("`cancel()` drops the held edits:  the controls show the thing again", async () => {
    const thing = { title: "Milk" }
    const { host, named } = await bound(FIELDS, thing, `apply="on save"`)
    const types: string[] = []
    for (const type of ["ui-cancelling", "ui-cancelled"]) host.addEventListener(type, () => types.push(type))
    await userEvent.type(inner(named("title")), "!")
    await settle()
    expect(host.cancel()).toBe(true)
    await settle()
    expect(named("title").value).toBe("Milk")
    expect(thing.title).toBe("Milk")
    expect(host.matches(":state(changed)")).toBe(false)
    expect(types).toEqual(["ui-cancelling", "ui-cancelled"])
  })

  it("`save()` first writes a field still waiting for the cursor to leave (a keyboard or scripted Save)", async () => {
    const thing = { title: "Milk" }
    const { host, named } = await bound(
      `<ui-field apply="on leave"><ui-input name="title" aria-label="Title"></ui-input></ui-field>`,
      thing,
      `apply="on save"`
    )
    await userEvent.type(inner(named("title")), "!")
    await settle()
    expect(host.save()).toBe(true)
    expect(thing.title).toBe("Milk!")
  })

  it("a cancelled `ui-saving` keeps the edits held", async () => {
    const thing = { title: "Milk" }
    const { host, named } = await bound(FIELDS, thing, `apply="on save"`)
    host.addEventListener("ui-saving", (event) => event.preventDefault())
    await userEvent.type(inner(named("title")), "!")
    await settle()
    expect(host.save()).toBe(false)
    expect(thing.title).toBe("Milk")
    expect(host.matches(":state(changed)")).toBe(true)
  })
})

////////////////
// ## Many things
////////////////

describe("<ui-form value> with many things", () => {
  const FIELDS = `<ui-field><ui-input name="size" aria-label="Size"></ui-input></ui-field>
    <ui-field><ui-input name="font" aria-label="Font" placeholder="Pick a font"></ui-input></ui-field>`

  it("shows the value they agree on;  blank, `mixed` and a Mixed placeholder where they don't", async () => {
    const things = [
      { size: "md", font: "Inter" },
      { size: "md", font: "Inter" },
      { size: "md", font: "Lora" }
    ]
    const { named } = await bound(FIELDS, things)
    expect(named("size").value).toBe("md")
    expect(named("size").closest("ui-field")!.hasAttribute("mixed")).toBe(false)
    expect(named("font").value).toBe("")
    expect(named("font").closest("ui-field")!.matches(":state(mixed)")).toBe(true)
    expect(named("font").getAttribute("placeholder")).toBe("Mixed")
  })

  it("a write sets the property on all of them, and the field is no longer mixed", async () => {
    const things = [{ font: "Inter" }, { font: "Inter" }, { font: "Lora" }]
    const { named } = await bound(`<ui-field><ui-input name="font" aria-label="Font"></ui-input></ui-field>`, things)
    await userEvent.type(inner(named("font")), "Mono")
    await settle()
    expect(things.map((thing) => thing.font)).toEqual(["Mono", "Mono", "Mono"])
    expect(named("font").closest("ui-field")!.hasAttribute("mixed")).toBe(false)
    expect(named("font").hasAttribute("placeholder")).toBe(false)
  })
})

////////////////
// ## Validation
////////////////

describe("<ui-field rules>", () => {
  it("adds its rules to the form's;  `validate()` shows them", async () => {
    const { host, named } = await bound(
      `<ui-field label="E-mail"><ui-input name="email" aria-label="E-mail"></ui-input></ui-field>`,
      { email: "nope" }
    )
    const field = named("email").closest("ui-field") as HTMLElement & { rules: unknown }
    field.rules = ["email"]
    expect(host.validate()).toBe(false)
    await settle()
    expect(field.shadowRoot!.querySelector("[part~=error]")!.textContent).toMatch(/e-mail/i)
  })

  it("never writes a value that fails:  the thing keeps its last good value", async () => {
    const thing = { email: "a@b.co" }
    const { named } = await bound(
      `<ui-field label="E-mail"><ui-input name="email" aria-label="E-mail"></ui-input></ui-field>`,
      thing
    )
    ;(named("email").closest("ui-field") as HTMLElement & { rules: unknown }).rules = ["email"]
    await userEvent.type(inner(named("email")), "@")
    await settle()
    expect(thing.email).toBe("a@b.co")
    await userEvent.type(inner(named("email")), "{Backspace}m")
    await settle()
    expect(thing.email).toBe("a@b.com")
  })
})
