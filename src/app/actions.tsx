import { Button, Menu } from "semantic-ui-react"

import { spellCore } from "~/spellCore"
import { view } from "~/util"
import { store } from "~/app/store"
import type { AlertModalProps, ConfirmModalProps, PromptModalProps, ChooserModalProps } from "~/app/components/ui"

/** Props for `<Action>` -- everything but `title`/`button` is forwarded to the underlying SUI component. */
export type ActionProps = {
  title?: ReactNode
  button?: boolean
} & Record<string, unknown>

/**
 * Component to show action menu item or button with our semantics.
 * - `title`      Required item title.
 * - `icon`       Required item icon.
 * - `button`     If `true` we'll make a SUI `Button`, otherwise a `Menu.Item`.
 * - `className`  Custom className
 * ... everything else will be passed directly to the item
 * NOTE: we assume this will be memoized by the caller if appropriate.
 */
export function Action({ title, button = false, ...props }: ActionProps) {
  const Component = button ? Button : Menu.Item
  return <Component content={title} {...props} />
}

/** Props shared by the dialog-showing actions (`alert`, `confirm`, `prompt`, `promptForNumber`, `choose`). */
export type DialogActionProps<P> = P & {
  callback?: (value: unknown) => void
  title?: string
  icon?: string
  itemProps?: Record<string, unknown>
}

/**
 * Constructors for <Menu.Items> for public actions.
 */
