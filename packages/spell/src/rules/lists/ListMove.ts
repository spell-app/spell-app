import { proto } from "$/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { lists } from "./lists.parser"

/**
 * `list_move` rule:  `move the card to the tableau` -- moves it, if the pile it belongs to lets it go
 * and the tableau takes it:  their guards, e.g. `a tableau can take a card if: ...` (plan doc Q25).
 * - A statement, or a yes / no -- whether it moved:  `if move the card to the tableau ...`.
 *   Refused:  nothing changes.
 * - Its pile:  the one it's in, if `a card belongs to one pile`.  Else only the tableau is asked.
 * - `add`, `remove` and `clear` never ask:  dealing, gathering cards back.
 * - `Priority.overridable`:  a project's own `to move (a card) to (a pile)` runs instead.
 * - Compiles to `spellCore.move(card, tableau)`.
 */
export class ListMove extends SpellStatement<"thing|list"> {
  @proto static priority = Priority.overridable
  @proto static alias = ["statement", "expression"]
  @proto static datatype: P.Datatype = "choice"
  /** `move x to the pile is yes` => `spellCore.move(x, pile) == true` -- see `operandInExpressions`. */
  @proto static operandInExpressions = true

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { thing, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "move",
      args: [P.matchAST(thing), P.matchAST(list)]
    })
  }
}
lists.addRule(ListMove, {
  syntax: "move {thing:expression} to {list:expression}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("card")
        scope.variables?.add("tableau")
      },
      tests: [
        ["move card to tableau", "spellCore.move(card, tableau)"],
        ["if move card to tableau then print 1", "if (spellCore.move(card, tableau)) spellCore.console.log(1)"]
      ]
    }
  ]
})
