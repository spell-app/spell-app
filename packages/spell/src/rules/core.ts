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
class EatWhitespace extends P.Repeat {
  @proto static datatype = "text"
}
core.addRule(EatWhitespace, {
  syntax: "{whitespace}*"
})

////////////////
// ## `whitespace` rule
//    e.g. " ", any whitespace token
////////////////

/** Any whitespace token -- space, tab, newline, etc., wrapped as-is into a `StringLiteral`. */
class Whitespace extends P.TokenType {
  @proto static datatype = "text"
  @proto static tokenType = P.WhitespaceToken

  getAST(match: P.MatchFor<this>): P.ASTStringLiteral {
    const { value, raw } = match
    return new P.ASTStringLiteral(match, { value: assert.string(value), raw })
  }
}
core.addRule(Whitespace)

////////////////
// ## `indent` rule
//    e.g. "    ", leading whitespace at start of a line
////////////////

/** Indent whitespace specifically, e.g. leading spaces/tabs at start of a line. */
class Indent extends P.TokenType {
  @proto static datatype = "text"
  @proto static tokenType = P.IndentToken

  getAST(match: P.MatchFor<this>): P.ASTStringLiteral {
    const { value, raw } = match
    return new P.ASTStringLiteral(match, { value: assert.string(value), raw })
  }
}
core.addRule(Indent)

////////////////
// ## `newline` rule
//    e.g. "\n"
////////////////

/** Single newline. */
class Newline extends P.TokenType {
  @proto static datatype = "text"
  @proto static tokenType = P.NewlineToken

  getAST(match: P.MatchFor<this>): P.ASTStringLiteral {
    const { value, raw } = match
    return new P.ASTStringLiteral(match, { value: assert.string(value), raw })
  }
}
core.addRule(Newline)

////////////////
// ## `inline_whitespace` rule
//    e.g. " ", between tokens on the same line
////////////////

/**
 * Inline whitespace only, e.g. spaces/tabs between tokens on same line.
 * - NOTE: normally filtered out when tokenizing, so this rule rarely matches in practice.
 */
class InlineWhitespace extends P.TokenType {
  @proto static datatype = "text"
  @proto static tokenType = P.InlineWhitespaceToken

  getAST(match: P.MatchFor<this>): P.ASTStringLiteral {
    const { value, raw } = match
    return new P.ASTStringLiteral(match, { value: assert.string(value), raw })
  }
}
core.addRule(InlineWhitespace)

////////////////////////////////////////
// # Simple types:  number, boolean, text (string), etc.
////////////////////////////////////////

////////////////
// ## `number` rule (class `NumberLiteral`)
//    e.g. "1"
////////////////

/**
 * `number` as a float or integer token.
 * - Class named `NumberLiteral`, not `Number`, which would hide javascript's `Number`.
 * - TODO:  `integer` and `decimal`?  too techy?
 */
