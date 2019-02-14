//
// # Tests for `Parser` class.
// Note that lots of parser functionality is tested via other files in this package. ???
//

import Parser from "./Parser.js";
import ParseError from "./ParseError.js";
import Rule from "./Rule.js";

import * as __parseRule__ from "./RuleSyntax.js"; // for mocking only

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
});



describe("parser.test()", () => {
  test("throws if named rule is not found", () => {
    expect(() => parser.test("missing_rule", ["text"])).toThrow(ParseError);
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
    Parser.TIME = true;
    const match = parser.parse("statements", "this and that");
    expect(match.rule).toBeInstanceOf(Rule.Statements);
    Parser.TIME = false;
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
