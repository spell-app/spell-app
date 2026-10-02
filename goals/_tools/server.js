/**
 * The goals server:  `yarn goals serve` (foreground) or `yarn goals server start` (background).
 * - Serves the project's files, so goals pages, their assets and the code they link to all load over http.
 * - Live pages:  `/api/events` (server-sent events) says which file changed;  `goals-live.js` reloads the page.
 * - Writes and launches for the pages' buttons:  save a thought, start a Claude session in a terminal window, log
 *   in to Claude, open the page in VS Code.
 * - Safety:  listens on 127.0.0.1 only;  refuses any other `Host` (DNS rebinding);  every POST needs this run's
 *   token, which only pages it served carry (`window.GOALS_SERVER`), and a same-origin `Origin`;  never serves
 *   dot-files or anything outside the project root;  only resolved targets and known skills reach a command line.
 */
import { randomBytes } from "node:crypto"
import { existsSync, readFileSync, rmSync, statSync, watch, writeFileSync } from "node:fs"
import { createServer } from "node:http"
import { extname, join, relative, resolve, sep } from "node:path"
import { pathToFileURL } from "node:url"

import { DOCS } from "../../packages/docs/scripts/pages.js"
import { addThought } from "./goals.js"
import {
  LaunchError,
  SERVER_FILE,
  SKILLS,
  claudeCommand,
  claudePath,
  claudeStatus,
  openInVSCode,
  quote,
  runInTerminal
} from "./launch.js"
import { GoalsError } from "./page.js"
import { GOALS, ROOT, TargetError, preferences, resolveTarget } from "./targets.js"

/** Content types by extension;  anything else is served as plain text. */
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".woff2": "font/woff2"
}

/** Files whose changes reload pages:  pages and what they load. */
const LIVE = /\.(html|css|js)$/

/** Biggest POST body accepted. */
const MAX_BODY = 64 * 1024

/** How long Claude's status is trusted before asking again, in ms. */
const STATUS_TTL = 20_000

/**
 * Start the server on `port`;  resolves once it listens.
 * - SIDE EFFECT:  writes `goals/.server.json` (removed on exit), watches the goals folder and the docs' assets
 */
