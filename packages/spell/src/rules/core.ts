/**
 * Core rules -- simple datatypes (`number`, `boolean`, `text`, `undefined`), whitespace/newline/comment
 * tokens, and the `keyword` identifier pattern used by method/type definitions elsewhere.
 */
import { assert, proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"

/**
 * Rule module for core rules (whitespace variants, simple datatypes, `keyword`).
 * - Each rule class below is followed by the `core.addRule()` call which defines and registers it.
 */
export const core = new SpellParser({ module: "core" })

////////////////////////////////////////
// # Various flavors of whitespace
////////////////////////////////////////

////////////////
// ## `eat_whitespace` rule
//    e.g. "  ", eats leading whitespace tokens greedily
////////////////

/**
 * Eats all whitespace at start of tokens -- used to skip leading indent/newlines before a real rule.
 * - Base class is `P.Repeat`, not `P.Subrule` -- syntax `{whitespace}*` compiles to a `Repeat` (of a
 *   `whitespace` `Subrule`), matching zero-or-more times.  See report: the old bag form got away with
 *   `constructor: class ... extends P.Subrule` only because it's dead code, never referenced elsewhere.
 */
class eat_whitespace extends P.Repeat {
  @proto static datatype = "text"
}
core.addRule(eat_whitespace, {
  syntax: "{whitespace}*"
})

////////////////
// ## `whitespace` rule
//    e.g. " ", any whitespace token
////////////////

/** Any whitespace token -- space, tab, newline, etc., wrapped as-is into a `StringLiteral`. */
class whitespace extends P.TokenType {
  @proto static datatype = "text"
  @proto static tokenType = P.WhitespaceToken

  getAST(match: P.MatchFor<this>): P.ASTStringLiteral {
    const { value, raw } = match
    return new P.ASTStringLiteral(match, { value: assert.string(value), raw })
  }
}
core.addRule(whitespace)

////////////////
// ## `indent` rule
//    e.g. "    ", leading whitespace at start of a line
////////////////

/** Indent whitespace specifically, e.g. leading spaces/tabs at start of a line. */
class indent extends P.TokenType {
  @proto static datatype = "text"
  @proto static tokenType = P.IndentToken

  getAST(match: P.MatchFor<this>): P.ASTStringLiteral {
    const { value, raw } = match
    return new P.ASTStringLiteral(match, { value: assert.string(value), raw })
  }
}
core.addRule(indent)

////////////////
// ## `newline` rule
//    e.g. "\n"
////////////////

/** Single newline. */
class newline extends P.TokenType {
  @proto static datatype = "text"
  @proto static tokenType = P.NewlineToken

  getAST(match: P.MatchFor<this>): P.ASTStringLiteral {
    const { value, raw } = match
    return new P.ASTStringLiteral(match, { value: assert.string(value), raw })
  }
}
core.addRule(newline)

////////////////
// ## `inline_whitespace` rule
//    e.g. " ", between tokens on the same line
////////////////

/**
 * Inline whitespace only, e.g. spaces/tabs between tokens on same line.
 * - NOTE: normally filtered out when tokenizing, so this rule rarely matches in practice.
 */
class inline_whitespace extends P.TokenType {
  @proto static datatype = "text"
  @proto static tokenType = P.InlineWhitespaceToken

  getAST(match: P.MatchFor<this>): P.ASTStringLiteral {
    const { value, raw } = match
    return new P.ASTStringLiteral(match, { value: assert.string(value), raw })
  }
}
core.addRule(inline_whitespace)

////////////////////////////////////////
// # Simple types:  number, boolean, text (string), etc.
////////////////////////////////////////

////////////////
// ## `number` rule (class `numeric`)
//    e.g. "1"
////////////////

/**
 * `number` as a float or integer token.
 * - Class named `numeric`, not `number` -- `number` is a reserved TS type keyword.
 * - TODO:  `integer` and `decimal`?  too techy?
 */
class numeric extends P.TokenType {
  static ruleName = "number"
  @proto static highlightAs: P.HighlightKind = "number"
  @proto static alias = "expression"
  @proto static datatype = "number"
  @proto static tokenType = P.NumberToken

  getAST(match: P.MatchFor<this>): P.ASTNumericLiteral {
    const { value, raw } = match
    return new P.ASTNumericLiteral(match, { value: assert.number(value), raw })
  }
}
core.addRule(numeric, {
  tests: [
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
})

////////////////
// ## `number_as_string` rule
//    e.g. "zero", -> 0
////////////////

/** `number` spelled out as a string, `zero` to `ten` -- `VALUE_MAP` does the word-to-number lookup. */
class number_as_string extends P.Pattern {
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
}
core.addRule(number_as_string, {
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
})

////////////////
// ## `boolean` rule (class `_boolean`)
//    e.g. "true", also accepts synonyms like "yes"/"ok"/"always"
////////////////

/**
 * Boolean literal -- also accepts common synonyms like `yes`/`no`, `ok`/`cancel`, `always`/`never`.
 * - Class named `_boolean`, not `boolean` -- `boolean` is a reserved TS type keyword.
 * - TODO: better name for this?  "flag"?  "truism"?
 */
class _boolean extends P.Pattern {
  static ruleName = "boolean"
  @proto static alias = "expression"
  @proto static datatype = "choice"
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
}
core.addRule(_boolean, {
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
})

////////////////
// ## `text` rule
//    e.g. '""'
////////////////

/**
 * Literal `text` string.
 * - NOTE: in spell you must use DOUBLE QUOTES (`"`) -- single quotes are treated as a single symbol.
 * - Returned value has original enclosing quotes.
 */
class text extends P.TokenType {
  @proto static alias = "expression"
  @proto static highlightAs: P.HighlightKind = "string"
  @proto static datatype = "text"
  @proto static tokenType = P.TextToken

  getAST(match: P.MatchFor<this>): P.ASTStringLiteral {
    const { value, raw } = match
    return new P.ASTStringLiteral(match, { value: assert.string(value), raw })
  }
}
core.addRule(text, {
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
})

////////////////
// ## `comment` rule
//    e.g. "//"
////////////////

/** Line comment token -- wraps a `CommentToken` into a `LineComment` AST node, e.g. `// foo`. */
class comment extends P.TokenType {
  @proto static tokenType = P.CommentToken
  @proto static highlightAs: P.HighlightKind = "comment"

  getAST(match: P.MatchFor<this>): P.ASTLineComment {
    const [token] = match.matched
    // `tokenType: CommentToken` guarantees the single matched token is a `CommentToken`.
    if (!(token instanceof P.CommentToken)) throw new TypeError("Expected a CommentToken")
    const { commentSymbol, initialWhitespace, value } = token
    return new P.ASTLineComment(match, { commentSymbol, initialWhitespace, value })
  }
}
core.addRule(comment, {
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
})

////////////////
// ## `undefined` rule (class `undefined_literal`)
//    e.g. "nothing"
////////////////

/**
 * `undefined` as an expression... ???
 * - Class named `undefined_literal`, not `undefined` -- `undefined` is a reserved word.
 */
class undefined_literal extends P.Literal {
  static ruleName = "undefined"
  @proto static alias = "expression"
  @proto static datatype = "nothing"

  getAST(match: P.MatchFor<this>): P.ASTUndefinedLiteral {
    return new P.ASTUndefinedLiteral(match)
  }
}
core.addRule(undefined_literal, {
  syntax: "(undefined|nothing)",
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["nothing", "undefined"],
        ["undefined", "undefined"]
      ]
    }
  ]
})

////////////////
// ## `keyword` rule
//    e.g. "abc"
////////////////

/**
 * Single alphanumeric word used as a keyword, e.g. in a method definition.
 * - Case is not a factor, but it must start with a letter.
 */
class keyword extends P.Pattern {
  @proto static pattern = /^[a-zA-Z][\w-]*$/

  /** Converts dashes to underscores when compiling, so `abc-def` outputs as valid JS identifier `abc_def`. */
  mapValue<T = string>(value: string): T {
    return `${value}`.replace(/-/g, "_") as T
  }

  getAST(match: P.MatchFor<this>): P.ASTKeywordLiteral {
    const { value, raw } = match
    return new P.ASTKeywordLiteral(match, { value: assert.string(value), raw })
  }
}
core.addRule(keyword, {
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
})
