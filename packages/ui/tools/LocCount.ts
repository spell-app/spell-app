/// <reference types="node" />

import { globSync, readFileSync } from "node:fs"
import { relative } from "node:path"

import type { LocFile, LocResults } from "./tools.types.ts"

/****************
 * ### `LocCount`
 * Lines of code per file, for `yarn report`'s `loc` tables (`loc-results.json`).
 * - `lines` -- every line, the trailing newline not counted as an extra one
 * - `code` -- lines that are neither blank nor comment-only:  `//` lines, `/* ... *\/` blocks (docstrings
 *   included) and HTML `<!-- -->` blocks don't count;  a line with code AND a comment does
 * - groups are glob lists relative to the root;  `!glob` excludes;  a file counts in its FIRST group
 * - Count after `oxfmt` (`yarn review` formats), so line breaks are comparable between runs.
 ****************/
export class LocCount {
  /** package name, for the results */
  readonly name: string
  /** root, absolute */
  readonly root: string
  /** group => globs, in report order */
  readonly groups: Record<string, string[]>

  constructor({ name, root, groups }: LocCountProps) {
    this.name = name
    this.root = root
    this.groups = groups
  }

  /** Count every group. */
  count(): LocResults {
    const files: LocFile[] = []
    const seen = new Set<string>()
    const groups: LocResults["groups"] = {}
    for (const [group, patterns] of Object.entries(this.groups)) {
      const total = { files: 0, lines: 0, code: 0 }
      for (const path of this.match(patterns)) {
        if (seen.has(path)) continue
        seen.add(path)
        const counted = { path, group, ...LocCount.countText(readFileSync(`${this.root}/${path}`, "utf8"), path) }
        files.push(counted)
        total.files++
        total.lines += counted.lines
        total.code += counted.code
      }
      groups[group] = total
    }
    return { package: this.name, files, groups }
  }

  /** Files matching `patterns` (minus `!` exclusions), sorted, relative to the root. */
  private match(patterns: string[]): string[] {
    const include = patterns.filter((pattern) => !pattern.startsWith("!"))
    const exclude = patterns.filter((pattern) => pattern.startsWith("!")).map((pattern) => pattern.slice(1))
    const excluded = new Set(exclude.flatMap((pattern) => globSync(pattern, { cwd: this.root })))
    const found = include.flatMap((pattern) => globSync(pattern, { cwd: this.root }))
    return [...new Set(found)]
      .filter((path) => !excluded.has(path) && !/(^|\/)(node_modules|dist|vendor)\//.test(path))
      .map((path) => relative(this.root, `${this.root}/${path}`))
      .sort()
  }

  /** `lines` / `code` of one file's text;  `path` picks the comment syntax (HTML or C-like). */
  static countText(text: string, path = ""): { lines: number; code: number } {
    const rows = text.replace(/\n$/, "").split("\n")
    const html = path.endsWith(".html")
    let inBlock = false
    let code = 0
    for (const row of rows) {
      let rest = row.trim()
      let hasCode = false
      while (rest) {
        if (inBlock) {
          const end = rest.indexOf(html ? "-->" : "*/")
          if (end < 0) {
            rest = ""
            break
          }
          rest = rest.slice(end + (html ? 3 : 2)).trim()
          inBlock = false
          continue
        }
        const open = html ? rest.indexOf("<!--") : rest.indexOf("/*")
        const line = html ? -1 : rest.indexOf("//")
        if (line === 0) break
        if (open === 0) {
          inBlock = true
          rest = rest.slice(html ? 4 : 2)
          continue
        }
        hasCode = true
        break
      }
      if (hasCode) code++
    }
    return { lines: rows.length, code }
  }
}

/** Constructor props of `LocCount`. */
export type LocCountProps = Pick<LocCount, "name" | "root" | "groups">
