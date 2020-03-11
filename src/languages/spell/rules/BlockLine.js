import { Rule, Spell, Tokenizer } from "../all"

// Parse a single line in a block.
// NOTE: we eat whitespace at the start and stick it on `match.whitespace` if found.
// NOTE: we eat a comment at the end and stick it on `match.comment` if found.
//       if ONLY comment was found, that will be the match.
//
// Note: Access this as `Spell.Rule.BlockLine`.
Spell.Rule.BlockLine = class block_line extends Rule {
  parse(scope, tokens) {
    let start = 0
    let end = tokens.length

    // eat whitespace at front if found
    const whitespace = scope.parse(tokens, "eat_whitespace")
    if (whitespace) start = whitespace.length

    // pop comment off of the end if found
    const last = tokens[tokens.length - 1]
    const comment = scope.parse([last], "comment")
    if (comment) end -= 1

    // parse the statement
    const remainingTokens = tokens.slice(start, end)
    const statement = scope.parse(remainingTokens, "statement")

    // If no statement and no comment, forget it (ignoring whitespace).
    if (!statement && !comment) return undefined

    // If we got a statement but didn't reach the end of the line
    //  continue but note the `unparsed` stuff.
    // `Block` will output the unparsed bit as a comment in the output.
    if (statement && statement.length !== remainingTokens.length) {
      const unparsed = remainingTokens.slice(statement.length)
      Spell.logger.warn(`statement didn't match '${Tokenizer.join(unparsed)}'`)
      statement.error = scope.parse(unparsed, "parse_error")
    }

    // If only comment, return that.
    if (!statement) {
      comment.length = tokens.length
      return comment
    }

    // If we got whitespace or comment, add it to the statement;
    if (whitespace) statement.whitespace = whitespace
    if (comment) statement.comment = comment

    // Assume we ate the entire line
    statement.length = tokens.length
    return statement
  }
}
