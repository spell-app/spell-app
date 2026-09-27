import type { ComponentType } from "react"
import type * as CodeMirror from "codemirror"
import type { createRoot } from "react-dom/client"
import { navigate } from "@reach/router"

import { UIError, createStore, setPrefKey, getPref, setPref, CONFIRM } from "~/util"

import { P } from "~/parser"
import { spellCore } from "~/spellCore"
import { SP } from "~/languages/spell"
import type * as UIT from "~/app/ui/ui.types"
// NOTE: import `Modals` directly rather than through `UI` barrel to avoid circular import.
import * as Modals from "~/app/ui/modals"

////////////////
// ## The editor
////////////////

setPrefKey("spellEditor:")
/**
 * Initial contents of the `editor` singleton.
 * - NOTE: `EditorStore` is derived from this with `typeof`,
 *   so the docstrings below serve BOTH the constant and the type.
 * - NOTE: methods reach the reactive proxy via `editor.x`, NEVER `this` -- see `showModal()`.
 * - MUST annotate any property whose initializer is narrower than its real type
 *   (e.g. `undefined as Foo | undefined`), or `typeof` will infer the narrow one.
 */
const EDITOR_DEFAULTS = {
  ////////////////
  // ## Project and project actions
  ////////////////

  /**
   * `SP.SpellProjectRoot` shown in `SpellEditor`.
   * Update with `editor.showEditor()
   */
  projectRoot: undefined as SP.SpellProjectRoot | undefined,
  /** Get/save last viewed `projectPath` for `projectRootPath`. */
  lastProjectForRoot,
  /** Human-readable type of current `projectRoot`, e.g. `"Example"` -- falls back to `"Project"` if none selected. */
  get appType(): string {
    return editor.projectRoot?.Type || "Project"
  },

  /**
   * Current `SP.SpellProject` shown in `SpellEditor`.
   * Update with `editor.showEditor()`
   */
  project: undefined as SP.SpellProject | undefined,
  /** Get/save last viewed full `filePath` for `projectPath`. */
  lastFileForProject,

  /**
   * `SpellFile` etc shown in `SpellEditor`.
   * Update with `editor.showEditor()`
   */
  file: undefined as EditorFile | undefined,
  /** Get/save last `selection` for `filePath`.  */
  lastSelectionForFile,

  /** Show the project / example / guide chooser page. */
  showProjectChooser(): Promise<void> {
    return navigate("/")
  },

  /** Show `<SpellEditor>` for a `path` by updating the URL, which will eventually call `selectPath` */
  showEditor(path?: string, selection?: UIT.EditorSelection): void {
    if (!path) path = editor.file?.path
    // TODO: selection!!!!
    try {
      void navigate(new SP.SpellLocation(path!).editorUrl)
      void editor.compileApp()
    } catch {
      editor.showError(`Path '${path}' is invalid!`)
    }
  },

  /** Show `<SpellRunner>` for a `path` by updating the URL, which will eventually call `selectPath` */
  async showRunner(path?: string): Promise<void> {
    if (!path) path = editor.file?.path
    try {
      await navigate(new SP.SpellLocation(path!).runnerUrl)
      void editor.compileApp()
    } catch {
      editor.showError(`Path '${path}' is invalid!`)
    }
  },

  // TODO: these are referenced by `~/app/ui/Actions` but not yet implemented.
  /** Show settings for the current `project`. TODO: not yet implemented. */
  showProjectSettings(): void {
    console.warn("TODO: editor.showProjectSettings() not yet implemented")
  },
  /** Show the "About Spell" dialog. TODO: not yet implemented. */
  aboutSpell(): void {
    console.warn("TODO: editor.aboutSpell() not yet implemented")
  },
  /** Show documentation. TODO: not yet implemented. */
  showDocs(): void {
    console.warn("TODO: editor.showDocs() not yet implemented")
  },
  /** Show help. TODO: not yet implemented. */
  showHelp(): void {
    console.warn("TODO: editor.showHelp() not yet implemented")
  },
  /** Log the user in. TODO: not yet implemented. */
  logIn(): void {
    console.warn("TODO: editor.logIn() not yet implemented")
  },
  /** Publish the current `project`. TODO: not yet implemented. */
  publishApp(): void {
    console.warn("TODO: editor.publishApp() not yet implemented")
  },

  /**
   * Last project page we were showing: "editor" or "runner".
   * Set by `<SpellEditor>` or `<SpellRunner>`
   */
  projectPage: "editor" as "editor" | "runner",

  /**
   * Select a `path` to show in the `<SpellEditor/>` or `<SpellRunner>`.
   * Pass `selection` as `{ line, ch }` to set the cursor in the file.
   */
  async selectPath(path: string, selection?: UIT.EditorSelection): Promise<void> {
    let location: SP.SpellLocation
    try {
      location = new SP.SpellLocation(path)
    } catch {
      console.warn(`editor.selectPath('${path}'): invalid path`)
      // default to user projects if `new SP.SpellLocation()` throws
      location = new SP.SpellLocation("@user:projects")
    }
    console.info("editor.selectPath", { path, location })

    const projectRoot = new SP.SpellProjectRoot(location.projectRoot)
    const sameRoot = editor.projectRoot === projectRoot
    if (!sameRoot) {
      console.info("selecting projectRoot", projectRoot)
      await projectRoot.load(undefined)
      editor.projectRoot = projectRoot
    }
    const projectPaths = projectRoot.projectPaths

    // Figure out which project to show, using pref if not specified in `path`
    let projectPath =
      location.isProjectPath || location.isFilePath //
        ? location.projectPath
        : editor.lastProjectForRoot(location.projectRoot)
    if (!projectPath || !projectPaths.includes(projectPath)) projectPath = projectPaths[0]
    // TODO: what if no project???
    const project = new SP.SpellProject(projectPath)
    // DEBUG: access globally as `window.project`
    window.project = project
    const sameProject = editor.project === project
    if (!sameProject) {
      console.info("selecting project", project)
      // stop current compilation
      editor.clearCompileAppSoon()
      // remember this project was selected for projectRoot
      editor.lastProjectForRoot(location.projectRoot, projectPath)
      await project.load(undefined)
      // Clear application display when switching projects
      const oldProjectRoot = document.getElementById(spellCore.REACT_APP_ROOT_ID) as
        | (HTMLElement & { REACT_ROOT?: ReturnType<typeof createRoot> })
        | null
      if (typeof oldProjectRoot?.REACT_ROOT?.unmount === "function") {
        oldProjectRoot.REACT_ROOT.unmount()
      }
    }

    // Figure out which file to show, using pref if not specified in `path`
    let filePath = location.isFilePath //
      ? location.filePath
      : editor.lastFileForProject(project.path)
    if (!filePath || !project.getFile(filePath)) {
      filePath = project.activeImports[0]?.path || project.files[0]?.path || ""
    }
    // TODO: what if no file???

    const file: EditorFile | undefined = project.getFile(filePath)
    if (!file) throw new Error(`editor.selectPath('${path}'): no file found for '${filePath}'.`)
    // if we landed on something else other than the original path, navigate to it
    if (path !== file.path) {
      // console.warn({ path, file: file.path })
      const url = file.location[editor.projectPage === "editor" ? "editorUrl" : "runnerUrl"]
      return navigate(url, { replace: true })
    }

    const sameFile = editor.file === file
    if (!sameFile) {
      console.info("selecting file", file)
      editor.lastFileForProject(project.path, file.path)
      // restore file selection -- we'll use this below as a flag to reselect
      file.initialSelection = editor.lastSelectionForFile(file.path)
    }
    // if we were passed a `selection` and path matches full path passed in, select it
    if (selection && path === file.path) file.initialSelection = selection

    // Set project and file together, else <FileDropdown> will blow up.  :-(
    editor.project = project
    editor.file = file
    await file.load(undefined)
    // If we switched projects, recompile
    if (!sameProject) void editor.compileApp()
  },

  /**
   * Given a `match`, attempt to show it and put the cursor in the right spot.
   * This may not be accurate if text has changed since
   */
  async showMatch(match: P.Match): Promise<void> {
    const path = match.getScopeOfType(P.FileScope)?.path
    if (!path) return
    const selection: UIT.EditorSelection = {
      anchor: { line: match.line ?? 0, ch: match.char ?? 0 },
      head: { line: match.line ?? 0, ch: (match.char ?? 0) + match.inputText.length },
      // TODO: scroll!!!?!?!?!
      scroll: { event: "cursor", percent: 0, max: 0, current: 0, total: 0, visible: 0 }
    }
    // TODO: showEditor...
    await editor.selectPath(path, selection)
    // TODO....???
    editor.onInputEffect()
  },

  /**
   * Create an app for the specified `projectRoot`.
   * `projectId` is optional, if you don't specify we'll ask the user for one.
   */
  async createApp(projectRoot?: SP.SpellProjectRoot, projectId?: string): Promise<void> {
    // NOTE: defaulted here, NOT in the signature -- a default referencing `editor` would make
    // `typeof EDITOR_DEFAULTS` circular, since defaults are part of the member's type.
    projectRoot ??= editor.projectRoot!
    try {
      const project = await projectRoot.createApp(projectId)
      if (project) {
        editor.showEditor(project.path)
        editor.showNotice(`Created ${project.type} ${project.projectName}.`)
      }
    } catch (e) {
      editor.showError(e)
    }
  },

  /** Duplicate current `project` under `newProjectId` (auto-generated if omitted) and show it. */
  async duplicateApp(newProjectId?: string): Promise<void> {
    try {
      const newProject = await editor.projectRoot!.duplicateApp(editor.project!.projectId, newProjectId)
      // console.warn({ newProject })
      if (newProject) {
        editor.showEditor(newProject.path)
        editor.showNotice(`${newProject.Type} duplicated.`)
      }
    } catch (e) {
      editor.showError(e)
    }
  },
  /** Rename current `project` to `newProjectId` and show it. */
  async renameApp(newProjectId?: string): Promise<void> {
    try {
      const project = await editor.projectRoot!.renameApp(editor.project!.projectId, newProjectId)
      if (project) {
        editor.showEditor(project.path)
        editor.showNotice(`${project.Type} renamed.`)
      }
    } catch (e) {
      editor.showError(e)
    }
  },
  /** Delete current `project` (after `CONFIRM`), then navigate to `projectRoot`, which selects another project. */
  async deleteApp(): Promise<void> {
    try {
      const { projectRoot, project } = editor
      const removed = await projectRoot!.deleteApp(project!.projectId, CONFIRM)
      if (removed) {
        // Navigate to nextProject, or the projectRoot, which will select another project
        editor.showEditor(projectRoot!.path)
        editor.showNotice(`${projectRoot!.Type} removed.`)
      }
    } catch (e) {
      editor.showError(e)
    }
  },

  /**
   * Compile current `project` and, if compilation produced output, execute it.
   * - SIDE EFFECT: clears `spellCore.console` and cancels any pending `compileAppSoon()` timer first.
   */
  async compileApp(): Promise<void> {
    const { project, file } = editor
    if (!project || !file) return

    spellCore.console.clear()
    try {
      spellCore.console.group("Compiling", project)

      editor.clearCompileAppSoon()
      await project.compile()
      const { compiled } = project

      if (compiled) {
        spellCore.console.groupCollapsed("Compiled to javascript:")
        const lines = compiled
          .replace(/\t/g, "   ")
          .split("\n")
          .map((line, lineNum) => `${lineNum}`.padStart(4, " ") + `  ${line}`)
          .join("\n")
        spellCore.console.log(lines)
        spellCore.console.groupEnd()

        await editor.executeCompiledApp()
      }
    } finally {
      spellCore.console.groupEnd()
    }
  },

  /**
   * Execute already-`compiled` current `project`, logging result/errors to `spellCore.console`.
   * - Throws if execution errored, so browser devtools print the right stack/line number too.
   */
  async executeCompiledApp(): Promise<void> {
    const { project } = editor
    if (!project?.compiled) return
    spellCore.console.group(`Executing ${project.type}`)
    const result = await project.executeCompiled()
    spellCore.console.groupEnd()
    if (result instanceof Error) {
      spellCore.console.error(`${project.Type} failed with error:`, result)
      // Throw so the error is printed to the browser console.
      // This will have the print the correct line number to the right
      // but we apparently don't have another way to get it???
      throw result
    }
    spellCore.console.info(`${project.Type} executed without errors.  exports =`, result)
  },

  /** Timer id for a pending `compileAppSoon()`, if any. */
  compileAppSoonTimer: undefined as ReturnType<typeof setTimeout> | undefined,
  /** Compile after `delay` seconds. */
  compileAppSoon(delay: number = 1): void {
    editor.clearCompileAppSoon()
    editor.compileAppSoonTimer = setTimeout(editor.compileApp, delay * 1000)
  },
  /** Cancel pending `compileAppSoon()` timer, if any. */
  clearCompileAppSoon(): void {
    if (editor.compileAppSoonTimer) {
      clearTimeout(editor.compileAppSoonTimer)
      editor.compileAppSoonTimer = undefined
    }
  },

  ////////////////
  // ## Projects actions
  ////////////////
  /** Create a new project under `SP.SpellProjectRoot.projects`. */
  createProject(projectId?: string): Promise<void> {
    return editor.createApp(SP.SpellProjectRoot.projects, projectId)
  },

  ////////////////
  // ## Examples actions
  ////////////////
  /** Create a new example under `SP.SpellProjectRoot.examples`. */
  async createExample(projectId?: string): Promise<void> {
    return editor.createApp(SP.SpellProjectRoot.examples, projectId)
  },

  ////////////////
  // ## Guides actions
  ////////////////
  /** Create a new guide under `SP.SpellProjectRoot.guides`. */
  async createGuide(projectId?: string): Promise<void> {
    return editor.createApp(SP.SpellProjectRoot.guides, projectId)
  },

  ////////////////
  // ## File actions
  ////////////////

  /** Save current `file` if it's loaded. */
  async saveFile(): Promise<void> {
    const { file } = editor
    if (file?.isLoaded) await file.save(undefined)
  },
  /** Reload current `file` from disk/storage and recompile. */
  async reloadFile(): Promise<void> {
    editor.clearCompileAppSoon()
    const { file } = editor
    if (file) {
      await file.reload()
      void editor.compileApp()
    }
  },
  /** Create `filePath` (with optional `contents`) in current `project` and show it. */
  async createFile(filePath?: string, contents?: string): Promise<void> {
    editor.clearCompileAppSoon()
    try {
      const newFile = await editor.project!.createFile(filePath, contents)
      if (newFile) {
        editor.showEditor(newFile.path)
        editor.showNotice("File created.")
      }
    } catch (e) {
      editor.showError(e)
    }
  },
  /** Duplicate current `file` to `newPath` and show it. */
  async duplicateFile(newPath?: string): Promise<void> {
    editor.clearCompileAppSoon()
    try {
      const newFile = await editor.project!.duplicateFile(editor.file!.filePath!, newPath)
      if (newFile) {
        editor.showEditor(newFile.path)
        editor.showNotice("File duplicated.")
      }
    } catch (e) {
      editor.showError(e)
    }
  },
  /** Rename current `file` to `newPath` and show it. */
  async renameFile(newPath?: string): Promise<void> {
    editor.clearCompileAppSoon()
    try {
      const renamedFile = await editor.project!.renameFile(editor.file!.filePath!, newPath)
      if (renamedFile) {
        editor.showEditor(renamedFile.path)
        editor.showNotice("File renamed.")
      }
    } catch (e) {
      editor.showError(e)
    }
  },
  /** Delete current `file` (after `CONFIRM`), then show next import or `project`. */
  async deleteFile(): Promise<void> {
    editor.clearCompileAppSoon()
    try {
      const project = editor.project!
      const file = editor.file!
      // figure out what to select next out of `project.imports`
      const files = project.imports.map(({ file }) => file)
      const fileIndex = files.indexOf(file)
      const nextFile = files[fileIndex + (fileIndex === files.length - 1 ? -1 : 1)]
      // actually remove the file
      const removed = await project.deleteFile(file.filePath!, CONFIRM)
      if (removed) {
        // select the nextFile, or the project (which will select another file)
        editor.showEditor(nextFile?.path || project.path)
        editor.showNotice("File removed.")
      }
    } catch (e) {
      editor.showError(e)
    }
  },

  ////////////////
  // ## Dialogs
  ////////////////

  /** Dev helper -- show a `confirm()` dialog and log the resolved answer. */
  async testDialog(): Promise<void> {
    const reply = await editor.confirm({ header: "Header", message: "Message?", ok: "Yep", cancel: "Nope" })
    console.warn("testDialog resolved with ", reply)
  },

  /**
   * Get the user's answer to some question.
   * `props`:
   *  - `message` (required) Message to show.
   *  - `header` (optional) Header for the dialog.  Default is no header.
   *  - `ok` (optional) string or props for OK button.  Default is `"OK"`.
   *  - `cancel` (optional) string or props for Cancel button.  Default is `"Cancel"`.
   *  - any additional `props` will be passed to the `<Modal>`.s
   * Instead of passing `props`, you can simply pass string `message` to use other defaults.
   *
   * `alert()` always resolves `undefined` (there's only an OK button).
   * `confirm()` resolves `true`/`false` for the OK/Cancel buttons.
   * `prompt()`/`promptForNumber()` resolve the field's string value, or `undefined` if cancelled.
   */
  alert(props: string | Modals.AlertModalProps): Promise<undefined> {
    if (typeof props === "string") props = { message: props }
    // `Modals.Alert` always resolves `undefined` (only an OK button); narrow past `showModal()`'s
    // generic `Promise<unknown>` (`Modals.Alert`'s own `Modals.ModalComponentProps<Modals.AlertModalProps>` defaults
    // its resolve value to `unknown`).
    return editor.showModal(props, Modals.Alert) as Promise<undefined>
  },

  /** See `alert()` above for shared `props` docs.  Resolves `true`/`false` for OK/Cancel button. */
  confirm(props: string | Modals.ConfirmModalProps): Promise<boolean> {
    if (typeof props === "string") props = { message: props }
    return editor.showModal(props, Modals.Confirm)
  },

  /** See `alert()` above for shared `props` docs.  Resolves field's string value, or `undefined` if cancelled. */
  prompt(props: string | Modals.PromptModalProps): Promise<string | undefined> {
    if (typeof props === "string") props = { message: props }
    return editor.showModal(props, Modals.Prompt)
  },

  /** Like `prompt()`, but numeric input -- defaults `type: "number"` and `step: 1`. */
  promptForNumber(props: string | Modals.PromptModalProps): Promise<string | undefined> {
    if (typeof props === "string") props = { message: props }
    props = { type: "number", inputProps: { step: 1 }, ...props }
    return editor.showModal(props, Modals.Prompt)
  },

  /** Show a chooser modal.  Rejects instead of showing anything if `message`/`options` are missing. */
  choose(props?: Modals.ChooserModalProps): Promise<unknown> {
    if (!props?.message || !props.options) {
      console.warn("editor.choose(): must pass 'message' and 'options', got:", props)
      return Promise.reject(undefined)
    }
    return editor.showModal(props, Modals.Chooser)
  },

  /** Sequence to generate unique modal `id`s. */
  modalId: 0,
  /** Current stack of modals, topmost at start. */
  modals: [] as ModalEntry[],
  /** When true, log each modal's resolve/reject value to console -- see `showModal()` below. */
  debugModals: false,
  /**
   * Generic method to show a `component` modal with `props`.
   * Returns a promise which will resolve/reject as per `component` setup.
   */
  showModal,

  ////////////////
  // ## InputEditor event handlers
  ////////////////

  /**
   * Pointer to the `codeMirror` instance for our InputEditor.
   * TODO: generalize this for multiple editors!
   */
  inputEditor: undefined as CodeMirror.Editor | null | undefined,
  /** Remember `inputEditor` in our <InputEditor editorDidMount /> event. */
  onInputDidMount(codeMirror: CodeMirror.Editor): void {
    // console.info("initializing", { codeMirror })
    editor.inputEditor = codeMirror
    codeMirror.on("refresh", editor.onInputCursor)
  },
  /** Forget `inputEditor` in our <InputEditor editorWillUnmount /> event. */
  onInputWillUnmount(codeMirror: CodeMirror.Editor): void {
    editor.inputEditor = null
    codeMirror.off("refresh", editor.onInputCursor)
  },

  /** Handle cursor move or scroll in our inputEditor, remembering the `selection`  */
  selection: undefined as UIT.EditorSelection | undefined,
  /** Track cursor/scroll position in `inputEditor` -- see `onInputCursor()` below. */
  onInputCursor,

  /**
   * Called from a `useEffect()` hook in our `<InputEditor />`,
   * if `editor.file.initialSelection` is set and things are ready to go
   * scroll the codeMirror `inportEditor` and reset the selection.
   */
  onInputEffect(): void {
    const { inputEditor, file } = editor
    const { initialSelection, isLoaded } = file || {}
    if (!inputEditor || !isLoaded || !initialSelection) return

    console.info("TODO: DEFERRING onInputEffect():  see editor.onInputEffect")
    // console.info("initializing input", { path, initialSelection, inputEditor })
    // try {
    //   // HACK: manually set the height of the codeMirror instance
    //   // so that the bottom scrollbar shows up in the right place.
    //   // ????
    //   // const { clientWidth, clientHeight } = document.querySelector("#InputEditor")
    //   // inputEditor.setSize(clientWidth, clientHeight - 1)
    //   // inputEditor.resize()
    //   // console.info(inputEditor)

    //   // clear the `initialSelection` flag so we don't try to scroll again
    //   delete file.initialSelection

    //   // turn into a `cursor` event so we'll scroll the views
    //   if (initialSelection.scroll) initialSelection.scroll.event = "cursor"
    //   editor.lastSelectionForFile(file.path, initialSelection)
    //   // Set `editor.selection` after a delay so rendering works better
    //   setTimeout(() => {
    //     console.info("onInputEffect setting selection to ", initialSelection)
    //     editor.selection = initialSelection
    //   }, 10)

    //   // scroll the inputEditor itself to match
    //   const { scroll, anchor, head } = initialSelection
    //   inputEditor.scrollTo(0, scroll?.scroll || 0)
    //   if (anchor && head) inputEditor.doc.setSelection(anchor, head)
    //   inputEditor.focus()
    // } catch (e) {
    //   console.warn("CM scroll error:", e)
    // }
  },

  /** Handle change event from our inputEditor. */
  onInputChanged(_codeMirror: CodeMirror.Editor, _change: CodeMirror.EditorChange, value: string): void {
    const { file, project } = editor
    if (!file || !project) return
    file.contents = value
    file.isDirty = true
    project.updatedContentsFor(file)
    // auto-compile 2 seconds after input settles
    editor.compileAppSoon(2)
  },

  ////////////////
  // ## UI
  ////////////////

  /** Whether `<MatchRoot>` shows rule names alongside matches. */
  showingMatchRuleNames: true,
  /** Toggle (or force via `on`) `showingMatchRuleNames`. */
  toggleMatchRuleNames(on?: boolean): void {
    // NOTE: defaulted here rather than in the signature -- see `createApp()` above.
    on ??= !editor.showingMatchRuleNames
    editor.showingMatchRuleNames = on
  },

  /** Single `notice` display. */
  notice: undefined as string | undefined,
  /** Show `notice` banner with `notice` text. */
  showNotice(notice: string): void {
    console.info("showNotice:", notice)
    editor.notice = notice
  },
  /** Clear `notice` banner. */
  hideNotice(): void {
    editor.notice = undefined
  },

  /** Single error display. */
  error: undefined as Error | undefined,
  /** Show an error to the user. */
  showError(error: unknown): void {
    console.dir(error)
    editor.error = error instanceof Error ? error : new UIError(String(error))
  },
  /** Clear `error` banner. */
  hideError(): void {
    editor.error = undefined
  }
}

