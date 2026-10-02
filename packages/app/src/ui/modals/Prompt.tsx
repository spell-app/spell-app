/** @jsxImportSource react */
import * as SUI from "semantic-ui-react"

import { F, makeFormStore } from "$/app/ui/forms"

import type { ModalComponentProps } from "./modals.types"

/****************
 * ### `<Prompt>`
 * Prompt with a single input field value.
 * - `resolve()`s with the field value if OK, or `undefined` if they cancel
 *   or submit the field with an empty value.
 * - NOTE: return key always submits the value.
 *
 * Props:
 * - `message`      Required: message to show.
 * - `header`       Optional: header for the dialog.
 * - `defaultValue` Start value for field, default `""`.
 * - `type`         `<Input type>`, default `text`.
 * - `inputProps`   Optional props to pass to the `<Input>`, e.g.
 *                  with `type="number"` set `inputProps={{ min: 10, max: 100 }}`
 * - `ok`           Text title for OK button, default "OK".
 * - `cancel`       Text title for Cancel button, default "Cancel".
 * - ...and other standard `Modal` props.
 ****************/
export function Prompt({ props, resolve }: ModalComponentProps<PromptModalProps, string>) {
  const { message, ok = "OK", cancel = "Cancel", defaultValue, type = "text", inputProps, ...modalProps } = props
  const formStore = makeFormStore({ input: defaultValue })
  const submit = () => !formStore.hasErrors && resolve(formStore.raw.input)
  const close = () => resolve(undefined)
  return (
    <SUI.Modal
      open
      className="Prompt"
      content={
        <SUI.Modal.Content>
          <F.Form store={formStore} onSubmit={submit}>
            <F.Input name="input" type={type} label={message} autoFocus fluid {...inputProps} onEnter={submit} />
          </F.Form>
        </SUI.Modal.Content>
      }
      actions={[
        { key: "ok", content: ok, primary: true, onClick: submit },
        { key: "cancel", content: cancel, onClick: close }
      ]}
      onClose={close}
      size="small"
      {...(modalProps as SUI.ModalProps)}
    />
  )
}

/** Props for `<Prompt>`.  Extra keys pass through to the underlying `SUI.Modal`. */
export type PromptModalProps = {
  /** Message to show. */
  message: ReactNode
  /** Header for the dialog. */
  header?: ReactNode
  /** Start value for field.  Default `""`. */
  defaultValue?: string
  /** `<Input type>`.  Default `"text"`. */
  type?: string
  /** Extra props to pass to the `<Input>`, e.g. `{ min: 10, max: 100 }` with `type="number"`. */
  inputProps?: Record<string, unknown>
  /** Text title for OK button.  Default `"OK"`. */
  ok?: string | SUI.ButtonProps
  /** Text title for Cancel button.  Default `"Cancel"`. */
  cancel?: string | SUI.ButtonProps
} & Record<string, unknown>
