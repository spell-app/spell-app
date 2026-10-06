/**
 * Rules for classes -- declaring types (`is a`, `is a list of`), constructing instances (`a new`,
 * `create`), declaring/deriving instance properties (`has`, `is red if`, `is:`), and templated boolean
 * methods generated from quoted phrases (`"is a (rank)"`).
 * - `type_specifier_*` rules are the `as ...` clauses `define_property_has` accepts after a property
 *   name, e.g. `as either red or black` / `as a number` / `as a new thing` / `as yes or no`.
 * - `the_property_of_a_thing` / `a_things_property` are the two `type_property` spellings shared by
 *   `property_value_either` / `property_value_getter`.
 */
import { NONE, instanceCase, pluralize, proto, singularize, typeCase, upperFirst } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"
import { Priority, declaredPrefix } from "./rules.types"
import { SpellStatement } from "./Statement"
import { getKnownType } from "./types"
import { InfixOperatorSuffix, Precedence, SpellExpression, type SpellExpressionProps } from "./expressions"
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
// ## `TypeDeclaration` base class
//    e.g. base for `create_type`, `create_list_type`:  "a card is a thing where:" + a bulleted body
////////////////

/**
 * A statement declaring a type -- which may take an OUTLINE body:  `a card is a thing where:`, then indented
 * lines all about cards, e.g. `- it has a deck` (plan doc `outline-spell`).
 * - The body's scope is a `P.SubjectScope` about the type:  `it` / `its` there mean it -- `subject_it`,
 *   `subject_its` -- except inside a method or getter, where `it` is the instance.
 * - `flatBody`:  the body compiles beside the class, as if its lines were written out at the top level,
 *   so its members are hoisted into the class as usual.
 * - `where:`, `with:` and a bare `:` all open the body (plan doc Q7).  See `TYPE_BODY_SYNTAX`.
 */
class TypeDeclaration<Groups extends string, MatchData extends P.AnyMatchData = P.AnyMatchData> extends SpellStatement<
  Groups,
  MatchData
> {
  @proto static priority = Priority.declaration
  @proto static alias = "statement"
  @proto static flatBody = true

  /** Our body is all about the type we declare -- see class docs. */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.SubjectScope {
    // generic `Groups`:  TS can't see every subclass has a `type` group
    const { groups, scope } = match as unknown as P.Match<{ type: P.Match }>
    return new P.SubjectScope({ parentScope: scope, subject: `${groups.type.value}`, declaredBy: match as P.Match })
  }
}

/** How a type declaration ends when it takes an outline body:  `where:`, `with:` or `:`, then the body. */
const TYPE_BODY_SYNTAX = "(where|with)? : {nested_statements}?"

////////////////
// ## `create_type` rule
//    e.g. "a card is a thing"
////////////////

/**
 * `a card is a thing` -- declares `type` as a new class extending `superType`.
 * - `Priority.declaration`, so this wins over other `{type} is {type}` -ish statement rules.
 * - SIDE EFFECT: adds `type` to `scope.types`, unless it's already defined (no redefinition/merge).
 * - Compiles to an exported class declaration, e.g. `a card is a thing` => `export class Card extends Thing {}`.
 *   Another project reaches it by `import`ing it -- no globals.
 */
class create_type extends TypeDeclaration<"type|superType|body?"> {
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
classes.addRule(create_type, {
  syntax: `(a|an) {type} is (a|an) {superType:type} ${TYPE_BODY_SYNTAX}`,
  tests: [
    {
      compileAs: "block",
      tests: [
        ["a card is a thing where:", "export class Card extends Thing {}"],
        ["a card is a thing:", "export class Card extends Thing {}"],
        [
          ["a card is a thing with:", "\t- it has a rank as a number"],
          [
            "export class Card extends Thing {",
            "  static { this.declareProp('rank', { type: 'number' }) }",
            "  get rank() { return this.getProp('rank') }",
            "  set rank(value) { this.setProp('rank', value) }",
            "}"
          ]
        ]
      ]
    }
  ]
})
classes.addRule(create_type, {
  syntax: "(a|an) {type:quoted_type} is (a|an) {superType:type}",
  tests: [{ compileAs: "statement", tests: [['a "card" is a thing', "export class Card extends Thing {}"]] }]
})
classes.addRule(create_type, {
  syntax: `(a|an) {type:quoted_type} is (a|an) {superType:type} ${TYPE_BODY_SYNTAX}`,
  tests: [{ compileAs: "block", tests: [['a "card" is a thing where:', "export class Card extends Thing {}"]] }]
})

////////////////
// ## `create_list_type` rule
//    e.g. "a deck is a list of cards"
////////////////

/**
 * `a deck is a list of cards` or `create a type called Deck as a list of cards` -- declares `type` as a
 * new class extending `List`, with its `instanceType` set to `instanceType`.
 * - `Priority.declaration`, so this wins over the plainer `create_type` rule above for the `is a list of` form.
 * - SIDE EFFECT: adds `type` to `scope.types` (superType `"list"`), unless already defined --
 *   with its `itemType`, e.g. `Card`, so `the first card of the deck` knows it's a card.
 * - Compiles to a class declaration extending `List` with a static `instanceType`,
 *   e.g. `a deck is a list of cards` => `export class Deck extends List {` + `static instanceType = Card` + `}`.
 * - A card in at most ONE pile at a time:  `a card belongs to one pile`, below.
 */
class create_list_type extends TypeDeclaration<"type|instanceType|body?", { itemTypeBelow?: boolean }> {
  @proto static declares: P.DeclaresSpec = { kind: "type", name: "type", detail: "instanceType" }

  /**
   * Notes whether what it holds is declared BELOW us, e.g. `a deck is a list of cards` above `a card is a thing`:
   * then its class is read when used -- `static get instanceType() { return Card }` -- as `Card` isn't defined yet.
   * - A value kind on us, e.g. the deck's `"suits" as one of ...`, is why:  the card says `its "suit" is a suit`,
   *   so the deck comes first (plan doc `outline-spell`, P2).
   */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const { scopeType } = (match.groups.instanceType as P.Match<P.MatchGroups, { scopeType?: unknown }>).data
    if (scopeType instanceof P.TypeScope && scopeType.stub) match.data.itemTypeBelow = true
    return match
  }

