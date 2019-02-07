import parser from "./index.js";

test("parser is defined", () => {
	expect(parser).toBeDefined();
});

// ## object literal property parsing
test("object literal properties with zero properties = undefined", () => {
	let match = parser.parse("object_literal_properties", "");
	expect(match).toBe(undefined);
});

test("object literal properties with one property", () => {
	let match = parser.parse("object_literal_properties", "a = 1");
	expect(match.toSource()).toBe('{ "a": 1 }');
});

test("object literal properties with complex properties", () => {
	let match = parser.parse("object_literal_properties", "a = 1, b = true, c = the foo of the bar");
	expect(match.toSource()).toBe('{ "a": 1, "b": true, "c": bar.foo }');
});


// ## New object literal
test("new object with zero properties", () => {
	let match = parser.parse("statement", "new object");
	expect(match.toSource()).toBe('{}');
});

test("new object with one property", () => {
	let match = parser.parse("statement", "new object with a = 1");
	expect(match.toSource()).toBe('{ "a": 1 }');
});

test("new object with complex properties", () => {
	let match = parser.parse("statement", "new object with a = 1, b = true, c = the foo of the bar");
	expect(match.toSource()).toBe('{ "a": 1, "b": true, "c": bar.foo }');
});


// ## New thing
test("new thing w/no properties", () => {
	let match = parser.parse("statement", "new Foo");
	expect(match.toSource()).toBe('new Foo()');
});

test("create thing w/properties", () => {
	let match = parser.parse("statement", "create Foo with a = 1, b = 2");
	expect(match.toSource()).toBe('new Foo({ "a": 1, "b": 2 })');
});



// ## Args clause
test("args clause with 0 arguments is undefined", () => {
	let match = parser.parse("args", "with");
	expect(match).toBe(undefined);
});

test("args clause with 1 argument", () => {
	let match = parser.parse("args", "with a");
	expect(match.toSource()).toEqual(["a"]);
});

test("args clause with 3 arguments", () => {
	let match = parser.parse("args", "with a, b, c");
	expect(match.toSource()).toEqual(["a", "b", "c"]);
});


// ## Define type
test("define type", () => {
	let match = parser.parse("statement", "define type Foo");
	expect(match.toSource()).toBe('class Foo {}');
});

test("define type w/super", () => {
	let match = parser.parse("statement", "define type Foo as a Bar");
	expect(match.toSource()).toBe('class Foo extends Bar {}');
});



// ## Declare method
test("declare method w/no args & no statement", () => {
	let match = parser.parse("statement", "to doit");
	expect(match.toSource()).toBe('doit() {}');
});

test("declare method w/args & no statement", () => {
	let match = parser.parse("statement", "on doit with a, b");
	expect(match.toSource()).toBe('doit(a, b) {}');
});

test("declare method w/no args & statement", () => {
	let match = parser.parse("statement", "to doit: a = 1");
	expect(match.toSource()).toBe('doit() { a = 1 }');
});

test("declare method w/args & statement", () => {
	let match = parser.parse("statement", "to doit with a, b: a = 1");
	expect(match.toSource()).toBe('doit(a, b) { a = 1 }');
});


// ## Getter
test("getter w/no expression", () => {
	let match = parser.parse("statement", "get foo:");
	expect(match.toSource()).toBe('get foo() {}');
});

test("getter w/expression", () => {
	let match = parser.parse("statement", "get foo: avar is 1");
	expect(match.toSource()).toBe('get foo() { return ((avar == 1)) }');
});


// ## Setter
test("setter w/no arg & no statement", () => {
	let match = parser.parse("statement", "set foo");
	expect(match.toSource()).toBe('set foo(foo) {}');
});

test("setter w/single arg & no statement", () => {
	let match = parser.parse("statement", "set foo with bar");
	expect(match.toSource()).toBe('set foo(bar) {}');
});

test("setter w/no arg & statement", () => {
	let match = parser.parse("statement", "set foo: my bar = foo");
	expect(match.toSource()).toBe('set foo(foo) { this.bar = foo }');
});

test("setter w/multiple just takes the first one", () => {
//TODO: why doesn't this work?
//	global.console = { warn: jest.fn() }
	let match = parser.parse("statement", "set foo with bar and baz");
//	expect(console.warn).toBeCalled()
	expect(match.toSource()).toBe('set foo(bar) {}');
});

test("setter w/single arg & statement", () => {
	let match = parser.parse("statement", "set foo with bar: my baz = bar");
	expect(match.toSource()).toBe('set foo(bar) { this.baz = bar }');
});


// ## declare property
test("declare property w/no value", () => {
	let match = parser.parse("statement", "property foo");
	expect(match.toSource()).toBe('foo');
});

test("declare shared property w/no value", () => {
	let match = parser.parse("statement", "shared property foo");
	expect(match.toSource()).toBe('@proto foo');
});

test("declare constant property w/no value", () => {
//TODO: why doesn't this work?
//	global.console = { warn: jest.fn() }
	let match = parser.parse("statement", "constant foo");
//	expect(console.warn).toBeCalled()
	expect(match.toSource()).toBe('const foo');
});

test("declare property w/value", () => {
	let match = parser.parse("statement", "property foo = bar");
	expect(match.toSource()).toBe('foo = bar');
});

test("declare shared property w/value", () => {
	let match = parser.parse("statement", "shared property foo = my bar");
	expect(match.toSource()).toBe('@proto foo = this.bar');
});

test("declare constant property w/value", () => {
	let match = parser.parse("statement", "constant foo = [1, 2, 3]");
	expect(match.toSource()).toBe('const foo = [1, 2, 3]');
});


// ## declare property as type
test("declare property as type", () => {
	let match = parser.parse("statement", "property foo as a Bar");
	expect(match.toSource()).toBe(
		"get foo() { return this.__foo }\n" +
		"set foo(value) { if (spell.isA(value, Bar) this.__foo = value }"
	);
});

// ## declare property as one of
test("declare property as one of", () => {
	let match = parser.parse("statement", 'property foo as one of ["this", "that"]');
	expect(match.toSource()).toBe(
		'@proto foos = ["this", "that"]\n' +
		'get foo() { return this.__foo === undefined ? this.foos[0] : this.__foo }\n' +
		'set foo(value) { if (this.foos.includes(value)) this.__foo = value }'
	);
});


// ## Self-reference
test("me expression", () => {
	let match = parser.parse("expression", "the foo of me");
	expect(match.toSource()).toBe('this.foo');
});

test.only("I expression", () => {
	let match = parser.parse("expression", "I is empty");
	expect(match.toSource()).toBe('spell.isEmpty(this)');
});


// ## Property access
test("single property expression", () => {
	let match = parser.parse("expression", "the foo of bar");
	expect(match.toSource()).toBe('bar.foo');
});

test("multiple property expression", () => {
	let match = parser.parse("expression", "the foo of the bar of the baz");
	expect(match.toSource()).toBe('baz.bar.foo');
});


// ## personal property access
test("my property expression", () => {
	let match = parser.parse("expression", "my foo");
	expect(match.toSource()).toBe('this.foo');
});

test("this property expression", () => {
	let match = parser.parse("expression", "this foo");
	expect(match.toSource()).toBe('this.foo');
});

