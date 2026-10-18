import { P } from "$/parser"
import { SP } from "$/spell"
import { SpellType, getKnownType } from "$/spell/rules/types"
import { SpellExpression } from "$/spell/rules/expressions"
import { classes } from "./classes.parser"
import { NewThing } from "./NewThing"
import { ThingName } from "./ThingName"

/**
 * `named_thing` rule:  one thing, by its type and its name (epic `drawable-thing` P19, Owen's J23).
 * - `tableau T1` is the tableau named T1.
 * - e.g. `the count of tableau T1`, `move the card to tableau T1`, `foundation "clubs"`
 * - A sub-type's thing too:  `pile T1` finds the tableau named T1, since a tableau is a pile.
 * - The name:  a word starting with a capital letter (`thing_name`), or any text in quotes.
 * - Compiles to core's `core.thingNamed(Tableau, "T1")`:  the reference `Tableau#T1`.
 *   Nothing (`undefined`) when the program has no such thing (yet).
 * - Warns, carefully, when the project gives two things that name in so many words:
 *   e.g. `set a to a new tableau with name = "T1"` twice.
 *   - Then it finds the first one made.
 *   - The names it counts:  see `NewThing.namesGiven()`.
 *   - A name worked out as the program runs (`"T" + the number`) is never counted.
 */
export class NamedThing extends SpellExpression<"type|name"> {
  /**
   * Could we match at `start`?  Only with a name within a type's few words of it:  `tableau T1`, `bank account "x"`.
   * - Why:  `{type}` is a subrule, so the plain quick test would look for a name ANYWHERE later on the line,
   *   and every line with text in quotes on it would parse a type first.
   * - Out of tokens while a line is being typed:  can't tell.
   */
  test(scope: P.Scope, tokens: P.Token[], start = 0): boolean | undefined {
    if (start >= tokens.length) return false
    const last = start + SpellType.MAX_NAME_WORDS
    for (let index = start + 1; index <= last && index < tokens.length; index++) {
      const token = tokens[index]!
      if (token instanceof P.TextToken || token.matchesPattern(ThingName.prototype.pattern)) return true
    }
    return last >= tokens.length && P.Expectations.current ? undefined : false
  }

  /** Note the warning while we can look the type up -- see class docs. */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const type = getKnownType(match.groups.type)
    const name = NamedThing.nameOf(match.groups.name)
    const typeWords = SP.typeName(type.name).toLowerCase()
    SP.SpellWarnings.noteIf(
      match,
      `More than one ${typeWords} is named "${name}":  this finds the first one made`,
      () => NewThing.namesGiven(type, name) > 1
    )
    return match
  }

  /** The type we find a thing of, e.g. `Tableau`. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return SP.typeName(`${match.groups.type.value}`)
  }

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { type, name } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "thingNamed",
      args: [P.matchAST<P.ASTTypeExpression>(type), P.matchAST(name)]
    })
  }

  /** The name `match` writes, as text:  `T1` for `T1` or `"T1"`. */
  static nameOf(match: P.Match): string {
    const ast = P.matchAST(match)
    return ast instanceof P.ASTStringLiteral ? ast.value : `${match.value}`
  }
}
classes.addRule(NamedThing, {
  syntax: "{type:known_type} {name:thing_name}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.compile(["a pile is a list of things", "a tableau is a pile"].join("\n"), "block")
      },
      tests: [
        ["tableau T1", 'core.thingNamed(Tableau, "T1")'],
        ["pile T1", 'core.thingNamed(Pile, "T1")'],
        { title: "a name in lowercase is quoted", input: "tableau stock", js: undefined }
      ]
    }
  ]
})
// a name in quotes:  any text, e.g. a lowercase one
classes.addRule(NamedThing, {
  syntax: "{type:known_type} {name:text}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.compile(["a pile is a list of things", "a foundation is a pile"].join("\n"), "block")
      },
      tests: [['foundation "clubs"', 'core.thingNamed(Foundation, "clubs")']]
    }
  ]
})
