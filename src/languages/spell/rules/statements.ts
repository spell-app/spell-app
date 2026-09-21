/**
 * Random statements that didn't earn their own file.
 */

import { proto } from "~/util"
import { P } from "~/parser"
// Import directly to avoid circular import
import { SpellParser } from "~/languages/spell/SpellParser"
import { SpellStatement } from "./Statement"

/** No-op statement -- compiles to `spellCore.doNothing()`. */
export class do_nothing extends SpellStatement {
  @proto static alias = "statement"
  @proto static syntax = "do nothing"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, { methodName: "doNothing" })
  }

  static tests: P.RuleTests = [
    {
      compileAs: "statement",
      tests: [[`do nothing"`, `spellCore.doNothing()`]]
    }
  ]
}

/** Rule module for miscellaneous statements (currently just `do_nothing`). */
export const statements = new SpellParser({
  module: "statements",
  rules: [do_nothing]
})
