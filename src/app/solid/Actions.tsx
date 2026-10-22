import { Show, omit } from "solid-js"
import type { JSX } from "@solidjs/web"

import { editor, runtimeConsole } from "spell-app/app/editor"
import { appTexts } from "spell-app/app/ui/AppTexts"
import type * as Modals from "spell-app/app/solid/modals"
import { tracked } from "spell-app/app/solid"

/****************
 * ### `<Action>`
 * One action as a menu item (`<ui-item link>`, the default) or a button (`<ui-button>`, with `button`).
 * - `title` is the text, `icon` an icon name (Fomantic's, see `loadUI.ts`).
 * - `active` highlights it:  the item's `selected`, the button's `active`.
 * - Everything else goes to the element as is:  `onClick`, `color`, `disabled`, `value`, `class` ...
 * - Inside a `<MoreMenu>` (a `<ui-dropdown>`) the item is DATA:
 *   the dropdown draws it from its attributes and text (`icon` included).
 *   Keep `title` TEXT:  an item with element children is a "rich" option.
 * - Reactivity is the caller's:  pass values read from `tracked()` accessors (see `Actions`).
 * - SEE:  its App UI components page, `app/docs/Actions.html` (`/components/app/Actions.html`).
 ****************/
export function Action(props: ActionProps) {
  const rest = omit(props, "title", "button", "icon", "active")
  return (
    <Show
      when={props.button}
      fallback={
        <ui-item link="" icon={props.icon} selected={props.active} {...rest}>
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
 * The app's public actions, each a Solid component around `<Action>`:
 * `<Actions.saveFile />`, or `<Actions.saveFile button />`.
 * - Props given at the call site win over the entry's own (`title`, `icon`, `onClick` ...).
 * - An entry whose look depends on `editor` reads it through `tracked()`, in its own body,
 *   and reads the accessor in JSX.
 *   (A plain `editor.x` read in JSX is reactive too, through the cells bridge:  `tracked()` names it.)
 * - Entries that only touch `editor` in `onClick` read nothing:  that runs after render.
 * - NOTE: `PROJECT_DROPDOWN_ACTIONS` / `FILE_DROPDOWN_ACTIONS` are COMPONENTS, not element arrays:
 *   Solid JSX makes DOM nodes at once, and one node can only be in one place.
 * - Same names and behaviour as the React app's `UI.Actions` had (its groups were element arrays).
 */
export const Actions = {
  ////////////////
  // ## Navigation
  ////////////////

  aboutSpell: (props: ActionProps) => (
    <Action title={appTexts.text("aboutSpell")} icon="wizard" onClick={() => editor.aboutSpell()} {...props} />
  ),
  showEditor: (props: ActionProps) => {
    const groupWords = trackGroupWords()
    return (
      <Action
        title={appTexts.text("editApp", groupWords())}
        icon="edit outline"
        onClick={() => editor.showEditor()}
        {...props}
      />
    )
  },
  showRunner: (props: ActionProps) => (
    <Action title={appTexts.text("preview")} icon="hand point up" onClick={() => editor.showRunner()} {...props} />
  ),
  showProjectSettings: (props: ActionProps) => (
    <Action title={appTexts.text("settings")} icon="setting" onClick={() => editor.showProjectSettings()} {...props} />
  ),
  showProjectChooser: (props: ActionProps) => (
    <Action
      title={appTexts.text("openOrCreate")}
      icon="app store ios"
      onClick={() => editor.showProjectChooser()}
      {...props}
    />
  ),
  showDocs: (props: ActionProps) => (
    <Action title={appTexts.text("docs")} icon="newspaper outline" onClick={() => editor.showDocs()} {...props} />
  ),
  showHelp: (props: ActionProps) => (
    <Action title={appTexts.text("help")} icon="help circle" onClick={() => editor.showHelp()} {...props} />
  ),
  you: (props: ActionProps) => (
    <Action title={appTexts.text("you")} icon="user outline" onClick={() => editor.showYou()} {...props} />
  ),

  ////////////////
  // ## App actions -- work on `editor.project`, create according to `editor.projectRoot`
  ////////////////

  createApp: (props: ActionProps) => {
    const groupWords = trackGroupWords()
    return (
      <Action
        title={appTexts.text("createApp", groupWords())}
        icon="pencil"
        onClick={() => editor.createApp()}
        {...props}
      />
    )
  },
  duplicateApp: (props: ActionProps) => {
    const groupWords = trackGroupWords()
    return (
      <Action
        title={appTexts.text("duplicateApp", groupWords())}
        icon="clone outline"
        onClick={() => editor.duplicateApp()}
        {...props}
      />
    )
  },
  renameApp: (props: ActionProps) => {
    const groupWords = trackGroupWords()
    return (
      <Action
        title={appTexts.text("renameApp", groupWords())}
        icon="edit outline"
        onClick={() => editor.renameApp()}
        {...props}
      />
    )
  },
  deleteApp: (props: ActionProps) => {
    const groupWords = trackGroupWords()
    return (
      <Action
        title={appTexts.text("deleteApp", groupWords())}
        icon="trash alternate outline"
        onClick={() => editor.deleteApp()}
        {...props}
      />
    )
  },
  appSettings: (props: ActionProps) => (
    <Action title={appTexts.text("settings")} icon="setting" onClick={() => editor.showProjectSettings()} {...props} />
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
        title={appTexts.text("compile")}
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
    <Action title={appTexts.text("publish")} icon="world" onClick={() => editor.publishApp()} {...props} />
  ),
  restartApp: (props: ActionProps) => (
    <Action title={appTexts.text("restart")} icon="redo" onClick={() => editor.restartApp()} {...props} />
  ),

  ////////////////
  // ## Project actions
  ////////////////

  createProject: (props: ActionProps) => (
    <Action title={appTexts.text("newProject")} icon="pencil" onClick={() => editor.createProject()} {...props} />
  ),

  ////////////////
  // ## Examples actions
  ////////////////

  createExample: (props: ActionProps) => (
    <Action title={appTexts.text("newExample")} icon="pencil" onClick={() => editor.createExample()} {...props} />
  ),

  ////////////////
  // ## Guides actions
  ////////////////

  createGuide: (props: ActionProps) => (
    <Action title={appTexts.text("newGuide")} icon="pencil" onClick={() => editor.createGuide()} {...props} />
  ),

  ////////////////
  // ## File actions -- work on `editor.file`
  ////////////////

  createFile: (props: ActionProps) => (
    <Action title={appTexts.text("newFile")} icon="pencil" onClick={() => editor.createFile()} {...props} />
  ),
  createPropertyEditor: (props: ActionProps) => (
    <Action
      title={appTexts.text("newPropertyEditor")}
      icon="sliders horizontal"
      onClick={() => editor.createPropertyEditor()}
      {...props}
    />
  ),
  duplicateFile: (props: ActionProps) => (
    <Action
      title={appTexts.text("duplicateFile")}
      icon="clone outline"
      onClick={() => editor.duplicateFile()}
      {...props}
    />
  ),
  renameFile: (props: ActionProps) => (
    <Action title={appTexts.text("renameFile")} icon="edit outline" onClick={() => editor.renameFile()} {...props} />
  ),
  deleteFile: (props: ActionProps) => (
    <Action
      title={appTexts.text("deleteFile")}
      icon="trash alternate outline"
      onClick={() => editor.deleteFile()}
      {...props}
    />
  ),
  saveFile: (props: ActionProps) => {
    const fileIsDirty = tracked(() => !!editor.file?.isDirty)
    return (
      <Action
        title={appTexts.text("save")}
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
        title={appTexts.text("reload")}
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
        title={appTexts.text("clearConsole")}
        disabled={consoleIsEmpty()}
        icon="ban"
        onClick={() => runtimeConsole()?.clear()}
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
    <DialogAction
      props={props}
      title={appTexts.text("alert")}
      icon="warning sign"
      show={(modal) => editor.alert(modal)}
    />
  ),
  confirm: (props: DialogActionProps<Modals.ConfirmModalProps>) => (
    <DialogAction
      props={props}
      title={appTexts.text("confirm")}
      icon="question circle"
      show={(modal) => editor.confirm(modal)}
    />
  ),
  prompt: (props: DialogActionProps<Modals.PromptModalProps>) => (
    <DialogAction props={props} title={appTexts.text("prompt")} icon="edit" show={(modal) => editor.prompt(modal)} />
  ),
  promptForNumber: (props: DialogActionProps<Modals.PromptModalProps>) => (
    <DialogAction
      props={props}
      title={appTexts.text("promptNumber")}
      icon="hashtag"
      show={(modal) => editor.promptForNumber(modal)}
    />
  ),
  choose: (props: DialogActionProps<Modals.ChooserModalProps>) => (
    <DialogAction props={props} title={appTexts.text("choose")} icon="list" show={(modal) => editor.choose(modal)} />
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
  /** File dropdown items:  create a file or a property editor page, duplicate, rename, delete the file. */
  FILE_DROPDOWN_ACTIONS: (): JSX.Element => (
    <>
      <Actions.createFile />
      <Actions.createPropertyEditor />
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
 * The words of `editor.projectRoot`'s group (`Example`, `ejemplo` ...) as an accessor, for the app actions' titles.
 * - Call in a component body:  `tracked()` disposes with the component.
 */
function trackGroupWords() {
  return tracked(() => appTexts.groupWords(editor.projectRoot))
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
