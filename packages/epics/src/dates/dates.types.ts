/**
 * Loose types and constants of `$/epics/dates`.
 * - Data only:  nothing here runs.
 */

/** A date `PlanDates.read()` understood. */
export type ReadPlanDate = {
  /** the moment it names;  local midnight for a day alone */
  date: Date
  /** it named a time of day, not just a day */
  hasTime: boolean
}

/**
 * Every form a plan doc's date attributes hold:  `YYYY-MM-DD`, then optionally `[T ]HH:MM`, `:SS(.sss)` and an
 * offset (`Z`, `-04:00`, `-0400`).
 * - groups:  year, month, day, hours, minutes, seconds, offset
 */
export const PLAN_DATE =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|z|[+-]\d{2}:?\d{2})?)?$/
