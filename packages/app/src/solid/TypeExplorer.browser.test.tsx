import { afterEach, describe, expect, test, vi } from "vite-plus/test"
import { flush } from "solid-js"
import { render } from "@solidjs/web"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { buildScopeTree, type ScopeDetails, type ScopeEntry } from "$/lsp/lsp.types"
import type { TypeExplorerState } from "$/app/ui/ui.types"
import { uiReady } from "./loadUI"
import { TypeExplorer, type TypeExplorerProps } from "./TypeExplorer"

/**
 * The Solid `<TypeExplorer>` in the browser:  Solid's client build, so effects run -- details are asked for and
 * show when they come -- and clicks change what's open and selected.
 */

/** A card's entries, in document order. */
const ENTRIES: ScopeEntry[] = [
  { path: "project:Cards" },
  { path: "project:Cards/file:Card.spell" },
  { path: "project:Cards/file:Card.spell/type:Card" },
  { path: "project:Cards/file:Card.spell/type:Card/property:suit", section: "properties of cards" },
  { path: "project:Cards/file:Card.spell/type:Card/method:flip", section: "actions" }
]

/** Path of the card type. */
const CARD = "project:Cards/file:Card.spell/type:Card"

/** Details of the card type. */
const CARD_DETAILS: ScopeDetails = {
  description: "A playing card.",
  uri: "file:///cards/Card.spell",
  line: 3,
  spell: "a card is a thing"
}

/** Undo for each test:  unmount. */
const cleanups: (() => void)[] = []

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
})

describe("<TypeExplorer> (Solid, browser)", () => {
  test("asks for the selected node's details once, and shows them when they come", async () => {
    const loadDetails = vi.fn(async (path: string) => (path === CARD ? CARD_DETAILS : null))
    const host = await mount({ loadDetails })
    await settle()
    flush()
    expect(loadDetails).toHaveBeenCalledTimes(1)
    expect(loadDetails).toHaveBeenCalledWith(CARD)
    expect(host.querySelector(".Description")!.textContent).toContain("A playing card.")
    expect(host.querySelector(".DetailsBody.loading")).toBeNull()
  })

  test("a details section opens for every node, and says so through `onStateChange`", async () => {
    const onStateChange = vi.fn()
    const host = await mount({ onStateChange })
    await settle()
    flush()
    const spell = sectionTitled(host, "Spell")!
    expect(spell.querySelector(".DetailsSectionBody")).toBeNull()
    spell.querySelector<HTMLElement>(".DetailsSectionTitle")!.click()
    flush()
    expect(sectionTitled(host, "Spell")!.querySelector("pre.code.spell")!.textContent).toBe("a card is a thing")
    expect(onStateChange).toHaveBeenLastCalledWith(expect.objectContaining({ openSections: ["Spell"] }))
    // the aside links to where it's defined, and doesn't fold the section
    const onOpen = host.querySelector<HTMLAnchorElement>(".aside a")!
    expect(onOpen.textContent).toBe("Card.spell:3")
  })

  test("clicking a member in the details selects it in the tree", async () => {
    const host = await mount({})
    await settle()
    flush()
    sectionTitled(host, "Members")!.querySelector<HTMLElement>(".DetailsSectionTitle")!.click()
    flush()
    const suit = [...host.querySelectorAll<HTMLElement>(".ScopeMember .label")].find((label) =>
      label.textContent!.includes("suit")
    )!
    suit.click()
    flush()
    expect(host.querySelector(".ScopeTreeNode.selected")!.textContent).toBe("suit")
    expect(host.querySelector(".crumb.current")!.textContent).toBe("suit")
  })

  test("a tree row's arrow opens and closes it", async () => {
    const host = await mount({})
    expect(treeLabels(host)).toContain("suit")
    const card = [...host.querySelectorAll(".ScopeTreeNode")].find(
      (row) => row.querySelector(".label")!.textContent === "Card"
    )!
    card.querySelector<HTMLElement>(".opener")!.click()
    flush()
    expect(treeLabels(host)).not.toContain("suit")
  })

  test("a description can be edited and saved -- not when `readonly`", async () => {
    const onSaveDescription = vi.fn()
    const host = await mount({ onSaveDescription })
    await settle()
    flush()
    host.querySelector<HTMLElement>(".Description")!.click()
    flush()
    const textarea = host.querySelector<HTMLTextAreaElement>(".Description.editing textarea")!
    expect(textarea.value).toBe("A playing card.")
    textarea.value = "A card to play with."
    textarea.dispatchEvent(new InputEvent("input", { bubbles: true }))
    textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", metaKey: true, bubbles: true }))
    flush()
    expect(onSaveDescription).toHaveBeenCalledWith({ uri: "file:///cards/Card.spell", line: 3 }, "A card to play with.")
    expect(host.querySelector(".Description")!.textContent).toContain("A card to play with.")

    const readonly = await mount({ onSaveDescription, readonly: true })
    await settle()
    flush()
    expect(readonly.querySelector(".Description.editable")).toBeNull()
  })
})

/** Render a `<TypeExplorer>` of `ENTRIES`, the card selected;  unmounted after the test. */
async function mount(props: Partial<TypeExplorerProps>): Promise<HTMLElement> {
  await uiReady
  const host = document.createElement("div")
  document.body.append(host)
  const state: TypeExplorerState = { selected: CARD, open: ["project:Cards", "project:Cards/file:Card.spell", CARD] }
  const dispose = render(
    () => (
      <TypeExplorer
        // a NEW tree on every read of the prop:  pins `currentTree()` -- without it, details are asked for forever
        tree={buildScopeTree(ENTRIES)}
        state={state}
        onStateChange={() => {}}
        onOpen={() => {}}
        loadDetails={async (path) => (path === CARD ? CARD_DETAILS : null)}
        {...props}
      />
    ),
    host
  )
  cleanups.push(() => {
    dispose()
    host.remove()
  })
  flush()
  await ElementFixture.settle(host)
  return host
}

/** The details section titled `title`. */
function sectionTitled(host: HTMLElement, title: string): HTMLElement | undefined {
  return [...host.querySelectorAll<HTMLElement>(".DetailsSection")].find(
    (section) => section.querySelector(".DetailsSectionTitle")!.childNodes[1]?.textContent === title
  )
}

/** Labels of the tree's rows. */
function treeLabels(host: HTMLElement): string[] {
  return [...host.querySelectorAll(".ScopeTreeNode .label")].map((label) => label.textContent ?? "")
}

/** Let the details' promise settle. */
function settle() {
  return new Promise<void>((resolve) => setTimeout(resolve))
}
