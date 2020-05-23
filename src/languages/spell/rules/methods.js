import { instanceCase, typeCase, proto } from "~/util"
import { MethodScope } from "~/parser"
import { SpellParser, AST } from "~/languages/spell"

/**
 * Abstract class for a dynamic method created with `to_do_something` below.
 */
SpellParser.Rule.DynamicMethodRule = class dynamic_method extends SpellParser.Rule.Statement {
  // Name of the method to call
  @proto method = undefined

  // Normalize `callArgs` to an array
  gatherGroups(match) {
    const groups = super.gatherGroups(match)
    const { callArgs } = groups
    if (callArgs && !Array.isArray(callArgs)) groups.callArgs = [callArgs]
    return groups
  }

  getAST(match) {
    const { method } = this
    const { thisArg, callArgs, withArgs } = match.groups
    const thing = thisArg?.AST
    const args = callArgs?.map(arg => arg.AST) || []
    // Add `withArgs` to the end of the args if found.
    // NOTE: This assumes that all inline arguments are REQUIRED by the syntax.
    //       If we decide to match syntax with optional args we'll need to update this.
    if (withArgs) args.push(withArgs.AST)

    // if `thing` is defined, method is scoped
    if (thing) return new AST.ScopedMethodInvocation(match, { thing, method, args })
    return new AST.MethodInvocation(match, { method, args })
  }
}

