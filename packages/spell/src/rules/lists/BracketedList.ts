import { proto } from "$/util"
import { P } from "$/parser"
import { lists } from "./lists.parser"

/**
 * `bracketed_list` rule:  bracketed list (array) literal, e.g. `[1,2 , true,false ]`.
 * TODO: nested lists????
 */
export class BracketedList extends P.Sequence<"list?"> {
  @proto static alias = "expression"
  @proto static datatype = "list"

  /** A `list of` what its items all are, e.g. `list of numbers` for `[1, 2]` -- else just a `list`. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    const types = new Set(match.groups.list?.items.map((item) => item.datatype))
    const [itemType] = types
    return types.size === 1 && itemType ? P.listOf(itemType) : this.datatype
  }

  getAST(match: P.MatchFor<this>): P.ASTListExpression {
    const { list } = match.groups
    const items = list ? list.items.map((item) => P.matchAST(item)) : undefined
    return new P.ASTListExpression(match, { items })
  }
}
lists.addRule(BracketedList, {
  syntax: "\\[ [list:{expression} ,]? \\]",
  tests: [
    {
      title: "correctly matches literal lists",
      tests: [
        ["[]", "[]"],
        ["[1]", "[1]"],
        ["[1,]", "[1]"],
        ["[1,2,3]", "[1, 2, 3]"],
        ["[1, 2, 3]", "[1, 2, 3]"],
        ["[1,2,3,]", "[1, 2, 3]"],
        [`[yes,no,"a",1]`, `[true, false, "a", 1]`]
      ]
    },
    {
      title: "doesn't match malformed lists ",
      tests: [
        ["", undefined],
        ["[,1]", undefined]
      ]
    }
  ]
})
