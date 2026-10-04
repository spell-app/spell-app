import { describe, test, expect } from "vitest"
import { proto } from "$/util"
import { P, Match, Parser, Tokenizer, WhitespacePolicy } from "$/parser"
// These tests define rules with rulex `syntax`, so they must opt into the rulex parser.
import "$/parser/rulex"

const tokenizer = new Tokenizer({
  whitespacePolicy: WhitespacePolicy.NONE
})
const { tokenize } = tokenizer

describe("P.Symbol", () => {
  describe("on construction", () => {
    test("creates proper rule when passed literal as an object", () => {
      const rule = new P.Symbol({ literal: ">" })
      expect(rule).toBeInstanceOf(P.Symbol)
      expect(rule.literal).toEqual(">")
    })

    test("creates proper rule when passed single symbol as a string", () => {
      const rule = new P.Symbol(">")
      expect(rule).toBeInstanceOf(P.Symbol)
      expect(rule.literal).toEqual(">")
    })

    test("creates proper rule when passed multiple symbols as an array", () => {
      const rule = new P.Symbol([">", "="])
      expect(rule).toBeInstanceOf(P.Symbol)
      expect(rule.literal).toEqual([">", "="])
    })
  })
})

describe("P.Symbols", () => {
  describe("on construction", () => {
    test("creates proper rule when passed literals as an object", () => {
      const rule = new P.Symbols({ literals: [">"] })
      expect(rule).toBeInstanceOf(P.Symbols)
      expect(rule.literals).toEqual([{ literal: ">" }])
    })

    test("creates proper rule when passed single symbol as a string", () => {
      const rule = new P.Symbols(">")
      expect(rule).toBeInstanceOf(P.Symbols)
      expect(rule.literals).toEqual([{ literal: ">" }])
    })

    test("creates proper rule when passed multiple symbols as a string", () => {
      const rule = new P.Symbols([">", "="])
      expect(rule).toBeInstanceOf(P.Symbols)
      expect(rule.literals).toEqual([{ literal: ">" }, { literal: "=" }])
    })
  })

  const parser = new Parser()
  const scope = parser.getScope()
  describe("with a single symbol", () => {
    describe("matchAtStart() method", () => {
      const rule = new P.Symbols(">")
      test("returns a non-zero number if present at the start of tokens", () => {
        const test = rule.matchAtStart(tokenize(">"))
        expect(test).toBe(1)
      })

      test("returns 0 if not present at the start of tokens", () => {
        const test = rule.matchAtStart(tokenize("a > b"))
        expect(test).toBe(0)
      })
    })

    describe("test() method", () => {
      describe("tested at start", () => {
        const rule = new P.Symbols(">")
        test("returns false if present at the start of tokens", () => {
          const test = rule.test(scope, tokenize(">"))
          expect(test).toBe(true)
        })

        test("returns false if not present at the start of tokens", () => {
          const test = rule.test(scope, tokenize("a > b"))
          expect(test).toBe(false)
        })
      })
    })
    describe("parse() method", () => {
      const rule = new P.Symbols(">")
      test("parses at the start of tokens", () => {
        const match = rule.parse(scope, tokenize(">"))!
        expect(match.length).toBe(1)
        expect(match.compile()).toBe(">")
      })

      test("does not parse in the middle of tokens", () => {
        const match = rule.parse(scope, tokenize("=>"))
        expect(match).toBeUndefined()
      })
    })
  })

  describe("with multiple symbols", () => {
    describe("test() method", () => {
      describe("tested at start", () => {
        const rule = new P.Symbols([">", "="])
        test("returns true if present at the start of tokens", () => {
          const test = rule.test(scope, tokenize(">= b"))
          expect(test).toBe(true)
        })

        test("returns false if not present at the start of tokens", () => {
          const test = rule.test(scope, tokenize("a >= b"))
          expect(test).toBe(false)
        })
      })
    })
    describe("parse() method", () => {
      const rule = new P.Symbols([">", "="])
      test("parses at the start of tokens", () => {
        const match = rule.parse(scope, tokenize(">="))!
        expect(match.length).toBe(2)
        expect(match.compile()).toBe(">=")
      })

      test("does not parse in the middle of tokens", () => {
        const match = rule.parse(scope, tokenize("a>="))
        expect(match).toBeUndefined()
      })
    })
  })
})

