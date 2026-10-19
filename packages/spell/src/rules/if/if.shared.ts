import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"

/**
 * `match`, a `value_if` / `value_otherwise` line -- or, outside any getter or method, a parse error saying where it
 * belongs (epic page `outline-spell`, issue I9).
 * - e.g. `red if x is 1` at a file's top level, or `- "is face up" if its direction is up` in a type's outline body
 * - Why:  each compiles to a `return`, which outside a function is a program that won't load.
 * - A lookup:  call it WHILE PARSING.
 */
export function refuseOutsideMethod(match: P.Match): P.Match {
  for (let scope: P.Scope | undefined = match.scope; scope; scope = scope.parentScope) {
    if (scope instanceof P.MethodScope) return match
  }
  return SpellStatement.refuse(match, `A line of a getter's body:  put it under one, e.g. "the color of a card is:"`)
}
