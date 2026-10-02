/** @jsxImportSource react */
import * as SUI from "semantic-ui-react"

import { view } from "$/util"

import { editor, runtimeConsole } from "$/app/editor"
import type * as Modals from "$/app/solid/modals"

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
 * Reactivity belongs on whichever entry in `Actions` derives props from `editor`.
 ****************/
function Action({ title, button = false, ...props }: ActionProps) {
  const Component = button ? SUI.Button : SUI.Menu.Item
  return <Component content={title} {...props} />
}

/**
 * Constructors for `<Menu.Item>`s for public actions.
 *
 * NOTE: an entry MUST wrap itself in `view()` when it reads `editor` -- e.g. via `runtimeConsole()` -- while computing
 * the props it hands to `<Action>` -- `view()` only tracks observables read during that
 * component's own render, and `<Action>` itself reads nothing but props.
 * - e.g. `saveFile` reads `editor.file?.isDirty` to colour itself -- drop its `view()` and the
 *   button silently stops reacting when the file goes dirty.
 * - Entries that only touch `editor` inside `onClick` stay plain -- those run after render.
 */
export const Actions = {
  ////////////////
  // ## Navigation
  ////////////////

  aboutSpell: (props: ActionProps) => (
    <Action title="About Spell" icon="wizard" onClick={() => editor.aboutSpell()} {...props} />
  ),
  showEditor: view((props: ActionProps) => (
    <Action title={`Edit ${editor.appType}`} icon="edit outline" onClick={() => editor.showEditor()} {...props} />
  )),
  showRunner: (props: ActionProps) => (
    <Action title="Preview" icon="hand point up" onClick={() => editor.showRunner()} {...props} />
  ),
  showProjectSettings: (props: ActionProps) => (
    <Action title="Settings" icon="setting" onClick={() => editor.showProjectSettings()} {...props} />
  ),
  showProjectChooser: (props: ActionProps) => (
    <Action title="Open or Create..." icon="app store ios" onClick={() => editor.showProjectChooser()} {...props} />
  ),
  showDocs: (props: ActionProps) => (
    <Action title="Docs" icon="newspaper outline" onClick={() => editor.showDocs()} {...props} />
  ),
  showHelp: (props: ActionProps) => (
    <Action title="Help" icon="help circle" onClick={() => editor.showHelp()} {...props} />
  ),
  logIn: (props: ActionProps) => (
    <Action title="Log In" icon="user outline" onClick={() => editor.logIn()} {...props} />
  ),

  ////////////////
  // ## App actions -- work on `editor.project`, create according to `editor.projectRoot`
  ////////////////
  createApp: view((props: ActionProps) => (
    <Action title={`Create ${editor.appType}`} icon="pencil" onClick={() => editor.createApp()} {...props} />
  )),
  duplicateApp: view((props: ActionProps) => (
    <Action
      title={`Duplicate ${editor.appType}`}
      icon="clone outline"
      onClick={() => editor.duplicateApp()}
      {...props}
    />
  )),
  renameApp: view((props: ActionProps) => (
    <Action title={`Rename ${editor.appType}`} icon="edit outline" onClick={() => editor.renameApp()} {...props} />
  )),
  deleteApp: view((props: ActionProps) => (
    <Action
      title={`Delete ${editor.appType}`}
      icon="trash alternate outline"
      onClick={() => editor.deleteApp()}
      {...props}
    />
  )),
  appSettings: (props: ActionProps) => (
    <Action title="Settings" icon="setting" onClick={() => editor.showProjectSettings()} {...props} />
  ),
  compileApp: view((props: ActionProps) => {
    const { file } = editor
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
        onClick={() => editor.compileApp()}
        {...props}
      />
    )
  }),
  publishApp: (props: ActionProps) => (
    <Action title="Publish" icon="world" onClick={() => editor.publishApp()} {...props} />
  ),
  restartApp: (props: ActionProps) => (
    <Action title="Restart" icon="redo" onClick={() => editor.compileApp()} {...props} />
  ),

  ////////////////
  // ## Project actions
  ////////////////
  createProject: (props: ActionProps) => (
    <Action title="New Project" icon="pencil" onClick={() => editor.createProject()} {...props} />
  ),

  ////////////////
  // ## Examples actions
  ////////////////
  createExample: (props: ActionProps) => (
    <Action title="New Example" icon="pencil" onClick={() => editor.createExample()} {...props} />
  ),

  ////////////////
  // ## Guides actions
  ////////////////
  createGuide: (props: ActionProps) => (
    <Action title="New Guide" icon="pencil" onClick={() => editor.createGuide()} {...props} />
  ),

  ////////////////
  // ## File Actions -- work on `editor.file`
  ////////////////
  createFile: (props: ActionProps) => (
    <Action title="New File" icon="pencil" onClick={() => editor.createFile()} {...props} />
  ),
  duplicateFile: (props: ActionProps) => (
    <Action title="Duplicate File" icon="clone outline" onClick={() => editor.duplicateFile()} {...props} />
  ),
  renameFile: (props: ActionProps) => (
    <Action title="Rename File" icon="edit outline" onClick={() => editor.renameFile()} {...props} />
  ),
  deleteFile: (props: ActionProps) => (
    <Action title="Delete File" icon="trash alternate outline" onClick={() => editor.deleteFile()} {...props} />
  ),
  saveFile: view((props: ActionProps) => {
    const fileIsDirty = editor.file?.isDirty
    return (
      <Action
        title="Save"
        active={fileIsDirty}
        color="green"
        icon="cloud upload"
        onClick={() => editor.saveFile()}
        {...props}
      />
    )
  }),
  reloadFile: view((props: ActionProps) => {
    const fileIsDirty = editor.file?.isDirty
    return (
      <Action
        title="Reload"
        active={fileIsDirty}
        color="red"
        icon="cloud download"
        onClick={() => editor.reloadFile()}
        {...props}
      />
    )
  }),

  ////////////////
  // ## Console
  ////////////////

  clearConsole: view((props: ActionProps) => {
    const consoleisEmpty = !runtimeConsole()?.lines.length
    return (
      <Action
        title="Clear Console"
        disabled={consoleisEmpty}
        icon="ban"
        onClick={() => runtimeConsole()?.clear()}
        {...props}
      />
    )
  }),

  ////////////////
  // ## MatchViewer
  ////////////////
  toggleMatchRuleNames: view((props: ActionProps) => {
    const { showingMatchRuleNames: showNames } = editor
    return (
      <Action
        icon={showNames ? "eye" : "eye slash outline"}
        content={(showNames ? "Show" : "Hide") + " Rule Names"}
        onClick={() => editor.toggleMatchRuleNames()}
        {...props}
      />
    )
  }),

  ////////////////
  // ## Modals
  ////////////////
  // - `title`, `icon`, `itemProps` will be passed to the item.
  // - `callback` will be executed with returned value (logs to console by default).
  // - other `props` will be passed to modal constructor. ???
  alert: ({
    callback = console.log,
    title = "Alert",
    icon = "warning sign",
    itemProps,
    ...modalProps
  }: DialogActionProps<Modals.AlertModalProps>) => {
    itemProps = { title, icon, ...itemProps }
    return <Action title={title} icon={icon} {...itemProps} onClick={() => editor.alert(modalProps).then(callback)} />
  },
  confirm: ({
    callback = console.log,
    title = "Confirm",
    icon = "question circle",
    itemProps,
    ...modalProps
  }: DialogActionProps<Modals.ConfirmModalProps>) => {
    itemProps = { title, icon, ...itemProps }
    return <Action {...itemProps} onClick={() => editor.confirm(modalProps).then(callback)} />
  },
  prompt: ({
    callback = console.log,
    title = "Prompt",
    icon = "edit",
    itemProps,
    ...modalProps
  }: DialogActionProps<Modals.PromptModalProps>) => {
    itemProps = { title, icon, ...itemProps }
    return <Action {...itemProps} onClick={() => editor.prompt(modalProps).then(callback)} />
  },
  promptForNumber: ({
    callback = console.log,
    title = "Prompt Number",
    icon = "hashtag",
    itemProps,
    ...modalProps
  }: DialogActionProps<Modals.PromptModalProps>) => {
    itemProps = { title, icon, ...itemProps }
    return <Action {...itemProps} onClick={() => editor.promptForNumber(modalProps).then(callback)} />
  },
  choose: ({
    callback = console.log,
    title = "Choose",
    icon = "list",
    itemProps,
    ...modalProps
  }: DialogActionProps<Modals.ChooserModalProps>) => {
    itemProps = { title, icon, ...itemProps }
    return <Action {...itemProps} onClick={() => editor.choose(modalProps).then(callback)} />
  },
  ////////////////
  // ## groups of actions
  ////////////////
  /**
   * Ready-made project dropdown items.  Declared `undefined` here and assigned below --
   * can't build the array inline because it references `Actions` entries defined above it in
   * this same object literal, but not yet assigned to `Actions` while the literal is being built.
   */
  PROJECT_DROPDOWN_ACTIONS: undefined as ReactElement[] | undefined,
  /** Ready-made file dropdown items.  See `PROJECT_DROPDOWN_ACTIONS` for why this is assigned below. */
  FILE_DROPDOWN_ACTIONS: undefined as ReactElement[] | undefined
}

/** Props for `<Action>` -- everything but `title`/`button` is forwarded to the underlying SUI component. */
export type ActionProps = {
  /** Item title -- rendered as SUI `content`. */
  title?: ReactNode
  /** If `true` render a SUI `Button`, otherwise a `Menu.Item`. */
  button?: boolean
} & Record<string, unknown>

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
  /** Called with dialog's resolved value once closed.  Defaults to `console.log`. */
  callback?: (value: unknown) => void
  /** Menu item / button title. */
  title?: string
  /** Menu item / button icon. */
  icon?: string
  /** Extra props passed to underlying `<Action>` item -- `title`/`icon` above merge into this. */
  itemProps?: Record<string, unknown>
}
