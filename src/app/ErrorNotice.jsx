import React from "react"
import * as SUI from "semantic-ui-react"

import { view } from "~/util"
import { store } from "./store"

/**
 * Display for a single `error`.
 * This can be inlined, stacked, etc.
 * See also `<ErrorNotice>`.
 */
export function ErrorDisplay(allProps) {
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
    if (!onDismiss || !autoHide || error === null) return
    setTimeout(onDismiss, autoHideDelay)
  }, [error])

  if (!error) return null

  const header = error.header || error.constructor.name || "Error"
  const params = error.params && Object.keys(error.params).length > 0 ? error.params : undefined
  const context = error.context

  props.error = true
  props.onDismiss = onDismiss
  props.children = [
    <SUI.Message.Header key="header">{header}</SUI.Message.Header>,
    <SUI.Message.Content key="message">{error.message}</SUI.Message.Content>
  ]

  // add line break betweeen error and context/params
  if (params || context) props.children.push(<br key="break" />)
  if (context) props.children.push(<SUI.Message.Content key="context">Context: {`${context}`}</SUI.Message.Content>)
  if (params) {
    props.children.push(<SUI.Message.Content key="params-label">Params:</SUI.Message.Content>)
    props.children.push(
      <SUI.Message.List key="params">
        {Object.entries(params).map(([key, value], index) => (
          <SUI.Message.Item key={index}>{`${key}: ${value}`}</SUI.Message.Item>
        ))}
      </SUI.Message.List>
    )
  }

  return <SUI.Message {...props} />
}

/**
 * Display `store.error` over page content.
 */
const FIXED_ERROR_STYLE = { position: "fixed", top: 60, left: "calc(50% - 250px)", width: 500, zIndex: 100 }
export const ErrorNotice = view(function ErrorNotice() {
  const { error } = store
  if (!error) return
  const props = {
    error,
    onDismiss: store.hideError,
    style: FIXED_ERROR_STYLE
  }
  return <ErrorDisplay {...props} />
})
