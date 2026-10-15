// Import directly, not through `$/cli`:  the barrel loads spell, and `epic` must start fast (`epicMain.ts`)
import { CliError } from "$/cli/cli.types"

/**
 * How an `epic <verb> ...` command line becomes the `epic` tool's (`spell dev plan-doc <verb> <name> ...`):
 * a thin translation, so the tool itself (`$/epics/tool/PlanDocCommands`) keeps its arguments.
 * - Owen's scheme (Command Review Page, 2026-10-12):  `epic <verb> <epic>#<id>` for anything inside an epic page
 *   - `seo`:  the page
 *   - `seo#J3`:  an item (or a comment, `seo#cm3`;  or an Overview section)
 *   - `seo#P3`:  a phase, by its number, the one way help and messages write it;  `seo#p3` and `seo#3` read the
 *     same.  `seo#p-epic-migrate`:  by its stable id (epic `epic-workflow` P15);  a verb that takes only a phase
 *     (`phase`, `updated`, `add-request`) takes its name too (`seo#epic-migrate`, `"seo#Epic Migrate"`):  the tool
 *     finds it (`PlanDoc.phaseNumber()`)
 *   - `seo#J`:  a NEW item of that kind, for `add`
 * - The tool's own order, with no `#` (`epic close seo J3`), is REFUSED, the message spelling it right
 *   (`epic close seo#J3`):  run silently, it taught agents the old shape (epic `epic-workflow` P19).
 *   `spell dev plan-doc close seo J3` still runs it:  that's the tool's own command line, not this.
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
  if (target && ref === undefined) refuseOldOrder(verb, args, at, target.epic)
  // no epic at all (`epic close`):  which, rather than the tool's whole usage
  if (!target && !NO_EPIC_VERBS.includes(verb)) throw new CliError(`${verb}:  which epic?  epic ${verb} --help`)
  switch (verb) {
    case "add": {
      if (ref === undefined) return [["add", ...args]]
      const kind = kindOf(ref)
      if (!kind) throw new CliError(`add:  ${args[at]}?  a kind after the #, e.g. ${target!.epic}#J (${KIND_HELP})`)
      return [["add", ...around([kind])]]
    }
    case "phase":
    case "updated":
      return [[verb, ...around(ref === undefined ? [] : [needPhase(verb, args[at]!, ref)])]]
    case "add-request":
      return [["request", ...around(ref === undefined ? [] : [needPhase(verb, args[at]!, ref)])]]
    case "commit": {
      if (ref === undefined) return [["commit", ...args]]
      const phase = phaseOf(ref)
      return [["commit", ...around([]), ...(phase === undefined ? ["--item", ref] : ["--phase", phase])]]
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
    case "saga":
      // its own verbs and arguments (`saga set seo epics`):  no epic page to aim at
      return [["saga", ...args]]
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

/**
 * The phase a ref names, as the tool takes it:  a number (`P3`, `p3`, `3` -> `3`), or a stable id as it is
 * (`p-epic-migrate`);  `undefined` when it names something else (an item, or a phase's name:  `phaseRef()`).
 */
export function phaseOf(ref: string): string | undefined {
  const match = PHASE_REF.exec(ref)
  if (match) return match[1]
  return STABLE_PHASE_ID.test(ref) ? ref : undefined
}

/**
 * A ref where only a phase may go:  `phaseOf()`'s, else as typed (a phase's name or slug:  the tool finds it).
 * - a usage error for an item's id (`seo#J3`), saying `verb` takes a phase
 */
