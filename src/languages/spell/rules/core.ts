//
//  # Core `rules` -- simple datatypes, etc.
//
import { Tokens } from "~/parser"
import type { Match } from "~/parser/Match"
import { AST, SpellParser } from "~/languages/spell"
import { Rules } from "~/parser/rule"

/** Narrow a dynamic `match.value` to `string`, throwing if the rule matched something else. */
function assertString(value: unknown): string {
  if (typeof value !== "string") throw new TypeError(`Expected a string value, got ${typeof value}`)
  return value
}

/** Narrow a dynamic `match.value` to `number`, throwing if the rule matched something else. */
function assertNumber(value: unknown): number {
  if (typeof value !== "number") throw new TypeError(`Expected a number value, got ${typeof value}`)
  return value
}

/** Narrow a dynamic `match.value` to `boolean`, throwing if the rule matched something else. */
function assertBoolean(value: unknown): boolean {
  if (typeof value !== "boolean") throw new TypeError(`Expected a boolean value, got ${typeof value}`)
  return value
}

export const core = new SpellParser({
  module: "core",
  rules: [
    //----------------------------
    //  Various flavors of whitespace.
    //
    // Eat all whitespace at start of tokens.
    {
      name: "eat_whitespace",
      syntax: "{whitespace}*",
      datatype: "string",
      constructor: class eat_whitespace extends Rules.Subrule {}
    },

    // Any whitespace.
    {
      name: "whitespace",
      datatype: "string",
      tokenType: Tokens.Whitespace,
      constructor: class whitespace extends Rules.TokenType {
        getAST(match: Match): AST.StringLiteral {
          const { value, raw } = match
          return new AST.StringLiteral(match, { value: assertString(value), raw })
        }
      }
    },

    // Indent whitespace specifically.
    {
      name: "indent",
      datatype: "string",
      tokenType: Tokens.Indent,
      constructor: class indent extends Rules.TokenType {
        getAST(match: Match): AST.StringLiteral {
          const { value, raw } = match
          return new AST.StringLiteral(match, { value: assertString(value), raw })
        }
      }
    },

    // Newlines only.
    {
      name: "newline",
      datatype: "string",
      tokenType: Tokens.Newline,
      constructor: class newline extends Rules.TokenType {
        getAST(match: Match): AST.StringLiteral {
          const { value, raw } = match
          return new AST.StringLiteral(match, { value: assertString(value), raw })
        }
      }
    },

    // Inline whitespace only.
    // Note that we normally filter this out when tokenizing.
    {
      name: "inline_whitespace",
      datatype: "string",
      tokenType: Tokens.InlineWhitespace,
      constructor: class inline_whitespace extends Rules.TokenType {
        getAST(match: Match): AST.StringLiteral {
          const { value, raw } = match
          return new AST.StringLiteral(match, { value: assertString(value), raw })
        }
      }
    },

    //----------------------------
    //  Simple types:  number, boolean, text (string), etc.
    //

    // `number` as a float or integer token.
    // TODO:  `integer` and `decimal`?  too techy?
    {
      name: "number",
      alias: "expression",
      datatype: "number",
      tokenType: Tokens.Number,
      constructor: class numeric extends Rules.TokenType {
        getAST(match: Match): AST.NumericLiteral {
          const { value, raw } = match
          return new AST.NumericLiteral(match, { value: assertNumber(value), raw })
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
      name: "number_as_string",
      alias: ["expression", "number"],
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
      constructor: class number_as_string extends Rules.Pattern {
        getAST(match: Match): AST.NumericLiteral {
          const { value, raw } = match
          return new AST.NumericLiteral(match, { value: assertNumber(value), raw })
        }
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
      alias: "expression",
      datatype: "boolean",
      pattern: /^(true|false|yes|no|ok|cancel|always|never)$/,
      VALUE_MAP: {
        true: true,
        false: false,
        yes: true,
        no: false,
        ok: true,
        cancel: false,
        always: true,
        never: false
      },
      constructor: class _boolean extends Rules.Pattern {
        getAST(match: Match): AST.BooleanLiteral {
          const { value, raw } = match
          return new AST.BooleanLiteral(match, { value: assertBoolean(value), raw })
        }
      },
      tests: [
        {
          title: "correctly matches booleans",
          tests: [
            ["", undefined],
            ["true", "true"],
            ["yes", "true"],
            ["ok", "true"],
            ["always", "true"],
            ["false", "false"],
            ["no", "false"],
            ["cancel", "false"],
            ["never", "false"]
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
    // Note that in spell you must use DOUBLE QUOTES (`"`) -- single quotes are treated as a single symbol.
    // Returned value has the original enclosing quotes.
    {
      name: "text",
      alias: "expression",
      datatype: "string",
      tokenType: Tokens.Text,
      constructor: class text extends Rules.TokenType {
        getAST(match: Match): AST.StringLiteral {
          const { value, raw } = match
          return new AST.StringLiteral(match, { value: assertString(value), raw })
        }
      },
      tests: [
        {
          title: "correctly matches text",
          tests: [
            ['""', '""'],
            ['"a"', '"a"'],
            ['"abcd"', '"abcd"'],
            ['"abc def ghi. jkl"', '"abc def ghi. jkl"'],
            [`"...Can't touch this"`, `"...Can't touch this"`]
          ]
        }
      ]
    },

    {
      name: "comment",
      tokenType: Tokens.Comment,
      constructor: class comment extends Rules.TokenType {
        getAST(match: Match): AST.LineComment {
          const [token] = match.matched
          // `tokenType: Tokens.Comment` guarantees the single matched token is a `Comment`.
          if (!(token instanceof Tokens.Comment)) throw new TypeError("Expected a Comment token")
          const { commentSymbol, initialWhitespace, value } = token
          return new AST.LineComment(match, { commentSymbol, initialWhitespace, value })
        }
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
      alias: "expression",
      datatype: "undefined",
      syntax: "(undefined|nothing)",
      constructor: class undefined_literal extends Rules.Literal {
        getAST(match: Match): AST.UndefinedLiteral {
          return new AST.UndefinedLiteral(match)
        }
      },
      tests: [
        {
          compileAs: "expression",
          tests: [
            ["nothing", "undefined"],
            ["undefined", "undefined"]
          ]
        }
      ]
    },

    // `keyword` = is a single alphanumeric word used as a keyword in, e.g. a method definition.
    // Case is not a factor, but it must start with a letter.
    {
      name: "keyword",
      pattern: /^[a-zA-Z][\w\-]*$/,
      constructor: class keyword extends Rules.Pattern {
        // convert dashes to underscores when compiling
        mapValue<T = string>(value: string): T {
          return `${value}`.replace(/\-/g, "_") as T
        }
        getAST(match: Match): AST.KeywordLiteral {
          const { value, raw } = match
          return new AST.KeywordLiteral(match, { value: assertString(value), raw })
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
    }
  ]
})
