import { Match, Show, Switch, omit } from "solid-js"
import type { JSX } from "@solidjs/web"

import type { UIButtonAttributes } from "spell-ui/jsx"
import { SPACES } from "spell-app/spaces"
import { editor, runtimeConsole } from "spell-app/app/editor"
import { appTexts } from "spell-app/app/ui/AppTexts"
import type * as Modals from "spell-app/app/solid/modals"
import { tracked } from "spell-app/app/solid"
import { isStaticBuild } from "spell-app/app/static/staticBuild"

/****************
 * ### `<Action>`
 * One action as a menu item (`<ui-item link>`, the default) or a button (`<ui-button>`, with `button`).
 * - `title` is the text, `icon` an icon name (Fomantic's, see `loadUI.ts`).
 * - `iconOnly`:  just its icon, a plain `<ui-icon link>`, with `title` as its tooltip, below it, after a pause
 *   (`[data-tooltip]`, Spell UI's CSS-only tooltip;  the pause is the editor's, `chrome.css`).
 *   - A `<ui-icon>`, not an item:  an item's box is `display: contents`, which draws no tooltip.
 * - `active` highlights it:  the item's `selected`, the button's `active`, the icon's `color`.
 * - Everything else goes to the element as is:  `onClick`, `color`, `disabled`, `value`, `class` ...
 * - Inside a `<MoreMenu>` (a `<ui-dropdown>`) the item is DATA:
 *   the dropdown draws it from its attributes and text (`icon` included).
 *   Keep `title` TEXT:  an item with element children is a "rich" option.
 * - Reactivity is the caller's:  pass values read from `tracked()` accessors (see `Actions`).
 * - SEE:  its App UI components page, `app/docs/Actions.html` (`/components/app/Actions.html`).
 ****************/
export function Action(props: ActionProps) {
  const rest = omit(props, "title", "button", "iconOnly", "icon", "active")
  return (
    <Switch
      fallback={
        <ui-item link="" icon={props.icon} selected={props.active} {...rest}>
          {props.title}
        </ui-item>
      }
    >
      <Match when={props.iconOnly}>
        <ui-icon
          link=""
          name={props.icon}
          label={tipFor(props.title)}
          data-tooltip={tipFor(props.title)}
          data-position="bottom center"
          data-inverted=""
          {...omit(rest, "class", "color")}
          class={["IconAction", props.class, { active: !!props.active }]}
          color={props.active ? props.color : undefined}
        />
      </Match>
      <Match when={props.button}>
        <ui-button icon={props.icon} active={props.active} {...rest}>
          {props.title}
        </ui-button>
      </Match>
    </Switch>
  )
}

/** An icon-only action's tooltip and label:  its `title`, when that's text. */
function tipFor(title: JSX.Element): string | undefined {
  return typeof title === "string" ? title : undefined
}

/** Props for `<Action>`:  the ones below, plus any attribute or handler of `<ui-item>` / `<ui-button>`. */
export type ActionProps = {
  /** Text.  Text only inside a `<MoreMenu>`. */
  title?: JSX.Element
  /** Icon name. */
  icon?: string
  /** A `<ui-button>` instead of a menu `<ui-item>`. */
  button?: boolean
  /** Just its icon, `title` its tooltip:  a `<ui-icon link>` instead of a menu `<ui-item>`. */
  iconOnly?: boolean
  /** Highlighted:  the item's `selected`, the button's `active`. */
  active?: boolean
  /** Hue:  of the item or icon while `active`;  of the button always. */
  color?: UIButtonAttributes["color"]
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
  showHelp: (props: ActionProps) => (
    <Action title={appTexts.text("help")} icon="help circle" onClick={() => editor.showHelp()} {...props} />
  ),
  /** The person, as their avatar:  a round picture, their name's first letter, the "You" panel on a click. */
  you: () => (
    <button
      type="button"
      class="YouAvatar"
      aria-label={appTexts.text("you")}
      data-tooltip={appTexts.text("you")}
      data-position="bottom right"
      data-inverted=""
      onClick={() => editor.showYou()}
    >
      <ui-avatar src={avatarFor(SPACES.LOCAL_PERSON)} />
    </button>
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
  restartApp: (props: ActionProps) => (
    <Action title={appTexts.text("restart")} icon="redo" onClick={() => editor.restartApp()} {...props} />
  ),
  /** The static build's "Reset Example":  forget the visitor's edits (`editor.resetApp()`);  only there. */
  resetApp: (props: ActionProps) => {
    const groupWords = trackGroupWords()
    return (
      <Show when={isStaticBuild}>
        <Action
          title={appTexts.text("resetApp", groupWords())}
          icon="undo"
          class="resetApp"
          onClick={() => void editor.resetApp()}
          {...props}
        />
      </Show>
    )
  },

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
    <Action title={appTexts.text("newFile")} icon="file circle plus" onClick={() => editor.createFile()} {...props} />
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
        icon="arrow rotate left"
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

/**
 * The actions the static build (the public preview, `isStaticBuild`) leaves out:  each draws nothing there.
 * - what needs a server:  making, copying, renaming and deleting projects and files, their settings, the You panel
 * - what does nothing yet:  Help
 * - the console's test buttons (the dialogs)
 * - The groups too, so a dropdown of them is empty:  `<FileDropdown>` leaves out its divider, and the "..." menus
 *   are hidden by the static build's CSS (`static.css`).
 */
const HIDDEN_IN_STATIC_BUILD = [
  "showHelp",
  "you",
  "showProjectSettings",
  "appSettings",
  "createApp",
  "duplicateApp",
  "renameApp",
  "deleteApp",
  "createProject",
  "createExample",
  "createGuide",
  "createFile",
  "duplicateFile",
  "renameFile",
  "deleteFile",
  "alert",
  "confirm",
  "prompt",
  "promptForNumber",
  "choose",
  "PROJECT_DROPDOWN_ACTIONS",
  "FILE_DROPDOWN_ACTIONS"
] as const satisfies ReadonlyArray<keyof typeof Actions>

if (isStaticBuild) for (const name of HIDDEN_IN_STATIC_BUILD) Object.assign(Actions, { [name]: () => null })

/**
 * A stand-in avatar for person `name`:  their first letter, white on Spell's violet, as an SVG `data:` URL.
 * - Until people have pictures of their own.
 */
function avatarFor(name: string): string {
  const letter = name.charAt(0).toUpperCase()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#6d3fd9"/><text x="16" y="21.5" font-family="Lato,Arial,sans-serif" font-size="16" font-weight="700" fill="#fff" text-anchor="middle">${letter}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
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
