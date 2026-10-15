import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "fs"
import { join } from "path"

import { CLI } from "$/cli"

/**
 * REQUESTS:  what Owen asks one epic for while he's working in another session (epic `epic-workflow`).
 * - Each is a folder in the epic's shared folder, `epics/<epic>/requests/r3/`:
 *   - `request.md`:  his words verbatim, who sent it, what it was looking at, and where it went
 *   - `image-1.png` ...:  the screenshots he pasted, taken from the sender's transcript
 * - Written BEFORE anyone is told, so nothing is lost if the epic's own session is closed.
 * - The epic's session (the RECEIVER) turns each into a phase, then marks it filed (`fileRequest()`).
 */

////////////////
// ## Sending
////////////////

/**
 * Write a request into `epic`, and say who should hear about it.
 * - `root`:  the checkout whose `epics/` holds the epic (every checkout shares one `epics/`)
 * - `text`:  Owen's words, kept verbatim
 * - `from`:  the sending session's id (`CLAUDE_CODE_SESSION_ID`);  its pasted images come from its transcript
 * - `images`:  how many of the newest images Owen pasted to keep (0:  none)
 * - `context`:  what the sender was looking at:  a page, a file, an item id
 * - throws when `epic` has no epic page, or the transcript has fewer images than asked for
 */
export function sendRequest(props: CLI.SendRequestProps): CLI.SentRequest {
  const { root, epic, text, from, images = 0, context, home = CLI.claudeHome() } = props
  const epicDir = join(root, "epics", epic)
  if (!existsSync(join(epicDir, `${epic}.plan.html`))) {
    throw new CLI.CliError(`no epic '${epic}':  epics/${epic}/${epic}.plan.html isn't there`)
  }
  const pictures = images > 0 ? pastedImages(from, images, home) : []
  if (pictures.length < images) {
    throw new CLI.CliError(`asked for ${images} image(s), but the sending session pasted ${pictures.length}`)
  }

  const id = nextRequestId(join(epicDir, "requests"))
  const folder = join(epicDir, "requests", id)
  mkdirSync(folder, { recursive: true })
  const files = pictures.map((picture, at) => {
    const name = `image-${at + 1}.${EXTENSIONS[picture.mediaType] ?? "png"}`
    writeFileSync(join(folder, name), Buffer.from(picture.data, "base64"))
    return name
  })
  const sender = from ? senderOf(from, home) : "unknown session"
  const request: CLI.EpicRequest = {
    id,
    epic,
    from: sender,
    at: localTime(),
    status: "new",
    text,
    context,
    images: files
  }
  writeFileSync(join(folder, "request.md"), requestMarkdown(request))

  const sessions = epicSessions(epic, home)
  const receivers = sessions.filter((session) => session.sessionId !== from)
  return { request, folder, receivers, fromEpic: receivers.length < sessions.length }
}

/** The next free request id in `dir`:  `r1`, then one more than the highest there. */
export function nextRequestId(dir: string): string {
  if (!existsSync(dir)) return "r1"
  const numbers = readdirSync(dir)
    .map((name) => /^r(\d+)$/.exec(name)?.[1])
    .filter(Boolean)
    .map(Number)
  return `r${Math.max(0, ...numbers) + 1}`
}

/**
 * The newest `count` images Owen pasted into session `id`, oldest first.
 * - only images in his own prompts:  not a tool's (a `Read` of a picture), nor a subagent's (sidechains)
 * - `[]` when the session has no transcript
 */
export function pastedImages(id: string | undefined, count: number, home = CLI.claudeHome()): CLI.PastedImage[] {
  const path = id ? CLI.transcriptOf(id, home) : undefined
  if (!path) return []
  const found: CLI.PastedImage[] = []
  for (const line of readFileSync(path, "utf8").split("\n")) {
    // cheap pre-check:  most lines have no image
    if (!line.includes('"image"')) continue
    const entry = CLI.parseJSONLine(line)
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

/**
 * The running sessions working on `epic`:  titled `<epic>` in Claude's session registry, with or without its icon
 * (`🚧 epic-workflow`).
 * - their `name` is the address `SendMessage` takes
 */
export function epicSessions(epic: string, home = CLI.claudeHome()): CLI.RunningSession[] {
  return [...CLI.runningSessions(home).values()].filter((session) => {
    const title = session.name ?? CLI.sessionTitle(session.sessionId, home)
    return title !== null && title !== undefined && CLI.bareTitle(title) === epic
  })
}

////////////////
// ## Reading and filing
////////////////

/** Every request in `epic`, oldest first;  `[]` when it has none. */
export function epicRequests(root: string, epic: string): CLI.EpicRequest[] {
  const dir = join(root, "epics", epic, "requests")
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((name) => /^r\d+$/.test(name) && existsSync(join(dir, name, "request.md")))
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))
    .map((name) => parseRequest(readFileSync(join(dir, name, "request.md"), "utf8")))
}

/**
 * Mark request `id` of `epic` filed:  `where` says where it went (`P7 · Comment Threads`, `joined P5`).
 * - returns the request as it now stands;  throws when there's no such request
 */
export function fileRequest(root: string, epic: string, id: string, where: string): CLI.EpicRequest {
  const path = join(root, "epics", epic, "requests", id, "request.md")
  if (!existsSync(path)) throw new CLI.CliError(`no request '${id}' in epic '${epic}'`)
  const request = { ...parseRequest(readFileSync(path, "utf8")), status: "filed", filed: where }
  writeFileSync(path, requestMarkdown(request))
  return request
}

/**
 * A request as the HTML its phase's Requests field shows (`epic request`):  his words quoted, the
 * context, when it came, then each screenshot (a link to it full size).
 * - URLs are the epic page's:  `requests/r3/image-1.png`
 */
export function requestHTML(request: CLI.EpicRequest): string {
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

////////////////
// ## request.md
////////////////

/**
 * A request as `request.md`:  a header of `key: value` lines between `---`, then Owen's words, then the context.
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
export function requestMarkdown(request: CLI.EpicRequest): string {
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

/** `requestMarkdown()`'s inverse. */
export function parseRequest(markdown: string): CLI.EpicRequest {
  const [, head = "", body = ""] = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(markdown) ?? []
  const fields = Object.fromEntries(
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

////////////////
// ## Helpers
////////////////

/** File extensions for the image types a transcript holds. */
const EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp"
}

/** `text` safe inside HTML. */
function escapeHTML(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

/** Session `id`, as a request names its sender:  its title and the start of its id, `🚧 python (83d39e12)`. */
function senderOf(id: string, home: string): string {
  const title = CLI.runningSessions(home).get(id)?.name ?? CLI.sessionTitle(id, home)
  return title ? `${title} (${id.slice(0, 8)})` : id
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
