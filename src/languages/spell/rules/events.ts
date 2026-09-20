/**
 * Rules for firing and watching global events on the `spellCore.RUNTIME` singleton -- `trigger`/`fire`/`send`
 * and `on`.
 */
import { P, AST } from "~/parser"
// Import directly to avoid circular import
import { SpellParser } from "~/languages/spell/SpellParser"
import { SpellStatement } from "./Statement"

/**
 * `Match.AST` is typed generically as `ASTNode | undefined`; narrow to the concrete AST subclass that the
 * referenced sub-rule's `getAST()` is known (by inspection) to always produce.
 */
function ast<T extends AST.ASTNode>(node: AST.ASTNode | undefined): T {
  return node as T
}

export const events = new SpellParser({
  module: "events",
  rules: [
    /**
     * `trigger card-click` / `fire event card-click with card = 1` -- fires a global event on the
     * `spellCore.RUNTIME` singleton, optionally with a `props` object.
     * - `eventName` is a bare `keyword`, so its `raw` form (with dashes) is used directly as the event name.
     * - Compiles to `spellCore.RUNTIME.trigger(name, props?)`.
     */
    {
      name: "trigger",
      alias: "statement",
      syntax: "(trigger|fire|send) event? {eventName:keyword} (with {props:object_literal_properties})?",
      constructor: class trigger extends SpellStatement {
        getAST(match: P.Match<P.RulexGroups<"eventName:props">>) {
          const { eventName, props } = match.groups
          // Use the `raw` eventName, dashes are ok!
          const args: AST.Expression[] = [new AST.QuotedExpression(match, eventName!.raw!)]
          if (props) args.push(ast<AST.Expression>(props.AST))
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
     * `on event card-click: ...` / `on event card-click with a card: ...` -- watches a global event on the
     * `spellCore.RUNTIME` singleton, with an inline statement or nested block as the handler body.
     * - TODO: apply to instances?
     * - `eventName` is a bare `keyword`, so its `raw` form (with dashes) is used directly as the event name.
     * - SIDE EFFECT: `getNestedScopeForMatch()` builds a `MethodScope` named for `eventName`, with `event`
     *   as its first arg plus one arg per `with`-listed prop (see `with_props_arg` in methods.ts).
     * - When `props` are given, the handler body destructures them off `event` at its top, e.g. `with a
     *   card` => `let { card } = event`.
     * - Compiles to `spellCore.RUNTIME.on(name, handler?)`; `handler` omitted entirely when there's no body.
     */
    {
      name: "on",
      alias: "statement",
      syntax: "on event? {eventName:keyword} {props:with_props_arg}? :?",
      //syntax: "on event? {eventName:keyword}:?",
      wantsInlineStatement: true,
      wantsNestedBlock: true,
      constructor: class on extends SpellStatement {
        /** Nested scope for the handler body -- named for `eventName`, args are `event` plus any `props`. */
        getNestedScopeForMatch(match: P.Match<P.RulexGroups<"eventName:props">>) {
          const { eventName, props } = match.groups
          const args: string[] = ["event"]
          if (props) {
            // `with_props_arg`'s custom `getGroupsForMatch()` (in methods.js) sets its own `props` group to an
            // array of `AST.VariableExpression`s directly, not `Match`es -- unrepresentable via the generic
            // `MatchGroups` shape, so we cast (each item still has a `.name`, same as `Match` would).
            const propsList = props.groups.props as unknown as AST.VariableExpression[]
            args.push(...propsList.map(({ name }) => name))
          }
          // NOTE: `MethodScopeProps` is `P.ScopeProps & {...}` and already accepts plain strings for `args`
          // (see `src/parser/scope/MethodScope.ts`), so the casts below look unnecessary.
          // TODO: remove casts?
          const methodScopeProps = {
            parentScope: match.scope,
            name: eventName!.value,
            args: args as unknown as P.ScopeVariable[]
          } as P.MethodScopeProps
          return new P.MethodScope(methodScopeProps)
        }
        getAST(match: P.Match<P.RulexGroups<"eventName:props:inlineStatement:nestedBlock">>) {
          const { eventName, props, inlineStatement, nestedBlock } = match.groups
          // event variable
          const event = new AST.VariableExpression(match, { name: "event", type: "argument" })
          // Use the `raw` eventName, dashes are ok!
          const args: AST.Expression[] = [new AST.QuotedExpression(match, eventName!.raw!)]
          if (nestedBlock || inlineStatement) {
            const method = new AST.MethodDefinition(match, {
              inline: true,
              body: ast<AST.StatementBlock | AST.Statement | AST.Expression>((nestedBlock || inlineStatement)!.AST),
              args: [event]
            })
            // If they specified event props to pay attention to,
            // look them up at the start of the message
            if (props) {
              // See note above re: `with_props_arg`'s custom `props` group.
              const propsList = props.groups.props as unknown as AST.VariableExpression[]
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
