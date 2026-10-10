/**
 * Random statements that didn't earn their own file.
 */

import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"
import { SpellStatement } from "./Statement"

/**
 * Rule module for miscellaneous statements (currently just `do_nothing`).
 * - Each rule class below is followed by the `statements.addRule()` call which defines and registers it.
 */
export const statements = new SpellParser({ module: "statements" })

////////////////
// ## `do_nothing` rule
//    e.g. "do nothing"
////////////////

/** No-op statement -- compiles to `spellCore.doNothing()`. */
class DoNothing extends SpellStatement {
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
