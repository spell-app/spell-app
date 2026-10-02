/** @jsxImportSource react */
import * as SUI from "semantic-ui-react"

import type { ModalComponentProps } from "./modals.types"

/****************
 * ### `<Alert>`
 * Alert the user to some condition, with a single "OK" button.
 * - `resolve()`s with `undefined` -- there is nothing to choose.
 *
 * Props:
 * - `message`      Required: message to show.
 * - `header`       Optional: header for the dialog.
 * - `ok`           Text title or button props for OK button, default "OK".
 * - ...and other standard `Modal` props.
 ****************/
export function Alert({ props, resolve }: ModalComponentProps<AlertModalProps>) {
  const { message, ok = "OK", ...modalProps } = props
  const close = () => resolve()
  return (
    <SUI.Modal
      open
      className="Alert"
      content={message}
      actions={[{ key: "ok", content: ok, primary: true, autoFocus: true, onClick: close }]}
      onClose={close}
      size="small"
      {...(modalProps as SUI.ModalProps)}
    />
  )
}

/** Props for `<Alert>`.  Extra keys pass through to the underlying `SUI.Modal`. */
export type AlertModalProps = {
  /** Message to show. */
  message: ReactNode
  /** Header for the dialog. */
  header?: ReactNode
  /** Text title or button props for OK button.  Default `"OK"`. */
  ok?: string | SUI.ButtonProps
} & Record<string, unknown>
