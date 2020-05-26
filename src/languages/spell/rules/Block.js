import _ from "lodash"

import { Match, Rule, Token } from "~/parser"
import { SpellParser, AST } from "~/languages/spell"

// `Blocks` are generally the root entity that we parse in spell.
//  This is a top-level construct, e.g. used to parse an entire file.
//
//  They are composed of `block_lines` and nested `blocks`,
//  and correspond roughly to a `Scope` (see `parser/scope/Scope`).
SpellParser.Rule.Block = class block extends Rule {
  parse(scope, tokens) {
    if (!tokens.length) return undefined
    if (tokens.length !== 1) console.warn(`Block.parse(): unexpectedly got ${tokens.length} tokens:`, tokens)
    // eslint-disable-next-line no-shadow
    const block = tokens[0]
    // build up matches for individual items
    const matched = []
    const items = [...block.contents]
    while (items.length) {
      let result
      // nested block
      if (items[0].tokens?.[0] instanceof Token.Block) {
        // attempt to parse as a nested block
        result = this.parse(scope, items[0].tokens)
        if (result) {
          // console.warn("got a nested block when we weren't expecting one")
          // Push it into the stream, but don't wrap it in parens.
          result.enclose = false
        } else {
          console.warn("saw unexpected nested block, parsing it didn't return anything")
        }
      } else {
        result = scope.parse(items, "block_line")
      }

      if (result) {
        matched.push(result)
        // pop the matched items off of the list
        items.splice(0, result.length)
      } else {
        console.warn("Block.parse(): Got unproductive item", items[0])
        items.shift()
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
