import type { P } from "$/parser"

/**
 * `Token` -- root class for various specific `Token` classes.
 */
export class Token<ValueType = any, RecordType extends P.TokenProps<ValueType> = P.TokenProps<ValueType>> {
  /**
   * Immutable record of token properties.
   * - While this is technically public and read/write, only `Tokenizer` should write to it!
   */
  readonly record: RecordType

  /** Build a token by wrapping `record`. */
  constructor(record: RecordType) {
    this.record = record
  }

  /** Raw input string which was matched, generally NOT including leading/trailing whitespace. */
  get raw() {
    return this.record.raw
  }

  /** Whitespace string, between this token and the next in the stream. */
  get whitespace() {
    return this.record.whitespace
  }

  /** Start character position in stream. */
  get start() {
    return this.record.start
  }

  /** Length of the token -- number of characters consumed, INCLUDING whitespace. */
  get length() {
    return (this.raw?.length || 0) + (this.whitespace?.length || 0)
  }

  /** Character position just past our `raw` text (non-inclusive), NOT including trailing whitespace. */
  get end() {
    return this.start + (this.raw?.length || 0)
  }

  /** Character position where the next token starts:  `end` plus our trailing `whitespace`. */
  get next() {
    return this.start + this.length
  }

  /** `value` of this token. */
  get value(): ValueType {
    return this.record.value as ValueType
  }

  /** Error string encountered while parsing. */
  get error() {
    return this.record.error
  }

  /** Line number in original source string, appended after match. */
  get line() {
    return this.record.line
  }

  /** Start character in source `line`. */
  get ch() {
    return this.record.ch
  }

  /**
   * Do we match a `literal` value?
   * - If `literal` is an array, returns `true` if `value` is included in it.
   * - NOTE: not valid for all token types.
   */
  matchesLiteral(literal: string | string[]) {
    if (Array.isArray(literal)) return literal.includes(this.value as unknown as string)
    return this.value === literal
  }

  /**
   * Do we match a regular expression `pattern`?
   * - If `blacklist` is supplied, returns `false` if `value` is found in it.
   * - NOTE: valid for string types only.
   */
  matchesPattern(pattern: RegExp, blacklist?: P.IdentifierBlacklist) {
    if (typeof this.value !== "string") return false
    if (!pattern.test(this.value)) return false
    if (blacklist && blacklist[this.value]) return false
    return true
  }

  /** Return the string representation of this token, including whitespace at the end. */
  toString() {
    return (typeof this.raw === "string" ? this.raw : this.value) + (this.whitespace || "")
  }
}

/**
 * Base `whitespace` class for all whitespace variants.
 * - You'll generally create one of `InlineWhitespaceToken`, `IndentToken` or `NewlineToken` instead.
 * - `whitespace.value` is the actual whitespace string.
 */
export class WhitespaceToken extends Token<string> {
  /**
   * Return the "length" of this whitespace, eg for an indent.
   * - REFACTOR: this is overriding base `length` which includes whitespace.
   */
  get length() {
    return this.value.length
  }

  /** Whitespace IS our text, so `end` ~== `next`. */
  get end() {
    return this.start + this.length
  }
}

/** `IndentToken` -- a run of spaces/tabs that occurs at the beginning of a line. */
export class IndentToken extends WhitespaceToken {}

/** `InlineWhitespaceToken` -- a run of spaces/tabs that occurs in the middle of a line. */
export class InlineWhitespaceToken extends WhitespaceToken {}

/** `NewlineToken` class, a single "return" character. */
export class NewlineToken extends WhitespaceToken {
  /** Build a `NewlineToken` -- always represents a single `\n`, regardless of `record`. */
  constructor(record: P.TokenProps<string>) {
    super(record)
  }
  /** Always `"\n"`. */
  get raw() {
    return "\n"
  }
  /** Always `"\n"`. */
  get value() {
    return "\n"
  }
}

////////////////
// ## Word, Symbol, Text
////////////////

/**
 * Literal string class which refers to a alphanumeric word
 * - e.g. `hello`, `world`, `foo-bar`, `foo_bar_3`, etc.
 * - Note that the word MUST start with a letter.
 * - `literal.value` is the actual text matched.
 */
export class WordToken extends Token<string> {}

/**
 * Literal string class which refers to a single non-alphanumeric symbol
 *  - `literal.value` is the actual text matched.
 */
export class SymbolToken extends Token<string> {}

