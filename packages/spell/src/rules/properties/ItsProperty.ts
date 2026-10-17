import { NONE } from "$/util"
import { P } from "$/parser"
import { MemberReadExpression } from "./MemberReadExpression"
import { itsObject, type ItsMatchData } from "./properties.shared"
import { properties } from "./properties.parser"

/**
 * `its_property` rule:  `its {property}` -- possessive shorthand.
 * - A LOOSE read:  ONE word nothing need declare, as `property_expression`.
 * - Tracks `it`:  `get it` / `put its foo in the bar`.
 * - Synonym for `this` if `it` is not (yet) defined in scope.
 */
export class ItsProperty extends MemberReadExpression<"property", ItsMatchData> {
  /** Note `it`, its type, and the member of it we read, while we can look them up. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const itVar = (match.data.itVar = scope.variables?.get("it") ?? NONE)
    if (itVar !== NONE) {
      const ownerType = (match.data.ownerType = scope.getType(itVar.datatype))
      match.data.member = ownerType?.getMember(`${match.groups.property.value}`)
      if (!match.data.member) MemberReadExpression.warnIfUndeclared(match, ownerType, match.groups.property)
    }
    return match
  }
  getAST(match: P.MatchFor<this>) {
    const property = P.asAST<P.ASTPropertyLiteral>(match.groups.property.AST)
    return new P.ASTPropertyExpression(match, { object: itsObject(match), property })
  }
}
properties.addRule(ItsProperty, {
  syntax: "its {property}",
  tests: [
    {
      title: "tracks `it` when it var defined explicitly",
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add({ name: "it", output: "it" })
      },
      tests: [
        ["its foo", "it.foo"],
        ["the foo of its bar", "it.bar.foo"]
      ]
    },
    {
      title: "tracks `it` when it var defined via get",
      compileAs: "block",
      tests: [
        [
          ["get a new thing", "print its foo"],
          ["const it = new Thing()", "spellCore.console.log(it.foo)"]
        ]
      ]
    },
    {
      title: "tracks `it` when it var defined as output `other`",
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add({ name: "it", output: "other" })
      },
      tests: [
        ["its foo", "other.foo"],
        ["the foo of its bar", "other.bar.foo"]
      ]
    },
    {
      title: "maps to `this` when `it` is not defined",
      compileAs: "expression",
      tests: [
        ["its foo", "this.foo"],
        ["the foo of its bar", "this.bar.foo"]
      ]
    }
  ]
})
