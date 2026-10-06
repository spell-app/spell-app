/**
 * Constants and types of the `ui-docs-example` family:  what the element (`UIDocsExample`) and its native fallback
 * share.
 * - Pure data, at the bottom of the folder's imports:  `import type` only, so node can load it (`yarn site:data`).
 *   A constant only one class reads sits below that class (epic `wwod-spell-ui`, Q18):  `ExampleSource`'s and
 *   `HtmlFormatter`'s are in their files.
 */

import type { HeadingBounds } from "$/ui/docs-components/docs-components.types"
import type { docsExampleVocabulary } from "./ui-docs-example.vocabulary.en"

/** `docsExampleVocabulary`'s type. */
export type DocsExampleVocabulary = typeof docsExampleVocabulary

/** Id of the code pane inside the shadow root, for the button's `aria-controls`. */
export const CODE_PANE_ID = "code"

/** `level`:  any heading level;  unset, `4`:  Fomantic's examples are `h4`. */
export const LEVELS: HeadingBounds = { min: 1, max: 6, fallback: 4 }
