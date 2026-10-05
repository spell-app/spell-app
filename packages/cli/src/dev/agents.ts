import { existsSync, readdirSync, readFileSync } from "fs"
import { join, relative, resolve } from "path"

import { type AgentRulesProblem, type AgentRulesReport } from "$/cli"

/**
 * The agents' rules (epic `wwod`):  WWOD, the house style in `agents/wwod/*.md`, and the files that cite it
 * (`AGENTS.md`, `CLAUDE.md`, skills ...).  `checkAgentRules()` keeps them from rotting:
 * - every `WWOD §N` names a section, and every `WWOD §N › "title"` a rule in it
 * - every backticked repo path exists
 * - ported from the epic's `cites.py`
 */

/** WWOD's folder, from a checkout's root. */
const WWOD_FOLDER = "agents/wwod"

/**
 * The files that cite WWOD, checked by default:  repo paths, `*` for one folder level.
 * - NOTE:  a skill or doc that starts citing WWOD belongs here
 */
const CITERS = [
  "AGENTS.md",
  "CLAUDE.md",
  "packages/*/AGENTS.md",
  "packages/*/CLAUDE.md",
  "goals/AGENTS.md",
  "guides/solid/solid-2.md"
]

/** Files checked for citations ONLY:  a skill's paths are relative to its own folder, or the skill it calls. */
const CITATIONS_ONLY = [".claude/skills/*/SKILL.md"]

/** A section heading:  `## 12. Classes`. */
const SECTION = /^##\s+(\d+)\./

/** A rule title:  a bullet's leading `**bold**`, or a `### Heading`. */
const RULE_TITLE = /^\s*-\s+\*\*(.+?)\*\*|^###\s+(.+)/

/**
 * A citation, and its rule title if any:  `WWOD §5 › "Sentinel errors as control flow"`.
 * - inside WWOD, a bare `§5` cites WWOD too;  elsewhere it may be another doc's (`solid-2.html §2`)
 */
const WWOD_CITE = /WWOD\s+§(\d+)(?:\s*›\s*"([^"]+)")?/g
const BARE_CITE = /(?:WWOD\s+)?§(\d+)(?:\s*›\s*"([^"]+)")?/g

/**
 * A backticked repo path:  under a top folder below, or a root-style `NAME.md`.
 * - no spaces, globs or placeholders (`<name>`, `{a,b}`):  those aren't one file
 */
const REPO_PATH = /`((?:packages|scripts|\.claude|types|agents)\/[^`\s*<>{}]+|[A-Z][A-Z-]+\.md)`/g

/** A `:12` / `:12-20` line suffix on a path. */
const LINE_SUFFIX = /:\d+(-\d+)?$/

/**
 * Check WWOD's citations and paths in a checkout.
 * - `files`:  more files to check, beyond WWOD itself and `CITERS`;  relative to `checkout` or absolute
 * - skipped:  `From:` provenance lines (they cite the ORIGINAL WWOD's numbers), a bare `SKILL.md`, the paths
 *   in `CITATIONS_ONLY`
 * - a bare `NAME.md` resolves from the repo root, the citing file's folder, any package (`PARSING.md`) or any
 *   dependency (`CHEATSHEET.md`, `solid-js`'s)
 * - NEVER throws on a missing citer:  `CITERS` lists what MAY cite
 */
export function checkAgentRules(checkout: string, files: string[] = []): AgentRulesReport {
  const wwod = mdFiles(join(checkout, WWOD_FOLDER))
  const sections = sectionsOf(wwod)
  const citationsOnly = CITATIONS_ONLY.flatMap((pattern) => expand(checkout, pattern))
  const citers = [
    ...CITERS.flatMap((pattern) => expand(checkout, pattern)),
    ...citationsOnly,
    ...files.map((file) => resolve(checkout, file))
  ]
  const problems: AgentRulesProblem[] = []
  for (const path of [...wwod, ...citers.filter((path) => !wwod.includes(path))]) {
    const checkPaths = !citationsOnly.includes(path)
    const file = relative(checkout, path)
    const cite = wwod.includes(path) ? BARE_CITE : WWOD_CITE
    readFileSync(path, "utf8")
      .split("\n")
      .forEach((text, index) => {
        if (text.startsWith("From:")) return
        const line = index + 1
        for (const [, number, title] of text.matchAll(cite)) {
          const rules = sections.get(Number(number))
          if (!rules) problems.push({ file, line, cite: `§${number}`, problem: "no such section" })
          else if (title && !rules.some((rule) => rule.startsWith(cleanTitle(title))))
            problems.push({ file, line, cite: `§${number} › "${title}"`, problem: "no such rule" })
        }
        if (checkPaths)
          for (const [, found] of text.matchAll(REPO_PATH)) {
            const target = found.replace(/[.,:;]+$/, "").replace(LINE_SUFFIX, "")
            if (target !== "SKILL.md" && !pathExists(checkout, path, target))
              problems.push({ file, line, cite: `\`${target}\``, problem: "no such path" })
          }
      })
  }
  return {
    sections: sections.size,
    rules: [...sections.values()].reduce((sum, rules) => sum + rules.length, 0),
    files: wwod.length + citers.length,
    problems
  }
}

/** One line per problem, then the totals. */
export function agentRulesLines(report: AgentRulesReport): string[] {
  return [
    ...report.problems.map(({ file, line, cite, problem }) => `${file}:${line}  ${cite}:  ${problem}`),
    `${report.files} files, ${report.sections} sections, ${report.rules} rules, ${report.problems.length} problems`
  ]
}

////////////////
// ## Helpers
////////////////

/** `{N => [rule titles]}` across WWOD's `files`, titles cleaned (`cleanTitle()`). */
function sectionsOf(files: string[]): Map<number, string[]> {
  const sections = new Map<number, string[]>()
  let current: string[] | undefined
  for (const path of files) {
    for (const text of readFileSync(path, "utf8").split("\n")) {
      const heading = SECTION.exec(text)
      if (heading) {
        const number = Number(heading[1])
        current = sections.get(number) ?? []
        sections.set(number, current)
        continue
      }
      const title = RULE_TITLE.exec(text)
      if (title && current) current.push(cleanTitle(title[1] ?? title[2]))
    }
  }
  return sections
}

/** A title for comparing:  no backticks, no trailing colon, lowercase. */
function cleanTitle(title: string): string {
  return title.replaceAll("`", "").trim().replace(/:$/, "").trim().toLowerCase()
}

/** Every `*.md` in `folder`, sorted;  none when it's missing. */
function mdFiles(folder: string): string[] {
  if (!existsSync(folder)) return []
  return readdirSync(folder)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => join(folder, name))
}

/** The files `pattern` names that exist:  one `*` stands for one folder level. */
function expand(checkout: string, pattern: string): string[] {
  const [before, after] = pattern.split("/*/")
  if (after === undefined) return existsSync(join(checkout, pattern)) ? [join(checkout, pattern)] : []
  const parent = join(checkout, before)
  if (!existsSync(parent)) return []
  return readdirSync(parent)
    .sort()
    .map((name) => join(parent, name, after))
    .filter((path) => existsSync(path))
}

/** Does `target`, cited in `citer`, exist?  From the repo root or the citer's folder;  a bare `NAME.md` further. */
function pathExists(checkout: string, citer: string, target: string): boolean {
  if (existsSync(join(checkout, target)) || existsSync(join(citer, "..", target))) return true
  if (target.includes("/")) return false
  return ["packages", "node_modules"].some(
    (folder) => existsSync(join(checkout, folder)) && expand(checkout, `${folder}/*/${target}`).length > 0
  )
}
