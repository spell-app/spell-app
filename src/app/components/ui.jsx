/**
 * Standard app MenuItems to go in app toolbars, so we standardize names etc.
 * e.g.
 *  import { menuItems } from
 *  function Toolbar() {
 *    return (
 *      <Menu>
 *        <menuItems.ProjectDropdown showBorder={false} />
 *        <menuItems.aboutSpell />
 *        <menuItems.Spring />
 *        <menuItems.logIn />
 *      </Menu>
 *  }
 */
import React from "react"
import { Button, Card, Container, Dropdown, Grid, Icon, Menu, Modal, Segment } from "semantic-ui-react"

import { view } from "~/util"

import { actions, Action } from "~/app/actions"
import { FileDropdown } from "./FileDropdown"
import { ProjectDropdown, ProjectMenu } from "./ProjectDropdown"
import { store } from "~/app/store"
import * as Form from "./Form"

/** Genric spell styles */
import "~/app/components/spell.less"

/** SUI-additions for spell */
import "~/app/components/SUI-additions.less"

/**
 * Constructors for standard UI elements.
 */
export const UI = {
  /** SUI pass-throughs as views */
  Button: view(Button),
  Card: view(Card),
  Column: view(Grid.Column),
  Container: view(Container),
  Grid: view(Grid),
  Icon: view((props) => <Icon {...props} />),
  Row: view(Grid.Row),
  Segment: view(Segment),

  /** Action from actions.jsx */
  Action,

  /** Form stuff from Form.jsx */
  ...Form,

  /** Top-level app menu. */
  AppMenu: view((props) => <Menu inverted color="violet" attached className="AppMenu medium-short tight" {...props} />),

  /** Panel menu. */
  PanelMenu: view((props) => (
    <Menu inverted color="purple" attached="top" className="PanelMenu short tight" {...props} />
  )),

  /** Left / Center / Right Sub-Menus. */
  Submenu: view(({ left, center, right, spring, children, ...props }) => {
    const style = {}
    if (left || center || right) style.minWidth = "33.3%"
    return (
      <Menu.Menu position={right ? "right" : "left"} style={style} {...props}>
        {spring && (center || right) && <UI.Spring />}
        {children}
        {spring && (center || left) && <UI.Spring />}
      </Menu.Menu>
    )
  }),

  /** Menu header item. */
  MenuHeader: view((props) => <Menu.Item header {...props} />),

  /** `Spring` to eat up space beside objects. */
  Spring: view((props) => <Menu.Item className="spring no-border" {...props} />),

  /** A "..." menu. */
  MoreMenu: view(({ stub, item = true, icon = "ellipsis horizontal", children, ...props }) => {
    if (stub) return <Menu.Item disabled icon={icon} {...props} />
    return (
      <Dropdown item={item} icon={icon} {...props}>
        <Dropdown.Menu>{children}</Dropdown.Menu>
      </Dropdown>
    )
  }),

  /** Label that goes next to a dropdown. */
  DropdownLabel: React.memo((props) => <Menu.Item className="dropdown-label" {...props} />),

  /** Icon */
  ARROW_COLLAPSED_ICON: "caret right",
  ARROW_EXPANDED_ICON: "caret down",

  //////////////////////
  // Project UI
  //////////////////////
  PROJECT_ICON: "app store ios",
  ProjectDropdown, // re-export for convenience
  ProjectMenu, // re-export for convenience
  ProjectActionsDropdown: React.memo((props) => {
    return <UI.MoreMenu {...props}>{actions.PROJECT_DROPDOWN_ACTIONS}</UI.MoreMenu>
  }),

  //////////////////////
  // File UI
  //////////////////////
  FILE_ICON: "file code",
  FileDropdown: FileDropdown, // re-export for convenience
  FileActionsDropdown: React.memo((props) => {
    return <UI.MoreMenu {...props}>{actions.FILE_DROPDOWN_ACTIONS}</UI.MoreMenu>
  }),

  //////////////////////
  // Modals
  //////////////////////

  /**
   * Root used to display modals shown with `store.showModal()`.
   * Only shows the "top-most" modal at a time.
   * You should have one of these at the top level of your app.
   * e.g. `<ModalRoot />` -- that's it!
   */
  ModalRoot: view(() => {
    const { modals } = store
    if (!modals.length) return null
    const { id, component, props, resolve, reject } = modals[0]
    return React.createElement(component, { key: id, id, props, resolve, reject })
  }),

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
  Alert({ props, resolve }) {
    const { message, ok = "OK", ...modalProps } = props
    const close = () => resolve()
    return (
      <Modal
        open
        className="Alert"
        content={message}
        actions={[{ key: "ok", content: ok, primary: true, autoFocus: true, onClick: close }]}
        onClose={close}
        size="small"
        {...modalProps}
      />
    )
  },

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
  Confirm({ props, resolve }) {
    const { message, ok = "OK", cancel = "Cancel", ...modalProps } = props
    const yes = () => resolve(true)
    const no = () => resolve(false)
    return (
      <Modal
        open
        className="Confirm"
        content={message}
        actions={[
          { key: "ok", content: ok, primary: true, autoFocus: true, onClick: yes },
          { key: "cancel", content: cancel, onClick: no }
        ]}
        onClose={no}
        size="small"
        {...modalProps}
      />
    )
  },

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
  Prompt({ props, resolve }) {
    const { message, ok = "OK", cancel = "Cancel", defaultValue, type = "text", inputProps, ...modalProps } = props
    const formStore = UI.makeFormStore({ input: defaultValue })
    const submit = () => !formStore.hasErrors && resolve(formStore.raw.input)
    const close = () => resolve(undefined)
    return (
      <Modal
        open
        className="Prompt"
        content={
          <Modal.Content>
            <UI.Form store={formStore} onSubmit={submit}>
              <UI.Input name="input" type={type} label={message} autoFocus fluid {...inputProps} onEnter={submit} />
            </UI.Form>
          </Modal.Content>
        }
        actions={[
          { key: "ok", content: ok, primary: true, onClick: submit },
          { key: "cancel", content: cancel, onClick: close }
        ]}
        onClose={close}
        size="small"
        {...modalProps}
      />
    )
  },

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
  Chooser({ props, resolve }) {
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
    const formStore = UI.makeFormStore({
      choice: defaultValue
      // options: UI.normalizeOptions(startOptions)
    })
    // NOTE: we use `cloneDeep` to get an array back
    const submit = () => !formStore.hasErrors && resolve(formStore.raw.choice)
    const close = () => resolve(undefined)
    return (
      <Modal
        open
        name="Chooser"
        content={
          <Modal.Content>
            <UI.Form store={formStore} onSubmit={submit}>
              <UI.Select
                tabIndex={0}
                name="choice"
                label={message}
                multiple={multiple}
                // both of these are required to autoFocus
                search
                searchInput={{ autoFocus: true }}
                openOnFocus={false}
                fluid
                options={UI.normalizeOptions(startOptions)}
                // TODO...
                // options={formStore.value.options}
                // allowAdditions={allowAdditions}
                // onAddItem={(event, { value }) => {
                //   formStore.value.options.push({ key: Date.now(), text: value, value })
                // }}
                {...inputProps}
              />
            </UI.Form>
          </Modal.Content>
        }
        actions={[
          { key: "ok", content: ok, primary: true, onClick: submit },
          { key: "cancel", content: cancel, onClick: close }
        ]}
        onClose={close}
        size="small"
        {...modalProps}
      />
    )
  },

  /**
   * Normalize `options` for  SUI <Dropdown/>:
   * - If an array of objects, pass those through.  Expects `{ text, value, icon?, image? }`
   * - If an array of primitive values, returns as `{ text: <value>, value: <value> }`
   * - If a single object, returns as array of `{ value: <prop>, text: <object[prop]> }`
   * Adds `key` property to all returned values.
   */
  normalizeOptions(options) {
    if (Array.isArray(options)) {
      return options.map((option, index) => {
        if (typeof option === "object") return { key: index, ...option }
        else return { key: index, text: option, value: option }
      })
    }
    return Object.entries(options).map(([value, text]) => {
      return { key: value, value, text }
    })
  }
}
window.UI = UI
