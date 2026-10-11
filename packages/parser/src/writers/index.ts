/**
 * Barrel for `writers/` -- what turns a spell tree (`P.ASTNode`s) into a target's code, or another view of it.
 * - `Writer` is the base:  one method per kind of node.
 *   - `ProgramWriter`:  what every writer of a program shares, whatever its language
 *   - `JSWriter` writes javascript;  `TSWriter`, on it, TypeScript
 *   - `PyWriter` writes Python;  `PyAsyncWriter`, on it, Python on `asyncio`
 *   - `TreeWriter`:  boxes for a diagram
 * - `jsText` and `pyText` stay namespaces (`P.jsText.InParens`, `P.pyText.block()`):
 *   their generic names (`Block`, `SPACE`, `INDENT` ...) would collide flattened.
 */

export * from "./writers.types"
export * from "./Writer"
export * from "./ProgramWriter"
export * from "./JSWriter"
export * from "./PyWriter"
export * from "./PyAsyncWriter"
export * from "./ElementsWriter"
export * from "./WriterProject"
export * from "./Naming"
export * from "./TSWriter"
export * from "./TreeWriter"
export * as jsText from "./jsText"
export * as pyText from "./pyText"
