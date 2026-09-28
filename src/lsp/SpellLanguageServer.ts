import {
  DidChangeWatchedFilesNotification,
  FileChangeType,
  TextDocuments,
  TextDocumentSyncKind,
  type Connection,
  type ServerCapabilities
} from "vscode-languageserver"
import { TextDocument } from "vscode-languageserver-textdocument"

import type { SP } from "~/languages/spell"
import { LSP } from "~/lsp"

/**
 * Spell language server:  wires a `SpellWorkspace` + `SpellLanguageService` to an LSP `connection`.
 * - Document changes go through ONE queue, in order.
 *   Requests wait for every change before them, so they always see the parse of the editor's text.
 * - Diagnostics publish for every file a change re-parsed, not just the edited one:
 *   a broken declaration shows up wherever it's used.
 * - They publish after a short trailing delay, so a burst of edits publishes once.
 * - Run it as a process with `server.ts`;  tests can hand it any connection.
 */
export class SpellLanguageServer {
  /** How long to wait after the last change before publishing diagnostics, in msec. */
  static PUBLISH_DELAY = 50

  /**
   * What we can do, sent on `initialize`.
   * - NOTE: a feature goes in only once it works.
   */
  static capabilities: ServerCapabilities = {
    textDocumentSync: { openClose: true, change: TextDocumentSyncKind.Incremental, save: { includeText: false } },
    documentSymbolProvider: true,
    workspaceSymbolProvider: true,
    foldingRangeProvider: true,
    selectionRangeProvider: true,
    semanticTokensProvider: { legend: LSP.SpellLanguageService.TOKEN_LEGEND, full: true, range: true },
    hoverProvider: true,
    definitionProvider: true,
    typeDefinitionProvider: true,
    referencesProvider: true,
    documentHighlightProvider: true,
    renameProvider: { prepareProvider: true },
    completionProvider: { triggerCharacters: [" "] },
    documentFormattingProvider: true,
    documentRangeFormattingProvider: true
    // STUBS, not advertised until they work -- see `## Stubs` in `SpellLanguageService`:
    // signatureHelpProvider: { triggerCharacters: [" "] },
    // codeActionProvider: true,
    // codeLensProvider: {},
    // semanticTokensProvider: { ..., full: { delta: true } },
  }

  /** Connection to the editor. */
  declare connection: Connection
  /** Open documents' text, kept in step with the editor's edits. */
  readonly documents = new TextDocuments(TextDocument)
  /** Spell projects of the open documents. */
  readonly workspace = new LSP.SpellWorkspace()
  /** Answers requests about parsed files. */
  readonly service = new LSP.SpellLanguageService(this.workspace)

  /** Every change so far, in order -- see `enqueue()`. */
  #queue: Promise<unknown> = Promise.resolve()
  /** Files whose diagnostics are due, and the timer that will publish them. */
  #toPublish = new Set<SP.SpellFile>()
  #publishTimer: ReturnType<typeof setTimeout> | undefined

  constructor(connection: Connection) {
    this.connection = connection
  }

  /** Answer the editor from now on. */
  listen() {
    const { connection, documents, workspace, service } = this

    connection.onInitialize(() => ({
      capabilities: SpellLanguageServer.capabilities,
      serverInfo: { name: "spell" }
    }))
    connection.onInitialized(() => this.watchFiles())

    // `onDidChangeContent` fires on open too.
    documents.onDidChangeContent(({ document }) =>
      this.enqueue(() => workspace.update(document.uri, document.getText()))
    )
    documents.onDidClose(({ document }) => this.enqueue(() => workspace.close(document.uri)))
    connection.onDidChangeWatchedFiles(({ changes }) => {
      for (const { uri, type } of changes) {
        // A deleted file's diagnostics would otherwise hang around.
        if (type === FileChangeType.Deleted)
          connection.sendDiagnostics({ uri, diagnostics: [] }).catch((error: unknown) => this.logError(error))
        this.enqueue(() => workspace.diskChanged(uri, DISK_CHANGES[type]!))
      }
    })

    connection.onDocumentSymbol(({ textDocument }) =>
      this.answer(textDocument.uri, [], (file) => service.documentSymbols(file))
    )
    connection.onFoldingRanges(({ textDocument }) =>
      this.answer(textDocument.uri, [], (file) => service.foldingRanges(file))
    )
    connection.onSelectionRanges(({ textDocument, positions }) =>
      this.answer(textDocument.uri, [], (file) => service.selectionRanges(file, positions))
    )
    connection.onWorkspaceSymbol(async ({ query }) => {
      await this.#queue
      return service.workspaceSymbols(query)
    })

    connection.languages.semanticTokens.on(({ textDocument }) =>
      this.answer(textDocument.uri, { data: [] }, (file) => service.semanticTokens(file))
    )
    connection.languages.semanticTokens.onRange(({ textDocument, range }) =>
      this.answer(textDocument.uri, { data: [] }, (file) => service.semanticTokens(file, range))
    )
    connection.onHover(({ textDocument, position }) =>
      this.answer(textDocument.uri, null, (file) => service.hover(file, position))
    )
    connection.onDefinition(({ textDocument, position }) =>
      this.answer(textDocument.uri, [], (file) => service.definition(file, position))
    )
    connection.onTypeDefinition(({ textDocument, position }) =>
      this.answer(textDocument.uri, [], (file) => service.typeDefinition(file, position))
    )
    connection.onReferences(({ textDocument, position, context }) =>
      this.answer(textDocument.uri, [], (file) => service.references(file, position, context.includeDeclaration))
    )
    connection.onDocumentHighlight(({ textDocument, position }) =>
      this.answer(textDocument.uri, [], (file) => service.documentHighlights(file, position))
    )
    connection.onPrepareRename(({ textDocument, position }) =>
      this.answer(textDocument.uri, null, (file) => service.prepareRename(file, position))
    )
    connection.onRenameRequest(({ textDocument, position, newName }) =>
      this.answer(textDocument.uri, null, (file) => service.rename(file, position, newName))
    )
    connection.onDocumentFormatting(({ textDocument, options }) =>
      this.answer(textDocument.uri, [], (file) => service.formatting(file, options))
    )
    connection.onDocumentRangeFormatting(({ textDocument, range, options }) =>
      this.answer(textDocument.uri, [], (file) => service.formatting(file, options, range))
    )
    connection.onCompletion(({ textDocument, position }) =>
      this.answer(textDocument.uri, [], (file) => service.completion(file, position))
    )

    connection.onRequest("spell/compiled", ({ uri }: { uri: string }) =>
      this.answer(uri, null, (file) => service.compiled(file))
    )
    connection.onRequest("spell/project", ({ uri }: { uri: string }) =>
      this.answer(uri, null, (file) => service.projectInfo(file))
    )
    documents.onDidSave(({ document }) => this.compileOnSave(document.uri))

    documents.listen(connection)
    connection.listen()
  }

