import Parser from "../../parser/Parser.js";

// Load all standard rules files.
import "./core.js";
import "./if.js";
import "./JSX.js";
import "./lists.js";
import "./operators.js";
import "./statements.js";
import "./types.js";
import "./UI.js";

// Create parser which combines all of the above...
const parser = Parser.forModule("spell");
// ...which depends on rules loaded above...
parser.import("core", "operators", "types", "lists", "if", "statements", "JSX", "UI");
// ...as the default export
export default parser;
