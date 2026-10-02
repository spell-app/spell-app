import { spawn, type ChildProcess } from "child_process"
import { rmSync, writeFileSync } from "fs"
import { join, resolve } from "path"

import { SRV } from "$/server"
import { PageServer } from "$/server/page"
import environment from "$/spell/node/environment"
import { SP } from "$/spell"
import { CLI } from "$/cli"

/** `app` -- the spell app, its editor UI and its server. */
const APP_DIR = resolve(environment.packagesDir, "app")

/** This checkout:  the page server's root. */
const REPO_ROOT = resolve(environment.packagesDir, "..")

/** Where `spell serve` records the editor for the page server's `/editor` (`app`'s `appRoutes.ts` `EDITOR_FILE`). */
const EDITOR_FILE = join(REPO_ROOT, ".spell-server.editor.json")

/** How long to wait for both servers to answer. */
const START_TIMEOUT_MS = 90_000

/**
 * `spell serve [target]`:  run EVERYTHING -- the spell app's editor, and the page server with the app's API, docs,
 * plans, goals and Spell UI -- and open the editor in a browser.
 * - The PAGE SERVER of this checkout (`yarn server`, `$/server/page`), started if it isn't running:  the app's
 *   `/api` is one of its route modules (`app`'s `appRoutes.ts`), beside docs, plans, goals and `/ui/`.
 * - The editor UI:  vite (`yarn start:dev` in `packages/app`), with hot reload, on `--port` (default 3000);  it passes
 *   `/api` on to the page server.  Recorded in `.spell-server.editor.json`, so the site header's "Editor" finds it.
 * - Stops no other servers, and runs no `yarn install`.
 * - `target`:  opens the editor on it, e.g. `@examples/Solitaire`.  No target:  the project here, if the app knows
 *   its root -- else the app's project chooser.  Only projects in the app's roots open:  not a `@workspace` folder.
 * - `--headless`:  no browser, just the URL.  Their output shows with `--verbose`, or if one fails.
 * - Runs until `Ctrl-C`, then stops vite -- and the page server, if it started it.  Returns the exit code.
 */
export async function serveCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.ServeOptions
): Promise<number> {
  const port = options.port ?? environment.vitePort
  if (!Number.isInteger(port) || port < 1 || port > 65_534) throw new CLI.CliError(`--port must be a port number`)
  // `::`, every interface:  vite listens on 0.0.0.0
  if (!(await SRV.isFree(port, "::"))) {
    throw new CLI.CliError(
      `Port ${port} is in use -- \`spell serve --port <another>\`, or \`yarn stop\` in packages/app`
    )
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

  // vite's proxy reaches the page server by IP:  `localhost` may be ::1 first, where it doesn't listen
  const env = { ...process.env, VITE_PORT: String(port), PORT: String(page.port), API_SERVER: "127.0.0.1" }
  const servers: Server[] = [
    start("editor (vite)", ["start:dev", "--port", String(port), "--strictPort"], env, options.verbose)
  ]
  writeFileSync(EDITOR_FILE, `${JSON.stringify({ url: `http://localhost:${port}/`, pid: process.pid }, null, 2)}\n`)
  const stopAll = () => {
    servers.forEach(({ child }) => stop(child))
    rmSync(EDITOR_FILE, { force: true })
  }
  process.once("exit", stopAll)

  const row = status.start(`Starting the editor on port ${port}`)
  try {
    await Promise.race([
      Promise.all([answers(`http://localhost:${port}/`), answers(`${page.base}/hello`)]),
      ...servers.map(({ exited }) => exited)
    ])
    status.done(row, "ok", `/api on the page server, ${page.base}`)
  } catch (error) {
    status.done(row, "failed", error instanceof Error ? error.message : String(error))
    status.finish()
    stopAll()
    for (const { name, output } of servers) if (output.text) session.err(`--- ${name}\n${tail(output.text)}`)
    return CLI.EXIT.ERRORS
  }
  status.finish()

  const url = `http://localhost:${port}${path}`
  session.out(url)
  session.err(`The spell app is at ${url};  docs, plans, goals and Spell UI at ${page.base}/ -- Ctrl-C to stop`)
  if (!options.headless) SRV.openBrowser(url)

  // until Ctrl-C -- or a server stops by itself
  const stopped = await Promise.race([
    new Promise<undefined>((done) => {
      process.once("SIGINT", () => done(undefined))
      process.once("SIGTERM", () => done(undefined))
    }),
    ...servers.map(({ exited }) =>
      exited.then(
        () => undefined,
        (error: Error) => error
      )
    )
  ])
  stopAll()
  if (page.launched) await new SRV.PidFile(REPO_ROOT).stop()
  if (!stopped) return CLI.EXIT.OK
  session.err(
    `${stopped.message}${servers.map(({ output }) => (output.text ? `\n${tail(output.text)}` : "")).join("")}`
  )
  return CLI.EXIT.ERRORS
}

/**
 * One server process.
 * - `exited`:  rejects when it stops, saying so -- it never resolves:  servers don't finish
 * - `output`:  what it printed, kept for when something goes wrong
 */
type Server = { name: string; child: ChildProcess; exited: Promise<never>; output: { text: string } }

/** Start `yarn <args...>` in `app`, in its own process group -- so `stop()` stops what it starts, too. */
function start(name: string, args: string[], env: NodeJS.ProcessEnv, verbose?: boolean): Server {
  const child = spawn("yarn", args, { cwd: APP_DIR, env, detached: true, stdio: ["ignore", "pipe", "pipe"] })
  const output = { text: "" }
  const collect = (data: Buffer) => {
    output.text += data
    if (verbose) process.stderr.write(data)
  }
  child.stdout!.on("data", collect)
  child.stderr!.on("data", collect)
  const exited = new Promise<never>((_done, fail) => {
    child.on("error", (error) => fail(new Error(`The ${name} didn't start:  ${error.message}`)))
    child.on("exit", (code) => fail(new Error(`The ${name} stopped (exit code ${code})`)))
  })
  // nothing may be waiting on it yet
  exited.catch(() => {})
  return { name, child, exited, output }
}

/** Stop `child` and everything it started:  its whole process group. */
function stop(child: ChildProcess): void {
  if (child.exitCode !== null || !child.pid) return
  try {
    process.kill(-child.pid, "SIGTERM")
  } catch {
    // already gone
  }
}

/** Resolve once `url` answers at all, checking every 250ms -- or reject after `START_TIMEOUT_MS`. */
async function answers(url: string): Promise<void> {
  const started = Date.now()
  for (;;) {
    try {
      await fetch(url)
      return
    } catch {
      if (Date.now() - started > START_TIMEOUT_MS) throw new Error(`Nothing answered at ${url}`)
      await new Promise((done) => setTimeout(done, 250))
    }
  }
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

/** The last lines of `text`. */
function tail(text: string, lines = 12): string {
  return text.trimEnd().split("\n").slice(-lines).join("\n")
}
