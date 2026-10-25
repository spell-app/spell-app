import { basename } from "path"
import { fileURLToPath } from "url"
import { beforeAll, describe, test, expect } from "vite-plus/test"

import { LSP } from "spell-app/lsp"
import { CLI } from "spell-app/cli"

/**
 * `spell describe`'s text, for the Solitaire example:  its cards, deck and piles, and its game --
 * colour is off, as vitest's output isn't a terminal.
 * - The tree comes from the real `ScopeExplorer`, as in `ScopeExplorer.test.ts`.
 */
let solitaire: Described

/** A project's scope tree, and how to describe what's in it. */
type Described = { tree: LSP.ScopeNode; options: CLI.DescribeTextOptions }

beforeAll(async () => {
  solitaire = await describedProject("@spell/examples/Solitaire")
})

/** Project `projectId` parsed, its tree, and options that describe it. */
async function describedProject(projectId: string): Promise<Described> {
  const session = new CLI.CliSession()
  const resolved = await CLI.resolveProject(projectId)
  if (resolved.kind !== "project") throw new Error("expected a project")
  await session.parse(resolved.project)
  const tree = session.explorer.tree(resolved.project)
  const options = {
    width: 100,
    detailsOf: (path: string) => session.explorer.details(resolved.project, path),
    // just `file:line`, so the snapshots don't depend on the current folder
    whereIs: (path: string) => {
      const at = session.declaredAt(resolved.project, tree, path)
      return at && `${basename(fileURLToPath(at.uri))}:${at.line}`
    }
  }
  return { tree, options }
}

/** Node or member named `path` of `described`'s own project node, e.g. `["Card.spellx", "Card"]`. */
function find({ tree }: Described, ...path: string[]): LSP.ScopeNode | LSP.ScopeMember {
  let node: LSP.ScopeNode | LSP.ScopeMember = tree.children.at(-1)!
  for (const name of path) {
    const parent = node as LSP.ScopeNode
    node = parent.children.find((it) => it.name === name) ?? parent.members.find((it) => it.name === name)!
    if (!node) throw new Error(`no '${name}'`)
  }
  return node
}

describe("describeOverview()", () => {
  test("a file:  each thing it declares, a type's members grouped", () => {
    expect(
      CLI.describeOverview(find(solitaire, "Card.spellx") as LSP.ScopeNode, solitaire.options).join("\n")
    ).toMatchSnapshot()
  })

  test("an enumeration gathers only the constants its own statement made", () => {
    const text = CLI.describeOverview(find(solitaire, "Card.spellx") as LSP.ScopeNode, solitaire.options).join("\n")
    expect(text).toContain("Suits (clubs, diamonds, hearts, spades)")
  })

  test("wraps member lists to `width`, never mid-item", () => {
    const lines = CLI.describeOverview(find(solitaire, "Card.spellx") as LSP.ScopeNode, {
      ...solitaire.options,
      width: 60
    })
    // descriptions aren't wrapped:  just lists, each under its heading, e.g. `Actions`, then indented to it
    const listLines = lines.filter((line) => /^ {4}(Properties|Actions|Constants) |^ {16}\S/.test(line))
    expect(Math.max(...listLines.map((line) => line.length))).toBeLessThanOrEqual(60)
    for (const item of [
      "count the points for a card on a pile",
      "is the (rank) of (suit)",
      "Suits (clubs, diamonds, hearts, spades)"
    ]) {
      expect(listLines.some((line) => line.includes(item))).toBe(true)
    }
  })

  test("inherited members only when asked, with where from", () => {
    const tableau = find(solitaire, "Solitaire.spellx", "Tableau") as LSP.ScopeNode
    const file = { ...(find(solitaire, "Solitaire.spellx") as LSP.ScopeNode), children: [tableau] }
    expect(CLI.describeOverview(file, solitaire.options).join("\n")).not.toContain("(Pile)")
    expect(CLI.describeOverview(file, { ...solitaire.options, inherited: true }).join("\n")).toContain("color (Pile)")
  })
})

describe("describeThing()", () => {
  test("a type", () => {
    expect(CLI.describeThing(find(solitaire, "Card.spellx", "Card"), solitaire.options).join("\n")).toMatchSnapshot()
  })

  test("a property, with its compiled javascript", () => {
    const color = find(solitaire, "Card.spellx", "Card", "color")
    const text = CLI.describeThing(color, { ...solitaire.options, compiled: true }).join("\n")
    expect(text).toMatchSnapshot()
  })

  test("a method lists the rule for calling it", () => {
    const text = CLI.describeThing(find(solitaire, "Card.spellx", "Card", "play a card"), solitaire.options).join("\n")
    expect(text).toContain("Rules\n  play  play {thisArg:expression}")
  })
})
