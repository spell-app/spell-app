//
//  # Core `rules` -- simple datatypes, etc.
//
import {
  Rule,
  SpellParser,
  Token,
} from "./all.js";

const parser = new SpellParser({ module: "core" });
export default parser;

// Eat all whitespace at start of tokens.
parser.defineRule({
  name: "eat_whitespace",
  syntax: "{whitespace}*",
  compile(match) {
    return match.matched.map(whitespace => whitespace.compile()).join(" ");
  }
});

// Any whitespace.
parser.defineRule({
  name: "whitespace",
  tokenType: Token.Whitespace
});

// Indent whitespace specifically.
parser.defineRule({
  name: "indent",
  tokenType: Token.Indent
});

// Newlines only.
parser.defineRule({
  name: "newline",
  tokenType: Token.Newline
});

// Inline whitespace only.
// Note that we normally filter this out when tokenizing.
parser.defineRule({
  name: "inline_whitespace",
  tokenType: Token.InlineWhitespace
});

// `number` as a float or integer token.
// TODO:  `integer` and `decimal`?  too techy?
parser.defineRule({
  name: "number",
  alias: "expression",
  tokenType: Token.Number,
  tests: [
    {
      title: "correctly matches numbers",
      tests: [
        ["1", 1],
        ["1000", 1000],
        ["-1", -1],
        ["1.1", 1.1],
        ["000.1", 0.1],
        ["1.", 1],
        [".1", 0.1],
        ["-111.111", -111.111]
      ]
    },
    {
      title: "doesn't match things that aren't numbers",
      tests: [
        ["", undefined],
        ["-", undefined],
        [".", undefined]
      ]
    },
    {
      title: "requires negative sign to touching the number",
      tests: [
        ["- 1", undefined]
      ]
    }
  ]
});

// Literal `text` string, created with custom constructor for debugging.
// You can use either single or double quotes on the outside (although double quotes are preferred).
// Returned value has enclosing quotes.
parser.defineRule({
  name: "text",
  alias: "expression",
  tokenType: Token.Text,
  tests: [
    {
      title: "correctly matches text",
      tests: [
        ['""', '""'],
        ["''", "''"],
        ['"a"', '"a"'],
        ["'a'", "'a'"],
        ['"abcd"', '"abcd"'],
        ['"abc def ghi. jkl"', '"abc def ghi. jkl"'],
        ['"...Can\'t touch this"', '"...Can\'t touch this"'],
      ]
    }
  ]
});

// `undefined` as an expression... ???
parser.defineRule({
  name: "undefined",
  alias: "expression",
  syntax: "undefined",
  compile(match) {
    return "undefined";
  },
  tests: [
    {
      compileAs: "expression",
      tests: [["undefined", "undefined"]]
    }
  ]
});


// `word` = is a single alphanumeric word.
// MUST start with a lower-case letter (?)
parser.defineRule({
  name: "word",
  pattern: /^[a-z][\w\-]*$/,
  // convert dashes to underscores when compiling
  valueMap(value) {
    return (""+value).replace(/\-/g, "_")
  },
  tests: [
    {
      title: "correctly matches words",
      tests: [
        ["abc", "abc"],
        ["abc-def", "abc_def"],
        ["abc_def", "abc_def"],
        ["abc01", "abc01"],
        ["abc-def_01", "abc_def_01"]
      ]
    },
    {
      title: "doesn't match things that aren't words",
      tests: [
        ["$asda", undefined],
        ["(asda)", undefined] // TODO... ???
      ]
    }
  ]
});


