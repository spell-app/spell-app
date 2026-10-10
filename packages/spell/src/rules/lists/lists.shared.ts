/**
 * The `lists` rule module's shared types and helpers:  what several of its rule files use.
 */
import { singularize } from "$/util"
import { P } from "$/parser"

////////////////
// ## Shared types
////////////////

/** What `P.ASTMethodDefinition`'s `body` prop accepts. */
export type MethodBody = P.ASTStatementBlock | P.ASTStatement | P.ASTExpression

/** The two sides `can_take` / `can_give_up` compile, e.g. the tableau and the card. */
export type GuardOperands = { lhs?: P.ASTExpression; rhs?: P.ASTExpression }

////////////////
// ## `where` clause helpers
//    shared by `list_filter`, `list_membership_test` and `list_remove_where`
////////////////

/**
 * Nested scope for `match`'s `where` clause's predicate:  singularized `arg` is the current item,
 * also aliased from `it`, e.g. `word` for `words in my-list where word starts with "a"`.
 * - Both are what `list` holds, if we can tell, e.g. `Card` for `the cards in the deck where ...`
 * - Looked up now, while parsing:  the predicate parses in this scope.
 */
export function getWhereScope(match: P.Match, arg: P.Match, list: P.Match | undefined): P.MethodScope {
  const name = singularize(arg.value)
  const datatype = list && match.scope.getItemType(list.datatype)
  const variable = new P.ScopeVariable({ name, datatype, declaredBy: arg })
  // for `getWhereMethod()`, which can't look it up:  `getAST()` must be pure
  ;(match.data as ItemVariableData).itemVariable = variable
  return new P.MethodScope({
    parentScope: match.scope,
    args: [variable],
    mapItTo: name,
    itDatatype: datatype,
    declaredBy: arg
  })
}

/**
 * Inline method for a `where` clause's predicate `body`, e.g. `(word) => word.startsWith("a")`.
 * - Its argument carries what `getWhereScope()` found it holds, e.g. a `Card`:  a typed target writes it.
 */
export function getWhereMethod(match: P.Match, arg: P.Match, body: P.Match | undefined): P.ASTMethodDefinition {
  const { itemVariable: variable } = match.data as ItemVariableData
  return new P.ASTMethodDefinition(body || match, {
    inline: true,
    args: [new P.ASTVariableExpression(arg, { name: singularize(arg.value), variable })],
    body: P.matchAST(body)
  })
}

/**
 * What a loop or a `where` notes while parsing, in its `match.data`:  the variable its body gets, e.g. `card`, a
 * `Card` -- see `getWhereScope()`, `list_iteration`.
 */
export type ItemVariableData = { itemVariable?: P.ScopeVariable }
