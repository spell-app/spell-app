import { NONE } from "$/util"
import { P } from "$/parser"
import { SpellExpression } from "$/spell/rules/expressions"
import { itsObject, type ItsMatchData } from "./properties.shared"
import { properties } from "./properties.parser"

/**
 * `its_ordinal` rule:  `its {ordinal} {arg}` -- possessive-plus-ordinal shorthand, e.g. `its third card`.
 * - Tracks `it`:  `get it` / `put its foo in the bar`.
 * - Synonym for `this` if `it` is not (yet) defined in scope.
 * - Compiles to `spellCore.getItemAt(object, ordinal)` rather than a plain property access.
 */
export class ItsOrdinal extends SpellExpression<"ordinal|arg", ItsMatchData & { itemType?: P.Datatype }> {
  /** Note `it`, and what it holds, while we can look them up. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const itVar = (match.data.itVar = scope.variables?.get("it") ?? NONE)
    if (itVar !== NONE) match.data.itemType = scope.getItemType(itVar.datatype)
    return match
  }
  /** An item of `it`, e.g. `Card` for `its first card` in a method of decks. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return match.data.itemType
  }
  getAST(match: P.MatchFor<this>) {
    const { ordinal } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "getItemAt",
      args: [itsObject(match), P.asAST<P.ASTExpression>(ordinal.AST)]
    })
  }
}
properties.addRule(ItsOrdinal, {
  syntax: "its {ordinal} {arg:singular_identifier}",
  tests: [
    {
      title: "tracks `it` when it var defined explicitly",
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add({ name: "it", output: "it" })
      },
      tests: [
        ["its third foo", "spellCore.getItemAt(it, 3)"],
        ["its last card", "spellCore.getItemAt(it, -1)"]
      ]
    },
    {
      title: "tracks `it` when it var defined via get",
      compileAs: "block",
      tests: [
        [
          ["get a new thing", "print its last item"],
          ["let it = new Thing()", "spellCore.console.log(spellCore.getItemAt(it, -1))"],
          ["const it = new Thing()", "spellCore.console.log(spellCore.getItemAt(it, -1)!)"]
        ]
      ]
    },
    {
      title: "tracks `it` when it var defined as output `other`",
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add({ name: "it", output: "other" })
      },
      tests: [["its third thing", "spellCore.getItemAt(other, 3)"]]
    },
    {
      title: "maps to `this` when `it` is not defined",
      compileAs: "expression",
      tests: [["its third thing", "spellCore.getItemAt(this, 3)"]]
    }
  ]
})
