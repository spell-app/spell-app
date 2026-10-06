//
//  ## Master import file for parser AST nodes and their output backend.
//
//  NOTE: `stringifyAST` stays namespaced (`P.stringify.SPACE`, `P.stringify.InParens` ...):  its generic names
//  (`List`, `Block`, `Array` ...) would collide at the top level.
//
//  NOTE: the AST classes themselves ARE flattened -- their `ASTXxx` prefix keeps generic
//  names like `ASTLiteral` / `ASTComment` from colliding at the top level.
//

export * from "./AST"

/** Output backend emitting plain strings, for compiled JS output. */
export * as stringify from "./stringifyAST"
