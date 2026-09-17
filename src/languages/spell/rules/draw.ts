//----------------------------
// Draw utilities, tightly tied into App, Drawable and List.
//--------

import { SpellParser } from "~/languages/spell"
import { P, AST } from "~/parser"
import type { ASTNode, Expression } from "~/parser/ast/AST"
import { SpellStatement } from "./Statement"

// `Match.AST` is typed generically as `ASTNode | undefined`; narrow to the concrete AST subclass
// that the referenced sub-rule's `getAST()` is known (by inspection) to always produce.
function ast<T extends ASTNode>(node: ASTNode | undefined): T {
  return node as T
}

export const draw = new SpellParser({
  module: "draw",
  rules: [
    {
      name: "draw_thing",
      alias: "expression",
      syntax: "draw {expression}",
      precedence: 100,
      constructor: class draw_thing extends SpellStatement {
        getAST(match: P.Match<P.RulexGroups<"expression">>) {
          return new AST.CoreMethodInvocation(match, {
            methodName: "drawThing",
            args: [ast<Expression>(match.groups.expression!.AST)]
          })
        }
      }
    },

    {
      name: "draw_items",
      alias: "expression",
      syntax: "draw (each {variable}|(the|all)? {plural_variable}) (of|in) {expression}",
      constructor: class draw_items extends SpellStatement {
        getAST(match: P.Match<P.RulexGroups<"expression">>) {
          return new AST.CoreMethodInvocation(match, {
            methodName: "drawItems",
            args: [ast<Expression>(match.groups.expression!.AST)]
          })
        }
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables?.add("deck")
          },
          tests: [
            { input: "draw each card in the deck", output: "spellCore.drawItems(deck)" },
            { input: "draw cards of the deck", output: "spellCore.drawItems(deck)" },
            { input: "draw the cards of the deck", output: "spellCore.drawItems(deck)" },
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
        getAST(match: P.Match<P.RulexGroups<"app">>) {
          return new AST.ScopedMethodInvocation(match, {
            thing: ast<Expression>(match.groups.app!.AST),
            methodName: "start"
          })
        }
      }
    }
  ]
})
