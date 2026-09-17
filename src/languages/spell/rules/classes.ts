import { upperFirst, pluralize, singularize, type IndexedList } from "~/util"

import { P, AST } from "~/parser"

import { SpellParser } from "~/languages/spell"
import { SpellStatement } from "./Statement"
import { InfixOperatorSuffix } from "./expressions"
import { SpellConstant } from "./constants"
import "./match-fields.E"

// Ad-hoc fields this module sets/reads on `ScopeVariable` (src/parser/scope/ScopeVariable.ts), for a property
// defined `as one of a, b, c` (see `define_property_has` below). Not covered by `P.ScopeVariableProps`, and not
// shared with any other chunk, so augmented locally here rather than in `match-fields.E.ts`.
declare module "~/parser/scope/ScopeVariable" {
  interface ScopeVariable {
    /** Raw enumerated values (as parsed), e.g. `["'clubs'", "'diamonds'", ...]` or `[1, 2, 3]`. */
    enumeration?: Array<string | number>
    /** Pre-resolved output values for `enumeration`, if ever set elsewhere (nothing currently writes this). */
    enumerationValues?: Array<string | number>
  }
}

// Groups added on top of a statement's rulex `syntax` groups by `SpellStatement.parseInlineStatement()` /
// `.parseNestedBlock()` (see `rules/Statement.ts`) -- not derivable from `syntax` itself.
type InlineBlockGroups = { inlineStatement?: P.Match; nestedBlock?: P.Match }

// What `AST.MethodDefinition`'s `body` prop accepts.
type MethodBody = AST.StatementBlock | AST.Statement | AST.Expression

/**
 * `Match.AST` (src/parser/Match.ts) is always typed as `ASTNode` because `Rule.getAST()`'s return type isn't
 * parameterized per the specific rule a rulex group refers to -- only the rule's own semantics (which we know,
 * writing the rule) tell us which concrete node type comes back. Narrow once here instead of casting inline.
 */
function astAs<T extends AST.ASTNode = AST.Expression>(match: P.Match): T
function astAs<T extends AST.ASTNode = AST.Expression>(match: P.Match | undefined): T | undefined
function astAs<T extends AST.ASTNode = AST.Expression>(match: P.Match | undefined): T | undefined {
  return match?.AST as T | undefined
}

/**
 * `MethodScopeProps` (src/parser/scope/MethodScope.ts) omits the base `ScopeProps` fields (e.g. `parentScope`)
 * even though its constructor forwards them to `Scope` via `super()`. Narrow once here rather than casting at
 * the one `new P.MethodScope({ parentScope, ... })` call site below.
 */
function newMethodScope(props: P.MethodScopeProps & P.ScopeProps): P.MethodScope {
  return new P.MethodScope(props)
}

/**
 * `Scope.rules` (src/parser/scope/Scope.ts) is typed as `IndexedList<Rule>` (input type `Rule` too), but
 * `RootScope`'s transformer (src/parser/scope/RootScope.ts) actually *throws* if given a real `Rule` instance
 * -- it expects a plain `RuleDefinition`-shaped object, which it forwards to `Parser.defineRule()` itself.
 * Narrow the input type once here rather than casting at each `scope.rules.add(...)` call site below.
 */
function addRule(scope: P.Scope, rule: P.RuleDefinition): void {
  ;(scope.rules as IndexedList<P.Rule, P.RuleDefinition> | undefined)?.add(rule)
}

function getOrStubType(scope: P.Scope, typeName: string): P.TypeScope {
  let typeScope = scope.types?.get(typeName)
  if (!typeScope) {
    ;[typeScope] = scope.types!.add({ name: typeName, stub: true })
  }
  return typeScope
}

type DefinePropertyHasGroups = P.RulexGroups<"type:property:specifier">

type PropertyValueEitherGroups = P.RulexGroups<"type_property", P.Match<P.RulexGroups<"property:type">>> &
  P.RulexGroups<"value:condition:otherValue">

