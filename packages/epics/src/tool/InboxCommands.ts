import { existsSync } from "node:fs"
import { relative } from "node:path"
import { setTimeout as sleep } from "node:timers/promises"

import { PlanDocError, type KeptNote, type MarkResult, type OptionCard } from "./planDoc.types"

import type { PlanDoc } from "./PlanDoc"
import type { PlanReader } from "./PlanReader"
import type { Flags, PlanDocCommands } from "./PlanDocCommands"
import { PlanItem } from "./PlanItem"
import {
  ACTIONS,
  InboxError,
  LISTEN_HEARTBEAT_MS,
  LISTEN_STALE_MS,
  ReviewInbox,
  type ListedMark,
  type ListedUrgency,
  type TakenWork
} from "./ReviewInbox"

/****************
 * ### `InboxCommands`
 * `spell dev plan-doc inbox <name> [<what> ...]`:  the review inbox of an epic's doc (`ReviewInbox`), from Claude's
 * side;  `<what>` none prints it.
 * - every inbox write goes through `ReviewInbox.update()` (the inbox's lock);  doc edits through
 *   `PlanDocCommands.edit()` (the doc's)
 * - the session's commands (`wait`, `apply`, `working`, `done`, `clear`) stamp its heartbeat (`touchListening()`):
 *   a session busy between `wait`s still counts as listening
 * - the loop, step by step:  `templates/epics/plan-doc.md`, "Review inbox"
 * - Prints through its owner (`PlanDocCommands`), whose files and edits it uses:  NOT a command line of its own.
 * - From `packages/docs/tools/plan-doc.js` `inbox()`, `printInbox()`, `waitForWork()`, `printWork()`,
 *   `applyInbox()` (epic `epic-components`, P7).
 ****************/
export class InboxCommands {
  /** the command line this belongs to:  its files, edits and output */
  readonly owner: PlanDocCommands

  constructor(owner: PlanDocCommands) {
    this.owner = owner
  }

  /**
   * `inbox <name> [<what> ...]`:  the review inbox of epic `name`'s doc at `file`;  resolves to the exit code
   * (`undefined` for 0).
   * - throws a `PlanDocError` for an unknown `what`, or a missing argument
   */
  async run(name: string, file: string, [what, ...args]: string[], flags: Flags): Promise<number | void> {
    const path = ReviewInbox.pathFor(file)
    switch (what) {
      case undefined:
        return this.print(this.owner.readAny(file), file, Boolean(flags.json))
      case "listen": {
        const session = typeof flags.session === "string" ? flags.session : process.env.CLAUDE_CODE_SESSION_ID
        if (!session) throw new PlanDocError("listen as which session?  --session <id> (no $CLAUDE_CODE_SESSION_ID)")
        ReviewInbox.update(path, (box) => box.setListening(session))
        return this.owner.print(`listening:  session ${session}`)
      }
      case "unlisten":
        ReviewInbox.update(path, (box) => box.setListening(null))
        return this.owner.print("listening:  nobody")
      case "wait":
        return this.waitForWork(name, file, flags)
      case "apply":
        return this.apply(name, file, args)
      case "working": {
        const id = ReviewInbox.toItemId(this.owner.need(args[0], "an item id"))
        const on = this.owner.need(args[1], "on | off")
        if (!["on", "off"].includes(on)) throw new PlanDocError(`working ${id} on | off, not '${on}'`)
        ReviewInbox.update(path, (box) => {
          box.setWorking(id, on === "on" ? workOf(box.marks[id]) : null)
          box.touchListening()
        })
        return this.owner.print(`${id.toUpperCase()} working:  ${on}`)
      }
      case "done":
      case "clear":
        return this.finish(file, what, args)
      default:
        throw new PlanDocError(`inbox what?  listen | unlisten | wait | apply | working | done | clear (not '${what}')`)
    }
  }

  ////////////////
  // ## Printing
  ////////////////

