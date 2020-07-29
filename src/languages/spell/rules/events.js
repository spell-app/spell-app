//
//  # Rules for creating variables, property access, etc
//

import { SpellParser, AST } from "~/languages/spell"
import { MethodScope } from "../../../parser"

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
      constructor: "Statement",
      getAST(match) {
        const { eventName, props } = match.groups
        // Use the `raw` eventName, dashes are ok!
        const args = [new AST.QuotedExpression(match, eventName.raw)]
        if (props) args.push(props.AST)
        return new AST.RuntimeMethodInvocation(match, {
          methodName: "trigger",
          args
        })
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
     * Watch a global event on the `spellCore` singleton.
     */
    {
      name: "on",
      alias: "statement",
      syntax: "on event? {eventName:keyword} {props:with_props_arg}? :?",
      //syntax: "on event? {eventName:keyword}:?",
      wantsInlineStatement: true,
      wantsNestedBlock: true,
      constructor: "Statement",
      getNestedScope(match) {
        const { eventName, props } = match.groups
        const args = ["event"]
        if (props) args.push(...props.groups.props.map(({ name }) => name))
        return new MethodScope({
          scope: match.scope,
          name: eventName.value,
          args
        })
      },
      getAST(match) {
        const { eventName, props, inlineStatement, nestedBlock } = match.groups
        // event variable
        const event = new AST.VariableExpression(match, { name: "event", type: "argument" })
        // Use the `raw` eventName, dashes are ok!
        const args = [new AST.QuotedExpression(match, eventName.raw)]
        if (inlineStatement || nestedBlock) {
          const method = new AST.MethodDefinition(match, {
            inline: true,
            body: (inlineStatement || nestedBlock).AST,
            args: [event]
          })
          // If they specified event props to pay attention to,
          // look them up at the start of the message
          if (props) {
            method.body.statements.unshift(
              new AST.DestructuredAssignment(props, {
                thing: event,
                variables: props.groups.props,
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
      },
      tests: [
        {
          compileAs: "block",
          beforeEach(scope) {
            scope.types.add("card")
          },
          tests: [
            //
            { input: `on card-click`, output: "spellCore.RUNTIME.on('card-click')" },
            {
              input: `on event card-click: print 1`,
              output: ["spellCore.RUNTIME.on('card-click', (event) => {", "\treturn console.log(1)", "})"]
            },
            {
              input: `on event card-click with a card: print the name of the card`,
              output: [
                "spellCore.RUNTIME.on('card-click', (event) => {",
                "\tlet { card } = event",
                "\treturn console.log(card.name)",
                "})"
              ]
            }
          ]
        }
      ]
    }
  ]
})
