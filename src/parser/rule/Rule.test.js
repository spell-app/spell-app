import { Parser, Rule, TestLocation, Tokenizer, WhitespacePolicy } from "../all"

const tokenizer = new Tokenizer({
  whitespacePolicy: WhitespacePolicy.NONE
})
const { tokenize } = tokenizer

describe("Rule.Symbol", () => {
  describe("on construction", () => {
    test("creates proper rule when passed literal as an object", () => {
      const rule = new Rule.Symbol({ literal: ">" })
      expect(rule).toBeInstanceOf(Rule.Symbol)
      expect(rule.literal).toEqual(">")
    })

    test("creates proper rule when passed single symbol as a string", () => {
      const rule = new Rule.Symbol(">")
      expect(rule).toBeInstanceOf(Rule.Symbol)
      expect(rule.literal).toEqual(">")
    })

    test("creates proper rule when passed multiple symbols as an array", () => {
      const rule = new Rule.Symbol([">", "="])
      expect(rule).toBeInstanceOf(Rule.Symbol)
      expect(rule.literal).toEqual([">", "="])
    })
  })
})

describe("Rule.Symbols", () => {
  describe("on construction", () => {
    test("creates proper rule when passed literals as an object", () => {
      const rule = new Rule.Symbols({ literals: [">"] })
      expect(rule).toBeInstanceOf(Rule.Symbols)
      expect(rule.literals).toEqual([">"])
    })

    test("creates proper rule when passed single symbol as a string", () => {
      const rule = new Rule.Symbols(">")
      expect(rule).toBeInstanceOf(Rule.Symbols)
      expect(rule.literals).toEqual([">"])
    })

    test("creates proper rule when passed multiple symbols as a string", () => {
      const rule = new Rule.Symbols([">", "="])
      expect(rule).toBeInstanceOf(Rule.Symbols)
      expect(rule.literals).toEqual([">", "="])
    })
  })

  const parser = new Parser()
  describe("with a single symbol", () => {
    describe("test() method", () => {
      describe("TEST_AT_START", () => {
        const rule = new Rule.Symbols(">")
        test("returns a non-zero number if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize(">"))
          expect(test).toBe(1)
        })

        test("returns false if not present at the start of tokens", () => {
          const test = rule.test(parser, tokenize("a > b"))
          expect(test).toBe(false)
        })
      })

      describe("TEST_ANYWHERE", () => {
        const rule = new Rule.Symbols({ literals: ">", testLocation: TestLocation.ANYWHERE })
        test("returns true if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize(">"))
          expect(test).toBe(true)
        })

        test("returns true if present in the middle of tokens", () => {
          const test = rule.test(parser, tokenize("a > b"))
          expect(test).toBe(true)
        })

        test("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("a b c"))
          expect(test).toBe(false)
        })
      })
    })
    describe("parse() method", () => {
      const rule = new Rule.Symbols(">")
      test("parses at the start of tokens", () => {
        const match = rule.parse(parser, tokenize(">"))
        expect(match.length).toBe(1)
        expect(match.compile()).toBe(">")
      })

      test("does not parse in the middle of tokens", () => {
        const match = rule.parse(parser, tokenize("=>"))
        expect(match).toBeUndefined()
      })
    })
  })

  describe("with multiple symbols", () => {
    describe("test() method", () => {
      describe("TEST_AT_START", () => {
        const rule = new Rule.Symbols([">", "="])
        test("returns a non-zero number if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize(">= b"))
          expect(test).toBe(2)
        })

        test("returns false if not present at the start of tokens", () => {
          const test = rule.test(parser, tokenize("a >= b"))
          expect(test).toBe(false)
        })
      })

      describe("TEST_ANYWHERE", () => {
        const rule = new Rule.Symbols({ literals: [">", "="], testLocation: TestLocation.ANYWHERE })
        test("returns true if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize(">="))
          expect(test).toBe(true)
        })

        test("returns true if present in the middle of tokens", () => {
          const test = rule.test(parser, tokenize("a >= b"))
          expect(test).toBe(true)
        })

        test("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("a b c"))
          expect(test).toBe(false)
        })
      })
    })
    describe("parse() method", () => {
      const rule = new Rule.Symbols([">", "="])
      test("parses at the start of tokens", () => {
        const match = rule.parse(parser, tokenize(">="))
        expect(match.length).toBe(2)
        expect(match.compile()).toBe(">=")
      })

      test("does not parse in the middle of tokens", () => {
        const match = rule.parse(parser, tokenize("a>="))
        expect(match).toBeUndefined()
      })
    })
  })
})

