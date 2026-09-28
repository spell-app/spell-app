/**
 * Shared types for the spell language server.
 */
import type { DocumentSymbol, Location, Position } from "vscode-languageserver"

import type { P } from "~/parser"
import type { SP } from "~/languages/spell"

// ## Workspace

/**
 * How an editor addresses spell files:  by URI, e.g. a `file:` URL on disk, or `spell:///...` in the app.
 * - All `SpellLanguageService` needs beyond the files themselves:  projects, files and parses are `SP`'s.
 */
export type FileAddresses = {
  /** `SpellFile` for document `uri`, or `undefined` if it isn't a spell file we can place in a project. */
  fileFor(uri: string): SP.SpellFile | undefined
  /** Editor's URI for `file`, e.g. a project's compiled javascript. */
  uriFor(file: SP.SpellFile | SP.SpellJSFile): string
}

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

/**
 * `SpellSubject` for a scope record, with no cursor -- see `SpellLanguageService.describeRecord()`.
 * - A property MUST have its `record`:  without one, finding it needs a cursor.
 */
export type ScopeRecord =
  | { kind: "variable"; record: P.ScopeVariable }
  | { kind: "type"; record: P.TypeScope }
  | { kind: "constant"; record: P.ScopeConstant }
  | { kind: "method"; record: P.ScopeRule }
  | { kind: "property"; name: string; owner?: P.TypeScope; record: P.ScopeVariable }

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
  /** URI of its compiled javascript, `<Project>.compiled.js` -- whether or not it's been compiled yet. */
  compiledUri: string
}

/**
 * Answer to `spell/scopes`:  the live scope tree a project parses in, for a scope explorer -- see `ScopeExplorer`.
 * - Plain JSON:  the editor's side can't reach parser objects.
 * - Root, projects and files hold what's declared in them;  a type holds its properties and methods.
 */
export type ScopeNode = {
  /** Unique in its tree, and stable between answers while names are, e.g. `spellRoot/Solitaire/Card.spell/Card`. */
  id: string
  /** Name, e.g. `Card`, `Solitaire`, `Card.spell`, `suit`. */
  name: string
  /** What sort of thing. */
  kind: ScopeNodeKind
  /** One-line summary, e.g. `is a Thing`, `imported`. */
  detail?: string
  /** What it is, as markdown, e.g. `type **Card** is a Thing` -- the first line of its hover. */
  summary?: string
  /** Its docstring, as plain text -- see `SP.Block.getDocComments()`. */
  description?: string
  /** Where to change its docstring, with `spell/setDescription` -- only if it's declared in a spell file. */
  descriptionAt?: { uri: string; position: Position; file?: boolean }
  /** Spell source declaring it:  its statement, and any body. */
  spell?: string
  /** Javascript that statement compiles to. */
  compiled?: string
  /** Rules that statement made, e.g. a method's, for calling it -- its name, and its syntax as written. */
  rules?: Array<{ name: string; syntax: string }>
  /** Where it was declared, if in a file. */
  location?: Location
  /** Markdown about it, as hovering its name would show. */
  hover?: string
  /** What it declares, for listing:  in alphabetical order, inherited ones included. */
  members: ScopeMember[]
  /** What's below it in the tree. */
  children: ScopeNode[]
}

/** Kind of `ScopeNode`:  a scope, or something declared in one. */
export type ScopeNodeKind = "root" | "project" | "file" | "type" | ScopeMember["kind"]

/** Something a `ScopeNode` declares, for listing. */
export type ScopeMember = {
  /** `id` of its own node, if it has one, e.g. to select it. */
  id?: string
  /** Name as written, e.g. `short-suit`, `move (a card) to (a pile)`. */
  name: string
  /** What it is. */
  kind: "type" | "property" | "enumeration" | "method" | "function" | "constant" | "variable"
  /** One-line summary, e.g. its datatype. */
  detail?: string
  /** Type_Case name of the super-type it came from, if not its node's own. */
  inheritedFrom?: string
  /** Markdown about it, as hovering its name would show. */
  hover: string
  /** Where it was declared, if in a file. */
  location?: Location
}

/**
 * Groups of `ScopeMember`s explorers show, in order:  each group's heading, and the kinds in it.
 * - A type's children in the tree come in this order too -- see `ScopeExplorer`.
 * - "Constants" holds each enumeration, then the constants it made -- see `ScopeExplorer.constantNodes()`.
 */
export const SCOPE_MEMBER_GROUPS: Array<{ label: string; kinds: Array<ScopeMember["kind"]> }> = [
  { label: "Types", kinds: ["type"] },
  { label: "Properties", kinds: ["property"] },
  { label: "Actions", kinds: ["method"] },
  { label: "Constants", kinds: ["enumeration", "constant"] },
  { label: "Functions", kinds: ["function"] },
  { label: "Variables", kinds: ["variable"] }
]

/** Params of `spell/setDescription`:  make `text` the docstring of what's declared at `position` in `uri`. */
export type SetDescriptionParams = {
  /** File, as `ScopeNode.descriptionAt`. */
  uri: string
  /** Start of its declaring statement, as `ScopeNode.descriptionAt`. */
  position: Position
  /** `true` for the FILE's own docstring, at its top -- `position` is ignored. */
  file?: boolean
  /** New docstring, as markdown:  one comment line per line, `#` lines as headings.  Empty removes it. */
  text: string
}

/** Sent as `spell/projectCompiled` after a project compiles, e.g. from `spell/compileProject`. */
export type ProjectCompiled = {
  /** Project id, as `ProjectInfo.project`. */
  project: string
  /** Project's javascript, EXACTLY as written to its `<Project>.compiled.js` -- see `ProjectInfo.compiledUri`. */
  compiled: string
}
