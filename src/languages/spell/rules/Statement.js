import { Rule, Spell, Tokenizer, ParseError, proto } from "../all"

// In Spell, we generally match `statements` across the entire line.
//
// An exception is `inline block` statements (like `if` or `forEach`),
//  where the statement MIGHT have an inline statement at the end
//  or might have a nested block of statements.
//
// Note: Access this as `Spell.Rule.Statement`.
Spell.Rule.Statement = class statement extends Rule.Sequence {
  // Set to true if this statement wants to attempt to read an inline statement on the same line.
  @proto wantsInlineStatement = false

  // Rule to parse inline statement as -- see `parseInlineStatement()`
  @proto parseInlineStatementAs = "statement"

  // Set to true if this statement wants to attempt to read an nested block starting on the next line.
  @proto wantsNestedBlock = false

  // YOU MUST IMPLEMENT THIS:
  //
  // We have definitively been parsed correctly.
  // Update the `scope` with rules and/or statements as necessary.
  //
  // NOTE: DO NOT CALL THIS DIRECTLY -- ALWAYS CALL IT FROM THE MATCH!
  //       Otherwise we may call the method twice, duplicating its effects.
  updateScope(scope, match) {}

  // Return the nested scope that we should use to parse an inline statement or nested block.
  // Recommended is to remember it as `match.results.$scope` for things to work out correctly.
  // See `./rules/if.js` for an example.
  //
  // NOTE: DO NOT CALL THIS DIRECTLY -- ALWAYS CALL IT FROM THE MATCH!
  //       Otherwise we may call the method twice, duplicating its effects.
  getNestedScope(scope, match) {}

  // Special parse to note any stuff we didn't catch
  // and handle block statements.
  parse(scope, tokens) {
    const match = super.parse(scope, tokens)
    if (!match) return undefined

    // If we didn't parse everything on the line
    if (match.length !== tokens.length) {
      // If we want to parse an inline statement, do that now.
      if (this.wantsInlineStatement) {
        const inlineMatch = this.parseInlineStatement(scope, match, tokens.slice(match.length))
        if (inlineMatch) match.length += inlineMatch.length
      }
      // If there are still tokens left, remember them for later.
      if (match.length !== tokens.length) {
        match.results.incomplete = {
          parsed: Tokenizer.join(tokens, 0, match.length),
          missed: Tokenizer.join(tokens, match.length)
        }
      }
    }

    return match
  }

  gatherResults(scope, match) {
    const results = super.gatherResults(scope, match)
    results.statements = []
    return results
  }

  gatherGroups(scope, match) {
    const groups = super.gatherGroups(scope, match)
    const { inlineStatement, block } = match
    if (inlineStatement && block) {
      console.warn(`Rule ${this.name} matched both inlineStatement and block!  match:`, match)
    }
    if (inlineStatement) groups.inlineStatement = inlineStatement
    if (block) groups.block = block
    // You can just use `nestedBlock` to match either block or inlineStatement
    groups.nestedBlock = block || inlineStatement
    return groups
  }

  // Parse an inline statement.
  parseInlineStatement(scope, match, tokens) {
    const nestedScope = match.getNestedScope()
    if (!nestedScope) throw new ParseError(`${this.name}.parseInlineStatement(): no nested scope provided`)

    const inlineStatement = nestedScope.parse(tokens, this.parseInlineStatementAs)
    // If we got one, tell it to `updateScope()`, which should add it to the nested scope.
    if (inlineStatement) {
      match.inlineStatement = inlineStatement
      if (this.parseInlineStatementAs === "statement") inlineStatement.updateScope()
      else nestedScope.addStatement(inlineStatement.compile())
    }

    return inlineStatement
  }

  // To compile, we just output our statements.
  compile(scope, match) {
    // Call `updateScope()` on the match to make sure we've fully compiled.
    // This is a no-op if it's been called before.
    match.updateScope()
    return match.results?.statements?.join("\n") || ""
  }
}
