import _ from "lodash"
import { Match, Rule, Spell, Token, isWhitespace, AST } from "../all"
// `Blocks` are generally the root entity that we parse in spell.
//  This is a top-level construct, e.g. used to parse an entire file.
//
//  They are composed of `blockLines` and nested `blocks`,
//  and correspond roughly to a `Scope` (see `parser/Scope.js`).
//
// Note: Access this as `Spell.Rule.Block`.
Spell.Rule.Block = class block extends Rule {
  // Split statements up into blocks and parse 'em.
  parse(scope, tokens) {
    if (!tokens.length) return undefined
    return this.parseBlock(scope, tokens[0])
  }

  // Parse an entire `block`, returning array of matched elements (NOT as a match).
  // eslint-disable-next-line no-shadow
  parseBlock(scope, block) {
    let matched = []
    let lastStatement
    for (let i = 0, last = block.contents.length; i < last; i++) {
      const item = block.contents[i]
      // Just add a blank link to the stream
      if (item.length === 0) {
        matched.push(new Rule.BlankLine())
        // TODO: ????
        // length += 1
      }
      // If we got a nested block
      else if (item instanceof Token.Block) {
        // If the lastStatement wants a nested block, have it parse the block
        if (lastStatement?.rule?.wantsNestedBlock) {
          lastStatement.block = this.parseBlock(lastStatement.getASTScope(), item)
          if (lastStatement.block) lastStatement.block.enclose = true
        } else {
          const nestedBlock = this.parseBlock(scope, item)
          if (nestedBlock) {
            Spell.logger.info("got a nested block when we weren't expecting one")
            // Just push it into the stream
            matched.push(nestedBlock)
          } else {
            Spell.logger.info("saw unexpected nested block, parsing it didn't return anything")
          }
        }
      }
      // Got a single statement, parse the entire thing as a `block_line`
      else {
        const statement = scope.parse(item, "block_line")
        if (Array.isArray(statement)) {
          console.warn("GOT ARRAY OF STATEMENTS FROM block_line.parse()", statement)
        }
        if (statement) {
          // Use `concat` in case we got an array of statements back
          matched = matched.concat(statement)
          // We've locked in this statement -- have it update scope if necessary.
          // This is used, e.g. by assignment to add new variables to the scope, etc.
          statement.updateASTScope()

          if (statement.error) {
            matched.push(statement.error)
          }
          lastStatement = statement
        }
        // Output a parse error for the line but continue
        else {
          const error = scope.parse(item, "parse_error")
          matched.push(error)
        }
      }
    }

    if (matched.length === 0) return undefined

    return new Match({
      rule: this,
      matched,
      indent: block.indent,
      scope,
      length: 1 // matched one block...
    })
  }

  toAST(scope, match) {
    const statements = _.flatten(
      match.matched.map(statement => {
        // Output comments and errors, then the statement itself
        return [statement.comment?.AST, statement.error?.AST, statement.AST].filter(Boolean)
      })
    )
    if (match.enclose) return new AST.StatementBlock(scope, match, { statements })
    return new AST.StatementGroup(scope, match, { statements })
  }
}
