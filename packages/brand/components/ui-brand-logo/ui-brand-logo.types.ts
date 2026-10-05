/**
 * Loose constants and types of the `ui-brand-logo` family.
 * - Data only:  nothing here runs.
 */

import type { brandLogoVocabulary } from "./ui-brand-logo.vocabulary.en"

/** `brandLogoVocabulary`'s type. */
export type BrandLogoVocabulary = typeof brandLogoVocabulary

/** A `variant` -> its lockup in `logoPaths.ts` (`mark` draws `MARK` instead). */
export const LOCKUP_OF: Readonly<Record<string, string>> = {
  lockup: "spell-lockup",
  tagline: "spell-lockup-tagline",
  app: "spell-app-lockup"
}
