import { P } from "$/parser"
import { SP } from "$/spell"
// Import directly to avoid circular import
import { SpellExpression } from "$/spell/rules/expressions"
import { lists } from "./lists.parser"

/**
 * `merge_lists` rule:  merge a set of lists together, e.g. `merge the piles` => `spellCore.mergeLists(piles)`.
 * - QUESTIONABLE SYNTAX: `(as|into) (a|an) new? {type}` clause picks constructor for result, e.g.
 *   `merge the piles as a list` => `spellCore.mergeLists(piles, List)`.
 */
export class MergeLists extends SpellExpression<"expression|type?"> {
  /** The type it's merged `as`, else a `list`. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    const { type } = match.groups
    return type ? SP.typeName(`${type.value}`) : "list"
  }

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { expression, type } = match.groups
    const args = [P.matchAST(expression)]
    if (type) args.push(P.matchAST(type))
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "mergeLists",
      args
    })
  }
}
lists.addRule(MergeLists, {
  syntax: "merge lists? {expression:operand} ((as|into) (a|an) new? {type:known_type})?",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("piles")
      },
      tests: [
        ["merge the piles", "spellCore.mergeLists(piles)"],
        ["merge the piles as a list", "spellCore.mergeLists(piles, List)"]
      ]
    }
  ]
})
