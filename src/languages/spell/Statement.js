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
  //
  // NOTE: DO NOT CALL THIS DIRECTLY -- ALWAYS CALL IT FROM THE MATCH!
  //       Otherwise we may call the method twice, duplicating its effects.
  updateScope(results, match, scope) {}

  // To compile, we just output our statements.
  compile(match, scope) {
    // Call `updateScope()` on the match to make sure we've fully compiled.
    // This is a no-op if it's been called before.
    match.updateScope();
    return match.results?.statements?.join("\n") || "";
  }
}

export { statement as Statement };
