import {
  Parser,
  ParseError,
  parseRule,
  Rule,
  Scope,
  TestLocation,
  Token,
  Tokenizer,
  WhitespacePolicy
} from "./all.js";


const tokenizer = new Tokenizer({
  whitespacePolicy: WhitespacePolicy.NONE
});
const tokenize = tokenizer.tokenize;

describe("Rule.Symbols", () => {
  describe("on construction", () => {
    it("creates proper rule when passed literals as a string", () => {
      const rule = new Rule.Keywords({ literals: ">" });
      expect(rule).toBeInstanceOf(Rule.Literal);
      expect(rule.literal).toEqual(">");
    });

    it("creates proper rule when passed single symbol as a string", () => {
      const rule = new Rule.Symbols(">");
      expect(rule).toBeInstanceOf(Rule.Symbols);
      expect(rule.literals).toEqual([">"]);
    });

    it("creates proper rule when passed multiple symbols as a string", () => {
      const rule = new Rule.Symbols(">=");
      expect(rule).toBeInstanceOf(Rule.Symbols);
      expect(rule.literals).toEqual([">", "="]);
    });
  });

  const parser = new Parser();
  describe("with a single symbol", () => {
    describe("test() method", () => {
      describe("TEST_AT_START", () => {
        const rule = new Rule.Symbols(">");
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(new Scope(parser), tokenize(">"));
          expect(test).toBe(true);
        });

        it("returns false if not present at the start of tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("a > b"));
          expect(test).toBe(false);
        });
      });

      describe("TEST_ANYWHERE", () => {
        const rule = new Rule.Symbols({ literals: ">", testLocation: TestLocation.ANYWHERE });
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(new Scope(parser), tokenize(">"));
          expect(test).toBe(true);
        });

        it("returns true if present in the middle of tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("a > b"));
          expect(test).toBe(true);
        });

        it("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("a b c"));
          expect(test).toBe(false);
        });
      });

    });
    describe("parse() method", () => {
      const rule = new Rule.Symbols(">");
      it("parses at the start of tokens", () => {
        const match = rule.parse(new Scope(parser), tokenize(">"));
        expect(match.matchLength).toBe(1);
        expect(match.compile()).toBe(">");
      });

      it("does not parse in the middle of tokens", () => {
        const match = rule.parse(new Scope(parser), tokenize("=>"));
        expect(match).toBeUndefined();
      });
    });
  });

  describe("with multiple symbols", () => {
    describe("test() method", () => {
      describe("TEST_AT_START", () => {
        const rule = new Rule.Symbols(">=");
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(new Scope(parser), tokenize(">= b"));
          expect(test).toBe(true);
        });

        it("returns false if not present at the start of tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("a >= b"));
          expect(test).toBe(false);
        });
      });

      describe("TEST_ANYWHERE", () => {
        const rule = new Rule.Symbols({ literals: ">=", testLocation: TestLocation.ANYWHERE });
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(new Scope(parser), tokenize(">="));
          expect(test).toBe(true);
        });

        it("returns true if present in the middle of tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("a >= b"));
          expect(test).toBe(true);
        });

        it("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("a b c"));
          expect(test).toBe(false);
        });
      });
    });
    describe("parse() method", () => {
      const rule = new Rule.Symbols(">=");
      it("parses at the start of tokens", () => {
        const match = rule.parse(new Scope(parser), tokenize(">="));
        expect(match.matchLength).toBe(2);
        expect(match.compile()).toBe(">=");
      });

      it("does not parse in the middle of tokens", () => {
        const match = rule.parse(new Scope(parser), tokenize("a>="));
        expect(match).toBeUndefined();
      });
    });
  });
});


