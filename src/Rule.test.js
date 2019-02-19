import Parser, { ParserError } from "./Parser.js";
import parseRule from "./parseRule.js";
import Rule, { TEST_ANYWHERE } from "./Rule.js";
import Token from "./Token.js";
import Tokenizer from "./Tokenizer.js";


// FIXME:  currently we have to eat whitespace in tokens for the below to work... ???
function tokenize(text) {
  return Tokenizer.tokenizeWithoutWhitespace(text);
}

describe("Rule.Symbols", () => {
  describe("on construction", () => {
    it("creates proper rule when passed literals as a string", () => {
      const rule = new Rule.Keywords({ literals: ">" });
      expect(rule.literals).toEqual([">"]);
    });

    it("creates proper rule when passed single symbol as a string", () => {
      const rule = new Rule.Symbols(">");
      expect(rule.literals).toEqual([">"]);
    });

    it("creates proper rule when passed multiple symbols as a string", () => {
      const rule = new Rule.Symbols(">=");
      expect(rule.literals).toEqual([">", "="]);
    });
  });

  const parser = new Parser();
  describe("with a single symbol", () => {
    describe("test() method", () => {
      describe("TEST_AT_START", () => {
        const rule = new Rule.Symbols(">");
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize(">"));
          expect(test).toBe(true);
        });

        it("returns false if not present at the start of tokens", () => {
          const test = rule.test(parser, tokenize("a > b"));
          expect(test).toBe(false);
        });
      });

      describe("TEST_ANYWHERE", () => {
        const rule = new Rule.Symbols({ literals: ">", testAnywhere: TEST_ANYWHERE });
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize(">"));
          expect(test).toBe(true);
        });

        it("returns true if present in the middle of tokens", () => {
          const test = rule.test(parser, tokenize("a > b"));
          expect(test).toBe(true);
        });

        it("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("a b c"));
          expect(test).toBe(false);
        });
      });

    });
    describe("parse() method", () => {
      const rule = new Rule.Symbols(">");
      it("parses at the start of tokens", () => {
        const match = rule.parse(parser, tokenize(">"));
        expect(match.nextStart).toBe(1);
        expect(match.compile()).toBe(">");
      });

      it("does not parse in the middle of tokens", () => {
        const match = rule.parse(parser, tokenize("=>"));
        expect(match).toBeUndefined();
      });
    });
  });

  describe("with multiple symbols", () => {
    describe("test() method", () => {
      describe("TEST_AT_START", () => {
        const rule = new Rule.Symbols(">=");
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize(">= b"));
          expect(test).toBe(true);
        });

        it("returns false if not present at the start of tokens", () => {
          const test = rule.test(parser, tokenize("a >= b"));
          expect(test).toBe(false);
        });
      });

      describe("TEST_ANYWHERE", () => {
        const rule = new Rule.Symbols({ literals: ">=", testAnywhere: TEST_ANYWHERE });
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize(">="));
          expect(test).toBe(true);
        });

        it("returns true if present in the middle of tokens", () => {
          const test = rule.test(parser, tokenize("a >= b"));
          expect(test).toBe(true);
        });

        it("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("a b c"));
          expect(test).toBe(false);
        });
      });
    });
    describe("parse() method", () => {
      const rule = new Rule.Symbols(">=");
      it("parses at the start of tokens", () => {
        const match = rule.parse(parser, tokenize(">="));
        expect(match.nextStart).toBe(2);
        expect(match.compile()).toBe(">=");
      });

      it("does not parse in the middle of tokens", () => {
        const match = rule.parse(parser, tokenize("a>="));
        expect(match).toBeUndefined();
      });
    });
  });
});


