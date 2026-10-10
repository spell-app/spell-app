import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { UI } from "./UI.parser"

/**
 * `alert` rule:  show user a `message` in a modal alert.
 * - e.g. `alert "Yo!"`
 * - Returns a promise which resolves when they click `ok`.
 * - NOTE: we'll `await` the promise!
 * - TODO: `the result = await ...` ?
 */
export class Alert extends SpellStatement<"message|okButton?"> {
  @proto static alias = ["statement", "async"]

  getAST(match: P.MatchFor<this>) {
    const { message, okButton } = match.groups
    const args: P.ASTExpression[] = [P.asAST<P.ASTExpression>(message.AST)]
    if (okButton) args.push(P.asAST<P.ASTExpression>(okButton.AST))
    return new P.ASTAwaitExpression(match, {
      expression: new P.ASTCoreMethodInvocation(match, {
        methodName: "alert",
        args
      })
    })
  }
}
UI.addRule(Alert, {
  syntax: "alert {message:expression} (with {okButton:text})?",
  tests: [
    {
      compileAs: "statement",
      tests: [
        [`alert "Yo!"`, `await spellCore.alert("Yo!")`],
        [`alert "Yo!" with "yep"`, `await spellCore.alert("Yo!", "yep")`]
      ]
    }
  ]
})
