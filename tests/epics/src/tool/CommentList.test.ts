/**
 * Tests of `CommentList`:  comments added, edited and deleted while they wait;  taken and answered by Claude;
 * and an epic page's review inbox holding them.
 */
import { describe, expect, test } from "vite-plus/test"

import { CommentList, CommentsError, type Comment } from "$/epics/tool/CommentList"
import { GuideInbox } from "$/epics/tool/GuideInbox"
import { ReviewInbox } from "$/epics/tool/ReviewInbox"

/** A comment's place:  the second field of phase 3. */
const ON_FIELD = { anchor: "p3#field-2", kind: "field", label: "Notes", excerpt: "A note bubble" }

/** When everything happens. */
const NOW = new Date("2026-10-10T14:02:00.000Z")

describe("CommentList", () => {
  test("adds comments `m1`, `m2` ... (shown M1) (never a caveat's `c1`);  a quote rides along with its offset", () => {
    const comments = new CommentList({})
    expect(comments.add(ON_FIELD, "  Which file?  ", NOW)).toBe("m1")
    expect(comments.add({ ...ON_FIELD, quote: " the inbox file ", offset: 14 }, "This one?", NOW)).toBe("m2")
    expect(comments.all).toEqual([
      { id: "m1", ...ON_FIELD, text: "Which file?", at: NOW.toISOString(), status: "new" },
      {
        id: "m2",
        ...ON_FIELD,
        quote: "the inbox file",
        offset: 14,
        text: "This one?",
        at: NOW.toISOString(),
        status: "new"
      }
    ])
    expect([CommentList.isCommentId("m2"), CommentList.isCommentId("c2")]).toEqual([true, false])
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
    expect(comments.restore(id, before)).toBe("m2")
    const { id: _id, ...kept } = before
    expect(comments.comment("m2")).toEqual(kept)
    expect(comments.all.map(({ id: each, text }) => [each, text])).toEqual([
      ["m1", "newer"],
      ["m2", "Which one?"]
    ])
    expect(() => comments.restore("m9", { ...before, text: "  " })).toThrow(/needs some text/)
    expect(() => comments.restore("m9", { ...before, status: "gone" as "new" })).toThrow(/isn't a comment's status/)
    expect(() => comments.restore("m9", { ...before, anchor: "two words" })).toThrow(/isn't an anchor/)
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
    expect(() => comments.reply("m9", "x")).toThrow(expect.objectContaining({ status: 404 }))
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

  test("a reply on a TAKEN comment waits until it's taken again;  an epic page's answered in the doc is Owen's turn", () => {
    const comments = new CommentList({})
    const id = comments.add(ON_FIELD, "Fix it", NOW)
    comments.take(id, { epic: "guide-changes", phase: 4 }, NOW)
    expect([CommentList.turnOf(comments.comment(id)), comments.waiting]).toEqual(["claude", []])
    const later = new Date("2026-10-10T15:00:00.000Z")
    comments.reply(id, "And the table too", later)
    expect(comments.waiting.map((each) => each.id)).toEqual([id])
    comments.take(id, { epic: "guide-changes", phase: 4 }, later)
    expect(comments.waiting).toEqual([])
    // answered in the epic page:  no words here, but Owen's turn;  a second answer adds nothing
    const doc = comments.add(ON_FIELD, "Epic page", NOW)
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
    expect(() => comments.remove("m9")).toThrow(expect.objectContaining({ status: 404 }))
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
    expect(() => comments.setWorking("m9", true)).toThrow(expect.objectContaining({ status: 404 }))
  })

  test("lastWordsAt:  when Owen last changed his words on the thread -- his comment, his replies, their edits", () => {
    const later = (minutes: number) => new Date(NOW.getTime() + minutes * 60_000)
    const comments = new CommentList({})
    const id = comments.add(ON_FIELD, "one", NOW)
    expect(CommentList.lastWordsAt(comments.comment(id))).toBe(NOW.toISOString())
    comments.edit(id, "one, better", later(1))
    expect(CommentList.lastWordsAt(comments.comment(id))).toBe(later(1).toISOString())
    comments.answer(id, "<p>Because.</p>", later(2))
    // Claude's words never count
    expect(CommentList.lastWordsAt(comments.comment(id))).toBe(later(1).toISOString())
    comments.reply(id, "Say more", later(3))
    comments.reply(id, "Say more, please", later(4))
    expect(CommentList.lastWordsAt(comments.comment(id))).toBe(later(4).toISOString())
  })
})

describe("ids:  shown M3, typed M3 / m3 / cm3, keyed m3;  an older file's cm3 read as m3 (epic `epic-workflow` P23, J178)", () => {
  /** A comment as a file holds it, with text `text`. */
  const held = (text: string): Comment => ({ ...ON_FIELD, text, at: NOW.toISOString(), status: "new" })

  test("idOf():  every way an id is typed, as the file keys it;  anything else as it is", () => {
    expect(["M3", "m3", "cm3", "CM3", "#M3", " m03 "].map(CommentList.idOf)).toEqual([
      "m3",
      "m3",
      "m3",
      "m3",
      "m3",
      "m3"
    ])
    expect(["j3", "c3", "m", "mm3", "p-epic-migrate"].map(CommentList.idOf)).toEqual([
      "j3",
      "c3",
      "m",
      "mm3",
      "p-epic-migrate"
    ])
  })

  test("label():  as Owen sees it, M3;  isCommentId():  every spelling, never a caveat's or an item's", () => {
    expect(["cm3", "m3", "M3", "#cm12"].map(CommentList.label)).toEqual(["M3", "M3", "M3", "M12"])
    expect(CommentList.label("j3")).toBe("j3")
    expect(["M3", "m3", "cm3", "CM3"].every(CommentList.isCommentId)).toBe(true)
    expect(["c3", "j3", "q1", "mm3", "m"].some(CommentList.isCommentId)).toBe(false)
  })

  test("every method takes M3, m3 or the old cm3 for the comment the file keys m3", () => {
    const comments = new CommentList({})
    const id = comments.add(ON_FIELD, "one", NOW)
    expect(id).toBe("m1")
    comments.edit("M1", "one, better", NOW)
    comments.setWorking("cm1", true, NOW)
    expect(comments.comment("M1")).toMatchObject({ text: "one, better", working: NOW.toISOString() })
    comments.answer("M1", "<p>Yes.</p>", NOW)
    comments.reply("cm1", "Thanks", NOW)
    comments.resolve("M1", "good", NOW)
    expect(Object.keys(comments.comments)).toEqual(["m1"])
    comments.clear("cm1")
    expect(comments.comments).toEqual({})
    expect(() => comments.comment("M9")).toThrow(/no comment M9 here/)
  })

  test("Undo under the old cm3 comes back keyed m3", () => {
    const comments = new CommentList({})
    const id = comments.add(ON_FIELD, "one", NOW)
    const before = comments.all[0]!
    comments.remove(id)
    expect(comments.restore("cm1", before)).toBe("m1")
  })

  test("migrate():  an older file's cm3 is read as m3;  a clash (cm2 and m2:  an older checkout added one) takes the next number", () => {
    const record: Record<string, Comment> = { cm2: held("two"), m1: held("one"), m2: held("clash"), cm5: held("five") }
    const comments = new CommentList(record)
    expect(Object.keys(record)).toEqual(["m1", "m2", "m3", "m5"])
    expect(comments.comment("M3").text).toBe("two")
    expect(comments.comment("M2").text).toBe("clash")
    expect(comments.comment("M5").text).toBe("five")
    expect(comments.add(ON_FIELD, "next", NOW)).toBe("m6")
  })

  test("migrate():  a file keyed m3 already, or with no comments, is left as it is (the same object, same order)", () => {
    const record: Record<string, Comment> = { m2: held("two"), m1: held("one") }
    expect(Object.keys(CommentList.migrate(record))).toEqual(["m2", "m1"])
    expect(CommentList.migrate({})).toEqual({})
  })

  test("both inboxes read an older file's cm3 as m3, and write it so next time", () => {
    const review = new ReviewInbox({ comments: { cm1: held("on an epic page") } })
    expect(Object.keys(review.comments)).toEqual(["m1"])
    const guide = new GuideInbox({ comments: { cm4: held("on a guide") } })
    expect(Object.keys(guide.comments)).toEqual(["m4"])
    expect(guide.commentList.comment("M4").text).toBe("on a guide")
    expect(Object.keys(JSON.parse(JSON.stringify(guide)).comments)).toEqual(["m4"])
  })
})

describe("ReviewInbox.commentList", () => {
  test("an epic page's comments live in its review inbox, which isn't empty while it holds one", () => {
    const inbox = new ReviewInbox()
    expect(inbox.isEmpty).toBe(true)
    inbox.commentList.add(ON_FIELD, "Which file?", NOW)
    expect([inbox.isEmpty, Object.keys(inbox.comments)]).toEqual([false, ["m1"]])
    expect(new ReviewInbox(JSON.parse(JSON.stringify(inbox))).commentList.waiting).toHaveLength(1)
  })
})
