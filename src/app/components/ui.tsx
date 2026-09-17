import React from "react"
import * as SUI from "semantic-ui-react"

import { view } from "~/util"
import { actions } from "~/app/actions"
import { store } from "~/app/store"
import { F } from "./Form"

/** Import genric spell styles */
import "~/app/components/spell.less"

/** Import SUI-additions for spell */
import "~/app/components/SUI-additions.less"

/** Export everything including types as `UI` barrel. */
export * as UI from "./ui.tsx"

/** Re-export from other UI modules for convenience. */
export * from "~/app/actions"
export * from "./Form"

/** SUI pass-throughs as reactive views. */
export const Button = view(SUI.Button)
export const Card = view(SUI.Card)
export const Column = view(SUI.Grid.Column)
export const Container = view(SUI.Container)
export const Grid = view(SUI.Grid)
export const Icon = view(SUI.Icon)
export const Row = view(SUI.Grid.Row)
export const Segment = view(SUI.Segment)

/**
 * Component: Top-level app menu.
 */
export const AppMenu = view((props: SUI.MenuProps) => (
  <SUI.Menu inverted color="violet" attached className="AppMenu medium-short tight" {...props} />
))

/**
 * Component: Panel menu.
 */
export const PanelMenu = view((props: SUI.MenuProps) => (
  <SUI.Menu inverted color="purple" attached="top" className="PanelMenu short tight" {...props} />
))

/**
 * Component: Left / Center / Right Sub-Menus.
 */
export const Submenu = view(({ left, center, right, spring, children, ...props }: SubmenuProps) => {
  const style: { minWidth?: string } = {}
  if (left || center || right) style.minWidth = "33.3%"
  return (
    <SUI.Menu.Menu position={right ? "right" : "left"} style={style} {...props}>
      {spring && (center || right) && <Spring />}
      {children}
      {spring && (center || left) && <Spring />}
    </SUI.Menu.Menu>
  )
})
export type SubmenuProps = Prettify<
  SUI.MenuProps & {
    left?: boolean
    center?: boolean
    right?: boolean
    spring?: boolean
    children?: ReactNode
  }
>

/**
 * Component: Menu header item.
 */
export const MenuHeader = view((props: SUI.MenuItemProps) => <SUI.Menu.Item header {...props} />)

/**
 * Component: `Spring` to eat up space beside objects.
 */
export const Spring = view((props: SUI.MenuItemProps) => <SUI.Menu.Item className="spring no-border" {...props} />)

/** Component: A "..." menu. */
export const MoreMenu = view(
  ({ stub, item = true, icon = "ellipsis horizontal", children, ...props }: MoreMenuProps) => {
    if (stub) return <SUI.Menu.Item disabled icon={icon} {...(props as SUI.MenuItemProps)} />
    return (
      <SUI.Dropdown item={item} icon={icon} {...props}>
        <SUI.Dropdown.Menu>{children}</SUI.Dropdown.Menu>
      </SUI.Dropdown>
    )
  }
)
export type MoreMenuProps = Prettify<
  SUI.DropdownProps & {
    stub?: boolean
    item?: boolean
    icon?: string
    children?: ReactNode
  }
>

/**
 * Component: Label that goes next to a dropdown.
 */
export const DropdownLabel = view((props: SUI.MenuItemProps) => <SUI.Menu.Item className="dropdown-label" {...props} />)

/**
 * Icons
 */
export const ARROW_COLLAPSED_ICON = "caret right"
export const ARROW_EXPANDED_ICON = "caret down"

//////////////////////
// Project UI
//////////////////////
export const PROJECT_ICON = "app store ios"
export * from "./ProjectDropdown.tsx"
export const ProjectActionsDropdown = view((props: MoreMenuProps) => {
  return <MoreMenu {...props}>{actions.PROJECT_DROPDOWN_ACTIONS}</MoreMenu>
})

//////////////////////
// File UI
//////////////////////
export const FileActionsDropdown = view((props: MoreMenuProps) => {
  return <MoreMenu {...props}>{actions.FILE_DROPDOWN_ACTIONS}</MoreMenu>
})
export const FILE_ICON = "file code"
export * from "./FileDropdown.tsx"

//////////////////////
// Modals
//////////////////////

export type ModalComponentProps<P, Result = unknown> = {
  id?: string | number
  props: P
  resolve: (value?: Result) => void
  reject?: (reason?: unknown) => void
}

/**
 * Root used to display modals shown with `store.showModal()`.
 * Only shows the "top-most" modal at a time.
 * You should have one of these at the top level of your app.
 * e.g. `<ModalRoot />` -- that's it!
 */
