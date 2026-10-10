import { upperFirst } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
import { SpellExpression } from "$/spell/rules/expressions"

/**
 * Base for rules which READ a member off an object or `it`, e.g. `the short rank of the card`, `its suit`.
 * - What they found, noted while parsing, is in `data` (`MemberData`):  `getDatatype()` and `getMemberAST()` read it.
 * - `MemberReadExpression.memberRead()` says what any of them reads, e.g. for `set the X of Y to ...`.
 */
export class MemberReadExpression<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends SpellExpression<Groups, MatchData & MemberData> {
  /** What the member we read holds:  a property's datatype, an enumeration's values (`list`), a method's return. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    const { member } = match.data as MemberData
    if (member instanceof P.ScopeMethod) return member.returns
    return member?.enumeration ? "list" : member?.datatype
  }

  /**
   * `object.property` for a resolved read -- or:
   * - for an enumerated property's values, its type's class variable,
   *   e.g. `Card.Suits` for `the suits of the card`
   * - for a built-in type's member, what its `readAs` template says,
   *   e.g. `spellCore.itemCountOf(deck)` for `the length of the deck` -- see `builtInMemberAST()`
   */
  getMemberAST(match: P.MatchFor<this>, object: P.ASTExpression, property: P.Match): P.ASTExpression {
    const { member, enumerationOf } = match.data as MemberData
    if (enumerationOf && member) {
      const type = new P.ASTTypeExpression(match, { name: enumerationOf })
      return new P.ASTPropertyExpression(match, { object: type, property: member.name })
    }
    if (member instanceof P.ScopeVariable && member.readAs) {
      return MemberReadExpression.builtInMemberAST(match, object, member.readAs)
    }
    // a value kind's property declared further down, e.g. `the color of its suit` in a card above the deck:
    // its type's record knows by now (issue I3 of `outline-spell`) -- the static form, as `property_value_getter`'s
    const { ownerType } = match.data as MemberData
    if (!member && ownerType?.valueKind) {
      return MemberReadExpression.builtInMemberAST(match, object, `${ownerType.name}.${property.value}({it})`)
    }
    return new P.ASTPropertyExpression(match, { object, property: P.asAST<P.ASTPropertyLiteral>(property.AST) })
  }

  /**
   * SIDE EFFECT:  notes property `words` of `type` as `match.data.member`
   * -- and, for an enumeration, the type holding its values (`enumerationOf`).
   * - `false` if there's no such property.
   */
  resolveMember(match: P.MatchFor<this>, type: P.TypeScope | undefined, words: string): boolean {
    const member = MemberReadExpression.propertyOf(type, words)
    if (!member) return false
    const data = match.data as MemberData
    data.member = member
    if (member.enumeration && member.scope instanceof P.TypeScope) data.enumerationOf = member.scope.name
    return true
  }

  /**
   * The property `words` names on `type` (or a super-type) -- `undefined` if it's not one, or `type` is unknown.
   * - Properties only:  `the X of Y` doesn't call a method.
   * - A lookup:  call it WHILE PARSING.
   */
  static propertyOf(type: P.TypeScope | undefined, words: string): P.ScopeVariable | undefined {
    const member = type?.getMember(words)
    return member instanceof P.ScopeVariable ? member : undefined
  }

  /**
   * Warn on a LOOSE read of a member its type never declares (epic `output-targets`, Q45), e.g. `the name of the pile`:
   * `A pile never says it has a name:  declare it, e.g. "a pile has a name as text"`.
   * - Only for a type this project declares (or will:  a stub), never a built-in or an imported one,
   *   nor one whose super-types include an imported one:  spell knows all of its members only then.
   *   e.g. a program importing `a pile` from another project may give piles a `name` it never declares.
   * - Checked when the warnings are gathered, not now (`SP.SpellWarnings.noteIf()`):  a later line or file may
   *   declare it, e.g. `a pile has a name` in a file further down, or `set the name of the pile to ...` --
   *   which reads it loose first, itself.
   * - SIDE EFFECT:  notes it on `match`, under its `property`.  Call it WHILE PARSING, with the type it found.
   */
  static warnIfUndeclared(match: P.Match, ownerType: P.TypeScope | undefined, property: P.Match): void {
    if (!ownerType || !(ownerType.stub || ownerType.declaredBy)) return
    const aWord = (words: string) => `${/^[aeiou]/i.test(words) ? "an" : "a"} ${words}`
    const words = property.raw ?? `${property.value}`
    const aType = aWord(ownerType.name.toLowerCase().replace(/_/g, "-"))
    const declaration = `${aType} has ${aWord(words)} as ${SP.SpellWarnings.exampleType(match.scope, words)}`
    const message = `${upperFirst(aType)} never says it has ${aWord(words)}:  declare it, e.g. "${declaration}"`
    const stillHolds = () =>
      MemberReadExpression.knowsAllMembersOf(ownerType) && !ownerType.getMember(`${property.value}`)
    SP.SpellWarnings.noteIf(match, message, stillHolds, property)
  }

