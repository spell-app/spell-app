/* eslint-disable no-continue */
import { Token, addDebugMethods, DebugLevel, proto } from "./all"

// Policy for automatically removing whitespace from the token stream.
export const WhitespacePolicy = {
  ALL: "ALL", // Leave ALL whitespace
  NONE: "NONE", // Remove ALL whitespace
  LEADING_ONLY: "LEADING_ONLY" // Remove inline whitespace only (leaving indents and newlines)
}

//
//  # Tokenizer class
//
// TODO: error checking / reporting, especially in JSX expressions.
// TODO: have normal `tokenize` stick whitespace elements in the stream, then `tokenizeLines()` takes them out?
export default class Tokenizer {
  // Leave all whitespace by default.
  @proto whitespacePolicy = WhitespacePolicy.ALL

  // Debug logger.
  @proto logger = addDebugMethods({}, "tokenizer", DebugLevel.WARN)

  constructor(props) {
    Object.assign(this, props)
  }

  // Tokenize text between `start` and `end` into an array of `token` `results`.
  tokenize = (text, start = 0, end) => {
    // Replace `¬` with `\n` and `∆` with `\t`.
    // We use these to see tabs and returns in debugging output more easily.
    text = text.replace(/¬/g, "\n").replace(/∆/g, "\t")

    if (typeof end !== "number" || end > text.length) end = text.length
    // quick return out of range or only whitespace
    if (start >= end || !text.trim()) return []

    // Process our top-level rules.
    const tokens = this.consume(this.matchTopTokens, text, start, end)
    if (!tokens || tokens.length === 0) return []

    const lastEnd = tokens[tokens.length - 1].end
    if (lastEnd !== end) {
      this.logger.warn("tokenize(): didn't consume: `", text.slice(start, end), "`")
    }

    // Filter according to our whitespace policy
    if (this.whitespacePolicy === WhitespacePolicy.NONE) return this.filterWhitespace(tokens, Token.Whitespace)

    if (this.whitespacePolicy === WhitespacePolicy.LEADING_ONLY)
      return this.filterWhitespace(tokens, Token.InlineWhitespace)

    return tokens
  }

  // Join tokens back into their source form.
  // Pass `start` and `end` to restrict to a `slice()`.
  // NOTE: `trim()` the result, which is generally what we want.
  static join(tokens, start = 0, end = tokens.length) {
    if (start !== 0 || end !== tokens.length) tokens = tokens.slice(start, end)
    return tokens.join("").trim()
  }

  // Filter out whitespace of the specified type.
  // Note that we add whitespace filters to `token.whitespace` of the PREVIOUS token.
  // This allows us to reconstruct the stream exactly by just looking at the filtered tokens.
  filterWhitespace(tokens, whitespaceType) {
    const results = []
    for (let i = 0, token; (token = tokens[i]); i++) {
      if (token instanceof whitespaceType) {
        const previous = tokens[i - 1]
        if (previous) previous.whitespace = (previous.whitespace || "") + token.value
      } else {
        results.push(token)
      }
    }
    return results
  }

  // Repeatedly execute a `method` (bound to `this) which returns a `[result, nextStart]` or `undefined`.
  // Places matched results together in `results` array and returns `[results, nextStart]` for the entire set.
  // Stops if `method` doesn't return anything, or if calling `method` is unproductive.
  // TESTME
  consume(method, text, start = 0, end, results = []) {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    // process rules repeatedly until we get to the end
    let nextStart = start
    while (nextStart < end) {
      const token = method.call(this, text, nextStart, end)
      if (!token) break
      results.push(token)

      if (token.end === nextStart) {
        this.logger.warn("error: got token but didn't advance in stream")
        break
      }
      nextStart = token.end
    }
    return results
  }

  // Match a single top-level token at `text[start]`.
  // TESTME
  matchTopTokens(text, start, end) {
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

  //
  //  ### Whitespace
  //

  //
  //  ### Whitespace
  //  NOTE: Whitespace at the beginning of `text` or the beginning of a line
  //      is considered an "indent" and will have `.isIndent === true`.
  //

  // Convert a run of spaces and/or tabs into a `Token.Indent` or `Token.InlineWhitespace`.
  matchWhitespace(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    const whitespaceEnd = this.eatWhitespace(text, start, end)
    // forget it if no forward motion
    if (whitespaceEnd === start) return undefined

    const value = text.slice(start, whitespaceEnd)
    const props = {
      value,
      raw: value,
      offset: start
    }
    if (start === 0 || text[start - 1] === "\n") return new Token.Indent(props)
    return new Token.InlineWhitespace(props)
  }

  //
  //  ### Newline
  //

  // Match a single newline character at `text[start]`.
  // Returns `[Token.Newline, nextStart]` on match.
  // Otherwise returns `undefined`.
  matchNewline(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end || text[start] !== "\n") return undefined
    return new Token.Newline({ offset: start })
  }

