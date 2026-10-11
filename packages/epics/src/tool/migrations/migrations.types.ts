/**
 * Types the plan doc MIGRATIONS share (`Migrations`, each step).
 * - Data only:  nothing here runs.
 */

/**
 * One MIGRATION:  a named, idempotent step that brings an older plan doc's markup up to today's.
 * - `run()` works on the ASSEMBLED document (a split doc's parts read into their hosts), IN PLACE
 * - running it on a doc it has already migrated changes nothing, and returns false
 */
export type Migration = {
  /** Its name, kebab-case:  `updates-as-epic-update`.  What `epic migrate` (to come) and the log name it by. */
  readonly name: string
  /** What it does, one line, for a listing. */
  readonly description: string
  /** Migrate `document`;  did it change anything? */
  run(document: Document, context: MigrationContext): boolean
}

/** What a migration may need beside the document. */
export type MigrationContext = {
  /** Now:  the time stamped where a doc holds none to carry over. */
  now: Date
}
