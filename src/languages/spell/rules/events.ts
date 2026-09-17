//
//  # Rules for creating variables, property access, etc
//
import global from "global"
import { SpellParser, AST } from "~/languages/spell"
import { MethodScope } from "~/parser/scope/MethodScope"
import type { Match, ScopeVariable } from "~/parser"
import type { MethodScopeProps } from "~/parser/scope/MethodScope"
import type { RulexGroups } from "~/parser/rulex.types"
import type { ASTNode, Expression, Statement, StatementBlock, VariableExpression } from "~/parser/ast/AST"
import { SpellStatement } from "./Statement"

// `Match.AST` is typed generically as `ASTNode | undefined`; narrow to the concrete AST subclass
// that the referenced sub-rule's `getAST()` is known (by inspection) to always produce.
function ast<T extends ASTNode>(node: ASTNode | undefined): T {
  return node as T
}

global.AST = AST
export const events = new SpellParser({
  module: "events",
  rules: [
    /**
     * Trigger (fire) a global event on the `spellCore` singleton.
     */
    {
      name: "trigger",
      alias: "statement",
      syntax: "(trigger|fire|send) event? {eventName:keyword} (with {props:object_literal_properties})?",
      constructor: class trigger extends SpellStatement {
        getAST(match: Match<RulexGroups<"eventName:props">>) {
          const { eventName, props } = match.groups
          // Use the `raw` eventName, dashes are ok!
          const args: Expression[] = [new AST.QuotedExpression(match, eventName!.raw!)]
          if (props) args.push(ast<Expression>(props.AST))
          return new AST.RuntimeMethodInvocation(match, {
            methodName: "trigger",
            args
          })
        }
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            //
            { input: `trigger card-click`, output: "spellCore.RUNTIME.trigger('card-click')" },
            {
              input: `fire event card-click with card = 1`,
              output: "spellCore.RUNTIME.trigger('card-click', { card: 1 })"
            }
          ]
        }
      ]
    },

    /**
     * Watch a global event on the `spellCore.RUNTIME` singleton.
     * TODO: apply to instances?
     */
    {
      name: "on",
      alias: "statement",
      syntax: "on event? {eventName:keyword} {props:with_props_arg}? :?",
      //syntax: "on event? {eventName:keyword}:?",
      wantsInlineStatement: true,
      wantsNestedBlock: true,
      constructor: class on extends SpellStatement {
        getNestedScopeForMatch(match: Match<RulexGroups<"eventName:props">>) {
          const { eventName, props } = match.groups
          const args: string[] = ["event"]
          if (props) {
            // `with_props_arg`'s custom `getGroupsForMatch()` (in methods.js) sets its own `props` group to an
            // array of `AST.VariableExpression`s directly, not `Match`es -- unrepresentable via the generic
            // `MatchGroups` shape, so we cast (each item still has a `.name`, same as `Match` would).
            const propsList = props.groups.props as unknown as VariableExpression[]
            args.push(...propsList.map(({ name }) => name))
          }
          // NOTE: `MethodScopeProps` doesn't declare `parentScope`/`name` (only forwarded to `Scope` at
          // runtime via a rest-spread) and types `args` as `ScopeVariable[]` though `MethodScope` also
          // accepts plain strings -- see report.
          const methodScopeProps = {
            parentScope: match.scope,
            name: eventName!.value,
            args: args as unknown as ScopeVariable[]
          } as MethodScopeProps
          return new MethodScope(methodScopeProps)
        }
        getAST(match: Match<RulexGroups<"eventName:props:inlineStatement:nestedBlock">>) {
          const { eventName, props, inlineStatement, nestedBlock } = match.groups
          // event variable
          const event = new AST.VariableExpression(match, { name: "event", type: "argument" })
          // Use the `raw` eventName, dashes are ok!
          const args: Expression[] = [new AST.QuotedExpression(match, eventName!.raw!)]
          if (nestedBlock || inlineStatement) {
            const method = new AST.MethodDefinition(match, {
              inline: true,
              body: ast<StatementBlock | Statement | Expression>((nestedBlock || inlineStatement)!.AST),
              args: [event]
            })
            // If they specified event props to pay attention to,
            // look them up at the start of the message
            if (props) {
              // See note above re: `with_props_arg`'s custom `props` group.
              const propsList = props.groups.props as unknown as VariableExpression[]
              method.body.statements!.unshift(
                new AST.DestructuredAssignment(props, {
                  thing: event,
                  variables: propsList,
                  isNewVariable: true
                })
              )
            }
            args.push(method)
          }
          return new AST.RuntimeMethodInvocation(match, {
            methodName: "on",
            args
          })
        }
      },
      tests: [
        {
          compileAs: "block",
          beforeEach(scope) {
            scope.types?.add("card")
          },
          tests: [
            //
            { title: "No statements", input: `on card-click`, output: "spellCore.RUNTIME.on('card-click')" },
            {
              title: "Inline statement",
              input: `on event card-click: print 1`,
              output: ["spellCore.RUNTIME.on('card-click', (event) => {", "\treturn spellCore.console.log(1)", "})"]
            },
            {
              title: "Nested block",
              input: [`on event card-click with a card:`, `\tprint the name of the card`],
              output: [
                "spellCore.RUNTIME.on('card-click', (event) => {",
                "\tlet { card } = event",
                "\tspellCore.console.log(card.name)",
                "})"
              ]
            },
            {
              title: "Show error if nested block and inline statement",
              input: [`on event card-click with a card: print 1`, `\tprint the name of the card`],
              output: [
                "spellCore.RUNTIME.on('card-click', (event) => {",
                "\tlet { card } = event",
                "\tspellCore.console.log(card.name)",
                "})",
                "/* PARSE ERROR: Got both inline statement and nested block */"
              ]
            }
          ]
        }
      ]
    }
  ]
})
