/**
 * Shared constants of the `ui-parts` family:  what its element classes, its native fallback and the tests share.
 * - Runtime-light:  no element code, so every file of the family may import it.
 * - The ONE types file that value-imports vocabularies (`packages/ui/AGENTS.md` "Overview"):  `PartVocabularies` IS
 *   the list of them, and no vocabulary of this family imports this file back, so there's no cycle.
 */

import { contentVocabulary } from "./ui-content.vocabulary.en"
import { headerVocabulary } from "./ui-header.vocabulary.en"
import { descriptionVocabulary } from "./ui-description.vocabulary.en"
import { metaVocabulary } from "./ui-meta.vocabulary.en"
import { extraVocabulary } from "./ui-extra.vocabulary.en"
import { actionsVocabulary } from "./ui-actions.vocabulary.en"
import { titleVocabulary } from "./ui-title.vocabulary.en"
import { summaryVocabulary } from "./ui-summary.vocabulary.en"
import { dateVocabulary } from "./ui-date.vocabulary.en"
import { authorVocabulary } from "./ui-author.vocabulary.en"
import { avatarVocabulary } from "./ui-avatar.vocabulary.en"
import { detailVocabulary } from "./ui-detail.vocabulary.en"
import { valueVocabulary } from "./ui-value.vocabulary.en"

////////////////
// ## Parts
////////////////

/** Part nouns, in the order the plan lists them;  each is also the class its root renders. */
export const PartNouns = [
  "content",
  "header",
  "description",
  "meta",
  "extra",
  "actions",
  "title",
  "summary",
  "date",
  "author",
  "avatar",
  "detail",
  "value"
] as const

/** Every part's vocabulary, in `PartNouns` order. */
export const PartVocabularies = [
  contentVocabulary,
  headerVocabulary,
  descriptionVocabulary,
  metaVocabulary,
  extraVocabulary,
  actionsVocabulary,
  titleVocabulary,
  summaryVocabulary,
  dateVocabulary,
  authorVocabulary,
  avatarVocabulary,
  detailVocabulary,
  valueVocabulary
] as const

////////////////
// ## Roles
////////////////

/** Role of a linked or owned header with a `level` (`<ui-header>` and its fallback). */
export const HEADING = "heading"
