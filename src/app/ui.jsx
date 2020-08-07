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
import classnames from "classnames"
import { Icon, Input, Button, Menu, Modal, Dropdown } from "semantic-ui-react"
import { useHotkeys } from "react-hotkeys-hook"

import { view } from "~/util"

import { actions, ActionItem } from "./actions"
import { FileDropdown } from "./FileDropdown"
import { ProjectDropdown } from "./ProjectDropdown"
import { store } from "./store"

/**
 * Constructors for standard UI elements.
 */
export const UI = {
  ActionItem,

  /** Top-level app menu. */
  AppMenu: React.memo((props) => (
    <Menu inverted color="violet" attached className="AppMenu medium-short tight" {...props} />
  )),

  /** Panel menu. */
  PanelMenu: React.memo((props) => (
    <Menu inverted color="purple" attached="top" className="PanelMenu short tight" {...props} />
  )),

  /** Left / Center / Right Sub-Menus. */
  Submenu: React.memo(({ left, center, right, spring, children, ...props }) => {
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
  MenuHeader: React.memo((props) => <ActionItem header noBorder {...props} />),

  /** `Spring` to eat up space beside objects. */
  Spring: React.memo((props) => <Menu.Item className="spring no-border" {...props} />),

  /** A "..." menu. */
  MoreMenu: React.memo(({ stub, item = true, icon = "ellipsis horizontal", children, ...props }) => {
    if (stub) return <Menu.Item disabled icon={icon} {...props} />
    return (
      <Dropdown item={item} icon={icon} {...props}>
        <Dropdown.Menu>{children}</Dropdown.Menu>
      </Dropdown>
    )
  }),

  /** Label that goes next to a dropdown. */
  DropdownLabel: React.memo((props) => <ActionItem className="dropdown-label" {...props} />),

  /** Icon */
  ARROW_COLLAPSED_ICON: "caret right",
  ARROW_EXPANDED_ICON: "caret down",
  Icon: React.memo((props) => <Icon {...props} />),

  //////////////////////
  // Project UI
  //////////////////////
  PROJECT_ICON: "app store ios",
  ProjectDropdown: ProjectDropdown, // re-export for convenience
  ProjectActionsDropdown: React.memo((props) => {
    return <UI.MoreMenu {...props}>{actions.PROJECT_DROPDOWN_ACTIONS}</UI.MoreMenu>
  }),
  ProjectDropdownAction: React.memo(({ useRunner, path, location, active }) => (
    <Dropdown.Item
      text={location.projectName}
      value={path}
      icon={UI.PROJECT_ICON}
      active={active}
      onClick={() => (useRunner ? store.showRunner(path) : store.showEditor(path))}
    />
  )),

  //////////////////////
  // File UI
  //////////////////////
  FILE_ICON: "file code",
  FileDropdown: FileDropdown, // re-export for convenience
  FileDropdownAction: React.memo(({ useRunner, path, location, active }) => (
    <Dropdown.Item
      text={location.file}
      value={path}
      icon={UI.FILE_ICON}
      active={active}
      onClick={() => (useRunner ? store.showRunner(path) : store.showEditor(path))}
    />
  )),
  FileActionsDropdown: React.memo((props) => {
    return <UI.MoreMenu {...props}>{actions.FILE_DROPDOWN_ACTIONS}</UI.MoreMenu>
  }),

  //////////////////////
  // Modals
  //////////////////////
  getResolver(resolve, value) {
    if (typeof value === "function") return value
    return () => resolve(value)
  },
  ModalContainer: view(() => {
    const { modals } = store
    if (!modals.length) return null
    const lastIndex = modals.length - 1
    return store.modals.map(({ id, component, props, resolve, reject }, index) =>
      React.createElement(component, { key: id, id, index, props, isTop: index === lastIndex, resolve, reject })
    )
  }),
  Modal: React.memo(
    ({
      isTop,
      resolve,
      type = "",
      header,
      content,
      className,
      buttons = [{ button: "OK", color: "blue" }],
      extraButtons = null,
      trapReturn = false,
      returnValue = undefined,
      trapEscape = false,
      escapeValue = undefined,
      ...props
    }) => {
      // Trap return key if neccessary
      useHotkeys("return", (event) => {
        if (trapReturn) UI.getResolver(resolve, returnValue)()
      })
      // convert `buttons` to `<ModalButtons>`
      buttons = buttons.map(({ value, ...btnProps }, index) => (
        <UI.ModalButton key={index} onClick={UI.getResolver(resolve, value)} {...btnProps} />
      ))
      // convert `extraButtons` to `<ModalButtons>`
      if (extraButtons) {
        extraButtons = extraButtons.map(({ value, ...btnProps }, index) => (
          <UI.ModalButton key={index} onClick={UI.getResolver(resolve, value)} {...btnProps} />
        ))
      }
      return (
        <Modal
          className={classnames("SpellModal", type, className)}
          open={true}
          size="small"
          closeOnDimmerClick={trapEscape}
          onClose={UI.getResolver(resolve, escapeValue)}
          {...props}
        >
          {!!header && <Modal.Header>{header}</Modal.Header>}
          <Modal.Content>{content}</Modal.Content>
          <Modal.Actions>
            {extraButtons}
            {buttons}
          </Modal.Actions>
        </Modal>
      )
    }
  ),
  ModalButton: React.memo(
    React.forwardRef((allProps, ref) => {
      const { button, onClick, ...props } = allProps
      if (!button) return null
      if (ref) props.ref = ref

      // If they passed an element, just set its onClick and return as-is.
      if (React.isValidElement(button)) {
        return React.cloneElement(button, { onClick })
      }
      if (typeof button === "string") {
        return (
          <Button onClick={onClick} {...props}>
            {button}
          </Button>
        )
      }
      if (typeof button === "object") {
        // Assume properties which will override other props?
        return <Button onClick={onClick} {...props} {...button} />
      }
      console.warn("<UI.ModalButton>: don't understand 'button' in", allProps)
      return null
    })
  ),

  /**
   * Alert the user to some condition, with a single "OK" button.
   * `resolve()`s with `undefined`.
   *
   * Props:
   * - `header` Optional header for the dialog.
   * - `message` Mandatory message to show.
   * - `ok` (default "OK") Text title or button props for OK button.
   * - other standard `Modal` props.
   */
  Alert: React.memo(function Alert({ props, resolve, isTop }) {
    const { message, ok = "OK", trapReturn = false, ...extraProps } = props
    const okRef = React.createRef()
    React.useEffect(() => {
      console.warn(okRef.current)
      okRef.current.focus()
    })
    return (
      <UI.Modal
        isTop={isTop}
        type="Alert"
        resolve={resolve}
        content={<div className="message">{message}</div>}
        buttons={[{ ref: okRef, button: ok, className: "default" }]}
        trapReturn={trapReturn}
        trapEscape
        size="small"
        {...extraProps}
      />
    )
  }),

  /**
   * Confirm if the user wants to do something:
   * `resolve()`s with `true` or `false`.
   *
   * Props:
   * - `header` Optional header for the dialog.
   * - `message` Mandatory message to show.
   * - `ok` (default "OK") Text title or button props for OK button.
   * - `cancel` (default "Cancel") Text title or button props for Cancel button.
   * - other standard `Modal` props.
   */
  Confirm: React.memo(function Confirm({ props, resolve, isTop }) {
    const { message, ok = "OK", cancel = "Cancel", trapReturn = true, ...extraProps } = props
    return (
      <UI.Modal
        isTop={isTop}
        type="Confirm"
        resolve={resolve}
        content={<div className="message">{message}</div>}
        buttons={[
          { button: cancel, value: false },
          { button: ok, value: true, className: trapReturn ? "default" : "" }
        ]}
        trapReturn={trapReturn}
        returnValue={true}
        trapEscape
        escapeValue={false}
        size="small"
        {...extraProps}
      />
    )
  }),
  /**
   * Prompt with a single input field value:
   * `resolve()`s with:
   * - the field value in OK, or
   * - `undefined` if they cancel or submit the field with an empty value.
   * Note that we always make the return key submit the value.
   *
   * Props:
   * - `header` Optional header for the dialog.
   * - `message` Mandatory message to show.
   * - `defaultValue` (default `""`) Start value for field.
   * - `valueType` (default `text`) `<Input type>`.
   * - `inputProps` Optional props to pass to the `<Input>`.
   * - `ok` (default "OK") Text title or button props for OK button.
   * - `cancel` (default "Cancel") Text title or button props for Cancel button.
   * - other standard `Modal` props.
   */
  Prompt: React.memo(function Prompt({ props, resolve, isTop }) {
    const { message, defaultValue = "", ok = "OK", cancel = "Cancel", valueType = "text", ...extraProps } = props
    const [value, setValue] = React.useState(defaultValue)

    const input = React.useRef()
    // Auto-focus if we're the top field
    React.useEffect(() => {
      if (isTop) input.current.select()
    }, [isTop])

    // when resolving, treat empty string as `undefined` in the result.
    const resolveWithValue = () => {
      if (value === "") resolve(undefined)
      else resolve(value)
    }
    const content = (
      <div className="message">
        <div>{message}</div>
        <Input
          ref={input}
          fluid
          focus={true}
          type={valueType}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key !== "Enter" || resolveWithValue()}
        />
      </div>
    )

    return (
      <UI.Modal
        isTop={isTop}
        type="Prompt"
        resolve={resolve}
        content={content}
        buttons={[
          { button: cancel, value: undefined },
          { button: ok, value: resolveWithValue, className: "default" }
        ]}
        trapReturn={false}
        trapEscape
        size="small"
        {...extraProps}
      />
    )
  })
}
