import { describe, expect, test } from "vite-plus/test"

import { P } from "$/parser"

/**
 * `TSWriter`:  TypeScript on Solid, as a person writes it.  Whole projects, checked by `tsc`:  spell's
 * `src/test/typescript.test.ts`;  run on both targets:  the core contract, `contract.test.ts` in `$/cli`.
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

  test("a reactive property is a decorated accessor in its class, typed from its check;  merged in from outside", () => {
    const check = new P.ASTObjectLiteral(match, {
      properties: [
        new P.ASTObjectLiteralProperty(match, {
          property: new P.ASTPropertyLiteral(match, "type"),
          value: new P.ASTStringLiteral(match, { value: "number", quote: "'" })
        })
      ]
    })
    const score = new P.ASTReactiveProperty(match, { type: "Game", property: "score", check })
    expect(writer.writeAsMember(score)).toBe(`@prop({ type: "number" }) accessor score!: number`)
    expect(writer.write(score)).toMatch(/^export interface Game \{ score: number \}\n/)
    expect(writer.write(score)).toContain("set(this: Game, value: number)")
  })

  test("a new variable spell knows the type of is typed;  `const` unless the project sets it again", () => {
    const count = () =>
      new P.ASTAssignmentStatement(match, {
        thing: new P.ASTVariableExpression(match, { name: "count" }),
        value: new P.ASTNumericLiteral(match, 0),
        isNewVariable: true
      })
    expect(writer.write(count())).toBe("const count: number = 0")
    const again = new P.ASTAssignmentStatement(match, {
      thing: new P.ASTVariableExpression(match, { name: "count" }),
      value: new P.ASTNumericLiteral(match, 1)
    })
    const project = writer.forProject([[count(), again]])
    expect(project.write(count())).toBe("let count: number = 0")
  })

  test("a new variable set from spellCore, which returns `unknown`, is cast or marked", () => {
    const pick = () => new P.ASTCoreMethodInvocation(match, { methodName: "randomItemOf", datatype: "Card" })
    const card = new P.ASTAssignmentStatement(match, {
      thing: new P.ASTVariableExpression(match, { name: "card" }),
      value: pick(),
      isNewVariable: true
    })
    expect(writer.write(card)).toBe("const card = spellCore.randomItemOf() as Card")
    const thing = new P.ASTAssignmentStatement(match, {
      thing: new P.ASTVariableExpression(match, { name: "thing" }),
      value: new P.ASTCoreMethodInvocation(match, { methodName: "randomItemOf" }),
      isNewVariable: true
    })
    expect(writer.write(thing)).toBe(`const thing: ${UNKNOWN} = spellCore.randomItemOf()`)
  })

  test("a list says what it holds:  its class, and a new one", () => {
    const deck = new P.ASTTypeExpression(match, { name: "Deck" })
    const card = new P.ASTTypeExpression(match, { name: "Card" })
    const instanceType = new P.ASTStaticDefinition(match, { type: deck, name: "instanceType", value: card })
    const superType = new P.ASTTypeExpression(match, { name: "List" })
    const declaration = new P.ASTClassDeclaration(match, { type: deck, superType, members: [instanceType] })
    expect(writer.write(declaration)).toMatch(/^export class Deck extends List<Card> \{/)
    expect(P.JSWriter.instance.write(declaration)).toMatch(/^export class Deck extends List \{/)

    const props = new P.ASTObjectLiteral(match)
    props.addProp("instanceType", new P.ASTStringLiteral(match, { value: "Pile", quote: '"' }))
    const piles = new P.ASTNewInstanceExpression(match, {
      type: new P.ASTTypeExpression(match, { name: "List" }),
      props
    })
    expect(writer.write(piles)).toBe(`new List<Pile>({ instanceType: "Pile" })`)
  })

  test("a property of, or a method on, a spellCore call's result is read with `!`", () => {
    const top = () =>
      new P.ASTCoreMethodInvocation(match, {
        methodName: "getItemOf",
        args: [new P.ASTVariableExpression(match, { name: "deck" })]
      })
    const name = new P.ASTPropertyExpression(match, {
      object: top(),
      property: new P.ASTPropertyLiteral(match, "name")
    })
    expect(writer.write(name)).toBe("spellCore.getItemOf(deck)!.name")
    const flip = new P.ASTScopedMethodInvocation(match, { thing: top(), methodName: "flip" })
    expect(writer.write(flip)).toBe("spellCore.getItemOf(deck)!.flip()")
    expect(P.JSWriter.instance.write(name)).toBe("spellCore.getItemOf(deck).name")
  })

  test("TypeScript's names:  methods, functions and variables;  a getter where it's read, not a property", () => {
    const isASuit = new P.ASTScopedMethodInvocation(match, {
      thing: new P.ASTVariableExpression(match, { name: "the_card" }),
      methodName: "is_a_$suit"
    })
    expect(writer.write(isASuit)).toBe("theCard.isASuit()")
    expect(writer.write(new P.ASTMethodInvocation(match, { methodName: "play_from_the_stock_pile" }))).toBe(
      "playFromTheStockPile()"
    )
    expect(P.camelCaseOf("is_the_$rank_of_$suits")).toBe("isTheRankOfSuits")
    expect(P.camelCaseOf("it_2")).toBe("it2")

    const card = new P.ASTTypeExpression(match, { name: "Card" })
    const getter = new P.ASTPropertyDefinition(match, { type: card, property: "short_suit", get: method([]) })
    const property = new P.ASTReactiveProperty(match, { type: card, property: "is_set_up" })
    const read = (name: string) =>
      new P.ASTPropertyExpression(match, { object: new P.ASTSelfLiteral(match), property: name })
    const project = writer.forProject([[new P.ASTClassDeclaration(match, { type: card, members: [getter, property] })]])
    expect(project.write(read("short_suit"))).toBe("this.shortSuit")
    expect(project.write(read("is_set_up"))).toBe("this.is_set_up")
    expect(project.writeAsMember(getter)).toMatch(/^get shortSuit\(\) \{/)
  })

  test("tidy:  template text, no extra parentheses, no braces around one statement", () => {
    const text = (value: string) => new P.ASTStringLiteral(match, { value, quote: '"' })
    const rank = new P.ASTPropertyExpression(match, { object: new P.ASTSelfLiteral(match), property: "rank" })
    const plus = (lhs: P.ASTExpression, rhs: P.ASTExpression) =>
      new P.ASTParenthesizedExpression(match, {
        expression: new P.ASTInfixExpression(match, { lhs, operator: "plus", rhs })
      })
    expect(writer.bare(plus(plus(rank, text("-of-")), rank))).toBe("`${this.rank}-of-${this.rank}`")
    // text only after two values:  they're added first, so it stays `+`
    const one = new P.ASTNumericLiteral(match, 1)
    expect(writer.bare(plus(plus(one, one), text("!")))).toBe('1 + 1 + "!"')

    const isUp = new P.ASTInfixExpression(match, { lhs: rank, operator: "equals", rhs: text("up") })
    const both = new P.ASTInfixExpression(match, {
      lhs: new P.ASTParenthesizedExpression(match, { expression: isUp }),
      operator: "and",
      rhs: new P.ASTParenthesizedExpression(match, { expression: isUp })
    })
    expect(writer.bare(both)).toBe('this.rank == "up" && this.rank == "up"')

    const ifUp = new P.ASTIfStatement(match, {
      condition: isUp,
      statements: new P.ASTReturnStatement(match, { value: text("+") })
    })
    expect(writer.write(ifUp)).toBe('if (this.rank == "up") return "+"')
  })

  test("a list a property's values come from is a typed constant above its class", () => {
    const card = new P.ASTTypeExpression(match, { name: "Card" })
    const suits = new P.ASTStaticDefinition(match, {
      type: card,
      name: "Suits",
      value: new P.ASTArrayLiteral(match, {
        items: [new P.ASTStringLiteral(match, { value: "clubs", quote: "'" })]
      })
    })
    const check = new P.ASTObjectLiteral(match)
    check.addProp("oneOf", new P.ASTPropertyExpression(match, { object: card, property: "Suits" }))
    const suit = new P.ASTReactiveProperty(match, { type: card, property: "suit", check })
    const superType = new P.ASTTypeExpression(match, { name: "Thing" })
    const declaration = new P.ASTClassDeclaration(match, { type: card, superType, members: [suits, suit] })
    const project = writer.forProject([[declaration]])
    expect(project.write(new P.ASTStatementGroup(match, { statements: [declaration] }))).toBe(
      [
        `const SUITS = ["clubs"] as const`,
        ``,
        `export type Suit = (typeof SUITS)[number]`,
        ``,
        `export class Card extends Thing {`,
        `  static Suits = SUITS`,
        `  @prop({ oneOf: SUITS }) accessor suit!: Suit`,
        `}`
      ].join("\n")
    )
  })

  test("JSX is real JSX, by the page's names;  drawing a thing calls its `draw()`", () => {
    const element = new P.ASTJSXElement(match, {
      tagName: "th",
      attrs: [
        new P.ASTJSXAttribute(match, {
          name: "colSpan",
          value: new P.ASTStringLiteral(match, { value: "2", quote: '"' })
        }),
        new P.ASTJSXAttribute(match, {
          name: "className",
          value: new P.ASTStringLiteral(match, { value: "left", quote: '"' })
        })
      ],
      children: [
        new P.ASTJSXExpression(match, {
          expression: new P.ASTCoreMethodInvocation(match, {
            methodName: "drawThing",
            args: [new P.ASTVariableExpression(match, { name: "the_stock" })]
          })
        })
      ]
    })
    // `class` first, as javascript's `spellCore.element()` sets it
    expect(writer.write(element)).toBe(`<th class="left" colspan="2">{theStock.draw()}</th>`)
  })

  test("javascript is unchanged by the type hooks", () => {
    const card = new P.ASTVariableExpression(match, { name: "card", datatype: "Card" })
    expect(P.JSWriter.instance.write(method([card]))).toBe("function play(card) {\n  return 1\n}")
  })
})
