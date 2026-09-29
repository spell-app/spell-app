/**
 * The Type Explorer's data on a page with NO parser, e.g. in `<spell-app>`:  scope packs, loaded as scripts.
 * - See `LSP.ScopePack`.  A later source may parse in the page instead -- anything giving a `ScopesSource`.
 * - A pack leaves out each declaration's `spell` and `compiled`:  they're worked out when shown, from the
 *   project's sources and compiled output -- if we can have them.  See `ScopesSourceHooks`.
 */
// Import directly, NOT through the `~/lsp` barrel, which would pull in the language service.
import {
  SCOPE_PACK_GLOBAL,
  scopeTreeFromPacks,
  type ScopeDetails,
  type ScopeLine,
  type ScopeNode,
  type ScopePack
} from "~/lsp/lsp.types"

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
}

/**
 * A `ScopesSource` of `packs` -- the built-ins' first.  See `LSP.scopeTreeFromPacks()`.
 * - A declaration's `spell` is its `line`s of its file, from `hooks.loadSource()`.
 * - Its `compiled` is what follows its `/*! SPELL: DECLARES ... *\/` marker in its project's compiled output,
 *   from `hooks.loadCompiled()` -- the marker on the same `line` of the same file.  So NO source needed:  only
 *   output compiled before markers had a `line` needs the source, to turn their offsets into lines.
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
    if (!entry || entry.line === undefined) return entry ?? null
    const uri = entry.uri ?? nodes.get(path)?.uri
    if (!uri) return entry
    const [first, last] = lineRange(entry.line)
    const source = await sourceOf(uri)
    const spell = source
      ?.split("\n")
      .slice(first - 1, last)
      .join("\n")
      .trimEnd()
    const compiled = await compiledAt(uri, first, source)
    return { ...entry, ...(spell ? { spell } : {}), ...(compiled ? { compiled } : {}) }
  }

  /** Text of spell file `uri`, asked for once. */
  function sourceOf(uri: string): Promise<string | undefined> {
    let source = sources.get(uri)
    if (!source)
      sources.set(uri, (source = hooks.loadSource?.(uri).catch(() => undefined) ?? Promise.resolve(undefined)))
    return source
  }

  /**
   * Compiled javascript of the declaration starting on line `first` of spell file `uri` -- its text `source`, if we
   * have it, for markers with no `line`.
   */
  async function compiledAt(uri: string, first: number, source?: string): Promise<string | undefined> {
    const { projectId, filePath } = splitSpellUri(uri)
    let found = markers.get(projectId)
    if (!found) {
      const compiled = hooks.loadCompiled?.(projectId).catch(() => undefined) ?? Promise.resolve(undefined)
      markers.set(projectId, (found = compiled.then((text) => (text ? compiledMarkers(text) : []))))
    }
    const marker = (await found).find(
      (it) => it.file === filePath && (it.line ?? (source ? lineAt(source, it.start) : undefined)) === first
    )
    return marker?.code
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
  /** Line its statement starts on, from 1 -- if it says:  output compiled before markers had one doesn't. */
  line?: number
  /** Offset in that file its statement starts at. */
  start: number
  /** Its compiled javascript. */
  code: string
}

/**
 * Every declaration marker in `compiled`, with the code after it -- up to the next marker, or the end of its file.
 * - A marker says where its statement is as `line: 2, defined: "/Card.spell:70-87"` -- its first line, and
 *   character offsets.  See `SP.SpellDeclaration.line`.
 */
function compiledMarkers(compiled: string): CompiledMarker[] {
  const found = [...compiled.matchAll(DECLARES)]
  return found.flatMap((match, index) => {
    const defined = /defined: "([^"]+):(\d+)-(\d+)"/.exec(match[0])
    if (!defined) return []
    const from = match.index + match[0].length
    const next = found[index + 1]?.index ?? compiled.length
    const fileEnd = compiled.indexOf(FILE_SEPARATOR, from)
    const to = fileEnd >= 0 && fileEnd < next ? fileEnd : next
    const line = /\bline: \[?(\d+)/.exec(match[0])
    const code = compiled.slice(from, to).trim()
    return [{ file: defined[1]!, line: line ? Number(line[1]) : undefined, start: Number(defined[2]), code }]
  })
}

/** A declaration marker in compiled output -- see `SP.SpellDeclarations`. */
const DECLARES = /\/\*! SPELL: DECLARES \{[\s\S]*?\} \*\//g

/**
 * Between each file's code in a project's compiled output -- `SP.SpellProject.FILE_SEPARATOR`.
 * - NOTE: a copy, NOT imported:  `~/languages/spell` would pull the whole parser into the bundle.
 */
const FILE_SEPARATOR = "\n// -----------\n"

////////////////
// ## Helpers
////////////////

/** First and last of `line`, from 1. */
function lineRange(line: ScopeLine): [number, number] {
  return typeof line === "number" ? [line, line] : line
}

/** Line of `source` offset `offset` is on, from 1. */
function lineAt(source: string, offset: number): number {
  let line = 1
  for (let at = source.indexOf("\n"); at >= 0 && at < offset; at = source.indexOf("\n", at + 1)) line++
  return line
}

/** Project id and file path of spell file `uri`, e.g. `spell:/@system:examples:Solitaire/Card.spell`. */
function splitSpellUri(uri: string): { projectId: string; filePath: string } {
  const path = decodeURI(uri.replace(/^spell:\//, ""))
  const slash = path.indexOf("/")
  return slash < 0
    ? { projectId: path, filePath: "" }
    : { projectId: path.slice(0, slash), filePath: path.slice(slash) }
}
