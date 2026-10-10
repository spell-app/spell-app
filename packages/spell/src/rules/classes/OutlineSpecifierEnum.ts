import { proto } from "$/util"
import { P } from "$/parser"
import { classes } from "./classes.parser"
import { TypeSpecifierEnum } from "./TypeSpecifierEnum"

/**
 * `outline_specifier_enum` rule:  the `type_specifier`s again, without their `as`,
 * for an outline body's `its "suit" is ...`:
 * - `one of clubs, diamonds` / `either up or down` -- `outline_specifier_enum`
 * - `a number`, `an automobile` -- `outline_specifier_datatype`
 * - `yes or no` -- `outline_specifier_yes_or_no`
 * - Their own alias, `outline_specifier`, so `a card has a suit one of ...` (no `as`) stays an error.
 */
export class OutlineSpecifierEnum extends TypeSpecifierEnum {
  @proto static alias = "outline_specifier"

  /**
   * Without `either` / `one of`, two or more values joined by `or`, e.g. `up or down` (plan doc Q4's comparison):
   * one value alone, `its "x" is total`, stays a getter.
   */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    if (!match || /^(either|one)$/i.test(`${tokens[0]?.value}`)) return match
    const list = (match.groups as { enumeration: P.Match }).enumeration
    const hasOr = list.tokens.some((token) => `${token.value}`.toLowerCase() === "or")
    return list.items.length >= 2 && hasOr ? match : undefined
  }
}
classes.addRule(OutlineSpecifierEnum, {
  syntax: "(either|one of) {enumeration:identifier_list}",
  tests: [
    {
      tests: [["one of clubs, diamonds, hearts, spades", '["clubs", "diamonds", "hearts", "spades"]']]
    }
  ]
})
classes.addRule(OutlineSpecifierEnum, {
  syntax: "{enumeration:identifier_list}",
  tests: [
    {
      tests: [
        ["up or down", '["up", "down"]'],
        ["up", undefined],
        ["up, down", undefined]
      ]
    }
  ]
})
