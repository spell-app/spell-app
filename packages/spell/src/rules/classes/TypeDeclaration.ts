import { proto } from "$/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"

/**
 * A statement declaring a type -- which may take an OUTLINE body:  `a card is a thing where:`, then indented
 * lines all about cards, e.g. `- it has a deck` (plan doc `outline-spell`).
 * - The body's scope is a `P.SubjectScope` about the type:  `it` / `its` there mean it -- `subject_it`,
 *   `subject_its` -- except inside a method or getter, where `it` is the instance.
 * - `flatBody`:  the body compiles beside the class, as if its lines were written out at the top level,
 *   so its members are hoisted into the class as usual.
 * - `where:`, `with:` and a bare `:` all open the body (plan doc Q7):  `{with_nested_statements}?`.
 */
export class TypeDeclaration<
  Groups extends string,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends SpellStatement<Groups, MatchData> {
  @proto static priority = Priority.declaration
  @proto static alias = "statement"
  @proto static flatBody = true

  /** Our body is all about the type we declare -- see class docs. */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.SubjectScope {
    // generic `Groups`:  TS can't see every subclass has a `type` group
    const { groups, scope } = match as unknown as P.Match<{ type: P.Match }>
    return new P.SubjectScope({ parentScope: scope, subject: `${groups.type.value}`, declaredBy: match as P.Match })
  }
}
