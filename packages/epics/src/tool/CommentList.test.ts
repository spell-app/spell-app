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

  test("Undo:  a deleted or cleared comment comes back as it was, under its id unless a new one took it", () => {
    const comments = new CommentList({})
    const id = comments.add({ ...ON_FIELD, quote: "the inbox file", offset: 14 }, "Which one?", NOW)
    comments.take(id, { epic: "guide-changes", phase: 4 }, NOW)
    comments.answer(id, "<p>That one.</p>", NOW)
    const before = comments.all[0]
    comments.clear(id)
    expect(comments.restore(id, before)).toBe(id)
    expect(comments.all).toEqual([before])
    // deleted, then a new comment took its id:  back under the next one
    comments.clear(id)
    expect(comments.add(ON_FIELD, "newer", NOW)).toBe(id)
    expect(comments.restore(id, before)).toBe("cm2")
    const { id: _id, ...kept } = before
    expect(comments.comment("cm2")).toEqual(kept)
    expect(comments.all.map(({ id: each, text }) => [each, text])).toEqual([
      ["cm1", "newer"],
      ["cm2", "Which one?"]
    ])
    expect(() => comments.restore("cm9", { ...before, text: "  " })).toThrow(/needs some text/)
    expect(() => comments.restore("cm9", { ...before, status: "gone" as "new" })).toThrow(/isn't a comment's status/)
    expect(() => comments.restore("cm9", { ...before, anchor: "two words" })).toThrow(/isn't an anchor/)
  })

  test("a THREAD:  Claude answers, Owen replies (saved as typed, one pending reply), Claude answers again", () => {
    const comments = new CommentList({})
    const id = comments.add(ON_FIELD, "Why here?", NOW)
    expect([CommentList.turnOf(comments.comment(id)), comments.waiting.length]).toEqual(["claude", 1])
    comments.answer(id, "<p>Because.</p>", NOW)
    expect([CommentList.turnOf(comments.comment(id)), comments.waiting]).toEqual(["owen", []])
    // typed in two goes:  the second save replaces the first
    const later = new Date("2026-10-10T14:05:00.000Z")
    comments.reply(id, "Not good enough", later)
    comments.reply(id, "  Not good enough:  say more.  ", later)
    expect(comments.comment(id).replies).toEqual([
      { by: "Claude", at: NOW.toISOString(), html: "<p>Because.</p>" },
      { by: "Owen", at: later.toISOString(), text: "Not good enough:  say more.", edited: later.toISOString() }
    ])
    // a reply is new work, as a new comment is
    expect([CommentList.turnOf(comments.comment(id)), comments.waiting.map((each) => each.id)]).toEqual([
      "claude",
      [id]
    ])
    comments.answer(id, "<p>More.</p>", later, "8c7e1d3")
    expect(comments.comment(id).replies?.at(-1)).toMatchObject({
      by: "Claude",
      html: "<p>More.</p>",
      commit: "8c7e1d3"
    })
    expect(() => comments.answer(id, "<p>x</p>", later, "not a sha")).toThrow(/isn't a commit/)
    // his next reply is a new entry, not an edit of the last one
    comments.reply(id, "Thanks", later)
    expect(comments.comment(id).replies).toHaveLength(4)
  })

  test("Owen's pending reply emptied goes;  none pending, a blank reply is refused", () => {
    const comments = new CommentList({})
    const id = comments.add(ON_FIELD, "Why?", NOW)
    comments.answer(id, "<p>Because.</p>", NOW)
    expect(() => comments.reply(id, "  ")).toThrow(expect.objectContaining({ status: 400 }))
    comments.reply(id, "Hm", NOW)
    comments.reply(id, " ", NOW)
    expect([comments.comment(id).replies?.length, CommentList.turnOf(comments.comment(id))]).toEqual([1, "owen"])
    expect(() => comments.reply("cm9", "x")).toThrow(expect.objectContaining({ status: 404 }))
  })

  test("that's good / skip it close a thread;  reopen, or a reply, opens it again", () => {
    const comments = new CommentList({})
    const id = comments.add(ON_FIELD, "Why?", NOW)
    comments.answer(id, "<p>Because.</p>", NOW)
    comments.resolve(id, "good", NOW)
    expect([comments.comment(id).done, CommentList.turnOf(comments.comment(id)), comments.waiting]).toEqual([
      { how: "good", at: NOW.toISOString() },
      "done",
      []
    ])
    comments.reopen(id)
    expect(CommentList.turnOf(comments.comment(id))).toBe("owen")
    comments.resolve(id, "skip", NOW)
    expect(comments.comment(id).done?.how).toBe("skip")
    comments.reply(id, "One more thing", NOW)
    expect([comments.comment(id).done, CommentList.turnOf(comments.comment(id))]).toEqual([undefined, "claude"])
    expect(() => comments.resolve(id, "maybe")).toThrow(expect.objectContaining({ status: 400 }))
  })

  test("a reply on a TAKEN comment waits until it's taken again;  a plan doc's answered in the doc is Owen's turn", () => {
    const comments = new CommentList({})
    const id = comments.add(ON_FIELD, "Fix it", NOW)
    comments.take(id, { epic: "guide-changes", phase: 4 }, NOW)
    expect([CommentList.turnOf(comments.comment(id)), comments.waiting]).toEqual(["claude", []])
    const later = new Date("2026-10-10T15:00:00.000Z")
    comments.reply(id, "And the table too", later)
    expect(comments.waiting.map((each) => each.id)).toEqual([id])
    comments.take(id, { epic: "guide-changes", phase: 4 }, later)
    expect(comments.waiting).toEqual([])
    // answered in the plan doc:  no words here, but Owen's turn;  a second answer adds nothing
    const doc = comments.add(ON_FIELD, "Plan doc", NOW)
    comments.answer(doc)
    comments.answer(doc)
    expect([comments.comment(doc).replies, CommentList.turnOf(comments.comment(doc))]).toEqual([
      [{ by: "Claude", at: expect.any(String), html: "" }],
      "owen"
    ])
    // before threads:  answered, no replies at all, is Owen's turn too
    expect(CommentList.turnOf({ ...comments.comment(doc), replies: undefined })).toBe("owen")
  })

  test("Undo keeps the whole thread:  Owen's replies, Claude's commits, done", () => {
    const comments = new CommentList({})
    const id = comments.add(ON_FIELD, "Why?", NOW)
    comments.answer(id, "<p>Because.</p>", NOW, "abc1234")
    comments.reply(id, "Fine", NOW)
    comments.answer(id, "<p>Good.</p>", NOW)
    comments.resolve(id, "good", NOW)
    const before = comments.all[0]
    comments.clear(id)
    comments.restore(id, before)
    expect(comments.all).toEqual([before])
  })

  test("refuses a bad anchor or kind, blank text, a comment that isn't there", () => {
    const comments = new CommentList({})
    expect(() => comments.add({ ...ON_FIELD, anchor: "two words" }, "x")).toThrow(/isn't an anchor/)
    expect(() => comments.add({ ...ON_FIELD, kind: "Field!" }, "x")).toThrow(/kind of block/)
    expect(() => comments.add(ON_FIELD, "   ")).toThrow(/needs some text/)
    expect(() => comments.remove("cm9")).toThrow(expect.objectContaining({ status: 404 }))
  })

  test("NEVER an empty comment:  white space, or characters that draw nothing, are refused on add and edit", () => {
    const comments = new CommentList({})
    for (const blank of ["", " \n\t ", " ", "​‍", " ⁠ ", undefined])
      expect(() => comments.add(ON_FIELD, blank as string)).toThrow(/needs some text/)
    const id = comments.add(ON_FIELD, "  kept  ", NOW)
    expect(() => comments.edit(id, " \n ")).toThrow(expect.objectContaining({ status: 400 }))
    expect(comments.comment(id).text).toBe("kept")
  })

  test("WORKING:  Claude thinking about it -- not waiting, his last reply read;  answer() turns it off", () => {
    const comments = new CommentList({})
    const id = comments.add(ON_FIELD, "Why?", NOW)
    const later = (minutes: number) => new Date(NOW.getTime() + minutes * 60_000)
    comments.answer(id, "<p>Because.</p>", later(1))
    comments.reply(id, "Say more", later(2))
    expect(comments.waiting.map((each) => each.id)).toEqual([id])
    comments.setWorking(id, true, later(3))
    // set again:  the first time stays
    comments.setWorking(id, true, later(4))
    expect(comments.comment(id).working).toBe(later(3).toISOString())
    expect([comments.waiting, CommentList.turnOf(comments.comment(id))]).toEqual([[], "claude"])
    // his reply is read:  more words go after it, as a new reply, and wait again
    comments.reply(id, "And the other one", later(5))
    expect(comments.comment(id).replies!.map((each) => each.text ?? each.html)).toEqual([
      "<p>Because.</p>",
      "Say more",
      "And the other one"
    ])
    expect(comments.waiting.map((each) => each.id)).toEqual([id])
    comments.answer(id, "<p>Both done.</p>", later(6))
    expect(comments.comment(id).working).toBeUndefined()
    comments.setWorking(id, true, later(7))
    comments.setWorking(id, false)
    expect(comments.comment(id).working).toBeUndefined()
    expect(() => comments.setWorking("cm9", true)).toThrow(expect.objectContaining({ status: 404 }))
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
