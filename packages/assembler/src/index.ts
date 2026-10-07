/**
 * `$/assembler` barrel:  ASSEMBLING pages -- the steps between a page's content and the file on disk.  One
 * namespace, `AS`.
 * - Today:  a page's link targets (`Linker`) and in-memory formatting (`formatHTML()`), which `docs` and `epics`
 *   both use when they write a page.
 * - Node only (`node:fs`, `git`, oxfmt):  imports no other package, so any node-side package or tool may import it.
 */
export * from "./assembler.types"

export * from "./format"
export * from "./Linker"

export * as AS from "."
