import { describe, test, expect } from "vitest"
import { renderToString } from "@solidjs/web"

import { buildScopeTree, type ScopeEntry } from "$/lsp/lsp.types"
import type { ScopeOrder } from "$/app/ui/ui.types"
import { TypeExplorer } from "./TypeExplorer"

/**
 * The Solid `<TypeExplorer>` drawn as HTML -- the same cases as React's `$/app/ui/TypeExplorer.test.tsx`.
 * - Node, so Solid's SERVER build:  `renderToString`, no DOM, effects never run (details stay "Loading…").
 * - `<ui-*>` tags render as plain tags with their attributes:  nothing defines them here.
 */

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

/** `<TypeExplorer>` drawn as HTML in `order`, the card selected and open. */
function draw(order: ScopeOrder) {
  const card = "project:Cards/file:Card.spell/type:Card"
  const state = { order, selected: card, open: ["project:Cards", "project:Cards/file:Card.spell", card] }
  return renderToString(() => (
    <TypeExplorer
      tree={buildScopeTree(ENTRIES)}
      state={state}
      onStateChange={() => {}}
      onOpen={() => {}}
      loadDetails={async () => null}
    />
  ))
}

/** Text of each tree row and marker in `html`, in order -- rows by their label. */
function treeLines(html: string): string[] {
  const tree = html.slice(html.indexOf("ScopesPane"), html.indexOf("DetailsPane"))
  const lines = tree.matchAll(/class="(SectionMarker[^"]*)"[^>]*>([^<]*)<|<ui-icon [^>]*><\/ui-icon>([^<]+)</g)
  return [...lines].map(([, marker, section, label]) => (marker ? `-- ${section || "(rule)"}` : label!))
}

describe("<TypeExplorer> (Solid)", () => {
  test("says to run the project, before there's a tree", () => {
    const html = renderToString(() => <TypeExplorer onOpen={() => {}} loadDetails={async () => null} state={{}} />)
    expect(html).toContain("Run the project to see its scopes.")
  })

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
    expect(draw("document")).toMatch(/class="order active" title="Document order[^"]*"/)
    expect(draw("document")).toMatch(/class="order" title="Alphabetical"/)
    expect(draw("alphabetical")).toMatch(/class="order active" title="Alphabetical"/)
  })

  test("details:  breadcrumbs down to the selected node, the root left out", () => {
    const html = draw("document")
    const crumbs = [...html.matchAll(/class="crumb( current)?"><ui-icon [^>]*><\/ui-icon>([^<]+)</g)]
    expect(crumbs.map(([, current, name]) => (current ? `[${name}]` : name))).toEqual(["Cards", "Card.spell", "[Card]"])
  })
})
