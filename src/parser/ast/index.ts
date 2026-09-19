//
//  ## Master import file for parser AST nodes and their output backends.
//
//  NOTE: `renderAST` and `stringifyAST` deliberately export the SAME ~30 names
//  (`SPACE`, `COMMA`, `List`, `InParens`, `Block`, ...) with different return types --
//  React elements vs plain strings.  They MUST stay namespaced rather than flattened:
//  a flat `export *` would silently drop every colliding name with no error.
//

/** Export generic `ASTNode` directly. */
export { ASTNode } from "./AST"
/** Access other AST classes as e.g. `AST.Expression`, `AST.Statement`. */
export * as AST from "./AST"

/** Output backend emitting React elements, for syntax-highlighted display. */
export * as render from "./renderAST"

/** Output backend emitting plain strings, for compiled JS output. */
export * as stringify from "./stringifyAST"