describe("Rule.Keyword", () => {
  describe("on construction", () => {
    test("creates proper rule when passed literal string as an object", () => {
      const rule = new Rule.Keyword({ literal: "this" })
      expect(rule).toBeInstanceOf(Rule.Keyword)
      expect(rule.literal).toEqual("this")
    })

    test("creates proper rule when passed literal string as an array", () => {
      const rule = new Rule.Keyword({ literal: ["this"] })
      expect(rule).toBeInstanceOf(Rule.Keyword)
      expect(rule.literal).toEqual(["this"])
    })

    test("creates proper rule when passed single keyword as a string", () => {
      const rule = new Rule.Keyword("this")
      expect(rule).toBeInstanceOf(Rule.Keyword)
      expect(rule.literal).toEqual("this")
    })

    test("creates proper rule when passed multiple keywords as an array", () => {
      const rule = new Rule.Keyword(["this", "that"])
      expect(rule).toBeInstanceOf(Rule.Keyword)
      expect(rule.literal).toEqual(["this", "that"])
    })
  })
})

describe("Rule.Keywords", () => {
  describe("on construction", () => {
    test("creates proper rule when passed literals string as an object", () => {
      const rule = new Rule.Keywords({ literals: "this" })
      expect(rule).toBeInstanceOf(Rule.Keywords)
      expect(rule.literals).toEqual(["this"])
    })

    test("creates proper rule when passed literals array as an object", () => {
      const rule = new Rule.Keywords({ literals: ["this", "that"] })
      expect(rule).toBeInstanceOf(Rule.Keywords)
      expect(rule.literals).toEqual(["this", "that"])
    })

    test("creates proper rule when passed single keyword as a string", () => {
      const rule = new Rule.Keywords("this")
      expect(rule).toBeInstanceOf(Rule.Keywords)
      expect(rule.literals).toEqual(["this"])
    })

    test("creates proper rule when passed multiple keywords as an array", () => {
      const rule = new Rule.Keywords(["this", "that"])
      expect(rule).toBeInstanceOf(Rule.Keywords)
      expect(rule.literals).toEqual(["this", "that"])
    })
  })

  const parser = new Parser()
  describe("with a single keyword", () => {
    describe("test() method", () => {
      describe("TEST_ANYWHERE", () => {
        const rule = new Rule.Keywords({ literals: "this", testLocation: TestLocation.ANYWHERE })
        test("returns true if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize("this"))
          expect(test).toBe(true)
        })

        test("returns true if present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("start this end"))
          expect(test).toBe(true)
        })

        test("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("start middle end"))
          expect(test).toBe(false)
        })
      })

      describe("TEST_AT_START", () => {
        const rule = new Rule.Keywords("this")
        test("returns 1 if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize("this"))
          expect(test).toBe(1)
        })

        test("returns false if not present at the start of tokens", () => {
          const test = rule.test(parser, tokenize("start this end"))
          expect(test).toBe(false)
        })
      })
    })
    describe("parse() method", () => {
      const rule = new Rule.Keywords("this")
      test("parses at the start of tokens", () => {
        const match = rule.parse(parser, tokenize("this"))
        expect(match.length).toBe(1)
        expect(match.compile()).toBe("this")
      })

      test("does not parse in the middle of tokens", () => {
        const match = rule.parse(parser, tokenize("that this"))
        expect(match).toBeUndefined()
      })
    })
  })

  describe("with multiple keywords", () => {
    describe("test() method", () => {
      describe("TEST_ANYWHERE", () => {
        const rule = new Rule.Keywords({ literals: ["this", "that"], testLocation: TestLocation.ANYWHERE })
        test("returns true if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize("this that"))
          expect(test).toBe(true)
        })

        test("returns true if present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("start this this that end"))
          expect(test).toBe(true)
        })

        test("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("start middle end"))
          expect(test).toBe(false)
        })
      })

      describe("TEST_AT_START", () => {
        const rule = new Rule.Keywords(["this", "that"])
        test("returns a non-zero number if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize("this that"))
          expect(test).toBe(2)
        })

        test("returns false if not present at start of tokens", () => {
          const test = rule.test(parser, tokenize("start this this that end"))
          expect(test).toBe(false)
        })

        test("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("start middle end"))
          expect(test).toBe(false)
        })
      })
    })
    describe("parse() method", () => {
      const rule = new Rule.Keywords(["this", "that"])
      test("parses at the start of tokens", () => {
        const match = rule.parse(parser, tokenize("this that other"))
        expect(match.length).toBe(2)
        expect(match.compile()).toBe("this that")
      })

      test("does not parse in the middle of tokens", () => {
        const match = rule.parse(parser, tokenize("start this that other"))
        expect(match).toBeUndefined()
      })
    })
  })
})

