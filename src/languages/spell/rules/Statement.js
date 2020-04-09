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
      // TODO: add a parse error?
      Spell.logger.warn(`Rule ${this.name} matched both inlineStatement and block!  match:`, match)
    }
    if (inlineStatement) groups.inlineStatement = inlineStatement
    if (block) groups.block = block
    // You can just use `nestedBlock` to match either block or inlineStatement
    groups.nestedBlock = block || inlineStatement
    return groups
  }

  // Parse an inline statement.
  parseInlineStatement(scope, match, tokens) {
    const nestedScope = match.getASTScope()
    if (!nestedScope) throw new ParseError(`${this.name}.parseInlineStatement(): no nested scope provided`)

    match.inlineStatement = nestedScope.parse(tokens, this.parseInlineStatementAs)
    // call `updateASTScope()` to initialize any variables/etc
    if (match.inlineStatement) match.inlineStatement.updateASTScope()
    return match.inlineStatement
  }

  // To compile, we just output our statements.
  compile(scope, match) {}
}
