import ParseError from "./ParseError.js";

// GRRR... node doesn't include this???
// CHECK DIFFERENT NODE VERSIONS...
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, "includes", {
    value: function(value, start) {
      let index = this.indexOf(value, start);
      return index !== -1;
    }
  });
}


class token {
  constructor(props) {
    Object.assign(this, props);
  }
}

// `whitespace` class for normal (non-indent, non-newline) whitespace.
class whitespace extends token{
  constructor(whitespace) {
    super();
    this.whitespace = whitespace;
  }

  // Return the "length" of this whitespace, eg for an indent.
  get length() {
    return this.whitespace.length;
  }

  toString() {
    return this.whitespace;
  }
}

// `indent` class.
class indent extends whitespace {}

// Newline singleton.
class newline extends whitespace {}

//
//  # Tokenizer
//  - `.tokenize()`     Breaks up long string into tokens, including newlines, JSX expressions, etc.
//  - `.tokenizeLines()`   Takes the above and breaks it into an array of arrays for each line.
//
// TODO: error checking / reporting, especially in JSX expressions.
// TODO: have normal `tokenize` stick whitespace elements in the stream, then `tokenizeLines()` takes them out?
const Tokenizer = {
  // Should we warn about anomalous conditions?
  WARN: false,

  // Default token constructor
  Token: token,

  // Whitespace constructor.
  Whitespace: whitespace,

  // Indent constructor
  Indent: indent,

  // NEWLINE singleton.
  NEWLINE: new newline("\n"),

  // Tokenize text between `start` and `end` into an array of `results`, an array of:
  //  - `Tokenizer.NEWLINE` for a newline symbol
  //  - strings for keywords/symbols
  //  - numbers for number literals
  //  - `{ indent: number }` for indent at start of line
  //  - `{ type: "text", literal: "'abc'", text: "abc" }
  //  - `{ type: "indent", level: 7 }`
  //  - `{ type: "comment", comment: "string", commentSymbol, whitespace }`
  //TESTME
  tokenize(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length;
    // quick return out of range or only whitespace
    if (start >= end || !text.trim()) return [];

    // Process our top-level rules.
    let [results, nextStart] = Tokenizer.eatTokens(Tokenizer.matchTopTokens, text, start, end);
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
      let result = method.call(this, text, start, end);
      if (!result) break;

      let [tokens, nextStart] = result;
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

    return [text[start], start + 1];
  },

  //
  //  ### Whitespace
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

  //
  //  ### Whitespace
  //  NOTE: Whitespace at the beginning of `text` or the beginning of a line
  //      is considered an "indent" and will have `.isIndent === true`.
  //

  // Convert a run of spaces and/or tabs into a `Tokenizer.Whitespace`.
  matchWhitespace(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length;
    if (start >= end) return undefined;

    let whitespaceEnd = Tokenizer.eatWhitespace(text, start, end);
    // forget it if no forward motion
    if (whitespaceEnd === start) return undefined;

    let whitespace = text.slice(start, whitespaceEnd);
    let token;
    if (start === 0 || text[start - 1] === "\n") token = new Tokenizer.Indent(whitespace);
    else token = new Tokenizer.Whitespace(whitespace);

    return [token, whitespaceEnd];
  },

  //
  //  ### Newline
  //

  // Match a single newline character at `text[start]`.
  // Returns `[Tokenizer.NEWLINE, nextStart]` on match.
  // Otherwise returns `undefined`.
  matchNewline(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length;
    if (start >= end || text[start] !== "\n") return undefined;

    return [Tokenizer.NEWLINE, start + 1];
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

    let word = text.slice(start, wordEnd);
    return [word, wordEnd];
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

    let numberMatch = Tokenizer.matchExpressionAtHead(Tokenizer.NUMBER, text, start, end);
    if (!numberMatch) return undefined;

    let numberStr = numberMatch[0];
    let number = parseFloat(numberStr, 10);
    return [number, start + numberStr.length];
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

    let quoteSymbol = text[start];
    if (quoteSymbol !== '"' && quoteSymbol !== "'") return undefined;

    let textEnd = start + 1;
    while (textEnd < end) {
      let char = text[textEnd];
      if (char === quoteSymbol) break;
      // if we get a backquote, ignore quote in next char
      if (char === "\\" && text[textEnd + 1] === quoteSymbol) textEnd++;
      textEnd++;
    }
    // Forget it if we didn't end with the quote symbol
    if (text[textEnd] !== quoteSymbol) return undefined;
    // advance past end quote
    textEnd++;

    let quotedString = text.slice(start, textEnd);
    let token = new Tokenizer.Text(quotedString);
    return [token, textEnd];
  },

  // `Text` class for string literals.
  // Pass the literal value, use `.text` to get just the bit inside the quotes.
  Text: class text extends token {
    constructor(quotedString) {
      super();
      this.quotedString = quotedString;
    }
    get text() {
      let string = this.quotedString;
      // calculate `text` as the bits between the quotes.
      let start = 0;
      let end = string.length;
      if (string[start] === '"' || string[start] === "'") start = 1;
      if (string[end - 1] === '"' || string[end - 1] === "'") end = -1;
      return string.slice(start, end);
    }
    toString() {
      return this.quotedString;
    }
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

    let commentStart = text.slice(start, start + 2);
    if (commentStart !== "--" && commentStart !== "//" && commentStart !== "##") return undefined;

    // comment eats until the end of the line
    let line = Tokenizer.getLineAtHead(text, start, end);
    let commentMatch = line.match(Tokenizer.COMMENT);
    if (!commentMatch) return undefined;

    let [_match, commentSymbol, whitespace, comment] = commentMatch;
    let token = new Tokenizer.Comment({ commentSymbol, whitespace, comment });
    return [token, start + line.length];
  },

  // Comment class
  //TESTME
  Comment: class comment extends token {
    toString() {
      return `${this.commentSymbol}${this.whitespace}${this.comment}`;
    }
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
      let [children, childEnd] = Tokenizer.matchJSXChildren(jsxElement.tagName, text, nextStart, end);
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

    let tagMatch = Tokenizer.matchExpressionAtHead(Tokenizer.JSX_TAG_START, text, nextStart, end);
    if (!tagMatch) return undefined;

    let [matchText, tagName, endBit] = tagMatch;
    let jsxElement = new Tokenizer.JSXElement(tagName);
    nextStart = nextStart + matchText.length;

    // If unary tag, mark as such and return.
    endBit = endBit.trim();
    if (endBit === "/>") {
      jsxElement.isUnaryTag = true;
      return [jsxElement, nextStart];
    }

    // If we didn't immediately get an end marker, attempt to match attributes
    if (endBit !== ">" && endBit !== "/>") {
      let [attrs, attrEnd] = Tokenizer.eatTokens(Tokenizer.matchJSXAttribute, text, nextStart, end);
      jsxElement.attributes = attrs;
      nextStart = attrEnd;
    }

    // at this point we should get an `/>` or `>` (with no whitespace).
    if (text[nextStart] === "/" && text[nextStart + 1] === ">") {
      endBit = "/>";
      nextStart += 2;
    } else if (text[nextStart] === ">") {
      endBit = text[nextStart];
      nextStart += 1;
    }

    // Return immediately for unary tag
    if (endBit === "/>") {
      jsxElement.isUnaryTag = true;
      return [jsxElement, nextStart];
    }

    // advance past `>`
    if (endBit !== ">") {
      if (Tokenizer.WARN) {
        console.warn(
          "Missing expected end `>` for jsxElement",
          jsxElement,
          "`" + text.slice(start, nextStart) + "`"
        );
      }
      jsxElement.error = "No end >";
      return [jsxElement, nextStart];
    }

    return [jsxElement, nextStart];
  },

  // JSX element class
  JSXElement: class jsxElement extends token{
    constructor(tagName, attributes, children) {
      super();
      this.tagName = tagName;
      if (attributes) this.attributes = attributes;
      if (children) this.children = children;
    }

    // Return attributes as a map.
    //TESTME
    get attrs() {
      let attrs = {};
      if (this.attributes)
        this.attributes.forEach(attr => {
          // ignore unnamed attributes
          if (attr.name) attrs[attr.name] = attr.value;
        });
      return attrs;
    }

    // Return our attributes as a string (used in toString only)
    //TESTME
    get attrsAsString() {
      if (!this.attributes) return "";
      return (
        " " +
        this.attributes
          .map(({ value }) => {
            if (value === undefined) return "true";
            // convert value array (tokens) to string
            // TODO: this will want to be smarter...
            if (Array.isArray(value)) value = `{${value.join(" ")}}`;
            return `name=${value}`;
          })
          .join(" ")
      );
    }

    // Return our children as a string  (used in toString only)
    //TESTME
    get childrenAsString() {
      if (!this.children) return "";
      return this.children
        .map(child => {
          if (Array.isArray(child)) return `{${child.join(" ")}}`;
          return "" + child;
        })
        .join("");
    }

    //TESTME
    toString() {
      let attrs = this.attrsAsString;
      let children = this.childrenAsString;
      if (this.isUnaryTag) return `<${this.tagName}${attrs}/>`;
      return `<${this.tagName}${attrs}>${children}</${this.tagName}>`;
    }
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

    let children = [];
    let nesting = 1;
    let endTag = `</${tagName}>`;

    let nextStart = start;
    while (true) {
      let result = Tokenizer.matchJSXChild(endTag, text, nextStart, end);
      if (!result) break;

      let [child, childEnd] = result;
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

    let nextStart = Tokenizer.eatWhitespace(text, start, end);
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
    let result = Tokenizer.matchExpressionAtHead(Tokenizer.JSX_ATTRIBUTE_START, text, start, end);
    if (!result) return undefined;

    let [match, name, equals] = result;
    let nextStart = start + match.length;
    let attribute = new Tokenizer.JSXAttribute(name);

    // if there was an equals char, parse the value
    if (equals) {
      let [value, valueEnd] = Tokenizer.matchJSXAttributeValue(text, nextStart, end) || [];
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
    let result = Tokenizer.matchWord(text, start, end);
    if (!result) return;

    let [word, nextStart] = result;
    let token = new Tokenizer.JSXExpression(word);
    return [token, nextStart];
  },

  // JSX attribute class
  // `name` is the name of the attribute.
  // `value` is one of:
  //    - `'...'`      // Text (literal string).
  //    - `"..."`      // Text (literal string).
  //    - `{...}`      // Expression.  Results will be tokenized array.
  //    - `<....>`      // JSX element.
  //    - `1`        // Number.  Note: this is an extension to JSX.

  JSXAttribute: class jsxAttribute {
    constructor(name, value) {
      this.name = name;
      if (value !== undefined) this.value = value;
    }
    toString() {
      if (this.value === undefined) return this.name;
      return `${this.name}={${this.value}}`;
    }
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
    let endIndex = Tokenizer.findMatchingAtHead("{", "}", text, nextStart, end);
    if (endIndex === undefined) return undefined;

    // Get contents, including leading and trailing whitespace.
    let contents = text.slice(start + 1, endIndex);

    // return a new JSXExpression, advancing beyond the ending `}`.
    let expression = new Tokenizer.JSXExpression(contents);
    return [expression, endIndex + 1];
  },

  // JSX expression, composed of inline tokens which should yield an `expression`.
  JSXExpression: class jsxExpression {
    constructor(contents) {
      this.contents = contents || "";
    }
    // Divide contents into `tokens`.
    get tokens() {
      return Tokenizer.tokenize(this.contents.trim());
    }
  },

  // Match JSXText until the one of `{`, `<`, `>` or `}`.
  // NOTE: INCLUDES leading / trailing whitespace.
  JSX_TEXT_END_CHARS: ["{", "<", ">", "}"],
  //TESTME
  matchJSXText(text, start = 0, end) {
    if (typeof end !== "number" || end > text.length) end = text.length;
    if (start >= end) return undefined;

    // temporarily advance past whitespace (we'll include it in the output).
    let nextStart = Tokenizer.eatWhitespace(text, start, end);
    let endIndex = Tokenizer.findFirstAtHead(Tokenizer.JSX_TEXT_END_CHARS, text, nextStart, end);
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
    let jsxText = text.slice(start, endIndex);
    return [jsxText, endIndex];
  },

  //
  //  ## Utility functions
  //

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

    let stringEnd = start + string.length;
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

    let head = text.slice(start, end);
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
      let char = text[current];
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
        let [_token, afterQuote] = Tokenizer.matchText(text, current, end) || [];
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
      let char = text[start];
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

  // Given a set of tokens, slice whitespace (indent, NEWLINE or normal whitespace) from the front.
  removeLeadingWhitespace(tokens, start = 0) {
    while (tokens[start] instanceof Tokenizer.Whitespace) start++;
    if (start === 0) return tokens;
    return tokens.slice(start);
  },

  // Given a set of tokens, remove ALL "normal" whitespace tokens (NOT indent or NEWLINE).
  removeNormalWhitespace(tokens) {
    return tokens.filter(token => !Tokenizer.isNormalWhitespace(token));
  },

  // Return `true` if `token` is "normal" whitespce (not a newline or indent)
  isNormalWhitespace(token) {
    return (
      token instanceof Tokenizer.Whitespace &&
      !(token instanceof Tokenizer.Indent) &&
      token !== Tokenizer.NEWLINE
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
    let lines = [currentLine];
    tokens.forEach(token => {
      // add new array for each newline
      if (token === Tokenizer.NEWLINE) {
        // create a new line and push it in
        currentLine = [];
        return lines.push(currentLine);
      }

      // otherwise just add to the current line
      currentLine.push(token);
    });

    // Clear any lines that are only whitespace
    lines.forEach((line, index) => {
      if (line.length === 1 && line[0] instanceof Tokenizer.Whitespace) lines[index] = [];
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
    if (line[0] instanceof Tokenizer.Indent) return line[0].length;
    return 0;
  },

  // Simple block class for `breakIntoBlocks`.
  Block: class block extends token {
    constructor(props) {
      super(props);
      if (!this.contents) this.contents = [];   // TODO: get rid of `contents`???
      if (!this.tokens) this.tokens = [];
    }

    toString() {
//TODO: this returns a JSON structure rather than a nested string
//      and we can't get the full output anyway since we don't have whitespace
      return JSON.stringify(this, null, "\t");
    }
  },

  // Break `tokens` between `start` and `end` into a `Tokenizer.Block` with nested `contents`.
  // Skips "normal" whitespace and indents in the results.
  breakIntoBlocks: function(tokens, start = 0, end = tokens.length) {
    // restrict to tokens of interest
    tokens = tokens.slice(start, end);
    // remove "normal" whitespace
    //TODO: better to leave this to consumers???
    tokens = Tokenizer.removeNormalWhitespace(tokens);

    // break into lines & return early if no lines
    let lines = Tokenizer.breakIntoLines(tokens);
    if (lines.length === 0) return [];

    // figure out indents
    let indents = Tokenizer.getLineIndents(lines);

    // First block is at the MINIMUM indent of all lines!
    let maxIndent = Math.min.apply(Math, indents);
    let block = new Tokenizer.Block({ indent: maxIndent });

    // stack of blocks
    let stack = [block];

    lines.forEach((line, index) => {
      // Remove leading whitespace (eg: indents)
      line = Tokenizer.removeLeadingWhitespace(line);

      let lineIndent = indents[index];
      let top = stack[stack.length - 1];
      // If indenting, push new block(s)
      if (lineIndent > top.indent) {
        while (lineIndent > top.indent) {
          var newBlock = new Tokenizer.Block({ indent: top.indent + 1 });
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
      if (top.tokens.length > 0) top.tokens.push(Tokenizer.NEWLINE);
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
      let token = tokens[end];
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
};

export default Tokenizer;
