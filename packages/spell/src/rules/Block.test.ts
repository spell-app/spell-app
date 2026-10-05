import { describe, test, expect } from "vite-plus/test"

import { P } from "$/parser"
import { SP, spellParser } from "$/spell"

/** Docstrings `getDocComments()` finds in `text`, by the text of the statement each documents. */
function docsOf(text: string): Record<string, string[]> {
  const block = spellParser.getScope("doc-comments").parse(text, "block")!
  const docs: Record<string, string[]> = {}
  for (const [statement, { lines }] of (block.rule as SP.Block).getDocComments(block))
    docs[statement.inputText.trim()] = lines
  return docs
}

/** `text` parsed as a block, compiled, as lines. */
function compile(text: string): string[] {
  return (spellParser.getScope("doc-comments-compile").parse(text, "block")!.compile() as string).split("\n")
}

describe("docstrings:  comments documenting a declaration", () => {
  test("the comment-only lines directly above, run together", () => {
    expect(docsOf("// a playing card\n-- from a deck\na card is a thing")).toEqual({
      "a card is a thing": ["a playing card", "from a deck"]
    })
  })

  test("a `##` heading only if it's directly above -- and nothing above a heading joins", () => {
    expect(docsOf("## Cards\na card is a thing")).toEqual({ "a card is a thing": ["Cards"] })
    expect(docsOf("## Cards\n// a playing card\na card is a thing")).toEqual({
      "a card is a thing": ["a playing card"]
    })
    expect(docsOf("// intro\n## Cards\na card is a thing")).toEqual({ "a card is a thing": ["Cards"] })
  })

  test("NOT across a blank line", () => {
    expect(docsOf("// about cards\n\na card is a thing")).toEqual({})
  })

  test("else the comment at the end of its own line -- one above wins", () => {
    expect(docsOf("a card is a thing // a playing card")).toEqual({ "a card is a thing": ["a playing card"] })
    expect(docsOf("// above\na card is a thing // same line")).toEqual({ "a card is a thing": ["above"] })
  })

  test("only for a statement that DECLARES something", () => {
    expect(docsOf("// just printing\nprint 1")).toEqual({})
  })
})

describe("compiling docstrings and headings", () => {
  test("a docstring is one JSDoc comment above its declaration, instead of its `//` lines", () => {
    expect(compile("// a playing card\na card is a thing")).toEqual([
      "/** a playing card */",
      "/*! SPELL: DECLARES {",
      '  type: "Card", superType: "Thing",',
      "} */",
      "export class Card extends Thing {}"
    ])
    expect(
      compile("// a playing card\n// from a deck\na card is a thing // not part of it:  there's one above")
    ).toEqual([
      "/**",
      " * a playing card",
      " * from a deck",
      " */",
      "/*! SPELL: DECLARES {",
      '  type: "Card", superType: "Thing",',
      "} */",
      // not part of the docstring, so it stays a plain comment
      "// not part of it:  there's one above",
      "export class Card extends Thing {}"
    ])
  })

  test("a docstring goes ABOVE the statement's `/*! SPELL: DECLARES` comment, which sits right on its code", () => {
    const method = compile("// say hello\nto greet: print 1")
    expect(method.slice(0, method.indexOf("export function greet() {") + 1)).toEqual([
      "/** say hello */",
      "/*! SPELL: DECLARES {",
      '  syntax: "greet", output: "greet", rule: "method_call", alias: ["statement", "expression"],',
      '  kind: "function",',
      "} */",
      "export function greet() {"
    ])

    // in a class body too
    const property = compile("a card is a thing\n\n// card ranks\ncards have a rank as one of ace or king")
    const propertyDoc = property.indexOf("  /** card ranks */")
    expect(property.slice(propertyDoc, propertyDoc + 5)).toEqual([
      "  /** card ranks */",
      "  /*! SPELL: DECLARES {",
      '    property: "rank", classVariable: "Ranks", of: "Card", enumeration: ["\'ace\'", "\'king\'"],',
      "  } */",
      "  static Ranks = ['ace', 'king']"
    ])
  })

  test("a `##` heading followed by a regular comment is a banner as wide as its text", () => {
    expect(compile("## Cards\n// a playing card\na card is a thing")).toEqual([
      "///////////",
      "// ## Cards",
      "///////////",
      "/** a playing card */",
      "/*! SPELL: DECLARES {",
      '  type: "Card", superType: "Thing",',
      "} */",
      "export class Card extends Thing {}"
    ])
    // ...even when nothing is declared after it
    expect(compile("## Setup\n// print it\nprint 1")).toEqual([
      "///////////",
      "// ## Setup",
      "///////////",
      "// print it",
      "spellCore.console.log(1)"
    ])
  })

  test("a comment that documents nothing compiles as it was", () => {
    expect(compile("// just printing\nprint 1")).toEqual(["// just printing", "spellCore.console.log(1)"])
    expect(compile("## Cards\n\nprint 1")).toEqual(["//## Cards", "", "spellCore.console.log(1)"])
  })
})