export const ModalRoot = view(() => {
  const { modals } = store
  if (!modals.length) return null
  const { component, props, resolve, reject } = modals[0]!
  return React.createElement(component, { key: props.id, props, resolve, reject })
})

//////////////////////
// Alert Modal
//////////////////////

/**
 * Alert the user to some condition, with a single "OK" button.
 * `resolve()`s with `undefined`.
 *
 * Props:
 * - `message`      Required: message to show.
 * - `header`       Optional: header for the dialog.
 * - `ok`           Text title or button props for OK button, default "OK".
 * - ...and other standard `Modal` props.
 */
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
export type AlertModalProps = {
  message: ReactNode
  header?: ReactNode
  ok?: string | SUI.ButtonProps
} & Record<string, unknown>

//////////////////////
// Confirm Modal
//////////////////////

export type ConfirmModalProps = {
  message: ReactNode
  header?: ReactNode
  ok?: string | SUI.ButtonProps
  cancel?: string | SUI.ButtonProps
} & Record<string, unknown>

/**
 * Confirm if the user wants to do something:
 * `resolve()`s with `true` or `false`.
 *
 * Props:
 * - `message`      Required: message to show.
 * - `header`       Optional: header for the dialog.
 * - `ok`           Text title for OK button, default "OK".
 * - `cancel`       Text title for Cancel button, default "Cancel".
 * - ...and other standard `Modal` props.
 */
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

//////////////////////
// Prompt Modal
//////////////////////

/**
 * Prompt with a single input field value:
 * `resolve()`s with:
 * - the field value if OK, or
 * - `undefined` if they cancel or submit the field with an empty value.
 * Note that we always make the return key submit the value.
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
 */
export function Prompt({ props, resolve }: ModalComponentProps<PromptModalProps, string>) {
  const { message, ok = "OK", cancel = "Cancel", defaultValue, type = "text", inputProps, ...modalProps } = props
  const formStore = F.makeFormStore({ input: defaultValue })
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

export type PromptModalProps = {
  message: ReactNode
  header?: ReactNode
  defaultValue?: string
  type?: string
  inputProps?: Record<string, unknown>
  ok?: string | SUI.ButtonProps
  cancel?: string | SUI.ButtonProps
} & Record<string, unknown>

//////////////////////
// Chooser Modal
//////////////////////

/**
 * Present a Modal which allows the user `Choose` a single value from a list in.
 * `resolve()`s with:
 * - the chosen value if OK, or
 * - `undefined` if they cancel or submit the field with an empty value.
 * Note that we always make the return key submit the value.
 *
 * Props:
 * - `message`      Mandatory message to show.
 * - `options`      Mandatory list of options as:  array of primitive values, array of `{ value, text, icon, image }`, or map of `{ key: text }`.
 * - `defaultValue` Optional start value for field.
 * - `multiple`       If `true`, they can choose multiple values.
 * - `autoFocus`      If `true`, we'll autofocus in the select.
 * - `header`         Optional header for the dialog.
 * - `inputProps`     Optional props to pass to the `<Select>`, e.g. `placeholder`, `multiple`, `allowAdditions` .
 * - `ok`             Text title or button props for OK button, default "OK".
 * - `cancel`         Text title or button props for Cancel button, default "Cancel".
 * - ...and other standard `Modal` props.
 *
 * TODO: `onEnter` to submit the form, but only if the select is not `open`.
 * TODO: `allowAdditions` to add additional values
 * TODO: `value` for a multi-select is a proxy, not an array!
 */
export function Chooser({ props, resolve }: ModalComponentProps<ChooserModalProps>) {
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

export type ChooserModalProps = {
  message: ReactNode
  options: DropdownOptionInput[] | Record<string, string>
  defaultValue?: unknown
  multiple?: boolean
  allowAdditions?: boolean
  header?: ReactNode
  inputProps?: Record<string, unknown>
  ok?: string | SUI.ButtonProps
  cancel?: string | SUI.ButtonProps
} & Record<string, unknown>

export type DropdownOptionInput = string | number | NormalizedDropdownOption

export type NormalizedDropdownOption = Prettify<
  {
    key: string | number
    text?: ReactNode
    value?: unknown
  } & Record<string, unknown>
>

/**
 * Normalize `options` for  SUI <Dropdown/>:
 * - If an array of objects, pass those through.  Expects `{ text, value, icon?, image? }`
 * - If an array of primitive values, returns as `{ text: <value>, value: <value> }`
 * - If a single object, returns as array of `{ value: <prop>, text: <object[prop]> }`
 * Adds `key` property to all returned values.
 */
function normalizeSUIDropdownOptions(
  options: DropdownOptionInput[] | Record<string, string>
): NormalizedDropdownOption[] {
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
