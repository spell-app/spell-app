import { Show, createEffect } from "solid-js"

import { editor } from "spell-app/app/editor"
import { FLOATING_MESSAGE_STYLE, on, tracked } from "spell-app/app/solid"

/****************
 * ### `<Notice>`
 * `editor.notice` as a success `<ui-message>`, fixed near the top of the page;  closing it calls
 * `editor.hideNotice()`.
 * - SIDE EFFECT:  hides it after 3s (`editor.hideNotice()`), unless `autoHide` is `false` -- only if
 *   `editor.notice` is still the one the timer was started for.
 * - SEE:  its App UI components page, `app/docs/Notice.html` (`/components/app/Notice.html`).
 ****************/
export function Notice(props: NoticeProps) {
  const notice = tracked(() => editor.notice)

  createEffect(
    () => [notice(), props.autoHide ?? true] as const,
    ([shown, autoHide]) => {
      if (!autoHide || !shown) return
      const timer = setTimeout(() => {
        if (editor.notice === shown) editor.hideNotice()
      }, NOTICE_DELAY)
      return () => clearTimeout(timer)
    }
  )

  return (
    <Show when={notice()}>
      {(notice) => (
        <div class="Notice" style={FLOATING_MESSAGE_STYLE}>
          <ui-message state="success" header={notice()} dismissible="" ref={on("ui-closing", dismiss)} />
        </div>
      )}
    </Show>
  )
}

/** Props for `<Notice>`. */
export type NoticeProps = {
  /** Hide after 3s.  Default:  `true`. */
  // TODO: boolean | number in seconds?
  autoHide?: boolean
}

/** How long a notice shows, ms. */
const NOTICE_DELAY = 3000

/** The close button:  keep the message (`<Show>` removes it), clear `editor.notice`. */
function dismiss(event: Event) {
  event.preventDefault()
  editor.hideNotice()
}
