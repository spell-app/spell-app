/** @jsxImportSource react */
import { describe, test, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"

import { buildScopeTree, type ScopeEntry } from "$/lsp/lsp.types"
import type { ScopeOrder } from "./ui.types"
import { TypeExplorer } from "./TypeExplorer"

/** A card's entries, in document order, as `LSP.ScopeExplorer` lists them -- sections from `##` headings. */
const ENTRIES: ScopeEntry[] = [
  { path: "project:Cards" },
  { path: "project:Cards/file:Card.spell" },
  { path: "project:Cards/file:Card.spell/type:Card" },
  { path: "project:Cards/file:Card.spell/type:Card/property:suit", section: "properties of cards" },
  { path: "project:Cards/file:Card.spell/type:Card/property:rank", section: "properties of cards" },
  { path: "project:Cards/file:Card.spell/type:Card/method:turn over", section: "actions" },
  { path: "project:Cards/file:Card.spell/type:Card/method:flip", section: "actions" },
  { path: "project:Cards/file:Card.spell/type:Card/property:name" }
]

/** `<TypeExplorer>` drawn as HTML in `order`, the card selected and open -- no DOM, so its effects never run. */
function draw(order: ScopeOrder) {
  const card = "project:Cards/file:Card.spell/type:Card"
  const state = { order, selected: card, open: ["project:Cards", "project:Cards/file:Card.spell", card] }
  return renderToStaticMarkup(
    <TypeExplorer
      tree={buildScopeTree(ENTRIES)}
      state={state}
      onStateChange={() => {}}
      onOpen={() => {}}
      loadDetails={async () => null}
    />
  )
}

/** Text of each tree row and marker in `html`, in order -- rows by their label. */
function treeLines(html: string): string[] {
  const tree = html.slice(html.indexOf("ScopesPane"), html.indexOf("DetailsPane"))
  const lines = tree.matchAll(/class="(SectionMarker[^"]*)"[^>]*>([^<]*)<|<i [^>]*><\/i>([^<]+)</g)
  return [...lines].map(([, marker, section, label]) => (marker ? `-- ${section || "(rule)"}` : label!))
}

describe("<TypeExplorer>", () => {
  test("document order:  as declared, with a marker for each heading -- a plain rule where there's none", () => {
    expect(treeLines(draw("document"))).toEqual([
      "Spell",
      "Cards",
      "Card.spell",
      "Card",
      "-- properties of cards",
      "suit",
      "rank",
      "-- actions",
      "turn over",
      "flip",
      "-- (rule)",
      "name"
    ])
  })

  test("alphabetical:  a type's members by kind, each alphabetical -- no markers", () => {
    const html = draw("alphabetical")
    expect(html).not.toContain("SectionMarker")
    expect(treeLines(html)).toEqual(["Spell", "Cards", "Card.spell", "Card"])
    expect(html).toMatch(/Properties <span class="detail">3<.*Actions <span class="detail">2</)
  })

  test("the button for the order it's in is active", () => {
    expect(draw("document")).toMatch(/title="Document order[^"]*"[^>]*class="[^"]*order active"/)
    expect(draw("document")).toMatch(/title="Alphabetical"[^>]*class="[^"]*order"/)
    expect(draw("alphabetical")).toMatch(/title="Alphabetical"[^>]*class="[^"]*order active"/)
  })
})
