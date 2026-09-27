/**
 * Shared types for the spell language server.
 */
import type { DocumentSymbol } from "vscode-languageserver"

// ## Workspace

/** What happened to a file on disk, from the editor's file watcher. */
export type DiskChange = "created" | "changed" | "deleted"

// ## Symbols

/**
 * Document symbol, plus the type it belongs to if it's a property or method,
 * so it can nest under that type's own symbol when the same file declares it.
 */
export type SpellSymbol = {
  /** Symbol as sent to the editor. */
  symbol: DocumentSymbol
  /** Type_Case name of the type a property / method is declared on, e.g. `Card`. */
  typeName?: string
}
