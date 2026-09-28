/**
 * VS Code extension for spell:  runs the spell parser's language server, and shows a file's compiled javascript.
 * - The server is the parser repo's own `src/lsp/server.ts`, run by that repo's `tsx` -- see `getParserRoot()`.
 *   So the editor always runs the parser as it is on disk:  restart the server to pick up a parser change.
 * - The server asks to watch `.imports.json` / `.spell` files itself, so there's no `synchronize` here.
 */
import { existsSync } from "fs"
import { resolve } from "path"
import * as vscode from "vscode"
import {
  LanguageClient,
  TransportKind,
  type LanguageClientOptions,
  type ServerOptions
} from "vscode-languageclient/node"

/** Scheme of the read-only documents showing a spell file's compiled javascript -- see `CompiledProvider`. */
const COMPILED_SCHEME = "spell-compiled"

/** How long to wait after the last edit before refreshing an open compiled view, in msec. */
const REFRESH_DELAY = 300

/** Parser repo this extension was built in -- set by `build.mjs`. */
declare const PARSER_ROOT: string

/** Client for the running language server, once `activate()` has started it. */
let client: LanguageClient | undefined

/**
 * Start the language server and register our command.
 * - Shows an error, and does nothing else, if `spell.parserRoot` isn't a parser repo with its packages installed.
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const parserRoot = getParserRoot()
  const tsx = resolve(parserRoot, "node_modules/.bin/tsx")
  const server = resolve(parserRoot, "src/lsp/server.ts")
  if (!existsSync(tsx) || !existsSync(server)) {
    const message = `Spell:  no language server in '${parserRoot}'.  Set \`spell.parserRoot\` to the parser repo, and run \`yarn\` there.`
    void vscode.window.showErrorMessage(message)
    return
  }

  // `TransportKind.stdio` adds `--stdio` to `args`.  `cwd` so `tsx` finds the repo's `tsconfig.json` (for `~/`).
  const serverOptions: ServerOptions = {
    command: tsx,
    args: [server],
    transport: TransportKind.stdio,
    options: { cwd: parserRoot }
  }
  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "spell" }]
  }
  client = new LanguageClient("spell", "Spell", serverOptions, clientOptions)

  const compiled = new CompiledProvider(client)
  context.subscriptions.push(
    client,
    vscode.workspace.registerTextDocumentContentProvider(COMPILED_SCHEME, compiled),
    vscode.workspace.onDidChangeTextDocument(({ document }) => compiled.sourceChanged(document.uri)),
    vscode.commands.registerCommand("spell.showCompiled", () => showCompiled())
  )
  await client.start()
}

/** Stop the language server. */
export function deactivate(): Promise<void> | undefined {
  return client?.stop()
}

/**
 * Folder of the parser repo whose server we run:  `spell.parserRoot` if set, else the repo we were built in.
 * - NOT `context.extensionPath`:  an installed copy lives in VS Code's extensions folder, away from the repo.
 */
function getParserRoot(): string {
  const configured = vscode.workspace.getConfiguration("spell").get<string>("parserRoot")
  return configured ? resolve(configured) : PARSER_ROOT
}

/** Open the active spell file's compiled javascript beside it, read-only. */
async function showCompiled(): Promise<void> {
  const editor = vscode.window.activeTextEditor
  if (!editor || editor.document.languageId !== "spell") return
  const document = await vscode.workspace.openTextDocument(CompiledProvider.uriFor(editor.document.uri))
  await vscode.languages.setTextDocumentLanguage(document, "javascript")
  await vscode.window.showTextDocument(document, {
    viewColumn: vscode.ViewColumn.Beside,
    preview: false,
    preserveFocus: true
  })
}

/****************
 * ### `CompiledProvider`
 * Read-only documents holding a spell file's compiled javascript, from the server's `spell/compiled` request.
 * - The document's URI carries the spell file's URI in its query -- see `uriFor()`.
 * - Refreshes an open one a moment after its spell file changes.
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

  /** URI of the compiled view of spell file `source`, e.g. `spell-compiled:/…/Card.spell.js?file:///…/Card.spell`. */
  static uriFor(source: vscode.Uri): vscode.Uri {
    return vscode.Uri.from({ scheme: COMPILED_SCHEME, path: `${source.path}.js`, query: source.toString() })
  }

  /** Compiled javascript for the spell file `uri` shows. */
  async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
    const compiled = await this.client.sendRequest<string | null>("spell/compiled", { uri: uri.query })
    return compiled ?? "// Not a spell file in a spell project"
  }

  /** Spell file `source` changed:  refresh its compiled view, if it's open, once edits pause. */
  sourceChanged(source: vscode.Uri): void {
    const compiledUri = CompiledProvider.uriFor(source)
    const isOpen = vscode.workspace.textDocuments.some(({ uri }) => uri.toString() === compiledUri.toString())
    if (!isOpen) return
    const key = source.toString()
    clearTimeout(this.#timers.get(key))
    this.#timers.set(
      key,
      setTimeout(() => {
        this.#timers.delete(key)
        this.#changed.fire(compiledUri)
      }, REFRESH_DELAY)
    )
  }
}
