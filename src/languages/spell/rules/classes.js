import {
  Scope,
  Spell,
  instanceCase,
  lowerFirst,
  upperFirst,
  pluralize,
  singularize,
  typeCase,
  AST,
  proto
} from "../all"

export default new Spell.Parser({
  module: "classes",
  rules: [
    {
      name: "create_type",
      alias: "statement",
      syntax: [
        "create a type (named|called) {type} (as (a|an) {superType:type})?",
        "(a|an) {type} is (a|an) {superType:type}"
      ],
      constructor: Spell.Rule.Statement,
      mutatesScope: true,
      updateScope(scope, { results }) {
        const { type, superType, isList } = results
        const statement = scope.types.add({
          name: type,
          superType: isList || superType === "List" ? "Array" : superType
        })
        results.statements.push(statement)
        // If we're a list of something, set `list.instanceType` property
        //  which spell `List` objects will presumably understand.
        if (isList) {
          statement.variables.add({ name: "instance_type", value: superType })
          results.statements.push(`spellCore.define(${type}.prototype, "instance_type", { value: "${superType}" })`)
        }
      },
      updateASTScope(scope, match) {
        const { type, superType } = match.groups
        // Forget it if type is already defined.
        // TODO: complain if existing type is set up differently!
        // TODO: set up superType if necessary?
        if (scope.types(type.value)) return
        scope.types.add({ name: type.value, superType: superType?.value })
      },
      toAST(scope, match) {
        const { type, superType } = match.groups
        return new AST.ClassDeclaration(scope, match, {
          type: type.AST,
          superType: superType?.AST
        })
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            ["create a type named card", `export class Card {}\nspellCore.addExport("Card", Card)`],
            [
              "create a type called car as a vehicle",
              `export class Car extends Vehicle {}\nspellCore.addExport("Car", Car)`
            ],
            ["a card is a thing", `export class Card extends Thing {}\nspellCore.addExport("Card", Card)`],
            ["a set is a list", `export class Set extends List {}\nspellCore.addExport("Set", Set)`]
          ]
        }
      ]
    },

    {
      name: "create_list_type",
      alias: "statement",
      syntax: [
        "create a type (named|called) {type} as a list of {instanceType:type}",
        "(a|an) {type} is a list of {instanceType:type}"
        // TODO: "{plural_type} are a list of ..."
      ],
      constructor: Spell.Rule.Statement,
      mutatesScope: true,
      updateScope(scope, { results }) {
        const { type, superType, isList } = results
        const statement = scope.types.add({
          name: type,
          superType: isList || superType === "List" ? "Array" : superType
        })
        results.statements.push(statement)
        // If we're a list of something, set `list.instanceType` property
        //  which spell `List` objects will presumably understand.
        if (isList) {
          statement.variables.add({ name: "instance_type", value: superType })
          results.statements.push(`spellCore.define(${type}.prototype, "instance_type", { value: "${superType}" })`)
        }
      },
      updateASTScope(scope, match) {
        const { type, instanceType } = match.groups
        // Forget it if type is already defined.
        // TODO: complain if existing type is set up differently!
        if (scope.types(type.value)) return

        scope.types.add({ name: type.value, superType: "list", instanceType: instanceType?.value })
      },
      toAST(scope, match) {
        const { type, instanceType } = match.groups
        return new AST.StatementGroup(scope, match, {
          statements: [
            // Declare the class
            new AST.ClassDeclaration(scope, match, {
              type: type.AST,
              superType: new AST.TypeExpression(scope, match, { raw: "list", name: "Array" }),
              instanceType: instanceType.AST
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
              'export class Deck extends Array {}\nspellCore.addExport("Deck", Deck)\nspellCore.define(Deck.prototype, "instanceType", { value: Card })\nDeck.instanceType = Card'
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
      testRule: "…new",
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results }) {
        const { type, props = "" } = results // `props` is the object literal text
        results.statements.push(`new ${type}(${props})`)
      },
      toAST(scope, match) {
        console.warn(match)
        const { type, props } = match.groups
        return new AST.NewInstanceExpression(scope, match, {
          type: type.AST,
          props: props?.AST
        })
      },
      tests: [
        {
          title: "creates normal types",
          compileAs: "expression",
          beforeEach(scope) {
            scope.types.add("Thing")
          },
          tests: [[`a new Thing`, `new Thing()`], [`a new Thing with a = 1, b = yes`, `new Thing({ a: 1, b: true })`]]
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
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results }) {
        const { type, props = "" } = results // `props` is the object literal text
        const statement = scope.addStatement(`new ${type}(${props})`)
        results.statements.push(statement)
      },
      toAST(scope, match) {
        const { type, props } = match.groups
        return new AST.NewInstanceExpression(scope, match, {
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
      compile(scope, match) {
        const { enumeration } = match.results
        return { datatype: "enum", enumeration }
      },
      toAST(scope, match) {
        const enumeration = match.groups.enumeration.items.map(item => item.AST)
        return new AST.Enumeration(scope, match, {
          enumeration,
          values: enumeration.map(literal => literal.toJS())
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
      toAST(scope, match) {
        return match.groups.datatype.AST
      },
      tests: [
        {
          tests: [["as a number", "number"], ["as an automobile", "Automobile"]]
        }
      ]
    },
    {
      name: "define_property_has",
      alias: "statement",
      syntax: [
        "(a|an) {type} has (a|an) {property} {specifier:type_specifier}?",
        "{type:plural_type} have (a|an) {property} {specifier:type_specifier}?"
      ],
      testRule: "…(has|have)",
      constructor: Spell.Rule.Statement,
      mutatesScope: true,
      updateScope(scope, { results }) {
        const { type, property, specifier = {} } = results
        const typeScope = scope.getOrStubType(type)
        const Properties = pluralize(upperFirst(property))

        const { enumeration } = specifier
        let { datatype } = specifier
        const getter = [`return this['#${property}']`]
        let setter

        if (enumeration) {
          // Register the enumeration which will register all sorts of juicy rules and statements.
          typeScope.addEnumeration({ name: Properties, enumeration }, results)
          setter = [`if (${results.canonicalRef}.includes(${property})) this['#${property}'] = ${property}`]
          // eslint-disable-next-line prefer-destructuring
          datatype = results.datatype
          // Add enumeration constants to the main scope, so they can be used outside the type
          enumeration.forEach(value => typeof value === "string" && scope.constants.add(value))
        } else if (datatype) {
          setter = [`if (spellCore.isOfType(${property}, '${datatype}')) this['#${property}'] = ${property}`]
        } else {
          setter = [`this['#${property}'] = ${property}`]
          datatype = "undefined" // :-(
        }

        // Instance getter
        let statement = typeScope.methods.add({
          name: property,
          kind: "getter",
          statements: getter,
          returns: datatype
        })
        results.statements.push(statement)

        // Instance setter
        statement = typeScope.methods.add({
          name: property,
          kind: "setter",
          args: [{ name: property, datatype }],
          statements: setter,
          returns: "undefined" // setters don't actually return a value... :-(
        })
        results.statements.push(statement)
      },
      updateASTScope(scope, match) {
        const { type, property, specifier } = match.groups
        const specifierAST = specifier?.AST

        const typeName = type.value
        const typeScope = scope.getOrStubType(typeName)

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
          values.forEach(({ value }) => {
            if (typeof value === "string") scope.constants.add(value)
          })

          // Add multi-word identifier rule which returns enumeration, e.g. `card suits` or `Card Suits`
          const literals = [[typeName, lowerFirst(typeName)], [groupName, lowerFirst(groupName)]]
          scope.addExpressionRule({
            name: `${typeName}_${groupName}`,
            literals,
            compile() {
              return `${typeName}.${groupName}`
            },
            toAST(scope2, match2) {
              return new AST.PropertyExpression(scope2, match2, {
                object: type.AST,
                property: new AST.PropertyLiteral(scope, property, { value: groupName })
              })
            }
          })

          // Add comment string which we'll output below
          match.ruleComment = new AST.LineComment(scope, match, {
            value: `SPELL added rule: '${literals.map(group => `(${group.join("|")})`).join(" ")}'`
          })
        }
      },
      toAST(scope, match) {
        const { type, property } = match.groups

        // output statements
        const statements = []

        const internalProp = new AST.PropertyLiteral(scope, property, {
          raw: property.raw,
          value: `#${property.value}`
        })
        const internalExpression = new AST.PropertyExpression(scope, match, {
          object: new AST.ThisLiteral(scope, match),
          property: internalProp
        })
        const prototype = new AST.PrototypeExpression(type.scope, type, { type: type.AST })

        // assignment for the setter
        let assignment = new AST.AssignmentStatement(scope, match, {
          thing: internalExpression,
          value: property.AST
        })
        // If there is a specifier, add as a condition to the assignment
        const specifier = match.groups.specifier?.AST
        if (specifier) {
          let condition
          // Enumerated values as strings/numbers/etc
          if (specifier instanceof AST.Enumeration) {
            // TODO: datatype ???
            // Add comment that we created a rule previously
            statements.push(match.ruleComment)

            const groupName = pluralize(upperFirst(property.value))
            // Set up enumeration variable on the class!
            const enumerationPropName = new AST.PropertyLiteral(scope, property, { value: groupName })
            const enumerationExpression = new AST.PropertyExpression(scope, match, {
              object: type.AST,
              property: enumerationPropName
            })
            const enumerationProp = new AST.PropertyExpression(scope, match, {
              object: type.AST,
              property: enumerationPropName
            })
            statements.push(
              new AST.AssignmentStatement(scope, match, {
                thing: enumerationProp,
                value: specifier
              })
            )

            // Add enumeration pointer to the prototype as well
            statements.push(
              new AST.ValueDefinition(scope, match, {
                thing: prototype,
                property: enumerationPropName,
                value: enumerationProp
              })
            )

            // condition for assignment below
            condition = new AST.CoreMethodInvocation(scope, match, {
              method: "includes",
              arguments: [enumerationExpression, property.AST]
            })
          }
          // datatype
          else {
            const specifierConstant = new AST.ConstantExpression(specifier.match.scope, specifier.match, {
              name: specifier.name,
              value: `'${specifier.name}'`
            })
            condition = new AST.CoreMethodInvocation(scope, match, {
              method: "isOfType",
              arguments: [property.AST, specifierConstant]
            })
          }
          assignment = new AST.IfStatement(scope, match, { condition, statements: assignment })
        }

        // getter
        statements.push(
          new AST.GetterDefinition(scope, match, {
            thing: prototype,
            property: property.AST,
            statements: new AST.ReturnStatement(scope, match, {
              value: internalExpression
            })
          })
        )

        // setter
        statements.push(
          new AST.SetterDefinition(scope, match, {
            thing: prototype,
            property: property.AST,
            statements: assignment
          })
        )

        return new AST.StatementGroup(scope, match, { statements })
      },
      tests: [
        {
          compileAs: "block",
          tests: [
            [
              "cards have a direction as either up or down",
              [
                "// SPELL added rule: '(Card|card) (Directions|directions)'",
                "Card.Directions = ['up', 'down']",
                "spellCore.define(Card.prototype, 'Directions', { value: Card.Directions })",
                "spellCore.define(Card.prototype, 'direction', { get() { return this['#direction'] } })",
                "spellCore.define(Card.prototype, 'direction', { set(direction) { if (spellCore.includes(Card.Directions, direction)) { this['#direction'] = direction } } })"
              ].join("\n")
            ],
            [
              "a player has a name as text",
              [
                `spellCore.define(Player.prototype, 'name', { get() { return this['#name'] } })`,
                `spellCore.define(Player.prototype, 'name', { set(name) { if (spellCore.isOfType(name, 'text')) { this['#name'] = name } } })`
              ].join("\n")
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
      constructor: Spell.Rule.Statement,
      mutatesScope: true,
      updateScope(scope, { results, groups }) {
        const { value: valueMatch, otherValue: otherValueMatch } = groups
        if (valueMatch.rule instanceof Spell.Rule.Constant) {
          const constant = valueMatch.constant || scope.constants(valueMatch.raw)
          if (!constant) scope.constants.add(valueMatch.raw)
        }
        if (otherValueMatch?.rule instanceof Spell.Rule.Constant) {
          const constant = otherValueMatch.constant || scope.constants(otherValueMatch.raw)
          if (!constant) scope.constants.add(otherValueMatch.raw)
        }

        const { type_property, value, otherValue, condition } = results
        const { type, property } = type_property
        const statement = scope
          .getOrStubType(type)
          // Create as an instance getter
          .methods.add({
            name: property,
            kind: "getter",
            // TODO:   datatype: "...",
            statements: otherValue
              ? [`return !!${condition} ? ${value} : ${otherValue}`]
              : [`if (${condition}) return ${value}`]
          })
        results.statements.push(statement)
      },
      toAST(scope, match) {
        const { value, otherValue, type_property, condition } = match.groups
        const { type, property } = type_property.groups
        const prototype = new AST.PrototypeExpression(type.scope, type, { type: type.AST })
        // make sure type is defined
        scope.getOrStubType(type.name)
        // register constants if specified
        if (value.rule instanceof Spell.Rule.Constant) {
          // TODO: scope.constants.addMissing(value.raw)
          const constant = value.constant || scope.constants(value.raw)
          if (!constant) scope.constants.add(value.raw)
        }
        if (otherValue?.rule instanceof Spell.Rule.Constant) {
          const constant = otherValue.constant || scope.constants(otherValue.raw)
          if (!constant) scope.constants.add(otherValue.raw)
        }
        const ifAST = new AST.IfStatement(scope, match, {
          condition: condition.AST,
          statements: new AST.ReturnStatement(scope, match, { value: value.AST })
        })
        let getterBody
        if (!otherValue) {
          getterBody = ifAST
        } else {
          getterBody = new AST.StatementGroup(scope, match, {
            statements: [ifAST, new AST.ReturnStatement(scope, match, { value: otherValue.AST })]
          })
        }
        return new AST.GetterDefinition(scope, match, {
          thing: prototype,
          property: property.AST,
          statements: getterBody
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
              "spellCore.define(Card.prototype, 'color', { get() { if (spellCore.includes(['diamonds', 'hearts'], this.suit)) { return 'red' } } })"
            ],
            [
              "a cards color is black if its suit is either clubs or spades otherwise it is red",
              "spellCore.define(Card.prototype, 'color', { get() { if (spellCore.includes(['clubs', 'spades'], this.suit)) { return 'black' }\nreturn 'red' } })"
            ]
          ]
        }
      ]
    },

    {
      name: "property_value_expression",
      alias: "statement",
      syntax: "{type_property} is {expression}",
      constructor: Spell.Rule.Statement,
      mutatesScope: true,
      updateScope(scope, { results }) {
        const { type_property, expression } = results
        const { type, property } = type_property
        const statement = scope.getOrStubType(type).methods.add({
          kind: "getter",
          name: property,
          statements: [`return ${expression}`]
        })
        results.statements.push(statement)
      },
      toAST(scope, match) {
        const { type_property, expression } = match.groups
        const { type, property } = type_property.groups
        // make sure type is defined
        scope.getOrStubType(type.name)
        return new AST.GetterDefinition(scope, match, {
          thing: new AST.PrototypeExpression(type.scope, type, { type: type.AST }),
          property: property.AST,
          statements: new AST.ReturnStatement(scope, match, {
            value: expression.AST
          })
        })
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.compile(
              [
                "a card is a thing",
                "cards have a rank as one of ace, 2, 3, 4, 5, 6, 7, 8, 9, 10, jack, queen or king"
              ].join("\n"),
              "block"
            )
          },
          tests: [
            [
              "the value of a card is the position of its rank in card ranks",
              "spellCore.define(Card.prototype, 'value', { get() { return spellCore.itemOf(Card.Ranks, this.rank) } })"
            ],
            ["a cards score is its value", "spellCore.define(Card.prototype, 'score', { get() { return this.value } })"]
          ]
        }
      ]
    },

    {
      name: "quoted_property_alias",
      alias: "statement",
      //  e.g. `a card "is face up" if ...`
      //  NOTE: the first word in quotes must be "is" !!
      syntax: "(a|an) {type} {alias:text} if {expression}",
      constructor: class quoted_property_alias extends Spell.Rule.Statement {
        parse(scope, tokens) {
          const match = super.parse(scope, tokens)
          if (!match) return undefined
          // If first word of `alias` is not `is`, forget it
          const alias = JSON.parse(match.results.alias).split(" ")
          if (alias[0] !== "is") return undefined

          return match
        }

        @proto mutatesScope = true
        updateScope(scope, { results }) {
          const { type, alias, expression } = results
          const words = JSON.parse(alias).split(" ")
          const property = words.join("_")
          // add optional `not` to the rule
          const expressionSuffix = [words[0], "not?", ...words.slice(1)].join(" ")
          // Create an expression suffix to match the quoted statement, e.g. `is not? face up`
          scope.addExpressionSuffixRule(
            {
              name: property,
              syntax: expressionSuffix,
              asLiterals: true,
              precedence: 20,
              constructor: Spell.Rule.PostfixOperatorSuffix,
              shouldNegateOutput: operator => operator.value.includes("not"),
              compileOperatorExpression({ lhs }) {
                return `${lhs}.${property}`
              }
            },
            results
          )

          // Create an instance getter
          const statement = scope.getOrStubType(type).methods.add({
            name: property,
            kind: "getter",
            datatype: "boolean",
            statements: [`return ${expression}`]
          })
          results.statements.push(statement)
        }

        updateASTScope(scope, match) {
          const { type, alias } = match.groups
          // Make sure type is defined
          scope.getOrStubType(type.value)

          const words = JSON.parse(alias.value).split(" ")
          // set `property` which we'll use in `toAST()` below
          match.property = words.join("_")
          // add optional `not` to the rule
          const expressionSuffix = [words[0], "not?", ...words.slice(1)].join(" ")
          // Create an expression suffix to match the quoted statement, e.g. `is not? face up`
          scope.addExpressionSuffixRule({
            name: match.property,
            syntax: expressionSuffix,
            precedence: 20,
            constructor: Spell.Rule.PostfixOperatorSuffix,
            shouldNegateOutput: operator => operator.value.includes("not"),
            toAST(_scope, _match, { lhs }) {
              return new AST.PropertyExpression(_scope, _match, {
                object: lhs,
                property: new AST.PropertyLiteral(_scope, _match, { value: match.property })
              })
            }
          })

          // Add comment string which we'll output below
          match.ruleComment = new AST.LineComment(scope, match, {
            value: `SPELL added rule: '${expressionSuffix}'`
          })
        }

        toAST(scope, match) {
          const { type, expression } = match.groups
          const statements = [
            match.ruleComment,
            new AST.GetterDefinition(scope, match, {
              thing: new AST.PrototypeExpression(scope, type, { type: type.AST }),
              property: new AST.PropertyLiteral(scope, match, { value: match.property }),
              statements: new AST.ReturnStatement(scope, match, {
                value: expression.AST
              })
            })
          ]
          return new AST.StatementGroup(scope, match, { statements })
        }
      },
      tests: [
        {
          beforeEach(scope) {
            scope.parse(
              [
                "a card is a thing",
                "cards have a direction as either up or down",
                "cards have a rank as one of ace, 2, 3, 4, 5, 6, 7, 8, 9, 10, jack, queen or king"
              ].join("\n"),
              "block"
            )
          },
          compileAs: "block",
          tests: [
            [
              'a card "is face up" if its direction is up',
              "// SPELL added rule: 'is not? face up'\nspellCore.define(Card.prototype, 'is_face_up', { get() { return (this.direction == 'up') } })"
            ],
            [
              'a card "is a face card" if its rank is one of [jack, queen, king]',
              "// SPELL added rule: 'is not? a face card'\nspellCore.define(Card.prototype, 'is_a_face_card', { get() { return spellCore.includes(['jack', 'queen', 'king'], this.rank) } })"
            ],
            [
              'a card "is a face card" if its rank is one of jack, queen or king',
              "// SPELL added rule: 'is not? a face card'¬spellCore.define(Card.prototype, 'is_a_face_card', { get() { return spellCore.includes(['jack', 'queen', 'king'], this.rank) } })"
            ]
          ]
        }
      ]
    },

    {
      name: "quoted_property_formula",
      alias: "statement",
      //  e.g. `a card "is the queen of spades" for...`
      //  NOTE: the first word in quotes must be "is" !!
      syntax: "(a|an) {type} {alias:text} for [sources:(its {property}) and]",
      constructor: class quoted_property_formula extends Spell.Rule.Statement {
        parse(scope, tokens) {
          const match = super.parse(scope, tokens)
          if (!match) return undefined
          // If first word of `alias` is not `is`, forget it
          const alias = JSON.parse(match.results.alias).split(" ")
          if (alias[0] !== "is") return undefined
          return match
        }

        parseMatchBits(scope, match) {
          const { groups } = match
          const alias = groups.alias.value
          const type = groups.type.value
          const sources = groups.sources.items

          const words = JSON.parse(alias).split(" ")
          let syntax = []
          const method = []
          const ruleData = []
          const vars = []
          let sourceNum = 0
          const property = words
            .map(word => {
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
              method.push(`(this.${singularVar} === ${singularVar})`)

              // Try to find the enumeration
              // NOTE: currently this only works for an enumeration defined on the type!!!
              const propertyName = sources[sourceNum]?.groups?.property?.value
              const variable = scope.types(type)?.variables(propertyName)
              const enumeration = variable?.enumeration
              // console.warn({ type, Type: scope.types(type), propertyName, variable, enumeration })
              // set up enumeration matcher
              if (variable && enumeration) {
                // make sure inflection of variables matches `isSingular`
                const inflector = isSingular ? singularize : pluralize
                const inflectedEnumeration = enumeration.map(value => {
                  if (typeof value !== "string") return value
                  if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1)
                  return inflector(value)
                })
                ruleData.push({
                  instanceVar,
                  enumeration: inflectedEnumeration,
                  values: variable.enumerationValues || enumeration
                })
                syntax.push(`(expression:${inflectedEnumeration.join("|")})`)
              } else {
                // TODO: parse error
                console.error("couldn't figure out enumeration for ", type, propertyName)
              }
              sourceNum++
              return `$${instanceVar}`
            })
            .join("_")
          // transform `is` to `(operator:is not?)`
          syntax.splice(0, 1, "(operator:is not?)")
          syntax = syntax.join(" ")

          return { type, syntax, method, ruleData, vars, property }
        }

        @proto mutatesScope = true
        updateScope(scope, match) {
          const { syntax, method, ruleData, vars, property } = this.parseMatchBits(scope, match)
          const { type } = match.results
          // console.warn({ syntax, method, ruleData, vars, property })
          // Create an expression suffix to match the quoted statement, e.g. `is not? face up`
          scope.addExpressionSuffixRule(
            {
              name: property,
              syntax,
              precedence: 20,
              constructor: Spell.Rule.InfixOperatorSuffix,
              shouldNegateOutput: operator => operator.value.includes("not"),
              compileOperatorExpression({ lhs, rhs }) {
                if (!Array.isArray(rhs)) rhs = [rhs]
                const args = rhs.map((value, index) => {
                  const data = ruleData[index]
                  const valueIndex = data.enumeration.indexOf(value)
                  return data.values[valueIndex]
                })
                return `${lhs}.${property}(${args.join(", ")})`
              },
              compileASTExpression(_scope, _match, { lhs, rhs }) {
                if (!Array.isArray(rhs)) rhs = [rhs]
                const args = rhs.map(arg => {
                  // TODO: assumes arg is a `keyword`
                  return new AST.ConstantExpression(arg.scope, arg, {
                    name: arg.value,
                    value: typeof arg.value === "string" ? `'${arg.value}'` : arg.value
                  })
                })
                const result = new AST.ScopedMethodInvocation(_scope, _match, {
                  thing: lhs,
                  method: property,
                  arguments: args
                })
                return result
              }
            },
            match.results
          )

          // Create an instance method
          const statement = scope.getOrStubType(type).methods.add({
            args: vars,
            name: property,
            datatype: "boolean",
            statements: [`return ${method.join(" && ")}`]
          })
          match.results.statements.push(statement)
        }
        updateASTScope(scope, match) {
          const { type, syntax, method, ruleData, vars, property } = this.parseMatchBits(scope, match)

          // Create an expression suffix to match the quoted statement, e.g. `is not? face up`
          const rule = scope.addExpressionSuffixRule({
            name: property,
            syntax,
            precedence: 20,
            constructor: Spell.Rule.InfixOperatorSuffix,
            shouldNegateOutput: operator => operator.value.includes("not"),
            compileOperatorExpression({ lhs, rhs }) {
              if (!Array.isArray(rhs)) rhs = [rhs]
              const args = rhs.map((value, index) => {
                const data = ruleData[index]
                const valueIndex = data.enumeration.indexOf(value)
                return data.values[valueIndex]
              })
              return `${lhs}.${property}(${args.join(", ")})`
            },
            compileASTExpression(_scope, _match, { lhs, rhs }) {
              if (!Array.isArray(rhs)) rhs = [rhs]
              const args = rhs.map(arg => {
                // TODO: assumes arg is a `keyword`
                return new AST.ConstantExpression(arg.scope, arg, {
                  name: arg.value,
                  value: typeof arg.value === "string" ? `'${arg.value}'` : arg.value
                })
              })
              return new AST.ScopedMethodInvocation(_scope, _match, {
                thing: lhs,
                method: property,
                arguments: args
              })
            }
          })

          // Add comment string which we'll output below
          match.ruleComment = new AST.LineComment(scope, match, {
            value: `SPELL added rule: '${syntax}'`
          })
        }

        toAST(scope, match) {
          const { type } = match.groups
          const { vars, property } = this.parseMatchBits(scope, match)
          // Return AST for the instance method
          const args = vars.map(varName => new AST.VariableExpression(scope, match, { name: varName }))
          const properties = vars.map(varName => new AST.PropertyLiteral(scope, match, { value: varName }))
          const expressions = args.map(
            (variable, index) =>
              new AST.InfixExpression(scope, match, {
                lhs: new AST.PropertyExpression(scope, match, {
                  object: new AST.ThisLiteral(scope, match),
                  property: properties[index]
                }),
                operator: "===",
                rhs: variable
              })
          )
          const statements = [
            match.ruleComment,
            new AST.MethodDefinition(scope, match, {
              thing: new AST.PrototypeExpression(type.scope, type, { type: type.AST }),
              method: property,
              args,
              statements: new AST.ReturnStatement(scope, match, {
                value: AST.MultiInfixExpression(scope, match, { expressions, operator: "&&" })
              }),
              datatype: "boolean"
            })
          ]
          return new AST.StatementGroup(scope, match, { statements })
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
              "// SPELL added rule: '(operator:is not?) (a|an) (expression:ace|2|3|4|5|6|7|8|9|10|jack|queen|king)'\nspellCore.define(Card.prototype, 'is_a_$rank', { value(rank) { return this.rank === rank } })"
            ],
            [
              'a card "is the (rank) of (suits)" for its ranks and its suits',
              "// SPELL added rule: '(operator:is not?) the (expression:ace|2|3|4|5|6|7|8|9|10|jack|queen|king) of (expression:clubs|diamonds|hearts|spades)'\nspellCore.define(Card.prototype, 'is_the_$rank_of_$suits', { value(rank,suit) { return this.rank === rank && this.suit === suit } })"
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
                'a card "is a (rank)" for its ranks',
                'a card "is the (rank) of (suits)" for its ranks and its suits',
                "card = a new card"
              ].join("\n"),
              "block"
            )
          },
          compileAs: "statement",
          tests: [
            ["print card is a queen", "console.log(card.is_a_$rank('queen'))"],
            ["print card is the 2 of hearts", "console.log(card.is_the_$rank_of_$suits(2, 'hearts'))"]
          ]
        }
      ]
    },

    // TODO: arbitrary inline arguments with `(foo)` or `(foo: a number)
    {
      name: "to_do_something",
      alias: "statement",
      syntax: "to (keywords:{keyword}|{type})+ :?",
      constructor: Spell.Rule.Statement,
      wantsInlineStatement: true,
      wantsNestedBlock: true,
      getNestedScope(scope, { results }) {
        const { keywords } = results
        // parse the keywords to get name of the method
        // - `a foo` or `Foo` indicates that we want a variable of type 'Foo' in this spot
        const method = []
        const instanceMethod = []
        const types = []
        const rules = []
        for (let i = 0, last = keywords.length; i < last; i++) {
          let word = keywords[i]
          // assume it's a class if it's in TitleCase...
          let isType = word === typeCase(word)
          // ...or if the word before it is "a" or "an"
          if ((word === "a" || word === "an") && keywords[i + 1]) {
            isType = true
            word = keywords[++i] // skip the article in the output
          }
          if (isType) {
            word = instanceCase(word)
            types.push(word)
            rules.push(`{callArgs:expression}`)
            // don't add the first type to the instanceMethod -- it'll be defined on that type
            if (types.length > 1) {
              instanceMethod.push(`$${word}`)
            }
          }
          // TODO: check for parens...
          else {
            rules.push(word)
            instanceMethod.push(word)
          }
          method.push(word)
        }

        // If we got any types, create as an instance method with the first type specified
        if (types.length) {
          results.type = typeCase(types[0])
          // eslint-disable-next-line prefer-destructuring
          results.instanceType = types[0]
          const methodName = instanceMethod.join("_")
          results.methodName = methodName
          results.args = types.slice(1)
          results.updateScope = function(updateScope, { results: updateResults }) {
            let { callArgs = [] } = updateResults
            if (!Array.isArray(callArgs)) callArgs = [callArgs]
            const statement = `${callArgs[0]}.${methodName}(${callArgs.slice(1).join(", ")})`
            updateScope.addStatement(statement)
            updateResults.statements.push(statement)
          }
        }
        // Otherwise create as a normal method
        else {
          const methodName = method.join("_")
          results.methodName = methodName
          results.updateScope = function(updateScope, { results: updateResults }) {
            let { callArgs = [] } = updateResults
            if (!Array.isArray(callArgs)) callArgs = [callArgs]
            const statement = `${methodName}(${callArgs.join(", ")})`
            updateScope.addStatement(statement)
            updateResults.statements.push(statement)
          }
        }

        // Set up the nested scope and rule syntax
        results.syntax = rules.join(" ")
        results.$method = new Scope.Method({
          scope,
          name: results.methodName,
          args: results.args
        })

        // If we're creating an instance method
        if (results.type) {
          // Add implicit variable mapping instanceType to `this`
          // This lets us use the type argument within the function
          // without worrying about `this` scope
          const setupVarForThis = `const ${results.instanceType} = this`
          results.$method.addStatement(setupVarForThis)
          results.$method.variables.add({ name: results.instanceType, output: results.instanceType })

          // Add implicit variables `it` and `its` which maps to the instance type.
          // Note that `it` may be overwritten in the method with `get XXX`
          results.$method.variables.add({ name: "it", output: results.instanceType })
          results.$method.variables.add({ name: "its", output: results.instanceType })
        }
        return results.$method
      },
      mutatesScope: true,
      updateScope(scope, { results }) {
        const { type, $method } = results

        // Add rule to match statement
        scope.addStatementRule(
          {
            name: results.methodName,
            syntax: results.syntax,
            constructor: Spell.Rule.Statement,
            updateScope: results.updateScope
          },
          results
        )

        const statement = type ? scope.getOrStubType(type).methods.add($method) : scope.methods.add($method)
        results.statements.push(statement)
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
            ["to start the game", "// SPELL added rule: `start the game`\nfunction start_the_game() {}"],
            [
              "to start the game: shuffle the deck",
              "// SPELL added rule: `start the game`\nfunction start_the_game() { spellCore.randomize(deck) }"
            ],
            [
              [
                "to move a card to a pile:",
                "\tremove it from its pile",
                "\tadd it to the pile",
                "\tset its pile to the pile"
              ].join("\n"),
              [
                "// SPELL added rule: `move {callArgs:expression} to {callArgs:expression}`",
                "spellCore.define(Card.prototype, 'move_to_$pile', { value(pile) {",
                "  const card = this",
                "  spellCore.remove(card.pile, card)",
                "  spellCore.append(pile, card)",
                "  card.pile = pile",
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
                "// SPELL added rule: `turn {callArgs:expression} over`",
                "spellCore.define(Card.prototype, 'turn_over', { value() {",
                "  const card = this",
                "  if (card.direction == 'up') { card.direction = 'down' }",
                "  else { card.direction = 'up' }",
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
                "// SPELL added rule: `is not? face up`",
                "spellCore.define(Card.prototype, 'is_face_up', { get() { return (this.direction == 'up') } })",
                "// SPELL added rule: `turn {callArgs:expression} face up`",
                "spellCore.define(Card.prototype, 'turn_face_up', { value() {\n  const card = this\n  card.direction = 'up'\n} })",
                "// SPELL added rule: `turn {callArgs:expression} face down`",
                "spellCore.define(Card.prototype, 'turn_face_down', { value() {\n  const card = this\n  card.direction = 'down'\n} })",
                "// SPELL added rule: `flip {callArgs:expression} over`",
                "spellCore.define(Card.prototype, 'flip_over', { value() {",
                "  const card = this",
                "  if (card.is_face_up) { card.turn_face_down() }",
                "  else { card.turn_face_up() }",
                "} })"
              ].join("\n")
            ]
          ]
        }
      ]
    }
  ]
})
