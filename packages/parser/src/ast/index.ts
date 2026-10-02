//
//  ## Master import file for parser AST nodes and their output backends.
//
//  NOTE: `renderAST` and `stringifyAST` deliberately export the SAME ~30 names
//  (`SPACE`, `COMMA`, `List`, `InParens`, `Block`, ...) with different return types --
//  `Markup` (plain data the app draws as DOM) vs plain strings.  They MUST stay namespaced
//  rather than flattened:  a flat `export *` would silently drop every colliding name with no error.
//
//  NOTE: the AST classes themselves ARE flattened -- their `ASTXxx` prefix keeps generic
//  names like `ASTLiteral` / `ASTComment` from colliding at the top level.
//

export * from "./ast.types"
export * from "./AST"

/** Output backend emitting `Markup`, for syntax-highlighted display. */
export * as render from "./renderAST"

/** Output backend emitting plain strings, for compiled JS output. */
export * as stringify from "./stringifyAST"
