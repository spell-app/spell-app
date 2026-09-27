/**
 * Barrel for parser `scope` classes.
 * - `Scope` is the base class -- rest are its subclasses, plus `ScopeVariable`/`ScopeConstant` records
 *   that a scope holds.
 */

export * from "./ScopeList"
export * from "./Scope"
export * from "./BlockScope"
export * from "./RootScope"
export * from "./ProjectScope"
export * from "./FileScope"
export * from "./TypeScope"
export * from "./MethodScope"
export * from "./ScopeVariable"
export * from "./ScopeConstant"
