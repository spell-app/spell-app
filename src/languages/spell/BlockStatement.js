import {
  Rule
} from "./all.js";

// A `BlockStatement` (e.g. an `if` or `repeat`):
//  - is assumed to have an initial partial `statement`
//  - MAY have an inline `statement` (on the same line, possibly after a `:`)
//  - MAY have contents as an embedded `block`
// Note that it's considered an error to have BOTH an inline statement AND a nested block.
//
//  e.g. a `BlockStatement` with syntax `if {expression} then {statement}?` will attemt to:
//  - match the optional `statement` as an inline-statement (as `results.statement`)
//  - match an INDENTED block starting on the next line (as `result.block`)
//
//  For your convenience in `compile()`, you can just look at `results.statements`
//  which will be one of the following (whichever comes first):
//    - the block and its statements, enclosed in curly braces and indented, or
//    - the formatted `statement`, enclosed in curly brackets,
//    - `{}` if neither statement or block was matched.
//
export class BlockStatement extends Rule.Sequence {
  // Add `statements` to the results.
  getResults(match, scope) {
    const results = super.getResults(match, scope);
    if (!results) return undefined; // TODO???

    // If we got a block, use that for our `statements`
    const { block } = match;
    if (block) {
      results.statements = block.compile(block);
    }
    // otherwise use the `statement`, if it's empty this will return the empty string.
    else {
      results.statements = this.encloseStatement(results.statement);
    }
    return results;
  }

  encloseStatement(statement, forceWrap) {
    if (!statement) return "{}";
    if (!forceWrap && !statement.includes("\n") && statement.length < 40) {
      return `{ ${statement.trim()} }`;
    }
    if (statement[0] !== "\t") statement = `\t${statement}`;
    return `{\n${statement}\n}`;
  }
};
