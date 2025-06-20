/* eslint-disable no-continue */
//import { addDebugMethods } from "~/util"
import * as Tokens from "./Tokens.ts"
import { Token } from "./Tokens.ts"
import { WhitespacePolicy, BACKSLASH, DOUBLE_QUOTE, SINGLE_QUOTE } from "../types.js"

type TokenizerProps = {
  whitespacePolicy?: WhitespacePolicy
  quoteSymbols?: string[]
}
type TokenMatcher<T = Token> = (text: string, start?: number, end?: number) => T | undefined

/**
 * Tokenizer class for parsing text into a stream of tokens.
 */
// TODO: error checking / reporting, especially in JSX expressions.
// TODO: have normal `tokenize` stick whitespace elements in the stream, then `tokenizeLines()` takes them out?
export class Tokenizer {
  // Leave all whitespace by default.
  whitespacePolicy: WhitespacePolicy = WhitespacePolicy.ALL

  /** Quote symbols. */
  // REFACTOR: backtick?  left/right quotes, e.g. `""` and `''`?
  quoteSymbols = [DOUBLE_QUOTE, SINGLE_QUOTE] as const

  /** Debug logger. */
  // logger = addDebugMethods({}, "tokenizer", "ERROR")

  constructor(props: TokenizerProps = {}) {
    Object.assign(this, props)
  }

  /**
   * Tokenize `text` between `start` and `end` into an array of `Token`s.
   */
  tokenize = (text: string, start = 0, end?: number) => {
    // Replace `¬` with `\n` and `∆` with `\t`.
    // We use these to see tabs and returns in debugging output more easily.
    text = text.replace(/¬/g, "\n").replace(/∆/g, "\t")

    // Make sure `end` is a number within the text length.
    if (typeof end !== "number" || end > text.length) end = text.length
    // quick return out of range or only whitespace
    if (start >= end || !text.trim()) return []

    // Process our top-level rules.
    const tokens = this.consume(this.matchTopTokens, text, start, end)
    if (!tokens || tokens.length === 0) return []

    const lastEnd = tokens[tokens.length - 1].end
    if (lastEnd !== end) {
      // this.logger.warn("tokenize(): didn't consume: `", text.slice(start, end), "`")
    }

    // Iterate through tokens setting `line` and `ch`(ar),
    // which is sometimes more useful than the raw `offset` within the file.
    // REFACTOR: can we do this in the `consume` method?
    let line = 0
    let ch = 0
    tokens.forEach((token) => {
      token.record.line = line
      token.record.ch = ch
      ch += token.length
      if (token instanceof Tokens.Newline) {
        line++
        ch = 0
      }
    })

    // Return tokens filtered according to our whitespace policy
    switch (this.whitespacePolicy) {
      case WhitespacePolicy.NONE:
        return this.filterWhitespace(tokens, Tokens.Whitespace)
      case WhitespacePolicy.LEADING_ONLY:
        return this.filterWhitespace(tokens, Tokens.InlineWhitespace)
      default:
        return tokens
    }
  }

  /**
   * Join `tokens` back into their source form.
   * - Pass `start` and `end` to restrict to a subset of `tokens`.
   * - NOTE: we `trim()` the result, which is generally what's desired.
   */
  static join(tokens: Token[], start = 0, end = tokens.length) {
    if (start !== 0 || end !== tokens.length) tokens = tokens.slice(start, end)
    return tokens.join("").trim()
  }

