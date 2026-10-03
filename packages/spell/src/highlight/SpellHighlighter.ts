import { P } from "$/parser"
import { SP, type SpellHighlightSpan } from "$/spell"

/****************
 * ### `SpellHighlighter`
 * Colours a piece of spell source on its own -- no project, no file -- for `<ui-code language="spell">`.
 * - Two passes:
 *   1. TOKENS (always works):  comments, text, numbers and symbols, as the editor's instant colouring does
 *      (`SpellTokensProvider` in `app`);  a `#` heading comment is a `section`
 *   2. a PARSE as a `"block"`, best effort:  each match's own tokens take its rule's `highlightAs` (keywords,
 *      types, properties, variables ...), over the first pass.  Lines that don't parse (a name declared in another
 *      file) keep their token colours;  a parse that throws keeps them all.
 * - Kinds are highlight.js scopes (`SCOPES`), so `<ui-code>` colours spell with every other language's classes.
 * - Lighter than the language server's `highlightSpans()`:  no project, so no "declared here" / "built in"
 *   refinements.
 * - NEVER throws.
 ****************/
export class SpellHighlighter {
  /** highlight.js scope for each `P.HighlightKind`. */
  static readonly SCOPES: Readonly<Record<P.HighlightKind, string>> = {
    keyword: "keyword",
    operator: "operator",
    variable: "variable",
    parameter: "params",
    type: "type",
    enumMember: "literal",
    function: "title.function",
    property: "property",
    number: "number",
    string: "string",
    comment: "comment"
  }

  /** Scope of a `#` heading comment. */
  static readonly HEADING = "section"

  /** The coloured stretches of `text`, in order, never overlapping. */
  static spans(text: string): SpellHighlightSpan[] {
    const byStart = new Map<number, SpellHighlightSpan>()
    try {
      P.Tokenizer.forEachToken(SP.spellParser.tokenize(text, "") ?? [], (token) => {
        const kind = SpellHighlighter.tokenKind(token)
        if (kind) byStart.set(token.start, { start: token.start, end: token.end, kind })
      })
    } catch (error) {
      console.warn("SpellHighlighter:  couldn't tokenize", error)
      return []
    }
    try {
      const match = SP.spellParser.parse(text, "block")
      if (match) SpellHighlighter.walk(match, byStart, new Set())
    } catch {
      // a parse that throws:  the token colours stand
    }
    const spans = [...byStart.values()].sort((a, b) => a.start - b.start)
    return spans.filter((span, index) => index === 0 || span.start >= spans[index - 1]!.end)
  }

  /** Scope for `token` from its class alone (first pass);  `undefined` for none. */
  private static tokenKind(token: P.Token): string | undefined {
    if (token instanceof P.CommentToken) {
      return token.commentSymbol.startsWith("#") ? SpellHighlighter.HEADING : SpellHighlighter.SCOPES.comment
    }
    if (token instanceof P.TextToken) return SpellHighlighter.SCOPES.string
    if (token instanceof P.NumberToken) return SpellHighlighter.SCOPES.number
    if (token instanceof P.SymbolToken) return SpellHighlighter.SCOPES.operator
    return undefined
  }

  /** Colour `match`'s own tokens by its rule's `highlightAs`, then its children's (`seen`:  shared matches once). */
  private static walk(match: P.Match, byStart: Map<number, SpellHighlightSpan>, seen: Set<P.Match>) {
    if (seen.has(match)) return
    seen.add(match)
    const highlightAs = match.rule.highlightAs
    for (const item of match.matched) {
      if (item instanceof P.Match) continue
      if (!highlightAs || item instanceof P.CommentToken || item.start === undefined || item.end === undefined) continue
      if (
        !(
          item instanceof P.WordToken ||
          item instanceof P.SymbolToken ||
          item instanceof P.NumberToken ||
          item instanceof P.TextToken
        )
      )
        continue
      byStart.set(item.start, { start: item.start, end: item.end, kind: SpellHighlighter.SCOPES[highlightAs] })
    }
    for (const child of SpellHighlighter.children(match)) SpellHighlighter.walk(child, byStart, seen)
  }

  /** `match`'s child matches:  in `matched`, and in `data` (where some rules keep theirs), errors left out. */
  private static children(match: P.Match): P.Match[] {
    const children = new Set<P.Match>()
    for (const item of match.matched) if (item instanceof P.Match) children.add(item)
    for (const [key, value] of Object.entries(match.data ?? {})) {
      if (key === "errors") continue
      for (const item of [value].flat()) if (item instanceof P.Match && item !== match) children.add(item)
    }
    return [...children]
  }
}
