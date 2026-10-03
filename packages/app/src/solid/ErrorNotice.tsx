import { For, Show, createEffect, createMemo } from "solid-js"
import type { JSX } from "@solidjs/web"

import { CustomError } from "$/util"
import { editor } from "$/app/editor"
import { on, tracked } from "$/app/solid"

/****************
 * ### `<ErrorDisplay>`
 * One `error` as an error `<ui-message>`:  its header, message, and a `CustomError`'s context and params.
 * Inline, stacked, wherever;  see also `<ErrorNotice>`, and `<ErrorBoundary>`'s default fallback.
 * - `onDismiss` given:  a close button, which calls it.  The message never hides itself:  the caller drops it.
 * - `autoHide`:  calls `onDismiss` after `autoHideDelay` ms, restarted when `error` changes.
 ****************/
export function ErrorDisplay(props: ErrorDisplayProps) {
  const info = createMemo(() => (props.error ? describeError(props.error) : undefined))

  createEffect(
    () => [props.error, props.autoHide, props.autoHideDelay ?? 3000, props.onDismiss] as const,
    ([error, autoHide, delay, onDismiss]) => {
      if (!error || !autoHide || !onDismiss) return
      const timer = setTimeout(() => onDismiss(), delay)
      return () => clearTimeout(timer)
    }
  )

  return (
    <Show when={info()}>
      {(info) => (
        <ui-message
          state="error"
          header={info().header}
          dismissible={!!props.onDismiss}
          id={props.id}
          class={props.class}
          style={props.style}
          ref={on("ui-dismiss", dismiss)}
        >
          <p>{info().message}</p>
          <Show when={info().context}>
            <p>Context: {info().context}</p>
          </Show>
          <Show when={info().params}>
            {(params) => (
              <>
                <p>Params:</p>
                <ul>
                  <For each={params()}>{(param) => <li>{param}</li>}</For>
                </ul>
              </>
            )}
          </Show>
        </ui-message>
      )}
    </Show>
  )

  /** The close button:  keep the message (the caller removes it), tell `onDismiss`. */
  function dismiss(event: Event) {
    event.preventDefault()
    props.onDismiss?.()
  }
}

/** Props for `<ErrorDisplay>`. */
export type ErrorDisplayProps = {
  /** `Error` to show;  nothing while `undefined`. */
  error?: Error
  /** Close button clicked, or `autoHide` ran out.  No close button without it. */
  onDismiss?: () => void
  /** Call `onDismiss` after `autoHideDelay`. */
  autoHide?: boolean
  /** Auto-hide delay, ms.  Default:  `3000`. */
  autoHideDelay?: number
  /** Id of the message. */
  id?: string
  /** Class of the message. */
  class?: string
  /** Style of the message host.  NOTE: the host is `display: contents`:  position a wrapper instead. */
  style?: JSX.CSSProperties
}

/** What `<ErrorDisplay>` shows of an error. */
type ErrorInfo = {
  /** `CustomError`'s `header`, else the class name. */
  header: string
  /** `error.message`. */
  message: string
  /** `CustomError`'s `props.context`, as text. */
  context?: string
  /** `CustomError`'s `props.params`, as `key: value` lines;  `undefined` when none. */
  params?: string[]
}

/** `error`, as `<ErrorDisplay>` shows it.  `CustomError` keeps its extras in `props` (`$/util`'s `CustomError`). */
function describeError(error: Error): ErrorInfo {
  const custom = error instanceof CustomError ? error : undefined
  const params = custom?.props?.params
  const context = custom?.props?.context
  const entries = params ? Object.entries(params) : []
  return {
    header: custom?.header || error.constructor.name || "Error",
    message: error.message,
    context: context ? `${context}` : undefined,
    params: entries.length ? entries.map(([key, value]) => `${key}: ${value}`) : undefined
  }
}

/** Where a floating message sits:  fixed, centered near the top of the page.  On a WRAPPER:  hosts are `contents`. */
export const FLOATING_MESSAGE_STYLE: JSX.CSSProperties = {
  position: "fixed",
  top: "60px",
  left: "calc(50% - 250px)",
  width: "500px",
  "z-index": 100
}

/****************
 * ### `<ErrorNotice>`
 * `editor.error` over the page content, through `<ErrorDisplay>`;  closing it calls `editor.hideError()`.
 ****************/
export function ErrorNotice() {
  const error = tracked(() => editor.error)
  return (
    <Show when={error()}>
      {(error) => (
        <div class="ErrorNotice" style={FLOATING_MESSAGE_STYLE}>
          <ErrorDisplay error={error()} onDismiss={() => editor.hideError()} />
        </div>
      )}
    </Show>
  )
}
