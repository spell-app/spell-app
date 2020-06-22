import { instanceCase, typeCase, proto } from "~/util"
import { Rule, MethodScope } from "~/parser"
import { SpellParser, AST } from "~/languages/spell"

/**
 * Abstract class for a dynamic method created with `to_do_something` below.
 */
SpellParser.Rule.DynamicMethodRule = class dynamic_method extends SpellParser.Rule.Statement {
  // Name of the method to call
  @proto methodName = undefined

  // Normalize `callArgs` to an array
  gatherGroups(match) {
    const groups = super.gatherGroups(match)
    const { callArgs } = groups
    if (callArgs && !Array.isArray(callArgs)) groups.callArgs = [callArgs]
    return groups
  }

  getAST(match) {
    const { methodName } = this
    const { thisArg, callArgs, props } = match.groups
    const thing = thisArg?.AST
    const args = callArgs?.map(arg => arg.AST) || []
    // Add `props` to the end of the args if found.
    // NOTE: This assumes that all inline arguments are REQUIRED by the syntax.
    //       If we decide to match syntax with optional args we'll need to update this.
    if (props) args.push(props.AST)

    // if `thing` is defined, method is scoped
    if (thing) return new AST.ScopedMethodInvocation(match, { thing, methodName, args })
    return new AST.MethodInvocation(match, { methodName, args })
  }
}

/** Base for method definitions with dynamic syntax via `method_signature`.  See `to_do_something` below. */
SpellParser.Rule.MethodDefinition = class method_definition extends SpellParser.Rule.Statement {
  @proto wantsInlineStatement = true
  @proto wantsNestedBlock = true
  // Set to `true` in rule definition to make into an instance method on first simple type found in `signature`
  @proto inlineInitialType = false

  // Iniline initial type epression, making an instance method?
  processInitialType(signature) {
    const [initialType] = signature.types
    if (this.inlineInitialType && initialType && !initialType.isSimple) {
      signature.instanceType = initialType.name
      // remove from args and method signature
      signature.args.splice(initialType.argIndex, 1)
      signature.methodBits.splice(initialType.methodIndex, 1)
      // replace with `thisArg` in syntax and add an alias for `this`
      signature.syntaxBits[initialType.syntaxIndex] = "{thisArg:expression}"
      if (initialType.varName && initialType.varName !== initialType.name) {
        signature.extraVars.push({ name: initialType.varName, output: "this", type: "alias" })
      }
    }
    signature.methodName = signature.methodBits.join("_")
    signature.syntax = signature.syntaxBits.join(" ")
    // console.warn(signature)
    return signature
  }

  gatherGroups(match) {
    const signature = super.gatherGroups(match).method_signature.groups
    return this.processInitialType(signature)
  }

  getNestedScope(match) {
    const { methodName, args, extraVars, instanceType } = match.groups
    const methodScope = new MethodScope({
      scope: match.scope,
      name: methodName,
      args: args.map(arg => arg.name),
      thisVar: instanceType,
      mapItTo: instanceType && "this"
    })

    // add other random variables
    if (extraVars.length) methodScope.variables.add(...extraVars)
    return methodScope
  }

  mutateScope(match) {
    // Create a `DynamicMethodRule` rule (see above) to match the specified syntax.
    const { methodName, syntax } = match.groups
    match.scope.rules.add({
      name: methodName,
      alias: ["statement", "expression"],
      constructor: "DynamicMethodRule",
      syntax,
      methodName
    })
  }
}

