import { upperFirst, pluralize, singularize, type IndexedList } from "~/util"
import { P } from "~/parser"
// Import directly to avoid circular import
import { SpellParser } from "~/languages/spell/SpellParser"
import { SpellStatement } from "./Statement"
import { InfixOperatorSuffix } from "./expressions"
import { SpellConstant } from "./constants"
import "./match-fields.E"

/**
 * Ad-hoc fields this module sets/reads on `ScopeVariable` (src/parser/scope/ScopeVariable.ts), for a property
 * defined `as one of a, b, c` (see `define_property_has` below).  Not covered by `P.ScopeVariableProps`, and
 * not shared with any other chunk, so augmented locally here rather than in `match-fields.E.ts`.
 */
declare module "~/parser/scope/ScopeVariable" {
  // NOTE: MUST stay an `interface` -- module augmentation merges into the declared `ScopeVariable`,
  // and `type` cannot merge.  Documented exception to the "always use `type`" rule.
  interface ScopeVariable {
    /** Raw enumerated values (as parsed), e.g. `["'clubs'", "'diamonds'", ...]` or `[1, 2, 3]`. */
    enumeration?: Array<string | number>
    /** Pre-resolved output values for `enumeration`, if ever set elsewhere (nothing currently writes this). */
    enumerationValues?: Array<string | number>
  }
}

/**
 * Groups added on top of a statement's rulex `syntax` groups by `SpellStatement.parseInlineStatement()` /
 * `.parseNestedBlock()` (see `rules/Statement.ts`) -- not derivable from `syntax` itself.
 */
type InlineBlockGroups = { inlineStatement?: P.Match; nestedBlock?: P.Match }

/** What `P.ASTMethodDefinition`'s `body` prop accepts. */
type MethodBody = P.ASTStatementBlock | P.ASTStatement | P.ASTExpression

/**
 * `Match.AST` (src/parser/Match.ts) is always typed as `ASTNode` because `Rule.getAST()`'s return type isn't
 * parameterized per the specific rule a rulex group refers to -- only the rule's own semantics (which we know,
 * writing the rule) tell us which concrete node type comes back. Narrow once here instead of casting inline.
 */
function astAs<T extends P.ASTNode = P.ASTExpression>(match: P.Match): T
function astAs<T extends P.ASTNode = P.ASTExpression>(match: P.Match | undefined): T | undefined
function astAs<T extends P.ASTNode = P.ASTExpression>(match: P.Match | undefined): T | undefined {
  return match?.AST as T | undefined
}

/**
 * Construct a `P.MethodScope` for the property-getter's nested body below.
 * - TODO: drop this helper and just call `new P.MethodScope(props)` at call sites?  `lists.ts` has an
 *   identical copy.
 */
