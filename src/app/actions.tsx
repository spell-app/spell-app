import * as SUI from "semantic-ui-react"

import { view } from "~/util"

import { spellCore } from "~/spellCore"
import { store } from "~/app/store"
import type { AlertModalProps, ConfirmModalProps, PromptModalProps, ChooserModalProps } from "~/app/components"

/****************
 * ### `<Action>`
 * Action menu item or button with our semantics.
 * - `title`      Required item title.
 * - `icon`       Required item icon.
 * - `button`     If `true` we'll make a SUI `Button`, otherwise a `Menu.Item`.
 * - `className`  Custom className
 * - ...everything else is passed directly to the item.
 *
 * NOTE: deliberately NOT a `view()`.  This render reads only its own props, so `view()`'s
 * observer half would track nothing, and its `memo()` half never hits either -- every call site
 * passes a fresh `onClick={() => ...}` closure, so the shallow prop compare always fails.
 * Reactivity belongs on whichever entry in `Actions` derives props from the store.
 ****************/
export function Action({ title, button = false, ...props }: ActionProps) {
  const Component = button ? SUI.Button : SUI.Menu.Item
  return <Component content={title} {...props} />
}

/** Props for `<Action>` -- everything but `title`/`button` is forwarded to the underlying SUI component. */
export type ActionProps = {
  title?: ReactNode
  button?: boolean
} & Record<string, unknown>

/**
 * Constructors for `<Menu.Item>`s for public actions.
 *
 * NOTE: an entry MUST wrap itself in `view()` when it reads `store`/`spellCore` while computing
 * the props it hands to `<Action>` -- `view()` only tracks observables read during that
 * component's own render, and `<Action>` itself reads nothing but props.
 * - e.g. `saveFile` reads `store.file?.isDirty` to colour itself -- drop its `view()` and the
 *   button silently stops reacting when the file goes dirty.
 * - Entries that only touch the store inside `onClick` stay plain -- those run after render.
 */