  /**
   * The doc's review inbox, for a reply or (`json`) a script.
   * - marks grouped by action (`ACTIONS`' order), oldest first, each with its item's title and whether it's sent
   *   (`sent: false`:  newer than the last "send to Claude";  an immediate one, `details` or revisit `now`, counts
   *   as sent:  `unsentMarks`)
   * - an item gone from the doc since it was marked:  title `null`, "(no such item)"
   */
  private print(plan: PlanReader, file: string, json: boolean): void {
    const path = ReviewInbox.pathFor(file)
    const inbox = ReviewInbox.read(path)
    const unsent = new Set(inbox.unsentMarks.map((mark) => mark.id))
    const unsentUrgency = new Set(inbox.unsentUrgency.map((entry) => entry.id))
    const marks = Object.fromEntries(ACTIONS.map((action) => [action, [] as PrintedMark[]]))
    for (const mark of inbox.markList) {
      const item = plan.findItem(mark.id)
      marks[mark.action]?.push({ ...mark, title: item ? PlanItem.titleOf(item) : null, sent: !unsent.has(mark.id) })
    }
    const report = {
      file: path,
      sent: inbox.sent,
      unsent: unsent.size,
      marks,
      now: inbox.now,
      working: inbox.working,
      drafts: inbox.drafts,
      urgency: inbox.urgencyList.map((entry) => ({ ...entry, sent: !unsentUrgency.has(entry.id) })),
      // `live:  false`:  its heartbeat stopped (`liveListener()`):  the session is gone, the page says nobody
      listening: inbox.listening && { ...inbox.listening, live: !!inbox.liveListener() }
    }
    if (json) return this.owner.print(JSON.stringify(report, null, 2))
    const lines = [`inbox:  ${relative(this.owner.files.root, path)}${existsSync(path) ? "" : "  (none:  no marks)"}`]
    const { listening } = inbox
    lines.push(
      !listening
        ? "listening:  nobody (no Claude session is reviewing this doc)"
        : inbox.liveListener()
          ? `listening:  session ${listening.session}, since ${listening.since}`
          : `listening:  nobody (session ${listening.session} last seen ${listening.seen ?? listening.since}, over ${LISTEN_STALE_MS / 1000}s ago:  gone without \`unlisten\`)`
    )
    lines.push(`sent:  ${inbox.sent ?? "never"};  ${unsent.size + unsentUrgency.size} unsent`)
    for (const action of ACTIONS) {
      if (!marks[action].length) continue
      lines.push(`${action} (${marks[action].length}):`)
      for (const mark of marks[action])
        lines.push(`  - ${mark.id.toUpperCase()}  ${mark.title ?? "(no such item)"}${extra(mark)}`)
    }
    const urgency = inbox.urgencyList
    if (urgency.length) lines.push(`urgency, from the id chips (${urgency.length}):`)
    for (const entry of urgency) {
      const item = plan.findItem(entry.id)
      const title = item ? PlanItem.titleOf(item) : "(no such item)"
      lines.push(
        `  - ${entry.id.toUpperCase()}  ${title}  · ${calmWords(entry.calm)}${unsentUrgency.has(entry.id) ? " · unsent" : ""}`
      )
    }
    if (inbox.now.length) lines.push(`now (${inbox.now.length}):`)
    for (const each of inbox.now)
      lines.push(`  - ${each.id.toUpperCase()}  ${each.action}${each.note ? `  "${each.note}"` : ""}  (${each.at})`)
    const working = Object.entries(inbox.working)
    if (working.length) lines.push(`working (${working.length}):`)
    for (const [id, { action, since }] of working) lines.push(`  - ${id.toUpperCase()}  ${action}  (since ${since})`)
    const drafts = Object.entries(inbox.drafts)
    if (drafts.length) lines.push(`drafts, still being written (${drafts.length}):`)
    for (const [id, { action, note, at }] of drafts)
      lines.push(`  - ${id.toUpperCase()}  ${action}  "${note.trim()}"  (${at})`)
    this.owner.print(lines.join("\n"))

    /** A mark's own fields after its title:  the pick, a revisit's when and note, unsent. */
    function extra(mark: PrintedMark) {
      const parts: string[] = []
      if (mark.pick) parts.push(`picks ${mark.pick}`)
      if (mark.when) parts.push(mark.when)
      if (mark.note) parts.push(`"${mark.note}"`)
      if (!mark.sent) parts.push("unsent")
      else if (ReviewInbox.isImmediate(mark)) parts.push("requested now")
      return parts.length ? `  · ${parts.join(" · ")}` : ""
    }
  }

  ////////////////
  // ## Waiting
  ////////////////

