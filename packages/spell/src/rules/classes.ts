/**
 * Rules for classes -- declaring types (`is a`, `is a list of`), constructing instances (`a new`,
 * `create`), declaring/deriving instance properties (`has`, `is red if`, `is:`), and templated boolean
 * methods generated from quoted phrases (`"is a (rank)"`).
 * - `type_specifier_*` rules are the `as ...` clauses `define_property_has` accepts after a property
 *   name, e.g. `as either red or black` / `as a number` / `as a new thing` / `as yes or no`.
 * - `the_property_of_a_thing` / `a_things_property` are the two `type_property` spellings shared by
 *   `property_value_either` / `property_value_getter`.
 */
import { NONE, pluralize, proto, singularize, upperFirst } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"
import { SpellStatement } from "./Statement"
import { getKnownType } from "./types"
import { InfixOperatorSuffix, Precedence, type SpellExpressionProps } from "./expressions"
import { SpellConstant } from "./constants"

/**
 * Ad-hoc fields this module sets/reads on `ScopeVariable` (src/parser/scope/ScopeVariable.ts), for a property
 * defined `as one of a, b, c` (see `define_property_has` below).  Not covered by `P.ScopeVariableProps`, and
 * only used in this file, so augmented locally.
 */
declare module "$/parser/scope/ScopeVariable" {
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
 * Rule module for class/property rules (`create_type`, `define_property_has`, `quoted_property_formula`, …).
 * - Each rule class below is followed by the `classes.addRule()` call which defines and registers it.
 */
export const classes = new SpellParser({ module: "classes" })

////////////////
// ## `create_type` rule
//    e.g. "a card is a thing"
////////////////

/**
 * `a card is a thing` -- declares `type` as a new class extending `superType`.
 * - `priority: 10` so this wins over other `{type} is {type}` -ish statement rules.
 * - SIDE EFFECT: adds `type` to `scope.types`, unless it's already defined (no redefinition/merge).
 * - Compiles to an exported class declaration, e.g. `a card is a thing` => `export class Card extends Thing {}`.
 *   Another project reaches it by `import`ing it -- no globals.
 */
class create_type extends SpellStatement<"type|superType"> {
  @proto static priority = 10
  @proto static alias = "statement"
  @proto static declares: P.DeclaresSpec = { kind: "type", name: "type", detail: "superType" }

  mutateScope(match: P.MatchFor<this>) {
    const { type, superType } = match.groups
    // Forget it if type is already defined, unless it was only stubbed by an earlier mention.
    // TODO: complain if existing type is set up differently!
    // An IMPORTED one is declared again anyway, so `SP.SpellDeclarations.checkImportClashes()` can report it.
    const existing = match.scope.types?.get(type.value)
    if (existing && !(existing.parentScope instanceof P.ImportScope)) {
      // a stub, or left by an earlier parse of this statement -- see `P.TypeScope.sameStatement()`
      if (existing.stub || P.TypeScope.sameStatement(existing.declaredBy, match)) {
        existing.claim(match, superType.value)
      }
      return
    }
    match.scope.types?.add({ name: type.value, superType: superType.value, declaredBy: match })
  }
  getAST(match: P.MatchFor<this>): P.ASTStatementGroup {
    const { type, superType } = match.groups
    return new P.ASTStatementGroup(match, {
      statements: [
        new P.ASTClassDeclaration(match, {
          type: P.matchAST<P.ASTTypeExpression>(type),
          superType: P.matchAST<P.ASTTypeExpression>(superType)
        })
      ]
    })
  }
}
classes.addRule(create_type, {
  syntax: "(a|an) {type} is (a|an) {superType:type}",
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["a card is a thing", "export class Card extends Thing {}"],
        ["a deck is a list", "export class Deck extends List {}"]
      ]
    }
  ]
})

////////////////
// ## `create_list_type` rule
//    e.g. "a deck is a list of cards"
////////////////

/**
 * `a deck is a list of cards` or `create a type called Deck as a list of cards` -- declares `type` as a
 * new class extending `List`, with its `instanceType` set to `instanceType`.
 * - `priority: 10` so this wins over the plainer `create_type` rule above for the `is a list of` form.
 * - SIDE EFFECT: adds `type` to `scope.types` (superType `"list"`), unless already defined.
 * - Compiles to a class declaration extending `List` with a static `instanceType`, e.g.
 *   `a deck is a list of cards` => `export class Deck extends List {` + `static instanceType = Card` + `}`.
 */
class create_list_type extends SpellStatement<"type|instanceType"> {
  @proto static priority = 10
  @proto static alias = "statement"
  @proto static declares: P.DeclaresSpec = { kind: "type", name: "type", detail: "instanceType" }

