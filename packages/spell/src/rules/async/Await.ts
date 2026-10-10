import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { _async } from "./async.parser"

/**
 * `await` rule:  `await`/`wait for` an expression, with the expression itself optional (bare `await`).
 * - `:?` in `syntax` is an optional literal colon in the source text (e.g. `await:`), matched but
 *   discarded -- NOT the `name:rule` named-group colon.  The `(await|wait for)` keyword itself
 *   stays required.
 * - Bare `await` (no expression) compiles to `await undefined`.
 * - As a statement it waits for a whole expression;  inside an expression, an operand.
 *   See `operandInExpressions`.
 * - TODO: add test to make sure parents are made async properly, especially for `await` inside an
 *   if block, etc.
 */
export class Await extends SpellStatement<"expression?"> {
  @proto static alias = ["expression", "statement"]
  /** `wait for x is 1` => `await (x == 1)`, but `if wait for x is 1` => `(await x) == 1` (plan doc D33). */
  @proto static operandInExpressions = true

  getAST(match: P.MatchFor<this>) {
    const { expression } = match.groups
    return new P.ASTAwaitExpression(match, {
      expression: (expression && P.asAST<P.ASTExpression>(expression.AST)) || new P.ASTNothingLiteral(match)
    })
  }
}
_async.addRule(Await, {
  syntax: "(await|wait for) :? {expression}?",
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["await", "await undefined"],
        ["wait for 1", "await 1"],
        ["set the result to wait for 1", "export let result = await 1", "export const result = await 1"],
        ["wait for 2 is 1", "await (2 == 1)", "await (2 === 1)"],
        [
          "if wait for 2 is 1 then print 1",
          "if (await 2 == 1) { spellCore.console.log(1) }",
          "if (await 2 == 1) spellCore.console.log(1)"
        ]
      ]
    },
    {
      compileAs: "block",
      tests: [
        {
          input: ["to do something", "\twait for 1"],
          js: ["export async function do_something() {", "  await 1", "}"],
          ts: ["export async function doSomething() {", "  await 1", "}"]
        },
        {
          input: ["to do something", "\tif (1) wait for 1"],
          js: ["export async function do_something() {", "  if (1) { await 1 }", "}"],
          ts: ["export async function doSomething() {", "  if (1) await 1", "}"]
        }
      ]
    }
  ]
})
