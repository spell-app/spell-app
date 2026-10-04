import { describe, expect, it } from "vitest"
import { P } from "$/parser"
import { unitTestModuleRules } from "$/parser/test"
import { rulex, RulexTokenizer } from "$/parser/rulex"

describe("testing language rulex", () => {
  unitTestModuleRules(rulex, "rulex")

  describe("compile()", () => {
    it("throws when part of the syntax is left unread, naming it", () => {
      expect(() => rulex.compile("x (a|b")).toThrow("rulex couldn't read `(a|b` in `x (a|b`")
      expect(() => rulex.compile("a {b} )")).toThrow("rulex couldn't read `)`")
      expect(() => P.Rule.compileSyntax("give {thing} |")).toThrow("rulex couldn't read `|`")
    })

    it("throws on an unescaped [ { ( that doesn't open a list / subrule / choice", () => {
      expect(() => rulex.compile("[{sub}]")).toThrow("rulex couldn't read `[{sub}]` in `[{sub}]`")
      expect(() => rulex.compile("a {b")).toThrow("rulex couldn't read `{b`")
      expect(() => rulex.compile("[{a},")).toThrow("rulex couldn't read `[{a},`")
      expect(rulex.compile("\\[ {a} \\]")).toBeInstanceOf(P.Sequence)
    })

    it("still compiles a syntax it reads whole", () => {
      expect(rulex.compile("give {thing:expression} (to {recipient})?")).toBeInstanceOf(P.Sequence)
    })

    it("throws on a {space} / {spaces} that doesn't sit between two parts", () => {
      expect(() => rulex.compile("{spaces} a")).toThrow("must sit between two parts")
      expect(() => rulex.compile("a {space}")).toThrow("must sit between two parts")
      expect(() => rulex.compile("a {space}{spaces} b")).toThrow("must sit between two parts")
    })
  })

  /**
   * Spacing as written, at PARSE time:  rules compiled from syntax, matched against plain tokens
   * (`LEADING_ONLY`:  each token carries the inline whitespace after it;  no comments, so `##` and `---` stay
   * symbols, as a markdown tokenizer's would).
   */
  describe("spacing as written", () => {
    class PlainParser extends P.Parser {
      get tokenizer(): P.Tokenizer {
        return this.derived("tokenizer", () => new RulexTokenizer({ whitespacePolicy: P.WhitespacePolicy.LEADING_ONLY }))
      }
    }
    const parser = new PlainParser({ module: "spacing" })
    parser.addRule(new P.Keyword({ name: "word", literal: ["hello", "world", "x", "y"] }))
    for (const [name, syntax] of Object.entries({
      bold: "\\*\\*{word}\\*\\*",
      spacedBold: "\\* \\* {word}",
      link: "\\[{word}\\]\\({word}\\)",
      bullet: "-{spaces}{word}",
      box: "\\[{space}\\]",
      heading: "\\#+{spaces}{word}",
      rule: "- +",
      list: "[{word},]",
      spacedList: "[{word} ,]"
    })) {
      const rule = P.Rule.compileSyntax(syntax)
      rule.name = name
      parser.addRule(rule)
    }

    /** How many tokens of `input` rule `name` matched:  `0` for no match. */
    function matched(name: string, input: string) {
      return parser.parse(input, name)?.length ?? 0
    }

    it("touching in the syntax => touching in the input", () => {
      expect(matched("bold", "**hello**")).toBe(5)
      expect(matched("bold", "* *hello* *")).toBe(0)
      expect(matched("link", "[x](y)")).toBe(6)
      expect(matched("link", "[x] (y)")).toBe(0)
    })

    it("spaced in the syntax => may space, or not", () => {
      expect(matched("spacedBold", "* * hello")).toBe(3)
      expect(matched("spacedBold", "**hello")).toBe(3)
    })

    it("{spaces} needs one or more spaces;  {space} exactly one", () => {
      expect(matched("bullet", "- hello")).toBe(2)
      expect(matched("bullet", "-   hello")).toBe(2)
      expect(matched("bullet", "-hello")).toBe(0)
      expect(matched("box", "[ ]")).toBe(2)
      expect(matched("box", "[]")).toBe(0)
      expect(matched("box", "[  ]")).toBe(0)
    })

    it("a symbol touching its flag repeats as a run;  spaced, its copies may space", () => {
      expect(matched("heading", "## hello")).toBe(3)
      // `# # hello`:  the run is one `#`, then `#` isn't a word
      expect(matched("heading", "# # hello")).toBe(0)
      expect(matched("rule", "- - -")).toBe(3)
      expect(matched("rule", "---")).toBe(3)
    })

    it("a list's delimiter spaces as written", () => {
      expect(matched("list", "x, y")).toBe(3)
      expect(matched("list", "x , y")).toBe(1)
      expect(matched("spacedList", "x , y")).toBe(3)
    })
  })
})
