import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { EpicConfig } from "$/epics/config/EpicConfig"
import { DataFile } from "$/epics/data/DataFile"

import {
  EXIT,
  EpicCommandError,
  parseVerbArgs,
  type EpicRequest,
  type PastedImage,
  type SendRequestProps,
  type SentRequest,
  type VerbArgs
} from "./command.types"
import { parseTarget, phaseLabel, phaseOf } from "./epicArgs"
import { EpicTools } from "./EpicTools"
import { Git } from "./Git"
import { Sessions } from "./Sessions"

/****************
 * ### `Requests`
 * REQUESTS:  what Owen asks one epic for while he's working in another session (epic `epic-workflow`),
 * and the epic-wide verbs beside them:  `epic send | requests | file | home | merge`.
 * - Each request is a folder in the epic's shared folder, `epics/<epic>/requests/r3/`:
 *   - `request.md`:  his words verbatim, who sent it, what it was looking at, and where it went
 *   - `image-1.png` ...:  the screenshots he pasted, taken from the sender's transcript
 * - Written BEFORE anyone is told, so nothing is lost if the epic's own session is closed.
 * - The epic's session (the RECEIVER) turns each into a phase, then marks it filed (`file()`).
 * - The verbs (`run()`):
 *   - `send [<epic>] --text "..." | --file f [--images N] [--context "..."]`:  write a request into `<epic>`,
 *     with the newest N screenshots pasted into this session
 *     - then print its id and the epic's running sessions to tell (`SendMessage`),
 *       or the command that opens its window when none runs
 *     - no `<epic>`:  the tooling home's
 *   - `requests <epic> [--json]`:  every request sent to `<epic>`, and where each went
 *   - `file <epic>#P7 <id>`:  file a request into phase P7:
 *     his words and screenshots in its Requests field (the `epic` tool's `add-request`), the request marked filed, `P7`
 *     - `file <epic> <id> "<where>"`, no phase:  only marked filed, saying where it went (`"dropped:  done in P3"`)
 *     - `add-request`, its old name, hidden (epic `epic-workflow` P19), does the same,
 *       its `--from` and `--file` (the request as html) taken as given rather than read from the epic's `requests/`
 *   - `home [<epic>]`:  the TOOLING HOME, the epic dev-tooling requests go to;  with `<epic>`, set it
 *   - `merge <epic>`:  a STANDING epic's phase onto `main` at once, fast-forward only;  run in the main checkout
 ****************/
export class Requests {
  /** the checkout whose `epics/` holds the epics (every checkout shares one):  STATIC for the object's life */
  readonly root: string

  /** the sessions:  senders' transcripts, receivers */
  readonly sessions: Sessions

  /**
   * - `root`:  default the nearest checkout with the docs tools (`Git.nearestCheckout()`)
   * - `sessions`:  default `new Sessions()`
   */
  constructor({ root = Git.nearestCheckout(CHECKOUT_MARKER), sessions = new Sessions() }: RequestsProps = {}) {
    this.root = root
    this.sessions = sessions
  }

  ////////////////
  // ## The verbs
  ////////////////

  /** Run `epic <verb> <args>` for one of this group's verbs;  resolves to the exit code. */
  async run([verb, ...args]: string[]): Promise<number> {
    const { positional, flags } = parseVerbArgs(args, ["json"])
    const [named, ...rest] = positional
    if (!verb) throw new EpicCommandError(`which verb?  ${VERBS}`)
    if (verb === "merge") {
      if (!named) throw new EpicCommandError("merge:  which epic?")
      const commits = Requests.merge(named)
      out(commits.length ? `main fast-forwarded to ${named}:` : `nothing to merge:  main already has ${named}`)
      for (const commit of commits) out(`  ${commit}`)
      return EXIT.OK
    }
    if (verb === "home") {
      if (named) this.setHome(named)
      out(this.home() ?? "no tooling home:  epic home <epic> sets one")
      return EXIT.OK
    }
    // no epic named:  the tooling home's (`send` only:  the other verbs say which epic)
    const epic = named ?? (verb === "send" ? this.home() : null)
    if (!epic)
      throw new EpicCommandError(`${verb}:  which epic?${verb === "send" ? "  (no tooling home is set either)" : ""}`)
    switch (verb) {
      case "send":
        return this.sendVerb(epic, flags)
      case "requests": {
        const requests = this.list(epic)
        if (flags.json) out(JSON.stringify(requests, null, 2))
        else if (!requests.length) out(`no requests in epic ${epic}`)
        else for (const request of requests) out(requestLine(request))
        return EXIT.OK
      }
      case "file":
      case "add-request":
        return this.fileVerb(epic, rest, flags)
      default:
        throw new EpicCommandError(`unknown verb '${verb}':  ${VERBS}`)
    }
  }

