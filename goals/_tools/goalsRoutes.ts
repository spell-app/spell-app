/**
 * The goals pages' buttons, on the page server:  a ROUTE MODULE (`$/server/page`'s `RouteModule`), listed in the
 * repo root's `package.json` `"pageServer": { "routes": [...] }`.
 * - `POST /api/goals/thought` -- save a thought onto a page
 * - `POST /api/goals/run` -- start a Claude Code session on `/goals` or `/goals-update`, in a terminal window
 * - `GET /api/goals/claude`, `POST /api/goals/claude/login` -- Claude Code's status;  log in, in a terminal
 * - `POST /api/goals/open-vscode` -- show a goals page in VS Code's Simple Browser
 * - every POST needs the page server's token (`x-server-token`) and its own origin (`SRV.Guard`)
 * - goals pages get `window.GOALS_SERVER` (`{ api }`), so `goals-live.js` knows the buttons work here;  live
 *   reload is the page server's (`window.SPELL_SERVER`)
 * - watches the goals folder, so its pages reload as they change
 * - Was `server.js`, the goals server, before the page server served everything.
 */
import { SRV } from "$/server"
import type { RouteModule } from "$/server/page"

import { addThought } from "./goals.js"
import { LaunchError, SKILLS, claudeCommand, claudePath, claudeStatus, quote, runInTerminal } from "./launch.js"
import { GoalsError } from "./page.js"
import { GOALS, TargetError, preferences, resolveTarget } from "./targets.js"

/** How long Claude's status is trusted before asking again, in ms. */
const STATUS_TTL = 20_000

/** Where the routes live. */
const API = "/api/goals"

/** Biggest body accepted. */
const MAX_BODY = 64 * 1024

/** Claude Code's last status, and when it was asked. */
let claudeCache: { at: number; status: { installed: boolean; loggedIn: boolean } } | undefined

const goalsRoutes: RouteModule = {
  name: "goals",
  setup({ router, guard, live, web }) {
    live.watch(GOALS, { ignore: /(^|\/)_(tools|skills)\// })
    web.files.html.push((html, { file }) =>
      file.startsWith(`${GOALS}/`)
        ? html.replace("</head>", `<script>window.GOALS_SERVER = ${JSON.stringify({ api: API })}</script>\n</head>`)
        : html
    )

    const api = new SRV.Router()
    api.get("/claude", (_request, reply) => reply.set("Cache-Control", "no-store").json(claude(true)))
    api.use(guard.writeCheck, SRV.parseBodies({ limit: MAX_BODY }))
    api.post("/thought", (request, reply) => {
      const body = request.body as { target?: string; text?: string }
      const target = resolveTarget(body.target ?? "", preferences())
      const id = addThought(target, String(body.text ?? "")) as string
      reply.json({ ok: true, id: id.toUpperCase(), target: target.name })
    })
    api.post("/run", (request, reply) => {
      const body = request.body as { skill?: string; target?: string }
      if (!SKILLS.includes(body.skill)) throw new SRV.HttpError(400, `no skill "${body.skill}"`)
      const prefs = preferences()
      const target = resolveTarget(body.target ?? "", prefs)
      const status = claude(false)
      if (!status.installed) return void reply.status(409).json({ needs: "install", status })
      if (!status.loggedIn) return void reply.status(409).json({ needs: "login", status })
      const line = claudeCommand(body.skill, target.name, prefs)
      reply.json({ ok: true, how: runInTerminal(line, prefs), command: line })
    })
    api.post("/claude/login", (_request, reply) => {
      const prefs = preferences()
      const line = `${quote(claudePath(prefs) ?? prefs.claude.command)} auth login`
      claudeCache = undefined
      reply.json({ ok: true, how: runInTerminal(line, prefs), command: line })
    })
    api.post("/open-vscode", (request, reply) => {
      const body = request.body as { target?: string }
      const target = resolveTarget(body.target ?? "", preferences())
      if (!SRV.openInVSCode({ url: `${web.url}${target.path}`, file: target.file }))
        throw new LaunchError("VS Code didn't open it")
      reply.json({ ok: true })
    })
    // goals' own errors become the answers its pages expect
    router.use(API, (request, reply, next) =>
      api.handle(request, reply, (error) => next(error === undefined ? undefined : goalsError(error)))
    )
  }
}

export default goalsRoutes

/** Claude Code's status, cached for `STATUS_TTL` unless `fresh`. */
function claude(fresh: boolean) {
  if (fresh || !claudeCache || Date.now() - claudeCache.at > STATUS_TTL)
    claudeCache = { at: Date.now(), status: claudeStatus(preferences()) }
  return claudeCache.status
}

/** `error` as the answer goals pages expect:  404 + choices, 501 + command, 400, or as is. */
function goalsError(error: unknown): unknown {
  if (error instanceof TargetError)
    return new SRV.HttpError(404, error.message, { error: error.message, choices: error.choices })
  if (error instanceof LaunchError)
    return new SRV.HttpError(501, error.message, { error: error.message, command: error.command })
  if (error instanceof GoalsError) return new SRV.HttpError(400, error.message)
  return error
}
