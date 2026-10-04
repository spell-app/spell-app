/**
 * Barrel for parser `scope` classes.
 * - `Scope` is the base class -- rest are its subclasses, plus `ScopeVariable` / `ScopeConstant` / `ScopeMethod`
 *   records that a scope holds.
 */

export * from "./ScopeList"
export * from "./Scope"
export * from "./BlockScope"
export * from "./RootScope"
export * from "./ProjectScope"
export * from "./ImportScope"
export * from "./FileScope"
export * from "./TypeScope"
export * from "./MethodScope"
export * from "./ScopeVariable"
export * from "./ScopeConstant"
export * from "./ScopeMethod"
