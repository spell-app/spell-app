import { Logger } from "$/util/spell/Logger"
import { P } from "$/parser"

/**
 * Tokenizer class for parsing text into a stream of tokens.
 * - TODO: error checking / reporting, especially in JSX expressions.
 * - TODO: have normal `tokenize` stick whitespace elements in the stream, then `tokenizeLines()` takes them out?
 */
export class Tokenizer {
  /** Build a `Tokenizer`, copying any `props` (e.g. `whitespacePolicy`, `quoteSymbols`) onto `this`. */
  constructor(props: TokenizerProps = {}) {
    Object.assign(this, props)
  }

  /** Leave all whitespace by default. */
  whitespacePolicy: P.WhitespacePolicy = P.WhitespacePolicy.ALL

  /**
   * Quote symbols recognized by `matchText`.
   * - REFACTOR: backtick?  left/right quotes, e.g. `""` and `''`?
   */
  quoteSymbols = [P.DOUBLE_QUOTE, P.SINGLE_QUOTE] as const

  /** Debug logger. */
  logger = new Logger({ prefix: "tokenizer", level: Logger.ERROR })

  /**
   * Read `¬` as `\n` and `∆` as `\t` in `tokenize()`:  stand-ins that keep test fixtures compact.
   * - `false` where they are real characters, e.g. `RulexTokenizer`.
   */
  rewriteFixtureChars = true

  /**
   * Tokenize `text` between `start` and `end` into an array of `Token`s.
   * - NOTE: `¬` and `∆` are treated as stand-ins for `\n` and `\t` -- see `rewriteFixtureChars`.
   */
  tokenize = (text: string, start = 0, end?: number) => {
    // Replace `¬` with `\n` and `∆` with `\t`.
    // We use these to see tabs and returns in debugging output more easily.
    if (this.rewriteFixtureChars) text = text.replace(/¬/g, "\n").replace(/∆/g, "\t")

    // Make sure `end` is a number within the text length.
    if (typeof end !== "number" || end > text.length) end = text.length
    // quick return out of range or only whitespace
    if (start >= end || !text.trim()) return []

    // Process our top-level rules.
    const tokens = this.consume(this.matchTopTokens, text, start, end)
    if (!tokens || tokens.length === 0) return []

    const lastEnd = tokens[tokens.length - 1].next
    if (lastEnd !== end) {
      this.logger.warn("tokenize(): didn't consume: `", text.slice(start, end), "`")
    }

    // Set `line` and `ch`(ar), which is sometimes more useful than the raw `start` offset within the file.
    this.setPositions(tokens, text)

    // Return tokens filtered according to our whitespace policy
    switch (this.whitespacePolicy) {
      case P.WhitespacePolicy.NONE:
        return this.filterWhitespace(tokens, P.WhitespaceToken)
      case P.WhitespacePolicy.LEADING_ONLY:
        return this.filterWhitespace(tokens, P.InlineWhitespaceToken)
      default:
        return tokens
    }
  }

  /**
   * Set `line` / `ch` on `tokens` and every token nested in them, worked out from each `start` in `text`.
   * - Counts EVERY `\n` in `text`, so multi-line JSX / strings don't throw later lines off.
   * - NOTE: each `start` must be absolute within `text`, even when tokenizing from part way through it.
   * - SIDE EFFECT: writes `record.line` / `record.ch`.
   */
  setPositions(tokens: P.Token[], text: string) {
    const lineStarts = P.getLineStarts(text)
    Tokenizer.forEachToken(tokens, (token) => {
      const { line, ch } = P.positionForOffset(lineStarts, token.start)
      token.record.line = line
      token.record.ch = ch
    })
  }

  /**
   * Move `tokens` and every token nested in them by `delta` characters, then re-work-out their `line` / `ch`
   * in `text` -- for tokens we're keeping after an edit earlier in the text.
   * - SIDE EFFECT: writes `record.start` / `record.line` / `record.ch`.
   */
  moveTokens(tokens: P.Token[], delta: number, text: string) {
    Tokenizer.shiftTokens(tokens, delta)
    this.setPositions(tokens, text)
  }