describe("Rule.Keywords", () => {
  describe("on construction", () => {
    it("creates proper rule when passed literals as a string", () => {
      const rule = new Rule.Keywords({ literals: "this" });
      expect(rule).toBeInstanceOf(Rule.Literal);
      expect(rule.literal).toEqual("this");
    });

    it("creates proper rule when passed single keyword as a string", () => {
      const rule = new Rule.Keywords("this");
      expect(rule).toBeInstanceOf(Rule.Literal);
      expect(rule.literal).toEqual("this");
    });

    it("creates proper rule when passed multiple keywords as a string", () => {
      const rule = new Rule.Keywords("this that");
      expect(rule).toBeInstanceOf(Rule.Keywords);
      expect(rule.literals).toEqual(["this", "that"]);
    });
  });

  const parser = new Parser();
  describe("with a single keyword", () => {
    describe("test() method", () => {
      describe("TEST_ANYWHERE", () => {
        const rule = new Rule.Keywords({ literals: "this", testLocation: TestLocation.ANYWHERE });
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("this"));
          expect(test).toBe(true);
        });

        it("returns true if present anywhere in tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("start this end"));
          expect(test).toBe(true);
        });

        it("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("start middle end"));
          expect(test).toBe(false);
        });
      });

      describe("TEST_AT_START", () => {
        const rule = new Rule.Keywords("this");
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("this"));
          expect(test).toBe(true);
        });

        it("returns false if not present at the start of tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("start this end"));
          expect(test).toBe(false);
        });
      });
    });
    describe("parse() method", () => {
      const rule = new Rule.Keywords("this");
      it("parses at the start of tokens", () => {
        const match = rule.parse(new Scope(parser), tokenize("this"));
        expect(match.matchLength).toBe(1);
        expect(match.compile()).toBe("this");
      });

      it("does not parse in the middle of tokens", () => {
        const match = rule.parse(new Scope(parser), tokenize("that this"));
        expect(match).toBeUndefined();
      });
    });
  });

  describe("with multiple keywords", () => {
    describe("test() method", () => {
      describe("TEST_ANYWHERE", () => {
        const rule = new Rule.Keywords({ literals: "this that", testLocation: TestLocation.ANYWHERE });
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("this that"));
          expect(test).toBe(true);
        });

        it("returns true if present anywhere in tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("start this this that end"));
          expect(test).toBe(true);
        });

        it("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("start middle end"));
          expect(test).toBe(false);
        });
      });

      describe("TEST_AT_START", () => {
        const rule = new Rule.Keywords("this that");
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("this that"));
          expect(test).toBe(true);
        });

        it("returns false if not present at start of tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("start this this that end"));
          expect(test).toBe(false);
        });

        it("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("start middle end"));
          expect(test).toBe(false);
        });
      });
    });
    describe("parse() method", () => {
      const rule = new Rule.Keywords("this that");
      it("parses at the start of tokens", () => {
        const match = rule.parse(new Scope(parser), tokenize("this that other"));
        expect(match.matchLength).toBe(2);
        expect(match.compile()).toBe("this that");
      });

      it("does not parse in the middle of tokens", () => {
        const match = rule.parse(new Scope(parser), tokenize("start this that other"));
        expect(match).toBeUndefined();
      });
    });
  });
});