export const Actions = {
  //////////////////////
  // Navigation
  //////////////////////

  aboutSpell: (props: ActionProps) => (
    <Action title="About Spell" icon="wizard" onClick={() => store.aboutSpell()} {...props} />
  ),
  showEditor: view((props: ActionProps) => (
    <Action title={`Edit ${store.appType}`} icon="edit outline" onClick={() => store.showEditor()} {...props} />
  )),
  showRunner: (props: ActionProps) => (
    <Action title="Preview" icon="hand point up" onClick={() => store.showRunner()} {...props} />
  ),
  showProjectSettings: (props: ActionProps) => (
    <Action title="Settings" icon="setting" onClick={() => store.showProjectSettings()} {...props} />
  ),
  showProjectChooser: (props: ActionProps) => (
    <Action title="Open or Create..." icon="app store ios" onClick={() => store.showProjectChooser()} {...props} />
  ),
  showDocs: (props: ActionProps) => (
    <Action title="Docs" icon="newspaper outline" onClick={() => store.showDocs()} {...props} />
  ),
  showHelp: (props: ActionProps) => (
    <Action title="Help" icon="help circle" onClick={() => store.showHelp()} {...props} />
  ),
  logIn: (props: ActionProps) => <Action title="Log In" icon="user outline" onClick={() => store.logIn()} {...props} />,

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
  appSettings: (props: ActionProps) => (
    <Action title="Settings" icon="setting" onClick={() => store.showProjectSettings()} {...props} />
  ),
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
  publishApp: (props: ActionProps) => (
    <Action title="Publish" icon="world" onClick={() => store.publishApp()} {...props} />
  ),
  restartApp: (props: ActionProps) => (
    <Action title="Restart" icon="redo" onClick={() => store.compileApp()} {...props} />
  ),

  //////////////////////
  // Project actions
  //////////////////////
  createProject: (props: ActionProps) => (
    <Action title="New Project" icon="pencil" onClick={() => store.createProject()} {...props} />
  ),

  //////////////////////
  // Examples actions
  //////////////////////
  createExample: (props: ActionProps) => (
    <Action title="New Example" icon="pencil" onClick={() => store.createExample()} {...props} />
  ),

  //////////////////////
  // Guides actions
  //////////////////////
  createGuide: (props: ActionProps) => (
    <Action title="New Guide" icon="pencil" onClick={() => store.createGuide()} {...props} />
  ),

  //////////////////////
  // File Actions -- work on store.file
  //////////////////////
  createFile: (props: ActionProps) => (
    <Action title="New File" icon="pencil" onClick={() => store.createFile()} {...props} />
  ),
  duplicateFile: (props: ActionProps) => (
    <Action title="Duplicate File" icon="clone outline" onClick={() => store.duplicateFile()} {...props} />
  ),
  renameFile: (props: ActionProps) => (
    <Action title="Rename File" icon="edit outline" onClick={() => store.renameFile()} {...props} />
  ),
  deleteFile: (props: ActionProps) => (
    <Action title="Delete File" icon="trash alternate outline" onClick={() => store.deleteFile()} {...props} />
  ),
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
  alert: ({
    callback = console.log,
    title = "Alert",
    icon = "warning sign",
    itemProps,
    ...modalProps
  }: DialogActionProps<AlertModalProps>) => {
    itemProps = { title, icon, ...itemProps }
    return <Action title={title} icon={icon} {...itemProps} onClick={() => store.alert(modalProps).then(callback)} />
  },
  confirm: ({
    callback = console.log,
    title = "Confirm",
    icon = "question circle",
    itemProps,
    ...modalProps
  }: DialogActionProps<ConfirmModalProps>) => {
    itemProps = { title, icon, ...itemProps }
    return <Action {...itemProps} onClick={() => store.confirm(modalProps).then(callback)} />
  },
  prompt: ({
    callback = console.log,
    title = "Prompt",
    icon = "edit",
    itemProps,
    ...modalProps
  }: DialogActionProps<PromptModalProps>) => {
    itemProps = { title, icon, ...itemProps }
    return <Action {...itemProps} onClick={() => store.prompt(modalProps).then(callback)} />
  },
  promptForNumber: ({
    callback = console.log,
    title = "Prompt Number",
    icon = "hashtag",
    itemProps,
    ...modalProps
  }: DialogActionProps<PromptModalProps>) => {
    itemProps = { title, icon, ...itemProps }
    return <Action {...itemProps} onClick={() => store.promptForNumber(modalProps).then(callback)} />
  },
  choose: ({
    callback = console.log,
    title = "Choose",
    icon = "list",
    itemProps,
    ...modalProps
  }: DialogActionProps<ChooserModalProps>) => {
    itemProps = { title, icon, ...itemProps }
    return <Action {...itemProps} onClick={() => store.choose(modalProps).then(callback)} />
  },
  //////////////////////
  // groups of actions
  //////////////////////
  PROJECT_DROPDOWN_ACTIONS: undefined as ReactElement[] | undefined,
  FILE_DROPDOWN_ACTIONS: undefined as ReactElement[] | undefined
}

Actions.PROJECT_DROPDOWN_ACTIONS = [
  <Actions.createApp key="createApp" />,
  <Actions.duplicateApp key="duplicateApp" />,
  <Actions.renameApp key="renameApp" />,
  <Actions.deleteApp key="deleteApp" />
]

Actions.FILE_DROPDOWN_ACTIONS = [
  <Actions.createFile key="createFile" />,
  <Actions.duplicateFile key="duplicateFile" />,
  <Actions.renameFile key="renameFile" />,
  <Actions.deleteFile key="deleteFile" />
]

/** Props shared by the dialog-showing actions (`alert`, `confirm`, `prompt`, `promptForNumber`, `choose`). */
export type DialogActionProps<P> = P & {
  callback?: (value: unknown) => void
  title?: string
  icon?: string
  itemProps?: Record<string, unknown>
}
