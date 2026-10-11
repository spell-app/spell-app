import { mkdtempSync, readFileSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { join } from "path"

import { CLI } from "$/cli"

/**
 * `spell epic <verb> ...`:  working with epics from any session (epic `epic-workflow`).
 * - `send [<epic>] --text "..." | --file f [--images N] [--context "..."]`:  write a request into `<epic>`
 *   (`epics/<epic>/requests/r3/`), with the newest N screenshots pasted into this session;  then print its id and
 *   the epic's running sessions to tell (`SendMessage`), or the command that opens its window when none runs
 *   - no `<epic>`:  the tooling home's (`home`)
 * - `requests <epic> [--json]`:  every request sent to `<epic>`, and where each went
 * - `file <epic> <id> <phase>`:  file a request into phase <phase>:  his words and screenshots in its Requests field
 *   (`spell dev plan-doc request`), the request marked filed, `P7`
 *   - `file <epic> <id> "<where>"`, not a number:  only marked filed, saying where it went (`"dropped:  done in P3"`)
 * - `home [<epic>]`:  the tooling home, the epic dev-tooling requests go to;  with `<epic>`, set it
 * - `merge <epic>`:  a STANDING epic's phase onto `main` at once, fast-forward only;  run in the main checkout
 * - The logic:  `src/epic/`:  `requests.ts`, `home.ts`, `merge.ts`.
 */
export async function epicCommand(session: CLI.CliSession, args: string[], options: CLI.EpicOptions): Promise<number> {
  const [verb, named, ...rest] = args
  if (!verb) throw new CLI.CliError(`which verb?  ${VERBS}`)
  if (verb === "merge") {
    if (!named) throw new CLI.CliError("merge:  which epic?")
    const commits = CLI.mergeEpic(named)
    session.out(commits.length ? `main fast-forwarded to ${named}:` : `nothing to merge:  main already has ${named}`)
    for (const commit of commits) session.out(`  ${commit}`)
    return CLI.EXIT.OK
  }
  const root = CLI.findCheckout(CHECKOUT_MARKER)
  if (verb === "home") {
    if (named) CLI.setEpicHome(root, named)
    session.out(CLI.epicHome(root) ?? "no tooling home:  spell epic home <epic> sets one")
    return CLI.EXIT.OK
  }
  // no epic named:  the tooling home's (`send` only:  the other verbs say which epic)
  const epic = named ?? (verb === "send" ? CLI.epicHome(root) : null)
  if (!epic)
    throw new CLI.CliError(`${verb}:  which epic?${verb === "send" ? "  (no tooling home is set either)" : ""}`)
  switch (verb) {
    case "send":
      return send(session, root, epic, options)
    case "requests": {
      const requests = CLI.epicRequests(root, epic)
      if (options.json) session.out(JSON.stringify(requests, null, 2))
      else if (!requests.length) session.out(`no requests in epic ${epic}`)
      else for (const request of requests) session.out(requestLine(request))
      return CLI.EXIT.OK
    }
    case "file": {
      const [id, where] = rest
      if (!id || !where) throw new CLI.CliError(`file:  usage:  spell epic file ${epic} <id> <phase | "where it went">`)
      if (/^\d+$/.test(where)) {
        // into phase `where`'s Requests field, by the plan-doc tool:  then it's filed as `P<n>`
        const request = CLI.epicRequests(root, epic).find((it) => it.id === id)
        if (!request) throw new CLI.CliError(`no request '${id}' in epic '${epic}'`)
        const html = join(mkdtempSync(join(tmpdir(), "epic-request-")), `${id}.html`)
        writeFileSync(html, CLI.requestHTML(request))
        const exitCode = await CLI.planDocCommand(["request", epic, where, id, "--from", request.from, "--file", html])
        if (exitCode !== CLI.EXIT.OK) return exitCode
      }
      session.out(requestLine(CLI.fileRequest(root, epic, id, /^\d+$/.test(where) ? `P${where}` : where)))
      return CLI.EXIT.OK
    }
    default:
      throw new CLI.CliError(`unknown verb '${verb}':  ${VERBS}`)
  }
}

/** `spell epic send`:  write the request, then say who to tell. */
function send(session: CLI.CliSession, root: string, epic: string, options: CLI.EpicOptions): number {
  const text = options.file ? readFileSync(options.file, "utf8") : options.text
  if (!text?.trim()) throw new CLI.CliError('send:  Owen\'s words?  --text "..." or --file <file>')
  const images = Number(options.images ?? 0)
  if (!Number.isInteger(images) || images < 0) throw new CLI.CliError(`send:  --images ${options.images}?  a count`)
  const sent = CLI.sendRequest({
    root,
    epic,
    text,
    images,
    context: options.context,
    from: options.from ?? process.env.CLAUDE_CODE_SESSION_ID
  })
  const { request, receivers } = sent
  if (options.json) {
    session.out(JSON.stringify({ ...sent, receivers: receivers.map((it) => it.name ?? it.sessionId) }, null, 2))
    return CLI.EXIT.OK
  }
  session.out(`${request.id}  epics/${epic}/requests/${request.id}/request.md`)
  for (const image of request.images) session.out(`    ${image}`)
  if (receivers.length) {
    for (const receiver of receivers) {
      session.out(`tell:  ${receiver.name ?? receiver.sessionId}  (${receiver.status ?? "running"})`)
    }
  } else if (sent.fromEpic) {
    session.out(`this session is ${epic}'s own:  take ${request.id} up here (/epic request ${epic} ${request.id})`)
  } else {
    session.out(`no session of ${epic} is running:  open one with`)
    session.out(`  spell dev window launch ${epic} --prompt "/epic request ${epic} ${request.id}"`)
  }
  return CLI.EXIT.OK
}

/** One request, one line:  `r3  new    🚧 python (83d39e12)  comment mechanism doesn't look right`. */
function requestLine(request: CLI.EpicRequest): string {
  const status = request.filed ? `filed:  ${request.filed}` : request.status
  const words = request.text.replace(/\s+/g, " ")
  return `${request.id}  ${status}  ${request.from}  ${words.length > 60 ? `${words.slice(0, 59)}…` : words}`
}

/** The verbs, for errors. */
const VERBS = "send, requests, file, home or merge"

/** What marks a checkout with epics (`findCheckout()`):  the docs tools, as for `spell dev plan-doc`. */
const CHECKOUT_MARKER = "packages/docs/tools/plan-doc.js"
