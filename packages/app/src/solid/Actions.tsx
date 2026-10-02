import { Show, createContext, omit, useContext } from "solid-js"
import type { JSX } from "@solidjs/web"

import { editor, runtimeConsole } from "$/app/editor"
import type * as Modals from "$/app/solid/modals"
import { tracked } from "$/app/solid"

/****************
 * ### `<Action>`
 * One action as a menu item (`<ui-item link>`, the default) or a button (`<ui-button>`, with `button`).
 * - `title` is the text, `icon` an icon name (Fomantic's, see `loadUI.ts`), `active` highlights it:  the item's
 *   `selected`, the button's `active`.
 * - Everything else goes to the element as is:  `onClick`, `color`, `disabled`, `value`, `class` ...
 * - Inside a `<MoreMenu>` (a `<ui-dropdown>`, which provides `InDropdown`), the item is DATA:  the dropdown draws
 *   it from its attributes and text (`icon` included).  Keep `title` TEXT there:  an item with element children is
 *   a "rich" option.
 * - HACK: in a menu, the icon is a slotted `<ui-icon>`, not the item's `icon` attribute:  `<ui-menu>` draws the
 *   attribute's glyph at 0 x 0 (`SUSPECTED-BUGS.md`, "ui").  TODO: back to `icon` once that's fixed.
 * - Reactivity is the caller's:  pass values read from `tracked()` accessors (see `Actions`).
 ****************/
export function Action(props: ActionProps) {
  const inDropdown = useContext(InDropdown)
  const rest = omit(props, "title", "button", "icon", "active")
  return (
    <Show
      when={props.button}
      fallback={
        <ui-item link="" icon={inDropdown ? props.icon : undefined} selected={props.active} {...rest}>
          <Show when={!inDropdown && props.icon}>
            <ui-icon name={props.icon} />
          </Show>
          {props.title}
        </ui-item>
      }
    >
      <ui-button icon={props.icon} active={props.active} {...rest}>
        {props.title}
      </ui-button>
    </Show>
  )
}

/**
 * Are `<Action>`s here items of a dropdown (`<MoreMenu>`)?  The context IS the provider:
 * `<InDropdown value={true}>...</InDropdown>`.  Default:  `false`, a menu.
 */
export const InDropdown = createContext(false)

/** Props for `<Action>`:  the ones below, plus any attribute or handler of `<ui-item>` / `<ui-button>`. */
export type ActionProps = {
  /** Text.  Text only inside a `<MoreMenu>`. */
  title?: JSX.Element
  /** Icon name. */
  icon?: string
  /** A `<ui-button>` instead of a menu `<ui-item>`. */
  button?: boolean
  /** Highlighted:  the item's `selected`, the button's `active`. */
  active?: boolean
  /** Hue:  of the item while `active`;  of the button always. */
  color?: string
  /** Can't be used. */
  disabled?: boolean
  /** Class of the element. */
  class?: string
  /** Value a `<MoreMenu>` picks the item by;  defaults to the text. */
  value?: string
  /** Run the action. */
  onClick?: (event: MouseEvent) => void
} & Record<string, unknown>

/**
 * The app's public actions, each a Solid component around `<Action>`:  `<Actions.saveFile />`, or
 * `<Actions.saveFile button />`.  Same names and behaviour as React's `UI.Actions` had.
 * - Props given at the call site win over the entry's own (`title`, `icon`, `onClick` ...).
 * - An entry whose look depends on `editor` reads it through `tracked()`, in its own body, and reads the accessor
 *   in JSX:  a plain `editor.x` read in JSX is NOT reactive (`editor` is `easy-state`, not Solid).
 * - Entries that only touch `editor` in `onClick` read nothing:  that runs after render.
 * - NOTE: `PROJECT_DROPDOWN_ACTIONS` / `FILE_DROPDOWN_ACTIONS` are COMPONENTS here (React's are element arrays):
 *   Solid JSX makes DOM nodes at once, and one node can only be in one place.
 */
