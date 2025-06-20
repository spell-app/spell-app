import type { IdentifierBlacklist, Prettify } from "../types"

/**
 * Generic `Token` record.
 * Some subclasses will have additional properties.
 */
export type TokenRecord<ValueType = any> = {
  /** Start character position in full source stream. */
  offset: number
  /** Raw input string which was matched, generally NOT including leading/trailing whitespace. */
  raw?: string
  /** Whitespace string which was matched between this token and the next in the stream. */
  whitespace?: string
  /** Line number in original source string, appended after match. */
  line?: number
  /** Start character in source `line`. */
  ch?: number
  /** Conceptual "value" of the token, according to the subclass. e.g. a number, string without quotes, etc. */
  value?: ValueType
  /** Error string encountered while parsing. */
  error?: string
}

/**
 * `Token` -- root class for various specific `Token` classes.
 */
export class Token<ValueType = any, TRT extends TokenRecord<ValueType> = TokenRecord<ValueType>> {
  /**
   * Record of token properties.
   * - While this is technically public and read/write, only `Tokenizer` should write to it!
   */
  readonly record: TRT

  constructor(record: TRT) {
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
  get offset() {
    return this.record.offset
  }

  /** Start character position in stream. */
  // REFACTOR: why do we have both `start` and `offset`?
  get start() {
    return this.offset
  }

  /** Length of the token -- number of characters consumed, INCLUDING whitespace. */
  get length() {
    return (this.raw?.length || 0) + (this.whitespace?.length || 0)
  }

  /** End character position in stream (non-inclusive), INCLUDING whitespace. */
  get end() {
    return this.offset + this.length
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

  /** Do we match a `literal` value?
   * If `literal` is an array, we'll return true if our `value` is included in the array.
   * NOTE: not valid for all token types.
   */
  matchesLiteral(literal: string | string[]) {
    if (Array.isArray(literal)) return literal.includes(this.value as unknown as string)
    return this.value === literal
  }

  /** Do we match a regular expression `pattern`?
   * If `blacklist` is supplied, we'll return `false` if value is found in blacklist.
   * NOTE: valid for string types only.
   */
  matchesPattern(pattern: RegExp, blacklist?: IdentifierBlacklist) {
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
 * You'll generally create one of `Token.InlineWhitespace`, `Token.Indent` or `Token.Newline` instead.
 *  `whitespace.value` is the actual whitespace string.
 */
export class Whitespace extends Token<string> {
  /** Return the "length" of this whitespace, eg for an indent. */
  // REFACTOR: this is overriding base `length` which includes whitespace.
  get length() {
    return this.value.length
  }
}

/** `Indent` token -- a run of spaces/tabs that occurs at the beginning of a line. */
export class Indent extends Whitespace {}

/** `InlineWhitespace` token -- a run of spaces/tabs that occurs in the middle of a line. */
export class InlineWhitespace extends Whitespace {}

/** `Newline` class, a single "return" character. */
export class Newline extends Whitespace {
  constructor(record: TokenRecord<string>) {
    super(record)
  }
  get raw() {
    return "\n"
  }
  get value() {
    return "\n"
  }
}

//////////////////////
//  ### Word, Symbol, Text
//////////////////////

/**
 * Literal string class which refers to a alphanumeric word
 * - e.g. `hello`, `world`, `foo-bar`, `foo_bar_3`, etc.
 * - Note that the word MUST start with a letter.
 * - `literal.value` is the actual text matched.
 */
export class Word extends Token<string> {}

/**
 * Literal string class which refers to a single non-alphanumeric symbol
 *  - `literal.value` is the actual text matched.
 */
export class Symbol extends Token<string> {}

/**
 * `Text` class for a literal string, e.g. text inside quotes.
 *  - `text.value` is the original string, including outer quotes.
 *  - Use `text.innerText` to get just the bit inside the quotes.
 */
export class Text extends Token<string> {
  get innerText() {
    const string = this.value
    /** calculate `text` as the bits between the quotes. */
    let start = 0
    let end = string.length
    if (string[start] === '"' || string[start] === "'") start = 1
    if (string[end - 1] === '"' || string[end - 1] === "'") end = -1
    return string.slice(start, end)
  }
}

//////////////////////
//  ### Numbers
//////////////////////

/**
 * Numeric token class
 *  - `number.value` is the actual number matched.
 *  - `number.raw` is the input string.
 */
export class Number extends Token<number> {}

//////////////////
//  ### JSX expressions
//////////////////

/** Common superclass for all JSX tokens. */
export class JSXToken<ValueType = any, TRT extends TokenRecord<ValueType> = TokenRecord<ValueType>> extends Token<
  ValueType,
  TRT
> {}

/**
 * Token for a single JSX element:
 *  - `element.tagName` is the tag name
 *  - `element.attributes` is an array of `jsxAttribute` children
 *  - `element.children` is an array of child `jsxElement` instances.
 */
export class JSXElement extends JSXToken<never, JSXElementTokenRecord> {
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
export type JSXElementTokenRecord = Prettify<TokenRecord<never>> & {
  /** Tag name. */
  tagName: string
  /** Does this represent a unary tag? */
  isUnaryTag?: boolean
  /** Array of attributes. */
  attributes?: JSXAttribute[]
  /** Array of children. */
  children?: JSXElement[]
}

/**
 * Token for a single JSX end tag.
 *  - `element.tagName` is the tag name.
 */
export class JSXEndTag extends JSXToken<never, JSXEndTagTokenRecord> {
  /** Tag name. */
  get tagName() {
    return this.record.tagName
  }
}
export type JSXEndTagTokenRecord = Prettify<TokenRecord<never>> & {
  /** Tag name. */
  tagName: string
}

/**
 * Token for a single JSX attribute:
 *  - `attr.name` is the name of the attribute.
 *  - `attr.value` is the value of the attribute as... ???
 */
// REFACTOR: type for `value`????
export class JSXAttribute extends JSXToken<any, JSXAttributeTokenRecord> {
  /** Attribute name. */
  get name() {
    return this.record.name
  }
}
export type JSXAttributeTokenRecord = Prettify<TokenRecord<JSXAttributeValue>> & {
  /** Attribute name. */
  name: string
}
export type JSXAttributeValue = JSXExpression | JSXText | Text | Number

/** Loose text in the middle of a JSX block
 * `text.value` is the actual text matched (including whitespace).
 */
export class JSXText extends JSXToken<string> {
  /** TODO: escape quotes! */
  get quotedText() {
    const trimmed = this.value.trim()
    if (!trimmed) return undefined
    return `"${trimmed}"`
  }
}

/** JSX expression, composed of inline tokens which should yield an `expression` or `statement`. */
// DOCME
export class JSXExpression extends JSXToken<string, JSXExpressionTokenRecord> {
  constructor(record: JSXExpressionTokenRecord) {
    super(record)
    if (!this.value) this.record.value = ""
  }
  /** Contents of the expression as string, including leading/trailing whitespace. */
  get contents() {
    return this.record.contents
  }
}
export type JSXExpressionTokenRecord = Prettify<TokenRecord<string>> & {
  /** Contents of the expression as string, including leading/trailing whitespace. */
  contents: string | Token
}

//////////////////
//  ### Source Code - Comment, Line, Block
//////////////////

/** Comment class for single-line comments.
 *  - `comment.commentSymbol` is the initial comment symbol, one of:  "--", "//", "##"
 *  - `comment.initialWhitespace` is whitespace BETWEEN the comment symbol and the comment text.
 *  - `comment.value` is the comment text (until the end of the line).
 */
export class Comment extends Token<string, CommentTokenRecord> {
  /** Initial comment symbol, e.g.  `--`, `//`, `##` */
  get commentSymbol() {
    return this.record.commentSymbol
  }

  /** Whitespace between the comment symbol and the comment text. */
  get initialWhitespace() {
    return this.record.initialWhitespace
  }
}
export type CommentTokenRecord = Prettify<TokenRecord<string>> & {
  /** Initial comment symbol, e.g.  `--`, `//`, `##` */
  commentSymbol: string
  /** Whitespace between the comment symbol and the comment text. */
  initialWhitespace: string
}

// REFACTOR: multi-line comments?

/** `Line` class for `Tokenizer.breakIntoLines()`
 *  - `.offset` is line start offset in source
 *  - `.leading` (optional) is leading whitespace at start of line
 *  - `.tokens` is (possibly empty) array of tokens other than indent/newline
 *  - `.newline` (optional) is newline token AT END OF LINE
 */
export class Line extends Token<string, LineTokenRecord> {
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

  // REFACTOR: is this necessary?
  get raw() {
    return this.toString()
  }

  toString() {
    return (this.leading || "") + this.tokens.join("") + (this.newline ? "\n" : "")
  }
}
export type LineTokenRecord = Prettify<TokenRecord<string>> & {
  /** Array of tokens other than indent/newline. */
  tokens: Token[]
  /** Indent level of the line. */
  indent: number
  /** Leading whitespace at start of line. */
  leading?: string
  /** Newline token AT END OF LINE. */
  // REFACTOR: can this be `token.whitespace` instead?
  newline?: Newline
}

/**
 * Block class for `Tokenizer.breakIntoIndentedBlocks()`.
 *  `.offset` is block start offset chart in source
 *  `.tokens` is (possibly empty) array of `Token.Line`s or `Token.Block`s.
 */
export class Block extends Token<string, BlockTokenRecord> {
  /** Array of tokens as `LineToken`s or `BlockToken`s. */
  get tokens() {
    return this.record.tokens
  }
  /** Indent level of the block. */
  get indent() {
    return this.record.indent
  }
  get raw() {
    return this.toString()
  }

  toString() {
    return this.tokens.join("\n")
  }
}
export type BlockTokenRecord = Prettify<TokenRecord<string>> & {
  /** Array of tokens. */
  tokens: Array<Line | Block>
  /** Indent level of the block. */
  indent: number
}
