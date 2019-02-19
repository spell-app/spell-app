import ParseError from "./ParseError.js";
import Token from "./Token.js";
import "./utils/polyfill.js";


//
//  # Tokenizer singleton
//  - `.tokenize()`     Breaks up long string into tokens, including newlines, JSX expressions, etc.
//  - `.tokenizeLines()`   Takes the above and breaks it into an array of arrays for each line.
//
// TODO: error checking / reporting, especially in JSX expressions.
// TODO: have normal `tokenize` stick whitespace elements in the stream, then `tokenizeLines()` takes them out?
const Tokenizer = {
  // Should we warn about anomalous conditions?
  WARN: false,

  // Tokenize text between `start` and `end` into an array of `token` `results`.
  //TESTME
  tokenize(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length;
    // quick return out of range or only whitespace
    if (start >= end || !text.trim()) return [];

    // Process our top-level rules.
    const [results, nextStart] = Tokenizer.eatTokens(Tokenizer.matchTopTokens, text, start, end);
    if (results) start = nextStart;
    if (start !== end) {
      if (Tokenizer.WARN)
        console.warn("tokenize(): didn't consume: `", text.slice(start, end) + "`");
    }

    return results;
  },

  // Tokenize string and return tokens WITHOUT whitespace
  tokenizeWithoutWhitespace(text, start, end) {
    return Tokenizer.tokenize(text, start, end)
      .filter(token => !Tokenizer.isNormalWhitespace(token));
  },

  // Repeatedly execute a `method` (bound to `this) which returns a `[result, nextStart]` or `undefined`.
  // Places matched results together in `results` array and returns `[results, nextStart]` for the entire set.
  // Stops if `method` doesn't return anything, or if calling `method` is unproductive.
  //TESTME
  eatTokens(method, text, start = 0, end, results = []) {
    if (typeof end !== "number" || end > text.length) end = text.length;
    if (start >= end) return undefined;

    // process rules repeatedly until we get to the end
    while (start < end) {
      const result = method.call(this, text, start, end);
      if (!result) break;

      const [tokens, nextStart] = result;
      // Bail if we didn't get a productive rule!
      if (start === nextStart) break;

      // handle newResults as an array or single object.
      if (tokens !== undefined) results = results.concat(tokens);
      start = nextStart;
    }
    return [results, start];
  },

  // Match a single top-level token at `text[start]`.
  //TESTME
  matchTopTokens(text, start, end) {
    return (
      Tokenizer.matchWhitespace(text, start, end) ||
      Tokenizer.matchWord(text, start, end) ||
      Tokenizer.matchNumber(text, start, end) ||
      Tokenizer.matchNewline(text, start, end) ||
      Tokenizer.matchJSXElement(text, start, end) ||
      Tokenizer.matchText(text, start, end) ||
      Tokenizer.matchComment(text, start, end) ||
      Tokenizer.matchSymbol(text, start, end)
    );
  },

  //
  //  ### Symbol character
  //

  // Match the single "symbol" character at `text[start]`.
  // NOTE: This does not do any checking, it just blindly uses the character in question.
  //     You should make sure all other possible rules have been exhausted first.
  matchSymbol(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length;
    if (start >= end) return undefined;
    const token = new Token.Literal({
      value: text[start],
      start,
      end: start + 1
    });
    return [token, token.end];
  },

  //
  //  ### Whitespace
  //

  //
  //  ### Whitespace
  //  NOTE: Whitespace at the beginning of `text` or the beginning of a line
  //      is considered an "indent" and will have `.isIndent === true`.
  //

  // Convert a run of spaces and/or tabs into a `Token.Whitespace`.
  matchWhitespace(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length;
    if (start >= end) return undefined;

    const whitespaceEnd = Tokenizer.eatWhitespace(text, start, end);
    // forget it if no forward motion
    if (whitespaceEnd === start) return undefined;

    const props = {
      value: text.slice(start, whitespaceEnd),
      start,
      end: whitespaceEnd
    }
    const token = (start === 0 || text[start - 1] === "\n")
      ? new Token.Indent(props)
      : new Token.Whitespace(props);

    return [token, token.end];
  },

  //
  //  ### Newline
  //

  // Match a single newline character at `text[start]`.
  // Returns `[Token.Newline, nextStart]` on match.
  // Otherwise returns `undefined`.
  matchNewline(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length;
    if (start >= end || text[start] !== "\n") return undefined;
    const token = new Token.Newline({ start, end: start + 1});
    return [token, token.end];
  },

  //
  //  ### Word
  //

  // Match a single `word` in `text` at character `start`.
  // Returns `[word, wordEnd]`.
  // Returns an empty array if couldn't match a word.
  WORD_START: /[A-Za-z]/,
  WORD_CHAR: /^[\w_-]/,
  matchWord(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length;
    if (start >= end) return undefined;

    if (!Tokenizer.WORD_START.test(text[start])) return undefined;

    let wordEnd = start + 1;
    while (wordEnd < end && Tokenizer.WORD_CHAR.test(text[wordEnd])) {
      wordEnd++;
    }
    if (wordEnd === start) return undefined;

    const value = text.slice(start, wordEnd);
    const token = new Token.Literal({ value, start, end: wordEnd });
    return [token, token.end];
  },

  //
  //  ### Numbers
  //

  // Eat a single number.
  // Returns a `Number` if matched.
  NUMBER_START: /[0-9-.]/,
  NUMBER: /^-?([0-9]*\.)?[0-9]+/,
  matchNumber(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length;
    if (start >= end) return undefined;

    if (!Tokenizer.NUMBER_START.test(text[start])) return undefined;

    const numberMatch = Tokenizer.matchExpressionAtHead(Tokenizer.NUMBER, text, start, end);
    if (!numberMatch) return undefined;

    const input = numberMatch[0];
    const value = parseFloat(input, 10);
    const token = new Token.Number({
      value,
      input,
      start,
      end: start + input.length
    });
    return [token, token.end];
  },

  //
  //  ### Text literal
  //

  // Eat a text literal (starts/ends with `'` or `"`).
  // Returns a `Tokenizer.Text` if matched.
  //TESTME:  not sure the escaping logic is really right...
  matchText(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length;
    if (start >= end) return undefined;

    const quoteSymbol = text[start];
    if (quoteSymbol !== '"' && quoteSymbol !== "'") return undefined;

    let textEnd = start + 1;
    while (textEnd < end) {
      const char = text[textEnd];
      if (char === quoteSymbol) break;
      // if we get a backquote, ignore quote in next char
      if (char === "\\" && text[textEnd + 1] === quoteSymbol) textEnd++;
      textEnd++;
    }
    // Forget it if we didn't end with the quote symbol
    if (text[textEnd] !== quoteSymbol) return undefined;
    // advance past end quote
    textEnd++;

    const value = text.slice(start, textEnd);
    const token = new Token.Text({
      value,
      start,
      end: textEnd
    });
    return [token, token.end];
  },

  //
  //  ### Comments
  //

  // Eat a single line comment (comment symbol until the end of the line).
  // Comments can start with:
  //    `##`
  //    `--`
  //    `//`
  // Returns a `Tokenizer.Comment` if matched.
  COMMENT: /^(##+|--+|\/\/+)(\s*)(.*)/,
  matchComment(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length;
    if (start >= end) return undefined;

    const commentStart = text.slice(start, start + 2);
    if (commentStart !== "--" && commentStart !== "//" && commentStart !== "##") return undefined;

    // comment eats until the end of the line
    const line = Tokenizer.getLineAtHead(text, start, end);
    const commentMatch = line.match(Tokenizer.COMMENT);
    if (!commentMatch) return undefined;

    const [_match, commentSymbol, whitespace, comment] = commentMatch;
    const token = new Token.Comment({
      commentSymbol,
      whitespace,
      comment,
      start,
      end: start + line.length
    });
    return [token, token.end];
  },

  //
  //  ### JSX
  //

  // Eat a (nested) JSX expression.
  //TESTME
  matchJSXElement(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length;
    if (start >= end) return undefined;

    let [jsxElement, nextStart] = Tokenizer.matchJSXStartTag(text, start, end) || [];
    if (!jsxElement) return undefined;

    if (!jsxElement.isUnaryTag) {
      const [children, childEnd] = Tokenizer.matchJSXChildren(jsxElement.tagName, text, nextStart, end);
      if (children.length) {
        jsxElement.children = children;
        nextStart = childEnd;
      }
    }

    return [jsxElement, nextStart];
  },


  // Match JSX start tag and internal elements (but NOT children).
  // Returns `[jsxElement, nextStart]` or `undefined`.
  // Use `matchJSXElement()` to match children, end tag, etc.
  // Ignores leading whitespace.
  JSX_TAG_START: /^<([A-Za-z][\w-\.]*)(\s*\/>|\s*>|\s+)/,
  // TODO: clean this stuff up, maybe with findFirstAtHead?
  matchJSXStartTag(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length;
    if (start >= end) return undefined;

    let nextStart = Tokenizer.eatWhitespace(text, start, end);
    // Make sure we start with `<`.
    if (text[nextStart] !== "<") return undefined;

    const tagMatch = Tokenizer.matchExpressionAtHead(Tokenizer.JSX_TAG_START, text, nextStart, end);
    if (!tagMatch) return undefined;

    let [matchText, tagName, endBit] = tagMatch;
    nextStart = nextStart + matchText.length;

    const jsxElement = new Token.JSXElement({
      tagName,
      start,
      end: nextStart
    });

    // If unary tag, mark as such and return.
    endBit = endBit.trim();
    if (endBit === "/>") {
      jsxElement.isUnaryTag = true;
      return [jsxElement, nextStart];
    }

    // If we didn't immediately get an end marker, attempt to match attributes
    if (endBit !== ">" && endBit !== "/>") {
      const [attrs, attrEnd] = Tokenizer.eatTokens(Tokenizer.matchJSXAttribute, text, nextStart, end);
      jsxElement.attributes = attrs;
      jsxElement.end = (nextStart = attrEnd);
    }

    // at this point we should get an `/>` or `>` (with no whitespace).
    if (text[nextStart] === "/" && text[nextStart + 1] === ">") {
      endBit = "/>";
      jsxElement.end = (nextStart += 2);
    } else if (text[nextStart] === ">") {
      endBit = text[nextStart];
      jsxElement.end = (nextStart += 1);
    }

    // Return immediately for unary tag
    if (endBit === "/>") {
      jsxElement.isUnaryTag = true;
      jsxElement.end = nextStart;
    }
    else if (endBit !== ">") {
      if (Tokenizer.WARN) {
        console.warn(
          "Missing expected end `>` for jsxElement",
          jsxElement,
          "`" + text.slice(start, nextStart) + "`"
        );
      }
      jsxElement.error = "No end >";
    }
    return [jsxElement, jsxElement.end];
  },

  //
  //  ### JSX children
  //

  // Match JSX element children of `<tagName>` at `text[start]`.
  // Matches nested children and stops after matching end tag: `</tagName>`.
  // Returns `[children, nextStart]`.
  //TESTME
  matchJSXChildren(tagName, text, start, end) {
    if (typeof end !== "number" || end > text.length) end = text.length;
    if (start >= end) return undefined;

    const children = [];
    let nesting = 1;
    const endTag = `</${tagName}>`;

    let nextStart = start;
    while (true) {
      const result = Tokenizer.matchJSXChild(endTag, text, nextStart, end);
      if (!result) break;

      const [child, childEnd] = result;
      nextStart = childEnd;
      // If we got the endTag, update nesting and break out of loop if nesting !== 0
      if (child === endTag) {
        nesting--;
        if (nesting === 0) break;
        continue;
      } else {
        if (child) children.push(child);
      }
    }
    // TODO: how to surface this error???
    if (nesting !== 0) {
      if (Tokenizer.WARN) {
        console.warn(
          `matchJSXChildren(${text.slice(start, nextStart + 10)}: didn't match end child!`
        );
      }
    }
    return [children, nextStart];
  },

  // Match a single JSX child:
  //  - current endTag
  //  - `{ jsx expression }`
  //  - nested JSX element
  //  - (anything else) as jsxText expression.
  matchJSXChild(endTag, text, start = 0, end) {
    return (
      Tokenizer.matchJSXEndTag(endTag, text, start, end) ||
      Tokenizer.matchJSXExpression(text, start, end) ||
      Tokenizer.matchJSXElement(text, start, end) ||
      // TODO: newline and indent?
      Tokenizer.matchJSXText(text, start, end)
    );
  },

  // Attempt to match a specific end tag.
  // Ignores leading whitespace.
  matchJSXEndTag(endTag, text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length;
    if (start >= end) return undefined;

    const nextStart = Tokenizer.eatWhitespace(text, start, end);
    if (!Tokenizer.matchStringAtHead(endTag, text, nextStart, end)) return undefined;
    return [endTag, nextStart + endTag.length];
  },

  //
  //  ### JSX attributes
  //

  // Match a single JSX element attribute as `<attr>={<value>}`
  // TODO: {...xxx}
  JSX_ATTRIBUTE_START: /^\s*([\w-]+\b)\s*(=?)\s*/,
  matchJSXAttribute(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length;
    if (start >= end) return undefined;

    // attributes must start with a word character
    if (!Tokenizer.WORD_START.test(text[start])) return undefined;

    // attempt to match an attribute name, including `=` if present.
    const result = Tokenizer.matchExpressionAtHead(Tokenizer.JSX_ATTRIBUTE_START, text, start, end);
    if (!result) return undefined;

    const [match, name, equals] = result;
    let nextStart = start + match.length;
    const attribute = new Token.JSXAttribute(name);

    // if there was an equals char, parse the value
    if (equals) {
      const [value, valueEnd] = Tokenizer.matchJSXAttributeValue(text, nextStart, end) || [];
      if (value) {
        attribute.value = value;
        nextStart = valueEnd;
      }
    }
    // eat whitespace before the next attribute / tag end
    nextStart = Tokenizer.eatWhitespace(text, nextStart, end);
    return [attribute, nextStart];
  },

  // Match a value expression for a JSX element attribute:
  // NOTE: we will be called immediately after the `=` (and subsequent whitespace).
  matchJSXAttributeValue(text, start, end) {
    return (
      Tokenizer.matchText(text, start, end) ||
      Tokenizer.matchJSXExpression(text, start, end) ||
      Tokenizer.matchJSXElement(text, start, end) ||
      Tokenizer.matchJSXAttributeValueIdentifier(text, start, end) ||
      Tokenizer.matchNumber(text, start, end)
    );
  },

  // Match a single identifer as a JSX attribute value.
  // Returns as a `JSXExpression`.
  matchJSXAttributeValueIdentifier(text, start, end) {
    const result = Tokenizer.matchWord(text, start, end);
    if (!result) return;

    const [word, nextStart] = result;
    const token = new Token.JSXExpression(word);
    return [token, nextStart];
  },

  // Match a JSX expression enclosed in curly braces, eg:  `{ ... }`.
  //  Handles nested curlies, quotes, etc.
  // Returns array of tokens of internal match.
  // Ignores leading whitespace.
  //TODO: newlines/indents???
  //TODO: {...xxx}
  //TESTME
  matchJSXExpression(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length;
    if (start >= end) return undefined;

    let nextStart = Tokenizer.eatWhitespace(text, start, end);
    const endIndex = Tokenizer.findMatchingAtHead("{", "}", text, nextStart, end);
    if (endIndex === undefined) return undefined;

    // Get contents, including leading and trailing whitespace.
    const contents = text.slice(start + 1, endIndex);

    // return a new JSXExpression, advancing beyond the ending `}`.
    const expression = new Token.JSXExpression(contents);
    return [expression, endIndex + 1];
  },

  // Match JSXText until the one of `{`, `<`, `>` or `}`.
  // NOTE: INCLUDES leading / trailing whitespace.
  JSX_TEXT_END_CHARS: ["{", "<", ">", "}"],
  //TESTME
  matchJSXText(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length;
    if (start >= end) return undefined;

    // temporarily advance past whitespace (we'll include it in the output).
    const nextStart = Tokenizer.eatWhitespace(text, start, end);
    const endIndex = Tokenizer.findFirstAtHead(Tokenizer.JSX_TEXT_END_CHARS, text, nextStart, end);
    // If the first non-whitespace char is in our END_CHARS, forget it.
    if (endIndex === nextStart) return undefined;

    // if no match, we've got some sort of error
    if (endIndex === undefined) {
      if (Tokenizer.WARN) {
        console.warn(
          "matchJSXText(" + text.slice(start, start + 50) + "): JSX seems to be unbalanced."
        );
      }
      return undefined;
    }

    // include leading whitespace in the output.
    const jsxText = text.slice(start, endIndex);
    return [jsxText, endIndex];
  },

  //
  //  ## Utility functions
  //

  // Return the first char position after `start` which is NOT a whitespace char (space or tab only).
  // If `text[start]` is not whitespace, returns `start`,
  //  so you can call this at any time to skip whitespace in the output.
  eatWhitespace(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length;
    if (start >= end) return end;

    let whiteSpaceEnd = start;
    while (whiteSpaceEnd < end && (text[whiteSpaceEnd] === " " || text[whiteSpaceEnd] === "\t")) {
      whiteSpaceEnd++;
    }
    return whiteSpaceEnd;
  },

  // Return characters up to, but not including, the next newline char after `start`.
  // If `start` is a newline char or start >= end, returns empty string.
  // If at the end of the string (eg: no more newlines), returns from start to end.
  //TESTME
  getLineAtHead(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length;
    if (start >= end) return "";

    let newline = text.indexOf("\n", start);
    if (newline === -1 || newline > end) newline = end;
    return text.slice(start, newline);
  },

  // Match a multi-char string starting at `text[start]`.
  //TESTME
  matchStringAtHead(string, text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length;
    if (start >= end) return undefined;

    const stringEnd = start + string.length;
    if (stringEnd > end) return undefined;
    return string === text.slice(start, stringEnd);
  },

  // Match a regular expression starting at `text[start]`, returning the match.
  // Returns `null` if no match.
  //
  // NOTE: The expression MUST start with `/^.../`
  //TESTME
  matchExpressionAtHead(expression, text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length;
    if (start >= end) return undefined;

    const head = text.slice(start, end);
    return head.match(expression);
  },

  // Find index of the matching SINGLE CHARACTER `endDelimiter` to match `startDelimiter`.
  // Matches nested delimiters and handles escaped delimiters.
  // Assumes `text[start]` is the startDelimiter!
  // Returns numeric index or `undefined` if no match or if first char is not `startDelimiter`.
  //
  //  Also handles nested quotes -- if we encounter a single or double quote,
  //    we'll skip scanning until we find a matching quote.
  //
  //  eg:  `findMatchingAtHead("{", "}", "{aa{a}aa}")` => 8
  //TESTME
  findMatchingAtHead(startDelimiter, endDelimiter, text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length;
    if (start >= end) return undefined;

    if (text[start] !== startDelimiter) return undefined;

    let nesting = 0;
    let current = start;
    while (current < end) {
      const char = text[current];
      // if startDelimiter, increase nesting
      if (char === startDelimiter) {
        nesting++;
      }
      // if endDelimiter, decrease nesting and return if nesting back to 0
      else if (char === endDelimiter) {
        nesting--;
        if (nesting === 0) return current;
      }
      // if a single or double quote, skip until the matching quote
      else if (char === "'" || char === '"') {
        const [_token, afterQuote] = Tokenizer.matchText(text, current, end) || [];
        current = afterQuote;
        continue; // continue so we don't add 1 to curent below
      }
      // If backslash, skip an extra char if it's either delimiter or a quote
      else if (char === "\\") {
        char = text[current + 1];
        if (char === startDelimiter || char === endDelimiter || char === "'" || char === '"') {
          current++;
        }
      }
      current++;
    }
  },

  // Return the index of the first NON-ESCAPED character in `chars` after `text[start]`.
  // Returns `undefined` if we didn't find a match.
  //TESTME
  findFirstAtHead(chars, text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length;
    if (start >= end) return undefined;

    while (start < end) {
      const char = text[start];
      if (chars.includes(char)) return start;
      // if we got an escape char, ignore the next char if it's in `chars`
      if (char === "\\" && chars.includes(text[start + 1])) start++;
      start++;
    }
    if (start >= end) return undefined;
    return start;
  },

  //
  // ### Utility
  //

  // Given a set of tokens, slice whitespace (indent, newlinw or normal whitespace) from the front.
  removeLeadingWhitespace(tokens, start = 0) {
    while (tokens[start] instanceof Token.Whitespace) start++;
    if (start === 0) return tokens;
    return tokens.slice(start);
  },

  // Given a set of tokens, remove ALL "normal" whitespace tokens (NOT indent or newline).
  removeNormalWhitespace(tokens) {
    return tokens.filter(token => !Tokenizer.isNormalWhitespace(token));
  },

  // Return `true` if `token` is "normal" whitespce (not a newline or indent)
  isNormalWhitespace(token) {
    return (
      token instanceof Token.Whitespace &&
      !(token instanceof Token.Indent) &&
      !(token instanceof Token.Newline)
    );
  },

  //
  // ### Block / indent processing
  //

  // Break tokens into an array of arrays by `NEWLINE`s.
  // Returns an array of lines WITHOUT the `NEWLINE`s.
  // Lines which are composed solely of whitespace are treated as blank.
  breakIntoLines(tokens) {
    // Convert to lines.
    let currentLine = [];
    const lines = [currentLine];
    tokens.forEach(token => {
      // add new array for each newline
      if (token instanceof Token.Newline) {
        // create a new line and push it in
        currentLine = [];
        return lines.push(currentLine);
      }

      // otherwise just add to the current line
      currentLine.push(token);
    });

    // Clear any lines that are only whitespace
    lines.forEach((line, index) => {
      if (line.length === 1 && line[0] instanceof Token.Whitespace) lines[index] = [];
    });

    return lines;
  },

  // Return indents of the specified lines.
  // Indents empty lines (NEWLINEs) into the block AFTER they appear.
  getLineIndents(lines, defaultIndent = 0) {
    if (lines.length === 0) return [];

    const indents = lines.map(Tokenizer.getLineIndent);
    const end = indents.length;

    // figure out the indent of the first non-empty line
    let startIndent = getNextIndent(0);
    if (startIndent === undefined) startIndent = defaultIndent;

    // indent blank lines to the indent AFTER them
    for (var index = 0; index < end; index++) {
      if (indents[index] === undefined) {
        indents[index] = getNextIndent(index + 1);
      }
    }
    return indents;

    // Return the value of the NEXT non-undefined indent.
    function getNextIndent(index) {
      while (index < end) {
        if (indents[index] !== undefined) return indents[index];
        index++;
      }
      return startIndent;
    }
  },

  // Return the indent of a line of tokens.
  // Returns `0` if not indented.
  // Returns `undefined` if a blank line.
  getLineIndent(line) {
    if (!line || line.length === 0) return undefined;
    if (line[0] instanceof Token.Indent) return line[0].length;
    return 0;
  },

  // Break `tokens` between `start` and `end` into a `Token.Block` with nested `contents`.
  // Skips "normal" whitespace and indents in the results.
  breakIntoBlocks: function(tokens, start = 0, end = tokens.length) {
    // restrict to tokens of interest
    tokens = tokens.slice(start, end);
    // remove "normal" whitespace
    //TODO: better to leave this to consumers???
    tokens = Tokenizer.removeNormalWhitespace(tokens);

    // break into lines & return early if no lines
    const lines = Tokenizer.breakIntoLines(tokens);
    if (lines.length === 0) return [];

    // figure out indents
    const indents = Tokenizer.getLineIndents(lines);

    // First block is at the MINIMUM indent of all lines!
    const maxIndent = Math.min.apply(Math, indents);
    const block = new Token.Block({ indent: maxIndent });

    // stack of blocks
    const stack = [block];

    lines.forEach((line, index) => {
      // Remove leading whitespace (eg: indents)
      line = Tokenizer.removeLeadingWhitespace(line);

      const lineIndent = indents[index];
      let top = stack[stack.length - 1];
      // If indenting, push new block(s)
      if (lineIndent > top.indent) {
        while (lineIndent > top.indent) {
          var newBlock = new Token.Block({ indent: top.indent + 1 });
          top.contents.push(newBlock);
          stack.push(newBlock);

          top = newBlock;
        }
      }
      // If outdenting: pop block(s)
      else if (lineIndent < top.indent) {     // TODO: the else isn't necessary... ?
        while (lineIndent < top.indent) {
          stack.pop();
          top = stack[stack.length - 1];
        }
      }
      // add to top block
      top.contents.push(line);
      if (top.tokens.length > 0) top.tokens.push(new Token.Newline());
      top.tokens = top.tokens.concat(line);
    });

    return block;
  },

  // Find the matching instance of (possibly nested) `endToken` to balance `startToken`
  //  in array of `tokens` (strings).
  // If successful, returns `{ start, end, slice }`
  // Throws if unsucessful.
  findNestedTokens(tokens, startToken, endToken, start = 0) {
    if (tokens[start] !== startToken)
      throw new ParseError(`Expected '${startToken}' at index ${start} of tokens`);
    let nesting = 0;
    let nested = false;
    for (let end = start + 1, lastIndex = tokens.length; end < lastIndex; end++) {
      const token = tokens[end];
      if (token === startToken) {
        nesting++;
        nested = true;
      }
      if (token === endToken) {
        if (nesting === 0) return { start, end, slice: tokens.slice(start + 1, end), nested };
        nesting--;
      }
    }
    throw new ParseError(`Couldn't find matching '${endToken}'s starting at item ${start}`);
  },

  //
  //  Matching functions for using during parsing.
  //


  //
  //  Matching tokens using an array of `literals`.
  //  Returns numeric index where match was found.
  //  Returns `false` if no found.

  // Match a single literal value.
  tokenMatchesLiteral(token, literal) {
    return token.value === literal;
  },

  // Match a run of `literals`, starting at `start`.
  matchLiteralsAtStart(literals, tokens, start = 0, end = tokens.length) {
    const length = literals.length;
    if (start + length > end) return false;

    // Quick return if only one.
    if (length === 1) {
      return Tokenizer.tokenMatchesLiteral(tokens[start], literals[0])
        ? start
        : false;
    }

    // if more than one, make sure all the rest match
    for (let i = 0; i < length; i++) {
      if (!Tokenizer.tokenMatchesLiteral(tokens[start + i], literals[i])) return false;
    }
    return start;
  },

  // Match a run of `literals`, starting anywhere from `start` to `end`.
  matchLiteralsAnywhere(literals, tokens, start = 0, end = tokens.length) {
    for (var index = start; index < end; index++) {
      const result = Tokenizer.matchLiteralsAtStart(literals, tokens, index, end);
      if (result !== false) return index;
    }
    return false;
  },


  //
  //  Matching tokens using a single regex pattern, including blacklist support.
  //  Returns numeric index where match was found.
  //  Returns `false` if no found.
  //

  // Match a single pattern/blacklist.
  // Returns `true` if matched, else `false`.
  tokenMatchesPattern(token, pattern, blacklist) {
    if (!pattern.test(token.value)) return false;
    if (blacklist && blacklist[token]) return false;
    return true;
  },

  // Execute a `pattern` against `token`, returning `match[0]`.
  // If `blacklist` is provided, returns `undefined` if match is in blacklist.
  // Returns `undefined` if no match.
  executePattern(token, pattern, blacklist) {
    const result = pattern.exec(token.value);
    if (!result) return undefined;
    const match = result[0];
    if (blacklist && blacklist[match]) return undefined;
    return match;
  },

  // Match a single pattern/blacklist at `start`.
  matchPatternAtStart(pattern, blacklist, tokens, start = 0, end = tokens.length) {
    if (start < end && Tokenizer.tokenMatchesPattern(tokens[start], pattern, blacklist)) return start;
    return false;
  },

  // Match a single pattern/blacklist anywhere from `start` to `end`.
  matchPatternAnywhere(pattern, blacklist, tokens, start = 0, end = tokens.length) {
    for (var index = start; index < end; index++) {
      if (Tokenizer.tokenMatchesPattern(tokens[index], pattern, blacklist)) return index;
    }
    return false;
  },


  //
  //  Match tokens using Javascript `instanceof <constructor>` operator.
  //  Returns numeric index where match was found.
  //  Returns `false` if no found.
  //
  tokenIsInstanceOf(token, constructor) {
    return token instanceof constructor;
  },

  matchInstanceOfAtStart(constructor, tokens, start = 0, end = tokens.length) {
    if (start < end && Tokenizer.tokenIsInstanceOf(tokens[start], constructor)) return start;
    return false;
  },

  matchInstanceOfAnywhere(constructor, tokens, start = 0, end = tokens.length) {
    for (var index = start; index < end; index++) {
      if (Tokenizer.tokenIsInstanceOf(tokens[index], constructor)) return index;
    }
    return false;
  },

};

export default Tokenizer;
