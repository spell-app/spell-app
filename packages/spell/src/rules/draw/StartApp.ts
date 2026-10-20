import { proto } from "@spell-app/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { draw } from "./draw.parser"

/**
 * `start_app` rule:  start a scoped `App`/`Drawable`, e.g. `start the game` => `game.start()`
 * (a method call, not a global).
 */
export class StartApp extends SpellStatement<"app"> {
  @proto static alias = "statement"

  /** Starting the app is part of the program's start, skipped when an edit keeps its things. */
  startsTheProgram(): boolean {
    return true
  }

  getAST(match: P.MatchFor<this>) {
    return new P.ASTScopedMethodInvocation(match, {
      thing: P.asAST<P.ASTExpression>(match.groups.app.AST),
      methodName: "start"
    })
  }
}
draw.addRule(StartApp, {
  syntax: "start {app:expression}"
})
