// Export all standard "spell" rules.
import Parser from "../../Parser";
import Tokenizer from "../../Tokenizer.js";
import Rule from "../../Rule.js";

// Load all standard rules files.
import "./core";
import "./lists";
import "./operators";
import "./if";
import "./statements";
import "./types";
import "./JSX";

// Create parser which combines all of the above...
const parser = Parser.forModule("spell");
// ...which depends on rules loaded above...
parser.import("core", "lists", "operators", "if", "statements", "types", "JSX");
// ...as the default export
export default parser;

// Stick other stuff on `window` for reflection and ad-hoc testing.
if (typeof window !== "undefined") {
	Object.assign(window, {
		Tokenizer,
		Rule,
		Parser,

		tokenize: Tokenizer.tokenize.bind(exports.Tokenizer),
		parser,
		parse: parser.parse.bind(parser),
		compile: parser.compile.bind(parser),
	});
}
