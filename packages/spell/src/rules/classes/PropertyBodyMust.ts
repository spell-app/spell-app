import { proto } from "$/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
// Through the folder:  read only when called, once the folder has loaded
import { DefinePropertyHas } from "$/spell/rules/classes"
import { classes } from "./classes.parser"

/**
 * `property_body_must` rule:  a RULE for a property, indented under the property's own line:  what its value must be
 * (epic `property-editor` P9).
 * - e.g. under `- it has a title as text`:  `- it must not be empty`, `- must be at most 40 letters long`
 * - `it` is the property here, not the type;  the words after `must` are `must_rule`'s.
 * - Only in a property's body:  anywhere else it isn't understood.
 * - Compiles to nothing itself:  its property's statement (`define_property_has`) puts its rule in the property's
 *   declaration, `declareProp("title", { type: "text", rules: [...] })`, and records it for its declarations.
 */
export class PropertyBodyMust extends SpellStatement<"it?|rule"> {
  @proto static priority = Priority.declaration
  @proto static alias = "statement"

  /** Only in a property's body -- see `propertyIn()`. */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    if (!PropertyBodyMust.propertyIn(scope)) return undefined
    return super.parse(scope, tokens)
  }

  getAST(match: P.MatchFor<this>): P.ASTStatementGroup {
    return new P.ASTStatementGroup(match, { statements: [] })
  }

  /** The property statement whose body `scope` is, if it is one:  a `define_property_has` match. */
  static propertyIn(scope: P.Scope): P.Match | undefined {
    const owner = P.SubjectScope.of(scope)?.declaredBy
    return owner?.is(DefinePropertyHas) ? owner : undefined
  }
}
classes.addRule(PropertyBodyMust, {
  syntax: "(it:it)? must {rule:must_rule}"
})
