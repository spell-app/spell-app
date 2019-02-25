import {
  ParseError,
  Rule,
  parseRule,
  parseSyntax
} from "./all.js";


describe("parseSyntax()", () => {
  //
  // # Errors
  //
  describe("throws when", () => {
    test("input is malformed", () => {
      expect(() => parseSyntax("[{good},bad input]")).toThrow(ParseError);
    });

    test("non-closed parenthesis/etc", () => {
      expect(() => parseSyntax("(abc")).toThrow(ParseError);
      expect(() => parseSyntax("[abc")).toThrow(ParseError);
      expect(() => parseSyntax("{abc")).toThrow(ParseError);
    });

    test("parenthesis/etc end tokens not eaten by other rules ", () => {
      expect(() => parseSyntax("}")).toThrow(ParseError);
      expect(() => parseSyntax(")")).toThrow(ParseError);
      expect(() => parseSyntax("]")).toThrow(ParseError);
      expect(() => parseSyntax("|")).toThrow(ParseError);
    });
  });

  //
  // # Rule.Symbols
  //
  describe("Rule.Symbols", () => {
    test("parse single symbols", () => {
      const rules = parseSyntax(">");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Symbol);
      expect(rules[0].literal).toEqual(">");
    });

    test("parse multiple symbols as a single Rule.Symbol", () => {
      const rules = parseSyntax(">=");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Symbols);
      expect(rules[0].literals).toEqual([">", "="]);
      expect(rules[0].toSyntax()).toBe(">=");
    });

    test("single optional symbol works", () => {
      const rules = parseSyntax(">?");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Symbol);
      expect(rules[0].literal).toEqual(">");
      expect(rules[0].toSyntax()).toBe(">?");
    });

    test("initial optional symbol works", () => {
      const rules = parseSyntax(">?=");
      expect(rules.length).toBe(2);
      expect(rules[0]).toBeInstanceOf(Rule.Symbol);
      expect(rules[0].literal).toEqual(">");
      expect(rules[0].optional).toBe(true);

      expect(rules[1]).toBeInstanceOf(Rule.Symbol);
      expect(rules[1].literal).toEqual("=");
      expect(rules[1].optional).toBe(undefined);
    });

    test("end optional symbol works", () => {
      const rules = parseSyntax(">=?");
      expect(rules.length).toBe(2);
      expect(rules[0]).toBeInstanceOf(Rule.Symbol);
      expect(rules[0].literal).toEqual(">");
      expect(rules[0].optional).toBe(undefined);

      expect(rules[1]).toBeInstanceOf(Rule.Symbol);
      expect(rules[1].literal).toEqual("=");
      expect(rules[1].optional).toBe(true);
    });

    test("parse single escaped symbol", () => {
      const rules = parseSyntax("\\(");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Symbol);
      expect(rules[0].literal).toEqual("(");
      expect(rules[0].toSyntax()).toBe("\\(");
    });

    test("parse multiple escaped symbols", () => {
      const rules = parseSyntax("\\(\\?");
      expect(rules.length).toBe(2);
      expect(rules[0]).toBeInstanceOf(Rule.Symbol);
      expect(rules[0].literal).toBe("(");
      expect(rules[0].toSyntax()).toBe("\\(");
      expect(rules[1]).toBeInstanceOf(Rule.Symbol);
      expect(rules[1].literal).toBe("?");
      expect(rules[1].toSyntax()).toBe("\\?");
    });
  });

  //
  // # Rule.Keywords
  //
  describe("Rule.Keywords", () => {
    test("parse single keyword", () => {
      const rules = parseSyntax("is");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Keyword);
      expect(rules[0].literal).toEqual("is");
      expect(rules[0].toSyntax()).toBe("is");
    });

    test("parse multiple keywords as a single Rule.Keyword", () => {
      const rules = parseSyntax("is not");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Keywords);
      expect(rules[0].literals).toEqual(["is", "not"]);
      expect(rules[0].toSyntax()).toBe("is not");
    });

    test("single optional keyword works", () => {
      const rules = parseSyntax("a?");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Keyword);
      expect(rules[0].literal).toEqual("a");
      expect(rules[0].optional).toBe(true);
      expect(rules[0].toSyntax()).toBe("a?");
    });

    test("initial optional keyword works", () => {
      const rules = parseSyntax("a? b c");
      expect(rules.length).toBe(2);
      expect(rules[0]).toBeInstanceOf(Rule.Keyword);
      expect(rules[0].literal).toEqual("a");
      expect(rules[0].optional).toBe(true);

      expect(rules[1]).toBeInstanceOf(Rule.Keywords);
      expect(rules[1].literals).toEqual(["b", "c"]);
      expect(rules[1].optional).toBe(undefined);
    });

    test("middle optional keyword works", () => {
      const rules = parseSyntax("a b? c");
      expect(rules.length).toBe(3);
      expect(rules[0]).toBeInstanceOf(Rule.Keyword);
      expect(rules[0].literal).toEqual("a");
      expect(rules[0].optional).toBe(undefined);

      expect(rules[1]).toBeInstanceOf(Rule.Keyword);
      expect(rules[1].literal).toEqual("b");
      expect(rules[1].optional).toBe(true);

      expect(rules[2]).toBeInstanceOf(Rule.Keyword);
      expect(rules[2].literal).toEqual("c");
      expect(rules[2].optional).toBe(undefined);
    });

    test("end optional keyword works", () => {
      const rules = parseSyntax("a b c?");
      expect(rules.length).toBe(2);
      expect(rules[0]).toBeInstanceOf(Rule.Keywords);
      expect(rules[0].literals).toEqual(["a", "b"]);
      expect(rules[0].optional).toBe(undefined);

      expect(rules[1]).toBeInstanceOf(Rule.Keyword);
      expect(rules[1].literal).toEqual("c");
      expect(rules[1].optional).toBe(true);
    });
  });


  describe("Rule.Subrule", () => {
    test("parse subrule", () => {
      const rules = parseSyntax("{subrule}");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Subrule);
      expect(rules[0].subrule).toBe("subrule");
    });

    test("sets promote flag", () => {
      const rules = parseSyntax("{?:rulename}");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Subrule);
      expect(rules[0].promote).toBe(true);
    });

    test("sets named argument", () => {
      const rules = parseSyntax("{arg:subrule}");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Subrule);
      expect(rules[0].subrule).toBe("subrule");
      expect(rules[0].argument).toBe("arg");
      expect(rules[0].toSyntax()).toBe("{arg:subrule}");
    });

    test("sets promote flag AND named argument", () => {
      const rules = parseSyntax("{?:arg:rulename}");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Subrule);
      expect(rules[0].promote).toBe(true);
      expect(rules[0].argument).toBe("arg");
    });
  });

  //
  // # Rule.List
  //
  describe("Rule.List", () => {
    test("parse list", () => {
      const rules = parseSyntax("[{number},]");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.List);
      expect(rules[0].item).toBeInstanceOf(Rule.Subrule);
      expect(rules[0].delimiter).toBeInstanceOf(Rule.Symbol);
      expect(rules[0].toSyntax()).toBe("[{number},]");
    });

    test("parse list with named argument", () => {
      const rules = parseSyntax("[my-list:{number},]");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.List);
      expect(rules[0].item).toBeInstanceOf(Rule.Subrule);
      expect(rules[0].delimiter).toBeInstanceOf(Rule.Symbol);
      expect(rules[0].argument).toBe("my-list");
      expect(rules[0].toSyntax()).toBe("[my-list:{number},]");
    });

    test("parse list with keyword delimiter", () => {
      const rules = parseSyntax("[{number}and]");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.List);
      expect(rules[0].item).toBeInstanceOf(Rule.Subrule);
      expect(rules[0].delimiter).toBeInstanceOf(Rule.Keyword);
      expect(rules[0].delimiter.literal).toEqual("and");
      expect(rules[0].toSyntax()).toBe("[{number}and]");
    });

    test("parse list with choice delimiter", () => {
      const rules = parseSyntax("[{number}(,|or)]");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.List);
      expect(rules[0].item).toBeInstanceOf(Rule.Subrule);
      expect(rules[0].delimiter).toBeInstanceOf(Rule.Choice);
      expect(rules[0].delimiter.rules.length).toBe(2);
      expect(rules[0].delimiter.rules[0]).toBeInstanceOf(Rule.Symbol);
      expect(rules[0].delimiter.rules[0].literal).toBe(",");
      expect(rules[0].delimiter.rules[1]).toBeInstanceOf(Rule.Keyword);
      expect(rules[0].delimiter.rules[1].literal).toBe("or");
      expect(rules[0].toSyntax()).toBe("[{number}(,|or)]");
    });
  });

  //
  // # Rule.Choice
  //
  describe("Rule.Choice", () => {
    describe("as single set of keywords", () => {
      test("parse simple Choice to Literal", () => {
        const rules = parseSyntax("(a|bb| cccccc )");
        const rule = rules[0];
        expect(rules.length).toBe(1);
        expect(rule).toBeInstanceOf(Rule.Keyword);
        expect(rule.literal).toEqual(["a", "bb", "cccccc"]);
        expect(rule.toSyntax()).toBe("(a|bb|cccccc)");
      });

      test("sets promote flag", () => {
        const rules = parseSyntax("(?:a|b)");
        const rule = rules[0];
        expect(rules.length).toBe(1);
        expect(rule).toBeInstanceOf(Rule.Keyword);
        expect(rule.promote).toBe(true);
        expect(rule.toSyntax()).toBe("(?:a|b)");
      });

      test("sets argument", () => {
        const rules = parseSyntax("(arg:a|b)");
        const rule = rules[0];
        expect(rules.length).toBe(1);
        expect(rule).toBeInstanceOf(Rule.Keyword);
        expect(rule.argument).toBe("arg");
        expect(rule.toSyntax()).toBe("(arg:a|b)");
      });

      test("sets argument AND promote", () => {
        const rules = parseSyntax("(?:arg:a|b)");
        const rule = rules[0];
        expect(rules.length).toBe(1);
        expect(rule).toBeInstanceOf(Rule.Keyword);
        expect(rule.promote).toBe(true);
        expect(rule.argument).toBe("arg");
        expect(rule.toSyntax()).toBe("(?:arg:a|b)");
      });
    });

    describe("as complex set of rules", () => {
      const rules = parseSyntax("( is a test | {named:subrule} | [{number},] | (a|b) )");
      const rule = rules[0];

      test("return a single rule", () => {
        expect(rules.length).toBe(1);
        expect(rule).toBeInstanceOf(Rule.Choice);

        expect(rules[0].rules.length).toBe(4);
        expect(rules[0].rules[0]).toBeInstanceOf(Rule.Keywords);
        expect(rules[0].rules[1]).toBeInstanceOf(Rule.Subrule);
        expect(rules[0].rules[2]).toBeInstanceOf(Rule.List);
        expect(rules[0].rules[3]).toBeInstanceOf(Rule.Keyword);

        expect(rules[0].toSyntax()).toBe("(is a test|{named:subrule}|[{number},]|(a|b))");
      });

      test("sets promote flag", () => {
        const rules = parseSyntax("(?:a|b)");
        expect(rules.length).toBe(1);
        expect(rules[0]).toBeInstanceOf(Rule.Keyword);
        expect(rules[0].promote).toBe(true);
        expect(rules[0].toSyntax()).toBe("(?:a|b)");
      });

      test("sets argument", () => {
        const rules = parseSyntax("(arg:a|b)");
        expect(rules.length).toBe(1);
        expect(rules[0]).toBeInstanceOf(Rule.Keyword);
        expect(rules[0].argument).toBe("arg");
        expect(rules[0].toSyntax()).toBe("(arg:a|b)");
      });

      test("sets argument AND promote", () => {
        const rules = parseSyntax("(?:arg:a|b)");
        expect(rules.length).toBe(1);
        expect(rules[0]).toBeInstanceOf(Rule.Keyword);
        expect(rules[0].promote).toBe(true);
        expect(rules[0].argument).toBe("arg");
        expect(rules[0].toSyntax()).toBe("(?:arg:a|b)");
      });
    });
  });


  //
  // # optional flag
  //
  describe("optional flag", () => {
    test("parse optional string", () => {
      const rules = parseSyntax(";?");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Symbol);
      expect(rules[0].literal).toEqual(";");
      expect(rules[0].optional).toBe(true);
      expect(rules[0].toSyntax()).toBe(";?");
    });

    test("parse optional keyword", () => {
      const rules = parseSyntax("yah?");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Keyword);
      expect(rules[0].optional).toBe(true);
      expect(rules[0].toSyntax()).toBe("yah?");
    });

    test("parse optional subrule", () => {
      const rules = parseSyntax("{number}?");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Subrule);
      expect(rules[0].optional).toBe(true);
      expect(rules[0].toSyntax()).toBe("{number}?");
    });

    test("parse optional simple choices", () => {
      const rules = parseSyntax("(a|b)?");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Keyword);
      expect(rules[0].optional).toBe(true);
      expect(rules[0].toSyntax()).toBe("(a|b)?");
    });

    test("parse optional complex choices", () => {
      const rules = parseSyntax("({a}|b)?");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Choice);
      expect(rules[0].optional).toBe(true);
      expect(rules[0].toSyntax()).toBe("({a}|b)?");
    });

    test("parse optional list", () => {
      const rules = parseSyntax("[{number},]?");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.List);
      expect(rules[0].optional).toBe(true);
      expect(rules[0].toSyntax()).toBe("[{number},]?");
    });
  });

  //
  // # Repeat flags
  //
  describe("Rule.List", () => {
    test("parse * repeated subrule", () => {
      const rules = parseSyntax("{number}*");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Repeat);
      expect(rules[0].optional).toBe(true);
      expect(rules[0].repeat).toBeInstanceOf(Rule.Subrule);
      expect(rules[0].toSyntax()).toBe("{number}*");
    });

    test("parse + repeated subrule", () => {
      const rules = parseSyntax("{number}+");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Repeat);
      expect(rules[0].optional).toBeUndefined();
      expect(rules[0].repeat).toBeInstanceOf(Rule.Subrule);
      expect(rules[0].toSyntax()).toBe("{number}+");
    });

    test("parse + repeated sequence", () => {
      const rules = parseSyntax("(one or more)+");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Repeat);
      expect(rules[0].optional).toBeUndefined();
      expect(rules[0].repeat).toBeInstanceOf(Rule.Keywords);
      expect(rules[0].toSyntax()).toBe("(one or more)+");
    });

    test("parse + repeated list", () => {
      const rules = parseSyntax("[{number},]+");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Repeat);
      expect(rules[0].optional).toBeUndefined();
      expect(rules[0].repeat).toBeInstanceOf(Rule.List);
      expect(rules[0].toSyntax()).toBe("[{number},]+");
    });
  });
});

