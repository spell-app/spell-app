/**
 * The "Spell Tree" view, in the right side bar under "Spell Docs":  the spell tree of the line the cursor is on, drawn
 * by `<ui-tree-diagram>` -- what the line MEANS, as the compiler's writers see it.
 * - Shown by `spell.showLineTree` ("Spell:  Show Tree for This Line":  the command palette, or the editor's
 *   right-click menu);  then follows the cursor in spell files whenever it's visible.
 * - The tree comes from the language server (`spell/lineTree`):  the file as last parsed, so unsaved edits show.
 * - Draws with the docs bundle, `packages/docs/tools/_assets/spell-ui.js`:  ONE classic script holding every
 *   `<ui-*>` element, so the webview needs nothing else.  The view's own script sets the element's `tree` from each
 *   `{ spell: "tree", tree }` message.
 */
import { randomBytes } from "crypto"
import { resolve } from "path"
import * as vscode from "vscode"
import type { LanguageClient } from "vscode-languageclient/node"

/** How long the cursor rests on a line before its tree is asked for, in ms:  typing shouldn't ask per key. */
const FOLLOW_DELAY = 200

/****************
 * ### `TreeView`
 * Provides the "Spell Tree" webview view, and keeps it on the cursor's line.
 ****************/
export class TreeView implements vscode.WebviewViewProvider {
  /** The view's id, as in `package.json`'s `views`. */
  static readonly id = "spell.treeView"

  /** The resolved view, once VS Code has shown it. */
  declare view: vscode.WebviewView | undefined
  /** The line last drawn, `<uri>#<line>`:  a cursor move within it asks for nothing. */
  declare shown: string | undefined
  /** Pending `follow()` timer. */
  declare timer: ReturnType<typeof setTimeout> | undefined

  constructor(
    /** Client asking the language server for each tree. */
    readonly client: LanguageClient,
    /** The `_assets` folder holding the docs bundle. */
    readonly assets: vscode.Uri
  ) {}

  /** Register the view, its command, and its cursor-following. */
  static register(context: vscode.ExtensionContext, client: LanguageClient, repoRoot: string): void {
    const assets = vscode.Uri.file(resolve(repoRoot, "packages/docs/tools/_assets"))
    const treeView = new TreeView(client, assets)
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(TreeView.id, treeView),
      vscode.commands.registerCommand("spell.showLineTree", () => treeView.reveal()),
      vscode.window.onDidChangeTextEditorSelection(({ textEditor }) => treeView.follow(textEditor)),
      vscode.window.onDidChangeActiveTextEditor((editor) => editor && treeView.follow(editor)),
      vscode.workspace.onDidChangeTextDocument(({ document }) => {
        if (document === vscode.window.activeTextEditor?.document) treeView.follow(vscode.window.activeTextEditor, true)
      })
    )
  }

  /** VS Code shows the view:  build its html, then draw the cursor's line. */
  resolveWebviewView(view: vscode.WebviewView): void {
    this.view = view
    view.webview.options = { enableScripts: true, localResourceRoots: [this.assets] }
    view.webview.html = this.html(view.webview)
    view.onDidChangeVisibility(() => view.visible && void this.update(true))
    view.onDidDispose(() => (this.view = undefined))
    void this.update(true)
  }

  /** `spell.showLineTree`:  show the view, and the tree of the cursor's line. */
  async reveal(): Promise<void> {
    await vscode.commands.executeCommand(`${TreeView.id}.focus`)
    await this.update(true)
  }

  /**
   * The cursor moved in `editor` (or, `force`, its text changed):  draw its line, after `FOLLOW_DELAY`.
   * - Only while the view is visible, and only for spell files.
   */
  follow(editor: vscode.TextEditor, force = false): void {
    if (!this.view?.visible || editor.document.languageId !== "spell") return
    clearTimeout(this.timer)
    this.timer = setTimeout(() => void this.update(force), FOLLOW_DELAY)
  }

  /**
   * Ask the language server for the active spell editor's cursor line, and draw it -- unless it's the line already
   * drawn (`force`:  draw anyway).
   * - NEVER throws:  a failed request draws nothing, and logs.
   */
  async update(force = false): Promise<void> {
    const editor = vscode.window.activeTextEditor
    if (!this.view || !editor || editor.document.languageId !== "spell") return
    const uri = editor.document.uri.toString()
    const line = editor.selection.active.line
    const key = `${uri}#${line}`
    if (!force && key === this.shown) return
    this.shown = key
    try {
      const tree = await this.client.sendRequest("spell/lineTree", { uri, line })
      void this.view.webview.postMessage({ spell: "tree", tree })
    } catch (error) {
      console.error("TreeView.update():  spell/lineTree failed", error)
    }
  }

  /**
   * The view's html:  the docs bundle, an empty `<ui-tree-diagram>`, a hint for when there's no tree, and the script
   * that sets the tree from our messages.
   * - CSP:  scripts from `assets` (the bundle and its lazy chunks) and our one inline script, by nonce;  inline
   *   styles (the `<ui-*>` elements set them).
   */
  html(webview: vscode.Webview): string {
    const nonce = randomBytes(16).toString("base64")
    const source = webview.cspSource
    const csp = [
      "default-src 'none'",
      `script-src ${source} 'nonce-${nonce}'`,
      `style-src ${source} 'unsafe-inline'`,
      `font-src ${source} data:`,
      `img-src ${source} data:`,
      `connect-src ${source}`
    ].join("; ")
    const bundle = webview.asWebviewUri(vscode.Uri.joinPath(this.assets, "spell-ui.js")).toString()
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="${csp}" />
    <style>
      body { background: var(--vscode-sideBar-background); color: var(--vscode-foreground); padding: 8px; }
      #hint { color: var(--vscode-descriptionForeground); font-family: var(--vscode-font-family); }
    </style>
  </head>
  <body>
    <p id="hint">Put the cursor on a line of spell to see its tree.</p>
    <ui-tree-diagram id="tree" hidden></ui-tree-diagram>
    <script src="${bundle}"></script>
    <script nonce="${nonce}">
      const diagram = document.getElementById("tree")
      const hint = document.getElementById("hint")
      window.addEventListener("message", ({ data }) => {
        if (data?.spell !== "tree") return
        diagram.tree = data.tree ?? undefined
        diagram.hidden = !data.tree
        hint.hidden = !!data.tree
      })
    </script>
  </body>
</html>`
  }
}
