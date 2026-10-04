import { describe, expect, test } from "vite-plus/test"

import { scopesFromPacks } from "$/app/runner"

/** A scope pack's details, with `spell` and `compiled` worked out when shown -- see `scopesFromPacks()`. */
describe("scopesFromPacks()", () => {
  const SOURCE = "## cards\na card is a thing\n\n// its suit\ncards have a suit as one of clubs or hearts\n"
  const CARD_CLASS = [
    `export class Card extends Thing {`,
    `  /** its suit */`,
    `  /*! SPELL: DECLARES {\n    property: "suit", of: "Card",\n    defined: "/Card.spell:40-84",\n  } */`,
    `  get suit() { return this.getProp('suit') }`,
    `  set suit(value) { this.setProp('suit', value) }`,
    `}`
  ]
  const COMPILED = [
    `import { spellCore, Thing } from "@spell/core"`,
    `/*! SPELL: DECLARES {\n  type: "Card", superType: "Thing",\n  defined: "/Card.spell:9-26",\n} */`,
    ...CARD_CLASS,
    `/** a pile of cards */`,
    `/*! SPELL: DECLARES {\n  type: "Deck",\n  defined: "/Card.spell:86-100",\n} */`,
    `export class Deck extends Thing {}`,
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

  test("`spell` from the source's lines, `compiled` from the code after its marker -- up to the next at its indent", async () => {
    const asked: string[] = []
    const scopes = scopesFromPacks([builtIns, pack], {
      loadSource: async (uri) => (asked.push(uri), SOURCE),
      loadCompiled: async (projectId) => (projectId === pack.id ? COMPILED : undefined)
    })
    // the whole class, without its members' markers -- and NOT the next declaration's docstring
    expect(await scopes.details("project:Cards/file:Card.spell/type:Card")).toMatchObject({
      spell: "a card is a thing",
      compiled: CARD_CLASS.filter((line) => !line.includes("SPELL: DECLARES")).join("\n")
    })
    // a member:  up to the `}` closing its class, dedented
    const suit = await scopes.details("project:Cards/file:Card.spell/type:Card/property:suit")
    expect(suit).toMatchObject({
      description: "its suit",
      spell: "cards have a suit as one of clubs or hearts",
      compiled: "get suit() { return this.getProp('suit') }\nset suit(value) { this.setProp('suit', value) }"
    })
    // each file asked for once
    expect(asked).toEqual(["spell:/@test:fixtures:Cards/Card.spell"])
  })

  test("without the sources:  `compiled` by what each marker declares, but no `spell`", async () => {
    const scopes = scopesFromPacks([builtIns, pack], { loadCompiled: async () => COMPILED })
    const card = await scopes.details("project:Cards/file:Card.spell/type:Card")
    expect(card).not.toHaveProperty("spell")
    expect(card).toMatchObject({ line: 2, description: "## cards" })
    expect(card?.compiled).toMatch(/^export class Card extends Thing \{\n/)
    expect(await scopes.details("project:Cards/file:Card.spell/type:Card/property:suit")).toMatchObject({
      compiled: "get suit() { return this.getProp('suit') }\nset suit(value) { this.setProp('suit', value) }"
    })
  })

  test("each kind of thing a marker declares, named as the pack names it", async () => {
    const marker = (props: string, defined: string) =>
      `/*! SPELL: DECLARES {\n  ${props},\n  defined: "${defined}",\n} */`
    const compiled = [
      marker(
        `property: "rank", classVariable: "Ranks", rule: "enumeration", of: "Card", enumeration: ["'ace'", 2]`,
        "/Card.spell:0-9"
      ),
      "static Ranks = ['ace', 2]",
      marker(
        `syntax: "{operator:is} face up", output: "is_face_up", of: "Card", kind: "method", name: '"is face up"'`,
        "/Card.spell:10-19"
      ),
      "get is_face_up() {}",
      marker(
        `syntax: "draw {thisArg:expression}", of: "Card", kind: "method", name: "draw (a card)"`,
        "/Card.spell:20-29"
      ),
      "draw() {}",
      marker(`property: "color", of: "Card", constants: ["red"]`, "/Card.spell:30-39"),
      "get color() {}",
      marker(`syntax: "debug the game", output: "debug_the_game", kind: "function"`, "/Card.spell:40-49"),
      "export function debug_the_game() {}"
    ].join("\n")
    const uri = "spell:/@test:fixtures:Kinds/Card.spell"
    const paths = [
      "type:Card/enumeration:Ranks",
      "type:Card/constant:ace",
      "type:Card/method:is face up",
      "type:Card/method:draw (a card)",
      "type:Card/constant:red",
      "function:debug the game"
    ].map((path) => `project:Kinds/file:Card.spell/${path}`)
    const kinds = { id: "@test:fixtures:Kinds", entries: paths.map((path) => ({ path, uri })) }
    const scopes = scopesFromPacks([kinds], { loadCompiled: async () => compiled })
    const found = await Promise.all(paths.map(async (path) => (await scopes.details(path))?.compiled))
    expect(found).toEqual([
      "static Ranks = ['ace', 2]",
      "static Ranks = ['ace', 2]",
      "get is_face_up() {}",
      "draw() {}",
      "get color() {}",
      "export function debug_the_game() {}"
    ])
  })

  test("without sources or compiled output, just what the pack says", async () => {
    const scopes = scopesFromPacks([builtIns, pack])
    const card = await scopes.details("project:Cards/file:Card.spell/type:Card")
    expect(card).not.toHaveProperty("spell")
    expect(card).toMatchObject({ line: 2, description: "## cards" })
    expect(await scopes.details("no/such/path")).toBeNull()
  })
})
