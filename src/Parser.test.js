//
// # Tests for `Parser` class.
// Note that lots of parser functionality is tested via other files in this package. ???
//

import Parser from "./Parser.js";
import ParseError from "./ParseError.js";
import Rule from "./Rule.js";
import Tokenizer from "./Tokenizer.js";

import * as __parseRule__ from "./parseRule.js"; // for mocking only

const { tokenize } = Tokenizer;

// Set up parser used in the below
const parser = new Parser();
parser.defineRules(
  { name: "statement", constructor: Rule.Statement },
  { name: "statements", constructor: Rule.Statements },

  { name: "this", syntax: "this", constructor: Rule.Keywords },
  { name: "that", syntax: "that", constructor: Rule.Keywords },
  {
    name: "this_and_that",
    alias: "statement",
    syntax: "{this} and {that}",
    testRule: "{this}",
    constructor: class this_and_that extends Rule.Sequence {
      compile(match) {
        return "this && that";
      }
    }
  }
);


describe("parser.parse()", () => {
  test("takes an explicit start rule", () => {
    const match = parser.parse("statements", "this and that");
    expect(match.rule).toBeInstanceOf(Rule.Statements);
  });

  test("defaults to 'statements' if not passed a start rule", () => {
    const match = parser.parse("this and that");
    expect(match.rule).toBeInstanceOf(Rule.Statements);
  });

  test("returns undefined if no text passes", () => {
    const match = parser.parse("statements", "");
    expect(match).toBe(undefined);
  });

  test("throws if named rule is not found", () => {
    expect(() => parser.parse("missing_rule", "text")).toThrow(ParseError);
  });
});


describe("parser.compile()", () => {
  test("takes an explicit start rule", () => {
    const result = parser.compile("statements", "this and that");
    expect(result).toBe("this && that");
  });

  test("defaults to 'statements' if not passed a start rule", () => {
    const result = parser.compile("this and that");
    expect(result).toBe("this && that");
  });

  test("throws if text can't be parsed", () => {
    expect(() => parser.compile("blah")).toThrow(ParseError);
  });
});



describe("parser.test()", () => {
  test("returns 0 when found at beginning of test", () => {
    const result = parser.test("this_and_that", tokenize("this"))
    expect(result).toBe(true);
  });

  test("returns false when test fails", () => {
    const result = parser.test("this_and_that", tokenize("and"))
    expect(result).toBe(false);
  });

  test("returns undefined when test can't tell", () => {
    const result = parser.test("statements", tokenize("and"))
    expect(result).toBe(undefined);
  });

  test("throws if named rule is not found", () => {
    expect(() => parser.test("missing_rule", tokenize("text"))).toThrow(ParseError);
  });
});


describe("defineRule()", () => {
  test("skips if not passed a 'skip' property", () => {
    const rules = parser.defineRule({ skip: true });
    expect(rules).toBe(undefined);
  });

  test("throws if passed a Rule instance without a 'name' property", () => {
    expect(() => parser.defineRule(new Rule.Symbols())).toThrow(ParseError);
  });

  test("throws if not passed a 'constructor' property", () => {
    expect(() => parser.defineRule({ constructor: undefined })).toThrow(ParseError);
  });

  test("throws if not passed a 'name' property", () => {
    expect(() => parser.defineRule({ constructor: undefined })).toThrow(ParseError);
  });

  test("throws if parseRule() doesn't return anything", () => {
    const spy = jest.spyOn(__parseRule__, "default").mockImplementation(() => undefined);
    expect(() => parser.defineRule({ constructor: Rule, name: "test", syntax:"a" }))
      .toThrow(ParseError);
    spy.mockRestore();
  });

  test("throws if parseRule() returns an empty array", () => {
    const spy = jest.spyOn(__parseRule__, "default").mockImplementation(() => []);
    expect(() => parser.defineRule({ constructor: Rule, name: "test", syntax:"a" }))
      .toThrow(ParseError);
    spy.mockRestore();
  });

});

describe("parser debug flags", () => {
  test("TIME flag doesn't affect parsing", () => {
    const timeSpy = jest.spyOn(console, "time").mockImplementation(()=>undefined);
    const timeEndSpy = jest.spyOn(console, "time").mockImplementation(()=>undefined);

    Parser.TIME = true;
    const match = parser.parse("statements", "this and that");
    expect(match.rule).toBeInstanceOf(Rule.Statements);
    Parser.TIME = false;

    timeSpy.mockRestore();
    timeEndSpy.mockRestore();
  });

  test("DEBUG flag doesn't affect parsing", () => {
    Parser.DEBUG = true;
    const match = parser.parse("statements", "this and that");
    expect(match.rule).toBeInstanceOf(Rule.Statements);
    Parser.DEBUG = false;
  });

  test("WARN flag doesn't affect parsing", () => {
    Parser.WARN = true;
    const match = parser.parse("statements", "this and that");
    expect(match.rule).toBeInstanceOf(Rule.Statements);
    Parser.WARN = false;
  });
});

describe("Parser.forModule()", () => {
  test("returns a new parser when called for the first time", () => {
    const parser = Parser.forModule("foo");
    expect(parser).toBeInstanceOf(Parser);
    expect(parser.module).toBe("foo");
  });

  test("returns the same parser when called more than once", () => {
    const parser1 = Parser.forModule("foo");
    const parser2 = Parser.forModule("foo");
    expect(parser1).toBe(parser2);
  });
});


describe("Parser.import()", () => {
  test("adds named modules to `imports`", () => {
    const parser = new Parser();
    parser.import("foo", "bar");
    expect(parser.imports).toEqual(["foo", "bar"]);
  });

  test("merges rules as expected", () => {
    const foo = Parser.forModule("foo");
    const [ foo1, foo2, foo4 ] = foo.defineRules(
      { name: "rule1", syntax: "rule1" },
      { name: "rule2", syntax: "rule2" },
      { name: "rule4", constructor: Rule.Group },
    );

    const bar = Parser.forModule("bar");
    const [ bar1, bar3, bar4, bar4a ] = bar.defineRules(
      { name: "rule1", syntax: "rule1a" },
      { name: "rule3", syntax: "rule3" },
      { name: "rule4", constructor: Rule.Group },
      { name: "rule4", syntax: "rule4" }
    );

    foo.import("bar");
    const rules = foo.rules;

    expect(rules.rule1).toBeInstanceOf(Rule.Group);
    expect(rules.rule1.argument).toBe("rule1");
    expect(rules.rule1.rules[0]).toBe(foo1);
    expect(rules.rule1.rules[1]).toBe(bar1);

    expect(rules.rule2).toBe(foo2);

    expect(rules.rule3).toBe(bar3);

    expect(rules.rule4).toBe(foo4);
    expect(rules.rule4.rules.length).toBe(1);
    expect(rules.rule4.rules[0]).toBe(bar4a);
  });
});