describe("parseRule()", () => {
  //
  // # Errors
  //
  describe("throws when", () => {
    test("no rule is produced", () => {
      expect(() => parseRule("")).toThrow(ParseError);
    });
  });

  //
  // # Parsing WITHOUT an explicit constructor
  //
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

      expect(rules[0].rules[1]).toBeInstanceOf(Rule.Keyword);
      expect(rules[0].rules[1].literal).toEqual("c");
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

      expect(rules[0].rules[1]).toBeInstanceOf(Rule.Symbol);
      expect(rules[0].rules[0].literal).toEqual(">");
      expect(rules[0].rules[0].optional).toBe(undefined);

      expect(rules[0].rules[1]).toBeInstanceOf(Rule.Symbol);
      expect(rules[0].rules[1].literal).toEqual("=");
      expect(rules[0].rules[1].optional).toBe(true);
    });

    test("works for choices", () => {
      const rules = parseRule("(a|>|{c})");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Choice);
      expect(rules[0].rules[0]).toBeInstanceOf(Rule.Keyword);
      expect(rules[0].rules[1]).toBeInstanceOf(Rule.Symbol);
      expect(rules[0].rules[2]).toBeInstanceOf(Rule.Subrule);
    });

    test("works for lists", () => {
      const rules = parseRule("[{foo}:]");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.List);
      expect(rules[0].item).toBeInstanceOf(Rule.Subrule);
      expect(rules[0].delimiter).toBeInstanceOf(Rule.Symbol);
    });

    test("works for seqeuences", () => {
      const rules = parseRule("a {foo}");
      expect(rules.length).toBe(1);
      expect(rules[0]).toBeInstanceOf(Rule.Sequence);
      expect(rules[0].rules.length).toBe(2);
      expect(rules[0].rules[0]).toBeInstanceOf(Rule.Keyword);
      expect(rules[0].rules[1]).toBeInstanceOf(Rule.Subrule);
    });
  });

  //
  // # Parsing WITH an explicit constructor
  //
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

    test("works for choices", () => {
      class altz extends Rule.Choice {}
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
