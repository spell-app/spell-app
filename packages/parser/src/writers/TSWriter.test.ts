import { describe, expect, test } from "vite-plus/test"

import { P } from "$/parser"

/**
 * `TSWriter`:  javascript plus the types spell knows.  Whole projects, checked by `tsc`:  spell's
 * `src/test/typescript.test.ts`.
 */

/** A match for hand-made AST:  no tokens, so no datatype comes from it. */
const match = new P.Match({ rule: new P.Symbol({} as never), matched: [] } as never)
const writer = P.TSWriter.instance
const UNKNOWN = P.TSWriter.UNKNOWN

/** `to <name> (args)`, its body `return 1`. */
function method(args: P.ASTVariableExpression[], props: Partial<P.ASTMethodDefinitionProps> = {}) {
  return new P.ASTMethodDefinition(match, {
    methodName: "play",
    args,
    body: new P.ASTNumericLiteral(match, 1),
    ...props
  })
}

describe("TSWriter", () => {
  test("types spell's datatypes:  built in, declared, a list;  unknown is undefined", () => {
    expect(writer.typeFor("text")).toBe("string")
    expect(writer.typeFor("choice")).toBe("boolean")
    expect(writer.typeFor("Card")).toBe("Card")
    expect(writer.typeFor("list of cards")).toBe(P.TSWriter.TYPES.list)
    expect(writer.typeFor("something")).toBeUndefined()
    expect(writer.typeFor(undefined)).toBeUndefined()
  })

  test("types parameters, marking those spell doesn't know", () => {
    const card = new P.ASTVariableExpression(match, { name: "card", datatype: "Card" })
    const suit = new P.ASTVariableExpression(match, { name: "suit" })
    expect(writer.write(method([card, suit]))).toBe(`function play(card: Card, suit: ${UNKNOWN}) {\n  return 1\n}`)
  })

  test("a default's datatype types its parameter", () => {
    const message = new P.ASTVariableExpression(match, {
      name: "message",
      default: new P.ASTStringLiteral(match, { value: "Really?", quote: '"' })
    })
    expect(writer.params(method([message]))).toBe(`(message: string = "Really?")`)
  })

  test("a function written outside its class takes a typed `this`", () => {
    expect(writer.params(method([]), "Card")).toBe("(this: Card)")
  })

  test("a reactive property is typed from its check, and merged into its class from outside", () => {
    const check = new P.ASTObjectLiteral(match, {
      properties: [
        new P.ASTObjectLiteralProperty(match, {
          property: new P.ASTPropertyLiteral(match, "type"),
          value: new P.ASTStringLiteral(match, { value: "number", quote: "'" })
        })
      ]
    })
    const score = new P.ASTReactiveProperty(match, { type: "Game", property: "score", check })
    expect(writer.writeAsMember(score)).toContain("get score(): number { return this.getProp('score') as number }")
    expect(writer.writeAsMember(score)).toContain("set score(value: number)")
    expect(writer.write(score)).toMatch(/^export interface Game \{ score: number \}\n/)
    expect(writer.write(score)).toContain("set(this: Game, value: number)")
  })

  test("a new variable spell knows the type of is typed;  one TypeScript can type is left to it", () => {
    const count = new P.ASTAssignmentStatement(match, {
      thing: new P.ASTVariableExpression(match, { name: "count" }),
      value: new P.ASTNumericLiteral(match, 0),
      isNewVariable: true
    })
    expect(writer.write(count)).toBe("let count: number = 0")
  })

  test("a new variable set from spellCore, which returns `unknown`, is cast or marked", () => {
    const pick = () => new P.ASTCoreMethodInvocation(match, { methodName: "randomItemOf", datatype: "Card" })
    const card = new P.ASTAssignmentStatement(match, {
      thing: new P.ASTVariableExpression(match, { name: "card" }),
      value: pick(),
      isNewVariable: true
    })
    expect(writer.write(card)).toBe("let card = spellCore.randomItemOf() as Card")
    const thing = new P.ASTAssignmentStatement(match, {
      thing: new P.ASTVariableExpression(match, { name: "thing" }),
      value: new P.ASTCoreMethodInvocation(match, { methodName: "randomItemOf" }),
      isNewVariable: true
    })
    expect(writer.write(thing)).toBe(`let thing: ${UNKNOWN} = spellCore.randomItemOf()`)
  })

  test("javascript is unchanged by the type hooks", () => {
    const card = new P.ASTVariableExpression(match, { name: "card", datatype: "Card" })
    expect(P.JSWriter.instance.write(method([card]))).toBe("function play(card) {\n  return 1\n}")
  })
})
