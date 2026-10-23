import { describe, test, expect, beforeAll } from "vite-plus/test"
import { copyFileSync, cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { resolve } from "path"
import { pathToFileURL } from "url"
import { runInNewContext } from "vm"

import environment from "spell-app/spaces/server/node/environment"
import { SP } from "spell-parser/spell"
import { LSP } from "spell-app/lsp"
import { SpellDiskWorkspace } from "spell-app/lsp/SpellDiskWorkspace"
import { installDiskFetch, locationForDiskPath } from "spell-app/spaces/server/node/projects/disk-fetch"
import { scopesFromPacks } from "spell-app/lsp/ScopesSource"
import { compiledSpellProject } from "spell-parser/spell/test"
import { copyFixtureProject, fixtureFolder, lineOf, loadFixtureProject } from "spell-app/spaces/test"

/** The Solitaire example's Card.spell:  the tests name its lines by what they say (`lineOf()`), as it changes. */
const CARD_TEXT = readFileSync(fixtureFolder("Solitaire", "Card.spell"), "utf8")
/** Its line declaring the card's type. */
const CARD_TYPE = 'a "card" is'
/** Its line declaring the card's suit, whose node is `suit`. */
const SUIT = '- its "suit" is one of'
/** The `##` heading the card's suit is under:  its section, and its docstring. */
const SUIT_HEADING = "card suit"

/**
 * The scope tree of a temp copy of the Solitaire example, as a scope explorer sees it:
 * its cards, deck and piles and its game, ONE project -- see `copyFixtureProject()`.
 */
describe("ScopeExplorer", () => {
  const dir = mkdtempSync(resolve(tmpdir(), "spell-scopes-"))
  copyFixtureProject("Solitaire", resolve(dir, "Solitaire"))
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
  function details(it: string | { path: string }) {
    return explorer.details(project, typeof it === "string" ? find(tree, it).path : it.path)!
  }

  test("root holds the built-in types, then the project:  its files, and what each declares", () => {
    expect(outline(tree, 3)).toMatchSnapshot()
  })

  test("a type's members:  in document order, by file then line -- each with its line", () => {
    const card = find(tree, "Card")
    expect(card.detail).toBe("is a Drawable")
    expect(card.super).toBe("type:Drawable")
    // its first line, to the last of its outline
    const declared = lineOf(CARD_TEXT, CARD_TYPE)
    expect(details(card).line).toEqual([declared, outlineEnd(CARD_TEXT, declared)])
    expect(card.members.map(({ name, kind }) => `${kind} ${name}`)).toMatchSnapshot()
    const suit = card.members.find((member) => member.name === "suit")!
    expect(details(suit).line).toBe(lineOf(CARD_TEXT, SUIT))
    // in its node's file, so no `uri` of its own
    expect(details(suit).uri).toBeUndefined()
    expect(find(tree, "suit").uri).toBe(cardUri)
  })

  test("each member's section:  the heading it's under, in the file it's declared in", () => {
    const card = find(tree, "Card")
    const sectionOf = (name: string) => card.members.find((member) => member.name === name)!.section
    expect(sectionOf("suit")).toBe(SUIT_HEADING)
    expect(sectionOf("name")).toBe("specific cards")
    expect(sectionOf("turn it over")).toBe("turning the card over")
    expect(find(tree, "suit").section).toBe(SUIT_HEADING)
  })

  test("a sub-type shows what it inherits, and from where", () => {
    const stock = find(tree, "StockPile")
    const inherited = stock.members.filter((member) => member.inheritedFrom)
    expect(inherited.length).toBeGreaterThan(0)
    // a pile is a list:  so a list's built-in members too, e.g. its `length`
    expect(new Set(inherited.map((member) => member.inheritedFrom))).toEqual(new Set(["Pile", "List"]))
  })

  test("paths are unique -- and say what each node is", () => {
    const nodes = [...all(tree)].filter((node) => node.kind !== "root")
    expect(new Set(nodes.map((node) => node.path)).size).toBe(nodes.length)
    for (const node of nodes) {
      const { kind, name } = LSP.scopeSegment(node.path)
      expect(kind).toBe(node.kind)
      // a node may say its name as written, e.g. `short-suit` for `property:short_suit`
      expect(LSP.SpellLanguageService.sameName(name, node.name), node.path).toBe(true)
    }
  })

  test("a declaration's details:  its docstring, spell source and compiled javascript", () => {
    expect(find(tree, "suit").path).toBe("project:Solitaire/file:Card.spell/type:Card/property:suit")
    const suit = details("suit")
    // the heading above it:  its docstring, as a comment there would be
    expect(suit.description).toBe(`## ${SUIT_HEADING}`)
    const line = lineOf(CARD_TEXT, SUIT)
    expect(suit.spell).toBe(CARD_TEXT.split("\n")[line - 1])
    expect(suit.compiled).toContain('declareProp("suit"')
    expect(suit.line).toBe(line)
  })

  test("`line`:  a statement with a body is on its first and last lines", () => {
    const method = [...all(tree)].find((node) => node.kind === "method" && Array.isArray(details(node).line))!
    const [first, last] = details(method).line as [number, number]
    expect(last).toBeGreaterThan(first)
    expect(details(method).spell!.split("\n")).toHaveLength(last - first + 1)
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
    const project = [...all(tree)].find((node) => node.path === "project:Solitaire")!
    expect(project.members.map((member) => member.name)).not.toContain("ace")
    expect(find(tree, "ace").path).toBe("project:Solitaire/file:Card.spell/type:Card/constant:ace")
  })

  test("a node lists the rules its statement made", () => {
    expect({
      "is a (suit)": details("is a (suit)").rules,
      "turn it over": details("turn it over").rules
    }).toMatchSnapshot()
  })

  describe("`descriptionEdits()`", () => {
    const service = () => explorer.service
    const card = () => workspace.fileFor(cardUri)!
    const deckUri = cardUri.replace(/Card\.spell$/, "Deck.spell")
    const deck = () => workspace.fileFor(deckUri)!
    /** The 1-based `line` of a file, as an edit's range covers it:  start to the next line's start. */
    const wholeLine = (line: number) => ({
      start: { line: line - 1, character: 0 },
      end: { line, character: 0 }
    })
    /** The deck's one comment line above `- its "jokers" is ...`. */
    const jokersComment = () => wholeLine(lineOf(deck().parseText, "// no jokers"))

    test("replaces the comment lines above it, one `//` line per line -- indented as it is", () => {
      const line = LSP.firstLine(details("jokers").line!)
      expect(service().descriptionEdits(deck(), line, "the jokers\nof a deck")).toEqual([
        { newText: "\t// the jokers\n\t// of a deck\n", range: jokersComment() }
      ])
    })

    test("empty text removes them", () => {
      const line = LSP.firstLine(details("jokers").line!)
      expect(service().descriptionEdits(deck(), line, "  ")).toEqual([{ newText: "", range: jokersComment() }])
    })

    test("a `##` heading docstring:  shown as markdown, and replaced keeping its level", () => {
      const suit = details("suit")
      expect(suit.description).toBe(`## ${SUIT_HEADING}`)
      const line = LSP.firstLine(suit.line!)
      expect(line).toBe(lineOf(CARD_TEXT, SUIT))
      const heading = wholeLine(lineOf(CARD_TEXT, `## ${SUIT_HEADING}`))
      expect(service().descriptionEdits(card(), line, "## the suit\nand the rank")).toEqual([
        { newText: "\t## the suit\n\t// and the rank\n", range: heading }
      ])
      // without its `##`, it's just a comment
      expect(service().descriptionEdits(card(), line, "the suit")).toEqual([
        { newText: "\t// the suit\n", range: heading }
      ])
    })

    test("a file's docstring:  `#` heading comments at its top -- added as a `#` heading", () => {
      expect(details("Card.spell").description).toBeUndefined()
      expect(find(tree, "Card.spell").uri).toBe(cardUri)
      const top = { line: 0, character: 0 }
      expect(service().fileDescriptionEdits(card(), "Cards\nfor solitaire")).toEqual([
        { range: { start: top, end: top }, newText: "# Cards\n// for solitaire\n" }
      ])
    })

    test("`null` where no declaration starts", () => {
      // the first blank line in the card's outline, 1-based
      const declared = lineOf(CARD_TEXT, CARD_TYPE)
      const blank = CARD_TEXT.split("\n").findIndex((text, index) => index >= declared && !text.trim()) + 1
      expect(service().descriptionEdits(card(), blank, "x")).toBeNull()
    })
  })
})

/**
 * A project importing another COMPILED:  its node shows that project's own parse, sources and all.
 * - Solitaire split in two, in a temp `@local/<folder>` group, as `SpellProject.imports.test.ts` does:
 *   `lib`, a copy of its cards, deck and piles, and `app`, its game.
 */
describe("ScopeExplorer of a project importing another, compiled", () => {
  const solitaire = fixtureFolder("Solitaire")
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
    expect(find(tree, "suit").uri).toMatch(/\/lib\/Card\.spell$/)
    expect(explorer.details(app, suit.path)?.line).toBe(lineOf(CARD_TEXT, SUIT))
  })

  test("our types inherit from its OWN types, from its sources -- with their docs and locations", () => {
    const tableau = find(tree, "Tableau")
    const fromPile = tableau.members.filter((member) => member.inheritedFrom === "Pile")
    expect(fromPile.length).toBeGreaterThan(0)
    // pointing at the members of its OWN Pile, in the imported project -- NOT the declarations-only one
    for (const member of fromPile) expect(member.path).toMatch(/^project:lib\/file:Pile\.spell\/type:Pile\//)
    expect(find(tree, "Tableau").super).toBe("project:lib/file:Pile.spell/type:Pile")
    expect(explorer.details(app, fromPile[0]!.path)?.line).toBeDefined()
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
      "Wildcard.spell": "a wildcard is a card\n"
    })
    await game.parse()
    // as if we had its compiled file, but not its sources
    cards.scope = undefined
    const gameTree = explorer.tree(game)
    const wildcard = find(gameTree, "Wildcard")
    const fromCard = wildcard.members.filter((member) => member.inheritedFrom === "Card")
    expect(fromCard.map((member) => member.kind)).toContain("method")
    expect(fromCard.map((member) => member.name)).toContain("turn it over")
    // its imported types show below the project importing them, with paths of their own -- NOT the Wildcard's
    expect(wildcard.super).toBe("project:game/type:Card")
    expect(find(gameTree, "game").children.map((child) => `${child.kind} ${child.name}`)).toContain("type Card")
    for (const member of fromCard) expect(member.path).toMatch(/^project:game\/type:Card\//)
    const method = fromCard.find((member) => member.kind === "method")!
    expect(explorer.details(game, method.path)).not.toBeNull()
  })

  test("its scope pack holds both projects, with the imported one's files made portable too", () => {
    const pack = explorer.exportPack(app)
    const projects = pack.entries.filter((entry) => LSP.scopeSegment(entry.path).kind === "project")
    expect(projects.map((entry) => entry.path)).toEqual(["project:lib", "project:app"])
    const json = JSON.stringify(pack)
    expect(json).not.toContain("file://")
    expect(json).toContain(`spell:/${encodeURI(lib.projectId)}/Card.spell`)
  })

  /**
   * Project `name` in the workspace:  `spellFiles` copied from Solitaire,
   * then `written` ones, after `imports`.
   */
  function makeProject(
    name: string,
    spellFiles: string[],
    imports: unknown[] = [],
    written: Record<string, string> = {}
  ) {
    const dir = resolve(workspace, name)
    mkdirSync(dir)
    for (const file of spellFiles) {
      copyFileSync(resolve(solitaire, file), resolve(dir, file))
    }
    for (const [file, text] of Object.entries(written)) writeFileSync(resolve(dir, file), text)
    const files = [...spellFiles, ...Object.keys(written)].map((file) => ({ path: `/${file}`, active: true }))
    writeFileSync(resolve(dir, SP.PROJECT_FILE), JSON.stringify({ imports: [...imports, ...files] }))
    const root = locationForDiskPath(resolve(dir, SP.PROJECT_FILE))!.projectRoot
    return new SP.SpellProject(`${root}/${name}`)
  }
})

