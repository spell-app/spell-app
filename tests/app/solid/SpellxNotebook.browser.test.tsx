import { afterEach, beforeAll, describe, expect, test, vi } from "vite-plus/test"
import { flush } from "solid-js"
import { render } from "@solidjs/web"

import { PrefStore } from "spell/util/persist/PrefStore"
import { uiReady } from "spell-app/app/solid/loadUI"
import { SpellxNotebook } from "spell-app/app/solid/SpellxNotebook"

/**
 * `<SpellxNotebook>` in the browser (epic `elemental-spell` P11):  a `.spellx` file as cards;  edits come back as the
 * file's new text;  folds remembered per file.
 */

/** A small `.spellx` file:  prose, three properties (one with a body) and an action. */
const CARD = [
  `<spell-view "card">`,
  `\tA card has a *suit*.`,
  ``,
  `\t<property "suit" one-of="clubs, hearts" alias="is a (suit)" />`,
  `\t<property "rank" one-of="ace, king" />`,
  `\t<property "color">`,
  `\t\tred if its suit is hearts`,
  `\t</property>`,
  `\t<action "turn it over">`,
  `\t\tprint "turned"`,
  `\t</action>`,
  `</spell-view>`,
  ``
].join("\n")

/** Where its folds are remembered. */
const PATH = "/notebook-test/Card.spellx"

/** Undo for each test:  unmount. */
const cleanups: (() => void)[] = []

beforeAll(async () => {
  await uiReady
})

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
  PrefStore.setAt(`spellEditor:notebook:${PATH}`, undefined)
})

describe("<SpellxNotebook>", () => {
  test("a template's card holds its members:  folded, only its title", () => {
    const host = mount(() => <SpellxNotebook text={CARD} path={PATH} onChange={() => {}} />)
    expect(titles(host)).toEqual(["card"])
    titleOf(host, "card").click()
    flush()
    const template = titleOf(host, "card").closest(".NotebookCard")!
    const members = [...template.querySelectorAll(".NotebookMembers .NotebookCardTitle")].map(
      (each) => each.textContent
    )
    expect(members).toEqual(["suit", "rank", "color", "turn it over"])
  })

  test("draws the prose as markdown", async () => {
    const host = mount(() => <SpellxNotebook text={CARD} path={PATH} onChange={() => {}} />)
    titleOf(host, "card").click()
    flush()
    await vi.waitFor(
      () => {
        flush()
        expect(host.querySelector(".NotebookProse em")?.textContent).toBe("suit")
      },
      { timeout: 5000 }
    )
  })

  test("a property's form writes its new values back into the file", () => {
    const onChange = vi.fn()
    const host = mount(() => <SpellxNotebook text={CARD} path={PATH} onChange={onChange} />)
    open(host, "card", "suit")
    const fields = host.querySelectorAll<HTMLElement>(".NotebookProperty ui-input")
    // name, one of, the alias, and an empty one to add
    expect(fields.length).toBe(4)
    fields[1]!.dispatchEvent(new CustomEvent("ui-changed", { detail: { value: "clubs, hearts, spades" } }))
    expect(onChange).toHaveBeenCalledWith(CARD.replace(`one-of="clubs, hearts"`, `one-of="clubs, hearts, spades"`))
  })

  test("a property with a body shows its body as code under its form", () => {
    const host = mount(() => <SpellxNotebook text={CARD} path={PATH} onChange={() => {}} />)
    open(host, "card", "color")
    const color = titleOf(host, "color").closest(".NotebookCard")!
    expect(color.querySelector(".NotebookProperty")).not.toBeNull()
    expect(color.querySelector(".NotebookCode")?.textContent).toContain("red if its suit is hearts")
  })

  test("Move up swaps a card with the one before it", () => {
    const onChange = vi.fn()
    const host = mount(() => <SpellxNotebook text={CARD} path={PATH} onChange={onChange} />)
    open(host, "card")
    const rank = titleOf(host, "rank").closest(".NotebookCard")!
    rank.querySelector<HTMLElement>(`ui-icon[name="arrow up"]`)!.click()
    const text = onChange.mock.calls[0]![0] as string
    expect(text.indexOf(`<property "rank"`)).toBeLessThan(text.indexOf(`<property "suit"`))
  })

  test("which cards are open is remembered for the file", () => {
    const first = mount(() => <SpellxNotebook text={CARD} path={PATH} onChange={() => {}} />)
    open(first, "card", "turn it over")
    expect(titleOf(first, "turn it over").closest(".NotebookCard")!.classList.contains("open")).toBe(true)
    cleanups.splice(0).forEach((cleanup) => cleanup())
    const second = mount(() => <SpellxNotebook text={CARD} path={PATH} onChange={() => {}} />)
    expect(titleOf(second, "turn it over").closest(".NotebookCard")!.classList.contains("open")).toBe(true)
    expect(titleOf(second, "suit").closest(".NotebookCard")!.classList.contains("open")).toBe(false)
  })
})

/** The titles of the cards showing. */
function titles(host: HTMLElement): (string | null)[] {
  return [...host.querySelectorAll(".NotebookCardTitle")].map((each) => each.textContent)
}

/** Open the cards called `names`, outermost first, by clicking their titles. */
function open(host: HTMLElement, ...names: string[]) {
  for (const name of names) {
    titleOf(host, name).click()
    flush()
  }
}

/** The title of the card called `title`. */
function titleOf(host: HTMLElement, title: string): HTMLElement {
  const found = [...host.querySelectorAll<HTMLElement>(".NotebookCardTitle")].find((each) => each.textContent === title)
  if (!found) throw new Error(`no card ${title}`)
  return found
}

/** Render `component` into a fresh element on the page;  unmounted after the test. */
function mount(component: () => unknown): HTMLElement {
  const host = document.createElement("div")
  host.style.cssText = "position: relative; height: 600px"
  document.body.append(host)
  const dispose = render(component as () => never, host)
  flush()
  cleanups.push(() => {
    dispose()
    host.remove()
  })
  return host
}
