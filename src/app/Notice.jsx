import React from "react"
import { Message } from "semantic-ui-react"

import { view } from "~/util"
import { store } from "./store"

export const Notice = view(function Notice({ autoHide = true }) {
  const { notice } = store

  // autoHide on timeout
  React.useEffect(() => {
    if (!autoHide || notice === null) return
    // console.info("creating timer")
    setTimeout(() => {
      // console.info("timer firing for ", notice)
      if (store.notice === notice) store.hideNotice()
    }, 3000)
  }, [notice])

  if (!notice) return null
  return (
    <Message
      success
      onDismiss={store.hideNotice}
      header={notice}
      style={{ position: "fixed", top: 60, left: "calc(50% - 250px)", width: 500, zIndex: 100 }}
    />
  )
})
