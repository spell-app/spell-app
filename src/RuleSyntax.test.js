import { ParserError } from "./Parser.js";
import Rule from "./Rule.js";
import parseRule, { parseSyntax } from "./RuleSyntax.js";


describe("parseSyntax()", () => {
  //
  //  Rule.String
  //
  test("parse single symbols", () => {
    let rules = parseSyntax(">");
    expect(rules.length).toBe(1);
    expect(rules[0]).toBeInstanceOf(Rule.Symbols);
    expect(rules[0].literals).toEqual([">"]);
  });

  test("parse multiple symbols as a single Rule.Symbol", () => {
    let rules = parseSyntax(">=");
    expect(rules.length).toBe(1);
    expect(rules[0]).toBeInstanceOf(Rule.Symbols);
    expect(rules[0].literals).toEqual([">", "="]);
    expect(rules[0].toSyntax()).toBe(">=");
  });

  test("single optional symbol works", () => {
    let rules = parseSyntax(">?");
    expect(rules.length).toBe(1);
    expect(rules[0]).toBeInstanceOf(Rule.Symbols);
    expect(rules[0].literals).toEqual([">"]);
    expect(rules[0].optional).toBe(true);
    expect(rules[0].toSyntax()).toBe(">?");
  });

  test("initial optional symbol works", () => {
    let rules = parseSyntax(">?=");
    expect(rules.length).toBe(2);
    expect(rules[0]).toBeInstanceOf(Rule.Symbols);
    expect(rules[0].literals).toEqual([">"]);
    expect(rules[0].optional).toBe(true);

    expect(rules[1]).toBeInstanceOf(Rule.Symbols);
    expect(rules[1].literals).toEqual(["="]);
    expect(rules[1].optional).toBe(undefined);
  });

  test("end optional symbol works", () => {
    let rules = parseSyntax(">=?");
    expect(rules.length).toBe(2);
    expect(rules[0]).toBeInstanceOf(Rule.Symbols);
    expect(rules[0].literals).toEqual([">"]);
    expect(rules[0].optional).toBe(undefined);

    expect(rules[1]).toBeInstanceOf(Rule.Symbols);
    expect(rules[1].literals).toEqual(["="]);
    expect(rules[1].optional).toBe(true);
  });

  test("parse single escaped symbol", () => {
    let rules = parseSyntax("\\(");
    expect(rules.length).toBe(1);
    expect(rules[0]).toBeInstanceOf(Rule.Symbols);
    expect(rules[0].literals).toEqual(["("]);
    expect(rules[0].toSyntax()).toBe("\\(");
  });

  test("parse multiple escaped symbols", () => {
    let rules = parseSyntax("\\(\\?");
    expect(rules.length).toBe(1);
    expect(rules[0]).toBeInstanceOf(Rule.Symbols);
    expect(rules[0].literals).toEqual(["(", "?"]);
    expect(rules[0].toSyntax()).toBe("\\(\\?");
  });

  //
  //  Rule.Keywords
  //
  test("parse single keyword", () => {
    let rules = parseSyntax("is");
    expect(rules.length).toBe(1);
    expect(rules[0]).toBeInstanceOf(Rule.Keywords);
    expect(rules[0].literals).toEqual(["is"]);
    expect(rules[0].toSyntax()).toBe("is");
  });

  test("parse multiple keywords as a single Rule.Keyword", () => {
    let rules = parseSyntax("is not");
    expect(rules.length).toBe(1);
    expect(rules[0]).toBeInstanceOf(Rule.Keywords);
    expect(rules[0].literals).toEqual(["is", "not"]);
    expect(rules[0].toSyntax()).toBe("is not");
  });

  test("single optional keyword works", () => {
    let rules = parseSyntax("a?");
    expect(rules.length).toBe(1);
    expect(rules[0]).toBeInstanceOf(Rule.Keywords);
    expect(rules[0].literals).toEqual(["a"]);
    expect(rules[0].optional).toBe(true);
    expect(rules[0].toSyntax()).toBe("a?");
  });

  test("initial optional keyword works", () => {
    let rules = parseSyntax("a? b c");
    expect(rules.length).toBe(2);
    expect(rules[0]).toBeInstanceOf(Rule.Keywords);
    expect(rules[0].literals).toEqual(["a"]);
    expect(rules[0].optional).toBe(true);

    expect(rules[1]).toBeInstanceOf(Rule.Keywords);
    expect(rules[1].literals).toEqual(["b", "c"]);
    expect(rules[1].optional).toBe(undefined);
  });

  test("middle optional keyword works", () => {
    let rules = parseSyntax("a b? c");
    expect(rules.length).toBe(3);
    expect(rules[0]).toBeInstanceOf(Rule.Keywords);
    expect(rules[0].literals).toEqual(["a"]);
    expect(rules[0].optional).toBe(undefined);

    expect(rules[1]).toBeInstanceOf(Rule.Keywords);
    expect(rules[1].literals).toEqual(["b"]);
    expect(rules[1].optional).toBe(true);

    expect(rules[2]).toBeInstanceOf(Rule.Keywords);
    expect(rules[2].literals).toEqual(["c"]);
    expect(rules[2].optional).toBe(undefined);
  });

  test("end optional keyword works", () => {
    let rules = parseSyntax("a b c?");
    expect(rules.length).toBe(2);
    expect(rules[0]).toBeInstanceOf(Rule.Keywords);
    expect(rules[0].literals).toEqual(["a", "b"]);
    expect(rules[0].optional).toBe(undefined);

    expect(rules[1]).toBeInstanceOf(Rule.Keywords);
    expect(rules[1].literals).toEqual(["c"]);
    expect(rules[1].optional).toBe(true);
  });


  //
  //  Rule.Subrule
  //
  test("parse subrule", () => {
    let rules = parseSyntax("{subrule}");
    expect(rules.length).toBe(1);
    expect(rules[0]).toBeInstanceOf(Rule.Subrule);
    expect(rules[0].subrule).toBe("subrule");
  });

  test("parse subrule with named argument", () => {
    let rules = parseSyntax("{arg:subrule}");
    expect(rules.length).toBe(1);
    expect(rules[0]).toBeInstanceOf(Rule.Subrule);
    expect(rules[0].subrule).toBe("subrule");
    expect(rules[0].argument).toBe("arg");
    expect(rules[0].toSyntax()).toBe("{arg:subrule}");
  });

  //
  //  Rule.List
  //
  test("parse list", () => {
    let rules = parseSyntax("[{number},]");
    expect(rules.length).toBe(1);
    expect(rules[0]).toBeInstanceOf(Rule.List);
    expect(rules[0].item).toBeInstanceOf(Rule.Subrule);
    expect(rules[0].delimiter).toBeInstanceOf(Rule.Symbols);
    expect(rules[0].toSyntax()).toBe("[{number} ,]");
  });

  test("parse list with named argument", () => {
    let rules = parseSyntax("[my-list:{number},]");
    expect(rules.length).toBe(1);
    expect(rules[0]).toBeInstanceOf(Rule.List);
    expect(rules[0].item).toBeInstanceOf(Rule.Subrule);
    expect(rules[0].delimiter).toBeInstanceOf(Rule.Symbols);
    expect(rules[0].argument).toBe("my-list");
    expect(rules[0].toSyntax()).toBe("[my-list:{number} ,]");
  });

  test("parse list with keyword delimiter", () => {
    let rules = parseSyntax("[{number}and]");
    expect(rules.length).toBe(1);
    expect(rules[0]).toBeInstanceOf(Rule.List);
    expect(rules[0].item).toBeInstanceOf(Rule.Subrule);
    expect(rules[0].delimiter).toBeInstanceOf(Rule.Keywords);
    expect(rules[0].delimiter.literals).toEqual(["and"]);
    expect(rules[0].toSyntax()).toBe("[{number} and]");
  });

  test("fail list with extra stuff", () => {
    expect(() => parseSyntax("[{good},bad input]")).toThrow(ParserError);
  });

  //
  //  Rule.Alternatives
  //
  test("parse simple alternatives", () => {
    let rules = parseSyntax("(a|bb| cccccc )");
    expect(rules.length).toBe(1);
    expect(rules[0].rules.length).toBe(3);

    expect(rules[0]).toBeInstanceOf(Rule.Alternatives);
    expect(rules[0].rules.length).toBe(3);

    expect(rules[0].rules[0]).toBeInstanceOf(Rule.Keywords);
    expect(rules[0].rules[0].literals).toEqual(["a"]);

    expect(rules[0].rules[1]).toBeInstanceOf(Rule.Keywords);
    expect(rules[0].rules[1].literals).toEqual(["bb"]);

    expect(rules[0].rules[2]).toBeInstanceOf(Rule.Keywords);
    expect(rules[0].rules[2].literals).toEqual(["cccccc"]);

    expect(rules[0].toSyntax()).toBe("(a|bb|cccccc)");
  });

  test("parse named alternatives", () => {
    let rules = parseSyntax("(foo:a|b)");
    expect(rules.length).toBe(1);
    expect(rules[0].rules.length).toBe(2);

    expect(rules[0]).toBeInstanceOf(Rule.Alternatives);
    expect(rules[0].argument).toBe("foo");
    expect(rules[0].rules.length).toBe(2);

    expect(rules[0].rules[0]).toBeInstanceOf(Rule.Keywords);
    expect(rules[0].rules[0].literals).toEqual(["a"]);

    expect(rules[0].rules[1]).toBeInstanceOf(Rule.Keywords);
    expect(rules[0].rules[1].literals).toEqual(["b"]);

    expect(rules[0].toSyntax()).toBe("(foo:a|b)");
  });

  test("parse complex alternatives", () => {
    let rules = parseSyntax("( is a test | {named:subrule} | [{number},] | (a|b) )");
    expect(rules.length).toBe(1);
    expect(rules[0].rules.length).toBe(4);

    expect(rules[0]).toBeInstanceOf(Rule.Alternatives);

    expect(rules[0].rules.length).toBe(4);
    expect(rules[0].rules[0]).toBeInstanceOf(Rule.Keywords);
    expect(rules[0].rules[1]).toBeInstanceOf(Rule.Subrule);
    expect(rules[0].rules[2]).toBeInstanceOf(Rule.List);
    expect(rules[0].rules[3]).toBeInstanceOf(Rule.Alternatives);

    expect(rules[0].toSyntax()).toBe("(is a test|{named:subrule}|[{number} ,]|(a|b))");
  });

  test("sets promote flag", () => {
    let rules = parseSyntax("(?:a|b)");
    expect(rules.length).toBe(1);
    expect(rules[0]).toBeInstanceOf(Rule.Alternatives);
    expect(rules[0].promote).toBe(true);
    expect(rules[0].toSyntax()).toBe("(?:a|b)");
  });

  test("sets argument", () => {
    let rules = parseSyntax("(arg:a|b)");
    expect(rules.length).toBe(1);
    expect(rules[0]).toBeInstanceOf(Rule.Alternatives);
    expect(rules[0].argument).toBe("arg");
    expect(rules[0].toSyntax()).toBe("(arg:a|b)");
  });

  test("sets argument AND promote", () => {
    let rules = parseSyntax("(?:arg:a|b)");
    expect(rules.length).toBe(1);
    expect(rules[0]).toBeInstanceOf(Rule.Alternatives);
    expect(rules[0].promote).toBe(true);
    expect(rules[0].argument).toBe("arg");
    expect(rules[0].toSyntax()).toBe("(?:arg:a|b)");
  });

  //
  //  Optional
  //
  test("parse optional string", () => {
    let rules = parseSyntax(";?");
    expect(rules.length).toBe(1);
    expect(rules[0]).toBeInstanceOf(Rule.Symbols);
    expect(rules[0].literals).toEqual([";"]);
    expect(rules[0].optional).toBe(true);
    expect(rules[0].toSyntax()).toBe(";?");
  });

  test("parse optional keyword", () => {
    let rules = parseSyntax("yah?");
    expect(rules.length).toBe(1);
    expect(rules[0]).toBeInstanceOf(Rule.Keywords);
    expect(rules[0].optional).toBe(true);
    expect(rules[0].toSyntax()).toBe("yah?");
  });

  test("parse optional subrule", () => {
    let rules = parseSyntax("{number}?");
    expect(rules.length).toBe(1);
    expect(rules[0]).toBeInstanceOf(Rule.Subrule);
    expect(rules[0].optional).toBe(true);
    expect(rules[0].toSyntax()).toBe("{number}?");
  });

  test("parse optional alternatives", () => {
    let rules = parseSyntax("(a|b)?");
    expect(rules.length).toBe(1);
    expect(rules[0]).toBeInstanceOf(Rule.Alternatives);
    expect(rules[0].optional).toBe(true);
    expect(rules[0].toSyntax()).toBe("(a|b)?");
  });

  test("parse optional list", () => {
    let rules = parseSyntax("[{number},]?");
    expect(rules.length).toBe(1);
    expect(rules[0]).toBeInstanceOf(Rule.List);
    expect(rules[0].optional).toBe(true);
    expect(rules[0].toSyntax()).toBe("[{number} ,]?");
  });

  //
  //  Repeats
  //
  test("parse * repeated subrule", () => {
    let rules = parseSyntax("{number}*");
    expect(rules.length).toBe(1);
    expect(rules[0]).toBeInstanceOf(Rule.Repeat);
    expect(rules[0].optional).toBe(true);
    expect(rules[0].repeat).toBeInstanceOf(Rule.Subrule);
    expect(rules[0].toSyntax()).toBe("{number}*");
  });

  test("parse + repeated subrule", () => {
    let rules = parseSyntax("{number}+");
    expect(rules.length).toBe(1);
    expect(rules[0]).toBeInstanceOf(Rule.Repeat);
    expect(rules[0].optional).toBeUndefined();
    expect(rules[0].repeat).toBeInstanceOf(Rule.Subrule);
    expect(rules[0].toSyntax()).toBe("{number}+");
  });

  test("parse + repeated sequence", () => {
    let rules = parseSyntax("(one or more)+");
    expect(rules.length).toBe(1);
    expect(rules[0]).toBeInstanceOf(Rule.Repeat);
    expect(rules[0].optional).toBeUndefined();
    expect(rules[0].repeat).toBeInstanceOf(Rule.Keywords);
    expect(rules[0].toSyntax()).toBe("(one or more)+");
  });

  test("parse + repeated list", () => {
    let rules = parseSyntax("[{number},]+");
    expect(rules.length).toBe(1);
    expect(rules[0]).toBeInstanceOf(Rule.Repeat);
    expect(rules[0].optional).toBeUndefined();
    expect(rules[0].repeat).toBeInstanceOf(Rule.List);
    expect(rules[0].toSyntax()).toBe("[{number} ,]+");
  });

  //
  //  Error cases
  //
  test("thrown on improperly balanced parenthesis, etc", () => {
    expect(() => parseSyntax("(abc")).toThrow(ParserError);

    expect(() => parseSyntax("[abc")).toThrow(ParserError);

    expect(() => parseSyntax("{abc")).toThrow(ParserError);
  });

  test("throw on invalid end tokens", () => {
    expect(() => parseSyntax("}")).toThrow(ParserError);

    expect(() => parseSyntax(")")).toThrow(ParserError);

    expect(() => parseSyntax("]")).toThrow(ParserError);

    expect(() => parseSyntax("|")).toThrow(ParserError);
  });
});

