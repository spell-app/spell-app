import { upperFirst, pluralize, singularize } from "~/util"
import { SpellParser, AST } from "~/languages/spell"
import { MethodScope } from "../../../parser"

function getOrStubType(scope, typeName) {
  let typeScope = scope.types.get(typeName)
  if (!typeScope) {
    ;[typeScope] = scope.types.add({ name: typeName, stub: true })
  }
  return typeScope
}

export const classes = new SpellParser({
  module: "classes",
  rules: [
    {
      name: "create_type",
      precedence: 10,
      alias: "statement",
      syntax: [
        "create a type (named|called) {type} (as (a|an) {superType:type})?",
        "(a|an) {type} is (a|an) {superType:type}"
      ],
      constructor: "Statement",
      mutateScope(match) {
        const { type, superType } = match.groups
        // Forget it if type is already defined.
        // TODO: complain if existing type is set up differently!
        if (match.scope.types.get(type.value)) return
        match.scope.types.add({ name: type.value, superType: superType?.value })
      },
      getAST(match) {
        const { type, superType } = match.groups
        return new AST.StatementGroup(match, {
          statements: [
            new AST.ClassDeclaration(match, {
              type: type.AST,
              superType: superType?.AST
            }),
            new AST.ExportInvocation(match, {
              property: type.value,
              value: type.AST
            })
          ]
        })
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            ["create a type named card", `export class Card {}\nspellCore.addExport('Card', Card)`],
            [
              "create a type called car as a vehicle",
              `export class Car extends Vehicle {}\nspellCore.addExport('Car', Car)`
            ],
            ["a card is a thing", `export class Card extends Thing {}\nspellCore.addExport('Card', Card)`],
            ["a set is a list", `export class Set extends List {}\nspellCore.addExport('Set', Set)`]
          ]
        }
      ]
    },

    {
      name: "create_list_type",
      precedence: 10,
      alias: "statement",
      syntax: [
        "create a type (named|called) {type} as a list of {instanceType:type}",
        "(a|an) {type} is a list of {instanceType:type}"
        // TODO: "{plural_type} are a list of ..."
      ],
      constructor: "Statement",
      mutateScope(match) {
        const { type, instanceType } = match.groups
        // Forget it if type is already defined.
        // TODO: complain if existing type is set up differently!
        if (match.scope.types.get(type.value)) return

        match.scope.types.add({ name: type.value, superType: "list", instanceType: instanceType?.value })
      },
      getAST(match) {
        const { type, instanceType } = match.groups
        return new AST.StatementGroup(match, {
          statements: [
            // Declare the class
            new AST.ClassDeclaration(match, {
              type: type.AST,
              superType: new AST.TypeExpression(match, { raw: "list", name: "List" })
            }),
            new AST.ExportInvocation(match, {
              property: type.value,
              value: type.AST
            }),
            new AST.PropertyDefinition(match, {
              thing: new AST.PrototypeExpression(match, { type: type.AST }),
              property: "instanceType",
              value: instanceType.AST
            })
          ]
        })
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            [
              "a deck is a list of cards",
              [
                "export class Deck extends List {}",
                "spellCore.addExport('Deck', Deck)",
                "spellCore.define(Deck.prototype, 'instanceType', { value: Card })"
              ]
            ]
          ]
        }
      ]
    },

    // `a new object`
    // NOTE: we assume that all types take an object of properties????
    {
      name: "new_thing",
      alias: ["expression", "single_expression"],
      syntax: "a new {type:known_type} ((with|where|whose) {props:object_literal_properties})?",
      constructor: "Statement",
      getAST(match) {
        const { type, props } = match.groups
        return new AST.NewInstanceExpression(match, {
          type: type.AST,
          props: props?.AST
        })
      },
      tests: [
        {
          title: "creates normal types",
          compileAs: "expression",
          tests: [
            [`a new Thing`, `new Thing()`],
            [`a new Thing with a = 1, b = yes`, `new Thing({ a: 1, b: true })`]
          ]
        },
        {
          title: "creates base types",
          compileAs: "expression",
          tests: [
            ["a new Object", "new Object()"],
            ["a new object with a = 1, b = yes", "new Object({ a: 1, b: true })"]
          ]
        }
      ]
    },

    // `a new list of <type>`
    {
      name: "new_list",
      alias: ["expression", "single_expression"],
      syntax: "a new (list|List) (of {instanceType:type}?)",
      constructor: "Statement",
      getAST(match) {
        const { instanceType } = match.groups
        return new AST.NewInstanceExpression(match, {
          type: new AST.TypeExpression(match, { name: "List" }),
          props:
            instanceType &&
            new AST.ObjectLiteral(instanceType, {
              properties: [
                new AST.ObjectLiteralProperty(instanceType, {
                  property: "instanceType",
                  value: new AST.StringLiteral(instanceType, { value: `"${instanceType.value}"` })
                })
              ]
            })
        })
      },
      tests: [
        {
          compileAs: "expression",
          tests: [
            [`a new list`, `new List()`],
            [`a new List`, `new List()`],
            [`a new list of objects`, `new List({ instanceType: "Object" })`],
            [`a new list of numbers`, `new List({ instanceType: "number" })`],
            [`a new list of Todos`, `new List({ instanceType: "Todo" })`]
          ]
        }
      ]
    },

    // `new` or `create`
    // This works as an expression OR a statement.
    // NOTE: we assume that all types take an object of properties????
    // TODO: in `statement` form, put into `it`???
    // FIXME: `list`, `text`, etc don't follow these semantics???
    {
      name: "create_thing",
      alias: ["expression", "single_expression", "statement"],
      syntax: "create (a|an) {type:known_type} ((with|where|whose) {props:object_literal_properties})?",
      testRule: "create",
      constructor: "Statement",
      getAST(match) {
        const { type, props } = match.groups
        return new AST.NewInstanceExpression(match, {
          type: type.AST,
          props: props?.AST
        })
      },
      tests: [
        {
          title: "creates normal objects properly",
          compileAs: "statement",
          beforeEach(scope) {
            scope.types.add("Thing")
          },
          tests: [
            [`create a Thing`, `new Thing()`],
            [`create a Thing with a = 1, b = yes`, `new Thing({ a: 1, b: true })`]
          ]
        },
        {
          title: "creates base types",
          compileAs: "expression",
          beforeEach(scope) {
            scope.types.add("Object")
            scope.types.add("List")
          },
          tests: [
            ["create an object", "new Object()"],
            ["create an object with a = 1, b = yes", "new Object({ a: 1, b: true })"],
            // FIXME: the following don't make sense if they have arguments...
            ["create a List", "new List()"],
            ["create a list", "new List()"]
            // FIXME: the following don't make sense in JS but are legal parse-wise

            //           ["create text", "new String()"],
            //           ["create character", "new Character()"],
            //           ["create number", "new Number()"],
            //           ["create integer", "new Integer()"],
            //           ["create decimal", "new Decimal()"],
            //           ["create boolean", "new Boolean()"],
          ]
        }
      ]
    },

    {
      name: "type_specifier_enum",
      alias: "type_specifier",
      syntax: "as (either|one of) {enumeration:identifier_list}",
      getAST(match) {
        const enumeration = match.groups.enumeration.items.map((item) => item.AST)
        return new AST.Enumeration(match, {
          enumeration,
          values: enumeration.map((literal) => literal.compile())
        })
      },
      tests: [
        {
          tests: [
            ["as either red or black", "['red', 'black']"],
            ["as one of clubs, diamonds, hearts, spades", "['clubs', 'diamonds', 'hearts', 'spades']"]
          ]
        }
      ]
    },

    {
      name: "type_specifier_datatype",
      alias: "type_specifier",
      syntax: "as (a|an)? {datatype:singular_type}",
      getAST(match) {
        return match.groups.datatype.AST
      },
      tests: [
        {
          tests: [
            ["as a number", "number"],
            ["as an automobile", "Automobile"]
          ]
        }
      ]
    },

    {
      name: "type_specifier_instance",
      alias: "type_specifier",
      syntax: "as {new_thing}",
      getAST(match) {
        return match.groups.new_thing.AST
      },
      tests: [
        {
          tests: [
            ["as a new thing", "new Thing()"],
            ["as a new thing with a=1, b = true", "new Thing({ a: 1, b: true })"]
          ]
        }
      ]
    },

    {
      name: "type_specifier_yes_or_no",
      alias: "type_specifier",
      syntax: "as either? (yes or no|true or false)",
      getAST(match) {
        return new AST.TypeExpression(match, { raw: "yes or no", name: "choice" })
      },
      tests: [
        {
          tests: [["as yes or no", "choice"]]
        }
      ]
    },
    {
      name: "define_property_has",
      precedence: 10,
      alias: "statement",
      syntax: [
        "(a|an) {type:singular_type} has (a|an|a property) {property} {specifier:type_specifier}?",
        "{type:plural_type} have (a|an|a property) {property} {specifier:type_specifier}?"
      ],
      testRule: "…(has|have)",
      constructor: "Statement",
      mutateScope(match) {
        const { scope } = match
        const { type, property, specifier } = match.groups
        const specifierAST = specifier?.AST

        const typeName = type.value
        const typeScope = getOrStubType(scope, typeName)

        // If there is a specifier as enumerated values, add rules to match it
        if (specifierAST instanceof AST.Enumeration) {
          const groupName = pluralize(upperFirst(property.value))

          const { values } = specifierAST
          const varProps = {
            name: groupName,
            enumeration: values,
            initializer: `[${values.join(", ")}]`
          }
          // Add variables to scope for lookup elsewhere
          typeScope.classVariables.add({ ...varProps })
          typeScope.variables.add({ ...varProps })

          // Add enumeration string values to scope as constants.
          values.forEach((value) => {
            if (typeof value === "string") scope.constants.add(value)
          })

          // Add multi-word identifier rule which returns enumeration, e.g. `card suits` or `Card Suits`
          const literals = [
            [typeName, typeName.toLowerCase()],
            [groupName, groupName.toLowerCase()]
          ]
          scope.rules.add({
            name: `${typeName}_${groupName}`,
            precedence: 20,
            alias: ["expression", "single_expression"],
            literals,
            getAST(_match) {
              return new AST.PropertyExpression(_match, {
                object: type.AST,
                property: new AST.PropertyLiteral(property, groupName)
              })
            }
          })

          // Add comment string which we'll output below
          match.ruleComment = new AST.ParserAnnotation(match, {
            value: `added rule: '${literals.map((group) => `(${group.join("|")})`).join(" ")}'`
          })
        }
      },
      getAST(match) {
        const { type, property } = match.groups

        // output statements
        const statements = []
        const props = new AST.ObjectLiteral(match)
        props.addProp("property", `'${property.value}'`)

        // If there is a specifier, add as a condition to the assignment
        const specifier = match.groups.specifier?.AST
        if (specifier) {
          // Enumerated values as strings/numbers/etc
          if (specifier instanceof AST.Enumeration) {
            // Add comment that we created a rule previously
            statements.push(match.ruleComment)
            props.addProp("enumeration", specifier)
            props.addProp("enumerationProp", `'${pluralize(upperFirst(property.value))}'`)
          }
          // instance specifier
          else if (specifier instanceof AST.NewInstanceExpression) {
            props.addMethod(
              "initializer",
              new AST.MethodDefinition(specifier.match, {
                body: specifier
              })
            )
          }
          // type
          else {
            props.addProp("type", `'${specifier.name}'`)
          }
        }

        // getter and setter
        statements.push(
          new AST.CoreMethodInvocation(match, {
            methodName: "defineProperty",
            args: [new AST.PrototypeExpression(type, { type: type.AST }), props]
          })
        )
        return new AST.StatementGroup(match, { statements })
      },
      tests: [
        {
          compileAs: "block",
          tests: [
            [
              "cards have a direction as either up or down",
              [
                "/* SPELL: added rule: '(Card|card) (Directions|directions)' */",
                `spellCore.defineProperty(Card.prototype, {`,
                `\tproperty: 'direction',`,
                `\tenumeration: ['up', 'down'],`,
                `\tenumerationProp: 'Directions'`,
                `})`
              ]
            ],
            [
              "a player has a name as text",
              "spellCore.defineProperty(Player.prototype, { property: 'name', type: 'text' })"
            ],
            [
              "todos have a title as text",
              "spellCore.defineProperty(Todo.prototype, { property: 'title', type: 'text' })"
            ],
            [
              "todos have a property completed as yes or no",
              "spellCore.defineProperty(Todo.prototype, { property: 'completed', type: 'choice' })"
            ],
            [
              "todos have a property tags as a new list",
              [
                `spellCore.defineProperty(Todo.prototype, {`,
                `\tproperty: 'tags',`,
                `\tinitializer() {`,
                `\t\treturn new List()`,
                `\t}`,
                `})`
              ]
            ]
          ]
        },
        {
          beforeEach(scope) {
            scope.compile(
              [
                "a card is a thing",
                "a card has a suit as one of clubs, diamonds, hearts or spades",
                "card = a new card"
              ].join("\n"),
              "block"
            )
          },
          compileAs: "statement",
          tests: [
            ["print Card suits", "console.log(Card.Suits)"],
            ["print card suits", "console.log(Card.Suits)"],
            ["print the suit of the card", "console.log(card.suit)"],
            ["print the suits of the card", "console.log(card.suits)"]
          ]
        }
      ]
    },

    {
      name: "the_property_of_a_thing",
      alias: "type_property",
      syntax: "the {property} of (a|an) {type}"
    },
    {
      name: "a_things_property",
      alias: "type_property",
      syntax: "(a|an) {type:plural_type} {property}"
    },

    {
      name: "property_value_either",
      alias: "statement",
      syntax:
        "{type_property} is (value:{constant}|{expression}) if {condition:expression} (otherwise it is (otherValue:{constant}|{expression}))?",
      constructor: "Statement",
      mutateScope(match) {
        const { scope } = match
        const { value, otherValue, type_property } = match.groups
        const { type } = type_property.groups
        // make sure type is defined
        getOrStubType(scope, type.value)
        if (value.rule instanceof SpellParser.Rule.Constant) {
          // TODO: scope.constants.addMissing(value.raw)
          const constant = value.constant || scope.constants.get(value.raw)
          if (!constant) scope.constants.add(value.raw)
        }
        if (otherValue?.rule instanceof SpellParser.Rule.Constant) {
          const constant = otherValue.constant || scope.constants.get(otherValue.raw)
          if (!constant) scope.constants.add(otherValue.raw)
        }
      },
      getAST(match) {
        const { value, otherValue, type_property, condition } = match.groups
        const { type, property } = type_property.groups
        const prototype = new AST.PrototypeExpression(type, { type: type.AST })
        const ifAST = new AST.IfStatement(match, {
          condition: condition.AST,
          statements: new AST.ReturnStatement(match, { value: value.AST })
        })
        let getterBody
        if (!otherValue) {
          getterBody = ifAST
        } else {
          getterBody = new AST.StatementGroup(match, {
            statements: [ifAST, new AST.ReturnStatement(match, { value: otherValue.AST })]
          })
        }
        return new AST.PropertyDefinition(match, {
          thing: prototype,
          property: property.AST,
          get: new AST.MethodDefinition(match, { body: getterBody })
        })
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.types.add("card")
            scope.constants.add("diamonds", "hearts", "clubs", "spades")
          },
          tests: [
            // is one of diamonds or hearts => is_one_of_list
            [
              "the color of a card is red if its suit is either diamonds or hearts",
              [
                "spellCore.define(Card.prototype, 'color', {",
                `\tget() {`,
                `\t\tif (spellCore.includes(['diamonds', 'hearts'], this.suit)) { return 'red' }`,
                `\t}`,
                "})"
              ]
            ],
            [
              "a cards color is black if its suit is either clubs or spades otherwise it is red",
              [
                "spellCore.define(Card.prototype, 'color', {",
                "\tget() {",
                "\t\tif (spellCore.includes(['clubs', 'spades'], this.suit)) { return 'black' }",
                "\t\treturn 'red'",
                "\t}",
                "})"
              ]
            ]
          ]
        }
      ]
    },

    {
      name: "property_value_getter",
      alias: "statement",
      syntax: "the {property} of (a|an) {type:known_type} is :?",
      constructor: "Statement",
      wantsInlineStatement: true,
      parseInlineStatementAs: "expression",
      wantsNestedBlock: true,
      getNestedScope(match) {
        const { type } = match.groups
        return new MethodScope({
          scope: match.scope,
          thisVar: type.type.instanceName,
          mapItTo: "this"
        })
      },
      getAST(match) {
        const { type, property, inlineStatement, nestedBlock } = match.groups
        return new AST.PropertyDefinition(match, {
          thing: new AST.PrototypeExpression(type, { type: type.AST }),
          property: property.AST,
          get: new AST.MethodDefinition(match, {
            body: (inlineStatement || nestedBlock)?.AST
          })
        })
      },
      tests: [
        {
          compileAs: "block",
          beforeEach(scope) {
            scope.compile("a card is a thing\na pile is a list of cards")
          },
          tests: [
            ["the value of a card is:", ["spellCore.define(Card.prototype, 'value', {", "\tget() {}", "})"]],
            [
              "the value of a card is its name",
              ["spellCore.define(Card.prototype, 'value', {", "\tget() {", "\t\treturn this.name", "\t}", "})"]
            ],
            [
              ["the short-name of a card is:", "\treturn the first word of the name of the card"],
              [
                "spellCore.define(Card.prototype, 'short_name', {",
                "\tget() {",
                "\t\treturn spellCore.getItemOf(this.name, 1)",
                "\t}",
                "})"
              ]
            ]
          ]
        }
      ]
    },

    {
      name: "quoted_property_formula",
      precedence: 10,
      alias: "statement",
      //  `a card "is a (rank) of (suits)" for its ranks and its suits`
      //  e.g. `a card is the queen of spades`
      //  NOTE: the first word in quotes must be "is" !!
      syntax: "(a|an) {type} {alias:text} for [sources:(its {property}) and]",
      constructor: class quoted_property_formula extends SpellParser.Rule.Statement {
        parse(scope, tokens) {
          const match = super.parse(scope, tokens)
          if (!match) return undefined
          // If first word of `alias` is not `is`, forget it
          const alias = JSON.parse(match.groups.alias.value).split(" ")
          if (alias[0] !== "is") return undefined
          return match
        }

        // When gathering the match groups, figure out `bits` for making rules and AST nodes
        gatherGroups(match) {
          const groups = super.gatherGroups(match)
          const alias = groups.alias.value
          const type = groups.type.value
          const sources = groups.sources.items

          const words = JSON.parse(alias).split(" ")
          let syntax = []
          const ruleData = []
          const vars = []
          let sourceNum = 0
          const property = words
            .map((word) => {
              // output keywords directly into words/keywords immediately
              if (!word.startsWith("(")) {
                // transform `a` to `(a|an)` for flexbility
                if (word === "a" || word === "an") syntax.push("(a|an)")
                else syntax.push(word)
                return word
              }
              const instanceVar = word.slice(1, -1)
              const singularVar = singularize(instanceVar)
              const isSingular = singularVar === instanceVar
              vars.push(singularVar)

              // Try to find the enumeration
              // NOTE: currently this only works for an enumeration defined on the type!!!
              const propertyName = sources[sourceNum]?.groups?.property?.value
              const variable = match.scope.types.get(type)?.variables.get(propertyName)
              const enumeration = variable?.enumeration
              // console.warn({ type, Type: scope.types.get(type), propertyName, variable, enumeration })
              // set up enumeration matcher
              if (variable && enumeration) {
                // make sure inflection of variables matches `isSingular`
                const inflector = isSingular ? singularize : pluralize
                const inflectedEnumeration = enumeration.map((value) => {
                  if (typeof value !== "string") return value
                  if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1)
                  return inflector(value)
                })
                ruleData.push({
                  isSingular,
                  instanceVar,
                  enumeration: inflectedEnumeration,
                  values: variable.enumerationValues || enumeration
                })
                syntax.push(`(expression:${inflectedEnumeration.join("|")})`)
              } else {
                // FIXME: this routine is (somehow) geting called twice, once when type/variable IS NOT set up (???)
                // and then once later, when it IS set up.  Figure out why!
                // TODO: parse error instead?
                console.warn("couldn't figure out enumeration for ", type, propertyName)
              }
              sourceNum++
              return `$${instanceVar}`
            })
            .join("_")
          // transform `is` to `(operator:is not?)`
          syntax.splice(0, 1, "(operator:is not?)")
          syntax = syntax.join(" ")
          groups.bits = { type, syntax, ruleData, vars, property }
          return groups
        }

        mutateScope(match) {
          const { syntax, property, ruleData } = match.groups.bits

          // Create an expression suffix to match the quoted statement, e.g. `is not? a queen`
          match.scope.rules.add({
            name: property,
            precedence: 20,
            alias: "expression_suffix",
            syntax,
            constructor: "InfixOperatorSuffix",
            shouldNegateOutput: (operator) => operator.value.includes("not"),
            compileASTExpression(_match, { lhs, rhs }) {
              if (!Array.isArray(rhs)) rhs = [rhs]
              const args = rhs
                .map((arg, index) => {
                  if (typeof arg.value === "string") {
                    // Handle singular input values mapping to plural internal values
                    // `enumeration` will be: "club", "spade", etc
                    // `values` will be: `"clubs"`, `"spades"`, etc
                    const { enumeration, values } = ruleData[index]
                    const valueIndex = enumeration.indexOf(arg.value)
                    return new AST.ConstantExpression(arg, {
                      name: arg.value,
                      output: valueIndex !== -1 ? values[valueIndex] : `'arg.value'`
                    })
                  }
                  if (typeof arg.value === "number") {
                    return new AST.NumericLiteral(arg, {
                      value: arg.value
                    })
                  }
                  console.warn("quoted_property_formula: don't understand arg", arg)
                  return undefined
                })
                .filter(Boolean)
              return new AST.ScopedMethodInvocation(_match, {
                thing: lhs,
                methodName: property,
                args
              })
            }
          })

          // Add comment string which we'll output below
          match.ruleComment = new AST.ParserAnnotation(match, {
            value: `added expression: '${syntax}'`
          })
        }

        getAST(match) {
          const { type } = match.groups
          const { vars, property } = match.groups.bits
          // Return AST for the instance method
          const args = vars.map((varName) => new AST.VariableExpression(match, { name: varName }))
          const properties = vars.map((varName) => new AST.PropertyLiteral(match, varName))
          const expressions = args.map(
            (variable, index) =>
              new AST.InfixExpression(match, {
                lhs: new AST.PropertyExpression(match, {
                  object: new AST.ThisLiteral(match),
                  property: properties[index]
                }),
                operator: "===",
                rhs: variable
              })
          )
          const statements = [
            match.ruleComment,
            new AST.PropertyDefinition(match, {
              thing: new AST.PrototypeExpression(type, { type: type.AST }),
              property,
              value: new AST.MethodDefinition(match, {
                args,
                body: new AST.ReturnStatement(match, {
                  value: AST.MultiInfixExpression(match, { expressions, operator: "&&" })
                }),
                datatype: "boolean"
              })
            })
          ]
          return new AST.StatementGroup(match, { statements })
        }
      },
      tests: [
        {
          beforeEach(scope) {
            scope.parse(
              [
                "a card is a thing",
                "a card has a rank as one of ace, 2, 3, 4, 5, 6, 7, 8, 9, 10, jack, queen, king",
                "a card has a suit as one of clubs, diamonds, hearts, spades"
              ].join("\n"),
              "block"
            )
          },
          compileAs: "block",
          tests: [
            [
              'a card "is a (rank)" for its ranks',
              [
                "/* SPELL: added expression: '(operator:is not?) (a|an) (expression:ace|2|3|4|5|6|7|8|9|10|jack|queen|king)' */",
                "spellCore.define(Card.prototype, 'is_a_$rank', {",
                "\tvalue(rank) {",
                "\t\treturn this.rank === rank",
                "\t}",
                "})"
              ]
            ],
            [
              'a card "is the (rank) of (suits)" for its ranks and its suits',
              [
                "/* SPELL: added expression: '(operator:is not?) the (expression:ace|2|3|4|5|6|7|8|9|10|jack|queen|king) of (expression:clubs|diamonds|hearts|spades)' */",
                "spellCore.define(Card.prototype, 'is_the_$rank_of_$suits', {",
                "\tvalue(rank, suit) {",
                "\t\treturn this.rank === rank && this.suit === suit",
                "\t}",
                "})"
              ]
            ]
          ]
        },
        {
          beforeEach(scope) {
            scope.parse(
              [
                "a card is a thing",
                "a card has a rank as one of ace, 2, 3, 4, 5, 6, 7, 8, 9, 10, jack, queen, king",
                "a card has a suit as one of clubs, diamonds, hearts, spades",
                'a card "is a (suit)" for its suits',
                'a card "is the (rank) of (suits)" for its ranks and its suits',
                "card = a new card"
              ].join("\n"),
              "block"
            )
          },
          compileAs: "statement",
          tests: [
            ["print card is a club", "console.log(card.is_a_$suit('clubs'))"],
            ["print card is the 2 of hearts", "console.log(card.is_the_$rank_of_$suits(2, 'hearts'))"]
          ]
        }
      ]
    }
  ]
})
