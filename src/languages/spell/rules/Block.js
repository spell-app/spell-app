import _ from "lodash"

import { Match, Rule, Token } from "~/parser"
import { SpellParser, AST } from "~/languages/spell"

/** Update Rule.BlankLine to output AST properly. */
Rule.BlankLine.prototype.getAST = function(match) {
  return new AST.BlankLine(match)
}

// `Blocks` are generally the root entity that we parse in spell.
//  This is a top-level construct, e.g. used to parse an entire file.
//
//  They are composed of `blockLines` and nested `blocks`,
//  and correspond roughly to a `Scope` (see `parser/scope/Scope`).
//
// Note: Access this as `SpellParser.Rule.Block`.
SpellParser.Rule.Block = class block extends Rule {
  // Split statements up into blocks and parse 'em.
  parse(scope, tokens) {
    if (!tokens.length) return undefined
    return this.parseBlock(scope, tokens[0])
  }

  // Parse a `Token.Block`, returning a single `Match` for the entire block.
  // eslint-disable-next-line no-shadow
  parseBlock(scope, block) {
    const matched = []
    let index = 0
    let item
    while ((item = block.contents[index])) {
      // nested block
      if (item instanceof Token.Block) {
        const nestedBlock = this.parseBlock(scope, item)
        if (nestedBlock) {
          // console.warn("got a nested block when we weren't expecting one")
          // Push it into the stream, but don't wrap it in parens.
          matched.enclose = false
          matched.push(nestedBlock)
        } else {
          console.warn("saw unexpected nested block, parsing it didn't return anything")
        }
        index++
      } else {
        const line = scope.parser.getRuleOrDie("block_line").parse(scope, block.contents.slice(index))
        if (line) {
          matched.push(line)
          index += line.length
        } else {
          console.warn("Block.parse(): Got unproductive item", item)
          index++
        }
      }
    }
    // Forget it if we didn't match anything
    if (matched.length === 0) return undefined

    return new Match({
      rule: this,
      matched,
      scope,
      input: [block],
      length: 1 // matched one OUTER block...
    })
  }

  getAST(match) {
    const statements = match.matched.map(item => item.AST)
    if (match.enclose) return new AST.StatementBlock(match, { statements })
    return new AST.StatementGroup(match, { statements })
  }
}
