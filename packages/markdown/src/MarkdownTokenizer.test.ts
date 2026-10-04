import { describe, expect, it } from "vitest"

import { P } from "$/parser"
import { MD } from "$/markdown"

/** `text`'s tokens as `Type(value)`, whitespace after shown as `·`. */
function tokens(text: string) {
  return new MD.MarkdownTokenizer()
    .tokenize(text)
    .map((token) => `${token.constructor.name.replace(/Token$/, "")}(${token.value})${token.whitespace ? "·" : ""}`)
}

describe("MarkdownTokenizer", () => {
  it("words are letters and digits, any script;  everything else one symbol each", () => {
    expect(tokens("snake_case café 42")).toEqual(["Word(snake)", "Symbol(_)", "Word(case)·", "Word(café)·", "Word(42)"])
    expect(tokens("**bold**")).toEqual(["Symbol(*)", "Symbol(*)", "Word(bold)", "Symbol(*)", "Symbol(*)"])
  })

  it("no comments, quotes, JSX or numbers:  just symbols and words", () => {
    expect(tokens('--- // "x" <b> 1.')).toEqual([
      "Symbol(-)",
      "Symbol(-)",
      "Symbol(-)·",
      "Symbol(/)",
      "Symbol(/)·",
      'Symbol(")',
      "Word(x)",
      'Symbol(")·',
      "Symbol(<)",
      "Word(b)",
      "Symbol(>)·",
      "Word(1)",
      "Symbol(.)"
    ])
    expect(tokens("# Title")).toEqual(["Symbol(#)·", "Word(Title)"])
  })

  it("keeps indents and newlines as tokens;  inline spaces ride on the token before", () => {
    const list = new MD.MarkdownTokenizer().tokenize("- a\n  b")
    expect(list.map((token) => token.constructor.name)).toEqual([
      "SymbolToken",
      "WordToken",
      "NewlineToken",
      "IndentToken",
      "WordToken"
    ])
    expect(list[0]!.whitespace).toBe(" ")
    expect(list[3]).toBeInstanceOf(P.IndentToken)
  })

  it("leaves ¬ and ∆ alone", () => {
    expect(tokens("¬∆")).toEqual(["Symbol(¬)", "Symbol(∆)"])
  })
})

describe("normalize()", () => {
  it("unix line ends, and a final newline", () => {
    expect(MD.normalize("a\r\nb\rc")).toBe("a\nb\nc\n")
    expect(MD.normalize("a\n")).toBe("a\n")
  })
})
