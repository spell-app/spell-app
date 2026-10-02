/** @jsxImportSource react */
import React from "react"
import * as SUI from "semantic-ui-react"

import { view, CustomError } from "$/util"
import { editor } from "$/app/editor"

/****************
 * ### `<ErrorDisplay>`
 * Display for a single `error`.  This can be inlined, stacked, etc.  See also `<ErrorNotice>`.
 ****************/
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
  }, [autoHide, autoHideDelay, error, onDismiss])

  if (!error) return null

  // `CustomError` keeps its extra info in `props` (see `$/util/spell/CustomError`); plain `Error`s won't have any.
  const customProps = error instanceof CustomError ? error.props : undefined
  const header = (error instanceof CustomError && error.header) || error.constructor.name || "Error"
  const params = customProps?.params && Object.keys(customProps.params).length > 0 ? customProps.params : undefined
  const context = customProps?.context

  const children: ReactNode[] = [
    <SUI.Message.Header key="header">{header}</SUI.Message.Header>,
    <SUI.Message.Content key="message">{error.message}</SUI.Message.Content>
  ]

  // add line break betweeen error and context/params
  if (params || context) children.push(<br key="break" />)
  if (context) children.push(<SUI.Message.Content key="context">Context: {`${context}`}</SUI.Message.Content>)
  if (params) {
    children.push(<SUI.Message.Content key="params-label">Params:</SUI.Message.Content>)
    children.push(
      <SUI.Message.List key="params">
        {Object.entries(params).map(([key, value], index) => (
          <SUI.Message.Item key={index}>{`${key}: ${value}`}</SUI.Message.Item>
        ))}
      </SUI.Message.List>
    )
  }

  return (
    <SUI.Message {...props} error onDismiss={onDismiss}>
      {children}
    </SUI.Message>
  )
}

export type ErrorDisplayProps = Omit<SUI.MessageProps, "error" | "onDismiss"> & {
  /** `Error` to display. */
  error?: Error
  /** Callback when they click the `x` close button. */
  onDismiss?: SUI.MessageProps["onDismiss"]
  /** Auto-hide after a certain amount of time by calling `onDismiss`? */
  autoHide?: boolean
  /** Auto-hide delay, in msec. */
  autoHideDelay?: number
}
/** Fixed position/size for `<ErrorNotice>`'s `<ErrorDisplay>`, centered near the top of the page. */
const FIXED_ERROR_STYLE = { position: "fixed", top: 60, left: "calc(50% - 250px)", width: 500, zIndex: 100 } as const

/****************
 * ### `<ErrorNotice>`
 * Display `editor.error` over page content, via `<ErrorDisplay>`.
 ****************/
export const ErrorNotice = view(function ErrorNotice() {
  const { error } = editor
  if (!error) return null
  const props = {
    error,
    onDismiss: editor.hideError,
    style: FIXED_ERROR_STYLE
  }
  return <ErrorDisplay {...props} />
})
