import { afterEach, describe, expect, test, vi } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import { AnswerForm, type PageAnswer } from "$/epics/answers"

import "$/epics/components/epic-ask"
import "$/epics/components/epic-choices"
import "$/epics/components/epic-question"

////////////////
// ## Fixtures
////////////////

/** A question of three options, in its section (its key), pick one unless `flags` say otherwise. */
function question(flags = "", options = OPTIONS) {
  return (
    `<ui-section id="q1" header="Q1 · Which?"><epic-ask ${flags}><epic-question><p>Which one?</p></epic-question>` +
    `<epic-choices>${options}</epic-choices></epic-ask></ui-section>`
  )
}

const OPTIONS =
  `<epic-option letter="A" title="Blue" recommended><p>Calm.</p></epic-option>` +
  `<epic-option letter="B" title="Red"><p>Loud.</p></epic-option>` +
  `<epic-option letter="C" title="Green" done></epic-option>`

/** The page's form, fresh for each test (the elements make it on first use). */
function form(): AnswerForm {
  return AnswerForm.forPage()
}

afterEach(() => AnswerForm.adopt(undefined))

/** `host`'s shadow part `name`. */
function part<T extends HTMLElement = HTMLElement>(host: Element, name: string): T {
  return host.shadowRoot!.querySelector<T>(`[part~="${name}"]`)!
}

/** Option `letter` of the question under `root`. */
function option(root: Element, letter: string): Element {
  return root.querySelector(`epic-option[letter="${letter}"]`)!
}

/** Tick (or untick) option `letter`'s box, as a click does. */
async function tick(root: Element, letter: string) {
  part<HTMLInputElement>(option(root, letter), "tick").click()
  await ElementFixture.settle()
}

/** What the page would send. */
function gathered(): PageAnswer {
  return form().gather()
}

////////////////
// ## Tests
////////////////