describe("Rule.Pattern", () => {
  const parser = new Parser();
  // test with "word" pattern
  const ruleAtStart = new Rule.Pattern({
    pattern: /^[a-z][\w\-]*$/,
    blacklist: ["nope"],
  });
  const ruleAnywhere = new Rule.Pattern({
    pattern: /^[a-z][\w\-]*$/,
    blacklist: ["nope"],
    testLocation: TestLocation.ANYWHERE
  });

  it("converts array blacklist to a map", () => {
    expect(ruleAtStart.blacklist.constructor).toBe(Object);
    expect(ruleAtStart.blacklist.nope).toBe(true);
  });

  describe("test() method", () => {
    describe("TEST_AT_START", () => {
      it("returns true if present at the start of tokens", () => {
        const test = ruleAtStart.test(new Scope(parser), tokenize("a-word"));
        expect(test).toBe(true);
      });

      it("returns false if not present at start of tokens", () => {
        const test = ruleAtStart.test(new Scope(parser), tokenize("Type a-word 2"));
        expect(test).toBe(false);
      });

      it("returns false if NOT present anywhere in tokens", () => {
        const test = ruleAtStart.test(new Scope(parser), tokenize("Type 2 3"));
        expect(test).toBe(false);
      });
    });

    describe("TEST_ANYWHERE", () => {
      it("returns true if present at the start of tokens", () => {
        const test = ruleAnywhere.test(new Scope(parser), tokenize("a-word"));
        expect(test).toBe(true);
      });

      it("returns true if present anywhere in tokens", () => {
        const test = ruleAnywhere.test(new Scope(parser), tokenize("Type a-word 2"));
        expect(test).toBe(true);
      });

      it("returns false if NOT present anywhere in tokens", () => {
        const test = ruleAnywhere.test(new Scope(parser), tokenize("Type 2 3"));
        expect(test).toBe(false);
      });
    });

  });

  describe("parse() method", () => {
    it("parses at the start of tokens", () => {
      const match = ruleAtStart.parse(new Scope(parser), tokenize("a-word"));
      expect(match.matchLength).toBe(1);
      expect(match.compile()).toBe("a-word");
    });

    it("returns undefined if match is in blacklist", () => {
      const match = ruleAtStart.parse(new Scope(parser), tokenize("nope"));
      expect(match).toBeUndefined();
    });

    it("does not parse in the middle of tokens", () => {
      const match = ruleAtStart.parse(new Scope(parser), tokenize("Type a-word 2"));
      expect(match).toBeUndefined();
    });
  });
});


describe("Rule.Subrule", () => {
  const parser = new Parser();
  parser.defineRules(
    new Rule.Keywords({ name: "this", literals: "this" }),
    new Rule.Keywords({ name: "that", literals: "that" }),
    {
      name: "sequence",
      syntax: "{this} {that}",
      testRule: new Rule.Keywords("this that"),
      compile(results) {
        return "COMPILED";
      }
    }
  );

  describe("simple rules", () => {
    describe("test() method", () => {
      describe("TEST_AT_START", () => {
        const rule = new Rule.Subrule({ rule: "this" });
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("this that other"));
          expect(test).toBe(true);
        });

        it("returns false if not present at start of tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("that this other"));
          expect(test).toBe(false);
        });

        it("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("that other else"));
          expect(test).toBe(false);
        });
      });

      describe("TEST_ANYWHERE", () => {
        const rule = new Rule.Subrule({ rule: "this", testLocation: TestLocation.ANYWHERE });
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("this that other"));
          expect(test).toBe(true);
        });

        it("returns true if present anywhere in tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("that this other"));
          expect(test).toBe(true);
        });

        it("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("that other else"));
          expect(test).toBe(false);
        });
      });
    });
    describe("parse() method", () => {
      const rule = new Rule.Subrule({ rule: "this" });
      it("parses at the start of tokens", () => {
        const match = rule.parse(new Scope(parser), tokenize("this that other"));
        expect(match.matchLength).toBe(1);
        expect(match.compile()).toBe("this");
      });

      it("does not parse in the middle of tokens", () => {
        const match = rule.parse(new Scope(parser), tokenize("that this other"));
        expect(match).toBeUndefined();
      });
    });
  });

  describe("sequence rules", () => {
    describe("test() method", () => {
      describe("TEST_AT_START", () => {
        const rule = new Rule.Subrule({ rule: "this" });
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("this that"));
          expect(test).toBe(true);
        });

        it("returns false if not present at start of tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("that this that"));
          expect(test).toBe(false);
        });

        it("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("that that that"));
          expect(test).toBe(false);
        });
      });

      describe("TEST_AT_START", () => {
        const rule = new Rule.Subrule({ rule: "this", testLocation: TestLocation.ANYWHERE });
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("this that"));
          expect(test).toBe(true);
        });

        it("returns true if present anywhere in tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("that this that"));
          expect(test).toBe(true);
        });

        it("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("that that that"));
          expect(test).toBe(false);
        });
      });
    });
    describe("parse() method", () => {
      const rule = new Rule.Subrule({ rule: "sequence" });
      it("parses at the start of tokens", () => {
        const match = rule.parse(new Scope(parser), tokenize("this that"));
        expect(match.matchLength).toBe(2);
        expect(match.compile()).toBe("COMPILED");
      });

      it("does not parse in the middle of tokens", () => {
        const match = rule.parse(new Scope(parser), tokenize("that this that"));
        expect(match).toBeUndefined();
      });
    });
  });
});

