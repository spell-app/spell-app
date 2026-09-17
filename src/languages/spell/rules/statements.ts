//
//  # Random statements
//

import type { Match } from "~/parser/Match"
import { AST, SpellParser } from "~/languages/spell"
import { SpellStatement } from "./Statement"

export const statements = new SpellParser({
  module: "statements",
  rules: [
    /** Do nothing! */
    {
      name: "do_nothing",
      alias: "statement",
      syntax: "do nothing",
      constructor: class do_nothing extends SpellStatement {
        getAST(match: Match): AST.CoreMethodInvocation {
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
