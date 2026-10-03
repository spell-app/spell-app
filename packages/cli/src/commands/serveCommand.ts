import { readFileSync } from "fs"
import { join, resolve } from "path"

import { SRV } from "$/server"
import { PageServer } from "$/server/page"
import environment from "$/spell/node/environment"
import { SP } from "$/spell"
import { CLI } from "$/cli"

/** This checkout:  the page server's root. */
const REPO_ROOT = resolve(environment.packagesDir, "..")

/** Where the page server records its editor (`app`'s `EditorServer.ts` `EDITOR_FILE`). */
const EDITOR_FILE = join(REPO_ROOT, ".spell-server.editor.json")

/** How long to wait for the editor to answer:  vite may be building its dependency cache. */
const START_TIMEOUT_MS = 90_000

/**
 * `spell serve [target]`:  run EVERYTHING -- the page server of this checkout, with the app's API, the editor UI,
 * docs, epics, goals and Spell UI -- and open the editor in a browser.
 * - The PAGE SERVER (`yarn server`, `$/server/page`), started if it isn't running.  The editor is ITS child:  `app`'s
 *   route module starts vite once the page server listens, and stops it with the page server (`EditorServer.ts`),
 *   so `yarn server` alone runs it too.  This waits for the editor's record (`.spell-server.editor.json`) to answer.
 * - `--port`:  the editor's port, for a page server this STARTS (`SPELL_EDITOR_PORT`);  one already running keeps
 *   its editor where it is.  Default 3000, else any free port.
 * - Stops no other servers, and runs no `yarn install`.
 * - `target`:  opens the editor on it, e.g. `@examples/Solitaire`.  No target:  the project here, if the app knows
 *   its root -- else the app's project chooser.  Only projects in the app's roots open:  not a `@workspace` folder.
 * - `--headless`:  no browser, just the URL.
 * - Runs until `Ctrl-C`, then stops the page server (and so the editor) -- if it started it.  Returns the exit code.
 */
export async function serveCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.ServeOptions
): Promise<number> {
  if (options.port !== undefined) {
    const port = options.port
    if (!Number.isInteger(port) || port < 1 || port > 65_534) throw new CLI.CliError(`--port must be a port number`)
    // the port is ours to choose only for a page server we're about to start;  `::`:  vite listens on 0.0.0.0
    if (!(await new SRV.PidFile(REPO_ROOT).status()) && !(await SRV.isFree(port, "::"))) {
      throw new CLI.CliError(`Port ${port} is in use -- \`spell serve --port <another>\``)
    }
    // a page server started below inherits it:  `PageServer.ensure()` passes our environment on
    process.env.SPELL_EDITOR_PORT = String(port)
  }
  const path = await pathFor(session, args[0])

  const status = new CLI.StatusReporter(session.isInteractive)
  const pageRow = status.start("Starting the page server")
  let page: Awaited<ReturnType<typeof PageServer.ensure>>
  try {
    page = await PageServer.ensure(REPO_ROOT)
    status.done(pageRow, "ok", `${page.base}/${page.launched ? "" : "  (already running)"}`)
  } catch (error) {
    status.done(pageRow, "failed", error instanceof Error ? error.message : String(error))
    status.finish()
    return CLI.EXIT.ERRORS
  }

  const row = status.start("Starting the editor")
  const editor = await editorUrl()
  if (!editor) {
    const why = page.launched
      ? "see .spell-server.editor.log"
      : "the page server was already running without one -- restart it:  `yarn server stop`, then `spell serve`"
    status.done(row, "failed", `the editor didn't answer:  ${why}`)
    status.finish()
    if (page.launched) await new SRV.PidFile(REPO_ROOT).stop()
    return CLI.EXIT.ERRORS
  }
  status.done(row, "ok", `${editor}  (/api on the page server)`)
  status.finish()
  if (options.port !== undefined && !editor.includes(`:${options.port}/`)) {
    session.err(`The editor was already running at ${editor}:  --port applies to a page server this starts`)
  }

  const url = new URL(path, editor).href
  session.out(url)
  session.err(`The spell app is at ${url};  docs, epics, goals and Spell UI at ${page.base}/ -- Ctrl-C to stop`)
  if (!options.headless) SRV.openBrowser(url)

  // until Ctrl-C.  The timer keeps node alive meanwhile:  the servers are the page server's children, not ours, so
  // nothing else would -- and node quits a pending top-level await with exit code 13
  const keepAlive = setInterval(() => {}, 1 << 30)
  await new Promise<void>((done) => {
    process.once("SIGINT", () => done())
    process.once("SIGTERM", () => done())
  })
  clearInterval(keepAlive)
  if (page.launched) await new SRV.PidFile(REPO_ROOT).stop()
  return CLI.EXIT.OK
}

/** The editor's URL once the page server has recorded it and it answers -- `undefined` after `START_TIMEOUT_MS`. */
async function editorUrl(): Promise<string | undefined> {
  const started = Date.now()
  while (Date.now() - started < START_TIMEOUT_MS) {
    try {
      const { url } = JSON.parse(readFileSync(EDITOR_FILE, "utf8")) as { url: string }
      await fetch(url, { signal: AbortSignal.timeout(2000) })
      return url
    } catch {
      await new Promise((done) => setTimeout(done, 250))
    }
  }
  return undefined
}

/**
 * Where in the app to open `arg`:  its editor URL, e.g. `/edit/examples/Solitaire` -- see `SpellLocation.editorUrl`.
 * - No `arg`:  the project here, if it's in one of the app's roots -- else `/`, the project chooser.
 * - A project the app can't reach -- in a `@workspace` folder -- says so, and opens the chooser.
 */
async function pathFor(session: CLI.CliSession, arg: string | undefined): Promise<string> {
  if (arg === undefined && !CLI.projectDirAbove(process.cwd())) return "/"
  const target = await CLI.resolveTarget(arg ?? CLI.WORKSPACE_ARG)
  const path =
    target.kind === "file"
      ? target.file.path
      : target.kind === "project"
        ? target.project.projectId
        : target.projectIds[0]?.replace(/:[^:]*$/, "")
  if (!path) return "/"
  const location = new SP.SpellLocation(path)
  if (location.owner === CLI.WORKSPACE_ARG) {
    session.err(
      `The app only opens projects in its roots (\`spell projects\`):  not ${target.arg} -- opening the chooser`
    )
    return "/"
  }
  return location.editorUrl
}
