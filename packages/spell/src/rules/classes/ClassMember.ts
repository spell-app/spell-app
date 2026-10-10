import { proto } from "$/util"
import { P } from "$/parser"
import { Priority, declaredPrefix } from "$/spell/rules/rules.types"
import { getKnownType } from "$/spell/rules/types"
import { SpellExpression } from "$/spell/rules/expressions"
import { classes } from "./classes.parser"

/**
 * `class_member` rule:  `{type} {member words}` -- a class variable of a known type, e.g.:
 * - `card suits` / `Card Suits` ~== `Card.Suits`
 * - `bank-account account-types` ~== `Bank_Account.Account_types`
 * - ONE rule for every type:  the member resolves through `type`'s `classVariables`,
 *   e.g. `Suits` as `cards have a suit as one of ...` declares it -- see `define_property_has`.
 *   Was a rule per enumeration.
 * - The LONGEST run of words the type declares, e.g. `suits` in `card suits includes x`.
 * - `Priority.userDeclared`, as the per-enumeration rule had:
 *   a type's own member beats a longer built-in reading.
 */
export class ClassMember extends SpellExpression<"type|member", ClassMemberData> {
  @proto static priority = Priority.userDeclared
  @proto static datatype = "list"

  /** Resolve the longest run of our words `type` declares as a class variable -- see class docs. */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const { type, member } = match.groups
    const typeScope = getKnownType(type)
    const count = declaredPrefix(member, (words) => !!typeScope.getClassVariable(words))
    if (!count) return undefined
    // fewer words than we took:  parse just those -- the type and them
    if (count < member.length) return this.parse(scope, tokens.slice(0, 1 + count))
    match.data.classVariable = typeScope.getClassVariable(`${member.raw}`)
    return match
  }

  getAST(match: P.MatchFor<this>): P.ASTPropertyExpression {
    const { type, member } = match.groups
    return new P.ASTPropertyExpression(match, {
      object: P.matchAST<P.ASTTypeExpression>(type),
      property: match.data.classVariable?.name ?? `${member.value}`
    })
  }
}
classes.addRule(ClassMember, {
  syntax: "{type:known_type} {member:member_words}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.compile(
          [
            "a card is a thing",
            "a card has a suit as one of clubs, diamonds",
            "a bank-account is a thing",
            "a bank-account has an account-type as one of savings, checking"
          ].join("\n"),
          "block"
        )
      },
      tests: [
        ["card suits", "Card.Suits"],
        ["Card Suits", "Card.Suits"],
        ["bank-account account-types", "Bank_Account.Account_types"],
        { title: "not a class variable", input: "card ranks", js: undefined }
      ]
    }
  ]
})

/** What `class_member` stashes on its match. */
type ClassMemberData = {
  /** Class variable it reads, found while parsing, e.g. `Suits` of `Card`. */
  classVariable?: P.ScopeVariable
}
