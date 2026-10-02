/**
 * The Type Explorer as terminal text, for `spell describe` -- from `LSP.ScopeExplorer`'s tree + details.
 * - `describeOverview()`:  a file or project, one line per thing it declares, a type's members grouped
 *   as `SCOPE_MEMBER_GROUPS`, e.g. `Properties  color, suit, rank`.
 * - `describeThing()`:  ONE thing, in full -- what it is, description, members, rules, spell, compiled javascript.
 * - Pure:  returns lines, and gets details through `DescribeTextOptions.detailsOf`.
 * - Colour via `chalk`, which turns itself off when output isn't a terminal, or with `NO_COLOR`.
 */
import chalk from "chalk"
import { stripVTControlCharacters } from "util"

import { LSP } from "$/lsp"

/** Width of a member group's label column, e.g. `Properties  `. */
const LABEL_WIDTH = 12

/** Indent per level. */
const INDENT = "  "

/**
 * Overview of file or project `node`:  what it declares, one line each, with each type's members grouped under it.
 * - A project:  its own constants, then each of its files.
 * - Descriptions show their first line only.
 */
export function describeOverview(node: LSP.ScopeNode, options: DescribeTextOptions): string[] {
  if (node.kind !== "project") return fileOverview(node, "", options)
  const lines = [chalk.bold(node.name)]
  lines.push(...memberGroups(node.members, INDENT, options))
  for (const file of node.children) lines.push("", ...fileOverview(file, "", options))
  return lines
}

/**
 * All about `thing`, a node or member of the tree:
 * - what it is, and where it's declared
 * - its whole description
 * - its members, grouped -- if it has any
 * - rules it made, e.g. how to call a method
 * - its spell, and, with `compiled`, the javascript it compiles to
 */
export function describeThing(thing: LSP.ScopeNode | LSP.ScopeMember, options: DescribeTextOptions): string[] {
  const details = options.detailsOf(thing.path)
  const lines = [summary(thing)]
  const where = options.whereIs(thing.path)
  if (where) lines.push(chalk.dim(where))
  if (details?.description) lines.push("", ...markdownLines(details.description))

  const groups = "members" in thing ? memberGroups(thing.members, "", options) : []
  if (groups.length) lines.push("", ...groups)
  if (details?.rules?.length) {
    const width = Math.max(...details.rules.map((rule) => rule.name.length))
    const rules = details.rules.map((rule) => `${INDENT}${rule.name.padEnd(width)}  ${chalk.cyan(rule.syntax)}`)
    lines.push("", chalk.bold("Rules"), ...rules)
  }
  if (details?.spell) lines.push("", chalk.bold("Spell"), ...indented(details.spell))
  if (options.compiled && details?.compiled) lines.push("", chalk.bold("Compiled"), ...indented(details.compiled))
  return lines
}

/**
 * Options for `describeOverview()` / `describeThing()`.
 * - `detailsOf`:  a node or member's details, by `path` -- see `ScopeExplorer.details()`
 * - `whereIs`:  where node or member `path` is declared, as people read it, e.g. `Card.spell:12` -- if in a file
 * - `width`:  wrap member lists to this many columns
 * - `inherited`:  list members a type inherits, too, marked with where from
 * - `compiled`:  `describeThing()` shows the javascript
 */
export type DescribeTextOptions = {
  detailsOf: (path: string) => LSP.ScopeDetails | null
  whereIs: (path: string) => string | undefined
  width: number
  inherited?: boolean
  compiled?: boolean
}

////////////////
// ## Pieces
////////////////

/** File `node` and what it declares:  its name, its description's first line, then each thing, indented. */
function fileOverview(node: LSP.ScopeNode, indent: string, options: DescribeTextOptions): string[] {
  const lines = [`${indent}${chalk.bold(node.name)}`]
  const blurb = firstLine(options.detailsOf(node.path)?.description)
  if (blurb) lines.push(`${indent}${INDENT}${chalk.dim(blurb)}`)
  for (const child of node.children) {
    lines.push(`${indent}${INDENT}${heading(child)}`)
    if (child.kind !== "type") continue
    const about = firstLine(options.detailsOf(child.path)?.description)
    if (about) lines.push(`${indent}${INDENT}${INDENT}${chalk.dim(about)}`)
    lines.push(...memberGroups(child.members, `${indent}${INDENT}${INDENT}`, options))
  }
  return lines
}

/** One line naming `thing`:  its kind, name and detail, e.g. `type Card  is a Thing`. */
function heading(thing: LSP.ScopeNode | LSP.ScopeMember): string {
  const detail = thing.detail ? chalk.dim(`  ${thing.detail}`) : ""
  return `${chalk.dim(thing.kind)} ${chalk.bold(thing.name)}${detail}`
}

/**
 * One line saying what `thing` is, atop all about it, e.g. `type Card is a Thing`, `property color of Card`.
 * - A type's member says whose it is -- from its `path`, where its owner's segment comes before its own.
 * - Anything else ends with its `detail`, e.g. a type's `is a Thing`.
 */
