/**
 * Parsing a line of spell on its own, for `spell parse` and `spell repl`:  its match tree and its javascript.
 * - Parses in a scope of its own -- see `lineScope()` -- so nothing typed lands in a project.
 */
import chalk from "chalk"

import { SP } from "$/spell"
import { P } from "$/parser"

/** Rules a line is tried as, in order, when no `--rule` is given -- `block` for several lines. */
const LINE_RULES = ["statement", "expression"]

/**
 * What parsing `text` gave.
 * - `rule`:  the rule that matched, or the last one tried
 * - `tree`:  the match tree, one line per match -- see `matchTree()`
 * - `spellTree`:  the spell tree its AST makes, as `<ui-tree-diagram>` draws it -- see `P.TreeWriter`
 * - `compiled`:  its javascript, unless it didn't match, or compiling threw
 * - `error`:  why not
 */
export type ParsedText = {
  text: string
  rule: string
  tree: string[]
  spellTree?: P.TreeNode
  compiled?: string
  error?: string
}

/**
 * A fresh scope to parse lines in:  inside `project`'s, so its types and phrases are known -- or, with none, a bare
 * one with only spell's own rules.
 * - Lines parsed in it may declare things for later lines, as in `spell repl` -- see `parseText()`'s `commit`.
 * - `project` must have parsed, e.g. `CliSession.parse()`.
 */
export function lineScope(project?: SP.SpellProject): P.Scope {
  if (!project?.scope) return SP.spellParser.getScope("cli")
  return new P.ProjectScope({ name: "cli", parentScope: project.scope })
}

/**
 * Parse `text` in `scope` as `rule` -- or, with none, as each of `LINE_RULES` until one matches (`block` if it's
 * several lines) -- then compile it.
 * - `commit`:  declare what it declares in `scope`, for later lines, as a project's statements do.
 * - Never throws:  a failure is in the result's `error`.
 */
export function parseText(
  text: string,
  scope: P.Scope,
  { rule, commit = false }: { rule?: string; commit?: boolean } = {}
): ParsedText {
  const rules = rule ? [rule] : text.trim().includes("\n") ? ["block"] : LINE_RULES
  let tried = rules[0]!
  let match: P.Match | undefined
  try {
    for (tried of rules) {
      match = SP.spellParser.parse(text, tried, scope)
      if (match) break
    }
  } catch (error) {
    return { text, rule: tried, tree: [], error: error instanceof Error ? error.message : String(error) }
  }
  if (!match) return { text, rule: tried, tree: [], error: `Doesn't parse as ${rules.join(" or ")}` }

  const tree = matchTree(match)
  try {
    if (commit) scope.parser?.commit(match)
    const spellTree = P.TreeWriter.treeOf(match.AST)
    return { text, rule: tried, tree, spellTree, compiled: String(match.compile()) }
  } catch (error) {
    return { text, rule: tried, tree, error: error instanceof Error ? error.message : String(error) }
  }
}

/** `spellTree` as indented lines, one per box:  `slot: label  detail`, the slot and detail dim. */
export function spellTreeLines(spellTree: P.TreeNode, depth = 0): string[] {
  const slot = spellTree.slot ? chalk.dim(`${spellTree.slot}: `) : ""
  const detail = spellTree.detail ? `  ${chalk.dim(spellTree.detail)}` : ""
  const lines = [`${"  ".repeat(depth)}${slot}${spellTree.label}${detail}`]
  for (const child of spellTree.children ?? []) lines.push(...spellTreeLines(child, depth + 1))
  return lines
}

/**
 * `spellTree` as a `<ui-tree-diagram>` for a docs page:  its data in a JSON `<script>` child, so it draws from
 * `file://` too.  `<\/` escaped, so the text can't end the script early.
 */
export function spellTreeHTML(spellTree: P.TreeNode): string {
  const json = JSON.stringify(spellTree, null, 2).replace(/<\//g, "<\\/")
  return `<ui-tree-diagram>\n<script type="application/json">\n${json}\n</script>\n</ui-tree-diagram>`
}

/** `matchTree()` lines coloured for a terminal:  the text each matched, dim. */
export function colorTree(tree: string[]): string[] {
  return tree.map((line) => {
    const split = line.indexOf("  ", line.search(/\S/))
    return split === -1 ? line : `${line.slice(0, split)}  ${chalk.dim(line.slice(split + 2))}`
  })
}

/**
 * `match` as an indented tree, one line per match:  `group: rule › choice  text`.
 * - `group`:  the name its parent gave it, when that says more than its rule's name
 * - `› choice`:  which rule a `Choice` picked, e.g. `statement › print`
 * - `text`:  what it matched
 */
export function matchTree(match: P.Match, depth = 0): string[] {
  const name = match.rule.name ?? match.rule.constructor.name
  const choice = match.choiceRule && match.choiceRule !== name ? `${match.choiceRule} › ` : ""
  const group = match.matchGroup && match.matchGroup !== name && match.matchGroup !== match.choiceRule
  const label = `${group ? `${match.matchGroup}: ` : ""}${choice}${name}`
  const lines = [`${"  ".repeat(depth)}${label}  ${match.inputText.trim()}`]
  for (const child of match.matched) if (child instanceof P.Match) lines.push(...matchTree(child, depth + 1))
  return lines
}