describe("P.Keyword", () => {
  describe("on construction", () => {
    test("creates proper rule when passed literal string as an object", () => {
      const rule = new P.Keyword({ literal: "this" })
      expect(rule).toBeInstanceOf(P.Keyword)
      expect(rule.literal).toEqual("this")
    })

    test("creates proper rule when passed literal string as an array", () => {
      const rule = new P.Keyword({ literal: ["this"] })
      expect(rule).toBeInstanceOf(P.Keyword)
      expect(rule.literal).toEqual(["this"])
    })

    test("creates proper rule when passed single keyword as a string", () => {
      const rule = new P.Keyword("this")
      expect(rule).toBeInstanceOf(P.Keyword)
      expect(rule.literal).toEqual("this")
    })

    test("creates proper rule when passed multiple keywords as an array", () => {
      const rule = new P.Keyword(["this", "that"])
      expect(rule).toBeInstanceOf(P.Keyword)
      expect(rule.literal).toEqual(["this", "that"])
    })
  })
})

describe("P.Keywords", () => {
  describe("on construction", () => {
    test("creates proper rule when passed literals string as an object", () => {
      const rule = new P.Keywords({ literals: ["this"] })
      expect(rule).toBeInstanceOf(P.Keywords)
      expect(rule.literals).toEqual([{ literal: "this" }])
    })

    test("creates proper rule when passed literals array as an object", () => {
      const rule = new P.Keywords({ literals: ["this", "that"] })
      expect(rule).toBeInstanceOf(P.Keywords)
      expect(rule.literals).toEqual([{ literal: "this" }, { literal: "that" }])
    })

    test("creates proper rule when passed single keyword as a string", () => {
      const rule = new P.Keywords("this")
      expect(rule).toBeInstanceOf(P.Keywords)
      expect(rule.literals).toEqual([{ literal: "this" }])
    })

    test("creates proper rule when passed multiple keywords as an array", () => {
      const rule = new P.Keywords(["this", "that"])
      expect(rule).toBeInstanceOf(P.Keywords)
      expect(rule.literals).toEqual([{ literal: "this" }, { literal: "that" }])
    })
  })

  const parser = new Parser()
  const scope = parser.getScope()
  describe("with a single keyword", () => {
    describe("test() method", () => {
      describe("tested at start", () => {
        const rule = new P.Keywords("this")
        test("returns true if present at the start of tokens", () => {
          const test = rule.test(scope, tokenize("this"))
          expect(test).toBe(true)
        })

        test("returns false if not present at the start of tokens", () => {
          const test = rule.test(scope, tokenize("start this end"))
          expect(test).toBe(false)
        })
      })
    })
    describe("parse() method", () => {
      const rule = new P.Keywords("this")
      test("parses at the start of tokens", () => {
        const match = rule.parse(scope, tokenize("this"))!
        expect(match.length).toBe(1)
        expect(match.compile()).toBe("this")
      })

      test("does not parse in the middle of tokens", () => {
        const match = rule.parse(scope, tokenize("that this"))
        expect(match).toBeUndefined()
      })
    })
  })

  describe("with multiple keywords", () => {
    describe("test() method", () => {
      describe("tested at start", () => {
        const rule = new P.Keywords(["this", "that"])
        test("returns true if present at the start of tokens", () => {
          const test = rule.test(scope, tokenize("this that"))
          expect(test).toBe(true)
        })

        test("returns false if not present at start of tokens", () => {
          const test = rule.test(scope, tokenize("start this this that end"))
          expect(test).toBe(false)
        })

        test("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(scope, tokenize("start middle end"))
          expect(test).toBe(false)
        })
      })
    })
    describe("parse() method", () => {
      const rule = new P.Keywords(["this", "that"])
      test("parses at the start of tokens", () => {
        const match = rule.parse(scope, tokenize("this that other"))!
        expect(match.length).toBe(2)
        expect(match.compile()).toBe("this that")
      })

      test("does not parse in the middle of tokens", () => {
        const match = rule.parse(scope, tokenize("start this that other"))
        expect(match).toBeUndefined()
      })
    })
  })
})

