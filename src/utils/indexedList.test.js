import snakeCase from "lodash/snakeCase";
import { indexedList } from "./indexedList.js";


class Method {
  constructor(props) {
    if (typeof props === "string") props = { name: props };
    Object.assign(this, props);
  }
}

class Thing {
  constructor(props) {
    Object.assign(this, props);
  }

  @indexedList({ keyProp: "name" })
  variables;

  @indexedList({ keyProp: "name", normalizeKey: snakeCase, constructor: Method, unique: true })
  methods;
}

describe("basic test: just keyProp", () => {
  const foo = { name: "foo" };
  const bar2 = { name: "bar" };
  const bar = { name: "bar" };
  const baz = { name: "baz" };
  const bonk = { name: "bonk" };
  const bang = { name: "bang" };
  const zoom = { name: "zoom" };

  const thing = new Thing();

  describe("initial setup", () => {
    test("'variables' becomes defined automatically", () => {
      expect(thing.variables).toBeInstanceOf(Function);
    });

    test("'variables.#storage' is not initially defined", () => {
      expect(thing.variables["#storage"]).toBe(undefined);
    });

    test("'variables'is non-enumerable", () => {
      expect(Object.keys(thing)).toEqual([]);
    });

    test("'variables.add' and '.remove' are defined automatically", () => {
      expect(thing.variables.add).toBeInstanceOf(Function);
      expect(thing.variables.remove).toBeInstanceOf(Function);
    });

    test("'variables()' returns an empty array before anything added", () => {
      expect(thing.variables()).toEqual([]);
    });
  });

  describe("adding", () => {
    test("add()ing a single item with name works", () => {
      const result = thing.variables.add(foo);
      expect(result).toBe(foo);
      expect(thing.variables("foo")).toBe(foo);
      expect(thing.variables()).toEqual([foo]);
    });

    test("add()ing multiple items with name works", () => {
      const result = thing.variables.add(bar, baz);
      expect(result).toEqual([bar, baz]);
      expect(thing.variables()).toEqual([foo, bar, baz]);
      expect(thing.variables("bar")).toBe(bar);
      expect(thing.variables("baz")).toBe(baz);
    });

    test("adding single item with equals works", () => {
      thing.variables = bonk;
      expect(thing.variables()).toEqual([foo, bar, baz, bonk]);
      expect(thing.variables("bonk")).toBe(bonk);
    });

    test("adding multiple items with equals works", () => {
      thing.variables = [ bang, zoom ];
      expect(thing.variables()).toEqual([foo, bar, baz, bonk, bang, zoom]);
      expect(thing.variables("bang")).toBe(bang);
      expect(thing.variables("zoom")).toBe(zoom);
    });

    test("same item can be add()ed again", () => {
      thing.variables.add(foo);
      expect(thing.variables()).toEqual([foo, bar, baz, bonk, bang, zoom, foo]);
      expect(thing.variables("foo")).toBe(foo);
    });

    test("item with same name can be add()ed again, replaces original in map", () => {
      thing.variables.add(bar2);
      expect(thing.variables()).toEqual([foo, bar, baz, bonk, bang, zoom, foo, bar2]);
      expect(thing.variables("bar")).toBe(bar2);
    });
  });

  describe("removing", () => {
    test("removing item present once works", () => {
      const result = thing.variables.remove("baz");
      expect(result).toEqual([baz]);
      expect(thing.variables()).toEqual([foo, bar, bonk, bang, zoom, foo, bar2]);
      expect(thing.variables("baz")).toBe(undefined);
    });

    test("removing same item present more than once works", () => {
      const result = thing.variables.remove("foo");
      expect(result).toEqual([foo, foo]);
      expect(thing.variables()).toEqual([bar, bonk, bang, zoom, bar2]);
      expect(thing.variables("foo")).toBe(undefined);
    });

    test("removing different items present under same key works", () => {
      const result = thing.variables.remove("bar");
      expect(result).toEqual([bar, bar2]);
      expect(thing.variables()).toEqual([bonk, bang, zoom]);
      expect(thing.variables("bar")).toBe(undefined);
    });

    test("removing items with reverse filter works", () => {
      const result = thing.variables.remove(item => item.name.startsWith("z"));
      expect(result).toEqual([zoom]);
      expect(thing.variables()).toEqual([bonk, bang]);
      expect(thing.variables("zoom")).toBe(undefined);
    });

    test("removing '*' works ", () => {
      const result = thing.variables.remove("*");
      expect(result).toEqual([bonk, bang]);
      expect(thing.variables()).toEqual([]);
      expect(thing.variables["#storage"].map).toEqual({});
    });
  });

  describe("misc", () => {
    test("second item gets its own list", () => {
      const that = new Thing();
      that.variables.add(foo);
      expect(that.variables()).toEqual([foo]);
      expect(thing.variables()).toEqual([]);
    });

    test("initializing with single object works", () => {
      const that = new Thing({ variables: foo });
      expect(that.variables()).toEqual([foo]);
      expect(that.variables("foo")).toBe(foo);
    });

    test("initializing with array of objects works", () => {
      const that = new Thing({ variables: [foo, bar] });
      expect(that.variables()).toEqual([foo, bar]);
      expect(that.variables("foo")).toBe(foo);
      expect(that.variables("bar")).toBe(bar);
    });

    test("add()ing item without name works", () => {
      const that = new Thing();
      const me = { me: true };
      const result = that.variables.add(me);
      expect(that.variables()).toEqual([me]);
      expect(that.variables["#storage"].map).toEqual({});
    });
  });
});


