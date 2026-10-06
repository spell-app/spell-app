/**
 * Barrel for `writers/` -- what turns a spell tree (`P.ASTNode`s) into a target's code, or another view of it.
 * - `Writer` is the base:  one method per kind of node.  `JSWriter` writes javascript;  `TreeWriter` boxes for a diagram.
 * - `jsText` stays a namespace (`P.jsText.InParens`):  its generic names (`Block`, `SPACE` ...) would collide flattened.
 */

export * from "./writers.types"
export * from "./Writer"
export * from "./JSWriter"
export * from "./TSWriter"
export * from "./TreeWriter"
export * as jsText from "./jsText"