/** Type of the `editor` singleton, derived from `EDITOR_DEFAULTS` above. */
export type EditorStore = typeof EDITOR_DEFAULTS

/** The `editor` singleton -- a reactive proxy over `EDITOR_DEFAULTS`. */
export const editor: EditorStore = createStore(EDITOR_DEFAULTS)

////////////////
// ## Supporting types
////////////////

/**
 * Any of the file classes `editor.file` can hold, plus the ad-hoc `initialSelection` that
 * `editor.selectPath()` stashes on it to tell `<InputEditor>` where to restore the cursor.
 */
export type EditorFile = SP.AnySpellFile & { initialSelection?: UIT.EditorSelection }

/** Loose prop bag passed to a modal shown with `editor.showModal()`. */
export type ModalProps = Record<string, unknown>

/** A modal component (`Modals.Alert`, `Modals.Confirm`, etc), as rendered by `<Modals.ModalRoot>`. */
export type ModalComponent = ComponentType<Modals.ModalComponentProps<ModalProps, unknown>>

/**
 * One entry in `editor.modals`, the stack of currently-showing modals.
 * NOTE: this is a heterogeneous stack -- each entry's real `component` is typed for its own
 * specific props/resolve-value types (e.g. `Modals.Confirm` wants `Modals.ModalComponentProps<Modals.ConfirmModalProps,
 * boolean>`) -- so `component`/`resolve`/`reject` are type-erased to `ModalComponent`/`unknown` here.
 */
