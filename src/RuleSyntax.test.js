import Rule from "./RuleSyntax.js";

//
//	Rule.String
//
test("parse single symbols", () => {
	let rules = Rule.parseRuleSyntax(">");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Symbol);
	expect(rules[0].match).toEqual([">"]);
});

test("parse multiple symbols", () => {
	let rules = Rule.parseRuleSyntax(">=");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Symbol);
	expect(rules[0].match).toEqual([">", "="]);
	expect(rules[0].toString()).toBe(">=");
});


test("parse escaped symbol", () => {
	let rules = Rule.parseRuleSyntax("\\(");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Symbol);
	expect(rules[0].match).toEqual(["("]);
	expect(rules[0].toString()).toBe("\\(");
});

//
//	Rule.Keyword
//
test("parse single keyword", () => {
	let rules = Rule.parseRuleSyntax("is");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Keyword);
	expect(rules[0].match).toEqual(["is"]);
	expect(rules[0].toString()).toBe("is");
});

test("parse multiple keywords as a keyword", () => {
	let rules = Rule.parseRuleSyntax("is not");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Keyword);
	expect(rules[0].match).toEqual(["is", "not"]);
	expect(rules[0].toString()).toBe("is not");
});


//
//	Rule.Subrule
//
test("parse subrule", () => {
	let rules = Rule.parseRuleSyntax("{subrule}");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Subrule);
	expect(rules[0].rule).toBe("subrule");
});

test("parse subrule with named argument", () => {
	let rules = Rule.parseRuleSyntax("{arg:subrule}");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Subrule);
	expect(rules[0].rule).toBe("subrule");
	expect(rules[0].argument).toBe("arg");
	expect(rules[0].toString()).toBe("{arg:subrule}");
});


//
//	Rule.List
//
test("parse list", () => {
	let rules = Rule.parseRuleSyntax("[{number},]");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.List);
	expect(rules[0].item).toBeInstanceOf(Rule.Subrule);
	expect(rules[0].delimiter).toBeInstanceOf(Rule.Symbol);
	expect(rules[0].toString()).toBe("[{number} ,]");
});

test("parse list with named argument", () => {
	let rules = Rule.parseRuleSyntax("[my-list:{number},]");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.List);
	expect(rules[0].item).toBeInstanceOf(Rule.Subrule);
	expect(rules[0].delimiter).toBeInstanceOf(Rule.Symbol);
	expect(rules[0].argument).toBe("my-list");
	expect(rules[0].toString()).toBe("[my-list:{number} ,]");
});

test("parse list with keyword delimiter", () => {
	let rules = Rule.parseRuleSyntax("[{number}and]");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.List);
	expect(rules[0].item).toBeInstanceOf(Rule.Subrule);
	expect(rules[0].delimiter).toBeInstanceOf(Rule.Keyword);
	expect(rules[0].delimiter.match).toEqual(["and"]);
	expect(rules[0].toString()).toBe("[{number} and]");
});

test("fail list with extra stuff", () => {
	expect(() => Rule.parseRuleSyntax("[{good},bad input]"))
		.toThrow(SyntaxError);
});


//
//	Rule.Alternatives
//
test("parse simple alternatives", () => {
	let rules = Rule.parseRuleSyntax("(a|bb| cccccc )");
	expect(rules.length).toBe(1);
	expect(rules[0].rules.length).toBe(3);

	expect(rules[0]).toBeInstanceOf(Rule.Alternatives);
	expect(rules[0].rules.length).toBe(3);

	expect(rules[0].rules[0]).toBeInstanceOf(Rule.Keyword);
	expect(rules[0].rules[0].match).toEqual(["a"]);

	expect(rules[0].rules[1]).toBeInstanceOf(Rule.Keyword);
	expect(rules[0].rules[1].match).toEqual(["bb"]);

	expect(rules[0].rules[2]).toBeInstanceOf(Rule.Keyword);
	expect(rules[0].rules[2].match).toEqual(["cccccc"]);

	expect(rules[0].toString()).toBe("(a|bb|cccccc)");
});

test("parse named alternatives", () => {
	let rules = Rule.parseRuleSyntax("(foo:a|b)");
	expect(rules.length).toBe(1);
	expect(rules[0].rules.length).toBe(2);

	expect(rules[0]).toBeInstanceOf(Rule.Alternatives);
	expect(rules[0].argument).toBe("foo");
	expect(rules[0].rules.length).toBe(2);

	expect(rules[0].rules[0]).toBeInstanceOf(Rule.Keyword);
	expect(rules[0].rules[0].match).toEqual(["a"]);

	expect(rules[0].rules[1]).toBeInstanceOf(Rule.Keyword);
	expect(rules[0].rules[1].match).toEqual(["b"]);

	expect(rules[0].toString()).toBe("(foo:a|b)");
});

