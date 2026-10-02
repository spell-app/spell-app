/** @jsxImportSource react */
import React from "react"
import * as SUI from "semantic-ui-react"

import { view } from "$/util"
import { editor } from "$/app/editor"

/****************
 * ### `<Notice>`
 * Display `editor.notice` as a success message fixed near the top of the page.
 * - SIDE EFFECT: auto-hides after 3s by calling `editor.hideNotice()`, unless `autoHide` is `false`.
 ****************/
export const Notice = view(function Notice({ autoHide = true }: NoticeProps) {
  const { notice } = editor

  // autoHide on timeout
  React.useEffect(() => {
    if (!autoHide || !notice) return
    const timer = setTimeout(() => {
      // Only hide if `editor.notice` is still the one this timer was created for.
      if (editor.notice === notice) editor.hideNotice()
    }, 3000)
    // Clear the timer next time the effect executes.
    return () => clearTimeout(timer)
  }, [autoHide, notice])

  if (!notice) return null
  return (
    <SUI.Message
      success
      onDismiss={editor.hideNotice}
      header={notice}
      style={{ position: "fixed", top: 60, left: "calc(50% - 250px)", width: 500, zIndex: 100 }}
    />
  )
})

/** Props for `<Notice>`. */
export type NoticeProps = {
  /** Auto-hide after 3s.  Defaults `true`. */
  // TODO: boolean|number in seconds?
  autoHide?: boolean
}