class NumberLiteral extends P.TokenType {
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
core.addRule(NumberLiteral, {
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
class NumberAsString extends P.Pattern {
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
core.addRule(NumberAsString, {
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
// ## `boolean` rule (class `BooleanLiteral`)
//    e.g. "true", also accepts synonyms like "yes"/"ok"/"always"
////////////////

/**
 * Boolean literal -- also accepts common synonyms like `yes`/`no`, `ok`/`cancel`, `always`/`never`.
 * - Class named `BooleanLiteral`, not `Boolean`, which would hide javascript's `Boolean`.
 * - TODO: better name for this?  "flag"?  "truism"?
 */
class BooleanLiteral extends P.Pattern {
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
core.addRule(BooleanLiteral, {
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
// ## `text` rule (class `TextLiteral`)
//    e.g. '""'
////////////////

/**
 * Literal `text` string.
 * - NOTE: in spell you must use DOUBLE QUOTES (`"`) -- single quotes are treated as a single symbol.
 * - Its AST is a text value:  the text inside the quotes, with the source's spelling, quotes and all, as `raw`.
 * - Class named `TextLiteral`, not `Text`, which would hide the DOM's `Text`.
 */
class TextLiteral extends P.TokenType<never, { fillIns?: FillInParts }> {
  static ruleName = "text"
  @proto static alias = "expression"
  @proto static highlightAs: P.HighlightKind = "string"
  @proto static datatype = "text"
  @proto static tokenType = P.TextToken

  /**
   * Match -- and parse any `[name]` fill-ins inside, e.g. `"images/[rank]-of-[suit].png"` (plan doc
   * `outline-spell`, P4;  Q2:  brackets, always) -- see `parseFillIns()`.
   * - A fill-in which doesn't parse:  no match, so the line says "Don't understand".
   */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    const [token] = tokens
    if (!match || !(token instanceof P.TextToken)) return match
    const fillIns = parseFillIns(scope, token.innerText)
    if (fillIns === null) return undefined
    if (fillIns) match.data.fillIns = fillIns
    return match
  }

  getAST(match: P.MatchFor<this>): P.ASTStringLiteral | P.ASTTemplateString {
    if (match.data.fillIns) return fillInsAST(match, match.data.fillIns)
    const raw = assert.string(match.value)
    return new P.ASTStringLiteral(match, {
      value: TextLiteral.plainText(raw, match.matched[0] as P.TextToken),
      quote: '"',
      raw
    })
  }

  /** The text `raw` spells, escapes undone (`"say \"hi\""` => `say "hi"`) where JSON can read it, else as typed. */
  static plainText(raw: string, token: P.TextToken): string {
    try {
      return JSON.parse(raw) as string
    } catch {
      return token.innerText
    }
  }
}
core.addRule(TextLiteral, {
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
    },
    {
      title: "values inside:  [name] fills in;  [[ and \\[ are a real [",
      beforeEach(scope: P.Scope) {
        ;(scope as P.BlockScope).variables.add("rank")
        ;(scope as P.BlockScope).variables.add("suit")
      },
      tests: [
        ['"images/[rank]-of-[suit].png"', "`images/${rank}-of-${suit}.png`"],
        ['"[rank + 1] cards"', "`${(rank + 1)} cards`"],
        ['"[[draft]] or \\[draft]"', "`[draft] or [draft]`"],
        ['"a `tick` and ${x}"', '"a `tick` and ${x}"'],
        ['"`[rank]` ${x}"', "`\\`${rank}\\` \\${x}`"],
        ['"[no such thing here]"', undefined]
      ]
    }
  ]
})

////////////////
// ## Fill-ins:  `"images/[rank]-of-[suit].png"`
////////////////

/**
 * Text with fill-ins, split up:  each plain piece (as written, its escapes kept) or a fill-in's parsed match.
 * - Shared by `text` and the JSX text rule:  `SpellJSXText`.
 */
export type FillInParts = Array<string | P.Match>

/**
 * `inner`, the text between a string's quotes, split into plain pieces and parsed `[...]` fill-ins
 * (plan doc `outline-spell`, P4):
 * - `[x]`:  `x` is an expression, e.g. `[rank + 1]`;  inside a method, a bare property name is the thing's,
 *   `[rank]` ~== `[its rank]`
 * - a real bracket:  `[[` or `\[` for `[`, `]]` for `]` (Q15:  both)
 * - `undefined`:  no brackets at all, the text stays as written;  `null`:  a fill-in that doesn't parse
 * - Parses each fill-in on its own, so a fill-in's tokens don't map back onto the file:  no hover inside, yet.
 */
export function parseFillIns(scope: P.Scope, inner: string): FillInParts | undefined | null {
  if (!/[[\]]/.test(inner)) return undefined
  const parts: FillInParts = []
  let plain = ""
  for (let index = 0; index < inner.length; index++) {
    const char = inner[index]!
    const next = inner[index + 1]
    if (char === "\\" && next === "[") {
      plain += "["
      index++
    } else if ((char === "[" && next === "[") || (char === "]" && next === "]")) {
      plain += char
      index++
    } else if (char === "[") {
      const end = inner.indexOf("]", index + 1)
      if (end < 0) return null
      const fillIn = parseFillIn(scope, inner.slice(index + 1, end).trim())
      if (!fillIn) return null
      if (plain) parts.push(plain)
      parts.push(fillIn)
      plain = ""
      index = end
    } else {
      plain += char
    }
  }
  if (plain) parts.push(plain)
  return parts
}

/**
 * One fill-in's words, parsed as an expression -- `its <words>` if they're a property of `it`'s type,
 * e.g. `[rank]` in a card's getter.  `undefined` if it doesn't parse, whole.
 */
function parseFillIn(scope: P.Scope, words: string): P.Match | undefined {
  if (!words) return undefined
  const itType = scope.getType(scope.variables?.get("it")?.datatype)
  const source = itType?.getMember(words) ? `its ${words}` : words
  const match = scope.parse(source, "expression")
  return match && match.inputText.trim() === source ? match : undefined
}

/** The AST of text with fill-ins:  a javascript template string -- see `P.ASTTemplateString`. */
export function fillInsAST(match: P.Match, parts: FillInParts): P.ASTTemplateString {
  return new P.ASTTemplateString(match, {
    parts: parts.map((part) => (typeof part === "string" ? part : P.matchAST<P.ASTExpression>(part)))
  })
}

////////////////
// ## `comment` rule
//    e.g. "//"
////////////////

/**
 * Line comment token -- wraps a `CommentToken` into a `LineComment` AST node, e.g. `// foo`.
 * - Class named `CommentLine`, not `Comment`, which would hide the DOM's `Comment`.
 */
class CommentLine extends P.TokenType {
  static ruleName = "comment"
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
core.addRule(CommentLine, {
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
// ## `undefined` rule (class `UndefinedLiteral`)
//    e.g. "nothing"
////////////////

/**
 * `undefined` as an expression... ???
 * - Class named `UndefinedLiteral`, so `static ruleName` gives the rule its name:  `undefined` is a reserved word.
 */
class UndefinedLiteral extends P.Literal {
  static ruleName = "undefined"
  @proto static alias = "expression"
  @proto static datatype = "nothing"

  getAST(match: P.MatchFor<this>): P.ASTNothingLiteral {
    return new P.ASTNothingLiteral(match)
  }
}
core.addRule(UndefinedLiteral, {
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
// ## `keyword` rule (class `KeywordRule`)
//    e.g. "abc"
////////////////

/**
 * Single alphanumeric word used as a keyword, e.g. in a method definition.
 * - Case is not a factor, but it must start with a letter.
 * - Class named `KeywordRule`, not `Keyword`, which would read as the parser's `P.Keyword`.
 */
class KeywordRule extends P.Pattern {
  static ruleName = "keyword"
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
core.addRule(KeywordRule, {
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
