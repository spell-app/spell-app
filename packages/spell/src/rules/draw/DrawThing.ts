import { proto } from "$/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { draw } from "./draw.parser"

/**
 * `draw_thing` rule:  draw a single thing, e.g. `draw the card` => `spellCore.drawThing(card)`.
 * - `drawThing()` draws it as its reactive `Component`, which re-renders when what its `draw()` read changes.
 */
export class DrawThing extends SpellStatement<"expression"> {
  /** An expression (JSX `{draw …}`) AND a statement:  as a statement, a project's own `draw` method would win. */
  @proto static alias = ["statement", "expression"]
  /**
   * Beats a call to the project's own `to draw (a card)` (`Priority.normal`):
   * `card.draw()` would skip the re-rendering.
   */
  @proto static priority = Priority.preferred

  getAST(match: P.MatchFor<this>) {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "drawThing",
      args: [P.asAST<P.ASTExpression>(match.groups.expression.AST)]
    })
  }
}
draw.addRule(DrawThing, {
  syntax: "draw {expression}"
})
