import { describe, expect, test } from "vitest"

import { scopesFromPacks } from "~/app/runner"

/** A scope pack's details, with `spell` and `compiled` worked out when shown -- see `scopesFromPacks()`. */
describe("scopesFromPacks()", () => {
  const SOURCE = "## cards\na card is a thing\n\n// its suit\ncards have a suit as one of clubs or hearts\n"
  const COMPILED = [
    `import { spellCore, Thing } from "@spell/core"`,
    `/*! SPELL: DECLARES {\n  type: "Card", superType: "Thing",\n  defined: "/Card.spell:9-26",\n} */`,
    `export class Card extends Thing {}`,
    `/*! SPELL: DECLARES {\n  property: "suit", of: "Card",\n  defined: "/Card.spell:40-84",\n} */`,
    `spellCore.defineProperty(Card.prototype, { property: 'suit' })`,
    `// -----------`,
    `/*! SPELL: DECLARES {\n  type: "Pile",\n  defined: "/Pile.spell:0-16",\n} */`,
    `export class Pile extends Thing {}`
  ].join("\n")
  const pack = {
    id: "@test:fixtures:Cards",
    entries: [
      { path: "project:Cards" },
      { path: "project:Cards/file:Card.spell", uri: "spell:/@test:fixtures:Cards/Card.spell" },
      { path: "project:Cards/file:Card.spell/type:Card", super: "type:Thing", line: 2, description: "## cards" },
      { path: "project:Cards/file:Card.spell/type:Card/property:suit", line: 5, description: "its suit" }
    ]
  }
  const builtIns = { id: "@spell/core", entries: [{ path: "type:Thing" }] }

  test("the tree, from the built-ins' pack and the project's", () => {
    const { tree } = scopesFromPacks([builtIns, pack])
    expect(tree.children.map((node) => node.path)).toEqual(["type:Thing", "project:Cards"])
    const card = tree.children[1]!.children[0]!.children[0]!
    expect(card).toMatchObject({ name: "Card", kind: "type", detail: "is a Thing" })
    expect(card.uri).toBe("spell:/@test:fixtures:Cards/Card.spell")
  })

  test("`spell` from the source's lines, `compiled` from the code after its marker -- up to the next", async () => {
    const asked: string[] = []
    const scopes = scopesFromPacks([builtIns, pack], {
      loadSource: async (uri) => (asked.push(uri), SOURCE),
      loadCompiled: async (projectId) => (projectId === pack.id ? COMPILED : undefined)
    })
    expect(await scopes.details("project:Cards/file:Card.spell/type:Card")).toMatchObject({
      spell: "a card is a thing",
      compiled: "export class Card extends Thing {}"
    })
    const suit = await scopes.details("project:Cards/file:Card.spell/type:Card/property:suit")
    expect(suit).toMatchObject({
      description: "its suit",
      spell: "cards have a suit as one of clubs or hearts",
      compiled: "spellCore.defineProperty(Card.prototype, { property: 'suit' })"
    })
    // each file asked for once
    expect(asked).toEqual(["spell:/@test:fixtures:Cards/Card.spell"])
  })

  test("without the sources:  `compiled` by each marker's `line`, but no `spell`", async () => {
    const withLines = COMPILED.replace('defined: "/Card.spell:9-26"', 'line: 2, defined: "/Card.spell:9-26"')
    const scopes = scopesFromPacks([builtIns, pack], { loadCompiled: async () => withLines })
    const card = await scopes.details("project:Cards/file:Card.spell/type:Card")
    expect(card).not.toHaveProperty("spell")
    expect(card).toMatchObject({ line: 2, description: "## cards", compiled: "export class Card extends Thing {}" })
    // a marker with no `line`, and no source to work it out from
    expect(await scopes.details("project:Cards/file:Card.spell/type:Card/property:suit")).not.toHaveProperty("compiled")
  })

  test("without sources or compiled output, just what the pack says", async () => {
    const scopes = scopesFromPacks([builtIns, pack])
    const card = await scopes.details("project:Cards/file:Card.spell/type:Card")
    expect(card).not.toHaveProperty("spell")
    expect(card).toMatchObject({ line: 2, description: "## cards" })
    expect(await scopes.details("no/such/path")).toBeNull()
  })
})