  /**
   * Move `tokens` and every token nested in them by `delta` characters -- `start` ONLY.
   * - `line` / `ch` are left as they were.
   * - For tokens parsed from a copy of some text, to put them where that text sits in the file.
   * - SIDE EFFECT: writes `record.start`.
   */
  static shiftTokens(tokens: P.Token[], delta: number) {
    if (delta) Tokenizer.forEachToken(tokens, (token) => (token.record.start += delta))
  }

  /**
   * Call `callback` for each of `tokens` and every token nested inside them, parents first:
   * - `LineToken` tokens + its `newline`
   * - `BlockToken` lines / blocks
   * - JSX element attributes + children, attribute values, expression `contents` when it's a token
   * - JSX expression `innerTokens`, once a rule has parsed its `{...}` contents
   */
  static forEachToken(tokens: P.Token[], callback: (token: P.Token) => void) {
    tokens.forEach(visit)

    /** `callback` for `token`, then recurse into anything nested inside it.  Ignores non-tokens. */
    function visit(token: unknown) {
      if (!(token instanceof P.Token)) return
      callback(token)
      if (token instanceof P.LineToken) {
        token.tokens.forEach(visit)
        visit(token.newline)
      } else if (token instanceof P.BlockToken) {
        token.tokens.forEach(visit)
      } else if (token instanceof P.JSXElementToken) {
        token.attributes?.forEach(visit)
        token.children?.forEach(visit)
      } else if (token instanceof P.JSXAttributeToken) {
        visit(token.value)
      } else if (token instanceof P.JSXExpressionToken) {
        visit(token.contents)
        token.innerTokens?.forEach(visit)
      }
    }
  }

  /**
   * Join `tokens` back into their source form.
   * - Pass `start` and `end` to restrict to a subset of `tokens`.
   * - NOTE: we `trim()` the result, which is generally what's desired.
   */
  static join(tokens: P.Token[], start = 0, end = tokens.length) {
    if (start !== 0 || end !== tokens.length) tokens = tokens.slice(start, end)
    return tokens.join("").trim()
  }

  /**
   * Filter whitespace tokens of the specified type from `tokens`.
   * - Note that we add whitespace filtered out to `token.whitespace` of the PREVIOUS token.
   *   This allows us to reconstruct the stream exactly by just looking at the filtered tokens.
   * - NOTE: filtered whitespace tokens at the start will be lost.
   */
  filterWhitespace(tokens: P.Token[], whitespaceType: typeof P.WhitespaceToken) {
    const results = []
    for (let i = 0, token; (token = tokens[i]); i++) {
      if (token instanceof whitespaceType) {
        const previous = tokens[i - 1]
        if (previous) previous.record.whitespace = (previous.record.whitespace || "") + token.value
      } else {
        results.push(token)
      }
    }
    return results
  }

  /**
   * Repeatedly execute a `method` (bound to `this) which returns a `[result, nextStart]` or `undefined`.
   * Places matched results together in `results` array and returns `[results, nextStart]` for the entire set.
   * Stops if `method` doesn't return anything, or if calling `method` is unproductive.
   */
  consume<T extends P.Token = P.Token>(
    method: P.TokenMatcher<T>,
    text: string,
    start = 0,
    end?: number,
    results: T[] = []
  ): T[] | undefined {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    // process rules repeatedly until we get to the end
    let nextStart = start
    while (nextStart < end) {
      const token = method.call(this, text, nextStart, end)
      if (!token) break
      results.push(token)

      if (token.next === nextStart) {
        this.logger.warn("error: got token but didn't advance in stream")
        break
      }
      nextStart = token.next
    }
    return results
  }

  /** Match a single top-level token at `start` of `text`.  */
  matchTopTokens(text: string, start?: number, end?: number) {
    return (
      this.matchWhitespace(text, start, end) ||
      this.matchWord(text, start, end) ||
      this.matchNumber(text, start, end) ||
      this.matchNewline(text, start, end) ||
      this.matchJSXElement(text, start, end) ||
      this.matchText(text, start, end) ||
      this.matchComment(text, start, end) ||
      this.matchSymbol(text, start, end)
    )
  }