// Extra `bits` group `quoted_property_formula` derives in `getGroupsForMatch()` (see the brief's
// custom-groups pattern) to hand off from there to `mutateScope()`/`getAST()`.
type QuotedPropertyFormulaBits = {
  type: string
  syntax: string
  ruleData: Array<{
    isSingular: boolean
    instanceVar: string
    enumeration: Array<string | number>
    values: Array<string | number>
  }>
  vars: string[]
  property: string
}
type QuotedPropertyFormulaGroups = P.RulexGroups<"type:alias"> &
  P.RulexGroups<"sources", P.Match<P.RulexGroups<"property">>> & { bits?: QuotedPropertyFormulaBits }

export const classes = new SpellParser({
  module: "classes",
  rules: [
    {
      name: "create_type",
      precedence: 10,
      alias: "statement",
      syntax: "(a|an) {type} is (a|an) {superType:type}",
      constructor: class create_type extends SpellStatement {
        mutateScope(match: P.Match<P.RulexGroups<"type:superType">>) {
          const { type, superType } = match.groups
          // Forget it if type is already defined.
          // TODO: complain if existing type is set up differently!
          if (match.scope.types?.get(type!.value)) return
          match.scope.types?.add({ name: type!.value, superType: superType?.value })
        }
        getAST(match: P.Match<P.RulexGroups<"type:superType">>): AST.StatementGroup {
          const { type, superType } = match.groups
          return new AST.StatementGroup(match, {
            statements: [
              new AST.ClassDeclaration(match, {
                type: astAs<AST.TypeExpression>(type!),
                superType: astAs<AST.TypeExpression>(superType)
              }),
              new AST.ExportInvocation(match, {
                property: type!.value,
                value: astAs(type!)
              })
            ]
          })
        }
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            ["a card is a thing", `export class Card extends Thing {}\nspellCore.addExport('Card', Card)`],
            ["a deck is a list", `export class Deck extends List {}\nspellCore.addExport('Deck', Deck)`]
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
      constructor: class create_list_type extends SpellStatement {
        mutateScope(match: P.Match<P.RulexGroups<"type:instanceType">>) {
          const { type } = match.groups
          // Forget it if type is already defined.
          // TODO: complain if existing type is set up differently!
          if (match.scope.types?.get(type!.value)) return

          match.scope.types?.add({ name: type!.value, superType: "list" })
        }
        getAST(match: P.Match<P.RulexGroups<"type:instanceType">>): AST.StatementGroup {
          const { type, instanceType } = match.groups
          return new AST.StatementGroup(match, {
            statements: [
              // Declare the class
              new AST.ClassDeclaration(match, {
                type: astAs<AST.TypeExpression>(type!),
                superType: new AST.TypeExpression(match, { raw: "list", name: "List" })
              }),
              new AST.ExportInvocation(match, {
                property: type!.value,
                value: astAs(type!)
              }),
              new AST.PropertyDefinition(match, {
                thing: new AST.PrototypeExpression(match, { type: astAs<AST.TypeExpression>(type!) }),
                property: "instanceType",
                value: astAs(instanceType!)
              })
            ]
          })
        }
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
      alias: "expression",
      syntax: "a new {type:known_type} ((with|where|whose) {props:object_literal_properties})?",
      constructor: class new_thing extends SpellStatement {
        getAST(match: P.Match<P.RulexGroups<"type:props">>): AST.NewInstanceExpression {
          const { type, props } = match.groups
          return new AST.NewInstanceExpression(match, {
            type: astAs<AST.TypeExpression>(type!),
            props: astAs<AST.ObjectLiteral>(props)
          })
        }
      },
      tests: [
        {
          title: "creates normal types",
          compileAs: "expression",
          tests: [
            [`a new thing`, `new Thing()`],
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
      alias: "expression",
      syntax: "a new (list|List) (of {instanceType:type}?)",
      constructor: class new_list extends SpellStatement {
        getAST(match: P.Match<P.RulexGroups<"instanceType">>): AST.NewInstanceExpression {
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
        }
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
      alias: ["expression", "statement"],
      syntax: "create (a|an) {type:known_type} ((with|where|whose) {props:object_literal_properties})?",
      testRule: "create",
      constructor: class create_thing extends SpellStatement {
        getAST(match: P.Match<P.RulexGroups<"type:props">>): AST.NewInstanceExpression {
          const { type, props } = match.groups
          return new AST.NewInstanceExpression(match, {
            type: astAs<AST.TypeExpression>(type!),
            props: astAs<AST.ObjectLiteral>(props)
          })
        }
      },
      tests: [
        {
          title: "creates normal objects properly",
          compileAs: "statement",
          beforeEach(scope) {
            scope.types?.add("Thing")
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
            scope.types?.add("Object")
            scope.types?.add("List")
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
      constructor: class type_specifier_enum extends P.Rules.Sequence {
        getAST(match: P.Match<P.RulexGroups<"enumeration">>): AST.Enumeration {
          const enumeration = match.groups.enumeration!.items.map((item) => astAs(item))
          return new AST.Enumeration(match, {
            enumeration,
            // Every item here comes from `identifier_list`, which only ever matches `known_variable`,
            // `constant` or `number` leaves -- all `Literal` subclasses whose `compile()` returns the
            // underlying primitive value, but the base `ASTNode.compile()` is typed as `unknown`.
            values: enumeration.map((literal) => literal.compile() as string | number)
          })
        }
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
      constructor: class type_specifier_datatype extends P.Rules.Sequence {
        getAST(match: P.Match<P.RulexGroups<"datatype">>): AST.TypeExpression {
          return astAs<AST.TypeExpression>(match.groups.datatype!)
        }
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
      constructor: class type_specifier_instance extends P.Rules.Sequence {
        getAST(match: P.Match<P.RulexGroups<"new_thing">>): AST.NewInstanceExpression {
          return astAs<AST.NewInstanceExpression>(match.groups.new_thing!)
        }
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
      constructor: class type_specifier_yes_or_no extends P.Rules.Sequence {
        getAST(match: P.Match): AST.TypeExpression {
          return new AST.TypeExpression(match, { raw: "yes or no", name: "choice" })
        }
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
      constructor: class define_property_has extends SpellStatement {
        mutateScope(match: P.Match<DefinePropertyHasGroups>) {
          const { scope } = match
          const { type, property, specifier } = match.groups
          const specifierAST = specifier?.AST

          const typeName = type!.value
          const typeScope = getOrStubType(scope, typeName)

          // If there is a specifier as enumerated values, add rules to match it
          if (specifierAST instanceof AST.Enumeration) {
            const groupName = pluralize(upperFirst(property!.value))

            const { values } = specifierAST
            const varProps: P.ScopeVariableProps & { enumeration: Array<string | number> } = {
              name: groupName,
              enumeration: values,
              initializer: `[${values.join(", ")}]`
            }
            // Add variables to scope for lookup elsewhere
            typeScope.classVariables.add({ ...varProps })
            typeScope.variables.add({ ...varProps })

            // Add enumeration string values to scope as constants.
            values.forEach((value) => {
              if (typeof value === "string") scope.constants?.add(value)
            })

            // Add multi-word identifier rule which returns enumeration, e.g. `card suits` or `Card Suits`
            const literals: string[][] = [
              [typeName, typeName.toLowerCase()],
              [groupName, groupName.toLowerCase()]
            ]
            addRule(scope, {
              name: `${typeName}_${groupName}`,
              precedence: 20,
              alias: "expression",
              literals,
              constructor: class typename_groupname extends P.Rules.Literals {
                getAST(_match: P.Match): AST.PropertyExpression {
                  return new AST.PropertyExpression(_match, {
                    object: astAs(type!),
                    property: new AST.PropertyLiteral(property!, groupName)
                  })
                }
              }
            })

            // Add comment string which we'll output below
            match.ruleComment = new AST.ParserAnnotation(match, {
              value: `added rule: '${literals.map((group) => `(${group.join("|")})`).join(" ")}'`
            })
          }
        }
        getAST(match: P.Match<DefinePropertyHasGroups>): AST.StatementGroup {
          const { type, property } = match.groups

          // output statements
          const statements: Array<AST.Statement | AST.Expression | AST.Comment | AST.BlankLine> = []
          const props = new AST.ObjectLiteral(match)
          props.addProp("property", `'${property!.value}'`)

          // If there is a specifier, add as a condition to the assignment
          const specifier = match.groups.specifier?.AST
          if (specifier) {
            // Enumerated values as strings/numbers/etc
            if (specifier instanceof AST.Enumeration) {
              // Add comment that we created a rule previously
              statements.push(match.ruleComment!)
              props.addProp("enumeration", specifier)
              props.addProp("enumerationProp", `'${pluralize(upperFirst(property!.value))}'`)
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
              // Only `type_specifier_datatype`/`type_specifier_yes_or_no` can produce a `specifier` that
              // reaches here, both of which return a `TypeExpression` -- not statically provable, since
              // `type_specifier`'s `getAST()` can only be typed as returning `ASTNode` in general.
              const typeExpression = specifier as AST.TypeExpression
              props.addProp("type", `'${typeExpression.name}'`)
            }
          }

          // getter and setter
          statements.push(
            new AST.CoreMethodInvocation(match, {
              methodName: "defineProperty",
              args: [new AST.PrototypeExpression(type!, { type: astAs<AST.TypeExpression>(type!) }), props]
            })
          )
          return new AST.StatementGroup(match, { statements })
        }
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
            ["print Card suits", "spellCore.console.log(Card.Suits)"],
            ["print card suits", "spellCore.console.log(Card.Suits)"],
            ["print the suit of the card", "spellCore.console.log(card.suit)"],
            ["print the suits of the card", "spellCore.console.log(card.suits)"]
          ]
        }
      ]
    },

    {
      name: "the_property_of_a_thing",
      alias: "type_property",
      syntax: "the {property} of (a|an) {type}",
      constructor: class the_property_of_a_thing extends P.Rules.Sequence {}
    },
    {
      name: "a_things_property",
      alias: "type_property",
      syntax: "(a|an) {type:plural_type} {property}",
      constructor: class a_things_property extends P.Rules.Sequence {}
    },

    {
      name: "property_value_either",
      alias: "statement",
      syntax:
        "{type_property} is (value:{constant}|{expression}) if {condition:expression} (otherwise it is (otherValue:{constant}|{expression}))?",
      constructor: class property_value_either extends SpellStatement {
        mutateScope(match: P.Match<PropertyValueEitherGroups>) {
          const { scope } = match
          const { value, otherValue, type_property } = match.groups
          const { type } = type_property!.groups
          // make sure type is defined
          getOrStubType(scope, type!.value)
          if (value!.rule instanceof SpellConstant) {
            // TODO: scope.constants.addMissing(value.raw)
            const constant = value!.constant || scope.constants?.get(value!.raw!)
            if (!constant) scope.constants?.add(value!.raw!)
          }
          if (otherValue?.rule instanceof SpellConstant) {
            const constant = otherValue.constant || scope.constants?.get(otherValue.raw!)
            if (!constant) scope.constants?.add(otherValue.raw!)
          }
        }
        getAST(match: P.Match<PropertyValueEitherGroups>): AST.PropertyDefinition {
          const { value, otherValue, type_property, condition } = match.groups
          const { type, property } = type_property!.groups
          const prototype = new AST.PrototypeExpression(type!, { type: astAs<AST.TypeExpression>(type!) })
          const ifAST = new AST.IfStatement(match, {
            condition: astAs(condition!),
            statements: new AST.ReturnStatement(match, { value: astAs(value!) })
          })
          let getterBody: AST.Statement
          if (!otherValue) {
            getterBody = ifAST
          } else {
            getterBody = new AST.StatementGroup(match, {
              statements: [ifAST, new AST.ReturnStatement(match, { value: astAs(otherValue) })]
            })
          }
          return new AST.PropertyDefinition(match, {
            thing: prototype,
            property: astAs<AST.PropertyLiteral>(property!),
            get: new AST.MethodDefinition(match, { body: getterBody })
          })
        }
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.types?.add("card")
            scope.constants?.add("diamonds", "hearts", "clubs", "spades")
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
      wantsInlineStatement: true,
      parseInlineStatementAs: "expression",
      wantsNestedBlock: true,
      constructor: class property_value_getter extends SpellStatement {
        getNestedScopeForMatch(match: P.Match<P.RulexGroups<"property:type">>): P.MethodScope {
          const { type } = match.groups
          return newMethodScope({
            parentScope: match.scope,
            thisVar: type!.type!.instanceName,
            mapItTo: "this"
          })
        }
        getAST(match: P.Match<P.RulexGroups<"property:type"> & InlineBlockGroups>): AST.PropertyDefinition {
          const { type, property, inlineStatement, nestedBlock } = match.groups
          return new AST.PropertyDefinition(match, {
            thing: new AST.PrototypeExpression(match, { type: astAs<AST.TypeExpression>(type!) }),
            property: astAs<AST.PropertyLiteral>(property!),
            get: new AST.MethodDefinition(match, {
              body: astAs<MethodBody>(nestedBlock || inlineStatement)
            })
          })
        }
      },
      tests: [
        {
          compileAs: "block",
          beforeEach(scope) {
            scope.compile("a card is a thing\na pile is a list of cards")
          },
          tests: [
            {
              input: "the value of a card is:",
              output: ["spellCore.define(Card.prototype, 'value', {", "\tget() {}", "})"]
            },
            {
              input: "the value of a card is its name",
              output: ["spellCore.define(Card.prototype, 'value', {", "\tget() {", "\t\treturn this.name", "\t}", "})"]
            },
            {
              input: ["the short-name of a card is:", "\treturn the first word of the name of the card"],
              output: [
                "spellCore.define(Card.prototype, 'short_name', {",
                "\tget() {",
                "\t\treturn spellCore.getItemOf(this.name, 1)",
                "\t}",
                "})"
              ]
            },
            {
              title: "Show error if both nestedBlock and inlineStatement",
              input: ["the short-name of a card is its name", "\treturn the first word of the name of the card"],
              output: [
                "spellCore.define(Card.prototype, 'short_name', {",
                "\tget() {",
                "\t\treturn spellCore.getItemOf(this.name, 1)",
                "\t}",
                "})",
                "/* PARSE ERROR: Got both inline statement and nested block */"
              ]
            }
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
      constructor: class quoted_property_formula extends SpellStatement {
        parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
          const match = super.parse(scope, tokens)
          if (!match) return undefined
          // If first word of `alias` is not `is`, forget it
          const alias = JSON.parse((match.groups.alias as P.Match).value).split(" ")
          if (alias[0] !== "is") return undefined
          return match
        }

        // When gathering the match groups, figure out `bits` for making rules and AST nodes
        getGroupsForMatch(match: P.Match): QuotedPropertyFormulaGroups {
          const groups = super.getGroupsForMatch(match) as QuotedPropertyFormulaGroups
          const alias = groups.alias!.value
          const type = groups.type!.value
          const sources = groups.sources!.items

          const words: string[] = JSON.parse(alias).split(" ")
          const syntaxParts: string[] = []
          const ruleData: QuotedPropertyFormulaBits["ruleData"] = []
          const vars: string[] = []
          let sourceNum = 0
          const property = words
            .map((word) => {
              // output keywords directly into words/keywords immediately
              if (!word.startsWith("(")) {
                // transform `a` to `(a|an)` for flexbility
                if (word === "a" || word === "an") syntaxParts.push("(a|an)")
                else syntaxParts.push(word)
                return word
              }
              const instanceVar = word.slice(1, -1)
              const singularVar = singularize(instanceVar)
              const isSingular = singularVar === instanceVar
              vars.push(singularVar)

              // Try to find the enumeration
              // NOTE: currently this only works for an enumeration defined on the type!!!
              const propertyName = (sources[sourceNum]?.groups?.property as P.Match | undefined)?.value
              const variable = match.scope.types?.get(type)?.variables.get(propertyName)
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
                syntaxParts.push(`(expression:${inflectedEnumeration.join("|")})`)
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
          syntaxParts.splice(0, 1, "(operator:is not?)")
          const syntax = syntaxParts.join(" ")
          groups.bits = { type, syntax, ruleData, vars, property }
          return groups
        }

        mutateScope(match: P.Match<QuotedPropertyFormulaGroups>) {
          const { syntax, property, ruleData } = match.groups.bits!

          // Create an expression suffix to match the quoted statement, e.g. `is not? a queen`
          addRule(match.scope, {
            name: property,
            precedence: 20,
            alias: "expression_suffix",
            syntax,
            constructor: class _quoted_property_rule extends InfixOperatorSuffix {
              shouldNegateOutput(operator: P.Match): boolean {
                return operator.value.includes("not")
              }
              compileASTExpression(
                _match: P.Match,
                { lhs, rhs }: { lhs?: AST.Expression; rhs?: unknown }
              ): AST.ScopedMethodInvocation {
                // This dynamically-generated rule's syntax repeats the `expression` group name (once per
                // `$var` in the quoted alias), and each of those groups matches a plain keyword literal with
                // no `getAST()` -- so the shunting-yard algorithm's `compile()` helper (`compound_expression`
                // in expressions.ts) leaves `rhs` as the raw `P.Match[]` rather than resolving it to an
                // `Expression`. Neither shape is representable in `OperatorOperands`, which assumes a single
                // already-resolved `Expression`.
                const rhsMatches = (Array.isArray(rhs) ? rhs : [rhs]) as P.Match[]
                const args = rhsMatches
                  .map((arg, index) => {
                    if (typeof arg.value === "string") {
                      // Handle singular input values mapping to plural internal values
                      // `enumeration` will be: "club", "spade", etc
                      // `values` will be: `"clubs"`, `"spades"`, etc
                      const { enumeration, values } = ruleData[index]!
                      const valueIndex = enumeration.indexOf(arg.value)
                      return new AST.ConstantExpression(arg, {
                        name: arg.value,
                        output: valueIndex !== -1 ? String(values[valueIndex]) : `'arg.value'`
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
                  .filter((arg): arg is AST.ConstantExpression | AST.NumericLiteral => Boolean(arg))
                return new AST.ScopedMethodInvocation(_match, {
                  thing: lhs!,
                  methodName: property,
                  args
                })
              }
            }
          })

          // Add comment string which we'll output below
          match.ruleComment = new AST.ParserAnnotation(match, {
            value: `added expression: '${syntax}'`
          })
        }

        getAST(match: P.Match<QuotedPropertyFormulaGroups>): AST.StatementGroup {
          const { type } = match.groups
          const { vars, property } = match.groups.bits!
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
          const statements: Array<AST.Statement | AST.Expression | AST.Comment | AST.BlankLine> = [
            match.ruleComment!,
            new AST.PropertyDefinition(match, {
              thing: new AST.PrototypeExpression(type!, { type: astAs<AST.TypeExpression>(type!) }),
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
            ["print card is a club", "spellCore.console.log(card.is_a_$suit('clubs'))"],
            ["print card is the 2 of hearts", "spellCore.console.log(card.is_the_$rank_of_$suits(2, 'hearts'))"]
          ]
        }
      ]
    }
  ]
})
