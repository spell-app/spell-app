//
//	# Core `rules` -- simple datatypes, etc.
//
// NOTE: many of the below are created as custom Pattern subclasses for debugging.
//
import Parser from "../../Parser";
import Rule from "../../Rule";
import Tokenizer from "../../Tokenizer";

// Create `core` parser.
const parser = Parser.forModule("core");
export default parser;

parser.defineRules(
  {
    name: "statements",
    constructor: Rule.Statements
  },

  {
    name: "comment",
    constructor: Rule.Comment
  },

  // `word` = is a single alphanumeric word.
  // MUST start with a lower-case letter (?)
  {
    name: "word",
    pattern: /^[a-z][\w\-]*$/,
    canonical: "Word",
    constructor: class word extends Rule.Pattern {
      // Convert "-" to "_" in source output.
      toSource() {
        return this.matched.replace(/\-/g, "_");
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
          ["abc-def_01", "abc_def_01"],
        ]
      },
      {
        title: "doesn't match things that aren't words",
        tests: [
          ["$asda", undefined],
          ["(asda)", undefined]     // TODO... ???
        ]
      },
    ]
  },

  // `identifier` = variables or property name.
  // MUST start with a lower-case letter (?)
  // NOTE: We blacklist a lot of words as identifiers.
  {
    name: "identifier",
    alias: "expression",
    canonical: "Idenfifier",
    pattern: /^[a-z][\w\-]*$/,
    constructor: class identifier extends Rule.Pattern {
      // Convert "-" to "_" in source output.
      toSource() {
        return this.matched.replace(/\-/g, "_");
      }
    },
    blacklist: [
      // Add English prepositions to identifier blacklist.
      //
      // Wikipedia "Preposition":
      //	"Prepositions...are a class of words that
      //	express spatial or temporal relations  (in, under, towards, before)
      //	or mark various semantic roles (of, for).
      // TESTME
      "about", "above", "after", "and", "as", "at",
      "before", "behind", "below", "beneath", "beside", "between", "beyond", "by",
      "defined", "down", "during",
      "each", "empty", "exactly", "except",
      "for", "from",
      "greater",
      "I", "in", "into",
      "less", "long",
      "me", "minus", "more",
      "near", "not",
      "of", "off", "on", "onto", "opposite", "or", "out", "outside", "over",
      "short", "since",
      "than", "the", "then", "through", "thru", "to", "toward", "towards",
      "undefined", "under", "underneath", "unique", "until", "up", "upon", "upside",
      "versus", "vs",
      "where", "with", "within", "without",

      // Add common english verbs to identifier blacklist.
      "are",
      "do", "does",
      "contains",
      "has", "have",
      "is",
      "repeat",
      "was", "were",

      // Add special control keywords to identifier blacklist.
      "else",
      "if",
      "otherwise",
      "while",

      // Add boolean tokens to identifier blacklist.
      "true", "false",
      "yes", "no",
      "ok", "cancel",
      "success", "failure",

      // Add number words to identifier blacklist.
      // TESTME
      "one", "two", "three", "four", "five",
      "six", "seven", "eight", "nine", "ten",
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
          ["abc-def_01", "abc_def_01"],
        ]
      },
      {
        title: "doesn't match things that aren't identifiers",
        tests: [
          ["", undefined],
          ["$asda", undefined],
          ["(asda)", undefined],     // TODO... ???
          ["Abc", undefined],
        ]
      },
      {
        title: "skips items in its blacklist",
        tests: [
          ["yes", undefined]
        ]
      }
    ]
  },

  // `Type` = type name.
  // MUST start with an upper-case letter (?)
  {
    name: "type",
    alias: "expression",
    canonical: "Type",
    pattern: /^([A-Z][\w\-]*|list|text|number|integer|decimal|character|boolean|object)$/,
    constructor: class type extends Rule.Pattern {
      // Convert "-" to "_" in source output.
      toSource() {
        let type = this.matched;
        switch(type) {
          // Alias `List` to `Array`
          case "List":		return "Array";

          // special case to take the following as lowercase
          case "list":		return "Array";
          case "text":		return "String";
          case "character":	return "Character";
          case "number":		return "Number";
          case "integer":		return "Integer";
          case "decimal":		return "Decimal";
          case "boolean":		return "Boolean";
          case "object":		return "Object";
          default:
            return type.replace(/\-/g, "_");
        }
      }
    },
    blacklist: [ "I" ],
    tests: [
      {
        title: "correctly matches types",
        tests: [
          ["Abc", "Abc"],
          ["Abc-def", "Abc_def"],
          ["Abc_Def", "Abc_Def"],
          ["Abc01", "Abc01"],
          ["Abc-def_01", "Abc_def_01"],
        ]
      },
      {
        title: "doesn't match things that aren't types",
        tests: [
          ["", undefined],
          ["$Asda", undefined],     // TODO... ???
          ["(Asda)", undefined],    // TODO... ???
        ]
      },
      {
        title: "skips items in its blacklist",
        tests: [
          ["I", undefined]
        ]
      }
    ]
  },



  // Boolean literal, created with custom constructor for debugging.
  // TODO: better name for this???
  {
    name: "boolean",
    alias: "expression",
    canonical: "Boolean",
    pattern: /^(true|false|yes|no|ok|cancel|success|failure)$/,
    constructor: class boolean extends Rule.Pattern {
      toSource() {
        switch (this.matched) {
          case "true":
          case "yes":
          case "ok":
          case "success":
            return true;

          default:
            return false;
        }
      }
    },
    tests: [
      {
        title: "correctly matches booleans",
        tests: [
          ["", undefined],
          ["true", true],
          ["yes", true],
          ["ok", true],
          ["success", true],
          ["false", false],
          ["no", false],
          ["cancel", false],
          ["failure", false]
        ]
      },
      {
        title: "doesn't match in the middle of a longer keyword",
        tests: [
          ["yessir", undefined],
          ["yes-sir", undefined],
          ["yes_sir", undefined]
        ]
      },
    ]
  },

  // `number` as either float or integer, created with custom constructor for debugging.
  // NOTE: you can also use `one`...`ten` as strings.'
  // TODO:  `integer` and `decimal`?  too techy?
  {
    name: "number",
    alias: "expression",
    canonical: "Number",
    constructor: class number extends Rule {
      // Special words you can use as numbers...
      static NUMBER_NAMES = {
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
      }

      // Numbers get encoded as numbers in the token stream.
      parse(parser, tokens, start = 0) {
        let token = tokens[start];
        // if a string, attempt to run through our NUMBER_NAMES
        if (typeof token === "string") token = Rule.Number.NUMBER_NAMES[token];
        if (typeof token !== "number") return undefined;
        return this.clone({
          matched: token,
          nextStart: start + 1
        });
      }

      // Convert to number on source output.
      toSource() {
        return this.matched;
      }
    },
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
          ["-111.111", -111.111],
        ]
      },
      {
        title: "doesn't match things that aren't numbers",
        tests: [
          ["", undefined],
          [".", undefined],
        ]
      },
      {
        title: "requires negative sign to be touching the number",
        tests: [
          ["- 1", undefined]
        ]
      },
    ]
  },

  // Literal `text` string, created with custom constructor for debugging.
  // You can use either single or double quotes on the outside (although double quotes are preferred).
  // Returned value has enclosing quotes.
  {
    name: "text",
    alias: "expression",
    canonical: "Text",
    constructor: class text extends Rule {
      // Text strings get encoded as `text` objects in the token stream.
      parse(parser, tokens, start = 0) {
        let token = tokens[start];
        if (!(token instanceof Tokenizer.Text)) return undefined;
        return this.clone({
          matched: token.quotedString,
          nextStart: start + 1
        });
      }

      toSource() {
        return this.matched;
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
//FIXME          ["'\"Gadzooks! I can\\'t believe it!\" he said'", "'\"Gadzooks! I can\'t believe it!\" he said'"],
        ]
      },
    ]
  },

  // Literal list (array), eg:  `[1,2 , true,false ]`
  {
    name: "literal_list",
    alias: "expression",
    syntax: "\\[[list:{expression},]?\\]",
    constructor: class literal_list extends Rule.Sequence {
      toSource() {
        let { list } = this.results;
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
          ["[yes,no,'a',1]", "[true, false, 'a', 1]"],
        ]
      },
      {
        title: "doesn't match malformed lists ",
        tests: [
          ["", undefined],
          ["[,1]", undefined]
        ]
      },
    ]
  },


  // Parenthesized expression
  {
    name: "parenthesized_expression",
    alias: "expression",
    syntax: "\\({expression}\\)",
    constructor: class parenthesized_expression extends Rule.Sequence {
      toSource() {
        let { expression } = this.results;
        // don't double parens if not necessary
        if (typeof expression === "string" && expression.startsWith("(") && expression.endsWith(")")) return expression;
        return "(" + expression + ")";
      }
    },
    tests: [
      {
        title: "correctly matches parenthesized expressions",
        tests: [
          ["(someVar)", "(someVar)"],
          ["((someVar))", "(someVar)"],
          ["(1 and yes)", "(1 && true)"],
        ]
      },
      {
        title: "correctly matches multiple parenthesis",
        compileAs: "expression",
        tests: [
          ["(1) and (yes)", "((1) && (true))"],
          ["((1) and (yes))", "((1) && (true))"],
          ["((1) and ((yes)))", "((1) && (true))"],
        ]
      },
      {
        title: "doesn't match malformed parenthesized expressions",
        tests: [
          ["(foo", undefined],
          ["(foo(bar)baz", undefined],
        ]
      },
    ]
  }

);
