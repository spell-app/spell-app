/**
 * The Type Explorer's data on a page with NO parser, e.g. in `<spell-app>`:  scope packs, loaded as scripts.
 * - See `LSP.ScopePack`.  A later source may parse in the page instead -- anything giving a `ScopesSource`.
 * - A pack leaves out each declaration's `spell` and `compiled`:  they're worked out when shown, from the
 *   project's sources and compiled output -- if we can have them.  See `ScopesSourceHooks`.
 */
import JSON5 from "json5"

// Import directly, NOT through the `$/lsp` barrel, which would pull in the language service.
import {
  SCOPE_PACK_GLOBAL,
  scopePath,
  scopeTreeFromPacks,
  type ScopeDetails,
  type ScopeLine,
  type ScopeNode,
  type ScopePack
} from "$/lsp/lsp.types"

/** What a Type Explorer shows:  a tree, and the details of what's in it, by `path`. */
export type ScopesSource = {
  /** The tree -- see `LSP.buildScopeTree()`. */
  tree: ScopeNode
  /** Details of node or member `path` -- `null` if there are none. */
  details: (path: string) => Promise<ScopeDetails | null>
}

/** How a `ScopesSource` from packs gets what they leave out -- see `scopesFromPacks()`. */
export type ScopesSourceHooks = {
  /** Text of spell file `uri`, e.g. `spell:/@system:examples:Solitaire/Card.spell` -- if it can be had. */
  loadSource?: (uri: string) => Promise<string | undefined>
  /** Compiled javascript of project `projectId`, e.g. `@system:examples:Solitaire` -- if it can be had. */
  loadCompiled?: (projectId: string) => Promise<string | undefined>
  /**
   * Project `projectId`'s declarations, its `<Project>.declarations.json` -- if it can be had:  where each
   * declaration's code starts in its compiled javascript.
   */
  loadDeclarations?: (projectId: string) => Promise<CompiledDeclarations | undefined>
}

/**
 * What `ScopesSource` reads of a project's declarations file -- see `SP.SpellDeclarationsData`.
 * - NOT imported from there:  `$/spell` would pull the whole parser into the bundle.
 */
export type CompiledDeclarations = {
  /** What each declaring statement declared. */
  statements: MarkerDeclaration[]
  /** Where each statement's code starts in the compiled javascript:  its line, from 0. */
  codeLines?: number[]
}

/**
 * A `ScopesSource` of `packs` -- the built-ins' first.  See `LSP.scopeTreeFromPacks()`.
 * - A declaration's `spell` is its `line`s of its file, from `hooks.loadSource()`.
 * - Its `compiled` is its statement's code in its project's compiled output, from `hooks.loadCompiled()`:  found
 *   by the project's declarations (`hooks.loadDeclarations()`), whose `codeLines` say where each statement starts --
 *   the statement in the same file which declares it, e.g. `of: "Card"` + `property: "suit"` for
 *   `.../type:Card/property:suit`.  So NO source needed.  See `declaredPaths()`.
 *   - Compiled output from before declarations files has `/*! SPELL: DECLARES ... *\/` markers inline instead:
 *     read from those.
 * - Each file's text, and each project's markers, are asked for once.
 */