describe("P.Pattern", () => {
  const parser = new Parser()
  const scope = parser.getScope()
  // test with "word" pattern
  const ruleAtStart = new P.Pattern({
    pattern: /^[a-z][\w-]*$/,
    blacklist: ["nope"]
  })

  test("converts array blacklist to a map", () => {
    expect(ruleAtStart.blacklist!.constructor).toBe(Object)
    expect(ruleAtStart.blacklist!.nope).toBe(true)
  })

  describe("test() method", () => {
    describe("tested at start", () => {
      test("returns true if present at the start of tokens", () => {
        const test = ruleAtStart.test(scope, tokenize("a-word"))
        expect(test).toBe(true)
      })

      test("returns false if not present at start of tokens", () => {
        const test = ruleAtStart.test(scope, tokenize("Type a-word 2"))
        expect(test).toBe(false)
      })

      test("returns false if NOT present anywhere in tokens", () => {
        const test = ruleAtStart.test(scope, tokenize("Type 2 3"))
        expect(test).toBe(false)
      })
    })
  })

  describe("parse() method", () => {
    test("parses at the start of tokens", () => {
      const match = ruleAtStart.parse(scope, tokenize("a-word"))!
      expect(match.length).toBe(1)
      expect(match.compile()).toBe("a-word")
    })

    test("returns undefined if match is in blacklist", () => {
      const match = ruleAtStart.parse(scope, tokenize("nope"))
      expect(match).toBeUndefined()
    })

    test("does not parse in the middle of tokens", () => {
      const match = ruleAtStart.parse(scope, tokenize("Type a-word 2"))
      expect(match).toBeUndefined()
    })
  })
})

describe("P.Subrule", () => {
  const parser = new Parser()
  const scope = parser.getScope()
  parser.addRule(new P.Keywords({ name: "this", literals: ["this"] }))
  parser.addRule(new P.Keywords({ name: "that", literals: ["that"] }))
  class sequence extends P.Sequence {
    @proto static syntax = "{this} {that}"
  }
  parser.addRule(sequence)

  describe("simple rules", () => {
    describe("test() method", () => {
      describe("tested at start", () => {
        const rule = new P.Subrule({ rule: "this" })
        test("returns true if present at the start of tokens", () => {
          const test = rule.test(scope, tokenize("this that other"))
          expect(test).toBe(true)
        })

        test("returns false if not present at start of tokens", () => {
          const test = rule.test(scope, tokenize("that this other"))
          expect(test).toBe(false)
        })

        test("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(scope, tokenize("that other else"))
          expect(test).toBe(false)
        })
      })
    })
    describe("parse() method", () => {
      const rule = new P.Subrule({ rule: "this" })
      test("parses at the start of tokens", () => {
        const match = rule.parse(scope, tokenize("this that other"))!
        expect(match.length).toBe(1)
        expect(match.compile()).toBe("this")
      })

      test("does not parse in the middle of tokens", () => {
        const match = rule.parse(scope, tokenize("that this other"))
        expect(match).toBeUndefined()
      })
    })
  })

  describe("sequence rules", () => {
    describe("test() method", () => {
      describe("tested at start", () => {
        const rule = new P.Subrule({ rule: "this" })
        test("returns 1 if present at the start of tokens", () => {
          const test = rule.test(scope, tokenize("this that"))
          expect(test).toBe(true)
        })

        test("returns false if not present at start of tokens", () => {
          const test = rule.test(scope, tokenize("that this that"))
          expect(test).toBe(false)
        })

        test("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(scope, tokenize("that that that"))
          expect(test).toBe(false)
        })
      })
    })
    describe("parse() method", () => {
      const rule = new P.Subrule({ rule: "sequence" })
      test("parses at the start of tokens", () => {
        const match = rule.parse(scope, tokenize("this that"))!
        expect(match.length).toBe(2)
        expect(match.compile()).toStrictEqual("this that")
      })

      test("does not parse in the middle of tokens", () => {
        const match = rule.parse(scope, tokenize("that this that"))
        expect(match).toBeUndefined()
      })
    })
  })
})

describe("P.Choice tie-breaking", () => {
  /** Two interchangeable single-token rules registered under one `alias`, so both match the same input. */
  function tieParser(secondPrecedence?: number) {
    class first_rule extends P.Keyword {}
    class second_rule extends P.Keyword {}
    const parser = new Parser()
    parser.addRule(first_rule, { alias: "either", literal: "x" })
    parser.addRule(second_rule, { alias: "either", literal: "x", precedence: secondPrecedence })
    return parser
  }

  test("same precedence and length -- EARLIEST-registered rule wins", () => {
    // NOTE: `getBestMatch()` long claimed the opposite in its comments -- see agents/SUSPECTED-BUGS.md.
    expect(tieParser().parse("x", "either")?.rule.name).toBe("first_rule")
  })

  test("higher precedence beats earlier registration", () => {
    expect(tieParser(1).parse("x", "either")?.rule.name).toBe("second_rule")
  })

  test("precedence beats a LONGER match -- it filters first, length only breaks ties within the top band", () => {
    class long_rule extends P.Keywords {}
    class short_rule extends P.Keyword {}
    const parser = new Parser()
    parser.addRule(long_rule, { alias: "either", literals: ["x", "y"] })
    parser.addRule(short_rule, { alias: "either", literal: "x", precedence: 1 })
    // `long_rule` matches both tokens, but `short_rule` outranks it and wins with just one.
    const match = parser.parse("x y", "either")
    expect(match?.rule.name).toBe("short_rule")
    expect(match?.length).toBe(1)
  })
})

