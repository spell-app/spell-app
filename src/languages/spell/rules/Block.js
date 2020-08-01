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
    if (!(block instanceof Token.Block)) console.warn("parseBlock: got non-block", block)

    // build up matches for individual items
    const matched = []
    const errors = []
    const items = [...block.tokens]
    while (items.length) {
      let match
      const first = items[0]
      // recurse for nested block
      if (first instanceof Token.Block) {
        match = this.parse(scope, [first])
      }
      // process Line as "line" -- a statement with optional comment, etc.
      else if (first instanceof Token.Line) {
        match = scope.parse(items, "line")
      } else {
        console.warn("Block.parse(): Don't know what to do with token", first)
      }

      if (match) {
        matched.push(match)
        if (match.errors) errors.push(...match.errors)
        // pop the matched items off of the list
        items.splice(0, match.length)
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
      errors: errors.length ? errors : undefined,
      scope,
      input: [block],
      length: 1 // matched one OUTER block...
    })
  }

  getAST(match) {
    const statements = match.matched.map((item) => item.AST)
    if (match.enclose) return new AST.StatementBlock(match, { statements })
    return new AST.StatementGroup(match, { statements })
  }
}