export type ModalEntry = {
  /** Props passed to `component`, plus generated `id` used to remove this entry from `editor.modals`. */
  props: ModalProps & { id: string }
  /** Modal component to render -- type-erased, see note above. */
  component: ModalComponent
  /** Resolve promise `showModal()` returned for this entry. */
  resolve: (value?: unknown) => void
  /** Reject promise `showModal()` returned for this entry. */
  reject: (reason?: unknown) => void
}

////////////////
// ## Overloaded helpers (`arguments.length`-sensitive, so plain `function`s rather than arrows)
////////////////

/** Get/save last viewed `projectPath` for `projectRootPath`. */
function lastProjectForRoot(projectRootPath: string): string | undefined
function lastProjectForRoot(projectRootPath: string, projectPath: string): string
function lastProjectForRoot(projectRootPath: string, projectPath?: string): string | undefined {
  if (arguments.length === 1) return getPref(projectRootPath, projectPath)
  // BUG FIX: was `setPref(projectRootPath, projectRootPath)`, which saved the key as the value.
  return setPref(projectRootPath, projectPath)
}

/** Get/save last viewed full `filePath` for `projectPath`. */
function lastFileForProject(projectPath: string): string | undefined
function lastFileForProject(projectPath: string, filePath: string): string
function lastFileForProject(projectPath: string, filePath?: string): string | undefined {
  if (arguments.length === 1) return getPref(projectPath, filePath)
  // BUG FIX: was `setPref(projectPath, projectPath)`, which saved the key as the value.
  return setPref(projectPath, filePath)
}

