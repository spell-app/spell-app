import _ from "lodash"

import { Match, Rule, Token } from "~/parser"
import { SpellParser, AST } from "~/languages/spell"

/** Update Rule.BlankLine to output AST properly. */
Rule.BlankLine.prototype.getAST = function (match) {
  return new AST.BlankLine(match)
}

// Use `BlockLine` to parse a single `Token.Line` in a `Token.Block` as:
// - a `statement`
// - an optional `comment` at the end of the line
// - if the `statement.wantsNestedBlock` and the next item in `lines` is a `Token.Block`
//   we'll let the statement attempt to parse the next line as well.
SpellParser.Rule.BlockLine = class line extends Rule {
  parse(scope, lines) {
    // eslint-disable-next-line no-shadow
    const line = lines[0]
    if (!line) return undefined
    const matched = []
    const input = [line]
    const { tokens } = line
    // Blank line
    if (tokens.length === 0) {
      const token = line.newLine || line.leading
      matched.push(
        new Match({
          rule: scope.parser.getRuleOrDie("blank_line"),
          matched: [token],
          length: 1,
          input: [token],
          scope,
        })
      )
    }
    // parse as a `statement` with optional `comment`
    else {
      const start = 0
      let end = tokens.length

      // pop comment (which will be a single token) off of the end if found
      const comment = scope.parse([tokens.last], "comment")
      if (comment) end -= 1

      // parse the statement (which may parse an inlineStatement as well)
      const unparsed = tokens.slice(start, end)
      const statement = scope.parse(unparsed, "statement")
      if (statement) {
        matched.push(statement)
        unparsed.splice(0, statement.length)
      }

      // add anything unparsed at the end as a parse error
      if (unparsed.length) {
        matched.push(scope.parse(unparsed, "parse_error"))
      }

      // TODO: not sure if this is needed anymore
      // Check JSX, that seems to be setting it???
      if (statement?.error) {
        console.warn("Got unexpected statement.error for", statement.rule.name)
        matched.push(statement.error)
      }

      // add comment AFTER statement
      if (comment) matched.push(comment)

      if (statement) {
        // We've locked in this statement -- have it update scope if necessary.
        // This is used, e.g. by assignment to add new variables to the scope, etc.
        statement.mutateScope()

        // Some statements `.wantsNestedBlock` -- give it a chance to parse the next item.
        const nextItem = lines[1]
        if (statement.rule.wantsNestedBlock && nextItem instanceof Token.Block) {
          const nestedBlock = statement.rule.parseNestedBlock(statement, nextItem)
          // add the nestedBlock to `input` to account for it in the output
          if (nestedBlock) input.push(nextItem)
        }

        // HACK HACK HACK
        // OK, we've procesed the statement and its nested block.
        // Lock in it's (memoized) AST in case the rule's `getAST()` method ALSO mutates scope.
        // eslint-disable-next-line no-unused-vars
        const ast = statement.AST
      }
    }
    return new Match({
      rule: this,
      matched,
      input,
      length: input.length,
      scope,
    })
  }

  getAST(match) {
    // ???  If only one matched item, return it by itself
    if (match.matched.length === 1) return match.matched[0].AST
    // otherwise
    return new AST.StatementGroup(match, {
      statements: match.matched.map((item) => item.AST),
    })
  }
}
