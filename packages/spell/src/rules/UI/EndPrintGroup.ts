import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { UI } from "./UI.parser"

/**
 * `end_print_group` rule:  stop a previous `print group...`
 * - e.g. `end print group`
 */
export class EndPrintGroup extends SpellStatement {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>) {
    return new P.ASTConsoleMethodInvocation(match, { methodName: "groupEnd" })
  }
}
UI.addRule(EndPrintGroup, {
  syntax: "end print group",
  tests: [
    {
      compileAs: "statement",
      tests: [[`end print group"`, `spellCore.console.groupEnd()`]]
    }
  ]
})
