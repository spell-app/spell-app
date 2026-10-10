import { proto, typeCase } from "$/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { SpellType } from "$/spell/rules/types/SpellType"

/**
 * A statement declaring a type -- which may take an OUTLINE body:  `a card is a thing where:`, then indented
 * lines all about cards, e.g. `- it has a deck` (plan doc `outline-spell`).
 * - The body's scope is a `P.SubjectScope` about the type:  `it` / `its` there mean it -- `subject_it`,
 *   `subject_its` -- except inside a method or getter, where `it` is the instance.
 * - `flatBody`:  the body compiles beside the class, as if its lines were written out at the top level,
 *   so its members are hoisted into the class as usual.
 * - `where:`, `with:` and a bare `:` all open the body (plan doc Q7):  `{with_nested_statements}?`.
 * - Its name may be several words, and it may have a short name too (epic `drawable-thing`, P1):
 *   `a bank account aka account is a thing` -- `{type:type_words} (aka {aka:singular_type})?`.
 *   - Either name finds the type afterwards, e.g. `the accounts`, `a new bank account`.
 *   - A name some other type already goes by is refused -- see `refuseTakenNames()`.
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
    const { groups, scope } = TypeDeclaration.named(match)
    return new P.SubjectScope({ parentScope: scope, subject: `${groups.type.value}`, declaredBy: match as P.Match })
  }

  /**
   * `match`, or a parse error if one of its names is already some other type's:
   * - its name is another type's short name, e.g. `an account is a thing` after `a bank account aka account ...`
   * - its short name names another type, e.g. `a bank account aka card ...` when there's a card
   * - Call it WHILE PARSING:  it looks up scope.
   */
  refuseTakenNames(match: P.Match): P.Match {
    const { groups, scope } = TypeDeclaration.named(match)
    const name = typeCase(`${groups.type.value}`)
    const named = scope.types?.get(name)
    if (named && SpellType.isShortName(named, name)) {
      return SpellStatement.refuse(match, `"${groups.type.raw}" is already the short name of ${wordsOf(named.name)}`)
    }
    const { aka } = groups
    const akaNamed = aka && scope.types?.get(`${aka.value}`)
    if (akaNamed && akaNamed.name !== name) {
      return SpellStatement.refuse(match, `"${aka.raw}" already names a type:  ${wordsOf(akaNamed.name)}`)
    }
    return match
  }

  /**
   * SIDE EFFECT:  declares `match`'s type in its scope, with its short name if it has one -- unless it's already
   * defined (no redefinition / merge).
   * - A type only STUBBED by an earlier mention, or left by an earlier parse of this statement, is claimed instead --
   *   see `P.TypeScope.claim()`.
   * - An IMPORTED one is declared again anyway, so `SP.SpellDeclarations.checkImportClashes()` can report it.
   */
  declareType(match: P.Match, superType: string, { itemType }: { itemType?: P.Datatype } = {}): void {
    const { groups, scope } = TypeDeclaration.named(match)
    const name = `${groups.type.value}`
    const options = { itemType, aka: groups.aka && `${groups.aka.value}` }
    // TODO: complain if existing type is set up differently!
    const existing = scope.types?.get(name)
    if (existing && !(existing.parentScope instanceof P.ImportScope)) {
      // a stub, or left by an earlier parse of this statement -- see `P.TypeScope.sameStatement()`
      if (existing.stub || P.TypeScope.sameStatement(existing.declaredBy, match)) {
        existing.claim(match, superType, options)
      }
      return
    }
    scope.types?.add({ name, superType, declaredBy: match, ...options })
  }

  /** `match`, with the groups every type declaration has:  TS can't see every subclass has them. */
  private static named(match: object) {
    return match as unknown as P.Match<{ type: P.Match; aka?: P.Match }>
  }
}

/** A type's name in words, e.g. `bank account` for `Bank_Account`. */
function wordsOf(typeName: string): string {
  return typeName.replace(/_/g, " ").toLowerCase()
}