/** Scope packs:  what `<spell-app>` shows of a project, with no parser -- see `LSP.ScopePack`. */
describe("ScopeExplorer scope packs", () => {
  const dir = mkdtempSync(resolve(tmpdir(), "spell-scope-packs-"))
  copyFixtureProject("Solitaire", resolve(dir, "Solitaire"))
  const cardPath = resolve(dir, "Solitaire/Card.spell")
  const cardUri = pathToFileURL(cardPath).href
  const workspace = new SpellDiskWorkspace()
  const explorer = new LSP.ScopeExplorer(new LSP.SpellLanguageService(workspace))
  let project: SP.SpellProject
  let tree: LSP.ScopeNode
  let pack: LSP.ScopePack
  let builtIns: LSP.ScopePack

  beforeAll(async () => {
    await workspace.update(cardUri, readFileSync(cardPath, "utf8"))
    project = workspace.fileFor(cardUri)!.project as SP.SpellProject
    tree = explorer.tree(project)
    pack = explorer.exportPack(project)
    builtIns = explorer.exportBuiltIns()
  })

  test('the root\'s path is `""`, so a top-level path is just its segment, e.g. `type:Thing`', () => {
    expect(tree.path).toBe("")
    expect(tree.children.map((child) => child.path)).toContain("type:Thing")
  })

  test("a project's pack:  flat entries in tree order, the project first, each with its details", () => {
    expect(pack.id).toBe(project.projectId)
    expect(pack.entries[0]).toEqual({ path: "project:Solitaire" })
    expect(pack.entries.every((entry) => !("children" in entry) && !("members" in entry))).toBe(true)
    const suit = pack.entries.find((entry) => entry.path.endsWith("/property:suit"))!
    expect(suit).toMatchObject({ line: lineOf(CARD_TEXT, SUIT), description: `## ${SUIT_HEADING}` })
    // shown from its file and the compiled output, NOT kept in the pack
    expect(suit).not.toHaveProperty("spell")
    expect(suit).not.toHaveProperty("compiled")
  })

  test("no `file://` URIs -- a file's own is `spell:/<file.path>`, and what's in it has none", () => {
    expect(JSON.stringify(pack)).not.toContain("file://")
    const card = workspace.fileFor(cardUri)!
    const file = pack.entries.find((entry) => entry.path === "project:Solitaire/file:Card.spell")!
    expect(file.uri).toBe(`spell:/${encodeURI(card.path)}`)
    expect(pack.entries.find((entry) => entry.path.endsWith("/property:suit"))!.uri).toBeUndefined()
  })

  test("the built-ins' pack plus the project's build the tree the explorer shows -- all but its file URIs", () => {
    expect(builtIns.entries.map((entry) => entry.path)).toEqual(
      expect.arrayContaining(["type:Thing", "type:List", "type:App"])
    )
    const { tree: built, details } = LSP.scopeTreeFromPacks([builtIns, pack])
    expect(withoutUris(built)).toEqual(withoutUris(tree))
    expect(details.get(find(tree, "Card").path)?.description).toMatch(/^The card says what its suits/)
  })

  test("a page with NO sources finds each entry's compiled code by its declarations -- all but variables", async () => {
    // the project the pack is of:  Solitaire's files, compiled as one
    const { code, declarations: compiledDeclarations } = compiledSpellProject(loadFixtureProject("Solitaire"))
    const scopes = scopesFromPacks([builtIns, pack], {
      loadCompiled: async () => code,
      loadDeclarations: async () => compiledDeclarations
    })
    const declarations = pack.entries.filter(({ path }) => !/(^|\/)(project|file|variable):[^/]*$/.test(path))
    expect(declarations.length).toBeGreaterThan(50)
    const missing = []
    for (const { path } of declarations) if (!(await scopes.details(path))?.compiled) missing.push(path)
    expect(missing).toEqual([])
  })

  test("a pack's script leaves the pack on `SPELL_SCOPES`, by the script's own URL", () => {
    expect(runPackScript(LSP.scopePackScript(pack), "https://example.com/Solitaire.scopes.js")).toEqual(pack)
  })

  test("a pack's script reads as javascript:  unquoted keys, `path` and `line` on one line, a rule a line", () => {
    const script = LSP.scopePackScript({
      id: "@test:Pack",
      entries: [
        { path: "project:Pack" },
        { path: "project:Pack/file:Game.spell/type:Game", line: 2, super: "type:App", description: "the game" },
        {
          path: "project:Pack/file:Game.spell/function:debug the game",
          line: [72, 74],
          rules: [{ name: "debug_the_game", syntax: "debug the game" }]
        }
      ]
    })
    expect(script.split("\n").slice(1)).toEqual([
      ";(globalThis.SPELL_SCOPES ??= {})[document.currentScript.src] = {",
      '  id: "@test:Pack",',
      "  entries: [",
      '    { path: "project:Pack" },',
      "    {",
      '      path: "project:Pack/file:Game.spell/type:Game", line: 2,',
      '      super: "type:App",',
      '      description: "the game"',
      "    },",
      "    {",
      '      path: "project:Pack/file:Game.spell/function:debug the game", line: [72, 74],',
      "      rules: [",
      '        { name: "debug_the_game", syntax: "debug the game" }',
      "      ]",
      "    }",
      "  ]",
      "}",
      ""
    ])
  })

  test("`core`'s `src/core.scopes.js` is what `yarn scopes --builtins` generates from the table -- run it", () => {
    const path = resolve(environment.coreDir, "core.scopes.js")
    const shipped = runPackScript(readFileSync(path, "utf8"), "core.scopes.js")
    expect(shipped).toEqual(builtIns)
  })
})