  /**
   * `inbox <name> wait`:  poll the inbox every second until there's work (`hasWork`), TAKE it under the lock
   * (`takeWork()`) and print it (`printWork()`);  none by `timeout` seconds (default 3300, 55 minutes):  exit code 2.
   * - how a `/epic review` session hears the page:  run in the background, its EXIT wakes the session
   * - the poll reads without the lock (atomic writes:  never half a file);  only taking locks
   * - the session's HEARTBEAT:  stamps `listening.seen` at the start and every `LISTEN_HEARTBEAT_MS`
   *   (`touchListening()`, one locked write), so a session killed mid-wait goes stale on the page (`liveListener()`)
   */
  private async waitForWork(name: string, file: string, { timeout = "3300", json }: Flags): Promise<number | void> {
    const path = ReviewInbox.pathFor(file)
    const seconds = Number(timeout)
    if (!(seconds > 0)) throw new PlanDocError(`--timeout in seconds, not '${timeout}'`)
    const end = Date.now() + seconds * 1000
    let beat = 0
    for (;;) {
      let work = null as TakenWork | null
      if (peek(path).hasWork) ReviewInbox.update(path, (box) => (work = box.takeWork()))
      if (work) return this.printWork(name, this.owner.readAny(file), work, Boolean(json))
      if (Date.now() >= end) break
      if (Date.now() - beat >= LISTEN_HEARTBEAT_MS) {
        beat = Date.now()
        heartbeat()
      }
      await sleep(1000)
    }
    if (json) this.owner.print(JSON.stringify({ timeout: seconds, now: [], sent: null }))
    else this.owner.print(`nothing to do:  no send and no request in ${seconds}s`)
    return 2

    /** The inbox, or an empty one while it can't be read (hand-edited mid-poll):  the next poll tries again. */
    function peek(path: string): ReviewInbox {
      try {
        return ReviewInbox.read(path)
      } catch (error) {
        if (error instanceof InboxError) return new ReviewInbox()
        throw error
      }
    }

    /**
     * Stamp the listening session's heartbeat;  nobody listening:  no write at all.  A file that can't be read
     * (hand-edited mid-poll) is skipped:  the next beat tries again.
     */
    function heartbeat() {
      if (!peek(path).listening) return
      try {
        ReviewInbox.update(path, (box) => box.touchListening())
      } catch (error) {
        if (!(error instanceof InboxError)) throw error
      }
    }
  }

  /**
   * Print the work `wait` took (`takeWork()`'s `{ now, sent, canceled }`), each mark with its item
   * (`describeItem()`):  id, kind, status, title, the mark, the note, a pick's option card.
   * - plain lines for Claude to read, then what to run next;  `json`:  `{ now, sent, canceled }` with `item` (and
   *   `option`) on each
   */
  private printWork(name: string, plan: PlanReader, work: TakenWork, json: boolean): void {
    const now = work.now.map((each) => withItem(each))
    const sent = work.sent && {
      at: work.sent.at,
      marks: work.sent.marks.map((mark) => withItem(mark)),
      urgency: (work.sent.urgency ?? []).map((entry) => withItem(entry))
    }
    const canceled = (work.canceled ?? []).map((each) => withItem(each))
    if (json) return this.owner.print(JSON.stringify({ now, sent, canceled }, null, 2))
    const lines: string[] = []
    if (canceled.length) {
      lines.push(
        `canceled (${canceled.length}):  Owen said "nevermind":  stop each one's background agent (TaskStop), then ` +
          `\`yarn plan-doc inbox ${name} done <id>\``
      )
      for (const each of canceled) lines.push(`  - ${line(each)}  (${each.action})`)
    }
    if (now.length) {
      lines.push(
        `now (${now.length}):  start a background agent for each;  \`yarn plan-doc inbox ${name} done <id>\` after`
      )
      for (const each of now) {
        lines.push(`  - ${line(each)}`)
        if (each.action === "details") lines.push("      Add Details")
        else if (each.pick)
          lines.push(`      revisit now:  ${PlanItem.pickAsks(each.pick, each.option ?? undefined, each.note)}`)
        else lines.push(`      revisit now${each.note ? `:  "${each.note}"` : ""}`)
      }
    }
    if (sent) {
      const urgency = sent.urgency.length ? `, ${sent.urgency.length} urgency` : ""
      lines.push(`sent ${sent.at} (${sent.marks.length} mark${sent.marks.length === 1 ? "" : "s"}${urgency}):`)
      for (const action of ACTIONS) {
        const marks = sent.marks.filter((mark) => mark.action === action)
        if (!marks.length) continue
        lines.push(`  ${action === "revisit" ? "revisit, to talk over" : action} (${marks.length}):`)
        for (const mark of marks) {
          lines.push(`    - ${line(mark)}${mark.again ? "  (sent before)" : ""}`)
          // a revisit with a pick:  "pick B, but ...", one line
          if (mark.action === "revisit" && mark.pick)
            lines.push(`        ${PlanItem.pickAsks(mark.pick, mark.option ?? undefined, mark.note)}`)
          else {
            if (mark.option) lines.push(`        picks ${mark.pick} · ${mark.option.title}`)
            else if (mark.pick) lines.push(`        picks ${mark.pick} (no such option card)`)
            if (mark.note) lines.push(`        note:  "${mark.note}"`)
          }
        }
      }
      if (sent.urgency.length) lines.push(`  urgency, from the id chips (${sent.urgency.length}):`)
      for (const entry of sent.urgency) lines.push(`    - ${line(entry)}  · ${calmWords(entry.calm)}`)
      const talk = sent.marks.filter((mark) => mark.action === "revisit")
      lines.push(`next:  \`yarn plan-doc inbox ${name} apply\` (approve, pick, todo, urgency)`)
      if (talk.length)
        lines.push(
          `then talk over ${talk.map((mark) => mark.id).join(", ")} in the chat;  \`yarn plan-doc inbox ${name} clear <id>\` after each`
        )
    }
    this.owner.print(lines.join("\n"))

    /** `mark` (or a `now` request) with its item, upper-case id, and a pick's option card. */
    function withItem<M extends { id: string; pick?: string }>(mark: M) {
      const item = plan.describeItem(mark.id)
      const element = item && plan.findItem(mark.id)
      const option: OptionCard | null | undefined =
        mark.pick && element ? (plan.optionCards(element).find((card) => card.letter === mark.pick) ?? null) : undefined
      return { ...mark, id: mark.id.toUpperCase(), item, ...(option !== undefined && { option }) } as M & {
        item: typeof item
        option?: OptionCard | null
      }
    }

    /** `Q7  question, open · <title>` */
    function line(mark: { id: string; item: ReturnType<PlanReader["describeItem"]> }) {
      if (!mark.item) return `${mark.id}  (no such item)`
      return `${mark.id}  ${mark.item.kind}, ${mark.item.status} · ${mark.item.title}`
    }
  }

