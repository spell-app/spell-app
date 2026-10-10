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
 *   - `taken`:  Claude took it:  a guide's into epic `guide-changes` (`taken`:  which phase)
 *   - `answered`:  Claude answered it (a plan doc's:  in the doc;  `replies` may hold the answer)
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

  /** The comments still waiting for Claude (`new`). */
  get waiting(): IdentifiedComment[] {
    return this.all.filter((comment) => comment.status === "new")
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
    const id = `cm${Math.max(0, ...Object.keys(this.comments).map(numberOf)) + 1}`
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
   * Comment `id` answered:  `html` (as is:  a `<p>` or more) under it, after any before it;
   * none:  answered elsewhere (a plan doc's comment, in the doc).
   */
  answer(id: string, html = "", now = new Date()): void {
    const comment = this.comment(id)
    const markup = String(html ?? "").trim()
    if (markup) comment.replies = [...(comment.replies ?? []), { by: "Claude", at: now.toISOString(), html: markup }]
    if (comment.status === "new") comment.status = "answered"
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
    /** Claude's answers under it */
    replies?: { by: string; at: string; html: string }[]
  }

/** A comment with its id (`cm3`). */
export type IdentifiedComment = Comment & { id: string }

/** A comment id's number:  `cm12` -> 12;  0 for anything else. */
function numberOf(id: string): number {
  return Number(/^cm(\d+)$/.exec(id)?.[1] ?? 0)
}

/** `text` trimmed;  throws when blank or too long. */
function checkedText(text: unknown): string {
  const words = typeof text === "string" ? text.trim() : ""
  if (!words) throw new CommentsError("a comment needs some text")
  if (words.length > MAX_TEXT) throw new CommentsError(`a comment holds at most ${MAX_TEXT} characters`)
  return words
}

/** A label or excerpt, as kept:  one line, at most `MAX_LABEL` characters. */
function short(text: unknown): string {
  return typeof text === "string" ? text.replace(/\s+/g, " ").trim().slice(0, MAX_LABEL) : ""
}