/** Built-in types' docs, from `SP.BUILT_IN_TYPE_TABLE` -- what VS Code's Type Explorer shows. */
describe("ScopeExplorer built-in types", () => {
  const dir = mkdtempSync(resolve(tmpdir(), "spell-scope-built-ins-"))
  copyFixtureProject("Solitaire", resolve(dir, "Solitaire"))
  const cardPath = resolve(dir, "Solitaire/Card.spell")
  const cardUri = pathToFileURL(cardPath).href
  const workspace = new SpellDiskWorkspace()
  const service = new LSP.SpellLanguageService(workspace)
  let project: SP.SpellProject

  beforeAll(async () => {
    await workspace.update(cardUri, readFileSync(cardPath, "utf8"))
    project = workspace.fileFor(cardUri)!.project as SP.SpellProject
  })

  test("each built-in type's entries and details come from the table", () => {
    const explorer = new LSP.ScopeExplorer(service)
    const tree = explorer.tree(project)
    const thing = find(tree, "Thing")
    expect(thing.members.map(({ kind, name }) => `${kind} ${name}`)).toContain("method draw (a thing)")
    expect(explorer.details(project, thing.path)!.description).toMatch(/^What your own types are made from/)
    const app = find(tree, "App")
    expect(app.super).toBe("type:Thing")
    expect(
      app.members.map(({ name, inheritedFrom }) => `${name}${inheritedFrom ? ` < ${inheritedFrom}` : ""}`)
    ).toEqual(expect.arrayContaining(["start (an app)", "draw (a thing) < Thing"]))
    expect(explorer.details(project, "type:App/method:start (an app)")!.rules).toEqual([
      { name: "start_app", syntax: "start {app:expression}" }
    ])
    // a project's type inherits them too
    const solitaire = [...all(tree)].find((node) => node.kind === "type" && node.name === "Solitaire")!
    expect(solitaire.members).toContainEqual(expect.objectContaining({ name: "start (an app)" }))
    // a property, with what it is, and the rules' syntax from the live grammar
    const text = find(tree, "Text")
    expect(text.members).toContainEqual(expect.objectContaining({ kind: "property", name: "length", detail: "number" }))
    expect(explorer.details(project, "type:Text/property:length")!.description).toMatch(/^How many characters/)
    expect(explorer.details(project, "type:List/method:number of (items) in (a list)")!.rules).toContainEqual({
      name: "list_count",
      syntax: "the? number of {list:operand}"
    })
  })

  test("javascript's `Object` isn't listed:  spell knows it by name, but it isn't a spell class", () => {
    const explorer = new LSP.ScopeExplorer(service)
    expect(SP.SpellParser.rootScope.types.get().map((type) => type.name)).toContain("Object")
    expect(explorer.tree(project).children.map((child) => child.path)).not.toContain("type:Object")
    expect(explorer.exportBuiltIns().entries.map((entry) => entry.path)).not.toContain("type:Object")
  })
})

