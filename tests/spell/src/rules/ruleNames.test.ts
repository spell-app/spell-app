import { describe, expect, test } from "vite-plus/test"

import { P } from "$/parser"
import { spellParser } from "$/spell"

/**
 * The rule names spell's parsers know, pinned:  a rule's class may be renamed or moved to a file of its own
 * (epic `output-targets` P18), but the NAME it's registered under, what `syntax` strings and declarations refer to,
 * never changes by accident.
 * - Names are worked out from the class name (`ListAddRelative` => `list_add_relative`), unless it sets
 *   `static ruleName`:  see `P.Rule.ruleNameFor()`.
 * - `rules`:  every registered rule, `<name> · <module> · <instances>`, sorted.
 *   A rule file left out of its folder's `index.ts` drops its line.
 * - `order`:  each collection's members (`statement`, `expression` ...) in the order they were registered:
 *   when two rules tie, the order decides which wins.
 * - If this fails after a rename:  set `static ruleName` on the class, so its name stays.
 */
describe("rule names", () => {
  test("spell's rules keep their names, modules and order", () => {
    expect(ruleNamesOf(spellParser)).toMatchSnapshot()
  })

  test("rulex's rules keep their names", () => {
    expect(ruleNamesOf(P.Parser.rulexParser!)).toMatchSnapshot()
  })
})

/** `parser`'s rules, by name, module and how many times each was registered;  and each collection's order. */
function ruleNamesOf(parser: P.Parser) {
  const instances = new Set<P.Rule>()
  const order: Record<string, string[]> = {}
  for (const [key, rule] of Object.entries(parser.rules)) {
    if (rule instanceof P.Group) {
      rule.rules.forEach((it) => instances.add(it))
      order[key] = rule.rules.map((it) => it.name ?? "(anonymous)")
    } else instances.add(rule)
  }
  const counts = new Map<string, number>()
  for (const rule of instances) {
    const line = `${rule.name ?? "(anonymous)"} · ${rule.module ?? "-"}`
    counts.set(line, (counts.get(line) ?? 0) + 1)
  }
  return {
    rules: [...counts].map(([line, count]) => `${line} · ${count}`).sort(),
    order: Object.fromEntries(Object.entries(order).sort(([a], [b]) => a.localeCompare(b)))
  }
}