describe("P.Choice", () => {
  const parser = new Parser()
  const scope = parser.getScope()

  const ruleStart = new P.Choice({
    rules: [new P.Keywords("this"), new P.Keywords("that"), new P.Keywords("other")],
    matchGroup: "arg"
  })

  describe("test() method", () => {
    describe("tested at start", () => {
      test("returns true if present at the start of tokens", () => {
        const test = ruleStart.test(scope, tokenize("this that other"))
        expect(test).toBe(true)
      })

      test("returns false if NOT present at start of tokens", () => {
        const test = ruleStart.test(scope, tokenize("start this middle end"))
        expect(test).toBe(false)
      })
    })
  })

  describe("parse() method", () => {
    test("parses any of the choices at the start of tokens", () => {
      let match = ruleStart.parse(scope, tokenize("this"))!
      expect(match.length).toBe(1)
      expect(match.compile()).toBe("this")

      match = ruleStart.parse(scope, tokenize("that"))!
      expect(match.length).toBe(1)
      expect(match.compile()).toBe("that")

      match = ruleStart.parse(scope, tokenize("other"))!
      expect(match.length).toBe(1)
      expect(match.compile()).toBe("other")
    })

    test("does not parse in the middle of tokens", () => {
      let match = ruleStart.parse(scope, tokenize("start this end"))
      expect(match).toBeUndefined()

      match = ruleStart.parse(scope, tokenize("start that end"))
      expect(match).toBeUndefined()

      match = ruleStart.parse(scope, tokenize("start other end"))
      expect(match).toBeUndefined()
    })

    test("sets 'matchGroup' on the result", () => {
      const match = ruleStart.parse(scope, tokenize("this"))!
      expect(match.matchGroup).toBe("arg")
    })
  })
})

describe("P.Repeat", () => {
  const parser = new Parser()
  const scope = parser.getScope()
  const ruleWord = new P.Repeat(new P.Keywords("word"))
  const ruleDelimiter = new P.Repeat({
    rule: new P.Keywords("word"),
    delimiter: new P.Symbol(",")
  })

  describe("test() method", () => {
    test("can only start where its rule could", () => {
      expect(ruleWord.test(scope, tokenize("word"))).toBe(true)
      expect(ruleWord.test(scope, tokenize("nope word nope"))).toBe(false)
    })
  })

  describe("parse() method without a delimiter", () => {
    test("returns an array when compiled", () => {
      const match = ruleWord.parse(scope, tokenize("word nope nope"))!
      expect(match.compile()).toBeInstanceOf(Array)
    })

    test("parses once at the start of tokens", () => {
      const match = ruleWord.parse(scope, tokenize("word nope nope"))!
      expect(match.length).toBe(1)
      expect(match.compile()).toEqual(["word"])
    })

    test("parses multiple times at the start of tokens", () => {
      const match = ruleWord.parse(scope, tokenize("word word nope nope"))!
      expect(match.length).toBe(2)
      expect(match.compile()).toEqual(["word", "word"])
    })

    test("does not parse in the middle of tokens", () => {
      const match = ruleWord.parse(scope, tokenize("nope word word"))
      expect(match).toBeUndefined()
    })
  })

  describe("parse() method WITH a delimiter", () => {
    test("returns an array when compiled", () => {
      const match = ruleDelimiter.parse(scope, tokenize("word nope nope"))!
      expect(match.compile()).toEqual(["word"])
    })

    test("works for a single instance of <rule> without <delimiter>", () => {
      const match = ruleDelimiter.parse(scope, tokenize("word nope nope"))!
      expect(match.compile()).toEqual(["word"])
    })

    test("works for a single instance of <rule><delimiter>", () => {
      const match = ruleDelimiter.parse(scope, tokenize("word, nope nope"))!
      expect(match.compile()).toEqual(["word"])
    })

    test("works for a multiple instances of <rule><delimiter>", () => {
      const match = ruleDelimiter.parse(scope, tokenize("word, word,word nope nope"))!
      expect(match.compile()).toEqual(["word", "word", "word"])
    })

    test("parses once at the start of tokens", () => {
      const match = ruleDelimiter.parse(scope, tokenize("word nope nope"))!
      expect(match.length).toBe(1)
      expect(match.compile()).toEqual(["word"])
    })

    test("parses multiple times at the start of tokens", () => {
      const match = ruleDelimiter.parse(scope, tokenize("word,word nope nope"))!
      expect(match.length).toBe(3) // length includes delimiter
      expect(match.compile()).toEqual(["word", "word"])
    })

    test("does not parse in the middle of tokens", () => {
      const match = ruleDelimiter.parse(scope, tokenize("nope word nope"))
      expect(match).toBeUndefined()
    })
  })
})