describe("<epic-ask>", () => {
  test("its line:  a red chip (its section's key), Pick one;  its options a tick box each, a comment box, Other;  axe", async () => {
    const section = await ElementFixture.render(question())
    const ask = section.querySelector("epic-ask")!
    await ElementFixture.settle()
    expect(part(ask, "chip").textContent).toBe("Q1")
    const red = getComputedStyle(part(ask, "chip")).backgroundColor
    expect(red).not.toBe("rgba(0, 0, 0, 0)")
    expect(part(ask, "how").textContent).toBe("Pick one")
    expect(part<HTMLInputElement>(option(section, "A"), "tick").type).toBe("radio")
    expect(part(option(section, "A"), "comment").getAttribute("for")).toBe("q1-A")
    expect(part(ask, "other").getAttribute("for")).toBe("q1")
    expect(section.getAttribute("data-state")).toBe("attention")
    expect(gathered().answers).toEqual({ q1: { picked: [] } })
    await expectAccessible(ask)
  })

  test("pick one:  a tick picks its option alone, framed green;  the chip turns green", async () => {
    const section = await ElementFixture.render(question())
    const ask = section.querySelector("epic-ask")!
    await ElementFixture.settle()
    const red = getComputedStyle(part(ask, "chip")).backgroundColor
    await tick(section, "A")
    await tick(section, "B")
    expect(gathered().answers.q1).toEqual({ picked: ["B"] })
    expect(part<HTMLInputElement>(option(section, "A"), "tick").checked).toBe(false)
    expect(option(section, "B").matches(":state(ticked)")).toBe(true)
    expect(ask.matches(":state(done)")).toBe(true)
    expect(section.getAttribute("data-state")).toBe("done")
    // green now, not the red it started
    expect(getComputedStyle(part(ask, "chip")).backgroundColor).not.toBe(red)
  })

  test("pick several, Select all / none over the options shown;  Open hides the `done` ones", async () => {
    const section = await ElementFixture.render(question("multiple select-all filter"))
    const ask = section.querySelector("epic-ask")!
    await ElementFixture.settle()
    expect(option(section, "C").matches(":state(filtered)")).toBe(true)
    const selectAll = part(ask, "tools").querySelector<HTMLElement>("ui-button")!
    expect(selectAll.textContent).toBe("Select all")
    selectAll.click()
    await ElementFixture.settle()
    expect(gathered().answers.q1).toEqual({ picked: ["A", "B"] })
    expect(selectAll.textContent).toBe("Select none")
    selectAll.click()
    await ElementFixture.settle()
    expect(gathered().answers.q1).toEqual({ picked: [] })
    // All:  the done one shows, and Select all takes it too
    part(ask, "tools").querySelectorAll<HTMLElement>("ui-button")[2]!.click()
    await ElementFixture.settle()
    expect(option(section, "C").matches(":state(filtered)")).toBe(false)
  })

  test("more details:  the (?) ticks its option and asks for more (`<key>-more`):  blue, Claude's to do", async () => {
    const section = await ElementFixture.render(question("multiple more-details"))
    const ask = section.querySelector("epic-ask")!
    part(option(section, "B"), "more").click()
    await ElementFixture.settle()
    expect(gathered().answers).toEqual({ q1: { picked: ["B"] }, "q1-more": { picked: ["B"] } })
    expect(part(option(section, "B"), "more").getAttribute("aria-pressed")).toBe("true")
    expect(ask.matches(":state(working)")).toBe(true)
  })

  test("only Other written:  blue;  its text goes with the picks", async () => {
    const section = await ElementFixture.render(question())
    const ask = section.querySelector("epic-ask")!
    const other = part(ask, "other").shadowRoot!.querySelector("textarea")!
    other.value = "neither"
    other.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }))
    await ElementFixture.settle()
    expect(gathered().answers.q1).toEqual({ picked: [], other: "neither" })
    expect(ask.matches(":state(working)")).toBe(true)
  })

  test("ticked to start with (`selected`), until Owen picks;  an answer sent comes back into it", async () => {
    const section = await ElementFixture.render(
      question(
        "multiple",
        `<epic-option letter="J1" title="One" selected></epic-option><epic-option letter="J2" title="Two"></epic-option>`
      )
    )
    await ElementFixture.settle()
    expect(gathered().answers.q1).toEqual({ picked: ["J1"] })
    const ask = section.querySelector("epic-ask")! as HTMLElement & { component: { showAnswer(answer: object): void } }
    ask.component.showAnswer({ answers: { q1: { picked: ["J2"] } }, comments: {}, notes: "" })
    await ElementFixture.settle()
    expect(part<HTMLInputElement>(option(section, "J2"), "tick").checked).toBe(true)
    expect(part<HTMLInputElement>(option(section, "J1"), "tick").checked).toBe(false)
  })

  test("its ids, for a draft (P18):  its key under its section's title, each option's under its own", async () => {
    await ElementFixture.render(question())
    await ElementFixture.settle()
    expect(form().labels()).toEqual({
      q1: "Q1 · Which?",
      "q1-A": "A · Blue",
      "q1-B": "B · Red",
      "q1-C": "C · Green"
    })
  })

  test("a draft comes back into it on load, over the answer;  rewritten without it, what was typed is kept", async () => {
    const draft = {
      page: "/pages/details/x.html",
      saved: "2026-10-14T05:00:00.000Z",
      answers: { q1: { picked: ["B"], other: "or both" } },
      comments: { "q1-B": "too loud?" },
      notes: "",
      labels: { q1: "Q1 · Which?", "q1-A": "A · Blue", "q1-B": "B · Red", "q1-C": "C · Green" }
    }
    const fetch = vi.fn(async (url: string) =>
      Response.json(url.startsWith("/api/docs/details/draft") ? { draft } : { answer: null })
    )
    const details = new AnswerForm({
      page: "/pages/details/x.html",
      server: { token: "t" },
      protocol: "http:",
      fetch: fetch as unknown as typeof globalThis.fetch
    })
    AnswerForm.adopt(details)
    const section = await ElementFixture.render(question())
    await ElementFixture.settle()
    await details.load()
    await ElementFixture.settle()
    expect(option(section, "B").matches(":state(ticked)")).toBe(true)
    expect(part<HTMLElement & { value: string }>(section.querySelector("epic-ask")!, "other").value).toBe("or both")
    expect(details.gather().comments).toEqual({ "q1-B": "too loud?" })
    expect(details.stateLine.text).toBe("Not sent")
    // an agent's rewrite takes the question off the page
    section.remove()
    await vi.waitFor(() => expect(details.kept).toHaveLength(2), { timeout: 2000 })
    expect(details.kept).toEqual([
      { id: "q1", label: "Q1 · Which?", text: "picked B · Red;  Other:  or both" },
      { id: "q1-B", label: "Q1 · Which?, B · Red", text: "too loud?" }
    ])
  })

  test("options quoted in an option's text are only text:  no tick box", async () => {
    const nested = `<epic-option letter="A" title="Quote"><epic-choices><epic-option letter="X" title="Inner"></epic-option></epic-choices></epic-option>`
    const section = await ElementFixture.render(question("", nested))
    await ElementFixture.settle()
    expect(option(section, "X").shadowRoot!.querySelector("[part~='tick']")).toBeNull()
    expect(option(section, "A").matches(":state(answering)")).toBe(true)
  })
})
