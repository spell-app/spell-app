/**
 * Tests of `CommentList`:  comments added, edited and deleted while they wait;  taken and answered by Claude;
 * and a plan doc's review inbox holding them.
 */
import { describe, expect, test } from "vite-plus/test"

import { CommentList, CommentsError } from "./CommentList"
import { ReviewInbox } from "./ReviewInbox"

/** A comment's place:  the second field of phase 3. */
const ON_FIELD = { anchor: "p3#field-2", kind: "field", label: "Notes", excerpt: "A note bubble" }

/** When everything happens. */
const NOW = new Date("2026-10-10T14:02:00.000Z")

describe("CommentList", () => {
  test("adds comments `cm1`, `cm2` ... (never a caveat's `c1`);  a quote rides along with its offset", () => {
    const comments = new CommentList({})
    expect(comments.add(ON_FIELD, "  Which file?  ", NOW)).toBe("cm1")
    expect(comments.add({ ...ON_FIELD, quote: " the inbox file ", offset: 14 }, "This one?", NOW)).toBe("cm2")
    expect(comments.all).toEqual([
      { id: "cm1", ...ON_FIELD, text: "Which file?", at: NOW.toISOString(), status: "new" },
      {
        id: "cm2",
        ...ON_FIELD,
        quote: "the inbox file",
        offset: 14,
        text: "This one?",
        at: NOW.toISOString(),
        status: "new"
      }
    ])
    expect([CommentList.isCommentId("cm2"), CommentList.isCommentId("c2")]).toEqual([true, false])
  })

  test("Owen edits or deletes one only while it waits;  Claude takes it, or answers it", () => {
    const comments = new CommentList({})
    const id = comments.add(ON_FIELD, "one", NOW)
    comments.edit(id, "one, better", NOW)
    expect(comments.comment(id)).toMatchObject({ text: "one, better", edited: NOW.toISOString() })
    comments.take(id, { epic: "guide-changes", phase: 4 }, NOW)
    expect(() => comments.edit(id, "x")).toThrow(expect.objectContaining({ status: 409 }))
    expect(() => comments.remove(id)).toThrow(CommentsError)
    comments.answer(id, "<p>Done.</p>", NOW)
    expect(comments.comment(id)).toMatchObject({
      status: "taken",
      taken: { epic: "guide-changes", phase: 4 },
      replies: [{ by: "Claude", html: "<p>Done.</p>" }]
    })
    const other = comments.add(ON_FIELD, "two", NOW)
    comments.answer(other)
    expect([comments.comment(other).status, comments.waiting]).toEqual(["answered", []])
  })

  test("refuses a bad anchor or kind, blank text, a comment that isn't there", () => {
    const comments = new CommentList({})
    expect(() => comments.add({ ...ON_FIELD, anchor: "two words" }, "x")).toThrow(/isn't an anchor/)
    expect(() => comments.add({ ...ON_FIELD, kind: "Field!" }, "x")).toThrow(/kind of block/)
    expect(() => comments.add(ON_FIELD, "   ")).toThrow(/needs some text/)
    expect(() => comments.remove("cm9")).toThrow(expect.objectContaining({ status: 404 }))
  })
})

describe("ReviewInbox.commentList", () => {
  test("a plan doc's comments live in its review inbox, which isn't empty while it holds one", () => {
    const inbox = new ReviewInbox()
    expect(inbox.isEmpty).toBe(true)
    inbox.commentList.add(ON_FIELD, "Which file?", NOW)
    expect([inbox.isEmpty, Object.keys(inbox.comments)]).toEqual([false, ["cm1"]])
    expect(new ReviewInbox(JSON.parse(JSON.stringify(inbox))).commentList.waiting).toHaveLength(1)
  })
})
