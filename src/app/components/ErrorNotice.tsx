import React from "react"
import { Message } from "semantic-ui-react"
import type { MessageProps } from "semantic-ui-react"

import { view, CustomError } from "~/util"
import { store } from "~/app/store"

export type ErrorDisplayProps = Omit<MessageProps, "error" | "onDismiss"> & {
  /** `Error` to display. */
  error?: Error
  /** Callback when they click the `x` close button. */
  onDismiss?: MessageProps["onDismiss"]
  /** Auto-hide after a certain amount of time by calling `onDismiss`? */
  autoHide?: boolean
  /** Auto-hide delay, in msec. */
  autoHideDelay?: number
}

/**
 * Display for a single `error`.
 * This can be inlined, stacked, etc.
 * See also `<ErrorNotice>`.
 */
export function ErrorDisplay(allProps: ErrorDisplayProps) {
  const {
    error, // `Error` to display
    onDismiss, // Callback when they click the `x` close button.
    autoHide = false, // Auto-hide after a certain amount of time by calling `onDismiss`?
    autoHideDelay = 3000, // Auto-hide delay, in msec.
    ...props // Other props like `id`, `style`, aria stuff
  } = allProps

  // autoHide on timeout
  // TODO: do we need to cache the timer id?
  React.useEffect(() => {
    if (!onDismiss || !autoHide || error === undefined) return
    setTimeout(onDismiss, autoHideDelay)
  }, [error])

  if (!error) return null

  // `CustomError` keeps its extra info in `props` (see `~/util/CustomError`); plain `Error`s won't have any.
  const customProps = error instanceof CustomError ? error.props : undefined
  const header = (error instanceof CustomError && error.header) || error.constructor.name || "Error"
  const params = customProps?.params && Object.keys(customProps.params).length > 0 ? customProps.params : undefined
  const context = customProps?.context

  const children: ReactNode[] = [
    <Message.Header key="header">{header}</Message.Header>,
    <Message.Content key="message">{error.message}</Message.Content>
  ]

  // add line break betweeen error and context/params
  if (params || context) children.push(<br key="break" />)
  if (context) children.push(<Message.Content key="context">Context: {`${context}`}</Message.Content>)
  if (params) {
    children.push(<Message.Content key="params-label">Params:</Message.Content>)
    children.push(
      <Message.List key="params">
        {Object.entries(params).map(([key, value], index) => (
          <Message.Item key={index}>{`${key}: ${value}`}</Message.Item>
        ))}
      </Message.List>
    )
  }

  return <Message {...props} error onDismiss={onDismiss} children={children} />
}

/**
 * Display `store.error` over page content.
 */
const FIXED_ERROR_STYLE = { position: "fixed", top: 60, left: "calc(50% - 250px)", width: 500, zIndex: 100 } as const
export const ErrorNotice = view(function ErrorNotice() {
  const { error } = store
  if (!error) return null
  const props = {
    error,
    onDismiss: store.hideError,
    style: FIXED_ERROR_STYLE
  }
  return <ErrorDisplay {...props} />
})
