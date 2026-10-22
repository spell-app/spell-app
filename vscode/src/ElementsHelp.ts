import { dirname } from "path"
import * as vscode from "vscode"

import { ElementCatalog } from "spell-kit/element-tools/jsx-help/ElementCatalog"
import { JsxElementHelp, type JsxFile } from "spell-kit/element-tools/jsx-help/JsxElementHelp"
import { ELEMENT_HELP_SOURCE } from "spell-kit/element-tools/tools.types"

/****************
 * ### `ElementsHelp`
 * Custom elements' slot, part and dashed-attribute help in `.tsx` and `.jsx` files,
 * beside the editor's own TypeScript (7):
 * - `slot="` completes the parent tag's slots;  `part="`, in a component's own folder, its parts
 * - a slot, part or dashed attribute the tag doesn't have is a warning, in the Problems list
 * - The checks are the kit's `JsxElementHelp`, bundled in:  this file only shows what it finds.
 *   It reads the JSX with TypeScript 6's JavaScript API, inside the extension:  the editor never sees it.
 * - The elements come from the Custom Elements Manifests of the file's own package and its dependencies
 *   (`ElementCatalog`):  one catalog per package, so an epic's worktree reads the worktree's manifests.
 * - A manifest is re-read when it changes:  a new `yarn site:data` shows at the next keystroke.
 * - NEVER breaks the editor:  a check that throws is logged to the "Spell Elements" output, and shows nothing.
 ****************/
export class ElementsHelp implements vscode.CompletionItemProvider {
  /** The warnings shown in the Problems list, by file. */
  readonly warnings = vscode.languages.createDiagnosticCollection(ELEMENT_HELP_SOURCE)

  /** Where to log:  the "Spell Elements" output. */
  readonly log = vscode.window.createOutputChannel("Spell Elements", { log: true })

  /**
   * Register the completions and the warnings for the window's JSX files, now and as they open and change.
   * - Disposed with the extension (`context.subscriptions`).
   */
  static register(context: vscode.ExtensionContext): ElementsHelp {
    const help = new ElementsHelp()
    context.subscriptions.push(
      help.warnings,
      help.log,
      vscode.languages.registerCompletionItemProvider(JSX_DOCUMENTS, help, ...TRIGGER_CHARACTERS),
      vscode.workspace.onDidOpenTextDocument((document) => help.check(document)),
      vscode.workspace.onDidChangeTextDocument(({ document }) => help.checkSoon(document)),
      vscode.workspace.onDidCloseTextDocument((document) => help.forget(document)),
      { dispose: () => help.timers.forEach((timer) => clearTimeout(timer)) }
    )
    for (const document of vscode.workspace.textDocuments) help.check(document)
    return help
  }

  ////////////////
  // ## Completions
  ////////////////

  /** The slots or parts to offer at `position`, first in the list;  none outside a `slot="..."` or `part="..."`. */
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem[] {
    const help = this.helpFor(document)
    const completions = help && this.safely(() => help.completionsAt(fileOf(document), document.offsetAt(position)))
    if (!completions) return []
    const range = new vscode.Range(
      document.positionAt(completions.start),
      document.positionAt(completions.start + completions.length)
    )
    return completions.names.map((doc, index) => {
      const item = new vscode.CompletionItem(
        { label: doc.name, description: completions.label },
        vscode.CompletionItemKind.Value
      )
      item.range = range
      item.sortText = String(index).padStart(4, "0")
      item.detail = `${completions.kind} "${doc.name}" of ${completions.label}`
      if (doc.description) item.documentation = new vscode.MarkdownString(doc.description)
      return item
    })
  }

  ////////////////
  // ## Warnings
  ////////////////

  /** Show `document`'s warnings now;  a document that isn't a JSX file on disk is skipped. */
  check(document: vscode.TextDocument): void {
    const help = this.helpFor(document)
    if (!help) return
    const found = this.safely(() => help.warningsFor(fileOf(document))) ?? []
    this.warnings.set(
      document.uri,
      found.map((warning) => {
        const range = new vscode.Range(
          document.positionAt(warning.start),
          document.positionAt(warning.start + warning.length)
        )
        const diagnostic = new vscode.Diagnostic(range, warning.message, vscode.DiagnosticSeverity.Warning)
        diagnostic.source = ELEMENT_HELP_SOURCE
        diagnostic.code = warning.code
        return diagnostic
      })
    )
  }

  /** Show `document`'s warnings once typing pauses (`CHECK_DELAY`). */
  checkSoon(document: vscode.TextDocument): void {
    if (!isJsxDocument(document)) return
    const key = document.uri.toString()
    clearTimeout(this.timers.get(key))
    this.timers.set(
      key,
      setTimeout(() => {
        this.timers.delete(key)
        this.check(document)
      }, CHECK_DELAY)
    )
  }

  /** `document` closed:  drop its warnings and any pending check. */
  forget(document: vscode.TextDocument): void {
    const key = document.uri.toString()
    clearTimeout(this.timers.get(key))
    this.timers.delete(key)
    this.warnings.delete(document.uri)
  }

  ////////////////
  // ## Catalogs
  ////////////////

  /**
   * The help for `document`, from the catalog of its package (the nearest folder above it with a `package.json`).
   * - `undefined` for a document that isn't a `.tsx` / `.jsx` file on disk, or is in no package.
   */
  private helpFor(document: vscode.TextDocument): JsxElementHelp | undefined {
    if (!isJsxDocument(document)) return undefined
    const packageFolder = ElementCatalog.packageFolderFor(dirname(document.uri.fsPath))
    if (!packageFolder) return undefined
    let help = this.helps.get(packageFolder)
    if (!help) {
      const catalog = new ElementCatalog({ from: packageFolder, log: (message) => this.log.warn(message) })
      this.log.info(`${packageFolder}:  manifests ${catalog.manifestFiles.join(", ") || "none"}`)
      help = new JsxElementHelp({ catalog })
      this.helps.set(packageFolder, help)
    }
    return help
  }

  /** `work()`'s result, or `undefined` when it throws:  logged, never shown. */
  private safely<T>(work: () => T): T | undefined {
    try {
      return work()
    } catch (error) {
      this.log.error(`failed:  ${(error as Error).stack ?? error}`)
      return undefined
    }
  }

  /** The help of each package, by its folder. */
  private helps = new Map<string, JsxElementHelp>()

  /** Pending checks, by document URI. */
  private timers = new Map<string, ReturnType<typeof setTimeout>>()
}

////////////////
// ## Helpers
////////////////

/** The documents this helps with:  JSX files on disk. */
const JSX_DOCUMENTS: vscode.DocumentSelector = [
  { scheme: "file", language: "typescriptreact" },
  { scheme: "file", language: "javascriptreact" }
]

/** Typing these may open a `slot="..."` or `part="..."` value:  ask for completions. */
const TRIGGER_CHARACTERS = ['"', "'", "="]

/** How long to wait after the last edit before checking a document again, in msec. */
const CHECK_DELAY = 300

/** Whether `document` is a `.tsx` or `.jsx` file on disk. */
function isJsxDocument(document: vscode.TextDocument): boolean {
  return document.uri.scheme === "file" && JsxElementHelp.isJsxFile(document.uri.fsPath)
}

/** `document` as the help reads it:  its path, and its text as it is in the editor, saved or not. */
function fileOf(document: vscode.TextDocument): JsxFile {
  return { fileName: document.uri.fsPath, text: document.getText() }
}
