import {
  Rule,
} from "./all.js";

// Create a subclass of `Sequence` which manages a statement
class statement extends Rule.Sequence {
  getResults(match, scope) {
    const results = super.getResults(match, scope);
    // Placeholder for statements (including var declarations etc) created during our `updateScope()`.
    results.statements = [];
    // Placeholder for parser `rules` created during our `updateScope()`
    results.rules = [];
    return results;
  }

  // We have definitively been parsed correctly.
  // Update the `scope` with rules and/or statements as necessary.
  // NOTE: For BlockStatements (a subclass),
  //       the block contents will NOT have been parsed when this is called!
  updateScope(results, match, scope) {
    throw new TypeError(`You must override the update scope method of rule ${this.name}!`);
  }

  // To compile, we just output our statements.
  compile(match, scope) {
    return results.statements.join("\n");
  }
}

export { statement as Statement };
