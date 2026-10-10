import { proto } from "$/util"
import { P } from "$/parser"
import { SpellType } from "./SpellType"

/**
 * `it` in an outline-style type's body:  the type the body is about -- `Card` in `- it has a deck` under
 * `a card is a thing where:`.  See `P.SubjectScope`.
 * - A `SpellType` match, so a rule takes it where it takes `a card`, e.g. `{type:subject_it} has ...`:
 *   - `value` is the type's name, e.g. `Card`;  `data.scopeType` its `TypeScope`
 *   - `raw` is the type's instance name, e.g. `card`, NOT `it`:  rules read `raw` as the type's words,
 *     e.g. `quoted_type_expression` for its signature's `instanceType`
 * - Fails anywhere else, including inside a method or getter in the body, where `it` is the instance.
 * - `word`:  `it`, or `its` (`subject_its`) for a property:  `its "suit" is ...`.
 */
export class SubjectRule extends SpellType {
  /** Editors colour it as they colour `it` anywhere:  a variable. */
  @proto static highlightAs?: P.HighlightKind = "variable"
  /** Word we match, any case. */
  declare word: string
  @proto static word = "it"

  test(scope: P.Scope, tokens: P.Token[], start = 0) {
    const token = tokens[start]
    return token instanceof P.WordToken && `${token.value}`.toLowerCase() === this.word
  }

  parse(scope: P.Scope, tokens: P.Token[]) {
    const [token] = tokens
    if (!token || !this.test(scope, tokens)) return undefined
    const scopeType = P.SubjectScope.of(scope)?.subjectType
    if (!scopeType) return undefined
    const match: P.MatchFor<this> = new P.Match({
      rule: this,
      matched: [token],
      raw: scopeType.instanceName,
      value: scopeType.name,
      tokens: [token],
      scope
    })
    match.data.scopeType = scopeType
    return match
  }

  /** A declaration names the type, e.g. `card`, not `it`. */
  declaredText(match: P.Match): string {
    return `${match.raw}`
  }
}