  /**
   * Does spell know every member `type` has?  Only when the project declares it (no `stub` left),
   * and each of its super-types is the project's too, or spell's own (`Thing`, `List` ...), never an import.
   * - Reads the records as they are now:  a stub may be claimed after a read of it.
   */
  private static knowsAllMembersOf(type: P.TypeScope): boolean {
    if (type.stub || !type.declaredBy) return false
    const chain = type.chain()
    // a super-type it can't find:  unknown, so it might have anything
    if (chain.at(-1)!.superType) return false
    return chain.every((each) => !each.stub && !(each.parentScope instanceof P.ImportScope))
  }

  /**
   * What `match` reads, if it's a member read -- `the X of Y`, `its X`, loose or resolved -- else `undefined`.
   * - `type`:  the type it reads from, if known -- for a resolved read, the one declaring what it found
   * - `property`:  its `property` match, the member's words
   * - `member`:  what it found, if anything
   * - Why:  `set the X of Y to ...` declares `X` if `Y`'s type doesn't -- see `AssignmentStatement`.
   * - Reads only `match.data`, as noted while parsing.
   */
  static memberRead(match: P.Match): MemberRead | undefined {
    if (!(match.rule instanceof MemberReadExpression)) return undefined
    const { ownerType, member } = match.data as MemberData
    const property = match.groups.property as P.Match
    const declaredOn = member?.scope instanceof P.TypeScope ? member.scope : undefined
    return { type: declaredOn ?? ownerType, property, member }
  }

  /**
   * A built-in type's member read off `object`, as its `readAs` template says -- see `SP.BuiltInMember.readAs`.
   * - `{it}.length` => `object.length`
   * - `{it}.getFullYear()` => `object.getFullYear()`
   * - `spellCore.itemCountOf({it})` => `spellCore.itemCountOf(object)`
   * - The table's templates are checked as it loads (`SP.loadBuiltInTypes()`), so one always reads.
   */
  private static builtInMemberAST(match: P.AnyMatch, object: P.ASTExpression, readAs: string): P.ASTExpression {
    const { form, name, type } = SP.parseReadAsTemplate(readAs)!
    if (form === "property") return new P.ASTPropertyExpression(match, { object, property: name })
    if (form === "method") return new P.ASTScopedMethodInvocation(match, { thing: object, methodName: name })
    if (form === "static") {
      const thing = new P.ASTTypeExpression(match, { name: type! })
      return new P.ASTScopedMethodInvocation(match, { thing, methodName: name, args: [object] })
    }
    return new P.ASTCoreMethodInvocation(match, { methodName: name, args: [object] })
  }
}

/** What a `MemberReadExpression` stashes on its match. */
type MemberData = {
  /** Member it reads, found while parsing -- see `P.TypeScope.getMember()`.  `undefined` if none known. */
  member?: P.ScopeVariable | P.ScopeMethod
  /** LOOSE reads:  the type it reads from, if known -- see `memberRead()`. */
  ownerType?: P.TypeScope
  /** An enumerated property's values:  the type whose class variable holds them, e.g. `Card`. */
  enumerationOf?: string
}

/** What `MemberReadExpression.memberRead()` says a member read reads. */
export type MemberRead = {
  /** Type it reads from, if known. */
  type?: P.TypeScope
  /** Its `property` match:  the member's words. */
  property: P.Match
  /** What it found, if anything. */
  member?: P.ScopeVariable | P.ScopeMethod
}
