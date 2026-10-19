import { proto } from "$/util"
import { P } from "$/parser"
import { types } from "./types.parser"
import { SubjectRule } from "./SubjectRule"

/**
 * `subject_implied` rule:  the subject an outline body's line leaves out, e.g. `- "suit" is a suit` or
 * `- has a name as text` for `its "suit" is a suit`, `it has a name as text` -- see `SubjectRule`
 * (epic page `outline-spell`, P8).
 * - Takes NO tokens (`zeroWidth`):  the line's own first word follows it in each member rule's syntax,
 *   a quoted name, or a verb such as `has` or `belongs`.
 * - Only in a type's outline body, as `it` / `its`.
 */
export class SubjectImplied extends SubjectRule {
  @proto static zeroWidth = true

  /** Could the line we're at leave its subject out?  Only in a type's outline body. */
  test(scope: P.Scope) {
    return !!P.SubjectScope.of(scope)?.subjectType
  }

  parse(scope: P.Scope) {
    const scopeType = P.SubjectScope.of(scope)?.subjectType
    if (!scopeType) return undefined
    const match: P.MatchFor<this> = new P.Match({
      rule: this,
      matched: [],
      raw: scopeType.instanceName,
      value: scopeType.name,
      tokens: [],
      scope
    })
    match.data.scopeType = scopeType
    return match
  }
}
types.addRule(SubjectImplied)
