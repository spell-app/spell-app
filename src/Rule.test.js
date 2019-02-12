import Parser, { ParserError } from "./Parser.js";
import Rule from "./Rule.js";
import Tokenizer from "./Tokenizer.js";


// FIXME:  currently we have to eat whitespace in tokens for the below to work... ???
function tokenize(text) {
  return Tokenizer.tokenizeWithoutWhitespace(text);
}

describe("Rule.Symbols", () => {
  const parser = new Parser();
  describe("with a single symbol", () => {
    const rule = new Rule.Symbols({ literals: ">" });
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
        expect(match).toBeDefined();
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
    const rule = new Rule.Symbols({ literals: [ ">", "=" ] });
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
        expect(match).toBeDefined();
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
  const parser = new Parser();
  describe("with a single keyword", () => {
    const rule = new Rule.Keywords({ literals: "this" });
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
        expect(match).toBeDefined();
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
    const rule = new Rule.Keywords({ literals: [ "this", "that" ] });
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
        expect(match).toBeDefined();
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
  const rule = new Rule.Pattern({ pattern: /^[a-z][\w\-]*$/ });
  describe("test() method", () => {
    it("returns true if matched at the start of tokens", () => {
      const test = rule.test(parser, tokenize("word"));
      expect(test).toBe(true);
    });

    it("returns true if matched anywhere in tokens", () => {
      const test = rule.test(parser, tokenize("Type word 2"));
      expect(test).toBe(true);
    });

    it("returns false if NOT matched anywhere in tokens", () => {
      const test = rule.test(parser, tokenize("Type 2 3"));
      expect(test).toBe(false);
    });
  });
  describe("parse() method", () => {
    it("parses at the start of tokens", () => {
      const match = rule.parse(parser, tokenize("word"));
      expect(match).toBeDefined();
      expect(match.nextStart).toBe(1);
      expect(match.compile()).toBe("word");
    });

    it("does not parse in the middle of tokens", () => {
      const match = rule.parse(parser, tokenize("Type word 2"));
      expect(match).toBeUndefined();
    });
  });

  // TESTME: blacklist
});



/*

describe("Rule.", () => {
  const parser = new Parser();
  const pattern = new Rule.XXX({ });
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
      expect(match).toBeDefined();
      expect(match.nextStart).toBe(1);
      expect(match.compile()).toBe("•");
    });

    it("does not parse in the middle of tokens", () => {
      const match = rule.parse(parser, tokenize("•"));
      expect(match).toBeUndefined();
    });
  });
});

*/