/**
 * `TextToken` class for a literal string, e.g. text inside quotes.
 *  - `text.value` is the original string, including outer quotes.
 *  - Use `text.innerText` to get just the bit inside the quotes.
 */
export class TextToken extends Token<string> {
  /** Text without surrounding quotes -- strips one leading/trailing quote char if present. */
  get innerText() {
    const string = this.value
    // calculate `text` as the bits between the quotes.
    let start = 0
    let end = string.length
    if (string[start] === '"' || string[start] === "'") start = 1
    if (string[end - 1] === '"' || string[end - 1] === "'") end = -1
    return string.slice(start, end)
  }
}

////////////////
// ## Numbers
////////////////

/**
 * Numeric token class
 *  - `number.value` is the actual number matched.
 *  - `number.raw` is the input string.
 */
export class NumberToken extends Token<number> {}

////////////////
// ## JSX expressions
////////////////

/** Possible token types for a JSX attribute's value. */
export type JSXAttributeValue = JSXExpressionToken | JSXTextToken | TextToken | NumberToken

/** Common superclass for all JSX tokens. */
export class JSXToken<
  ValueType = any,
  RecordType extends P.TokenProps<ValueType> = P.TokenProps<ValueType>
> extends Token<ValueType, RecordType> {}

/**
 * Token for a single JSX element:
 *  - `element.tagName` is the tag name
 *  - `element.attributes` is an array of `jsxAttribute` children
 *  - `element.children` is an array of child `jsxElement` instances.
 */
export class JSXElementToken extends JSXToken<never, JSXElementTokenProps> {
  /** Tag name. */
  get tagName() {
    return this.record.tagName
  }
  /** Array of attributes as `JSXAttributeTokens`. `undefined` if no attributes. */
  get attributes() {
    return this.record.attributes
  }
  /** Array of children as `JSXElementTokens`. `undefined` if no children. */
  get children() {
    return this.record.children
  }
  /** Does this represent a unary tag? */
  get isUnaryTag() {
    return this.record.isUnaryTag
  }
}
/** Extra `record` props for `JSXElementToken`. */
export type JSXElementTokenProps = Prettify<P.TokenProps<never>> & {
  /** Tag name. */
  tagName: string
  /** Does this represent a unary tag? */
  isUnaryTag?: boolean
  /** Array of attributes. */
  attributes?: JSXAttributeToken[]
  /** Array of children. */
  children?: JSXElementToken[]
}

/**
 * Token for a single JSX end tag.
 *  - `element.tagName` is the tag name.
 */
export class JSXEndTagToken extends JSXToken<never, JSXEndTagTokenProps> {
  /** Tag name. */
  get tagName() {
    return this.record.tagName
  }
}
/** Extra `record` props for `JSXEndTagToken`. */
export type JSXEndTagTokenProps = Prettify<P.TokenProps<never>> & {
  /** Tag name. */
  tagName: string
}

/**
 * Token for a single JSX attribute:
 *  - `attr.name` is the name of the attribute.
 *  - `attr.value` is the value of the attribute as... ???
 * - REFACTOR: type for `value`????
 */
export class JSXAttributeToken extends JSXToken<any, JSXAttributeTokenProps> {
  /** Attribute name. */
  get name() {
    return this.record.name
  }
}
/** Extra `record` props for `JSXAttributeToken`. */
export type JSXAttributeTokenProps = Prettify<P.TokenProps<JSXAttributeValue>> & {
  /** Attribute name. */
  name: string
}

/**
 * Loose text in the middle of a JSX block.
 * - `text.value` is the actual text matched (including whitespace).
 */
export class JSXTextToken extends JSXToken<string> {}

/** JSX expression, composed of inline tokens which should yield an `expression` or `statement`. */
export class JSXExpressionToken extends JSXToken<string, JSXExpressionTokenProps> {
  /**
   * Build a `JSXExpressionToken` from `record`.
   * - SIDE EFFECT: defaults `record.value` to `""` when falsy, so `value` is always a string.
   */
  constructor(record: JSXExpressionTokenProps) {
    super(record)
    if (!this.value) this.record.value = ""
  }
  /**
   * Contents of the expression -- usually raw string (including leading/trailing whitespace), but can also
   * be a `Token`, e.g. as set by `matchJSXAttributeValueIdentifier`.
   */
  get contents() {
    return this.record.contents
  }
  /**
   * Tokens a rule made by parsing `contents` later, moved to file positions -- see `SpellJSXContent.placeInFile()` in spell.
   * - `Tokenizer.forEachToken()` reaches them through here, so they move with us after an edit.
   */
  get innerTokens() {
    return this.record.innerTokens
  }
  set innerTokens(innerTokens: Token[] | undefined) {
    this.record.innerTokens = innerTokens
  }
}
/** Extra `record` props for `JSXExpressionToken`. */
export type JSXExpressionTokenProps = Prettify<P.TokenProps<string>> & {
  /**
   * Contents of the expression -- usually raw string (including leading/trailing whitespace), but can also
   * be a `Token`, e.g. as set by `matchJSXAttributeValueIdentifier`.
   */
  contents: string | Token
  /** See `JSXExpressionToken.innerTokens`. */
  innerTokens?: Token[]
}