describe("Rule.Keywords", () => {
  describe("on construction", () => {
    it("creates proper rule when passed literals as a string", () => {
      const rule = new Rule.Keywords({ literals: "this" });
      expect(rule.literals).toEqual(["this"]);
    });

    it("creates proper rule when passed single keyword as a string", () => {
      const rule = new Rule.Keywords("this");
      expect(rule.literals).toEqual(["this"]);
    });

    it("creates proper rule when passed multiple keywords as a string", () => {
      const rule = new Rule.Keywords("this that");
      expect(rule.literals).toEqual(["this", "that"]);
    });
  });

  const parser = new Parser();
  describe("with a single keyword", () => {
    describe("test() method", () => {
      describe("TEST_ANYWHERE", () => {
        const rule = new Rule.Keywords({ literals: "this", testAnywhere: TEST_ANYWHERE });
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize("this"));
          expect(test).toBe(true);
        });

        it("returns true if present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("start this end"));
          expect(test).toBe(true);
        });

        it("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("start middle end"));
          expect(test).toBe(false);
        });
      });

      describe("TEST_AT_START", () => {
        const rule = new Rule.Keywords("this");
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize("this"));
          expect(test).toBe(true);
        });

        it("returns false if not present at the start of tokens", () => {
          const test = rule.test(parser, tokenize("start this end"));
          expect(test).toBe(false);
        });
      });
    });
    describe("parse() method", () => {
      const rule = new Rule.Keywords("this");
      it("parses at the start of tokens", () => {
        const match = rule.parse(parser, tokenize("this"));
        expect(match.nextStart).toBe(1);
        expect(match.compile()).toBe("this");
      });

      it("does not parse in the middle of tokens", () => {
        const match = rule.parse(parser, tokenize("that this"));
        expect(match).toBeUndefined();
      });
    });
  });

  describe("with multiple keywords", () => {
    describe("test() method", () => {
      describe("TEST_ANYWHERE", () => {
        const rule = new Rule.Keywords({ literals: "this that", testAnywhere: TEST_ANYWHERE });
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize("this that"));
          expect(test).toBe(true);
        });

        it("returns true if present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("start this this that end"));
          expect(test).toBe(true);
        });

        it("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("start middle end"));
          expect(test).toBe(false);
        });
      });

      describe("TEST_AT_START", () => {
        const rule = new Rule.Keywords("this that");
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize("this that"));
          expect(test).toBe(true);
        });

        it("returns false if not present at start of tokens", () => {
          const test = rule.test(parser, tokenize("start this this that end"));
          expect(test).toBe(false);
        });

        it("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("start middle end"));
          expect(test).toBe(false);
        });
      });
    });
    describe("parse() method", () => {
      const rule = new Rule.Keywords("this that");
      it("parses at the start of tokens", () => {
        const match = rule.parse(parser, tokenize("this that other"));
        expect(match.nextStart).toBe(2);
        expect(match.compile()).toBe("this that");
      });

      it("does not parse in the middle of tokens", () => {
        const match = rule.parse(parser, tokenize("start this that other"));
        expect(match).toBeUndefined();
      });
    });
  });
});

