import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { UI } from "./UI.parser"

/**
 * `warn` rule:  warning message -- like alert but more dire.
 * - e.g. `warn "Yo!"`
 * - Returns a promise which resolves when they click `ok`.
 * - NOTE: we'll `await` the promise!
 * - TODO: `the result = await ...` ?
 */
export class Warn extends SpellStatement<"message|okButton?"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>) {
    const { message, okButton } = match.groups
    const args: P.ASTExpression[] = [P.asAST<P.ASTExpression>(message.AST)]
    if (okButton) args.push(P.asAST<P.ASTExpression>(okButton.AST))
    return new P.ASTAwaitExpression(match, {
      expression: new P.ASTCoreMethodInvocation(match, {
        methodName: "warn",
        args
      })
    })
  }
}
UI.addRule(Warn, {
  syntax: "warn {message:expression} (with {okButton:text})?",
  tests: [
    {
      compileAs: "statement",
      tests: [
        [`warn "Yo!"`, `await spellCore.warn("Yo!")`],
        [`warn "Yo!" with "yep"`, `await spellCore.warn("Yo!", "yep")`]
      ]
    }
  ]
})
