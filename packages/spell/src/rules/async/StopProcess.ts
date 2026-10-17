import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { _async } from "./async.parser"

/**
 * `stop_process` rule:  stop a conceptual animation or process.
 * - e.g. `stop animation dealing` => `core.stopProcess('dealing')`
 */
export class StopProcess extends SpellStatement<"name"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>) {
    const { name } = match.groups
    const args = [new P.ASTQuotedExpression(match, name.value)]
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "stopProcess",
      args
    })
  }
}
_async.addRule(StopProcess, {
  syntax: "(stop|end|finish|cancel) (animation|process) {name:constant}",
  tests: [
    {
      compileAs: "statement",
      tests: [
        [`stop animation dealing`, 'core.stopProcess("dealing")'],
        [`stop process dealing`, 'core.stopProcess("dealing")'],
        [`end process dealing`, 'core.stopProcess("dealing")'],
        [`finish process dealing`, 'core.stopProcess("dealing")'],
        [`cancel process dealing`, 'core.stopProcess("dealing")']
      ]
    }
  ]
})