describe("P.Sequence", () => {
  const parser = new Parser()
  const scope = parser.getScope()
  parser.addRule(new P.Keywords({ name: "that", literals: ["that"] }))
  parser.addRule(new P.Keywords({ name: "other", literals: ["other"] }))
  class noTest extends P.Sequence {
    @proto static syntax = "{that} {other}"
  }
  class noCompile extends P.Sequence {
    @proto static syntax = "this {that} the {other}"
  }
  parser.addRule(noTest)
  parser.addRule(noCompile)

  describe("sequences without a compile method", () => {
    const rule = parser.rules.noCompile
    test("return matched strings on compile", () => {
      const match = rule.parse(scope, tokenize("this that the other"))!
      expect(match.compile()).toEqual("this that the other")
    })
  })

  describe("simple sequences", () => {
    describe("test() method", () => {
      describe("all subrules", () => {
        const rule = parser.rules.noTest
        test("each subrule needs at least one token", () => {
          expect(rule.test(scope, tokenize("word"))).toBe(false)
          expect(rule.test(scope, tokenize("some words"))).toBe(true)
        })
      })

      describe("tests its own words, skipping subrules", () => {
        const check = (syntax: string, input: string) => {
          class tested extends P.Sequence {}
          return tested.instantiate({ syntax })!.test(scope, tokenize(input))
        }
        test("words must be where they belong", () => {
          expect(check("this {that} the {other}", "this that the other")).toBe(true)
          expect(check("this {that} the {other}", "this x y the z")).toBe(true)
          expect(check("this {that} the {other}", "this that a other")).toBe(false)
          expect(check("this {that} the {other}", "that the other")).toBe(false)
        })
        test("each subrule needs at least one token", () => {
          expect(check("this {that} the {other}", "this the other")).toBe(false)
          expect(check("this {that} the {other}", "this that the")).toBe(false)
        })
        test("tries every occurrence, not just the first", () => {
          expect(check("{that} is {other} if {that}", "x is y is z if w")).toBe(true)
          expect(check("{that} is {other} if {that}", "x is y is z")).toBe(false)
        })
        test("optional words are tried both ways", () => {
          expect(check("(operator:is not? exactly) {that}", "is exactly x")).toBe(true)
          expect(check("(operator:is not? exactly) {that}", "is not exactly x")).toBe(true)
          expect(check("(operator:is not? exactly) {that}", "is not x")).toBe(false)
          // not greedy:  optional `not` is skipped so required `not` can match
          expect(check("is not? not {that}", "is not x")).toBe(true)
        })
        test("choice => each alternative", () => {
          const syntax = "there (operator:is not? (a|an)|is no such) {that}"
          expect(check(syntax, "there is a that")).toBe(true)
          expect(check(syntax, "there is not an that")).toBe(true)
          expect(check(syntax, "there is no such that")).toBe(true)
          expect(check(syntax, "there was a that")).toBe(false)
          expect(check(syntax, "there is no that")).toBe(false)
          expect(check(syntax, "there is 1 a that")).toBe(false)
        })
        test("subclass can override test(), and parse() respects it", () => {
          class picky extends P.Sequence {
            test() {
              return false
            }
          }
          const rule = picky.instantiate({ syntax: "this {that}" })
          expect(rule!.parse(scope, tokenize("this that"))).toBeUndefined()
        })
      })
    })

    describe("parse() method", () => {
      const rule = parser.rules.noCompile
      test("parses at the start of tokens", () => {
        const match = rule.parse(scope, tokenize("this that the other"))!
        expect(match.length).toBe(4)
        expect(match.compile()).toStrictEqual("this that the other")
        const { groups } = match
        expect((groups.that as Match).value).toBe("that")
        expect((groups.other as Match).value).toBe("other")
      })

      test("does not parse in the middle of tokens", () => {
        const match = rule.parse(scope, tokenize("something this that the other"))
        expect(match).toBeUndefined()
      })
    })
  })
})