describe("class members go in their class's body", () => {
  /** `text` compiled as a block, without its `SPELL: DECLARES` comments, as lines. */
  function code(text: string): string[] {
    return SP.SpellDeclarations.stripComments(compile(text).join("\n")).split("\n")
  }

  test("each member, a blank line between -- from below other code, which stays where it was", () => {
    const text = [
      "a task is a thing",
      "a task has a title as text",
      "",
      "task = a new task",
      "print task",
      "",
      "// draw it",
      "to draw (a task): print 1",
      "",
      "print 2"
    ]
    expect(code(text.join("\n"))).toEqual([
      "export class Task extends Thing {",
      "  static { this.declareProp('title', { type: 'text' }) }",
      "  get title() { return this.getProp('title') }",
      "  set title(value) { this.setProp('title', value) }",
      "",
      "  /** draw it */",
      "  draw() {",
      "    return spellCore.console.log(1)",
      "  }",
      "}",
      "",
      "export let task = new Task()",
      "spellCore.console.log(task)",
      "",
      "spellCore.console.log(2)"
    ])
  })

  test("a member declared ABOVE its class", () => {
    expect(code("cards have a rank as text\na card is a thing")).toEqual([
      "export class Card extends Thing {",
      "  static { this.declareProp('rank', { type: 'text' }) }",
      "  get rank() { return this.getProp('rank') }",
      "  set rank(value) { this.setProp('rank', value) }",
      "}"
    ])
  })

  test("comments directly above a member go with it, e.g. a banner", () => {
    const text = [
      "a card is a thing",
      "",
      "## Properties",
      "// of cards",
      "",
      "cards have a rank as text",
      "",
      "print 1"
    ]
    expect(code(text.join("\n"))).toEqual([
      "export class Card extends Thing {",
      "  ////////////////",
      "  // ## Properties",
      "  ////////////////",
      "  // of cards",
      "",
      "  static { this.declareProp('rank', { type: 'text' }) }",
      "  get rank() { return this.getProp('rank') }",
      "  set rank(value) { this.setProp('rank', value) }",
      "}",
      "",
      "spellCore.console.log(1)"
    ])
  })

  test("a subclass's property overrides its parent's getter, each in its own class", () => {
    const text = [
      "a card is a thing",
      "the color of a card is its suit",
      "a joker is a card",
      "jokers have a color as either red or black"
    ]
    expect(code(text.join("\n"))).toEqual([
      "export class Card extends Thing {",
      "  get color() {",
      "    return this.suit",
      "  }",
      "}",
      "export class Joker extends Card {",
      "  static Colors = ['red', 'black']",
      "  static { this.declareProp('color', { oneOf: Joker.Colors }) }",
      "  get color() { return this.getProp('color') }",
      "  set color(value) { this.setProp('color', value) }",
      "}"
    ])
  })

  test("across a project's files -- without changing either file's own AST", () => {
    const scope = spellParser.getScope("hoist-across-files")
    const cardFile = scope.parse("a card is a thing\nprint 1", "block")!
    const pileFile = scope.parse("a pile is a list of cards\nto flip (a card): print 2\nprint 3", "block")!
    const [cardAST, pileAST] = [cardFile.AST, pileFile.AST] as P.ASTStatementGroup[]
    const cardBefore = cardAST.compile()
    const combined = SP.SpellDeclarations.stripComments(SP.SpellProject.combineCompiled([cardAST, pileAST]))
    expect(combined.split("\n")).toEqual([
      "export class Card extends Thing {",
      "  flip() {",
      "    return spellCore.console.log(2)",
      "  }",
      "}",
      "spellCore.console.log(1)",
      "// -----------",
      "export class Pile extends List {",
      "  static instanceType = Card",
      "}",
      "spellCore.console.log(3)"
    ])
    expect(cardAST.compile()).toBe(cardBefore)
  })
})

describe("headings, as the program runs:  `spellCore.heading()`", () => {
  /** `text` compiled as a FILE's top level -- no `SPELL: DECLARES` comments -- as lines. */
  function fileCode(text: string): string[] {
    const scope = new P.FileScope({ name: "Cards.spell", parentScope: spellParser.getScope("headings") })
    const compiled = scope.parse(text, "block")!.compile() as string
    return SP.SpellDeclarations.stripComments(compiled).split("\n")
  }

  test("each heading at a file's top level, above its own lines -- NOT a `#####` rule", () => {
    expect(fileCode(["## Set up", "deck = 1", "", "##########", "## Play", "print deck"].join("\n"))).toEqual([
      'spellCore.heading("Set up")',
      "/** Set up */",
      "export let deck = 1",
      "",
      "//##########",
      'spellCore.heading("Play")',
      "//## Play",
      "spellCore.console.log(deck)"
    ])
  })

  test("NOT in a plain block, e.g. a rule test's", () => {
    expect(compile("## Set up\ndeck = 1").join("\n")).not.toContain("spellCore.heading")
  })

  test("its comments still go with the member below -- the call stays, and one with nothing after it goes", () => {
    const text = [
      "a card is a thing",
      "",
      "##########",
      "## Properties",
      "// of cards",
      "cards have a rank as text",
      "",
      "## Dealing",
      "print 1"
    ]
    expect(fileCode(text.join("\n"))).toEqual([
      "export class Card extends Thing {",
      "  //##########",
      "  ////////////////",
      "  // ## Properties",
      "  ////////////////",
      "  /** of cards */",
      "  static { this.declareProp('rank', { type: 'text' }) }",
      "  get rank() { return this.getProp('rank') }",
      "  set rank(value) { this.setProp('rank', value) }",
      "}",
      "",
      'spellCore.heading("Dealing")',
      "//## Dealing",
      "spellCore.console.log(1)"
    ])
  })
})