export function scopesFromPacks(packs: ScopePack[], hooks: ScopesSourceHooks = {}): ScopesSource {
  const { tree, details } = scopeTreeFromPacks(packs)
  const nodes = new Map<string, ScopeNode>()
  index(tree)
  const sources = new Map<string, Promise<string | undefined>>()
  const markers = new Map<string, Promise<CompiledMarker[]>>()
  return { tree, details: detailsOf }

  /** Details of `path`, with its `spell` and `compiled` worked out, if we can. */
  async function detailsOf(path: string): Promise<ScopeDetails | null> {
    const entry = details.get(path)
    if (!entry) return null
    const uri = entry.uri ?? nodes.get(path)?.uri
    if (!uri) return entry
    const spell = entry.line === undefined ? undefined : linesOf(await sourceOf(uri), entry.line)
    const compiled = await compiledFor(uri, path)
    return { ...entry, ...(spell ? { spell } : {}), ...(compiled ? { compiled } : {}) }
  }

  /** Text of spell file `uri`, asked for once. */
  function sourceOf(uri: string): Promise<string | undefined> {
    let source = sources.get(uri)
    if (!source)
      sources.set(uri, (source = hooks.loadSource?.(uri).catch(() => undefined) ?? Promise.resolve(undefined)))
    return source
  }

  /** Compiled javascript of the statement in spell file `uri` which declares `path`, if we can have it. */
  async function compiledFor(uri: string, path: string): Promise<string | undefined> {
    const declared = declaredPath(path)
    if (!declared) return undefined
    const { projectId, filePath } = splitSpellUri(uri)
    let found = markers.get(projectId)
    if (!found) {
      const compiled = hooks.loadCompiled?.(projectId).catch(() => undefined) ?? Promise.resolve(undefined)
      const declared = hooks.loadDeclarations?.(projectId).catch(() => undefined) ?? Promise.resolve(undefined)
      found = Promise.all([compiled, declared]).then(([text, declarations]) => {
        if (!text) return []
        return declarations?.codeLines ? declaredCode(text, declarations) : compiledMarkers(text)
      })
      markers.set(projectId, found)
    }
    return (await found).find((it) => it.file === filePath && it.declares.includes(declared))?.code
  }

  /** Index `node`, and everything below it, by `path`. */
  function index(node: ScopeNode) {
    nodes.set(node.path, node)
    node.children.forEach(index)
  }
}

/**
 * Scope pack at `url`, loaded as a classic `<script>` -- `undefined` if there isn't one there.
 * - A script, so it loads from anywhere, with no CORS -- see `LSP.scopePackScript()`.
 * - Loaded once per page:  every element asking for it shares the pack, which is read-only.
 * - SIDE EFFECT:  the script leaves its pack on `globalThis[SCOPE_PACK_GLOBAL]`, by its URL -- we take it off.
 */
export function loadScopePack(url: string): Promise<ScopePack | undefined> {
  const src = new URL(url, document.baseURI).href
  let pack = packs.get(src)
  if (!pack) packs.set(src, (pack = new Promise((resolve) => injectPack(src, resolve))))
  return pack
}

/** Each scope pack loaded, by absolute URL. */
const packs = new Map<string, Promise<ScopePack | undefined>>()

/** Load scope pack `src` with a `<script>` -- then `done()` with the pack it left, or `undefined`. */
function injectPack(src: string, done: (pack: ScopePack | undefined) => void) {
  const script = document.createElement("script")
  script.src = src
  script.onload = () => {
    const left = (globalThis as Record<string, unknown>)[SCOPE_PACK_GLOBAL] as Record<string, ScopePack> | undefined
    const pack = left?.[script.src]
    if (left) delete left[script.src]
    script.remove()
    done(pack)
  }
  script.onerror = () => {
    script.remove()
    done(undefined)
  }
  document.head.append(script)
}

////////////////
// ## Compiled output
////////////////

/** A declaration's code in a project's compiled output, after its `/*! SPELL: DECLARES ... *\/` marker. */
type CompiledMarker = {
  /** Spell file it's defined in, in its project, e.g. `/Card.spell`. */
  file: string
  /** What it declares, as the end of each one's path in a scope pack -- see `declaredPaths()`. */
  declares: string[]
  /** Its compiled javascript. */
  code: string
}

/**
 * Every declaration marker in `compiled`, with its code after it -- see `declarationCode()`.
 * - Up to the next marker at its indent or less, or the end of its file.  A marker for a class member is
 *   indented in its class's body, so a class's code runs on past its members' markers.
 * - A marker says which file its statement's in as `defined: "/Card.spell:70-87"`, and what it declares as
 *   `SP.SpellDeclaration` props, e.g. `property: "suit", of: "Card"` -- see `declaredPaths()`.
 */
