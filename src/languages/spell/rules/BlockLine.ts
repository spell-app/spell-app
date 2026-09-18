import { P, AST } from "~/parser"
import { SpellParser, spellParser } from "~/languages/spell"
import { SpellStatement } from "./Statement"
import "./match-fields.A"

/** Update Rules.BlankLine to output AST properly. */
P.Rules.BlankLine.prototype.getAST = function (match: P.Match) {
  return new AST.BlankLine(match)
}

// Use `BlockLine` to parse a single `Tokens.Line` in a `Tokens.Block` as:
// - a `statement`
// - an optional `comment` at the end of the line
// - if the `statement.wantsNestedBlock` and the next item in `lines` is a `Tokens.Block`
//   we'll let the statement attempt to parse the next line as well.
export class BlockLine extends P.Rule {
  parse(scope: P.Scope, lines: P.Token[]): P.Match | undefined {
     
    const line = lines[0]
    if (!line) return undefined
    const matched: (P.Match | P.Token)[] = []
    const errors: P.Match[] = []
    const tokensMatched: P.Token[] = [line]
    if (!(line instanceof P.Tokens.Line)) {
      console.warn("BlockLine.parse(): got non-line", line)
      return undefined
    }
    const { tokens } = line
    // Blank line
    if (tokens.length === 0) {
      // NOTE: `line.leading` (the fallback in the original code) is a plain `string`, not a `Token` --
      // pushing it into `matched`/`tokens` below would fail `Match`'s own runtime assertions, so this
      // dynamic fallback was already dead code; only `line.newline` is ever a usable `Token` here.
      const token = line.newline
      if (token) {
        matched.push(
          new P.Match({
            rule: scope.getRuleOrDie("blank_line"),
            matched: [token],
            tokens: [token],
            scope
          })
        )
      }
    }
    // parse as a `statement` with optional `comment`
    else {
      const start = 0
      let end = tokens.length

      // pop comment (which will be a single token) off of the end if found
      const last = tokens[tokens.length - 1]!
      const comment = scope.parser?.parse([last], "comment", scope)
      if (comment) {
        end -= 1
        // add comment BEFORE statement
        matched.push(comment)
      }

      // parse the statement (which may parse an inlineStatement as well)
      const unparsed = tokens.slice(start, end)
      const statement = scope.parser?.parse(unparsed, "statement", scope)
      if (statement) {
        matched.push(statement)
        unparsed.splice(0, statement.length)
      }

      // add anything unparsed at the end as a parse error
      if (unparsed.length) {
        const error = scope.parser?.parse(unparsed, "parse_error", scope)
        if (error) {
          errors.push(error)
          matched.push(error)
        }
      }

      if (statement) {
        // We've locked in this statement -- update scope if necessary.
        // This is used, e.g. by assignment to add new variables to the scope, etc.
        statement.rule.mutateScope(statement)

        // Some statements `.wantsNestedBlock` -- give it a chance to parse the next item.
        const nextItem = lines[1]
        if (
          statement.rule instanceof SpellStatement &&
          statement.rule.wantsNestedBlock &&
          nextItem instanceof P.Tokens.Block
        ) {
          const nestedBlock = statement.rule.parseNestedBlock(statement, nextItem)
          if (nestedBlock) {
            // add any errors in the nestedBlock to `errors`
            if (nestedBlock.errors) errors.push(...nestedBlock.errors)
            // add the nestedBlock to `tokensMatched` to account for it in the output
            tokensMatched.push(nextItem)
          }
        }

        // HACK HACK HACK
        // OK, we've procesed the statement and its nested block if there is one.
        // Lock in it's (memoized) AST in case the rule's `getAST()` method ALSO mutates scope.
        void statement.AST

        // TODO: not sure if this is needed anymore
        // Check JSX, that seems to be setting it???
        if (statement.error) {
          console.warn("Got unexpected statement.error for", statement.rule.name)
          errors.push(statement.error)
          matched.push(statement.error)
        }

        // Add parse error if we got both a `nestedBlock` and an `inlineStatement`
        const { inlineStatement, nestedBlock } = statement.groups
        if (inlineStatement && nestedBlock) {
          const error = spellParser.createParseError(
            scope,
            [line, nextItem].filter((item): item is P.Token => item !== undefined),
            "Got both inline statement and nested block"
          )
          errors.push(error)
          matched.push(error)
        }
      }
    }
    const result = new P.Match({
      rule: this,
      matched,
      tokens: tokensMatched,
      scope
    })
    // `errors` is an ad-hoc field (see `match-fields.a.ts`), not part of `MatchProps`.
    if (errors.length) result.errors = errors
    return result
  }

  compile(match: P.AnyMatch): unknown {
    // `Match.compile()` always prefers `getAST()` (below) over calling `rule.compile()` directly,
    // but `Rule.compile()` is abstract, so provide the equivalent fallback for completeness.
    return match.AST?.compile()
  }

  getAST(match: P.Match): AST.ASTNode {
    // ???  If only one matched item, return it by itself
    const first = match.matched[0]
    if (match.matched.length === 1 && first instanceof P.Match) return first.AST!
    // otherwise
    return new AST.StatementGroup(match, {
      // `match.matched` here is always `Match`es (never raw `Token`s) -- not staticaly representable.
      statements: match.matched
        .filter((item): item is P.Match => item instanceof P.Match)
        .map((item) => item.AST) as Array<AST.Statement | AST.Expression | AST.Comment | AST.BlankLine>
    })
  }
}
SpellParser.Rules.BlockLine = BlockLine
