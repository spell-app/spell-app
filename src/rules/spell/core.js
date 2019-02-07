//
//	# Core `rules` -- simple datatypes, etc.
//
// NOTE: many of the below are created as custom Pattern subclasses for debugging.
//
import Parser from "../../Parser";
import Rule from "../../Rule";
import Tokenizer from "../../Tokenizer";

// Create `core` parser context.
const parser = Parser.forName("core");
export default parser;

parser.defineRules(
  {
    name: "statements",
    constructor: Rule.Statements
  },

  {
    name: "comment",
    constructor: Rule.Comment
  },

  // `word` = is a single alphanumeric word.
  // MUST start with a lower-case letter (?)
  {
    name: "word",
    pattern: /^[a-z][\w\-]*$/,
    canonical: "Word",
    constructor: class word extends Rule.Pattern {
      // Convert "-" to "_" in source output.
      toSource(context) {
        return this.matched.replace(/\-/g, "_");
      }
    }
  },

  // `identifier` = variables or property name.
  // MUST start with a lower-case letter (?)
  // NOTE: We blacklist a lot of words as identifiers.
  {
    name: "identifier",
    alias: "expression",
    canonical: "Idenfifier",
    pattern: /^[a-z][\w\-]*$/,
    constructor: class identifier extends Rule.Pattern {
      // Convert "-" to "_" in source output.
      toSource(context) {
        return this.matched.replace(/\-/g, "_");
      }
    },
    blacklist: [
      // Add English prepositions to identifier blacklist.
      //
      // Wikipedia "Preposition":
      //	"Prepositions...are a class of words that
      //	express spatial or temporal relations  (in, under, towards, before)
      //	or mark various semantic roles (of, for).
      // TESTME
      "about", "above", "after", "and", "as", "at",
      "before", "behind", "below", "beneath", "beside", "between", "beyond", "by",
      "defined", "down", "during",
      "each", "empty", "exactly", "except",
      "for", "from",
      "greater",
      "I", "in", "into",
      "less", "long",
      "me", "minus", "more",
      "near", "not",
      "of", "off", "on", "onto", "opposite", "or", "out", "outside", "over",
      "short", "since",
      "than", "the", "then", "through", "thru", "to", "toward", "towards",
      "undefined", "under", "underneath", "unique", "until", "up", "upon", "upside",
      "versus", "vs",
      "where", "with", "within", "without",

      // Add common english verbs to identifier blacklist.
      "are",
      "do", "does",
      "contains",
      "has", "have",
      "is",
      "repeat",
      "was", "were",

      // Add special control keywords to identifier blacklist.
      "else",
      "if",
      "otherwise",
      "while",

      // Add boolean tokens to identifier blacklist.
      "true", "false",
      "yes", "no",
      "ok", "cancel",
      "success", "failure",

      // Add number words to identifier blacklist.
      // TESTME
      "one", "two", "three", "four", "five",
      "six", "seven", "eight", "nine", "ten",
    ]
  },

  // `Type` = type name.
  // MUST start with an upper-case letter (?)
  {
    name: "type",
    alias: "expression",
    canonical: "Type",
    pattern: /^([A-Z][\w\-]*|list|text|number|integer|decimal|character|boolean|object)$/,
    constructor: class type extends Rule.Pattern {
      // Convert "-" to "_" in source output.
      toSource(context) {
        let type = this.matched;
        switch(type) {
          // Alias `List` to `Array`
          case "List":		return "Array";

          // special case to take the following as lowercase
          case "list":		return "Array";
          case "text":		return "String";
          case "character":	return "Character";
          case "number":		return "Number";
          case "integer":		return "Integer";
          case "decimal":		return "Decimal";
          case "boolean":		return "Boolean";
          case "object":		return "Object";
          default:
            return type.replace(/\-/g, "_");
        }
      }
    },
    blacklist: [ "I" ]
  },



  // Boolean literal, created with custom constructor for debugging.
  // TODO: better name for this???
  {
    name: "boolean",
    alias: "expression",
    canonical: "Boolean",
    pattern: /^(true|false|yes|no|ok|cancel|success|failure)$/,
    constructor: class boolean extends Rule.Pattern {
      toSource(context) {
        switch (this.matched) {
          case "true":
          case "yes":
          case "ok":
          case "success":
            return true;

          default:
            return false;
        }
      }
    }
  },

  // `number` as either float or integer, created with custom constructor for debugging.
  // NOTE: you can also use `one`...`ten` as strings.'
  // TODO:  `integer` and `decimal`?  too techy?
  {
    name: "number",
    alias: "expression",
    canonical: "Number",
    constructor: class number extends Rule {
      // Special words you can use as numbers...
      static NUMBER_NAMES = {
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

      // Numbers get encoded as numbers in the token stream.
      parse(parser, tokens, start = 0) {
        let token = tokens[start];
        // if a string, attempt to run through our NUMBER_NAMES
        if (typeof token === "string") token = Rule.Number.NUMBER_NAMES[token];
        if (typeof token !== "number") return undefined;
        return this.clone({
          matched: token,
          nextStart: start + 1
        });
      }

      // Convert to number on source output.
      toSource(context) {
        return this.matched;
      }
    }
  },

  // Literal `text` string, created with custom constructor for debugging.
  // You can use either single or double quotes on the outside (although double quotes are preferred).
  // Returned value has enclosing quotes.
  {
    name: "text",
    alias: "expression",
    canonical: "Text",
    constructor: class text extends Rule {
      // Text strings get encoded as `text` objects in the token stream.
      parse(parser, tokens, start = 0) {
        let token = tokens[start];
        if (!(token instanceof Tokenizer.Text)) return undefined;
        return this.clone({
          matched: token.quotedString,
          nextStart: start + 1
        });
      }

      toSource(context) {
        return this.matched;
      }
    }
  },

  // Literal list (array), eg:  `[1,2 , true,false ]`
  {
    name: "literal_list",
    alias: "expression",
    syntax: "\\[[list:{expression},]?\\]",
    constructor: class literal_list extends Rule.Sequence {
      toSource(context) {
        let { list } = this.getMatchedSource(context);
        return `[${list ? list.join(", ") : ""}]`;
      }
    }
  },


  // Parenthesized expression
  //TESTME
  {
    name: "parenthesized_expression",
    alias: "expression",
    syntax: "\\({expression}\\)",
    constructor: class parenthesized_expression extends Rule.Sequence {
      toSource(context) {
        let { expression } = this.getMatchedSource(context);
        // don't double parens if not necessary
        if (typeof expression === "string" && expression.startsWith("(") && expression.endsWith(")")) return expression;
        return `(${expression})`;
      }
    }
  }

);
