import { instanceCase, proto } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
import { Priority } from "$/spell/rules/rules.types"
import { getKnownType } from "$/spell/rules/types"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { classes } from "./classes.parser"
import { type MethodBody } from "./classes.shared"

/**
 * `list_guard` rule:  what a list type takes, or gives up, when something MOVES (plan doc Q23 - Q25):
 * - `a tableau can (add|take) a card if: ...`
 * - `a stock-pile can (release|remove|give up|let go of) a card if: ...`
 * - `a foundation can never (release|remove|give up|let go of) a card` -- always no
 * - Its body answers yes or no:  an inline expression, or an indented block which `return`s.
 *   `the card` is the card moving;  `it`, `its` and `the tableau` are the list.
 * - Compiles to a method of the list type's class, overriding `List`'s yes:
 *   `canTake(card) {...}` or `canGiveUp(card) {...}`.
 *   A sub-type inherits it, unless it says its own.
 * - Only a move asks, e.g. `move the card to the tableau` -- see `list_move`.
 *   `add`, `remove` and `clear` never do:  dealing, gathering cards back.
 */
export class ListGuard extends SpellStatement<"type|verb|item|body?|never?"> {
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
      detail: `${ListGuard.methodName(match)}()`
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
    const itemType = SP.typeName(`${item.value}`)
    // its type, e.g. `Card` for `a card`:  a typed target writes it
    const arg = new P.ASTVariableExpression(match, { name: instanceCase(itemType), datatype: itemType })
    const body = never
      ? new P.ASTReturnStatement(match, { value: new P.ASTBooleanLiteral(match, false) })
      : P.matchAST<MethodBody>(this.getBody(match))
    return new P.ASTPropertyDefinition(match, {
      type: P.matchAST<P.ASTTypeExpression>(type),
      property: ListGuard.methodName(match),
      method: new P.ASTMethodDefinition(match, { args: [arg], body, datatype: "choice" })
    })
  }

  /** `canTake` for `add` / `take`, else `canGiveUp` -- the `List` method we override. */
  static methodName(match: P.MatchFor<ListGuard>): "canTake" | "canGiveUp" {
    return ["add", "take"].includes(`${match.groups.verb.value}`) ? "canTake" : "canGiveUp"
  }
}
classes.addRule(ListGuard, {
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
          ["Pile.prototype.canTake = function (card) {", "  return this.isEmpty", "}"],
          [
            "export interface Pile { canTake(card: Card): boolean }",
            "Pile.prototype.canTake = function (this: Pile, card: Card) {",
            "  return this.isEmpty",
            "}"
          ]
        ],
        {
          title: "an indented body, `the pile` and `the card`",
          input: [
            "a pile can add a card if:",
            "\tif the pile is empty return yes",
            "\treturn the card is not the last card of the pile"
          ],
          js: [
            "Pile.prototype.canTake = function (card) {",
            "  if (this.isEmpty) { return true }",
            "  return (card !== this.lastItem)",
            "}"
          ],
          ts: [
            "export interface Pile { canTake(card: Card): boolean }",
            "Pile.prototype.canTake = function (this: Pile, card: Card) {",
            "  if (this.isEmpty) return true",
            "  return card !== this.lastItem",
            "}"
          ]
        }
      ]
    }
  ]
})
classes.addRule(ListGuard, {
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
          ["Pile.prototype.canGiveUp = function (card) {", "  return (card === this.lastItem)", "}"],
          [
            "export interface Pile { canGiveUp(card: Card): boolean }",
            "Pile.prototype.canGiveUp = function (this: Pile, card: Card) {",
            "  return card === this.lastItem",
            "}"
          ]
        ],
        [
          "a pile can let go of a card if: yes",
          ["Pile.prototype.canGiveUp = function (card) {", "  return true", "}"],
          [
            "export interface Pile { canGiveUp(card: Card): boolean }",
            "Pile.prototype.canGiveUp = function (this: Pile, card: Card) {",
            "  return true",
            "}"
          ]
        ]
      ]
    }
  ]
})
classes.addRule(ListGuard, {
  syntax: "(a|an) {type:known_type} can (never:never) (verb:release|remove|give up|let go of) (a|an) {item:type}",
  tests: [
    {
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        scope.parse(["a card is a thing", "a pile is a list of cards"].join("\n"), "block")
      },
      tests: [
        [
          "a pile can never let go of a card",
          ["Pile.prototype.canGiveUp = function (card) {", "  return false", "}"],
          [
            "export interface Pile { canGiveUp(card: Card): boolean }",
            "Pile.prototype.canGiveUp = function (this: Pile, card: Card) {",
            "  return false",
            "}"
          ]
        ]
      ]
    }
  ]
})
