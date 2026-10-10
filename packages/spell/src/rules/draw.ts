/**
 * Draw utilities, tightly tied into `App`, `Drawable` and `List`.
 */

import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"
import { Priority } from "./rules.types"
import { SpellStatement } from "./Statement"

/**
 * Rule module for draw rules (`draw_thing`, `draw_items`, `start_app`).
 * - Each rule class below is followed by the `draw.addRule()` call which defines and registers it.
 */
export const draw = new SpellParser({ module: "draw" })

////////////////
// ## `draw_thing` rule
//    e.g. "draw the card"
////////////////

/**
 * Draw a single thing, e.g. `draw the card` => `spellCore.drawThing(card)`.
 * - `drawThing()` draws it as its reactive `Component`, which re-renders when what its `draw()` read changes.
 */
class draw_thing extends SpellStatement<"expression"> {
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
draw.addRule(draw_thing, {
  syntax: "draw {expression}"
})

////////////////
// ## `draw_items` rule
//    e.g. "draw each card in the deck"
////////////////

/**
 * Draw each/all of a collection of items, e.g. `draw each card in the deck` or `draw all cards of the deck`.
 * - The `each {variable}`/`(the|all)? {plural_identifier}` part is purely for readability -- it's matched
 *   but never read in `getAST()`, only the trailing `{expression}` (the container) is compiled, e.g.
 *   `draw each card in the deck` => `spellCore.drawItems(deck)`.
 */
class draw_items extends SpellStatement<"variable?|plural_identifier?|expression"> {
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
draw.addRule(draw_items, {
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

////////////////
// ## `start_app` rule
//    e.g. "start the game"
////////////////

/** Start a scoped `App`/`Drawable`, e.g. `start the game` => `game.start()` (a method call, not a global). */
class start_app extends SpellStatement<"app"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>) {
    return new P.ASTScopedMethodInvocation(match, {
      thing: P.asAST<P.ASTExpression>(match.groups.app.AST),
      methodName: "start"
    })
  }
}
draw.addRule(start_app, {
  syntax: "start {app:expression}"
})
