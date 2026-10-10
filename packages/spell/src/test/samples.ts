import { readFileSync } from "fs"
import { resolve } from "path"

/**
 * Hand-written samples of what a target writes, beside this file:  `<Name>.sample.<ext>`.
 * - For testing what's around a writer (checking its output, building it, running it) apart from the writer itself.
 * - Not spell projects:  those are the fixtures, `projects/test/`.
 */
const SAMPLES_DIR = import.meta.dirname

/**
 * `Cards.sample.tsx`:  Solid TypeScript as the `ts/solid` target writes it -- `@prop`, `@drawn`, JSX with `<Show>`,
 * `<For>` and a `<ui-button>`, a click handler -- written by hand.  Its own docstring says more.
 */
export function solidSample(): string {
  return readFileSync(resolve(SAMPLES_DIR, "Cards.sample.tsx"), "utf8")
}
