import { proto } from "$/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { classes } from "./classes.parser"

/**
 * `can_belong_to_many` rule:  `a card can belong to many piles` -- the opposite of `a card belongs to one pile`:
 * what a list does anyway, so it compiles to nothing.  It says so for a reader (plan doc Q22).
 */
export class CanBelongToMany extends SpellStatement<"type|list"> {
  @proto static priority = Priority.declaration
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTStatementGroup {
    return new P.ASTStatementGroup(match, { statements: [] })
  }
}
classes.addRule(CanBelongToMany, {
  syntax: "(a|an) {type:known_type} can belong to many {list:known_type}",
  tests: [
    {
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        scope.parse(["a card is a thing", "a pile is a list of cards"].join("\n"), "block")
      },
      tests: [["a card can belong to many piles", ""]]
    }
  ]
})