  //
  //  ### Word
  //

  // Match a single `word` in `text` at character `start`.
  // Returns `[word, wordEnd]`.
  // Returns an empty array if couldn't match a word.
  @proto WORD_START = /[A-Za-z]/

  @proto WORD_CHAR = /^[\w_-]/

  matchWord(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    if (!this.WORD_START.test(text[start])) return undefined

    let wordEnd = start + 1
    while (wordEnd < end && this.WORD_CHAR.test(text[wordEnd])) {
      wordEnd++
    }
    if (wordEnd === start) return undefined

    const value = text.slice(start, wordEnd)
    return new Token.Word({
      value,
      raw: value,
      offset: start
    })
  }

  //
  //  ### Numbers
  //

  // Eat a single number.
  // Returns a `Number` if matched.
  @proto NUMBER_START = /[0-9-.]/

  @proto NUMBER = /^-?([0-9]*\.)?[0-9]+/

  matchNumber(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    if (!this.NUMBER_START.test(text[start])) return undefined

    const numberMatch = this.matchExpressionAtHead(this.NUMBER, text, start, end)
    if (!numberMatch) return undefined

    const input = numberMatch[0]
    const value = parseFloat(input, 10)
    return new Token.Number({
      value,
      raw: input,
      offset: start
    })
  }

  //
  //  ### Symbol character
  //

  // Match the single "symbol" character at `text[start]`.
  // NOTE: This does not do any checking, it just blindly uses the character in question.
  //     You should make sure all other possible rules have been exhausted first.
  matchSymbol(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined
    const value = text[start]
    return new Token.Symbol({
      value,
      raw: value,
      offset: start
    })
  }

  //
  //  ### Text literal
  //

  // Eat a text literal (starts/ends with `'` or `"`).
  // Returns a `Token.Text` if matched.
  // TESTME:  not sure the escaping logic is really right...
  matchText(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    const quoteSymbol = text[start]
    if (quoteSymbol !== '"' && quoteSymbol !== "'") return undefined

    let textEnd = start + 1
    while (textEnd < end) {
      const char = text[textEnd]
      if (char === quoteSymbol) break
      // if we get a backquote, ignore quote in next char
      if (char === "\\" && text[textEnd + 1] === quoteSymbol) textEnd++
      textEnd++
    }
    // Forget it if we didn't end with the quote symbol
    if (text[textEnd] !== quoteSymbol) return undefined
    // advance past end quote
    textEnd++

    const value = text.slice(start, textEnd)
    return new Token.Text({
      value,
      raw: value,
      offset: start
    })
  }

  //
  //  ### Comments
  //