  /** SIDE EFFECT:  declares our type -- see class docs. */
  mutateScope(match: P.MatchFor<this>) {
    const { type, instanceType } = match.groups
    const itemType = SP.typeName(`${instanceType.value}`)
    // Forget it if type is already defined, unless it was only stubbed by an earlier mention.
    // TODO: complain if existing type is set up differently!
    // An IMPORTED one is declared again anyway, so `SP.SpellDeclarations.checkImportClashes()` can report it.
    const existing = match.scope.types?.get(type.value)
    if (existing && !(existing.parentScope instanceof P.ImportScope)) {
      // a stub, or left by an earlier parse of this statement -- see `P.TypeScope.sameStatement()`
      if (existing.stub || P.TypeScope.sameStatement(existing.declaredBy, match)) {
        existing.claim(match, "list", { itemType })
      }
      return
    }
    match.scope.types?.add({ name: type.value, superType: "list", itemType, declaredBy: match })
  }
  getAST(match: P.MatchFor<this>): P.ASTStatementGroup {
    const { type, instanceType } = match.groups
    const typeAST = P.matchAST<P.ASTTypeExpression>(type)
    const value = P.matchAST<P.ASTTypeExpression>(instanceType)
    // declared below us:  read when used -- see `parse()`
    const members: P.ASTClassMember[] = match.data.itemTypeBelow
      ? [
          new P.ASTStaticMethod(match, {
            type: typeAST,
            name: "instanceType",
            getter: true,
            method: new P.ASTMethodDefinition(match, { body: value })
          })
        ]
      : [new P.ASTStaticDefinition(match, { type: typeAST, name: "instanceType", value })]
    const superType = new P.ASTTypeExpression(match, { raw: "list", name: "List" })
    return new P.ASTStatementGroup(match, {
      statements: [new P.ASTClassDeclaration(match, { type: typeAST, superType, members })]
    })
  }
}
classes.addRule(create_list_type, {
  syntax: "create a type (named|called) {type} as (a|an) list of {instanceType:type}",
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
  syntax: "(a|an) {type} is (a|an) list of {instanceType:type}",
  tests: [
    {
      compileAs: "statement",
      tests: [["a deck is a list of cards", ["export class Deck extends List {", "  static instanceType = Card", "}"]]]
    }
  ]
})
classes.addRule(create_list_type, {
  syntax: `(a|an) {type} is (a|an) list of {instanceType:type} ${TYPE_BODY_SYNTAX}`,
  tests: [
    {
      compileAs: "block",
      tests: [
        ["a deck is a list of cards with:", ["export class Deck extends List {", "  static instanceType = Card", "}"]]
      ]
    }
  ]
})
classes.addRule(create_list_type, {
  syntax: "(a|an) {type:quoted_type} is (a|an) list of {instanceType:type}",
  tests: [
    {
      compileAs: "statement",
      tests: [
        ['a "deck" is a list of cards', ["export class Deck extends List {", "  static instanceType = Card", "}"]]
      ]
    }
  ]
})
classes.addRule(create_list_type, {
  syntax: `(a|an) {type:quoted_type} is (a|an) list of {instanceType:type} ${TYPE_BODY_SYNTAX}`,
  tests: [
    {
      compileAs: "block",
      tests: [
        ['a "deck" is a list of cards with:', ["export class Deck extends List {", "  static instanceType = Card", "}"]]
      ]
    }
  ]
})

////////////////
// ## `belongs_to_one` rule
//    e.g. "a card belongs to one pile"
////////////////

/**
 * `a card belongs to one pile` -- a card is in at most ONE pile at a time (plan doc D7, D8, Q22):
 * - "pile" means the pile FAMILY:  `Pile` and every sub-type of it, e.g. `a tableau is a pile`.
 *   Adding a card to one takes it out of the other.
 * - A list outside the family, e.g. `a deck is a list of cards`, stays outside:
 *   a card can be in the deck AND one pile.
 * - Both types MUST be declared ABOVE, e.g. `a pile is a list of cards`:
 *   what we compile to needs both classes.  A type only mentioned so far (a stub) is refused, as is
 *   a list type of spell's own, e.g. `one list`:  it'd make every list hold a card once.
 * - SIDE EFFECT:  the item type gains a READ-ONLY member naming the list type, `the pile of a card`:
 *   the pile holding it, or nothing.  Declared by THIS line -- see `P.TypeScope.declareOwnerMember()`.
 *   - A built-in item type, e.g. `a thing belongs to one bag`, gets NO member:
 *     it would go on a type every project shares.  Its lists still hold each OBJECT once.
 * - Compiles to two patches, run where we are, after both classes:
 *   - `Pile.exclusive = true`:  the runtime `List` keeps who holds each item
 *   - the member, `Object.defineProperty(Card.prototype, 'pile', { get() { return Pile.ownerOf(this) } ... })`
 *   - NEVER hoisted into the classes:  the member must win over any accessor an earlier statement gave it,
 *     e.g. `set the pile of the card to ...` above us.
 * - `a card can belong to many piles` is the opposite:  see `can_belong_to_many`.
 */
class belongs_to_one extends SpellStatement<"type|list"> {
  @proto static priority = Priority.declaration
  @proto static alias = "statement"
  @proto static declares: P.DeclaresSpec = { kind: "property", name: "list", of: "type" }

