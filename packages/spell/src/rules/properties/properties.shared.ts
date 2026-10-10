/**
 * Shared by the `properties` rule files:  the words a member's name stops at,
 * and how the `its_*` rules read `it`.
 */
import { NONE } from "$/util"
import { P } from "$/parser"

/**
 * Words which end a run of `member_words`:  spell's structural words, never part of a member's name.
 * - e.g. `of` ends `the short rank of`, `as` ends `a card has short rank as text`,
 *   `is` a test, `and` a list, `where` / `whose` / `with` / `for` / `from` / `in` / `to` a clause.
 * - Anything not a word ends a run too, e.g. `+`, `:`, `,` or a number.
 */
export const MEMBER_STOP_WORDS = new Set([
  "of",
  "the",
  "a",
  "an",
  "is",
  "isnt",
  "are",
  "was",
  "has",
  "have",
  "in",
  "to",
  "and",
  "or",
  "if",
  "where",
  "as",
  "with",
  "whose",
  "for",
  "from",
  "then",
  "else",
  "otherwise",
  "not",
  "into",
  "on",
  "by",
  "at"
])

/**
 * Stop words which may still START a member's name,
 * e.g. `with jokers` in `a deck has with jokers as yes or no`, `in play`, `on top`.
 * - They END a run anywhere else:  `the jokers with ...` is `jokers`.
 * - Safe:  a name starts only where a rule's syntax expects one, e.g. after `has` or `the`.
 */
export const MEMBER_LEADING_WORDS = new Set(["with", "for", "from", "in", "on", "by", "at", "into"])

/** What `its_*` rules stash on their matches. */
export type ItsMatchData = {
  /** `it` in scope when parsed, or `NONE` => means `this`.  Looked up THEN, not in `getAST()` -- see `SpellIdentifier`. */
  itVar?: P.ScopeVariable | typeof NONE
}

/** `it` as an object to read from:  the `it` we noted while parsing, else `this` -- see `ItsMatchData`. */
export function itsObject(match: P.Match<P.AnyGroups, ItsMatchData>): P.ASTExpression {
  const itVar = match.data.itVar === NONE ? undefined : match.data.itVar
  if (!itVar) return new P.ASTSelfLiteral(match)
  return new P.ASTVariableExpression(match, { raw: "it", name: itVar.output || itVar.name })
}
