import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { dirname, join } from "path"
import { afterAll, describe, expect, test } from "vite-plus/test"

import { CLI } from "$/cli"

/** A throwaway checkout:  a two-section WWOD, a root `AGENTS.md` citing it, a package and a skill. */
const CHECKOUT = realpathSync(mkdtempSync(join(tmpdir(), "agents-")))
afterAll(() => rmSync(CHECKOUT, { recursive: true, force: true }))

put("tsconfig.base.json", "{}")
put("packages/spell/PARSING.md", "# Parsing\n")
put(
  "agents/wwod/WWOD.md",
  [
    "## 1. Working process",
    "- **Ship the product, not the spec:**",
    "  - see §2",
    "## 2. General style",
    "### `Strict` TypeScript:"
  ].join("\n")
)
put(
  "AGENTS.md",
  [
    'As WWOD §1 › "Ship the product", and WWOD §2 › "strict typescript".',
    "WWOD §3 is gone;  `solid-2.html` §9 is another doc's.",
    'WWOD §1 › "Nope" names no rule.',
    "From: WWOD §9 (the original's numbering)",
    "`packages/spell/PARSING.md`, `PARSING.md` and `packages/spell/MISSING.md:12`."
  ].join("\n")
)
put(".claude/skills/demo/SKILL.md", "Runs `scripts/demo.sh`;  WWOD §7.\n")

describe("checkAgentRules()", () => {
  const report = CLI.checkAgentRules(CHECKOUT)

  test("reads WWOD's sections and rule titles", () => {
    expect(report).toMatchObject({ sections: 2, rules: 2, files: 3 })
  })

  test("flags a missing section, a missing rule and a missing path;  a skill's paths go unchecked", () => {
    expect(report.problems).toEqual([
      { file: "AGENTS.md", line: 2, cite: "§3", problem: "no such section" },
      { file: "AGENTS.md", line: 3, cite: '§1 › "Nope"', problem: "no such rule" },
      { file: "AGENTS.md", line: 5, cite: "`packages/spell/MISSING.md`", problem: "no such path" },
      { file: ".claude/skills/demo/SKILL.md", line: 1, cite: "§7", problem: "no such section" }
    ])
  })

  test("more files, by path:  checked like a citer", () => {
    put("notes.md", 'WWOD §2 › "Lax"\n')
    expect(CLI.checkAgentRules(CHECKOUT, ["notes.md"]).problems.at(-1)).toEqual({
      file: "notes.md",
      line: 1,
      cite: '§2 › "Lax"',
      problem: "no such rule"
    })
  })

  test("lines:  one per problem, then the totals", () => {
    expect(CLI.agentRulesLines(report).at(-1)).toBe("3 files, 2 sections, 2 rules, 4 problems")
  })
})

/** Write `text` to `file` in the checkout, making its folder. */
function put(file: string, text: string) {
  mkdirSync(dirname(join(CHECKOUT, file)), { recursive: true })
  writeFileSync(join(CHECKOUT, file), text)
}
