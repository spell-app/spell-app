// Base, abstract token class.
// This is also the root of various token types.
//
// All subtypes are initialized with a map of `props`
//  and should at least have:
//  - `token.value` type-specific value in a way that's convenient for parsing to deal with.
//  - `token.start` start character index in the source string.
//  - `token.end`   non-inclusive end character instance in the source stream.
export default class Token {
  constructor(props) {
    Object.assign(this, props);
  }


  //
  //  Methods for matching strings and/or numbers.
  //

  // Do we match a `literal` value?
  // If `literal` is an array, we'll return true if our `value` is included in the array.
  // NOTE: not valid for all token types.
  matchesLiteral(literal) {
    if (Array.isArray(literal)) return literal.includes(this.value);
    return this.value === literal;
  }

  // Do we match a regular expression `pattern`?
  // If `blacklist` is supplied, we'll return `false` if value is found in blacklist.
  // NOTE: valid for string types only.
  matchesPattern(pattern, blacklist) {
    if (typeof this.value !== "string") return false;
    if (!pattern.test(this.value)) return false;
    if (blacklist && blacklist[this.value]) return false;
    return true;
  }
}

// `whitespace` class for normal (non-indent, non-newline) whitespace.
//  `whitespace.value` is the actual whitespace string.
Token.Whitespace = class whitespace extends Token {
  // Return the "length" of this whitespace, eg for an indent.
  get length() {
    return this.value.length;
  }

  toString() {
    return this.value;
  }
}
Object.defineProperty(Token.Whitespace.prototype, "isNormalWhitespace", { value: true });

// `indent` class.
Token.Indent = class indent extends Token.Whitespace {}
Object.defineProperty(Token.Indent.prototype, "isNormalWhitespace", { value: false });

// `newline` class.
Token.Newline = class newline extends Token.Whitespace {}
Object.defineProperty(Token.Newline.prototype, "value", { value: "\n" });
Object.defineProperty(Token.Newline.prototype, "isNormalWhitespace", { value: false });


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
    let string = this.value;
    // calculate `text` as the bits between the quotes.
    let start = 0;
    let end = string.length;
    if (string[start] === '"' || string[start] === "'") start = 1;
    if (string[end - 1] === '"' || string[end - 1] === "'") end = -1;
    return string.slice(start, end);
  }
  toString() {
    // TODO: this is not symmetrical with escaped quotes (e.g. "\\'") in the input string.
    return this.value;
  }
}

// Comment class for single-line comments.
//  - `comment.commentSymbol` is the initial comment symbol, one of:  "--", "//", "##"
//  - `comment.whitespace` is whitespace BETWEEN the comment symbol and the comment text.
//  - `comment.comment` is the comment text (until the end of the line).
Token.Comment = class comment extends Token {
  toString() {
    return `${this.commentSymbol}${this.whitespace}${this.comment}`;
  }
}



// JSX element class
//  `element.tagName` is the tag name
//  `element.attributes` is an array of `jsxAttribute` children
//  `element.children` is an array of child `jsxElement` instances.
Token.JSXElement =  class jsxElement extends Token{
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
}

// JSX end tag.
// `element.tagName` is the tag name.
Token.JSXEndTag = class jsxEndTag extends Token {}


// JSX attribute class
// `attr.name` is the name of the attribute.
// `attr.value` is one of... TODOC
Token.JSXAttribute = class jsxAttribute extends Token{
  constructor(props) {
    super(props);
  }
  toString() {
    if (this.value === undefined) return this.name;
    return `${this.name}={${this.value}}`;
  }
}

// Loose text in the middle of a JSX block
// `text.value` is the actual text matched (including whitespace).
Token.JSXText = class jsxText extends Token {
//TODO: escape quotes!
  get quotedText() {
    const trimmed = this.value.trim();
    if (!trimmed) return undefined;
    return `"${trimmed}"`;
  }
}

// JSX expression, composed of inline tokens which should yield an `expression`.
Token.JSXExpression = class jsxExpression extends Token {
  constructor(props) {
    super(props);
    if (!this.contents) this.contents = "";
  }
}

// Simple block class for `breakIntoBlocks`.
Token.Block = class block extends Token {
  constructor(props) {
    super(props);
    if (!this.contents) this.contents = [];   // TODO: get rid of `contents`???
  }

  toString() {
//TODO: this returns a JSON structure rather than a nested string
//      and we can't get the full output anyway since we don't have whitespace
    return JSON.stringify(this, null, "\t");
  }
}