function compiledMarkers(compiled: string): CompiledMarker[] {
  const found = [...compiled.matchAll(DECLARES)].map((match) => ({ match, indent: indentAt(compiled, match.index) }))
  return found.flatMap(({ match, indent }, index) => {
    const declaration = parseMarker(match[0])
    const defined = typeof declaration?.defined === "string" && /^(.+):\d+-\d+$/.exec(declaration.defined)
    if (!declaration || !defined) return []
    const from = match.index + match[0].length
    const next = found.slice(index + 1).find((it) => it.indent.length <= indent.length)?.match.index ?? compiled.length
    const fileEnd = compiled.indexOf(FILE_SEPARATOR, from)
    const to = fileEnd >= 0 && fileEnd < next ? fileEnd : next
    const code = declarationCode(compiled.slice(from, to), indent)
    return [{ file: defined[1]!, declares: declaredPaths(declaration), code }]
  })
}

/**
 * Each of `declarations`' statements, with its code from `compiled` -- as `compiledMarkers()` does with markers, but
 * each statement starting at its `codeLines` line.
 * - Up to the next statement at its indent or less, or the end of its file.
 */
function declaredCode(compiled: string, { statements, codeLines = [] }: CompiledDeclarations): CompiledMarker[] {
  const lineStarts = [0]
  for (let at = compiled.indexOf("\n"); at >= 0; at = compiled.indexOf("\n", at + 1)) lineStarts.push(at + 1)
  const found = statements.map((declaration, index) => {
    const from = lineStarts[codeLines[index] ?? -1] ?? compiled.length
    return { declaration, from, indent: indentAt(compiled, from + /^[ \t]*/.exec(compiled.slice(from))![0].length) }
  })
  return found.flatMap(({ declaration, from, indent }, index) => {
    const defined = typeof declaration.defined === "string" && /^(.+):\d+-\d+$/.exec(declaration.defined)
    if (!defined || from >= compiled.length) return []
    const next = found.slice(index + 1).find((it) => it.indent.length <= indent.length)?.from ?? compiled.length
    const fileEnd = compiled.indexOf(FILE_SEPARATOR, from)
    const to = fileEnd >= 0 && fileEnd < next ? fileEnd : next
    const code = declarationCode(compiled.slice(from, to), indent)
    return [{ file: defined[1]!, declares: declaredPaths(declaration), code }]
  })
}

/** What marker `comment` says its statement declared -- `undefined` if it can't be read. */
function parseMarker(comment: string): MarkerDeclaration | undefined {
  try {
    return JSON5.parse<MarkerDeclaration>(comment.slice(comment.indexOf("{"), comment.lastIndexOf("}") + 1))
  } catch {
    return undefined
  }
}

/**
 * What a marker's statement declares, as the end of each one's path in a scope pack -- from its `type:`, or its
 * `file:` if it's not in a type -- e.g. `type:Card/property:suit` or `function:debug the game`.
 * - As `LSP.ScopeExplorer` names them, e.g. a method by its `name` without its quotes.
 */
function declaredPaths(declaration: MarkerDeclaration): string[] {
  const { type, of, property, classVariable, kind, constants = [], enumeration = [] } = declaration
  const owner = of && scopePath("", "type", of)
  const paths: string[] = []
  if (type) paths.push(scopePath("", "type", type))
  if (!owner) {
    if (kind === "function") paths.push(scopePath("", "function", methodName(declaration)))
    return paths
  }
  if (property) paths.push(scopePath(owner, "property", property))
  if (classVariable) paths.push(scopePath(owner, "enumeration", classVariable))
  if (kind === "method") paths.push(scopePath(owner, "method", methodName(declaration)))
  // an enumeration's values are constants too, e.g. `'clubs'`
  const values = enumeration.filter((value): value is string => typeof value === "string")
  for (const name of [...constants, ...values.map((value) => value.replace(/^'(.*)'$/, "$1"))])
    paths.push(scopePath(owner, "constant", name))
  return paths
}

/**
 * Method or function name, as `LSP.ScopeExplorer.methodName()` has it:  its `name` -- else its `syntax` -- without
 * quotes, e.g. `is face up` for `"is face up"`, and `test ` in front of a test's.
 */
function methodName({ name, syntax = "" }: MarkerDeclaration): string {
  const declared = (name ?? syntax).replace(/^"(.*)"$/, "$1")
  return /^test\b/.test(syntax) && !/^test\b/.test(declared) ? `test ${declared}` : declared
}