/** The scope tree of a project written in Spanish:  a temp copy of the Solitario example. */
describe("ScopeExplorer in Spanish", () => {
  const dir = mkdtempSync(resolve(tmpdir(), "spell-scopes-es-"))
  cpSync(fixtureFolder("Solitario"), resolve(dir, "Solitario"), { recursive: true })
  const cartaPath = resolve(dir, "Solitario/Carta.es.spell")
  const cartaUri = pathToFileURL(cartaPath).href
  const workspace = new SpellDiskWorkspace()
  const explorer = new LSP.ScopeExplorer(new LSP.SpellLanguageService(workspace))
  let project: SP.SpellProject

  beforeAll(async () => {
    await workspace.update(cartaUri, readFileSync(cartaPath, "utf8"))
    project = workspace.fileFor(cartaUri)!.project as SP.SpellProject
  })

  test("its types come from Spanish's built-in types, and show their rules in Spanish", () => {
    const tree = explorer.tree(project)
    expect(find(tree, "Carta").super).toBe("type:Drawable")
    expect(find(tree, "Mazo").super).toBe("type:List")
    expect(explorer.details(project, "type:List/method:number of (items) in (a list)")!.rules).toContainEqual({
      name: "list_count",
      syntax: "(el|la)? (número|numero|cantidad) de {list:operand}"
    })
  })
})

