/**
 * Core rules -- simple datatypes (`number`, `boolean`, `text`, `undefined`), whitespace/newline/comment
 * tokens, and the `keyword` identifier pattern used by method/type definitions elsewhere.
 */
import { assert, proto } from "~/util"
import { P } from "~/parser"
// Import directly to avoid circular import
import { SpellParser } from "~/languages/spell/SpellParser"

////////////////
// ## Various flavors of whitespace
////////////////

/**
 * Eats all whitespace at start of tokens -- used to skip leading indent/newlines before a real rule.
 * - Base class is `P.Repeat`, not `P.Subrule` -- syntax `{whitespace}*` compiles to a `Repeat` (of a
 *   `whitespace` `Subrule`), matching zero-or-more times.  See report: the old bag form got away with
 *   `constructor: class ... extends P.Subrule` only because it's dead code, never referenced elsewhere.
 */
export class eat_whitespace extends P.Repeat {
  @proto static syntax = "{whitespace}*"
  @proto static datatype = "string"
}

/** Any whitespace token -- space, tab, newline, etc., wrapped as-is into a `StringLiteral`. */
export class whitespace extends P.TokenType {
  @proto static datatype = "string"
  @proto static tokenType = P.WhitespaceToken

  getAST(match: P.MatchFor<this>): P.ASTStringLiteral {
    const { value, raw } = match
    return new P.ASTStringLiteral(match, { value: assert.string(value), raw })
  }
}

/** Indent whitespace specifically, e.g. leading spaces/tabs at start of a line. */
export class indent extends P.TokenType {
  @proto static datatype = "string"
  @proto static tokenType = P.IndentToken

  getAST(match: P.MatchFor<this>): P.ASTStringLiteral {
    const { value, raw } = match
    return new P.ASTStringLiteral(match, { value: assert.string(value), raw })
  }
}

/** Single newline. */
export class newline extends P.TokenType {
  @proto static datatype = "string"
  @proto static tokenType = P.NewlineToken

  getAST(match: P.MatchFor<this>): P.ASTStringLiteral {
    const { value, raw } = match
    return new P.ASTStringLiteral(match, { value: assert.string(value), raw })
  }
}

/**
 * Inline whitespace only, e.g. spaces/tabs between tokens on same line.
 * - NOTE: normally filtered out when tokenizing, so this rule rarely matches in practice.
 */
export class inline_whitespace extends P.TokenType {
  @proto static datatype = "string"
  @proto static tokenType = P.InlineWhitespaceToken

  getAST(match: P.MatchFor<this>): P.ASTStringLiteral {
    const { value, raw } = match
    return new P.ASTStringLiteral(match, { value: assert.string(value), raw })
  }
}

////////////////
// ## Simple types:  number, boolean, text (string), etc.
////////////////

/**
 * `number` as a float or integer token.
 * - Class named `numeric`, not `number` -- `number` is a reserved TS type keyword.
 * - TODO:  `integer` and `decimal`?  too techy?
 */
export class numeric extends P.TokenType {
  static ruleName = "number"
  @proto static alias = "expression"
  @proto static datatype = "number"
  @proto static tokenType = P.NumberToken

  getAST(match: P.MatchFor<this>): P.ASTNumericLiteral {
    const { value, raw } = match
    return new P.ASTNumericLiteral(match, { value: assert.number(value), raw })
  }