  ////////////////
  // ## Whitespace
  ////////////////

  /**
   * Convert a run of spaces and/or tabs into:
   * - an `IndentToken` if it occurs at the begining of `text` or after a newline, or
   * - an `InlineWhitespaceToken` if it occurs in the middle of a line.
   */
  matchWhitespace = (text: string, start = 0, end?: number): P.IndentToken | P.InlineWhitespaceToken | undefined => {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    const whitespaceEnd = this.eatWhitespace(text, start, end)
    // forget it if no forward motion
    if (whitespaceEnd === start) return undefined

    const value = text.slice(start, whitespaceEnd)
    const props = {
      value,
      raw: value,
      start
    }
    // if at start of text or after a newline, return an `IndentToken`
    if (start === 0 || text[start - 1] === "\n") return new P.IndentToken(props)
    // otherwise, return an `InlineWhitespaceToken`
    return new P.InlineWhitespaceToken(props)
  }

  /**
   * Match a single newline character at `start` of `text`, as `NewlineToken`.
   * - NOTE: this assumes we're in utf-8 mode, so `\n` is a single character.
   */
  matchNewline = (text: string, start = 0, end?: number): P.NewlineToken | undefined => {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end || text[start] !== "\n") return undefined
    return new P.NewlineToken({ start })
  }

  ////////////////
  // ## Word / Symbol / Text
  ////////////////

  /** Regex matching first character allowed to start a `WordToken` -- ASCII letters only. */
  get WORD_START() {
    return /[A-Za-z]/
  }
  /** Regex matching subsequent `WordToken` characters -- letters, digits, `_` or `-`. */
  get WORD_CHAR() {
    return /^[\w_-]/
  }

  /**
   * Match a single `word` at `start` of `text` at character `start`, as `WordToken`.
   * - e.g. `hello`, `_world`, `foo-bar`, `foo_bar_3`, etc.
   */
  matchWord = (text: string, start = 0, end?: number): P.WordToken | undefined => {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    // Make sure we start with a letter or underscore.
    if (!this.WORD_START.test(text[start])) return undefined

    let wordEnd = start + 1
    while (wordEnd < end && this.WORD_CHAR.test(text[wordEnd])) {
      wordEnd++
    }
    if (wordEnd === start) return undefined

    const value = text.slice(start, wordEnd)
    return new P.WordToken({ value, raw: value, start })
  }

  /**
   * Match a single "symbol" character at `start` of `text`, as `SymbolToken`.
   * - NOTE: This does not do any checking, it just blindly uses the character in question.
   * - You should make sure all other possible rules have been exhausted first.
   */
  matchSymbol = (text: string, start = 0, end?: number): P.SymbolToken | undefined => {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined
    const value = text[start]
    return new P.SymbolToken({
      value,
      raw: value,
      start
    })
  }

  /**
   * Match a quoted text literal string at `start` of `text`, as `TextToken`.
   * - e.g. `"hello"`, `'hello world'`, `"text \" with escaped quotes"`, etc.
   * - TESTME:  not sure the escaping logic is really right...
   */
  matchText = (text: string, start = 0, end?: number): P.TextToken | undefined => {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    // REFACTOR: handle backticks, curly quotes, etc.
    const quoteSymbol = text[start]
    if (!this.quoteSymbols.includes(quoteSymbol as any)) return undefined

    let textEnd = start + 1
    while (textEnd < end) {
      const char = text[textEnd]
      if (char === quoteSymbol) break
      // if we get a backslash, consume next char if it's the same quote symbol
      if (char === P.BACKSLASH && text[textEnd + 1] === quoteSymbol) textEnd++
      textEnd++
    }
    // Forget it if we didn't end with the quote symbol
    if (text[textEnd] !== quoteSymbol) return undefined
    // advance past end quote
    textEnd++

    // Value includes the quotes, use `innerText` to get the actual text.
    const value = text.slice(start, textEnd)
    return new P.TextToken({
      value,
      raw: value,
      start
    })
  }

  ////////////////
  // ## Numbers
  ////////////////

  /** Regex testing whether a character could begin a `NumberToken` -- digit, `-` or `.`. */
  get NUMBER_START() {
    return /[0-9-.]/
  }

  /** Regex matching a `NumberToken` literal at head of string -- optional leading `-`, optional decimal point. */
  get NUMBER() {
    return /^-?([0-9]*\.)?[0-9]+/
  }

  /** Match a single number at `start` of `text`, as a `NumberToken`. */
  matchNumber = (text: string, start = 0, end?: number): P.NumberToken | undefined => {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    if (!this.NUMBER_START.test(text[start])) return undefined

    const numberMatch = this.matchExpressionAtHead(this.NUMBER, text, start, end)
    if (!numberMatch) return undefined

    const input = numberMatch[0]
    const value = parseFloat(input)
    return new P.NumberToken({
      value,
      raw: input,
      start
    })
  }

  ////////////////
  // ## JSX expressions
  ////////////////

  /**
   * Regex matching JSX opening tag head: `<TagName` plus either self-close `/>`, plain `>`, or trailing
   * whitespace before attributes.
   * - Capture groups: tag name, then end bit (`/>`, `>` or whitespace).
   */
  get JSX_TAG_START() {
    return /^<([A-Za-z][\w-.]*)(\s*\/>|\s*>|\s+)/
  }
  /** Regex matching the end of a JSX tag after attributes -- optional whitespace then `/>` or `>`. */
  get JSX_TAG_START_END() {
    return /^\s*(\/>|>)/
  }
  /** Regex matching a JSX attribute name plus optional trailing `=`. */
  get JSX_ATTRIBUTE_START() {
    return /^\s*([\w-]+\b)\s*(=?)\s*/
  }
  /** Characters which terminate a run of `JSXTextToken`. */
  get JSX_TEXT_END_CHARS() {
    return ["{", "<", ">", "}"]
  }

  /**
   * Match a single JSX element, including its children, at `start` of `text`, as `JSXElementToken`.
   * - Ignores leading whitespace.
   */
  matchJSXElement = (text: string, start = 0, end?: number): P.JSXElementToken | undefined => {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    const jsxElement = this.matchJSXStartTag(text, start, end)
    if (!jsxElement) return undefined

    if (!jsxElement.record.isUnaryTag) {
      const children = this.matchJSXChildren(jsxElement.tagName, text, jsxElement.next, end)
      if (children && children.length) {
        jsxElement.record.children = children as P.JSXElementToken[]
        jsxElement.record.raw = text.slice(start, children[children.length - 1].next)
      }
    }

    return jsxElement
  }

  /**
   * Match a single JSX start tag at `start` of `text`, including internal attributes, as a `JSXElementToken`.
   * - TODO: clean this stuff up, maybe with findFirstAtHead?
   * - TODO: check whitespace before/after tag
   */
  matchJSXStartTag(text: string, start = 0, end?: number) {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    let nextStart = this.eatWhitespace(text, start, end)
    // Make sure we start with `<`.
    if (text[nextStart] !== "<") return undefined

    const tagMatch = this.matchExpressionAtHead(this.JSX_TAG_START, text, nextStart, end)
    if (!tagMatch) return undefined

    let [matchText, tagName, endBit] = tagMatch
    nextStart += matchText.length

    const jsxElement = new P.JSXElementToken({ tagName, start })

    // If unary tag, mark as such and return.
    endBit = endBit.trim()
    if (endBit === "/>") {
      jsxElement.record.isUnaryTag = true
      jsxElement.record.raw = matchText
      return jsxElement
    }

    // If we didn't immediately get an end marker, attempt to match attributes
    if (endBit !== ">" && endBit !== "/>") {
      const attrs = this.consume(this.matchJSXAttribute, text, nextStart, end)
      if (attrs && attrs.length) {
        jsxElement.record.attributes = attrs
        nextStart = attrs[attrs.length - 1].next
      }

      // see if we got an end marker after attributes
      const endBitMatch = this.matchExpressionAtHead(this.JSX_TAG_START_END, text, nextStart, end)
      if (endBitMatch) {
        if (endBitMatch[1] === "/>") jsxElement.record.isUnaryTag = true
        nextStart += endBitMatch[0].length
      } else {
        this.logger.warn("Missing expected end `>` for jsxElement", jsxElement, `\`${text.slice(start, nextStart)}\``)
        jsxElement.record.error = "No end >"
      }
    }
    jsxElement.record.raw = text.slice(start, nextStart)
    return jsxElement
  }

  /**
   * Match JSX element children of `<endTagName>` at `start` of `text`, as an array of `JSXElementToken`.
   * - Matches nested children and stops after matching end tag: `</endTagName>`.
   */
  matchJSXChildren(endTagName: string, text: string, start: number, end?: number) {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    const children = []
    let nesting = 1

    let nextStart = start
    while (true) {
      const child = this.matchJSXChild(endTagName, text, nextStart, end)
      if (!child) break
      children.push(child)
      nextStart = child.next

      // If we got an endTag for endTagName, update nesting and break out of loop if nesting !== 0
      if (child instanceof P.JSXEndTagToken && child.tagName === endTagName) {
        nesting--
        if (nesting === 0) break
        continue
      }
    }
    // TODO: how to surface this error???
    if (nesting !== 0) {
      this.logger.warn(`matchJSXChildren(${text.slice(start, nextStart + 10)}: didn't match end child!`)
    }

    return children
  }

  /**
   * Match a single JSX child as:
   *  - `</endTagName>`
   *  - `{ jsx expression }`
   *  - nested JSX element
   *  - (anything else) as jsxText expression.
   */
  matchJSXChild(endTagName: string, text: string, start = 0, end?: number) {
    return (
      this.matchJSXEndTag(endTagName, text, start, end) ||
      this.matchJSXExpression(text, start, end) ||
      this.matchJSXElement(text, start, end) ||
      // TODO: newline and indent?
      this.matchJSXText(text, start, end)
    )
  }

  /**
   * Attempt to match a specific end tag.
   * - Ignores leading whitespace.
   */
  matchJSXEndTag(endTagName: string, text: string, start = 0, end?: number) {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    const nextStart = this.eatWhitespace(text, start, end)
    const endTag = `</${endTagName}>`
    if (!this.matchStringAtHead(endTag, text, nextStart, end)) return undefined

    end = nextStart + endTag.length
    return new P.JSXEndTagToken({
      raw: text.slice(start, end),
      tagName: endTagName,
      start
    })
  }

  /**
   * Match a single JSX element attribute at `start` of `text`, as a `JSXAttributeToken`.
   * - `name` is the attribute name,
   * - `value` is the expression value as a single `Token`.
   */
  matchJSXAttribute(text: string, start = 0, end?: number) {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    // attempt to match an attribute name, including `=` if present.
    const result = this.matchExpressionAtHead(this.JSX_ATTRIBUTE_START, text, start, end)
    if (!result) return undefined

    // attributes must start with a word character
    const [match, name, equals] = result
    if (!this.WORD_START.test(name)) return undefined

    const attribute = new P.JSXAttributeToken({ name, start })
    let nextStart = start + match.length

    // if there was an equals char, parse the value
    if (equals) {
      const value = this.matchJSXAttributeValue(text, nextStart, end)
      if (value) {
        attribute.record.value = value
        nextStart = value.next
      }
    }
    // eat whitespace before the next attribute / tag end
    nextStart = this.eatWhitespace(text, nextStart, end)
    attribute.record.raw = text.slice(start, nextStart)
    return attribute
  }

  /**
   * Match JSX attribute value  at `start` of `text`.
   * - NOTE: this will be called immediately after the `=` (and subsequent whitespace).
   */
  matchJSXAttributeValue(text: string, start: number, end?: number): P.JSXAttributeValue | undefined {
    return (
      this.matchText(text, start, end) ||
      this.matchJSXExpression(text, start, end) ||
      this.matchJSXElement(text, start, end) ||
      this.matchJSXAttributeValueIdentifier(text, start, end) ||
      this.matchNumber(text, start, end)
    )
  }

  /**
   * Match a single identifer as a JSX attribute value at `start` of `text`, as `JSXEpression`.
   */
  matchJSXAttributeValueIdentifier = (text: string, start: number, end?: number): P.JSXExpressionToken | undefined => {
    const contents = this.matchWord(text, start, end)
    if (!contents) return undefined
    return new P.JSXExpressionToken({
      // TODO: `contents` as the token???
      contents,
      raw: contents.value,
      start
    })
  }

  /**
   * Match a JSX expression enclosed in curly braces, eg:  `{ ... }`.
   * - Handles nested curlies, quotes, etc.
   * - Ignores leading whitespace.
   */
  matchJSXExpression = (text: string, start = 0, end?: number): P.JSXExpressionToken | undefined => {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    const nextStart = this.eatWhitespace(text, start, end)
    const endIndex = this.findMatchingDelimiter("{", "}", text, nextStart, end)
    if (endIndex === undefined) return undefined

    // Get contents, including leading and trailing whitespace.
    const contents = text.slice(nextStart + 1, endIndex)

    // return a new JSXExpression, advancing beyond the ending `}`.
    return new P.JSXExpressionToken({
      contents,
      raw: text.slice(start, endIndex + 1),
      start
    })
  }

  /**
   * Match JSXText until one of `{`, `<`, `>` or `}`.
   * - NOTE: INCLUDES leading / trailing whitespace.
   */
  matchJSXText = (text: string, start = 0, end?: number): P.JSXTextToken | undefined => {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    // temporarily advance past whitespace (we'll include it in the output).
    const nextStart = this.eatWhitespace(text, start, end)
    const endIndex = this.findFirstAtHead(this.JSX_TEXT_END_CHARS, text, nextStart, end)
    // If the first non-whitespace char is in our END_CHARS, forget it.
    if (endIndex === nextStart) return undefined

    // if no match, we've got some sort of error
    if (endIndex === undefined) {
      this.logger.warn(`matchJSXText(${text.slice(start, start + 50)}): JSX seems to be unbalanced.`)
      return undefined
    }

    // include leading whitespace in the output.
    const value = text.slice(start, endIndex)
    return new P.JSXTextToken({
      value,
      raw: value,
      start
    })
  }

  ////////////////
  // ## Source Code -- Comment, Line, Block
  ////////////////

  /**
   * Regex splitting a comment line into its symbol (`--`, `//`, `#`, `##` ...), leading whitespace and text.
   * - Any run of `#` is a HEADING, like markdown's:  `#` for the top level, `##` below it, and so on --
   *   and ONLY at the start of a line, after any indent.  See `matchComment()`.
   */
  get COMMENT_START() {
    return /^(#+|--+|\/\/+)(\s*)(.*)/
  }

  /** Match a single-line comment at `start` of `text`, returning a `CommentToken` if matched. */
  matchComment = (text: string, start = 0, end?: number): P.CommentToken | undefined => {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    const commentStart = text.slice(start, start + 2)
    const isHeading = text[start] === "#"
    if (commentStart !== "--" && commentStart !== "//" && !isHeading) return undefined
    // a heading only starts a line:  a `#` after anything else isn't a comment
    if (isHeading && !/^[ \t]*$/.test(text.slice(text.lastIndexOf("\n", start - 1) + 1, start))) return undefined

    // comments eat until the end of the line
    const line = this.getLineAtHead(text, start, end)
    const commentMatch = line.match(this.COMMENT_START)
    if (!commentMatch) return undefined

    const [raw, commentSymbol, initialWhitespace, value] = commentMatch
    return new P.CommentToken({
      value, // actual comment text
      commentSymbol, // actual comment symbol
      initialWhitespace, // whitespace between commentSymbol and comment value
      raw,
      start
    })
  }

  /**
   *  Break tokens into an array of arrays by `NewlineToken`s.
   * - Returns an array of lines WITHOUT the `NewlineToken`s but WITH any leading `IndentToken`s.
   * - Lines which are composed solely of whitespace are treated as blank.
   */
  breakIntoLines = (tokens: P.Token[]): P.LineToken[] => {
    const lines: P.LineToken[] = []
    let line = new P.LineToken({
      tokens: [],
      start: 0,
      line: 0,
      ch: 0,
      // indent is -1 as flag that we haven't set it yet
      indent: -1
    })
    lines.push(line)
    tokens.forEach((token) => {
      if (token instanceof P.NewlineToken) {
        line.record.newline = token
        if (line.indent === -1 && line.tokens.length) line.record.indent = 0
        line = new P.LineToken({
          tokens: [],
          start: token.start + 1,
          line: token.line! + 1,
          ch: 0,
          // indent is -1 as flag that we haven't set it yet
          indent: -1
        })
        lines.push(line)
      } else if (token instanceof P.IndentToken) {
        // pull out leading whitespace as `line.indent`
        line.record.indent = token.length
        line.record.leading = token.raw
      } else {
        // add to normal tokens in the line
        line.tokens.push(token)
      }
    })

    // remove the last `line` if it is completely empty
    const last = lines.at(-1)
    if (last && last?.tokens.length === 0 && !last.newline && !last.leading) lines.pop()

    // indent blank lines to the indent AFTER them
    // so a blank line doesn't break an indented block
    let startIndent = 0
    function getNextIndent(index: number): number {
      while (lines[index]) {
        if (lines[index].indent !== -1) return lines[index].indent
        index++
      }
      return startIndent
    }
    // REFACTOR: WAS: startIndent = getNextIndent(0)
    startIndent = getNextIndent(0) ?? 0
    lines.forEach((next, index) => {
      if (next.indent === -1) {
        // if we got tokens but no leading, indent is 0
        if (next.tokens.length) next.record.indent = 0
        // Otherwise find the next AFTER the current line
        else next.record.indent = getNextIndent(index + 1)
      }
    })
    return lines
  }

  /**
   * Break random `tokens` into array of `BlockToken`s by:
   * - first breaking into `LineToken`s and then
   * - creating nested `BlockToken`s as `line.indent` changes.
   */
  breakIntoIndentedBlocks = (tokens: P.Token[]): P.BlockToken[] => {
    // break into lines & return early if no lines
    const lines = this.breakIntoLines(tokens)
    if (lines.length === 0) return []

    // Establish the first block at the MINIMUM of all indents
    // in case the top of the block is indented LESS than somewhere below.
    // TODO: ??? seems like this should be a top-level error???
    const block = new P.BlockToken({
      start: 0,
      line: 0,
      ch: 0,
      indent: Math.min(...lines.map((line) => line.indent ?? 0)),
      tokens: []
    })

    // Stack of blocks -- we'll push and pop blocks on the stack as indent changes
    const stack = [block]
    lines.forEach((line) => {
      let topBlock = stack[stack.length - 1]
      // If indenting, push a new block
      while (line.indent > topBlock.indent) {
        const newBlock = new P.BlockToken({
          start: line.start,
          line: line.line,
          ch: line.ch,
          indent: topBlock.indent + 1,
          tokens: []
        })
        topBlock.tokens.push(newBlock)
        stack.push(newBlock)
        topBlock = newBlock
      }

      // If outdenting: pop block(s)
      while (line.indent < topBlock.indent) {
        stack.pop()
        topBlock = stack[stack.length - 1]
      }

      // add line to top block
      topBlock.tokens.push(line)
    })

    return [block]
  }

  ////////////////
  // ## Utility functions
  ////////////////

  /**
   * Characters treated as whitespace for tokenizing purposes -- space and tab.
   * - TODO: this creates a new array every time it's called.  We should cache it.
   */
  get WHITESPACE_CHARS() {
    return [" ", "\t"]
  }

  /**
   * Return the first char position after `start` of `text` which is NOT a whitespace char (space or tab).
   * - If `text[start]` is not whitespace, returns `start`,
   * - You can call this at any time to skip whitespace in the output.
   */
  eatWhitespace = (text: string, start = 0, end?: number): number => {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return end

    let whiteSpaceEnd = start
    while (whiteSpaceEnd < end && this.WHITESPACE_CHARS.includes(text[whiteSpaceEnd])) {
      whiteSpaceEnd++
    }
    return whiteSpaceEnd
  }

  /**
   * Return characters up to, but not including, the next newline char after `start` of `text`.
   * - If `start` is a newline char or start >= end, returns empty string.
   * - If at the end of the string (eg: no more newlines), returns from start to end of `text`.
   */
  getLineAtHead = (text: string, start = 0, end?: number) => {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return ""

    let newline = text.indexOf("\n", start)
    if (newline === -1 || newline > end) newline = end
    return text.slice(start, newline)
  }

  /** Return `true` if `string` appears at `start` of `text`. */
  matchStringAtHead = (string: string, text: string, start = 0, end?: number) => {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return false

    const stringEnd = start + string.length
    if (stringEnd > end) return false
    return string === text.slice(start, stringEnd)
  }

  /**
   *  Match a regular expression starting at `start` of `text`, returning the regex match array.
   * - Returns `undefined` if no match.
   * - NOTE: The expression MUST start with `/^.../`
   */
  matchExpressionAtHead = (expression: RegExp, text: string, start = 0, end?: number): RegExpMatchArray | undefined => {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    const head = text.slice(start, end)
    return head.match(expression) ?? undefined
  }

  /**
   * Find index of the matching SINGLE CHARACTER `endDelimiter` to match `startDelimiter`.
   * - Returns numeric index or `undefined` if no match or if first char is not `startDelimiter`.
   * - Assumes `text[start]` is the startDelimiter!
   * - Consumes quoted strings inside delimiters.
   * - Matches nested delimiters and handles escaped delimiters, e.g.
   *   - `findMatchingDelimiter("{", "}", "{{}}")` => 4
   *   - `findMatchingDelimiter("{", "}", "{\\{}")` => 4
   * - TESTME escaped delimiters, nested quotes
   */
  findMatchingDelimiter = (
    startDelimiter: string,
    endDelimiter: string,
    text: string,
    start = 0,
    end?: number
  ): number | undefined => {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    if (text[start] !== startDelimiter) return undefined

    let nesting = 0
    let current = start
    while (current < end) {
      let char = text[current]
      // if startDelimiter, increase nesting
      if (char === startDelimiter) {
        nesting++
      }
      // if endDelimiter, decrease nesting and return if nesting back to 0
      else if (char === endDelimiter) {
        nesting--
        if (nesting === 0) return current
      }
      // if a single or double quote, skip until the matching quote
      else if (char === "'" || char === '"') {
        const token = this.matchText(text, current, end)
        if (token) {
          current = token.next
          // continue so we don't add 1 to curent below
          continue
        }
      }
      // If backslash, skip an extra char if it's either delimiter or a quote
      else if (char === "\\") {
        char = text[current + 1]
        if (char === startDelimiter || char === endDelimiter || char === "'" || char === '"') {
          current++
        }
      }
      current++
    }
    return undefined
  }

  /**
   * Return the index of the first NON-ESCAPED character in `chars` after `text[start]`.
   * - Returns `undefined` if we didn't find a match.
   */
  findFirstAtHead = (chars: string | string[], text: string, start = 0, end?: number): number | undefined => {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    while (start < end) {
      const char = text[start]
      if (chars.includes(char)) return start
      // if we got an escape char, ignore the next char if it's in `chars`
      if (char === "\\" && chars.includes(text[start + 1])) start++
      start++
    }
    if (start >= end) return undefined
    return start
  }

  /**
   * Given a set of tokens, slice whitespace (indent, newline or normal whitespace) from the front.
   */
  removeLeadingWhitespace = (tokens: P.Token[], start = 0): P.Token[] => {
    while (tokens[start] instanceof P.WhitespaceToken) start++
    if (start === 0) return tokens
    return tokens.slice(start)
  }
}

/** Constructor props for `Tokenizer`. */
type TokenizerProps = {
  /** See `Tokenizer.whitespacePolicy`. */
  whitespacePolicy?: P.WhitespacePolicy
  /** See `Tokenizer.quoteSymbols`. */
  quoteSymbols?: string[]
}
