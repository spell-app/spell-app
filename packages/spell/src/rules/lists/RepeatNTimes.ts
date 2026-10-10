import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { lists } from "./lists.parser"
import { type MethodBody } from "./lists.shared"

/**
 * `repeat_n_times` rule:  repeat an action `N` times, e.g. `repeat 3 times: print the number`.
 * - Both a `statement` and an `expression` -- usable inline or as a block.
 * - Body runs as a nested block or inline statement (`{statement_body}?`);
 *   current iteration number, from 1, is available as `number` (also aliased from `it`).
 * - Compiles to `spellCore.map(spellCore.countTo(number), (number) => { ... })`, or
 *   `await spellCore.forEachSequential(...)` if body contains an `await` (`method.isAsync`).
 */
export class RepeatNTimes extends SpellStatement<"number|body?"> {
  @proto static alias = ["statement", "expression"]

  /** Nested scope for body -- `number` variable (current iteration index), also aliased from `it`. */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    return new P.MethodScope({
      parentScope: match.scope,
      args: [new P.ScopeVariable({ name: "number", datatype: "number" })],
      mapItTo: "number",
      itDatatype: "number",
      declaredBy: match
    })
  }

  /**
   * Build `map`/`forEachSequential` call over `countTo(number)` -- runs `number` times, NOT one more.
   * - SIDE EFFECT: switches to `forEachSequential` + wraps result in `AwaitExpression` when body's
   *   `method.isAsync` -- set by an `await` expression somewhere in body.
   */
  getAST(match: P.MatchFor<this>): P.ASTExpression {
    const { number } = match.groups
    const method = new P.ASTMethodDefinition(match, {
      inline: true,
      args: [new P.ASTVariableExpression(match, { name: "number" })],
      body: P.matchAST<MethodBody>(this.getBody(match))
    })
    const countTo = new P.ASTCoreMethodInvocation(match, { methodName: "countTo", args: [P.matchAST(number)] })
    const expression = new P.ASTCoreMethodInvocation(match, {
      methodName: method.isAsync ? "forEachSequential" : "map",
      args: [countTo, method]
    })
    if (method.isAsync) return new P.ASTAwaitExpression(match, { expression })
    return expression
  }
}
lists.addRule(RepeatNTimes, {
  syntax: "repeat {number:expression} (time|times) :? {statement_body}?",
  tests: [
    {
      compileAs: "block",
      tests: [
        {
          title: "No statements",
          input: "repeat 1 time:",
          js: "spellCore.map(spellCore.countTo(1), (number) => {})",
          ts: "spellCore.map(spellCore.countTo(1), () => {})"
        },
        {
          title: "Inline statement",
          input: "repeat 3 times: print the number",
          js: ["spellCore.map(spellCore.countTo(3), (number) => {", "  return spellCore.console.log(number)", "})"],
          ts: "spellCore.map(spellCore.countTo(3), (number) => spellCore.console.log(number))"
        },
        {
          title: "Nested block statement",
          input: ["repeat 3 times:", "\tprint it"],
          js: ["spellCore.map(spellCore.countTo(3), (number) => {", "  spellCore.console.log(number)", "})"],
          ts: "spellCore.map(spellCore.countTo(3), (number) => spellCore.console.log(number))"
        },
        {
          title: "Error if nested block and inline statement",
          input: ["repeat 3 times: print 1", "\tprint it"],
          js: [
            "spellCore.map(spellCore.countTo(3), (number) => {",
            "  spellCore.console.log(number)",
            "})",
            "/* PARSE ERROR: Got both inline statement and nested block */"
          ],
          ts: [
            "spellCore.map(spellCore.countTo(3), (number) => spellCore.console.log(number))",
            "/* PARSE ERROR: Got both inline statement and nested block */"
          ]
        }
      ]
    }
  ]
})
