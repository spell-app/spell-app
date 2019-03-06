//
//  # Core `rules` -- simple datatypes, etc.
//
import {
  Rule,
  SpellParser,
  Token,
} from "./all.js";

import identifierBlacklist from "./identifier-blacklist.js";

const parser = new SpellParser({ module: "core" });
export default parser;

// Eat all whitespace at start of tokens.
parser.defineRule({
  name: "eat_whitespace",
  syntax: "{whitespace}*",
  datatype: "string",
  compile(match, scope) {
    return match.matched.map(whitespace => whitespace.compile()).join(" ");
  }
});

// Any whitespace.
parser.defineRule({
  name: "whitespace",
  datatype: "string",
  tokenType: Token.Whitespace
});

// Indent whitespace specifically.
parser.defineRule({
  name: "indent",
  datatype: "string",
  tokenType: Token.Indent
});

// Newlines only.
parser.defineRule({
  name: "newline",
  datatype: "string",
  tokenType: Token.Newline
});

// Inline whitespace only.
// Note that we normally filter this out when tokenizing.
parser.defineRule({
  name: "inline_whitespace",
  datatype: "string",
  tokenType: Token.InlineWhitespace
});

// `number` as a float or integer token.
// TODO:  `integer` and `decimal`?  too techy?
parser.defineRule({
  name: "number",
  alias: ["expression", "single_expression"],
  datatype: "number",
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

// `number` as a string `zero` to `ten`
parser.defineRule({
  name: "number",
  alias: ["expression", "single_expression"],
  datatype: "number",
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

// Boolean literal.
// TODO: better name for this?  "flag"?  "truism"?
parser.defineRule({
  name: "boolean",
  alias: ["expression", "single_expression"],
  datatype: "boolean",
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


// Literal `text` string.
// You can use either single or double quotes on the outside (although double quotes are preferred).
// Returned value has the original enclosing quotes.
parser.defineRule({
  name: "text",
  alias: ["expression", "single_expression"],
  datatype: "string",
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
  alias: ["expression", "single_expression"],
  datatype: "undefined",
  syntax: "undefined",
  compile(match, scope) {
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
// NOTE: We blacklist a lot of words as identifiers, see `identifier-blacklist.js`
parser.defineRule({
  name: "identifier",
  pattern: /^[a-z][\w\-]*$/,
  // convert dashes to underscores when compiling
  valueMap(value) {
    return (""+value).replace(/\-/g, "_")
  },
  blacklist: identifierBlacklist,
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
  alias: ["expression", "single_expression"],
  syntax: "the? {identifier}",
  compile(match, scope) {
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

//
//  Constants:
//  - set up group for constants and an expression which returns constants from that group.
//
parser.defineRule({
  name: "constant",
  argument: "constant",
  constructor: Rule.Group,
});

parser.defineRule({
  name: "constant_identifier",
  alias: ["expression", "single_expression"],
  rule: "constant",
  constructor: Rule.Subrule
});


// `Type` = type name.
// MUST start with an upper-case letter (?)
parser.defineRule({
  name: "type",
  alias: ["expression", "single_expression"],
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


// List of identifiers and/or numbers, e.g. "clubs or hearts", "jack, queen, king"
// Note that this is not a generic "expression" -- it's too generic.
parser.defineRule({
  name: "identifier_list",
  syntax: "[({constant:word}|{number})(,|or|and|nor)]",
  tests: [
    {
      tests: [
        ["up or down", ["up", "down"]],
        ["red and black", ["red", "black"]],
        ["back nor forth", ["back", "forth"]],
        ["clubs, diamonds, hearts, spades", ["clubs", "diamonds", "hearts", "spades" ] ],
        ["ace, 2, 3, 4, jack, queen or king", ["ace", 2, 3, 4, "jack", "queen", "king" ] ],
      ]
    }
  ]
});


// Bracketed list (array), eg:  `[1,2 , true,false ]`
parser.defineRule({
  name: "bracketed_list",
  alias: ["expression", "single_expression"],
  syntax: "\\[ [list:{expression},]? \\]",
  testRule: "\\[",
  compile(match, scope) {
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
  alias: ["expression", "single_expression"],
  syntax: "\\( {expression} \\)",
  testRule: "\\(",
  compile(match, scope) {
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
