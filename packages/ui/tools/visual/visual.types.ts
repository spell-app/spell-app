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

/**
 * What a parity comparison sets against the ELEMENT render of an example:
 * - `parity` -- the class-grammar original (`--parity`)
 * - `static` -- the element example rendered statically (`--static`:  `StaticRender`, no scripts)
 */
export type ParityKind = "parity" | "static"

/** CSS pixel size of a capture. */
export type ParitySize = { width: number; height: number }

/** One `--parity` / `--static` comparison, written by the spec as JSON and collected by `ParityReport`. */
export type ParityResult = {
  /** `<family>/<name>` */
  id: string
  browser: VisualBrowser
  scheme: VisualScheme
  /** size of the capture set against the elements:  class grammar (`parity`) or static (`static`) */
  other: ParitySize
  /** size of the element render */
  elements: ParitySize
  /** differing pixels over the overlapping area */
  diffPixels: number
  /** `diffPixels` / pixels of the LARGER capture (a size change counts as difference);  `1` when `error` */
  ratio: number
  /** diff image, relative to the report */
  diff?: string
  /** `--static`:  `ui-*` tags the static page still has (families `StaticFamilies` doesn't define yet) */
  leftover?: string[]
  /** `--static`:  the static page failed to render or to be captured;  its first error line */
  error?: string
}