describe("Rule.Pattern", () => {
  const parser = new Parser();
  // test with "word" pattern
  const ruleAtStart = new Rule.Pattern({
    testAtStart: true,
    pattern: /^[a-z][\w\-]*$/,
    blacklist: ["nope"],
  });
  const ruleAnywhere = new Rule.Pattern({
    pattern: /^[a-z][\w\-]*$/,
    blacklist: ["nope"],
    testAnywhere: TEST_ANYWHERE
  });

  it("converts array blacklist to a map", () => {
    expect(ruleAtStart.blacklist.constructor).toBe(Object);
    expect(ruleAtStart.blacklist.nope).toBe(true);
  });

  describe("test() method", () => {
    describe("TEST_AT_START", () => {
      it("returns true if present at the start of tokens", () => {
        const test = ruleAtStart.test(parser, tokenize("a-word"));
        expect(test).toBe(true);
      });

      it("returns false if not present at start of tokens", () => {
        const test = ruleAtStart.test(parser, tokenize("Type a-word 2"));
        expect(test).toBe(false);
      });

      it("returns false if NOT present anywhere in tokens", () => {
        const test = ruleAtStart.test(parser, tokenize("Type 2 3"));
        expect(test).toBe(false);
      });
    });

    describe("TEST_ANYWHERE", () => {
      it("returns true if present at the start of tokens", () => {
        const test = ruleAnywhere.test(parser, tokenize("a-word"));
        expect(test).toBe(true);
      });

      it("returns true if present anywhere in tokens", () => {
        const test = ruleAnywhere.test(parser, tokenize("Type a-word 2"));
        expect(test).toBe(true);
      });

      it("returns false if NOT present anywhere in tokens", () => {
        const test = ruleAnywhere.test(parser, tokenize("Type 2 3"));
        expect(test).toBe(false);
      });
    });

  });

  describe("parse() method", () => {
    it("parses at the start of tokens", () => {
      const match = ruleAtStart.parse(parser, tokenize("a-word"));
      expect(match.nextStart).toBe(1);
      expect(match.compile()).toBe("a-word");
    });

    it("returns undefined if match is in blacklist", () => {
      const match = ruleAtStart.parse(parser, tokenize("nope"));
      expect(match).toBeUndefined();
    });

    it("does not parse in the middle of tokens", () => {
      const match = ruleAtStart.parse(parser, tokenize("Type a-word 2"));
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
      constructor: class Sequence extends Rule.Sequence {
        compile(results) {
          return "COMPILED";
        }
      }
    }
  );

  describe("simple rules", () => {
    describe("test() method", () => {
      describe("TEST_AT_START", () => {
        const rule = new Rule.Subrule({ subrule: "this" });
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize("this that other"));
          expect(test).toBe(true);
        });

        it("returns false if not present at start of tokens", () => {
          const test = rule.test(parser, tokenize("that this other"));
          expect(test).toBe(false);
        });

        it("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("that other else"));
          expect(test).toBe(false);
        });
      });

      describe("TEST_ANYWHERE", () => {
        const rule = new Rule.Subrule({ subrule: "this", testAnywhere: TEST_ANYWHERE });
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize("this that other"));
          expect(test).toBe(true);
        });

        it("returns true if present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("that this other"));
          expect(test).toBe(true);
        });

        it("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("that other else"));
          expect(test).toBe(false);
        });
      });
    });
    describe("parse() method", () => {
      const rule = new Rule.Subrule({ subrule: "this" });
      it("parses at the start of tokens", () => {
        const match = rule.parse(parser, tokenize("this that other"));
        expect(match.nextStart).toBe(1);
        expect(match.compile()).toBe("this");
      });

      it("does not parse in the middle of tokens", () => {
        const match = rule.parse(parser, tokenize("that this other"));
        expect(match).toBeUndefined();
      });
    });
  });

  describe("sequence rules", () => {
    describe("test() method", () => {
      describe("TEST_AT_START", () => {
        const rule = new Rule.Subrule({ subrule: "this" });
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize("this that"));
          expect(test).toBe(true);
        });

        it("returns false if not present at start of tokens", () => {
          const test = rule.test(parser, tokenize("that this that"));
          expect(test).toBe(false);
        });

        it("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("that that that"));
          expect(test).toBe(false);
        });
      });

      describe("TEST_AT_START", () => {
        const rule = new Rule.Subrule({ subrule: "this", testAnywhere: TEST_ANYWHERE });
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize("this that"));
          expect(test).toBe(true);
        });

        it("returns true if present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("that this that"));
          expect(test).toBe(true);
        });

        it("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("that that that"));
          expect(test).toBe(false);
        });
      });
    });
    describe("parse() method", () => {
      const rule = new Rule.Subrule({ subrule: "sequence" });
      it("parses at the start of tokens", () => {
        const match = rule.parse(parser, tokenize("this that"));
        expect(match.nextStart).toBe(2);
        expect(match.compile()).toBe("COMPILED");
      });

      it("does not parse in the middle of tokens", () => {
        const match = rule.parse(parser, tokenize("that this that"));
        expect(match).toBeUndefined();
      });
    });
  });
});

describe("Rule.Alternatives", () => {
  const parser = new Parser();

  parser.defineRule({
    name: "ruleStart",
    syntax: "(?:arg:this|that|other)",
    constructor: class Alt2 extends Rule.Alternatives {}
  });
  const ruleStart = parser.rules.ruleStart;

  parser.defineRule({
    name: "ruleAnywhere",
    syntax: "(?:arg:this|that|other)",
    testAnywhere: TEST_ANYWHERE,
    constructor: class Alt extends Rule.Alternatives {}
  });
  const ruleAnywhere = parser.rules.ruleAnywhere;


  describe("test() method", () => {
    describe("TEST_AT_START", () => {
      it("returns true if present at the start of tokens", () => {
        const test = ruleStart.test(parser, tokenize("this that other"));
        expect(test).toBe(true);
      });

      it("returns false if NOT present at start of tokens", () => {
        const test = ruleStart.test(parser, tokenize("start this middle end"));
        expect(test).toBe(false);
      });
    });

    describe("TEST_ANYWHERE", () => {
      it("returns true if present at the start of tokens", () => {
        const test = ruleAnywhere.test(parser, tokenize("this that other"));
        expect(test).toBe(true);
      });

      it("returns true if present anywhere in tokens", () => {
        const test = ruleAnywhere.test(parser, tokenize("start that end"));
        expect(test).toBe(true);
      });

      it("returns false if NOT present anywhere in tokens", () => {
        const test = ruleAnywhere.test(parser, tokenize("start middle end"));
        expect(test).toBe(false);
      });
    });
  });

  describe("parse() method", () => {
    it("parses any of the alternatives at the start of tokens", () => {
      let match = ruleStart.parse(parser, tokenize("this"));
      expect(match.nextStart).toBe(1);
      expect(match.compile()).toBe("this");

      match = ruleStart.parse(parser, tokenize("that"));
      expect(match.nextStart).toBe(1);
      expect(match.compile()).toBe("that");

      match = ruleStart.parse(parser, tokenize("other"));
      expect(match.nextStart).toBe(1);
      expect(match.compile()).toBe("other");
    });

    it("does not parse in the middle of tokens", () => {
      let match = ruleStart.parse(parser, tokenize("start this end"));
      expect(match).toBeUndefined();

      match = ruleStart.parse(parser, tokenize("start that end"));
      expect(match).toBeUndefined();

      match = ruleStart.parse(parser, tokenize("start other end"));
      expect(match).toBeUndefined();
    });

    it("sets 'argument' on the result", () => {
      const match = ruleStart.parse(parser, tokenize("this"));
      expect(match.argument).toBe("arg");
    });

    it("sets 'promote' on the result", () => {
      const match = ruleStart.parse(parser, tokenize("this"));
      expect(match.promote).toBe(true);
    });
  });
});

