/**
 * Run a project in a browser, in the `<spell-app>` element -- for `spell run` on a project that shows a UI.
 * - Serves a page holding `<spell-app src="app/<Name>.compiled.js" toolbar>`, and beside it what the element
 *   looks for (see `SpellAppElement`):
 *   - `app/<Name>.compiled.js`:  as compiled for this run, from memory -- nothing is written into the project
 *   - `app/<Name>.scopes.js`:  its scope pack, for the Type Explorer -- see `LSP.ScopePack`
 *   - `app/<Import>.compiled.js`:  each project it imports, from disk
 *   - `element/...`:  `app`'s `dist-element/` bundle -- built first if it isn't there, see `ensureElementBuilt()`
 * - Serves until `Ctrl-C` -- see `serve.ts`.
 */
import { spawn } from "child_process"
import { existsSync } from "fs"
import { resolve } from "path"
import { fileURLToPath } from "url"

import { SRV } from "$/server"
import environment from "$/spell/node/environment"
import { SP } from "$/spell"
import { LSP } from "$/lsp"
import { CLI } from "$/cli"

/** `app` -- the package with the `<spell-app>` element. */
const APP_DIR = resolve(environment.packagesDir, "app")
/** The element's bundle, `yarn build:element`'s output. */
const ELEMENT_DIR = resolve(APP_DIR, "dist-element")

/**
 * Serve `project` -- compiled, `outputFile.contents` -- in `<spell-app>`, and open it in a browser, until `Ctrl-C`.
 * - Returns the exit code.
 */
export async function runInBrowser(session: CLI.CliSession, project: SP.SpellProject): Promise<number> {
  await ensureElementBuilt(session)
  const name = project.projectName ?? "app"
  const compiled = project.outputFile.contents ?? ""
  // the explorer shows each imported project's own parse
  await session.workspace.track(project)
  for (const imported of LSP.ScopeExplorer.importedProjects(project)) await session.workspace.track(imported)
  const scopes = LSP.scopePackScript(session.explorer.exportPack(project))
  const imports = new Map(
    Object.entries(CLI.importedOutputs(project)).map(([id, url]) => [
      `/app/${id.slice(id.lastIndexOf(":") + 1)}${SP.COMPILED_JS_SUFFIX}`,
      fileURLToPath(url)
    ])
  )

  const element = CLI.folderRoute("/element/", ELEMENT_DIR)
  const { url, server } = await CLI.serve((path) => {
    if (path === "/") return { text: page(name), type: "text/html; charset=utf-8" }
    if (path === `/app/${name}${SP.COMPILED_JS_SUFFIX}`) return { text: compiled, type: "text/javascript" }
    if (path === `/app/${name}${SP.SCOPES_JS_SUFFIX}`) return { text: scopes, type: "text/javascript" }
    const imported = imports.get(path)
    if (imported) return { file: imported }
    return element(path)
  })
  session.out(url)
  session.err(`${name} shows a UI:  running it at ${url} -- Ctrl-C to stop`)
  SRV.openBrowser(url)
  await SRV.untilInterrupted(server)
  return CLI.EXIT.OK
}

/** The page:  just `<spell-app>`, filling the window. */
function page(name: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${name} · spell run</title>
<script type="module" src="element/spell-app.js"></script>
<style>html, body { margin: 0; min-height: 100%; }</style>
</head>
<body>
<spell-app src="app/${name}${SP.COMPILED_JS_SUFFIX}" toolbar></spell-app>
</body>
</html>
`
}

/**
 * Build `<spell-app>` -- `yarn build:element` in `app` -- if `dist-element/` isn't there yet, e.g. in a fresh
 * checkout.  Shows it as a status row:  it takes a while.
 * - Throws `CLI.CliError` with the build's last lines if it fails.
 */
async function ensureElementBuilt(session: CLI.CliSession): Promise<void> {
  if (existsSync(resolve(ELEMENT_DIR, "spell-app.js"))) return
  const status = new CLI.StatusReporter(session.isInteractive)
  const row = status.start("Building <spell-app> for the browser (once:  yarn build:element)")
  try {
    const { code, output } = await new Promise<{ code: number | null; output: string }>((done) => {
      const child = spawn("yarn", ["build:element"], { cwd: APP_DIR, stdio: ["ignore", "pipe", "pipe"] })
      let output = ""
      child.stdout.on("data", (data) => (output += data))
      child.stderr.on("data", (data) => (output += data))
      child.on("error", (error) => done({ code: 1, output: output + error.message }))
      child.on("exit", (code) => done({ code, output }))
    })
    if (code !== 0) {
      status.done(row, "failed")
      throw new CLI.CliError(`yarn build:element failed:\n${output.trim().split("\n").slice(-8).join("\n")}`)
    }
    status.done(row, "ok", session.relative(ELEMENT_DIR))
  } finally {
    status.finish()
  }
}