describe("Rule.Choice", () => {
  const parser = new Parser();

  const ruleStart = new Rule.Choice({
    rules: [
      new Rule.Keywords("this"),
      new Rule.Keywords("that"),
      new Rule.Keywords("other"),
    ],
    promote: true,
    argument: "arg"
  });

  const ruleAnywhere = new Rule.Choice({
    rules: [
      new Rule.Keywords("this"),
      new Rule.Keywords("that"),
      new Rule.Keywords("other"),
    ],
    promote: true,
    argument: "arg",
    testLocation: TestLocation.ANYWHERE
  });

  describe("test() method", () => {
    describe("TEST_AT_START", () => {
      it("returns true if present at the start of tokens", () => {
        const test = ruleStart.test(new Scope(parser), tokenize("this that other"));
        expect(test).toBe(true);
      });

      it("returns false if NOT present at start of tokens", () => {
        const test = ruleStart.test(new Scope(parser), tokenize("start this middle end"));
        expect(test).toBe(false);
      });
    });

    describe("TEST_ANYWHERE", () => {
      it("returns true if present at the start of tokens", () => {
        const test = ruleAnywhere.test(new Scope(parser), tokenize("this that other"));
        expect(test).toBe(true);
      });

      it("returns true if present anywhere in tokens", () => {
        const test = ruleAnywhere.test(new Scope(parser), tokenize("start that end"));
        expect(test).toBe(true);
      });

      it("returns false if NOT present anywhere in tokens", () => {
        const test = ruleAnywhere.test(new Scope(parser), tokenize("start middle end"));
        expect(test).toBe(false);
      });
    });
  });

  describe("parse() method", () => {
    it("parses any of the choices at the start of tokens", () => {
      let match = ruleStart.parse(new Scope(parser), tokenize("this"));
      expect(match.matchLength).toBe(1);
      expect(match.compile()).toBe("this");

      match = ruleStart.parse(new Scope(parser), tokenize("that"));
      expect(match.matchLength).toBe(1);
      expect(match.compile()).toBe("that");

      match = ruleStart.parse(new Scope(parser), tokenize("other"));
      expect(match.matchLength).toBe(1);
      expect(match.compile()).toBe("other");
    });

    it("does not parse in the middle of tokens", () => {
      let match = ruleStart.parse(new Scope(parser), tokenize("start this end"));
      expect(match).toBeUndefined();

      match = ruleStart.parse(new Scope(parser), tokenize("start that end"));
      expect(match).toBeUndefined();

      match = ruleStart.parse(new Scope(parser), tokenize("start other end"));
      expect(match).toBeUndefined();
    });

    it("sets 'argument' on the result", () => {
      const match = ruleStart.parse(new Scope(parser), tokenize("this"));
      expect(match.argument).toBe("arg");
    });

    it("sets 'promote' on the result", () => {
      const match = ruleStart.parse(new Scope(parser), tokenize("this"));
      expect(match.promote).toBe(true);
    });
  });
});

