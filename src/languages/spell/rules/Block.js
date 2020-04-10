import _ from "lodash"
import { Match, Rule, Spell, Token, AST } from "../all"

/** Update Rule.BlankLine to output AST properly. */
Rule.BlankLine.prototype.getAST = function(match) {
  return new AST.BlankLine(match)
}

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
    const matched = []
    for (let i = 0, last = block.contents.length; i < last; i++) {
      const item = block.contents[i]
      // Just add a blank link to the stream
      if (item.length === 0) {
        matched.push(
          new Match({
            rule: new Rule.BlankLine(),
            matched: item,
            length: 1,
            scope
          })
        )
      }
      // If we got a nested block
      else if (item instanceof Token.Block) {
        const nestedBlock = this.parseBlock(scope, item)
        if (nestedBlock) {
          Spell.logger.info("got a nested block when we weren't expecting one")
          // Push it into the stream, but don't wrap it in parens.
          matched.enclose = false
          matched.push(nestedBlock)
        } else {
          Spell.logger.info("saw unexpected nested block, parsing it didn't return anything")
        }
      }
      // Got a single line of tokens: parse as statement
      else {
        const { statement, comment, unparsed } = this.parseStatement(scope, item)
        // add comment FIRST
        if (comment) matched.push(comment)
        if (statement) matched.push(statement)
        // add anything unparsed at the end as a parse error
        if (unparsed.length) matched.push(scope.parse(unparsed, "parse_error"))

        if (statement) {
          // TODO: not sure if this is needed anymore
          if (statement.error) {
            console.warn("Got unexpected statement.error for", statement.rule.name)
            matched.push(statement.error)
          }

          // We've locked in this statement -- have it update scope if necessary.
          // This is used, e.g. by assignment to add new variables to the scope, etc.
          statement.mutateScope()

          // Some `statements.wantsNestedBlock` -- give it a chance to parse the next item.
          const nextItem = block.contents[i + 1]
          if (statement.rule.wantsNestedBlock && nextItem instanceof Token.Block) {
            const matchedNestedBlock = this.parseNestedBlock(statement, nextItem)
            // eat the nested block token so we don't parse it again
            if (matchedNestedBlock) i++
          }
        }
      }
    }
    // Forget it if we didn't match anything
    if (matched.length === 0) return undefined

    return new Match({
      rule: this,
      matched,
      indent: block.indent,
      scope,
      length: 1 // matched one OUTER block...
    })
  }

  // Parse a single line as a "statement" with optional leading whitespace and comment at the end.
  parseStatement(scope, tokens) {
    let start = 0
    let end = tokens.length

    // eat whitespace at front if found
    const whitespace = scope.parse(tokens, "eat_whitespace")
    if (whitespace) start = whitespace.length

    // pop comment (which will be a single token) off of the end if found
    const last = tokens[tokens.length - 1]
    const comment = scope.parse([last], "comment")
    if (comment) end -= 1

    // parse the statement
    const unparsed = tokens.slice(start, end)
    const statement = scope.parse(unparsed, "statement")

    // Update `unparsed` so `parseBlock()` will output a parse error if we didn't get it all.
    if (statement) unparsed.splice(0, statement.length)
    return { whitespace, statement, comment, unparsed }
  }

  // If a parsed `statement` match `.wantsInlineStatement`,
  // attempt to parse `unparsed` tokens from the end of the input line.
  // Returns `inlineStatement` match if successful.
  parseInlineStatement(statement, unparsed, parseAs = "statement") {
    const inlineStatement = statement.nestedScope?.parse(unparsed, parseAs)
    if (inlineStatement) {
      statement.addMatch(inlineStatement, "inlineStatement")
      // TODO: ???  call `mutateScope()` to initialize any variables/rules/etc
      inlineStatement.mutateScope()
    }
    return inlineStatement
  }

  // If a parsed `statement` match `.wantsNestedBlock`,
  // attempt to parse `nextItem` from `block.contents`.
  // Returns `nestedBlock` match if successful.
  parseNestedBlock(statement, nextItem) {
    // TODO: complain if we also have an inlineStatement???
    const nestedBlock = statement.nestedScope && this.parseBlock(statement.nestedScope, nextItem)
    if (nestedBlock) {
      // wrap output in parens
      nestedBlock.enclose = true
      statement.addMatch(nestedBlock, "nestedBlock")
    }
    return nestedBlock
  }

  getAST(match) {
    const statements = match.matched.map(item => item.AST)
    if (match.enclose) return new AST.StatementBlock(match, { statements })
    return new AST.StatementGroup(match, { statements })
  }
}