  /** `epic send`:  write the request, then say who to tell. */
  private sendVerb(epic: string, flags: VerbArgs["flags"]): number {
    const text = typeof flags.file === "string" ? readFileSync(flags.file, "utf8") : flags.text
    if (typeof text !== "string" || !text.trim())
      throw new EpicCommandError('send:  Owen\'s words?  --text "..." or --file <file>')
    const images = Number(flags.images ?? 0)
    if (!Number.isInteger(images) || images < 0) throw new EpicCommandError(`send:  --images ${flags.images}?  a count`)
    const sent = this.send({
      epic,
      text,
      images,
      context: typeof flags.context === "string" ? flags.context : undefined,
      from: typeof flags.from === "string" ? flags.from : process.env.CLAUDE_CODE_SESSION_ID
    })
    const { request, receivers } = sent
    if (flags.json) {
      out(JSON.stringify({ ...sent, receivers: receivers.map((it) => it.name ?? it.sessionId) }, null, 2))
      return EXIT.OK
    }
    out(`${request.id}  epics/${epic}/requests/${request.id}/request.md`)
    for (const image of request.images) out(`    ${image}`)
    if (receivers.length) {
      for (const receiver of receivers)
        out(`tell:  ${receiver.name ?? receiver.sessionId}  (${receiver.status ?? "running"})`)
    } else if (sent.fromEpic) {
      out(`this session is ${epic}'s own:  take ${request.id} up here (/epic request ${epic} ${request.id})`)
    } else {
      out(`no session of ${epic} is running:  open one with`)
      out(`  epic window launch ${epic} --prompt "/epic request ${epic} ${request.id}"`)
    }
    return EXIT.OK
  }

  /**
   * `epic file <epic>#P7 <id>`:  request `id` into the phase's Requests field, by the `epic` tool,
   * then marked filed there.
   * - `epic file <epic> <id> "<where>"`:  only marked filed, saying where it went
   * - `--from` and `--file` (`add-request`'s shape):  the request as given;  marked filed only if `requests/` has it
   * - the old order, the phase a word of its own (`file seo r3 7`):  refused, spelled right
   */
  private async fileVerb(named: string, [id, where]: string[], flags: VerbArgs["flags"]): Promise<number> {
    const { epic, ref } = parseTarget(named)
    if (ref === undefined) {
      if (!id || !where) throw new EpicCommandError(`file:  ${FILE_USAGE}`)
      const phase = phaseOf(where)
      if (phase !== undefined)
        throw new EpicCommandError(`file:  epic file ${epic}#${phaseLabel(phase)} ${id}  (the phase goes after a #)`)
      out(requestLine(this.file(epic, id, where)))
      return EXIT.OK
    }
    if (!id || where !== undefined) throw new EpicCommandError(`file:  ${FILE_USAGE}`)
    const request = this.list(epic).find((it) => it.id === id)
    let html = typeof flags.file === "string" ? flags.file : undefined
    let from = typeof flags.from === "string" ? flags.from : undefined
    if (!html || !from) {
      if (!request) throw new EpicCommandError(`no request '${id}' in epic '${epic}'`)
      html = join(mkdtempSync(join(tmpdir(), "epic-request-")), `${id}.html`)
      writeFileSync(html, Requests.html(request))
      from = request.from
    }
    // into the phase's Requests field (`P7`, `p-epic-migrate`, its name:  the tool finds it)
    const exitCode = await EpicTools.runPlanDoc(["add-request", named, id, "--from", from, "--file", html])
    if (exitCode !== EXIT.OK) return exitCode
    const phase = phaseOf(ref)
    const filed = phase === undefined ? ref : phaseLabel(phase)
    out(request ? requestLine(this.file(epic, id, filed)) : `${id}  into ${epic}#${filed}`)
    return EXIT.OK
  }

  ////////////////
  // ## Sending
  ////////////////

