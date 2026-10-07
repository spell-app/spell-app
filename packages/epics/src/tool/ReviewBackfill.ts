import { existsSync, readdirSync, readFileSync } from "node:fs"
import { homedir } from "node:os"
import { basename, join } from "node:path"

/****************
 * ### `ReviewBackfill`
 * `spell dev plan-doc backfill <name> | --all [--apply]`:  the one-off walk through an epic's past sessions, finding
 * the items Owen already went through before `/epic review` kept marks (`epics/epic-review`, P3).
 * - EVIDENCE:  in a session of the epic, Owen named the item's id in his own message, or answered a modal whose
 *   question or answer named it (Claude asked about it, he picked)
 * - a session of the epic:  titled `<name>` (`/rename`, the prompt hook, or Claude's own title), or working in its
 *   worktree (`.claude/worktrees/<name>`), or saved under that worktree's own project folder (older sessions)
 * - only items not reviewed yet (`PlanDoc.reviewState()`):  struck, decided and decision-linked ones already count
 * - dry run by default:  what it would mark, and the line it saw;  `--apply` marks them, dated the day of the
 *   evidence, and logs each (`PlanDocCommands`)
 * - from then on every `/epic` session marks what it talks through (`.claude/skills/epic/SKILL.md`), so this runs
 *   once per old epic
 * - Reads Claude Code's transcripts only:  knows nothing of plan docs, imports no other file of the tool.
 * - From `packages/docs/tools/review-backfill.js` (epic `epic-components`, P7), which now forwards here.
 ****************/
export class ReviewBackfill {
  /**
   * where Claude Code keeps transcripts:  one folder per project, `<slug>/<session id>.jsonl`.  STATIC for the
   * object's life;  a test that needs a fixture builds its own `ReviewBackfill`
   */
  readonly projects: string

  constructor({ projects = PROJECTS }: { projects?: string } = {}) {
    this.projects = projects
  }

  ////////////////
  // ## Sessions
  ////////////////

  /**
   * Transcripts of epic `name`'s sessions:  `{ id, file, title }`, from every project folder of the repo whose main
   * root is `mainRoot`.
   */
  sessionsOf(name: string, mainRoot: string): BackfillSession[] {
    const slug = ReviewBackfill.projectSlug(mainRoot)
    if (!existsSync(this.projects)) return []
    const found: BackfillSession[] = []
    for (const folder of readdirSync(this.projects)) {
      if (folder !== slug && !folder.startsWith(`${slug}-`)) continue
      // an older session made its worktree's own project folder:  every session in it is the epic's
      const worktreeFolder = folder === `${slug}--claude-worktrees-${name}`
      for (const file of readdirSync(join(this.projects, folder))) {
        if (!file.endsWith(".jsonl")) continue
        const path = join(this.projects, folder, file)
        const { title, cwds } = scan(path)
        const inWorktree = cwds.some((cwd) => cwd.includes(`/.claude/worktrees/${name}`))
        if (worktreeFolder || title === name || inWorktree)
          found.push({ id: basename(file, ".jsonl"), file: path, title })
      }
    }
    return found
  }

  /**
   * Claude Code's project folder name for `root`:  every character but letters and digits becomes `-`.
   * - STATIC:  Claude Code's naming rule, the same for any projects folder
   */
  static projectSlug(root: string): string {
    return root.replace(/[^a-zA-Z0-9]/g, "-")
  }

  ////////////////
  // ## Evidence
  ////////////////

  /**
   * Evidence that Owen went through each of `ids` (upper case, `I7`) in `sessions`:  `{ [id]: [{ session, date,
   * kind, quote }] }`, earliest first.
   * - `kind`:  `message` (he typed it) or `answer` (a modal he answered named it)
   * - STATIC:  reads the sessions' own files, wherever they were found
   */
  static findEvidence(sessions: BackfillSession[], ids: string[]): Record<string, Evidence[]> {
    const wanted = new Set(ids)
    const evidence: Record<string, Evidence[]> = {}
    for (const session of sessions) {
      for (const line of readFileSync(session.file, "utf8").split("\n")) {
        if (!line.includes('"type":"user"')) continue
        const entry = parse(line)
        // Claude Code's own entries:  meta, sub-agents, a compacted session's summary
        if (!entry || entry.type !== "user" || entry.isMeta || entry.isSidechain || entry.isCompactSummary) continue
        for (const { kind, text } of owenTexts(entry)) {
          for (const id of idsIn(text)) {
            if (!wanted.has(id)) continue
            const quote = quoteAround(text, id)
            ;(evidence[id] ??= []).push({ session: session.id, date: localDate(entry.timestamp), kind, quote })
          }
        }
      }
    }
    for (const list of Object.values(evidence)) list.sort((a, b) => String(a.date).localeCompare(String(b.date)))
    return evidence
  }
}

/** A transcript of an epic's session:  its id (the file's name), its file, its title (`null` when it has none). */
export type BackfillSession = { id: string; file: string; title: string | null }

