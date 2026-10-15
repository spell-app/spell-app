// Import directly, not through `$/cli`:  the barrel loads spell, and `epic` must start fast (`epicMain.ts`)
import { CliError } from "$/cli/cli.types"

/**
 * How an `epic <verb> ...` command line becomes the `epic` tool's (`spell dev plan-doc <verb> <name> ...`):
 * a thin translation, so the tool itself (`$/epics/tool/PlanDocCommands`) keeps its arguments.
 * - Owen's scheme (Command Review Page, 2026-10-12):  `epic <verb> <epic>#<id>` for anything inside an epic page
 *   - `seo`:  the page
 *   - `seo#J3`:  an item (or a comment, `seo#cm3`;  or an Overview section)
 *   - `seo#P3`, `seo#p3`, `seo#3`:  a phase
 *   - `seo#J`:  a NEW item of that kind, for `add`
 * - Without a `#`, the tool's own order works too:  `epic close seo J3` ~== `epic close seo#J3`.
 * - Pure:  no files, no output.  Throws `CliError` (a usage error, exit 2) for a target the verb can't take.
 * - Lean:  imports no barrel, so `epic` starts without loading spell.
 */
export function planDocArgs(verb: string, args: string[]): string[][] {
  const at = args.findIndex((arg) => !arg.startsWith("--"))
  const target = at === -1 ? undefined : parseTarget(args[at]!)
  // the command line with the target swapped for `epic`, plus `inserted` right after it
  const around = (inserted: string[], rest = args) =>
    at === -1 ? [...rest] : [...rest.slice(0, at), target!.epic, ...inserted, ...rest.slice(at + 1)]
  const ref = target?.ref
  switch (verb) {
    case "add": {
      if (ref === undefined) return [["add", ...args]]
      const kind = kindOf(ref)
      if (!kind) throw new CliError(`add:  ${args[at]}?  a kind after the #, e.g. ${target!.epic}#J (${KIND_HELP})`)
      return [["add", ...around([kind])]]
    }
    case "phase":
    case "updated":
      return [[verb, ...around(ref === undefined ? [] : [String(needPhase(verb, args[at]!, ref))])]]
    case "add-request":
      return [["request", ...around(ref === undefined ? [] : [String(needPhase(verb, args[at]!, ref))])]]
    case "commit": {
      if (ref === undefined) return [["commit", ...args]]
      const phase = phaseOf(ref)
      return [["commit", ...around([]), ...(phase === undefined ? ["--item", ref] : ["--phase", String(phase)])]]
    }
    case "restore":
      return [["original", ...around(ref === undefined ? [] : [ref])]]
    case "inbox": {
      if (ref === undefined) return [["inbox", ...args]]
      // `inbox seo#J3 done` -> `inbox seo done J3`:  the id goes after the inbox's own verb
      const rest = [...args]
      const sub = rest.findIndex((arg, i) => i > at && !arg.startsWith("--"))
      if (sub === -1) throw new CliError(`inbox ${args[at]}:  what?  working on | off, done, clear`)
      rest.splice(sub + 1, 0, ref)
      return [["inbox", ...around([], rest)]]
    }
    case "bedtime": {
      refused(verb, target)
      const rest = [...args]
      if (rest[at + 1] === "start" && rest[at + 2] !== undefined) rest[at + 2] = phaseRanges(rest[at + 2]!)
      return [["bedtime", ...rest]]
    }
    case "open":
      // the Spell Docs tab, unless `--review` (Owen, 2026-10-12);  `spell dev plan-doc open` keeps the Review tab
      refused(verb, target)
      return [["open", ...args.filter((arg) => arg !== "--review"), ...(args.includes("--review") ? [] : ["--docs"])]]
    case "update":
      return updateArgs(args, at, target)
    default:
      if (ITEM_VERBS.includes(verb)) return [[verb, ...around(ref === undefined ? [] : [ref])]]
      refused(verb, target)
      return [[verb, ...args]]
  }
}

/**
 * `<epic>` or `<epic>#<ref>`, split.
 * - throws `CliError` for an empty epic or ref (`#J3`, `seo#`)
 */
