//----------------------------
// Draw utilities, tightly tied into App, Drawable and List.
//--------
import React from "react"
import ReactDOM from "react-dom"
import _ from "lodash"

import { Observable, memoize, view } from "~/util"
import { AST, SpellParser } from ".."
import { spellCore } from "."

export const draw = new SpellParser({
  module: "draw",
  rules: [
    {
      name: "draw_thing",
      alias: "expression",
      syntax: "draw {expression}",
      constructor: "Statement",
      precedence: 100,
      getAST(match) {
        return new AST.CoreMethodInvocation(match, {
          methodName: "drawThing",
          args: [match.groups.expression.AST]
        })
      }
    },

    {
      name: "draw_items",
      alias: "expression",
      // TODO: `draw its {plural_variable}` ?
      syntax: "draw {arg:plural_variable} (of|in) {expression}",
      constructor: "Statement",
      precedence: 101,
      getAST(match) {
        return new AST.CoreMethodInvocation(match, {
          methodName: "drawItems",
          args: [match.groups.expression.AST]
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("deck")
          },
          tests: [{ input: "draw the cards of the deck", output: "spellCore.drawItems(deck)" }]
        }
      ]
    },

    {
      name: "start_app",
      alias: "statement",
      syntax: "start {app:expression}",
      constructor: "Statement",
      getAST(match) {
        return new AST.ScopedMethodInvocation(match, {
          thing: match.groups.app.AST,
          methodName: "start"
        })
      }
    }
  ]
})
