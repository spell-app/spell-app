import { assert, proto } from "$/util"
import { P } from "$/parser"
import { core } from "./core.parser"

/**
 * `text` rule:  literal `text` string.
 * - e.g. `""`
 * - NOTE: in spell you must use DOUBLE QUOTES (`"`) -- single quotes are treated as a single symbol.
 * - Its AST is a text value:  the text inside the quotes, with the source's spelling, quotes and all, as `raw`.
 * - Class named `TextLiteral`, not `Text`, which would hide the DOM's `Text`.
 */
export class TextLiteral extends P.TokenType<never, { fillIns?: FillInParts }> {
  static ruleName = "text"
  @proto static alias = "expression"
  @proto static highlightAs: P.HighlightKind = "string"
  @proto static datatype = "text"
  @proto static tokenType = P.TextToken

  /**
   * Match -- and parse any `[name]` fill-ins inside, e.g. `"images/[rank]-of-[suit].png"` (plan doc
   * `outline-spell`, P4;  Q2:  brackets, always) -- see `parseFillIns()`.
   * - A fill-in which doesn't parse:  no match, so the line says "Don't understand".
   */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    const [token] = tokens
    if (!match || !(token instanceof P.TextToken)) return match
    const fillIns = parseFillIns(scope, token.innerText)
    if (fillIns === null) return undefined
    if (fillIns) match.data.fillIns = fillIns
    return match
  }

  getAST(match: P.MatchFor<this>): P.ASTStringLiteral | P.ASTTemplateString {
    if (match.data.fillIns) return fillInsAST(match, match.data.fillIns)
    const raw = assert.string(match.value)
    return new P.ASTStringLiteral(match, {
      value: TextLiteral.plainText(raw, match.matched[0] as P.TextToken),
      quote: '"',
      raw
    })
  }

  /** The text `raw` spells, escapes undone (`"say \"hi\""` => `say "hi"`) where JSON can read it, else as typed. */
  static plainText(raw: string, token: P.TextToken): string {
    try {
      return JSON.parse(raw) as string
    } catch {
      return token.innerText
    }
  }
}
core.addRule(TextLiteral, {
  tests: [
    {
      title: "correctly matches text",
      tests: [
        ['""', '""'],
        ['"a"', '"a"'],
        ['"abcd"', '"abcd"'],
        ['"abc def ghi. jkl"', '"abc def ghi. jkl"'],
        [`"...Can't touch this"`, `"...Can't touch this"`]
      ]
    },
    {
      title: "values inside:  [name] fills in;  [[ and \\[ are a real [",
      beforeEach(scope: P.Scope) {
        ;(scope as P.BlockScope).variables.add("rank")
        ;(scope as P.BlockScope).variables.add("suit")
      },
      tests: [
        ['"images/[rank]-of-[suit].png"', "`images/${rank}-of-${suit}.png`"],
        ['"[rank + 1] cards"', "`${(rank + 1)} cards`"],
        ['"[[draft]] or \\[draft]"', "`[draft] or [draft]`"],
        ['"a `tick` and ${x}"', '"a `tick` and ${x}"'],
        ['"`[rank]` ${x}"', "`\\`${rank}\\` \\${x}`"],
        ['"[no such thing here]"', undefined]
      ]
    }
  ]
})

/**
 * Text with fill-ins, split up:  each plain piece (as written, its escapes kept) or a fill-in's parsed match.
 * - Shared by `text` and the JSX text rule:  `SpellJSXText`.
 */
export type FillInParts = Array<string | P.Match>

/**
 * `inner`, the text between a string's quotes, split into plain pieces and parsed `[...]` fill-ins
 * (plan doc `outline-spell`, P4):
 * - `[x]`:  `x` is an expression, e.g. `[rank + 1]`;  inside a method, a bare property name is the thing's,
 *   `[rank]` ~== `[its rank]`
 * - a real bracket:  `[[` or `\[` for `[`, `]]` for `]` (Q15:  both)
 * - `undefined`:  no brackets at all, the text stays as written;  `null`:  a fill-in that doesn't parse
 * - Parses each fill-in on its own, so a fill-in's tokens don't map back onto the file:  no hover inside, yet.
 */
export function parseFillIns(scope: P.Scope, inner: string): FillInParts | undefined | null {
  if (!/[[\]]/.test(inner)) return undefined
  const parts: FillInParts = []
  let plain = ""
  for (let index = 0; index < inner.length; index++) {
    const char = inner[index]!
    const next = inner[index + 1]
    if (char === "\\" && next === "[") {
      plain += "["
      index++
    } else if ((char === "[" && next === "[") || (char === "]" && next === "]")) {
      plain += char
      index++
    } else if (char === "[") {
      const end = inner.indexOf("]", index + 1)
      if (end < 0) return null
      const fillIn = parseFillIn(scope, inner.slice(index + 1, end).trim())
      if (!fillIn) return null
      if (plain) parts.push(plain)
      parts.push(fillIn)
      plain = ""
      index = end
    } else {
      plain += char
    }
  }
  if (plain) parts.push(plain)
  return parts
}

/**
 * One fill-in's words, parsed as an expression -- `its <words>` if they're a property of `it`'s type,
 * e.g. `[rank]` in a card's getter.  `undefined` if it doesn't parse, whole.
 */
function parseFillIn(scope: P.Scope, words: string): P.Match | undefined {
  if (!words) return undefined
  const itType = scope.getType(scope.variables?.get("it")?.datatype)
  const source = itType?.getMember(words) ? `its ${words}` : words
  const match = scope.parse(source, "expression")
  return match && match.inputText.trim() === source ? match : undefined
}

/** The AST of text with fill-ins:  a javascript template string -- see `P.ASTTemplateString`. */
export function fillInsAST(match: P.Match, parts: FillInParts): P.ASTTemplateString {
  return new P.ASTTemplateString(match, {
    parts: parts.map((part) => (typeof part === "string" ? part : P.matchAST<P.ASTExpression>(part)))
  })
}
