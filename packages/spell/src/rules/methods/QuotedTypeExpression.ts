import { isNode } from "browser-or-node"

import { proto } from "$/util"
import { P } from "$/parser"
import { Negatable } from "$/spell/rules/expressions"
import { Priority } from "$/spell/rules/rules.types"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { MethodDefinition } from "./MethodDefinition"
import { methods } from "./methods.parser"
import type { MethodSignatureData } from "./methods.shared"

/**
 * `quoted_type_expression` rule:  defines an ad-hoc expression on a type from a QUOTED signature,
 * e.g. `a thing "nerds out" if`, `a thing "is a bug" if`, `a thing "nerds out with (another as a thing)" if`.
 * - `Priority.belowDeclaration`:  defers to more specific method-definition rules in `classes/`
 *   (e.g. `define_property_has`) when both could match the same tokens.
 * - Quoting the signature (`quoted_method_signature`) lets it start with plain english words
 *   (`is`, `has`, `can`, `will`, ...) that would otherwise collide with other statement/expression rules.
 * - Trailing `if` / `is` is a no-op keyword purely for readability:
 *   `a thing "is a bug" if` vs. plain `a thing "is a bug"`.  Neither is captured into `match.groups`.
 * - `{expression_body}?`:  the inline body (`a thing "nerds out" if yes`) parses as an `expression`,
 *   not a `statement` like other `MethodDefinition` subclasses,
 *   since the result compiles to a getter/method returning a value.
 * - `parse()` rejects signatures that don't start with a keyword, or that captured more than one argument:
 *   only zero- or one-arg expressions are supported.
 * - `processSignature()` decides the form:
 *   - postfix (`asPostfixExpression`, zero args), e.g. `card.isABug`
 *   - or infix (`asInfixExpression`, one arg), e.g. `card.nerdsOutWithAnother(thing)`
 *   - It rewrites `is` / `can` / `will` / `has` into a negatable `{operator}` group,
 *     so the positive and negative phrasings (`is` / `is not` / `isn't` / `isnt`) compile to the same rule,
 *     with `shouldNegateOutput()` flipping the output.
 */
export class QuotedTypeExpression extends MethodDefinition<"type|signature|body?"> {
  @proto static priority = Priority.belowDeclaration
  @proto static alias = "statement"