describe("Rule.Repeat", () => {
  const parser = new Parser();
  const ruleNoTest = new Rule.Repeat(new Rule.Keywords("word"));
  const ruleStart = new Rule.Repeat({
    testRule: new Rule.Keywords("word"),
    rule: new Rule.Keywords("word")
  });
  const ruleAnywhere = new Rule.Repeat({
    testRule: new Rule.Keywords("word"),
    rule: new Rule.Keywords("word"),
    testLocation: TestLocation.ANYWHERE
  });

  describe("test() method", () => {
    describe("without a testRule", () => {
      it("returns undefined", () => {
        const test = ruleNoTest.test(new Scope(parser), tokenize("word"));
        expect(test).toBe(undefined);
      });
    });

    describe("TEST_AT_START", () => {
      it("returns true if present at the start of tokens", () => {
        const test = ruleStart.test(new Scope(parser), tokenize("word"));
        expect(test).toBe(true);
      });

      it("returns false if NOT present at start of tokens", () => {
        const test = ruleStart.test(new Scope(parser), tokenize("nope word nope"));
        expect(test).toBe(false);
      });
    });

    describe("TEST_ANYWHERE", () => {
      it("returns true if present at the start of tokens", () => {
        const test = ruleAnywhere.test(new Scope(parser), tokenize("word"));
        expect(test).toBe(true);
      });

      it("returns true if present anywhere in tokens", () => {
        const test = ruleAnywhere.test(new Scope(parser), tokenize("nope word nope"));
        expect(test).toBe(true);
      });

      it("returns false if NOT present anywhere in tokens", () => {
        const test = ruleAnywhere.test(new Scope(parser), tokenize("nope nope nope"));
        expect(test).toBe(false);
      });
    });

  });

  describe("parse() method", () => {
    it("returns an array when compiled", () => {
      const match = ruleStart.parse(new Scope(parser), tokenize("word nope nope"));
      expect(match.compile()).toBeInstanceOf(Array);
    });

    it("parses once at the start of tokens", () => {
      const match = ruleStart.parse(new Scope(parser), tokenize("word nope nope"));
      expect(match.matchLength).toBe(1);
      expect(match.compile()).toEqual(["word"]);
    });

    it("parses multiple times at the start of tokens", () => {
      const match = ruleStart.parse(new Scope(parser), tokenize("word word nope nope"));
      expect(match.matchLength).toBe(2);
      expect(match.compile()).toEqual(["word", "word"]);
    });

    it("does not parse in the middle of tokens", () => {
      const match = ruleStart.parse(new Scope(parser), tokenize("nope word word"));
      expect(match).toBeUndefined();
    });
  });
});


describe("Rule.List", () => {
  const parser = new Parser();
  const rule = new Rule.Keywords("word");
  const delimiter = new Rule.Symbols(",");
  const testRule = new Rule.Keywords("word");

  const ruleNoTest = new Rule.List({ rule, delimiter });
  const ruleStart = new Rule.List({ testRule, rule, delimiter });
  const ruleAnywhere = new Rule.List({ testRule, rule, delimiter, testLocation: TestLocation.ANYWHERE });

  describe("test() method", () => {
    describe("without a testRule", () => {
      it("returns undefined", () => {
        const test = ruleNoTest.test(new Scope(parser), tokenize("word"));
        expect(test).toBe(undefined);
      });
    });

    describe("TEST_AT_START", () => {
      it("returns true if present at the start of tokens", () => {
        const test = ruleStart.test(new Scope(parser), tokenize("word"));
        expect(test).toBe(true);
      });

      it("returns false if NOT present at start in tokens", () => {
        const test = ruleStart.test(new Scope(parser), tokenize("nope word nope"));
        expect(test).toBe(false);
      });
    });

    describe("TEST_ANYWHERE", () => {
      it("returns true if present at the start of tokens", () => {
        const test = ruleAnywhere.test(new Scope(parser), tokenize("word"));
        expect(test).toBe(true);
      });

      it("returns true if present anywhere in tokens", () => {
        const test = ruleAnywhere.test(new Scope(parser), tokenize("nope word nope"));
        expect(test).toBe(true);
      });

      it("returns false if NOT present anywhere in tokens", () => {
        const test = ruleAnywhere.test(new Scope(parser), tokenize("nope nope nope"));
        expect(test).toBe(false);
      });
    });

  });

  describe("parse() method", () => {
    it("returns an array when compiled", () => {
      const match = ruleStart.parse(new Scope(parser), tokenize("word nope nope"));
      expect(match.compile()).toBeInstanceOf(Array);
    });

    it("parses once at the start of tokens", () => {
      const match = ruleStart.parse(new Scope(parser), tokenize("word nope nope"));
      expect(match.matchLength).toBe(1);
      expect(match.compile()).toEqual(["word"]);
    });

    it("parses multiple times at the start of tokens WITH spaces", () => {
      const match = ruleStart.parse(new Scope(parser), tokenize("word, word nope nope"));
      expect(match.matchLength).toBe(3);
      expect(match.compile()).toEqual(["word", "word"]);
    });

    it("parses multiple times at the start of tokens WITHOUT spaces", () => {
      const match = ruleStart.parse(new Scope(parser), tokenize("word,word nope nope"));
      expect(match.matchLength).toBe(3);
      expect(match.compile()).toEqual(["word", "word"]);
    });

    it("eats but trailing delimiter", () => {
      const match = ruleStart.parse(new Scope(parser), tokenize("word, word, nope"));
      expect(match.matchLength).toBe(4);
      expect(match.compile()).toEqual(["word", "word"]);
    });

    it("does not parse in the middle of tokens", () => {
      const match = ruleStart.parse(new Scope(parser), tokenize("nope word,word nope"));
      expect(match).toBeUndefined();
    });
  });
});