  /**
   * Filter whitespace tokens of the specified type from `tokens`.
   * - Note that we add whitespace filtered out to `token.whitespace` of the PREVIOUS token.
   *   This allows us to reconstruct the stream exactly by just looking at the filtered tokens.
   * - NOTE: filtered whitespace tokens at the start will be lost.
   */
  filterWhitespace(tokens: Token[], whitespaceType: typeof Tokens.Whitespace) {
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
  consume<T extends Token = Token>(
    method: TokenMatcher<T>,
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

      if (token.end === nextStart) {
        // this.logger.warn("error: got token but didn't advance in stream")
        break
      }
      nextStart = token.end
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

  //////////////////////
  //  ### Whitespace
  //////////////////////

  /**
   * Convert a run of spaces and/or tabs into:
   * - a `Indent` token if it occurs at the begining of `text` or after a newline, or
   * - a `InlineWhitespace` token if it occurs in the middle of a line.
   */
  matchWhitespace = (text: string, start = 0, end?: number): Tokens.Indent | Tokens.InlineWhitespace | undefined => {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    const whitespaceEnd = this.eatWhitespace(text, start, end)
    // forget it if no forward motion
    if (whitespaceEnd === start) return undefined

    const value = text.slice(start, whitespaceEnd)
    const props = {
      value,
      raw: value,
      offset: start,
    }
    // if at start of text or after a newline, return an `Indent` token
    if (start === 0 || text[start - 1] === "\n") return new Tokens.Indent(props)
    // otherwise, return an `InlineWhitespace` token
    return new Tokens.InlineWhitespace(props)
  }

  /**
   * Match a single newline character at `start` of `text`, as `Newline` token.
   * - NOTE: this assumes we're in utf-8 mode, so `\n` is a single character.
   */
  matchNewline = (text: string, start = 0, end?: number): Tokens.Newline | undefined => {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end || text[start] !== "\n") return undefined
    return new Tokens.Newline({ offset: start })
  }

  //////////////////////
  //  ### Word / Symbol / Text
  //////////////////////

  get WORD_START() {
    return /[A-Za-z]/
  }
  get WORD_CHAR() {
    return /^[\w_-]/
  }

  /**
   * Match a single `word` at `start` of `text` at character `start`, as `Word` token.
   * - e.g. `hello`, `_world`, `foo-bar`, `foo_bar_3`, etc.
   */
  matchWord = (text: string, start = 0, end?: number): Tokens.Word | undefined => {
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
    return new Tokens.Word({ value, raw: value, offset: start })
  }

  /**
   * Match a single "symbol" character at `start` of `text`, as `Symbol` token.
   * - NOTE: This does not do any checking, it just blindly uses the character in question.
   * - You should make sure all other possible rules have been exhausted first.
   */
  matchSymbol = (text: string, start = 0, end?: number): Tokens.Symbol | undefined => {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined
    const value = text[start]
    return new Tokens.Symbol({
      value,
      raw: value,
      offset: start,
    })
  }

  /**
   * Match a quoted text literal string at `start` of `text`, as `Text` token.
   * - e.g. `"hello"`, `'hello world'`, `"text \" with escaped quotes"`, etc.
   */
  // TESTME:  not sure the escaping logic is really right...
  matchText = (text: string, start = 0, end?: number): Tokens.Text | undefined => {
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
      if (char === BACKSLASH && text[textEnd + 1] === quoteSymbol) textEnd++
      textEnd++
    }
    // Forget it if we didn't end with the quote symbol
    if (text[textEnd] !== quoteSymbol) return undefined
    // advance past end quote
    textEnd++

    // Value includes the quotes, use `innerText` to get the actual text.
    const value = text.slice(start, textEnd)
    return new Tokens.Text({
      value,
      raw: value,
      offset: start,
    })
  }

  //////////////////////
  //  ### Numbers
  //////////////////////

  get NUMBER_START() {
    return /[0-9-.]/
  }

  get NUMBER() {
    return /^-?([0-9]*\.)?[0-9]+/
  }

  /** Match a single number at `start` of `text`, as a `Number` token. */
  matchNumber = (text: string, start = 0, end?: number): Tokens.Number | undefined => {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    if (!this.NUMBER_START.test(text[start])) return undefined

    const numberMatch = this.matchExpressionAtHead(this.NUMBER, text, start, end)
    if (!numberMatch) return undefined

    const input = numberMatch[0]
    const value = parseFloat(input)
    return new Tokens.Number({
      value,
      raw: input,
      offset: start,
    })
  }

  //////////////////
  //  ### JSX expressions
  //////////////////

  get JSX_TAG_START() {
    return /^<([A-Za-z][\w-\.]*)(\s*\/>|\s*>|\s+)/
  }
  get JSX_TAG_START_END() {
    return /^\s*(\/>|>)/
  }
  get JSX_ATTRIBUTE_START() {
    return /^\s*([\w-]+\b)\s*(=?)\s*/
  }
  get JSX_TEXT_END_CHARS() {
    return ["{", "<", ">", "}"]
  }

  /**
   * Match a single JSX element, including its children, at `start` of `text`, as `JSXElement` token.
   * - Ignores leading whitespace.
   */
  matchJSXElement = (text: string, start = 0, end?: number): Tokens.JSXElement | undefined => {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    const jsxElement = this.matchJSXStartTag(text, start, end)
    if (!jsxElement) return undefined

    if (!jsxElement.record.isUnaryTag) {
      const children = this.matchJSXChildren(jsxElement.tagName, text, jsxElement.end, end)
      if (children && children.length) {
        jsxElement.record.children = children as Tokens.JSXElement[]
        jsxElement.record.raw = text.slice(start, children[children.length - 1].end)
      }
    }

    return jsxElement
  }

