/**
 * Types of `yarn test:visual` (`tools/visual/`).
 * - Runtime-light:  `import type` only;  `VisualError` is the one class.
 */

import type { VisualHooks } from "../../test/test.types.ts"
import type { VisualSettings } from "./VisualSettings.ts"

////////////////
// ## Run
////////////////

/** A setup problem the person has to fix (no Docker, a bad flag):  the CLI prints the message alone, no stack. */
export class VisualError extends Error {}

/** Where the browsers run:  the host's own, or Linux ones in Docker. */
export type VisualOs = "local" | "linux"

/** A Playwright project:  one browser. */
export type VisualBrowser = (typeof VisualSettings.BROWSERS)[number]

/** A colour scheme a capture is taken in. */
export type VisualScheme = (typeof VisualSettings.SCHEMES)[number]

////////////////
// ## Examples
////////////////

/** One element example, found by `VisualExamples`. */
export type VisualExample = {
  /** `<family>/<name>`, e.g. `ui-button/types`:  the test title and the fixture's `?example=` */
  id: string
  /** family folder, e.g. `ui-button` */
  family: string
  /** file name without `.html`, e.g. `types` */
  name: string
  /** the class-grammar original exists (`examples/<name>.html`):  a `--parity` pair */
  hasClasses: boolean
  /** its `<name>.visual.ts` hooks, if any */
  hooks: VisualHooks
}

////////////////
// ## Parity
////////////////

/** One `--parity` comparison, written by the spec as JSON and collected by `ParityReport`. */
export type ParityResult = {
  /** `<family>/<name>` */
  id: string
  browser: VisualBrowser
  /** CSS pixel sizes of the two captures */
  classes: { width: number; height: number }
  elements: { width: number; height: number }
  /** differing pixels over the overlapping area */
  diffPixels: number
  /** `diffPixels` / pixels of the LARGER capture (a size change counts as difference) */
  ratio: number
  /** diff image, relative to the parity report */
  diff?: string
}
