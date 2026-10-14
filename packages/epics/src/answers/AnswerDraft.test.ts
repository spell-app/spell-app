import { describe, expect, test } from "vite-plus/test"

import { AnswerDraft } from "./AnswerDraft"
import type { DetailsDraft, SentAnswer, TypedAnswer } from "./answers.types"

/** Labels of a page with questions `q1` (options A, B) and `q2` (A), section `context`, and its notes. */
const LABELS = {
  q1: "Q1 · Layout?",
  "q1-A": "A · Grid",
  "q1-B": "B · List",
  q2: "Q2 · Colour?",
  "q2-A": "A · Blue",
  context: "1. Context",
  notes: "Notes"
}

/** What was typed on that page. */
function typed(answer: Partial<TypedAnswer>): TypedAnswer {
  return { answers: {}, comments: {}, notes: "", labels: LABELS, ...answer }
}

/** An answer sent at `answered`. */
function sent(answered: string, answer: Partial<SentAnswer> = {}): SentAnswer {
  return { page: "/pages/details/x.html", answered, changes: 0, answers: {}, comments: {}, notes: "", ...answer }
}

describe("AnswerDraft", () => {
  test("over():  what the top knows wins, blanks too;  what it doesn't know is the base's", () => {
    const base = sent("2026-10-13T20:00:00.000Z", {
      answers: { q1: { picked: ["A"] }, q9: { picked: ["B"] } },
      comments: { context: "sent", other: "kept" },
      notes: "sent notes"
    })
    const top = typed({ answers: { q1: { picked: ["B"], other: "or" }, "q1-more": { picked: ["B"] } } })
    expect(AnswerDraft.over(base, top)).toEqual({
      answers: { q1: { picked: ["B"], other: "or" }, "q1-more": { picked: ["B"] }, q9: { picked: ["B"] } },
      comments: { other: "kept" },
      notes: "",
      labels: LABELS
    })
  })

  test("settle():  a question gone is kept as one line;  a gone option's pick under the option;  a gone box's text", () => {
    const present = { q1: LABELS.q1, "q1-A": LABELS["q1-A"], notes: "Notes" }
    const { typed: next, kept } = AnswerDraft.settle(
      typed({
        answers: {
          q1: { picked: ["A", "B"] },
          q2: { picked: ["A"], other: "teal" },
          "q2-more": { picked: ["A"] }
        },
        comments: { context: "about it", "q1-B": "on B" }
      }),
      present
    )
    expect(kept).toEqual([
      { id: "q1-B", label: "Q1 · Layout?, B · List", text: "picked it, and it's no longer an option" },
      { id: "q2", label: "Q2 · Colour?", text: "picked A · Blue;  Other:  teal;  more details wanted on A" },
      { id: "context", label: "1. Context", text: "about it" },
      { id: "q1-B", label: "Q1 · Layout?, B · List", text: "on B" }
    ])
    expect([next.answers, next.comments, next.labels, next.kept]).toEqual([
      { q1: { picked: ["A"] } },
      {},
      present,
      kept
    ])
  })

  test("settle():  only what differs from the answer sent;  earlier kept text first, never twice;  notes gone", () => {
    const earlier = { id: "q7", label: "Q7 · Old", text: "picked A" }
    const { kept } = AnswerDraft.settle(
      typed({
        answers: { q2: { picked: ["A"] } },
        comments: { context: "sent already" },
        notes: "my notes",
        kept: [earlier]
      }),
      {},
      sent("2026-10-13T20:00:00.000Z", { answers: { q2: { picked: ["A"] } }, comments: { context: "sent already" } })
    )
    expect(kept).toEqual([earlier, { id: "notes", label: "Notes", text: "my notes" }])
    expect(AnswerDraft.merged(kept, [earlier])).toEqual(kept)
  })

  test("newest():  the newest draft newer than the answer;  none newer:  undefined", () => {
    const at = (saved: string) => ({ saved }) as DetailsDraft
    const [old, mid, last] = [at("2026-10-13T19:00:00Z"), at("2026-10-13T21:00:00Z"), at("2026-10-13T22:00:00Z")]
    expect(AnswerDraft.newest([mid, null, last], sent("2026-10-13T20:00:00Z"))).toBe(last)
    expect(AnswerDraft.newest([old, undefined], sent("2026-10-13T20:00:00Z"))).toBeUndefined()
    expect(AnswerDraft.newest([old])).toBe(old)
  })
})
