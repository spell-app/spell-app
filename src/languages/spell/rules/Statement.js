import { proto } from "~/util"
import { Rule, Token } from "~/parser"
import { SpellParser } from "~/languages/spell"

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

  // Rule to parse a nested block as -- see `parseNestedBlock()`
  @proto parseNestedBlockAs = "block"

  // Parse the staement itself -- assume comment was already popped off the end.
  // If we `wantsInlineStatement`, attempt to parse that and push onto the match.
  // `Block.parseStatement()` will worry about extra stuff at the end of the statement.
  parse(scope, tokens) {
    const statement = super.parse(scope, tokens)
    if (!statement) return undefined

    // Attempt to parse any remaining tokens as an inlineStatement if necessary
    const unparsed = tokens.slice(statement.length)
    if (this.wantsInlineStatement && unparsed.length) {
      this.parseInlineStatement(statement, unparsed, this.parseInlineStatementAs)
    }

    return statement
  }

  // Return nested scope to use when parsing an inlineStatement or nestedBlock.
  // Override in your instance.
  getNestedScope(match) {
    throw new TypeError("You must override getNestedScope()")
  }

  // If a parsed `statement` match `.wantsInlineStatement`,
  // attempt to parse `unparsed` tokens from the end of the input line.
  // Returns `inlineStatement` match if successful.
  parseInlineStatement(statement, unparsed, parseAs = this.parseInlineStatementAs) {
    const inlineStatement = statement.nestedScope?.parse(unparsed, parseAs)
    if (inlineStatement) {
      statement.addMatch(inlineStatement, "inlineStatement")
      // TODO: ???  call `mutateScope()` to initialize any variables/rules/etc
      inlineStatement.mutateScope()
    }
    return inlineStatement
  }

  // If a parsed `statement` match `.wantsNestedBlock`,
  // attempt to parse `nestedBlock` from `block.contents`.
  // Returns `nestedBlock` match if successful.
  // TODO: complain if we also have an inlineStatement???
  // NOTE: this will throw if rule does not implement `getNestedScope`
  parseNestedBlock(statement, nestedBlock, parseAs = this.parseNestedBlockAs) {
    let result
    if (parseAs === "block") {
      result = statement.nestedScope.parse([nestedBlock], "block")
      // wrap output in parens
      if (result) result.enclose = true
    } else {
      // if parsing as anything else, we can only handle a single line
      if (nestedBlock.contents.length > 1) return undefined
      // get line to process, minus leading whitespace
      // TODO: remove comment????
      const { tokens } = nestedBlock.contents[0]
      // TODO: `statement.scope` or `statement.nestedScope` ???
      result = statement.scope.parse(tokens, parseAs)
      // forget it if we didn't parse the entire line
      if (result?.length !== tokens.length) return undefined
    }
    if (result) statement.addMatch(result, "nestedBlock")
    return result
  }
}