describe("parseRule()", () => {
  describe("without a constructor", () => {
    test("works for simple keywords", () => {
      const rules = parseRule("a b c");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Keywords);
      expect(rules[0].literals).toEqual(["a", "b", "c"]);
    });

    test("works with optional keywords", () => {
      const rules = parseRule("a b c?");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Sequence);

      expect(rules[0].rules[0]).toBeInstanceOf(Rule.Keywords);
      expect(rules[0].rules[0].literals).toEqual(["a", "b"]);
      expect(rules[0].rules[0].optional).toBe(undefined);

      expect(rules[0].rules[1]).toBeInstanceOf(Rule.Keywords);
      expect(rules[0].rules[1].literals).toEqual(["c"]);
      expect(rules[0].rules[1].optional).toBe(true);
    });

    test("works for simple symbols", () => {
      const rules = parseRule(">=");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Symbols);
      expect(rules[0].literals).toEqual([">", "="]);
    });

    test("works with optional symbols", () => {
      const rules = parseRule(">=?");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Sequence);

      expect(rules[0].rules[1]).toBeInstanceOf(Rule.Symbols);
      expect(rules[0].rules[0].literals).toEqual([">"]);
      expect(rules[0].rules[0].optional).toBe(undefined);

      expect(rules[0].rules[1]).toBeInstanceOf(Rule.Symbols);
      expect(rules[0].rules[1].literals).toEqual(["="]);
      expect(rules[0].rules[1].optional).toBe(true);
    });

    test("works for alternatives", () => {
      const rules = parseRule("(a|>|{c})");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Alternatives);
      expect(rules[0].rules[0]).toBeInstanceOf(Rule.Keywords);
      expect(rules[0].rules[1]).toBeInstanceOf(Rule.Symbols);
      expect(rules[0].rules[2]).toBeInstanceOf(Rule.Subrule);
    });

    test("works for lists", () => {
      const rules = parseRule("[{foo}:]");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.List);
      expect(rules[0].item).toBeInstanceOf(Rule.Subrule);
      expect(rules[0].delimiter).toBeInstanceOf(Rule.Symbols);
    });

    test("works for seqeuences", () => {
      const rules = parseRule("a {foo}");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Sequence);
      expect(rules[0].rules.length).toBe(2);
      expect(rules[0].rules[0]).toBeInstanceOf(Rule.Keywords);
      expect(rules[0].rules[1]).toBeInstanceOf(Rule.Subrule);
    });
  });

  describe("without a constructor", () => {
    test("works for simple keywords", () => {
      const rules = parseRule("a b c");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Keywords);
      expect(rules[0].literals).toEqual(["a", "b", "c"]);
    });

    test("works with optional keywords", () => {
      const rules = parseRule("a b c?");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Sequence);

      expect(rules[0].rules[0]).toBeInstanceOf(Rule.Keywords);
      expect(rules[0].rules[0].literals).toEqual(["a", "b"]);
      expect(rules[0].rules[0].optional).toBe(undefined);

      expect(rules[0].rules[1]).toBeInstanceOf(Rule.Keywords);
      expect(rules[0].rules[1].literals).toEqual(["c"]);
      expect(rules[0].rules[1].optional).toBe(true);
    });

    test("works for simple symbols", () => {
      const rules = parseRule(">=");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Symbols);
      expect(rules[0].literals).toEqual([">", "="]);
    });

    test("works with optional symbols", () => {
      const rules = parseRule(">=?");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Sequence);

      expect(rules[0].rules[1]).toBeInstanceOf(Rule.Symbols);
      expect(rules[0].rules[0].literals).toEqual([">"]);
      expect(rules[0].rules[0].optional).toBe(undefined);

      expect(rules[0].rules[1]).toBeInstanceOf(Rule.Symbols);
      expect(rules[0].rules[1].literals).toEqual(["="]);
      expect(rules[0].rules[1].optional).toBe(true);
    });

    test("works for alternatives", () => {
      const rules = parseRule("(a|>|{c})");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Alternatives);
      expect(rules[0].rules[0]).toBeInstanceOf(Rule.Keywords);
      expect(rules[0].rules[1]).toBeInstanceOf(Rule.Symbols);
      expect(rules[0].rules[2]).toBeInstanceOf(Rule.Subrule);
    });

    test("works for lists", () => {
      const rules = parseRule("[{foo}:]");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.List);
      expect(rules[0].item).toBeInstanceOf(Rule.Subrule);
      expect(rules[0].delimiter).toBeInstanceOf(Rule.Symbols);
    });

    test("works for seqeuences", () => {
      const rules = parseRule("a {foo}");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Sequence);
      expect(rules[0].rules.length).toBe(2);
      expect(rules[0].rules[0]).toBeInstanceOf(Rule.Keywords);
      expect(rules[0].rules[1]).toBeInstanceOf(Rule.Subrule);
    });
  });

  describe("with a constructor", () => {
    test("works for keywords", () => {
      class wordz extends Rule.Keywords {}
      const rules = parseRule("a b c", wordz);
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(wordz);
    });

    test("works for symbols", () => {
      class symbolz extends Rule.Keywords {}
      const rules = parseRule(">=", symbolz);
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(symbolz);
    });

    test("works for alternatives", () => {
      class altz extends Rule.Alternatives {}
      const rules = parseRule("(a|>|{c})", altz);
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(altz);
    });

    test("works for lists", () => {
      class lizt extends Rule.List {}
      const rules = parseRule("[{foo}:]", lizt);
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(lizt);
    });

    test("works for seqeuences", () => {
      class zequence extends Rule.Sequence {}
      const rules = parseRule("a {foo}", zequence);
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(zequence);
    });
  });

});