  /**
   * Write a request into `epic`, and say who should hear about it (`SendRequestProps`).
   * - throws when `epic` has no epic page, or the transcript has fewer images than asked for
   */
  send({ epic, text, from, images = 0, context }: SendRequestProps): SentRequest {
    const epicDir = join(this.root, "epics", epic)
    if (!existsSync(join(epicDir, `${epic}.plan.html`))) {
      throw new EpicCommandError(`no epic '${epic}':  epics/${epic}/${epic}.plan.html isn't there`)
    }
    const pictures = images > 0 ? this.pastedImages(from, images) : []
    if (pictures.length < images) {
      throw new EpicCommandError(`asked for ${images} image(s), but the sending session pasted ${pictures.length}`)
    }

    const id = Requests.nextId(join(epicDir, "requests"))
    const folder = join(epicDir, "requests", id)
    mkdirSync(folder, { recursive: true })
    const files = pictures.map((picture, at) => {
      const name = `image-${at + 1}.${EXTENSIONS[picture.mediaType] ?? "png"}`
      writeFileSync(join(folder, name), Buffer.from(picture.data, "base64"))
      return name
    })
    const sender = from ? this.senderOf(from) : "unknown session"
    const request: EpicRequest = {
      id,
      epic,
      from: sender,
      at: localTime(),
      status: "new",
      text,
      context,
      images: files
    }
    writeFileSync(join(folder, "request.md"), Requests.markdown(request))

    const sessions = this.sessions.ofEpic(epic)
    const receivers = sessions.filter((session) => session.sessionId !== from)
    return { request, folder, receivers, fromEpic: receivers.length < sessions.length }
  }

  /**
   * The newest `count` images Owen pasted into session `id`, oldest first.
   * - only images in his own prompts:  not a tool's (a `Read` of a picture), nor a subagent's (sidechains)
   * - `[]` when the session has no transcript
   */
  pastedImages(id: string | undefined, count: number): PastedImage[] {
    const path = id ? this.sessions.transcriptOf(id) : undefined
    if (!path) return []
    const found: PastedImage[] = []
    for (const line of readFileSync(path, "utf8").split("\n")) {
      // cheap pre-check:  most lines have no image
      if (!line.includes('"image"')) continue
      const entry = Sessions.parseJSONLine(line)
      if (entry.type !== "user" || entry.isSidechain || entry.isMeta) continue
      const content = (entry.message as { content?: unknown } | undefined)?.content
      if (!Array.isArray(content)) continue
      for (const block of content) {
        const source = block?.type === "image" ? block.source : undefined
        if (source?.type === "base64" && typeof source.data === "string") {
          found.push({ mediaType: source.media_type ?? "image/png", data: source.data })
        }
      }
    }
    return found.slice(-count)
  }

  /** Session `id`, as a request names its sender:  its title and the start of its id, `🚧 python (83d39e12)`. */
  private senderOf(id: string): string {
    const title = this.sessions.running().get(id)?.name ?? this.sessions.title(id)
    return title ? `${title} (${id.slice(0, 8)})` : id
  }

  ////////////////
  // ## Reading and filing
  ////////////////

