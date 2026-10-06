/**
 * Barrel for `writers/` -- what turns a spell tree (`P.ASTNode`s) into a target's code.
 * - `Writer` is the base:  one method per kind of node.  `JSWriter` writes javascript.
 * - `jsText` stays a namespace (`P.jsText.InParens`):  its generic names (`Block`, `SPACE` ...) would collide flattened.
 */

export * from "./Writer"
export * from "./JSWriter"
export * as jsText from "./jsText"