  /**
   * Reject the match if its (quoted) signature doesn't start with a keyword, or captured more than one arg.
   * - `quoted_type_expression` only supports plain (`nerds out`) or single-arg (`nerds out with (x as y)`) forms.
   */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (match) {
      const signature = this.getSignature(match)!
      if (!signature.startsWithKeyword) {
        if (!isNode) {
          // console.warn("quoted_type_expression: must start with a keyword. Skipping match.", { tokens, match })
        }
        return undefined
      }
      if (signature.args.length > 1) {
        if (!isNode) {
          // console.warn("quoted_type_expression: too many arguments. Skipping match.", { tokens, match })
        }
        return undefined
      }
      const refused = SpellStatement.refuseUnknownType(match, match.groups.type)
      if (refused !== match) return refused
      if (QuotedTypeExpression.isPropertySlip(scope, tokens)) {
        const whole = match.clone({ matched: tokens, tokens: [...tokens] })
        const name = (tokens[1] as P.TextToken).innerText
        return SpellStatement.refuse(whole, `A property starts "its":  write its "${name}" is ...`)
      }
      if (QuotedTypeExpression.isBodiless(match, tokens)) {
        const phrase = match.groups.signature.inputText.trim()
        return SpellStatement.refuse(match, `${phrase} has no body:  write ${phrase} always, or ${phrase} if ...`)
      }
    }
    return match
  }

  /**
   * Is `match` the quoted phrase and NOTHING more:  no `if` / `is` / `:`, no body?
   * - e.g. `- it "can move"` (plan doc `outline-spell` I6)
   * - Refused, saying so:  it'd compile to an empty method, `get canMove() {}`, always `undefined`.
   * - A dangling `if` is fine:  its body may be the indented lines below.
   */
  private static isBodiless(match: P.MatchFor<QuotedTypeExpression>, tokens: P.Token[]): boolean {
    const lastOfSignature = match.groups.signature.tokens.at(-1)
    const after = tokens.slice(tokens.indexOf(lastOfSignature!) + 1)
    return !after.join("").trim()
  }

  /**
   * Is `tokens` a property written with `it` for `its` in an outline body, e.g. `- it "rank" is a number`
   * (plan doc `outline-spell`, todo T3)?
   * - `it`, a quoted member name (no verb, so not a phrase like `"is face up"`), then `is`.
   * - Refused, saying so:
   *   read as a phrase, it'd make an empty `get rank() {}`, and say only "Don't understand `a number`".
   */
  private static isPropertySlip(scope: P.Scope, tokens: P.Token[]): boolean {
    const [subject, name, is] = tokens
    return (
      `${subject?.value}`.toLowerCase() === "it" &&
      !!name &&
      !!scope.getRuleOrDie("quoted_member").test(scope, [name]) &&
      `${is?.value}`.toLowerCase() === "is"
    )
  }

  /**
   * Turn the quoted signature into a postfix (no args) or infix (one arg) expression on `groups.type`.
   * - SIDE EFFECT: sets `signature.instanceType` directly from the OUTER `{type:singular_type}`
   *   capture -- bypasses `MethodDefinition`'s normal inline-type-promotion path (`inlineInitialType`)
   *   entirely, since the type here is captured outside the (quoted) signature, not inside it.
   * - Zero args => `asPostfixExpression`.
   * - One arg => `asInfixExpression`, and its single `{callArgs:expression}` syntax bit is rewritten
   *   to `{expression:operand}` -- see `getRule()`'s infix-rule branch.
   * - More than one arg isn't handled (see `parse()`'s rejection above) -- the `TODO` in the `else`
   *   branch notes the unimplemented `{thisArg:operand}` prefix for that case.
   * - Rewrites the FIRST `is`/`can`/`will`/`has` bit found (scanning signature order) into an
   *   `(operator:...)` alternation so all its negated spellings (`is not`, `isn't`, `isnt`, etc.) share
   *   one compiled rule; `shouldNegateOutput()` then flips `P.ASTExpression` output for a match on
   *   anything other than the bare positive form.
   */
  processSignature(
    groups: P.MatchGroups & { type: P.Match },
    signature: MethodSignatureData,
    scope: P.Scope
  ): MethodSignatureData {
    signature.instanceType = groups.type.raw
    if (signature.args.length === 0) {
      signature.asPostfixExpression = true
      // a value kind's phrase:  its static method -- see `MethodSignatureData.valueKindOf`
      const { scopeType } = groups.type.data as { scopeType?: unknown }
      if (scopeType instanceof P.TypeScope && scopeType.valueKind) signature.valueKindOf = scopeType.name
    } else if (signature.args.length === 1) {
      signature.asInfixExpression = true
      signature.syntaxBits = signature.syntaxBits.map((bit) => (bit.startsWith("{") ? "{expression:operand}" : bit))
    } else {
      // TODO: we don't handle this currently...
      // signature.syntaxBits.unshift("{thisArg:operand}")
    }
    // FIRST negatable word, e.g. `is`, matches all its forms, e.g. `isn't` -- see `Negatable`
    if (signature.asPostfixExpression || signature.asInfixExpression) {
      const rules = scope.parser?.rules
      let foundOne = false
      signature.syntaxBits = signature.syntaxBits.map((bit) => {
        if (foundOne || !(rules?.[bit] instanceof Negatable)) return bit
        foundOne = true
        return `{operator:${bit}}`
      })
    }
    // console.warn(signature)
    return signature
  }
}
methods.addRule(QuotedTypeExpression, {
  syntax: "(a|an) {type:singular_type} {signature:quoted_method_signature} (if|is)? :? {expression_body}?",
  tests: [
    {
      title: "fails if",
      compileAs: "block",
      tests: [
        {
          title: "signature is empty",
          input: `a thing "" if`,
          js: `/* PARSE ERROR: Don't understand "a thing "" if" */`
        },
        {
          title: "signature doesn't start with a keyword",
          input: `a thing "(thing)" if`,
          js: `/* PARSE ERROR: Don't understand "a thing "(thing)" if" */`
        },
        {
          title: "more than one arg specified",
          input: `a thing "(thing) but (thing)" if`,
          js: `/* PARSE ERROR: Don't understand "a thing "(thing) but (thing)" if" */`
        }
      ]
    },
    {
      title: "no args, no negatables",
      compileAs: "block",
      tests: [
        {
          title: "no body",
          input: [`a thing "nerds out" if`, `if a new thing nerds out`],
          js: [
            "Object.defineProperty(Thing.prototype, 'nerdsOut', {",
            "  get() {},",
            "  configurable: true",
            "})",
            "if (new Thing().nerdsOut) {}"
          ],
          ts: [
            "export interface Thing { readonly nerdsOut: any /* spell: type unknown */ }",
            'Object.defineProperty(Thing.prototype, "nerdsOut", {',
            "  get(this: Thing) {},",
            "  configurable: true",
            "})",
            "if ((new Thing()).nerdsOut) {}"
          ]
        },
        {
          title: "no if",
          input: [`a thing "nerds out": never`, `if a new thing nerds out`],
          js: [
            "Object.defineProperty(Thing.prototype, 'nerdsOut', {",
            "  get() {",
            "    return false",
            "  },",
            "  configurable: true",
            "})",
            "if (new Thing().nerdsOut) {}"
          ],
          ts: [
            "export interface Thing { readonly nerdsOut: any /* spell: type unknown */ }",
            'Object.defineProperty(Thing.prototype, "nerdsOut", {',
            "  get(this: Thing) {",
            "    return false",
            "  },",
            "  configurable: true",
            "})",
            "if ((new Thing()).nerdsOut) {}"
          ]
        },
        {
          title: "inline expression",
          input: [`a thing "nerds out" if yes`, `if a new thing nerds out`],
          js: [
            "Object.defineProperty(Thing.prototype, 'nerdsOut', {",
            "  get() {",
            "    return true",
            "  },",
            "  configurable: true",
            "})",
            "if (new Thing().nerdsOut) {}"
          ],
          ts: [
            "export interface Thing { readonly nerdsOut: any /* spell: type unknown */ }",
            'Object.defineProperty(Thing.prototype, "nerdsOut", {',
            "  get(this: Thing) {",
            "    return true",
            "  },",
            "  configurable: true",
            "})",
            "if ((new Thing()).nerdsOut) {}"
          ]
        },
        {
          title: "indented method body",
          input: [`a thing "nerds out" if`, `\treturn yes`, `if a new thing nerds out`],
          js: [
            "Object.defineProperty(Thing.prototype, 'nerdsOut', {",
            "  get() {",
            "    return true",
            "  },",
            "  configurable: true",
            "})",
            "if (new Thing().nerdsOut) {}"
          ],
          ts: [
            "export interface Thing { readonly nerdsOut: any /* spell: type unknown */ }",
            'Object.defineProperty(Thing.prototype, "nerdsOut", {',
            "  get(this: Thing) {",
            "    return true",
            "  },",
            "  configurable: true",
            "})",
            "if ((new Thing()).nerdsOut) {}"
          ]
        }
      ]
    },
    {
      title: "one arg",
      compileAs: "block",
      tests: [
        {
          title: "no body",
          input: [`a thing "nerds out with (another as a thing)" if`, `if a new thing nerds out with a new thing`],
          js: [
            "Thing.prototype.nerdsOutWithAnother = function (another) {}",
            "if (new Thing().nerdsOutWithAnother(new Thing())) {}"
          ],
          ts: [
            "export interface Thing { nerdsOutWithAnother(another: Thing): any /* spell: type unknown */ }",
            "Thing.prototype.nerdsOutWithAnother = function (this: Thing, another: Thing) {}",
            "if ((new Thing()).nerdsOutWithAnother(new Thing())) {}"
          ]
        },
        {
          title: "inline expression",
          input: [`a thing "nerds out with (another as a thing)" if yes`, `if a new thing nerds out with a new thing`],
          js: [
            "Thing.prototype.nerdsOutWithAnother = function (another) {",
            "  return true",
            "}",
            "if (new Thing().nerdsOutWithAnother(new Thing())) {}"
          ],
          ts: [
            "export interface Thing { nerdsOutWithAnother(another: Thing): any /* spell: type unknown */ }",
            "Thing.prototype.nerdsOutWithAnother = function (this: Thing, another: Thing) {",
            "  return true",
            "}",
            "if ((new Thing()).nerdsOutWithAnother(new Thing())) {}"
          ]
        },
        {
          title: "indented method body",
          input: [
            `a thing "nerds out with (another as a thing)" if`,
            `\treturn yes`,
            `if a new thing nerds out with a new thing`
          ],
          js: [
            "Thing.prototype.nerdsOutWithAnother = function (another) {",
            "  return true",
            "}",
            "if (new Thing().nerdsOutWithAnother(new Thing())) {}"
          ],
          ts: [
            "export interface Thing { nerdsOutWithAnother(another: Thing): any /* spell: type unknown */ }",
            "Thing.prototype.nerdsOutWithAnother = function (this: Thing, another: Thing) {",
            "  return true",
            "}",
            "if ((new Thing()).nerdsOutWithAnother(new Thing())) {}"
          ]
        }
      ]
    },
    {
      title: "negatables",
      compileAs: "block",
      tests: [
        {
          title: "is",
          input: [
            `a thing "is a bug" if`,
            `if a new thing is a bug`,
            `if a new thing is not a bug`,
            `if a new thing isnt a bug`,
            `if a new thing isn't a bug`
          ],
          js: [
            "Object.defineProperty(Thing.prototype, 'isABug', {",
            "  get() {},",
            "  configurable: true",
            "})",
            "if (new Thing().isABug) {}",
            "if (!new Thing().isABug) {}",
            "if (!new Thing().isABug) {}",
            "if (!new Thing().isABug) {}"
          ],
          ts: [
            "export interface Thing { readonly isABug: any /* spell: type unknown */ }",
            'Object.defineProperty(Thing.prototype, "isABug", {',
            "  get(this: Thing) {},",
            "  configurable: true",
            "})",
            "if ((new Thing()).isABug) {}",
            "if (!(new Thing()).isABug) {}",
            "if (!(new Thing()).isABug) {}",
            "if (!(new Thing()).isABug) {}"
          ]
        },
        {
          title: "can",
          input: [
            `a thing "can play" if`,
            `if a new thing can play`,
            `if a new thing cannot play`,
            `if a new thing can not play`,
            `if a new thing cant play`,
            `if a new thing can't play`
          ],
          js: [
            "Object.defineProperty(Thing.prototype, 'canPlay', {",
            "  get() {},",
            "  configurable: true",
            "})",
            "if (new Thing().canPlay) {}",
            "if (!new Thing().canPlay) {}",
            "if (!new Thing().canPlay) {}",
            "if (!new Thing().canPlay) {}",
            "if (!new Thing().canPlay) {}"
          ],
          ts: [
            "export interface Thing { readonly canPlay: any /* spell: type unknown */ }",
            'Object.defineProperty(Thing.prototype, "canPlay", {',
            "  get(this: Thing) {},",
            "  configurable: true",
            "})",
            "if ((new Thing()).canPlay) {}",
            "if (!(new Thing()).canPlay) {}",
            "if (!(new Thing()).canPlay) {}",
            "if (!(new Thing()).canPlay) {}",
            "if (!(new Thing()).canPlay) {}"
          ]
        },
        {
          title: "will",
          input: [
            `a thing "will blow up" if`,
            `if a new thing will blow up`,
            `if a new thing will not blow up`,
            `if a new thing wont blow up`,
            `if a new thing won't blow up`
          ],
          js: [
            "Object.defineProperty(Thing.prototype, 'willBlowUp', {",
            "  get() {},",
            "  configurable: true",
            "})",
            "if (new Thing().willBlowUp) {}",
            "if (!new Thing().willBlowUp) {}",
            "if (!new Thing().willBlowUp) {}",
            "if (!new Thing().willBlowUp) {}"
          ],
          ts: [
            "export interface Thing { readonly willBlowUp: any /* spell: type unknown */ }",
            'Object.defineProperty(Thing.prototype, "willBlowUp", {',
            "  get(this: Thing) {},",
            "  configurable: true",
            "})",
            "if ((new Thing()).willBlowUp) {}",
            "if (!(new Thing()).willBlowUp) {}",
            "if (!(new Thing()).willBlowUp) {}",
            "if (!(new Thing()).willBlowUp) {}"
          ]
        },
        {
          title: "has",
          input: [
            `a thing "has a friend" if`,
            `if a new thing has a friend`,
            `if a new thing does not have a friend`,
            `if a new thing doesnt have a friend`,
            `if a new thing doesn't have a friend`
          ],
          js: [
            "Object.defineProperty(Thing.prototype, 'hasAFriend', {",
            "  get() {},",
            "  configurable: true",
            "})",
            "if (new Thing().hasAFriend) {}",
            "if (!new Thing().hasAFriend) {}",
            "if (!new Thing().hasAFriend) {}",
            "if (!new Thing().hasAFriend) {}"
          ],
          ts: [
            "export interface Thing { readonly hasAFriend: any /* spell: type unknown */ }",
            'Object.defineProperty(Thing.prototype, "hasAFriend", {',
            "  get(this: Thing) {},",
            "  configurable: true",
            "})",
            "if ((new Thing()).hasAFriend) {}",
            "if (!(new Thing()).hasAFriend) {}",
            "if (!(new Thing()).hasAFriend) {}",
            "if (!(new Thing()).hasAFriend) {}"
          ]
        }
      ]
    }
  ]
})
// in an outline body:  `- it "is face up" if its direction is up` -- tests in `parserTests/outline.test.ts`
methods.addRule(QuotedTypeExpression, {
  syntax: "{type:subject_it} {signature:quoted_method_signature} (if|is)? :? {expression_body}?"
})
