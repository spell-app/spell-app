import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { UI } from "./UI.parser"

/**
 * `prompt` rule:  prompt user to specify a value in response to `message` with `defaultValue`.
 * - e.g. `prompt "Name for the new baby?"`
 * - Returns a promise which `resolve()`s if they "OK", `reject()`s if they "cancel".
 * - TODO: `as number`, `as date`, etc?
 * - NOTE: we'll `await` the promise!
 * - TODO: `the result = await ...` ?
 */
export class Prompt extends SpellStatement<"message|defaultValue?"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>) {
    const { message, defaultValue } = match.groups
    const args: P.ASTExpression[] = [P.asAST<P.ASTExpression>(message.AST)]
    if (defaultValue) args.push(P.asAST<P.ASTExpression>(defaultValue.AST))
    return new P.ASTAwaitExpression(match, {
      expression: new P.ASTCoreMethodInvocation(match, {
        methodName: "prompt",
        args
      })
    })
  }
}
UI.addRule(Prompt, {
  syntax: "prompt {message:expression} (with {defaultValue:expression})?",
  tests: [
    {
      compileAs: "statement",
      tests: [
        [`prompt "Name for the new baby?"`, `await spellCore.prompt("Name for the new baby?")`],
        [`prompt "File name:" with "Untitled"`, `await spellCore.prompt("File name:", "Untitled")`]
      ]
    }
  ]
})

// Chose one or more items from `collection` (of strings???)
// Returns a promise which `resolve()`s if they "OK" with a value, `reject()`s if they "cancel".
// TODO
//     {
//       name: "choose_one",
//       alias: "statement",
//       syntax: "choose ((a|an)? {singular_identifier} (from|of)|one of) {collection:expression} with (prompt|message)? {message:expression}",
//          => `await spellCore.chooseOne(message, list, defaultValue)`
//     },

// Chose one or more items from `collection` (of strings???)
// Returns a promise which `resolve()`s if they "OK" with a value, `reject()`s if they "cancel".
// TODO
//     {
//       name: "choose_multiple",
//       alias: "statement",
//       syntax: "choose multiple {plural_identifier} (of|from) {collection:expression} with (prompt|message)? {message:expression}",
//          => `await spellCore.chooseMultiple(message, list, defaultValues)`
//     }
