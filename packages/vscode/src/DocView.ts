/**
 * The "Spell Docs" view:  a docs page, live from its page server, docked in the RIGHT side bar (VS Code's
 * secondary side bar), beside the editor AND the Claude tab, instead of taking an editor column.
 * - Where `DocPreview` shows pages by default (`spell.docPreview.location`:  `sidebar`):  `/spell-docs`,
 *   `yarn plan-doc open`, `/goals-open-vs`.
 * - A webview holding ONE iframe of the page's loopback URL, as Simple Browser does.  The page's own live reload
 *   runs inside it.
 * - Opened by hand, before anything was shown:  the docs index of the window's first folder (the repo root).
 * - Title-bar buttons:  docs index, reload, open in the browser.
 * - NOTE:  the iframe is cross-origin, so we never know where its links went:  reload and "open in browser" use the
 *   page last SHOWN, not the one now in view.
 * - NOTE:  the FIRST show in a window opens the side bar with focus on the view:  VS Code has no way to open a view
 *   without focusing it.  Later shows keep focus where it is.
 */
import { existsSync } from "fs"
import { join } from "path"
import * as vscode from "vscode"

/****************
 * ### `DocView`
 * The view's provider, and the page it shows.
 ****************/
export class DocView implements vscode.WebviewViewProvider {
  /** The view's id, as in `package.json` `contributes.views`. */
  static readonly ID = "spell.docView"

  /** The resolved view;  `undefined` until VS Code first shows it, and again once it's disposed. */
  static view: vscode.WebviewView | undefined

  /** URL of the page last shown, or asked for before the view resolved. */
  static url: string | undefined

  /** The docs index's URL, for the "docs index" button and the empty view;  set by `DocPreview`. */
  static home: (() => Promise<string | undefined>) | undefined

  /** Register the view and its title-bar commands -- call once, from `DocPreview.register()`. */
  static register(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(DocView.ID, new DocView(), {
        webviewOptions: { retainContextWhenHidden: true }
      }),
      vscode.commands.registerCommand("spell.docView.home", () => DocView.goHome()),
      vscode.commands.registerCommand("spell.docView.reload", () => DocView.url && DocView.show(DocView.url)),
      vscode.commands.registerCommand(
        "spell.docView.openExternal",
        () => DocView.url && vscode.env.openExternal(vscode.Uri.parse(DocView.url))
      )
    )
  }

  /**
   * Show `url` (a loopback page;  `DocPreview` stamps it with `?t=`, so each show reloads) in the view.
   * - not resolved yet:  opens it, and `resolveWebviewView()` renders `url`
   */
  static async show(url: string): Promise<void> {
    DocView.url = url
    if (!DocView.view) return void (await vscode.commands.executeCommand(`${DocView.ID}.focus`))
    DocView.render()
    DocView.view.show(true)
  }

  /** Show the docs index. */
  static async goHome(): Promise<void> {
    const url = await DocView.home?.()
    if (url) await DocView.show(url)
  }

  /** (Re)write the view's html for `DocView.url`:  a new `html` reloads the iframe. */
  static render(): void {
    const view = DocView.view
    if (view) view.webview.html = DocView.html(DocView.url)
  }

  /** The view's html:  the page in a full-size iframe, or a line saying there's nothing to show. */
  static html(url: string | undefined): string {
    const csp = "default-src 'none'; style-src 'unsafe-inline'; frame-src http://127.0.0.1:* http://localhost:*"
    const body = url
      ? `<iframe src="${escapeAttribute(url)}" allow="clipboard-read; clipboard-write"></iframe>`
      : `<p>No docs page yet:  <code>yarn docs:open --vs</code>, or <code>/spell-docs</code>.</p>`
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="${csp}" />
    <style>
      html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
      iframe { display: block; border: 0; width: 100%; height: 100%; background: white; }
      p { padding: 0 1em; }
    </style>
  </head>
  <body>${body}</body>
</html>`
  }

  /** VS Code shows the view:  render the page asked for, else the docs index. */
  async resolveWebviewView(view: vscode.WebviewView): Promise<void> {
    DocView.view = view
    view.onDidDispose(() => {
      if (DocView.view === view) DocView.view = undefined
    })
    DocView.url ??= await DocView.home?.()
    DocView.render()
  }
}

/** The docs index of the window's first folder (the repo root), `undefined` when it has none. */
export function docsIndex(): string | undefined {
  const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
  const file = root && join(root, "packages", "docs", "index.html")
  return file && existsSync(file) ? file : undefined
}

/** `text` safe inside a double-quoted html attribute. */
function escapeAttribute(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")
}