  /**
   * Ask the editor to tell us when `.imports.json` or `.spell` files change on disk, if it lets servers ask.
   * - Otherwise its extension has to set that up itself (`synchronize.fileEvents` in `vscode-languageclient`).
   */
  private watchFiles() {
    this.connection.client
      .register(DidChangeWatchedFilesNotification.type, {
        watchers: [{ globPattern: "**/.imports.json" }, { globPattern: "**/*.spell" }]
      })
      .catch(() => undefined)
  }

  /**
   * If the `spell.compileOnSave` setting is on, compile the project of saved document `uri` to its `.output.js`,
   * so a running app picks it up.
   * - Queued like a change, so it compiles what's been parsed.
   * - Off unless the editor tells us otherwise, or can't be asked.
   */
  private async compileOnSave(uri: string) {
    const settings = (await this.connection.workspace.getConfiguration("spell").catch(() => undefined)) as
      | { compileOnSave?: boolean }
      | undefined
    const file = this.workspace.fileFor(uri)
    if (!settings?.compileOnSave || !file) return
    this.enqueue(async () => {
      await file.project.compile()
      return []
    })
  }

  /**
   * Run `change` after every change before it, then publish diagnostics for the files it re-parsed.
   * - A change that throws is logged and skipped, so one bad edit doesn't stop the queue.
   */
  private enqueue(change: () => Promise<SP.SpellFile[]>) {
    this.#queue = this.#queue
      .then(change)
      .then((files) => this.publishSoon(files))
      .catch((error: unknown) => this.logError(error))
  }

  /**
   * Answer a request about document `uri` with `respond(file)`, once every change so far has been parsed.
   * - `fallback` if `uri` isn't a parsed spell file, or `respond()` throws (which is logged).
   */
  private async answer<T>(uri: string, fallback: T, respond: (file: SP.SpellFile) => T): Promise<T> {
    await this.#queue
    const file = this.workspace.fileFor(uri)
    if (!file?.match) return fallback
    try {
      return respond(file)
    } catch (error) {
      this.logError(error)
      return fallback
    }
  }

  /** Publish `files`' diagnostics after `PUBLISH_DELAY`, along with any others already waiting. */
  private publishSoon(files: SP.SpellFile[]) {
    files.forEach((file) => this.#toPublish.add(file))
    clearTimeout(this.#publishTimer)
    this.#publishTimer = setTimeout(() => this.publish(), SpellLanguageServer.PUBLISH_DELAY)
  }

  /** Publish diagnostics for every file waiting. */
  private publish() {
    const files = [...this.#toPublish]
    this.#toPublish.clear()
    for (const file of files) {
      this.connection
        .sendDiagnostics({ uri: this.workspace.uriFor(file), diagnostics: this.service.diagnostics(file) })
        .catch((error: unknown) => this.logError(error))
    }
  }

  /** Log `error` to the editor's output for this server -- NEVER stdout, which carries the protocol. */
  private logError(error: unknown) {
    this.connection.console.error(`spell: ${error instanceof Error ? error.stack : error}`)
  }
}

/** `LSP.DiskChange` for each `FileChangeType`. */
const DISK_CHANGES: Record<number, LSP.DiskChange> = {
  [FileChangeType.Created]: "created",
  [FileChangeType.Changed]: "changed",
  [FileChangeType.Deleted]: "deleted"
}
