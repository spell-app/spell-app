/**
 * Export all public `parser` code as a barrel.
 *
 * Prefer importing as `import { P } from "~/parser" when possible.
 */
export * as P from "."

export * from "./constants"
export * from "./types"
export * from "./tokenizer"
export * from "./Match"
export * from "./rules"
export * from "./Parser"
export * from "./scope"
export * as AST from "./ast/AST"

// Export `rulex` languge which is used by Parser to define rules easily.
// Exporting it here makes circular import problems work out.
export * from "~/languages/rulex"