describe("Rule.Repeat", () => {
  const parser = new Parser();
  const ruleNoTest = new Rule.Repeat({
    repeat: new Rule.Keywords("word")
  });
  const ruleStart = new Rule.Repeat({
    testRule: new Rule.Keywords("word"),
    repeat: new Rule.Keywords("word")
  });
  const ruleAnywhere = new Rule.Repeat({
    testRule: new Rule.Keywords("word"),
    repeat: new Rule.Keywords("word"),
    testAnywhere: TEST_ANYWHERE
  });

  describe("test() method", () => {
    describe("without a testRule", () => {
      it("returns undefined", () => {
        const test = ruleNoTest.test(parser, tokenize("word"));
        expect(test).toBe(undefined);
      });
    });

    describe("TEST_AT_START", () => {
      it("returns true if present at the start of tokens", () => {
        const test = ruleStart.test(parser, tokenize("word"));
        expect(test).toBe(true);
      });

      it("returns false if NOT present at start of tokens", () => {
        const test = ruleStart.test(parser, tokenize("nope word nope"));
        expect(test).toBe(false);
      });
    });

    describe("TEST_ANYWHERE", () => {
      it("returns true if present at the start of tokens", () => {
        const test = ruleAnywhere.test(parser, tokenize("word"));
        expect(test).toBe(true);
      });

      it("returns true if present anywhere in tokens", () => {
        const test = ruleAnywhere.test(parser, tokenize("nope word nope"));
        expect(test).toBe(true);
      });

      it("returns false if NOT present anywhere in tokens", () => {
        const test = ruleAnywhere.test(parser, tokenize("nope nope nope"));
        expect(test).toBe(false);
      });
    });

  });

  describe("parse() method", () => {
    it("returns an array when compiled", () => {
      const match = ruleStart.parse(parser, tokenize("word nope nope"));
      expect(match.compile()).toBeInstanceOf(Array);
    });

    it("parses once at the start of tokens", () => {
      const match = ruleStart.parse(parser, tokenize("word nope nope"));
      expect(match.nextStart).toBe(1);
      expect(match.compile()).toEqual(["word"]);
    });

    it("parses multiple times at the start of tokens", () => {
      const match = ruleStart.parse(parser, tokenize("word word nope nope"));
      expect(match.nextStart).toBe(2);
      expect(match.compile()).toEqual(["word", "word"]);
    });

    it("does not parse in the middle of tokens", () => {
      const match = ruleStart.parse(parser, tokenize("nope word word"));
      expect(match).toBeUndefined();
    });
  });
});


