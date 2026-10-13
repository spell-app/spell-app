import { proto } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
import { Priority } from "$/spell/rules/rules.types"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { classes } from "./classes.parser"
import { isDrawableType } from "./classes.shared"

/**
 * `saved_inline` rule:  `a dated-event is saved inline` -- a dated event is saved INSIDE what holds it,
 * not in a file of its own (epic `people-and-orgs`, Q9 and J1).
 * - Every other thing is saved in its own file, and what holds it saves a reference to it:
 *   `{ "$ref": "matt@spell" }`.
 * - Say it of small things that only make sense inside their owner, e.g. a person's birthday.
 * - Refused for:
 *   - a drawable thing, e.g. a card:  drawable things are never saved inline, so a card in two piles stays one card
 *   - a built-in type, e.g. `a thing is saved inline`:  every project shares it
 * - Compiles to `DatedEvent.savedInline = true`, after the class:  the runtime `Thing` says `false`.
 */
export class SavedInline extends SpellStatement<"type"> {
  @proto static priority = Priority.declaration
  @proto static alias = "statement"

  /** Refused for a drawable or built-in type -- see class docs. */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const { type } = match.groups
    const { scopeType } = type.data as { scopeType?: unknown }
    const typeName = SP.typeName(`${type.value}`)
    if (!(scopeType instanceof P.TypeScope)) return match
    if (SP.isBuiltInTypeScope(scopeType)) {
      return SpellStatement.refuse(match, `Can't save ${typeName} inline:  it's built in, and every project shares it`)
    }
    if (isDrawableType(scopeType)) {
      return SpellStatement.refuse(
        match,
        `Can't save a ${type.raw} inline:  a drawable thing is always saved on its own`
      )
    }
    return match
  }

  getAST(match: P.MatchFor<this>): P.ASTPatchedMember {
    const savedInline = new P.ASTStaticDefinition(match, {
      type: P.matchAST<P.ASTTypeExpression>(match.groups.type),
      name: "savedInline",
      value: new P.ASTBooleanLiteral(match, true)
    })
    return new P.ASTPatchedMember(match, { member: savedInline })
  }
}
classes.addRule(SavedInline, {
  syntax: "(a|an) {type:known_type} is saved inline",
  tests: [
    {
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        scope.parse(["a dated-event is a thing", "a card is a drawable thing"].join("\n"), "block")
      },
      tests: [
        ["a dated-event is saved inline", "DatedEvent.savedInline = true"],
        {
          title: "drawable things are never saved inline",
          input: "a card is saved inline",
          js: `/* PARSE ERROR: Can't save a card inline:  a drawable thing is always saved on its own */`
        },
        {
          title: "nor a built-in type:  every project shares it",
          input: "a thing is saved inline",
          js: `/* PARSE ERROR: Can't save thing inline:  it's built in, and every project shares it */`
        }
      ]
    }
  ]
})
// in an outline body:  `- it is saved inline` -- tests in `parserTests/outline.test.ts`
classes.addRule(SavedInline, { syntax: "{type:subject_it} is saved inline" })
