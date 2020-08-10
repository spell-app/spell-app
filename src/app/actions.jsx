import React from "react"
import classnames from "classnames"
import { Button, Menu } from "semantic-ui-react"

import { spellCore } from "~/languages/spell"
import { view } from "~/util"
import { store } from "./store"

/**
 * Component to show action menu item or button with our semantics.
 * - `button`     If `true` we'll make a SUI `Button`, otherwise a `Menu.Item`.
 * - `title`      Item title
 * - `icon`       Item icon
 * - `noBorder`   True to hide the SUI item border.
 * - `className`  Custom className
 * ... everything else will be passed directly to the item
 * NOTE: we assume this will be memoized by the caller if appropriate.
 */
export function ActionItem({ title, button = false, noBorder, className = "", ...props }) {
  const klass = [className, noBorder && "no-border"].filter(Boolean).join(" ")
  const Component = button ? Button : Menu.Item
  return <Component content={title} className={classnames(className, noBorder && "no-border")} {...props} />
}

/**
 * Constructors for <Menu.Items> for public actions.
 */
export const actions = {
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
  // App actions -- work on store.project
  //////////////////////
  duplicateApp: React.memo((props) => (
    <ActionItem title="Duplicate Project" icon="clone outline" onClick={() => store.duplicateApp()} {...props} />
  )),
  renameApp: React.memo((props) => (
    <ActionItem title="Rename Project" icon="edit outline" onClick={() => store.renameApp()} {...props} />
  )),
  deleteApp: React.memo((props) => (
    <ActionItem title="Delete Project" icon="trash alternate outline" onClick={() => store.deleteApp()} {...props} />
  )),
  appSettings: React.memo((props) => (
    <ActionItem title="Settings" icon="setting" onClick={() => store.showProjectSettings()} {...props} />
  )),
  compileApp: view((props) => {
    const { file } = store
    const fileNeedsCompilation = file?.isLoaded && !file?.compiled
    return (
      <ActionItem
        title="Compile"
        active={fileNeedsCompilation}
        color="blue"
        icon="paper plane"
        className="no-border"
        onClick={() => store.compileApp()}
        {...props}
      />
    )
  }),
  publishApp: React.memo((props) => (
    <ActionItem title="Publish" icon="world" onClick={() => store.publishApp()} {...props} />
  )),
  restartApp: React.memo((props) => (
    <ActionItem title="Restart" icon="redo" onClick={() => store.compileApp()} {...props} />
  )),

  //////////////////////
  // Project actions
  //////////////////////
  createProject: React.memo((props) => (
    <ActionItem title="New Project" icon="pencil" onClick={() => store.createProject()} {...props} />
  )),

  //////////////////////
  // Examples actions
  //////////////////////
  createExample: React.memo((props) => (
    <ActionItem title="New Example" icon="pencil" onClick={() => store.createExample()} {...props} />
  )),

  //////////////////////
  // Guides actions
  //////////////////////
  createGuide: React.memo((props) => (
    <ActionItem title="New Guide" icon="pencil" onClick={() => store.createGuide()} {...props} />
  )),

  //////////////////////
  // File Actions -- work on store.file
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
  // Modals
  // - `title`, `icon`, `itemProps` will be passed to the item.
  // - `callback` will be executed with returned value (logs to console by default).
  // - other `props` will be passed to modal constructor. ???
  //////////////////////
  alert: React.memo(({ callback = console.log, title = "Alert", icon = "warning sign", itemProps, ...modalProps }) => {
    itemProps = { title, icon, ...itemProps }
    return (
      <ActionItem title={title} icon={icon} {...itemProps} onClick={() => store.alert(modalProps).then(callback)} />
    )
  }),
  confirm: React.memo(
    ({ callback = console.log, title = "Confirm", icon = "question circle", itemProps, ...modalProps }) => {
      itemProps = { title, icon, ...itemProps }
      return <ActionItem {...itemProps} onClick={() => store.confirm(modalProps).then(callback)} />
    }
  ),
  prompt: React.memo(({ callback = console.log, title = "Prompt", icon = "edit", itemProps, ...modalProps }) => {
    itemProps = { title, icon, ...itemProps }
    return <ActionItem {...itemProps} onClick={() => store.prompt(modalProps).then(callback)} />
  }),
  promptForNumber: React.memo(
    ({ callback = console.log, title = "Prompt Number", icon = "hashtag", itemProps, ...modalProps }) => {
      itemProps = { title, icon, ...itemProps }
      return <ActionItem {...itemProps} onClick={() => store.promptForNumber(modalProps).then(callback)} />
    }
  ),
  choose: React.memo(({ callback = console.log, title = "Choose", icon = "list", itemProps, ...modalProps }) => {
    itemProps = { title, icon, ...itemProps }
    return <ActionItem {...itemProps} onClick={() => store.choose(modalProps).then(callback)} />
  })
}

//////////////////////
// groups of actions
//////////////////////

actions.PROJECT_DROPDOWN_ACTIONS = [
  <actions.createProject key="createProject" />,
  <actions.duplicateApp key="duplicateApp" />,
  <actions.renameApp key="renameApp" />,
  <actions.deleteApp key="deleteApp" />
]

actions.FILE_DROPDOWN_ACTIONS = [
  <actions.createFile key="createFile" />,
  <actions.duplicateFile key="duplicateFile" />,
  <actions.renameFile key="renameFile" />,
  <actions.deleteFile key="deleteFile" />
]
