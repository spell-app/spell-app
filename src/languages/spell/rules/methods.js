import flatten from "lodash/flatten"

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

  getAST(match) {
    const { method } = this
    const { thisArg, callArgs } = match.groups
    const thing = thisArg?.AST
    const args = (Array.isArray(callArgs) ? callArgs : [callArgs]).map(arg => arg.AST)
    if (thing) return new AST.ScopedMethodInvocation(match, { thing, method, arguments: args })
    return new AST.MethodInvocation(match, { method, arguments: args })
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
        with: 1,
        a: 1,
        as: 1
      },
      gatherGroups(match) {
        return { keyword: match }
      }
    },
    {
      name: "var_method_arg_specifier",
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
      syntax: `{variable_identifier} as (a|an) {type}`,
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
      syntax: `on (signature:{method_keyword}|{parenthesized_method_arg_specifier})+ (withArgs:{method_with_args_specifier})?`,
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

            const word = variable ? variable.value : instanceCase(type.value)
            bits.method.push(`$${word}`)

            let syntaxArgType = "callArgs"
            if (type) {
              bits.types.push(word)
              // Convert to an instance method on the first type we find.
              if (bits.types.length === 1) {
                bits.instanceType = word
                syntaxArgType = "thisArg"
                // remove the type from method signature and args
                bits.method.pop()
                bits.args.pop()
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
              if (type || variable) bits.syntax.push("{callArgs:expression}? and?")
            })
          }
          // convert method/syntax to simple string
          bits.method = bits.method.join("_")
          bits.syntax = bits.syntax.join(" ")
          return groups
        }
        getNestedScope(match) {
          const { bits } = match.groups
          const method = new MethodScope({
            scope: match.scope,
            name: bits.method,
            args: bits.args.map(arg => arg.name)
          })

          if (bits.instanceType) {
            // Add implicit variable mapping instanceType to `this`
            // TODO: make sure instanceType is not already present?
            method.variables.add({ name: bits.instanceType, output: "this" })
            // Add implicit variables `it`, `its` and `me` which maps to the instance type.
            // Note that `it` may be overwritten in the method with `get XXX`
            method.variables.add({ name: "it", output: "this" })
            // TODO: is this necessary?  `its foo` ALWAYS maps to `this.foo`, correct?
            method.variables.add({ name: "its", output: "this" })
            // method.variables.add({ name: "me", output: "this" })
          }
          return method
        }

        mutateScope(match) {
          // Create a `DynamicMethod` rule (see above) to match the specified syntax.
          const { method, ruleSyntax } = match.groups.bits
          match.scope.rules.add({
            name: method,
            alias: ["statement", "expression"],
            constructor: "DynamicMethod",
            syntax: ruleSyntax,
            method
          })
        }

        getAST(match) {
          const {
            inlineStatement,
            nestedBlock,
            bits: { method, args, ruleSyntax, instanceType }
          } = match.groups

          const statements = [
            new AST.ParserAnnotation(match, {
              value: `added rule: '${ruleSyntax}'`
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
      }
    },

    // TODO: arbitrary inline arguments with `(foo)` or `(foo: a number)
    {
      name: "to_do_something",
      alias: "statement",
      syntax: "to (keywords:{keyword}|{type})+ :?",
      wantsInlineStatement: true,
      wantsNestedBlock: true,
      constructor: class to_do_something extends SpellParser.Rule.Statement {
        // When gathering the match groups, figure out `bits` for making rules and AST nodes
        gatherGroups(match) {
          const groups = super.gatherGroups(match)
          const bits = {
            // calculated as we run through the keywords
            method: [], // method signature bits
            types: [], // names of types we found
            syntax: [], // rule syntax bits,
            args: [], // arguments, if any
            // calculated at the end
            instanceType: undefined, // type to add instance method to, if any
            methodName: undefined, // final name of the method
            ruleSyntax: undefined // final rule syntax
          }
          // Process keywords, pulling out types
          const keywords = groups.keywords.matched
          for (let i = 0, count = keywords.length; i < count; i++) {
            let word = keywords[i].value
            // assume it's a class if it's in TitleCase...
            let isType = word === typeCase(word)
            // if "a" or "an", the next word is a type
            // TODO: "the" ???
            if (word === "a" || word === "an") {
              if (i + 1 === count) {
                console.warn(`to_do_something.gatherGroups(): got danglng article '${word}'`)
              } else {
                isType = true
                word = keywords[++i]?.value // skip article in output
              }
            }
            if (isType) {
              word = instanceCase(word)
              bits.types.push(word)
              bits.syntax.push("{callArgs:expression}")
              // don't add the first type to the instanceMethod or args -- it'll be defined as a type method instead
              if (bits.types.length > 1) {
                bits.method.push(`$${word}`)
                bits.args.push(word)
              }
            } else {
              // normal keyword
              bits.syntax.push(word)
              bits.method.push(word)
            }
          }

          // Did we get an instanceType?
          // eslint-disable-next-line prefer-destructuring
          bits.instanceType = bits.types[0]
          bits.methodName = bits.method.join("_")
          bits.ruleSyntax = bits.syntax.join(" ")

          groups.bits = bits
          return groups
        }

        getNestedScope(match) {
          const { bits } = match.groups
          const method = new MethodScope({
            scope: match.scope,
            name: bits.methodName,
            args: bits.args
          })

          if (bits.instanceType) {
            // Add implicit variable mapping instanceType to `this`
            method.variables.add({ name: bits.instanceType, output: "this" })
            // Add implicit variables `it`, `its` and `me` which maps to the instance type.
            // Note that `it` may be overwritten in the method with `get XXX`
            method.variables.add({ name: "it", output: "this" })
            method.variables.add({ name: "its", output: "this" })
            method.variables.add({ name: "me", output: "this" })
          }
          return method
        }

        mutateScope(match) {
          // Create a rule to match the specified syntax
          const { bits } = match.groups
          const rule = {
            name: bits.methodName,
            alias: ["statement", "expression"],
            syntax: bits.ruleSyntax,
            constructor: "Statement"
          }
          if (bits.instanceType) {
            rule.getAST = function(_match) {
              const args = flatten([_match.groups.callArgs])
                .filter(Boolean)
                .map(arg => arg.AST)
              return new AST.ScopedMethodInvocation(_match, {
                thing: args.shift(),
                method: bits.methodName,
                arguments: args
              })
            }
          } else {
            rule.getAST = function(_match) {
              const args = flatten([_match.groups.callArgs])
                .filter(Boolean)
                .map(arg => arg.AST)
              return new AST.MethodInvocation(_match, {
                method: bits.methodName,
                arguments: args
              })
            }
          }
          match.scope.rules.add(rule)
        }

        getAST(match) {
          const { inlineStatement, nestedBlock, bits } = match.groups
          const args = bits.args.map(argName => new AST.VariableExpression(match, { name: argName }))

          const statements = [
            new AST.ParserAnnotation(match, {
              value: `added rule: '${bits.ruleSyntax}'`
            })
          ]

          if (bits.instanceType) {
            statements.push(
              new AST.MethodDefinition(match, {
                thing: new AST.PrototypeExpression(match, {
                  type: new AST.TypeExpression(match, { name: typeCase(bits.instanceType) })
                }),
                method: bits.methodName,
                args,
                statements: (inlineStatement || nestedBlock)?.AST
              })
            )
          } else {
            statements.push(
              new AST.FunctionDefinition(match, {
                method: bits.methodName,
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
          compileAs: "block",
          beforeEach(scope) {
            scope.types.add("card")
            scope.variables.add("deck")
            scope.constants.add("up")
            scope.constants.add("down")
          },
          tests: [
            ["to start the game", "/* SPELL: added rule: 'start the game' */\nfunction start_the_game() {}"],
            [
              "to start the game: shuffle the deck\nstart the game",
              "/* SPELL: added rule: 'start the game' */\nfunction start_the_game() { spellCore.randomize(deck) }\nstart_the_game()"
            ],
            [
              [
                "to move a card to a pile:",
                "\tremove it from its pile",
                "\tadd it to the pile",
                "\tset its pile to the pile"
              ].join("\n"),
              [
                "/* SPELL: added rule: 'move {callArgs:expression} to {callArgs:expression}' */",
                "spellCore.define(Card.prototype, 'move_to_$pile', { value(pile) {",
                "spellCore.remove(this.pile, this)",
                "spellCore.append(pile, this)",
                "this.pile = pile",
                "} })"
              ].join("\n")
            ],
            [
              [
                "to turn a card over:",
                "\tif its direction is up",
                "\t\tset its direction to down",
                "\totherwise",
                "\t\tset its direction to up"
              ].join("\n"),
              [
                "/* SPELL: added rule: 'turn {callArgs:expression} over' */",
                "spellCore.define(Card.prototype, 'turn_over', { value() {",
                "if (this.direction == 'up') { this.direction = 'down' }",
                "else { this.direction = 'up' }",
                "} })"
              ].join("\n")
            ],
            [
              [
                'a card "is face up" if its direction is up',
                "to turn a card face up: set its direction to up",
                "to turn a card face down: set its direction to down",
                "to flip a card over:",
                "\tif it is face up",
                "\t\tturn it face down",
                "\totherwise",
                "\t\tturn it face up"
              ].join("\n"),
              [
                "/* SPELL: added rule: 'is not? face up' */",
                "spellCore.define(Card.prototype, 'is_face_up', { get() { return (this.direction == 'up') } })",
                "/* SPELL: added rule: 'turn {callArgs:expression} face up' */",
                "spellCore.define(Card.prototype, 'turn_face_up', { value() { this.direction = 'up' } })",
                "/* SPELL: added rule: 'turn {callArgs:expression} face down' */",
                "spellCore.define(Card.prototype, 'turn_face_down', { value() { this.direction = 'down' } })",
                "/* SPELL: added rule: 'flip {callArgs:expression} over' */",
                "spellCore.define(Card.prototype, 'flip_over', { value() {",
                "if (this.is_face_up) { this.turn_face_down() }",
                "else { this.turn_face_up() }",
                "} })"
              ].join("\n")
            ]
          ]
        }
      ]
    }
  ]
})