/** `node` and everything below it, with no `uri`s -- which a pack makes portable. */
function withoutUris(node: LSP.ScopeNode): LSP.ScopeNode {
  const { uri: _uri, children, ...rest } = node
  return { ...rest, children: children.map(withoutUris) }
}

/** Run pack `script` as a page would load it from `src`, and answer the pack it leaves. */
function runPackScript(script: string, src: string): LSP.ScopePack {
  const page: Record<string, unknown> = { document: { currentScript: { src } } }
  runInNewContext(script, page)
  return (page[LSP.SCOPE_PACK_GLOBAL] as Record<string, LSP.ScopePack>)[src]!
}

/** `node` and its descendants, `depth` levels down, as indented `kind name (detail)` lines. */
function outline(node: LSP.ScopeNode, depth: number, indent = ""): string {
  const line = `${indent}${node.kind} ${node.name}${node.detail ? ` (${node.detail})` : ""}`
  if (!depth) return line
  return [line, ...node.children.map((child) => outline(child, depth - 1, `${indent}  `))].join("\n")
}

/**
 * 1-based last line of the outline under 1-based line `start` of `text`:
 * the last line before the next one that isn't indented, blank lines left out.
 */
function outlineEnd(text: string, start: number): number {
  const lines = text.split("\n")
  let end = start
  for (let index = start; index < lines.length && /^(\s|$)/.test(lines[index]!); index++) {
    if (lines[index]!.trim()) end = index + 1
  }
  return end
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
