/**
 * Types of `yarn test:visual` (`tools/visual/`).
 * - At the bottom of the folder's import graph, and runtime-light:  `import type` only;  its values are the error
 *   classes and `VisualMarkups`, so the fixture page (`fixture.ts`, in the browser) can import it too.
 */

import type { VisualHooks } from "../../test/test.types.ts"
import type { VisualSettings } from "./VisualSettings.ts"

export type { VisualOs } from "../environment.ts"

////////////////
// ## Run
////////////////

/** A setup problem the person has to fix (no Docker, a bad flag):  the CLI prints the message alone, no stack. */
export class VisualError extends Error {}
VisualError.prototype.name = "VisualError"

/** A bad flag value:  the CLI prints the message with the usage. */
export class FlagError extends VisualError {}
FlagError.prototype.name = "FlagError"

/** A Playwright project:  one browser. */
export type VisualBrowser = (typeof VisualSettings.BROWSERS)[number]

/** A colour scheme a capture is taken in. */
export type VisualScheme = (typeof VisualSettings.SCHEMES)[number]

////////////////
// ## Examples
////////////////

/**
 * Which markup of an example the fixture renders (`fixture.html?kind=`):
 * - `elements` -- `examples/elements/<name>.html`, the baselined render
 * - `classes` -- the class-grammar original `examples/<name>.html`, for `--parity` only
 */
export const VisualMarkups = ["elements", "classes"] as const
/** One of `VisualMarkups`. */
export type VisualMarkup = (typeof VisualMarkups)[number]

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
