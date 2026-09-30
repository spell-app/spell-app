import { Box, Text, useApp, useInput, useStdout } from "ink"
import { useEffect, useMemo, useState } from "react"
import chalk from "chalk"
import wrapAnsi from "wrap-ansi"

import type { LSP } from "~/lsp"
import { CLI } from "~/cli"

/** Keys, for the footer. */
const HELP = "↑↓ move · ←→ fold · Tab switch pane · / filter · c compiled · i inherited · o open · q quit"

/****************
 * ### `<ExplorerScreen>`
 * Full-screen Type Explorer, for `spell explore`:  the scope tree on the left, the selected node's details
 * on the right -- the same text `spell describe` prints.
 * - Keys:  see `HELP`.  The tree pane moves the cursor, the details pane scrolls;  `Tab` switches.
 * - `/` filters the tree as you type:  `Enter` keeps the filter, `Esc` drops it.
 * - Fills the terminal, and follows it as it's resized -- or `size`, e.g. in tests.
 ****************/
export function ExplorerScreen({ tree, title, describe, onOpen, initialPath, size }: ExplorerScreenProps) {
  const { exit } = useApp()
  const terminal = useTerminalSize()
  const { columns, rows } = size ?? terminal

  const [expanded, setExpanded] = useState(() => new Set(CLI.trailTo(tree, initialPath ?? "").map((node) => node.path)))
  const [cursorPath, setCursorPath] = useState(initialPath)
  const [focus, setFocus] = useState<"tree" | "details">("tree")
  const [scroll, setScroll] = useState(0)
  const [filter, setFilter] = useState("")
  const [isFiltering, setIsFiltering] = useState(false)
  const [compiled, setCompiled] = useState(false)
  const [inherited, setInherited] = useState(false)
  const [message, setMessage] = useState<string>()

  const treeRows = useMemo(() => CLI.treeRows(tree, expanded, filter), [tree, expanded, filter])
  const cursor = Math.max(
    0,
    treeRows.findIndex((row) => row.node.path === cursorPath)
  )
  const row = treeRows[cursor]

  // one line each for header and footer, and one spare:  Ink redraws the WHOLE screen, flickering, once full
  const paneHeight = Math.max(5, rows - 3)
  const treeWidth = Math.min(50, Math.max(24, Math.round(columns * 0.38)))
  const detailsWidth = Math.max(20, columns - treeWidth)
  const textWidth = detailsWidth - CLI.DETAILS_CHROME
  const lines = useMemo(
    () => (row ? wrapped(describe(row.node, { compiled, inherited, width: textWidth }), textWidth) : []),
    [row, describe, compiled, inherited, textWidth]
  )
  const maxScroll = Math.max(0, lines.length - (paneHeight - 2))

  useInput((input, key) => {
    setMessage(undefined)
    if (isFiltering) {
      if (key.escape) {
        setFilter("")
        setIsFiltering(false)
      } else if (key.return) setIsFiltering(false)
      else if (key.backspace || key.delete) setFilter(filter.slice(0, -1))
      else if (key.upArrow) moveTo(cursor - 1)
      else if (key.downArrow) moveTo(cursor + 1)
      else if (input && !key.ctrl && !key.meta) setFilter(filter + input)
      return
    }

    if (input === "q") return exit()
    if (key.tab) return setFocus(focus === "tree" ? "details" : "tree")
    if (input === "/") return setIsFiltering(true)
    if (key.escape && filter) return setFilter("")
    if (input === "c") return setCompiled(!compiled)
    if (input === "i") return setInherited(!inherited)
    if (input === "o" && row) return setMessage(onOpen?.(row.node))

    const page = paneHeight - 3
    if (focus === "details") {
      if (key.upArrow || input === "k") setScroll(Math.max(0, scroll - 1))
      else if (key.downArrow || input === "j") setScroll(Math.min(maxScroll, scroll + 1))
      else if (key.pageUp) setScroll(Math.max(0, scroll - page))
      else if (key.pageDown || input === " ") setScroll(Math.min(maxScroll, scroll + page))
      return
    }

    if (key.upArrow || input === "k") moveTo(cursor - 1)
    else if (key.downArrow || input === "j") moveTo(cursor + 1)
    else if (key.pageUp) moveTo(cursor - page)
    else if (key.pageDown) moveTo(cursor + page)
    else if (input === "g") moveTo(0)
    else if (input === "G") moveTo(treeRows.length - 1)
    else if (!row) return
    else if (key.rightArrow || input === "l") {
      if (row.hasChildren && !row.isOpen) setOpen(row.node.path, true)
      else if (row.isOpen) moveTo(cursor + 1)
    } else if (key.leftArrow || input === "h") {
      if (row.isOpen && !filter) setOpen(row.node.path, false)
      else moveToParent()
    } else if (key.return || input === " ") {
      if (row.hasChildren && !filter) setOpen(row.node.path, !row.isOpen)
    }
  })

  return (
    <Box flexDirection="column" width={columns}>
      <Text wrap="truncate-end">
        {chalk.bold(` Spell Type Explorer · ${title}`)}
        {filter || isFiltering ? chalk.cyan(`   /${filter}${isFiltering ? "█" : ""}`) : ""}
        {compiled ? chalk.dim("   +compiled") : ""}
        {inherited ? chalk.dim("   +inherited") : ""}
      </Text>
      <Box>
        <CLI.TreePane
          rows={treeRows}
          cursor={cursor}
          width={treeWidth}
          height={paneHeight}
          isFocused={focus === "tree"}
        />
        <CLI.DetailsPane
          lines={lines}
          scroll={Math.min(scroll, maxScroll)}
          width={detailsWidth}
          height={paneHeight}
          isFocused={focus === "details"}
        />
      </Box>
      <Text wrap="truncate-end">{message ? chalk.yellow(` ${message}`) : chalk.dim(` ${HELP}`)}</Text>
    </Box>
  )

  /** Put the cursor on row `index`, kept in range, with its details scrolled to the top. */
  function moveTo(index: number) {
    const next = treeRows[Math.max(0, Math.min(treeRows.length - 1, index))]
    if (!next) return
    setCursorPath(next.node.path)
    setScroll(0)
  }

  /** Put the cursor on the selected row's parent, if it has one. */
  function moveToParent() {
    const parent = CLI.trailTo(tree, row!.node.path).at(-2)
    if (!parent) return
    setCursorPath(parent.path)
    setScroll(0)
  }

  /** Open -- or close -- node `path`. */
  function setOpen(path: string, isOpen: boolean) {
    const next = new Set(expanded)
    if (isOpen) next.add(path)
    else next.delete(path)
    setExpanded(next)
  }
}

