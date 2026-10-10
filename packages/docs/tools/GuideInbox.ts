import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"

import { SRV } from "$/server"
import { CommentList, CommentsError, type Comment } from "$/epics/tool/CommentList"

/** The inbox file's shape version. */
const INBOX_VERSION = 1

/****************
 * ### `GuideInbox`
 * GUIDE COMMENTS (epic `airplane`, P11):  what Owen wrote on a docs page's blocks, from the bullhorn beside each or
 * on selected text (`_assets/spell-doc-runtime.js`, "Guide comments"), waiting for Claude in the page's INBOX FILE.
 * - the file:  `<page>.inbox.json` beside `<page>.html` (`fileFor()`);  absent until the first comment, deleted
 *   once the last is deleted;  git-ignored in the shared repo, as the epics' review inboxes
 * - its comments, and every change to them:  `CommentList` (`$/epics/tool/CommentList`), the shape a plan doc's
 *   review inbox holds its comments in too
 * - EVERY write through `update()` / `updateAsync()`:  under the file's lock (`SRV.FileLock`), atomic
 * - Works with no Claude and no network:  the page server writes it (`commentsRoutes.ts`);
 *   Claude takes them into epic `guide-changes` (`spell dev comments gather`, `GuideChanges`)
 ****************/
export class GuideInbox {
  /** the file's shape version */
  version = INBOX_VERSION

  /** every comment, by id (`cm1` ...), in the order written */
  comments: Record<string, Comment> = {}

  /** - `record`:  the file's JSON, as read */
  constructor(record: Partial<GuideInbox> = {}) {
    Object.assign(this, record)
  }

  /** The comments, to read or change (in place). */
  get commentList(): CommentList {
    return new CommentList(this.comments)
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
    return new GuideInbox({ version: raw.version ?? INBOX_VERSION, comments: raw.comments ?? {} })
  }

  /**
   * Write this inbox to `file`, atomically;  delete the file instead when it holds no comment.
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
   * Change the comments in `file` with `change(comments)` under the file's lock, write them;
   * returns what `change` returned.
   * - BLOCKS while waiting for the lock (`SRV.FileLock.run()`):  for command-line tools.  A server:  `updateAsync()`
   * - throws what `change` throws;  the file is left as it was
   * - SIDE EFFECT:  writes `file` (or removes it:  `writeTo()`)
   */
  static update<T>(file: string, change: (comments: CommentList) => T): T {
    return SRV.FileLock.run(file, () => {
      const inbox = GuideInbox.read(file)
      const result = change(inbox.commentList)
      inbox.writeTo(file)
      return result
    })
  }

  /** `update()` for a server:  waits for the lock with timers, so it keeps serving meanwhile. */
  static updateAsync<T>(file: string, change: (comments: CommentList) => T): Promise<T> {
    return SRV.FileLock.runAsync(file, async () => {
      const inbox = GuideInbox.read(file)
      const result = change(inbox.commentList)
      inbox.writeTo(file)
      return result
    })
  }
}
