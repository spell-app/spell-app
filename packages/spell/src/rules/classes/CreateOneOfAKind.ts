import { proto } from "@spell-app/util"
import { P } from "$/parser"
import { classes } from "./classes.parser"
import { CreateType } from "./CreateType"

/**
 * `create_one_of_a_kind` rule:  `solitaire is an app` --
 * declares an app AND its one instance (epic `outline-spell` P21).
 * - e.g. `solitaire is an app where:`, then its outline body, as `a solitaire is an app where:` has
 * - No article:  it names the thing, not a kind of thing.
 *   - The type is `Solitaire`, as for `a solitaire is an app`;  its one instance is the variable `solitaire`.
 *   - So there's no `set the solitaire to a new solitaire`:  `print solitaire`, `debug the solitaire` just work.
 * - Only an app, or a kind of app:  `x is a thing` isn't ours.
 * - The instance is made where the line is, right after its class:
 *   classes declared further down the file move up above it (`SP.hoistClassDeclarations()`),
 *   so its properties' starting values can make things of those types.
 * - Its body's methods that name no receiver (`- to reset:`) can be called anywhere with none, and run on it:
 *   see `DynamicMethodRule.onThis()`.
 */
export class CreateOneOfAKind extends CreateType {
  @proto static declares: P.DeclaresSpec = { kind: "type", name: "type", detail: "superType" }

  /**
   * Quick test:  no article first (`a solitaire is an app` is `create_type`'s), and `is a|an <app>` after it.
   * - So an editor doesn't offer `is a ...` after just any words, e.g. `set y`:  only on a line naming an app.
   */
  test(scope: P.Scope, tokens: P.Token[], start = 0) {
    if (tokens[start]?.matchesLiteral(["a", "an"])) return false
    const is = tokens.findIndex((token, index) => index > start && token.matchesLiteral("is"))
    if (is < 0 || !tokens[is + 1]?.matchesLiteral(["a", "an"])) return false
    const superType = tokens[is + 2]
    if (!superType || !scope.getType(`${superType.value}`)?.isA("App")) return false
    return super.test(scope, tokens, start)
  }

  /** Only an app, or a kind of app, is one of a kind. */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    // refused (`refuseTakenNames()`), with no super-type to check:  not ours
    const superType = match?.groups.superType as P.Match<P.MatchGroups, { scopeType?: unknown }> | undefined
    if (!superType) return undefined
    const { scopeType } = superType.data
    return scopeType instanceof P.TypeScope && scopeType.isA("App") ? match : undefined
  }

  /** SIDE EFFECT:  declares our type, then its one instance, e.g. `solitaire` -- a variable of kind `only`. */
  mutateScope(match: P.MatchFor<this>) {
    super.mutateScope(match)
    const words = `${match.groups.type.value}`
    match.scope.variables?.add({
      name: CreateOneOfAKind.variableName(match),
      datatype: match.scope.getType(words)?.name ?? words,
      kind: "only",
      declaredBy: match
    })
  }

  /** The class, then its one instance:  `export const solitaire = new Solitaire()`. */
  getAST(match: P.MatchFor<this>): P.ASTStatementGroup {
    const group = super.getAST(match)
    const type = P.matchAST<P.ASTTypeExpression>(match.groups.type)
    const made = new P.ASTAssignmentStatement(match, {
      thing: new P.ASTVariableExpression(match, { name: CreateOneOfAKind.variableName(match) }),
      value: new P.ASTNewInstanceExpression(match, { type }),
      isNewVariable: true
    })
    return new P.ASTStatementGroup(match, { statements: [...(group.statements ?? []), made] })
  }

  /** Name of the one instance's variable:  the line's words, `my_game` for `my game is an app`. */
  static variableName(match: P.Match): string {
    return `${(match.groups.type as P.Match).raw}`
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_")
  }
}
classes.addRule(CreateOneOfAKind, {
  syntax: "{type:type_words} is (a|an) {superType:type} {with_nested_statements}?",
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["solitaire is an app", ["export class Solitaire extends App {}", "export const solitaire = new Solitaire()"]],
        ["solitaire is a thing", undefined]
      ]
    }
  ]
})