////////////////
// ## Source Code -- Comment, Line, Block
////////////////

/**
 * `CommentToken` class for single-line comments.
 * - `comment.commentSymbol` is initial comment symbol, e.g. `"--"`, `"//"`, or a heading's `"#"`, `"##"` ...
 * - `comment.initialWhitespace` is whitespace BETWEEN comment symbol and comment text.
 * - `comment.value` is comment text (until end of line).
 */
export class CommentToken extends Token<string, CommentTokenProps> {
  /** Initial comment symbol, e.g.  `--`, `//`, `#`, `##` */
  get commentSymbol() {
    return this.record.commentSymbol
  }

  /** Whitespace between the comment symbol and the comment text. */
  get initialWhitespace() {
    return this.record.initialWhitespace
  }
}
/** Extra `record` props for `CommentToken`. */
export type CommentTokenProps = Prettify<P.TokenProps<string>> & {
  /** Initial comment symbol, e.g.  `--`, `//`, `#`, `##` */
  commentSymbol: string
  /** Whitespace between the comment symbol and the comment text. */
  initialWhitespace: string
}

// REFACTOR: multi-line comments?

/**
 * `LineToken` class for `Tokenizer.breakIntoLines()`.
 * - `.start` is line start offset in source.
 * - `.leading` (optional) is leading whitespace at start of line.
 * - `.tokens` is (possibly empty) array of tokens other than indent/newline.
 * - `.newline` (optional) is newline token AT END OF LINE.
 */
export class LineToken extends Token<string, LineTokenProps> {
  /** Leading whitespace at start of line. */
  get leading() {
    return this.record.leading
  }
  /** Indent level of the line. */
  get indent() {
    return this.record.indent
  }
  /** Array of tokens other than indent/newline. */
  get tokens() {
    return this.record.tokens
  }
  /** Newline token AT END OF LINE. */
  get newline() {
    return this.record.newline
  }

  /**
   * Same as `toString()`.
   * - REFACTOR: is this necessary?
   */
  get raw() {
    return this.toString()
  }

  /** Reconstruct source text for this line, including leading whitespace and trailing newline if present. */
  toString() {
    return (this.leading || "") + this.tokens.join("") + (this.newline ? "\n" : "")
  }
}
/** Extra `record` props for `LineToken`. */
export type LineTokenProps = Prettify<P.TokenProps<string>> & {
  /** Array of tokens other than indent/newline. */
  tokens: Token[]
  /** Indent level of the line. */
  indent: number
  /** Leading whitespace at start of line. */
  leading?: string
  /**
   * Newline token AT END OF LINE.
   * - REFACTOR: can this be `token.whitespace` instead?
   */
  newline?: NewlineToken
}

/**
 * `BlockToken` class for `Tokenizer.breakIntoIndentedBlocks()`.
 * - `.start` is block start offset char in source.
 * - `.tokens` is (possibly empty) array of `LineToken`s or `BlockToken`s.
 */
export class BlockToken extends Token<string, BlockTokenProps> {
  /** Array of tokens as `LineToken`s or `BlockToken`s. */
  get tokens() {
    return this.record.tokens
  }
  /** Indent level of the block. */
  get indent() {
    return this.record.indent
  }
  /** Same as `toString()`. */
  get raw() {
    return this.toString()
  }

  /** Reconstruct source text for this block by joining child lines/blocks with newlines. */
  toString() {
    return this.tokens.join("\n")
  }
}
/** Extra `record` props for `BlockToken`. */
export type BlockTokenProps = Prettify<P.TokenProps<string>> & {
  /** Array of tokens. */
  tokens: Array<LineToken | BlockToken>
  /** Indent level of the block. */
  indent: number
}
