/**
 * Random statements that didn't earn their own file.
 */

import { P, AST } from "~/parser"
// Import directly to avoid circular import
import { SpellParser } from "~/languages/spell/SpellParser"
import { SpellStatement } from "./Statement"

/** Rule module for miscellaneous statements (currently just `do_nothing`). */
export const statements = new SpellParser({
  module: "statements",
  rules: [
    /** No-op statement -- compiles to `spellCore.doNothing()`. */
    {
      name: "do_nothing",
      alias: "statement",
      syntax: "do nothing",
      constructor: class do_nothing extends SpellStatement {
        getAST(match: P.Match): AST.CoreMethodInvocation {
          return new AST.CoreMethodInvocation(match, { methodName: "doNothing" })
        }
      },
      tests: [
        {
          compileAs: "statement",
          tests: [[`do nothing"`, `spellCore.doNothing()`]]
        }
      ]
    }
  ]
})
