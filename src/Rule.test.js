import Parser, { ParserError } from "./Parser.js";
import Rule from "./Rule.js";
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
    const rule = new Rule.Symbols(">");
    describe("test() method", () => {
      it("returns true if matched at the start of tokens", () => {
        const test = rule.test(parser, tokenize(">"));
        expect(test).toBe(true);
      });

      it("returns true if matched anywhere in tokens", () => {
        const test = rule.test(parser, tokenize("a > b"));
        expect(test).toBe(true);
      });

      it("returns false if NOT matched anywhere in tokens", () => {
        const test = rule.test(parser, tokenize("a b c"));
        expect(test).toBe(false);
      });

    });
    describe("parse() method", () => {
      it("parses at the start of tokens", () => {
        const match = rule.parse(parser, tokenize(">"));
        expect(match.nextStart).toBe(1);
        expect(match.compile(match)).toBe(">");
      });

      it("does not parse in the middle of tokens", () => {
        const match = rule.parse(parser, tokenize("=>"));
        expect(match).toBeUndefined();
      });
    });
  });

  describe("with multiple symbols", () => {
    const rule = new Rule.Symbols(">=");
    describe("test() method", () => {
      it("returns true if matched at the start of tokens", () => {
        const test = rule.test(parser, tokenize(">="));
        expect(test).toBe(true);
      });

      it("returns true if matched anywhere in tokens", () => {
        const test = rule.test(parser, tokenize("a >= b"));
        expect(test).toBe(true);
      });

      it("returns false if NOT matched anywhere in tokens", () => {
        const test = rule.test(parser, tokenize("a b c"));
        expect(test).toBe(false);
      });

    });
    describe("parse() method", () => {
      it("parses at the start of tokens", () => {
        const match = rule.parse(parser, tokenize(">="));
        expect(match.nextStart).toBe(2);
        expect(match.compile(match)).toBe(">=");
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
    const rule = new Rule.Keywords("this");
    describe("test() method", () => {
      it("returns true if matched at the start of tokens", () => {
        const test = rule.test(parser, tokenize("this"));
        expect(test).toBe(true);
      });

      it("returns true if matched anywhere in tokens", () => {
        const test = rule.test(parser, tokenize("start this end"));
        expect(test).toBe(true);
      });

      it("returns false if NOT matched anywhere in tokens", () => {
        const test = rule.test(parser, tokenize("start middle end"));
        expect(test).toBe(false);
      });

    });
    describe("parse() method", () => {
      it("parses at the start of tokens", () => {
        const match = rule.parse(parser, tokenize("this"));
        expect(match.nextStart).toBe(1);
        expect(match.compile(match)).toBe("this");
      });

      it("does not parse in the middle of tokens", () => {
        const match = rule.parse(parser, tokenize("that this"));
        expect(match).toBeUndefined();
      });
    });
  });

  describe("with multiple keywords", () => {
    const rule = new Rule.Keywords("this that");
    describe("test() method", () => {
      it("returns true if matched at the start of tokens", () => {
        const test = rule.test(parser, tokenize("this that"));
        expect(test).toBe(true);
      });

      it("returns true if matched anywhere in tokens", () => {
        const test = rule.test(parser, tokenize("start this that end"));
        expect(test).toBe(true);
      });

      it("returns false if NOT matched anywhere in tokens", () => {
        const test = rule.test(parser, tokenize("start middle end"));
        expect(test).toBe(false);
      });

    });
    describe("parse() method", () => {
      it("parses at the start of tokens", () => {
        const match = rule.parse(parser, tokenize("this that other"));
        expect(match.nextStart).toBe(2);
        expect(match.compile(match)).toBe("this that");
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
  const rule = new Rule.Pattern({ pattern: /^[a-z][\w\-]*$/, blacklist: ["nope"] });

  it("converts array blacklist to a map", () => {
    expect(rule.blacklist.constructor).toBe(Object);
  });

  describe("test() method", () => {
    it("returns true if matched at the start of tokens", () => {
      const test = rule.test(parser, tokenize("a-word"));
      expect(test).toBe(true);
    });

    it("returns true if matched anywhere in tokens", () => {
      const test = rule.test(parser, tokenize("Type a-word 2"));
      expect(test).toBe(true);
    });

    it("returns false if NOT matched anywhere in tokens", () => {
      const test = rule.test(parser, tokenize("Type 2 3"));
      expect(test).toBe(false);
    });
  });
  describe("parse() method", () => {
    it("parses at the start of tokens", () => {
      const match = rule.parse(parser, tokenize("a-word"));
      expect(match.nextStart).toBe(1);
      expect(match.compile(match)).toBe("a-word");
    });

    it("returns undefined if match is in blacklist", () => {
      const match = rule.parse(parser, tokenize("nope"));
      expect(match).toBeUndefined();
    });

    it("does not parse in the middle of tokens", () => {
      const match = rule.parse(parser, tokenize("Type a-word 2"));
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

  describe("for simple rules", () => {
    const rule = new Rule.Subrule({ subrule: "this" });
    describe("test() method", () => {
      it("returns true if matched at the start of tokens", () => {
        const test = rule.test(parser, tokenize("this that other"));
        expect(test).toBe(true);
      });

      it("returns true if matched anywhere in tokens", () => {
        const test = rule.test(parser, tokenize("that this other"));
        expect(test).toBe(true);
      });

      it("returns false if NOT matched anywhere in tokens", () => {
        const test = rule.test(parser, tokenize("that other else"));
        expect(test).toBe(false);
      });
    });
    describe("parse() method", () => {
      it("parses at the start of tokens", () => {
        const match = rule.parse(parser, tokenize("this that other"));
        expect(match.nextStart).toBe(1);
        expect(match.compile(match)).toBe("this");
      });

      it("does not parse in the middle of tokens", () => {
        const match = rule.parse(parser, tokenize("that this other"));
        expect(match).toBeUndefined();
      });
    });
  });

  describe("for sequence rules", () => {
    const rule = new Rule.Subrule({ subrule: "sequence" });
    describe("test() method", () => {
      it("returns true if matched at the start of tokens", () => {
        const test = rule.test(parser, tokenize("this that"));
        expect(test).toBe(true);
      });

      it("returns true if matched anywhere in tokens", () => {
        const test = rule.test(parser, tokenize("that this that"));
        expect(test).toBe(true);
      });

      it("returns false if NOT matched anywhere in tokens", () => {
        const test = rule.test(parser, tokenize("that that that"));
        expect(test).toBe(false);
      });
    });
    describe("parse() method", () => {
      it("parses at the start of tokens", () => {
        const match = rule.parse(parser, tokenize("this that"));
        expect(match.nextStart).toBe(2);
        expect(match.compile(match)).toBe("COMPILED");
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
    name: "alt",
    syntax: "(?:arg:this|that|other)",
    group: "altGroup",
    constructor: class Alt extends Rule.Alternatives {}
  });
  const rule = parser.rules.alt;

  describe("test() method", () => {
    it("returns true if matched at the start of tokens", () => {
      const test = rule.test(parser, tokenize("this that other"));
      expect(test).toBe(true);
    });

    it("returns true if matched anywhere in tokens", () => {
      const test = rule.test(parser, tokenize("start that end"));
      expect(test).toBe(true);
    });

    it("returns false if NOT matched anywhere in tokens", () => {
      const test = rule.test(parser, tokenize("start middle end"));
      expect(test).toBe(false);
    });
  });
  describe("parse() method", () => {
    it("parses any of the alternatives at the start of tokens", () => {
      let match = rule.parse(parser, tokenize("this"));
      expect(match.nextStart).toBe(1);
      expect(match.compile(match)).toBe("this");

      match = rule.parse(parser, tokenize("that"));
      expect(match.nextStart).toBe(1);
      expect(match.compile(match)).toBe("that");

      match = rule.parse(parser, tokenize("other"));
      expect(match.nextStart).toBe(1);
      expect(match.compile(match)).toBe("other");
    });

    it("does not parse in the middle of tokens", () => {
      let match = rule.parse(parser, tokenize("start this end"));
      expect(match).toBeUndefined();

      match = rule.parse(parser, tokenize("start that end"));
      expect(match).toBeUndefined();

      match = rule.parse(parser, tokenize("start other end"));
      expect(match).toBeUndefined();
    });

    it("sets 'argument' on the result", () => {
      const match = rule.parse(parser, tokenize("this"));
      expect(match.argument).toBe("arg");
    });

    it("sets 'group' on the result", () => {
      const match = rule.parse(parser, tokenize("this"));
      expect(match.group).toBe("altGroup");
    });

    it("sets 'promote' on the result", () => {
      const match = rule.parse(parser, tokenize("this"));
      expect(match.promote).toBe(true);
    });
  });
});

describe("Rule.Repeat", () => {
  const parser = new Parser();
  const rule = new Rule.Repeat({
    testRule: new Rule.Keywords("word"),
    repeat: new Rule.Keywords("word"),
    optional: true
  });

  describe("test() method", () => {
    it("returns true if matched at the start of tokens", () => {
      const test = rule.test(parser, tokenize("word"));
      expect(test).toBe(true);
    });

    it("returns true if matched anywhere in tokens", () => {
      const test = rule.test(parser, tokenize("nope word nope"));
      expect(test).toBe(true);
    });

    it("returns false if NOT matched anywhere in tokens", () => {
      const test = rule.test(parser, tokenize("nope nope nope"));
      expect(test).toBe(false);
    });
  });
  describe("parse() method", () => {
    it("sets optional on match", () => {
      const match = rule.parse(parser, tokenize("word nope nope"));
      expect(match.optional).toBe(true);
    });

    it("returns an array when compiled", () => {
      const match = rule.parse(parser, tokenize("word nope nope"));
      expect(match.compile(match)).toBeInstanceOf(Array);
    });

    it("parses once at the start of tokens", () => {
      const match = rule.parse(parser, tokenize("word nope nope"));
      expect(match.nextStart).toBe(1);
      expect(match.compile(match)).toEqual(["word"]);
    });

    it("parses multiple times at the start of tokens", () => {
      const match = rule.parse(parser, tokenize("word word nope nope"));
      expect(match.nextStart).toBe(2);
      expect(match.compile(match)).toEqual(["word", "word"]);
    });

    it("does not parse in the middle of tokens", () => {
      const match = rule.parse(parser, tokenize("nope word word"));
      expect(match).toBeUndefined();
    });
  });
});


describe("Rule.List", () => {
  const parser = new Parser();
  const rule = new Rule.List({
    testRule: new Rule.Keywords("word"),
    item: new Rule.Keywords("word"),
    delimiter: new Rule.Symbols(",")
  });

  describe("test() method", () => {
    it("returns true if matched at the start of tokens", () => {
      const test = rule.test(parser, tokenize("word"));
      expect(test).toBe(true);
    });

    it("returns true if matched anywhere in tokens", () => {
      const test = rule.test(parser, tokenize("nope word nope"));
      expect(test).toBe(true);
    });

    it("returns false if NOT matched anywhere in tokens", () => {
      const test = rule.test(parser, tokenize("nope nope nope"));
      expect(test).toBe(false);
    });
  });

  describe("parse() method", () => {
    it("returns an array when compiled", () => {
      const match = rule.parse(parser, tokenize("word nope nope"));
      expect(match.compile(match)).toBeInstanceOf(Array);
    });

    it("parses once at the start of tokens", () => {
      const match = rule.parse(parser, tokenize("word nope nope"));
      expect(match.nextStart).toBe(1);
      expect(match.compile(match)).toEqual(["word"]);
    });

    it("parses multiple times at the start of tokens WITH spaces", () => {
      const match = rule.parse(parser, tokenize("word, word nope nope"));
      expect(match.nextStart).toBe(3);
      expect(match.compile(match)).toEqual(["word", "word"]);
    });

    it("parses multiple times at the start of tokens WITHOUT spaces", () => {
      const match = rule.parse(parser, tokenize("word,word nope nope"));
      expect(match.nextStart).toBe(3);
      expect(match.compile(match)).toEqual(["word", "word"]);
    });

    it("eats but trailing delimiter", () => {
      const match = rule.parse(parser, tokenize("word, word, nope"));
      expect(match.nextStart).toBe(4);
      expect(match.compile(match)).toEqual(["word", "word"]);
    });

    it("does not parse in the middle of tokens", () => {
      const match = rule.parse(parser, tokenize("nope word,word nope"));
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
      name: "simple",
      syntax: "this {that} the {other}",
      testRule: new Rule.Keywords("this"),
      constructor: class simple extends Rule.Sequence{
        compile() {
          return "COMPILED";
        }
      }
    }
  );

  describe("for simple sequences", () => {
    const rule = parser.rules.simple;
    describe("test() method", () => {
      it("returns true if matched at the start of tokens", () => {
        const test = rule.test(parser, tokenize("this that other"));
        expect(test).toBe(true);
      });

      it("returns true if matched anywhere in tokens", () => {
        const test = rule.test(parser, tokenize("other this that"));
        expect(test).toBe(true);
      });

      it("returns false if NOT matched anywhere in tokens", () => {
        const test = rule.test(parser, tokenize("start middle end"));
        expect(test).toBe(false);
      });
    });
    describe("parse() method", () => {
      it("parses at the start of tokens", () => {
        const match = rule.parse(parser, tokenize("this that the other"));
        expect(match.nextStart).toBe(4);
        expect(match.compile(match)).toBe("COMPILED");
        const results = match.results;
        expect(results.that).toBe("that");
        expect(results._that).toBeInstanceOf(Rule.Keywords);
        expect(results.other).toBe("other");
        expect(results._other).toBeInstanceOf(Rule.Keywords);
      });

      it("does not parse in the middle of tokens", () => {
        const match = rule.parse(parser, tokenize("something this that the other"));
        expect(match).toBeUndefined();
      });
    });
  });
});



/*

describe("Rule.", () => {
  const parser = new Parser();
  const rule = new Rule.XXX({ });
  describe("test() method", () => {
    it("returns true if matched at the start of tokens", () => {
      const test = rule.test(parser, tokenize("•"));
      expect(test).toBe(true);
    });

    it("returns true if matched anywhere in tokens", () => {
      const test = rule.test(parser, tokenize("•"));
      expect(test).toBe(true);
    });

    it("returns false if NOT matched anywhere in tokens", () => {
      const test = rule.test(parser, tokenize("•"));
      expect(test).toBe(false);
    });
  });
  describe("parse() method", () => {
    it("parses at the start of tokens", () => {
      const match = rule.parse(parser, tokenize("•"));
      expect(match.nextStart).toBe(1);
      expect(match.compile(match)).toBe("•");
    });

    it("does not parse in the middle of tokens", () => {
      const match = rule.parse(parser, tokenize("•"));
      expect(match).toBeUndefined();
    });
  });
});

*/
