/**
 * Shared by the `variables` rule files:  what an identifier stashes on its match,
 * and the syntax `variable` and `known_variable` share.
 */
import { NONE } from "$/util"
import { P } from "$/parser"

/** Syntax shared by `variable` and `known_variable`:  identifier with optional `the`, e.g. `the thing`. */
export const VARIABLE_SYNTAX = "the? {identifier}"

/** What every `SpellIdentifier` stashes on its match. */
export type IdentifierMatchData = {
  /** Scope variable for the word, or `NONE` if we looked and scope doesn't know it. */
  scopeVar?: P.ScopeVariable | typeof NONE
}