// `identifier` = variables or property name.
// MUST start with a lower-case letter (?)
// NOTE: We blacklist a lot of words as identifiers.
parser.defineRule({
  name: "identifier",
  pattern: /^[a-z][\w\-]*$/,
  // convert dashes to underscores when compiling
  valueMap(value) {
    return (""+value).replace(/\-/g, "_")
  },
  blacklist: {
    // Add English prepositions to identifier blacklist.
    //
    // Wikipedia "Preposition":
    //  "Prepositions...are a class of words that
    //  express spatial or temporal relations  (in, under, towards, before)
    //  or mark various semantic roles (of, for).
    about: 1,
    above: 1,
    after: 1,
    and: 1,
    as: 1,
    at: 1,
    before: 1,
    behind: 1,
    below: 1,
    beneath: 1,
    beside: 1,
    between: 1,
    beyond: 1,
    by: 1,
    defined: 1,
//    down: 1,
    during: 1,
    each: 1,
    empty: 1,
    exactly: 1,
    except: 1,
    for: 1,
    from: 1,
    greater: 1,
    I: 1,
    in: 1,
    into: 1,
    less: 1,
    long: 1,
    me: 1,
    minus: 1,
    more: 1,
    near: 1,
    not: 1,
    of: 1,
    off: 1,
    on: 1,
    onto: 1,
    opposite: 1,
    or: 1,
    out: 1,
    outside: 1,
    over: 1,
    short: 1,
    since: 1,
    than: 1,
    the: 1,
    then: 1,
    through: 1,
    thru: 1,
    to: 1,
    toward: 1,
    towards: 1,
    undefined: 1,
    under: 1,
    underneath: 1,
    unique: 1,
    until: 1,
//    up: 1,
    upon: 1,
    upside: 1,
    versus: 1,
    vs: 1,
    where: 1,
    with: 1,
    within: 1,
    without: 1,

    // Add common english verbs to identifier blacklist.
    are: 1,
    do: 1,
    does: 1,
    contains: 1,
    has: 1,
    have: 1,
    is: 1,
    repeat: 1,
    was: 1,
    were: 1,

    // Add special control keywords to identifier blacklist.
    else: 1,
    if: 1,
    otherwise: 1,
    while: 1,

    // Add boolean tokens to identifier blacklist.
    true: 1,
    false: 1,
    yes: 1,
    no: 1,
    ok: 1,
    cancel: 1,
    success: 1,
    failure: 1,

    // Add number words to identifier blacklist.
    one: 1,
    two: 1,
    three: 1,
    four: 1,
    five: 1,
    six: 1,
    seven: 1,
    eight: 1,
    nine: 1,
    ten: 1
  },
  tests: [
    {
      title: "correctly matches identifiers",
      tests: [
        ["", undefined],
        ["abc", "abc"],
        ["abc-def", "abc_def"],
        ["abc_def", "abc_def"],
        ["abc01", "abc01"],
        ["abc-def_01", "abc_def_01"]
      ]
    },
    {
      title: "doesn't match things that aren't identifiers",
      tests: [
        ["", undefined],
        ["$asda", undefined],
        ["(asda)", undefined],
        ["Abc", undefined],
      ]
    },
    {
      title: "skips items in its blacklist",
      tests: [
        ["yes", undefined],
        ["the", undefined],
      ],
    }
  ]
});

parser.defineRule({
  name: "identifier_expression",
  alias: "expression",
  syntax: "the? {identifier}",
  compile(match) {
    return match.results.identifier;
  },
  tests: [
    {
      title: "correctly matches identifiers with the",
      compileAs: "expression",
      tests: [
        ["the abc", "abc"],
        ["the abc-def", "abc_def"],
        ["the abc_def", "abc_def"],
        ["the abc01", "abc01"],
        ["the abc-def_01", "abc_def_01"]
      ]
    },
    {
      title: "correctly matches identifiers without the",
      compileAs: "expression",
      tests: [
        ["abc", "abc"],
        ["abc-def", "abc_def"],
        ["abc_def", "abc_def"],
        ["abc01", "abc01"],
        ["abc-def_01", "abc_def_01"]
      ]
    },
    {
      title: "doesn't match things that aren't identifiers with or without 'the'",
      compileAs: "expression",
      tests: [
        ["", undefined],
        ["$asda", undefined],
        ["the", undefined],
        ["the $asda", undefined],
        ["the (asda)", undefined],
        ["the Abc", undefined],
      ]
    },
    {
      title: "skips items in identifier blacklist with or without the",
      tests: [
        ["true", undefined],
        ["yes", undefined],
        ["the the", undefined],
        ["the yes", undefined],
      ],
    }
  ]
});

// Boolean literal, created with custom constructor for debugging.
// TODO: better name for this???
parser.defineRule({
  name: "boolean",
  alias: "expression",
  pattern: /^(true|false|yes|no|ok|cancel)$/,
  valueMap: {
    "true": true,
    "false": false,
    yes: true,
    no: false,
    ok: true,
    cancel: false,
  },
  tests: [
    {
      title: "correctly matches booleans",
      tests: [
        ["", undefined],
        ["true", true],
        ["yes", true],
        ["ok", true],
        ["false", false],
        ["no", false],
        ["cancel", false],
      ]
    },
    {
      title: "doesn't match in the middle of a longer keyword",
      tests: [["yessir", undefined], ["yes-sir", undefined], ["yes_sir", undefined]]
    }
  ]
});




