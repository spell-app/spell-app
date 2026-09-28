/**
 * Barrel for the spell language server:  editor features (errors, outline, folding...)
 * over the Language Server Protocol, hosted on `SP.SpellProject` / `SP.SpellFile` loading from disk.
 * - `SpellWorkspace` maps editor documents to spell files and keeps their parses current.
 * - `SpellLanguageService` answers questions about a parsed file, in LSP shapes.
 * - `SpellLanguageServer` wires both to an LSP connection.
 * - NOTE: `server.ts` (the process entry, `yarn start:lsp`) and `stdioGuard.ts` are deliberately left out --
 *   both have side effects the moment they're imported.
 */
export * as LSP from "."
export * from "./lsp.types"

export * from "./SpellWorkspace"
export * from "./SpellLanguageService"
export * from "./SpellLanguageServer"
