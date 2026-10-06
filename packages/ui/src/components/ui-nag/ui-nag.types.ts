/**
 * Constants and types of the `ui-nag` family:  what its element (`UINag`), host and native fallback share.
 * - Pure data, at the bottom of the folder's imports:  `import type` only, so node can load it (`yarn site:data`).
 *   `DismissalStore`'s props and constants sit below that class, `UINag`'s below it (epic `wwod-spell-ui`, Q18).
 */

import type { E } from "$/ui/core"
import type { nagVocabulary } from "./ui-nag.vocabulary.en"

/** Vocabulary type, for brevity. */
export type Vocabulary = typeof nagVocabulary

/** What the host asks of its controller (`UINag`). */
export type NagController = {
  /** dismiss it now, reason `dismiss`, storing the dismissal;  true when it closes */
  close(): boolean
  /** show it again, unless a stored dismissal says not;  true when it shows */
  show(): boolean
  /** forget a stored dismissal */
  clear(): void
  /** a dismissal is stored (and not expired) */
  isDismissed(): boolean
}

/** Closed, the host `hidden`:  the event the fallback fires (the element's goes through `emit()`). */
export const HIDE_EVENT: E.EventName<Vocabulary> = "ui-hide"
