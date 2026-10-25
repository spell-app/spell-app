/**
 * Run a project in a browser, in the `<spell-viewer>` element -- for `spell run` on a project that shows a UI.
 * - Serves a page holding `<spell-viewer src="app/<Name>.spell.js" toolbar>`, and beside it what the element
 *   looks for (see `SpellViewer`):
 *   - `app/<Name>.spell.js`:  as compiled for this run, from memory -- nothing is written into the project
 *   - `app/<Name>.scopes.js`:  its scope pack, for the Type Explorer -- see `LSP.ScopePack`
 *   - `app/<Name>.en.js`:  its words, for the Thing Explorer -- see `SP.SpellWords`
 *   - `app/<Import>.spell.js`:  each project it imports, from disk -- and its `.en.js`, if it has one
 *   - `element/...`:  `app`'s `dist-element/` bundle -- built first if it isn't there, see `ensureElementBuilt()`
 * - Serves until `Ctrl-C` -- see `serve.ts`.
 */
import { spawn } from "child_process"
import { existsSync } from "fs"
import { resolve } from "path"
import { fileURLToPath } from "url"

import { SRV } from "spell/server"
import environment from "spell-app/spaces/server/node/environment"
import { SP } from "spell-parser/spell"
import { LSP } from "spell-app/lsp"
import { CLI } from "spell-app/cli"

/** `app` -- the package with the `<spell-viewer>` element. */
const APP_DIR = resolve(environment.packagesDir, "app")
/** The element's bundle, `yarn build:element`'s output. */
const ELEMENT_DIR = resolve(APP_DIR, "dist-element")

/**
 * Serve `project` -- compiled, `outputFile.contents` -- in `<spell-viewer>`, and open it in a browser, until `Ctrl-C`.
 * - Returns the exit code.
 */
export async function runInBrowser(session: CLI.CliSession, project: SP.SpellProject): Promise<number> {
  await ensureElementBuilt(session)
  const name = project.projectName ?? "app"
  const compiled = project.outputFile.contents ?? ""
  // where the Type Explorer finds each declaration's code -- see `SP.SpellDeclarations`
  const declarations = project.declarationsFile.contents ?? ""
  // what the Thing Explorer labels members by, a file per language its files are in -- see `SP.SpellWords`
  const words = new Map<string, string>(
    project.wordsFiles.map((file) => [`/app/${file.location.file}`, file.contents ?? ""])
  )
  // the explorer shows each imported project's own parse
  await session.workspace.track(project)
  for (const imported of LSP.ScopeExplorer.importedProjects(project)) await session.workspace.track(imported)
  const scopes = LSP.scopePackScript(session.explorer.exportPack(project))
  const imports = new Map(
    Object.entries(CLI.importedOutputs(project)).flatMap(([id, url]) => {
      const name = id.slice(id.lastIndexOf("/") + 1)
      // its words are beside its spell files, not necessarily beside its compiled javascript
      const wordsPaths = new SP.SpellProject(id).wordsFiles.map((file) => file.location.serverPath)
      return [
        [`/app/${name}${SP.COMPILED_JS_SUFFIX}`, fileURLToPath(url)],
        // by its own name, in each of its languages:  `cards.en.js`
        ...wordsPaths.map((path) => [`/app/${path.slice(path.lastIndexOf("/") + 1)}`, path] as [string, string])
      ]
    })
  )

  const element = CLI.folderRoute("/element/", ELEMENT_DIR)
  const { url, server } = await CLI.serve((path) => {
    if (path === "/") return { text: page(name), type: "text/html; charset=utf-8" }
    if (path === `/app/${name}${SP.COMPILED_JS_SUFFIX}`) return { text: compiled, type: "text/javascript" }
    if (path === `/app/${name}${SP.SCOPES_JS_SUFFIX}`) return { text: scopes, type: "text/javascript" }
    if (path === `/app/${name}${SP.DECLARATIONS_JSON_SUFFIX}`) return { text: declarations, type: "application/json" }
    const ownWords = words.get(path)
    if (ownWords !== undefined) return { text: ownWords, type: "text/javascript" }
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

/** The page:  just `<spell-viewer>`, filling the window. */
function page(name: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${name} · spell run</title>
<script type="module" src="element/spell-viewer.js"></script>
<style>html, body { margin: 0; min-height: 100%; }</style>
</head>
<body>
<spell-viewer src="app/${name}${SP.COMPILED_JS_SUFFIX}" toolbar></spell-viewer>
</body>
</html>
`
}

/**
 * Build `<spell-viewer>` -- `yarn build:element` in `app` -- if `dist-element/` isn't there yet, e.g. in a fresh checkout.
 * - Shows it as a status row:  it takes a while.
 * - Throws `CLI.CliError` with the build's last lines if it fails.
 */
async function ensureElementBuilt(session: CLI.CliSession): Promise<void> {
  if (existsSync(resolve(ELEMENT_DIR, "spell-viewer.js"))) return
  const status = new CLI.StatusReporter(session.isInteractive)
  const row = status.start("Building <spell-viewer> for the browser (once:  yarn build:element)")
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
