/**
 * Moves each class member into its class's body, so compiled spell reads like hand-written JS:
 * `export class Card extends Thing { get color() {...} ... }` rather than a bare class patched from below.
 * - Spell lets you declare a member anywhere after -- or before -- its class, even in another file of the
 *   project, e.g. `Card.move_to_$pile` in `Pile.spell`.
 * - A member whose class ISN'T among the statements given stays where it is, patched onto its class:
 *   `Card.prototype.play = function () {...}` -- e.g. a class from another project.  See `P.ASTClassMember`.
 */
import { P } from "~/parser"

/**
 * `files`' statements, with every member of a class declared in them moved into that class's body.
 * - Called on each block's statements (`SP.Block.getAST()`), then across a project's files
 *   (`SP.SpellProject.combineCompiled()`) -- a class from one file gets members from the others.
 * - A MEMBER is a statement whose code is all `P.ASTClassMember`s of ONE class, e.g. `Block.getAST()`'s group
 *   for a declaring line:  its docstring, its `SPELL: DECLARES` comment, then its code.
 *   - They go in in the order given:  file order, then source order, a blank line between each.
 *   - Comments directly above it go with it, e.g. a `## properties of cards` banner.
 * - A class declared twice gets them in its first declaration.
 * - NEVER mutates what it's given:  ASTs are memoized per match, and shared with the editor.
 *   A class which gets members is a NEW `P.ASTClassDeclaration`, and so is each group holding it.
 * - Calling it again on its own output is fine:  a class which already has members just gets more.
 */
export function hoistClassMembers(files: HoistableStatement[][]): HoistableStatement[][] {
  const classNames = new Set<string>()
  for (const statements of files) {
    for (const statement of statements) forEachClass(statement, (declaration) => classNames.add(declaration.type.name))
  }
  if (!classNames.size) return files

  const members = new Map<string, ClassBodyItem[]>()
  const remaining = files.map((statements) => {
    const kept: HoistableStatement[] = []
    // comments and blank lines since the last statement -- the comments go with a member below them
    let pending: HoistableStatement[] = []
    let removed = false
    for (const statement of statements) {
      if (statement instanceof P.ASTComment || statement instanceof P.ASTBlankLine) {
        pending.push(statement)
        continue
      }
      const typeName = memberOf(statement)
      if (typeName && classNames.has(typeName)) {
        const firstComment = pending.findIndex((item) => item instanceof P.ASTComment)
        const carried = firstComment < 0 ? [] : pending.slice(firstComment)
        kept.push(...(firstComment < 0 ? pending : pending.slice(0, firstComment)))
        addMember(members, typeName, [...carried, statement])
        removed = true
      } else {
        kept.push(...pending, statement)
      }
      pending = []
    }
    kept.push(...pending)
    return removed ? tidyBlankLines(kept) : kept
  })
  if (!members.size) return files
  return remaining.map((statements) => statements.map((statement) => withMembers(statement, members)))
}

/** What a block holds, e.g. `P.ASTStatementGroup.statements`. */
export type HoistableStatement = NonNullable<P.ASTStatementGroupProps["statements"]>[number]

/** What goes in a class's body -- see `P.ASTClassDeclaration.members`. */
type ClassBodyItem = NonNullable<P.ASTClassDeclarationProps["members"]>[number]

/** Call `callback` for each class declared in `statement`, looking inside groups -- NOT nested blocks. */
function forEachClass(statement: HoistableStatement, callback: (declaration: P.ASTClassDeclaration) => void) {
  if (statement instanceof P.ASTClassDeclaration) callback(statement)
  else if (statement instanceof P.ASTStatementGroup) statement.statements?.forEach((it) => forEachClass(it, callback))
}

/**
 * `statement`'s comments, blank lines and class members, in order, looking inside groups.
 * - `undefined` if it holds anything else, e.g. a class declaration or an assignment.
 */
function classBodyItems(statement: HoistableStatement): ClassBodyItem[] | undefined {
  if (statement instanceof P.ASTClassMember || statement instanceof P.ASTComment) return [statement]
  if (statement instanceof P.ASTBlankLine) return [statement]
  if (!(statement instanceof P.ASTStatementGroup)) return undefined
  const items: ClassBodyItem[] = []
  for (const it of statement.statements ?? []) {
    const itsItems = classBodyItems(it)
    if (!itsItems) return undefined
    items.push(...itsItems)
  }
  return items
}

/** Name of the ONE class `statement` declares members of, if it's nothing but those -- see `classBodyItems()`. */
function memberOf(statement: HoistableStatement): string | undefined {
  const members = classBodyItems(statement)?.filter((item) => item instanceof P.ASTClassMember)
  const typeName = members?.[0]?.typeName
  if (!typeName || !members!.every((member) => member.typeName === typeName)) return undefined
  return typeName
}

/**
 * SIDE EFFECT:  adds `statements` -- a member and the comments above it -- to `members` for class `typeName`,
 * after a blank line if it has some already.
 */
function addMember(members: Map<string, ClassBodyItem[]>, typeName: string, statements: HoistableStatement[]) {
  const items = statements.flatMap((statement) => classBodyItems(statement) ?? [])
  const existing = members.get(typeName)
  if (!existing) members.set(typeName, items)
  else existing.push(new P.ASTBlankLine(statements[0]!.match), ...items)
}

/**
 * `statement` with `members` in its class's body -- itself if it declares no class which has any.
 * - SIDE EFFECT:  takes a class's members out of `members`, so a second declaration of it gets none.
 */
function withMembers(statement: HoistableStatement, members: Map<string, ClassBodyItem[]>): HoistableStatement {
  if (statement instanceof P.ASTClassDeclaration) {
    const added = members.get(statement.type.name)
    if (!added) return statement
    members.delete(statement.type.name)
    const separator = statement.members?.length ? [new P.ASTBlankLine(statement.match)] : []
    return statement.withMembers([...separator, ...added])
  }
  if (!(statement instanceof P.ASTStatementGroup) || !statement.statements) return statement
  const statements = statement.statements.map((it) => withMembers(it, members))
  if (statements.every((it, index) => it === statement.statements![index])) return statement
  return new P.ASTStatementGroup(statement.match, { statements })
}

/** `statements` without blank lines at either end, or two in a row -- what's left where members were taken out. */
function tidyBlankLines(statements: HoistableStatement[]): HoistableStatement[] {
  const tidy = statements.filter(
    (statement, index) => !(statement instanceof P.ASTBlankLine && statements[index - 1] instanceof P.ASTBlankLine)
  )
  while (tidy[0] instanceof P.ASTBlankLine) tidy.shift()
  while (tidy.at(-1) instanceof P.ASTBlankLine) tidy.pop()
  return tidy
}