export const actions = {
  //////////////////////
  // Navigation
  //////////////////////

  aboutSpell: view((props: ActionProps) => (
    <Action title="About Spell" icon="wizard" onClick={() => store.aboutSpell()} {...props} />
  )),
  showEditor: view((props: ActionProps) => (
    <Action title={`Edit ${store.appType}`} icon="edit outline" onClick={() => store.showEditor()} {...props} />
  )),
  showRunner: view((props: ActionProps) => (
    <Action title="Preview" icon="hand point up" onClick={() => store.showRunner()} {...props} />
  )),
  showProjectSettings: view((props: ActionProps) => (
    <Action title="Settings" icon="setting" onClick={() => store.showProjectSettings()} {...props} />
  )),
  showProjectChooser: view((props: ActionProps) => (
    <Action title="Open or Create..." icon="app store ios" onClick={() => store.showProjectChooser()} {...props} />
  )),
  showDocs: view((props: ActionProps) => (
    <Action title="Docs" icon="newspaper outline" onClick={() => store.showDocs()} {...props} />
  )),
  showHelp: view((props: ActionProps) => (
    <Action title="Help" icon="help circle" onClick={() => store.showHelp()} {...props} />
  )),
  logIn: view((props: ActionProps) => (
    <Action title="Log In" icon="user outline" onClick={() => store.logIn()} {...props} />
  )),

  //////////////////////
  // App actions -- work on store.project, create according to `store.projectRoot`
  //////////////////////
  createApp: view((props: ActionProps) => (
    <Action title={`Create ${store.appType}`} icon="pencil" onClick={() => store.createApp()} {...props} />
  )),
  duplicateApp: view((props: ActionProps) => (
    <Action title={`Duplicate ${store.appType}`} icon="clone outline" onClick={() => store.duplicateApp()} {...props} />
  )),
  renameApp: view((props: ActionProps) => (
    <Action title={`Rename ${store.appType}`} icon="edit outline" onClick={() => store.renameApp()} {...props} />
  )),
  deleteApp: view((props: ActionProps) => (
    <Action
      title={`Delete ${store.appType}`}
      icon="trash alternate outline"
      onClick={() => store.deleteApp()}
      {...props}
    />
  )),
  appSettings: view((props: ActionProps) => (
    <Action title="Settings" icon="setting" onClick={() => store.showProjectSettings()} {...props} />
  )),
  compileApp: view((props: ActionProps) => {
    const { file } = store
    // `compiled` only exists on `SpellFile`/`SpellCSSFile`, not `SpellJSFile`.
    const isCompiled = !!file && "compiled" in file && !!file.compiled
    const fileNeedsCompilation = !!file?.isLoaded && !isCompiled
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
  publishApp: view((props: ActionProps) => (
    <Action title="Publish" icon="world" onClick={() => store.publishApp()} {...props} />
  )),
  restartApp: view((props: ActionProps) => (
    <Action title="Restart" icon="redo" onClick={() => store.compileApp()} {...props} />
  )),

  //////////////////////
  // Project actions
  //////////////////////
  createProject: view((props: ActionProps) => (
    <Action title="New Project" icon="pencil" onClick={() => store.createProject()} {...props} />
  )),

  //////////////////////
  // Examples actions
  //////////////////////
  createExample: view((props: ActionProps) => (
    <Action title="New Example" icon="pencil" onClick={() => store.createExample()} {...props} />
  )),

  //////////////////////
  // Guides actions
  //////////////////////
  createGuide: view((props: ActionProps) => (
    <Action title="New Guide" icon="pencil" onClick={() => store.createGuide()} {...props} />
  )),

  //////////////////////
  // File Actions -- work on store.file
  //////////////////////
  createFile: view((props: ActionProps) => (
    <Action title="New File" icon="pencil" onClick={() => store.createFile()} {...props} />
  )),
  duplicateFile: view((props: ActionProps) => (
    <Action title="Duplicate File" icon="clone outline" onClick={() => store.duplicateFile()} {...props} />
  )),
  renameFile: view((props: ActionProps) => (
    <Action title="Rename File" icon="edit outline" onClick={() => store.renameFile()} {...props} />
  )),
  deleteFile: view((props: ActionProps) => (
    <Action title="Delete File" icon="trash alternate outline" onClick={() => store.deleteFile()} {...props} />
  )),
  saveFile: view((props: ActionProps) => {
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
  reloadFile: view((props: ActionProps) => {
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

  clearConsole: view((props: ActionProps) => {
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
  toggleMatchRuleNames: view((props: ActionProps) => {
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
  alert: view(
    ({
      callback = console.log,
      title = "Alert",
      icon = "warning sign",
      itemProps,
      ...modalProps
    }: DialogActionProps<AlertModalProps>) => {
      itemProps = { title, icon, ...itemProps }
      return <Action title={title} icon={icon} {...itemProps} onClick={() => store.alert(modalProps).then(callback)} />
    }
  ),
  confirm: view(
    ({
      callback = console.log,
      title = "Confirm",
      icon = "question circle",
      itemProps,
      ...modalProps
    }: DialogActionProps<ConfirmModalProps>) => {
      itemProps = { title, icon, ...itemProps }
      return <Action {...itemProps} onClick={() => store.confirm(modalProps).then(callback)} />
    }
  ),
  prompt: view(
    ({
      callback = console.log,
      title = "Prompt",
      icon = "edit",
      itemProps,
      ...modalProps
    }: DialogActionProps<PromptModalProps>) => {
      itemProps = { title, icon, ...itemProps }
      return <Action {...itemProps} onClick={() => store.prompt(modalProps).then(callback)} />
    }
  ),
  promptForNumber: view(
    ({
      callback = console.log,
      title = "Prompt Number",
      icon = "hashtag",
      itemProps,
      ...modalProps
    }: DialogActionProps<PromptModalProps>) => {
      itemProps = { title, icon, ...itemProps }
      return <Action {...itemProps} onClick={() => store.promptForNumber(modalProps).then(callback)} />
    }
  ),
  choose: view(
    ({
      callback = console.log,
      title = "Choose",
      icon = "list",
      itemProps,
      ...modalProps
    }: DialogActionProps<ChooserModalProps>) => {
      itemProps = { title, icon, ...itemProps }
      return <Action {...itemProps} onClick={() => store.choose(modalProps).then(callback)} />
    }
  ),

  //////////////////////
  // groups of actions
  //////////////////////
  PROJECT_DROPDOWN_ACTIONS: undefined as ReactElement[] | undefined,
  FILE_DROPDOWN_ACTIONS: undefined as ReactElement[] | undefined
}

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