export function startServer({ port }) {
  const token = randomBytes(16).toString("hex")
  const origins = [`http://127.0.0.1:${port}`, `http://localhost:${port}`]
  const hosts = origins.map((origin) => origin.replace("http://", ""))
  const clients = new Set()
  let claudeCache

  const server = createServer((request, response) => {
    handle(request, response).catch((error) => send(response, 500, { error: String(error?.message ?? error) }))
  })
  return new Promise((done, fail) => {
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE")
        console.error(`goals server:  port ${port} is taken (server.port in the preferences)`)
      fail(error)
    })
    server.listen(port, "127.0.0.1", () => {
      writeFileSync(
        SERVER_FILE,
        JSON.stringify({ pid: process.pid, port, goals: GOALS, started: new Date().toISOString() })
      )
      watchFiles()
      for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, stop)
      console.log(`goals server:  http://127.0.0.1:${port}/${relative(ROOT, join(GOALS, "index.html"))}`)
      done(server)
    })
  })

  /** One request:  the API, or a file. */
  async function handle(request, response) {
    if (!hosts.includes(request.headers.host ?? "")) return send(response, 403, { error: "unknown host" })
    const url = new URL(request.url ?? "/", origins[0])
    if (url.pathname.startsWith("/api/")) return api(request, response, url)
    if (request.method !== "GET" && request.method !== "HEAD") return send(response, 405, { error: "GET only" })
    if (url.pathname === "/") return redirect(response, `/${relative(ROOT, join(GOALS, "index.html"))}`)
    return file(response, url.pathname)
  }

  /** The API. */
  async function api(request, response, url) {
    const route = `${request.method} ${url.pathname}`
    if (route === "GET /api/ping") return send(response, 200, { ok: true, goals: GOALS, root: ROOT, pid: process.pid })
    if (route === "GET /api/events") return events(response)
    if (route === "GET /api/claude") return send(response, 200, claude(true))
    if (request.method !== "POST") return send(response, 404, { error: `no ${route}` })
    if (request.headers["x-goals-token"] !== token) return send(response, 403, { error: "bad token:  reload the page" })
    const origin = request.headers.origin
    if (origin && !origins.includes(origin)) return send(response, 403, { error: "wrong origin" })
    const body = await json(request)
    const prefs = preferences()
    try {
      switch (url.pathname) {
        case "/api/thought": {
          const target = resolveTarget(body.target ?? "", prefs)
          const id = addThought(target, String(body.text ?? ""))
          return send(response, 200, { ok: true, id: id.toUpperCase(), target: target.name })
        }
        case "/api/run": {
          if (!SKILLS.includes(body.skill)) return send(response, 400, { error: `no skill "${body.skill}"` })
          const target = resolveTarget(body.target ?? "", prefs)
          const status = claude(false)
          if (!status.installed) return send(response, 409, { needs: "install", status })
          if (!status.loggedIn) return send(response, 409, { needs: "login", status })
          const line = claudeCommand(body.skill, target.name, prefs)
          return send(response, 200, { ok: true, how: runInTerminal(line, prefs), command: line })
        }
        case "/api/claude/login": {
          const line = `${quote(claudePath(prefs) ?? prefs.claude.command)} auth login`
          claudeCache = undefined
          return send(response, 200, { ok: true, how: runInTerminal(line, prefs), command: line })
        }
        case "/api/open-vscode": {
          const target = resolveTarget(body.target ?? "", prefs)
          openInVSCode(`${origins[0]}${target.path}`, target.file)
          return send(response, 200, { ok: true })
        }
        default:
          return send(response, 404, { error: `no ${route}` })
      }
    } catch (error) {
      if (error instanceof TargetError) return send(response, 404, { error: error.message, choices: error.choices })
      if (error instanceof LaunchError) return send(response, 501, { error: error.message, command: error.command })
      if (error instanceof GoalsError) return send(response, 400, { error: error.message })
      throw error
    }
  }

  /** Claude Code's status, cached for `STATUS_TTL` unless `fresh`. */
  function claude(fresh) {
    if (fresh || !claudeCache || Date.now() - claudeCache.at > STATUS_TTL)
      claudeCache = { at: Date.now(), status: claudeStatus(preferences()) }
    return claudeCache.status
  }

  /** `/api/events`:  keep the response open;  `change` events name a changed file's URL path. */
  function events(response) {
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store",
      Connection: "keep-alive"
    })
    response.write(": goals server\n\n")
    clients.add(response)
    response.on("close", () => clients.delete(response))
  }

  /**
   * Watch the goals folder and the docs' assets;  tell every page what changed, once it settles.
   * - a write is often two (write, then oxfmt):  each path waits 250 ms for quiet
   */
  function watchFiles() {
    const timers = new Map()
    for (const dir of [GOALS, join(DOCS, "_assets")]) {
      if (!existsSync(dir)) continue
      watch(dir, { recursive: true }, (_event, name) => {
        if (!name || !LIVE.test(name) || /(^|[/\\])\./.test(name)) return
        const path = `/${relative(ROOT, join(dir, name)).split(sep).map(encodeURIComponent).join("/")}`
        clearTimeout(timers.get(path))
        timers.set(
          path,
          setTimeout(() => {
            timers.delete(path)
            for (const client of clients) client.write(`event: change\ndata: ${JSON.stringify({ path })}\n\n`)
          }, 250)
        )
      })
    }
  }

  /**
   * Serve the file at URL path `path`, from the project root.
   * - goals pages get `window.GOALS_SERVER` (port, token, target base) before `</head>`
   */
  function file(response, path) {
    let decoded
    try {
      decoded = decodeURIComponent(path)
    } catch {
      return send(response, 400, { error: "bad path" })
    }
    if (decoded.split("/").some((part) => part.startsWith("."))) return send(response, 403, { error: "hidden file" })
    let target = resolve(ROOT, `.${decoded}`)
    if (target !== ROOT && !target.startsWith(ROOT + sep)) return send(response, 403, { error: "outside the project" })
    if (existsSync(target) && statSync(target).isDirectory()) target = join(target, "index.html")
    if (!existsSync(target) || !statSync(target).isFile()) return send(response, 404, { error: `no file ${decoded}` })
    const type = TYPES[extname(target).toLowerCase()] ?? "text/plain; charset=utf-8"
    let body = readFileSync(target)
    if (type.startsWith("text/html") && target.startsWith(GOALS + sep)) {
      const config = JSON.stringify({ port, token, page: decoded })
      body = body.toString("utf8").replace("</head>", `<script>window.GOALS_SERVER = ${config}</script>\n</head>`)
    }
    response.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" })
    response.end(body)
  }

  /** Stop:  forget `.server.json` (if it's still ours), close every page's events, exit. */
  function stop() {
    try {
      if (JSON.parse(readFileSync(SERVER_FILE, "utf8")).pid === process.pid) rmSync(SERVER_FILE, { force: true })
    } catch {
      // already gone
    }
    for (const client of clients) client.end()
    server.close(() => process.exit(0))
    setTimeout(() => process.exit(0), 500).unref()
  }
}

/** A JSON response. */
function send(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" })
  response.end(JSON.stringify(body))
}

/** A redirect. */
function redirect(response, location) {
  response.writeHead(302, { Location: location })
  response.end()
}

/** A request's JSON body (`{}` when empty);  refuses one over `MAX_BODY`. */
function json(request) {
  return new Promise((done, fail) => {
    let size = 0
    const chunks = []
    request.on("data", (chunk) => {
      size += chunk.length
      if (size > MAX_BODY) {
        fail(new GoalsError("request too big"))
        request.destroy()
      } else chunks.push(chunk)
    })
    request.on("end", () => {
      try {
        done(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {})
      } catch {
        fail(new GoalsError("not JSON"))
      }
    })
    request.on("error", fail)
  })
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const portFlag = process.argv.indexOf("--port")
  const port = portFlag > 0 ? Number(process.argv[portFlag + 1]) : preferences().server.port
  startServer({ port }).catch(() => process.exit(1))
}