describe("Rule.List", () => {
  const parser = new Parser();
  const item = new Rule.Keywords("word");
  const delimiter = new Rule.Symbols(",");
  const testRule = new Rule.Keywords("word");

  const ruleNoTest = new Rule.List({ item, delimiter });
  const ruleStart = new Rule.List({ testRule, item, delimiter });
  const ruleAnywhere = new Rule.List({ testRule, item, delimiter, testAnywhere: TEST_ANYWHERE });

  describe("test() method", () => {
    describe("without a testRule", () => {
      it("returns undefined", () => {
        const test = ruleNoTest.test(parser, tokenize("word"));
        expect(test).toBe(undefined);
      });
    });

    describe("TEST_AT_START", () => {
      it("returns true if present at the start of tokens", () => {
        const test = ruleStart.test(parser, tokenize("word"));
        expect(test).toBe(true);
      });

      it("returns false if NOT present at start in tokens", () => {
        const test = ruleStart.test(parser, tokenize("nope word nope"));
        expect(test).toBe(false);
      });
    });

    describe("TEST_ANYWHERE", () => {
      it("returns true if present at the start of tokens", () => {
        const test = ruleAnywhere.test(parser, tokenize("word"));
        expect(test).toBe(true);
      });

      it("returns true if present anywhere in tokens", () => {
        const test = ruleAnywhere.test(parser, tokenize("nope word nope"));
        expect(test).toBe(true);
      });

      it("returns false if NOT present anywhere in tokens", () => {
        const test = ruleAnywhere.test(parser, tokenize("nope nope nope"));
        expect(test).toBe(false);
      });
    });

  });

  describe("parse() method", () => {
    it("returns an array when compiled", () => {
      const match = ruleStart.parse(parser, tokenize("word nope nope"));
      expect(match.compile()).toBeInstanceOf(Array);
    });

    it("parses once at the start of tokens", () => {
      const match = ruleStart.parse(parser, tokenize("word nope nope"));
      expect(match.nextStart).toBe(1);
      expect(match.compile()).toEqual(["word"]);
    });

    it("parses multiple times at the start of tokens WITH spaces", () => {
      const match = ruleStart.parse(parser, tokenize("word, word nope nope"));
      expect(match.nextStart).toBe(3);
      expect(match.compile()).toEqual(["word", "word"]);
    });

    it("parses multiple times at the start of tokens WITHOUT spaces", () => {
      const match = ruleStart.parse(parser, tokenize("word,word nope nope"));
      expect(match.nextStart).toBe(3);
      expect(match.compile()).toEqual(["word", "word"]);
    });

    it("eats but trailing delimiter", () => {
      const match = ruleStart.parse(parser, tokenize("word, word, nope"));
      expect(match.nextStart).toBe(4);
      expect(match.compile()).toEqual(["word", "word"]);
    });

    it("does not parse in the middle of tokens", () => {
      const match = ruleStart.parse(parser, tokenize("nope word,word nope"));
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
      constructor: class noTest extends Rule.Sequence{}
    },
    {
      name: "atStart",
      syntax: "this {that} the {other}",
      testRule: new Rule.Keywords("this"),
      constructor: class atStart extends Rule.Sequence{
        compile() {
          return "COMPILED";
        }
      }
    },
    {
      name: "anywhere",
      syntax: "this {that} the {other}",
      testRule: new Rule.Keywords("this"),
      testAnywhere: TEST_ANYWHERE,
      constructor: class anywhere extends Rule.Sequence{}
    },
    {
      name: "noCompile",
      syntax: "this {that} the {other}",
      constructor: Rule.Sequence
    },
  );

  describe("sequences without a compile method", () => {
    const rule = parser.rules.noCompile;
    it("throw on compile", () => {
      const match = rule.parse(parser, tokenize("this that the other"));
      expect(() => match.compile()).toThrow(ParserError);
    });
  }),

  describe("simple sequences", () => {
    describe("test() method", () => {
      describe("without a testRule", () => {
        const rule = parser.rules.noTest;
        it("returns undefined", () => {
          const test = rule.test(parser, tokenize("word"));
          expect(test).toBe(undefined);
        });
      });

      describe("TEST_AT_START", () => {
        const rule = parser.rules.atStart;
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize("this that other"));
          expect(test).toBe(true);
        });

        it("returns false if NOT present anywhere at start of tokens", () => {
          const test = rule.test(parser, tokenize("start this middle end"));
          expect(test).toBe(false);
        });
      });

      describe("TEST_ANYWHERE", () => {
        const rule = parser.rules.anywhere;
        it("returns true if present at the start of tokens", () => {
          const test = rule.test(parser, tokenize("this that other"));
          expect(test).toBe(true);
        });

        it("returns true if present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("other this that"));
          expect(test).toBe(true);
        });

        it("returns false if NOT present anywhere in tokens", () => {
          const test = rule.test(parser, tokenize("start middle end"));
          expect(test).toBe(false);
        });
      });
    });

    describe("parse() method", () => {
      const rule = parser.rules.atStart;
      it("parses at the start of tokens", () => {
        const match = rule.parse(parser, tokenize("this that the other"));
        expect(match.nextStart).toBe(4);
        expect(match.compile()).toBe("COMPILED");
        const results = match.results;
        expect(results.that).toBe("that");
        expect(results.other).toBe("other");
      });

      it("does not parse in the middle of tokens", () => {
        const match = rule.parse(parser, tokenize("something this that the other"));
        expect(match).toBeUndefined();
      });
    });
  });
});

