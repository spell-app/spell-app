/**
 * Types and helpers several of the `classes` module's rule files share:
 * - the `ScopeVariable` fields an enumerated property sets
 * - `MethodBody`:  a getter's or method's body
 * - `placeholderData()` and `QuotedPropertyFormulaBits`:  what `quoted_property_formula` and the
 *   `QuotedPropertyRule` it makes both work with
 */
import { pluralize, singularize } from "$/util"
import { P } from "$/parser"

/**
 * Ad-hoc fields this module sets/reads on `ScopeVariable` (src/parser/scope/ScopeVariable.ts), for a property
 * defined `as one of a, b, c` (see `define_property_has`).  Not covered by `P.ScopeVariableProps`, and
 * only used in this module, so augmented locally.
 */
declare module "$/parser/scope/ScopeVariable" {
  // NOTE: MUST stay an `interface` -- module augmentation merges into the declared `ScopeVariable`,
  // and `type` cannot merge.  Documented exception to the "always use `type`" rule.
  interface ScopeVariable {
    /** Raw enumerated values (as parsed), e.g. `["'clubs'", "'diamonds'", ...]` or `[1, 2, 3]`. */
    enumeration?: Array<string | number>
    /** Pre-resolved output values for `enumeration`, if ever set elsewhere (nothing currently writes this). */
    enumerationValues?: Array<string | number>
  }
}

/** What `P.ASTMethodDefinition`'s `body` prop accepts. */
export type MethodBody = P.ASTStatementBlock | P.ASTStatement | P.ASTExpression

/**
 * `ruleData` entry for placeholder `(instanceVar)` over enumerated `values`, e.g. `(suit)` over `["'clubs'", ...]`.
 * - `enumeration` is `values` unquoted, inflected to match the placeholder, e.g. `club` for `(suit)`
 *   but `clubs` for `(suits)`.
 */
export function placeholderData(
  instanceVar: string,
  values: Array<string | number>,
  kind?: string
): QuotedPropertyFormulaBits["ruleData"][number] {
  const isSingular = singularize(instanceVar) === instanceVar
  const inflector = isSingular ? singularize : pluralize
  const enumeration = values.map((value) =>
    typeof value === "string" ? inflector(value.replace(/^'(.*)'$/, "$1")) : value
  )
  return kind
    ? { isSingular, instanceVar, enumeration, values, kind }
    : { isSingular, instanceVar, enumeration, values }
}

/**
 * Extra `bits` `quoted_property_formula` derives (and caches in `match.data.bits` via `getBits()`) to hand
 * off from there to `mutateScope()`/`getAST()`.
 */
export type QuotedPropertyFormulaBits = {
  /** Owning type name, e.g. `"card"`. */
  type: string
  /** Rulex syntax generated for the dynamically-added `expression_suffix` rule (see `mutateScope()`). */
  syntax: string
  /** One entry per `(var)` placeholder found in the quoted alias, in source order. */
  ruleData: Array<{
    /** `true` if the placeholder's inflection matched its singular form, e.g. `(rank)` not `(ranks)`. */
    isSingular: boolean
    /** Raw placeholder text as written, e.g. `"ranks"`. */
    instanceVar: string
    /** Enumeration values inflected to match `isSingular`, used to match the spoken word at parse time. */
    enumeration: Array<string | number>
    /** Enumeration values as they should appear in compiled output, e.g. quoted strings. */
    values: Array<string | number>
    /** A value kind whose values aren't known yet, e.g. `Suit`:  `values` is `[]` -- see `QuotedPropertyRule`. */
    kind?: string
  }>
  /** Singularized variable names, in source order -- used as the generated method's argument names. */
  vars: string[]
  /** Generated method/property name, e.g. `"is_the_$rank_of_$suits"`. */
  property: string
}
