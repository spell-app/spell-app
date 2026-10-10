import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { _async } from "./async.parser"

/**
 * `pause` rule:  delay for a certain amount of time, e.g. `pause for 2 seconds`.
 * - Compiles to `await spellCore.pauseFor(number, 'units')`.
 * - TODO: "a second", "a little bit", "a while", "a noticeable amount".
 */
export class Pause extends SpellStatement<"number|units"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>) {
    const { number, units } = match.groups
    return new P.ASTAwaitExpression(match, {
      expression: new P.ASTCoreMethodInvocation(match, {
        methodName: "pauseFor",
        args: [P.asAST<P.ASTExpression>(number.AST), new P.ASTQuotedExpression(units, units.value)]
      })
    })
  }
}
_async.addRule(Pause, {
  syntax: "pause for {number:expression} (units:second|seconds|sec|millisecond|milliseconds|msec|tick|ticks)",
  tests: [
    {
      compileAs: "statement",
      tests: [
        [`pause for 2 seconds"`, 'await spellCore.pauseFor(2, "seconds")'],
        [`pause for 500 msec"`, 'await spellCore.pauseFor(500, "msec")'],
        [`pause for 10 ticks"`, 'await spellCore.pauseFor(10, "ticks")'],
        [`pause for (10 + 10) sec`, 'await spellCore.pauseFor(10 + 10, "sec")']
      ]
    }
  ]
})
