import { proto } from "$/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { draw } from "./draw.parser"

/**
 * `draw_items` rule:  draw each / all of a collection of items.
 * - e.g. `draw each card in the deck`, `draw all cards of the deck`
 * - Only the trailing `{expression}` (the container) is compiled:
 *   - javascript:  `draw each card in the deck` => `spellCore.drawItems(deck)`
 *   - TypeScript:  `<For each={deck.items}>{(item) => item.draw()}</For>`, each item in its own error net
 * - The `each {variable}` / `(the|all)? {plural_identifier}` part is purely for readability:
 *   it's matched, but never read in `getAST()`.
 */
export class DrawItems extends SpellStatement<"variable?|plural_identifier?|expression"> {
  /** An expression (JSX `{draw …}`) AND a statement:  as a statement, a project's own `draw` method would win. */
  @proto static alias = ["statement", "expression"]
  /**
   * Beats `draw_thing` (`Priority.preferred`), which also matches `draw the cards of the deck`:
   * that's each card, not one thing.
   */
  @proto static priority = Priority.specific

  getAST(match: P.MatchFor<this>) {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "drawItems",
      args: [P.asAST<P.ASTExpression>(match.groups.expression.AST)]
    })
  }
}
draw.addRule(DrawItems, {
  syntax: "draw (each {variable}|(the|all)? {plural_identifier}) (of|in) {expression}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("deck")
      },
      tests: [
        {
          input: "draw each card in the deck",
          js: "spellCore.drawItems(deck)",
          ts: "<For each={deck.items}>{(item) => item.draw()}</For>"
        },
        {
          input: "draw cards of the deck",
          js: "spellCore.drawItems(deck)",
          ts: "<For each={deck.items}>{(item) => item.draw()}</For>"
        },
        {
          input: "draw the cards of the deck",
          js: "spellCore.drawItems(deck)",
          ts: "<For each={deck.items}>{(item) => item.draw()}</For>"
        },
        {
          input: "draw all cards of the deck",
          js: "spellCore.drawItems(deck)",
          ts: "<For each={deck.items}>{(item) => item.draw()}</For>"
        }
      ]
    }
  ]
})
