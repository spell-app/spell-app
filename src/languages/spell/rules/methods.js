import { instanceCase, typeCase, proto } from "~/util"
import { MethodScope, Rule } from "~/parser"
import { SpellParser, AST } from "~/languages/spell"

function getOrStubType(scope, typeName) {
  let typeScope = scope.types.get(typeName)
  if (!typeScope) {
    ;[typeScope] = scope.types.add({ name: typeName, stub: true })
  }
  return typeScope
}

/**
 * Abstract class for a dynamic method created with `to_do_something` below.
 */
SpellParser.Rule.DynamicMethod = class dynamic_method extends SpellParser.Rule.Statement {
  // Name of the method to call
  @proto method = undefined

  // Normalize `callArgs` and `withArgs`
  gatherGroups(match) {
    const groups = super.gatherGroups(match)
    const { callArgs, withArgs } = groups
    if (callArgs && !Array.isArray(callArgs)) groups.callArgs = [callArgs]
    if (withArgs && !Array.isArray(withArgs)) groups.withArgs = [withArgs]
    return groups
  }

  getAST(match) {
    const { method } = this
    const { thisArg, callArgs, withArgs } = match.groups
    const thing = thisArg?.AST
    const args = callArgs?.map(arg => arg.AST) || []
    // TODO: `withArgs` as an object literal... ???
    if (withArgs?.length) args.push(...withArgs.map(arg => arg.AST))

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
      name: "parenthesized_method_arg_specifier",
      syntax: "\\({method_arg_specifier}\\)",
      gatherGroups(match) {
        return match.matched[1].groups
      }
    },
    {
      name: "method_with_args_specifier",
      syntax: "with [{method_arg_specifier} and]",
      gatherGroups(match) {
        return match.matched[1].items.map(item => item.groups)
      }
    },

    {
      name: "on_something",
      alias: "statement",
      syntax: `to (signature:{method_keyword}|{parenthesized_method_arg_specifier})+ (withArgs:{method_with_args_specifier})? :?`,
      wantsInlineStatement: true,
      wantsNestedBlock: true,
      constructor: class on_something extends SpellParser.Rule.Statement {
        gatherGroups(match) {
          const groups = super.gatherGroups(match)
          groups.signature = groups.signature.items.map(item => item.groups || item)
          groups.withArgs = groups.withArgs?.groups

          const bits = (groups.bits = {
            // calculated as we run through the keywords
            method: [], // method signature bits.  Converted to string at end of this method.
            syntax: [], // rule syntax bits.  Converted to string at end of this method.
            types: [], // names of types we found, in instanceCase
            args: [], // method arguments, as AST.VariableExpression
            vars: [], // random vars we should enable
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
          // Process `withArgs`:  TODO: make this an object literal ???
          if (groups.withArgs) {
            bits.syntax.push("with?")
            groups.withArgs.forEach(({ variable, type, arg }) => {
              if (arg) bits.args.push(arg)
              if (type) bits.types.push(type.value)
              if (type || variable) bits.syntax.push("{withArgs:expression}? and?")
            })
          }
          // convert method/syntax to simple string
          bits.method = bits.method.join("_")
          bits.syntax = bits.syntax.join(" ")
          bits.argNames = bits.args.map(arg => arg.name)
          return groups
        }
        getNestedScope(match) {
          const { bits } = match.groups
          const method = new MethodScope({
            scope: match.scope,
            name: bits.method,
            args: bits.argNames,
            thisVar: bits.instanceType,
            mapItTo: bits.instanceType && "this"
          })

          // add other random variables specified in `bits`
          if (bits.vars.length) method.variables.add(...bits.vars)

          return method
        }

        mutateScope(match) {
          // Create a `DynamicMethod` rule (see above) to match the specified syntax.
          const { method, syntax } = match.groups.bits
          match.scope.rules.add({
            name: method,
            alias: ["statement", "expression"],
            constructor: "DynamicMethod",
            syntax,
            method
          })
        }

        getAST(match) {
          const {
            inlineStatement,
            nestedBlock,
            bits: { method, args, syntax, instanceType }
          } = match.groups

          const statements = [
            new AST.ParserAnnotation(match, {
              value: `added rule: '${syntax}'`
            })
          ]

          if (instanceType) {
            statements.push(
              new AST.MethodDefinition(match, {
                thing: new AST.PrototypeExpression(match, {
                  type: new AST.TypeExpression(match, { name: typeCase(instanceType) })
                }),
                method,
                args,
                statements: (inlineStatement || nestedBlock)?.AST
              })
            )
          } else {
            statements.push(
              new AST.FunctionDefinition(match, {
                method,
                args,
                statements: (inlineStatement || nestedBlock)?.AST
              })
            )
          }

          return new AST.StatementGroup(match, { statements })
        }
      },
      tests: [
        {
          title: "method signatures",
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
              title: "empty signature is not matched",
              input: "to with foo",
              output: '/* PARSE ERROR: UNABLE TO PARSE: "to with foo" */'
            },
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
              title: "mixed vars in signature",
              input: "to prompt (message as text) and (reply)",
              output: [
                "/* SPELL: added rule: 'prompt {callArgs:expression} and {callArgs:expression}' */",
                "function prompt_$message_and_$reply(message, reply) {}"
              ]
            }
          ]
        }
      ]
    }
  ]
})