  /** Refused unless both types are declared above, and `list` is a list type of the project's -- see class docs. */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const { type, list } = match.groups
    const sentence = `"${match.inputText.trim()}"`
    for (const [word, example] of [
      [type, `a ${type.raw} is a thing`],
      [list, `a ${list.raw} is a list of ${pluralize(`${type.raw}`)}`]
    ] as const) {
      const declared = belongs_to_one.typeOf(word)
      if (!declared || declared.stub) {
        return SpellStatement.refuse(match, `Can't say ${sentence} yet:  declare "${example}" above it`)
      }
    }
    const listType = belongs_to_one.typeOf(list)!
    if (SP.isBuiltInTypeScope(listType)) {
      return SpellStatement.refuse(match, `Can't say ${sentence}:  every list would hold a ${type.raw} once`)
    }
    if (!listType.isA("list")) {
      return SpellStatement.refuse(match, `Can't say ${sentence}:  a ${list.raw} isn't a list`)
    }
    return match
  }

  /** SIDE EFFECT:  the item type's member naming the list type -- not on a built-in type.  See class docs. */
  mutateScope(match: P.MatchFor<this>) {
    const { type, list } = match.groups
    const itemType = getKnownType(type)
    if (!SP.isBuiltInTypeScope(itemType)) getKnownType(list).declareOwnerMember(itemType, match)
  }

  getAST(match: P.MatchFor<this>): P.ASTStatementGroup {
    const { type, list } = match.groups
    const listAST = P.matchAST<P.ASTTypeExpression>(list)
    const exclusive = new P.ASTStaticDefinition(match, {
      type: listAST,
      name: "exclusive",
      value: new P.ASTBooleanLiteral(match, true)
    })
    const statements: P.ASTStatement[] = [new P.ASTPatchedMember(match, { member: exclusive })]
    if (!P.isBuiltInType(SP.typeName(`${type.value}`))) {
      statements.push(belongs_to_one.ownerMemberAST(match, P.matchAST<P.ASTTypeExpression>(type), listAST))
    }
    return new P.ASTStatementGroup(match, { statements })
  }

  /** What type word `word` names, as `parse()` looked it up -- `undefined` if nothing does yet. */
  private static typeOf(word: P.Match): P.TypeScope | undefined {
    const { scopeType } = word.data as { scopeType?: unknown }
    return scopeType instanceof P.TypeScope ? scopeType : undefined
  }

  /**
   * The item type's member naming the list type, patched on,
   * e.g. `Object.defineProperty(Card.prototype, 'pile', { get() { return Pile.ownerOf(this) }, ... })`.
   * - Named as `declareOwnerMember()` names it, e.g. `stock_pile` for `a stock-pile`.
   */
  static ownerMemberAST(
    match: P.MatchFor<belongs_to_one>,
    itemAST: P.ASTTypeExpression,
    listAST: P.ASTTypeExpression
  ): P.ASTPatchedMember {
    const owner = new P.ASTScopedMethodInvocation(match, {
      thing: listAST,
      methodName: "ownerOf",
      args: [new P.ASTThisLiteral(match)]
    })
    return new P.ASTPatchedMember(match, {
      member: new P.ASTPropertyDefinition(match, {
        type: itemAST,
        property: instanceCase(listAST.runtimeName),
        get: new P.ASTMethodDefinition(match, { body: new P.ASTReturnStatement(match, { value: owner }) })
      })
    })
  }
}
classes.addRule(belongs_to_one, {
  syntax: "(a|an) {type} belongs to one {list:type}",
  tests: [
    {
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        scope.parse(["a card is a thing", "a pile is a list of cards", "a bag is a list of things"].join("\n"), "block")
      },
      tests: [
        [
          "a card belongs to one pile",
          [
            "Pile.exclusive = true",
            "Object.defineProperty(Card.prototype, 'pile', {",
            "  get() {",
            "    return Pile.ownerOf(this)",
            "  },",
            "  configurable: true",
            "})"
          ]
        ],
        {
          title: "a built-in item type:  no member, it'd go on a type every project shares",
          input: "a thing belongs to one bag",
          output: "Bag.exclusive = true"
        },
        {
          title: "both types MUST be declared above",
          input: "a card belongs to one hand",
          output: `/* PARSE ERROR: Can't say "a card belongs to one hand" yet:  declare "a hand is a list of cards" above it */`
        },
        {
          title: "the list type MUST be a list of the project's",
          input: ["a card belongs to one list", "a card belongs to one card"],
          output: [
            `/* PARSE ERROR: Can't say "a card belongs to one list":  every list would hold a card once */`,
            `/* PARSE ERROR: Can't say "a card belongs to one card":  a card isn't a list */`
          ]
        }
      ]
    }
  ]
})
// in an outline body:  `- it belongs to a deck` -- tests in `parserTests/outline.test.ts`
classes.addRule(belongs_to_one, { syntax: "{type:subject_it} belongs to (one|a|an) {list:type}" })

////////////////
// ## `can_belong_to_many` rule
//    e.g. "a card can belong to many piles"
////////////////

/**
 * `a card can belong to many piles` -- the opposite of `a card belongs to one pile`:
 * what a list does anyway, so it compiles to nothing.  It says so for a reader (plan doc Q22).
 */
class can_belong_to_many extends SpellStatement<"type|list"> {
  @proto static priority = Priority.declaration
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTStatementGroup {
    return new P.ASTStatementGroup(match, { statements: [] })
  }
}
classes.addRule(can_belong_to_many, {
  syntax: "(a|an) {type:known_type} can belong to many {list:known_type}",
  tests: [
    {
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        scope.parse(["a card is a thing", "a pile is a list of cards"].join("\n"), "block")
      },
      tests: [["a card can belong to many piles", ""]]
    }
  ]
})

////////////////
// ## `list_guard` rule
//    e.g. "a pile can take a card if: it is empty"
////////////////

/**
 * What a list type takes, or gives up, when something MOVES (plan doc Q23 - Q25):
 * - `a tableau can (add|take) a card if: ...`
 * - `a stock-pile can (release|remove|give up|let go of) a card if: ...`
 * - `a foundation can never (release|remove|give up|let go of) a card` -- always no
 * - Its body answers yes or no:  an inline expression, or an indented block which `return`s.
 *   `the card` is the card moving;  `it`, `its` and `the tableau` are the list.
 * - Compiles to a method of the list type's class, overriding `List`'s yes:  `canTake(card) {...}` or
 *   `canGiveUp(card) {...}`.  A sub-type inherits it, unless it says its own.
 * - Only a move asks, e.g. `move the card to the tableau` -- see `list_move`.
 *   `add`, `remove` and `clear` never do:  dealing, gathering cards back.
 */
