import {
  NOTES_KEY,
  type AskAnswer,
  type DetailsDraft,
  type KeptText,
  type PageAnswer,
  type PartLabels,
  type SentAnswer,
  type TypedAnswer
} from "./answers.types"

/****************
 * ### `AnswerDraft`
 * The rules of a details page's DRAFT (epic `epic-workflow` P18):  what Owen typed and picked and hasn't sent,
 * laid over what was sent, and kept when the question it was typed for leaves the page.
 * - Why:  agents rewrite a details page while Owen has it open, and a rewrite reloads it, or patches it in place
 *   (replacing the questions that changed).  Before P18 either one dropped everything he hadn't sent (request r4).
 * - What `AnswerForm` does with these, and when:  its own comment.
 * - Pure:  data in, data out;  no DOM, no server.
 ****************/
export class AnswerDraft {
  /**
   * `top` laid over `base`:  for every id `top` knows (its `labels`), `top`'s value, a blank one too;  for every
   * other id, `base`'s.
   * - a draft over the answer sent:  what Owen typed wins, a question added since keeps what was sent for it
   * - the page as it is now over the draft:  what's on the page wins, a question that just left keeps its text
   *   until it's kept (`settle()`)
   * - `kept`:  `top`'s when it has one, else `base`'s
   */
  static over(base: PageAnswer & { labels?: PartLabels }, top: TypedAnswer): TypedAnswer {
    const known = (id: string) => isKnown(top.labels, id)
    const answers = keepUnknown(base.answers, known)
    for (const [key, answer] of Object.entries(top.answers)) answers[key] = { ...answer, picked: [...answer.picked] }
    const comments = { ...keepUnknown(base.comments, known), ...top.comments }
    const notes = known(NOTES_KEY) ? top.notes : base.notes
    const typed: TypedAnswer = { answers, comments, notes, labels: { ...base.labels, ...top.labels } }
    const kept = top.kept ?? base.kept
    if (kept?.length) typed.kept = kept.map((each) => ({ ...each }))
    return typed
  }

  /**
   * Split `typed` by `present` (the ids the page's parts hold now):  what stays, and what is KEPT, its question,
   * option or section gone.
   * - only text that differs from `sent`:  what was sent, the session has already
   * - a question gone:  its picks (with their titles), Other and "more details", as one line
   * - an option gone from a question still there:  the pick (and its comment), each kept under the option's title
   * - a comment box gone, the notes box gone:  its text
   * - `typed`'s own `kept` (from an earlier rewrite) come first, then the new ones;  the same id and text once
   * - what stays knows only the ids `present`
   */
  static settle(typed: TypedAnswer, present: PartLabels, sent?: PageAnswer): { typed: TypedAnswer; kept: KeptText[] } {
    // the ids gone are forgotten:  a question that comes back later shows what was sent for it
    const next: TypedAnswer = { ...typed, answers: {}, comments: {}, labels: { ...present } }
    const fresh: KeptText[] = []
    const keep = (id: string, text: string) => {
      if (text) fresh.push({ id, label: AnswerDraft.labelOf(typed, id), text })
    }
    for (const [key, answer] of Object.entries(typed.answers)) {
      if (isMore(typed, key)) continue
      const more = typed.answers[`${key}${MORE_SUFFIX}`]
      if (!(key in present)) {
        if (!sameAnswer(answer, sent?.answers?.[key]) || !sameAnswer(more, sent?.answers?.[`${key}${MORE_SUFFIX}`]))
          keep(key, AnswerDraft.describe(typed, key, answer, more))
        continue
      }
      // still on the page:  a pick of an option that's gone is kept, under the option
      const gone = answer.picked.filter((letter) => !(`${key}-${letter}` in present))
      for (const letter of gone) if (!sent?.answers?.[key]?.picked.includes(letter)) keep(`${key}-${letter}`, PICKED_IT)
      next.answers[key] = { ...answer, picked: answer.picked.filter((letter) => !gone.includes(letter)) }
      if (more) next.answers[`${key}${MORE_SUFFIX}`] = { picked: more.picked.filter((each) => !gone.includes(each)) }
    }
    for (const [id, text] of Object.entries(typed.comments)) {
      if (id in present) next.comments[id] = text
      else if (text !== sent?.comments?.[id]) keep(id, text)
    }
    if (!(NOTES_KEY in present) && typed.notes && typed.notes !== sent?.notes) {
      keep(NOTES_KEY, typed.notes)
      next.notes = ""
    }
    const kept = AnswerDraft.merged(typed.kept ?? [], fresh)
    if (kept.length) next.kept = kept
    else delete next.kept
    return { typed: next, kept }
  }

