import { proto, singularize } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { lists } from "./lists.parser"
import { type MethodBody } from "./lists.shared"

/**
 * `list_range_iteration` rule:  number range-specific iteration, e.g. `for each number from 1 to 10:`.
 * - Builds `spellCore.map(spellCore.getRange(start, end), (item) => { ... })`,
 *   or `await spellCore.forEachSequential(...)` if its body contains an `await`.
 * - How javascript writes it (`JSWriter`):
 *   - as a list's own method, `spellCore.getRange(1, 10).forEach((number) => {...})`
 *   - as a `for...of` loop, when its body waits
 * TODO: this only works if you `from 1 to 10`, a more general solution which also supports `in {list}` is needed.
 * TODO: `down` is not accounted for in the output
 */
export class ListRangeIteration extends SpellStatement<"item|start|end|body?"> {
  @proto static alias = "statement"

  /**
   * Nested scope for body -- singularized `{item}` variable.
   * - NOTE: unlike sibling iteration rules (`repeat_n_times`, `list_iteration`), doesn't pass
   *   `mapItTo` -- `it` is NOT aliased to `{item}` here, possibly a missed feature.
   */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    const { item } = match.groups
    return new P.MethodScope({
      parentScope: match.scope,
      args: [new P.ScopeVariable({ name: singularize(item.value), declaredBy: item })],
      declaredBy: match
    })
  }
  getAST(match: P.MatchFor<this>): P.ASTExpression {
    const { item, start, end } = match.groups
    const getRange = new P.ASTCoreMethodInvocation(match, {
      methodName: "getRange",
      args: [P.matchAST(start), P.matchAST(end)]
    })
    const method = new P.ASTMethodDefinition(match, {
      inline: true,
      args: [new P.ASTVariableExpression(item)],
      body: P.matchAST<MethodBody>(this.getBody(match))
    })
    const expression = new P.ASTCoreMethodInvocation(match, {
      methodName: method.isAsync ? "forEachSequential" : "map",
      args: [getRange, method]
    })
    if (method.isAsync) return new P.ASTAwaitExpression(match, { expression })
    return expression
  }
}
lists.addRule(ListRangeIteration, {
  syntax: "for each? {item:singular_identifier} from {start:expression} down? to {end:expression} :? {statement_body}?",
  tests: [
    {
      compileAs: "block",
      tests: [
        ["for each number from 1 to 10:", "spellCore.getRange(1, 10).forEach(() => {})"],
        [
          "for each number from 1 to 10: print the number",
          "spellCore.getRange(1, 10).forEach((number) => spellCore.console.log(number))"
        ],
        [
          "for each number from 1 to 10:\n\tprint the number",
          "spellCore.getRange(1, 10).forEach((number) => spellCore.console.log(number))"
        ]
      ]
    }
  ]
})
