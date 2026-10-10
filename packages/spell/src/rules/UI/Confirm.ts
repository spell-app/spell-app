import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { UI } from "./UI.parser"

/**
 * `confirm` rule:  confirm message -- present a question with two answers.
 * - e.g. `confirm "Yo!"`
 * - Returns a promise which `resolve()`s when they `ok`, `reject()`s if they `cancel`.
 * - NOTE: we'll `await` the promise!
 * - TODO: `the result = await ...` ?
 */
export class Confirm extends SpellStatement<"message|okButton?|cancelButton?"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>) {
    const { message, okButton, cancelButton } = match.groups
    const args: P.ASTExpression[] = [P.asAST<P.ASTExpression>(message.AST)]
    if (okButton) args.push(P.asAST<P.ASTExpression>(okButton.AST))
    if (cancelButton) args.push(P.asAST<P.ASTExpression>(cancelButton.AST))
    return new P.ASTAwaitExpression(match, {
      expression: new P.ASTCoreMethodInvocation(match, {
        methodName: "confirm",
        args
      })
    })
  }
}
UI.addRule(Confirm, {
  syntax: "confirm {message:expression} (with {okButton:text} ((and|or) {cancelButton:text})?)?",
  tests: [
    {
      compileAs: "statement",
      tests: [
        [`confirm "Yo!"`, `await spellCore.confirm("Yo!")`],
        [`confirm "Yo!" with "yep"`, `await spellCore.confirm("Yo!", "yep")`],
        [`confirm "Yo!" with "yep" and "nope"`, `await spellCore.confirm("Yo!", "yep", "nope")`]
      ]
    }
  ]
})