describe("Rule.Sequence", () => {
  const parser = new Parser();
  parser.defineRules(
    new Rule.Keywords({ name: "that", literals: "that" }),
    new Rule.Keywords({ name: "other", literals: "other" }),
    {
      name: "noTest",
      syntax: "this {that} the {other}",
    },
    {
      name: "atStart",
      syntax: "this {that} the {other}",
      testRule: new Rule.Keywords("this"),
      compile() {
        return "COMPILED";
      }
    },
    {
      name: "anywhere",
      syntax: "this {that} the {other}",
      testRule: new Rule.Keywords("this"),
      testLocation: TestLocation.ANYWHERE,
    },
    {
      name: "noCompile",
      syntax: "this {that} the {other}",
    },
  );

  describe("sequences without a compile method", () => {
    const rule = parser.rules.noCompile;
    it("return 'match.results' on compile", () => {
      const match = rule.parse(new Scope(parser), tokenize("this that the other"));
      expect(match.compile()).toEqual({ that: "that", other: "other" });
    });
  }),

  describe("simple sequences", () => {
    describe("test() method", () => {
      describe("without a testRule", () => {
        const rule = parser.rules.noTest;
        it("returns undefined", () => {
          const test = rule.test(new Scope(parser), tokenize("word"));
          expect(test).toBe(undefined);
        });
      });

      describe("TEST_AT_START", () => {
        const rule = parser.rules.atStart;
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("this that other"));
          expect(test).toBe(true);
        });

        it("returns false if NOT present anywhere at start of tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("start this middle end"));
          expect(test).toBe(false);
        });
      });

      describe("TEST_ANYWHERE", () => {
        const rule = parser.rules.anywhere;
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("this that other"));
          expect(test).toBe(true);
        });

        it("returns true if present anywhere in tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("other this that"));
          expect(test).toBe(true);
        });

        it("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(new Scope(parser), tokenize("start middle end"));
          expect(test).toBe(false);
        });
      });
    });

    describe("parse() method", () => {
      const rule = parser.rules.atStart;
      it("parses at the start of tokens", () => {
        const match = rule.parse(new Scope(parser), tokenize("this that the other"));
        expect(match.matchLength).toBe(4);
        expect(match.compile()).toBe("COMPILED");
        const results = match.results;
        expect(results.that).toBe("that");
        expect(results.other).toBe("other");
      });

      it("does not parse in the middle of tokens", () => {
        const match = rule.parse(new Scope(parser), tokenize("something this that the other"));
        expect(match).toBeUndefined();
      });
    });
  });
});

