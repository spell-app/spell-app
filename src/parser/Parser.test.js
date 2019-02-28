//
// # Tests for `Parser` class.
// Note that lots of parser functionality is tested via other files in this package. ???
//

import {
  Parser,
  ParseError,
  Rule,
  ruleEx,
  Tokenizer
} from "./all.js";


describe("defineRule()", () => {
  test("doesn't add rule if passed a 'skip' property", () => {
    const parser = new Parser();
    parser.defineRule({ name: "foo", skip: true });
    expect(parser.rules).toEqual({});
  });

  test("doesn't add rule if passed a Rule instance without a 'name' property", () => {
    const parser = new Parser();
    parser.defineRule(new Rule.Symbols());
    expect(parser.rules).toEqual({});
  });

  test("doesn't add rule if passed empty object (where constructor === Object)", () => {
    const parser = new Parser();
    parser.defineRule({});
    expect(parser.rules).toEqual({});
  });

  test("doesn't add rule if passed constructor as undefined", () => {
    const parser = new Parser();
    parser.defineRule({ constructor: undefined });
    expect(parser.rules).toEqual({});
  });

  test("returns undefined if not passed a 'name' property", () => {
    const parser = new Parser();
    parser.defineRule({ constructor: Rule });
    expect(parser.rules).toEqual({});
  });
});

describe("Parser.import()", () => {
  test("adds new rules directly in either direction", () => {
    const foo = new Parser({ module: "foo" });
    foo.defineRule({ name: "rule1", syntax: "foo1" });

    const bar = new Parser({ module: "bar" });
    bar.defineRule({ name: "rule2", syntax: "bar2" });

    foo.import(bar);
    expect(foo.rules.rule1).toBe(foo.rules.rule1);
    expect(foo.rules.rule2).toBe(bar.rules.rule2);
  });

  test("merges individual rules into a new group", () => {
    const foo = new Parser({ module: "foo" });
    foo.defineRule({ name: "rule1", syntax: "foo1" });
    const foo1 = foo.rules.rule1;

    const bar = new Parser({ module: "bar" });
    bar.defineRule({ name: "rule1", syntax: "bar1" });
    const bar1 = bar.rules.rule1;

    foo.import(bar);
    expect(foo.rules.rule1).toBeInstanceOf(Rule.Group);
    expect(foo.rules.rule1.argument).toBe("rule1");
    expect(foo.rules.rule1.rules.length).toBe(2);
    expect(foo.rules.rule1.rules).toEqual([foo1, bar1]);
  });

  test("merges individual rules with existing groups", () => {
    const foo = new Parser({ module: "foo" });
    foo.defineRule({ name: "rule1", syntax: "foo1" });
    foo.defineRule({ name: "rule1", syntax: "foo1a" });
    const foo1OriginalGroup = foo.rules.rule1;

    const bar = new Parser({ module: "bar" });
    bar.defineRule({ name: "rule1", syntax: "bar1" });

    foo.import(bar);
    expect(foo.rules.rule1).toBeInstanceOf(Rule.Group);
    expect(foo.rules.rule1.argument).toBe("rule1");
    expect(foo.rules.rule1).not.toBe(foo1OriginalGroup);
    expect(foo.rules.rule1.rules.length).toBe(3);

    const allRules = foo1OriginalGroup.rules.concat(bar.rules.rule1);
    expect(foo.rules.rule1.rules).toEqual(allRules);
  });

});


// Set up parser used in the below
const parser = new Parser();
parser.defineRules(
  { name: "statement", constructor: Rule.Statement },
  { name: "statements", constructor: Rule.Statements },

  { name: "dog", syntax: "dog" },
  { name: "cat", syntax: "cat" },
  {
    name: "dog_and_cat",
    alias: "statement",
    syntax: "{dog} and {cat}",
    testRule: "{dog}",
    compile(match) {
      return "dog && cat";
    }
  }
);


describe("parser.parse()", () => {
  test("takes an explicit start rule", () => {
    const match = parser.parse("statements", "dog and cat");
    expect(match.rule).toBeInstanceOf(Rule.Statements);
  });

  test("defaults to 'statements' if not passed a start rule", () => {
    const match = parser.parse("dog and cat");
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
    const result = parser.compile("statements", "dog and cat");
    expect(result).toBe("dog && cat");
  });

  test("defaults to 'statements' if not passed a start rule", () => {
    const result = parser.compile("dog and cat");
    expect(result).toBe("dog && cat");
  });

  test("throws if text can't be parsed", () => {
    expect(() => parser.compile("blah")).toThrow(ParseError);
  });
});


describe("parser debug flags", () => {
  test("TIME flag doesn't affect parsing", () => {
    const timeSpy = jest.spyOn(console, "time").mockImplementation(()=>undefined);
    const timeEndSpy = jest.spyOn(console, "time").mockImplementation(()=>undefined);

    Parser.TIME = true;
    const match = parser.parse("statements", "dog and cat");
    expect(match.rule).toBeInstanceOf(Rule.Statements);
    Parser.TIME = false;

    timeSpy.mockRestore();
    timeEndSpy.mockRestore();
  });

  test("DEBUG flag doesn't affect parsing", () => {
    Parser.DEBUG = true;
    const match = parser.parse("statements", "dog and cat");
    expect(match.rule).toBeInstanceOf(Rule.Statements);
    Parser.DEBUG = false;
  });

  test("WARN flag doesn't affect parsing", () => {
    Parser.WARN = true;
    const match = parser.parse("statements", "dog and cat");
    expect(match.rule).toBeInstanceOf(Rule.Statements);
    Parser.WARN = false;
  });
});
