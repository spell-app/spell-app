//
//  # Random statements
//

import { AST, SpellParser } from "~/languages/spell"
import { Sequence } from "~/parser/rule/Sequence"
import { SpellStatement } from "./Statement"
import { SpellExpression } from "./expressions"

export const statements = new SpellParser({
  module: "statements",
  rules: [
    /** Do nothing! */
    {
      name: "do_nothing",
      alias: "statement",
      syntax: "do nothing",
      constructor: "Statement",
      getAST(match) {
        return new AST.CoreMethodInvocation(match, { methodName: "doNothing" })
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