  ////////////////
  // ## Taking marks
  ////////////////

  /**
   * `inbox <name> apply [ids...]`:  apply the SENT mechanical marks (`PlanDoc.applyMark()`:  approve, pick, todo),
   * and the sent urgency (an id chip clicked:  `PlanDoc.setCalm()`), all or those of `ids`, then clear them;  prints
   * a line per item, and what it left.
   * - a dry run on a parsed copy first:  the doc is written (`edit()`, its lock) only when something applies
   * - marks cleared under the inbox's lock, only while still the ones applied (`clearApplied()`, `clearUrgency()`);
   *   marks of items gone from the doc are dropped too
   * - `ids` without a sent mark:  named, left alone (unsent marks wait for Owen's send)
   */
  private async apply(name: string, file: string, ids: string[]): Promise<void> {
    const path = ReviewInbox.pathFor(file)
    const want = ids.length ? new Set(ids.map(ReviewInbox.toItemId)) : null
    const inbox = ReviewInbox.read(path)
    const marks = inbox.sentMarks.filter((mark) => !want || want.has(mark.id))
    const urgency = inbox.sentUrgency.filter((entry) => !want || want.has(entry.id))
    const dry = this.owner.read(file)
    const planned: Applied[] = marks.map((mark) => ({ mark, ...dry.applyMark(mark) }))
    const plannedUrgency = urgency.map((entry) => urgencyOn(dry, entry))
    const changes = planned.some((each) => each.applied) || plannedUrgency.some((each) => each.changed)
    const { results, calmed } = changes
      ? await this.owner.edit(file, (plan) => ({
          results: marks.map((mark): Applied => ({ mark, ...plan.applyMark(mark) })),
          calmed: urgency.map((entry) => urgencyOn(plan, entry))
        }))
      : { results: planned, calmed: plannedUrgency }
    const cleared = results.filter((each) => each.applied || each.gone).map((each) => each.mark)
    ReviewInbox.update(path, (box) => {
      box.clearApplied(cleared)
      box.clearUrgency(calmed.map((each) => each.entry))
      box.touchListening()
    })
    const lines: string[] = []
    for (const each of results) if (each.applied) lines.push(`${each.mark.id.toUpperCase()}  ${each.did}`)
    for (const each of calmed) lines.push(`${each.entry.id.toUpperCase()}  ${each.did}`)
    const left = results.filter((result) => !result.applied)
    if (left.length) lines.push("left:")
    for (const each of left)
      if (!each.applied) lines.push(`  ${each.mark.id.toUpperCase()}  ${each.mark.action}:  ${each.left}`)
    for (const id of want ?? [])
      if (!marks.some((mark) => mark.id === id) && !urgency.some((entry) => entry.id === id))
        lines.push(`  ${id.toUpperCase()}:  no sent mark`)
    this.owner.print(
      lines.length ? lines.join("\n") : `nothing to apply:  no sent marks (\`yarn plan-doc inbox ${name}\`)`
    )
  }