  /** Every request in `epic`, oldest first;  `[]` when it has none. */
  list(epic: string): EpicRequest[] {
    const dir = join(this.root, "epics", epic, "requests")
    if (!existsSync(dir)) return []
    return readdirSync(dir)
      .filter((name) => /^r\d+$/.test(name) && existsSync(join(dir, name, "request.md")))
      .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))
      .map((name) => Requests.parse(readFileSync(join(dir, name, "request.md"), "utf8")))
  }

  /**
   * Mark request `id` of `epic` filed:  `where` says where it went (`P7 · Comment Threads`, `joined P5`).
   * - returns the request as it now stands;  throws when there's no such request
   */
  file(epic: string, id: string, where: string): EpicRequest {
    const path = join(this.root, "epics", epic, "requests", id, "request.md")
    if (!existsSync(path)) throw new EpicCommandError(`no request '${id}' in epic '${epic}'`)
    const request = { ...Requests.parse(readFileSync(path, "utf8")), status: "filed", filed: where }
    writeFileSync(path, Requests.markdown(request))
    return request
  }

  ////////////////
  // ## The tooling home
  ////////////////

  /**
   * The TOOLING HOME's epic:  the epic every session sends dev-tooling requests to (epic `epic-workflow`, Q2 and Q7);
   * `null` when none is set (or its file won't read).
   * - Dev tooling:  how Owen works, not what a session builds (the rule:  the root `CLAUDE.md`).
   *   - the epic page, comments, the Review tab, every skill and hook, windows, worktrees, `epic` itself
   * - Kept in `epics/home.json5`, shared content:
   *   every checkout reads the same one, and the turn-end hook commits it.
   * - A data file (`DataFile`):  JSON5, a comment added by hand kept,
   *   its old `home.json` read while there's no `.json5`.
   * - Its shape:  `{ "epic": "epic-workflow", "set": "2026-10-11" }`
   */
  home(): string | null {
    let home: { epic?: unknown } | undefined
    try {
      home = DataFile.read<{ epic?: unknown }>(this.homeFile)
    } catch {
      return null
    }
    return typeof home?.epic === "string" && home.epic ? home.epic : null
  }

  /**
   * Make `epic` the tooling home;  throws when it has no epic page.
   * - SIDE EFFECT:  writes `epics/home.json5` (removing its old `.json`)
   */
  setHome(epic: string): void {
    if (!existsSync(join(this.root, "epics", epic, `${epic}.plan.html`))) {
      throw new EpicCommandError(`no epic '${epic}':  epics/${epic}/${epic}.plan.html isn't there`)
    }
    const set = new Date().toISOString().slice(0, 10)
    DataFile.write(this.homeFile, { epic, set })
  }

  /** Where the tooling home is kept. */
  private get homeFile(): string {
    return join(this.root, "epics", `home${DataFile.SUFFIX}`)
  }

  ////////////////
  // ## Statics:  request.md, merging a standing epic
  ////////////////

  /**
   * A STANDING epic's phase, onto `main` at once (epic `epic-workflow`, Q8):  `epic merge <epic>`.
   * - `main`:  the repo's base branch, `baseBranch` in `.epic/config.json5` (`EpicConfig`)
   * - Run in the MAIN checkout, by the epic's session after `ExitWorktree` (`keep`);
   *   it goes back with `EnterWorktree`.
   *   A worktree session can't move `main` itself:  its git runs in its own worktree only.
   * - Fast-forward only, after the checks `/isolate done` makes (its "Finish", step 7):
   *   - this is the main checkout, on `main`, with nothing uncommitted (another session may work there)
   *   - branch `<epic>` holds all of `main`:  else `main` moved, and the branch merges it first
   *     (`epic worktree merge-main`, in its worktree)
   * - Returns the commits it brought onto `main`, oldest first;  `[]` when there was nothing to merge.
   * - throws an `EpicCommandError` saying what to do, for any check that fails
   * - static:  about the repo `cwd` is in, not the epics folder
   */
  static merge(epic: string, cwd = process.cwd()): string[] {
    const main = Git.mainRoot(cwd)
    const top = Git.run(["rev-parse", "--show-toplevel"], cwd).out
    if (!top || realpathSync(top) !== realpathSync(main)) {
      throw new EpicCommandError(`merge:  run it in the main checkout (${main}):  ExitWorktree (keep) first`)
    }
    const base = new EpicConfig(main).baseBranch
    const branch = Git.run(["branch", "--show-current"], main).out
    if (branch !== base) throw new EpicCommandError(`merge:  the main checkout is on '${branch}', not ${base}`)
    const dirty = Git.run(["status", "--short"], main).out
    if (dirty) throw new EpicCommandError(`merge:  the main checkout has uncommitted changes:\n${dirty}`)
    if (!Git.run(["rev-parse", "--verify", "--quiet", `refs/heads/${epic}`], main).ok) {
      throw new EpicCommandError(`merge:  no branch '${epic}'`)
    }
    if (!Git.run(["merge-base", "--is-ancestor", base, epic], main).ok) {
      throw new EpicCommandError(
        `merge:  ${base} has moved since ${epic} last took it:  in its worktree, epic worktree merge-main, then again`
      )
    }
    const commits = Git.run(["log", "--reverse", "--oneline", `${base}..${epic}`], main)
      .out.split("\n")
      .filter(Boolean)
    if (!commits.length) return []
    const merged = Git.run(["merge", "--ff-only", epic], main)
    if (!merged.ok) throw new EpicCommandError(`merge:  git merge --ff-only ${epic} failed:\n${merged.err}`)
    return commits
  }

  /**
   * The next free request id in `dir`:  `r1`, then one more than the highest there.
   * - static:  any folder
   */
  static nextId(dir: string): string {
    if (!existsSync(dir)) return "r1"
    const numbers = readdirSync(dir)
      .map((name) => /^r(\d+)$/.exec(name)?.[1])
      .filter(Boolean)
      .map(Number)
    return `r${Math.max(0, ...numbers) + 1}`
  }

  /**
   * A request as the HTML its phase's Requests field shows (`epic file`):
   * his words quoted, the context, when it came, then each screenshot (a link to it full size).
   * - URLs are the epic page's:  `requests/r3/image-1.png`
   * - static:  pure
   */
  static html(request: EpicRequest): string {
    const folder = `requests/${request.id}`
    const paragraphs = request.text.split(/\n\s*\n/).map((it) => `<p>${escapeHTML(it.trim())}</p>`)
    const context = request.context ? [`<p>Looking at:  ${escapeHTML(request.context)}</p>`] : []
    const when = `<p>Sent ${escapeHTML(request.at.replace("T", " "))};  <a href="${folder}/request.md">request.md</a></p>`
    const images = request.images.map(
      (name, at) =>
        `<p><a href="${folder}/${name}"><img src="${folder}/${name}" alt="${request.id}, screenshot ${at + 1}" ` +
        `style="max-width: 100%" /></a></p>`
    )
    return [`<blockquote>${paragraphs.join("")}</blockquote>`, ...context, when, ...images].join("\n")
  }

  /**
   * A request as `request.md`:  a header of `key: value` lines between `---`, then Owen's words, then the context.
   * - static:  pure
   *
   * ```md
   * ---
   * id: r3
   * epic: epic-workflow
   * from: 🚧 python
   * at: 2026-10-11T06:10-04:00
   * status: new
   * images: image-1.png
   * ---
   *
   * ## Owen's words
   *
   * comment mechanism doesn't look right
   *
   * ## Context
   *
   * the epic page of epic python, P4's comment thread
   * ```
   */
  static markdown(request: EpicRequest): string {
    const header = [
      `id: ${request.id}`,
      `epic: ${request.epic}`,
      `from: ${request.from}`,
      `at: ${request.at}`,
      `status: ${request.status}`,
      ...(request.filed ? [`filed: ${request.filed}`] : []),
      ...(request.images.length ? [`images: ${request.images.join(", ")}`] : [])
    ]
    const context = request.context ? `\n## Context\n\n${request.context.trim()}\n` : ""
    return `---\n${header.join("\n")}\n---\n\n## Owen's words\n\n${request.text.trim()}\n${context}`
  }

  /**
   * `markdown()`'s inverse.
   * - static:  pure
   */
  static parse(markdown: string): EpicRequest {
    const [, head = "", body = ""] = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(markdown) ?? []
    const fields: Record<string, string | undefined> = Object.fromEntries(
      head.split("\n").map((line) => {
        const colon = line.indexOf(":")
        return [line.slice(0, colon).trim(), line.slice(colon + 1).trim()]
      })
    )
    const [words = "", context] = body.split(/^## Context$/m)
    return {
      id: fields.id ?? "",
      epic: fields.epic ?? "",
      from: fields.from ?? "",
      at: fields.at ?? "",
      status: fields.status ?? "new",
      filed: fields.filed || undefined,
      text: words.replace(/^\s*## Owen's words\s*/, "").trim(),
      context: context?.trim() || undefined,
      images: fields.images ? fields.images.split(/,\s*/) : []
    }
  }
}

/** What `new Requests()` takes:  see its constructor. */
export type RequestsProps = { root?: string; sessions?: Sessions }

/** What marks a checkout with epics (`Git.nearestCheckout()`):  the docs tools, as for every epic verb. */
const CHECKOUT_MARKER = "packages/epics/tools/plan-doc.js"

/** The verbs, for errors. */
const VERBS = "send, requests, file, home or merge"

/** How `file` is called, for its errors. */
const FILE_USAGE = 'epic file <epic>#P3 <request id>  |  epic file <epic> <request id> "where it went"'

/** File extensions for the image types a transcript holds. */
const EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp"
}

/** Write `text` to stdout, on its own line. */
function out(text: string): void {
  process.stdout.write(text.endsWith("\n") ? text : `${text}\n`)
}

/** One request, one line:  `r3  new    🚧 python (83d39e12)  comment mechanism doesn't look right`. */
function requestLine(request: EpicRequest): string {
  const status = request.filed ? `filed:  ${request.filed}` : request.status
  const words = request.text.replace(/\s+/g, " ")
  return `${request.id}  ${status}  ${request.from}  ${words.length > 60 ? `${words.slice(0, 59)}…` : words}`
}

/** `text` safe inside HTML. */
function escapeHTML(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

/** Now, to the minute, in local time with its offset:  `2026-10-11T06:10-04:00`, as the epic page's log writes it. */
function localTime(date = new Date()): string {
  const pad = (n: number) => String(Math.abs(n)).padStart(2, "0")
  const offset = -date.getTimezoneOffset()
  const sign = offset >= 0 ? "+" : "-"
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}` +
    `${sign}${pad(Math.trunc(offset / 60))}:${pad(offset % 60)}`
  )
}