function summary(thing: LSP.ScopeNode | LSP.ScopeMember): string {
  const owner = LSP.scopeSegment(LSP.parentScopePath(thing.path))
  const about = owner.kind === "type" ? `of ${owner.name}` : thing.detail
  return `${thing.kind} ${chalk.bold(thing.name)}${about ? ` ${about}` : ""}`
}

/**
 * `members` as one wrapped line per `SCOPE_MEMBER_GROUPS` group that has any, e.g. `Actions     draw (a card), flip`.
 * - Each enumeration lists the constants it made, e.g. `Suits (clubs, hearts)` -- they follow it in `members`.
 * - Inherited ones only with `options.inherited`, dimmed, with where from.
 */
function memberGroups(members: LSP.ScopeMember[], indent: string, options: DescribeTextOptions): string[] {
  const shown = options.inherited ? members : members.filter((member) => !member.inheritedFrom)
  return LSP.SCOPE_MEMBER_GROUPS.flatMap(({ label, kinds }) => {
    const items = groupItems(
      shown.filter((member) => kinds.includes(member.kind)),
      options
    )
    return items.length ? wrapped(`${indent}${label.padEnd(LABEL_WIDTH)}`, items, options.width) : []
  })
}

/**
 * `members` of one group as list items -- each enumeration gathering the constants after it that the SAME statement
 * made.  Other constants follow the enumerations, e.g. `red` from `the color of a card is red if ...` --
 * see `ScopeExplorer.constantsOf()`.
 */
function groupItems(members: LSP.ScopeMember[], options: DescribeTextOptions): string[] {
  const items: string[] = []
  let enumeration: { name: string; constants: string[]; statement?: string } | undefined
  for (const member of members) {
    if (member.kind === "constant" && enumeration && statementOf(member, options) === enumeration.statement) {
      enumeration.constants.push(member.name)
      continue
    }
    if (enumeration) items.push(enumerationItem(enumeration))
    enumeration =
      member.kind === "enumeration"
        ? { name: member.name, constants: [], statement: statementOf(member, options) }
        : undefined
    if (!enumeration) items.push(memberItem(member))
  }
  if (enumeration) items.push(enumerationItem(enumeration))
  return items
}

/**
 * Where the statement which declared `member` starts, as a string to compare -- if in a spell file.
 * - Its file and line:  a statement starts its own line, so that's enough to tell two apart.
 */
function statementOf(member: LSP.ScopeMember, options: DescribeTextOptions): string | undefined {
  return options.whereIs(member.path)
}

/** One member, as listed:  its name -- dimmed, with where from, if inherited. */
function memberItem(member: LSP.ScopeMember): string {
  return member.inheritedFrom ? chalk.dim(`${member.name} (${member.inheritedFrom})`) : member.name
}

/** An enumeration, as listed, e.g. `Suits (clubs, hearts)`. */
function enumerationItem({ name, constants }: { name: string; constants: string[] }): string {
  return constants.length ? `${name} ${chalk.dim(`(${constants.join(", ")})`)}` : name
}

/**
 * `items` after `lead`, comma-separated, wrapped to `width` -- never mid-item.
 * - Lines after the first line up under the first item.
 */
function wrapped(lead: string, items: string[], width: number): string[] {
  const hang = " ".repeat(visibleLength(lead))
  const lines = [lead]
  items.forEach((item, index) => {
    const text = index < items.length - 1 ? `${item},` : item
    const last = lines.length - 1
    const isFresh = lines[last] === lead || lines[last] === hang
    if (!isFresh && visibleLength(lines[last]!) + 1 + visibleLength(text) > width) lines.push(hang + text)
    else lines[last] += isFresh ? text : ` ${text}`
  })
  return lines
}

/** `text`, each line indented one level. */
function indented(text: string): string[] {
  return text.split("\n").map((line) => `${INDENT}${line.replace(/\t/g, INDENT)}`)
}

////////////////
// ## Markdown
////////////////

/** Markdown `text` as terminal lines:  `#` headings and `**bold**` in bold, `` `code` `` in cyan, links as their text. */
export function markdownLines(text: string): string[] {
  return text.split("\n").map((line) => {
    const title = /^#+\s+(.*)$/.exec(line)
    return title ? chalk.bold(markdownLine(title[1]!)) : markdownLine(line)
  })
}

/** One line of markdown, as terminal text -- see `markdownLines()`. */
function markdownLine(line: string): string {
  return line
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, (_all, bold: string) => chalk.bold(bold))
    .replace(/`([^`]+)`/g, (_all, code: string) => chalk.cyan(code))
    .trimEnd()
}

/** First line of markdown `text`, if any, without heading marks. */
function firstLine(text: string | undefined): string | undefined {
  const line = text?.split("\n").find((it) => it.trim())
  return line && markdownLine(line.replace(/^#+\s+/, ""))
}

/** Columns `text` takes on screen, ignoring colour codes. */
function visibleLength(text: string): number {
  return stripVTControlCharacters(text).length
}