// `number` as a string `zero` to `ten`
parser.defineRule({
  name: "number",
  alias: "expression",
  pattern: /^(zero|one|two|three|four|five|six|seven|eight|nine|ten)$/,
  valueMap: {
    zero: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10
  },
  tests: [
    {
      title: "correctly matches number strings",
      tests: [
        ["zero", 0],
        ["one", 1],
        ["two", 2],
        ["three", 3],
        ["four", 4],
        ["five", 5],
        ["six", 6],
        ["seven", 7],
        ["eight", 8],
        ["nine", 9],
        ["ten", 10]
      ]
    },
  ]
});


// `Type` = type name.
// MUST start with an upper-case letter (?)
parser.defineRule({
  name: "type",
  alias: "expression",
  pattern: /^([A-Z][\w\-]*|list|text|number|integer|decimal|character|boolean|object)$/,
  blacklist: {
    I: true
  },
  valueMap: {
    // Alias `List` to `Array`
    "List": "Array",
    // special case to take the following as lowercase
    "list": "Array",
    "text": "String",
    "character": "Character",
    "number": "Number",
    "integer": "Integer",
    "decimal": "Decimal",
    "boolean": "Boolean",
    "object": "Object",
    // otherwise just turn dashes into underscores
    default(type) {
      return type.replace(/\-/g, "_");
    }
  },
  tests: [
    {
      title: "correctly matches types",
      tests: [
        ["Abc", "Abc"],
        ["Abc-def", "Abc_def"],
        ["Abc_Def", "Abc_Def"],
        ["Abc01", "Abc01"],
        ["Abc-def_01", "Abc_def_01"]
      ]
    },
    {
      title: "doesn't match things that aren't types",
      tests: [
        ["", undefined],
        ["$Asda", undefined], // TODO... ???
        ["(Asda)", undefined] // TODO... ???
      ]
    },
    {
      title: "converts special types",
      tests: [
        ["List", "Array"],
        ["list", "Array"],
        ["text", "String"],
        ["character", "Character"],
        ["number", "Number"],
        ["integer", "Integer"],
        ["decimal", "Decimal"],
        ["boolean", "Boolean"],
        ["object", "Object"]
      ]
    },
    {
      title: "skips items in its blacklist",
      tests: [["I", undefined]]
    }
  ]
});

// Literal list (array), eg:  `[1,2 , true,false ]`
parser.defineRule({
  name: "literal_list",
  alias: "expression",
  syntax: "\\[ [list:{expression},]? \\]",
  testRule: "\\[",
  resetRules: true,
  compile(match) {
    let { list } = match.results;
    return `[${list ? list.join(", ") : ""}]`;
  },
  tests: [
    {
      title: "correctly matches literal lists",
      tests: [
        ["[]", "[]"],
        ["[1]", "[1]"],
        ["[1,]", "[1]"],
        ["[1,2,3]", "[1, 2, 3]"],
        ["[1, 2, 3]", "[1, 2, 3]"],
        ["[1,2,3,]", "[1, 2, 3]"],
        ["[yes,no,'a',1]", "[true, false, 'a', 1]"]
      ]
    },
    {
      title: "doesn't match malformed lists ",
      tests: [["", undefined], ["[,1]", undefined]]
    }
  ]
});

// Parenthesized expression
parser.defineRule({
  name: "parenthesized_expression",
  alias: "expression",
  syntax: "\\( {expression} \\)",
  testRule: "\\(",
  resetRules: true,
  compile(match) {
    let { expression } = match.results;
    // don't double parens if not necessary
    if (
      typeof expression === "string" &&
      expression.startsWith("(") &&
      expression.endsWith(")")
    )
      return expression;
    return "(" + expression + ")";
  },
  tests: [
    {
      title: "correctly matches parenthesized expressions",
      tests: [
        ["(someVar)", "(someVar)"],
        ["((someVar))", "(someVar)"],
        ["(1 and yes)", "(1 && true)"]
      ]
    },
    {
      title: "correctly matches multiple parenthesis",
      compileAs: "expression",
      tests: [
        ["(1) and (yes)", "((1) && (true))"],
        ["((1) and (yes))", "((1) && (true))"],
        ["((1) and ((yes)))", "((1) && (true))"]
      ]
    },
    {
      title: "doesn't match malformed parenthesized expressions",
      tests: [["(foo", undefined], ["(foo(bar)baz", undefined]]
    }
  ]
});
