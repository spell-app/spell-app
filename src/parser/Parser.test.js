//
// # Tests for `Parser` class.
// Note that lots of parser functionality is tested via other files in this package. ???
//

import {
  Parser,
  ParseError,
  Rule,
  Tokenizer
} from "./all.js";

// Import this specially so we can spy on it.
import * as _parseRule_ from "./parseRule.js";

// Set up parser used in the below
const parser = new Parser();
parser.defineRules(
  { name: "statement", constructor: Rule.Statement },
  { name: "statements", constructor: Rule.Statements },

  { name: "this", syntax: "this" },
  { name: "that", syntax: "that" },
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


describe("defineRule()", () => {
  test("skips if not passed a 'skip' property", () => {
    const rule = parser.defineRule({ skip: true });
    expect(rule).toBe(undefined);
  });

  test("returns undefined if passed a Rule instance without a 'name' property", () => {
    expect(parser.defineRule(new Rule.Symbols())).toBe(undefined);
  });

  test("returns undefined if not passed a 'constructor' property", () => {
    expect(parser.defineRule({ constructor: undefined })).toBe(undefined);
  });

  test("returns undefined if not passed a 'name' property", () => {
    expect(parser.defineRule({ constructor: undefined })).toBe(undefined);
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


describe("Parser.import()", () => {
  test("merges rules as expected", () => {
    const foo = new Parser({ module: "foo" });
    const [ foo1, foo2, foo4 ] = foo.defineRules(
      { name: "rule1", syntax: "rule1" },
      { name: "rule2", syntax: "rule2" },
      { name: "rule4", constructor: Rule.Group },
    );

    const bar = new Parser({ module: "bar" });
    const [ bar1, bar3, bar4, bar4a ] = bar.defineRules(
      { name: "rule1", syntax: "rule1a" },
      { name: "rule3", syntax: "rule3" },
      { name: "rule4", constructor: Rule.Group },
      { name: "rule4", syntax: "rule4" }
    );

    foo.import(bar);
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
