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
          lastStatement.block = this.parseBlock(lastStatement.getNestedScope(), item)
        } else {
          const nestedBlock = this.parseBlock(scope, item)
          if (nestedBlock) {
            Spell.logger.info("got a nested block when we weren't expecting one")
            // Just push it into the stream
            matched.push(nestedBlock)
          } else {
            Spell.logger.info("expected nested result, didn't get anything")
          }
        }
        delete this.lastStatement
      }
      // Got a single statement, parse the entire thing as a `block_line`
      else {
        const statement = scope.parse(item, "block_line")
        if (statement) {
          matched = matched.concat(statement)

          // We've locked in this statement -- have it update it's scope.
          // This may create other rules/vars/etc that later statements will use.
          statement.updateScope()
          lastStatement = statement

          if (statement.error) {
            if (lastStatement.rule?.wantsNestedBlock) {
              lastStatement.getNestedScope().addStatement(statement.error.compile())
            } else {
              matched.push(statement.error)
            }
          }
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

  // Output statements match parsed with `parseBlock`
  // Set `match.enclose` to enclose in curly braces
  // Set `match.indent` to add a tab to the start of each line.
  compile(scope, match) {
    let results = []
    let statement

    for (let i = 0, last = match.matched.length; i < last; i++) {
      const line = match.matched[i]
      try {
        // If we got a comment back, there was no statement.
        if (line.rule?.name === "comment") {
          statement = line.compile()
        } else {
          // Output text that was actually matched if provided
          const output = []
          // eslint-disable-next-line no-useless-concat
          if (line.source) output.push("/" + `/ SPELL: '${line.source}'`)
          // Put comment FIRST, before translation
          if (line.comment) output.push(line.comment.compile())
          // Then the actual statement results
          output.push(line.compile())
          statement = output.join("\n")
        }
      } catch (e) {
        Spell.logger.error(e)
        Spell.logger.warn("Error compiling statements: match\n", line.toPrint())
      }

      if (isWhitespace(statement)) {
        results.push("")
      } else if (Array.isArray(statement)) {
        results = results.concat(statement)
      } else if (typeof statement === "string") {
        statement = statement.split("\n")
        results = results.concat(statement)
      } else {
        console.warn("blockToSource(): DON'T KNOW HOW TO WORK WITH\n\t", statement, "\n\tfrom match", line)
      }

      // If we got an error (e.g. if we couldn't parse the entire line),
      //  write that at the end.
      if (line.error) {
        results.push(line.error.compile())
      }
    }
    const tab = match.indent ? "\t" : ""
    const lines = `${tab}${results.join(`\n${tab}`)}`
    if (match.enclose) return `{\n${lines}\n${tab.slice(1)}}`
    return lines
  }

  toAST(scope, match) {
    return new AST.StatementBlock(scope, match, {
      statements: match.matched.map(statement => statement.AST)
    })
  }
}
