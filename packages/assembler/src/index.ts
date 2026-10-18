/**
 * `$/assembler` barrel:  ASSEMBLING pages -- the steps between a page's content and the file on disk.  One
 * namespace, `AS`.
 * - Today:  a page's link targets (`Linker`) and in-memory formatting (`formatHTML()`), which spell-epic's docs tools
 *   and `epic` tool use when they write a page;  and the bundles the page server builds on demand (`Bundle`).
 * - Node only (`node:fs`, `git`, oxfmt):  imports no other package, so any node-side package or tool may import it.
 * - NOT here, imported by path:
 *   - `$/assembler/json5` (JSON5 written with its comments kept):  json5-writer is heavy
 *   - `$/assembler/DataFile` (the tooling's JSON5 data files, on it)
 */
export * from "./assembler.types"

export * from "./Bundle"
export * from "./format"
export * from "./Linker"

export * as AS from "."
