/**
 * VS Code extension for spell:  runs the spell parser's language server, and shows the code a file compiles to:
 *   javascript, TypeScript or Python, from the editor's title bar.
 * - And runs a project, in a panel beside it -- see `RunnerPanel`.
 * - And, in `.tsx` / `.jsx` files, custom elements' slot, part and dashed-attribute help -- see `ElementsHelp`;
 *   and Spell UI's and Spell Brand's HTML and CSS data, from `package.json` (`contributes.html.customData` ...).
 * - The spell LANGUAGE only:  the docs and Review tabs, "Open Epic...", the window bridge and the handoff are
 *   spell-epic's own extension's (`spell-app.spell-epic`, built from spell-epic's `vscode/`;  epic `epic-eject` I7).
 * - Activates on the window's first spell, `.tsx` or `.jsx` file (`activationEvents`).
 *   - The language server starts with the first SPELL file:  a window without spell files runs no server.
 * - The server is a spell-app checkout's own `src/lsp/server.ts`, run by its `tsx` from its root (`LSP_SERVER`).
 *   - Which checkout:  the window's, found when the server starts (`findSpellApp()`), so one installed copy works
 *     from the kit's main checkout and from every epic's worktree.
 *   - So the editor always runs spell as it is on disk:  restart the server to pick up a change.
 * - The server asks to watch `project.json` / `.spell` files itself, so there's no `synchronize` here.
 */
import { existsSync } from "fs"
import { dirname, resolve } from "path"
import * as vscode from "vscode"
import {
  LanguageClient,
  TransportKind,
  type LanguageClientOptions,
  type ServerOptions
} from "vscode-languageclient/node"

import { ElementsHelp } from "./ElementsHelp"
import { RunnerPanel } from "./RunnerPanel"
import { findSpellApp } from "./spellAppRoot"

/**
 * A spell-app checkout's language server, from its root:  `tsx` runs it there, reading the root's `tsconfig.json`.
 * - Since epic `repo-split` P14, every import a package name, so it needs no run-time alias hook.
 * - A checkout from before P14 (`lsp/src/server.ts`) has none:  the extension says so, naming this file.
 */
const LSP_SERVER = "src/lsp/server.ts"

/** Scheme of the read-only documents showing a spell file's compiled code -- see `CompiledProvider`. */
const COMPILED_SCHEME = "spell-compiled"

/**
 * The code a spell file can be shown as, by the language server's short name for its target
 * (`LSP.CompiledTarget`):
 * - `language`:  VS Code's language id, which highlights it
 * - `comment`:  how that language starts a line comment
 * - The compiled view's address ends with the short name, `Card.spell.ts`, so each can be open at once.
 */
const COMPILED_TARGETS = {
  js: { language: "javascript", comment: "//" },
  ts: { language: "typescript", comment: "//" },
  py: { language: "python", comment: "#" },
  // a `.spellx` file's code spell, "Show as Code Spell" (epic `elemental-spell` P8)
  spell: { language: "spell", comment: "//" }
} as const

/** A short name for a target:  `js`, `ts`, `py` or `spell` -- see `COMPILED_TARGETS`. */
type CompiledTarget = keyof typeof COMPILED_TARGETS

/** How long to wait after the last edit before refreshing an open compiled view, in msec. */
const REFRESH_DELAY = 300

/**
 * The spell-app checkout this extension was built in -- set by `build.mjs`.
 * - Only the last place `findSpellApp()` looks:  the window's own checkout comes first.
 */
declare const BUILT_IN_SPELL_APP: string

/** Client for the running language server, once `activate()` has started it. */
let client: LanguageClient | undefined

/** Whether `startLanguageServer()` has run:  it runs once per window. */
let serverStarted = false

/**
 * Turn on the elements help, and start the language server once a spell file is open.
 * - `startLanguageServer()` for the first spell file:  open now, or opened later.
 */
export function activate(context: vscode.ExtensionContext): void {
  ElementsHelp.register(context)
  const startFor = (document: vscode.TextDocument) => {
    if (serverStarted || !RunnerPanel.isSpellDocument(document)) return
    serverStarted = true
    void startLanguageServer(context).catch((error) => vscode.window.showErrorMessage(`Spell:  ${error}`))
  }
  context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(startFor))
  vscode.workspace.textDocuments.forEach(startFor)
}

/**
 * Start the language server and register our commands -- once, for the window's first spell file.
 * - Shows an error, and does nothing else, if no spell-app checkout is found (`findSpellApp()`),
 *   its packages aren't installed, or it has no `src/lsp/server.ts` (a checkout from before epic `repo-split` P14).
 */
