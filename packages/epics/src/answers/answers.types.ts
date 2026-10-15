/**
 * Types and constants of `$/epics/answers`:  the pages Claude makes for Owen to answer ON, as their elements keep
 * them (epic `epic-workflow` P12).
 * - a DETAILS page:  questions (`<epic-ask>`), comment and notes boxes (`<epic-text-box>`), Send (`<epic-send>`)
 * - a CHOICE page:  rows (`<epic-choice-row>`) and their bar (`<epic-choices-bar>`)
 * - The answers' shapes are COPIES of the page server's routes' (`packages/epics/tools/detailsRoutes.ts`,
 *   `choicesRoutes.ts`):  `epics` never imports `docs` (the root's dependency rule).
 * - Pure data and types:  nothing here runs.
 */

////////////////
// ## Routes
////////////////

/** A details page's answer route (`detailsRoutes.ts`):  `POST` sends it, `GET ?page=` reads it back. */
export const DETAILS_API = "/api/docs/details/answer"

/**
 * A details page's draft route (`detailsRoutes.ts`, epic `epic-workflow` P18):  `POST` saves what's typed and not
 * sent, `GET ?page=` reads it back.  It never wakes anyone:  only Send does.
 */
export const DETAILS_DRAFT_API = "/api/docs/details/draft"

/**
 * How long after the last change a details page saves its draft, in ms:  "a moment after he stops typing"
 * (P18;  a choice page waits 5s, `CHOICES_SAVE_MS`).  The browser's own copy is written at once.
 */
export const DETAILS_SAVE_MS = 2000

/**
 * How long after a question or box leaves the page (an agent's rewrite, patched in place) the page looks for what
 * it held and keeps it, in ms:  the rewrite's new elements join in the meantime.
 */
export const DETAILS_SETTLE_MS = 250

/** The browser's copy of a details page's draft (`localStorage`):  this, then the page's path. */
export const DRAFT_KEY_PREFIX = "spell-details-draft:"

/** The key of the page's notes, among the ids a page's parts hold (`PartLabels`). */
export const NOTES_KEY = "notes"

/**
 * A page the details route answers for:  in a `details/` folder (`detailsRoutes.ts` `DETAILS_PAGE`);  any other page
 * (Epic UI's, showing an element live) asks nothing.
 */
export const DETAILS_PAGE = /\/details\/[^/]+\.html$/

/** A choice page's routes (`choicesRoutes.ts`):  `<api>/draft` and `<api>/answer`, `POST` and `GET ?page=`. */
export const CHOICES_API = "/api/docs/choices"

/** How long after the last change a choice page saves its draft, in ms (Owen:  "5 sec debounce is fine"). */
export const CHOICES_SAVE_MS = 5000

/**
 * A page the choices routes save for:  in a `details/` folder (`choicesRoutes.ts` `choicesPage()`).
 * The template, or a copy elsewhere, asks nothing.
 */
export const SAVED_CHOICES_PAGE = /\/details\/[^/]+\.html$/

/** The docs runtime's per-page fold store:  `spell-doc-runtime.js` `FOLD_KEY_PREFIX`, `{ [section id]: folded }`. */
export const FOLD_KEY_PREFIX = "spell-folds:"

////////////////
// ## A details page's answer
////////////////

/**
 * What a details page holds, as the route takes it (`POST { page, answers, comments, notes }`).
 * - `answers`:  by question key (its section's id, `q1`);  `{ picked }` with the options' letters, `other` when
 *   Other is filled;  "Provide more details" under `<key>-more`, as its own `{ picked }`
 * - `comments`:  by section id, and by option (`q1-B`);  only the filled ones
 * - `notes`:  the page's notes box
 * - `kept`:  text typed for a question, option or section that is gone from the page since (P18);  absent for none
 */
export type PageAnswer = {
  answers: Record<string, AskAnswer>
  comments: Record<string, string>
  notes: string
  kept?: KeptText[]
}

/**
 * Text Owen typed or picked on a details page, kept after its question, option or section left the page (an
 * agent rewrote it, P18):  shown in its own box, "Kept from before the page changed", and sent with the rest.
 * - `id`:  the id it was under (`q3`, an option's `q1-B`, a section's `context`, `notes`)
 * - `label`:  where it was, for people (`Q3 · Which layout?`, `Q1 · Which layout?, B · Blue`)
 * - `text`:  what he typed, or picked (`picked B · Blue;  Other:  neither`)
 */
export type KeptText = { id: string; label: string; text: string }