function newMethodScope(props: P.MethodScopeProps): P.MethodScope {
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

/**
 * Look up `typeName` in `scope.types`, creating a stub (`{ stub: true }`) entry if it isn't defined yet.
 * - Lets a property/method be declared on a type before that type's own `is a` statement has been parsed,
 *   e.g. forward references or types defined later in the same file.
 */
function getOrStubType(scope: P.Scope, typeName: string): P.TypeScope {
  let typeScope = scope.types?.get(typeName)
  if (!typeScope) {
    ;[typeScope] = scope.types!.add({ name: typeName, stub: true })
  }
  return typeScope
}

/** Match groups for `define_property_has`'s `syntax`. */
type DefinePropertyHasGroups = P.RulexGroups<"type:property:specifier">

/** Match groups for `property_value_either`'s `syntax` -- `type_property` nests its own `type`/`property`. */
type PropertyValueEitherGroups = P.RulexGroups<"type_property", P.Match<P.RulexGroups<"property:type">>> &
  P.RulexGroups<"value:condition:otherValue">

/**
 * Extra `bits` group `quoted_property_formula` derives in `getGroupsForMatch()`
 * to hand off from there to `mutateScope()`/`getAST()`.
 */
type QuotedPropertyFormulaBits = {
  /** Owning type name, e.g. `"card"`. */
  type: string
  /** Rulex syntax generated for the dynamically-added `expression_suffix` rule (see `mutateScope()`). */
  syntax: string
  /** One entry per `(var)` placeholder found in the quoted alias, in source order. */
  ruleData: Array<{
    /** `true` if the placeholder's inflection matched its singular form, e.g. `(rank)` not `(ranks)`. */
    isSingular: boolean
    /** Raw placeholder text as written, e.g. `"ranks"`. */
    instanceVar: string
    /** Enumeration values inflected to match `isSingular`, used to match the spoken word at parse time. */
    enumeration: Array<string | number>
    /** Enumeration values as they should appear in compiled output, e.g. quoted strings. */
    values: Array<string | number>
  }>
  /** Singularized variable names, in source order -- used as the generated method's argument names. */
  vars: string[]
  /** Generated method/property name, e.g. `"is_the_$rank_of_$suits"`. */
  property: string
}

/** Match groups for `quoted_property_formula`'s `syntax`, plus the `bits` this rule derives itself. */
type QuotedPropertyFormulaGroups = P.RulexGroups<"type:alias"> &
  P.RulexGroups<"sources", P.Match<P.RulexGroups<"property">>> & { bits?: QuotedPropertyFormulaBits }

export const classes = new SpellParser({
  module: "classes",
  rules: [
    /**
     * `a card is a thing` -- declares `type` as a new class extending `superType`.
     * - `precedence: 10` so this wins over other `{type} is {type}` -ish statement rules.
     * - SIDE EFFECT: adds `type` to `scope.types`, unless it's already defined (no redefinition/merge).
     * - Compiles to a class declaration plus a `spellCore.addExport()` call, e.g. `a card is a thing` =>
     *   `export class Card extends Thing {}\nspellCore.addExport('Card', Card)`.
     */
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
        getAST(match: P.Match<P.RulexGroups<"type:superType">>): P.ASTStatementGroup {
          const { type, superType } = match.groups
          return new P.ASTStatementGroup(match, {
            statements: [
              new P.ASTClassDeclaration(match, {
                type: astAs<P.ASTTypeExpression>(type!),
                superType: astAs<P.ASTTypeExpression>(superType)
              }),
              new P.ASTExportInvocation(match, {
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

    /**
     * `a deck is a list of cards` or `create a type called Deck as a list of cards` -- declares `type` as a
     * new class extending `List`, with its `instanceType` set to `instanceType`.
     * - `precedence: 10` so this wins over the plainer `create_type` rule above for the `is a list of` form.
     * - SIDE EFFECT: adds `type` to `scope.types` (superType `"list"`), unless already defined.
     * - Compiles to a class declaration extending `List` plus a static `instanceType` property, e.g.
     *   `a deck is a list of cards` => `export class Deck extends List {}` +
     *   `spellCore.define(Deck.prototype, 'instanceType', { value: Card })`.
     */
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
        getAST(match: P.Match<P.RulexGroups<"type:instanceType">>): P.ASTStatementGroup {
          const { type, instanceType } = match.groups
          return new P.ASTStatementGroup(match, {
            statements: [
              // Declare the class
              new P.ASTClassDeclaration(match, {
                type: astAs<P.ASTTypeExpression>(type!),
                superType: new P.ASTTypeExpression(match, { raw: "list", name: "List" })
              }),
              new P.ASTExportInvocation(match, {
                property: type!.value,
                value: astAs(type!)
              }),
              new P.ASTPropertyDefinition(match, {
                thing: new P.ASTPrototypeExpression(match, { type: astAs<P.ASTTypeExpression>(type!) }),
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

    /**
     * `a new object` -- constructs `type` (optionally `with`/`where`/`whose` `props`).
     * - NOTE: we assume that all types take an object of properties????
     * - Compiles to `new Type(...)`, e.g. `a new Thing with a = 1, b = yes` => `new Thing({ a: 1, b: true })`.
     */
    {
      name: "new_thing",
      alias: "expression",
      syntax: "a new {type:known_type} ((with|where|whose) {props:object_literal_properties})?",
      constructor: class new_thing extends SpellStatement {
        getAST(match: P.Match<P.RulexGroups<"type:props">>): P.ASTNewInstanceExpression {
          const { type, props } = match.groups
          return new P.ASTNewInstanceExpression(match, {
            type: astAs<P.ASTTypeExpression>(type!),
            props: astAs<P.ASTObjectLiteral>(props)
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

    /**
     * `a new list of <type>` -- constructs a `List`, optionally tagged with `instanceType`.
     * - Compiles to `new List(...)`, e.g. `a new list of Todos` => `new List({ instanceType: "Todo" })`.
     */
    {
      name: "new_list",
      alias: "expression",
      syntax: "a new (list|List) (of {instanceType:type}?)",
      constructor: class new_list extends SpellStatement {
        getAST(match: P.Match<P.RulexGroups<"instanceType">>): P.ASTNewInstanceExpression {
          const { instanceType } = match.groups
          return new P.ASTNewInstanceExpression(match, {
            type: new P.ASTTypeExpression(match, { name: "List" }),
            props:
              instanceType &&
              new P.ASTObjectLiteral(instanceType, {
                properties: [
                  new P.ASTObjectLiteralProperty(instanceType, {
                    property: "instanceType",
                    value: new P.ASTStringLiteral(instanceType, { value: `"${instanceType.value}"` })
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

    /**
     * `create a thing` -- same as `new_thing` above, worded with `create` instead of `a new`.
     * - This works as an expression OR a statement.
     * - NOTE: we assume that all types take an object of properties????
     * - TODO: in `statement` form, put into `it`???
     * - FIXME: `list`, `text`, etc don't follow these semantics???
     */
    {
      name: "create_thing",
      alias: ["expression", "statement"],
      syntax: "create (a|an) {type:known_type} ((with|where|whose) {props:object_literal_properties})?",
      testRule: "create",
      constructor: class create_thing extends SpellStatement {
        getAST(match: P.Match<P.RulexGroups<"type:props">>): P.ASTNewInstanceExpression {
          const { type, props } = match.groups
          return new P.ASTNewInstanceExpression(match, {
            type: astAs<P.ASTTypeExpression>(type!),
            props: astAs<P.ASTObjectLiteral>(props)
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

    /**
     * `as either red or black` / `as one of clubs, diamonds, hearts, spades` -- specifies a property's
     * allowed values as an enumeration, for use by `define_property_has` below.
     * - Compiles (via `getAST()`) to a `P.ASTEnumeration` array literal, e.g. `['red', 'black']`.
     */
    {
      name: "type_specifier_enum",
      alias: "type_specifier",
      syntax: "as (either|one of) {enumeration:identifier_list}",
      constructor: class type_specifier_enum extends P.Sequence {
        getAST(match: P.Match<P.RulexGroups<"enumeration">>): P.ASTEnumeration {
          const enumeration = match.groups.enumeration!.items.map((item) => astAs(item))
          return new P.ASTEnumeration(match, {
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

    /**
     * `as a number` / `as an automobile` -- specifies a property's datatype as a primitive or known type.
     * - Compiles (via `getAST()`) directly to the `datatype`'s `TypeExpression`, e.g. `number` or `Automobile`.
     */
    {
      name: "type_specifier_datatype",
      alias: "type_specifier",
      syntax: "as (a|an)? {datatype:singular_type}",
      constructor: class type_specifier_datatype extends P.Sequence {
        getAST(match: P.Match<P.RulexGroups<"datatype">>): P.ASTTypeExpression {
          return astAs<P.ASTTypeExpression>(match.groups.datatype!)
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

    /**
     * `as a new thing` -- specifies a property's default/initializer value as a `new_thing` expression.
     * - Compiles (via `getAST()`) to the nested `NewInstanceExpression`, e.g. `new Thing()`.
     */
    {
      name: "type_specifier_instance",
      alias: "type_specifier",
      syntax: "as {new_thing}",
      constructor: class type_specifier_instance extends P.Sequence {
        getAST(match: P.Match<P.RulexGroups<"new_thing">>): P.ASTNewInstanceExpression {
          return astAs<P.ASTNewInstanceExpression>(match.groups.new_thing!)
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

    /**
     * `as yes or no` / `as either true or false` -- specifies a property's datatype as a boolean.
     * - Compiles to a fixed `TypeExpression` with `name: "choice"` rather than a real `boolean` datatype --
     *   matches spell's `choice` vocabulary (see `type_specifier_enum`'s "either" wording too).
     */
    {
      name: "type_specifier_yes_or_no",
      alias: "type_specifier",
      syntax: "as either? (yes or no|true or false)",
      constructor: class type_specifier_yes_or_no extends P.Sequence {
        getAST(match: P.Match): P.ASTTypeExpression {
          return new P.ASTTypeExpression(match, { raw: "yes or no", name: "choice" })
        }
      },
      tests: [
        {
          tests: [["as yes or no", "choice"]]
        }
      ]
    },
    /**
     * `a card has a suit as one of clubs, diamonds, hearts, spades` / `todos have a title as text` -- declares
     * an instance property on `type`, optionally constrained/initialized by a `type_specifier`.
     * - `precedence: 10` so this wins over other `{type} has|have ...` -ish statement rules.
     * - `testRule: "…(has|have)"` for a cheap upfront reject before attempting the full match.
     * - SIDE EFFECT: `getOrStubType()`s `type` into `scope.types` if not yet declared.
     * - SIDE EFFECT: when `specifier` is an enumeration, also adds a pluralized class variable (e.g. `Suits`)
     *   holding the raw values, adds string values to `scope.constants`, and dynamically registers a new
     *   `expression` rule (via `addRule()`) so `Card Suits` / `card suits` resolve to that property --
     *   `match.ruleComment` records this as a `SPELL:`-prefixed comment emitted alongside the output.
     * - Compiles to a `spellCore.defineProperty()` call, e.g. `a player has a name as text` =>
     *   `spellCore.defineProperty(Player.prototype, { property: 'name', type: 'text' })`.
     */
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
          if (specifierAST instanceof P.ASTEnumeration) {
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
              constructor: class typename_groupname extends P.Literals {
                getAST(_match: P.Match): P.ASTPropertyExpression {
                  return new P.ASTPropertyExpression(_match, {
                    object: astAs(type!),
                    property: new P.ASTPropertyLiteral(property!, groupName)
                  })
                }
              }
            })

            // Add comment string which we'll output below
            match.ruleComment = new P.ASTParserAnnotation(match, {
              value: `added rule: '${literals.map((group) => `(${group.join("|")})`).join(" ")}'`
            })
          }
        }
        getAST(match: P.Match<DefinePropertyHasGroups>): P.ASTStatementGroup {
          const { type, property } = match.groups

          // output statements
          const statements: Array<P.ASTStatement | P.ASTExpression | P.ASTComment | P.ASTBlankLine> = []
          const props = new P.ASTObjectLiteral(match)
          props.addProp("property", `'${property!.value}'`)

          // If there is a specifier, add as a condition to the assignment
          const specifier = match.groups.specifier?.AST
          if (specifier) {
            // Enumerated values as strings/numbers/etc
            if (specifier instanceof P.ASTEnumeration) {
              // Add comment that we created a rule previously
              statements.push(match.ruleComment!)
              props.addProp("enumeration", specifier)
              props.addProp("enumerationProp", `'${pluralize(upperFirst(property!.value))}'`)
            }
            // instance specifier
            else if (specifier instanceof P.ASTNewInstanceExpression) {
              props.addMethod(
                "initializer",
                new P.ASTMethodDefinition(specifier.match, {
                  body: specifier
                })
              )
            }
            // type
            else {
              // Only `type_specifier_datatype`/`type_specifier_yes_or_no` can produce a `specifier` that
              // reaches here, both of which return a `TypeExpression` -- not statically provable, since
              // `type_specifier`'s `getAST()` can only be typed as returning `ASTNode` in general.
              const typeExpression = specifier as P.ASTTypeExpression
              props.addProp("type", `'${typeExpression.name}'`)
            }
          }

          // getter and setter
          statements.push(
            new P.ASTCoreMethodInvocation(match, {
              methodName: "defineProperty",
              args: [new P.ASTPrototypeExpression(type!, { type: astAs<P.ASTTypeExpression>(type!) }), props]
            })
          )
          return new P.ASTStatementGroup(match, { statements })
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

    /**
     * `the color of a card` -- one of two `type_property` spellings consumed by `property_value_either` and
     * `property_value_getter` below.  No `getAST()`: callers read `match.groups.type`/`.property` directly.
     */
    {
      name: "the_property_of_a_thing",
      alias: "type_property",
      syntax: "the {property} of (a|an) {type}",
      constructor: class the_property_of_a_thing extends P.Sequence {}
    },
    /** `a cards color` -- the other `type_property` spelling, see `the_property_of_a_thing` above. */
    {
      name: "a_things_property",
      alias: "type_property",
      syntax: "(a|an) {type:plural_type} {property}",
      constructor: class a_things_property extends P.Sequence {}
    },

    /**
     * `the color of a card is red if its suit is either diamonds or hearts (otherwise it is X)?` -- defines a
     * property getter whose value is conditional on `condition`.
     * - SIDE EFFECT: `getOrStubType()`s `type` into scope, and adds any bare constant `value`/`otherValue`
     *   to `scope.constants` if not already known.
     * - Compiles to `spellCore.define()` with a `get()` that `if`s on `condition`, returning `otherValue`
     *   (or falling through) when absent.
     */
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
        getAST(match: P.Match<PropertyValueEitherGroups>): P.ASTPropertyDefinition {
          const { value, otherValue, type_property, condition } = match.groups
          const { type, property } = type_property!.groups
          const prototype = new P.ASTPrototypeExpression(type!, { type: astAs<P.ASTTypeExpression>(type!) })
          const ifAST = new P.ASTIfStatement(match, {
            condition: astAs(condition!),
            statements: new P.ASTReturnStatement(match, { value: astAs(value!) })
          })
          let getterBody: P.ASTStatement
          if (!otherValue) {
            getterBody = ifAST
          } else {
            getterBody = new P.ASTStatementGroup(match, {
              statements: [ifAST, new P.ASTReturnStatement(match, { value: astAs(otherValue) })]
            })
          }
          return new P.ASTPropertyDefinition(match, {
            thing: prototype,
            property: astAs<P.ASTPropertyLiteral>(property!),
            get: new P.ASTMethodDefinition(match, { body: getterBody })
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

    /**
     * `the value of a card is:` -- defines a property getter whose body is an inline statement or nested
     * block (`wantsInlineStatement`/`wantsNestedBlock`), with `its`/`it` mapped to `this` inside.
     * - `getNestedScopeForMatch()` maps `it`/`its` to `this` via `mapItTo`, so the body can say
     *   `return the first word of the name` instead of repeating `of the card`.
     * - Compiles to `spellCore.define()` with a `get()` running the parsed body, e.g. `the value of a card
     *   is its name` => `spellCore.define(Card.prototype, 'value', { get() { return this.name } })`.
     */
    {
      name: "property_value_getter",
      alias: "statement",
      syntax: "the {property} of (a|an) {type:known_type} is :?",
      wantsInlineStatement: true,
      parseInlineStatementAs: "expression",
      wantsNestedBlock: true,
      constructor: class property_value_getter extends SpellStatement {
        /** Nested scope for the getter body -- maps `its`/`it` to `this` so the body can say `its name`. */
        getNestedScopeForMatch(match: P.Match<P.RulexGroups<"property:type">>): P.MethodScope {
          const { type } = match.groups
          return newMethodScope({
            parentScope: match.scope,
            thisVar: type!.type!.instanceName,
            mapItTo: "this"
          })
        }
        getAST(match: P.Match<P.RulexGroups<"property:type"> & InlineBlockGroups>): P.ASTPropertyDefinition {
          const { type, property, inlineStatement, nestedBlock } = match.groups
          return new P.ASTPropertyDefinition(match, {
            thing: new P.ASTPrototypeExpression(match, { type: astAs<P.ASTTypeExpression>(type!) }),
            property: astAs<P.ASTPropertyLiteral>(property!),
            get: new P.ASTMethodDefinition(match, {
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

    /**
     * `a card "is a (rank) of (suits)" for its ranks and its suits` -- defines a templated boolean method
     * from a quoted phrase with `(placeholder)`s, plus a matching quoted-expression rule to call it,
     * e.g. `a card is the queen of spades`.
     * - NOTE: the first word in quotes must be `"is"` !!
     * - `precedence: 10` so this wins over plainer statement rules that could otherwise partially match.
     * - SIDE EFFECT: `getGroupsForMatch()` derives a `bits` group (rulex `syntax`, per-placeholder
     *   `ruleData`, `vars`, generated `property` name) consumed by `mutateScope()`/`getAST()` below.
     * - SIDE EFFECT: `mutateScope()` dynamically registers an `expression_suffix` rule (via `addRule()`) for
     *   the quoted phrase, e.g. `is (not)? a queen`, so it can be used like `card is a club`; also records
     *   a `SPELL:`-prefixed `match.ruleComment` for the added-expression comment emitted alongside output.
     * - Compiles to an instance method testing each placeholder against its property, e.g. `a card "is the
     *   (rank) of (suits)" for its ranks and its suits` => a `value(rank, suit)` method returning
     *   `this.rank === rank && this.suit === suit`.
     */
    {
      name: "quoted_property_formula",
      precedence: 10,
      alias: "statement",
      syntax: "(a|an) {type} {alias:text} for [sources:(its {property}) and]",
      constructor: class quoted_property_formula extends SpellStatement {
        /** Reject the match unless `alias`'s first quoted word is `"is"` -- see rule NOTE above. */
        parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
          const match = super.parse(scope, tokens)
          if (!match) return undefined
          // If first word of `alias` is not `is`, forget it
          const alias = JSON.parse((match.groups.alias as P.Match).value).split(" ")
          if (alias[0] !== "is") return undefined
          return match
        }

        /** When gathering match groups, figure out `bits` for making rules and AST nodes -- see the type. */
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

        /** Register the quoted-phrase's generated `expression_suffix` rule -- see rule SIDE EFFECTs above. */
        mutateScope(match: P.Match<QuotedPropertyFormulaGroups>) {
          const { syntax, property, ruleData } = match.groups.bits!

          // Create an expression suffix to match the quoted statement, e.g. `is not? a queen`
          addRule(match.scope, {
            name: property,
            precedence: 20,
            alias: "expression_suffix",
            syntax,
            constructor: class _quoted_property_rule extends InfixOperatorSuffix {
              /** `true` if the matched `operator` includes `not`, e.g. `is not a queen`. */
              shouldNegateOutput(operator: P.Match): boolean {
                return operator.value.includes("not")
              }
              /** Map each matched placeholder word/number to its compiled enumeration value or literal. */
              compileASTExpression(
                _match: P.Match,
                { lhs, rhs }: { lhs?: P.ASTExpression; rhs?: unknown }
              ): P.ASTScopedMethodInvocation {
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
                      return new P.ASTConstantExpression(arg, {
                        name: arg.value,
                        output: valueIndex !== -1 ? String(values[valueIndex]) : `'arg.value'`
                      })
                    }
                    if (typeof arg.value === "number") {
                      return new P.ASTNumericLiteral(arg, {
                        value: arg.value
                      })
                    }
                    console.warn("quoted_property_formula: don't understand arg", arg)
                    return undefined
                  })
                  .filter((arg): arg is P.ASTConstantExpression | P.ASTNumericLiteral => Boolean(arg))
                return new P.ASTScopedMethodInvocation(_match, {
                  thing: lhs!,
                  methodName: property,
                  args
                })
              }
            }
          })

          // Add comment string which we'll output below
          match.ruleComment = new P.ASTParserAnnotation(match, {
            value: `added expression: '${syntax}'`
          })
        }

        getAST(match: P.Match<QuotedPropertyFormulaGroups>): P.ASTStatementGroup {
          const { type } = match.groups
          const { vars, property } = match.groups.bits!
          // Return AST for the instance method
          const args = vars.map((varName) => new P.ASTVariableExpression(match, { name: varName }))
          const properties = vars.map((varName) => new P.ASTPropertyLiteral(match, varName))
          const expressions = args.map(
            (variable, index) =>
              new P.ASTInfixExpression(match, {
                lhs: new P.ASTPropertyExpression(match, {
                  object: new P.ASTThisLiteral(match),
                  property: properties[index]
                }),
                operator: "===",
                rhs: variable
              })
          )
          const statements: Array<P.ASTStatement | P.ASTExpression | P.ASTComment | P.ASTBlankLine> = [
            match.ruleComment!,
            new P.ASTPropertyDefinition(match, {
              thing: new P.ASTPrototypeExpression(type!, { type: astAs<P.ASTTypeExpression>(type!) }),
              property,
              value: new P.ASTMethodDefinition(match, {
                args,
                body: new P.ASTReturnStatement(match, {
                  value: P.ASTMultiInfixExpression(match, { expressions, operator: "&&" })
                }),
                datatype: "boolean"
              })
            })
          ]
          return new P.ASTStatementGroup(match, { statements })
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