describe("Rule.Pattern", () => {
  const parser = new Parser()
  // test with "word" pattern
  const ruleAtStart = new Rule.Pattern({
    pattern: /^[a-z][\w\-]*$/,
    blacklist: ["nope"]
  })
  const ruleAnywhere = new Rule.Pattern({
    pattern: /^[a-z][\w\-]*$/,
    blacklist: ["nope"],
    testLocation: TestLocation.ANYWHERE
  })

  test("converts array blacklist to a map", () => {
    expect(ruleAtStart.blacklist.constructor).toBe(Object)
    expect(ruleAtStart.blacklist.nope).toBe(true)
  })

  describe("test() method", () => {
    describe("TEST_AT_START", () => {
      test("returns true if present at the start of tokens", () => {
        const test = ruleAtStart.test(parser, tokenize("a-word"))
        expect(test).toBe(true)
      })

      test("returns false if not present at start of tokens", () => {
        const test = ruleAtStart.test(parser, tokenize("Type a-word 2"))
        expect(test).toBe(false)
      })

      test("returns false if NOT present anywhere in tokens", () => {
        const test = ruleAtStart.test(parser, tokenize("Type 2 3"))
        expect(test).toBe(false)
      })
    })

    describe("TEST_ANYWHERE", () => {
      test("returns true if present at the start of tokens", () => {
        const test = ruleAnywhere.test(parser, tokenize("a-word"))
        expect(test).toBe(true)
      })

      test("returns true if present anywhere in tokens", () => {
        const test = ruleAnywhere.test(parser, tokenize("Type a-word 2"))
        expect(test).toBe(true)
      })

      test("returns false if NOT present anywhere in tokens", () => {
        const test = ruleAnywhere.test(parser, tokenize("Type 2 3"))
        expect(test).toBe(false)
      })
    })
  })

  describe("parse() method", () => {
    test("parses at the start of tokens", () => {
      const match = ruleAtStart.parse(parser, tokenize("a-word"))
      expect(match.length).toBe(1)
      expect(match.compile()).toBe("a-word")
    })

    test("returns undefined if match is in blacklist", () => {
      const match = ruleAtStart.parse(parser, tokenize("nope"))
      expect(match).toBeUndefined()
    })

    test("does not parse in the middle of tokens", () => {
      const match = ruleAtStart.parse(parser, tokenize("Type a-word 2"))
      expect(match).toBeUndefined()
    })
  })
})

