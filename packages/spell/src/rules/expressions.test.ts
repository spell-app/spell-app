import { describe, expect, test } from "vite-plus/test"
import { unitTestModuleRules } from "$/spell/test"
import { P } from "$/parser"
import { SP, spellParser } from "$/spell"
import { Precedence } from "$/spell/rules/expressions"
import { Priority } from "$/spell/rules/rules.types"
import { spellCore } from "$/core"

describe("testing spell module expressions", () => {
  unitTestModuleRules(spellParser, "expressions", spellCore.resetRuntime)

  // describe("integration tests", () => {})
})

/**
 * Every built-in rule's non-default `priority`, and every operator's `precedence`:
 *   so neither table, `Priority` nor `Precedence`, drifts unseen.
 * - A change here is a grammar change:  say why in the rule's docstring.
 */
describe("priority and precedence", () => {
  test("every rule which sets one", () => {
    const levels = new Map(Object.entries(Precedence).map(([name, level]) => [level, `Precedence.${name}`]))
    const priorities = new Map(Object.entries(Priority).map(([name, level]) => [level, `Priority.${name}`]))
    const seen = new Map<string, string>()
    for (const rule of Object.values(spellParser.rules).flatMap(ruleAndAlternatives)) {
      const { precedence } = rule as { precedence?: unknown }
      const bits = [
        rule.priority ? (priorities.get(rule.priority) ?? `priority ${rule.priority}`) : "",
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
        "class_member:  Priority.userDeclared",
        "create_list_type:  Priority.declaration",
        "create_type:  Priority.declaration",
        "define_property_has:  Priority.declaration",
        "divided_by:  Precedence.product",
        "does_not_include:  Precedence.comparison",
        "draw_items:  Priority.specific",
        "draw_thing:  Priority.preferred",
        "else_if:  Priority.preferred",
        "ends_with:  Precedence.comparison",
        "exists:  Precedence.comparison",
        "gt_lt:  Precedence.comparison",
        "includes:  Precedence.comparison",
        "is_a:  Precedence.comparison",
        "is_defined:  Priority.preferred, Precedence.comparison",
        "is_empty:  Precedence.comparison",
        "is_equal:  Precedence.equality",
        "is_exactly:  Precedence.equality",
        "is_gt_lt:  Precedence.comparison",
        "is_in:  Precedence.comparison",
        "is_same_type_as:  Precedence.comparison",
        "its_known_property:  Priority.preferred",
        "list_count:  Priority.mostSpecific",
        "list_filter:  Priority.specific",
        "list_length:  Priority.mostSpecific",
        "list_membership_test:  Precedence.comparison",
        "list_position:  Priority.mostSpecific",
        "max:  Priority.specific",
        "min:  Priority.specific",
        "minus:  Precedence.sum",
        "or:  Precedence.or",
        "plus:  Precedence.sum",
        "property_expression:  Priority.preferred",
        "quoted_property_formula:  Priority.declaration",
        "quoted_type_expression:  Priority.belowDeclaration",
        "round_number:  Priority.preferred",
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