describe("Rule.Comment", () => {
  const parser = new Parser();
  parser.defineRule({
    name: "comment",
    tokenType: Token.Comment,
    constructor: class comment extends Rule.TokenType {
      compile(match) {
        return "//" + `${match.matched.whitespace}${match.matched.comment}`;
      }
    }
  });
  parser.defineRules(
    { name: "statement", constructor: Rule.Statement },
    { name: "statements", constructor: Rule.Statements },
    { name: "this", syntax: "this", constructor: Rule.Keywords },
    { name: "that", syntax: "that", constructor: Rule.Keywords },
    {
      name: "this_and_that",
      alias: "statement",
      syntax: "{this} and {that}",
      testRule: "this",
      constructor: class this_and_that extends Rule.Sequence {
        compile(match) {
          return "this && that";
        }
      }
    }
  );
  describe("comment instances", () => {
    const rule = parser.rules.comment;
    describe("test() method", () => {
      it("returns true if present at the start of tokens", () => {
        let test = rule.test(parser, tokenize("// foo"));
        expect(test).toBe(true);

        test = rule.test(parser, tokenize("-- foo"));
        expect(test).toBe(true);

        test = rule.test(parser, tokenize("## foo"));
        expect(test).toBe(true);
      });

      it("returns false if not present at start of tokens", () => {
        const test = rule.test(parser, tokenize("foo -- foo"));
        expect(test).toBe(false);
      });

      it("returns false if NOT present anywhere in tokens", () => {
        const test = rule.test(parser, tokenize("foo bar baz"));
        expect(test).toBe(false);
      });
    });

    describe("parse() method", () => {
      it("parses at the start of tokens", () => {
        let match = rule.parse(parser, tokenize("// foo bar baz"));
        expect(match.rule).toBe(rule);
        expect(match.nextStart).toBe(1);
        expect(match.compile()).toBe("// foo bar baz");

        match = rule.parse(parser, tokenize("-- foo bar baz"));
        expect(match.rule).toBe(rule);
        expect(match.nextStart).toBe(1);
        expect(match.compile()).toBe("// foo bar baz");

        match = rule.parse(parser, tokenize("## foo bar baz"));
        expect(match.rule).toBe(rule);
        expect(match.nextStart).toBe(1);
        expect(match.compile()).toBe("// foo bar baz");
      });

      it("does not parse in the middle of tokens", () => {
        const match = rule.parse(parser, tokenize("foo // bar"));
        expect(match).toBeUndefined();
      });

      it("eats whitespace before the comment", () => {
        const match = rule.parse(parser, tokenize("  //foo"));
        expect(match).toBe(undefined);
      });

      it("includes any number of spaces at the beginning of the comment", () => {
        const match = rule.parse(parser, tokenize("//    foo"));
        expect(match.compile()).toBe("//    foo");
      });

      it("includes any number of tabs at the beginning of the comment", () => {
        const match = rule.parse(parser, tokenize("//\t\t\tfoo"));
        expect(match.compile()).toBe("//\t\t\tfoo");
      });

      it("includes a mixture of spaces and tabs at the beginning of the comment", () => {
        const match = rule.parse(parser, tokenize("//  \t  \tfoo"));
        expect(match.compile()).toBe("//  \t  \tfoo");
      });
    });
  });

  describe("comments at the end of statements", () => {
    const rule = parser.rules.comment;
    it("are appended when parsed as 'statements' with one line", () => {
      const match = parser.parse("statements", "this and that // comment");
      expect(match.rule).toBeInstanceOf(Rule.Statements);
      expect(match.matched.length).toBe(1);
      expect(match.matched[0].rule).toBeInstanceOf(parser.rules.this_and_that.constructor);
      expect(match.matched[0].comment.rule).toBe(rule);
      expect(match.compile()).toBe("this && that // comment");
    });

    it("are appended when parsed as 'statements' with multiple lines", () => {
      const match = parser.parse("statements", "this and that // comment\nthis and that -- other comment");
      expect(match.compile()).toBe("this && that // comment\nthis && that // other comment");
    });
  });
});