describe("Rule.Subrule", () => {
  const parser = new Parser()
  parser.defineRules(
    new Rule.Keywords({ name: "this", literals: "this" }),
    new Rule.Keywords({ name: "that", literals: "that" }),
    {
      name: "sequence",
      syntax: "{this} {that}",
      testRule: new Rule.Keywords(["this", "that"]),
      compile(results) {
        return "COMPILED"
      }
    }
  )

  describe("simple rules", () => {
    describe("test() method", () => {
      describe("TEST_AT_START", () => {
        const rule = new Rule.Subrule({ rule: "this" })
        test("returns 1 if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize("this that other"))
          expect(test).toBe(1)
        })

        test("returns false if not present at start of tokens", () => {
          const test = rule.test(parser, tokenize("that this other"))
          expect(test).toBe(false)
        })

        test("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("that other else"))
          expect(test).toBe(false)
        })
      })

      describe("TEST_ANYWHERE", () => {
        const rule = new Rule.Subrule({ rule: "this", testLocation: TestLocation.ANYWHERE })
        test("returns true if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize("this that other"))
          expect(test).toBe(true)
        })

        test("returns true if present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("that this other"))
          expect(test).toBe(true)
        })

        test("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("that other else"))
          expect(test).toBe(false)
        })
      })
    })
    describe("parse() method", () => {
      const rule = new Rule.Subrule({ rule: "this" })
      test("parses at the start of tokens", () => {
        const match = rule.parse(parser, tokenize("this that other"))
        expect(match.length).toBe(1)
        expect(match.compile()).toBe("this")
      })

      test("does not parse in the middle of tokens", () => {
        const match = rule.parse(parser, tokenize("that this other"))
        expect(match).toBeUndefined()
      })
    })
  })

  describe("sequence rules", () => {
    describe("test() method", () => {
      describe("TEST_AT_START", () => {
        const rule = new Rule.Subrule({ rule: "this" })
        test("returns 1 if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize("this that"))
          expect(test).toBe(1)
        })

        test("returns false if not present at start of tokens", () => {
          const test = rule.test(parser, tokenize("that this that"))
          expect(test).toBe(false)
        })

        test("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("that that that"))
          expect(test).toBe(false)
        })
      })

      describe("TEST_AT_START", () => {
        const rule = new Rule.Subrule({ rule: "this", testLocation: TestLocation.ANYWHERE })
        test("returns true if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize("this that"))
          expect(test).toBe(true)
        })

        test("returns true if present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("that this that"))
          expect(test).toBe(true)
        })

        test("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("that that that"))
          expect(test).toBe(false)
        })
      })
    })
    describe("parse() method", () => {
      const rule = new Rule.Subrule({ rule: "sequence" })
      test("parses at the start of tokens", () => {
        const match = rule.parse(parser, tokenize("this that"))
        expect(match.length).toBe(2)
        expect(match.compile()).toBe("COMPILED")
      })

      test("does not parse in the middle of tokens", () => {
        const match = rule.parse(parser, tokenize("that this that"))
        expect(match).toBeUndefined()
      })
    })
  })
})

