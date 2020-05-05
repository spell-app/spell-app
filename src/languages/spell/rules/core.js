//
//  # Core `rules` -- simple datatypes, etc.
//
import { Token } from "../../../parser"
import { AST, SpellParser } from ".."

export default new SpellParser({
  module: "core",
  rules: [
    //----------------------------
    //  Various flavors of whitespace.
    //
    // Eat all whitespace at start of tokens.
    {
      name: "eat_whitespace",
      syntax: "{whitespace}*",
      datatype: "string"
    },

    // Any whitespace.
    {
      name: "whitespace",
      datatype: "string",
      tokenType: Token.Whitespace,
      getAST(match) {
        const { value, raw } = match
        return new AST.StringLiteral(match, { value, raw })
      }
    },

    // Indent whitespace specifically.
    {
      name: "indent",
      datatype: "string",
      tokenType: Token.Indent,
      getAST(match) {
        const { value, raw } = match
        return new AST.StringLiteral(match, { value, raw })
      }
    },

    // Newlines only.
    {
      name: "newline",
      datatype: "string",
      tokenType: Token.Newline,
      getAST(match) {
        const { value, raw } = match
        return new AST.StringLiteral(match, { value, raw })
      }
    },

    // Inline whitespace only.
    // Note that we normally filter this out when tokenizing.
    {
      name: "inline_whitespace",
      datatype: "string",
      tokenType: Token.InlineWhitespace,
      getAST(match) {
        const { value, raw } = match
        return new AST.StringLiteral(match, { value, raw })
      }
    },

    //----------------------------
    //  Simple types:  number, boolean, text (string), etc.
    //

    // `number` as a float or integer token.
    // TODO:  `integer` and `decimal`?  too techy?
    {
      name: "number",
      alias: ["expression", "single_expression"],
      datatype: "number",
      tokenType: Token.Number,
      getAST(match) {
        const { value, raw } = match
        return new AST.NumericLiteral(match, { value, raw })
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
          title: "requires negative sign to touch the number",
          tests: [["- 1", undefined]]
        }
      ]
    },

    // `number` as a string `zero` to `ten`
    {
      name: "number",
      alias: ["expression", "single_expression"],
      datatype: "number",
      pattern: /^(zero|one|two|three|four|five|six|seven|eight|nine|ten)$/,
      VALUE_MAP: {
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
      getAST(match) {
        const { value, raw } = match
        return new AST.NumericLiteral(match, { value, raw })
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
        }
      ]
    },

    // Boolean literal.
    // TODO: better name for this?  "flag"?  "truism"?
    {
      name: "boolean",
      alias: ["expression", "single_expression"],
      datatype: "boolean",
      pattern: /^(true|false|yes|no|ok|cancel)$/,
      VALUE_MAP: {
        true: true,
        false: false,
        yes: true,
        no: false,
        ok: true,
        cancel: false
      },
      getAST(match) {
        const { value, raw } = match
        return new AST.BooleanLiteral(match, { value, raw })
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
            ["cancel", false]
          ]
        },
        {
          title: "doesn't match in the middle of a longer keyword",
          tests: [
            ["yessir", undefined],
            ["yes-sir", undefined],
            ["yes_sir", undefined]
          ]
        }
      ]
    },

    // Literal `text` string.
    // You can use either single or double quotes on the outside (although double quotes are preferred).
    // Returned value has the original enclosing quotes.
    {
      name: "text",
      alias: ["expression", "single_expression"],
      datatype: "string",
      tokenType: Token.Text,
      getAST(match) {
        const { value, raw } = match
        return new AST.StringLiteral(match, { value, raw })
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
            ['"...Can\'t touch this"', '"...Can\'t touch this"']
          ]
        }
      ]
    },

    {
      name: "comment",
      tokenType: Token.Comment,
      getAST(match) {
        const { commentSymbol, initialWhitespace, value } = match.matched[0]
        return new AST.LineComment(match, { commentSymbol, initialWhitespace, value })
      },
      tests: [
        {
          compileAs: "comment",
          tests: [
            ["//", "//"],
            ["// foo", "// foo"],
            ["-- foo", "//-- foo"],
            ["## foo", "//## foo"],
            ["//    foo bar baz", "//    foo bar baz"]
          ]
        }
      ]
    },

    // `undefined` as an expression... ???
    {
      name: "undefined",
      alias: ["expression", "single_expression"],
      datatype: "undefined",
      syntax: "undefined",
      getAST(match) {
        return new AST.UndefinedLiteral(match)
      },
      tests: [
        {
          compileAs: "expression",
          tests: [["undefined", "undefined"]]
        }
      ]
    },

    // `keyword` = is a single alphanumeric word used as a keyword in, e.g. a method definition.
    // Case is not a factor, but it must start with a letter.
    {
      name: "keyword",
      pattern: /^[a-zA-Z][\w\-]*$/,
      // convert dashes to underscores when compiling
      mapValue(value) {
        return `${value}`.replace(/\-/g, "_")
      },
      getAST(match) {
        const { value, raw } = match
        return new AST.KeywordLiteral(match, { value, raw })
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
    }
  ]
})
