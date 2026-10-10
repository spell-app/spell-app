import { pluralize, proto, upperFirst } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
import { Priority } from "$/spell/rules/rules.types"
// Through the folder, not its own file:  `outline_specifier_enum` registers AFTER us, and importing its file would
// load it first, changing the registration order.  Read only when called, once the folder has loaded.
import { OutlineSpecifierEnum } from "$/spell/rules/classes"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { classes } from "./classes.parser"

/**
 * `define_property_has` rule:  `a card has a suit as one of clubs, diamonds, hearts, spades` /
 * `todos have a title as text` -- declares an instance property on `type`, optionally constrained/initialized by a
 * `type_specifier`.
 * - `Priority.declaration`, so this wins over other `{type} has|have ...` -ish statement rules.
 * - SIDE EFFECT: stubs `type` into `scope.types` if not yet declared -- see `P.TypeScope.getOrStub()`.
 * - SIDE EFFECT: when `specifier` is an enumeration, also:
 *   - adds a pluralized class variable holding the raw values, e.g. `Suits`, which `card suits` reads
 *     through `class_member` -- and its instance twin, so `the suits of the card` finds it
 *   - adds string values to `scope.constants`
 * - Its name is `member_words`, e.g. `a card has short rank as text`;  the article is optional.
 * - With no type, e.g. `a calculator has an input`, it asks for one:  a warning -- see `warnUntyped()`.
 * - Compiles to a reactive getter / setter pair in its class, its type declared in the class's schema -- see
 *   `P.ASTReactiveProperty` -- e.g. `a player has a name as text` =>
 *   `static { this.declareProp('name', { type: 'text' }) }` + `get name() { return this.getProp('name') }` +
 *   `set name(value) { this.setProp('name', value) }`
 * - An enumeration's values also go on the class, e.g. `static Suits = ['clubs', ...]` -- see `class_member`.
 */
export class DefinePropertyHas extends SpellStatement<"type|property|specifier?", { valueType?: P.TypeScope }> {
  @proto static priority = Priority.declaration
  @proto static alias = "statement"
  @proto static declares: P.DeclaresSpec = { kind: "property", name: "property", of: "type", detail: "specifier" }