  /** Match a single JSX start tag at `start` of `text`, including internal attributes, as a `JSXElement` token. */
  // TODO: clean this stuff up, maybe with findFirstAtHead?
  // TODO: check whitespace before/after tag
  matchJSXStartTag(text: string, start = 0, end?: number) {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    let nextStart = this.eatWhitespace(text, start, end)
    // Make sure we start with `<`.
    if (text[nextStart] !== "<") return undefined

    const tagMatch = this.matchExpressionAtHead(this.JSX_TAG_START, text, nextStart, end)
    if (!tagMatch) return undefined

    // eslint-disable-next-line prefer-const
    let [matchText, tagName, endBit] = tagMatch
    nextStart += matchText.length

    const jsxElement = new Tokens.JSXElement({ tagName, offset: start })

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
        nextStart = attrs[attrs.length - 1].end
      }

      // see if we got an end marker after attributes
      const endBitMatch = this.matchExpressionAtHead(this.JSX_TAG_START_END, text, nextStart, end)
      if (endBitMatch) {
        if (endBitMatch[1] === "/>") jsxElement.record.isUnaryTag = true
        nextStart += endBitMatch[0].length
      } else {
        // this.logger.warn("Missing expected end `>` for jsxElement", jsxElement, `\`${text.slice(start, nextStart)}\``)
        jsxElement.record.error = "No end >"
      }
    }
    jsxElement.record.raw = text.slice(start, nextStart)
    return jsxElement
  }

  /**
   * Match JSX element children of `<endTagName>` at `start` of `text`, as an array of `JSXElement` token.
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
      nextStart = child.end

      // If we got an endTag for endTagName, update nesting and break out of loop if nesting !== 0
      if (child instanceof Tokens.JSXEndTag && child.tagName === endTagName) {
        nesting--
        if (nesting === 0) break
        continue
      }
    }
    // TODO: how to surface this error???
    // if (nesting !== 0)
    //   this.logger.warn(`matchJSXChildren(${text.slice(start, nextStart + 10)}: didn't match end child!`)

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
    return new Tokens.JSXEndTag({
      raw: text.slice(start, end),
      tagName: endTagName,
      offset: start,
    })
  }

  /**
   * Match a single JSX element attribute at `start` of `text`, as a `JSXAttribute` token.
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

    const attribute = new Tokens.JSXAttribute({ name, offset: start })
    let nextStart = start + match.length

    // if there was an equals char, parse the value
    if (equals) {
      const value = this.matchJSXAttributeValue(text, nextStart, end)
      if (value) {
        attribute.record.value = value
        nextStart = value.end
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
  matchJSXAttributeValue(text: string, start: number, end?: number): Tokens.JSXAttributeValue | undefined {
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
  matchJSXAttributeValueIdentifier = (text: string, start: number, end?: number): Tokens.JSXExpression | undefined => {
    const contents = this.matchWord(text, start, end)
    if (!contents) return undefined
    return new Tokens.JSXExpression({
      // TODO: `contents` as the token???
      contents,
      raw: contents.value,
      offset: start,
    })
  }

  /**
   * Match a JSX expression enclosed in curly braces, eg:  `{ ... }`.
   * - Handles nested curlies, quotes, etc.
   * - Ignores leading whitespace.
   */
  matchJSXExpression = (text: string, start = 0, end?: number): Tokens.JSXExpression | undefined => {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    const nextStart = this.eatWhitespace(text, start, end)
    const endIndex = this.findMatchingDelimiter("{", "}", text, nextStart, end)
    if (endIndex === undefined) return undefined

    // Get contents, including leading and trailing whitespace.
    const contents = text.slice(nextStart + 1, endIndex)

    // return a new JSXExpression, advancing beyond the ending `}`.
    return new Tokens.JSXExpression({
      contents,
      raw: text.slice(start, endIndex + 1),
      offset: start,
    })
  }

  /**
   * Match JSXText until one of `{`, `<`, `>` or `}`.
   * - NOTE: INCLUDES leading / trailing whitespace.
   */
  matchJSXText = (text: string, start = 0, end?: number): Tokens.JSXText | undefined => {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    // temporarily advance past whitespace (we'll include it in the output).
    const nextStart = this.eatWhitespace(text, start, end)
    const endIndex = this.findFirstAtHead(this.JSX_TEXT_END_CHARS, text, nextStart, end)
    // If the first non-whitespace char is in our END_CHARS, forget it.
    if (endIndex === nextStart) return undefined

    // if no match, we've got some sort of error
    if (endIndex === undefined) {
      // this.logger.warn(`matchJSXText(${text.slice(start, start + 50)}): JSX seems to be unbalanced.`)
      return undefined
    }

    // include leading whitespace in the output.
    const value = text.slice(start, endIndex)
    return new Tokens.JSXText({
      value,
      raw: value,
      offset: start,
    })
  }

  //////////////////
  //  ### Source Code - Comment, Line, Block
  //////////////////

  get COMMENT_START() {
    return /^(##+|--+|\/\/+)(\s*)(.*)/
  }

  /** Match a single-line comment at `start` of `text`, returning a `Comment` token if matched. */
  matchComment = (text: string, start = 0, end?: number): Tokens.Comment | undefined => {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    const commentStart = text.slice(start, start + 2)
    if (commentStart !== "--" && commentStart !== "//" && commentStart !== "##") return undefined

    // comments eat until the end of the line
    const line = this.getLineAtHead(text, start, end)
    const commentMatch = line.match(this.COMMENT_START)
    if (!commentMatch) return undefined

    const [raw, commentSymbol, initialWhitespace, value] = commentMatch
    return new Tokens.Comment({
      value, // actual comment text
      commentSymbol, // actual comment symbol
      initialWhitespace, // whitespace between commentSymbol and comment value
      raw,
      offset: start,
    })
  }

  /**
   *  Break tokens into an array of arrays by `Newline` tokens.
   * - Returns an array of lines WITHOUT the `Newline`s but WITH any leading `Indent` tokens.
   * - Lines which are composed solely of whitespace are treated as blank.
   */
  breakIntoLines = (tokens: Token[]): Tokens.Line[] => {
    const lines: Tokens.Line[] = []
    let line = new Tokens.Line({
      tokens: [],
      offset: 0,
      line: 0,
      ch: 0,
      // indent is -1 as flag that we haven't set it yet
      indent: -1,
    })
    lines.push(line)
    tokens.forEach((token) => {
      if (token instanceof Tokens.Newline) {
        line.record.newline = token
        if (line.indent === -1 && line.tokens.length) line.record.indent = 0
        line = new Tokens.Line({
          tokens: [],
          offset: token.offset + 1,
          line: token.line! + 1,
          ch: 0,
          // indent is -1 as flag that we haven't set it yet
          indent: -1,
        })
        lines.push(line)
      } else if (token instanceof Tokens.Indent) {
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
   * Break random `tokens` into array of `Block` tokens by:
   * - first breaking into `Line` tokens and then
   * - creating nested `Block` tokens as `line.indent` changes.
   */
  breakIntoIndentedBlocks = (tokens: Token[]): Tokens.Block[] => {
    // break into lines & return early if no lines
    const lines = this.breakIntoLines(tokens)
    if (lines.length === 0) return []

    // Establish the first block at the MINIMUM of all indents
    // in case the top of the block is indented LESS than somewhere below.
    // TODO: ??? seems like this should be a top-level error???
    const block = new Tokens.Block({
      offset: 0,
      line: 0,
      ch: 0,
      indent: Math.min(...lines.map((line) => line.indent ?? 0)),
      tokens: [],
    })

    // Stack of blocks -- we'll push and pop blocks on the stack as indent changes
    const stack = [block]
    lines.forEach((line) => {
      let topBlock = stack[stack.length - 1]
      // If indenting, push a new block
      while (line.indent > topBlock.indent) {
        const newBlock = new Tokens.Block({
          offset: line.offset,
          line: line.line,
          ch: line.ch,
          indent: topBlock.indent + 1,
          tokens: [],
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

  //////////////////
  //  ### Utility functions
  //////////////////

  // TODO: this creates a new array every time it's called.  We should cache it.
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
   */
  // TESTME escaped delimiters, nested quotes
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
          current = token.end
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
  removeLeadingWhitespace = (tokens: Token[], start = 0): Token[] => {
    while (tokens[start] instanceof Tokens.Whitespace) start++
    if (start === 0) return tokens
    return tokens.slice(start)
  }
}
