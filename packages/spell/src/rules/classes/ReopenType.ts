import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { classes } from "./classes.parser"
import { TypeDeclaration } from "./TypeDeclaration"

/**
 * `reopen_type` rule:  adds to a type declared elsewhere, in the outline style -- `a game:`, then bullets about games
 * (epic page `outline-spell`, P11).
 * - Its body is a first body's:  `it` / `its`, quoted names, bare names -- see `TypeDeclaration`.
 * - Its bullets compile as the same lines in the sentence style do (`flatBody`), so they add to the type's class,
 *   in the same file or a later one, as `a game has a score as a number` does.
 * - It compiles to nothing itself:  the type is declared once, where it's declared.
 * - The colon stays required (`where:`, `with:`, `:`, or `where`):  a lone `a game` is a fragment.
 * - A type nobody declares is an error saying how to declare it, e.g. `a gmae:`.
 *
 * ```spell
 * a game is an app
 * ...
 * a game:
 *   - score is a number
 *   - state is:
 *     return "playing"
 * ```
 */
export class ReopenType extends TypeDeclaration<"type|with_nested_statements|body?"> {
  /** Only a type someone declares -- see `SpellStatement.refuseUnknownType()`. */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    return match && SpellStatement.refuseUnknownType(match, match.groups.type)
  }

  /** Nothing of our own:  our body's lines compile beside us, into the type's class. */
  getAST(match: P.MatchFor<this>): P.ASTStatementGroup {
    return new P.ASTStatementGroup(match, { statements: [] })
  }
}
classes.addRule(ReopenType, {
  syntax: "(a|an) {type} {with_nested_statements}"
})
