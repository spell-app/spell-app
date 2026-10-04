import { describe, expect, test } from "vitest"
import { unitTestModuleRules } from "$/spell/test"
import { P } from "$/parser"
import { SP, spellParser } from "$/spell"
import { Precedence } from "$/spell/rules/expressions"
import { spellCore } from "$/core"

describe("testing spell module expressions", () => {
  unitTestModuleRules(spellParser, "expressions", spellCore.resetRuntime)

  // describe("integration tests", () => {})
})

/**
 * Every built-in rule's non-default `priority`, and every operator's `precedence` -- so neither table drifts
 *   unseen.  A change here is a grammar change:  say why in the rule's docstring.
 */
describe("priority and precedence", () => {
  test("every rule which sets one", () => {
    const levels = new Map(Object.entries(Precedence).map(([name, level]) => [level, `Precedence.${name}`]))
    const seen = new Map<string, string>()
    for (const rule of Object.values(spellParser.rules).flatMap(ruleAndAlternatives)) {
      const { precedence } = rule as { precedence?: unknown }
      const bits = [
        rule.priority ? `priority ${rule.priority}` : "",
        typeof precedence === "number" ? (levels.get(precedence) ?? `precedence ${precedence}`) : ""
      ].filter(Boolean)
      if (bits.length && rule.name) seen.set(rule.name, `${rule.name}:  ${bits.join(", ")}`)
    }
    expect([...seen.keys()].sort().map((name) => seen.get(name))).toMatchInlineSnapshot(`
      [
        "and:  Precedence.and",
        "as_a_type:  Precedence.comparison",
        "as_lowercase:  Precedence.comparison",
        "as_uppercase:  Precedence.comparison",
        "backwards_if:  Precedence.ternary",
        "create_list_type:  priority 10",
        "create_type:  priority 10",
        "define_property_has:  priority 10",
        "divided_by:  Precedence.product",
        "does_not_include:  Precedence.comparison",
        "draw_items:  priority 2",
        "draw_thing:  priority 1",
        "else_if:  priority 1",
        "ends_with:  Precedence.comparison",
        "exists:  Precedence.comparison",
        "gt_lt:  Precedence.comparison",
        "includes:  Precedence.comparison",
        "is_a:  Precedence.comparison",
        "is_defined:  priority 11, Precedence.comparison",
        "is_empty:  Precedence.comparison",
        "is_equal:  Precedence.equality",
        "is_exactly:  Precedence.equality",
        "is_gt_lt:  Precedence.comparison",
        "is_in:  Precedence.comparison",
        "is_same_type_as:  Precedence.comparison",
        "list_filter:  priority 2",
        "list_length:  priority 3",
        "list_membership_test:  Precedence.comparison",
        "list_position:  priority 3",
        "max:  priority 2",
        "min:  priority 2",
        "minus:  Precedence.sum",
        "or:  Precedence.or",
        "plus:  Precedence.sum",
        "quoted_property_formula:  priority 10",
        "quoted_type_expression:  priority 9",
        "round_number:  priority 1",
        "starts_with:  Precedence.comparison",
        "times:  Precedence.product",
      ]
    `)
  })

  /** `rule`, and each rule of a same-named `Group` it stands for. */
  function ruleAndAlternatives(rule: P.Rule): P.Rule[] {
    return rule instanceof P.Group ? [rule, ...rule.rules] : [rule]
  }
})

/**
 * `Negatable` words:  which of a word's forms are negated is said by its syntax's `negated` group.
 */
describe("Negatable", () => {
  /** `true` / `false` if `input` matches negatable rule `word` negated / not, `undefined` if it doesn't match. */
  function negatedIn(parser: SP.SpellParser, word: string, input: string) {
    const match = parser.getScope().parse(input, word)
    return match ? SP.Negatable.isNegated(match) : undefined
  }

  test.each([
    ["is", "is", false],
    ["is", "is not", true],
    ["is", "isn't", true],
    ["is", "isnt", true],
    ["can", "can", false],
    ["can", "cannot", true],
    ["can", "can't", true],
    ["will", "will", false],
    ["will", "won't", true],
    ["has", "has", false],
    ["has", "doesn't have", true]
  ])("`%s`:  '%s' is negated:  %s", (word, input, negated) => {
    expect(negatedIn(spellParser, word, input)).toBe(negated)
  })

  test("several positive forms, in any order -- e.g. a translation's own word", () => {
    const parser = spellParser.clone({ module: "negatable-test" })
    parser.addRule(SP.Negatable.specialize({ ruleName: "tiene" }), { syntax: "((negated:no tiene)|tiene|tienen)" })
    expect(negatedIn(parser, "tiene", "tiene")).toBe(false)
    expect(negatedIn(parser, "tiene", "tienen")).toBe(false)
    expect(negatedIn(parser, "tiene", "no tiene")).toBe(true)
  })
})
