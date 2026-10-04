/**
 * Side bar links, on the page server:  a ROUTE MODULE (`$/server/page`'s `RouteModule`), listed in the repo root's
 * `package.json` `"pageServer": { "routes": [...] }`.
 * - Why:  the Claude panel in VS Code follows only http(s) and file links;  a `vscode://...doc-preview` link does
 *   nothing there.  So the link Claude gives goes through the page server, which asks the VS Code window to show the
 *   page in its "Spell Docs" view (the right side bar).
 * - `GET /api/docs/show?path=<url path>[&window=<pid>][&hash=<id>][&view=review][&in=browser]` -- what
 *   `yarn docs:link` prints
 *   - `view=review`:  in the side bar's "Review" tab;  else its "Spell Docs" tab
 *   - `path`:  the page's URL path on this server (`/packages/docs/...`, `/worktrees/<w>/...`), mapped to its file
 *     through the server's mounts;  only `.html`
 *   - `window`:  the VS Code window's pid (its registry entry, `scripts/window.mjs`);  gone (reloaded), or not given:
 *     the window holding the page's checkout, else any
 *   - `in=browser`:  in Chrome instead, in front, reusing the page's tab.  Why through here:  the Claude panel opens
 *     a plain `localhost` link in a VS Code tab, not the browser
 *   - answers a tiny page that closes its own tab (a tab opened from outside, one history entry, may), then brings
 *     VS Code back to the front (macOS)
 *   - refused unless the browser says the user started it (`Sec-Fetch-Site:  none`) or it's our own page:  another
 *     site can't make VS Code jump with an `<img src>`
 */
import { spawn } from "node:child_process"
import { sep } from "node:path"

import { SRV } from "$/server"
import type { RouteModule } from "$/server/page"

import { Window } from "../../../scripts/window.mjs"
import { openUrlInChrome } from "./pages.js"

/** How long after answering before VS Code is brought forward, in ms:  the tab closes first. */
const FOCUS_DELAY = 300

const showRoutes: RouteModule = {
  name: "show",
  setup({ router, web }) {
    router.get("/api/docs/show", async (request, reply) => {
      const site = request.get("sec-fetch-site")
      if (site && site !== "none" && site !== "same-origin") throw new SRV.HttpError(403, "not from a link you clicked")
      const path = String(request.query.path ?? "")
      const file = pageFile(web.files, path)
      const hash = typeof request.query.hash === "string" && request.query.hash ? request.query.hash : undefined
      if (request.query.in === "browser") {
        const key = path.slice(Math.max(0, path.indexOf("/packages/")))
        openUrlInChrome(`http://${request.get("host")}${path}${hash ? `#${hash}` : ""}`, key, { front: true })
        return void reply.set("Cache-Control", "no-store").send(closingPage(path, "Chrome"))
      }
      const window = pickWindow(Number(request.query.window), file)
      if (!window) throw new SRV.HttpError(404, "no VS Code window with the spell extension is open")
      const review = request.query.view === "review"
      await Window.request("show-doc", { file, ...(hash && { hash }), ...(review && { view: "review" }) }, window)
      reply
        .set("Cache-Control", "no-store")
        .send(closingPage(path, `VS Code's side bar (${review ? "Review" : "Spell Docs"})`))
      if (process.platform === "darwin") setTimeout(focusVSCode, FOCUS_DELAY)
    })
  }
}

export default showRoutes

/**
 * The `.html` file URL path `path` names, through the server's mounts.
 * - 400:  not a path, or not a page;  404:  missing;  403:  outside every mount
 */
export function pageFile(files: SRV.StaticHandler, path: string): string {
  if (!path.startsWith("/")) throw new SRV.HttpError(400, "no path")
  const resolved = files.resolve(path)
  if (!resolved) throw new SRV.HttpError(403, `not served here:  ${path}`)
  if ("redirect" in resolved || ("file" in resolved && !resolved.file.endsWith(".html")))
    throw new SRV.HttpError(400, `not a page:  ${path}`)
  if ("status" in resolved) throw new SRV.HttpError(resolved.status, resolved.message)
  return resolved.file
}

/**
 * The window to show `file` in:  the one with pid `pid`, if it's alive;  else the one whose folders hold `file`
 * deepest (a worktree's window for a worktree's page);  else any.
 */
export function pickWindow(pid: number, file: string, entries: Map<number, WindowEntry> = Window.entries()) {
  if (entries.has(pid)) return entries.get(pid)
  let best: WindowEntry | undefined
  let bestLength = -1
  for (const entry of entries.values()) {
    for (const folder of entry.folders ?? []) {
      const inside = file.startsWith(folder + sep)
      if (inside && folder.length > bestLength) [best, bestLength] = [entry, folder.length]
    }
  }
  return best ?? entries.values().next().value
}

/** A page that closes its own tab;  if the browser won't let it, it says where the page went (`where`). */
function closingPage(path: string, where: string): string {
  const text = path.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  return `<!doctype html><meta charset="utf-8"><title>Shown in VS Code</title>
<body style="font:14px system-ui;margin:2em;color:#555">
<p>Shown in ${where}:  <code>${text}</code>.</p><p>You can close this tab.</p>
<script>window.close()</script>`
}

/** Bring VS Code to the front (macOS):  the window the page went to is the one last used. */
function focusVSCode(): void {
  spawn("open", ["-b", "com.microsoft.VSCode"], { stdio: "ignore", detached: true }).unref()
}

/** A window's registry entry, as `scripts/window.mjs` writes it. */
export type WindowEntry = { pid: number; port: number; token: string; folders?: string[]; workspaceFile?: string }
