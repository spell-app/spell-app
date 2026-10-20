import { proto } from "@spell-app/util"
import { P } from "$/parser"
import { SP } from "$/spell"
import { Priority } from "$/spell/rules/rules.types"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { classes } from "./classes.parser"
// Import directly to avoid circular import
import { MustRule } from "./MustRule"

/**
 * `property_must` rule:  what a property's value must be, beyond its type, said on a line of its own.
 * - e.g.
 *   - `- its title must not be empty`
 *   - `- its version must match "^\d+\.\d+\.\d+$"`
 *   - `- its rating must be between 1 and 5, with suggestion "From 1 to 5 stars"`
 * - The words after `must` are `must_rule`'s.
 * - In a type's outline body, with `its`, or with no subject:  `- title must not be empty`.
 * - Its property must be declared above it, on the type:  else a warning, and its declarations leave the rule out.
 * - Compiles to `Card.declareRules("title", [{ type: "empty" }])`, after the class.
 *   - The rules go in its class's schema beside the property's own declaration,
 *     whichever comes first (`declareRules()`).
 * - SIDE EFFECT:  the type's property records the rule, for its declarations -- see `P.TypeScope.addPropertyRules()`.
 * - Epic `property-editor` P9.
 */
export class PropertyMust extends SpellStatement<"type|property|rule"> {
  @proto static priority = Priority.declaration
  @proto static alias = "statement"

  /** SIDE EFFECT:  adds its rule to the property -- a warning if the type has no such property (yet). */
  mutateScope(match: P.MatchFor<this>) {
    const { type, property, rule } = match.groups
    const typeScope = P.TypeScope.getOrStub(match.scope, `${type.value}`, match)
    const name = `${property.value}`
    if (typeScope.addPropertyRules(name, [MustRule.ruleOf(rule as P.MatchFor<MustRule>)], match)) return
    const words = property.raw ?? name
    SP.SpellWarnings.note(match, `Declare "${words}" above its rule, e.g. "- it has a ${words} as text"`)
  }

  getAST(match: P.MatchFor<this>): P.ASTPropertyRules {
    const { type, property, rule } = match.groups
    return new P.ASTPropertyRules(match, {
      type: P.matchAST<P.ASTTypeExpression>(type),
      property: `${property.value}`,
      rules: new P.ASTArrayLiteral(match, { items: [P.matchAST<P.ASTObjectLiteral>(rule)] })
    })
  }
}
classes.addRule(PropertyMust, {
  syntax: "{type:subject_its} {property:member_words} must {rule:must_rule}"
})
classes.addRule(PropertyMust, {
  syntax: "{type:subject_its} {property:quoted_member} must {rule:must_rule}"
})
classes.addRule(PropertyMust, {
  syntax: "{type:subject_implied} {property:body_member_words} must {rule:must_rule}"
})
