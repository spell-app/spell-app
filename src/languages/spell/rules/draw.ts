/**
 * Draw utilities, tightly tied into `App`, `Drawable` and `List`.
 */

import { P } from "~/parser"
// Import directly to avoid circular import
import { SpellParser } from "~/languages/spell/SpellParser"
import { SpellStatement } from "./Statement"

/**
 * Rule module for draw rules (`draw_thing`, `draw_items`, `start_app`).
 * - Each rule class below is followed by the `draw.addRule()` call which defines and registers it.
 */
export const draw = new SpellParser({ module: "draw" })

/**
 * Narrow `node` from `P.ASTNode | undefined` to concrete subtype `T`.
 * - `Match.AST` is typed generically as `ASTNode | undefined`; use this where a referenced sub-rule's
 *   `getAST()` is known (by inspection, not statically provable) to always produce `T`.
 * - Does not actually check `node`'s type or that it's defined -- purely a compile-time cast.
 */
function ast<T extends P.ASTNode>(node: P.ASTNode | undefined): T {
  return node as T
}

////////////////
// ## `draw_thing` rule
//    e.g. "draw the card"
////////////////

/**
 * Draw a single thing, e.g. `draw the card`.
 * - `precedence: 100` is far higher than any other rule's precedence in this codebase (elsewhere
 *   the range used is roughly 1-20) -- TODO: unclear what specific ambiguous match this needs to beat;
 *   figure out if it can be lowered to be consistent with the rest of the precedence scale.
 */
class draw_thing extends SpellStatement<"expression"> {
  getAST(match: P.MatchFor<this>) {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "drawThing",
      args: [ast<P.ASTExpression>(match.groups.expression.AST)]
    })
  }
}
draw.addRule(draw_thing, {
  alias: "expression",
  syntax: "draw {expression}",
  precedence: 100
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
  getAST(match: P.MatchFor<this>) {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "drawItems",
      args: [ast<P.ASTExpression>(match.groups.expression.AST)]
    })
  }
}
draw.addRule(draw_items, {
  alias: "expression",
  syntax: "draw (each {variable}|(the|all)? {plural_identifier}) (of|in) {expression}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("deck")
      },
      tests: [
        { input: "draw each card in the deck", output: "spellCore.drawItems(deck)" },
        { input: "draw cards of the deck", output: "spellCore.drawItems(deck)" },
        // SKIPPED: fails, and always did -- `draw.ts` had no `.test.ts`, so these never ran.
        // `draw_thing` (precedence 100) wins, giving `spellCore.drawThing(deck.cards)`.  See SUSPECTED-BUGS.md.
        { input: "draw the cards of the deck", output: "spellCore.drawItems(deck)", skip: true },
        { input: "draw all cards of the deck", output: "spellCore.drawItems(deck)" }
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
  getAST(match: P.MatchFor<this>) {
    return new P.ASTScopedMethodInvocation(match, {
      thing: ast<P.ASTExpression>(match.groups.app.AST),
      methodName: "start"
    })
  }
}
draw.addRule(start_app, {
  alias: "statement",
  syntax: "start {app:expression}"
})
