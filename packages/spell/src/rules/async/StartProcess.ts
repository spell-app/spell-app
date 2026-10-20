import { proto } from "@spell-app/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { _async } from "./async.parser"

/**
 * `start_process` rule:  start a conceptual animation or process, e.g. `start animation dealing`.
 * - `exclusive` process guards against re-entry: compiles to an early `return` if the process is
 *   already running, then starts it flagged `'EXCLUSIVE'`.
 * - `animation`/`process` are synonyms in the syntax -- purely for readability at the call site.
 */
export class StartProcess extends SpellStatement<"operator?|name"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>) {
    const { operator, name } = match.groups
    return new P.ASTStartProcessInvocation(match, {
      name: name.value,
      exclusive: operator?.value === "exclusive"
    })
  }
}
_async.addRule(StartProcess, {
  syntax: "start (operator:exclusive|non-exclusive|nonexclusive)? (animation|process) {name:constant}",
  tests: [
    {
      compileAs: "statement",
      tests: [
        [`start process dealing`, 'core.startProcess("dealing")'],
        [`start animation dealing`, 'core.startProcess("dealing")'],
        [`start non-exclusive animation dealing`, 'core.startProcess("dealing")'],
        [`start nonexclusive process dealing`, 'core.startProcess("dealing")'],
        [
          `start exclusive process dealing`,
          ['if (core.processIsRunning("dealing")) return', 'core.startProcess("dealing", "EXCLUSIVE")']
        ]
      ]
    }
  ]
})
