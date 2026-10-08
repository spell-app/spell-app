/**
 * The `ui-parts` family's shared lists:  every part's noun and vocabulary, in one order.
 * - Read by the family's tests, and by `test/StubOwner.tsx` (stand-in owners for tests and the demo).
 * - Runtime-light:  no element code, so any file may import it.
 * - The ONE types file that value-imports vocabularies (`packages/ui/AGENTS.md` "Overview"):
 *   `PartVocabularies` IS the list of them, and no vocabulary of this family imports this file back,
 *   so there's no cycle.
 */

import { contentVocabulary } from "./UIContent.en"
import { headerVocabulary } from "./UIHeader.en"
import { descriptionVocabulary } from "./UIDescription.en"
import { metaVocabulary } from "./UIMeta.en"
import { extraVocabulary } from "./UIExtra.en"
import { actionsVocabulary } from "./UIActions.en"
import { titleVocabulary } from "./UITitle.en"
import { summaryVocabulary } from "./UISummary.en"
import { dateVocabulary } from "./UIDate.en"
import { authorVocabulary } from "./UIAuthor.en"
import { avatarVocabulary } from "./UIAvatar.en"
import { detailVocabulary } from "./UIDetail.en"
import { valueVocabulary } from "./UIValue.en"

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
