import React from "react"
import { Button, Menu } from "semantic-ui-react"

import { spellCore } from "~/spell-core"
import { view } from "~/util"
import { store } from "~/app/store"

/**
 * Component to show action menu item or button with our semantics.
 * - `title`      Required item title.
 * - `icon`       Required item icon.
 * - `button`     If `true` we'll make a SUI `Button`, otherwise a `Menu.Item`.
 * - `className`  Custom className
 * ... everything else will be passed directly to the item
 * NOTE: we assume this will be memoized by the caller if appropriate.
 */
export function Action({ title, button = false, ...props }) {
  const Component = button ? Button : Menu.Item
  return <Component content={title} {...props} />
}

/**
 * Constructors for <Menu.Items> for public actions.
 */
export const actions = {
  //////////////////////
  // Navigation
  //////////////////////

  aboutSpell: React.memo((props) => (
    <Action title="About Spell" icon="wizard" onClick={() => store.aboutSpell()} {...props} />
  )),
  showEditor: view((props) => (
    <Action title={`Edit ${store.appType}`} icon="edit outline" onClick={() => store.showEditor()} {...props} />
  )),
  showRunner: React.memo((props) => (
    <Action title="Preview" icon="hand point up" onClick={() => store.showRunner()} {...props} />
  )),
  showProjectSettings: React.memo((props) => (
    <Action title="Settings" icon="setting" onClick={() => store.showProjectSettings()} {...props} />
  )),
  showProjectChooser: React.memo((props) => (
    <Action title="Open or Create..." icon="app store ios" onClick={() => store.showProjectChooser()} {...props} />
  )),
  showDocs: React.memo((props) => (
    <Action title="Docs" icon="newspaper outline" onClick={() => store.showDocs()} {...props} />
  )),
  showHelp: React.memo((props) => (
    <Action title="Help" icon="help circle" onClick={() => store.showHelp()} {...props} />
  )),
  logIn: React.memo((props) => <Action title="Log In" icon="user outline" onClick={() => store.logIn()} {...props} />),

  //////////////////////
  // App actions -- work on store.project, create according to `store.projectRoot`
  //////////////////////
  createApp: view((props) => (
    <Action title={`Create ${store.appType}`} icon="pencil" onClick={() => store.createApp()} {...props} />
  )),
  duplicateApp: view((props) => (
    <Action title={`Duplicate ${store.appType}`} icon="clone outline" onClick={() => store.duplicateApp()} {...props} />
  )),
  renameApp: view((props) => (
    <Action title={`Rename ${store.appType}`} icon="edit outline" onClick={() => store.renameApp()} {...props} />
  )),
  deleteApp: view((props) => (
    <Action
      title={`Delete ${store.appType}`}
      icon="trash alternate outline"
      onClick={() => store.deleteApp()}
      {...props}
    />
  )),
  appSettings: React.memo((props) => (
    <Action title="Settings" icon="setting" onClick={() => store.showProjectSettings()} {...props} />
  )),
  compileApp: view((props) => {
    const { file } = store
    const fileNeedsCompilation = file?.isLoaded && !file?.compiled
    return (
      <Action
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
    <Action title="Publish" icon="world" onClick={() => store.publishApp()} {...props} />
  )),
  restartApp: React.memo((props) => (
    <Action title="Restart" icon="redo" onClick={() => store.compileApp()} {...props} />
  )),

  //////////////////////
  // Project actions
  //////////////////////
  createProject: view((props) => (
    <Action title="New Project" icon="pencil" onClick={() => store.createProject()} {...props} />
  )),

  //////////////////////
  // Examples actions
  //////////////////////
  createExample: React.memo((props) => (
    <Action title="New Example" icon="pencil" onClick={() => store.createExample()} {...props} />
  )),

  //////////////////////
  // Guides actions
  //////////////////////
  createGuide: React.memo((props) => (
    <Action title="New Guide" icon="pencil" onClick={() => store.createGuide()} {...props} />
  )),

  //////////////////////
  // File Actions -- work on store.file
  //////////////////////
  createFile: React.memo((props) => (
    <Action title="New File" icon="pencil" onClick={() => store.createFile()} {...props} />
  )),
  duplicateFile: React.memo((props) => (
    <Action title="Duplicate File" icon="clone outline" onClick={() => store.duplicateFile()} {...props} />
  )),
  renameFile: React.memo((props) => (
    <Action title="Rename File" icon="edit outline" onClick={() => store.renameFile()} {...props} />
  )),
  deleteFile: React.memo((props) => (
    <Action title="Delete File" icon="trash alternate outline" onClick={() => store.deleteFile()} {...props} />
  )),
  saveFile: view((props) => {
    const fileIsDirty = store.file?.isDirty
    return (
      <Action
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
      <Action
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
      <Action
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
      <Action
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
    return <Action title={title} icon={icon} {...itemProps} onClick={() => store.alert(modalProps).then(callback)} />
  }),
  confirm: React.memo(
    ({ callback = console.log, title = "Confirm", icon = "question circle", itemProps, ...modalProps }) => {
      itemProps = { title, icon, ...itemProps }
      return <Action {...itemProps} onClick={() => store.confirm(modalProps).then(callback)} />
    }
  ),
  prompt: React.memo(({ callback = console.log, title = "Prompt", icon = "edit", itemProps, ...modalProps }) => {
    itemProps = { title, icon, ...itemProps }
    return <Action {...itemProps} onClick={() => store.prompt(modalProps).then(callback)} />
  }),
  promptForNumber: React.memo(
    ({ callback = console.log, title = "Prompt Number", icon = "hashtag", itemProps, ...modalProps }) => {
      itemProps = { title, icon, ...itemProps }
      return <Action {...itemProps} onClick={() => store.promptForNumber(modalProps).then(callback)} />
    }
  ),
  choose: React.memo(({ callback = console.log, title = "Choose", icon = "list", itemProps, ...modalProps }) => {
    itemProps = { title, icon, ...itemProps }
    return <Action {...itemProps} onClick={() => store.choose(modalProps).then(callback)} />
  })
}

//////////////////////
// groups of actions
//////////////////////

actions.PROJECT_DROPDOWN_ACTIONS = [
  <actions.createApp key="createApp" />,
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