/**
 * `<ExplorerScreen>` props.
 * - `tree`:  the Type Explorer's tree -- its top-level children are the tree's top rows
 * - `title`:  shown atop the screen, e.g. the project's name
 * - `describe`:  lines for the details pane, for `node`, fitting `width` -- see `CLI.describeThing()`
 * - `onOpen`:  open `node`'s declaration in an editor.  Returns a message to show, e.g. what went wrong.
 * - `initialPath`:  `path` of the node to start on, with the way to it open
 * - `size`:  columns and rows to fill, rather than the terminal's
 */
export type ExplorerScreenProps = {
  tree: LSP.ScopeNode
  title: string
  describe: (node: LSP.ScopeNode, options: { compiled: boolean; inherited: boolean; width: number }) => string[]
  onOpen?: (node: LSP.ScopeNode) => string | undefined
  initialPath?: string
  size?: { columns: number; rows: number }
}

/** The terminal's size, updated as it's resized. */
function useTerminalSize(): { columns: number; rows: number } {
  const { stdout } = useStdout()
  const [size, setSize] = useState(() => sizeOf(stdout))
  useEffect(() => {
    const onResize = () => setSize(sizeOf(stdout))
    stdout.on("resize", onResize)
    return () => {
      stdout.off("resize", onResize)
    }
  }, [stdout])
  return size
}

/**
 * `stream`'s size, with a fallback for one that doesn't know, e.g. in tests.
 * - 80 columns, as Ink lays out to without one:  anything wider breaks its borders.
 */
function sizeOf(stream: NodeJS.WriteStream): { columns: number; rows: number } {
  return { columns: stream.columns || 80, rows: stream.rows || 24 }
}

/**
 * `lines`, each wrapped to `width` columns -- colours kept -- so every line is one screen line.
 * - A wrapped line's continuations keep its indent -- taken off first, so `wrapAnsi()` can trim where it breaks.
 */
function wrapped(lines: string[], width: number): string[] {
  return lines.flatMap((line) => {
    const indent = /^ */.exec(line)![0]
    const text = wrapAnsi(line.slice(indent.length), Math.max(10, width - indent.length), { hard: true })
    return text.split("\n").map((part) => indent + part)
  })
}