describe("Rule.Choice", () => {
  const parser = new Parser()

  const ruleStart = new Rule.Choice({
    rules: [new Rule.Keywords("this"), new Rule.Keywords("that"), new Rule.Keywords("other")],
    argument: "arg"
  })

  const ruleAnywhere = new Rule.Choice({
    rules: [new Rule.Keywords("this"), new Rule.Keywords("that"), new Rule.Keywords("other")],
    argument: "arg",
    testLocation: TestLocation.ANYWHERE
  })

  describe("test() method", () => {
    describe("TEST_AT_START", () => {
      test("returns true if present at the start of tokens", () => {
        const test = ruleStart.test(parser, tokenize("this that other"))
        expect(test).toBe(true)
      })

      test("returns false if NOT present at start of tokens", () => {
        const test = ruleStart.test(parser, tokenize("start this middle end"))
        expect(test).toBe(false)
      })
    })

    describe("TEST_ANYWHERE", () => {
      test("returns true if present at the start of tokens", () => {
        const test = ruleAnywhere.test(parser, tokenize("this that other"))
        expect(test).toBe(true)
      })

      test("returns true if present anywhere in tokens", () => {
        const test = ruleAnywhere.test(parser, tokenize("start that end"))
        expect(test).toBe(true)
      })

      test("returns false if NOT present anywhere in tokens", () => {
        const test = ruleAnywhere.test(parser, tokenize("start middle end"))
        expect(test).toBe(false)
      })
    })
  })

  describe("parse() method", () => {
    test("parses any of the choices at the start of tokens", () => {
      let match = ruleStart.parse(parser, tokenize("this"))
      expect(match.length).toBe(1)
      expect(match.compile()).toBe("this")

      match = ruleStart.parse(parser, tokenize("that"))
      expect(match.length).toBe(1)
      expect(match.compile()).toBe("that")

      match = ruleStart.parse(parser, tokenize("other"))
      expect(match.length).toBe(1)
      expect(match.compile()).toBe("other")
    })

    test("does not parse in the middle of tokens", () => {
      let match = ruleStart.parse(parser, tokenize("start this end"))
      expect(match).toBeUndefined()

      match = ruleStart.parse(parser, tokenize("start that end"))
      expect(match).toBeUndefined()

      match = ruleStart.parse(parser, tokenize("start other end"))
      expect(match).toBeUndefined()
    })

    test("sets 'argument' on the result", () => {
      const match = ruleStart.parse(parser, tokenize("this"))
      expect(match.argument).toBe("arg")
    })
  })
})

describe("Rule.Repeat", () => {
  const parser = new Parser()
  const ruleNoTest = new Rule.Repeat(new Rule.Keywords("word"))
  const ruleStart = new Rule.Repeat({
    testRule: new Rule.Keywords("word"),
    rule: new Rule.Keywords("word")
  })
  const ruleAnywhere = new Rule.Repeat({
    testRule: new Rule.Keywords("word"),
    rule: new Rule.Keywords("word"),
    testLocation: TestLocation.ANYWHERE
  })
  const ruleDelimiter = new Rule.Repeat({
    rule: new Rule.Keywords("word"),
    delimiter: new Rule.Symbol(",")
  })

  describe("test() method", () => {
    describe("without a testRule", () => {
      test("returns undefined", () => {
        const test = ruleNoTest.test(parser, tokenize("word"))
        expect(test).toBe(undefined)
      })
    })

    describe("TEST_AT_START", () => {
      test("returns 1 if present at the start of tokens", () => {
        const test = ruleStart.test(parser, tokenize("word"))
        expect(test).toBe(1)
      })

      test("returns false if NOT present at start of tokens", () => {
        const test = ruleStart.test(parser, tokenize("nope word nope"))
        expect(test).toBe(false)
      })
    })

    describe("TEST_ANYWHERE", () => {
      test("returns true if present at the start of tokens", () => {
        const test = ruleAnywhere.test(parser, tokenize("word"))
        expect(test).toBe(true)
      })

      test("returns true if present anywhere in tokens", () => {
        const test = ruleAnywhere.test(parser, tokenize("nope word nope"))
        expect(test).toBe(true)
      })

      test("returns false if NOT present anywhere in tokens", () => {
        const test = ruleAnywhere.test(parser, tokenize("nope nope nope"))
        expect(test).toBe(false)
      })
    })
  })

  describe("parse() method without a delimiter", () => {
    test("returns an array when compiled", () => {
      const match = ruleStart.parse(parser, tokenize("word nope nope"))
      expect(match.compile()).toBeInstanceOf(Array)
    })

    test("parses once at the start of tokens", () => {
      const match = ruleStart.parse(parser, tokenize("word nope nope"))
      expect(match.length).toBe(1)
      expect(match.compile()).toEqual(["word"])
    })

    test("parses multiple times at the start of tokens", () => {
      const match = ruleStart.parse(parser, tokenize("word word nope nope"))
      expect(match.length).toBe(2)
      expect(match.compile()).toEqual(["word", "word"])
    })

    test("does not parse in the middle of tokens", () => {
      const match = ruleStart.parse(parser, tokenize("nope word word"))
      expect(match).toBeUndefined()
    })
  })

  describe("parse() method WITH a delimiter", () => {
    test("returns an array when compiled", () => {
      const match = ruleDelimiter.parse(parser, tokenize("word nope nope"))
      expect(match.compile()).toEqual(["word"])
    })

    test("works for a single instance of <rule> without <delimiter>", () => {
      const match = ruleDelimiter.parse(parser, tokenize("word nope nope"))
      expect(match.compile()).toEqual(["word"])
    })

    test("works for a single instance of <rule><delimiter>", () => {
      const match = ruleDelimiter.parse(parser, tokenize("word, nope nope"))
      expect(match.compile()).toEqual(["word"])
    })

    test("works for a multiple instances of <rule><delimiter>", () => {
      const match = ruleDelimiter.parse(parser, tokenize("word, word,word nope nope"))
      expect(match.compile()).toEqual(["word", "word", "word"])
    })

    test("parses once at the start of tokens", () => {
      const match = ruleDelimiter.parse(parser, tokenize("word nope nope"))
      expect(match.length).toBe(1)
      expect(match.compile()).toEqual(["word"])
    })

    test("parses multiple times at the start of tokens", () => {
      const match = ruleDelimiter.parse(parser, tokenize("word,word nope nope"))
      expect(match.length).toBe(3) // length includes delimiter
      expect(match.compile()).toEqual(["word", "word"])
    })

    test("does not parse in the middle of tokens", () => {
      const match = ruleDelimiter.parse(parser, tokenize("nope word nope"))
      expect(match).toBeUndefined()
    })
  })
})

