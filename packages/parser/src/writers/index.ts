/**
 * Barrel for `writers/` -- what turns a spell tree (`P.ASTNode`s) into a target's code, or another view of it.
 * - `Writer` is the base:  one method per kind of node.
 *   - `ProgramWriter`:  what every writer of a program shares, whatever its language
 *   - `JSWriter` writes javascript;  `TSWriter`, on it, TypeScript
 *   - Python's writers are `$/py`'s (`PY.PyWriter`, on `ProgramWriter`)
 *   - `TreeWriter`:  boxes for a diagram
 * - `jsText` stays a namespace (`P.jsText.InParens`):
 *   its generic names (`Block`, `SPACE` ...) would collide flattened.
 * - `jsShapes`, the shapes every program writer reads (`P.jsShapes.unwrapped()`):  a namespace too, for `$/py`'s.
 */

export * from "./writers.types"
export * from "./Writer"
export * from "./ProgramWriter"
export * from "./JSWriter"
export * from "./WriterProject"
export * from "./Naming"
export * from "./TSWriter"
export * from "./TreeWriter"
export * as jsText from "./jsText"
export * as jsShapes from "./jsShapes"
