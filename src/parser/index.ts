/**
 * Export all public `parser` code as a barrel.
 *
 * Prefer importing like so when possible.
 * - `import type { P } from "~/parser"`  (safer)
 * - `import { P } from "~/parser"` (if you need class or functions from `P`)
 */
export * as P from "."

export * from "./parser.types"
export * from "./tokenizer"
export * from "./Match"
export * from "./rules"
export * from "./Parser"
export * from "./scope"
export * from "./ast"
