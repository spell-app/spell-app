/** @jsxImportSource react */
import * as SUI from "semantic-ui-react"

import type { ModalComponentProps } from "./modals.types"

/****************
 * ### `<Confirm>`
 * Confirm if the user wants to do something.
 * - `resolve()`s with `true` for OK or `false` for Cancel.
 * - NOTE: dismissing the modal counts as Cancel, so this never resolves `undefined`.
 *
 * Props:
 * - `message`      Required: message to show.
 * - `header`       Optional: header for the dialog.
 * - `ok`           Text title for OK button, default "OK".
 * - `cancel`       Text title for Cancel button, default "Cancel".
 * - ...and other standard `Modal` props.
 ****************/
export function Confirm({ props, resolve }: ModalComponentProps<ConfirmModalProps, boolean>) {
  const { message, ok = "OK", cancel = "Cancel", ...modalProps } = props
  const yes = () => resolve(true)
  const no = () => resolve(false)
  return (
    <SUI.Modal
      open
      className="Confirm"
      content={message}
      actions={[
        { key: "ok", content: ok, primary: true, autoFocus: true, onClick: yes },
        { key: "cancel", content: cancel, onClick: no }
      ]}
      onClose={no}
      size="small"
      {...(modalProps as SUI.ModalProps)}
    />
  )
}

/** Props for `<Confirm>`.  Extra keys pass through to the underlying `SUI.Modal`. */
export type ConfirmModalProps = {
  /** Message to show. */
  message: ReactNode
  /** Header for the dialog. */
  header?: ReactNode
  /** Text title for OK button.  Default `"OK"`. */
  ok?: string | SUI.ButtonProps
  /** Text title for Cancel button.  Default `"Cancel"`. */
  cancel?: string | SUI.ButtonProps
} & Record<string, unknown>
