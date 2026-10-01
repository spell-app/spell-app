import { Box, Text } from "ink"
import chalk from "chalk"

import type { LSP } from "#lsp"
import type { CLI } from "#cli"

/****************
 * ### `<TreePane>`
 * Left pane of `<ExplorerScreen>`:  the scope tree, one row per node, scrolled to keep the cursor in view.
 * - Just draws:  `<ExplorerScreen>` owns what's open, where the cursor is, and the keys.
 ****************/
export function TreePane({ rows, cursor, width, height, isFocused }: TreePaneProps) {
  // inside the border
  const inner = Math.max(1, height - 2)
  const top = Math.max(0, Math.min(cursor - Math.floor(inner / 2), rows.length - inner))
  return (
    <Box
      flexDirection="column"
      width={width}
      height={height}
      overflow="hidden"
      borderStyle="round"
      borderColor={isFocused ? "cyan" : "gray"}
      paddingX={1}
    >
      {rows.slice(top, top + inner).map((row, index) => (
        <Text key={row.node.path} inverse={top + index === cursor} wrap="truncate-end">
          {rowText(row)}
        </Text>
      ))}
    </Box>
  )
}

/**
 * `<TreePane>` props.
 * - `rows`:  every row, top to bottom -- see `CLI.treeRows()`
 * - `cursor`:  index of the selected row
 * - `width`, `height`:  outside the border
 * - `isFocused`:  do keys move the cursor?  Shown by the border's colour.
 */
export type TreePaneProps = {
  rows: CLI.TreeRow[]
  cursor: number
  width: number
  height: number
  isFocused: boolean
}

/** Colour of each kind of node's name. */
const KIND_COLOR: Partial<Record<LSP.ScopeNodeKind, (text: string) => string>> = {
  type: chalk.yellow,
  property: chalk.cyan,
  method: chalk.green,
  function: chalk.green,
  enumeration: chalk.magenta,
  constant: chalk.magenta,
  variable: chalk.blue,
  project: chalk.bold,
  file: chalk.bold
}

/** `row` as text:  indented, `▸` / `▾` if it can open, its name coloured by kind, then its detail. */
function rowText({ node, depth, hasChildren, isOpen }: CLI.TreeRow): string {
  const marker = hasChildren ? (isOpen ? "▾ " : "▸ ") : "  "
  const name = (KIND_COLOR[node.kind] ?? String)(node.name)
  const detail = node.detail ? chalk.dim(`  ${node.detail}`) : ""
  return `${"  ".repeat(depth)}${marker}${name}${detail}`
}