class list_guard extends SpellStatement<"type|verb|item|body?|never?"> {
  @proto static priority = Priority.declaration
  @proto static alias = "statement"

  /** The method we define, e.g. `can take a card` of `tableau` -- for editors' symbol lists. */
  getDeclaration(match: P.MatchFor<this>): P.Declaration {
    const { type, never, verb, item } = match.groups
    return {
      kind: "method",
      name: `can ${never ? "never " : ""}${verb.raw} a ${item.raw}`,
      nameMatch: verb,
      of: `${type.value}`,
      detail: `${list_guard.methodName(match)}()`
    }
  }

  /** Nested scope for the body:  the item as its own word, e.g. `the card`, and `it` / `its` as the list. */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    const listType = getKnownType(match.groups.type)
    const itemType = SP.typeName(`${match.groups.item.value}`)
    return new P.MethodScope({
      parentScope: match.scope,
      thisVar: listType.instanceName,
      mapItTo: "this",
      itDatatype: SP.typeName(listType.name),
      args: [new P.ScopeVariable({ name: instanceCase(itemType), datatype: itemType })],
      declaredBy: match
    })
  }

  getAST(match: P.MatchFor<this>): P.ASTPropertyDefinition {
    const { type, never, item } = match.groups
    const arg = new P.ASTVariableExpression(match, { name: instanceCase(SP.typeName(`${item.value}`)) })
    const body = never
      ? new P.ASTReturnStatement(match, { value: new P.ASTBooleanLiteral(match, false) })
      : P.matchAST<MethodBody>(this.getBody(match))
    return new P.ASTPropertyDefinition(match, {
      type: P.matchAST<P.ASTTypeExpression>(type),
      property: list_guard.methodName(match),
      method: new P.ASTMethodDefinition(match, { args: [arg], body, datatype: "choice" })
    })
  }

  /** `canTake` for `add` / `take`, else `canGiveUp` -- the `List` method we override. */
  static methodName(match: P.MatchFor<list_guard>): "canTake" | "canGiveUp" {
    return ["add", "take"].includes(`${match.groups.verb.value}`) ? "canTake" : "canGiveUp"
  }
}
classes.addRule(list_guard, {
  syntax: "(a|an) {type:known_type} can (verb:add|take) (a|an) {item:type} if :? {expression_body}?",
  tests: [
    {
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        scope.parse(["a card is a thing", "a pile is a list of cards"].join("\n"), "block")
      },
      tests: [
        [
          "a pile can take a card if: it is empty",
          ["Pile.prototype.canTake = function (card) {", "  return spellCore.isEmpty(this)", "}"]
        ],
        {
          title: "an indented body, `the pile` and `the card`",
          input: [
            "a pile can add a card if:",
            "\tif the pile is empty return yes",
            "\treturn the card is not the last card of the pile"
          ],
          output: [
            "Pile.prototype.canTake = function (card) {",
            "  if (spellCore.isEmpty(this)) { return true }",
            "  return (card != spellCore.getItemOf(this, -1))",
            "}"
          ]
        }
      ]
    }
  ]
})
classes.addRule(list_guard, {
  syntax:
    "(a|an) {type:known_type} can (verb:release|remove|give up|let go of) (a|an) {item:type} if :? {expression_body}?",
  tests: [
    {
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        scope.parse(["a card is a thing", "a pile is a list of cards"].join("\n"), "block")
      },
      tests: [
        [
          "a pile can give up a card if: the card is its last card",
          ["Pile.prototype.canGiveUp = function (card) {", "  return (card == spellCore.getItemOf(this, -1))", "}"]
        ],
        ["a pile can let go of a card if: yes", ["Pile.prototype.canGiveUp = function (card) {", "  return true", "}"]]
      ]
    }
  ]
})
classes.addRule(list_guard, {
  syntax: "(a|an) {type:known_type} can (never:never) (verb:release|remove|give up|let go of) (a|an) {item:type}",
  tests: [
    {
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        scope.parse(["a card is a thing", "a pile is a list of cards"].join("\n"), "block")
      },
      tests: [
        ["a pile can never let go of a card", ["Pile.prototype.canGiveUp = function (card) {", "  return false", "}"]]
      ]
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

  /** The type it makes, e.g. `Card`, `thing`. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return SP.typeName(`${match.groups.type.value}`)
  }

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

  /** A `list`, or a `list of` what it says, e.g. `list of todos`. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    const { instanceType } = match.groups
    return instanceType ? P.listOf(SP.typeName(`${instanceType.value}`)) : "list"
  }

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
  syntax: "a new (list|List) of {instanceType:type}?",
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

  /** The type it makes, e.g. `Card`, `thing`. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return SP.typeName(`${match.groups.type.value}`)
  }

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
    // a range spread into its numbers -- see `number_range`
    const enumeration = P.matchAST<P.ASTListExpression>(match.groups.enumeration).items ?? []
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

  /** The type it names, in spell's words, e.g. `number`, `Automobile`. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return SP.typeName(`${match.groups.datatype.value}`)
  }

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

  /** The type it makes, e.g. `thing` for `as a new thing`. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return match.groups.new_thing.datatype
  }

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
  @proto static datatype = "choice"

  getAST(match: P.MatchFor<this>): P.ASTTypeExpression {
    return new P.ASTTypeExpression(match, { raw: "yes or no", name: "choice" })
  }
}
classes.addRule(type_specifier_yes_or_no, {
  syntax: "as either? (yes or no|true or false)",
  tests: [{ tests: [["as yes or no", "choice"]] }]
})

////////////////
// ## `class_member` rule
//    e.g. "card suits", once "a card has a suit as one of clubs, diamonds, hearts, spades" declared `Suits`
////////////////

/**
 * `{type} {member words}` -- a class variable of a known type, e.g.:
 * - `card suits` / `Card Suits` ~== `Card.Suits`
 * - `bank-account account-types` ~== `Bank_Account.Account_types`
 * - ONE rule for every type:  the member resolves through `type`'s `classVariables`,
 *   e.g. `Suits` as `cards have a suit as one of ...` declares it -- see `define_property_has`.
 *   Was a rule per enumeration.
 * - The LONGEST run of words the type declares, e.g. `suits` in `card suits includes x`.
 * - `Priority.userDeclared`, as the per-enumeration rule had:
 *   a type's own member beats a longer built-in reading.
 */
class class_member extends SpellExpression<"type|member", ClassMemberData> {
  @proto static priority = Priority.userDeclared
  @proto static datatype = "list"

  /** Resolve the longest run of our words `type` declares as a class variable -- see class docs. */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const { type, member } = match.groups
    const typeScope = getKnownType(type)
    const count = declaredPrefix(member, (words) => !!typeScope.getClassVariable(words))
    if (!count) return undefined
    // fewer words than we took:  parse just those -- the type and them
    if (count < member.length) return this.parse(scope, tokens.slice(0, 1 + count))
    match.data.classVariable = typeScope.getClassVariable(`${member.raw}`)
    return match
  }

  getAST(match: P.MatchFor<this>): P.ASTPropertyExpression {
    const { type, member } = match.groups
    return new P.ASTPropertyExpression(match, {
      object: P.matchAST<P.ASTTypeExpression>(type),
      property: match.data.classVariable?.name ?? `${member.value}`
    })
  }
}
classes.addRule(class_member, {
  syntax: "{type:known_type} {member:member_words}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.compile(
          [
            "a card is a thing",
            "a card has a suit as one of clubs, diamonds",
            "a bank-account is a thing",
            "a bank-account has an account-type as one of savings, checking"
          ].join("\n"),
          "block"
        )
      },
      tests: [
        ["card suits", "Card.Suits"],
        ["Card Suits", "Card.Suits"],
        ["bank-account account-types", "Bank_Account.Account_types"],
        { title: "not a class variable", input: "card ranks", output: undefined }
      ]
    }
  ]
})