function needPhase(verb: string, text: string, ref: string): string {
  const phase = phaseOf(ref)
  if (phase !== undefined) return phase
  if (ITEM_REF.test(ref)) throw new CliError(`${verb}:  ${text}?  a phase, e.g. ${text.split("#")[0]}#P3`)
  return ref
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
  const what = ref === undefined ? "the page" : phase === undefined ? `item ${ref}` : `phase ${phaseLabel(phase)}`
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
    if (body.length) runs.push(["phase-body", epic, phase, ...body])
    if ("estimate" in flags) runs.push(["estimate", epic, phase, value("estimate")])
    rename(/^\d+$/.test(phase) ? `P${phase}` : phase)
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

/** A phase as said:  `P3` for `3`, a stable id as it is. */
export function phaseLabel(phase: string): string {
  return /^\d+$/.test(phase) ? `P${phase}` : phase
}

/**
 * A usage error for the tool's old order, with no `#`, spelling it right:  `epic close seo J3` -> "epic close seo#J3".
 * - for the verbs whose target is inside the page:  an item, a phase, a new item's kind, `inbox`'s item verbs;
 *   `update` and `commit` given their target as a word or a flag
 * - nothing after the epic:  which item or phase, with an example
 * - `epic`:  the epic, as typed;  `at`:  its place in `args`
 */
function refuseOldOrder(verb: string, args: string[], at: number, epic: string): void {
  const word = args[at + 1]?.startsWith("--") ? undefined : args[at + 1]
  const more = args.length > at + 2 ? " ..." : ""
  const respell = (ref: string, rest = more) => {
    const spelled = `epic ${verb} ${addressOf(epic, ref)}${rest}`
    return new CliError(`${verb}:  ${spelled}  (the id goes after a #, not "${epic} ${word}")`)
  }
  const which = (what: string, example: string) => new CliError(`${verb}:  which ${what}?  epic ${verb} ${example}`)
  if (ITEM_VERBS.includes(verb) || verb === "restore") {
    if (word !== undefined) throw respell(word)
    throw which("item", `${epic}#J3${ITEM_EXAMPLES[verb] ?? ""}`)
  }
  if (PHASE_VERBS.includes(verb)) {
    if (word !== undefined) throw respell(phaseLabel(phaseOf(word) ?? word))
    throw which("phase", `${epic}#P3${PHASE_EXAMPLES[verb] ?? ""}`)
  }
  switch (verb) {
    case "add": {
      const kind = word === undefined ? undefined : kindOf(word)
      if (kind) throw respell(kindLetter(kind))
      throw which("kind of item", `${epic}#J "Title"  (${KIND_HELP})`)
    }
    case "commit": {
      // the tool's order:  `commit seo <sha> "..." --phase 3 | --item J3`
      const phase = valueAfter(args, "--phase")
      const ref = phase !== undefined ? phaseLabel(phaseOf(phase) ?? phase) : (valueAfter(args, "--item") ?? "P3")
      throw new CliError(
        `commit:  epic commit ${addressOf(epic, ref)} <sha> "what it did"  (the phase or item goes after a #)`
      )
    }
    case "inbox": {
      if (word === undefined || !INBOX_ITEM_VERBS.includes(word)) return
      const id = args[at + 2]
      if (id === undefined) throw which("item", `${epic}#J3 ${word}${word === "working" ? " on" : ""}`)
      const rest = args.slice(at + 3)
      throw new CliError(
        `inbox:  epic inbox ${addressOf(epic, id)} ${word}${rest.length ? ` ${rest.join(" ")}` : ""}  ` +
          `(the id goes after a #, not "${epic} ${word} ${id}")`
      )
    }
    case "update":
      if (word !== undefined) throw respell(phaseLabel(phaseOf(word) ?? word), " --<field> <value> ...")
  }
}

/** The word after flag `flag` in `args`;  `undefined` without one. */
function valueAfter(args: string[], flag: string): string | undefined {
  const at = args.indexOf(flag)
  return at === -1 ? undefined : args[at + 1]
}

/** `epic#ref`, quoted when it has a space (a phase's name):  `seo#P3`, `"seo#Epic Migrate"`. */
function addressOf(epic: string, ref: string): string {
  const address = `${epic}#${ref}`
  return address.includes(" ") ? `"${address}"` : address
}

/** A kind's letter, for `add seo#J`:  `judgement` -> `J`. */
function kindLetter(kind: string): string {
  return Object.entries(KIND_LETTERS)
    .find(([, word]) => word === kind)![0]
    .toUpperCase()
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

/**
 * Verbs that run with no epic named:  on every epic (`list`, `migrate`), or by a flag (`split --done`,
 * `backfill --all`, `convert --all`), or not on one (`saga`'s own verbs, `summaries`' files).
 */
const NO_EPIC_VERBS = ["list", "migrate", "split", "backfill", "convert", "saga", "summaries", "update"]

/** Verbs on one phase, its ref after the epic:  `epic phase seo#P3 done` -> `phase seo 3 done`. */
const PHASE_VERBS = ["phase", "updated", "add-request"]

/** `inbox`'s verbs on one item (`epic inbox seo#J3 done`), as against the page's (`listen`, `wait`, `apply` ...). */
const INBOX_ITEM_VERBS = ["working", "done", "clear"]

/** What follows the item in an example, for the verbs that take more:  `epic status seo#J3 underway "..."`. */
const ITEM_EXAMPLES: Record<string, string> = {
  decide: ' "answer"',
  cancel: ' ["why"]',
  details: " --file <reply.html>",
  status: ' underway "<reading>"',
  review: ' ["outcome"]',
  queue: ' "the work"',
  restore: " --file <old.html>"
}

/** What follows the phase in an example:  `epic phase seo#P3 done`. */
const PHASE_EXAMPLES: Record<string, string> = {
  phase: " todo | active | done",
  updated: ' "<html>"',
  "add-request": " <request id>"
}

/** A phase ref by number:  `P3`, `p3`, `3`. */
const PHASE_REF = /^[Pp]?(\d+)$/

/** An item's id (or a comment's, an Overview section's):  `J3`, `cm3`, `o2`. */
const ITEM_REF = /^[A-Za-z]{1,2}\d+$/

/** A phase's stable id (`$/epics` `PhaseIds`, copied:  `epic` imports no barrel):  `p-epic-migrate`. */
const STABLE_PHASE_ID = /^p-[a-z0-9]+(?:-[a-z0-9]+)*$/

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
