import { instanceCase, proto } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
import { getKnownType } from "$/spell/rules/types"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { classes } from "./classes.parser"
import { type MethodBody } from "./classes.shared"

/**
 * `property_value_getter` rule:  `the value of a card is:` -- defines a property getter whose body is an inline
 * EXPRESSION or nested block (`{expression_body}?`), with `its`/`it` mapped to `this` inside.
 * - `getNestedScopeForMatch()` maps `it`/`its` to `this` via `mapItTo`, so the body can say
 *   `return the first word of the name` instead of repeating `of the card`.
 * - Compiles to a getter in its class running the parsed body, e.g.
 *   `the value of a card is its name` => `get value() { return this.name }`.
 */
export class PropertyValueGetter extends SpellStatement<"property|type|body?", { valueKind?: boolean }> {
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
    // a value kind's is its static method, which `readAs` reads;  anything else's, a getter
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
classes.addRule(PropertyValueGetter, {
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
          js: ['Object.defineProperty(Card.prototype, "value", {', "  get() {},", "  configurable: true", "})"],
          ts: [
            "export interface Card { readonly value: any /* spell: type unknown */ }",
            'Object.defineProperty(Card.prototype, "value", {',
            "  get(this: Card) {},",
            "  configurable: true",
            "})"
          ]
        },
        {
          input: "the value of a card is its name",
          js: [
            'Object.defineProperty(Card.prototype, "value", {',
            "  get() {",
            "    return this.name",
            "  },",
            "  configurable: true",
            "})"
          ],
          ts: [
            "export interface Card { readonly value: any /* spell: type unknown */ }",
            'Object.defineProperty(Card.prototype, "value", {',
            "  get(this: Card) {",
            "    return this.name",
            "  },",
            "  configurable: true",
            "})"
          ]
        },
        {
          input: ["the short-name of a card is:", "\treturn the first word of the name of the card"],
          js: [
            'Object.defineProperty(Card.prototype, "shortName", {',
            "  get() {",
            "    return spellCore.getItemAt(this.name, 1)",
            "  },",
            "  configurable: true",
            "})"
          ],
          ts: [
            "export interface Card { readonly shortName: any /* spell: type unknown */ }",
            'Object.defineProperty(Card.prototype, "shortName", {',
            "  get(this: Card) {",
            "    return spellCore.getItemAt(this.name, 1)",
            "  },",
            "  configurable: true",
            "})"
          ]
        },
        {
          title: "Show error if both nestedBlock and inlineStatement",
          input: ["the short-name of a card is its name", "\treturn the first word of the name of the card"],
          js: [
            'Object.defineProperty(Card.prototype, "shortName", {',
            "  get() {",
            "    return spellCore.getItemAt(this.name, 1)",
            "  },",
            "  configurable: true",
            "})",
            "/* PARSE ERROR: Got both inline statement and nested block */"
          ],
          ts: [
            "export interface Card { readonly shortName: any /* spell: type unknown */ }",
            'Object.defineProperty(Card.prototype, "shortName", {',
            "  get(this: Card) {",
            "    return spellCore.getItemAt(this.name, 1)",
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
classes.addRule(PropertyValueGetter, {
  syntax: "{type:subject_its} {property:quoted_member} is :? {expression_body}?"
})
classes.addRule(PropertyValueGetter, {
  syntax: "{type:subject_its} {property:member_words} is :? {expression_body}?"
})
// a quoted name in the sentence style (plan doc J3, option C):  `the "short name" of a card is: ...`
classes.addRule(PropertyValueGetter, {
  syntax: "the {property:quoted_member} of (a|an) {type:known_type} is :? {expression_body}?"
})