/** What `class_member` stashes on its match. */
type ClassMemberData = {
  /** Class variable it reads, found while parsing, e.g. `Suits` of `Card`. */
  classVariable?: P.ScopeVariable
}

////////////////
// ## `define_property_has` rule
//    e.g. "cards have a direction as either up or down"
////////////////

/**
 * `a card has a suit as one of clubs, diamonds, hearts, spades` / `todos have a title as text` -- declares
 * an instance property on `type`, optionally constrained/initialized by a `type_specifier`.
 * - `Priority.declaration`, so this wins over other `{type} has|have ...` -ish statement rules.
 * - SIDE EFFECT: stubs `type` into `scope.types` if not yet declared -- see `P.TypeScope.getOrStub()`.
 * - SIDE EFFECT: when `specifier` is an enumeration, also:
 *   - adds a pluralized class variable holding the raw values, e.g. `Suits`, which `card suits` reads
 *     through `class_member` -- and its instance twin, so `the suits of the card` finds it
 *   - adds string values to `scope.constants`
 * - Its name is `member_words`, e.g. `a card has short rank as text`;  the article is optional.
 * - Compiles to a reactive getter / setter pair in its class, its type declared in the class's schema -- see
 *   `P.ASTReactiveProperty` -- e.g. `a player has a name as text` =>
 *   `static { this.declareProp('name', { type: 'text' }) }` + `get name() { return this.getProp('name') }` +
 *   `set name(value) { this.setProp('name', value) }`
 * - An enumeration's values also go on the class, e.g. `static Suits = ['clubs', ...]` -- see `class_member`.
 */
class define_property_has extends SpellStatement<"type|property|specifier?", { valueList?: P.ValueKind }> {
  @proto static priority = Priority.declaration
  @proto static alias = "statement"
  @proto static declares: P.DeclaresSpec = { kind: "property", name: "property", of: "type", detail: "specifier" }