test("parse complex alternatives", () => {
	let rules = Rule.parseRuleSyntax("( is a test | {named:subrule} | [{number},] | (a|b) )");
	expect(rules.length).toBe(1);
	expect(rules[0].rules.length).toBe(4);

	expect(rules[0]).toBeInstanceOf(Rule.Alternatives);

	expect(rules[0].rules.length).toBe(4);
	expect(rules[0].rules[0]).toBeInstanceOf(Rule.Keyword);
	expect(rules[0].rules[1]).toBeInstanceOf(Rule.Subrule);
	expect(rules[0].rules[2]).toBeInstanceOf(Rule.List);
	expect(rules[0].rules[3]).toBeInstanceOf(Rule.Alternatives);

	expect(rules[0].toString()).toBe("(is a test|{named:subrule}|[{number} ,]|(a|b))");
});


//
//	Optional
//
test("parse optional string", () => {
	let rules = Rule.parseRuleSyntax(";?");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Symbol);
	expect(rules[0].match).toEqual([";"]);
	expect(rules[0].optional).toBe(true);
	expect(rules[0].toString()).toBe(";?");
});

test("parse optional keyword", () => {
	let rules = Rule.parseRuleSyntax("yah?");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Keyword);
	expect(rules[0].optional).toBe(true);
	expect(rules[0].toString()).toBe("yah?");
});

test("parse optional subrule", () => {
	let rules = Rule.parseRuleSyntax("{number}?");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Subrule);
	expect(rules[0].optional).toBe(true);
	expect(rules[0].toString()).toBe("{number}?");
});

test("parse optional alternatives", () => {
	let rules = Rule.parseRuleSyntax("(a|b)?");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Alternatives);
	expect(rules[0].optional).toBe(true);
	expect(rules[0].toString()).toBe("(a|b)?");
});

test("parse optional list", () => {
	let rules = Rule.parseRuleSyntax("[{number},]?");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.List);
	expect(rules[0].optional).toBe(true);
	expect(rules[0].toString()).toBe("[{number} ,]?");
});


//
//	Repeats
//
test("parse * repeated subrule", () => {
	let rules = Rule.parseRuleSyntax("{number}*");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Repeat);
	expect(rules[0].optional).toBe(true);
	expect(rules[0].rule).toBeInstanceOf(Rule.Subrule);
	expect(rules[0].toString()).toBe("{number}*");
});

test("parse + repeated subrule", () => {
	let rules = Rule.parseRuleSyntax("{number}+");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Repeat);
	expect(rules[0].optional).toBeUndefined();
	expect(rules[0].rule).toBeInstanceOf(Rule.Subrule);
	expect(rules[0].toString()).toBe("{number}+");
});

test("parse + repeated sequence", () => {
	let rules = Rule.parseRuleSyntax("(one or more)+");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Repeat);
	expect(rules[0].optional).toBeUndefined();
	expect(rules[0].rule).toBeInstanceOf(Rule.Keyword);
	expect(rules[0].toString()).toBe("(one or more)+");
});

test("parse + repeated list", () => {
	let rules = Rule.parseRuleSyntax("[{number},]+");
	expect(rules.length).toBe(1);
	expect(rules[0]).toBeInstanceOf(Rule.Repeat);
	expect(rules[0].optional).toBeUndefined();
	expect(rules[0].rule).toBeInstanceOf(Rule.List);
	expect(rules[0].toString()).toBe("[{number} ,]+");
});


//
//	Error cases
//
test("thrown on improperly balanced parenthesis, etc", () => {
	expect(() => Rule.parseRuleSyntax("(abc"))
		.toThrow(SyntaxError);

	expect(() => Rule.parseRuleSyntax("[abc"))
		.toThrow(SyntaxError);

	expect(() => Rule.parseRuleSyntax("{abc"))
		.toThrow(SyntaxError);

});

test("throw on invalid end tokens", () => {
	expect(() => Rule.parseRuleSyntax("}"))
		.toThrow(SyntaxError);

	expect(() => Rule.parseRuleSyntax(")"))
		.toThrow(SyntaxError);

	expect(() => Rule.parseRuleSyntax("]"))
		.toThrow(SyntaxError);

	expect(() => Rule.parseRuleSyntax("|"))
		.toThrow(SyntaxError);
});
