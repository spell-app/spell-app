/**
 * Shared types for the spell language server.
 */
import type { DocumentSymbol } from "vscode-languageserver"

import type { P } from "~/parser"
import type { SP } from "~/languages/spell"

// ## Workspace

/** What happened to a file on disk, from the editor's file watcher. */
export type DiskChange = "created" | "changed" | "deleted"

/** A match, and the spell file it's in. */
export type FileMatch = {
  /** File the match is in. */
  file: SP.SpellFile
  /** Match itself. */
  match: P.Match
}

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

// ## Semantics

/**
 * Thing at the cursor which was declared somewhere -- what hover, go-to-definition, references and rename are about.
 * - `nameMatch` is the match naming it at the cursor:  a reference, or the declaration's own name.
 * - A property is known by `name`, and by its `record` too when we can tell which type it's on.
 */
export type SpellSubject = { nameMatch: P.Match } & (
  | { kind: "variable"; record: P.ScopeVariable }
  | { kind: "type"; record: P.TypeScope }
  | { kind: "constant"; record: P.ScopeConstant }
  | { kind: "method"; record: P.ScopeRule }
  | {
      kind: "property"
      name: string
      /** Type the property was used on, if what's around it says, e.g. the method's type for `its suit`. */
      owner?: P.TypeScope
      /** Property's record on `owner` or one of its super-types, if found -- see `P.TypeScope.declareProperty()`. */
      record?: P.ScopeVariable
    }
)

/** Run of text to colour, by file offsets -- see `SpellLanguageService.highlightSpans()`. */
export type HighlightSpan = {
  /** Offset of the first character. */
  start: number
  /** Offset just past the last character. */
  end: number
  /** How to colour it. */
  kind: P.HighlightKind
  /** Is this where it's declared? */
  declaration?: boolean
  /** Is it built in, rather than declared in a project? */
  defaultLibrary?: boolean
}

// ## Custom requests

/** Answer to `spell/project`:  a project's spell files in parse order, with their error counts. */
export type ProjectInfo = {
  /** Project id, e.g. `@system:examples:Solitaire`. */
  project: string
  /** Active spell files, in the order they parse. */
  files: Array<{ uri: string; file: string; errors: number }>
  /** Why the last full parse crashed, if it did. */
  problem?: string
}
