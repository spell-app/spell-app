import { describe, expect, test } from "vite-plus/test"

import { P } from "$/parser"

/**
 * `TSWriter`:  TypeScript on Solid, as a person writes it.
 * - Whole projects, checked by `tsc`:  spell's `src/test/typescript.test.ts`.
 * - Run on both targets:  the core contract, `contract.test.ts` in `$/cli`.
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

  test("an item read from spellCore says its type as a type argument, when spell knows it", () => {
    const pick = () => new P.ASTCoreMethodInvocation(match, { methodName: "randomItemOf", datatype: "Card" })
    const card = new P.ASTAssignmentStatement(match, {
      thing: new P.ASTVariableExpression(match, { name: "card" }),
      value: pick(),
      isNewVariable: true
    })
    expect(writer.write(card)).toBe("const card = spellCore.randomItemOf<Card>()")
    const thing = new P.ASTAssignmentStatement(match, {
      thing: new P.ASTVariableExpression(match, { name: "thing" }),
      value: new P.ASTCoreMethodInvocation(match, { methodName: "randomItemOf" }),
      isNewVariable: true
    })
    // core types it from the list:  `T | undefined`
    expect(writer.write(thing)).toBe("const thing = spellCore.randomItemOf()")
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

  test("a property of, or a method on, an item read from a list is read with `?.`:  it may be nothing", () => {
    const top = () =>
      new P.ASTCoreMethodInvocation(match, {
        methodName: "getItemAt",
        args: [new P.ASTVariableExpression(match, { name: "deck" })]
      })
    const name = new P.ASTPropertyExpression(match, {
      object: top(),
      property: new P.ASTPropertyLiteral(match, "name")
    })
    expect(writer.write(name)).toBe("spellCore.getItemAt(deck)?.name")
    const flip = new P.ASTScopedMethodInvocation(match, { thing: top(), methodName: "flip" })
    expect(writer.write(flip)).toBe("spellCore.getItemAt(deck)?.flip()")
    expect(P.JSWriter.instance.write(name)).toBe("spellCore.getItemAt(deck)?.name")
  })

  test("TypeScript's names:  every member camelCase, stored properties too;  functions and variables", () => {
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
    expect(project.write(read("is_set_up"))).toBe("this.isSetUp")
    expect(project.writeAsMember(getter)).toMatch(/^get shortSuit\(\) \{/)
    expect(project.writeAsMember(property)).toMatch(/accessor isSetUp!/)
    // with no project to say which it is, the same:  one rule for every member
    expect(writer.write(read("is_set_up"))).toBe("this.isSetUp")
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
    // `class` first, as javascript's `h()` calls give it
    expect(writer.write(element)).toBe(`<th class="left" colspan="2">{theStock.draw()}</th>`)
  })

  test("an arrow's parameter spell can't type is left to TypeScript", () => {
    const each = new P.ASTMethodDefinition(match, {
      inline: true,
      args: [new P.ASTVariableExpression(match, { name: "number" })],
      body: new P.ASTVariableExpression(match, { name: "number" })
    })
    expect(writer.write(each)).toBe("(number) => number")
    const card = new P.ASTVariableExpression(match, { name: "card", datatype: "Card" })
    expect(writer.write(new P.ASTMethodDefinition(match, { inline: true, args: [card], body: card }))).toBe(
      "(card: Card) => card"
    )
    const last = new P.ASTCoreMethodInvocation(match, {
      methodName: "getItemAt",
      args: [new P.ASTVariableExpression(match, { name: "deck" }), new P.ASTNumericLiteral(match, -1)]
    })
    expect(writer.write(new P.ASTPropertyExpression(match, { object: last, property: "name" }))).toBe(
      "spellCore.getItemAt(deck, -1)?.name"
    )
  })

  test("named arguments and an event's payload are typed by what spell says they hold", () => {
    const props = new P.ASTVariableExpression(match, { name: "props", default: new P.ASTObjectLiteral(match) })
    const title = new P.ASTVariableExpression(match, { name: "title", datatype: "text" })
    const create = new P.ASTMethodDefinition(match, {
      methodName: "create_a_new_task",
      args: [props],
      body: new P.ASTDestructuredAssignment(match, {
        thing: new P.ASTVariableExpression(match, { name: "props" }),
        variables: [title],
        isNewVariable: true
      })
    })
    expect(writer.write(create)).toBe(
      "function createANewTask(props: { title?: string } = {}) {\n  const { title } = props\n}"
    )
  })

  test("a value a class is given when made, or a method its sub-classes all define, is declared for TypeScript", () => {
    const type = (name: string) => new P.ASTTypeExpression(match, { name })
    const pile = new P.ASTClassDeclaration(match, { type: type("Pile"), superType: type("List") })
    const stock = new P.ASTClassDeclaration(match, { type: type("Stock"), superType: type("Pile") })
    const tableau = new P.ASTClassDeclaration(match, { type: type("Tableau"), superType: type("Pile") })
    const made = (name: string) =>
      new P.ASTNewInstanceExpression(match, {
        type: type(name),
        props: new P.ASTObjectLiteral(match, {
          properties: [
            new P.ASTObjectLiteralProperty(match, {
              property: "droppable",
              value: new P.ASTBooleanLiteral(match, true)
            })
          ]
        })
      })
    const project = writer.forProject([[pile, stock, tableau, made("Stock"), made("Tableau")]])
    expect(project.write(pile)).toBe("export class Pile extends List {\n  declare droppable: boolean\n}")
  })

  test("a property the program never types is typed by every value it's given:  made with it, or set (Q54)", () => {
    const type = (name: string) => new P.ASTTypeExpression(match, { name })
    const text = (value: string) => new P.ASTStringLiteral(match, { value, quote: '"' })
    const named = (made: string, value: P.ASTExpression) =>
      new P.ASTNewInstanceExpression(match, {
        type: type(made),
        props: new P.ASTObjectLiteral(match, {
          properties: [new P.ASTObjectLiteralProperty(match, { property: "name", value })]
        })
      })
    // `set the name of the pile to ...`, on a parameter spell knows is a tableau
    const setName = (value: P.ASTExpression) =>
      new P.ASTMethodDefinition(match, {
        methodName: "rename",
        args: [new P.ASTVariableExpression(match, { name: "pile", datatype: "Tableau" })],
        body: new P.ASTAssignmentStatement(match, {
          thing: new P.ASTPropertyExpression(match, {
            object: new P.ASTVariableExpression(match, { name: "pile" }),
            property: "name"
          }),
          value
        })
      })
    const pileWith = (...given: P.ASTNode[]) => {
      const name = new P.ASTReactiveProperty(match, { type: type("Pile"), property: "name" })
      const pile = new P.ASTClassDeclaration(match, { type: type("Pile"), superType: type("List"), members: [name] })
      const stock = new P.ASTClassDeclaration(match, { type: type("Stock"), superType: type("Pile") })
      const tableau = new P.ASTClassDeclaration(match, { type: type("Tableau"), superType: type("Pile") })
      return writer.forProject([[pile, stock, tableau, ...given]]).write(pile)
    }
    const pileOf = (name: string) => `export class Pile extends List {\n  @prop() accessor name!: ${name}\n}`

    // all text:  given when made, set, and read off another pile (which says nothing new)
    const another = new P.ASTPropertyExpression(match, {
      object: new P.ASTVariableExpression(match, { name: "other", datatype: "Pile" }),
      property: "name"
    })
    expect(pileWith(named("Stock", text("stock")), setName(text("tableau")), setName(another))).toBe(pileOf("string"))
    // mixed, text and a number:  the marker
    expect(pileWith(named("Stock", text("stock")), named("Tableau", new P.ASTNumericLiteral(match, 1)))).toBe(
      pileOf(UNKNOWN)
    )
    expect(pileWith(named("Stock", text("stock")), setName(new P.ASTNumericLiteral(match, 1)))).toBe(pileOf(UNKNOWN))
    // one it can't tell:  the marker
    const unknown = new P.ASTVariableExpression(match, { name: "x" })
    expect(pileWith(named("Stock", text("stock")), setName(unknown))).toBe(pileOf(UNKNOWN))
    // nothing given:  the marker
    expect(pileWith()).toBe(pileOf(UNKNOWN))
  })

  test("a method only its sub-classes define is typed by what they all return (Q54)", () => {
    const type = (name: string) => new P.ASTTypeExpression(match, { name })
    const card = () => new P.ASTVariableExpression(match, { name: "card", datatype: "Card" })
    const canPlay = (owner: string, ...returns: P.ASTExpression[]) =>
      new P.ASTPropertyDefinition(match, {
        type: owner,
        property: "can_play_$card",
        method: new P.ASTMethodDefinition(match, {
          methodName: "can_play_$card",
          args: [card()],
          body: new P.ASTStatementBlock(match, {
            statements: returns.map((value) => new P.ASTReturnStatement(match, { value }))
          })
        })
      })
    const pileWith = (stockReturns: P.ASTExpression[], tableauReturns: P.ASTExpression[]) => {
      const pile = new P.ASTClassDeclaration(match, { type: type("Pile"), superType: type("List") })
      const stock = new P.ASTClassDeclaration(match, {
        type: type("Stock"),
        superType: type("Pile"),
        members: [canPlay("Stock", ...stockReturns)]
      })
      const tableau = new P.ASTClassDeclaration(match, {
        type: type("Tableau"),
        superType: type("Pile"),
        members: [canPlay("Tableau", ...tableauReturns)]
      })
      return writer.forProject([[pile, stock, tableau]]).write(pile)
    }
    const pileOf = (returns: string) =>
      `export class Pile extends List {}\nexport interface Pile {\n  canPlayCard(card: Card): ${returns}\n}`
    const no = new P.ASTBooleanLiteral(match, false)
    const isCard = new P.ASTInfixExpression(match, { lhs: card(), operator: "equals", rhs: card() })
    const both = new P.ASTInfixExpression(match, { lhs: isCard, operator: "and", rhs: no })

    // a comparison, `and`, `no`:  all choices
    expect(pileWith([no], [isCard, both])).toBe(pileOf("boolean"))
    // they disagree:  the marker
    expect(pileWith([no], [new P.ASTNumericLiteral(match, 1)])).toBe(pileOf(UNKNOWN))
    // one can't be told:  the marker
    expect(pileWith([no], [new P.ASTVariableExpression(match, { name: "x" })])).toBe(pileOf(UNKNOWN))
  })

  test("a spell List does it itself:  filter, first and last item, a loop that waits", () => {
    const type = (name: string) => new P.ASTTypeExpression(match, { name })
    const piles = () => new P.ASTVariableExpression(match, { name: "all_piles" })
    const made = new P.ASTAssignmentStatement(match, {
      thing: piles(),
      value: new P.ASTNewInstanceExpression(match, { type: type("List") }),
      isNewVariable: true
    })
    const project = writer.forProject([[made]])
    const core = (methodName: string, args: P.ASTExpression[]) =>
      new P.ASTCoreMethodInvocation(match, { methodName, args })
    const keep = new P.ASTMethodDefinition(match, {
      inline: true,
      args: [new P.ASTVariableExpression(match, { name: "pile", datatype: "Pile" })],
      body: new P.ASTPropertyExpression(match, {
        object: new P.ASTVariableExpression(match, { name: "pile" }),
        property: "droppable"
      })
    })
    expect(project.write(core("filter", [piles(), keep]))).toBe("allPiles.filter((pile) => pile.droppable)")
    expect(project.write(core("getItemAt", [piles(), new P.ASTNumericLiteral(match, -1)]))).toBe("allPiles.lastItem")
    expect(project.write(core("isEmpty", [piles()]))).toBe("allPiles.isEmpty")
  })

  test("comparisons:  === where both sides are alike, a choice bare, nothing === undefined", () => {
    const text = (value: string) => new P.ASTStringLiteral(match, { value, quote: '"' })
    const is = (lhs: P.ASTExpression, rhs: P.ASTExpression) =>
      new P.ASTInfixExpression(match, { lhs, operator: "equals", rhs })
    expect(writer.bare(is(text("a"), text("b")))).toBe('"a" === "b"')
    const done = new P.ASTVariableExpression(match, { name: "done", datatype: "choice" })
    expect(writer.bare(is(done, new P.ASTBooleanLiteral(match, true)))).toBe("done")
    expect(writer.bare(is(done, new P.ASTBooleanLiteral(match, false)))).toBe("!done")
    const unknown = new P.ASTVariableExpression(match, { name: "x" })
    expect(writer.bare(is(unknown, new P.ASTNothingLiteral(match)))).toBe("x === undefined")
    expect(writer.bare(is(unknown, new P.ASTNumericLiteral(match, 2)))).toBe("x == 2")
  })

  test("text that isn't empty:  `!!x`, and bare in an `if`", () => {
    const right = new P.ASTVariableExpression(match, { name: "right", datatype: "text" })
    const isEmpty = new P.ASTCoreMethodInvocation(match, { methodName: "isEmpty", args: [right] })
    const notEmpty = new P.ASTNotExpression(match, { expression: isEmpty })
    expect(writer.bare(isEmpty)).toBe("!right")
    expect(writer.bare(notEmpty)).toBe("!!right")
    expect(writer.condition(notEmpty)).toBe("right")
  })

  test("an event:  trigger() and on() from core, the payload's type a type argument", () => {
    const event = new P.ASTVariableExpression(match, { name: "event" })
    const card = new P.ASTVariableExpression(match, { name: "card", datatype: "Card" })
    const handler = new P.ASTMethodDefinition(match, {
      inline: true,
      args: [event],
      body: new P.ASTStatementBlock(match, {
        statements: [
          new P.ASTDestructuredAssignment(match, {
            thing: new P.ASTVariableExpression(match, { name: "event" }),
            variables: [card],
            isNewVariable: true
          }),
          new P.ASTScopedMethodInvocation(match, {
            thing: new P.ASTVariableExpression(match, { name: "card" }),
            methodName: "play"
          })
        ]
      })
    })
    const on = new P.ASTCoreMethodInvocation(match, {
      methodName: "on",
      args: [new P.ASTQuotedExpression(match, "card-click"), handler]
    })
    expect(writer.write(on)).toBe(`on<{ card: Card }>("card-click", ({ card }) => card.play())`)
  })

  test("javascript is unchanged by the type hooks", () => {
    const card = new P.ASTVariableExpression(match, { name: "card", datatype: "Card" })
    expect(P.JSWriter.instance.write(method([card]))).toBe("function play(card) {\n  return 1\n}")
  })
})