describe("complex test: unique, normalizeKey, constructor ", () => {
  const thing = new Thing();

  describe("initial setup", () => {
    test("'methods' becomes defined automatically", () => {
      expect(thing.methods).toBeInstanceOf(Function);
    });

    test("'methods.#storage' is not initially defined", () => {
      expect(thing.methods["#storage"]).toBe(undefined);
    });

    test("'methods'is non-enumerable", () => {
      expect(Object.keys(thing)).toEqual([]);
    });

    test("'methods.add' and '.remove' are defined automatically", () => {
      expect(thing.methods.add).toBeInstanceOf(Function);
      expect(thing.methods.remove).toBeInstanceOf(Function);
    });

    test("'methods()' returns an empty array before anything added", () => {
      expect(thing.methods()).toEqual([]);
    });
  });

  describe("adding unique items", () => {
    test("add()ing a single item of constructor works", () => {
      const thing = new Thing();
      const foo = new Method({ name: "foo" });
      const result = thing.methods.add(foo);
      expect(result).toBe(foo);
      expect(thing.methods("foo")).toBe(foo);
      expect(thing.methods()).toEqual([foo]);
    });

    test("add()ing a single anonymous item works", () => {
      const thing = new Thing();
      const result = thing.methods.add({ name: "foo" });
      expect(result).toBeInstanceOf(Method);
      expect(thing.methods("foo")).toBe(result);
      expect(thing.methods()).toEqual([result]);
    });

    test("add()ing multiple items of constructor works", () => {
      const thing = new Thing();
      const foo = new Method({ name: "foo" });
      const bar = new Method({ name: "bar" });
      const result = thing.methods.add(foo, bar);
      expect(result).toEqual([foo, bar]);
      expect(thing.methods()).toEqual([foo, bar]);
      expect(thing.methods("foo")).toBe(foo);
      expect(thing.methods("bar")).toBe(bar);
    });

    test("add()ing multiple anonymous items works", () => {
      const thing = new Thing();
      const [ foo, bar ] = thing.methods.add({ name: "foo" }, { name: "bar" });
      expect(foo).toBeInstanceOf(Method);
      expect(bar).toBeInstanceOf(Method);
      expect(thing.methods()).toEqual([foo, bar]);
      expect(thing.methods("foo")).toBe(foo);
      expect(thing.methods("bar")).toBe(bar);
    });


    test("adding single item of constructor equals works", () => {
      const thing = new Thing();
      const foo = new Method({ name: "foo" });
      thing.methods = foo;
      expect(thing.methods()).toEqual([foo]);
      expect(thing.methods("foo")).toBe(foo);
    });

    test("adding single anonymous item with equals works", () => {
      const thing = new Thing();
      thing.methods = { name: "foo" }
      expect(thing.methods().length).toBe(1);
      expect(thing.methods("foo")).toBeInstanceOf(Method);
      expect(thing.methods("foo")).toEqual(new Method({ name: "foo" }));
    });


    test("adding multiple items of constructor with equals works", () => {
      const thing = new Thing();
      const foo = new Method({ name: "foo" });
      const bar = new Method({ name: "bar" });
      thing.methods = [foo, bar];
      expect(thing.methods()).toEqual([foo, bar]);
      expect(thing.methods("foo")).toBe(foo);
      expect(thing.methods("bar")).toBe(bar);
    });

    test("adding multiple anonymous items with equals works", () => {
      const thing = new Thing();
      thing.methods = [{ name: "foo" }, { name: "bar" }];
      expect(thing.methods().length).toBe(2);
      expect(thing.methods("foo")).toBeInstanceOf(Method);
      expect(thing.methods("bar")).toBeInstanceOf(Method);
    });
  });

  describe("adding duplicates", () => {
    test("adding same item again doesn't change anything", () => {
      const thing = new Thing();
      const foo = new Method({ name: "foo" });
      thing.methods.add(foo);
      thing.methods.add(foo);
      expect(thing.methods()).toEqual([foo]);
      expect(thing.methods("foo")).toBe(foo);
    });

    test("adding item with same name drops original", () => {
      const thing = new Thing();
      const foo1 = new Method({ name: "foo" });
      const foo2 = new Method({ name: "foo" });
      thing.methods.add(foo1);
      expect(thing.methods()).toEqual([foo1]);
      expect(thing.methods("foo")).toBe(foo1);
      thing.methods.add(foo2);
      expect(thing.methods()).toEqual([foo2]);
      expect(thing.methods("foo")).toBe(foo2);
    });
  });

  describe("normalize key", () => {
    test("add()ing constructor item normalizes key", () => {
      const thing = new Thing();
      const foo = new Method({ name: "foo--bar" });
      const result = thing.methods.add(foo);
      expect(result).toBe(foo);
      expect(thing.methods()).toEqual([result]);
      expect(thing.methods("foo--bar")).toBe(foo);
      expect(thing.methods("foo_bar")).toBe(foo);
    });

    test("add()ing anonymous item normalizes key", () => {
      const thing = new Thing();
      const result = thing.methods.add({ name: "foo--bar" });
      expect(result).toBeInstanceOf(Method);
      expect(result).toEqual(new Method({ name: "foo--bar" }));
      expect(thing.methods("foo--bar")).toBe(thing.methods("foo_bar"));
    });

    test("adding constructor item with equals normalizes key", () => {
      const thing = new Thing();
      const foo = new Method({ name: "foo--bar" });
      thing.methods = foo;
      expect(thing.methods()).toEqual([foo]);
      expect(thing.methods("foo--bar")).toBe(foo);
      expect(thing.methods("foo_bar")).toBe(foo);
    });

    test("adding anonymous item with equals normalizes key", () => {
      const thing = new Thing();
      thing.methods = { name: "foo--bar" };
      expect(thing.methods()).toEqual([new Method({ name: "foo--bar" })]);
      expect(thing.methods("foo--bar")).toBe(thing.methods("foo_bar"));
    });
  });

});
