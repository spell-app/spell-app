import Rule from "./Rule.js";
import { parseSyntax } from "./RuleSyntax.js";

//
//	Rule.String
//
test("parse single symbols", () => {
	let rules = parseSyntax(">");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Symbols);
	expect(rules[0].literals).toEqual([">"]);
});

test("parse multiple symbols", () => {
	let rules = parseSyntax(">=");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Symbols);
	expect(rules[0].literals).toEqual([">", "="]);
	expect(rules[0].toString()).toBe(">=");
});


test("parse escaped symbol", () => {
	let rules = parseSyntax("\\(");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Symbols);
	expect(rules[0].literals).toEqual(["("]);
	expect(rules[0].toString()).toBe("\\(");
});

//
//	Rule.Keywords
//
test("parse single keyword", () => {
	let rules = parseSyntax("is");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Keywords);
	expect(rules[0].literals).toEqual(["is"]);
	expect(rules[0].toString()).toBe("is");
});

test("parse multiple keywords as a keyword", () => {
	let rules = parseSyntax("is not");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Keywords);
	expect(rules[0].literals).toEqual(["is", "not"]);
	expect(rules[0].toString()).toBe("is not");
});


//
//	Rule.Subrule
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
	expect(rules[0].toString()).toBe("{arg:subrule}");
});


//
//	Rule.List
//
test("parse list", () => {
	let rules = parseSyntax("[{number},]");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.List);
	expect(rules[0].item).toBeInstanceOf(Rule.Subrule);
	expect(rules[0].delimiter).toBeInstanceOf(Rule.Symbols);
	expect(rules[0].toString()).toBe("[{number} ,]");
});

test("parse list with named argument", () => {
	let rules = parseSyntax("[my-list:{number},]");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.List);
	expect(rules[0].item).toBeInstanceOf(Rule.Subrule);
	expect(rules[0].delimiter).toBeInstanceOf(Rule.Symbols);
	expect(rules[0].argument).toBe("my-list");
	expect(rules[0].toString()).toBe("[my-list:{number} ,]");
});

test("parse list with keyword delimiter", () => {
	let rules = parseSyntax("[{number}and]");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.List);
	expect(rules[0].item).toBeInstanceOf(Rule.Subrule);
	expect(rules[0].delimiter).toBeInstanceOf(Rule.Keywords);
	expect(rules[0].delimiter.literals).toEqual(["and"]);
	expect(rules[0].toString()).toBe("[{number} and]");
});

test("fail list with extra stuff", () => {
	expect(() => parseSyntax("[{good},bad input]"))
		.toThrow(SyntaxError);
});


//
//	Rule.Alternatives
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

	expect(rules[0].toString()).toBe("(a|bb|cccccc)");
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

	expect(rules[0].toString()).toBe("(foo:a|b)");
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

	expect(rules[0].toString()).toBe("(is a test|{named:subrule}|[{number} ,]|(a|b))");
});


//
//	Optional
//
test("parse optional string", () => {
	let rules = parseSyntax(";?");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Symbols);
	expect(rules[0].literals).toEqual([";"]);
	expect(rules[0].optional).toBe(true);
	expect(rules[0].toString()).toBe(";?");
});

test("parse optional keyword", () => {
	let rules = parseSyntax("yah?");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Keywords);
	expect(rules[0].optional).toBe(true);
	expect(rules[0].toString()).toBe("yah?");
});

test("parse optional subrule", () => {
	let rules = parseSyntax("{number}?");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Subrule);
	expect(rules[0].optional).toBe(true);
	expect(rules[0].toString()).toBe("{number}?");
});

test("parse optional alternatives", () => {
	let rules = parseSyntax("(a|b)?");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Alternatives);
	expect(rules[0].optional).toBe(true);
	expect(rules[0].toString()).toBe("(a|b)?");
});

test("parse optional list", () => {
	let rules = parseSyntax("[{number},]?");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.List);
	expect(rules[0].optional).toBe(true);
	expect(rules[0].toString()).toBe("[{number} ,]?");
});


//
//	Repeats
//
test("parse * repeated subrule", () => {
	let rules = parseSyntax("{number}*");
console.warn(rules);
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Repeat);
	expect(rules[0].optional).toBe(true);
	expect(rules[0].repeat).toBeInstanceOf(Rule.Subrule);
	expect(rules[0].toString()).toBe("{number}*");
});

test("parse + repeated subrule", () => {
	let rules = parseSyntax("{number}+");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Repeat);
	expect(rules[0].optional).toBeUndefined();
	expect(rules[0].repeat).toBeInstanceOf(Rule.Subrule);
	expect(rules[0].toString()).toBe("{number}+");
});

test("parse + repeated sequence", () => {
	let rules = parseSyntax("(one or more)+");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Repeat);
	expect(rules[0].optional).toBeUndefined();
	expect(rules[0].repeat).toBeInstanceOf(Rule.Keywords);
	expect(rules[0].toString()).toBe("(one or more)+");
});

test("parse + repeated list", () => {
	let rules = parseSyntax("[{number},]+");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Repeat);
	expect(rules[0].optional).toBeUndefined();
	expect(rules[0].repeat).toBeInstanceOf(Rule.List);
	expect(rules[0].toString()).toBe("[{number} ,]+");
});


//
//	Error cases
//
test("thrown on improperly balanced parenthesis, etc", () => {
	expect(() => parseSyntax("(abc"))
		.toThrow(SyntaxError);

	expect(() => parseSyntax("[abc"))
		.toThrow(SyntaxError);

	expect(() => parseSyntax("{abc"))
		.toThrow(SyntaxError);

});

test("throw on invalid end tokens", () => {
	expect(() => parseSyntax("}"))
		.toThrow(SyntaxError);

	expect(() => parseSyntax(")"))
		.toThrow(SyntaxError);

	expect(() => parseSyntax("]"))
		.toThrow(SyntaxError);

	expect(() => parseSyntax("|"))
		.toThrow(SyntaxError);
});