export const methods = new SpellParser({
  module: "methods",
  rules: [
    // to foo the bar
    // to foo (a thing)
    // to foo (a thing) in (a thing)
    // to foo (bar)
    // to foo the (bar as text)
    // to foo with bar
    // to foo with a bar
    // to foo with bar as text
    // to foo with bar and baz and bong as text
    {
      name: "method_keyword",
      pattern: /^[a-zA-Z][\w\-]*$/,
      // convert dashes to underscores when compiling
      mapValue(value) {
        return `${value}`.replace(/\-/g, "_")
      },
      blacklist: {
        with: 1
      },
      gatherGroups(match) {
        return { keyword: match }
      }
    },
    {
      name: "simple_method_arg_specifier",
      alias: "method_arg_specifier",
      constructor: class method_arg_specifier extends SpellParser.Rule.VariableIdentifier {
        gatherGroups(match) {
          return {
            variable: match,
            arg: new AST.VariableExpression(match, { name: match.value })
          }
        }
      }
    },
    {
      name: "type_method_arg_specifier",
      alias: "method_arg_specifier",
      syntax: `(a|an) {type}`,
      gatherGroups(match) {
        const type = match.matched[1]
        return {
          type,
          arg: new AST.VariableExpression(match, { name: instanceCase(type.value) })
        }
      }
    },
    {
      name: "typed_method_arg_specifier",
      alias: "method_arg_specifier",
      syntax: `{variable_identifier} as (a|an)? {type}`,
      gatherGroups(match) {
        const [variable, _ignore, type] = match.matched
        return {
          variable,
          type,
          arg: new AST.VariableExpression(match, { name: variable.value, datatype: type.value })
        }
      }
    },
    {
      name: "valued_method_arg_specifier",
      alias: "method_arg_specifier",
      syntax: `{variable_identifier} (=|is|of|as|set to) {value:expression}`,
      gatherGroups(match) {
        const [variable, _ignore, value] = match.matched
        const groups = {
          variable,
          value,
          arg: new AST.VariableExpression(match, { name: variable.value, default: value.AST })
        }
        // console.warn("valued_method_arg_specifier:", variable, value, "\n", groups)
        return groups
      }
    },
    {
      name: "parenthesized_method_arg_specifier",
      syntax: "\\({method_arg_specifier}\\)",
      gatherGroups(match) {
        return match.matched[1].groups
      }
    },

    {
      name: "to_do_something",
      alias: "statement",
      syntax: `to (signature:{method_keyword}|{parenthesized_method_arg_specifier})+ (with [withArgs:{method_arg_specifier}(,|and)])? :?`,
      wantsInlineStatement: true,
      wantsNestedBlock: true,
      constructor: class to_do_something extends SpellParser.Rule.Statement {
        gatherGroups(match) {
          const groups = super.gatherGroups(match)
          groups.signature = groups.signature.items.map(item => item.groups || item)

          const bits = (groups.bits = {
            // calculated as we run through the keywords
            method: [], // method signature bits.  Converted to string at end of this method.
            syntax: [], // rule syntax bits.  Converted to string at end of this method.
            types: [], // names of types we found, in instanceCase
            args: [], // method arguments, as AST.VariableExpression
            vars: [], // random vars we should enable
            withArgs: undefined, // array of AST.VariableExpression for withArgs
            // calculated at the end
            instanceType: undefined // type to add instance method to, if any
          })
          // Set up the method signature and rule syntax
          // We'll get one of the following combos: keyword, type, variable, variable + type
          groups.signature.forEach(({ keyword, variable, type, arg }) => {
            if (keyword) {
              bits.method.push(keyword.value)
              bits.syntax.push(keyword.value)
              return
            }

            // args in the initial portion are required (not enforced yet)
            arg.required = true
            bits.args.push(arg)

            const varName = variable && variable.value
            const typeName = type && instanceCase(type.value)
            bits.method.push(`$${varName || typeName}`)
            let syntaxArgType = "callArgs"

            if (type) {
              bits.types.push(typeName)
              // If the first `type` is not a simple type (e.g. `number` etc)
              if (bits.types.length === 1 && !SpellParser.Rule.Type.isSimpleType(typeName)) {
                // Convert to an instance method
                bits.instanceType = typeName
                syntaxArgType = "thisArg"
                // remove the type from method signature and args
                bits.method.pop()
                bits.args.pop()
                // If we got a distinct varName, make sure we get an alias for that in the method
                if (varName && varName !== typeName) {
                  bits.vars.push({ name: varName, output: "this" })
                }
              }
            }
            bits.syntax.push(`{${syntaxArgType}:expression}`)
          })
          // Set things up to parse `withArgs` as an object literal
          if (groups.withArgs) {
            // TODO: bits.syntax.push("(with (withArgs:{object_literal_properties}|{expression})?")
            bits.syntax.push("(with {withArgs:object_literal_properties})?")
            // Add `props` argument with default to empty object
            bits.args.push(
              new AST.VariableExpression(groups.withArgs, {
                name: "props",
                default: new AST.ObjectLiteral(groups.withArgs)
              })
            )
            // set `withArgs` to AST.VariableExpressions for each argument
            bits.withArgs = groups.withArgs.items.map(item => item.groups.arg)
          }

          // convert method/syntax to simple string
          bits.method = bits.method.join("_")
          bits.syntax = bits.syntax.join(" ")
          bits.argNames = bits.args.map(arg => arg.name)
          // console.warn("to_do_something groups for: ", match.inputText, "\n", groups)
          return groups
        }
        getNestedScope(match) {
          const { method, argNames, instanceType, vars, withArgs } = match.groups.bits
          const methodScope = new MethodScope({
            scope: match.scope,
            name: method,
            args: argNames,
            thisVar: instanceType,
            mapItTo: instanceType && "this"
          })

          // add other random variables specified in `bits`
          if (vars.length) methodScope.variables.add(...vars)
          // add variables for known withArgs
          if (withArgs) methodScope.variables.add(...withArgs.map(withArg => withArg.name))
          return methodScope
        }

        mutateScope(match) {
          // Create a `DynamicMethodRule` rule (see above) to match the specified syntax.
          const { method, syntax } = match.groups.bits
          match.scope.rules.add({
            name: method,
            alias: ["statement", "expression"],
            constructor: "DynamicMethodRule",
            syntax,
            method
          })
        }

        getAST(match) {
          // console.warn("getAST:", match.groups)
          const {
            inlineStatement,
            nestedBlock,
            bits: { method, args, syntax, instanceType, withArgs }
          } = match.groups

          const output = [
            new AST.ParserAnnotation(match, {
              value: `added rule: '${syntax}'`
            })
          ]

          let statements = (inlineStatement || nestedBlock)?.AST
          // if we have `withArgs`, use a destructuredAssignment to pull them out of `props`
          if (withArgs) {
            const assignment = new AST.DestructuredAssignment(match, {
              // `props` argument will be the last thing in args
              thing: new AST.VariableExpression(match.groups.withArgs, { name: args[args.length - 1].name }),
              variables: withArgs,
              isNewVariable: true
            })
            if (!statements) statements = assignment
            else statements.statements.unshift(assignment)
          }

          if (instanceType) {
            output.push(
              new AST.MethodDefinition(match, {
                thing: new AST.PrototypeExpression(match, {
                  type: new AST.TypeExpression(match, { name: typeCase(instanceType) })
                }),
                method,
                args,
                statements
              })
            )
          } else {
            output.push(
              new AST.FunctionDefinition(match, {
                method,
                args,
                statements
              })
            )
          }

          return new AST.StatementGroup(match, { statements: output })
        }
      },
      tests: [
        {
          title: "inline method signatures & variables",
          compileAs: "block",
          beforeEach(scope) {
            scope.types.add("card")
            scope.types.add("pile")
            scope.types.add("deck")
            scope.constants.add("up")
            scope.constants.add("down")
          },
          tests: [
            {
              title: "keyword-only signature",
              input: "to start the game",
              output: ["/* SPELL: added rule: 'start the game' */", "function start_the_game() {}"]
            },
            {
              title: "keyword-only signature - `it` is not defined",
              input: "to start the game: print it",
              output: [
                "/* SPELL: added rule: 'start the game' */",
                "function start_the_game() {}",
                '/* PARSE ERROR: UNABLE TO PARSE: "print it" */'
              ]
            },
            {
              title: "non-escaped type arg in signature",
              input: "to create a card",
              output: ["/* SPELL: added rule: 'create a card' */", "function create_a_card() {}"]
            },
            {
              title: "non-escaped type arg in signature - `it` is not defined",
              input: "to create a card: print it",
              output: [
                "/* SPELL: added rule: 'create a card' */",
                "function create_a_card() {}",
                '/* PARSE ERROR: UNABLE TO PARSE: "print it" */'
              ]
            },
            {
              title: "simple arg in signature - arg is defined",
              input: "to notify (message): print the message",
              output: [
                "/* SPELL: added rule: 'notify {callArgs:expression}' */",
                "function notify_$message(message) { console.log(message) }"
              ]
            },
            {
              title: "simple arg in signature - it is not defined",
              input: "to notify (message): print it",
              output: [
                "/* SPELL: added rule: 'notify {callArgs:expression}' */",
                "function notify_$message(message) {}",
                '/* PARSE ERROR: UNABLE TO PARSE: "print it" */'
              ]
            },
            {
              title: "typed simple arg in signature - arg is defined",
              input: "to notify (message as text): print the message",
              output: [
                "/* SPELL: added rule: 'notify {callArgs:expression}' */",
                "function notify_$message(message) { console.log(message) }"
              ]
            },
            {
              title: "typed simple arg in signature - `it` is not defined",
              input: "to notify (message as text): print it",
              output: [
                "/* SPELL: added rule: 'notify {callArgs:expression}' */",
                "function notify_$message(message) {}",
                '/* PARSE ERROR: UNABLE TO PARSE: "print it" */'
              ]
            },
            {
              title: "valued simple arg in signature - arg is defined",
              input: 'to notify (message = "Really?"): print the message',
              output: [
                "/* SPELL: added rule: 'notify {callArgs:expression}' */",
                'function notify_$message(message = "Really?") { console.log(message) }'
              ]
            },
            {
              title: "typed simple arg in signature - `it` is not defined",
              input: 'to notify (message = "Really?"): print it',
              output: [
                "/* SPELL: added rule: 'notify {callArgs:expression}' */",
                'function notify_$message(message = "Really?") {}',
                '/* PARSE ERROR: UNABLE TO PARSE: "print it" */'
              ]
            },
            {
              title: "type arg in signature - thisVar",
              input: "to create (a card): print the card",
              output: [
                "/* SPELL: added rule: 'create {thisArg:expression}' */",
                "spellCore.define(Card.prototype, 'create', { value() { console.log(this) } })"
              ]
            },
            {
              title: "type arg in signature - it",
              input: "to create (a card): print it",
              output: [
                "/* SPELL: added rule: 'create {thisArg:expression}' */",
                "spellCore.define(Card.prototype, 'create', { value() { console.log(this) } })"
              ]
            },
            {
              title: "type arg in signature - its",
              input: "to create (a card): set its number to 1",
              output: [
                "/* SPELL: added rule: 'create {thisArg:expression}' */",
                "spellCore.define(Card.prototype, 'create', { value() { this.number = 1 } })"
              ]
            },
            {
              title: "multiple type args in signature - thisVar",
              input: "to add (a card) to (a pile): set the pile of the card to the pile",
              output: [
                "/* SPELL: added rule: 'add {thisArg:expression} to {callArgs:expression}' */",
                "spellCore.define(Card.prototype, 'add_to_$pile', { value(pile) { this.pile = pile } })"
              ]
            },
            {
              title: "multiple type args in signature - it",
              input: "to add (a card) to (a pile): set the pile of it to the pile",
              output: [
                "/* SPELL: added rule: 'add {thisArg:expression} to {callArgs:expression}' */",
                "spellCore.define(Card.prototype, 'add_to_$pile', { value(pile) { this.pile = pile } })"
              ]
            },
            {
              title: "multiple type args in signature - its",
              input: "to add (a card) to (a pile): set its pile to the pile",
              output: [
                "/* SPELL: added rule: 'add {thisArg:expression} to {callArgs:expression}' */",
                "spellCore.define(Card.prototype, 'add_to_$pile', { value(pile) { this.pile = pile } })"
              ]
            },
            {
              title: "typed arg in signature -- arg name",
              input: "to show (thing as a card): print the thing",
              output: [
                "/* SPELL: added rule: 'show {thisArg:expression}' */",
                "spellCore.define(Card.prototype, 'show', { value() { console.log(this) } })"
              ]
            },
            {
              title: "typed arg in signature -- thisVar",
              input: "to show (thing as a card): print the card",
              output: [
                "/* SPELL: added rule: 'show {thisArg:expression}' */",
                "spellCore.define(Card.prototype, 'show', { value() { console.log(this) } })"
              ]
            },
            {
              title: "typed arg in signature -- it",
              input: "to show (thing as a card): print it",
              output: [
                "/* SPELL: added rule: 'show {thisArg:expression}' */",
                "spellCore.define(Card.prototype, 'show', { value() { console.log(this) } })"
              ]
            },
            {
              title: "typed arg in signature -- its",
              input: "to show (thing as a card): print its name",
              output: [
                "/* SPELL: added rule: 'show {thisArg:expression}' */",
                "spellCore.define(Card.prototype, 'show', { value() { console.log(this.name) } })"
              ]
            },
            {
              title: "typed var in signature: implicit `it` gets remapped after `get`",
              input: ["to show (thing as a card)", "\tprint it", "\tget its name", "\tprint it"],
              output: [
                "/* SPELL: added rule: 'show {thisArg:expression}' */",
                "spellCore.define(Card.prototype, 'show', { value() {",
                "console.log(this)",
                "let it = this.name",
                "console.log(it)",
                "} })"
              ]
            },
            {
              title: "mixed vars in signature",
              input: "to prompt (message as text) and (reply)",
              output: [
                "/* SPELL: added rule: 'prompt {callArgs:expression} and {callArgs:expression}' */",
                "function prompt_$message_and_$reply(message, reply) {}"
              ]
            }
          ]
        },
        {
          title: "calling signature arguments",
          compileAs: "block",
          beforeEach(scope) {
            scope.types.add("card")
            scope.types.add("pile")
          },
          tests: [
            {
              title: "top level keyword-only method",
              input: ["to start the game", "\tprint 1", "start the game"],
              output: [
                "/* SPELL: added rule: 'start the game' */",
                "function start_the_game() { console.log(1) }",
                "start_the_game()"
              ]
            },
            {
              title: "top level simple argument method",
              input: ["to notify (message): print the message", "notify 1"],
              output: [
                "/* SPELL: added rule: 'notify {callArgs:expression}' */",
                "function notify_$message(message) { console.log(message) }",
                "notify_$message(1)"
              ]
            },
            {
              title: "top level typed simple argument method",
              input: ["to notify (message as text): print the message", "notify 1"],
              output: [
                "/* SPELL: added rule: 'notify {callArgs:expression}' */",
                "function notify_$message(message) { console.log(message) }",
                "notify_$message(1)"
              ]
            },
            {
              title: "type arg in signature",
              input: ["to show (a card): print the card", "show a new card"],
              output: [
                "/* SPELL: added rule: 'show {thisArg:expression}' */",
                "spellCore.define(Card.prototype, 'show', { value() { console.log(this) } })",
                "new Card().show()"
              ]
            },
            {
              title: "multiple type args in signature",
              input: ["to play (a card) on (a pile): set its pile to the pile", "play a new card on a new pile"],
              output: [
                "/* SPELL: added rule: 'play {thisArg:expression} on {callArgs:expression}' */",
                "spellCore.define(Card.prototype, 'play_on_$pile', { value(pile) { this.pile = pile } })",
                "new Card().play_on_$pile(new Pile())"
              ]
            }
          ]
        },
        {
          title: "withArgs",
          compileAs: "block",
          beforeEach(scope) {
            scope.types.add("card")
            scope.types.add("pile")
          },
          tests: [
            {
              title: "empty signature is not matched",
              input: "to with foo",
              output: '/* PARSE ERROR: UNABLE TO PARSE: "to with foo" */'
            },
            {
              title: "with arg is optional when calling",
              input: ["to notify with message:", "\tprint the message", "notify"],
              output: [
                "/* SPELL: added rule: 'notify (with {withArgs:object_literal_properties})?' */",
                "function notify(props = {}) {",
                "let { message } = props",
                "console.log(message)",
                "}",
                "notify()"
              ]
            },

            {
              title: "simple variable withArg",
              input: ["to notify with message:", "\tprint the message", 'notify with message = "It worked!"'],
              output: [
                "/* SPELL: added rule: 'notify (with {withArgs:object_literal_properties})?' */",
                "function notify(props = {}) {",
                "let { message } = props",
                "console.log(message)",
                "}",
                'notify({ message: "It worked!" })'
              ]
            },
            {
              title: "typed variable withArg",
              input: [
                "to play with a card:",
                "\tprint the card",
                "play with card = a new card",
                'play with card = a new card with suit of "hearts"'
              ],
              output: [
                "/* SPELL: added rule: 'play (with {withArgs:object_literal_properties})?' */",
                "function play(props = {}) {",
                "let { card } = props",
                "console.log(card)",
                "}",
                "play({ card: new Card() })",
                'play({ card: new Card({ suit: "hearts" }) })'
              ]
            },
            {
              title: "object literal property",
              input: ['to notify with message = "nope":', "\tprint the message", 'notify with message = "Ship it!!"'],
              output: [
                "/* SPELL: added rule: 'notify (with {withArgs:object_literal_properties})?' */",
                "function notify(props = {}) {",
                'let { message = "nope" } = props',
                "console.log(message)",
                "}",
                'notify({ message: "Ship it!!" })'
              ]
            },
            {
              title: "multiple object literal properties",
              input: [
                'to notify with message = "nope" and reply = "yep":',
                "\tprint the message + the reply",
                'notify with message = "How many?" and reply = 2'
              ],
              output: [
                "/* SPELL: added rule: 'notify (with {withArgs:object_literal_properties})?' */",
                "function notify(props = {}) {",
                'let { message = "nope", reply = "yep" } = props',
                "console.log(message + reply)",
                "}",
                'notify({ message: "How many?", reply: 2 })'
              ]
            },
            {
              title: "mixed variables and object literal properties",
              input: [
                'to notify with name, message as text and reply = "yep":',
                "\tprint the name + the message + the reply",
                'notify with name = "Bob", message = "How many?" and reply = 2'
              ],
              output: [
                "/* SPELL: added rule: 'notify (with {withArgs:object_literal_properties})?' */",
                "function notify(props = {}) {",
                'let { name, message, reply = "yep" } = props',
                "console.log((name + message) + reply)",
                "}",
                'notify({ name: "Bob", message: "How many?", reply: 2 })'
              ]
            },
            {
              title: "mixed withArg and signature",
              input: [
                'to notify (message) with reply = "yep":',
                "\tprint the message",
                "\tprint the reply",
                'notify "Really?" with reply = "yes"'
              ],
              output: [
                "/* SPELL: added rule: 'notify {callArgs:expression} (with {withArgs:object_literal_properties})?' */",
                "function notify_$message(message, props = {}) {",
                'let { reply = "yep" } = props',
                "console.log(message)",
                "console.log(reply)",
                "}",
                'notify_$message("Really?", { reply: "yes" })'
              ]
            },
            {
              title: "extra withArgs passed in are OK",
              input: [
                "to notify with message:",
                "\tprint the message",
                `notify with message = "It worked!" and reply = "No it didn't"`
              ],
              output: [
                "/* SPELL: added rule: 'notify (with {withArgs:object_literal_properties})?' */",
                "function notify(props = {}) {",
                "let { message } = props",
                "console.log(message)",
                "}",
                `notify({ message: "It worked!", reply: "No it didn't" })`
              ]
            }
          ]
        }
      ]
    }
  ]
})
