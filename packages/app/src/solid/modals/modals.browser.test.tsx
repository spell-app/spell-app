import { afterEach, describe, expect, test } from "vitest"
import { userEvent } from "vitest/browser"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { editor } from "$/app/editor"
import { normalizeChooserOptions } from "$/app/solid/modals"

/**
 * `editor`'s dialogs on `@spell-app/ui`, in the browser:  each resolves the right value when its buttons are
 * clicked, through `editor.alert()` ... `choose()` (so through the dynamic `import()` too).
 */

/** A `<ui-modal>` host, as the tests poke it. */
type Modal = HTMLElement & { open: boolean }

/** A `<ui-radio>` / `<ui-checkbox>` host. */
type Choice = HTMLElement & { selected: boolean }

afterEach(() => {
  // a failed test may leave its dialog open:  don't let it block the next one
  for (const modal of document.querySelectorAll<Modal>("ui-modal")) modal.remove()
  for (const root of document.querySelectorAll(".ChooserRoot")) root.remove()
})

describe("alert / confirm", () => {
  test("alert():  header, message, OK;  resolves `undefined`", async () => {
    const answer = editor.alert({ header: "Header", message: "Yo!", ok: "Got it" })
    const modal = await current()
    expect(modal.getAttribute("header")).toBe("Header")
    expect(modal.querySelector("p")!.textContent).toBe("Yo!")
    expect(buttons(modal)).toEqual(["Got it"])
    click(modal, ".approve")
    expect(await answer).toBeUndefined()
    expect(modal.isConnected).toBe(false)
  })

  test("alert() takes a bare message", async () => {
    const answer = editor.alert("Saved")
    const modal = await current()
    expect(modal.getAttribute("aria-label")).toBe("Saved")
    click(modal, ".approve")
    expect(await answer).toBeUndefined()
  })

  test("confirm():  `true` on OK, with the caller's button texts", async () => {
    const answer = editor.confirm({ message: "Yah?", ok: "Yep", cancel: "Nope" })
    const modal = await current()
    expect(buttons(modal)).toEqual(["Nope", "Yep"])
    click(modal, ".approve")
    expect(await answer).toBe(true)
  })

  test("confirm():  `false` on Cancel, and on Escape", async () => {
    const cancelled = editor.confirm("Sure?")
    click(await current(), ".cancel")
    expect(await cancelled).toBe(false)
    const escaped = editor.confirm("Sure?")
    await current()
    await userEvent.keyboard("{Escape}")
    expect(await escaped).toBe(false)
  })
})

describe("prompt / promptForNumber", () => {
  test("prompt():  the field's text on OK", async () => {
    const answer = editor.prompt({ message: "What is your name?", defaultValue: "Bob" })
    const modal = await current()
    const input = modal.querySelector("input")!
    expect(input.value).toBe("Bob")
    input.value = "Ann"
    click(modal, ".approve")
    expect(await answer).toBe("Ann")
  })

  test("prompt():  Enter is OK", async () => {
    const answer = editor.prompt({ message: "What is your name?", defaultValue: "Ann" })
    const input = (await current()).querySelector("input")!
    await expect.poll(() => document.activeElement).toBe(input)
    await userEvent.keyboard("{End}e{Enter}")
    expect(await answer).toBe("Anne")
  })

  test("prompt():  `undefined` on Cancel, and when empty", async () => {
    const cancelled = editor.prompt({ message: "Name?", defaultValue: "Bob" })
    click(await current(), ".cancel")
    expect(await cancelled).toBeUndefined()
    const empty = editor.prompt("Name?")
    click(await current(), ".approve")
    expect(await empty).toBeUndefined()
  })

  test("promptForNumber():  a number field with `inputProps`;  OK waits for a valid value", async () => {
    const answer = editor.promptForNumber({
      header: "Quantity needed:",
      message: "How many did you want?",
      inputProps: { min: 10, max: 100, placeholder: "Between 10 and 100" }
    })
    const modal = await current()
    const input = modal.querySelector("input")!
    expect(input.type).toBe("number")
    expect(input.min).toBe("10")
    expect(input.max).toBe("100")
    expect(input.step).toBe("1")
    expect(input.placeholder).toBe("Between 10 and 100")
    // too small:  stays open
    input.value = "5"
    click(modal, ".approve")
    await ElementFixture.tick()
    expect(modal.open).toBe(true)
    input.value = "42"
    click(modal, ".approve")
    expect(await answer).toBe("42")
  })

  test("promptForNumber():  `undefined` on Cancel", async () => {
    const answer = editor.promptForNumber("How many?")
    const modal = await current()
    expect(modal.querySelector("input")!.type).toBe("number")
    click(modal, ".cancel")
    expect(await answer).toBeUndefined()
  })
})

