/**
 * Shared types for the spell language server.
 */
import type { DocumentSymbol } from "vscode-languageserver"

import type { P } from "$/parser"
import type { SP } from "$/spell"

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
  /** Heading level, if it's a heading comment:  the number of `#`s, e.g. `2` for `## Cards`. */
  heading?: number
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
 * - Built from flat `ScopeEntry`s by `buildScopeTree()` -- the same whether they come from a live parse or
 *   a scope pack.
 * - Root, projects and files hold what's declared in them;  a type holds its properties and methods.
 * - Just what the TREE shows:  a node's details come separately, when shown -- see `ScopeDetails`.
 */
export type ScopeNode = {
  /**
   * Where it is in the tree -- unique, and stable while names are, e.g.
   * `project:Solitaire/file:Card.spell/type:Card`.  `""` for the root.  See `scopePath()`.
   */
  path: string
  /** Name, e.g. `Card`, `Solitaire`, `Card.spell`, `suit` -- the last segment of `path`. */
  name: string
  /** What sort of thing -- from the last segment of `path`. */
  kind: ScopeNodeKind
  /** One-line summary, e.g. `is a Thing`, `imported`, a property's datatype. */
  detail?: string
  /** Heading it's under in its file, e.g. `actions` for `## actions` -- see `ScopeEntry.section`. */
  section?: string
  /** Type:  `path` of its super-type, if it's in the tree -- its members are inherited, see `buildScopeTree()`. */
  super?: string
  /** URI of the file it's in -- its own, or its nearest ancestor's.  See `ScopeEntry.uri`. */
  uri?: string
  /** What it declares, for listing, in document order -- a type's inherited ones after its own. */
  members: ScopeMember[]
  /** What's below it in the tree, in document order -- see `ScopeEntry`. */
  children: ScopeNode[]
}

/**
 * Answer to `spell/scopeDetails`:  what an explorer shows of ONE node or member, fetched when it's shown.
 * - Worked out on demand, and cached per parse of its file -- see `ScopeExplorer.details()`.
 * - A scope pack holds them in its entries instead -- see `ScopeEntry`.
 */
export type ScopeDetails = {
  /** Its docstring, as markdown -- `#` comments as headings.  See `SP.Block.getDocComments()`. */
  description?: string
  /**
   * Line its declaring statement is on, in its file -- or its first and last, with a body.  See `ScopeLine`.
   * - Where a link to it goes, and how `spell/setDescription` finds the statement, to change its docstring.
   */
  line?: ScopeLine
  /** URI of the file it's declared in, if NOT its node's -- e.g. a property of `Card` declared in `Deck.spell`. */
  uri?: string
  /** Rules that statement made, e.g. a method's, for calling it -- its name, and its syntax as written. */
  rules?: Array<{ name: string; syntax: string }>
  /**
   * Spell source declaring it:  its statement, and any body.
   * - Live only:  a scope pack leaves it out, as it's `line` of its file -- a page shows it from there.
   */
  spell?: string
  /**
   * Javascript that statement compiles to.
   * - Live only:  a scope pack leaves it out -- a page shows it from the compiled output it runs.
   */
  compiled?: string
}

/**
 * Line something's on in its file, counted from 1, as people do:  one line, e.g. `7`, or its first and last,
 * e.g. `[7, 9]`.
 */
export type ScopeLine = number | [number, number]

/** First line of `line`. */
export function firstLine(line: ScopeLine): number {
  return typeof line === "number" ? line : line[0]
}

/** `ScopeLine` from `first` to `last`:  just `first` for one line. */
export function scopeLine(first: number, last: number): ScopeLine {
  return last > first ? [first, last] : first
}

/** Kind of `ScopeNode`:  the root, or a kind which starts each segment of a `path` -- see `scopePath()`. */
export type ScopeNodeKind = "root" | ScopeKind

/** Kind of thing in a scope tree, below its root -- what each segment of a `path` starts with, e.g. `type:`. */
export type ScopeKind = "project" | "file" | ScopeMember["kind"]

/** Something a `ScopeNode` declares, for listing. */
export type ScopeMember = {
  /** `path` of its node in the tree -- and of its details. */
  path: string
  /** Name as written, e.g. `short-suit`, `move (a card) to (a pile)`. */
  name: string
  /** What it is. */
  kind: "type" | "property" | "enumeration" | "method" | "function" | "constant" | "variable"
  /** One-line summary, e.g. its datatype. */
  detail?: string
  /** Type_Case name of the super-type it came from, if not its node's own. */
  inheritedFrom?: string
  /** Heading it's under in its file -- see `ScopeEntry.section`. */
  section?: string
}

