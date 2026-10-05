import { basename } from "path"
import { fileURLToPath } from "url"
import { beforeAll, describe, test, expect } from "vite-plus/test"

import { LSP } from "$/lsp"
import { CLI } from "$/cli"

/**
 * `spell describe`'s text, for the Solitaire fixture -- colour is off, as vitest's output isn't a terminal.
 * - The tree comes from the real `ScopeExplorer`, as in `ScopeExplorer.test.ts`.
 */
let tree: LSP.ScopeNode
let options: CLI.DescribeTextOptions

beforeAll(async () => {
  const session = new CLI.CliSession()
  const target = await CLI.resolveTarget("@test/Solitaire")
  if (target.kind !== "project") throw new Error("expected a project")
  await session.parse(target.project)
  tree = session.explorer.tree(target.project)
  options = {
    width: 100,
    detailsOf: (path) => session.explorer.details(target.project, path),
    // just `file:line`, so the snapshots don't depend on the current folder
    whereIs: (path) => {
      const at = session.declaredAt(target.project, tree, path)
      return at && `${basename(fileURLToPath(at.uri))}:${at.line}`
    }
  }
})

/** Node or member of the Solitaire project node named `path`, e.g. `["Card.spell", "Card"]`. */
function find(...path: string[]): LSP.ScopeNode | LSP.ScopeMember {
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
    expect(CLI.describeOverview(find("Card.spell") as LSP.ScopeNode, options).join("\n")).toMatchSnapshot()
  })

  test("an enumeration gathers only the constants its own statement made", () => {
    const text = CLI.describeOverview(find("Card.spell") as LSP.ScopeNode, options).join("\n")
    expect(text).toContain("Suits (clubs, diamonds, hearts, spades), black, red")
  })

  test("wraps member lists to `width`, never mid-item", () => {
    const lines = CLI.describeOverview(find("Card.spell") as LSP.ScopeNode, { ...options, width: 60 })
    // descriptions aren't wrapped:  just lists, whose lines all hold commas
    const listLines = lines.filter((line) => line.includes(","))
    expect(Math.max(...listLines.map((line) => line.length))).toBeLessThanOrEqual(60)
    for (const item of ["turn (a card) face down", "move (a card) to (a pile)", "Ranks (ace, jack, queen, king)"]) {
      expect(listLines.some((line) => line.includes(item))).toBe(true)
    }
  })

  test("inherited members only when asked, with where from", () => {
    const stock = find("Solitaire.spell", "Stock_Pile") as LSP.ScopeNode
    const file = { ...(find("Solitaire.spell") as LSP.ScopeNode), children: [stock] }
    expect(CLI.describeOverview(file, options).join("\n")).not.toContain("(Pile)")
    expect(CLI.describeOverview(file, { ...options, inherited: true }).join("\n")).toContain("color (Pile)")
  })
})

describe("describeThing()", () => {
  test("a type", () => {
    expect(CLI.describeThing(find("Card.spell", "Card"), options).join("\n")).toMatchSnapshot()
  })

  test("a property, with its compiled javascript", () => {
    const text = CLI.describeThing(find("Card.spell", "Card", "color"), { ...options, compiled: true }).join("\n")
    expect(text).toMatchSnapshot()
  })

  test("a method lists the rule for calling it", () => {
    const text = CLI.describeThing(find("Card.spell", "Card", "draw (a card)"), options).join("\n")
    expect(text).toContain("Rules\n  draw  draw {thisArg:expression}")
  })
})
