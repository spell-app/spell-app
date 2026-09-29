import { describe, test, expect, beforeAll } from "vitest"
import { copyFileSync, cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { resolve } from "path"
import { pathToFileURL } from "url"

import { SP } from "~/languages/spell"
import { LSP } from "~/lsp"
import { SpellDiskWorkspace } from "~/lsp/SpellDiskWorkspace"
import { installDiskFetch, locationForDiskPath } from "~/server/disk-fetch"
import { fixturePath } from "~/test"

/** The scope tree of a temp copy of the Solitaire example, as a scope explorer sees it. */
describe("ScopeExplorer", () => {
  const dir = mkdtempSync(resolve(tmpdir(), "spell-scopes-"))
  cpSync(fixturePath("Solitaire"), resolve(dir, "Solitaire"), { recursive: true })
  const cardPath = resolve(dir, "Solitaire/Card.spell")
  const cardUri = pathToFileURL(cardPath).href
  const workspace = new SpellDiskWorkspace()
  const explorer = new LSP.ScopeExplorer(new LSP.SpellLanguageService(workspace))
  let project: SP.SpellProject
  let tree: LSP.ScopeNode

  beforeAll(async () => {
    await workspace.update(cardUri, readFileSync(cardPath, "utf8"))
    project = workspace.fileFor(cardUri)!.project as SP.SpellProject
    tree = explorer.tree(project)
  })

  /** Details of the node named `name`, or of the node or member `it`. */
  function details(it: string | { id: string }) {
    return explorer.details(project, typeof it === "string" ? find(tree, it).id : it.id)!
  }

  test("root holds the built-in types, then the project:  its files, and what each declares", () => {
    expect(outline(tree, 3)).toMatchSnapshot()
  })

  test("a type's members:  properties, actions, then each enumeration and its constants -- each with hover markdown", () => {
    const card = find(tree, "Card")
    expect(card.detail).toBe("is a Thing")
    expect(details(card).hover).toContain("type **Card**")
    expect(card.members.map(({ name, kind }) => `${kind} ${name}`)).toMatchSnapshot()
    const suit = card.members.find((member) => member.name === "suit")!
    expect(details(suit).hover).toContain("property **suit** of Card")
    expect(details(suit).location?.uri).toBe(cardUri)
  })

  test("a sub-type shows what it inherits, and from where", () => {
    const stock = find(tree, "Stock_Pile")
    const inherited = stock.members.filter((member) => member.inheritedFrom)
    expect(inherited.length).toBeGreaterThan(0)
    expect(new Set(inherited.map((member) => member.inheritedFrom))).toEqual(new Set(["Pile"]))
  })

  test("ids are unique", () => {
    const ids = [...all(tree)].map((node) => node.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test("a declaration's details:  its docstring, spell source and compiled javascript", () => {
    expect(find(tree, "suit").id).toBe("spellRoot/Solitaire/Card.spell/Card/property:suit")
    const suit = details("suit")
    expect(suit.summary).toBe("property **suit** of Card")
    expect(suit.description).toBe("card suits")
    expect(suit.spell).toBe("cards have a suit as one of clubs, diamonds, hearts or spades")
    expect(suit.compiled).toContain("property: 'suit'")
    expect(suit.descriptionAt).toEqual({ uri: cardUri, position: { line: 8, character: 0 } })
  })

  test("details are worked out once per parse of their file -- and not in the tree", () => {
    expect(details("suit")).toBe(details("suit"))
    expect(find(tree, "suit")).not.toHaveProperty("spell")
    expect(explorer.details(project, "no/such/node")).toBeNull()
  })

  test("a test method is named with its `test`", () => {
    expect(find(tree, "test card setup").kind).toBe("function")
  })

  test("constants show on the type whose statement declared them, NOT the project", () => {
    expect(find(tree, "Solitaire").members.map((member) => member.name)).not.toContain("ace")
    expect(find(tree, "ace").id).toBe("spellRoot/Solitaire/Card.spell/Card/constant:ace")
  })

  test("a node lists the rules its statement made", () => {
    expect({ Suits: details("Suits").rules, "draw (a card)": details("draw (a card)").rules }).toMatchSnapshot()
  })

  describe("`descriptionEdits()`", () => {
    const service = () => explorer.service
    const card = () => workspace.fileFor(cardUri)!

    test("replaces the comment lines above it, one `//` line per line", () => {
      const { position } = details("suit").descriptionAt!
      expect(service().descriptionEdits(card(), position, "the suit\nof a card")).toEqual([
        {
          range: { start: { line: 7, character: 0 }, end: { line: 8, character: 0 } },
          newText: "// the suit\n// of a card\n"
        }
      ])
    })

    test("empty text removes them", () => {
      const { position } = details("suit").descriptionAt!
      expect(service().descriptionEdits(card(), position, "  ")).toEqual([
        { range: { start: { line: 7, character: 0 }, end: { line: 8, character: 0 } }, newText: "" }
      ])
    })

    test("a `##` heading docstring:  shown as markdown, and replaced keeping its level", () => {
      const cardNode = details("Card")
      expect(cardNode.description).toBe("## definition of a Card with nice english aliases for working with it")
      const { position } = cardNode.descriptionAt!
      expect(position).toEqual({ line: 1, character: 0 })
      const heading = { start: { line: 0, character: 0 }, end: { line: 1, character: 0 } }
      expect(service().descriptionEdits(card(), position, "## a playing card\nwith a rank")).toEqual([
        { range: heading, newText: "## a playing card\n// with a rank\n" }
      ])
      // without its `##`, it's just a comment
      expect(service().descriptionEdits(card(), position, "a playing card")).toEqual([
        { range: heading, newText: "// a playing card\n" }
      ])
    })

    test("a file's docstring:  `#` heading comments at its top -- added as a `#` heading", () => {
      expect(details("Card.spell").description).toBeUndefined()
      expect(details("Card.spell").descriptionAt).toEqual({
        uri: cardUri,
        position: { line: 0, character: 0 },
        file: true
      })
      const top = { line: 0, character: 0 }
      expect(service().fileDescriptionEdits(card(), "Cards\nfor solitaire")).toEqual([
        { range: { start: top, end: top }, newText: "# Cards\n// for solitaire\n" }
      ])
    })

    test("`null` where no declaration starts", () => {
      expect(service().descriptionEdits(card(), { line: 7, character: 0 }, "x")).toBeNull()
    })
  })
})

/**
 * A project importing another COMPILED:  its node shows that project's own parse, sources and all.
 * - Solitaire split in two, in a temp `@workspace`, as `SpellProject.imports.test.ts` does.
 */
describe("ScopeExplorer of a project importing another, compiled", () => {
  const solitaire = fixturePath("Solitaire")
  const workspace = mkdtempSync(resolve(tmpdir(), "spell-scopes-imports-"))
  const disk = new SpellDiskWorkspace()
  const explorer = new LSP.ScopeExplorer(new LSP.SpellLanguageService(disk))
  let lib: SP.SpellProject
  let app: SP.SpellProject
  let tree: LSP.ScopeNode

  beforeAll(async () => {
    installDiskFetch()
    lib = makeProject("lib", ["Card.spell", "Deck.spell", "Pile.spell"])
    await lib.compile()
    app = makeProject("app", ["Solitaire.spell"], [{ path: lib.projectId, active: true }])
    await app.parse()
    // as the server does, before asking for the tree
    for (const imported of LSP.ScopeExplorer.importedProjects(app)) await imported.parse()
    tree = explorer.tree(app)
  })

  test("the imported project shows, with its own files and types, ahead of ours", () => {
    expect(outline(tree, 3)).toMatchSnapshot()
  })

  test("its types are from its sources:  docs and locations", () => {
    const suit = find(tree, "Card").members.find((member) => member.name === "suit")!
    expect(explorer.details(app, suit.id)?.location?.uri).toMatch(/\/lib\/Card\.spell$/)
  })

  test("our types inherit from its OWN types, from its sources -- with their docs and locations", () => {
    const stock = find(tree, "Stock_Pile")
    const fromPile = stock.members.filter((member) => member.inheritedFrom === "Pile")
    expect(fromPile.length).toBeGreaterThan(0)
    // pointing at the members of its OWN Pile, in the imported project -- NOT the declarations-only one
    for (const member of fromPile) expect(member.id).toMatch(/^spellRoot\/lib\/Pile\.spell\/Pile\//)
    expect(explorer.details(app, fromPile[0]!.id)?.location?.uri).toMatch(/\/lib\/Pile\.spell$/)
  })

  test("once tracked, the imported project's files changing on disk show next time -- as the server does", async () => {
    await disk.track(lib)
    const cardPath = resolve(workspace, "lib", "Card.spell")
    writeFileSync(cardPath, `${readFileSync(cardPath, "utf8")}\ncards have a weight as a number\n`)
    await disk.diskChanged(pathToFileURL(cardPath).href, "changed")
    const card = find(explorer.tree(app), "Card")
    expect(card.members.map((member) => member.name)).toContain("weight")
  })

  test("a compiled-only import -- no sources:  our types inherit its methods from its declarations", async () => {
    const cards = makeProject("cards", ["Card.spell", "Deck.spell", "Pile.spell"])
    await cards.compile()
    const game = makeProject("game", [], [{ path: cards.projectId, active: true }], {
      "Joker.spell": "a joker is a card\n"
    })
    await game.parse()
    // as if we had its compiled file, but not its sources
    cards.scope = undefined
    const joker = find(explorer.tree(game), "Joker")
    const fromCard = joker.members.filter((member) => member.inheritedFrom === "Card")
    expect(fromCard.map((member) => member.kind)).toContain("method")
    expect(fromCard.map((member) => member.name)).toContain("turn (a card) over")
    // ids of their own, NOT the Joker's
    for (const member of fromCard) expect(member.id).toMatch(/\/game\/import:Card\//)
    const method = fromCard.find((member) => member.kind === "method")!
    expect(explorer.details(game, method.id)?.summary).toContain("method")
  })

  /** Project `name` in the workspace:  `spellFiles` copied from Solitaire, then `written` ones, after `imports`. */
  function makeProject(
    name: string,
    spellFiles: string[],
    imports: unknown[] = [],
    written: Record<string, string> = {}
  ) {
    const dir = resolve(workspace, name)
    mkdirSync(dir)
    for (const file of spellFiles) copyFileSync(resolve(solitaire, file), resolve(dir, file))
    for (const [file, text] of Object.entries(written)) writeFileSync(resolve(dir, file), text)
    const files = [...spellFiles, ...Object.keys(written)].map((file) => ({ path: `/${file}`, active: true }))
    writeFileSync(resolve(dir, SP.PROJECT_FILE), JSON.stringify({ imports: [...imports, ...files] }))
    const root = locationForDiskPath(resolve(dir, SP.PROJECT_FILE))!.projectRoot
    return new SP.SpellProject(`${root}:${name}`)
  }
})

/** `node` and its descendants, `depth` levels down, as indented `kind name (detail)` lines. */
function outline(node: LSP.ScopeNode, depth: number, indent = ""): string {
  const line = `${indent}${node.kind} ${node.name}${node.detail ? ` (${node.detail})` : ""}`
  if (!depth) return line
  return [line, ...node.children.map((child) => outline(child, depth - 1, `${indent}  `))].join("\n")
}

/** Node named `name` in `tree`. */
function find(tree: LSP.ScopeNode, name: string): LSP.ScopeNode {
  const found = [...all(tree)].find((node) => node.name === name)
  if (!found) throw new Error(`No scope node '${name}'`)
  return found
}

/** `node` and every node below it. */
function* all(node: LSP.ScopeNode): Generator<LSP.ScopeNode> {
  yield node
  for (const child of node.children) yield* all(child)
}
