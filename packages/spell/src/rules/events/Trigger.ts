import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { events } from "./events.parser"

/**
 * `trigger` rule:  fires a global event, optionally with a `props` object.
 * - e.g. `trigger card-click`, `fire event card-click with card = 1`
 * - `eventName` is a bare `keyword`, so its `raw` form (with dashes) is used directly as the event name.
 * - Builds a call to core's `trigger(name, props?)` (a `P.ASTCoreMethodInvocation`).
 *   - Javascript calls `trigger()` by name, imported from `@spell/core`:  `trigger('card-click', { card: 1 })`.
 */
export class Trigger extends SpellStatement<"eventName|props?"> {
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
events.addRule(Trigger, {
  syntax: "(trigger|fire|send) event? {eventName:keyword} (with {props:object_literal_properties})?",
  tests: [
    {
      compileAs: "statement",
      tests: [
        //
        { input: `trigger card-click`, js: "trigger('card-click')", ts: 'trigger("card-click")' },
        {
          input: `fire event card-click with card = 1`,
          js: "trigger('card-click', { card: 1 })",
          ts: 'trigger("card-click", { card: 1 })'
        }
      ]
    }
  ]
})
