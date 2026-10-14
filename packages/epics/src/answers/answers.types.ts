/**
 * Types and constants of `$/epics/answers`:  the pages Claude makes for Owen to answer ON, as their elements keep
 * them (epic `epic-workflow` P12).
 * - a DETAILS page:  questions (`<epic-ask>`), comment and notes boxes (`<epic-text-box>`), Send (`<epic-send>`)
 * - a SYNTAX-CHOICES page:  rows (`<epic-choice-row>`) and their bar (`<epic-choices-bar>`)
 * - The answers' shapes are COPIES of the page server's routes' (`packages/docs/tools/detailsRoutes.ts`,
 *   `choicesRoutes.ts`):  `epics` never imports `docs` (the root's dependency rule).
 * - Pure data and types:  nothing here runs.
 */

////////////////
// ## Routes
////////////////

/** A details page's answer route (`detailsRoutes.ts`):  `POST` sends it, `GET ?page=` reads it back. */
export const DETAILS_API = "/api/details/answer"

/**
 * A page the details route answers for:  in a `details/` folder (`detailsRoutes.ts` `DETAILS_PAGE`);  any other page
 * (Epic UI's, showing an element live) asks nothing.
 */
export const DETAILS_PAGE = /\/details\/[^/]+\.html$/

/** A syntax-choices page's routes (`choicesRoutes.ts`):  `<api>/draft` and `<api>/answer`, `POST` and `GET ?page=`. */
export const CHOICES_API = "/api/choices"

/** How long after the last change a syntax-choices page saves its draft, in ms (Owen:  "5 sec debounce is fine"). */
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
 */
export type PageAnswer = {
  answers: Record<string, AskAnswer>
  comments: Record<string, string>
  notes: string
}

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
  /** show `answer`, as sent:  what it holds of it, or nothing */
  showAnswer(answer: SentAnswer): void
}

/** A question on a details page:  a part with a state, which the Send bar counts ("5 of 17 decided"). */
export type AskPart = AnswerPart & {
  readonly askState: AskState
}

/**
 * A question's state, the plan doc's colours (`templates/epics/plan-doc.md`, "Colours"):
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
// ## A syntax-choices page
////////////////

/**
 * One row of a syntax-choices page, registered with the page's `ChoicesForm` while it's connected
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
  /** put `value` in its box:  a draft or an answer coming back */
  showValue(value: string): void
}

/** What a syntax-choices page sends:  the changed boxes by row id, and the feedback. */
export type ChoicesValues = { values: Record<string, string>; feedback: string }

/** A syntax-choices page's draft (`<slug>.draft.json`):  its values, and when it was saved. */
export type ChoicesDraft = ChoicesValues & { saved: string }

/** A syntax-choices page's answer (`<slug>.answer.json`):  its values, when, and how often sent. */
export type ChoicesAnswer = ChoicesValues & { answered: string; changes?: number }
