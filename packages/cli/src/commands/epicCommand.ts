import { mkdtempSync, readFileSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { join } from "path"

import { CLI } from "$/cli"

/**
 * `epic <verb> ...`:  working with epics from any session (epic `epic-workflow`).
 * - `send [<epic>] --text "..." | --file f [--images N] [--context "..."]`:  write a request into `<epic>`
 *   (`epics/<epic>/requests/r3/`), with the newest N screenshots pasted into this session;  then print its id and
 *   the epic's running sessions to tell (`SendMessage`), or the command that opens its window when none runs
 *   - no `<epic>`:  the tooling home's (`home`)
 * - `requests <epic> [--json]`:  every request sent to `<epic>`, and where each went
 * - `file <epic>#P7 <id>`:  file a request into phase P7:  his words and screenshots in its Requests field
 *   (the `epic` tool's `request`), the request marked filed, `P7`
 *   - `file <epic> <id> "<where>"`, no phase:  only marked filed, saying where it went (`"dropped:  done in P3"`)
 *   - `add-request`, its old name, hidden (epic `epic-workflow` P19):  the same, its `--from` and `--file` (the request
 *     as html) taken as given rather than read from the epic's `requests/`
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
    session.out(CLI.epicHome(root) ?? "no tooling home:  epic home <epic> sets one")
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
    case "file":
    case "add-request":
      return file(session, root, epic, rest, options)
    default:
      throw new CLI.CliError(`unknown verb '${verb}':  ${VERBS}`)
  }
}

/**
 * `epic file <epic>#P7 <id>`:  request `id` into the phase's Requests field, by the `epic` tool, then marked filed
 * there;  `epic file <epic> <id> "<where>"`:  only marked filed, saying where it went.
 * - `--from` and `--file` (`add-request`'s shape):  the request as given;  marked filed only if `requests/` has it
 * - the old order, the phase a word of its own (`file seo r3 7`):  refused, spelled right
 */
async function file(
  session: CLI.CliSession,
  root: string,
  named: string,
  [id, where]: string[],
  options: CLI.EpicOptions
): Promise<number> {
  const { epic, ref } = CLI.parseTarget(named)
  if (ref === undefined) {
    if (!id || !where) throw new CLI.CliError(`file:  ${FILE_USAGE}`)
    const phase = CLI.phaseOf(where)
    if (phase !== undefined)
      throw new CLI.CliError(`file:  epic file ${epic}#${CLI.phaseLabel(phase)} ${id}  (the phase goes after a #)`)
    session.out(requestLine(CLI.fileRequest(root, epic, id, where)))
    return CLI.EXIT.OK
  }
  if (!id || where !== undefined) throw new CLI.CliError(`file:  ${FILE_USAGE}`)
  const request = CLI.epicRequests(root, epic).find((it) => it.id === id)
  let { file: html, from } = options
  if (!html || !from) {
    if (!request) throw new CLI.CliError(`no request '${id}' in epic '${epic}'`)
    html = join(mkdtempSync(join(tmpdir(), "epic-request-")), `${id}.html`)
    writeFileSync(html, CLI.requestHTML(request))
    from = request.from
  }
  // into the phase's Requests field (`P7`, `p-epic-migrate`, its name:  the tool finds it)
  for (const argv of CLI.planDocArgs("add-request", [named, id, "--from", from, "--file", html])) {
    const exitCode = await CLI.planDocCommand(argv)
    if (exitCode !== CLI.EXIT.OK) return exitCode
  }
  const phase = CLI.phaseOf(ref)
  const filed = phase === undefined ? ref : CLI.phaseLabel(phase)
  session.out(request ? requestLine(CLI.fileRequest(root, epic, id, filed)) : `${id}  into ${epic}#${filed}`)
  return CLI.EXIT.OK
}

/** `epic send`:  write the request, then say who to tell. */
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

/** How `file` is called, for its errors. */
const FILE_USAGE = 'epic file <epic>#P3 <request id>  |  epic file <epic> <request id> "where it went"'

/** What marks a checkout with epics (`findCheckout()`):  the docs tools, as for `epic`. */
const CHECKOUT_MARKER = "packages/epics/tools/plan-doc.js"
