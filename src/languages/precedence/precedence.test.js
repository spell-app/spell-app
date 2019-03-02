//
// # Tests for understanding recursion and precedence.
//

import {
  Parser,
  Rule,
  Tokenizer,
  Token
} from "../../parser/all.js";

// Streamlined precedence rules tests parser.
import prec from "./precedence.js";

describe("basic rules check out individually", () => {
  test("sets `incomplete` if entire thing not matched", () => {
    const result = prec.parse("a a a");
    expect(result.incomplete).toEqual({ parsed: "a", missed: "a a" });
    expect(result.compile()).toBe("a");
  });

  test("number", () => {
    expect(prec.compile("1")).toBe(1);
    expect(prec.compile("111.111")).toBe(111.111);
  });

  test("identifier", () => {
    expect(prec.compile("foo", "identifier")).toBe("foo");
  });

  test("identifier blacklist", () => {
    expect(()=>prec.compile("is", "identifier")).toThrow();
  });

  test("identifier_expression", () => {
    expect(prec.compile("the foo")).toBe("foo");
  });

  test("identifier_expression with blacklist", () => {
    expect(()=>prec.compile("the is")).toThrow();
  });

  test("simple property_expression", () => {
    expect(prec.compile("the a of b")).toBe("b.a");
  });

  test("compound property_expression", () => {
    expect(prec.compile("the a of the b of c")).toBe("c.b.a");
    expect(prec.compile("the a of the b of the c")).toBe("c.b.a");
  });

  test("and", () => {
    expect(prec.parse("a and b").results).toEqual({ lhs: "a", rhs: { expression: "b" }});
    expect(prec.compile("a and b")).toBe("(a && b)");
  });

  test("or", () => {
    expect(prec.parse("a or b").results).toEqual({ lhs: "a", rhs: { operator: "or", expression: "b" }});
    expect(prec.compile("a or b")).toBe("(a || b)");
  });

  test("is", () => {
    expect(prec.parse("a is b").results).toEqual({ lhs: "a", rhs: { operator: "is", expression: "b" }});
    expect(prec.compile("a is b")).toBe("(a == b)");
  });

  test("is not", () => {
    expect(prec.parse("a is not b").results).toEqual({ lhs: "a", rhs: { operator: "is not", expression: "b" }});
    expect(prec.compile("a is not b")).toBe("(a != b)");
  });

  test("is empty", () => {
    expect(prec.parse("a is empty").results).toEqual({ lhs: "a", rhs: "is empty" });
    expect(prec.compile("a is empty")).toBe("spell.isEmpty(a)");
  });

  test("is not empty", () => {
    expect(prec.parse("a is not empty").results).toEqual({ lhs: "a", rhs: "is not empty" });
    expect(prec.compile("a is not empty")).toBe("!spell.isEmpty(a)");
  });

  test("is defined", () => {
    expect(prec.parse("a is defined").results).toEqual({ lhs: "a", rhs: "is defined" });
    expect(prec.compile("a is defined")).toBe("(typeof a !== 'undefined')");
  });

  test("is not defined", () => {
    expect(prec.parse("a is not defined").results).toEqual({ lhs: "a", rhs: "is not defined" });
    expect(prec.compile("a is not defined")).toBe("(typeof a === 'undefined')");
  });

  test("is undefined", () => {
    expect(prec.parse("a is undefined").results).toEqual({ lhs: "a", rhs: "is undefined" });
    expect(prec.compile("a is undefined")).toBe("(typeof a === 'undefined')");
  });
});

describe("parens", () => {
  test("()", () => {
    expect(() => prec.compile("()")).toThrow();
  });

  test("(a)", () => {
    expect(prec.compile("(a)")).toBe("(a)");
  });

  test("(a and b)", () => {
    expect(prec.compile("(a and b)")).toBe("(a && b)");
  });

  test("(a and b) or c", () => {
    expect(prec.compile("(a and b) or c")).toBe("((a && b) || c)");
  });

  test("(a and b) or (c and d)", () => {
    expect(prec.compile("(a and b) or (c or d)")).toBe("((a && b) || (c || d))");
  });

  test("(the foo of the bar of the baz)", () => {
    expect(prec.compile("(the foo of the bar of the baz)")).toBe("(baz.bar.foo)");
  });

  test("(the foo of the bar) is 1", () => {     // TODO: `(bar.foo)` parens are not necessary
    expect(prec.compile("(the foo of the bar) is 1")).toBe("((bar.foo) == 1)");
  });
});


describe("and / or combinations without parens", () => {
  test("1 and 2 or 3", () => {
    // this is how JS does it
    expect(prec.compile("1 and 2 or 3")).toBe("((1 && 2) || 3)");
  });
  test("1 and 2 or 3 and 4", () => {
    // this is how JS does it
    expect(prec.compile("1 and 2 or 3 and 4")).toBe("((1 && 2) || (3 && 4))");
  });

});
