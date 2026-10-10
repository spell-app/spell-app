import { P } from "$/parser"
import { IdentifierList } from "./IdentifierList"
import { lists } from "./lists.parser"

/**
 * `value_choices` rule:  two or more KNOWN values joined by `or`, e.g. `diamonds or hearts`, `jack, queen or king`
 * -- for `it is diamonds or hearts` (`is_in`):  the same as `it is one of diamonds or hearts`.
 * - Only known constants and numbers:  `x is red or y is 2` stays two comparisons.
 * - Fixes `its suit is diamonds or hearts`, which compiled to `(this.suit == 'diamonds') || 'hearts'`:  always
 *   true (plan doc `outline-spell`, P2;  was `agents/SUSPECTED-BUGS.md`).
 */
export class ValueChoices extends IdentifierList {
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    if (!match || match.items.length < 2) return undefined
    const lastDelimiter = match.tokens.at(-(match.items.at(-1)!.tokens.length + 1))
    return `${lastDelimiter?.value}`.toLowerCase() === "or" ? match : undefined
  }
}
lists.addRule(ValueChoices, {
  syntax: "[({known_constant}|{number}) (,|or)]",
  tests: [
    {
      beforeEach(scope: P.Scope) {
        for (const name of ["jack", "queen", "king"]) scope.constants?.add(name)
      },
      tests: [
        ["jack or queen", '["jack", "queen"]'],
        ["jack, queen or king", '["jack", "queen", "king"]'],
        ["2 or 3", "[2, 3]"],
        ["jack, queen", undefined],
        ["jack or red", undefined]
      ]
    }
  ]
})
