import React from "react"
import { Message } from "semantic-ui-react"

import { view } from "~/util"
import { store } from "./store"

export const Notice = view(function Notice({ autoHide = true }) {
  const { message } = store

  // autoHide on timeout
  React.useEffect(() => {
    if (!autoHide || message === null) return
    // console.info("creating timer")
    setTimeout(() => {
      // console.info("timer firing for ", message)
      if (store.message === message) store.hideNotice()
    }, 3000)
  }, [message])

  if (!message) return null
  return (
    <Message
      success
      onDismiss={store.hideNotice}
      header={message}
      style={{ position: "fixed", top: 60, left: "calc(50% - 250px)", width: 500, zIndex: 100 }}
    />
  )
})
