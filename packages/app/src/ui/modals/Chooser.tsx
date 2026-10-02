/** @jsxImportSource react */
import * as SUI from "semantic-ui-react"

import { F } from "$/app/ui/forms"

import type * as MT from "./modals.types"

/****************
 * ### `<Chooser>`
 * Modal which lets the user choose one (or many) values from a list.
 * - `resolve()`s with the chosen value if OK, or `undefined` if they cancel
 *   or submit the field with an empty value.
 * - NOTE: return key always submits the value.
 *
 * Props:
 * - `message`      Mandatory message to show.
 * - `options`      Mandatory list of options, as any of:
 *    - array of primitive values
 *    - array of `{ value, text, icon, image }`
 *    - map of `{ key: text }`
 * - `defaultValue` Optional start value for field.
 * - `multiple`     If `true`, they can choose multiple values.
 * - `autoFocus`    If `true`, we'll autofocus in the select.
 * - `header`       Optional header for the dialog.
 * - `inputProps`   Optional props to pass to the `<Select>`, e.g. `placeholder`, `multiple`, `allowAdditions`.
 * - `ok`           Text title or button props for OK button, default "OK".
 * - `cancel`       Text title or button props for Cancel button, default "Cancel".
 * - ...and other standard `Modal` props.
 *
 * TODO: `onEnter` to submit the form, but only if the select is not `open`.
 * TODO: `allowAdditions` to add additional values
 * TODO: `value` for a multi-select is a proxy, not an array!
 ****************/
export function Chooser({ props, resolve }: MT.ModalComponentProps<ChooserModalProps>) {
  const {
    message,
    options: startOptions,
    defaultValue,
    multiple = false,
    allowAdditions = false, // NOTE: ignored!
    ok = "OK",
    cancel = "Cancel",
    inputProps,
    ...modalProps
  } = props
  const formStore = F.makeFormStore({
    choice: defaultValue
    // options: normalizeSUIDropdownOptions(startOptions)
  })
  // NOTE: we use `cloneDeep` to get an array back
  const submit = () => !formStore.hasErrors && resolve(formStore.raw.choice)
  const close = () => resolve(undefined)
  return (
    <SUI.Modal
      open
      name="Chooser"
      content={
        <SUI.Modal.Content>
          <F.Form store={formStore} onSubmit={submit}>
            <F.Select
              tabIndex={0}
              name="choice"
              label={message}
              multiple={multiple}
              // both of these are required to autoFocus
              search
              searchInput={{ autoFocus: true }}
              openOnFocus={false}
              fluid
              options={normalizeSUIDropdownOptions(startOptions)}
              // TODO...
              // options={formStore.value.options}
              // allowAdditions={allowAdditions}
              // onAddItem={(event, { value }) => {
              //   formStore.value.options.push({ key: Date.now(), text: value, value })
              // }}
              {...inputProps}
            />
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

/**
 * Normalize `options` for SUI `<Dropdown/>`:
 * - array of objects passes through.  Expects `{ text, value, icon?, image? }`
 * - array of primitive values returns as `{ text: <value>, value: <value> }`
 * - single object returns as array of `{ value: <prop>, text: <object[prop]> }`
 *
 * Adds `key` to all returned values.
 */
function normalizeSUIDropdownOptions(
  options: MT.DropdownOptionInput[] | Record<string, string>
): MT.NormalizedDropdownOption[] {
  if (Array.isArray(options)) {
    return options.map((option, index) => {
      if (typeof option === "object") return { ...option, key: option.key ?? index }
      else return { key: index, text: option, value: option }
    })
  }
  return Object.entries(options).map(([value, text]) => {
    return { key: value, value, text }
  })
}

/** Props for `<Chooser>`.  Extra keys pass through to the underlying `SUI.Modal`. */
export type ChooserModalProps = {
  /** Message to show. */
  message: ReactNode
  /**
   * List of options -- array of primitive values, array of `{ value, text, icon, image }`,
   * or map of `{ key: text }`.
   */
  options: MT.DropdownOptionInput[] | Record<string, string>
  /** Start value for field. */
  defaultValue?: unknown
  /** Let them choose multiple values. */
  multiple?: boolean
  /** NOTE: currently ignored -- see TODOs below. */
  allowAdditions?: boolean
  /** Header for the dialog. */
  header?: ReactNode
  /** Extra props to pass to the `<Select>`, e.g. `placeholder`, `multiple`, `allowAdditions`. */
  inputProps?: Record<string, unknown>
  /** Text title or button props for OK button.  Default `"OK"`. */
  ok?: string | SUI.ButtonProps
  /** Text title or button props for Cancel button.  Default `"Cancel"`. */
  cancel?: string | SUI.ButtonProps
} & Record<string, unknown>
