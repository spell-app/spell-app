import { Rule, SpellParser, proto } from ".."

// In Spell, we generally match `statements` across the entire line.
//
// An exception is `inline block` statements (like `if` or `forEach`),
//  where the statement MIGHT have an inline statement at the end
//  or might have a nested block of statements.
//
// Note: Access this as `SpellParser.Rule.Statement`.
SpellParser.Rule.Statement = class _statement extends Rule.Sequence {
  // Set to true if this statement wants to attempt to read an inline statement on the same line.
  @proto wantsInlineStatement = false

  // Rule to parse inline statement as -- see `parseInlineStatement()`
  @proto parseInlineStatementAs = "statement"

  // Set to true if this statement wants to attempt to read an nested block starting on the next line.
  @proto wantsNestedBlock = false

  // Parse the staement itself -- assume comment was already popped off the end.
  // If we `wantsInlineStatement`, attempt to parse that and push onto the match.
  // `Block.parseStatement()` will worry about extra stuff at the end of the statement.
  parse(scope, tokens) {
    const statement = super.parse(scope, tokens)
    if (!statement) return undefined

    // Attempt to parse any remaining tokens as an inlineStatement if necessary
    const unparsed = tokens.slice(statement.length)
    if (this.wantsInlineStatement && unparsed.length) {
      scope.parser.getRuleOrDie("block").parseInlineStatement(statement, unparsed, this.parseInlineStatementAs)
    }

    return statement
  }

  // Return nested scope to use when parsing an inlineStatement or nestedBlock.
  // Override in your instance.
  getNestedScope(match) {
    throw new TypeError("You must override getNestedScope()")
  }
}