/**
 * The ids a details page's parts hold answers under, each with its title for people:  a question's key
 * (`q1` -> `Q1 · Which layout?`), each of its options (`q1-B` -> `B · Blue`), a section's comment box
 * (`context` -> `1. Context`), the notes (`NOTES_KEY`).
 * - a draft keeps them, so text whose id is gone from a rewritten page is kept under its old title
 */
export type PartLabels = Record<string, string>

/** What a details page holds as typed, with the ids it was typed under:  a draft's data (`AnswerDraft`). */
export type TypedAnswer = PageAnswer & { labels: PartLabels }

/**
 * A details page's draft, `<slug>.draft.json` beside it (P18):  what was typed and not sent, saved a moment after
 * each change, and put back when the page loads again (a reload, an agent's rewrite).
 * - `page`:  the page's URL path;  `saved`:  when, ISO
 * - only a draft NEWER than the answer sent counts:  Send deletes it
 */
export type DetailsDraft = TypedAnswer & { page: string; saved: string }

/** One question's answer:  the letters picked (`[]` for none), and Other when written. */
export type AskAnswer = { picked: string[]; other?: string }

/**
 * A details page's `<slug>.answer.json`, as the route wrote it:  what was sent, plus when, how often, and what
 * changed since the send before (`changed`:  question keys, `comment:<id>`, `notes`).
 */
export type SentAnswer = PageAnswer & {
  page: string
  answered: string
  changes: number
  changed?: string[]
}

/**
 * Something on a details page that holds part of the answer, registered with the page's `AnswerForm` while it's
 * connected:  a question (`<epic-ask>`) or a box (`<epic-text-box>`).
 */
export type AnswerPart = {
  /** its element:  parts gather in page order */
  readonly domElement: Element
  /** add what it holds to `page` */
  gatherInto(page: PageAnswer): void
  /** show `answer`, as sent (or a draft put back over it):  what it holds of it, or nothing */
  showAnswer(answer: SentAnswer): void
  /** add the ids it holds answers under, each with its title for people (`PartLabels`) */
  labelsInto(labels: PartLabels): void
}

/** A question on a details page:  a part with a state, which the Send bar counts ("5 of 17 decided"). */
export type AskPart = AnswerPart & {
  readonly askState: AskState
}

/**
 * A question's state, the epic page's colours (`templates/epics/plan-doc.md`, "Colours"):
 * - `attention` (red, needs Owen):  nothing yet
 * - `done` (green, decided):  an option picked
 * - `working` (blue, Claude's to do):  "Provide more details" asked, or only Other written
 */
export type AskState = "attention" | "done" | "working"

/**
 * Where a details page's answer stands, which the Send bar shows (the colour scheme's FILL RULE):
 * - `rest`:  never sent, nothing on the page:  a grey outline
 * - `pending`:  something on the page not sent, or changed since the send:  dashed blue
 * - `sent`:  the page as sent:  a blue outline
 */
export type SendFill = "rest" | "pending" | "sent"

////////////////
// ## A choice page
////////////////

/**
 * One row of a choice page, registered with the page's `ChoicesForm` while it's connected
 * (`<epic-choice-row>`).
 */
export type ChoiceRowPart = {
  readonly domElement: Element
  /** its id:  the key of its value in the draft and the answer */
  readonly rowName: string
  /** Claude's recommendation, the box's starting text */
  readonly recommended: string | undefined
  /** what its box holds now, as typed */
  readonly value: string
  /** the box differs from the recommendation (trimmed) */
  readonly isChanged: boolean
  /**
   * its table's key when Owen can put its rows in order (`<epic-choice-rows reorder>`):  its section's id;
   * `undefined` for a table that keeps its order
   */
  readonly orderKey: string | undefined
  /** its place in its table, from 0 */
  readonly orderIndex: number
  /** put `value` in its box:  a draft or an answer coming back */
  showValue(value: string): void
}

/**
 * What a choice page sends:  the changed boxes by row id, and the feedback.
 * - `order`:  each table Owen can put in order (`<epic-choice-rows reorder>`), by its section's id:  its row ids in
 *   the order he left them;  none without such a table
 */
export type ChoicesValues = { values: Record<string, string>; feedback: string; order?: ChoicesOrder }

/** Each reorderable table's row ids, in the order Owen left them, by its section's id. */
export type ChoicesOrder = Record<string, string[]>

/** A choice page's draft (`<slug>.draft.json`):  its values, and when it was saved. */
export type ChoicesDraft = ChoicesValues & { saved: string }

/** A choice page's answer (`<slug>.answer.json`):  its values, when, and how often sent. */
export type ChoicesAnswer = ChoicesValues & { answered: string; changes?: number }
