import React from "react"
import { Menu } from "semantic-ui-react"

import { spellCore } from "~/languages/spell"
import { view } from "~/util"
import { store } from "./store"

/**
 * Component to show action menu item with our semantics.
 * NOTE: we assume this will be memoized by the caller if appropriate.
 */
export function ActionItem({ title, noBorder, className = "", ...props }) {
  const klass = [className, noBorder && "no-border"].filter(Boolean).join(" ")
  return <Menu.Item content={title} className={klass} {...props} />
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
  // Modals -- props will be passed directly to modal constructor
  //////////////////////
  alert: React.memo(({ title = "Alert", icon = "warning sign", ...props }) => (
    <ActionItem title={title} icon={icon} onClick={() => store.alert({ ...props }).then(console.info)} />
  )),
  confirm: React.memo((props) => (
    <ActionItem title="Confirm" icon="question circle" onClick={() => store.confirm({ ...props }).then(console.info)} />
  )),
  prompt: React.memo((props) => (
    <ActionItem title="Prompt" icon="edit" onClick={() => store.prompt({ ...props }).then(console.info)} />
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