export const Actions = {
  ////////////////
  // ## Navigation
  ////////////////

  aboutSpell: (props: ActionProps) => (
    <Action title="About Spell" icon="wizard" onClick={() => editor.aboutSpell()} {...props} />
  ),
  showEditor: (props: ActionProps) => {
    const appType = trackAppType()
    return <Action title={`Edit ${appType()}`} icon="edit outline" onClick={() => editor.showEditor()} {...props} />
  },
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

  createApp: (props: ActionProps) => {
    const appType = trackAppType()
    return <Action title={`Create ${appType()}`} icon="pencil" onClick={() => editor.createApp()} {...props} />
  },
  duplicateApp: (props: ActionProps) => {
    const appType = trackAppType()
    return (
      <Action title={`Duplicate ${appType()}`} icon="clone outline" onClick={() => editor.duplicateApp()} {...props} />
    )
  },
  renameApp: (props: ActionProps) => {
    const appType = trackAppType()
    return <Action title={`Rename ${appType()}`} icon="edit outline" onClick={() => editor.renameApp()} {...props} />
  },
  deleteApp: (props: ActionProps) => {
    const appType = trackAppType()
    return (
      <Action
        title={`Delete ${appType()}`}
        icon="trash alternate outline"
        onClick={() => editor.deleteApp()}
        {...props}
      />
    )
  },
  appSettings: (props: ActionProps) => (
    <Action title="Settings" icon="setting" onClick={() => editor.showProjectSettings()} {...props} />
  ),
  compileApp: (props: ActionProps) => {
    const needsCompiling = tracked(() => {
      const { file } = editor
      // `compiled` only exists on `SpellFile` / `SpellCSSFile`, not `SpellJSFile`
      const isCompiled = !!file && "compiled" in file && !!file.compiled
      return !!file?.isLoaded && !isCompiled
    })
    return (
      <Action
        title="Compile"
        active={needsCompiling()}
        color="blue"
        icon="paper plane"
        class="no-border"
        onClick={() => editor.compileApp()}
        {...props}
      />
    )
  },
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
  // ## File actions -- work on `editor.file`
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
  saveFile: (props: ActionProps) => {
    const fileIsDirty = tracked(() => !!editor.file?.isDirty)
    return (
      <Action
        title="Save"
        active={fileIsDirty()}
        color="green"
        icon="cloud upload"
        onClick={() => editor.saveFile()}
        {...props}
      />
    )
  },
  reloadFile: (props: ActionProps) => {
    const fileIsDirty = tracked(() => !!editor.file?.isDirty)
    return (
      <Action
        title="Reload"
        active={fileIsDirty()}
        color="red"
        icon="cloud download"
        onClick={() => editor.reloadFile()}
        {...props}
      />
    )
  },

  ////////////////
  // ## Console
  ////////////////

  clearConsole: (props: ActionProps) => {
    const consoleIsEmpty = tracked(() => !runtimeConsole()?.lines.length)
    return (
      <Action
        title="Clear Console"
        disabled={consoleIsEmpty()}
        icon="ban"
        onClick={() => runtimeConsole()?.clear()}
        {...props}
      />
    )
  },

  ////////////////
  // ## MatchViewer
  ////////////////

  toggleMatchRuleNames: (props: ActionProps) => {
    const showNames = tracked(() => editor.showingMatchRuleNames)
    return (
      <Action
        icon={showNames() ? "eye" : "eye slash outline"}
        title={(showNames() ? "Show" : "Hide") + " Rule Names"}
        onClick={() => editor.toggleMatchRuleNames()}
        {...props}
      />
    )
  },

  ////////////////
  // ## Modals
  // - `title`, `icon`, `itemProps` go to the item.
  // - `callback` gets the dialog's value (`console.log` by default).
  // - every other prop goes to the dialog.
  ////////////////

  alert: (props: DialogActionProps<Modals.AlertModalProps>) => (
    <DialogAction props={props} title="Alert" icon="warning sign" show={(modal) => editor.alert(modal)} />
  ),
  confirm: (props: DialogActionProps<Modals.ConfirmModalProps>) => (
    <DialogAction props={props} title="Confirm" icon="question circle" show={(modal) => editor.confirm(modal)} />
  ),
  prompt: (props: DialogActionProps<Modals.PromptModalProps>) => (
    <DialogAction props={props} title="Prompt" icon="edit" show={(modal) => editor.prompt(modal)} />
  ),
  promptForNumber: (props: DialogActionProps<Modals.PromptModalProps>) => (
    <DialogAction props={props} title="Prompt Number" icon="hashtag" show={(modal) => editor.promptForNumber(modal)} />
  ),
  choose: (props: DialogActionProps<Modals.ChooserModalProps>) => (
    <DialogAction props={props} title="Choose" icon="list" show={(modal) => editor.choose(modal)} />
  ),

  ////////////////
  // ## Groups of actions
  ////////////////

  /** Project dropdown items:  create, duplicate, rename, delete the app. */
  PROJECT_DROPDOWN_ACTIONS: (): JSX.Element => (
    <>
      <Actions.createApp />
      <Actions.duplicateApp />
      <Actions.renameApp />
      <Actions.deleteApp />
    </>
  ),
  /** File dropdown items:  create, duplicate, rename, delete the file. */
  FILE_DROPDOWN_ACTIONS: (): JSX.Element => (
    <>
      <Actions.createFile />
      <Actions.duplicateFile />
      <Actions.renameFile />
      <Actions.deleteFile />
    </>
  )
}

/** Props shared by the dialog actions (`alert`, `confirm`, `prompt`, `promptForNumber`, `choose`). */
export type DialogActionProps<P> = P & {
  /** Called with the dialog's value once closed.  Default:  `console.log`. */
  callback?: (value: unknown) => void
  /** Item / button title. */
  title?: string
  /** Item / button icon. */
  icon?: string
  /** More props for the `<Action>`;  `title` / `icon` here win over the ones above. */
  itemProps?: ActionProps
}

/**
 * `editor.appType` as an accessor, for the app actions' titles.
 * - Call in a component body:  `tracked()` disposes with the component.
 */
function trackAppType() {
  return tracked(() => editor.appType)
}

/****************
 * ### `<DialogAction>`
 * An `<Action>` that shows a dialog through `show()` and hands its value to `callback`.
 * - The dialog's props are read at CLICK time:  every prop but `callback` / `title` / `icon` / `itemProps`.
 ****************/
function DialogAction<P>(props: {
  /** Props given to the `Actions` entry. */
  props: DialogActionProps<P>
  /** Default title. */
  title: string
  /** Default icon. */
  icon: string
  /** Show the dialog;  resolves its value. */
  show: (modal: P) => Promise<unknown>
}) {
  return (
    <Action
      title={props.props.title ?? props.title}
      icon={props.props.icon ?? props.icon}
      {...(props.props.itemProps ?? {})}
      onClick={open}
    />
  )

  /** Show the dialog, then call `callback` with its value. */
  function open() {
    const modal: Record<string, unknown> = { ...props.props }
    for (const key of DIALOG_ACTION_KEYS) delete modal[key]
    void props.show(modal as P).then(props.props.callback ?? console.log)
  }
}

/** Keys of `DialogActionProps` that are the item's, not the dialog's. */
const DIALOG_ACTION_KEYS = ["callback", "title", "icon", "itemProps"] as const
