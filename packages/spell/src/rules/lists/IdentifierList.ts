import { proto } from "$/util"
import { P } from "$/parser"
import { lists } from "./lists.parser"

/**
 * `identifier_list` rule:  list of identifiers and/or numbers, e.g. `clubs or hearts`, `jack, queen, king`.
 * - NOTE: not a generic `expression` -- deliberately narrow to known variables / constants / numbers,
 *   else it'd swallow anything.
 */
export class IdentifierList extends P.Repeat {
  @proto static datatype = "list"

  getAST(match: P.MatchFor<this>): P.ASTListExpression {
    return new P.ASTListExpression(match, { items: IdentifierList.itemASTs(match as P.Match) })
  }

  /** Each item's AST, a `number_range` spread out into its numbers, e.g. `2 ... 4` => `2`, `3`, `4`. */
  static itemASTs(match: P.Match): P.ASTExpression[] {
    return match.items.flatMap((item) => {
      const AST = P.matchAST<P.ASTExpression>(item)
      return AST instanceof P.ASTListExpression ? (AST.items ?? []) : [AST]
    })
  }
}
lists.addRule(IdentifierList, {
  syntax: "[({number_range}|{known_variable}|{constant}|{number}) (,|or|and|nor)]",
  tests: [
    {
      tests: [
        ["up or down", '["up", "down"]'],
        ["red and black", '["red", "black"]'],
        ["back nor forth", '["back", "forth"]'],
        ["clubs, diamonds, hearts, spades", '["clubs", "diamonds", "hearts", "spades"]'],
        ["ace, 2, 3, 4, jack, queen or king", '["ace", 2, 3, 4, "jack", "queen", "king"]'],
        ["ace, 2 ... 5, jack, queen or king", '["ace", 2, 3, 4, 5, "jack", "queen", "king"]']
      ]
    }
  ]
})
