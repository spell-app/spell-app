import { P } from "$/parser"
import { lists } from "./lists.parser"

/**
 * `number_range` rule:  whole numbers from one to another, e.g. `2 ... 10` in `ace, 2 ... 10, jack, queen or king`
 * (plan doc `outline-spell`, P2).
 * - Compiles to the list of them, `[2, 3, ... 10]`, which `identifier_list` spreads into its own.
 * - Only counting up, by 1, from a whole number to a bigger one, at most `MAX_RANGE` of them.
 */
export class NumberRange extends P.Sequence<"start|end"> {
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const start = Number(match.groups.start.value)
    const end = Number(match.groups.end.value)
    const isWhole = Number.isInteger(start) && Number.isInteger(end)
    return isWhole && end > start && end - start < MAX_RANGE ? match : undefined
  }

  getAST(match: P.MatchFor<this>): P.ASTListExpression {
    const start = Number(match.groups.start.value)
    const end = Number(match.groups.end.value)
    const items = Array.from(
      { length: end - start + 1 },
      (_, index) => new P.ASTNumericLiteral(match, { value: start + index, raw: `${start + index}` })
    )
    return new P.ASTListExpression(match, { items })
  }
}
lists.addRule(NumberRange, {
  syntax: "{start:number} ... {end:number}",
  tests: [
    {
      tests: [
        ["2 ... 4", "[2, 3, 4]"],
        ["4 ... 2", undefined],
        ["1.5 ... 3", undefined]
      ]
    }
  ]
})

/** Most numbers a `number_range` spells out. */
const MAX_RANGE = 1000
