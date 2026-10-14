import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"

import { SRV } from "$/server"

import { CommentList, CommentsError, type Comment, type IdentifiedComment } from "./CommentList"

/** The inbox file's shape version. */
const INBOX_VERSION = 1

/****************
 * ### `GuideInbox`
 * GUIDE COMMENTS (epic `airplane`, P11):  what Owen wrote on a docs page's blocks, from the bullhorn beside each or
 * on selected text (`packages/docs/tools/_assets/spell-doc-runtime.js`, "Comments"), waiting for Claude in the
 * page's INBOX FILE.
 * - the file:  `<page>.inbox.json` beside `<page>.html` (`fileFor()`);  absent until the first comment, deleted
 *   once the last is deleted;  git-ignored in the shared repo, as the epics' review inboxes
 * - its comments, and every change to them:  `CommentList`, the shape an epic page's review inbox holds its comments in
 *   too
 * - SEND (epic `epic-workflow` P13), as an epic page's:  Owen presses the page header's Send, and the comments
 *   waiting go to the session of the epic the page BELONGS to (`SeeAlso.ownerOf()`)
 *   - `sent`:  when he last pressed it;  a waiting comment with newer words is unsent (`unsentComments`)
 *   - `handedOver`:  the `sent` a waiting session last took (`takeSent()`):  each send is taken once, by
 *     `spell dev plan-doc inbox <epic> wait`
 *   - nobody listening:  they wait, sent, for the epic's next `/epic review` (its `wait` takes them at once) or
 *     `/airplane land`
 * - EVERY write through `update()` / `updateAsync()`:  under the file's lock (`SRV.FileLock`), atomic
 * - Works with no Claude and no network:  the page server writes it (`packages/docs/tools/commentsRoutes.ts`)
 * - Node only (`node:fs`, `$/server`'s lock):  NOT in the `$/epics` barrel, imported by path.
 *   Here, not in `packages/docs/tools` where it began:  the epic tool's `inbox wait` reads it, and nothing
 *   imports `docs`.
 ****************/
export class GuideInbox {
  /** the file's shape version */
  version = INBOX_VERSION

  /** every comment, by id (`cm1` ...), in the order written */
  comments: Record<string, Comment> = {}

  /** ISO time of Owen's last Send on the page, else `null` */
  sent: string | null = null

  /** the `sent` time a waiting session last took (`takeSent()`), else `null` */
  handedOver: string | null = null

  /** - `record`:  the file's JSON, as read */
  constructor(record: Partial<GuideInbox> = {}) {
    Object.assign(this, record)
  }

  /** The comments, to read or change (in place). */
  get commentList(): CommentList {
    return new CommentList(this.comments)
  }

  ////////////////
  // ## Send
  ////////////////

  /** The comments waiting for Owen's Send:  Claude's turn, and his last words newer than `sent`. */
  get unsentComments(): IdentifiedComment[] {
    return this.commentList.unsentSince(this.sent)
  }

  /** The comments a Send handed over and Claude hasn't taken up yet. */
  get sentComments(): IdentifiedComment[] {
    return this.commentList.sentBy(this.sent)
  }

  /** Has Owen pressed Send since a waiting session last took a send (`handedOver`)? */
  get hasNewSend(): boolean {
    if (!this.sent) return false
    return !this.handedOver || Date.parse(this.sent) > Date.parse(this.handedOver)
  }

  /** Owen pressed Send:  every comment waiting so far is sent. */
  markSent(at = new Date().toISOString()): this {
    this.sent = at
    return this
  }

  /**
   * TAKE the send a waiting session hasn't taken:  `{ at, comments }`, or `null` when there's none.
   * - only the comments Owen spoke on since the send a session last took (as `ReviewInbox.takeWork()`):
   *   a comment goes over once, until he speaks on its thread again
   * - `handedOver` becomes `sent`, so a send is taken once;  one with nothing left in it is taken quietly
   * - call it under the lock (`update()`)
   */
  takeSent(): GuideSend | null {
    if (!this.hasNewSend) return null
    const before = this.handedOver ? Date.parse(this.handedOver) : -Infinity
    const comments = this.sentComments.filter((comment) => Date.parse(CommentList.lastWordsAt(comment)) > before)
    this.handedOver = this.sent
    return comments.length ? { at: this.sent!, comments } : null
  }

  ////////////////
  // ## The file
  ////////////////

  /** The inbox file of page `page` (a file path):  `<page>.inbox.json` beside `<page>.html`. */
  static fileFor(page: string): string {
    return page.replace(/\.html$/, ".inbox.json")
  }

  /**
   * The inbox in `file`;  an empty one when there's no file.
   * - NEVER throws on a missing file;  a file that isn't JSON throws a `CommentsError` (500) naming it
   */
  static read(file: string): GuideInbox {
    if (!existsSync(file)) return new GuideInbox()
    let raw: Partial<GuideInbox>
    try {
      raw = JSON.parse(readFileSync(file, "utf8"))
    } catch (error) {
      throw new CommentsError(`${file} is not JSON:  ${(error as Error).message}`, { cause: { status: 500 } })
    }
    return new GuideInbox({
      version: raw.version ?? INBOX_VERSION,
      comments: raw.comments ?? {},
      sent: raw.sent ?? null,
      handedOver: raw.handedOver ?? null
    })
  }

  /**
   * Write this inbox to `file`, atomically;  delete the file instead when it holds no comment.
   * - `sent` and `handedOver` alone don't count:  they only date comments, and there are none
   * - a temp file renamed over it:  a reader (the page, `spell dev comments`) never sees half of it
   * - call it under the lock (`update()`), or two writers may lose each other's changes
   * - SIDE EFFECT:  writes or removes `file`
   */
  writeTo(file: string): void {
    if (!Object.keys(this.comments).length) return rmSync(file, { force: true })
    const temp = `${file}.${process.pid}.tmp`
    writeFileSync(temp, `${JSON.stringify(this, null, 2)}\n`)
    renameSync(temp, file)
  }

  /**
   * Change the inbox in `file` with `change(comments, inbox)` under the file's lock, write it;
   * returns what `change` returned.
   * - most changes are to the comments alone;  `inbox` for the send (`markSent()`, `takeSent()`)
   * - BLOCKS while waiting for the lock (`SRV.FileLock.run()`):  for command-line tools.  A server:  `updateAsync()`
   * - throws what `change` throws;  the file is left as it was
   * - SIDE EFFECT:  writes `file` (or removes it:  `writeTo()`)
   */
  static update<T>(file: string, change: (comments: CommentList, inbox: GuideInbox) => T): T {
    return SRV.FileLock.run(file, () => {
      const inbox = GuideInbox.read(file)
      const result = change(inbox.commentList, inbox)
      inbox.writeTo(file)
      return result
    })
  }

  /** `update()` for a server:  waits for the lock with timers, so it keeps serving meanwhile. */
  static updateAsync<T>(file: string, change: (comments: CommentList, inbox: GuideInbox) => T): Promise<T> {
    return SRV.FileLock.runAsync(file, async () => {
      const inbox = GuideInbox.read(file)
      const result = change(inbox.commentList, inbox)
      inbox.writeTo(file)
      return result
    })
  }
}

/** A send a waiting session took (`GuideInbox.takeSent()`):  when Owen pressed it, and the comments it handed over. */
export type GuideSend = { at: string; comments: IdentifiedComment[] }
