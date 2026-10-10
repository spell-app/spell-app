import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { statements } from "./statements.parser"

/** `do_nothing` rule:  a no-op statement -- compiles to `spellCore.doNothing()`. */
export class DoNothing extends SpellStatement {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, { methodName: "doNothing" })
  }
}
statements.addRule(DoNothing, {
  syntax: "do nothing",
  tests: [
    {
      compileAs: "statement",
      tests: [[`do nothing"`, `spellCore.doNothing()`]]
    }
  ]
})