  /**
   * The newest of `drafts` (the server's, the browser's) that is newer than the answer `sent`;  `undefined` for
   * none:  a draft older than the answer was sent already (another window's, or Send's draft deleted late).
   */
  static newest(drafts: Array<DetailsDraft | null | undefined>, sent?: SentAnswer): DetailsDraft | undefined {
    const after = sent ? Date.parse(sent.answered) : -Infinity
    return drafts
      .filter((draft): draft is DetailsDraft => !!draft && Date.parse(draft.saved) > after)
      .sort((one, other) => Date.parse(other.saved) - Date.parse(one.saved))[0]
  }

  /**
   * `id`'s title for people, from `typed`'s labels:  a question's (`Q1 · Which layout?`), an option's with its
   * question's (`Q1 · Which layout?, B · Blue`), a section's;  else the id itself.
   */
  static labelOf(typed: TypedAnswer, id: string): string {
    const own = typed.labels[id]
    const key = Object.keys(typed.answers).find((each) => id.startsWith(`${each}-`) && !isMore(typed, each))
    if (key) return `${typed.labels[key] ?? key}, ${own ?? id.slice(key.length + 1)}`
    return own ?? id
  }

  /** Question `key`'s answer as one line:  `picked B · Blue;  Other:  neither;  more details wanted on B`. */
  static describe(typed: TypedAnswer, key: string, answer: AskAnswer, more?: AskAnswer): string {
    const option = (letter: string) => typed.labels[`${key}-${letter}`] ?? letter
    const pieces: string[] = []
    if (answer.picked.length) pieces.push(`picked ${answer.picked.map(option).join(", ")}`)
    if (answer.other) pieces.push(`Other:  ${answer.other}`)
    if (more?.picked.length) pieces.push(`more details wanted on ${more.picked.join(", ")}`)
    return pieces.join(";  ")
  }

  /** `earlier`, then those of `later` not among them (the same id and text). */
  static merged(earlier: KeptText[], later: KeptText[]): KeptText[] {
    const seen = new Set(earlier.map(keyOf))
    return [...earlier, ...later.filter((each) => !seen.has(keyOf(each)))]
  }
}

////////////////
// ## Helpers
////////////////

/** The answer key of "Provide more details":  `<key>-more` (as `<epic-ask>` writes it). */
const MORE_SUFFIX = "-more"

/** A kept option pick's text. */
const PICKED_IT = "picked it, and it's no longer an option"

/** Does `labels` know `id`:  its own, or (`<key>-more`) its question's? */
function isKnown(labels: PartLabels, id: string): boolean {
  return id in labels || (id.endsWith(MORE_SUFFIX) && id.slice(0, -MORE_SUFFIX.length) in labels)
}

/** Is `key` a question's "more details" (`<key>-more`, its question among `typed`'s answers)? */
function isMore(typed: TypedAnswer, key: string): boolean {
  return key.endsWith(MORE_SUFFIX) && key.slice(0, -MORE_SUFFIX.length) in typed.answers
}

/** `record`'s entries whose id `known` doesn't know, copied. */
function keepUnknown<T>(record: Record<string, T> | undefined, known: (id: string) => boolean): Record<string, T> {
  return Object.fromEntries(Object.entries(record ?? {}).filter(([id]) => !known(id)))
}

/** The same answer, blank counting as none? */
function sameAnswer(one: AskAnswer | undefined, other: AskAnswer | undefined): boolean {
  const flat = (answer?: AskAnswer) =>
    answer && (answer.picked.length || answer.other) ? JSON.stringify([answer.picked, answer.other ?? ""]) : ""
  return flat(one) === flat(other)
}

/** A kept text's identity:  its id and text. */
function keyOf(kept: KeptText): string {
  return `${kept.id}\n${kept.text}`
}
