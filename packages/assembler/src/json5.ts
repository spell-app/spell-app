/**
 * `$/assembler/json5`:  moved to util, `$/util/node/json5` (epic `repo-split` P1).
 * - Kept as this re-export only for spell-epic, which reads spell-app's MAIN checkout through its link:
 *   it imports `$/assembler/json5` until it switches, once this is on `main`.
 * - REFACTOR:  delete this file when spell-epic imports `$/util/node/json5`.
 */
export * from "$/util/node/json5"
