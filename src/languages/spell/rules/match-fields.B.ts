// Module augmentation for ad-hoc `Match` fields set/read by chunk B's rule files
// (core, types, variables, constants, assignment, statements, if).
// See the shared conversion brief for why these live outside `src/parser/Match.ts`.
import { P } from "~/parser"

declare module "~/parser/Match" {
  interface Match<Groups extends Record<string, unknown> = P.MatchGroups> {
    /** (`type` rules) Known `TypeScope` for this type name, if any -- picked up from `scope.types`. */
    type?: P.TypeScope
    /** (`variable`/`known_variable`) Scope `ScopeVariable` for this identifier, if any. `null` means "known absent". */
    variable?: P.ScopeVariable | null
    /** (`constant`/`known_constant`) Known `ScopeConstant` for this identifier, if any. */
    constant?: P.ScopeConstant
    /** (`assignment`/`get`) Whether the assigned-to variable is newly declared by this statement. */
    isNewVariable?: boolean
    /** (`assignment`) Original scope `ScopeVariable` for `thing`, before any alias redefinition hackery. */
    originalVar?: P.ScopeVariable
    /** (`get`) Original local `it` `ScopeVariable`, if one already existed, before any alias redefinition hackery. */
    itVar?: P.ScopeVariable
  }
}