  mutateScope(match: P.MatchFor<this>) {
    const { type } = match.groups
    // Forget it if type is already defined, unless it was only stubbed by an earlier mention.
    // TODO: complain if existing type is set up differently!
    // An IMPORTED one is declared again anyway, so `SP.SpellDeclarations.checkImportClashes()` can report it.
    const existing = match.scope.types?.get(type.value)
    if (existing && !(existing.parentScope instanceof P.ImportScope)) {
      // a stub, or left by an earlier parse of this statement -- see `P.TypeScope.sameStatement()`
      if (existing.stub || P.TypeScope.sameStatement(existing.declaredBy, match)) existing.claim(match, "list")
      return
    }
    match.scope.types?.add({ name: type.value, superType: "list", declaredBy: match })
  }
  getAST(match: P.MatchFor<this>): P.ASTStatementGroup {
    const { type, instanceType } = match.groups
    return new P.ASTStatementGroup(match, {
      statements: [
        new P.ASTClassDeclaration(match, {
          type: P.matchAST<P.ASTTypeExpression>(type),
          superType: new P.ASTTypeExpression(match, { raw: "list", name: "List" }),
          members: [
            new P.ASTStaticDefinition(match, {
              type: P.matchAST<P.ASTTypeExpression>(type),
              name: "instanceType",
              value: P.matchAST<P.ASTTypeExpression>(instanceType)
            })
          ]
        })
      ]
    })
  }
}
classes.addRule(create_list_type, {
  syntax: "create a type (named|called) {type} as a list of {instanceType:type}",
  tests: [
    {
      compileAs: "statement",
      tests: [
        [
          "create a type named hand as a list of cards",
          ["export class Hand extends List {", "  static instanceType = Card", "}"]
        ]
      ]
    }
  ]
})
// TODO: "{plural_type} are a list of ..."
classes.addRule(create_list_type, {
  syntax: "(a|an) {type} is a list of {instanceType:type}",
  tests: [
    {
      compileAs: "statement",
      tests: [["a deck is a list of cards", ["export class Deck extends List {", "  static instanceType = Card", "}"]]]
    }
  ]
})

////////////////
// ## `new_thing` rule
//    e.g. "a new thing"
////////////////

/**
 * `a new object` -- constructs `type` (optionally `with`/`where`/`whose` `props`).
 * - NOTE: we assume that all types take an object of properties????
 * - Compiles to `new Type(...)`, e.g. `a new Thing with a = 1, b = yes` => `new Thing({ a: 1, b: true })`.
 */
class new_thing extends SpellStatement<"type|props?"> {
  @proto static alias = "expression"

  getAST(match: P.MatchFor<this>): P.ASTNewInstanceExpression {
    const { type, props } = match.groups
    return new P.ASTNewInstanceExpression(match, {
      type: P.matchAST<P.ASTTypeExpression>(type),
      props: P.matchAST<P.ASTObjectLiteral>(props)
    })
  }
}
classes.addRule(new_thing, {
  syntax: "a new {type:known_type} ((with|where|whose) {props:object_literal_properties})?",
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
})

////////////////
// ## `new_list` rule
//    e.g. "a new list"
////////////////

/**
 * `a new list of <type>` -- constructs a `List`, optionally tagged with `instanceType`.
 * - Compiles to `new List(...)`, e.g. `a new list of Todos` => `new List({ instanceType: "Todo" })`.
 */
class new_list extends SpellStatement<"instanceType?"> {
  @proto static alias = "expression"

  getAST(match: P.MatchFor<this>): P.ASTNewInstanceExpression {
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
}
classes.addRule(new_list, {
  syntax: "a new (list|List) (of {instanceType:type}?)",
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
})

////////////////
// ## `create_thing` rule
//    e.g. "create a Thing"
////////////////

/**
 * `create a thing` -- same as `new_thing` above, worded with `create` instead of `a new`.
 * - This works as an expression OR a statement.
 * - NOTE: we assume that all types take an object of properties????
 * - TODO: in `statement` form, put into `it`???
 * - FIXME: `list`, `text`, etc don't follow these semantics???
 */
class create_thing extends SpellStatement<"type|props?"> {
  @proto static alias = ["expression", "statement"]