/**
 * Groups of `ScopeMember`s explorers show, in order:  each group's heading, and the kinds in it.
 * - A type's children in the tree come in this order too -- see `ScopeExplorer`.
 * - "Constants" holds each enumeration, then the constants it made -- see `ScopeExplorer.addConstants()`.
 */
export const SCOPE_MEMBER_GROUPS: Array<{ label: string; kinds: Array<ScopeMember["kind"]> }> = [
  { label: "Types", kinds: ["type"] },
  { label: "Properties", kinds: ["property"] },
  { label: "Actions", kinds: ["method"] },
  { label: "Constants", kinds: ["enumeration", "constant"] },
  { label: "Functions", kinds: ["function"] },
  { label: "Variables", kinds: ["variable"] }
]

/** Params of `spell/setDescription`:  make `text` the docstring of what's declared on `line` of `uri`. */
export type SetDescriptionParams = {
  /** File it's declared in. */
  uri: string
  /** First line of its declaring statement, from 1 -- as `ScopeDetails.line` starts. */
  line?: number
  /** `true` for the FILE's own docstring, at its top -- `line` is ignored. */
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

// ## Scope trees, flat

/**
 * One thing in a scope tree, flat:  its `path` says where it is, and what it is -- see `scopePath()`.
 * - A list of them, in tree order, is a whole tree -- see `buildScopeTree()`, which works out the nesting,
 *   names, kinds and members.  So a scope pack diffs one declaration per entry.
 * - Siblings come in DOCUMENT order:  the order they're declared in, by file then line -- except a project's
 *   files, in parse order, and what has no source, e.g. a compiled import's, after the rest, alphabetical.
 *   An explorer sorts them alphabetically itself, if asked.
 * - In a scope pack, each holds its details too -- `ScopeDetails`, but for `spell` and `compiled`.
 *   Live, they're fetched when shown.
 */
export type ScopeEntry = ScopeDetails & {
  /** Where it is, e.g. `project:Solitaire/file:Card.spell/type:Card/property:suit` -- see `scopePath()`. */
  path: string
  /** Type:  `path` of its super-type -- it inherits that one's members.  See `buildScopeTree()`. */
  super?: string
  /**
   * Its name as written, if not the name `path` ends in -- e.g. `short rank` for `.../property:short_rank`.
   * - Why not in `path`:  a property's path is by its name as it compiles, which the runner matches code by.
   */
  name?: string
  /**
   * One-line summary, e.g. `imported`, a property's datatype.
   * - Default for a type with a `super`:  `is a <Super>`.
   */
  detail?: string
  /**
   * Nearest heading comment above where it's declared, in that file, without its `#`s -- e.g. `actions` for
   * `## actions`.  Explorers show it as a marker, in document order.
   * - NOT the file's docstring's headings -- that's the file's description.
   */
  section?: string
  /**
   * URI of the file it's in:  a file's own -- anything below it is in it too -- or, for anything else, of the
   * file it's declared in if that's NOT its file's.  See `ScopeDetails.uri`.
   */
  uri?: string
}

/**
 * `path` of `name`, a `kind`, below `parent` -- e.g. `project:Solitaire/file:Card.spell/type:Card`.
 * - One `<kind>:<name>` segment per level, from the top:  so a path alone says what everything on it is.
 * - `""` is the root, so a top-level thing's path is just its segment, e.g. `type:Thing`.
 * - `/` and `%` in `name` are escaped, e.g. a method `divide (a) %2F (b)`.
 */
export function scopePath(parent: string, kind: ScopeKind, name: string): string {
  const segment = `${kind}:${name.replaceAll("%", "%25").replaceAll("/", "%2F")}`
  return parent ? `${parent}/${segment}` : segment
}

/** Kind and name `path` ends in -- its last segment's.  See `scopePath()`. */
export function scopeSegment(path: string): { kind: ScopeKind; name: string } {
  const segment = path.slice(path.lastIndexOf("/") + 1)
  const colon = segment.indexOf(":")
  return {
    kind: segment.slice(0, colon) as ScopeKind,
    name: segment
      .slice(colon + 1)
      .replaceAll("%2F", "/")
      .replaceAll("%25", "%")
  }
}

/** `path` of what `path` is below -- `""` for the root. */
export function parentScopePath(path: string): string {
  const slash = path.lastIndexOf("/")
  return slash < 0 ? "" : path.slice(0, slash)
}

/**
 * Tree of `entries` -- in tree order, each after the one it's below -- under a "Spell" root, working out what
 * the entries leave out:
 * - `name` and `kind`, from each `path` -- `name` from the entry itself, if it says one
 * - `uri`, from the nearest ancestor that has one
 * - a type's `detail`, from its `super`:  `is a <Super>`
 * - `members`:  a type's own children, then what it inherits from each `super` in turn -- one it re-declares
 *   shows once, as its own.  Anything else's are its children -- a project's, except its files.  The root's are
 *   its types, the built-ins.  All in document order, as the entries come -- see `ScopeEntry`.
 * - An entry whose parent isn't there goes at the top.
 */
export function buildScopeTree(entries: ScopeEntry[]): ScopeNode {
  const root: ScopeNode = { path: "", name: "Spell", kind: "root", detail: "built in", members: [], children: [] }
  const nodes = new Map<string, ScopeNode>([["", root]])
  for (const entry of entries) {
    const parent = nodes.get(parentScopePath(entry.path)) ?? root
    const node: ScopeNode = { path: entry.path, ...scopeSegment(entry.path), members: [], children: [] }
    if (entry.name !== undefined) node.name = entry.name
    if (entry.detail !== undefined) node.detail = entry.detail
    if (entry.section !== undefined) node.section = entry.section
    if (entry.super !== undefined) node.super = entry.super
    // a file's own, else its file's -- another entry's `uri` is where its details were declared, see `ScopeDetails`
    const uri = (node.kind === "file" ? entry.uri : undefined) ?? parent.uri
    if (uri !== undefined) node.uri = uri
    parent.children.push(node)
    nodes.set(entry.path, node)
  }
  for (const node of nodes.values()) {
    if (node.kind === "type") {
      if (node.detail === undefined && node.super !== undefined) node.detail = `is a ${scopeSegment(node.super).name}`
      node.members = typeMembers(node)
    } else {
      const listed = node.children.filter((child) => child.kind !== "file" && child.kind !== "project")
      node.members = listed.map((child) => asMember(child))
    }
  }
  return root

  /** Members of type `type`:  its own, then its super-types' it doesn't re-declare -- see above. */
  function typeMembers(type: ScopeNode): ScopeMember[] {
    const chain: ScopeNode[] = []
    for (
      let at: ScopeNode | undefined = type;
      at && !chain.includes(at);
      at = at.super ? nodes.get(at.super) : undefined
    ) {
      chain.push(at)
    }
    const members = new Map<string, ScopeMember>()
    for (const ancestor of chain) {
      for (const child of ancestor.children.filter((it) => MEMBER_KINDS.includes(it.kind as ScopeMember["kind"]))) {
        const key = `${child.kind}:${child.name}`
        if (!members.has(key)) members.set(key, asMember(child, ancestor === type ? undefined : ancestor.name))
      }
    }
    return [...members.values()]
  }

  /** `node` as a member of its parent -- `inheritedFrom` a super-type, if not its own. */
  function asMember(node: ScopeNode, inheritedFrom?: string): ScopeMember {
    const member: ScopeMember = { path: node.path, name: node.name, kind: node.kind as ScopeMember["kind"] }
    if (node.detail !== undefined) member.detail = node.detail
    if (inheritedFrom !== undefined) member.inheritedFrom = inheritedFrom
    if (node.section !== undefined) member.section = node.section
    return member
  }
}

/** Every kind a type's member can be -- those in `SCOPE_MEMBER_GROUPS`. */
const MEMBER_KINDS = SCOPE_MEMBER_GROUPS.flatMap(({ kinds }) => kinds)

// ## Scope packs

/**
 * A flat part of a Type Explorer's tree, with the details of everything in it -- for pages which show a project's
 * scopes WITHOUT the parser, e.g. `<spell-app>`.  See `scopeTreeFromPacks()`.
 * - Plain data:  NOT tied to the parser, so one can be written by hand, e.g. to document `Thing` or `List`,
 *   which are javascript.
 * - Written as a classic script, `<Project>.scopes.js` -- see `scopePackScript()`.
 * - Packs share one tree:  a project's type whose `super` is `type:Thing` inherits from the built-ins' pack.
 */
export type ScopePack = {
  /** Version of this FILE FORMAT, for readers -- NOT of the project.  `undefined` === 1. */
  format?: 1
  /** What it describes, e.g. `@system:examples:Solitaire`, or `@spell/core` for the built-in types. */
  id: string
  /** What it adds to the tree, in tree order, each with its details -- e.g. its project and those it imports. */
  entries: ScopeEntry[]
}

/** Global a scope pack script leaves its pack on, by the script's own URL -- see `scopePackScript()`. */
export const SCOPE_PACK_GLOBAL = "SPELL_SCOPES"

/**
 * `pack` as a classic script, as `<Project>.scopes.js` holds it -- NOT JSON, so a `<script src>` can load it from
 * anywhere, with no CORS.
 * - A javascript literal, laid out so a committed pack's diffs are readable -- see `packEntryLiteral()`:
 *   ```
 *   {
 *     path: "project:Solitaire/file:Solitaire.spell/function:debug the game", line: [72, 74],
 *     rules: [
 *       { name: "debug_the_game", syntax: "debug the game" }
 *     ]
 *   },
 *   ```
 * - SIDE EFFECT when it runs:  sets `globalThis[SCOPE_PACK_GLOBAL][<its own URL>]` to the pack, for whoever
 *   loaded it to pick up -- and delete.
 */
export function scopePackScript(pack: ScopePack): string {
  const { entries, ...rest } = pack
  const lines = [
    "{",
    ...Object.entries(rest).map(([key, value]) => `  ${key}: ${packValue(value)},`),
    "  entries: [",
    entries.map((entry) => indentPackLines(packEntryLiteral(entry), "    ")).join(",\n"),
    "  ]",
    "}"
  ]
  return (
    `/*! SPELL: SCOPES ${pack.id} */\n` +
    `;(globalThis.${SCOPE_PACK_GLOBAL} ??= {})[document.currentScript.src] = ${lines.join("\n")}\n`
  )
}

/**
 * One pack entry as a javascript literal, keys unquoted:
 * - `path` and `line` first, on ONE line -- where it is
 * - then each other key on a line of its own, and each of its `rules` too
 * - just `{ path, line }` on one line, when that's all it has
 */
function packEntryLiteral(entry: ScopeEntry): string {
  const { path, line, rules, ...rest } = entry
  const where = [`path: ${packValue(path)}`, ...(line === undefined ? [] : [`line: ${packValue(line)}`])].join(", ")
  const others = Object.entries(rest).filter(([, value]) => value !== undefined)
  if (!others.length && !rules?.length) return `{ ${where} }`
  const lines = [`  ${where},`, ...others.map(([key, value]) => `  ${key}: ${packValue(value)},`)]
  if (rules?.length) {
    const each = rules.map(({ name, syntax }) => `    { name: ${packValue(name)}, syntax: ${packValue(syntax)} }`)
    lines.push("  rules: [", each.join(",\n"), "  ]")
  } else {
    // no trailing comma after the last key
    lines[lines.length - 1] = lines.at(-1)!.replace(/,$/, "")
  }
  return ["{", ...lines, "}"].join("\n")
}

/** A pack's scalar or `ScopeLine` value as javascript, e.g. `"Card"`, `7` or `[7, 9]`. */
function packValue(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(packValue).join(", ")}]`
  return JSON.stringify(value)
}

/** Each line of `text` indented by `indent`. */
function indentPackLines(text: string, indent: string): string {
  return text
    .split("\n")
    .map((line) => indent + line)
    .join("\n")
}

/**
 * One tree from `packs`, and the details of everything in it, by `path` -- as `ScopeExplorer.tree()` would build.
 * - Entries in pack order:  so pass the built-ins' pack first.
 * - A later pack's entry wins, for a path in two.
 */
export function scopeTreeFromPacks(packs: ScopePack[]): { tree: ScopeNode; details: Map<string, ScopeDetails> } {
  const entries = new Map(packs.flatMap((pack) => pack.entries).map((entry) => [entry.path, entry]))
  return { tree: buildScopeTree([...entries.values()]), details: entries }
}
