/** A kind of block (`table`, `field` ...):  lower case;  the page's runtime names them (`BlockAnchors.js`). */
const KIND = /^[a-z][a-z-]{0,19}$/

/** An anchor (`BlockAnchors.js`):  an id, or `<section id | page>#<kind>-<n>`;  no white space. */
const ANCHOR = /^[^\s#]{1,200}(?:#[a-z][a-z-]{0,19}-\d{1,4})?$/

/** Longest comment Owen may write, in characters:  a few screens. */
const MAX_TEXT = 20_000

/** Longest quote kept, in characters:  a paragraph or two. */
const MAX_QUOTE = 2_000

/** Longest label or excerpt kept, in characters. */
const MAX_LABEL = 200

/** A comment's statuses (`Comment.status`). */
const STATUSES: readonly string[] = ["new", "taken", "answered"]

/** How Owen closes a thread (`resolve()`):  "that's good", or "skip it". */
const RESOLUTIONS: readonly string[] = ["good", "skip"]

/** Who writes Owen's replies (`reply()`):  the name on them. */
const OWEN = "Owen"

/** A commit, as Claude names one under an answer (`answer()`):  7-40 hex digits. */
const COMMIT = /^[0-9a-f]{7,40}$/

/** Characters that draw nothing and that `trim()` keeps:  zero-width spaces, joiners, the word joiner. */
const INVISIBLE = /[​-‍⁠]/g

/****************
 * ### `CommentsError`
 * A problem the person should see as a message, not a stack trace:  a bad anchor, a missing comment, one that can't
 * change any more.
 * - `status`:  the HTTP status the page server answers with (400 bad input, 404 no such comment, 409 not now)
 ****************/
export class CommentsError extends Error {
  declare cause: { status?: number } | undefined
  /** HTTP status for the page server;  400 unless the cause says otherwise. */
  get status(): number {
    return this.cause?.status ?? 400
  }
}
CommentsError.prototype.name = "CommentsError"

/****************
 * ### `CommentList`
 * COMMENTS Owen leaves on a page's blocks (epic `airplane`, P11), as an inbox file holds them:
 * `{ cm1: {...}, cm2: {...} }`, edited in place.
 * - two homes, one shape:
 *   - a docs page's own inbox file, `<page>.inbox.json` (`GuideInbox`, `packages/docs/tools`)
 *   - a plan doc's review inbox, its `comments` (`ReviewInbox`)
 * - each comment:  where it is (`anchor`, `kind`, `label`, `excerpt`, and for a comment on selected text its
 *   `quote` and `offset`:  `packages/docs/tools/BlockAnchors.js`), Owen's text, when, and its status:
 *   - `new`:  saved, waiting for Claude;  Owen may edit or delete it
 *   - any status:  Owen may CLEAR it (`clear()`):  gone from the inbox, its highlight with it
 *   - deleted or cleared:  the page's Undo puts it back as it was (`restore()`)
 *   - `taken`:  Claude took it:  a guide's into epic `guide-changes` (`taken`:  which phase)
 *   - `answered`:  Claude answered it (a plan doc's:  in the doc;  `replies` may hold the answer)
 * - a THREAD (Owen, 2026-10-10:  "the entire comment thread should be in one collapsable pane"):  the comment, then
 *   `replies` in order, Claude's (`answer()`) and Owen's (`reply()`), then maybe `done` (`resolve()`)
 *   - WHOSE TURN (`turnOf()`):  Owen's once Claude spoke last;  Claude's while Owen did;  nobody's once done
 *   - WAITING (`waiting`):  Claude's turn, and he hasn't taken it yet.  So a reply on a thread is new work, as a
 *     new comment is (`/epic review`, `/airplane land`, `spell dev comments gather`)
 *     - a plan doc's waiting comment goes to Claude with its page's Send, as a mark does:
 *       `ReviewInbox.unsentComments`, by Owen's last words (`lastWordsAt()`)
 *   - WORKING (`setWorking()`):  Claude is thinking about it now;  the page shows a "Claude: thinking…" stub at the
 *     thread's end until his answer lands (`answer()` turns it off).  What Owen said before it counts as read:  not
 *     waiting any more, and his last reply no longer his to change (a new one goes after it)
 * - pure:  no files;  the owner reads and writes them under its lock
 ****************/
export class CommentList {
  /** - `comments`:  the inbox's record, by id;  edited IN PLACE */
  constructor(readonly comments: Record<string, Comment>) {}

  ////////////////
  // ## Reading
  ////////////////

  /** Every comment with its id, in the order written. */
  get all(): IdentifiedComment[] {
    return Object.entries(this.comments)
      .map(([id, comment]) => ({ id, ...comment }))
      .sort((a, b) => numberOf(a.id) - numberOf(b.id))
  }

  /**
   * The comments waiting for Claude:  new ones, and threads Owen replied on since Claude last answered or took them
   * (`isWaiting()`).
   */
  get waiting(): IdentifiedComment[] {
    return this.all.filter((comment) => CommentList.isWaiting(comment))
  }

  /**
   * Whose turn it is on `comment`'s thread:
   * - `done`:  Owen closed it (`resolve()`)
   * - `owen`:  Claude spoke last.  Also a plan doc's comment answered in the doc, with no words here.
   * - `claude`:  Owen spoke last (the comment, or his reply).  Claude may have TAKEN it, but hasn't answered yet.
   */
  static turnOf(comment: Comment): Turn {
    if (comment.done) return "done"
    const last = comment.replies?.at(-1)
    if (last) return last.by === OWEN ? "claude" : "owen"
    return comment.status === "answered" ? "owen" : "claude"
  }

  /** Is `comment` new work for Claude:  his turn, and not taken (nor being worked on) since Owen last spoke? */
  static isWaiting(comment: Comment): boolean {
    if (CommentList.turnOf(comment) !== "claude") return false
    const spoke = comment.replies?.findLast((reply) => reply.by === OWEN)?.at ?? comment.at
    const held = heldSince(comment)
    return !held || held < spoke
  }

  /**
   * When Owen last changed his words on `comment`'s thread, ISO:
   * the latest of the comment, his replies, and their edits.
   * - what a plan doc's Send compares with its `sent` (`ReviewInbox.unsentComments`):
   *   words newer than the last send haven't gone to Claude yet
   */
  static lastWordsAt(comment: Comment): string {
    const times = [comment.at, comment.edited]
    for (const reply of comment.replies ?? []) if (reply.by === OWEN) times.push(reply.at, reply.edited)
    return times
      .filter((each): each is string => !!each)
      .reduce((latest, each) => (Date.parse(each) > Date.parse(latest) ? each : latest))
  }

  /** Comment `id`;  throws a 404 `CommentsError` when there's none. */
  comment(id: string): Comment {
    const comment = Object.hasOwn(this.comments, id) ? this.comments[id] : undefined
    if (!comment) throw new CommentsError(`no comment ${id} here`, { cause: { status: 404 } })
    return comment
  }

  /** Is `id` a comment's id (`cm3`), not an item's? */
  static isCommentId(id: string): boolean {
    return /^cm\d+$/.test(id)
  }

  ////////////////
  // ## Owen's edits (the page's bullhorns)
  ////////////////

  /**
   * Add a comment on the block at `where`;  returns its id (`cm3`).
   * - throws on a bad anchor or kind, or blank text
   */
  add(where: CommentPlace, text: string, now = new Date()): string {
    const { anchor, kind, quote, offset } = where
    if (typeof anchor !== "string" || !ANCHOR.test(anchor)) throw new CommentsError(`"${anchor}" isn't an anchor`)
    if (typeof kind !== "string" || !KIND.test(kind)) throw new CommentsError(`"${kind}" isn't a kind of block`)
    const id = this.nextId()
    const comment: Comment = {
      anchor,
      kind,
      label: short(where.label),
      excerpt: short(where.excerpt),
      text: checkedText(text),
      at: now.toISOString(),
      status: "new"
    }
    if (typeof quote === "string" && quote.trim()) {
      comment.quote = quote.trim().slice(0, MAX_QUOTE)
      comment.offset = Number.isInteger(offset) && Number(offset) >= 0 ? Number(offset) : 0
    }
    this.comments[id] = comment
    return id
  }

  /** Replace comment `id`'s text;  only while it's `new`. */
  edit(id: string, text: string, now = new Date()): void {
    const comment = this.unseen(id)
    comment.text = checkedText(text)
    comment.edited = now.toISOString()
  }

  /** Delete comment `id`;  only while it's `new`. */
  remove(id: string): void {
    this.unseen(id)
    delete this.comments[id]
  }

  /**
   * Clear comment `id`, whatever its status:  Owen's done with it (Owen, 2026-10-10:  "I should be able to clear a
   * comment").  A taken one stays in the epic it went into;  an answered one's answer goes with it.
   */
  clear(id: string): void {
    this.comment(id)
    delete this.comments[id]
  }

  /**
   * Put back comment `comment`, deleted or cleared a moment ago, as it was:  its place, text, dates, status, the
   * phase it went into and Claude's answers (the page's Undo, Owen 2026-10-10:  "didn't know it needed two clicks").
   * Returns its id:  `id` again, unless a new comment took it meanwhile;  then the next free one.
   * - throws on what `add()` refuses (a bad anchor or kind, blank text), or a status that isn't one
   */
  restore(id: string, comment: Comment): string {
    const { anchor, kind, quote, offset, status, taken, replies, edited, done } = comment ?? ({} as Comment)
    if (typeof anchor !== "string" || !ANCHOR.test(anchor)) throw new CommentsError(`"${anchor}" isn't an anchor`)
    if (typeof kind !== "string" || !KIND.test(kind)) throw new CommentsError(`"${kind}" isn't a kind of block`)
    if (!STATUSES.includes(status)) throw new CommentsError(`"${status}" isn't a comment's status`)
    const back: Comment = {
      anchor,
      kind,
      label: short(comment.label),
      excerpt: short(comment.excerpt),
      text: checkedText(comment.text),
      at: stamp(comment.at) ?? new Date().toISOString(),
      status
    }
    if (typeof quote === "string" && quote.trim()) {
      back.quote = quote.trim().slice(0, MAX_QUOTE)
      back.offset = Number.isInteger(offset) && Number(offset) >= 0 ? Number(offset) : 0
    }
    if (stamp(edited)) back.edited = stamp(edited)
    if (taken && typeof taken.epic === "string" && Number.isInteger(taken.phase))
      back.taken = { epic: taken.epic, phase: taken.phase, at: stamp(taken.at) ?? back.at }
    const thread = Array.isArray(replies) ? replies.flatMap((reply) => restoredReply(reply, back.at)) : []
    if (thread.length) back.replies = thread
    if (done && RESOLUTIONS.includes(done.how)) back.done = { how: done.how, at: stamp(done.at) ?? back.at }
    const free = CommentList.isCommentId(id) && !Object.hasOwn(this.comments, id)
    const restored = free ? id : this.nextId()
    this.comments[restored] = back
    return restored
  }

  ////////////////
  // ## Owen's thread (the page's threads)
  ////////////////

  /**
   * Owen's reply on comment `id`'s thread (Revisit:  saved as he types).
   * - his PENDING reply (the last entry, his, not taken since) takes `text`;  else a new one goes at the end
   * - reopens a closed thread
   * - `text` blank:  the pending reply goes (emptied, as a comment is);  with none pending, refused:  a reply needs
   *   words
   */
  reply(id: string, text: string, now = new Date()): void {
    const comment = this.comment(id)
    const pending = this.pendingReply(comment)
    const blank = typeof text !== "string" || !text.replace(INVISIBLE, "").trim()
    if (blank && pending) {
      comment.replies = comment.replies!.slice(0, -1)
      if (!comment.replies.length) delete comment.replies
      return
    }
    const words = checkedText(text)
    delete comment.done
    if (pending) {
      pending.text = words
      pending.edited = now.toISOString()
    } else comment.replies = [...(comment.replies ?? []), { by: OWEN, at: now.toISOString(), text: words }]
  }

  /**
   * Close comment `id`'s thread:  `good` ("that's good":  done) or `skip` ("skip it":  nothing more to do).
   * - throws a 400 for any other `how`
   */
  resolve(id: string, how: string, now = new Date()): void {
    const comment = this.comment(id)
    if (!RESOLUTIONS.includes(how)) throw new CommentsError(`a thread closes as "good" or "skip", not "${how}"`)
    comment.done = { how: how as Resolution, at: now.toISOString() }
  }

  /** Open comment `id`'s thread again:  the page's Undo after "that's good" or "skip it", and its Reopen. */
  reopen(id: string): void {
    delete this.comment(id).done
  }

  /**
   * Owen's pending reply on `comment`:  the last entry, his, not taken since, nor being worked on;  else
   * `undefined`.
   */
  private pendingReply(comment: Comment): CommentReply | undefined {
    const last = comment.replies?.at(-1)
    if (last?.by !== OWEN) return undefined
    const held = heldSince(comment)
    return held && held >= last.at ? undefined : last
  }

  ////////////////
  // ## Claude's edits
  ////////////////

  /** Mark comment `id` taken into `epic`'s phase `phase`:  no longer Owen's to change. */
  take(id: string, { epic, phase }: { epic: string; phase: number }, now = new Date()): void {
    const comment = this.comment(id)
    comment.status = "taken"
    comment.taken = { epic, phase, at: now.toISOString() }
  }

  /**
   * Claude is thinking about comment `id` (`on`), or stopped (`!on`):  the page shows a "Claude: thinking…" stub at
   * the end of its thread meanwhile (`spell dev comments working`, `plan-doc inbox <name> working cm3`).
   * - `working`:  since when;  set again, it keeps the first time
   * - `answer()` turns it off
   */
  setWorking(id: string, on: boolean, now = new Date()): void {
    const comment = this.comment(id)
    if (!on) delete comment.working
    else comment.working ??= now.toISOString()
  }

  /**
   * Comment `id` answered:  `html` (as is:  a `<p>` or more) on its thread, after any before it.
   * - none:  answered elsewhere (a plan doc's comment, in the doc).  An entry with no words still goes on the
   *   thread, so it's Owen's turn, unless Claude spoke last already.
   * - `commit`:  the commit the answer was built in (the thread's Done line shows it);  throws a 400 when it isn't one
   * - Claude's done thinking about it:  its `working` goes
   */
  answer(id: string, html = "", now = new Date(), commit?: string): void {
    const comment = this.comment(id)
    const markup = String(html ?? "").trim()
    if (commit !== undefined && !COMMIT.test(commit)) throw new CommentsError(`"${commit}" isn't a commit`)
    const reply: CommentReply = { by: "Claude", at: now.toISOString(), html: markup }
    if (commit) reply.commit = commit
    if (markup || commit || CommentList.turnOf(comment) === "claude")
      comment.replies = [...(comment.replies ?? []), reply]
    if (comment.status === "new") comment.status = "answered"
    delete comment.working
  }

  /** The id a new comment gets:  one past the highest (`cm3` after `cm2`). */
  private nextId(): string {
    return `cm${Math.max(0, ...Object.keys(this.comments).map(numberOf)) + 1}`
  }

  /** Comment `id`, while it's `new`;  throws a 409 once Claude has it. */
  private unseen(id: string): Comment {
    const comment = this.comment(id)
    if (comment.status !== "new")
      throw new CommentsError(`comment ${id} is ${comment.status}:  Claude has it, so add a new comment instead`, {
        cause: { status: 409 }
      })
    return comment
  }
}

/** Where a comment is, as the page sends it (`BlockAnchors.js`). */
export type CommentPlace = {
  /** the block's anchor:  its id, or `<section id | page>#<kind>-<n>` */
  anchor: string
  /** its kind (`table` ...), or `page` */
  kind: string
  /** its section's title (`2. Memory`), for a reader;  `""` before any section */
  label?: string
  /** its first words, to find it again if the page changes */
  excerpt?: string
  /** a comment on selected text:  that text, as selected */
  quote?: string
  /** where `quote` starts in the block's text (white space squashed), to tell two copies of it apart */
  offset?: number
}

/** One comment, as an inbox file holds it. */
export type Comment = Required<Omit<CommentPlace, "quote" | "offset">> &
  Pick<CommentPlace, "quote" | "offset"> & {
    /** Owen's words, as typed:  plain text, blank lines between paragraphs */
    text: string
    /** when written, ISO */
    at: string
    /** when last edited, ISO */
    edited?: string
    /** `new` (saved, waiting for Claude), `taken` (in an epic's phase) or `answered` */
    status: "new" | "taken" | "answered"
    /** the phase it went into, and when */
    taken?: { epic: string; phase: number; at: string }
    /** its thread after Owen's first words, in order:  Claude's answers, Owen's replies */
    replies?: CommentReply[]
    /** Owen closed the thread:  "that's good" (`good`) or "skip it" (`skip`), and when */
    done?: { how: Resolution; at: string }
    /** Claude is thinking about it (`setWorking()`):  since when, ISO */
    working?: string
  }

/**
 * One entry of a comment's thread:
 * - Claude's (`by` not `Owen`):  `html`, as is (`""`:  answered elsewhere, a plan doc's in the doc), and `commit`,
 *   the commit it was built in
 * - Owen's (`by: "Owen"`):  `text`, as typed (plain, as a comment's), and `edited`, when he last changed it
 */
export type CommentReply = { by: string; at: string; html?: string; text?: string; commit?: string; edited?: string }

/** How Owen closed a thread:  "that's good", or "skip it". */
export type Resolution = "good" | "skip"

/** Whose turn it is on a thread (`CommentList.turnOf()`). */
export type Turn = "owen" | "claude" | "done"

/** A comment with its id (`cm3`). */
export type IdentifiedComment = Comment & { id: string }

/** When Claude last took `comment`, ISO;  `taken` with no record of it:  when written;  never taken:  `undefined`. */
function takenAt(comment: Comment): string | undefined {
  return comment.taken?.at ?? (comment.status === "taken" ? comment.at : undefined)
}

/**
 * Since when Claude has held `comment`, ISO:  the later of when he took it (`takenAt()`) and when he started thinking
 * about it (`working`);  `undefined` for neither.
 */
function heldSince(comment: Comment): string | undefined {
  const times = [takenAt(comment), comment.working].filter((each): each is string => !!each)
  return times.sort().at(-1)
}

/** `reply` as `restore()` keeps it:  one entry;  none when it's neither Claude's answer nor Owen's words. */
function restoredReply(reply: CommentReply, fallback: string): CommentReply[] {
  if (typeof reply?.by !== "string") return []
  const at = stamp(reply.at) ?? fallback
  if (reply.by === OWEN) {
    if (typeof reply.text !== "string" || !reply.text.trim()) return []
    const kept: CommentReply = { by: OWEN, at, text: checkedText(reply.text) }
    if (stamp(reply.edited)) kept.edited = stamp(reply.edited)
    return [kept]
  }
  if (typeof reply.html !== "string") return []
  const kept: CommentReply = { by: reply.by, at, html: reply.html }
  if (typeof reply.commit === "string" && COMMIT.test(reply.commit)) kept.commit = reply.commit
  return [kept]
}

/** `value` as an ISO date, when it's a date;  else `undefined`. */
function stamp(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

/** A comment id's number:  `cm12` -> 12;  0 for anything else. */
function numberOf(id: string): number {
  return Number(/^cm(\d+)$/.exec(id)?.[1] ?? 0)
}

/**
 * `text` trimmed;  throws when blank (white space only, or characters that draw nothing:  zero-width spaces and
 * joiners) or too long:  NEVER an empty comment (Owen, 2026-10-10).
 */
function checkedText(text: unknown): string {
  const words = typeof text === "string" ? text.trim() : ""
  if (!words.replace(INVISIBLE, "").trim()) throw new CommentsError("a comment needs some text")
  if (words.length > MAX_TEXT) throw new CommentsError(`a comment holds at most ${MAX_TEXT} characters`)
  return words
}

/** A label or excerpt, as kept:  one line, at most `MAX_LABEL` characters. */
function short(text: unknown): string {
  return typeof text === "string" ? text.replace(/\s+/g, " ").trim().slice(0, MAX_LABEL) : ""
}