async function startLanguageServer(context: vscode.ExtensionContext): Promise<void> {
  const configured = vscode.workspace.getConfiguration("spell").get<string>("parserRoot")
  const choice = findSpellApp({
    configured,
    workspaceFolders: (vscode.workspace.workspaceFolders ?? []).map(({ uri }) => uri.fsPath),
    builtIn: BUILT_IN_SPELL_APP
  })
  if (!choice) {
    const message = configured
      ? `Spell:  no spell-app checkout at '${configured}'.  Fix \`spell.parserRoot\`, or clear it to use the window's.`
      : "Spell:  no spell-app checkout in this window's folders.  Open one, or set `spell.parserRoot` to one."
    void vscode.window.showErrorMessage(message)
    return
  }
  const repoRoot = choice.root
  const tsx = findTsx(repoRoot)
  const server = resolve(repoRoot, LSP_SERVER)
  if (!tsx) {
    const message = `Spell:  no \`tsx\` for '${repoRoot}'.  Run \`yarn\` in its kit's folder, or set \`spell.parserRoot\`.`
    void vscode.window.showErrorMessage(message)
    return
  }
  if (!existsSync(server)) {
    const message =
      `Spell:  no language server at '${server}'.  A checkout from before epic \`repo-split\` P14 can't run ` +
      "in this extension:  set `spell.parserRoot` to a newer one."
    void vscode.window.showErrorMessage(message)
    return
  }

  // `TransportKind.stdio` adds `--stdio` to `args`.
  const serverOptions: ServerOptions = {
    command: tsx,
    args: [server],
    transport: TransportKind.stdio,
    // `tsx` reads the `tsconfig.json` where it runs
    options: { cwd: repoRoot }
  }
  const clientOptions: LanguageClientOptions = {
    documentSelector: RunnerPanel.LANGUAGES.map((language) => ({ scheme: "file", language }))
  }
  client = new LanguageClient("spell", "Spell", serverOptions, clientOptions)
  client.info(`Language server from ${repoRoot}:  ${choice.reason}`)
  RunnerPanel.register(context, client, repoRoot)

  const compiled = new CompiledProvider(client)
  context.subscriptions.push(
    client,
    vscode.workspace.registerTextDocumentContentProvider(COMPILED_SCHEME, compiled),
    vscode.workspace.onDidChangeTextDocument(({ document }) => compiled.sourceChanged(document.uri)),
    vscode.commands.registerCommand("spell.showCompiled", () => showCompiled("js")),
    vscode.commands.registerCommand("spell.showCompiledTypeScript", () => showCompiled("ts")),
    vscode.commands.registerCommand("spell.showCompiledPython", () => showCompiled("py")),
    vscode.commands.registerCommand("spell.showCodeSpell", () => showCompiled("spell"))
  )
  await client.start()
}

/** Stop the language server. */
export function deactivate(): Promise<void> | undefined {
  return client?.stop()
}

/**
 * The repo's `tsx` executable, or `undefined` if no `yarn install` has run.
 * - Looks in `<repoRoot>/node_modules/.bin` and every parent:  yarn hoists tools to the kit's root.  It's
 *   `spell`'s `tsx`, pinned to 4.20.3 -- see `agents/PAPERCUTS.md`.
 */
function findTsx(repoRoot: string): string | undefined {
  for (let folder = repoRoot; ; folder = dirname(folder)) {
    const candidate = resolve(folder, "node_modules/.bin/tsx")
    if (existsSync(candidate)) return candidate
    if (dirname(folder) === folder) return undefined
  }
}

/** Open the code the active spell file compiles to for `target` beside it, read-only, highlighted as its language. */
async function showCompiled(target: CompiledTarget): Promise<void> {
  const editor = vscode.window.activeTextEditor
  if (!editor || !RunnerPanel.isSpellDocument(editor.document)) return
  const document = await vscode.workspace.openTextDocument(CompiledProvider.uriFor(editor.document.uri, target))
  await vscode.languages.setTextDocumentLanguage(document, COMPILED_TARGETS[target].language)
  await vscode.window.showTextDocument(document, {
    viewColumn: vscode.ViewColumn.Beside,
    preview: false,
    preserveFocus: true
  })
}

/****************
 * ### `CompiledProvider`
 * Read-only documents holding the code a spell file compiles to, from the server's `spell/compiled` request.
 * - One per target:  javascript, TypeScript, Python (`COMPILED_TARGETS`).
 * - The document's URI ends with its target, and carries the spell file's URI in its query -- see `uriFor()`.
 * - Refreshes each open one a moment after its spell file changes.
 ****************/
class CompiledProvider implements vscode.TextDocumentContentProvider {
  /** Client to ask. */
  declare client: LanguageClient
  /** Fires with a compiled document's URI when it should refresh. */
  readonly #changed = new vscode.EventEmitter<vscode.Uri>()
  readonly onDidChange = this.#changed.event
  /** Pending refresh of each spell file's compiled view, by the spell file's URI. */
  readonly #timers = new Map<string, ReturnType<typeof setTimeout>>()

  constructor(client: LanguageClient) {
    this.client = client
  }

  /**
   * URI of spell file `source`'s compiled view for `target`,
   * e.g. `spell-compiled:/…/Card.spell.ts?file:///…/Card.spell`.
   */
  static uriFor(source: vscode.Uri, target: CompiledTarget): vscode.Uri {
    return vscode.Uri.from({ scheme: COMPILED_SCHEME, path: `${source.path}.${target}`, query: source.toString() })
  }

  /** The target compiled view `uri` shows, from the end of its path -- see `uriFor()`. */
  static targetOf(uri: vscode.Uri): CompiledTarget {
    const ending = uri.path.slice(uri.path.lastIndexOf(".") + 1)
    return ending in COMPILED_TARGETS ? (ending as CompiledTarget) : "js"
  }

  /** The code compiled view `uri` shows:  its spell file's, for its target. */
  async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
    const target = CompiledProvider.targetOf(uri)
    const compiled = await this.client.sendRequest<string | null>("spell/compiled", { uri: uri.query, target })
    return compiled ?? `${COMPILED_TARGETS[target].comment} Not a spell file in a spell project`
  }

  /** Spell file `source` changed:  refresh each of its compiled views that's open, once edits pause. */
  sourceChanged(source: vscode.Uri): void {
    const open = new Set(vscode.workspace.textDocuments.map(({ uri }) => uri.toString()))
    const views = Object.keys(COMPILED_TARGETS)
      .map((target) => CompiledProvider.uriFor(source, target as CompiledTarget))
      .filter((uri) => open.has(uri.toString()))
    if (!views.length) return
    const key = source.toString()
    clearTimeout(this.#timers.get(key))
    this.#timers.set(
      key,
      setTimeout(() => {
        this.#timers.delete(key)
        for (const uri of views) this.#changed.fire(uri)
      }, REFRESH_DELAY)
    )
  }
}
