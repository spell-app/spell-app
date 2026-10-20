import type { PropRule } from "$/util"
import { P } from "$/parser"
import { classes } from "./classes.parser"
// Import directly to avoid circular import
import { RuleSuggestion } from "./RuleSuggestion"

/**
 * `must_rule` rule:  what a property's value must be, the words after `must`, e.g. `not be empty`.
 * - A PROPERTY RULE.  Its forms:
 *   - `not be empty`
 *   - `match "^\d+$"`
 *   - `be at least 3 letters long`, `be at most 40 letters long`
 *   - `be between 1 and 5`, `be at least 18`, `be at most 120`
 *   - `be an email`, `be a url`
 * - Then, if it likes, what to say when it's broken (`rule_suggestion`):
 *   `with suggestion "..."` or `saying "..."`.
 * - Where it's said:
 *   - on a line of its own (`property_must`):  `- its title must not be empty`
 *   - in the property's own statement (`define_property_has`):  `- it has a title as text, which must not be empty`
 *   - or indented under that statement:  `- it must not be empty`
 * - Compiles to the rule as data (`PropRule`), the shape Spell UI's form checks read:
 *   `{ type: "minLength", value: "3" }`.
 *   - A pattern is written as typed:  `"^\d+$"` means digits, not `d`s.
 * - Where it's checked:
 *   - a form drawn for the type checks it as you type
 *   - a program setting a value that breaks it gets a warning
 * - Epic `property-editor` P9.
 */
export class MustRule extends P.Sequence<
  "empty?|suggestion?|pattern?|bound?|count?|min?|max?|limit?|kind?",
  { rule?: PropRule }
> {
  /** The rule it says, as data, e.g. `{ type: "minLength", value: "3" }`. */
  static ruleOf(match: P.MatchFor<MustRule>): PropRule {
    return (match.data.rule ??= MustRule.readRule(match))
  }

  getAST(match: P.MatchFor<this>): P.ASTObjectLiteral {
    return MustRule.astOf(match, MustRule.ruleOf(match))
  }

  /** `rule` as an object literal:  `{ type: "range", value: "1..5" }`. */
  static astOf(match: P.AnyMatch, rule: PropRule): P.ASTObjectLiteral {
    const literal = new P.ASTObjectLiteral(match, { wrap: false })
    for (const key of ["type", "value", "prompt"] as const) {
      const value = rule[key]
      if (value !== undefined) literal.addProp(key, new P.ASTStringLiteral(match, { value, quote: '"' }))
    }
    return literal
  }

  /** See `ruleOf()`:  worked out from which words matched. */
  private static readRule(match: P.MatchFor<MustRule>): PropRule {
    const { empty, pattern, bound, count, min, max, limit, kind, suggestion } = match.groups
    const atLeast = `${bound?.value}`.toLowerCase() === "at least"
    const rule: PropRule = empty
      ? { type: "empty" }
      : pattern
        ? { type: "regExp", value: `/${P.matchAST<P.ASTStringLiteral>(pattern).value}/` }
        : count
          ? { type: atLeast ? "minLength" : "maxLength", value: `${count.value}` }
          : min && max
            ? { type: "range", value: `${min.value}..${max.value}` }
            : limit
              ? { type: atLeast ? "minValue" : "maxValue", value: `${limit.value}` }
              : { type: `${kind?.value}`.toLowerCase() === "url" ? "url" : "email" }
    if (suggestion?.is(RuleSuggestion)) rule.prompt = RuleSuggestion.promptOf(suggestion)
    return rule
  }
}
classes.addRule(MustRule, {
  syntax: "(empty:not be empty) {suggestion:rule_suggestion}?",
  tests: [
    {
      tests: [
        ["not be empty", '{ type: "empty" }'],
        ['not be empty, with suggestion "Give it a name"', '{ type: "empty", prompt: "Give it a name" }']
      ]
    }
  ]
})
classes.addRule(MustRule, {
  syntax: "match {pattern:pattern_text} {suggestion:rule_suggestion}?",
  tests: [
    {
      tests: [
        ['match "^\\d+$"', '{ type: "regExp", value: "/^\\\\d+$/" }'],
        [
          'match "^[a-z]+$" saying "Small letters only"',
          '{ type: "regExp", value: "/^[a-z]+$/", prompt: "Small letters only" }'
        ]
      ]
    }
  ]
})
classes.addRule(MustRule, {
  syntax: "be (bound:at least|at most) {count:number} (letters|characters) long {suggestion:rule_suggestion}?",
  tests: [
    {
      tests: [
        ["be at least 3 letters long", '{ type: "minLength", value: "3" }'],
        ["be at most 140 characters long", '{ type: "maxLength", value: "140" }']
      ]
    }
  ]
})
classes.addRule(MustRule, {
  syntax: "be between {min:number} and {max:number} {suggestion:rule_suggestion}?",
  tests: [{ tests: [["be between 1 and 5", '{ type: "range", value: "1..5" }']] }]
})
classes.addRule(MustRule, {
  syntax: "be (bound:at least|at most) {limit:number} {suggestion:rule_suggestion}?",
  tests: [
    {
      tests: [
        ["be at least 18", '{ type: "minValue", value: "18" }'],
        ["be at most 120", '{ type: "maxValue", value: "120" }']
      ]
    }
  ]
})
classes.addRule(MustRule, {
  syntax: "be (a|an) (kind:email|url) {suggestion:rule_suggestion}?",
  tests: [
    {
      tests: [
        ["be an email", '{ type: "email" }'],
        ["be a url", '{ type: "url" }']
      ]
    }
  ]
})
