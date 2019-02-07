//
//	# Rules for creating variables, property access, etc
//

import Parser from "../../Parser";
import Rule from "../../Rule";

// Create "statements" parser.
const parser = Parser.forName("statements");
export default parser;

parser.defineRules(
  //
  //	## Returns
  //

  // Return a value
  //TESTME
  {
    name: "return_statement",
    alias: "statement",
    syntax: "return {expression}",
    constructor: class return_statement extends Rule.Sequence {
      toSource() {
        let { expression } = this.results;
        return `return ${expression}`;
      }
    }
  },

  //
  //	## Assignment
  //

  //TESTME
  //TODO: distinguish between `new_identifier` and `scoped_identifier`
  {
    name: "assignment",
    alias: ["statement", "mutatesScope"],
    syntax: [
      "{thing:expression} = {value:expression}",
      "set {thing:expression} to {value:expression}",
      "put {value:expression} into {thing:expression}"
    ],
    constructor: class assignment extends Rule.Sequence {
      toSource() {
        let { thing, value } = this.results;
        // TODO: declare identifier if not in scope, etc
        return `${thing} = ${value}`;
      }
    }
  },

  //TESTME
  // TODO: `it` may not already be defined... ???
  {
    name: "get_value",
    alias: ["statement", "mutatesScope"],
    syntax: "get {value:expression}",
    constructor: class get_value extends Rule.Sequence {
      toSource() {
        let { value } = this.results;;
        return `it = ${value}`
      }
    }
  },



  //
  //	## User interaction
  // TODO: move into another file
  //

  // Alert a message.
  // TODO: need some fancy promise juju here?
  //TESTME
  {
    name: "alert",
    alias: "statement",
    syntax: "alert {message:expression} (?:with {okButton:text})?",
    constructor: class alert extends Rule.Sequence {
      toSource() {
        let { message, okButton = `"OK"` } = this.results;
        return `await spell.alert(${message}, ${okButton})`;
      }
    }
  },

  // Warning message -- like alert but fancier.
  // TODO: need some fancy promise juju here?
  //TESTME
  {
    name: "warn",
    alias: "statement",
    syntax: "warn {expression:expression} (?:with {okButton:text})?",
    constructor: class warn extends Rule.Sequence {
      toSource() {
        let { message, okButton = `"OK"` } = this.results;
        return `await spell.warn(${message}, ${okButton})`;
      }
    }
  },


  // Confirm message -- present a question with two answers.
  // TODO: need some fancy promise juju here?
  //TESTME
  {
    name: "confirm",
    alias: "statement",
    syntax: "confirm {message:expression} (?:with {okButton:text} (?: (and|or) {cancelButton:text})? )?",
    constructor: class confirm extends Rule.Sequence {
      toSource() {
        let { message, okButton = `"OK"`, cancelButton = `"Cancel"` } = this.results;
        return `await spell.confirm(${message}, ${okButton}, ${cancelButton})`;
      }
    }
  }
);