/**
 * End of `path` which a marker's `declaredPaths()` may hold -- below its `file:`, or its `project:` -- e.g.
 * `type:Card/property:suit`.  `undefined` for a project or file itself.
 */
function declaredPath(path: string): string | undefined {
  const segments = path.split("/")
  let below = segments.length - 1
  while (below >= 0 && !/^(file|project):/.test(segments[below]!)) below--
  return segments.slice(below + 1).join("/") || undefined
}

/**
 * What a `SPELL: DECLARES` marker says, as far as finding its entries goes -- see `SP.SpellDeclaration`.
 * - NOT imported from there:  `$/spell` would pull the whole parser into the bundle.
 */
export type MarkerDeclaration = {
  type?: string
  of?: string
  property?: string
  classVariable?: string
  kind?: string
  name?: string
  syntax?: string
  constants?: string[]
  enumeration?: Array<string | number>
  defined?: string
}

/** Whitespace from the start of `offset`'s line up to it, e.g. a tab for a marker in a class body. */
function indentAt(text: string, offset: number): string {
  const lineStart = text.lastIndexOf("\n", offset - 1) + 1
  return /^[ \t]*/.exec(text.slice(lineStart, offset))![0]
}

/**
 * A declaration's code, from `text` after its marker:
 * - up to a line indented less than its marker, `indent`, e.g. the `}` closing the class it's a member of
 * - dedented by `indent`
 * - without the markers of what's declared in it, e.g. a class's members
 * - without the comments at its end:  they're the next declaration's, e.g. its docstring or a banner
 */
function declarationCode(text: string, indent: string): string {
  const lines: string[] = []
  for (const line of text.split("\n")) {
    if (line.trim() && !line.startsWith(indent)) break
    lines.push(line.slice(indent.length))
  }
  // a class's members' markers are noise in its code
  const code = lines
    .join("\n")
    .replace(new RegExp(`^[ \\t]*${DECLARES.source}\\n?`, "gm"), "")
    .split("\n")
  lines.splice(0, lines.length, ...code)
  while (lines.length) {
    const last = lines.at(-1)!.trim()
    if (!last || last.startsWith("//")) lines.pop()
    else if (last.endsWith("*/") && startOfDocComment(lines) >= 0) lines.splice(startOfDocComment(lines))
    else break
  }
  return lines.join("\n").trim()
}

/** Index of the line starting the `/** ... *\/` docstring which ends `lines`, else `-1`. */
function startOfDocComment(lines: string[]): number {
  for (let index = lines.length - 1; index >= 0; index--) {
    const line = lines[index]!.trim()
    if (line.startsWith("/*")) return line.startsWith("/**") ? index : -1
  }
  return -1
}

/** A declaration marker in compiled output -- see `SP.SpellDeclarations`. */
const DECLARES = /\/\*! SPELL: DECLARES \{[\s\S]*?\} \*\//g

/**
 * Between each file's code in a project's compiled output -- `SP.SpellProject.FILE_SEPARATOR`.
 * - NOTE: a copy, NOT imported:  `$/spell` would pull the whole parser into the bundle.
 */
const FILE_SEPARATOR = "\n// -----------\n"

////////////////
// ## Helpers
////////////////

/** `line` of `source` -- or its first to last -- as text;  `undefined` without `source`. */
function linesOf(source: string | undefined, line: ScopeLine): string | undefined {
  const [first, last] = typeof line === "number" ? [line, line] : line
  return source
    ?.split("\n")
    .slice(first - 1, last)
    .join("\n")
    .trimEnd()
}

/** Project id and file path of spell file `uri`, e.g. `spell:/@system:examples:Solitaire/Card.spell`. */
function splitSpellUri(uri: string): { projectId: string; filePath: string } {
  const path = decodeURI(uri.replace(/^spell:\//, ""))
  const slash = path.indexOf("/")
  return slash < 0
    ? { projectId: path, filePath: "" }
    : { projectId: path.slice(0, slash), filePath: path.slice(slash) }
}