export function parseTarget(text: string): EpicTarget {
  const hash = text.indexOf("#")
  if (hash === -1) return { epic: text }
  const epic = text.slice(0, hash)
  const ref = text.slice(hash + 1)
  if (!epic || !ref) throw new CliError(`${text}?  <epic>#<id>, e.g. seo#J3, seo#P3`)
  return { epic, ref }
}

/** The phase number a ref names, `P3`, `p3` or `3`;  `undefined` when it names something else. */
export function phaseOf(ref: string): number | undefined {
  const match = PHASE_REF.exec(ref)
  return match ? Number(match[1]) : undefined
}

/** The item kind a ref names for `add`:  a kind's letter (`J`, `q` ...) or its word (`judgement`);  else `undefined`. */
function kindOf(ref: string): string | undefined {
  const lower = ref.toLowerCase()
  if (KIND_WORDS.includes(lower)) return lower
  return KIND_LETTERS[lower]
}

/**
 * Phases for `bedtime start`, checked and written one way:  `P3-P6,P9` (from `P3-P6, P9`, `3-6,9` ...).
 * - throws `CliError` for anything else, or a range that runs backwards
 */
export function phaseRanges(text: string): string {
  const parts = text.split(",").map((part) => part.trim())
  return parts
    .map((part) => {
      const match = PHASE_RANGE.exec(part)
      if (!match) throw new CliError(`bedtime:  "${text}"?  phases and ranges, e.g. P3-P6,P9`)
      const [, from, to] = match
      if (to !== undefined && Number(to) < Number(from))
        throw new CliError(`bedtime:  P${from}-P${to} runs backwards:  P${to}-P${from}?`)
      return to === undefined ? `P${from}` : `P${from}-P${to}`
    })
    .join(",")
}

/**
 * `epic update <target> --field value ...`:  ONE verb setting a phase's or an item's fields, or the page's flags
 * (Owen, 2026-10-12);  the tool's commands it takes, run in order.
 * - a phase (`seo#P3`):  `--symptom`, `--changes`, `--goal`, `--files`, `--verify` (`phase-body`;  `""` removes
 *   one), `--estimate` (`estimate`), `--title` [`--html`] (`rename`)
 * - an item (`seo#J3`):  `--title` [`--html`] (`rename`), `--calm` / `--loud` (`calm`)
 * - the page (`seo`):  `--standing` [`on` | `off`], `--no-standing` (`standing`)
 * - throws `CliError` for no field, or one the target doesn't have
 */
function updateArgs(args: string[], at: number, target: EpicTarget | undefined): string[][] {
  if (!target) throw new CliError("update what?  <epic>, <epic>#P3 or <epic>#J3, then the fields to set")
  const flags = flagsOf(args.filter((_, i) => i !== at))
  const keys = Object.keys(flags)
  const { epic, ref } = target
  const phase = ref === undefined ? undefined : phaseOf(ref)
  const fields = ref === undefined ? PAGE_FIELDS : phase === undefined ? ITEM_FIELDS : PHASE_FIELDS
  const what = ref === undefined ? "the page" : phase === undefined ? `item ${ref}` : `phase P${phase}`
  if (!keys.length) throw new CliError(`update ${args[at]}:  which fields?  ${what} has --${fields.join(", --")}`)
  const unknown = keys.filter((key) => !fields.includes(key))
  if (unknown.length)
    throw new CliError(`update:  ${what} has no --${unknown.join(", --")} (it has --${fields.join(", --")})`)
  const runs: string[][] = []
  const value = (key: string) => {
    const it = flags[key]
    if (it === true) throw new CliError(`update:  --${key} needs a value`)
    return it!
  }
  const rename = (id: string) => {
    if ("title" in flags) runs.push(["rename", epic, id, value("title"), ...(flags.html ? ["--html"] : [])])
  }
  if (ref === undefined) {
    if ("standing" in flags || "no-standing" in flags) {
      const on = flags["no-standing"] ? "off" : flags.standing === true ? "on" : value("standing")
      runs.push(["standing", epic, on])
    }
  } else if (phase !== undefined) {
    const body = PHASE_BODY.filter((key) => key in flags).flatMap((key) => [`--${key}`, value(key)])
    if (body.length) runs.push(["phase-body", epic, String(phase), ...body])
    if ("estimate" in flags) runs.push(["estimate", epic, String(phase), value("estimate")])
    rename(`P${phase}`)
  } else {
    if (flags.calm && flags.loud) throw new CliError("update:  --calm or --loud, not both")
    if (flags.calm) runs.push(["calm", epic, ref])
    if (flags.loud) runs.push(["calm", epic, ref, "--loud"])
    rename(ref)
  }
  if (flags.html && !("title" in flags)) throw new CliError("update:  --html goes with --title")
  return runs
}

