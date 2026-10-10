/**
 * Rules for firing and watching global events -- `trigger`/`fire`/`send` and `on`.
 * - They compile to core's `spellCore.trigger()` / `spellCore.on()`,
 *   which find the program's CURRENT runtime when called:  a new one is made each time a program starts.
 */
import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"
import { SpellStatement } from "./Statement"
import { with_props_arg } from "./methods"

/**
 * Rule module for `trigger`/`on` -- events fired / watched through core, `spellCore.trigger()` / `spellCore.on()`.
 */
export const events = new SpellParser({ module: "events" })

////////////////
// ## `trigger` rule
//    e.g. "trigger card-click"
////////////////

/**
 * `trigger card-click` / `fire event card-click with card = 1` -- fires a global event,
 * optionally with a `props` object.
 * - `eventName` is a bare `keyword`, so its `raw` form (with dashes) is used directly as the event name.
 * - Compiles to `spellCore.trigger(name, props?)` (a `P.ASTCoreMethodInvocation`).
 */
class trigger extends SpellStatement<"eventName|props?"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>) {
    const { eventName, props } = match.groups
    // Use the `raw` eventName, dashes are ok!
    const args: P.ASTExpression[] = [new P.ASTQuotedExpression(match, eventName.raw!)]
    if (props) args.push(P.asAST<P.ASTExpression>(props.AST))
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "trigger",
      args
    })
  }
}
events.addRule(trigger, {
  syntax: "(trigger|fire|send) event? {eventName:keyword} (with {props:object_literal_properties})?",
  tests: [
    {
      compileAs: "statement",
      tests: [
        //
        { input: `trigger card-click`, output: "spellCore.trigger('card-click')" },
        {
          input: `fire event card-click with card = 1`,
          output: "spellCore.trigger('card-click', { card: 1 })"
        }
      ]
    }
  ]
})

////////////////
// ## `on` rule
//    e.g. "on card-click"
////////////////

/**
 * `on event card-click: ...` / `on event card-click with a card: ...` -- watches a global event,
 * with an inline statement or nested block as the handler body.
 * - TODO: apply to instances?
 * - `eventName` is a bare `keyword`, so its `raw` form (with dashes) is used directly as the event name.
 * - SIDE EFFECT: `getNestedScopeForMatch()` builds a `MethodScope` named for `eventName`, with `event`
 *   as its first arg plus one arg per `with`-listed prop (see `with_props_arg` in methods.ts).
 * - When `props` are given, the handler body destructures them off `event` at its top, e.g. `with a
 *   card` => `let { card } = event`.
 * - Compiles to `spellCore.on(name, handler?)` (a `P.ASTCoreMethodInvocation`);
 *   `handler` omitted entirely when there's no body.
 */
class on extends SpellStatement<"eventName|props?|body?"> {
  @proto static alias = "statement"
  @proto static declares: P.DeclaresSpec = { kind: "event", name: "eventName" }

  /**
   * Nested scope for the handler body, named for `eventName`.
   * - Its args are `event` plus any `props`, each with its type if it says, e.g. `Card` for `with a card`.
   */
  getNestedScopeForMatch(match: P.MatchFor<this>) {
    const { eventName, props } = match.groups
    const args: P.ScopeVariableProps[] = [{ name: "event" }]
    // `with_props_arg`'s own `parse()` (in methods.ts) stashes its prop `P.ASTVariableExpression`s
    // directly on `match.data.props` -- narrow via `is()` to read them typed, rather than the generic
    // `props` group.
    if (props?.is(with_props_arg)) {
      for (const { name, datatype } of props.data.props ?? []) {
        args.push({ name, datatype: typeof datatype === "string" ? datatype : undefined })
      }
    }
    const methodScopeProps: P.MethodScopeProps = {
      parentScope: match.scope,
      name: eventName.value,
      args,
      declaredBy: match
    }
    return new P.MethodScope(methodScopeProps)
  }

  getAST(match: P.MatchFor<this>) {
    const { eventName, props } = match.groups
    const body = this.getBody(match)
    // event variable
    const event = new P.ASTVariableExpression(match, { name: "event", type: "argument" })
    // Use the `raw` eventName, dashes are ok!
    const args: P.ASTExpression[] = [new P.ASTQuotedExpression(match, eventName.raw!)]
    if (body) {
      const method = new P.ASTMethodDefinition(match, {
        inline: true,
        body: P.asAST<P.ASTStatementBlock | P.ASTStatement | P.ASTExpression>(body.AST),
        args: [event]
      })
      // If they specified event props to pay attention to,
      // look them up at the start of the message
      if (props?.is(with_props_arg) && props.data.props) {
        method.body.statements!.unshift(
          new P.ASTDestructuredAssignment(props, {
            thing: event,
            variables: props.data.props,
            isNewVariable: true
          })
        )
      }
      args.push(method)
    }
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "on",
      args
    })
  }
}
events.addRule(on, {
  syntax: "on event? {eventName:keyword} {props:with_props_arg}? :? {statement_body}?",
  tests: [
    {
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        scope.types?.add("card")
      },
      tests: [
        //
        { title: "No statements", input: `on card-click`, output: "spellCore.on('card-click')" },
        {
          title: "Inline statement",
          input: `on event card-click: print 1`,
          output: ["spellCore.on('card-click', (event) => {", "  return spellCore.console.log(1)", "})"]
        },
        {
          title: "Nested block",
          input: [`on event card-click with a card:`, `\tprint the name of the card`],
          output: [
            "spellCore.on('card-click', (event) => {",
            "  let { card } = event",
            "  spellCore.console.log(card.name)",
            "})"
          ]
        },
        {
          title: "Show error if nested block and inline statement",
          input: [`on event card-click with a card: print 1`, `\tprint the name of the card`],
          output: [
            "spellCore.on('card-click', (event) => {",
            "  let { card } = event",
            "  spellCore.console.log(card.name)",
            "})",
            "/* PARSE ERROR: Got both inline statement and nested block */"
          ]
        }
      ]
    }
  ]
})
