import { NONE } from "@spell-app/util"
import { P } from "$/parser"
import { expressions } from "./expressions.parser"

/** Hex digits, the most a code point has:  6 (`10FFFF`). */
const HEX_CODE = /^[0-9a-f]{1,6}$/i

/**
 * `unicode_code` rule:  a code point written in hex, e.g. `1F0A0`, `2665`, `A0` (epic page `outline-spell`, P26).
 * - Its digits written together:  `1F0A0` is a number token and a word token, side by side, joined here.
 * - Not a known variable:  `unicode A0` reads the variable `A0` if there is one.
 * - Up to `10FFFF`, the last code point.
 */
export class UnicodeCode extends P.Pattern {
  constructor(props?: Partial<P.PatternProps>) {
    super({ pattern: /^[0-9a-z]+$/i, ...props })
  }

  /** Quick test:  a number or word first. */
  test(_scope: P.Scope, tokens: P.Token[], start = 0) {
    const first = tokens[start]
    return first instanceof P.NumberToken || first instanceof P.WordToken
  }

  /** The hex digits, as one code point -- see the class docstring. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    let length = 0
    let text = ""
    for (const token of tokens) {
      if (!(token instanceof P.NumberToken || token instanceof P.WordToken)) break
      // written together:  a token's `whitespace` is what comes AFTER it, so the one before must have none
      if (length && tokens[length - 1]!.whitespace) break
      text += `${token.raw}`
      length++
    }
    if (!length || !HEX_CODE.test(text)) return undefined
    const code = Number.parseInt(text, 16)
    if (code > 0x10ffff) return undefined
    if (length === 1 && tokens[0] instanceof P.WordToken && (scope.variables?.get(text) ?? NONE) !== NONE)
      return undefined
    const taken = tokens.slice(0, length)
    return new P.Match({ rule: this, matched: taken, raw: text, value: code, tokens: taken, scope })
  }
}
expressions.addRule(UnicodeCode)