/** Get/save last `selection` for `filePath`. */
function lastSelectionForFile(filePath: string): UIT.EditorSelection | undefined
function lastSelectionForFile(filePath: string, selection: UIT.EditorSelection): UIT.EditorSelection
function lastSelectionForFile(filePath: string, selection?: UIT.EditorSelection): UIT.EditorSelection | undefined {
  if (arguments.length === 1) return getPref(filePath, selection)
  return setPref(filePath, selection)
}

/** Handle cursor move (`onCursorActivity`, one arg) or scroll (`onScroll`, two args) from CodeMirror. */
function onInputCursor(codeMirror: CodeMirror.Editor): void
function onInputCursor(codeMirror: CodeMirror.Editor, data: CodeMirror.ScrollInfo): void
function onInputCursor(codeMirror: CodeMirror.Editor, _data?: CodeMirror.ScrollInfo): void {
  const event: UIT.EditorScrollInfo["event"] = arguments.length === 1 ? "cursor" : "scroll"
  const { direction, current: oldCurrent } = editor.selection?.scroll || {}
  // allocate this way to make console debugging easier
  const scroll: UIT.EditorScrollInfo = { event, direction, percent: 0, max: 0, current: 0, total: 0, visible: 0 }

  // NOTE: `.doc`/`.display` aren't part of the published `CodeMirror.Editor` types -- this is a
  // real dynamic boundary onto CodeMirror's undocumented internals, narrowed to just what we use.
  const cm = codeMirror as CodeMirror.Editor & {
    doc: CodeMirror.Doc & {
      scrollTop: number
      height: number
      sel: { ranges: { anchor: CodeMirror.Position; head: CodeMirror.Position }[] }
    }
    display: { lastWrapHeight: number }
  }
  scroll.current = Math.floor(cm.doc.scrollTop)
  scroll.total = Math.floor(cm.doc.height)
  scroll.visible = cm.display.lastWrapHeight
  scroll.max = scroll.total - scroll.visible
  scroll.percent = parseFloat((scroll.current / scroll.max).toPrecision(4))
  // update "direction" if we can
  if (typeof oldCurrent === "number" && oldCurrent !== scroll.current) {
    scroll.direction = oldCurrent < scroll.current ? "down" : "up"
  }

  // Extra stuff we COULD get from codeMirror
  // See:  https://codemirror.net/doc/manual.html#api_sizing
  // scroll.lineHeight = codeMirror.defaultTextHeight()
  // scroll.mouseLine = codeMirror.lineAtHeight(<global-mouse-position>, "window")

  const range = cm.doc.sel.ranges[0]
  const { file } = editor
  // `offsetForPosition()` only exists on `SpellFile`/`SpellCSSFile`, not `SpellJSFile`.
  const offsetForPosition = (pos: CodeMirror.Position): number | undefined =>
    file && "offsetForPosition" in file ? file.offsetForPosition(pos) : undefined

  const anchor: UIT.EditorPosition = {
    line: range.anchor.line,
    ch: range.anchor.ch,
    top: Math.floor(cm.cursorCoords(range.anchor, "local").top),
    offset: offsetForPosition(range.anchor)
  }

  const head: UIT.EditorPosition = {
    line: range.head.line,
    ch: range.head.ch,
    top: Math.floor(cm.cursorCoords(range.head, "local").top),
    offset: offsetForPosition(range.head)
  }

  editor.selection = { scroll, anchor, head }
  // store selection as file `pref`, we'll reload it in `selectPath()` above.
  if (file) editor.lastSelectionForFile(file.path, editor.selection)
}

