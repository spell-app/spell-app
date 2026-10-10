import { proto, snakeCase } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
import { Priority } from "$/spell/rules/rules.types"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { classes } from "./classes.parser"
import { type MethodBody } from "./classes.shared"

/**
 * `draw_side` rule:  `to "draw its front":` then markup, in a type's outline body -- one SIDE of a thing, as markup
 * (plan doc `outline-spell`, P3;  Q14):
 *
 * ```spell
 * - to "draw its front":
 * 	<ui-image source="images/[rank]-of-[suit].png" />
 * - to "draw its back":
 * 	<ui-image source="images/card-back.png" />
 * ```
 * - Compiles to a getter, the side's name:  `get front() { return <markup> }` -- `its front` reads it.
 * - Once a type has BOTH `front` and `back`, the second also gives it `draw()`, picking one by its direction:
 *   `return this.direction === 'down' ? this.back : this.front` -- what `draw the card` calls.
 *   So `its direction` should be `up or down`;  no direction draws the front.
 * - The body is one line of markup, inline or indented:  it IS the side, no `return` needed.
 */
export class DrawSide extends SpellStatement<"alias|body?", { side?: string; drawsBoth?: boolean }> {
  @proto static priority = Priority.declaration
  @proto static alias = "statement"
  @proto static declares: P.DeclaresSpec = { kind: "property", name: "alias" }

  /** `to "draw its front":` => `the front of a card is:` -- see `SpellStatement.getLongForm()`. */
  getLongForm(match: P.MatchFor<this>): string | undefined {
    const type = P.SubjectScope.of(match.scope)?.subjectType
    const side = match.data.side
    return type && side ? `the ${side.replace(/_/g, " ")} of a ${type.instanceName} is:` : undefined
  }

  /** Only `"draw its <side>"`, in a type's outline body. */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match || !P.SubjectScope.of(scope)?.subjectType) return undefined
    const side = DRAW_SIDE.exec(`${match.groups.alias.value}`.replace(/^["']|["']$/g, ""))?.[1]
    if (!side) return undefined
    match.data.side = snakeCase(side)
    return match
  }

  /** SIDE EFFECT:  declares the side on the type;  notes whether it now has both -- see class docs. */
  mutateScope(match: P.MatchFor<this>) {
    const type = P.SubjectScope.of(match.scope)!.subjectType!
    const side = match.data.side!
    const other = side === "front" ? "back" : side === "back" ? "front" : undefined
    if (other && type.variables.get(other, "LOCAL_ONLY")) match.data.drawsBoth = true
    type.declareProperty(side, match)
  }

  /** The body's scope:  `it` / `its` are the thing, as in a getter. */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    const type = P.SubjectScope.of(match.scope)!.subjectType!
    return new P.MethodScope({
      parentScope: match.scope,
      thisVar: type.instanceName,
      mapItTo: "this",
      itDatatype: SP.typeName(type.name),
      declaredBy: match
    })
  }

  getAST(match: P.MatchFor<this>): P.ASTStatementGroup {
    const typeName = P.SubjectScope.of(match.scope)!.subject
    const side = match.data.side!
    const statements: P.ASTClassMember[] = [
      new P.ASTPropertyDefinition(match, {
        type: typeName,
        property: side,
        get: new P.ASTMethodDefinition(match, { body: P.matchAST<MethodBody>(this.getBody(match)) })
      })
    ]
    if (match.data.drawsBoth) {
      const facing = (name: string) =>
        new P.ASTPropertyExpression(match, { object: new P.ASTSelfLiteral(match), property: name })
      const isDown = new P.ASTInfixExpression(match, {
        lhs: facing("direction"),
        operator: "exactly equals",
        rhs: new P.ASTConstantExpression(match, { name: "down", output: "'down'" })
      })
      statements.push(
        new P.ASTPropertyDefinition(match, {
          type: typeName,
          property: "draw",
          method: new P.ASTMethodDefinition(match, {
            body: new P.ASTTernaryExpression(match, {
              condition: isDown,
              trueValue: facing("back"),
              falseValue: facing("front")
            })
          })
        })
      )
    }
    return new P.ASTStatementGroup(match, { statements })
  }
}
classes.addRule(DrawSide, {
  syntax: "to {alias:text} :? ({inline_expression}|{nested_expression})?"
})

/** What `draw_side` takes in its quotes:  `draw its front`, the side's name captured. */
const DRAW_SIDE = /^draw its ([a-z][\w-]*(?: [a-z][\w-]*)*)$/i
