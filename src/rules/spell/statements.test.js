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

  let results = match.results;
	expect(results._thing).toBeInstanceOf(Rule.Pattern);
	expect(results.thing).toBe("a");

	expect(results._value).toBeInstanceOf(Rule.Number);
	expect(results.value).toBe(1);
});

test("assign string to identifier", () => {
	let match = parser.parse("assignment", "a = 'a'");
	expect(match).toBeInstanceOf(Rule.Sequence);
	expect(match.toSource()).toBe("a = 'a'");

  let results = match.results;
	expect(results._value).toBeInstanceOf(Rule.Text);
	expect(results.value).toBe("'a'");
});

test("assign boolean to identifier", () => {
	let match = parser.parse("assignment", "a = yes");
	expect(match).toBeInstanceOf(Rule.Sequence);
	expect(match.toSource()).toBe("a = true");

  let results = match.results;
	expect(results._value).toBeInstanceOf(Rule.Boolean);
	expect(results.value).toBe(true);
});

test("assign list to identifier", () => {
	let match = parser.parse("assignment", "a = [1,2,yes,'a']");
	expect(match).toBeInstanceOf(Rule.Sequence);
	expect(match.toSource()).toBe("a = [1, 2, true, 'a']");
});