/**
 * Generic method to show a `component` modal with `props`.
 * Returns a promise which will resolve/reject as per `component` setup.
 * `P`/`R` are inferred from `component`'s own type (e.g. `Modals.Confirm` is typed for
 * `Modals.ModalComponentProps<Modals.ConfirmModalProps, boolean>`, so passing it infers `P = Modals.ConfirmModalProps`,
 * `R = boolean`).
 */
function showModal<P extends ModalProps, R = unknown>(
  props: P,
  component: ComponentType<Modals.ModalComponentProps<P, R>>
): Promise<R> {
  let modalProps!: ModalEntry
  const promise = new Promise<R>((resolve, reject) => {
    modalProps = {
      props: { ...props, id: `Modal-${editor.modalId++}` },
      // NOTE: `editor.modals` is a heterogeneous stack whose entries are typed for different
      // props/resolve-value types; type-erase to `ModalComponent`/`unknown` here, right at the
      // boundary where we know which `component`/`props`/`resolve`/`reject` set actually belongs together.
      component: component as unknown as ModalComponent,
      resolve: (value?: unknown) => resolve(value as R),
      reject: (reason?: unknown) => reject(reason)
    }
    editor.modals = [modalProps, ...editor.modals]
  }).finally(() => {
    // make sure `editor.modals` gets cleaned up however we resolve the promise
    editor.modals = editor.modals.filter((it) => it.props.id !== modalProps.props.id)
  })

  if (editor.debugModals) {
    // NOTE: don't put this in the promise returned to the caller
    void promise.then((value) => console.info("Modal resolved with:", value, "\nprops:", modalProps))
    promise.catch((error) => console.info("Modal rejected with:", error, "\nprops:", modalProps))
  }

  return promise
}
