import { kebabCase, proto } from "@spell-app/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { SpellType } from "$/spell/rules/types/SpellType"

/**
 * A statement declaring a type -- which may take an OUTLINE body:
 * `a card is a thing where:`, then indented lines all about cards, e.g. `- it has a deck` (epic page `outline-spell`).
 * - The body's scope is a `P.SubjectScope` about the type:  `it` / `its` there mean it,
 *   `subject_it` / `subject_its` -- except inside a method or getter, where `it` is the instance.
 * - `flatBody`:  the body compiles beside the class, as if its lines were written out at the top level,
 *   so its members are hoisted into the class as usual.
 * - `where:`, `with:` and a bare `:` all open the body (epic page Q7):  `{with_nested_statements}?`.
 *   - So does `where` alone, or nothing at all:  the indented block under the heading is its body
 *     (epic page `outline-spell`, P10) -- see `takesNestedBody()`.
 * - Its name may be several words, and it may have a short name too (epic `drawable-thing`, P1):
 *   `a bank account aka account is a thing` -- `{type:type_words} (aka {aka:singular_type})?`.
 *   - Either name finds the type afterwards, e.g. `the accounts`, `a new bank account`.
 *   - A name some other type already goes by is refused -- see `refuseTakenNames()`.
 *   - So is a type declared a second time (issue I13):  `a game:` adds to it -- see `reopen_type`.
 * - A DRAWABLE type (`a card is a drawable thing`, or a sub-type of one) defines its element as its class is declared,
 *   in a static field:  `static elementTag = core.defineElement(this, "Solitaire")` -- see `elementMember()`.
 */
export class TypeDeclaration<
  Groups extends string,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends SpellStatement<Groups, MatchData> {
  @proto static priority = Priority.declaration
  @proto static alias = "statement"
  @proto static flatBody = true

  /**
   * The indented block under us is our body, whether or not the line ends `where:`, `with:` or `:`
   * (epic page `outline-spell`, P10):  `a stock-pile is a pile`, then `- can give up a card if: ...` under it.
   * - Only a syntax which takes a body at all, `{with_nested_statements}?`.
   */
  takesNestedBody(_match: P.Match): boolean {
    return !!this.bodySpec
  }

  /** Our body is all about the type we declare -- see class docs. */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.SubjectScope {
    const { groups, scope } = TypeDeclaration.named(match)
    return new P.SubjectScope({ parentScope: scope, subject: `${groups.type.value}`, declaredBy: match as P.Match })
  }

  /**
   * `match`, or a parse error if one of its names is already some other type's:
   * - its name is another type's short name, e.g. `an account is a thing` after `a bank account aka account ...`
   * - its short name names another type, e.g. `a bank account aka card ...` when there's a card
   * - it's declared already, by another line of the project (issue I13):  JavaScript won't load two classes of
   *   one name, so the error says to add to it, `a game:` -- see `reopen_type`
   * - Call it WHILE PARSING:  it looks up scope.
   */
  refuseTakenNames(match: P.Match): P.Match {
    const { groups, scope } = TypeDeclaration.named(match)
    const name = P.classCase(`${groups.type.value}`)
    const named = scope.types?.get(name)
    if (named && SpellType.isShortName(named, name)) {
      return SpellStatement.refuse(match, `"${groups.type.raw}" is already the short name of ${wordsOf(named.name)}`)
    }
    const { aka } = groups
    const akaNamed = aka && scope.types?.get(`${aka.value}`)
    if (akaNamed && akaNamed.name !== name) {
      return SpellStatement.refuse(match, `"${aka.raw}" already names a type:  ${wordsOf(akaNamed.name)}`)
    }
    if (named && TypeDeclaration.isDeclaredElsewhere(named, match)) {
      // as the line says it, e.g. `an account`
      const words = `${match.tokens[0]!.value} ${`${groups.type.raw}`.replace(/^["']|["']$/g, "")}`.toLowerCase()
      return SpellStatement.refuse(
        match,
        `There's ${words} already, ${TypeDeclaration.whereDeclared(named.declaredBy!, match)}:  ` +
          `to add to it, write "${words}:"`
      )
    }
    return match
  }

  /**
   * SIDE EFFECT:  declares `match`'s type in its scope, with its short name if it has one
   * -- unless it's already defined (no redefinition / merge).
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

  /**
   * Name of the project `scope` is in, which a drawable type's element is named after, e.g. `Solitaire` --
   * `""` outside a project.  Call it WHILE PARSING:  it looks up scope.
   */
  static projectNameOf(scope: P.Scope): string {
    for (let at: P.Scope | undefined = scope; at; at = at.parentScope) {
      if (at instanceof P.ProjectScope) return at.name ?? ""
    }
    return ""
  }

  /**
   * The member that defines a drawable type's element as its class is declared, in project `project` --
   * `undefined` for a type that isn't drawable (no `project`).
   * - `static elementTag = core.defineElement(this, "Solitaire")`:  a static field runs as the class is made,
   *   so before the program draws anything.  See `core.defineElement()`, in core's `elements.ts`.
   */
  elementMember(match: P.Match, type: P.ASTTypeExpression, project: string | undefined): P.ASTClassMember | undefined {
    if (project === undefined) return undefined
    return new P.ASTStaticDefinition(match, {
      type,
      name: "elementTag",
      value: new P.ASTStringLiteral(match, `core.defineElement(this, ${JSON.stringify(project)})`)
    })
  }

  /** `match`, with the groups every type declaration has:  TS can't see every subclass has them. */
  /**
   * Did ANOTHER line of the project declare `type`?
   * - Not a stub (a mention, or the pre-pass's), an imported type, a built-in, or this line's own earlier parse.
   */
  private static isDeclaredElsewhere(type: P.TypeScope, match: P.Match): boolean {
    if (type.stub || !type.declaredBy || type.parentScope instanceof P.ImportScope) return false
    return !P.TypeScope.sameStatement(type.declaredBy, match)
  }

  /** Where `declaredBy` is, as seen from `match`:  `on line 3`, or `on line 3 of /Card.spell` in another file. */
  private static whereDeclared(declaredBy: P.Match, match: P.Match): string {
    const line = `on line ${declaredBy.line! + 1}`
    const file = TypeDeclaration.fileOf(declaredBy.scope)
    return file && file !== TypeDeclaration.fileOf(match.scope) ? `${line} of ${file.path}` : line
  }

  /** The file `scope` is in, if any. */
  private static fileOf(scope: P.Scope | undefined): P.FileScope | undefined {
    for (let current = scope; current; current = current.parentScope) {
      if (current instanceof P.FileScope) return current
    }
    return undefined
  }

  private static named(match: object) {
    return match as unknown as P.Match<{ type: P.Match; aka?: P.Match }>
  }
}

/** A type's name in words, e.g. `bank account` for `BankAccount`. */
function wordsOf(typeName: string): string {
  return kebabCase(typeName).replace(/-/g, " ").trim()
}
