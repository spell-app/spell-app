/**
 * Barrel for the spell language server:  editor features (errors, outline, folding...)
 * in Language Server Protocol shapes, hosted on `SP.SpellProject` / `SP.SpellFile`.
 * - `FileAddresses` (type) is how an editor addresses spell files:  by URI.
 * - `SpellLanguageService` answers questions about a parsed file, in LSP shapes.
 * - `SpellCSS`:  the `<css>` blocks in a file, edited as CSS.
 * - `SpellKeywords`:  a language pack's keywords, for accent fixes and colouring.
 * - `SpellLanguageServer` wires both to an LSP connection.
 * - Browser-safe:  NO node imports, so the app's editor uses the service in-process.
 * - NOTE: deliberately left out, as node-only or with side effects the moment they're imported:
 *   - `SpellDiskWorkspace`:  the stdio server's workspace, loading from disk
 *   - `server.ts`:  the process entry, `yarn lsp:start`
 *   - `stdioGuard.ts`
 */
export * as LSP from "./"
export * from "./lsp.types"

export * from "./SpellKeywords"
export * from "./SpellLanguageService"
export * from "./SpellCSS"
export * from "./ScopeExplorer"
export * from "./SpellLanguageServer"
