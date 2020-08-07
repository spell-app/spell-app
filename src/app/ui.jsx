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
import { Icon, Button, Menu, Modal, Dropdown } from "semantic-ui-react"
import { useHotkeys } from "react-hotkeys-hook"

import { spellCore } from "~/languages/spell"
import { view } from "~/util"

import { FileDropdown } from "./FileDropdown"
import { ProjectDropdown } from "./ProjectDropdown"
import { store } from "./store"

// NOTE: we assume the caller will be React.memo()d as appropriate.
function ActionItem({ title, noBorder, className = "", ...props }) {
  const klass = [className, noBorder && "no-border"].filter(Boolean).join(" ")
  return <Menu.Item content={title} className={klass} {...props} />
}

let actions
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
  ModalContainer: view(() =>
    store.modals.map(({ id, component, props, resolve, reject }) =>
      React.createElement(component, { key: id, props, resolve, reject })
    )
  ),
  Modal: React.memo(
    ({
      resolve,
      header,
      content,
      buttons = [{ button: "OK", color: "blue", value: true }],
      required = false,
      returnValue = true,
      escapeValue = undefined,
      ...props
    }) => {
      const onReturn = resolveWith(returnValue)
      const onEscape = resolveWith(escapeValue)
      // make return key say "ok".  We get escape for free.
      useHotkeys("return", () => {
        if (!required) onReturn()
      })
      return (
        <Modal open={true} size="small" closeOnDimmerClick={!required} onClose={onEscape} {...props}>
          {!!header && <Modal.Header>{header}</Modal.Header>}
          <Modal.Content>{content}</Modal.Content>
          <Modal.Actions>
            {buttons.map(({ value, ...btnProps }, index) => (
              <UI.ModalButton key={index} onClick={resolveWith(value)} {...btnProps} />
            ))}
          </Modal.Actions>
        </Modal>
      )
      // return resolver for `value`
      //  - if a function, just use that
      //  - otherwise resolve with the value
      function resolveWith(value) {
        if (typeof value === "function") return value
        return () => resolve(value)
      }
    }
  ),
  ModalButton: React.memo(({ button, onClick, ...props }) => {
    // If they passed an element, just set its onClick and return as-is.
    if (React.isValidElement(button)) {
      return React.cloneElement(button, { onClick, ...props })
    }
    // assume `button` is a text string
    return (
      <Button onClick={onClick} {...props}>
        {button}
      </Button>
    )
  }),
  /** Alert the user to some message. */
  Alert: React.memo(function Alert({ props, resolve }) {
    const { header, message, ok = "OK", ...extraProps } = props
    return (
      <UI.Modal
        resolve={resolve}
        header={header}
        content={message}
        buttons={[{ button: ok, value: true, color: "blue" }]}
        size="small"
        {...extraProps}
      />
    )
  }),
  /** Confirm something with the user -- yea or nay? */
  Confirm: React.memo(function Confirm({ props, resolve }) {
    const { header, message, ok = "OK", cancel = "Cancel", ...extraProps } = props
    return (
      <UI.Modal
        resolve={resolve}
        header={header}
        content={message}
        buttons={[
          { button: ok, value: true, color: "blue" },
          { button: cancel, value: false, color: "grey" }
        ]}
        size="small"
        {...extraProps}
      />
    )
  }),
  Prompt: React.memo(function Prompt({ props, resolve }) {
    const { header, message, defaultValue = "", ok = "OK", cancel = "Cancel", ...extraProps } = props
    const [value, setValue] = React.useState(defaultValue)
    const resolveWithValue = () => resolve(value)
    const content = (
      <div>
        <div>{message}</div>
        <input type="text" value={value} onChange={(e) => setValue(e.target.value)} />
      </div>
    )
    return (
      <UI.Modal
        resolve={resolve}
        header={header}
        content={content}
        buttons={[
          { button: ok, value: resolveWithValue, color: "blue" },
          { button: cancel, value: false, color: "grey" }
        ]}
        returnValue={resolveWithValue}
        size="small"
        {...extraProps}
      />
    )
  })
}

/**
 * Constructors for <Menu.Items> for public actions.
 */
