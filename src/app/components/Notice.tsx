import React from "react"
import * as SUI from "semantic-ui-react"

import { view } from "~/util"
import { store } from "~/app/store"

export type NoticeProps = {
  autoHide?: boolean
}

export const Notice = view(function Notice({ autoHide = true }: NoticeProps) {
  const { notice } = store

  // autoHide on timeout
  // NOTE: cleanup cancels the pending timer -- without it, toggling `autoHide` or swapping `notice`
  // stacks up timers that outlive the notice they were created for.
  React.useEffect(() => {
    if (!autoHide || notice === null) return
    const timer = setTimeout(() => {
      // Only hide if `store.notice` is still the one this timer was created for.
      if (store.notice === notice) store.hideNotice()
    }, 3000)
    return () => clearTimeout(timer)
  }, [autoHide, notice])

  if (!notice) return null
  return (
    <SUI.Message
      success
      onDismiss={store.hideNotice}
      header={notice}
      style={{ position: "fixed", top: 60, left: "calc(50% - 250px)", width: 500, zIndex: 100 }}
    />
  )
})
