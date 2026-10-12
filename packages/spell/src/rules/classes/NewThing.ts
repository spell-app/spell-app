import { proto } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { classes } from "./classes.parser"

/**
 * `new_thing` rule:  `a new object` -- constructs `type` (optionally `with`/`where`/`whose` `props`).
 * - NOTE: we assume that all types take an object of properties????
 * - Compiles to `new Type(...)`, e.g. `a new Thing with a = 1, b = yes` => `new Thing({ a: 1, b: true })`.
 */
export class NewThing extends SpellStatement<"type|props?"> {
  @proto static alias = "expression"

  /** The type it makes, e.g. `Card`, `thing`. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return SP.typeName(`${match.groups.type.value}`)
  }

  getAST(match: P.MatchFor<this>): P.ASTNewInstanceExpression {
    const { type, props } = match.groups
    return new P.ASTNewInstanceExpression(match, {
      type: P.matchAST<P.ASTTypeExpression>(type),
      props: P.matchAST<P.ASTObjectLiteral>(props)
    })
  }

  ////////////////
  // ## Names given in so many words
  //  So `tableau T1` can warn when two things are named T1 (epic `drawable-thing` P19):  see `named_thing`.
  ////////////////

  /**
   * The name `match` gives the thing it makes, in so many words:  `"T1"` for `a new tableau with name = "T1"`.
   * - `undefined` if `match` isn't a new thing, gives no name, or works its name out as the program runs,
   *   e.g. `a new tableau with name = ("T" + the number)`.
   */
  static nameGivenBy(match: P.Match | undefined): string | undefined {
    if (!match?.is(NewThing)) return undefined
    const { props } = match.groups
    for (const property of props?.items ?? []) {
      const { property: key, value } = property.groups as { property?: P.Match; value?: P.Match }
      if (`${key?.value}` !== "name" || !value) continue
      const ast = P.matchAST(value)
      return ast instanceof P.ASTStringLiteral ? ast.value : undefined
    }
    return undefined
  }

  /**
   * Remember that `statement` names the thing it makes, when its `value` is a new thing given a name in so many words,
   * e.g. `set t1 to a new tableau with name = "T1"`, `get a new foundation with name = "clubs"`.
   * - Called from those statements' `mutateScope()`:  `assignment` and `get`.
   *   - A new thing made anywhere else, e.g. added straight to a list, isn't counted:  the warning stays careful.
   * - Kept for its type, and each super-type the project declares:  so `pile T1` counts a tableau named T1.
   * - Journaled, as any scope change:  incremental parsing takes it back.
   * - An earlier parse of the same statement is replaced, not counted twice (`P.TypeScope.sameStatement()`).
   */
  static noteNameGiven(value: P.Match, statement: P.Match): void {
    const name = NewThing.nameGivenBy(value)
    const { scopeType } = (value.groups.type as P.Match | undefined)?.data ?? {}
    if (name === undefined || !(scopeType instanceof P.TypeScope)) return
    for (const type of scopeType.chain()) {
      // the project's own types only:  a built-in type's record is shared by every project
      if (!type.declaredBy) continue
      const previous = NAMES_GIVEN.get(type)
      const kept = (previous ?? []).filter((given) => !P.TypeScope.sameStatement(given.statement, statement))
      const next = [...kept, { name, statement }]
      NAMES_GIVEN.set(type, next)
      statement.scope.parser?.journal?.record({
        undo: () => (previous ? NAMES_GIVEN.set(type, previous) : NAMES_GIVEN.delete(type)),
        redo: () => NAMES_GIVEN.set(type, next)
      })
    }
  }

  /** How many statements the project has naming a thing of `type`, or a sub-type, `name` -- see `noteNameGiven()`. */
  static namesGiven(type: P.TypeScope, name: string): number {
    return (NAMES_GIVEN.get(type) ?? []).filter((given) => given.name === name).length
  }
}
classes.addRule(NewThing, {
  syntax: "a new {type:known_type} ((with|where|whose) {props:object_literal_properties})?",
  tests: [
    {
      title: "creates normal types",
      compileAs: "expression",
      tests: [
        [`a new thing`, `new Thing()`],
        [`a new Thing with a = 1, b = yes`, `new Thing({ a: 1, b: true })`]
      ]
    },
    {
      title: "creates base types",
      compileAs: "expression",
      tests: [
        ["a new Object", "new Object()"],
        ["a new object with a = 1, b = yes", "new Object({ a: 1, b: true })"]
      ]
    }
  ]
})

/** The names each type's things are given in so many words, and the statements giving them -- see `noteNameGiven()`. */
const NAMES_GIVEN = new WeakMap<P.TypeScope, Array<{ name: string; statement: P.Match }>>()