actions = {
  //////////////////////
  // Navigation
  //////////////////////

  aboutSpell: React.memo((props) => (
    <ActionItem title="About Spell" icon="wizard" onClick={() => store.aboutSpell()} {...props} />
  )),
  showEditor: React.memo((props) => (
    <ActionItem title="Edit Project" icon="edit outline" onClick={() => store.showEditor()} {...props} />
  )),
  showRunner: React.memo((props) => (
    <ActionItem title="Preview" icon="hand point up" onClick={() => store.showRunner()} {...props} />
  )),
  showProjectSettings: React.memo((props) => (
    <ActionItem title="Settings" icon="setting" onClick={() => store.showProjectSettings()} {...props} />
  )),
  showProjectChooser: React.memo((props) => (
    <ActionItem
      title="Open Example or Project"
      icon="app store ios"
      onClick={() => store.showProjectChooser()}
      {...props}
    />
  )),
  showDocs: React.memo((props) => (
    <ActionItem title="Docs" icon="newspaper outline" onClick={() => store.showDocs()} {...props} />
  )),
  showHelp: React.memo((props) => (
    <ActionItem title="Help" icon="help circle" onClick={() => store.showHelp()} {...props} />
  )),
  logIn: React.memo((props) => (
    <ActionItem title="Log In" icon="user outline" onClick={() => store.logIn()} {...props} />
  )),

  //////////////////////
  // Project actions
  //////////////////////
  createProject: React.memo((props) => (
    <ActionItem title="Settings" icon="setting" onClick={() => store.showProjectSettings()} {...props} />
  )),
  createProject: React.memo((props) => (
    <ActionItem title="New Project" icon="pencil" onClick={() => store.createProject()} {...props} />
  )),
  duplicateProject: React.memo((props) => (
    <ActionItem title="Duplicate Project" icon="clone outline" onClick={() => store.duplicateProject()} {...props} />
  )),
  renameProject: React.memo((props) => (
    <ActionItem title="Rename Project" icon="edit outline" onClick={() => store.renameProject()} {...props} />
  )),
  deleteProject: React.memo((props) => (
    <ActionItem
      title="Delete Project"
      icon="trash alternate outline"
      onClick={() => store.deleteProject()}
      {...props}
    />
  )),
  compileProject: view((props) => {
    const { file } = store
    const fileNeedsCompilation = file?.isLoaded && !file?.compiled
    return (
      <ActionItem
        title="Compile"
        active={fileNeedsCompilation}
        color="blue"
        icon="paper plane"
        className="no-border"
        onClick={() => store.compile()}
        {...props}
      />
    )
  }),
  publishProject: React.memo((props) => (
    <ActionItem title="Publish" icon="world" onClick={() => store.testDialog()} {...props} />
  )),
  restartApp: React.memo((props) => (
    <ActionItem title="Restart" icon="redo" onClick={() => store.compile()} {...props} />
  )),

  //////////////////////
  // File Actions
  //////////////////////
  createFile: React.memo((props) => (
    <ActionItem title="New File" icon="pencil" onClick={() => store.createFile()} {...props} />
  )),
  duplicateFile: React.memo((props) => (
    <ActionItem title="Duplicate File" icon="clone outline" onClick={() => store.duplicateFile()} {...props} />
  )),
  renameFile: React.memo((props) => (
    <ActionItem title="Rename File" icon="edit outline" onClick={() => store.renameFile()} {...props} />
  )),
  deleteFile: React.memo((props) => (
    <ActionItem title="Delete File" icon="trash alternate outline" onClick={() => store.deleteFile()} {...props} />
  )),
  saveFile: view((props) => {
    const fileIsDirty = store.file?.isDirty
    return (
      <ActionItem
        title="Save"
        active={fileIsDirty}
        color="green"
        icon="cloud upload"
        onClick={() => store.saveFile()}
        {...props}
      />
    )
  }),
  reloadFile: view((props) => {
    const fileIsDirty = store.file?.isDirty
    return (
      <ActionItem
        title="Reload"
        active={fileIsDirty}
        color="red"
        icon="cloud download"
        onClick={() => store.reloadFile()}
        {...props}
      />
    )
  }),

  //////////////////////
  // Console
  //////////////////////

  clearConsole: view((props) => {
    const consoleisEmpty = spellCore.console.lines.length === 0
    return (
      <ActionItem
        title="Clear Console"
        disabled={consoleisEmpty}
        icon="ban"
        onClick={() => spellCore.console.clear()}
        {...props}
      />
    )
  }),

  //////////////////////
  // MatchViwer
  //////////////////////
  toggleMatchRuleNames: view((props) => {
    const { showingMatchRuleNames: showNames } = store
    return (
      <ActionItem
        icon={showNames ? "eye" : "eye slash outline"}
        content={(showNames ? "Show" : "Hide") + " Rule Names"}
        onClick={() => store.toggleMatchRuleNames()}
        {...props}
      />
    )
  }),

  //////////////////////
  // Testing
  //////////////////////
  alert: React.memo((props) => (
    <ActionItem title="Alert" icon="warning sign" onClick={() => store.alert({ ...props }).then(console.info)} />
  )),
  confirm: React.memo((props) => (
    <ActionItem title="Confirm" icon="question circle" onClick={() => store.alert({ ...props }).then(console.info)} />
  )),
  prompt: React.memo((props) => (
    <ActionItem title="Prompt" icon="edit" onClick={() => store.alert({ ...props }).then(console.info)} />
  ))
}

//////////////////////
// groups of actions
//////////////////////

actions.PROJECT_DROPDOWN_ACTIONS = [
  <actions.createProject key="createProject" />,
  <actions.duplicateProject key="duplicateProject" />,
  <actions.renameProject key="renameProject" />,
  <actions.deleteProject key="deleteProject" />
]

actions.FILE_DROPDOWN_ACTIONS = [
  <actions.createFile key="createFile" />,
  <actions.duplicateFile key="duplicateFile" />,
  <actions.renameFile key="renameFile" />,
  <actions.deleteFile key="deleteFile" />
]

export { actions }
