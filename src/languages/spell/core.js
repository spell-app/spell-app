//
//  # Core `rules` -- simple datatypes, etc.
//
// NOTE: many of the below are created as custom Pattern subclasses for debugging.
//
import Parser from "../../Parser";
import Match from "../../Match";
import Rule from "../../Rule";
import Tokenizer from "../../Tokenizer";

// Create `core` parser.
const parser = Parser.forModule("core");
export default parser;


parser.defineRule({
  name: "statement",
  constructor: Rule.Statement
});

parser.defineRule({
  name: "statements",
  constructor: Rule.Statements
});

parser.defineRule({
  name: "comment",
  constructor: Rule.Comment
});

// `undefined` as an expression... ???
parser.defineRule({
  name: "undefined",
  alias: "expression",
  syntax: "undefined",
  testAtStart: true,
  constructor: class _undefined extends Rule.Keywords {
    compile(match) {
      return "undefined";
    }
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
  canonical: "Word",
  constructor: class word extends Rule.Pattern {
    // Convert "-" to "_" in source output.
    compile(match) {
      return match.matched.replace(/\-/g, "_");
    }
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
  canonical: "Idenfifier",
  pattern: /^[a-z][\w\-]*$/,
  constructor: class identifier extends Rule.Pattern {
    // Convert "-" to "_" in source output.
    compile(match) {
      return match.matched.replace(/\-/g, "_");
    }
  },
  blacklist: [
    // Add English prepositions to identifier blacklist.
    //
    // Wikipedia "Preposition":
    //  "Prepositions...are a class of words that
    //  express spatial or temporal relations  (in, under, towards, before)
    //  or mark various semantic roles (of, for).
    // TESTME
    "about",
    "above",
    "after",
    "and",
    "as",
    "at",
    "before",
    "behind",
    "below",
    "beneath",
    "beside",
    "between",
    "beyond",
    "by",
    "defined",
    "down",
    "during",
    "each",
    "empty",
    "exactly",
    "except",
    "for",
    "from",
    "greater",
    "I",
    "in",
    "into",
    "less",
    "long",
    "me",
    "minus",
    "more",
    "near",
    "not",
    "of",
    "off",
    "on",
    "onto",
    "opposite",
    "or",
    "out",
    "outside",
    "over",
    "short",
    "since",
    "than",
    "the",
    "then",
    "through",
    "thru",
    "to",
    "toward",
    "towards",
    "undefined",
    "under",
    "underneath",
    "unique",
    "until",
    "up",
    "upon",
    "upside",
    "versus",
    "vs",
    "where",
    "with",
    "within",
    "without",

    // Add common english verbs to identifier blacklist.
    "are",
    "do",
    "does",
    "contains",
    "has",
    "have",
    "is",
    "repeat",
    "was",
    "were",

    // Add special control keywords to identifier blacklist.
    "else",
    "if",
    "otherwise",
    "while",

    // Add boolean tokens to identifier blacklist.
    "true",
    "false",
    "yes",
    "no",
    "ok",
    "cancel",
    "success",
    "failure",

    // Add number words to identifier blacklist.
    // TESTME
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten"
  ],
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
  constructor: class identifier_expression extends Rule.Sequence {
    compile(match) {
      return match.results.identifier;
    }
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
        ["the", undefined],
        ["the $asda", undefined],
        ["the (asda)", undefined],
        ["the Abc", undefined],
      ]
    },
    {
      title: "skips items in identifier blacklist with or without the",
      tests: [
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
  canonical: "Boolean",
  pattern: /^(true|false|yes|no|ok|cancel)$/,
  valueMap: {
    true: true,
    yes: true,
    ok: true,
    default(matched) { return false }
  },
  constructor: class boolean extends Rule.Pattern {},
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

// `number` as either float or integer, created with custom constructor for debugging.
// NOTE: you can also use `one`...`ten` as strings.'
// TODO:  `integer` and `decimal`?  too techy?
parser.defineRule({
  name: "number",
  alias: "expression",
  canonical: "Number",
  pattern: /^(-?([0-9]*\.)?[0-9]+|zero|one|two|three|four|five|six|seven|eight|nine|ten)$/,
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
    ten: 10,
    default(matched) { return parseFloat(matched) }
  },
  constructor: class number extends Rule.Pattern {},
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
    {
      title: "doesn't match things that aren't numbers",
      tests: [["", undefined], [".", undefined]]
    },
    {
      title: "requires negative sign to be touching the number",
      tests: [["- 1", undefined]]
    }
  ]
});

// Literal `text` string, created with custom constructor for debugging.
// You can use either single or double quotes on the outside (although double quotes are preferred).
// Returned value has enclosing quotes.
parser.defineRule({
  name: "text",
  alias: "expression",
  canonical: "Text",
  testRule: Tokenizer.Text,
  constructor: class text extends Rule {
    // Text strings get encoded as `text` objects in the token stream.
    parse(parser, tokens, start = 0) {
      let token = tokens[start];
      if (!(token instanceof Tokenizer.Text)) return undefined;
      return new Match({
        rule: this,
        matched: token.quotedString,
        nextStart: start + 1
      });
    }

    compile(match) {
      return match.matched;
    }
  },
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

// `Type` = type name.
// MUST start with an upper-case letter (?)
parser.defineRule({
  name: "type",
  alias: "expression",
  canonical: "Type",
  pattern: /^([A-Z][\w\-]*|list|text|number|integer|decimal|character|boolean|object)$/,
  constructor: class type extends Rule.Pattern {
    // Convert "-" to "_" in source output.
    compile(match) {
      let type = match.matched;
      switch (type) {
        // Alias `List` to `Array`
        case "List":
          return "Array";

        // special case to take the following as lowercase
        case "list":
          return "Array";
        case "text":
          return "String";
        case "character":
          return "Character";
        case "number":
          return "Number";
        case "integer":
          return "Integer";
        case "decimal":
          return "Decimal";
        case "boolean":
          return "Boolean";
        case "object":
          return "Object";
        default:
          return type.replace(/\-/g, "_");
      }
    }
  },
  blacklist: ["I"],
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
  syntax: "\\[[list:{expression},]?\\]",
  testRule: "^\\[",
  constructor: class literal_list extends Rule.Sequence {
    // When parsing, reset the `rules` to the entire set of parser rules.
    // Otherwise we can't parse things like `[ [a, b] ]`
    parse(parser, tokens, start, end, rules) {
      return super.parse(parser, tokens, start, end, parser.rules);
    }

    compile(match) {
      let { list } = match.results;
      return `[${list ? list.join(", ") : ""}]`;
    }
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
  syntax: "\\({expression}\\)",
  testRule: "^\\(",
  constructor: class parenthesized_expression extends Rule.Sequence {
    // When parsing, reset the `rules` to the entire set of parser rules.
    // Otherwise we can't parse things like `(a+b) * (c+d)`
    parse(parser, tokens, start, end, rules) {
      return super.parse(parser, tokens, start, end, parser.rules);
    }

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
    }
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