// to foo the bar
// to foo (a thing)
// to foo (a thing) in (a thing)
// to foo (bar)
// to foo the (bar as text)
// to foo (with bar)
// to foo (with a bar)
// to foo (with baz = "baz")
// to foo (with bar as text)
// to foo (with bar and baz = "baz" and bong as text)
export const methods = new SpellParser({
  module: "methods",
  rules: [
    {
      name: "method_keyword",
      pattern: /^[a-zA-Z][\w\-]*$/,
      // convert dashes to underscores when compiling
      mapValue(value) {
        return `${value}`.replace(/\-/g, "_")
      },
      gatherGroups(match) {
        return {
          keyword: match,
          method: match.value,
          syntax: match.raw
        }
      }
    },
    {
      name: "var_method_arg",
      alias: ["method_arg", "simple_method_arg"],
      constructor: class method_arg extends SpellParser.Rule.VariableIdentifier {
        gatherGroups(match) {
          return {
            variable: match,
            method: `$${match.value}`,
            syntax: "{callArgs:expression}",
            arg: new AST.VariableExpression(match, { name: match.value, type: "argument" })
          }
        }
      }
    },
    {
      name: "valued_var_method_arg",
      alias: ["method_arg", "simple_method_arg"],
      syntax: `{variable_identifier} (=|is|of|as|set to) {value:expression}`,
      gatherGroups(match) {
        const [variable, _ignore, value] = match.matched
        const groups = {
          variable,
          method: `$${variable.value}`,
          syntax: "{callArgs:expression}",
          arg: new AST.VariableExpression(match, { name: variable.value, default: value.AST, type: "argument" })
        }
        // console.warn("valued_method_arg:", variable, value, "\n", groups)
        return groups
      }
    },
    {
      name: "type_method_arg",
      alias: ["method_arg", "simple_method_arg"],
      syntax: `(a|an) {type}`,
      gatherGroups(match) {
        const type = match.matched[1]
        return {
          type,
          method: `$${type.raw}`, // TODO: instanceCase(type.value) ???
          syntax: "{callArgs:expression}",
          arg: new AST.VariableExpression(match, { name: instanceCase(type.value), type: "argument" })
        }
      }
    },
    {
      name: "typed_method_arg",
      alias: ["method_arg", "simple_method_arg"],
      syntax: `{variable_identifier} as (a|an)? {type}`,
      gatherGroups(match) {
        const [variable, _ignore, type] = match.matched
        return {
          variable,
          type,
          method: `$${variable.value}`,
          syntax: "{callArgs:expression}",
          arg: new AST.VariableExpression(match, { name: variable.value, datatype: type.value, type: "argument" })
        }
      }
    },
    {
      name: "with_props_arg",
      alias: ["method_arg"],
      syntax: "with [{simple_method_arg}(,|and)]",
      gatherGroups(match) {
        const { items } = match.matched[1]
        const props = items.map(item => item.groups.arg)
        const groups = {
          items,
          method: undefined, // not part of method signature
          syntax: "(with {props:object_literal_properties})?",
          props,
          arg: new AST.VariableExpression(match, {
            name: "props",
            default: new AST.ObjectLiteral(match),
            type: "argument"
          })
        }
        return groups
      }
    },
    {
      name: "method_signature",
      syntax: `({method_keyword}|\\({method_arg}\\))+`,
      constructor: class method_signature extends Rule.Repeat {
        parse(scope, tokens) {
          const match = super.parse(scope, tokens)
          // forget it if we didn't find at least one keyword
          if (match && match.groups.foundKeyword) return match
          return undefined
        }
        gatherGroups(match) {
          const groups = {
            items: match.items.map(item => (item.matched.length === 1 ? item.groups : item.matched[1].groups)),
            // calculated as we run through the keywords
            foundKeyword: false, // `true` if we found at least one keyword.  arg-only signatures are invalid!
            methodBits: [], // method signature bits.  Converted to `methodName` string at end of gatherGroups().
            syntaxBits: [], // rule syntax bits.  Converted to string at end of this method.
            types: [], // types we found, as `{ raw: instanceCase, simple, arg: number, method: number, syntax: number }`
            args: [], // method arguments, as `AST.VariableExpression`s
            extraVars: [], // random extra vars we should enable (e.g. aliases for `this`)
            // calculated at the end
            props: undefined, // array of AST.VariableExpression for `with_props_arg`
            methodName: undefined, // full methodName from `methodBits` array
            syntax: undefined, // full method syntax
            instanceType: undefined // type to add instance method to, if any
          }
          // Set up the method signature and rule syntax
          // We'll get one of the following combos: keyword, type, variable, variable + type
          groups.items.forEach(({ method, syntax, arg, props, keyword, type /* , variable */ }) => {
            // TODO: HOW to know if we should sequester type???

            // arg-only methods are not allowed
            if (keyword) groups.foundKeyword = true

            const varName = arg?.name
            const typeName = type?.raw

            // Convert to an instance method???
            if (type) {
              groups.types.push({
                name: typeName,
                varName,
                isSimple: SpellParser.Rule.Type.isSimpleType(typeName),
                argIndex: groups.args.length,
                methodIndex: groups.methodBits.length,
                syntaxIndex: groups.syntaxBits.length
              })
            }

            if (method) groups.methodBits.push(method)
            if (syntax) groups.syntaxBits.push(syntax)
            if (arg) {
              // non-props args are required (not enforced yet)
              if (!props) arg.required = true
              groups.args.push(arg)
            }

            // Recognize prop names in the method
            if (props) {
              groups.props = props
              groups.extraVars.push(...props.map(prop => prop.name))
            }
          })

          return groups
        }
      }
    },
    {
      name: "to_do_something",
      alias: "statement",
      syntax: `to {method_signature} :?`,
      constructor: class to_do_something extends SpellParser.Rule.MethodDefinition {
        @proto inlineInitialType = true
        getAST(match) {
          const {
            methodName,
            methodBits,
            syntax,
            args,
            props,
            instanceType,
            inlineStatement,
            nestedBlock
          } = match.groups

          const output = [
            new AST.ParserAnnotation(match, {
              value: `added rule: '${syntax}'`
            })
          ]

          let statements = (inlineStatement || nestedBlock)?.AST
          // if we have `props`, use a destructuredAssignment to pull them out of `props`
          if (props) {
            const assignment = new AST.DestructuredAssignment(match, {
              // `props` argument will be the last thing in args
              thing: new AST.VariableExpression(match, { name: "props" }),
              variables: props,
              isNewVariable: true
            })
            if (!statements) statements = assignment
            else statements.statements.unshift(assignment)
          }

          if (instanceType) {
            output.push(
              new AST.PropertyDefinition(match, {
                thing: new AST.PrototypeExpression(match, {
                  type: typeCase(instanceType)
                }),
                property: methodName,
                value: new AST.MethodBody(match, {
                  args,
                  body: statements,
                  inline: false
                })
              })
            )
          }
          // No instance type: create as a loose function
          else {
            let method = new AST.MethodBody(match, {
              args,
              body: statements,
              inline: false
            })
            // HACK???  If first word is "test" wrap in `spellCore.test(...)`
            if (methodBits[0] === "test") {
              let testName = [...methodBits]
              // convert message from "test a thing" to "TESTING A THING"
              testName[0] = "testing"
              testName = testName.join(" ").toUpperCase()
              method = new AST.MethodBody(match, {
                inline: false,
                body: new AST.CoreMethodInvocation(match, {
                  methodName: "test",
                  wrap: true,
                  args: [new AST.QuotedExpression(match, testName), new AST.FunctionDeclaration(match, { method })]
                })
              })
            }
            output.push(
              new AST.FunctionDeclaration(match, {
                wrap: true,
                methodName,
                method
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
                "function notify_$message(message) { return console.log(message) }"
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
                "function notify_$message(message) { return console.log(message) }"
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
                'function notify_$message(message = "Really?") { return console.log(message) }'
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
                `spellCore.define(Card.prototype, 'create', {`,
                `\tvalue() { return console.log(this) }`,
                `})`
              ]
            },
            {
              title: "type arg in signature - it",
              input: "to create (a card): print it",
              output: [
                "/* SPELL: added rule: 'create {thisArg:expression}' */",
                `spellCore.define(Card.prototype, 'create', {`,
                `\tvalue() { return console.log(this) }`,
                `})`
              ]
            },
            {
              title: "type arg in signature - its",
              input: "to create (a card): set its number to 1",
              output: [
                "/* SPELL: added rule: 'create {thisArg:expression}' */",
                `spellCore.define(Card.prototype, 'create', {`,
                `\tvalue() { this.number = 1 }`,
                `})`
              ]
            },
            {
              title: "multiple type args in signature - thisVar",
              input: "to add (a card) to (a pile): set the pile of the card to the pile",
              output: [
                "/* SPELL: added rule: 'add {thisArg:expression} to {callArgs:expression}' */",
                `spellCore.define(Card.prototype, 'add_to_$pile', {`,
                `\tvalue(pile) { this.pile = pile }`,
                `})`
              ]
            },
            {
              title: "multiple type args in signature - it",
              input: "to add (a card) to (a pile): set the pile of it to the pile",
              output: [
                "/* SPELL: added rule: 'add {thisArg:expression} to {callArgs:expression}' */",
                `spellCore.define(Card.prototype, 'add_to_$pile', {`,
                `\tvalue(pile) { this.pile = pile }`,
                `})`
              ]
            },
            {
              title: "multiple type args in signature - its",
              input: "to add (a card) to (a pile): set its pile to the pile",
              output: [
                "/* SPELL: added rule: 'add {thisArg:expression} to {callArgs:expression}' */",
                `spellCore.define(Card.prototype, 'add_to_$pile', {`,
                `\tvalue(pile) { this.pile = pile }`,
                `})`
              ]
            },
            {
              title: "typed arg in signature -- arg name",
              input: "to show (thing as a card): print the thing",
              output: [
                "/* SPELL: added rule: 'show {thisArg:expression}' */",
                `spellCore.define(Card.prototype, 'show', {`,
                `\tvalue() { return console.log(this) }`,
                `})`
              ]
            },
            {
              title: "typed arg in signature -- thisVar",
              input: "to show (thing as a card): print the card",
              output: [
                "/* SPELL: added rule: 'show {thisArg:expression}' */",
                `spellCore.define(Card.prototype, 'show', {`,
                `\tvalue() { return console.log(this) }`,
                `})`
              ]
            },
            {
              title: "typed arg in signature -- it",
              input: "to show (thing as a card): print it",
              output: [
                "/* SPELL: added rule: 'show {thisArg:expression}' */",
                `spellCore.define(Card.prototype, 'show', {`,
                `\tvalue() { return console.log(this) }`,
                `})`
              ]
            },
            {
              title: "typed arg in signature -- its",
              input: "to show (thing as a card): print its name",
              output: [
                "/* SPELL: added rule: 'show {thisArg:expression}' */",
                `spellCore.define(Card.prototype, 'show', {`,
                `\tvalue() { return console.log(this.name) }`,
                `})`
              ]
            },
            {
              title: "typed var in signature: implicit `it` gets remapped after `get`",
              input: ["to show (thing as a card)", "\tprint it", "\tget its name", "\tprint it"],
              output: [
                "/* SPELL: added rule: 'show {thisArg:expression}' */",
                "spellCore.define(Card.prototype, 'show', {",
                "\tvalue() {",
                "\t\tconsole.log(this)",
                "\t\tlet it = this.name",
                "\t\tconsole.log(it)",
                "\t}",
                "})"
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
                "function notify_$message(message) { return console.log(message) }",
                "notify_$message(1)"
              ]
            },
            {
              title: "top level typed simple argument method",
              input: ["to notify (message as text): print the message", "notify 1"],
              output: [
                "/* SPELL: added rule: 'notify {callArgs:expression}' */",
                "function notify_$message(message) { return console.log(message) }",
                "notify_$message(1)"
              ]
            },
            {
              title: "type arg in signature",
              input: ["to show (a card): print the card", "show a new card"],
              output: [
                "/* SPELL: added rule: 'show {thisArg:expression}' */",
                `spellCore.define(Card.prototype, 'show', {`,
                `\tvalue() { return console.log(this) }`,
                `})`,
                "new Card().show()"
              ]
            },
            {
              title: "multiple type args in signature",
              input: ["to play (a card) on (a pile): set its pile to the pile", "play a new card on a new pile"],
              output: [
                "/* SPELL: added rule: 'play {thisArg:expression} on {callArgs:expression}' */",
                `spellCore.define(Card.prototype, 'play_on_$pile', {`,
                `\tvalue(pile) { this.pile = pile }`,
                `})`,
                "new Card().play_on_$pile(new Pile())"
              ]
            }
          ]
        },
        {
          title: "props",
          compileAs: "block",
          beforeEach(scope) {
            scope.types.add("card")
            scope.types.add("pile")
          },
          tests: [
            {
              title: "signature with no keywords is not matched",
              input: "to (foo)",
              output: '/* PARSE ERROR: UNABLE TO PARSE: "to (foo)" */'
            },
            {
              title: "with arg is optional when calling",
              input: ["to notify (with message):", "\tprint the message", "notify"],
              output: [
                "/* SPELL: added rule: 'notify (with {props:object_literal_properties})?' */",
                "function notify(props = {}) {",
                "\tlet { message } = props",
                "\tconsole.log(message)",
                "}",
                "notify()"
              ]
            },

            {
              title: "simple variable props",
              input: ["to notify (with message):", "\tprint the message", 'notify with message = "It worked!"'],
              output: [
                "/* SPELL: added rule: 'notify (with {props:object_literal_properties})?' */",
                "function notify(props = {}) {",
                "\tlet { message } = props",
                "\tconsole.log(message)",
                "}",
                'notify({ message: "It worked!" })'
              ]
            },
            {
              title: "typed variable props",
              input: [
                "to play (with a card):",
                "\tprint the card",
                "play with card = a new card",
                'play with card = a new card with suit of "hearts"'
              ],
              output: [
                "/* SPELL: added rule: 'play (with {props:object_literal_properties})?' */",
                "function play(props = {}) {",
                "\tlet { card } = props",
                "\tconsole.log(card)",
                "}",
                "play({ card: new Card() })",
                'play({ card: new Card({ suit: "hearts" }) })'
              ]
            },
            {
              title: "default value props",
              input: ['to notify (with message = "nope"):', "\tprint the message", 'notify with message = "Ship it!!"'],
              output: [
                "/* SPELL: added rule: 'notify (with {props:object_literal_properties})?' */",
                "function notify(props = {}) {",
                '\tlet { message = "nope" } = props',
                "\tconsole.log(message)",
                "}",
                'notify({ message: "Ship it!!" })'
              ]
            },
            {
              title: "multiple default value props",
              input: [
                'to notify (with message = "nope" and reply = "yep"):',
                "\tprint the message + the reply",
                'notify with message = "How many?"',
                'notify with message = "How many?" and reply = 2'
              ],
              output: [
                "/* SPELL: added rule: 'notify (with {props:object_literal_properties})?' */",
                "function notify(props = {}) {",
                '\tlet { message = "nope", reply = "yep" } = props',
                "\tconsole.log(message + reply)",
                "}",
                'notify({ message: "How many?" })',
                'notify({ message: "How many?", reply: 2 })'
              ]
            },
            {
              title: "mixed props",
              input: [
                'to notify (with name, message as text and reply = "yep"):',
                "\tprint the name + the message + the reply",
                'notify with name = "Bob", message = "How many?" and reply = 2'
              ],
              output: [
                "/* SPELL: added rule: 'notify (with {props:object_literal_properties})?' */",
                "function notify(props = {}) {",
                '\tlet { name, message, reply = "yep" } = props',
                "\tconsole.log((name + message) + reply)",
                "}",
                "notify({",
                '\tname: "Bob",',
                '\tmessage: "How many?",',
                "\treply: 2",
                "})"
              ]
            },
            {
              title: "mixed props and signature",
              input: [
                'to notify (message) (with reply = "yep"):',
                "\tprint the message",
                "\tprint the reply",
                'notify "Really?" with reply = "yes"'
              ],
              output: [
                "/* SPELL: added rule: 'notify {callArgs:expression} (with {props:object_literal_properties})?' */",
                "function notify_$message(message, props = {}) {",
                '\tlet { reply = "yep" } = props',
                "\tconsole.log(message)",
                "\tconsole.log(reply)",
                "}",
                'notify_$message("Really?", { reply: "yes" })'
              ]
            },
            {
              title: "extra props passed in are OK",
              input: [
                "to notify (with message):",
                "\tprint the message",
                `notify with message = "It worked!" and reply = "No it didn't"`
              ],
              output: [
                "/* SPELL: added rule: 'notify (with {props:object_literal_properties})?' */",
                "function notify(props = {}) {",
                "\tlet { message } = props",
                "\tconsole.log(message)",
                "}",
                `notify({ message: "It worked!", reply: "No it didn't" })`
              ]
            }
          ]
        },
        {
          title: "to test",
          compileAs: "block",
          beforeEach(scope) {
            scope.types.add("card")
            scope.types.add("pile")
          },
          tests: [
            {
              title: "empty body",
              input: ["to test something"],
              output: [
                `/* SPELL: added rule: 'test something' */`,
                `function test_something() { return spellCore.test(`,
                `\t'TESTING SOMETHING',`,
                `\tfunction () {}`,
                `) }`
              ]
            },
            {
              title: "empty body calling itself",
              input: ["to test something", "test something"],
              output: [
                `/* SPELL: added rule: 'test something' */`,
                `function test_something() { return spellCore.test(`,
                `\t'TESTING SOMETHING',`,
                `\tfunction () {}`,
                `) }`,
                `test_something()`
              ]
            },
            {
              title: "inline single statement",
              input: ["to test something: print 1"],
              output: [
                `/* SPELL: added rule: 'test something' */`,
                `function test_something() { return spellCore.test(`,
                `\t'TESTING SOMETHING',`,
                `\tfunction () { return console.log(1) }`,
                `) }`
              ]
            },
            {
              title: "indented multi-line",
              input: ["to test something", "\tprint 1", "\tprint 2"],
              output: [
                `/* SPELL: added rule: 'test something' */`,
                `function test_something() { return spellCore.test(`,
                `\t'TESTING SOMETHING',`,
                `\tfunction () {`,
                `\t\tconsole.log(1)`,
                `\t\tconsole.log(2)`,
                `\t}`,
                `) }`
              ]
            }
          ]
        }
      ]
    },
    {
      name: "type_method",
      alias: "statement",
      syntax: "(a|an) {type:singular_type} {method_signature}",
      // watch out for:  "a card has", "a card is"
      wantsInlineStatement: true,
      wantsNestedBlock: true,
      constructor: class to_do_something extends SpellParser.Rule.Statement {
        gatherGroups(match) {
          const groups = super.gatherGroups(match)
          console.warn(groups)
          return {
            type: groups.type,
            signature: groups.signature.groups
          }
        }
      }
    }
  ]
})
