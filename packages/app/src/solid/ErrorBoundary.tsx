import { Errored, runWithOwner, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import { ErrorDisplay } from "$/app/solid"

/****************
 * ### `<ErrorBoundary>`
 * Shows an error in place of `children` when rendering or updating them throws:  Solid's `<Errored>`, with the
 * app's defaults.  Replaces React's `ErrorHandler` class (subclass + `Component` / `ErrorComponent` / `Wrapper`):
 * wrap the body instead, and pass `fallback` for a custom error view.
 * - Default fallback:  `<ErrorDisplay>` of the error.
 * - `onError` runs OUTSIDE any owner and untracked, so it may write `editor` or signals
 *   (Solid forbids writes in an owned scope).  It runs each time the fallback renders.
 * - WHY every viewer wants one:  an uncaught error in a computation halts Solid's scheduler for the whole page
 *   (`REACTIVITY_HALTED`), every island included.
 * - It heals by itself:  when the data underneath changes and the children render, they come back.
 *   `reset()` (given to `fallback`) retries now.
 * - Non-`Error` throws are wrapped:  `new Error(String(thrown))`.
 ****************/
export function ErrorBoundary(props: ErrorBoundaryProps) {
  return (
    <Errored
      fallback={(thrown, reset) => {
        const error = toError(thrown())
        if (props.onError) runWithOwner(null, () => untrack(() => props.onError!(error)))
        return props.fallback ? props.fallback(error, reset) : <ErrorDisplay error={error} />
      }}
    >
      {props.children}
    </Errored>
  )
}

/** Props for `<ErrorBoundary>`. */
export type ErrorBoundaryProps = {
  /** What it guards. */
  children?: JSX.Element
  /** Error view instead of `<ErrorDisplay>`;  `reset()` re-renders the children. */
  fallback?: (error: Error, reset: () => void) => JSX.Element
  /** Told of each error caught, e.g. to log it or `editor.showError()` it. */
  onError?: (error: Error) => void
}

/** `thrown` as an `Error`. */
function toError(thrown: unknown): Error {
  return thrown instanceof Error ? thrown : new Error(String(thrown))
}