describe("Rule.Sequence", () => {
  const parser = new Parser()
  parser.defineRules(
    new Rule.Keywords({ name: "that", literals: "that" }),
    new Rule.Keywords({ name: "other", literals: "other" }),
    {
      name: "noTest",
      syntax: "this {that} the {other}"
    },
    {
      name: "atStart",
      syntax: "this {that} the {other}",
      testRule: new Rule.Keywords("this"),
      compile() {
        return "COMPILED"
      }
    },
    {
      name: "anywhere",
      syntax: "this {that} the {other}",
      testRule: new Rule.Keywords("this"),
      testLocation: TestLocation.ANYWHERE
    },
    {
      name: "noCompile",
      syntax: "this {that} the {other}"
    }
  )

  describe("sequences without a compile method", () => {
    const rule = parser.rules.noCompile
    test("return 'match.results' on compile", () => {
      const match = rule.parse(parser, tokenize("this that the other"))
      expect(match.compile()).toEqual({ that: "that", other: "other" })
    })
  })

  describe("simple sequences", () => {
    describe("test() method", () => {
      describe("without a testRule", () => {
        const rule = parser.rules.noTest
        test("returns undefined", () => {
          const test = rule.test(parser, tokenize("word"))
          expect(test).toBe(undefined)
        })
      })

      describe("TEST_AT_START", () => {
        const rule = parser.rules.atStart
        test("returns 1 if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize("this that other"))
          expect(test).toBe(1)
        })

        test("returns false if NOT present anywhere at start of tokens", () => {
          const test = rule.test(parser, tokenize("start this middle end"))
          expect(test).toBe(false)
        })
      })

      describe("TEST_ANYWHERE", () => {
        const rule = parser.rules.anywhere
        test("returns true if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize("this that other"))
          expect(test).toBe(true)
        })

        test("returns true if present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("other this that"))
          expect(test).toBe(true)
        })

        test("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("start middle end"))
          expect(test).toBe(false)
        })
      })
    })

    describe("parse() method", () => {
      const rule = parser.rules.atStart
      test("parses at the start of tokens", () => {
        const match = rule.parse(parser, tokenize("this that the other"))
        expect(match.length).toBe(4)
        expect(match.compile()).toBe("COMPILED")
        const { results } = match
        expect(results.that).toBe("that")
        expect(results.other).toBe("other")
      })

      test("does not parse in the middle of tokens", () => {
        const match = rule.parse(parser, tokenize("something this that the other"))
        expect(match).toBeUndefined()
      })
    })
  })
})