  getAST(match: P.MatchFor<this>): P.ASTNewInstanceExpression {
    const { type, props } = match.groups
    return new P.ASTNewInstanceExpression(match, {
      type: P.matchAST<P.ASTTypeExpression>(type),
      props: P.matchAST<P.ASTObjectLiteral>(props)
    })
  }
}
classes.addRule(create_thing, {
  syntax: "create (a|an) {type:known_type} ((with|where|whose) {props:object_literal_properties})?",
  tests: [
    {
      title: "creates normal objects properly",
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
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
      beforeEach(scope: P.Scope) {
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
})

////////////////
// ## `type_specifier_enum` rule
//    e.g. "as either red or black"
////////////////

/**
 * `as either red or black` / `as one of clubs, diamonds, hearts, spades` -- specifies a property's
 * allowed values as an enumeration, for use by `define_property_has` below.
 * - Compiles (via `getAST()`) to a `P.ASTEnumeration` array literal, e.g. `['red', 'black']`.
 */
class type_specifier_enum extends P.Sequence<"enumeration"> {
  @proto static alias = "type_specifier"

  getAST(match: P.MatchFor<this>): P.ASTEnumeration {
    const enumeration = match.groups.enumeration.items.map((item) => P.matchAST(item))
    return new P.ASTEnumeration(match, {
      enumeration,
      // Every item here comes from `identifier_list`, which only ever matches `known_variable`,
      // `constant` or `number` leaves -- all `Literal` subclasses whose `compile()` returns the
      // underlying primitive value, but the base `ASTNode.compile()` is typed as `unknown`.
      values: enumeration.map((literal) => literal.compile() as string | number)
    })
  }
}
classes.addRule(type_specifier_enum, {
  syntax: "as (either|one of) {enumeration:identifier_list}",
  tests: [
    {
      tests: [
        ["as either red or black", "['red', 'black']"],
        ["as one of clubs, diamonds, hearts, spades", "['clubs', 'diamonds', 'hearts', 'spades']"]
      ]
    }
  ]
})

////////////////
// ## `type_specifier_datatype` rule
//    e.g. "as a number"
////////////////

/**
 * `as a number` / `as an automobile` -- specifies a property's datatype as a primitive or known type.
 * - Compiles (via `getAST()`) directly to the `datatype`'s `TypeExpression`, e.g. `number` or `Automobile`.
 */
class type_specifier_datatype extends P.Sequence<"datatype"> {
  @proto static alias = "type_specifier"

  getAST(match: P.MatchFor<this>): P.ASTTypeExpression {
    return P.matchAST<P.ASTTypeExpression>(match.groups.datatype)
  }
}
classes.addRule(type_specifier_datatype, {
  syntax: "as (a|an)? {datatype:singular_type}",
  tests: [
    {
      tests: [
        ["as a number", "number"],
        ["as an automobile", "Automobile"]
      ]
    }
  ]
})

////////////////
// ## `type_specifier_instance` rule
//    e.g. "as a new thing"
////////////////

/**
 * `as a new thing` -- specifies a property's default/initializer value as a `new_thing` expression.
 * - Compiles (via `getAST()`) to the nested `NewInstanceExpression`, e.g. `new Thing()`.
 */
class type_specifier_instance extends P.Sequence<"new_thing"> {
  @proto static alias = "type_specifier"

  getAST(match: P.MatchFor<this>): P.ASTNewInstanceExpression {
    return P.matchAST<P.ASTNewInstanceExpression>(match.groups.new_thing)
  }
}
classes.addRule(type_specifier_instance, {
  syntax: "as {new_thing}",
  tests: [
    {
      tests: [
        ["as a new thing", "new Thing()"],
        ["as a new thing with a=1, b = true", "new Thing({ a: 1, b: true })"]
      ]
    }
  ]
})

////////////////
// ## `type_specifier_yes_or_no` rule
//    e.g. "as yes or no"
////////////////

/**
 * `as yes or no` / `as either true or false` -- specifies a property's datatype as a boolean.
 * - Compiles to a fixed `TypeExpression` with `name: "choice"` rather than a real `boolean` datatype --
 *   matches spell's `choice` vocabulary (see `type_specifier_enum`'s "either" wording too).
 */
class type_specifier_yes_or_no extends P.Sequence {
  @proto static alias = "type_specifier"

  getAST(match: P.MatchFor<this>): P.ASTTypeExpression {
    return new P.ASTTypeExpression(match, { raw: "yes or no", name: "choice" })
  }
}
classes.addRule(type_specifier_yes_or_no, {
  syntax: "as either? (yes or no|true or false)",
  tests: [{ tests: [["as yes or no", "choice"]] }]
})

////////////////
// ## `EnumerationRule` base class
//    e.g. "card suits", once "a card has a suit as one of clubs, diamonds, hearts, spades" made one
////////////////

/**
 * `Card Suits` / `card suits` -- an enumerated property's values, e.g. `Card.Suits`.
 * - Never registered as is:  `define_property_has` makes one per enumerated property, with
 *   `EnumerationRule.specialize({ of, classVariable })`.
 * - Reads ONLY its statics, so a project's declarations can rebuild it elsewhere -- see `P.Rule.specialize()`.
 */
export class EnumerationRule extends P.Literals {
  @proto static importableAs = "enumeration"
  @proto static priority = 20
  @proto static alias = "expression"

  /** Type the enumerated property belongs to, e.g. `Card`. */
  declare typeName: string
  /** Pluralized property name, e.g. `Suits` for `suit`. */
  declare groupName: string
  /** TYPE-ONLY: what `specialize()` accepts for this rule -- see `P.RuleStatics`. */
  declare readonly Props: EnumerationRuleProps

  /** TYPE-ONLY: what `specialize()` takes -- see `P.SpecializeWith`. */
  declare static readonly SpecializeWith: { of: string; classVariable: string }
  /**
   * Enumeration class variable `classVariable` of type `of`, e.g. `Card` + `Suits` => `Card_Suits`, matching
   * `Card Suits` / `card suits`.
   * - What a project's `SPELL: DECLARES` comment holds for us -- see `SP.SpellDeclarations`.
   */
  static specialize<T extends AbstractClass<P.Rule>>(this: T, declared: P.SpecializeWith<T>): T {
    const { of: typeName, classVariable: groupName } = declared as (typeof EnumerationRule)["SpecializeWith"]
    const literals = [
      [typeName, typeName.toLowerCase()],
      [groupName, groupName.toLowerCase()]
    ]
    const statics: P.RuleStatics<EnumerationRule> = {
      ruleName: `${typeName}_${groupName}`,
      typeName,
      groupName,
      literals
    }
    return super.specialize(statics, declared) as unknown as T
  }

  /**
   * What we write into our statement's `SPELL: DECLARES` comment -- see `P.Rule.declarationProps()`.
   * - No `syntax`:  we match our `literals`.
   */
  static declarationProps({ of, classVariable }: (typeof EnumerationRule)["SpecializeWith"]) {
    return { of, classVariable }
  }

  getAST(match: P.MatchFor<this>): P.ASTPropertyExpression {
    return new P.ASTPropertyExpression(match, {
      object: new P.ASTTypeExpression(match, { raw: this.typeName, name: this.typeName }),
      property: new P.ASTPropertyLiteral(match, this.groupName)
    })
  }
}

/** Props bag accepted by `EnumerationRule` -- `Literals`' own, plus the type + group it enumerates. */
type EnumerationRuleProps = Prettify<P.LiteralsProps & { typeName: string; groupName: string }>

////////////////
// ## `define_property_has` rule
//    e.g. "cards have a direction as either up or down"
////////////////

/**
 * `a card has a suit as one of clubs, diamonds, hearts, spades` / `todos have a title as text` -- declares
 * an instance property on `type`, optionally constrained/initialized by a `type_specifier`.
 * - `priority: 10` so this wins over other `{type} has|have ...` -ish statement rules.
 * - SIDE EFFECT: stubs `type` into `scope.types` if not yet declared -- see `P.TypeScope.getOrStub()`.
 * - SIDE EFFECT: when `specifier` is an enumeration, also adds a pluralized class variable (e.g. `Suits`)
 *   holding the raw values, adds string values to `scope.constants`, and registers an `EnumerationRule`
 *   so `Card Suits` / `card suits` resolve to that property -- its `/*! SPELL: DECLARES` comment says so, see
 *   `SP.SpellDeclarations.commentFor()`.
 * - Compiles to a reactive getter / setter pair in its class, its type declared in the class's schema -- see
 *   `P.ASTReactiveProperty` -- e.g. `a player has a name as text` =>
 *   `static { this.declareProp('name', { type: 'text' }) }` + `get name() { return this.getProp('name') }` +
 *   `set name(value) { this.setProp('name', value) }`
 * - An enumeration's values also go on the class, e.g. `static Suits = ['clubs', ...]` -- see `EnumerationRule`.
 */
class define_property_has extends SpellStatement<"type|property|specifier?"> {
  @proto static priority = 10
  @proto static alias = "statement"
  @proto static declares: P.DeclaresSpec = { kind: "property", name: "property", of: "type", detail: "specifier" }

  mutateScope(match: P.MatchFor<this>) {
    const { scope } = match
    const { type, property, specifier } = match.groups
    const specifierAST = specifier?.AST

    const typeName = type.value
    const typeScope = P.TypeScope.getOrStub(scope, typeName, match)
    const datatype = specifierAST instanceof P.ASTTypeExpression ? specifierAST.name : undefined
    typeScope.declareProperty(`${property.value}`, match, datatype)

    // If there is a specifier as enumerated values, add rules to match it
    if (specifierAST instanceof P.ASTEnumeration) {
      const groupName = pluralize(upperFirst(property.value))

      const { values } = specifierAST
      const varProps: P.ScopeVariableProps & { enumeration: Array<string | number> } = {
        name: groupName,
        enumeration: values,
        initializer: `[${values.join(", ")}]`,
        declaredBy: match
      }
      // Add variables to scope for lookup elsewhere
      typeScope.classVariables.add({ ...varProps })
      typeScope.variables.add({ ...varProps })

      // Add enumeration string values to scope as constants.
      values.forEach((value) => {
        if (typeof value === "string") scope.constants?.add({ name: value, declaredBy: match })
      })

      // Add multi-word identifier rule which returns enumeration, e.g. `card suits` or `Card Suits`.
      // `scope.addRule()` registers on the parser AND records the class + definition on the scope,
      // so `print Card suits` finds it via the `expression` alias and the scope can export it later.
      scope.addRule(EnumerationRule.specialize({ of: typeName, classVariable: groupName }), {}, match)
    }
  }
  getAST(match: P.MatchFor<this>): P.ASTStatementGroup {
    const { type, property } = match.groups
    const typeAST = P.matchAST<P.ASTTypeExpression>(type)
    const statements: P.ASTClassMember[] = []
    // what its setter warns about -- see `SC.PropCheck`
    const check = new P.ASTObjectLiteral(match)
    let initializer: P.ASTExpression | undefined

    const specifier = match.groups.specifier?.AST
    // Enumerated values as strings/numbers/etc, as a static on the class, e.g. `Card.Suits`
    if (specifier instanceof P.ASTEnumeration) {
      const name = pluralize(upperFirst(property.value))
      statements.push(new P.ASTStaticDefinition(match, { type: typeAST, name, value: specifier }))
      check.addProp("oneOf", new P.ASTPropertyExpression(match, { object: typeAST, property: name }))
    }
    // instance specifier:  a default, made once per instance
    else if (specifier instanceof P.ASTNewInstanceExpression) {
      initializer = specifier
    }
    // type
    else if (specifier) {
      // Only `type_specifier_datatype`/`type_specifier_yes_or_no` can produce a `specifier` that
      // reaches here, both of which return a `TypeExpression` -- not statically provable, since
      // `type_specifier`'s `getAST()` can only be typed as returning `ASTNode` in general.
      const typeExpression = specifier as P.ASTTypeExpression
      // checked at runtime by its class's name -- see `P.ASTTypeExpression.runtimeName`
      check.addProp("type", `'${typeExpression.runtimeName}'`)
    }

    statements.push(
      new P.ASTReactiveProperty(match, {
        type: typeAST,
        property: `${property.value}`,
        check: check.properties.length ? check : undefined,
        initializer
      })
    )
    return new P.ASTStatementGroup(match, { statements })
  }
}
classes.addRule(define_property_has, {
  syntax: "(a|an) {type:singular_type} has (a|an|a property) {property} {specifier:type_specifier}?",
  tests: [
    {
      compileAs: "block",
      tests: [
        [
          "a player has a name as text",
          [
            "Player.declareProp('name', { type: 'text' })",
            "Object.defineProperty(Player.prototype, 'name', {",
            "  get() { return this.getProp('name') },",
            "  set(value) { this.setProp('name', value) },",
            "  configurable: true",
            "})"
          ]
        ]
      ]
    },
    {
      title: "declares type's enumeration and property",
      beforeEach(scope: P.Scope) {
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
})
classes.addRule(define_property_has, {
  syntax: "{type:plural_type} have (a|an|a property) {property} {specifier:type_specifier}?",
  tests: [
    {
      compileAs: "block",
      tests: [
        [
          "cards have a direction as either up or down",
          [
            "Card.Directions = ['up', 'down']",
            "Card.declareProp('direction', { oneOf: Card.Directions })",
            "Object.defineProperty(Card.prototype, 'direction', {",
            "  get() { return this.getProp('direction') },",
            "  set(value) { this.setProp('direction', value) },",
            "  configurable: true",
            "})"
          ]
        ],
        [
          "todos have a title as text",
          [
            "Todo.declareProp('title', { type: 'text' })",
            "Object.defineProperty(Todo.prototype, 'title', {",
            "  get() { return this.getProp('title') },",
            "  set(value) { this.setProp('title', value) },",
            "  configurable: true",
            "})"
          ]
        ],
        [
          "todos have a property completed as yes or no",
          [
            "Todo.declareProp('completed', { type: 'choice' })",
            "Object.defineProperty(Todo.prototype, 'completed', {",
            "  get() { return this.getProp('completed') },",
            "  set(value) { this.setProp('completed', value) },",
            "  configurable: true",
            "})"
          ]
        ],
        [
          "todos have a property tags as a new list",
          [
            "Todo.declareProp('tags', { init: () => new List() })",
            "Object.defineProperty(Todo.prototype, 'tags', {",
            "  get() { return this.getProp('tags') },",
            "  set(value) { this.setProp('tags', value) },",
            "  configurable: true",
            "})"
          ]
        ]
      ]
    }
  ]
})

////////////////
// ## `the_property_of_a_thing` rule
//    e.g. "the color of a card"
////////////////

/**
 * `the color of a card` -- one of two `type_property` spellings consumed by `property_value_either` and
 * `property_value_getter` below.  No `getAST()`: callers read `match.groups.type`/`.property` directly.
 */
class the_property_of_a_thing extends P.Sequence<"property|type"> {
  @proto static alias = "type_property"
}
classes.addRule(the_property_of_a_thing, {
  syntax: "the {property} of (a|an) {type}"
})

////////////////
// ## `a_things_property` rule
//    e.g. "a cards color"
////////////////

/** `a cards color` -- the other `type_property` spelling, see `the_property_of_a_thing` above. */
class a_things_property extends P.Sequence<"type|property"> {
  @proto static alias = "type_property"
}
classes.addRule(a_things_property, {
  syntax: "(a|an) {type:plural_type} {property}"
})

////////////////
// ## `property_value_either` rule
//    e.g. "the color of a card is red if its suit is either diamonds or hearts"
////////////////

/**
 * `the color of a card is red if its suit is either diamonds or hearts (otherwise it is X)?` -- defines a
 * property getter whose value is conditional on `condition`.
 * - SIDE EFFECT: stubs `type` into scope (`P.TypeScope.getOrStub()`), and adds any bare constant `value`/`otherValue`
 *   to `scope.constants` if not already known.
 * - Compiles to a getter in its class that `if`s on `condition`, returning `otherValue`
 *   (or falling through) when absent.
 */
class property_value_either extends SpellStatement<PropertyValueEitherGroups> {
  @proto static alias = "statement"
  @proto static declares: P.DeclaresSpec = {
    kind: "property",
    name: "type_property.property",
    of: "type_property.type"
  }

  mutateScope(match: P.MatchFor<this>) {
    const { scope } = match
    const { value, otherValue, type_property } = match.groups
    const { type, property } = type_property.groups
    // make sure type is defined
    P.TypeScope.getOrStub(scope, type.value, match).declareProperty(`${property.value}`, match)
    // `is()` narrows `data` to what `SpellConstant` stashes on its matches.
    // Declare any unknown constant values, and record them on their matches for `SpellConstant.getAST()`.
    for (const constant of [value, otherValue]) {
      if (!constant?.is(SpellConstant)) continue
      const found = constant.data.scopeConstant
      if (found && found !== NONE) continue
      const known =
        scope.constants?.get(constant.raw!) ?? scope.constants?.add({ name: constant.raw!, declaredBy: match })[0]
      if (known) constant.data.scopeConstant = known
    }
  }
  getAST(match: P.MatchFor<this>): P.ASTPropertyDefinition {
    const { value, otherValue, type_property, condition } = match.groups
    const { type, property } = type_property.groups
    const ifAST = new P.ASTIfStatement(match, {
      condition: P.matchAST(condition),
      statements: new P.ASTReturnStatement(match, { value: P.matchAST(value) })
    })
    let getterBody: P.ASTStatement
    if (!otherValue) {
      getterBody = ifAST
    } else {
      getterBody = new P.ASTStatementGroup(match, {
        statements: [ifAST, new P.ASTReturnStatement(match, { value: P.matchAST(otherValue) })]
      })
    }
    return new P.ASTPropertyDefinition(match, {
      type: P.matchAST<P.ASTTypeExpression>(type),
      property: P.matchAST<P.ASTPropertyLiteral>(property),
      get: new P.ASTMethodDefinition(match, { body: getterBody })
    })
  }
}
classes.addRule(property_value_either, {
  syntax:
    "{type_property} is (value:{constant}|{expression}) if {condition:expression} (otherwise it is (otherValue:{constant}|{expression}))?",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.types?.add("card")
        scope.constants?.add("diamonds", "hearts", "clubs", "spades")
      },
      tests: [
        // is one of diamonds or hearts => is_one_of_list
        [
          "the color of a card is red if its suit is either diamonds or hearts",
          [
            "Object.defineProperty(Card.prototype, 'color', {",
            "  get() {",
            "    if (spellCore.includes(['diamonds', 'hearts'], this.suit)) { return 'red' }",
            "  },",
            "  configurable: true",
            "})"
          ]
        ],
        [
          "a cards color is black if its suit is either clubs or spades otherwise it is red",
          [
            "Object.defineProperty(Card.prototype, 'color', {",
            "  get() {",
            "    if (spellCore.includes(['clubs', 'spades'], this.suit)) { return 'black' }",
            "    return 'red'",
            "  },",
            "  configurable: true",
            "})"
          ]
        ]
      ]
    }
  ]
})

/**
 * Match groups for `property_value_either`'s `syntax` -- `type_property` nests its own `type`/`property`
 * groups, whichever `type_property` alternative matched (`the_property_of_a_thing`/`a_things_property`).
 */
type PropertyValueEitherGroups = P.GroupsFor<"type_property", P.Match<P.GroupsFor<"property|type">>> &
  P.GroupsFor<"value|condition|otherValue?">

////////////////
// ## `property_value_getter` rule
//    e.g. "the value of a card is:"
////////////////

/**
 * `the value of a card is:` -- defines a property getter whose body is an inline EXPRESSION or nested
 * block (`{expression_body}?`), with `its`/`it` mapped to `this` inside.
 * - `getNestedScopeForMatch()` maps `it`/`its` to `this` via `mapItTo`, so the body can say
 *   `return the first word of the name` instead of repeating `of the card`.
 * - Compiles to a getter in its class running the parsed body, e.g.
 *   `the value of a card is its name` => `get value() { return this.name }`.
 */
class property_value_getter extends SpellStatement<"property|type|body?"> {
  @proto static alias = "statement"
  // Its `mutateScope()` only records the property, which nothing parsed later reads:
  // editing a getter's body needn't re-parse the rest of the project.
  @proto static changesScope: P.ScopeChanges = "internal"
  @proto static declares: P.DeclaresSpec = { kind: "property", name: "property", of: "type" }

  /** SIDE EFFECT:  records the property on its type, for editors -- see `P.TypeScope.declareProperty()`. */
  mutateScope(match: P.MatchFor<this>) {
    const { type, property } = match.groups
    getKnownType(type).declareProperty(`${property.value}`, match)
  }
  /** Nested scope for the getter body -- maps `its`/`it` to `this` so the body can say `its name`. */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    const { type } = match.groups
    return new P.MethodScope({
      parentScope: match.scope,
      thisVar: getKnownType(type).instanceName,
      mapItTo: "this",
      declaredBy: match
    })
  }
  getAST(match: P.MatchFor<this>): P.ASTPropertyDefinition {
    const { type, property } = match.groups
    return new P.ASTPropertyDefinition(match, {
      type: P.matchAST<P.ASTTypeExpression>(type),
      property: P.matchAST<P.ASTPropertyLiteral>(property),
      get: new P.ASTMethodDefinition(match, {
        body: P.matchAST<MethodBody>(this.getBody(match))
      })
    })
  }
}
classes.addRule(property_value_getter, {
  syntax: "the {property} of (a|an) {type:known_type} is :? {expression_body}?",
  tests: [
    {
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        scope.compile("a card is a thing\na pile is a list of cards")
      },
      tests: [
        {
          input: "the value of a card is:",
          output: ["Object.defineProperty(Card.prototype, 'value', {", "  get() {},", "  configurable: true", "})"]
        },
        {
          input: "the value of a card is its name",
          output: [
            "Object.defineProperty(Card.prototype, 'value', {",
            "  get() {",
            "    return this.name",
            "  },",
            "  configurable: true",
            "})"
          ]
        },
        {
          input: ["the short-name of a card is:", "\treturn the first word of the name of the card"],
          output: [
            "Object.defineProperty(Card.prototype, 'short_name', {",
            "  get() {",
            "    return spellCore.getItemOf(this.name, 1)",
            "  },",
            "  configurable: true",
            "})"
          ]
        },
        {
          title: "Show error if both nestedBlock and inlineStatement",
          input: ["the short-name of a card is its name", "\treturn the first word of the name of the card"],
          output: [
            "Object.defineProperty(Card.prototype, 'short_name', {",
            "  get() {",
            "    return spellCore.getItemOf(this.name, 1)",
            "  },",
            "  configurable: true",
            "})",
            "/* PARSE ERROR: Got both inline statement and nested block */"
          ]
        }
      ]
    }
  ]
})

/** What `P.ASTMethodDefinition`'s `body` prop accepts. */
type MethodBody = P.ASTStatementBlock | P.ASTStatement | P.ASTExpression

////////////////
// ## `QuotedPropertyRule` base class
//    e.g. "the card is the queen of spades", once 'a card "is the (rank) of (suits)" ...' made one
////////////////

/**
 * `is not? the queen of spades` -- calls a quoted property formula's generated method, e.g.
 * `card.is_the_$rank_of_$suits('queen', 'spades')`.
 * - Never registered as is:  `quoted_property_formula` makes one per formula, with
 *   `QuotedPropertyRule.specialize({ output, ruleData })`.
 * - Reads ONLY its statics, so a project's declarations can rebuild it elsewhere -- see `P.Rule.specialize()`.
 */
export class QuotedPropertyRule extends InfixOperatorSuffix {
  @proto static importableAs = "quoted_property"
  /** A user's alias wins over a built-in suffix matching the same words, e.g. `is the queen of spades`. */
  @proto static priority = 20
  @proto static precedence = Precedence.comparison

  /** Generated method to call, e.g. `is_the_$rank_of_$suits`. */
  declare methodName: string
  /** One entry per `(var)` placeholder -- see `QuotedPropertyFormulaBits`. */
  declare ruleData: QuotedPropertyFormulaBits["ruleData"]
  /** TYPE-ONLY: what `specialize()` accepts for this rule -- see `P.RuleStatics`. */
  declare readonly Props: QuotedPropertyRuleProps

  /** TYPE-ONLY: what `specialize()` takes -- see `P.SpecializeWith`. */
  declare static readonly SpecializeWith: { output: string; values: Record<string, Array<string | number>> }
  /**
   * Calls generated method `output`, e.g. `is_a_$suit` -- also our `ruleName`.
   * - `values`:  each `(var)` placeholder's enumerated values, in order, e.g. `{ suit: ["'clubs'", ...] }` --
   *   `ruleData` is worked out from them, see `placeholderData()`.
   * - What a project's `SPELL: DECLARES` comment holds for us -- see `SP.SpellDeclarations`.
   */
  static specialize<T extends AbstractClass<P.Rule>>(this: T, declared: P.SpecializeWith<T>): T {
    const { output, values } = declared as (typeof QuotedPropertyRule)["SpecializeWith"]
    const ruleData = Object.entries(values).map(([instanceVar, varValues]) => placeholderData(instanceVar, varValues))
    const statics: P.RuleStatics<QuotedPropertyRule> = { ruleName: output, methodName: output, ruleData }
    return super.specialize(statics, declared) as unknown as T
  }

  /** What we write into our statement's `SPELL: DECLARES` comment -- see `P.Rule.declarationProps()`. */
  static declarationProps(
    { output, values }: (typeof QuotedPropertyRule)["SpecializeWith"],
    syntax: string | undefined
  ) {
    return { syntax, output, values }
  }

  /** Map each matched placeholder word/number to its compiled enumeration value or literal. */
  compileASTExpression(
    match: P.Match,
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
          const { enumeration, values } = this.ruleData[index]!
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
    return new P.ASTScopedMethodInvocation(match, {
      thing: lhs!,
      methodName: this.methodName,
      args
    })
  }
}

/** Props bag accepted by `QuotedPropertyRule` -- the generated method, and how to map each placeholder. */
type QuotedPropertyRuleProps = Prettify<
  SpellExpressionProps & { methodName: string; ruleData: QuotedPropertyFormulaBits["ruleData"] }
>

/**
 * `ruleData` entry for placeholder `(instanceVar)` over enumerated `values`, e.g. `(suit)` over `["'clubs'", ...]`.
 * - `enumeration` is `values` unquoted, inflected to match the placeholder, e.g. `club` for `(suit)`
 *   but `clubs` for `(suits)`.
 */
function placeholderData(
  instanceVar: string,
  values: Array<string | number>
): QuotedPropertyFormulaBits["ruleData"][number] {
  const isSingular = singularize(instanceVar) === instanceVar
  const inflector = isSingular ? singularize : pluralize
  const enumeration = values.map((value) =>
    typeof value === "string" ? inflector(value.replace(/^'(.*)'$/, "$1")) : value
  )
  return { isSingular, instanceVar, enumeration, values }
}

////////////////
// ## `quoted_property_formula` rule
//    e.g. 'a card "is a (rank)" for its ranks'
////////////////

/**
 * `a card "is a (rank) of (suits)" for its ranks and its suits` -- defines a templated boolean method
 * from a quoted phrase with `(placeholder)`s, plus a matching quoted-expression rule to call it,
 * e.g. `a card is the queen of spades`.
 * - NOTE: the first word in quotes must be `"is"` !!
 * - `priority: 10` so this wins over plainer statement rules that could otherwise partially match.
 * - SIDE EFFECT: `getBits()` derives (and caches in `match.data.bits`) rulex `syntax`, per-placeholder
 *   `ruleData`, `vars` and the generated `property` name, consumed by `mutateScope()`/`getAST()` below.
 * - SIDE EFFECT: `mutateScope()` registers a `QuotedPropertyRule` for the quoted phrase,
 *   e.g. `is (not)? a queen`, so it can be used like `card is a club`.
 * - Compiles to an instance method testing each placeholder against its property, e.g. `a card "is the
 *   (rank) of (suits)" for its ranks and its suits` => a `value(rank, suit)` method returning
 *   `this.rank === rank && this.suit === suit`.
 */
class quoted_property_formula extends SpellStatement<"type|alias|sources", QuotedPropertyFormulaMatchData> {
  @proto static priority = 10
  @proto static alias = "statement"
  @proto static declares: P.DeclaresSpec = { kind: "method", name: "alias", of: "type" }

  /** Reject the match unless `alias`'s first quoted word is `"is"` -- see rule NOTE above. */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    // If first word of `alias` is not `is`, forget it
    const alias = JSON.parse(match.groups.alias.value).split(" ")
    if (alias[0] !== "is") return undefined
    return match
  }

  /** Compute (and cache in `match.data.bits`) `bits` for making rules and AST nodes -- see the type. */
  getBits(match: P.MatchFor<this>): QuotedPropertyFormulaBits {
    return (match.data.bits ??= this.computeBits(match))
  }

  /** Actual work for `getBits()` -- see rule SIDE EFFECTs above. */
  private computeBits(match: P.MatchFor<this>): QuotedPropertyFormulaBits {
    const { groups } = match
    const alias = groups.alias.value
    const type = groups.type.value
    const sources = groups.sources.items

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
        vars.push(singularize(instanceVar))

        // Try to find the enumeration
        // NOTE: currently this only works for an enumeration defined on the type!!!
        const propertyName = (sources[sourceNum]?.groups?.property as P.Match | undefined)?.value
        const variable = match.scope.types?.get(type)?.variables.get(propertyName)
        const enumeration = variable?.enumeration
        // console.warn({ type, Type: scope.types.get(type), propertyName, variable, enumeration })
        // set up enumeration matcher
        if (variable && enumeration) {
          const placeholder = placeholderData(instanceVar, variable.enumerationValues || enumeration)
          ruleData.push(placeholder)
          syntaxParts.push(`(expression:${placeholder.enumeration.join("|")})`)
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
    // `is` => every form of it, e.g. `isn't`, which negates -- see `Negatable`
    syntaxParts.splice(0, 1, "{operator:is}")
    const syntax = syntaxParts.join(" ")
    return { type, syntax, ruleData, vars, property }
  }

  /** Register the quoted-phrase's generated `expression_suffix` rule -- see rule SIDE EFFECTs above. */
  mutateScope(match: P.MatchFor<this>) {
    const { syntax, property, ruleData } = this.getBits(match)

    // Create an expression suffix to match the quoted statement, e.g. `is not? a queen`.
    // See `scope.addRule()` -- registers on the parser and records the pair for export.
    match.scope.addRule(
      QuotedPropertyRule.specialize({
        output: property,
        values: Object.fromEntries(ruleData.map(({ instanceVar, values }) => [instanceVar, values]))
      }),
      { syntax },
      match
    )
  }

  getAST(match: P.MatchFor<this>): P.ASTStatementGroup {
    const { type } = match.groups
    const { vars, property } = this.getBits(match)
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
      new P.ASTPropertyDefinition(match, {
        type: P.matchAST<P.ASTTypeExpression>(type),
        property,
        method: new P.ASTMethodDefinition(match, {
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
}
classes.addRule(quoted_property_formula, {
  syntax: "(a|an) {type} {alias:text} for [sources:(its {property}) and]",
  tests: [
    {
      beforeEach(scope: P.Scope) {
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
          ["Card.prototype.is_a_$rank = function (rank) {", "  return this.rank === rank", "}"]
        ],
        [
          'a card "is the (rank) of (suits)" for its ranks and its suits',
          [
            "Card.prototype.is_the_$rank_of_$suits = function (rank, suit) {",
            "  return this.rank === rank && this.suit === suit",
            "}"
          ]
        ]
      ]
    },
    {
      beforeEach(scope: P.Scope) {
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
})

/**
 * Extra `bits` `quoted_property_formula` derives (and caches in `match.data.bits` via `getBits()`) to hand
 * off from there to `mutateScope()`/`getAST()`.
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

/** What `quoted_property_formula` stashes in `match.data`. */
type QuotedPropertyFormulaMatchData = {
  /** Cached result of `getBits()` -- see the type above. */
  bits?: QuotedPropertyFormulaBits
}
