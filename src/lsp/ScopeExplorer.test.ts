import { describe, test, expect, beforeAll } from "vitest"
import { copyFileSync, cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { resolve } from "path"
import { pathToFileURL } from "url"

import environment from "~/environment"
import { SP } from "~/languages/spell"
import { LSP } from "~/lsp"
import { SpellDiskWorkspace } from "~/lsp/SpellDiskWorkspace"
import { installDiskFetch, locationForDiskPath } from "~/server/disk-fetch"

/** The scope tree of a temp copy of the Solitaire example, as a scope explorer sees it. */
describe("ScopeExplorer", () => {
  const dir = mkdtempSync(resolve(tmpdir(), "spell-scopes-"))
  cpSync(resolve(environment.srcDir, "examples/Solitaire"), resolve(dir, "Solitaire"), { recursive: true })
  const cardPath = resolve(dir, "Solitaire/Card.spell")
  const cardUri = pathToFileURL(cardPath).href
  const workspace = new SpellDiskWorkspace()
  const explorer = new LSP.ScopeExplorer(new LSP.SpellLanguageService(workspace))
  let tree: LSP.ScopeNode

  beforeAll(async () => {
    await workspace.update(cardUri, readFileSync(cardPath, "utf8"))
    tree = explorer.tree(workspace.fileFor(cardUri)!.project as SP.SpellProject)
  })

  test("root holds the built-in types, then the project:  its files, and what each declares", () => {
    expect(outline(tree, 3)).toMatchSnapshot()
  })

  test("a type's members:  properties, actions, then each enumeration and its constants -- each with hover markdown", () => {
    const card = find(tree, "Card")
    expect(card.detail).toBe("is a Thing")
    expect(card.hover).toContain("type **Card**")
    expect(card.members.map(({ name, kind }) => `${kind} ${name}`)).toMatchSnapshot()
    const suit = card.members.find((member) => member.name === "suit")!
    expect(suit.hover).toContain("property **suit** of Card")
    expect(suit.location?.uri).toBe(cardUri)
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

  test("a declaration's node has its docstring, spell source and compiled javascript", () => {
    const suit = find(tree, "suit")
    expect(suit.id).toBe("spellRoot/Solitaire/Card.spell/Card/property:suit")
    expect(suit.summary).toBe("property **suit** of Card")
    expect(suit.description).toBe("card suits")
    expect(suit.spell).toBe("cards have a suit as one of clubs, diamonds, hearts or spades")
    expect(suit.compiled).toContain("property: 'suit'")
    expect(suit.descriptionAt).toEqual({ uri: cardUri, position: { line: 8, character: 0 } })
  })

  test("a test method is named with its `test`", () => {
    expect(find(tree, "test card setup").kind).toBe("function")
  })

  test("constants show on the type whose statement declared them, NOT the project", () => {
    expect(find(tree, "Solitaire").members.map((member) => member.name)).not.toContain("ace")
    expect(find(tree, "ace").id).toBe("spellRoot/Solitaire/Card.spell/Card/constant:ace")
  })

  test("a node lists the rules its statement made", () => {
    expect({ Suits: find(tree, "Suits").rules, "draw (a card)": find(tree, "draw (a card)").rules }).toMatchSnapshot()
  })

  describe("`descriptionEdits()`", () => {
    const service = () => explorer.service
    const card = () => workspace.fileFor(cardUri)!

    test("replaces the comment lines above it, one `//` line per line", () => {
      const { position } = find(tree, "suit").descriptionAt!
      expect(service().descriptionEdits(card(), position, "the suit\nof a card")).toEqual([
        {
          range: { start: { line: 7, character: 0 }, end: { line: 8, character: 0 } },
          newText: "// the suit\n// of a card\n"
        }
      ])
    })

    test("empty text removes them", () => {
      const { position } = find(tree, "suit").descriptionAt!
      expect(service().descriptionEdits(card(), position, "  ")).toEqual([
        { range: { start: { line: 7, character: 0 }, end: { line: 8, character: 0 } }, newText: "" }
      ])
    })

    test("a `##` heading docstring:  shown as markdown, and replaced keeping its level", () => {
      const cardNode = find(tree, "Card")
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
      expect(find(tree, "Card.spell").description).toBeUndefined()
      expect(find(tree, "Card.spell").descriptionAt).toEqual({
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
  const solitaire = resolve(environment.srcDir, "examples/Solitaire")
  const workspace = mkdtempSync(resolve(tmpdir(), "spell-scopes-imports-"))
  const explorer = new LSP.ScopeExplorer(new LSP.SpellLanguageService(new SpellDiskWorkspace()))
  let tree: LSP.ScopeNode

  beforeAll(async () => {
    installDiskFetch()
    const lib = makeProject("lib", ["Card.spell", "Deck.spell", "Pile.spell"])
    await lib.compile()
    const app = makeProject("app", ["Solitaire.spell"], [{ path: lib.projectId, active: true }])
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
    expect(suit.location?.uri).toMatch(/\/lib\/Card\.spell$/)
  })

  /** Project `name` in the workspace:  `spellFiles` copied from Solitaire, after `imports`. */
  function makeProject(name: string, spellFiles: string[], imports: unknown[] = []) {
    const dir = resolve(workspace, name)
    mkdirSync(dir)
    for (const file of spellFiles) copyFileSync(resolve(solitaire, file), resolve(dir, file))
    const files = spellFiles.map((file) => ({ path: `/${file}`, active: true }))
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