/**
 * One sighting of an item's id in what Owen said.
 * - `date`:  the entry's LOCAL date, `YYYY-MM-DD`, `null` without a timestamp
 * - `kind`:  `message` (he typed it) or `answer` (a modal he answered named it)
 * - `quote`:  the text around it, one line
 */
export type Evidence = { session: string; date: string | null; kind: "message" | "answer"; quote: string }

/** A transcript's user entry, as far as this reads it. */
type TranscriptEntry = {
  type?: string
  timestamp?: string
  isMeta?: boolean
  isSidechain?: boolean
  isCompactSummary?: boolean
  customTitle?: string
  aiTitle?: string
  message?: { content?: unknown }
  toolUseResult?: { questions?: { header?: string; question?: string }[]; answers?: Record<string, unknown> }
}

/** Where Claude Code keeps transcripts:  one folder per project, `<slug>/<session id>.jsonl`. */
const PROJECTS = join(homedir(), ".claude", "projects")

/** Item ids in text:  `I7`, `q12`, `V3`, never `P2` (phases) or `D4`-in-a-word. */
const ITEM_ID = /\b([qcitvd])(\d+)\b/gi

/**
 * A user entry whose text is Claude Code's, not Owen's:  skill bodies, reminders, interrupt notices, background
 * agents' notices (`<task-notification>`, which name agents "T1", "T2" ...), command output, a compacted
 * session's summary.
 */
const NOT_OWEN =
  /^(Base directory for this skill|<system-reminder>|\[Request interrupted|Caveat:|<task-notification>|<local-command|<bash-|This session is being continued)/

/** How much text a quote keeps on each side of the id. */
const QUOTE_SIDE = 60

/**
 * A transcript's title (the last custom title, else Claude's last one) and every `cwd` its entries name.
 * - parses only the lines that can matter:  transcripts run to 10MB
 */
function scan(path: string): { title: string | null; cwds: string[] } {
  let custom: string | null = null
  let ai: string | null = null
  const cwds = new Set<string>()
  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (line.includes('"custom-title"') || line.includes('"ai-title"')) {
      const entry = parse(line)
      custom = entry?.customTitle ?? custom
      ai = entry?.aiTitle ?? ai
    }
    const cwd = /"cwd":"([^"]*)"/.exec(line)
    if (cwd) cwds.add(cwd[1])
  }
  return { title: custom ?? ai, cwds: [...cwds] }
}

/**
 * What Owen said in a user entry:  `{ kind, text }`s.
 * - `message`:  his typed text (a slash command's arguments included), never a skill body or a reminder
 * - `answer`:  a modal's questions and his answers (`toolUseResult.questions` / `.answers`):  he read the question
 *   and picked, so an id in either counts
 */
function owenTexts(entry: TranscriptEntry): { kind: Evidence["kind"]; text: string }[] {
  const content = entry.message?.content
  const texts: string[] = []
  if (typeof content === "string") texts.push(content)
  else if (Array.isArray(content)) {
    for (const part of content) if (part?.type === "text" && typeof part.text === "string") texts.push(part.text)
  }
  const said: { kind: Evidence["kind"]; text: string }[] = texts
    .filter((text) => !NOT_OWEN.test(text.trim()))
    .map((text) => ({ kind: "message", text: text.replace(/<\/?command-[a-z]+>/g, " ") }))
  const answers = entry.toolUseResult?.answers
  if (answers && typeof answers === "object") {
    const asked = (entry.toolUseResult?.questions ?? []).map((q) => `${q.header ?? ""} ${q.question ?? ""}`)
    for (const [question, answer] of Object.entries(answers)) {
      const header = asked.find((text) => text.includes(question)) ?? question
      said.push({ kind: "answer", text: `${header} => ${answer}` })
    }
  }
  return said
}

/** Item ids `text` names, upper case, once each. */
function idsIn(text: string): string[] {
  return [...new Set(Array.from(text.matchAll(ITEM_ID), (match) => `${match[1].toUpperCase()}${match[2]}`))]
}

/** `text` around `id`'s first mention, one line, cut to `QUOTE_SIDE` characters each side. */
function quoteAround(text: string, id: string): string {
  const flat = text.replace(/\s+/g, " ").trim()
  const at = flat.search(new RegExp(`\\b${id}\\b`, "i"))
  const start = Math.max(0, at - QUOTE_SIDE)
  const end = Math.min(flat.length, at + id.length + QUOTE_SIDE)
  return `${start > 0 ? "…" : ""}${flat.slice(start, end)}${end < flat.length ? "…" : ""}`
}

/**
 * An ISO timestamp's LOCAL date, `YYYY-MM-DD`, as the plan doc's dates are;  `null` without one.
 * - transcripts stamp UTC:  an evening's answer would otherwise land on tomorrow
 */
function localDate(timestamp: string | undefined): string | null {
  const date = timestamp ? new Date(timestamp) : null
  if (!date || Number.isNaN(date.getTime())) return null
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${String(date.getDate()).padStart(2, "0")}`
}

/** A JSON line, or `null`. */
function parse(line: string): TranscriptEntry | null {
  try {
    return JSON.parse(line)
  } catch {
    return null
  }
}
