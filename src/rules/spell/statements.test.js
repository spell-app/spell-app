import parser from "./index.js";

test("parser is defined", () => {
	expect(parser).toBeDefined();
});

//
//	Assignment
//
test("assign number to identifier", () => {
	let match = parser.parse("assignment", "a = 1");
	expect(match).toBeInstanceOf(Rule.Sequence);
	expect(match.toSource()).toBe("a = 1");

	expect(match.results.thing).toBeInstanceOf(Rule.Pattern);
	expect(match.results.thing.toSource()).toBe("a");

	expect(match.results.value).toBeInstanceOf(Rule.Number);
	expect(match.results.value.toSource()).toBe(1);
});

test("assign string to identifier", () => {
	let match = parser.parse("assignment", "a = 'a'");
	expect(match).toBeInstanceOf(Rule.Sequence);
	expect(match.toSource()).toBe("a = 'a'");

	expect(match.results.value).toBeInstanceOf(Rule.Text);
	expect(match.results.value.toSource()).toBe("'a'");
});

test("assign boolean to identifier", () => {
	let match = parser.parse("assignment", "a = yes");
	expect(match).toBeInstanceOf(Rule.Sequence);
	expect(match.toSource()).toBe("a = true");

	expect(match.results.value).toBeInstanceOf(Rule.Boolean);
	expect(match.results.value.toSource()).toBe(true);
});

test("assign list to identifier", () => {
	let match = parser.parse("assignment", "a = [1,2,yes,'a']");
	expect(match).toBeInstanceOf(Rule.Sequence);
	expect(match.toSource()).toBe("a = [1, 2, true, 'a']");
});
