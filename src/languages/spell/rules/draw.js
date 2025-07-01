//----------------------------
// Draw utilities, tightly tied into App, Drawable and List.
//--------
import _ from "lodash"

import { AST, SpellParser } from ".."
import { SpellStatement } from "./Statement"

export const draw = new SpellParser({
  module: "draw",
  rules: [
    {
      name: "draw_thing",
      alias: "expression",
      syntax: "draw {expression}",
      precedence: 100,
      constructor: class draw_thing extends SpellStatement {
        getAST(match) {
          return new AST.CoreMethodInvocation(match, {
            methodName: "drawThing",
            args: [match.groups.expression.AST]
          })
        }
      }
    },

    {
      name: "draw_items",
      alias: "expression",
      // TODO: `draw its {plural_variable}` ?
      syntax: "draw (each {variable}|(each|the|all) {plural_variable}) (of|in) {expression}",
      precedence: 101,
      constructor: class draw_items extends SpellStatement {
        getAST(match) {
          return new AST.CoreMethodInvocation(match, {
            methodName: "drawItems",
            args: [match.groups.expression.AST]
          })
        }
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("deck")
          },
          tests: [
            { input: "draw each card in the deck", output: "spellCore.drawItems(deck)" },
            { input: "draw the cards of the deck", output: "spellCore.drawItems(deck)" },
            { input: "draw each card of the deck", output: "spellCore.drawItems(deck)" },
            { input: "draw all cards of the deck", output: "spellCore.drawItems(deck)" }
          ]
        }
      ]
    },

    {
      name: "start_app",
      alias: "statement",
      syntax: "start {app:expression}",
      constructor: class start_app extends SpellStatement {
        getAST(match) {
          return new AST.ScopedMethodInvocation(match, {
            thing: match.groups.app.AST,
            methodName: "start"
          })
        }
      }
    }
  ]
})