  // Eat a single line comment (comment symbol until the end of the line).
  // Comments can start with:
  //    `##`, `###`, etc
  //    `--`, `---`, etc
  //    `//`
  // Returns a `Token.Comment` if matched.
  @proto COMMENT = /^(##+|--+|\/\/+)(\s*)(.*)/

  matchComment(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    const commentStart = text.slice(start, start + 2)
    if (commentStart !== "--" && commentStart !== "//" && commentStart !== "##") return undefined

    // comments eat until the end of the line
    const line = this.getLineAtHead(text, start, end)
    const commentMatch = line.match(this.COMMENT)
    if (!commentMatch) return undefined

    const [raw, commentSymbol, initialWhitespace, value] = commentMatch
    return new Token.Comment({
      value, // actual comment text
      commentSymbol, // actual comment symbol
      initialWhitespace, // whitespace between commentSymbol and comment value
      raw,
      offset: start
    })
  }

  //
  //  ### JSX
  //

  // Eat a (nested) JSX expression.
  // TESTME
  matchJSXElement(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    const jsxElement = this.matchJSXStartTag(text, start, end)
    if (!jsxElement) return undefined

    if (!jsxElement.isUnaryTag) {
      const children = this.matchJSXChildren(jsxElement.tagName, text, jsxElement.end, end)
      if (children.length) {
        jsxElement.children = children
        jsxElement.raw = text.slice(start, children[children.length - 1].end)
      }
    }

    return jsxElement
  }

  // Match JSX start tag and internal elements (but NOT children).
  // Returns `[jsxElement, nextStart]` or `undefined`.
  // Use `matchJSXElement()` to match children, end tag, etc.
  // Ignores leading whitespace.
  @proto JSX_TAG_START = /^<([A-Za-z][\w-\.]*)(\s*\/>|\s*>|\s+)/

  // TODO: clean this stuff up, maybe with findFirstAtHead?
  matchJSXStartTag(text, start = 0, end) {
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

    const jsxElement = new Token.JSXElement({
      tagName,
      offset: start
    })

    // If unary tag, mark as such and return.
    endBit = endBit.trim()
    if (endBit === "/>") {
      jsxElement.isUnaryTag = true
      jsxElement.raw = matchText
      return jsxElement
    }

    // If we didn't immediately get an end marker, attempt to match attributes
    if (endBit !== ">" && endBit !== "/>") {
      const attrs = this.consume(this.matchJSXAttribute, text, nextStart, end)
      if (attrs && attrs.length) {
        jsxElement.attributes = attrs
        nextStart = attrs[attrs.length - 1].end
      }
    }

    // at this point we should get an `/>` or `>` (with no whitespace).
    if (text[nextStart] === "/" && text[nextStart + 1] === ">") {
      endBit = "/>"
      nextStart += 2
    } else if (text[nextStart] === ">") {
      endBit = text[nextStart]
      nextStart += 1
    }

    // Return immediately for unary tag
    if (endBit === "/>") {
      jsxElement.isUnaryTag = true
    } else if (endBit !== ">") {
      this.logger.warn("Missing expected end `>` for jsxElement", jsxElement, `\`${text.slice(start, nextStart)}\``)
      jsxElement.error = "No end >"
    }
    jsxElement.raw = text.slice(start, nextStart)
    return jsxElement
  }

  //
  //  ### JSX children
  //

  // Match JSX element children of `<tagName>` at `text[start]`.
  // Matches nested children and stops after matching end tag: `</tagName>`.
  // Returns `[children, nextStart]`.
  // TESTME
  matchJSXChildren(tagName, text, start, end) {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    const children = []
    let nesting = 1

    let nextStart = start
    while (true) {
      const child = this.matchJSXChild(tagName, text, nextStart, end)
      if (!child) break
      children.push(child)
      nextStart = child.end

      // If we got an endTag for tagName, update nesting and break out of loop if nesting !== 0
      if (child instanceof Token.JSXEndTag && child.tagName === tagName) {
        nesting--
        if (nesting === 0) break
        continue
      }
    }
    // TODO: how to surface this error???
    if (nesting !== 0)
      this.logger.warn(`matchJSXChildren(${text.slice(start, nextStart + 10)}: didn't match end child!`)

    return children
  }

  // Match a single JSX child:
  //  - current endTag
  //  - `{ jsx expression }`
  //  - nested JSX element
  //  - (anything else) as jsxText expression.
  matchJSXChild(tagName, text, start = 0, end) {
    return (
      this.matchJSXEndTag(tagName, text, start, end) ||
      this.matchJSXExpression(text, start, end) ||
      this.matchJSXElement(text, start, end) ||
      // TODO: newline and indent?
      this.matchJSXText(text, start, end)
    )
  }

  // Attempt to match a specific end tag.
  // Ignores leading whitespace.
  matchJSXEndTag(tagName, text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    const nextStart = this.eatWhitespace(text, start, end)
    const endTag = `</${tagName}>`
    if (!this.matchStringAtHead(endTag, text, nextStart, end)) return undefined

    end = nextStart + endTag.length
    return new Token.JSXEndTag({
      raw: text.slice(start, end),
      tagName,
      offset: start
    })
  }

  //
  //  ### JSX attributes
  //

  // Match a single JSX element attribute as `<attr>={<value>}`
  // TODO: {...xxx}
  @proto JSX_ATTRIBUTE_START = /^\s*([\w-]+\b)\s*(=?)\s*/

  matchJSXAttribute(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    // attributes must start with a word character
    if (!this.WORD_START.test(text[start])) return undefined

    // attempt to match an attribute name, including `=` if present.
    const result = this.matchExpressionAtHead(this.JSX_ATTRIBUTE_START, text, start, end)
    if (!result) return undefined

    const [match, name, equals] = result
    const attribute = new Token.JSXAttribute({ name, offset: start })
    let nextStart = start + match.length

    // if there was an equals char, parse the value
    if (equals) {
      const value = this.matchJSXAttributeValue(text, nextStart, end)
      if (value) {
        attribute.value = value
        nextStart = value.end
      }
    }
    // eat whitespace before the next attribute / tag end
    nextStart = this.eatWhitespace(text, nextStart, end)
    attribute.raw = text.slice(start, nextStart)
    return attribute
  }

  // Match a value expression for a JSX element attribute:
  // NOTE: we will be called immediately after the `=` (and subsequent whitespace).
  matchJSXAttributeValue(text, start, end) {
    return (
      this.matchText(text, start, end) ||
      this.matchJSXExpression(text, start, end) ||
      this.matchJSXElement(text, start, end) ||
      this.matchJSXAttributeValueIdentifier(text, start, end) ||
      this.matchNumber(text, start, end)
    )
  }

  // Match a single identifer as a JSX attribute value.
  // Returns as a `JSXExpression`.
  matchJSXAttributeValueIdentifier(text, start, end) {
    const contents = this.matchWord(text, start, end)
    if (!contents) return undefined
    return new Token.JSXExpression({
      contents,
      raw: contents.value,
      offset: start
    })
  }

  // Match a JSX expression enclosed in curly braces, eg:  `{ ... }`.
  //  Handles nested curlies, quotes, etc.
  // Returns array of tokens of internal match.
  // Ignores leading whitespace.
  // TODO: newlines/indents???
  // TODO: {...xxx}
  // TESTME
  matchJSXExpression(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    const nextStart = this.eatWhitespace(text, start, end)
    const endIndex = this.findMatchingAtHead("{", "}", text, nextStart, end)
    if (endIndex === undefined) return undefined

    // Get contents, including leading and trailing whitespace.
    const contents = text.slice(nextStart + 1, endIndex)

    // return a new JSXExpression, advancing beyond the ending `}`.
    return new Token.JSXExpression({
      contents,
      raw: text.slice(start, endIndex + 1),
      offset: start
    })
  }

  // Match JSXText until the one of `{`, `<`, `>` or `}`.
  // NOTE: INCLUDES leading / trailing whitespace.
  @proto JSX_TEXT_END_CHARS = ["{", "<", ">", "}"]

  // TESTME
  matchJSXText(text, start = 0, end) {
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
    return new Token.JSXText({
      value,
      raw: value,
      offset: start
    })
  }

  //
  //  ## Utility functions
  //

  // Return the first char position after `start` which is NOT a whitespace char (space or tab only).
  // If `text[start]` is not whitespace, returns `start`,
  //  so you can call this at any time to skip whitespace in the output.
  eatWhitespace(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return end

    let whiteSpaceEnd = start
    while (whiteSpaceEnd < end && (text[whiteSpaceEnd] === " " || text[whiteSpaceEnd] === "\t")) {
      whiteSpaceEnd++
    }
    return whiteSpaceEnd
  }

  // Return characters up to, but not including, the next newline char after `start`.
  // If `start` is a newline char or start >= end, returns empty string.
  // If at the end of the string (eg: no more newlines), returns from start to end.
  // TESTME
  getLineAtHead(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return ""

    let newline = text.indexOf("\n", start)
    if (newline === -1 || newline > end) newline = end
    return text.slice(start, newline)
  }

  // Match a multi-char string starting at `text[start]`.
  // TESTME
  matchStringAtHead(string, text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    const stringEnd = start + string.length
    if (stringEnd > end) return undefined
    return string === text.slice(start, stringEnd)
  }

  // Match a regular expression starting at `text[start]`, returning the match.
  // Returns `null` if no match.
  //
  // NOTE: The expression MUST start with `/^.../`
  // TESTME
  matchExpressionAtHead(expression, text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length
    if (start >= end) return undefined

    const head = text.slice(start, end)
    return head.match(expression)
  }

  // Find index of the matching SINGLE CHARACTER `endDelimiter` to match `startDelimiter`.
  // Matches nested delimiters and handles escaped delimiters.
  // Assumes `text[start]` is the startDelimiter!
  // Returns numeric index or `undefined` if no match or if first char is not `startDelimiter`.
  //
  //  Also handles nested quotes -- if we encounter a single or double quote,
  //    we'll skip scanning until we find a matching quote.
  //
  //  eg:  `findMatchingAtHead("{", "}", "{aa{a}aa}")` => 8
  // TESTME
  findMatchingAtHead(startDelimiter, endDelimiter, text, start = 0, end) {
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
        current = token.end
        continue // continue so we don't add 1 to curent below
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

  // Return the index of the first NON-ESCAPED character in `chars` after `text[start]`.
  // Returns `undefined` if we didn't find a match.
  // TESTME
  findFirstAtHead(chars, text, start = 0, end) {
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

  //
  // ### Utility
  //

  // Given a set of tokens, slice whitespace (indent, newlinw or normal whitespace) from the front.
  removeLeadingWhitespace(tokens, start = 0) {
    while (tokens[start] instanceof Token.Whitespace) start++
    if (start === 0) return tokens
    return tokens.slice(start)
  }

  //
  // ### Block / indent processing
  //

  // Break tokens into an array of arrays by `Token.Newline`s.
  // Returns an array of lines WITHOUT the `Newline`s but WITH any leading `Token.Indent`s.
  // Lines which are composed solely of whitespace are treated as blank.
  breakIntoLines(tokens) {
    // Convert to lines.
    let currentLine = []
    const lines = [currentLine]
    tokens.forEach(token => {
      // add new array for each newline
      if (token instanceof Token.Newline) {
        // create a new line and push it in
        currentLine = []
        lines.push(currentLine)
      } else {
        // otherwise just add to the current line
        currentLine.push(token)
      }
    })

    // Clear any lines that are only whitespace
    for (let index = 0, last = lines.length; index < last; index++) {
      const line = lines[index]
      if (line.length === 1 && line[0] instanceof Token.Whitespace) lines[index] = []
    }

    return lines
  }

  // Return indents of the specified lines.
  // Indents empty lines (NEWLINEs) into the block AFTER they appear.
  getLineIndents(lines, defaultIndent = 0) {
    if (lines.length === 0) return []

    const indents = lines.map(this.getLineIndent)
    const end = indents.length

    // figure out the indent of the first non-empty line
    let startIndent = getNextIndent(0)
    if (startIndent === undefined) startIndent = defaultIndent

    // indent blank lines to the indent AFTER them
    for (let index = 0; index < end; index++) {
      if (indents[index] === undefined) {
        indents[index] = getNextIndent(index + 1)
      }
    }
    return indents

    // Return the value of the NEXT non-undefined indent.
    function getNextIndent(index) {
      while (index < end) {
        if (indents[index] !== undefined) return indents[index]
        index++
      }
      return startIndent
    }
  }

  // Return the indent of a line of tokens.
  // Returns `0` if not indented.
  // Returns `undefined` if a blank line.
  getLineIndent(line) {
    if (!line || line.length === 0) return undefined
    // skip newline at the start of the line
    const indentIndex = line[0] instanceof Token.Newline ? 1 : 0
    if (line[indentIndex] instanceof Token.Indent) return line[indentIndex].length
    return 0
  }

  // Break `tokens` into a `Token.Block` via leading `Token.Indent`s at the beginning of lines.
  // `block.contents` are the lines/nested blocks found.
  breakIntoBlocks(tokens) {
    // break into lines & return early if no lines
    const lines = this.breakIntoLines(tokens)
    if (lines.length === 0) return []

    // figure out indents
    const indents = this.getLineIndents(lines)

    // First block is at the MINIMUM indent of all lines!
    const minIndent = Math.min(...indents)
    const block = new Token.Block({
      indent: minIndent,
      tokens
    })

    // stack of blocks
    const stack = [block]

    lines.forEach((line, index) => {
      const lineIndent = indents[index]
      let top = stack[stack.length - 1]
      // If indenting, push new block(s)
      if (lineIndent > top.indent) {
        while (lineIndent > top.indent) {
          const newBlock = new Token.Block({
            indent: top.indent + 1
          })
          top.contents.push(newBlock)
          stack.push(newBlock)

          top = newBlock
        }
      }
      // If outdenting: pop block(s)
      else if (lineIndent < top.indent) {
        // TODO: the else isn't necessary... ?
        while (lineIndent < top.indent) {
          stack.pop()
          top = stack[stack.length - 1]
        }
      }
      // add to top block
      top.contents.push(line)
    })

    return [block]
  }
}