  /**
   * `done` / `clear` items `ids`:  their marks go (`done` keeps one Owen changed while the agent worked,
   * `finishMarks()`;  `clear` drops it), and their `working` too.
   * - a mark leaving with Owen's note in it:  the note is kept IN the item first, as his own reply card
   *   (`PlanDoc.keepNote()`, epic `windows-and-review` P1):  what he wrote is never lost from the page
   * - a revisit taken care of (talked over, or answered now) stays marked as reviewed that way on the page
   */
  private async finish(file: string, what: "done" | "clear", ids: string[]): Promise<void> {
    if (!ids.length) throw new PlanDocError(`${what} which items?  ids`)
    // before the inbox changes:  a note it drops must land in the doc, which an old-markup doc refuses
    this.owner.files.requireNewMarkup(file)
    const path = ReviewInbox.pathFor(file)
    const keys = ids.map(ReviewInbox.toItemId)
    let had: string[] = []
    let kept: string[] = []
    let notes: { id: string; mark: KeptNote }[] = []
    ReviewInbox.update(path, (box) => {
      const before = { ...box.marks }
      if (what === "done") ({ had, kept } = box.finishMarks(keys))
      else had = box.clearMarks(keys)
      notes = had.filter((id) => before[id]?.note).map((id) => ({ id, mark: before[id] as KeptNote }))
      for (const id of keys) box.setWorking(id, null)
      box.touchListening()
    })
    const revisits = notes.filter(({ mark }) => mark.action === "revisit")
    if (notes.length)
      await this.owner.edit(file, (plan) => {
        for (const { id, mark } of notes) plan.keepNote(id, mark)
        for (const { id } of revisits) {
          const item = plan.findItem(id)
          if (item) plan.reviewedAs(item, "revisit")
        }
      })
    const none = keys.filter((id) => !had.includes(id) && !kept.includes(id))
    const label = what === "done" ? "done" : "cleared"
    const extras = [
      none.length ? `no mark:  ${upper(none)}` : "",
      kept.length ? `changed since, kept for the next send:  ${upper(kept)}` : "",
      notes.length ? `Owen's note kept in the doc:  ${upper(notes.map(({ id }) => id))}` : ""
    ].filter(Boolean)
    this.owner.print(`${label}:  ${upper(keys)}${extras.length ? `  (${extras.join(";  ")})` : ""}`)
  }
}

/** A mark as `inbox` prints it:  with its item's title (`null` when the item's gone), and whether it's sent. */
type PrintedMark = ListedMark & { title: string | null; sent: boolean }

/** A sent mark and what `PlanDoc.applyMark()` did with it. */
type Applied = { mark: ListedMark } & MarkResult

/** A sent urgency and what `urgencyOn()` did with it:  `changed` when the doc changed. */
type UrgencyApplied = { entry: ListedUrgency; did: string; changed: boolean }

/**
 * Apply sent urgency `entry` to `plan` (`PlanDoc.setCalm()`), logged;  an item gone from the doc, or already so,
 * changes nothing (its entry is cleared all the same).
 */
function urgencyOn(plan: PlanDoc, entry: ListedUrgency): UrgencyApplied {
  if (!plan.findItem(entry.id)) return { entry, did: "no such item:  urgency dropped", changed: false }
  const did = plan.setCalm(entry.id, entry.calm)
  if (!did) return { entry, did: `${calmWords(entry.calm)} already`, changed: false }
  plan.log(`${entry.id.toUpperCase()} ${did} (Owen, from its id chip)`)
  return { entry, did: `marked ${did}`, changed: true }
}

/** `not urgent` (calm) / `urgent`. */
function calmWords(calm: boolean): string {
  return calm ? "not urgent" : "urgent"
}

/** What an agent works on for a mark:  a revisit's answer, else details. */
function workOf(mark: { action: string } | undefined): "revisit" | "details" {
  return mark?.action === "revisit" ? "revisit" : "details"
}

/** `["q7", "i2"]` -> `Q7, I2` */
function upper(ids: string[]): string {
  return ids.map((id) => id.toUpperCase()).join(", ")
}