  /**
   * Refused on a built-in type -- see `SpellStatement.refuseBuiltInType()`.
   * - A property holding a VALUE kind, e.g. `its "suit" is a suit`:  notes where its values are listed,
   *   so its setter checks against them -- see `value_kind`.
   */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const { specifier } = match.groups
    const valueKind = specifier?.datatype ? scope.types?.get(specifier.datatype)?.valueKind : undefined
    if (valueKind) match.data.valueList = valueKind
    return SpellStatement.refuseBuiltInType(match, match.groups.type, match.groups.property)
  }

  mutateScope(match: P.MatchFor<this>) {
    const { scope } = match
    const { type, property, specifier } = match.groups
    const specifierAST = specifier?.AST

    const typeName = type.value
    const typeScope = P.TypeScope.getOrStub(scope, typeName, match)
    // what its specifier says it holds, e.g. `text`, `choice`, `thing` for `as a new thing`
    typeScope.declareProperty(`${property.value}`, match, { asWritten: property.raw, datatype: specifier?.datatype })

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
    // a value kind, e.g. `a suit`:  one of its list, e.g. `Deck.Suits` -- its values are plain text.  Read when set:
    // the list's class names ours (`static instanceType = Card`), so one of the two is defined second
    else if (match.data.valueList) {
      const { listOn, listName } = match.data.valueList
      check.addProp("oneOf", `() => ${listOn}.${listName}`)
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
  syntax: "(a|an) {type:singular_type} has (a|an|a property)? {property:member_words} {specifier:type_specifier}?",
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
        // every way to reach an enumeration names its class variable --
        // was CODE-DEBT "Enumerated properties are reachable under inconsistent names"
        ["print Card suits", "spellCore.console.log(Card.Suits)"],
        ["print card suits", "spellCore.console.log(Card.Suits)"],
        [
          "print the suit of the card is in card suits",
          "spellCore.console.log(spellCore.includes(Card.Suits, card.suit))"
        ],
        ["print the suit of the card", "spellCore.console.log(card.suit)"],
        ["print the suits of the card", "spellCore.console.log(Card.Suits)"],
        ["print the number of card suits", "spellCore.console.log(spellCore.itemCountOf(Card.Suits))"]
      ]
    },
    {
      title: "an enumeration through `its`, and on a dashed type",
      beforeEach(scope: P.Scope) {
        scope.compile(
          [
            "a card is a thing",
            "a card has a suit as one of clubs, diamonds, hearts or spades",
            "a bank-account is a thing",
            "a bank-account has an account-type as one of savings or checking"
          ].join("\n"),
          "block"
        )
      },
      compileAs: "block",
      tests: [
        [
          ["get a new card", "print its suits"],
          ["let it = new Card()", "spellCore.console.log(Card.Suits)"]
        ],
        ["print bank-account account-types", "spellCore.console.log(Bank_Account.Account_types)"]
      ]
    },
    {
      title: "a name of several words, blacklisted ones too -- the article is optional",
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        scope.compile("a card is a thing", "block")
      },
      tests: [
        [
          "a card has short rank as text",
          [
            "Card.declareProp('short_rank', { type: 'text' })",
            "Object.defineProperty(Card.prototype, 'short_rank', {",
            "  get() { return this.getProp('short_rank') },",
            "  set(value) { this.setProp('short_rank', value) },",
            "  configurable: true",
            "})"
          ]
        ]
      ]
    }
  ]
})
classes.addRule(define_property_has, {
  syntax: "{type:plural_type} have (a|an|a property)? {property:member_words} {specifier:type_specifier}?",
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
// a quoted name in the sentence style (plan doc J3, option C) -- tests in `parserTests/outline.test.ts`:
// `a card has a "suit" as one of ...`, `cards have a "direction" as either up or down`
classes.addRule(define_property_has, {
  syntax: "(a|an) {type:singular_type} has (a|an|a property)? {property:quoted_member} {specifier:type_specifier}?"
})
classes.addRule(define_property_has, {
  syntax: "{type:plural_type} have (a|an|a property)? {property:quoted_member} {specifier:type_specifier}?"
})
// in an outline body -- tests in `parserTests/outline.test.ts`:
// - `- it has a deck`
// - `- its "suit" is one of clubs, diamonds, hearts or spades`, `- its "rank" is a number`
classes.addRule(define_property_has, {
  syntax: "{type:subject_it} has (a|an|a property)? {property:member_words} {specifier:type_specifier}?"
})
classes.addRule(define_property_has, {
  syntax: "{type:subject_its} {property:quoted_member} is {specifier:outline_specifier}"
})
// ... and the quotes are optional (plan doc Q4):  `- its rank is a number`
classes.addRule(define_property_has, {
  syntax: "{type:subject_its} {property:member_words} is {specifier:outline_specifier}"
})

////////////////
// ## `outline_specifier_*` rules
//    e.g. "one of clubs, diamonds" in `- its "suit" is one of clubs, diamonds`
////////////////

/**
 * The `type_specifier`s again, without their `as`, for an outline body's `its "suit" is ...`:
 * - `one of clubs, diamonds` / `either up or down` -- `outline_specifier_enum`
 * - `a number`, `an automobile` -- `outline_specifier_datatype`
 * - `yes or no` -- `outline_specifier_yes_or_no`
 * - Their own alias, `outline_specifier`, so `a card has a suit one of ...` (no `as`) stays an error.
 */
class outline_specifier_enum extends type_specifier_enum {
  @proto static alias = "outline_specifier"

  /**
   * Without `either` / `one of`, two or more values joined by `or`, e.g. `up or down` (plan doc Q4's comparison):
   * one value alone, `its "x" is total`, stays a getter.
   */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    if (!match || /^(either|one)$/i.test(`${tokens[0]?.value}`)) return match
    const list = (match.groups as { enumeration: P.Match }).enumeration
    const hasOr = list.tokens.some((token) => `${token.value}`.toLowerCase() === "or")
    return list.items.length >= 2 && hasOr ? match : undefined
  }
}
classes.addRule(outline_specifier_enum, {
  syntax: "(either|one of) {enumeration:identifier_list}",
  tests: [{ tests: [["one of clubs, diamonds, hearts, spades", "['clubs', 'diamonds', 'hearts', 'spades']"]] }]
})
classes.addRule(outline_specifier_enum, {
  syntax: "{enumeration:identifier_list}",
  tests: [
    {
      tests: [
        ["up or down", "['up', 'down']"],
        ["up", undefined],
        ["up, down", undefined]
      ]
    }
  ]
})

/** `a number` -- see `outline_specifier_enum`. */
class outline_specifier_datatype extends type_specifier_datatype {
  @proto static alias = "outline_specifier"
}
classes.addRule(outline_specifier_datatype, {
  syntax: "(a|an) {datatype:singular_type}",
  tests: [{ tests: [["a number", "number"]] }]
})
// `a suit of its deck`:  a value kind, saying where its list is kept -- for the reader;  the kind says it already
classes.addRule(outline_specifier_datatype, {
  syntax: "(a|an) {datatype:singular_type} of its {owner:member_words}",
  tests: [{ tests: [["a suit of its deck", "Suit"]] }]
})
// without the article, only a KNOWN type:  `its "name" is text`, but `its "x" is total` stays a getter (issue I2)
classes.addRule(outline_specifier_datatype, {
  syntax: "{datatype:known_type}",
  tests: [
    {
      tests: [
        ["text", "text"],
        ["total", undefined]
      ]
    }
  ]
})

/** `yes or no` -- see `outline_specifier_enum`. */
class outline_specifier_yes_or_no extends type_specifier_yes_or_no {
  @proto static alias = "outline_specifier"
}
classes.addRule(outline_specifier_yes_or_no, {
  syntax: "either? (yes or no|true or false)",
  tests: [{ tests: [["yes or no", "choice"]] }]
})

////////////////
// ## `value_kind` rule
//    e.g. `- "suits" as one of clubs, diamonds, hearts or spades` in a deck's outline body
////////////////

/**
 * `"suits" as one of clubs, diamonds, hearts or spades` in a type's outline body:  a list of values which is a
 * KIND of thing of its own, `suit`, kept by the type the body is about (plan doc `outline-spell`, P2;  was todo T7
 * of `precedence-and-types`).
 * - So another type can say `its "suit" is a suit`, and the kind can have properties:
 *   `the "color" of a suit is: ...` -- see `property_value_getter`.
 * - SIDE EFFECT:  on the body's type, e.g. `Deck`, the class variable `Suits` and its instance twin, as
 *   `define_property_has` gives an enumerated property's;  each value a project constant;  and the kind's
 *   `P.TypeScope`, e.g. `Suit`, with `valueKind` -- claiming a stub of it, e.g. from `its "suit" is a suit` above.
 * - Compiles to the list, then the kind's class, which holds its properties:
 *   `Deck.Suits = ['clubs', ...]` + `export class Suit {}`.  Its values stay plain text (plan doc Q10).
 * - The name MUST be quoted:  see the registration.
 */
class value_kind extends SpellStatement<"values|specifier", ValueKindData> {
  @proto static priority = Priority.declaration
  @proto static alias = "statement"
  @proto static declares: P.DeclaresSpec = { kind: "type", name: "values" }

  /** Only in a type's outline body, and only for a list of values -- see class docs. */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match || !match.groups.specifier.is(type_specifier_enum)) return undefined
    const owner = P.SubjectScope.of(scope)?.subjectType
    if (!owner) return undefined
    match.data.owner = owner.name
    match.data.kind = typeCase(singularize(`${match.groups.values.value}`))
    return match
  }

  /** SIDE EFFECT:  declares the kind and its list -- see class docs. */
  mutateScope(match: P.MatchFor<this>) {
    const { scope } = match
    const { owner, kind } = match.data
    const ownerType = scope.types?.get(owner!)
    const enumeration = match.groups.specifier.AST
    if (!ownerType || !(enumeration instanceof P.ASTEnumeration)) return
    const { values } = enumeration
    const listName = value_kind.listName(match)
    const varProps: P.ScopeVariableProps & { enumeration: Array<string | number> } = {
      name: listName,
      enumeration: values,
      initializer: `[${values.join(", ")}]`,
      declaredBy: match
    }
    ownerType.classVariables.add({ ...varProps })
    ownerType.variables.add({ ...varProps })
    values.forEach((value) => {
      if (typeof value === "string") scope.constants?.add({ name: value, declaredBy: match })
    })
    const valueKind = { values, listOn: ownerType.name, listName }
    const existing = scope.types?.get(kind!)
    if (existing?.stub || (existing && P.TypeScope.sameStatement(existing.declaredBy, match))) {
      existing.claim(match, undefined, { valueKind })
    } else if (!existing) {
      scope.types?.add({ name: kind!, valueKind, declaredBy: match })
    }
  }

  getAST(match: P.MatchFor<this>): P.ASTStatementGroup {
    const { owner, kind } = match.data
    const value = match.groups.specifier.AST as P.ASTEnumeration
    return new P.ASTStatementGroup(match, {
      statements: [
        new P.ASTStaticDefinition(match, { type: owner!, name: value_kind.listName(match), value }),
        new P.ASTClassDeclaration(match, { type: new P.ASTTypeExpression(match, { name: kind! }) })
      ]
    })
  }

  /** Name of the class variable holding the list, e.g. `Suits` for `"suits"`. */
  private static listName(match: P.Match): string {
    return pluralize(upperFirst(`${(match.groups as { values: P.Match }).values.value}`))
  }
}
// quoted only:  unquoted, `{values:member_words}` matches any words at a line's start, e.g. completion offered
// `as one of ...` after `set y`
classes.addRule(value_kind, {
  syntax: "{values:quoted_member} {specifier:type_specifier}"
})

