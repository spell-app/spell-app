import { afterEach, describe, expect, test, vi } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import { AnswerForm } from "$/epics/answers"

import "$/epics/components/epic-text-box"

afterEach(() => AnswerForm.adopt(undefined))

/** `box`'s `<textarea>`. */
function field(box: Element): HTMLTextAreaElement {
  return box.shadowRoot!.querySelector("textarea")!
}

/** Type `text` into `box`, as a keystroke does. */
async function type(box: Element, text: string) {
  field(box).value = text
  field(box).dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }))
  await ElementFixture.settle()
}

describe("<epic-text-box>", () => {
  test("a box of one line, its type's hint, growing with its text;  axe", async () => {
    const box = await ElementFixture.render(`<epic-text-box type="notes"></epic-text-box>`)
    expect(field(box).placeholder).toBe("Notes for Claude:  anything, any time")
    expect(field(box).getAttribute("aria-label")).toBe("Notes for Claude:  anything, any time")
    expect(field(box).rows).toBe(1)
    expect(getComputedStyle(field(box)).getPropertyValue("field-sizing")).toBe("content")
    await expectAccessible(box)
  })

  test("its own placeholder and label win;  a comment box by default", async () => {
    const box = await ElementFixture.render(
      `<epic-text-box placeholder="Comment on B" label="Comment on B · Red"></epic-text-box>`
    )
    expect([field(box).placeholder, field(box).getAttribute("aria-label")]).toEqual([
      "Comment on B",
      "Comment on B · Red"
    ])
  })

  test("part of the page's answer by its type:  notes, a comment by `for`, Other by `for`;  blank:  nothing", async () => {
    const root = await ElementFixture.render(
      `<div><epic-text-box type="notes"></epic-text-box><epic-text-box for="context"></epic-text-box>` +
        `<epic-text-box type="other" for="q1"></epic-text-box><epic-text-box for="q1-B"></epic-text-box></div>`
    )
    const [notes, context, other] = Array.from(root.children)
    await type(notes!, " fine ")
    await type(context!, "clear")
    await type(other!, "neither")
    expect(AnswerForm.forPage().gather()).toEqual({
      answers: { q1: { picked: [], other: "neither" } },
      comments: { context: "clear" },
      notes: "fine"
    })
    expect(context!.matches(":state(filled)")).toBe(true)
  })

  test("a notes box draws what the page KEPT (P18):  its old title, the text, a × that drops it;  axe", async () => {
    const form = new AnswerForm({ page: "/pages/details/x.html", fetch: vi.fn() as unknown as typeof fetch })
    AnswerForm.adopt(form)
    form.kept = [{ id: "q3", label: "Q3 · Gone", text: "picked B · Blue" }]
    const box = await ElementFixture.render(`<epic-text-box type="notes"></epic-text-box>`)
    const kept = box.shadowRoot!.querySelector<HTMLElement>('[part~="kept"]')!
    expect(kept.querySelector(".kept-head")!.textContent).toBe("Kept from before the page changed")
    const label = kept.querySelector<HTMLElement>(".kept-label")!
    expect([label.textContent, label.title, kept.querySelector(".kept-text")!.textContent]).toEqual([
      "Q3 · Gone",
      "It was under q3",
      "picked B · Blue"
    ])
    await expectAccessible(box)
    // a comment box never draws it
    const comment = await ElementFixture.render(`<epic-text-box for="context"></epic-text-box>`)
    expect(comment.shadowRoot!.querySelector('[part~="kept"]')).toBeNull()
    kept.querySelector<HTMLElement>(".kept-drop")!.click()
    await ElementFixture.settle()
    expect([form.kept, box.shadowRoot!.querySelector('[part~="kept"]')]).toEqual([[], null])
  })

  test("its id, for a draft:  the notes, a comment's section under its title", async () => {
    const root = await ElementFixture.render(
      `<div><ui-section id="context" header="1. Context"><epic-text-box for="context"></epic-text-box></ui-section>` +
        `<epic-text-box type="notes"></epic-text-box><epic-text-box type="other" for="q1"></epic-text-box></div>`
    )
    expect(root.querySelectorAll("epic-text-box")).toHaveLength(3)
    expect(AnswerForm.forPage().labels()).toEqual({ context: "1. Context", notes: "Notes" })
  })

  test("`value`, as a `<textarea>`'s:  read and set;  an answer sent comes back into it", async () => {
    const box = (await ElementFixture.render(`<epic-text-box for="context"></epic-text-box>`)) as HTMLElement & {
      value: string
    }
    box.value = "set"
    await ElementFixture.settle()
    expect([box.value, field(box).value]).toEqual(["set", "set"])
    const feedback = await ElementFixture.render(`<epic-text-box type="feedback"></epic-text-box>`)
    await type(feedback, "mine")
    // a feedback box is its bar's:  never the details page's answer
    expect(AnswerForm.forPage().gather().comments).toEqual({ context: "set" })
  })
})
