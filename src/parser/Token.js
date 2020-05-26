// Base, abstract token class.
// This is also the root of various token types.
//
// All subtypes are initialized with a map of `props`
//  and should at least have:
//  - `token.value` type-specific value in a way that's convenient for parsing to deal with.
//  - `token.raw`   raw text string that was matched
//  - `token.offset` start character index in the source string.
export class Token {
  constructor(props) {
    Object.assign(this, props)
  }

  get start() {
    return this.offset
  }

  get end() {
    return this.offset + (this.raw?.length || 0)
  }

  // Do we match a `literal` value?
  // If `literal` is an array, we'll return true if our `value` is included in the array.
  // NOTE: not valid for all token types.
  matchesLiteral(literal) {
    if (Array.isArray(literal)) return literal.includes(this.value)
    return this.value === literal
  }

  // Do we match a regular expression `pattern`?
  // If `blacklist` is supplied, we'll return `false` if value is found in blacklist.
  // NOTE: valid for string types only.
  matchesPattern(pattern, blacklist) {
    if (typeof this.value !== "string") return false
    if (!pattern.test(this.value)) return false
    if (blacklist && blacklist[this.value]) return false
    return true
  }

  toString() {
    return (typeof this.raw === "string" ? this.raw : this.value) + (this.whitespace || "")
  }
}

// Base `whitespace` class for all whitespace variants.
// You'll generally create one of `Token.InlineWhitespace`, `Token.Indent` or `Token.Indent` instead.
//  `whitespace.value` is the actual whitespace string.
Token.Whitespace = class whitespace extends Token {
  // Return the "length" of this whitespace, eg for an indent.
  get length() {
    return this.value.length
  }
}

// Inline whitespace class.
Token.InlineWhitespace = class inlineWhitespace extends Token.Whitespace {}

// `indent` class.
Token.Indent = class indent extends Token.Whitespace {}

// `newline` class, value is always a single return.
Token.Newline = class newline extends Token.Whitespace {}
Token.Newline.prototype.value = "\n"
Token.Newline.prototype.raw = "\n"

// Literal string class which refers to a alphanumeric word
//  - `literal.value` is the actual text matched.
Token.Word = class word extends Token {}

// Literal string class which refers to a single non-alphanumeric symbol
//  - `literal.value` is the actual text matched.
Token.Symbol = class symbol extends Token {}

// Numeric token class
//  - `number.value` is the actual number matched.
//  - `number.input` is the input string.
Token.Number = class number extends Token {}

// `Text` class for string literals.
//  - `text.value` is the original string, including outer quotes.
// Use `text.innerText` to get just the bit inside the quotes.
Token.Text = class text extends Token {
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

// Comment class for single-line comments.
//  - `comment.commentSymbol` is the initial comment symbol, one of:  "--", "//", "##"
//  - `comment.initialWhitespace` is whitespace BETWEEN the comment symbol and the comment text.
//  - `comment.value` is the comment text (until the end of the line).
Token.Comment = class comment extends Token {}

// JSX element class
//  `element.tagName` is the tag name
//  `element.attributes` is an array of `jsxAttribute` children
//  `element.children` is an array of child `jsxElement` instances.
Token.JSXElement = class jsxElement extends Token {}

// JSX end tag.
// `element.tagName` is the tag name.
Token.JSXEndTag = class jsxEndTag extends Token {}

// JSX attribute class
// `attr.name` is the name of the attribute.
// `attr.value` is one of... TODOC
Token.JSXAttribute = class jsxAttribute extends Token {}

// Loose text in the middle of a JSX block
// `text.value` is the actual text matched (including whitespace).
Token.JSXText = class jsxText extends Token {
  // TODO: escape quotes!
  get quotedText() {
    const trimmed = this.value.trim()
    if (!trimmed) return undefined
    return `"${trimmed}"`
  }
}

// JSX expression, composed of inline tokens which should yield an `expression`.
Token.JSXExpression = class jsxExpression extends Token {
  constructor(props) {
    super(props)
    if (!this.value) this.value = ""
  }
}

// Simple `line` class for `breakIntoLines`
//  `.offset` is line start offset in source
//  `.end` is end position of last token in line (newline or EOF)
//  `.leading` (optional) is leading whitespace at start of line
//  `.tokens` is (possibly empty) array of tokens other than indent/newline
//  `.newline` (optional) is newline token AT END OF LINE
Token.Line = class line extends Token {
  constructor(props) {
    super(props)
    if (!this.tokens) this.tokens = []
  }

  get raw() {
    return this.toString()
  }

  toString() {
    return (this.leading || "") + this.tokens.join("") + (this.newLine ? "\n" : "")
  }
}

// Simple block class for `breakIntoBlocks`.
Token.Block = class block extends Token {
  constructor(props) {
    super(props)
    if (!this.contents) this.contents = []
  }

  get raw() {
    return this.toString()
  }

  toString() {
    return this.contents.join("\n")
  }
}