  static tests: P.RuleTests = [
    {
      title: "correctly matches numbers",
      tests: [
        ["1", 1],
        ["1000", 1000],
        ["-1", -1],
        ["1.1", 1.1],
        ["000.1", 0.1],
        [".1", 0.1],
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
}

/** `number` spelled out as a string, `zero` to `ten` -- `VALUE_MAP` does the word-to-number lookup. */
export class number_as_string extends P.Pattern {
  @proto static alias = ["expression", "number"]
  @proto static datatype = "number"
  @proto static pattern = /^(zero|one|two|three|four|five|six|seven|eight|nine|ten)$/
  @proto static VALUE_MAP = {
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

  getAST(match: P.MatchFor<this>): P.ASTNumericLiteral {
    const { value, raw } = match
    return new P.ASTNumericLiteral(match, { value: assert.number(value), raw })
  }

  static tests: P.RuleTests = [
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
}

/**
 * Boolean literal -- also accepts common synonyms like `yes`/`no`, `ok`/`cancel`, `always`/`never`.
 * - Class named `_boolean`, not `boolean` -- `boolean` is a reserved TS type keyword.
 * - TODO: better name for this?  "flag"?  "truism"?
 */
export class _boolean extends P.Pattern {
  static ruleName = "boolean"
  @proto static alias = "expression"
  @proto static datatype = "boolean"
  @proto static pattern = /^(true|false|yes|no|ok|cancel|always|never)$/
  @proto static VALUE_MAP = {
    true: true,
    false: false,
    yes: true,
    no: false,
    ok: true,
    cancel: false,
    always: true,
    never: false
  }

  getAST(match: P.MatchFor<this>): P.ASTBooleanLiteral {
    const { value, raw } = match
    return new P.ASTBooleanLiteral(match, { value: assert.boolean(value), raw })
  }

  static tests: P.RuleTests = [
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
}

/**
 * Literal `text` string.
 * - NOTE: in spell you must use DOUBLE QUOTES (`"`) -- single quotes are treated as a single symbol.
 * - Returned value has original enclosing quotes.
 */
export class text extends P.TokenType {
  @proto static alias = "expression"
  @proto static datatype = "string"
  @proto static tokenType = P.TextToken

  getAST(match: P.MatchFor<this>): P.ASTStringLiteral {
    const { value, raw } = match
    return new P.ASTStringLiteral(match, { value: assert.string(value), raw })
  }

  static tests: P.RuleTests = [
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
}

/** Line comment token -- wraps a `CommentToken` into a `LineComment` AST node, e.g. `// foo`. */
export class comment extends P.TokenType {
  @proto static tokenType = P.CommentToken

  getAST(match: P.MatchFor<this>): P.ASTLineComment {
    const [token] = match.matched
    // `tokenType: CommentToken` guarantees the single matched token is a `CommentToken`.
    if (!(token instanceof P.CommentToken)) throw new TypeError("Expected a CommentToken")
    const { commentSymbol, initialWhitespace, value } = token
    return new P.ASTLineComment(match, { commentSymbol, initialWhitespace, value })
  }

  static tests: P.RuleTests = [
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
}

/**
 * `undefined` as an expression... ???
 * - Class named `undefined_literal`, not `undefined` -- `undefined` is a reserved word.
 */
export class undefined_literal extends P.Literal {
  static ruleName = "undefined"
  @proto static alias = "expression"
  @proto static datatype = "undefined"
  @proto static syntax = "(undefined|nothing)"

  getAST(match: P.MatchFor<this>): P.ASTUndefinedLiteral {
    return new P.ASTUndefinedLiteral(match)
  }

  static tests: P.RuleTests = [
    {
      compileAs: "expression",
      tests: [
        ["nothing", "undefined"],
        ["undefined", "undefined"]
      ]
    }
  ]
}

/**
 * Single alphanumeric word used as a keyword, e.g. in a method definition.
 * - Case is not a factor, but it must start with a letter.
 */
export class keyword extends P.Pattern {
  @proto static pattern = /^[a-zA-Z][\w-]*$/

  /** Converts dashes to underscores when compiling, so `abc-def` outputs as valid JS identifier `abc_def`. */
  mapValue<T = string>(value: string): T {
    return `${value}`.replace(/-/g, "_") as T
  }

  getAST(match: P.MatchFor<this>): P.ASTKeywordLiteral {
    const { value, raw } = match
    return new P.ASTKeywordLiteral(match, { value: assert.string(value), raw })
  }

  static tests: P.RuleTests = [
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

/** Rule module for core rules (whitespace variants, simple datatypes, `keyword`). */
export const core = new SpellParser({
  module: "core",
  rules: [
    eat_whitespace,
    whitespace,
    indent,
    newline,
    inline_whitespace,
    numeric,
    number_as_string,
    _boolean,
    text,
    comment,
    undefined_literal,
    keyword
  ]
})