  /**
   * Refused on a built-in type -- see `SpellStatement.refuseBuiltInType()`.
   * - Notes the type its specifier names, e.g. `Suit` for `its "suit" is a suit`:  if it's a VALUE kind, its setter
   *   checks against its list -- see `value_kind`.
   *   - The type's RECORD, read when compiling:  a value kind may be declared further down, e.g. the deck below the
   *     card, so here it's still a stub (plan doc `outline-spell`, issue I3).  As a call reads `data.method.returns`.
   */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const { specifier } = match.groups
    const valueType = specifier?.datatype ? scope.types?.get(specifier.datatype) : undefined
    if (valueType) match.data.valueType = valueType
    DefinePropertyHas.warnUntyped(match)
    return SpellStatement.refuseBuiltInType(match, match.groups.type, match.groups.property)
  }

  /**
   * Ask for a type it doesn't say (epic `output-targets`, Q24):  a warning, the property compiles as it is.
   * - none at all, e.g. `a calculator has an input` => `Say what "input" is, e.g. "a calculator has an input as text"`
   * - a list of nothing said, e.g. `a todos-app has tasks as a new list` =>
   *   `Say what "tasks" holds, e.g. "a todos-app has tasks as a new list of tasks"`
   * - NOT an enumeration (`as one of ...`), a type, a new thing, or a list of something:  they say.
   */
  private static warnUntyped(match: P.MatchFor<DefinePropertyHas>): void {
    const { property, specifier } = match.groups
    const words = property.raw ?? `${property.value}`
    const said = match.inputText.trim()
    if (!specifier) {
      const example = `${said} as ${SP.SpellWarnings.exampleType(match.scope, words)}`
      SP.SpellWarnings.note(match, `Say what "${words}" is, e.g. "${example}"`)
    } else if (specifier.datatype === "list") {
      const items = SP.SpellWarnings.exampleItemType(match.scope, words)
      const example = `${said.slice(0, said.length - specifier.inputText.trim().length)}as a new list of ${items}`
      SP.SpellWarnings.note(match, `Say what "${words}" holds, e.g. "${example}"`)
    }
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

  /**
   * `its "rank" is a number` => `a card has a rank as a number`;  `its direction is up or down` =>
   * `a card has a direction as one of up or down` -- see `SpellStatement.getLongForm()`.
   */
  getLongForm(match: P.Match): string | undefined {
    const typeWords = SpellStatement.subjectWords(match)
    const { type, property, specifier } = match.groups as { type: P.Match; property: P.Match; specifier?: P.Match }
    if (!typeWords || !/^its$/i.test(type.inputText.trim())) return super.getLongForm(match)
    const said = specifier?.inputText.trim()
    const as = !said
      ? ""
      : specifier!.is(OutlineSpecifierEnum) && !/^(either|one of)\b/i.test(said)
        ? ` as one of ${said}`
        : ` as ${said}`
    return `a ${typeWords} has a ${property.raw}${as}`
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
    else if (match.data.valueType?.valueKind) {
      const { listOn, listName } = match.data.valueType.valueKind
      const list = new P.ASTPropertyExpression(match, {
        object: new P.ASTTypeExpression(match, { name: listOn }),
        property: listName
      })
      check.addProp("oneOf", new P.ASTMethodDefinition(match, { inline: true, body: list }))
    }
    // type
    else if (specifier) {
      // Only `type_specifier_datatype`/`type_specifier_yes_or_no` can produce a `specifier` that
      // reaches here, both of which return a `TypeExpression` -- not statically provable, since
      // `type_specifier`'s `getAST()` can only be typed as returning `ASTNode` in general.
      const typeExpression = specifier as P.ASTTypeExpression
      // checked at runtime by its class's name -- see `P.ASTTypeExpression.runtimeName`
      // a text value, so a writer can read the type:  `P.TSWriter` types the property from it
      check.addProp("type", new P.ASTStringLiteral(match, { value: typeExpression.runtimeName, quote: "'" }))
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
classes.addRule(DefinePropertyHas, {
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
          ],
          [
            "export interface Player { name: string }",
            "Player.declareProp('name', { type: \"text\" })",
            "Object.defineProperty(Player.prototype, 'name', {",
            "  get(this: Player): string { return this.getProp('name') as string },",
            "  set(this: Player, value: string) { this.setProp('name', value) },",
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
          ["let it = new Card()", "spellCore.console.log(Card.Suits)"],
          ["const it = new Card()", "spellCore.console.log(Card.Suits)"]
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
          ],
          [
            "export interface Card { short_rank: string }",
            "Card.declareProp('short_rank', { type: \"text\" })",
            "Object.defineProperty(Card.prototype, 'short_rank', {",
            "  get(this: Card): string { return this.getProp('short_rank') as string },",
            "  set(this: Card, value: string) { this.setProp('short_rank', value) },",
            "  configurable: true",
            "})"
          ]
        ]
      ]
    }
  ]
})
classes.addRule(DefinePropertyHas, {
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
          ],
          [
            'Card.Directions = ["up", "down"]',
            "export interface Card { direction: (typeof Card.Directions)[number] }",
            "Card.declareProp('direction', { oneOf: Card.Directions })",
            "Object.defineProperty(Card.prototype, 'direction', {",
            "  get(this: Card): (typeof Card.Directions)[number] { return this.getProp('direction') as (typeof Card.Directions)[number] },",
            "  set(this: Card, value: (typeof Card.Directions)[number]) { this.setProp('direction', value) },",
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
          ],
          [
            "export interface Todo { title: string }",
            "Todo.declareProp('title', { type: \"text\" })",
            "Object.defineProperty(Todo.prototype, 'title', {",
            "  get(this: Todo): string { return this.getProp('title') as string },",
            "  set(this: Todo, value: string) { this.setProp('title', value) },",
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
          ],
          [
            "export interface Todo { completed: boolean }",
            "Todo.declareProp('completed', { type: \"choice\" })",
            "Object.defineProperty(Todo.prototype, 'completed', {",
            "  get(this: Todo): boolean { return this.getProp('completed') as boolean },",
            "  set(this: Todo, value: boolean) { this.setProp('completed', value) },",
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
          ],
          [
            "export interface Todo { tags: any /* spell: type unknown */ }",
            "Todo.declareProp('tags', { init: () => new List() })",
            "Object.defineProperty(Todo.prototype, 'tags', {",
            "  get(this: Todo): any /* spell: type unknown */ { return this.getProp('tags') },",
            "  set(this: Todo, value: any /* spell: type unknown */) { this.setProp('tags', value) },",
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
classes.addRule(DefinePropertyHas, {
  syntax: "(a|an) {type:singular_type} has (a|an|a property)? {property:quoted_member} {specifier:type_specifier}?"
})
classes.addRule(DefinePropertyHas, {
  syntax: "{type:plural_type} have (a|an|a property)? {property:quoted_member} {specifier:type_specifier}?"
})
// in an outline body -- tests in `parserTests/outline.test.ts`:
// - `- it has a deck`
// - `- its "suit" is one of clubs, diamonds, hearts or spades`, `- its "rank" is a number`
classes.addRule(DefinePropertyHas, {
  syntax: "{type:subject_it} has (a|an|a property)? {property:member_words} {specifier:type_specifier}?"
})
classes.addRule(DefinePropertyHas, {
  syntax: "{type:subject_its} {property:quoted_member} is {specifier:outline_specifier}"
})
// ... and the quotes are optional (plan doc Q4):  `- its rank is a number`
classes.addRule(DefinePropertyHas, {
  syntax: "{type:subject_its} {property:member_words} is {specifier:outline_specifier}"
})
