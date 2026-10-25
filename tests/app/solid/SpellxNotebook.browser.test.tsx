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

/** A small `.spellx` file:  prose, two properties and an action. */
const CARD = [
  `<spell-view "card">`,
  `\tA card has a *suit*.`,
  ``,
  `\t<property "suit" one-of="clubs, hearts" alias="is a (suit)" />`,
  `\t<property "rank" one-of="ace, king" />`,
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
  test("draws a card per template and member, and the prose as markdown", async () => {
    const host = mount(() => <SpellxNotebook text={CARD} path={PATH} onChange={() => {}} />)
    const titles = [...host.querySelectorAll(".NotebookCardTitle")].map((each) => each.textContent)
    expect(titles).toEqual(["card", "suit", "rank", "turn it over"])
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
    titleOf(host, "suit").click()
    flush()
    const fields = host.querySelectorAll<HTMLElement>(".NotebookProperty ui-input")
    // name, one of, the alias, and an empty one to add
    expect(fields.length).toBe(4)
    fields[1]!.dispatchEvent(new CustomEvent("ui-changed", { detail: { value: "clubs, hearts, spades" } }))
    expect(onChange).toHaveBeenCalledWith(
      CARD.replace(`one-of="clubs, hearts"`, `one-of="clubs, hearts, spades"`)
    )
  })

  test("Move up swaps a card with the one before it", () => {
    const onChange = vi.fn()
    const host = mount(() => <SpellxNotebook text={CARD} path={PATH} onChange={onChange} />)
    const rank = titleOf(host, "rank").closest(".NotebookCard")!
    rank.querySelector<HTMLElement>(`ui-button[icon="arrow up"]`)!.click()
    const text = onChange.mock.calls[0]![0] as string
    expect(text.indexOf(`<property "rank"`)).toBeLessThan(text.indexOf(`<property "suit"`))
  })

  test("which cards are open is remembered for the file", () => {
    const first = mount(() => <SpellxNotebook text={CARD} path={PATH} onChange={() => {}} />)
    titleOf(first, "turn it over").click()
    flush()
    expect(titleOf(first, "turn it over").closest(".NotebookCard")!.classList.contains("open")).toBe(true)
    cleanups.splice(0).forEach((cleanup) => cleanup())
    const second = mount(() => <SpellxNotebook text={CARD} path={PATH} onChange={() => {}} />)
    expect(titleOf(second, "turn it over").closest(".NotebookCard")!.classList.contains("open")).toBe(true)
    expect(titleOf(second, "suit").closest(".NotebookCard")!.classList.contains("open")).toBe(false)
  })
})

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
