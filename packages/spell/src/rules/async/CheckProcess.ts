import { P } from "$/parser"
import { Negatable, SpellExpression } from "$/spell/rules/expressions"
import { _async } from "./async.parser"

/**
 * `check_process` rule:  check whether a conceptual animation or process is currently running, e.g.
 * `animation dealing is running`.
 * - `is not`/`isn't`/`isnt` negate the check via `P.ASTNotExpression`.
 */
export class CheckProcess extends SpellExpression<"name|operator"> {
  getAST(match: P.MatchFor<this>) {
    const { operator, name } = match.groups
    const expression = new P.ASTCoreMethodInvocation(match, {
      methodName: "processIsRunning",
      args: [new P.ASTQuotedExpression(match, name.value)]
    })
    if (!Negatable.isNegated(operator)) return expression
    return new P.ASTNotExpression(match, { expression })
  }
}
_async.addRule(CheckProcess, {
  syntax: "(animation|process) {name:constant} {operator:is} (running|active)",
  tests: [
    {
      compileAs: "expression",
      tests: [
        [
          `animation dealing is running`,
          `spellCore.processIsRunning('dealing')`,
          'spellCore.processIsRunning("dealing")'
        ],
        [
          `animation dealing isn't running`,
          `!spellCore.processIsRunning('dealing')`,
          '!spellCore.processIsRunning("dealing")'
        ],
        [
          `process dealing is not active`,
          `!spellCore.processIsRunning('dealing')`,
          '!spellCore.processIsRunning("dealing")'
        ]
      ]
    }
  ]
})
