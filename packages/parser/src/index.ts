/**
 * Export all public `parser` code as a barrel.
 *
 * Prefer importing like so when possible.
 * - `import type { P } from "$/parser"`  (safer)
 * - `import { P } from "$/parser"` (if you need class or functions from `P`)
 *
 * NOTE: `RulexParser` itself is NOT included here -- only its `type` is, via `parser.types`.  It's an
 * optional sub-system: opt in with `import "$/parser/rulex"` to register `Parser.rulexParser`.
 */
export * as P from "./"

export * from "./parser.types"
export * from "./tokenizer"
export * from "./Match"
export * from "./Expectations"
export * from "./rules"
export * from "./Parser"
export * from "./ParseJournal"
export * from "./IncrementalParse"
export * from "./IncrementalProject"
export * from "./scope"
export * from "./ast"
export * from "./writers"