/** `--key value` flags and `--key` switches, as the tool reads them:  a value is the next word unless it's a flag. */
function flagsOf(args: string[]): Record<string, string | true> {
  const flags: Record<string, string | true> = {}
  for (let i = 0; i < args.length; i++) {
    const match = /^--([\w-]+)$/.exec(args[i]!)
    if (!match) throw new CliError(`update:  "${args[i]}"?  only --field value pairs after the target`)
    flags[match[1]!] = i + 1 < args.length && !args[i + 1]!.startsWith("--") ? args[++i]! : true
  }
  return flags
}

/** A phase number from `ref`, or a usage error saying `verb` takes a phase. */
function needPhase(verb: string, text: string, ref: string): number {
  const phase = phaseOf(ref)
  if (phase === undefined) throw new CliError(`${verb}:  ${text}?  a phase, e.g. ${text.split("#")[0]}#P3`)
  return phase
}

/** A usage error when `verb`, which takes a whole epic, was given `seo#J3`. */
function refused(verb: string, target: EpicTarget | undefined): void {
  if (target?.ref !== undefined)
    throw new CliError(`${verb}:  takes an epic, not ${target.epic}#${target.ref}:  epic ${verb} ${target.epic} ...`)
}

/** An `epic` command's target, `parseTarget()`'s:  the epic's name, and what follows the `#`. */
export type EpicTarget = {
  /** the epic's name:  `seo` */
  epic: string
  /** what follows the `#`, as typed:  `J3`, `P3`, `3`, `J`;  none for the page */
  ref?: string
}

/** Verbs on one item, its id after the epic:  `epic close seo#J3` -> `close seo J3`. */
const ITEM_VERBS = [
  "decide",
  "close",
  "reopen",
  "cancel",
  "details",
  "status",
  "review",
  "defer",
  "queue",
  "unqueue",
  "calm"
]

/** A phase ref:  `P3`, `p3`, `3`. */
const PHASE_REF = /^[Pp]?(\d+)$/

/** One part of a bedtime run's phases:  `P3`, `P3-P6`, `3-6`. */
const PHASE_RANGE = /^[Pp]?(\d+)(?:\s*-\s*[Pp]?(\d+))?$/

/**
 * The item kinds' letters, for `add seo#J`:  each kind's id prefix (the `epic` tool's `KINDS`), plus `d` for a
 * decision (whose ids are questions')
 * - a private copy:  importing `$/epics/tool/planDoc.types` here would load the tool's types into every call
 */
const KIND_LETTERS: Record<string, string> = {
  q: "question",
  c: "caveat",
  i: "issue",
  t: "todo",
  v: "test",
  d: "decision",
  j: "judgement"
}

/** The item kinds' words, which `add seo#judgement` takes too. */
const KIND_WORDS = Object.values(KIND_LETTERS)

/** The kinds, for a message:  `J judgement, Q question ...`. */
const KIND_HELP = Object.entries(KIND_LETTERS)
  .map(([letter, word]) => `${letter.toUpperCase()} ${word}`)
  .join(", ")

/** A phase's body fields, `phase-body`'s flags. */
const PHASE_BODY = ["symptom", "changes", "goal", "files", "verify"]

/** What `update` sets on a phase. */
const PHASE_FIELDS = [...PHASE_BODY, "estimate", "title", "html"]

/** What `update` sets on an item. */
const ITEM_FIELDS = ["title", "html", "calm", "loud"]

/** What `update` sets on the page. */
const PAGE_FIELDS = ["standing", "no-standing"]
