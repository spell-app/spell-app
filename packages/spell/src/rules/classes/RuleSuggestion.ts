import { P } from "$/parser"
import { classes } from "./classes.parser"

/**
 * `rule_suggestion` rule:  what to say when a property's rule is broken, in place of the rule's own words.
 * - e.g. `with suggestion "Write it like 1.2.3"`, or `saying "Write it like 1.2.3"`, after a `must_rule`
 * - A form drawn for the type shows it under the field;  a program's warning says it too.
 * - Compiles to its text.
 * - Epic `property-editor` P9.
 */
export class RuleSuggestion extends P.Sequence<"prompt"> {
  /** Its text, as written between the quotes. */
  static promptOf(match: P.MatchFor<RuleSuggestion>): string {
    return P.matchAST<P.ASTStringLiteral>(match.groups.prompt).value
  }

  getAST(match: P.MatchFor<this>): P.ASTStringLiteral {
    return P.matchAST<P.ASTStringLiteral>(match.groups.prompt)
  }
}
classes.addRule(RuleSuggestion, {
  syntax: ",? (with suggestion|saying) {prompt:text}",
  tests: [
    {
      tests: [
        ['with suggestion "Write it like 1.2.3"', '"Write it like 1.2.3"'],
        [', saying "Too long"', '"Too long"']
      ]
    }
  ]
})
