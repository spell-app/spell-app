/**
 * Which spell syntaxes would match differently if rulex's spacing were significant -- "write it as it looks":
 * no space in the syntax => none allowed in the input.  Backs `rulex/rulex.html` and the markdown plan's Q7.
 * - Run from `packages/docs`:  `yarn tsx rulex/experiments/adjacency-impact.mts`
 * - Reads every `syntax:` string literal in `packages/spell/src/rules/` (rules built while parsing, from
 *   methods and enums, aren't in the source:  their syntax always has spaces between parts).
 * - For each, walks rulex's parse of it and reports every pair of neighbouring parts written with NO space
 *   between, e.g. `isn't` (`isn` `'` `t`) or `{item},` -- the places input spaces would stop matching.
 * - "symbols" pairs (two symbols touching, e.g. `\(`... `)`) change under the Symbols fix (D13) anyway.
 * - NOTE: MUST be `.mts`, see `rulex-probe.mts`.
 */
import { readFileSync, readdirSync } from "node:fs"

import { P } from "$/parser"

import "$/parser/rulex"

const rulex = P.Parser.rulexParser!
const RULES = new URL("../../../spell/src/rules/", import.meta.url).pathname

////////////////
// ## Scan
////////////////

/** Every `syntax:` string in the rules folder, with where it is and the rule it registers. */
const found: { file: string; line: number; rule: string; syntax: string }[] = []
for (const file of readdirSync(RULES).filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts"))) {
  const source = readFileSync(RULES + file, "utf8")
  const pattern = /syntax:\s*("(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|'(?:\\.|[^'\\])*'|VARIABLE_SYNTAX)/g
  for (let m; (m = pattern.exec(source)); ) {
    const literal = m[1]
    const syntax = literal === "VARIABLE_SYNTAX" ? "the? {identifier}" : unquote(literal)
    if (syntax.includes("${")) continue
    const before = source.slice(0, m.index)
    const rule = [...before.matchAll(/addRule\(\s*([\w.]+)/g)].at(-1)?.[1] ?? "?"
    found.push({ file, line: before.split("\n").length, rule, syntax })
  }
}

////////////////
// ## Report
////////////////

let impacted = 0
const kinds = new Map<string, number>()
for (const { file, line, rule, syntax } of found) {
  const match = rulex.parse(syntax)
  if (!match) continue
  const pairs = touching(match)
  if (!pairs.length) continue
  impacted++
  for (const pair of pairs) kinds.set(pair.kind, (kinds.get(pair.kind) ?? 0) + 1)
  const shown = pairs.map((pair) => `${pair.left}|${pair.right} (${pair.kind})`).join(",  ")
  console.log(`${`${file}:${line}`.padEnd(22)} ${rule.padEnd(28)} ${JSON.stringify(syntax)}\n${" ".repeat(51)}touching: ${shown}`)
}
console.log(`\n${impacted} of ${found.length} syntaxes have touching parts`)
console.log(Object.fromEntries(kinds))

// The Symbols fix (D13) alone:  every compiled `Symbols` run would refuse spaces between its symbols,
// however the syntax spaced them.
console.log("\nSymbols runs (D13 makes these adjacent, whatever the syntax's spacing):")
for (const { file, line, rule, syntax } of found) {
  const runs: string[] = []
  collectSymbols(P.Rule.compileSyntax(syntax), runs)
  if (runs.length) console.log(`${`${file}:${line}`.padEnd(22)} ${rule.padEnd(28)} ${JSON.stringify(syntax)}  =>  ${runs.join(", ")}`)
}

/** Push each multi-symbol `Symbols` rule under `rule` onto `runs`, as its rulex syntax. */
function collectSymbols(rule: P.Rule, runs: string[]) {
  const r = rule as unknown as Record<string, unknown>
  if (rule instanceof P.Symbols && (r.literals as unknown[]).length > 1) runs.push(rule.toRulexSyntax())
  for (const child of [...((r.rules as P.Rule[]) ?? []), r.rule, r.delimiter]) {
    if (child instanceof P.Rule) collectSymbols(child, runs)
  }
}

////////////////
// ## Helpers
////////////////

/**
 * Neighbouring parts of every sequence in rulex `match`, written with no space between.
 * - A part is one item of rulex's `sequence` (a keyword, symbol, `{subrule}`, `(choice)` or `[list]`), and a
 *   list's item vs its delimiter.
 * - Recurses into choices' sequences and lists.
 */
function touching(match: P.Match): { left: string; right: string; kind: string }[] {
  const pairs: { left: string; right: string; kind: string }[] = []
  visit(match)
  return pairs

  /** Collect touching pairs among `match`'s parts, then recurse into each part. */
  function visit(node: P.Match) {
    const parts = partsOf(node)
    for (let i = 0; i + 1 < parts.length; i++) {
      const last = parts[i].tokens.at(-1)
      if (last && !last.whitespace) pairs.push({ left: text(parts[i]), right: text(parts[i + 1]), kind: kind(parts[i], parts[i + 1]) })
    }
    for (const part of parts) for (const child of childrenOf(part)) visit(child)
  }
}

/** The sequence parts directly in `node`:  a `sequence`'s items, or a list's item + delimiter. */
function partsOf(node: P.Match): P.Match[] {
  if (node.rule.name === "sequence") return node.items ?? []
  if (node.rule.name === "list") return [node.groups.ruleName, node.groups.delimiter].filter(Boolean) as P.Match[]
  return []
}

/** Nested matches to visit:  a choice's alternatives, a list's parts (as their own sequences). */
function childrenOf(part: P.Match): P.Match[] {
  if (part.rule.name === "choices") return part.groups.choices?.items ?? []
  if (part.rule.name === "list") return [part]
  return []
}

/** Classify a touching pair by what each side is. */
function kind(left: P.Match, right: P.Match) {
  return `${side(left)}-${side(right)}`
}

/** `symbol`, `word`, `subrule`, `choice` or `list`. */
function side(part: P.Match) {
  const name = part.rule.name
  if (name === "keyword" || name === "number") return "word"
  if (name === "choices") return "choice"
  return name
}

/** Source text of a match, trimmed. */
function text(match: P.Match) {
  return match.tokens.map((token) => (typeof token.raw === "string" ? token.raw : token.value)).join("").trim()
}

/** JS string literal => its value. */
function unquote(literal: string) {
  const body = literal.slice(1, -1)
  return body.replace(/\\(.)/g, "$1")
}