/** What `value_kind` stashes on its match, found while parsing. */
type ValueKindData = {
  /** Type whose body declares it, which keeps its list, e.g. `Deck`. */
  owner?: string
  /** The kind's name, e.g. `Suit`. */
  kind?: string
}

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
  syntax: "the {property:member_words} of (a|an) {type}"
})
// a quoted name, "quotes teach a new word" (plan doc J3, option C):  `the "color" of a card is red if ...`
classes.addRule(the_property_of_a_thing, {
  syntax: "the {property:quoted_member} of (a|an) {type}"
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
  syntax: "(a|an) {type:plural_type} {property:member_words}"
})

////////////////
// ## `its_quoted_property` rule
//    e.g. `its "color"` in an outline body
////////////////

/**
 * `its "color"` in an outline body -- the third `type_property` spelling, for `property_value_either`:
 * `- its "color" is red if its suit is either diamonds or hearts otherwise it is black`.
 * - The quotes are optional (plan doc Q4):  `- its color is red if ...`.
 */
class its_quoted_property extends P.Sequence<"type|property"> {
  @proto static alias = "type_property"
}
classes.addRule(its_quoted_property, {
  syntax: "{type:subject_its} {property:quoted_member}"
})
classes.addRule(its_quoted_property, {
  syntax: "{type:subject_its} {property:member_words}"
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

  /** Refused on a built-in type -- see `SpellStatement.refuseBuiltInType()`. */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const { type, property } = match.groups.type_property.groups
    const refused = SpellStatement.refuseUnknownType(match, type)
    return refused === match ? SpellStatement.refuseBuiltInType(match, type, property) : refused
  }

  mutateScope(match: P.MatchFor<this>) {
    const { scope } = match
    const { value, otherValue, type_property } = match.groups
    const { type, property } = type_property.groups
    // make sure type is defined
    P.TypeScope.getOrStub(scope, type.value, match).declareProperty(`${property.value}`, match, {
      asWritten: property.raw
    })
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
class property_value_getter extends SpellStatement<"property|type|body?", { valueKind?: boolean }> {
  @proto static alias = "statement"
  @proto static declares: P.DeclaresSpec = { kind: "property", name: "property", of: "type" }

  /**
   * Refused on a built-in type -- see `SpellStatement.refuseBuiltInType()`.
   * - Notes whether its type is a VALUE kind, e.g. `the "color" of a suit is: ...` -- see `value_kind`.
   */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    if (getKnownType(match.groups.type).valueKind) match.data.valueKind = true
    return SpellStatement.refuseBuiltInType(match, match.groups.type, match.groups.property)
  }

  /**
   * SIDE EFFECT:  records the property on its type -- see `P.TypeScope.declareProperty()`.
   * - Later lines read it, e.g. `the value of the card`'s datatype:
   *   so editing a getter's line re-parses what follows (plan doc D9).
   * - An edit to its indented body does only if what it returns changes -- see `mutateScopeFromBody()`.
   * - A value kind's property reads as a call of its static method, e.g. `Suit.color({it})`:  its `readAs`.
   */
  mutateScope(match: P.MatchFor<this>) {
    const { type, property } = match.groups
    const typeScope = getKnownType(type)
    const readAs = match.data.valueKind ? `${typeScope.name}.${property.value}({it})` : undefined
    typeScope.declareProperty(`${property.value}`, match, { asWritten: property.raw, readAs })
  }

  /**
   * SIDE EFFECT:  now our body has parsed, what it returns is the property's `datatype` --
   * if we declared it, and nothing gave it one first, e.g. `a card has a value as number`.
   * - See `getReturnedDatatype()`.
   * - Journaled.  Returns it, so `BlockLine.reparseBody()` can tell when an edit changes it.
   */
  mutateScopeFromBody(match: P.MatchFor<this>): string | undefined {
    const { type, property } = match.groups
    const datatype = this.getReturnedDatatype(match)
    const variable = getKnownType(type).variables.get(`${property.value}`, "LOCAL_ONLY")
    // ours:  noted on our match, or the match we're a re-bodied clone of -- see `P.ScopeList.noteDeclared()`
    const declared = (match.data as { declared?: unknown[] }).declared
    const isOurs =
      !!declared && (variable?.declaredBy?.data as { declared?: unknown[] } | undefined)?.declared === declared
    if (datatype && variable && isOurs && !variable.datatype) {
      P.ParseJournal.assign(match.scope.parser?.journal, variable, { datatype })
    }
    return datatype
  }
  /**
   * Nested scope for the getter body -- maps `its`/`it` to `this` so the body can say `its name`.
   * - A value kind's:  `it` / `the suit` are its argument, the value, e.g. `static color(suit)`.
   */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    const { type } = match.groups
    const typeScope = getKnownType(type)
    const datatype = SP.typeName(typeScope.name)
    if (match.data.valueKind) {
      return new P.MethodScope({
        parentScope: match.scope,
        args: [{ name: typeScope.instanceName, datatype }],
        mapItTo: typeScope.instanceName,
        itDatatype: datatype,
        declaredBy: match
      })
    }
    return new P.MethodScope({
      parentScope: match.scope,
      thisVar: typeScope.instanceName,
      mapItTo: "this",
      itDatatype: SP.typeName(typeScope.name),
      declaredBy: match
    })
  }
  getAST(match: P.MatchFor<this>): P.ASTPropertyDefinition | P.ASTStaticMethod {
    const { type, property } = match.groups
    if (match.data.valueKind) {
      const typeAST = P.matchAST<P.ASTTypeExpression>(type)
      const value = new P.ASTVariableExpression(match, { name: instanceCase(typeAST.name) })
      return new P.ASTStaticMethod(match, {
        type: typeAST,
        name: `${property.value}`,
        method: new P.ASTMethodDefinition(match, { args: [value], body: P.matchAST<MethodBody>(this.getBody(match)) })
      })
    }
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
  syntax: "the {property:member_words} of (a|an) {type:known_type} is :? {expression_body}?",
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
// in an outline body:  `- its "color" is the color of its suit` -- tests in `parserTests/outline.test.ts`
classes.addRule(property_value_getter, {
  syntax: "{type:subject_its} {property:quoted_member} is :? {expression_body}?"
})
classes.addRule(property_value_getter, {
  syntax: "{type:subject_its} {property:member_words} is :? {expression_body}?"
})
// a quoted name in the sentence style (plan doc J3, option C):  `the "short name" of a card is: ...`
classes.addRule(property_value_getter, {
  syntax: "the {property:quoted_member} of (a|an) {type:known_type} is :? {expression_body}?"
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
  @proto static priority = Priority.userDeclared
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
 * - `Priority.declaration`, so this wins over plainer statement rules that could otherwise partially match.
 * - SIDE EFFECT: `getBits()` derives (and caches in `match.data.bits`) rulex `syntax`, per-placeholder
 *   `ruleData`, `vars` and the generated `property` name, consumed by `mutateScope()`/`getAST()` below.
 * - SIDE EFFECT: `mutateScope()` registers a `QuotedPropertyRule` for the quoted phrase,
 *   e.g. `is (not)? a queen`, so it can be used like `card is a club`.
 * - Compiles to an instance method testing each placeholder against its property, e.g. `a card "is the
 *   (rank) of (suits)" for its ranks and its suits` => a `value(rank, suit)` method returning
 *   `this.rank === rank && this.suit === suit`.
 */
class quoted_property_formula extends SpellStatement<"type|alias|sources", QuotedPropertyFormulaMatchData> {
  @proto static priority = Priority.declaration
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
          datatype: "choice"
        })
      })
    ]
    return new P.ASTStatementGroup(match, { statements })
  }
}
classes.addRule(quoted_property_formula, {
  syntax: "(a|an) {type} {alias:text} for [sources:(its {property:member_words}) and]",
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
// in an outline body:  `- it "is a (suit)" for its suits` -- tests in `parserTests/outline.test.ts`
classes.addRule(quoted_property_formula, {
  syntax: "{type:subject_it} {alias:text} for [sources:(its {property:member_words}) and]"
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
