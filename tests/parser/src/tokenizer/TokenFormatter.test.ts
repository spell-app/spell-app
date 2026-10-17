import { describe, test, expect } from "vite-plus/test"

import { P } from "$/parser"

/** Spell's punctuation spacing, as `SpellLanguageService.FORMAT_SPACING` sets it. */
const SPACING = { spaceAfter: [",", ":"], noSpaceBefore: [",", ":", ")", "]"], noSpaceAfter: ["(", "["] }

/** `text` formatted with spell's spacing and `props`. */
function format(text: string, props: Partial<P.TokenFormatterProps> = {}): string {
  return new P.TokenFormatter({ tokenizer: new P.Tokenizer(), ...SPACING, ...props }).format(text)
}

describe("TokenFormatter", () => {
  describe("indentation", () => {
    test("one tab per level, whatever the text used", () => {
      expect(format("to foo:\n    if x:\n        print 1\n    print 2\n")).toBe(
        "to foo:\n\tif x:\n\t\tprint 1\n\tprint 2\n"
      )
    })

    test("or the indent it's given", () => {
      expect(format("to foo:\n\tprint 1\n", { indent: "  " })).toBe("to foo:\n  print 1\n")
    })

    test("a dedent between levels keeps every line's own indentation", () => {
      // the parser nests `c` inside the block `b` opened, which levels can't say
      expect(format("a\n    b\n  c  d\n")).toBe("a\n    b\n  c d\n")
    })
  })

  describe("spacing", () => {
    test("one space between words, none at the end of a line", () => {
      expect(format("set  x\tto   1   \n")).toBe("set x to 1\n")
    })

    test("one space after `,` and `:`, none before them or just inside brackets", () => {
      expect(format("to draw ( a card ) :\n\tprint a ,b ,c\n\tif x :y\n")).toBe(
        "to draw (a card):\n\tprint a, b, c\n\tif x: y\n"
      )
    })

    test("tokens that touch stay touching, unless punctuation says otherwise", () => {
      expect(format("a+b\n")).toBe("a+b\n")
    })
  })

  describe("left as written", () => {
    test("strings", () => {
      expect(format('print  "a  ,  b"\n')).toBe('print "a  ,  b"\n')
    })

    test("comments, and the gap before a comment at the end of a line", () => {
      expect(format("set x to 1     //   lined  up\n//  whole ,line\n")).toBe(
        "set x to 1     //   lined  up\n//  whole ,line\n"
      )
    })

    test("JSX, even across lines", () => {
      const jsx = "return <div  a=1>\n      {x  ,y}\n  </div>\n"
      expect(format(`to draw:\n    ${jsx}`)).toBe(`to draw:\n\t${jsx}`)
    })
  })

  describe("blank lines", () => {
    test("at most 2 in a row, with no whitespace on them", () => {
      expect(format("a\n\n\t\n  \n\nb\n")).toBe("a\n\n\nb\n")
    })

    test("trailing ones dropped with `trimFinalBlankLines`", () => {
      expect(format("a\n\n\n", { trimFinalBlankLines: true })).toBe("a\n")
      expect(format("a\n\n\n")).toBe("a\n\n\n")
    })
  })

  test("per line, by offsets in the original text -- a dropped blank line is `undefined`", () => {
    const formatter = new P.TokenFormatter({ tokenizer: new P.Tokenizer(), maxBlankLines: 0 })
    expect(formatter.formatLines("a  b\n\nc")).toEqual([
      { start: 0, end: 4, next: 5, text: "a b" },
      { start: 5, end: 5, next: 6, text: undefined },
      { start: 6, end: 7, next: 7, text: "c" }
    ])
  })

  test("formatting twice changes nothing more", () => {
    const text = "to  draw ( a card ):\n    set x to 1 ,2\n\n\n\n        print x   // note\n"
    expect(format(format(text))).toBe(format(text))
  })

  test("`sameTokens()` sees any change but whitespace", () => {
    const tokenizer = new P.Tokenizer()
    expect(P.TokenFormatter.sameTokens(tokenizer, "a  b,c", "a b, c")).toBe(true)
    expect(P.TokenFormatter.sameTokens(tokenizer, "a b", "ab")).toBe(false)
  })
})