describe("choose", () => {
  test("single:  radios;  resolves the chosen option's value", async () => {
    const answer = editor.choose({ header: "Pick one", message: "Message", options: ["A", "B", "C"] })
    const modal = await current()
    expect(modal.getAttribute("header")).toBe("Pick one")
    const radios = choices(modal, "ui-radio")
    expect(radios.map((radio) => radio.textContent)).toEqual(["A", "B", "C"])
    expect(radios.some((radio) => radio.selected)).toBe(false)
    radios[1]!.click()
    await expect.poll(() => radios.map((radio) => radio.selected)).toEqual([false, true, false])
    radios[2]!.click()
    await expect.poll(() => radios.map((radio) => radio.selected)).toEqual([false, false, true])
    click(modal, ".approve")
    expect(await answer).toBe("C")
    expect(document.querySelector(".ChooserRoot")).toBe(null)
  })

  test("single:  `defaultValue` starts chosen;  a number option resolves a number", async () => {
    const answer = editor.choose({ message: "How many?", options: [1, 2, 3], defaultValue: 2 })
    const modal = await current()
    expect(choices(modal, "ui-radio").map((radio) => radio.selected)).toEqual([false, true, false])
    click(modal, ".approve")
    expect(await answer).toBe(2)
  })

  test("single:  `undefined` on Cancel, and on OK with nothing chosen", async () => {
    const cancelled = editor.choose({ message: "Pick", options: ["A"], defaultValue: "A" })
    click(await current(), ".cancel")
    expect(await cancelled).toBeUndefined()
    const none = editor.choose({ message: "Pick", options: ["A"] })
    click(await current(), ".approve")
    expect(await none).toBeUndefined()
  })

  test("multiple:  checkboxes from a `{ value: text }` map;  resolves an array", async () => {
    const answer = editor.choose({
      header: "Pick many",
      message: "Message",
      options: { a: "Option A", b: "Option B", c: "Option C" },
      multiple: true,
      defaultValue: ["a", "b"]
    })
    const modal = await current()
    const boxes = choices(modal, "ui-checkbox")
    expect(boxes.map((box) => box.textContent)).toEqual(["Option A", "Option B", "Option C"])
    expect(boxes.map((box) => box.selected)).toEqual([true, true, false])
    boxes[0]!.click()
    boxes[2]!.click()
    await ElementFixture.tick()
    click(modal, ".approve")
    expect(await answer).toEqual(["b", "c"])
  })

  test("Enter is OK", async () => {
    const answer = editor.choose({ message: "Pick", options: ["A", "B"], multiple: true, defaultValue: ["B"] })
    const modal = await current()
    choices(modal, "ui-checkbox")[0]!.shadowRoot!.querySelector("input")!.focus()
    await userEvent.keyboard("{Enter}")
    expect(await answer).toEqual(["B"])
  })

  test("multiple:  `undefined` on Cancel", async () => {
    const answer = editor.choose({ message: "Pick", options: ["A", "B"], multiple: true, defaultValue: ["A"] })
    click(await current(), ".cancel")
    expect(await answer).toBeUndefined()
  })

  test("rejects without `message` / `options`", async () => {
    await expect(editor.choose()).rejects.toBeUndefined()
  })

  test("options:  primitives, objects and maps normalize alike", () => {
    expect(normalizeChooserOptions(["a", 2])).toEqual([
      { key: "0", value: "a", text: "a" },
      { key: "1", value: 2, text: "2" }
    ])
    expect(
      normalizeChooserOptions([
        { value: 1, text: "One" },
        { value: "x", key: "k" }
      ])
    ).toEqual([
      { key: "0", value: 1, text: "One" },
      { key: "k", value: "x", text: "x" }
    ])
    expect(normalizeChooserOptions({ a: "A" })).toEqual([{ key: "a", value: "a", text: "A" }])
  })
})

////////////////
// ## Helpers
////////////////

/** The open dialog:  the newest `<ui-modal>` in the page, once it's open and its elements have rendered. */
async function current(): Promise<Modal> {
  await expect.poll(() => newest()?.open, { timeout: 5000 }).toBe(true)
  const modal = newest()!
  await ElementFixture.settle(modal)
  return modal
}

/** The last `<ui-modal>` in the document. */
function newest(): Modal | undefined {
  return [...document.querySelectorAll<Modal>("ui-modal")].at(-1)
}

/** Click the `selector` button of `modal`. */
function click(modal: Modal, selector: string) {
  modal.querySelector<HTMLElement>(selector)!.click()
}

/** `modal`'s button texts, in order. */
function buttons(modal: Modal): string[] {
  return [...modal.querySelectorAll("ui-button")].map((button) => button.textContent!.trim())
}

/** `modal`'s `tag` choices. */
function choices(modal: Modal, tag: "ui-radio" | "ui-checkbox"): Choice[] {
  return [...modal.querySelectorAll<Choice>(tag)]
}
