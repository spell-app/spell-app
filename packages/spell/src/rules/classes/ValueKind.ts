import { pluralize, proto, singularize, typeCase, upperFirst } from "$/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { classes } from "./classes.parser"
import { TypeSpecifierEnum } from "./TypeSpecifierEnum"

/**
 * `value_kind` rule:  `"suits" as one of clubs, diamonds, hearts or spades` in a type's outline body:  a list of values
 * which is a KIND of thing of its own, `suit`, kept by the type the body is about (plan doc `outline-spell`, P2;  was
 * todo T7 of `precedence-and-types`).
 * - So another type can say `its "suit" is a suit`, and the kind can have properties:
 *   `the "color" of a suit is: ...` -- see `property_value_getter`.
 * - SIDE EFFECT:  on the body's type, e.g. `Deck`, the class variable `Suits` and its instance twin, as
 *   `define_property_has` gives an enumerated property's;  each value a project constant;  and the kind's
 *   `P.TypeScope`, e.g. `Suit`, with `valueKind` -- claiming a stub of it, e.g. from `its "suit" is a suit` above.
 * - Compiles to the list, then the kind's class, which holds its properties:
 *   `Deck.Suits = ['clubs', ...]` + `export class Suit {}`.  Its values stay plain text (plan doc Q10).
 * - The name MUST be quoted:  see the registration.
 */
export class ValueKind extends SpellStatement<"values|specifier", ValueKindData> {
  @proto static priority = Priority.declaration
  @proto static alias = "statement"
  @proto static declares: P.DeclaresSpec = { kind: "type", name: "values" }

  /** Only in a type's outline body, and only for a list of values -- see class docs. */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match || !match.groups.specifier.is(TypeSpecifierEnum)) return undefined
    const owner = P.SubjectScope.of(scope)?.subjectType
    if (!owner) return undefined
    match.data.owner = owner.name
    match.data.kind = typeCase(singularize(`${match.groups.values.value}`))
    return match
  }

  /** SIDE EFFECT:  declares the kind and its list -- see class docs. */
  mutateScope(match: P.MatchFor<this>) {
    const { scope } = match
    const { owner, kind } = match.data
    const ownerType = scope.types?.get(owner!)
    const enumeration = match.groups.specifier.AST
    if (!ownerType || !(enumeration instanceof P.ASTEnumeration)) return
    const { values } = enumeration
    const listName = ValueKind.listName(match)
    const varProps: P.ScopeVariableProps & { enumeration: Array<string | number> } = {
      name: listName,
      enumeration: values,
      initializer: `[${values.join(", ")}]`,
      declaredBy: match
    }
    ownerType.classVariables.add({ ...varProps })
    ownerType.variables.add({ ...varProps })
    values.forEach((value) => {
      if (typeof value === "string") scope.constants?.add({ name: value, declaredBy: match })
    })
    const valueKind = { values, listOn: ownerType.name, listName }
    const existing = scope.types?.get(kind!)
    if (existing?.stub || (existing && P.TypeScope.sameStatement(existing.declaredBy, match))) {
      existing.claim(match, undefined, { valueKind })
    } else if (!existing) {
      scope.types?.add({ name: kind!, valueKind, declaredBy: match })
    }
  }

  getAST(match: P.MatchFor<this>): P.ASTStatementGroup {
    const { owner, kind } = match.data
    const value = match.groups.specifier.AST as P.ASTEnumeration
    return new P.ASTStatementGroup(match, {
      statements: [
        new P.ASTStaticDefinition(match, { type: owner!, name: ValueKind.listName(match), value }),
        new P.ASTClassDeclaration(match, { type: new P.ASTTypeExpression(match, { name: kind! }) })
      ]
    })
  }

  /** Name of the class variable holding the list, e.g. `Suits` for `"suits"`. */
  private static listName(match: P.Match): string {
    return pluralize(upperFirst(`${(match.groups as { values: P.Match }).values.value}`))
  }
}
// quoted only:  unquoted, `{values:member_words}` matches any words at a line's start, e.g. completion offered
// `as one of ...` after `set y`
classes.addRule(ValueKind, {
  syntax: "{values:quoted_member} {specifier:type_specifier}"
})

/** What `value_kind` stashes on its match, found while parsing. */
type ValueKindData = {
  /** Type whose body declares it, which keeps its list, e.g. `Deck`. */
  owner?: string
  /** The kind's name, e.g. `Suit`. */
  kind?: string
}
