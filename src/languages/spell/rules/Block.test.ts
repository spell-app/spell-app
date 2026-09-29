import { describe, test, expect } from "vitest"

import { SP, spellParser } from "~/languages/spell"

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
      "/*! SPELL: DECLARES {",
      '  type: "Card", superType: "Thing",',
      "} */",
      "/** a playing card */",
      "export class Card extends Thing {}"
    ])
    expect(
      compile("// a playing card\n// from a deck\na card is a thing // not part of it:  there's one above")
    ).toEqual([
      "/*! SPELL: DECLARES {",
      '  type: "Card", superType: "Thing",',
      "} */",
      "/**",
      " * a playing card",
      " * from a deck",
      " */",
      // not part of the docstring, so it stays a plain comment
      "// not part of it:  there's one above",
      "export class Card extends Thing {}"
    ])
  })

  test("a statement's `/*! SPELL: DECLARES` comment goes ABOVE its docstring, which sits right on its code", () => {
    const property = compile("a card is a thing\n\n// card ranks\ncards have a rank as one of ace or king")
    const propertyDoc = property.indexOf("/** card ranks */")
    // the comment closes right above the docstring
    expect(property.slice(propertyDoc - 4, propertyDoc + 2)).toEqual([
      "/*! SPELL: DECLARES {",
      '  property: "rank", classVariable: "Ranks", rule: "enumeration", of: "Card",',
      "  enumeration: [\"'ace'\", \"'king'\"],",
      "} */",
      "/** card ranks */",
      "spellCore.defineProperty(Card.prototype, {"
    ])

    const method = compile("// say hello\nto greet: print 1")
    const methodDoc = method.indexOf("/** say hello */")
    expect(method.slice(0, methodDoc + 2)).toEqual([
      "/*! SPELL: DECLARES {",
      '  syntax: "greet", output: "greet", rule: "method_call", alias: ["statement", "expression"],',
      '  kind: "function",',
      "} */",
      "/** say hello */",
      "export function greet() {"
    ])
  })

  test("a `##` heading followed by a regular comment is a banner as wide as its text", () => {
    expect(compile("## Cards\n// a playing card\na card is a thing")).toEqual([
      "///////////",
      "// ## Cards",
      "///////////",
      "/*! SPELL: DECLARES {",
      '  type: "Card", superType: "Thing",',
      "} */",
      "/** a playing card */",
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
