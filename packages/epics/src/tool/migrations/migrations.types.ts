/**
 * Types the epic page MIGRATIONS share (`Migrations`, each step, `MigrateCommands`).
 * - Data only:  nothing here runs.
 */

/**
 * Every KIND of page a migration step can be for (epic `epic-workflow`, J44), by the names P14 proposes.
 * - `epic`:  an epic page (`epics/<name>/<name>.plan.html`):  its steps are `Migrations`, here
 * - the rest are the docs package's (`packages/epics/tools/migrate.js` `KINDS`, kept the same:  its test checks)
 * - `goal`:  none yet;  Goals Foundation (P15) adds the pages and their steps
 */
export const PAGE_KINDS = [
  "epic",
  "goal",
  "guide",
  "cheatsheet",
  "command",
  "changelog",
  "template",
  "home",
  "list",
  "detail",
  "choice",
  "component",
  "brand",
  "goal-set"
] as const

/** One of `PAGE_KINDS`. */
export type PageKind = (typeof PAGE_KINDS)[number]

/**
 * One MIGRATION:  a named, idempotent step that brings an older epic page's markup up to today's.
 * - `run()` works on the ASSEMBLED document (a split doc's parts read into their hosts), IN PLACE
 * - running it on a doc it has already migrated changes nothing, and returns false
 */
export type Migration = {
  /** Its name, kebab-case:  `updates-as-epic-update`.  What `migrate --step` and the log name it by. */
  readonly name: string
  /** The kind of page it's for:  `epic`, for every step in `Migrations`. */
  readonly kind: PageKind
  /** The day it was added, `YYYY-MM-DD`:  so a reader can tell what happened to the pages, and when. */
  readonly date: string
  /** What it does and why, one line, for a listing. */
  readonly description: string
  /**
   * Does every edit run it too (`PlanDocFiles.edit()`), not only `migrate`?
   * - true for a cheap markup step, so an older doc comes up to date the first time anything edits it
   * - false for a step that reports, or rewrites more than markup (`links-agree`):  only on command
   */
  readonly everyEdit: boolean
  /** Migrate `document`;  did it change anything? */
  run(document: Document, context: MigrationContext): boolean
}

/** What a migration may need beside the document, and what it hands back besides it. */
export type MigrationContext = {
  /** Now:  the time stamped where a doc holds none to carry over. */
  now: Date
  /**
   * The page's review inbox as it stands (its marks and comments:  `ReviewInbox`), when the runner read it
   * (`migrate`);  steps READ it, never write it:  they say what to change in `moves`.
   */
  inbox?: InboxView
  /** One line for each thing a step fixed or found, for the page's report:  `links-agree:  ...`. */
  notes?: string[]
  /** Comments to move to another anchor, which the runner writes into the inbox after the page (`AnchorMove`). */
  moves?: AnchorMove[]
}

/** What a step reads of a review inbox:  the keys of what's waiting on an item, and each comment's place. */
export type InboxView = {
  /** marks, drafts, urgency, agents at work, requests called off:  each keyed by an item, phase or section id */
  keyed: Record<string, Record<string, unknown>>
  /** Owen's comments, by id:  where each sits (`BlockAnchors.js`) */
  comments: Record<string, { anchor: string; excerpt?: string }>
}

/** A comment whose block moved:  its anchor `from`, and `to` where the block is now. */
export type AnchorMove = {
  /** the comment's id, `cm3` */
  id: string
  /** its anchor as the inbox holds it, `p10#field-1` */
  from: string
  /** where its block is now, `p11#field-1` */
  to: string
}
