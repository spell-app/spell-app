import { render } from "ink-testing-library"
import { beforeAll, describe, test, expect, vi } from "vite-plus/test"

import { LSP } from "$/lsp"
import { CLI } from "$/cli"

/**
 * `<ExplorerScreen>` on the Solitaire fixture's real tree, driven by keys as a user would.
 * - Colour is off in tests, so the frame is plain text:  where the cursor is shows in the DETAILS pane,
 *   which describes the selected node.
 */
let tree: LSP.ScopeNode
let describeNode: CLI.ExplorerScreenProps["describe"]
let cardFilePath: string

beforeAll(async () => {
  const session = new CLI.CliSession()
  const target = await CLI.resolveTarget("@test/Solitaire")
  if (target.kind !== "project") throw new Error("expected a project")
  const { project } = target
  tree = await session.scopeTree(project)
  cardFilePath = CLI.projectNodeOf(tree).children.find((node) => node.name === "Card.spell")!.path
  describeNode = (node, flags) => {
    const options = {
      ...flags,
      detailsOf: (path: string) => session.explorer.details(project, path),
      whereIs: () => "here"
    }
    return node.kind === "file" || node.kind === "project"
      ? CLI.describeOverview(node, options)
      : CLI.describeThing(node, options)
  }
})

const KEY = { up: "\u001B[A", down: "\u001B[B", right: "\u001B[C", left: "\u001B[D", tab: "\t", escape: "\u001B" }

/** Let Ink see the input just written. */
const settle = () => new Promise((done) => setTimeout(done, 20))

/** Draw the explorer on Card.spell, 100 x 20, type each of `keys`, and return the last frame. */
async function explore(keys: string[], props: Partial<CLI.ExplorerScreenProps> = {}) {
  const { stdin, lastFrame, unmount } = render(
    <CLI.ExplorerScreen
      tree={tree}
      title="Solitaire"
      describe={describeNode}
      initialPath={cardFilePath}
      size={{ columns: 100, rows: 20 }}
      {...props}
    />
  )
  await settle()
  for (const key of keys) {
    stdin.write(key)
    await settle()
  }
  const frame = lastFrame() ?? ""
  unmount()
  return frame
}

/** The details pane's text in `frame`:  right of the tree pane, borders dropped. */
function details(frame: string): string {
  return frame
    .split("\n")
    .slice(2, -2)
    .map((line) =>
      line
        .slice(38)
        .replace(/^│ ?|│$/g, "")
        .trimEnd()
    )
    .join("\n")
    .trimEnd()
}

describe("<ExplorerScreen>", () => {
  test("starts on its initial node, with the way to it open", async () => {
    const frame = await explore([])
    expect(frame).toContain("▾ Solitaire")
    expect(frame).toContain("  ▾ Card.spell")
    expect(frame).toContain("    ▸ Card  is a Thing")
    expect(frame).toContain("  ▸ Deck.spell")
    expect(details(frame)).toMatch(/^Card\.spell\n {2}type Card {2}is a Thing/)
  })

  test("fits its size:  each line exactly as wide, footer last", async () => {
    const lines = (await explore([])).split("\n")
    expect(lines).toHaveLength(19)
    expect(lines.slice(1, -1).every((line) => line.length === 100)).toBe(true)
    expect(lines.at(-1)).toContain("q quit")
  })

  test("↓ moves to the next row, and the details follow", async () => {
    expect(details(await explore([KEY.down]))).toMatch(/^type Card is a Thing\nhere\n/)
  })

  test("→ opens a node, ← closes it, ← again goes to its parent", async () => {
    const opened = await explore([KEY.down, KEY.right])
    expect(opened).toContain("▾ Card  is a Thing")
    expect(opened).toContain("        rank")
    expect(await explore([KEY.down, KEY.right, KEY.left])).toContain("▸ Card  is a Thing")
    expect(details(await explore([KEY.down, KEY.left]))).toMatch(/^Card\.spell\n/)
  })

  test("wrapped lines keep their indent", async () => {
    expect(details(await explore([]))).toContain(
      "    definition of a Card with nice english aliases for\n    working with it"
    )
  })

  test("/ filters the tree as you type -- Esc drops the filter", async () => {
    const filtered = await explore(["/", "s", "u", "i", "t"])
    expect(filtered).toContain("/suit█")
    expect(filtered).toContain("short_suit")
    expect(filtered).not.toContain("Deck.spell")
    const dropped = await explore(["/", "s", "u", "i", "t", KEY.escape])
    expect(dropped).toContain("Deck.spell")
    expect(dropped).not.toContain("/suit")
  })

  test("Tab switches to the details pane, where ↓ scrolls", async () => {
    const scrolled = details(await explore([KEY.tab, KEY.down, KEY.down]))
    expect(scrolled).toMatch(/^ {4}definition of a Card/)
  })

  test("c shows the compiled javascript", async () => {
    // tall enough to show it all
    const frame = await explore([KEY.down, "c"], { size: { columns: 100, rows: 60 } })
    expect(frame).toContain("+compiled")
    expect(details(frame)).toContain("Compiled\n  export class Card extends Thing {}")
  })

  test("o opens the selected node, and shows what happened", async () => {
    const onOpen = vi.fn(() => "Opened Card.spell:2")
    const frame = await explore([KEY.down, "o"], { onOpen })
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ name: "Card", kind: "type" }))
    expect(frame.split("\n").at(-1)).toBe(" Opened Card.spell:2")
  })

  test("e edits the selected node's description in the footer:  Enter saves it", async () => {
    const onEdit = vi.fn(() => "Saved Card's description")
    const descriptionOf = () => "a playing card"
    const editing = await explore([KEY.down, "e"], { onEdit, descriptionOf })
    expect(editing.split("\n").at(-1)).toMatch(/^ Card description: {2}a playing card/)

    const frame = await explore([KEY.down, "e", ", face up", "\r"], { onEdit, descriptionOf })
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ name: "Card" }), "a playing card, face up")
    expect(frame.split("\n").at(-1)).toBe(" Saved Card's description")
  })

  test("e then Esc changes nothing", async () => {
    const onEdit = vi.fn(() => "saved")
    const frame = await explore([KEY.down, "e", "x", KEY.escape], { onEdit, descriptionOf: () => "" })
    expect(onEdit).not.toHaveBeenCalled()
    expect(frame.split("\n").at(-1)).toMatch(/^ ↑↓ move/)
  })

  test("e says why not:  nothing editable, or several lines", async () => {
    const none = await explore([KEY.down, "e"], { onEdit: vi.fn(), descriptionOf: () => undefined })
    expect(none.split("\n").at(-1)).toBe(" Card has no description to edit here")
    const lines = await explore([KEY.down, "e"], { onEdit: vi.fn(), descriptionOf: () => "one\ntwo" })
    expect(lines.split("\n").at(-1)).toMatch(/^ Card's description is several lines/)
  })

  test("a new tree keeps the cursor where it was", async () => {
    const { stdin, lastFrame, rerender, unmount } = render(
      <CLI.ExplorerScreen tree={tree} title="Solitaire" describe={describeNode} initialPath={cardFilePath} />
    )
    await settle()
    stdin.write(KEY.down)
    await settle()
    const before = details(lastFrame() ?? "")
    rerender(<CLI.ExplorerScreen tree={{ ...tree }} title="Solitaire" describe={describeNode} />)
    await settle()
    expect(details(lastFrame() ?? "")).toBe(before)
    unmount()
  })
})
