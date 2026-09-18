import type { ComponentType } from "react"
import type * as CodeMirror from "codemirror"
import type { createRoot } from "react-dom/client"
import { navigate } from "@reach/router"

import { UIError, createStore, setPrefKey, getPref, setPref, CONFIRM } from "~/util"

import { P } from "~/parser"
import { spellCore } from "~/spellCore"
import { SP } from "~/languages/spell"
// NOTE: `UI` is only ever dereferenced inside store methods (`UI.Alert` etc), never at module
// evaluation time.  That matters -- `~/app/components` imports back into `~/app/store`, so the
// binding is still in its TDZ while this module is being evaluated.
import { UI } from "~/app/components"
import type {
  ModalComponentProps,
  AlertModalProps,
  ConfirmModalProps,
  PromptModalProps,
  ChooserModalProps
} from "~/app/components"

//-----------------
// Supporting types
//-----------------

/** Scroll state tracked alongside a cursor/scroll `EditorSelection`. */
export type EditorScrollInfo = {
  event: "cursor" | "scroll"
  direction?: "up" | "down"
  percent: number
  max: number
  current: number
  total: number
  visible: number
}

/** CodeMirror-style `{ line, ch }` position, augmented with pixel/offset info. */
export type EditorPosition = {
  line: number
  ch: number
  top?: number
  offset?: number
}

/** Cursor/scroll selection remembered per-file, as stored/restored via `store.lastSelectionForFile()`. */
export type EditorSelection = {
  scroll?: EditorScrollInfo
  anchor?: EditorPosition
  head?: EditorPosition
}

/**
 * Any of the file classes `store.file` can hold, plus the ad-hoc `initialSelection` that
 * `store.selectPath()` stashes on it to tell `<InputEditor>` where to restore the cursor.
 */
export type StoreFile = SP.AnySpellFile & { initialSelection?: EditorSelection }

/** Loose prop bag passed to a modal shown with `store.showModal()`. */
export type ModalProps = Record<string, unknown>

/** A modal component (`UI.Alert`, `UI.Confirm`, etc), as rendered by `<UI.ModalRoot>`. */
export type ModalComponent = ComponentType<ModalComponentProps<ModalProps, unknown>>

/**
 * One entry in `store.modals`, the stack of currently-showing modals.
 * NOTE: this is a heterogeneous stack -- each entry's real `component` is typed for its own
 * specific props/resolve-value types (e.g. `UI.Confirm` wants `ModalComponentProps<ConfirmModalProps,
 * boolean>`) -- so `component`/`resolve`/`reject` are type-erased to `ModalComponent`/`unknown` here.
 */
export type ModalEntry = {
  props: ModalProps & { id: string }
  component: ModalComponent
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}

export type SpellStore = {
  //-----------------
  // Project and project actions
  //-----------------

  /**
   * `SP.SpellProjectRoot` shown in `SpellEditor`.
   * Update with `store.showEditor()
   */
  projectRoot?: SP.SpellProjectRoot
  /** Get/save last viewed `projectPath` for `projectRootPath`. */
  lastProjectForRoot: typeof lastProjectForRoot
  appType: string

  /**
   * Current `SP.SpellProject` shown in `SpellEditor`.
   * Update with `store.showEditor()`
   */
  project?: SP.SpellProject
  /** Get/save last viewed full `filePath` for `projectPath`. */
  lastFileForProject: typeof lastFileForProject

  /**
   * `SpellFile` etc shown in `SpellEditor`.
   * Update with `store.showEditor()`
   */
  file?: StoreFile
  /** Get/save last `selection` for `filePath`.  */
  lastSelectionForFile: typeof lastSelectionForFile

  /** Show the project / example / guide chooser page. */
  showProjectChooser(): Promise<void>
  /** Show `<SpellEditor>` for a `path` by updating the URL, which will eventually call `selectPath` */
  showEditor(path?: string, selection?: EditorSelection): void
  /** Show `<SpellRunner>` for a `path` by updating the URL, which will eventually call `selectPath` */
  showRunner(path?: string): Promise<void>
  /** Show settings for the current `project`. TODO: not yet implemented. */
  showProjectSettings(): void
  /** Show the "About Spell" dialog. TODO: not yet implemented. */
  aboutSpell(): void
  /** Show documentation. TODO: not yet implemented. */
  showDocs(): void
  /** Show help. TODO: not yet implemented. */
  showHelp(): void
  /** Log the user in. TODO: not yet implemented. */
  logIn(): void
  /** Publish the current `project`. TODO: not yet implemented. */
  publishApp(): void

  /**
   * Last project page we were showing: "editor" or "runner".
   * Set by `<SpellEditor>` or `<SpellRunner>`
   */
  projectPage: "editor" | "runner"

  /**
   * Select a `path` to show in the `<SpellEditor/>` or `<SpellRunner>`.
   * Pass `selection` as `{ line, ch }` to set the cursor in the file.
   */
  selectPath(path: string, selection?: EditorSelection): Promise<void>
  /**
   * Given a `match`, attempt to show it and put the cursor in the right spot.
   * This may not be accurate if text has changed since
   */
  showMatch(match: P.Match): Promise<void>

  /**
   * Create an app for the specified `projectRoot`.
   * `projectId` is optional, if you don't specify we'll ask the user for one.
   */
  createApp(projectRoot?: SP.SpellProjectRoot, projectId?: string): Promise<void>
  duplicateApp(newProjectId?: string): Promise<void>
  renameApp(newProjectId?: string): Promise<void>
  deleteApp(): Promise<void>

  compileApp(): Promise<void>
  executeCompiledApp(): Promise<void>
  /** Timer id for a pending `compileAppSoon()`, if any. */
  compileAppSoonTimer?: ReturnType<typeof setTimeout>
  /** Compile after `delay` seconds. */
  compileAppSoon(delay?: number): void
  clearCompileAppSoon(): void

  //-----------------
  // Projects/Examples/Guides actions
  //-----------------
  createProject(projectId?: string): Promise<void>
  createExample(projectId?: string): Promise<void>
  createGuide(projectId?: string): Promise<void>

  //-----------------
  // File actions
  //-----------------
  saveFile(): Promise<void>
  reloadFile(): Promise<void>
  createFile(filePath?: string, contents?: string): Promise<void>
  duplicateFile(newPath?: string): Promise<void>
  renameFile(newPath?: string): Promise<void>
  deleteFile(): Promise<void>

  //-----------------
  // Dialogs
  //-----------------
  testDialog(): Promise<void>

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
  alert(props: string | AlertModalProps): Promise<undefined>
  confirm(props: string | ConfirmModalProps): Promise<boolean>
  prompt(props: string | PromptModalProps): Promise<string | undefined>
  // Prompt for a number, by default an integer.
  // Pass e.g. `{ inputProps: { step, min, max }` to customize input.
  promptForNumber(props: string | PromptModalProps): Promise<string | undefined>
  // Show chooser dialog.
  // You MUST pass at least `{ message, options }`.
  choose(props?: ChooserModalProps): Promise<unknown>

  /** Seqeuence to generate unique modal `id`s. */
  modalId: number
  /** Current stack of modals, topmost at start. */
  modals: ModalEntry[]
  debugModals: boolean
  /**
   * Generic method to show a `component` modal with `props`.
   * Returns a promise which will resolve/reject as per `component` setup.
   */
  showModal: typeof showModal

  //-----------------
  // InputEditor event handlers
  //-----------------

  /**
   * Pointer to the `codeMirror` instance for our InputEditor.
   * TODO: generalize this for multiple editors!
   */
  inputEditor?: CodeMirror.Editor | null
  /** Remember `inputEditor` in our <InputEditor editorDidMount /> event. */
  onInputDidMount(codeMirror: CodeMirror.Editor): void
  /** Forget `inputEditor` in our <InputEditor editorWillUnmount /> event. */
  onInputWillUnmount(codeMirror: CodeMirror.Editor): void

  /** Handle cursor move or scroll in our inputEditor, remembering the `selection`  */
  selection?: EditorSelection
  onInputCursor: typeof onInputCursor

  /**
   * Called from a `useEffect()` hook in our `<InputEditor />`,
   * if `store.file.initialSelection` is set and things are ready to go
   * scroll the codeMirror `inportEditor` and reset the selection.
   */
  onInputEffect(): void
  /** Handle change event from our inputEditor. */
  onInputChanged(codeMirror: CodeMirror.Editor, change: CodeMirror.EditorChange, value: string): void

  //-----------------
  // UI
  //-----------------

  /** Show rule names in MatchViewer? */
  showingMatchRuleNames: boolean
  toggleMatchRuleNames(on?: boolean): void

  /** Single `notice` display. */
  notice?: string
  showNotice(notice: string): void
  hideNotice(): void

  /** Single error display. */
  error?: Error
  /** Show an error to the user. */
  showError(error: unknown): void
  hideError(): void
}

//-----------------
// Overloaded helpers (`arguments.length`-sensitive, so plain `function`s rather than arrows)
//-----------------

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
function lastSelectionForFile(filePath: string): EditorSelection | undefined
function lastSelectionForFile(filePath: string, selection: EditorSelection): EditorSelection
function lastSelectionForFile(filePath: string, selection?: EditorSelection): EditorSelection | undefined {
  if (arguments.length === 1) return getPref(filePath, selection)
  return setPref(filePath, selection)
}

/** Handle cursor move (`onCursorActivity`, one arg) or scroll (`onScroll`, two args) from CodeMirror. */
function onInputCursor(codeMirror: CodeMirror.Editor): void
function onInputCursor(codeMirror: CodeMirror.Editor, data: CodeMirror.ScrollInfo): void
function onInputCursor(codeMirror: CodeMirror.Editor, _data?: CodeMirror.ScrollInfo): void {
  const event: EditorScrollInfo["event"] = arguments.length === 1 ? "cursor" : "scroll"
  const { direction, current: oldCurrent } = store.selection?.scroll || {}
  // allocate this way to make console debugging easier
  const scroll: EditorScrollInfo = { event, direction, percent: 0, max: 0, current: 0, total: 0, visible: 0 }

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
  const { file } = store
  // `offsetForPosition()` only exists on `SpellFile`/`SpellCSSFile`, not `SpellJSFile`.
  const offsetForPosition = (pos: CodeMirror.Position): number | undefined =>
    file && "offsetForPosition" in file ? file.offsetForPosition(pos) : undefined

  const anchor: EditorPosition = {
    line: range.anchor.line,
    ch: range.anchor.ch,
    top: Math.floor(cm.cursorCoords(range.anchor, "local").top),
    offset: offsetForPosition(range.anchor)
  }

  const head: EditorPosition = {
    line: range.head.line,
    ch: range.head.ch,
    top: Math.floor(cm.cursorCoords(range.head, "local").top),
    offset: offsetForPosition(range.head)
  }

  store.selection = { scroll, anchor, head }
  // store selection as file `pref`, we'll reload it in `selectPath()` above.
  if (file) store.lastSelectionForFile(file.path, store.selection)
}

/**
 * Generic method to show a `component` modal with `props`.
 * Returns a promise which will resolve/reject as per `component` setup.
 * `P`/`R` are inferred from `component`'s own type (e.g. `UI.Confirm` is typed for
 * `ModalComponentProps<ConfirmModalProps, boolean>`, so passing it infers `P = ConfirmModalProps`,
 * `R = boolean`).
 */
function showModal<P extends ModalProps, R = unknown>(
  props: P,
  component: ComponentType<ModalComponentProps<P, R>>
): Promise<R> {
  let modalProps!: ModalEntry
  const promise = new Promise<R>((resolve, reject) => {
    modalProps = {
      props: { ...props, id: `Modal-${store.modalId++}` },
      // NOTE: `store.modals` is a heterogeneous stack whose entries are typed for different
      // props/resolve-value types; type-erase to `ModalComponent`/`unknown` here, right at the
      // boundary where we know which `component`/`props`/`resolve`/`reject` set actually belongs together.
      component: component as unknown as ModalComponent,
      resolve: (value?: unknown) => resolve(value as R),
      reject: (reason?: unknown) => reject(reason)
    }
    store.modals = [modalProps, ...store.modals]
  }).finally(() => {
    // make sure `store.modals` gets cleaned up however we resolve the promise
    store.modals = store.modals.filter((it) => it.props.id !== modalProps.props.id)
  })

  if (store.debugModals) {
    // NOTE: don't put this in the promise returned to the caller
    promise.then((value) => console.info("Modal resolved with:", value, "\nprops:", modalProps))
    promise.catch((error) => console.info("Modal rejected with:", error, "\nprops:", modalProps))
  }

  return promise
}

//-----------------
// The store
//-----------------

setPrefKey("spellEditor:")
export const store: SpellStore = createStore<SpellStore>({
  //-----------------
  // Project and project actions
  //-----------------

  projectRoot: undefined,
  lastProjectForRoot,
  get appType() {
    return store.projectRoot?.Type || "Project"
  },

  project: undefined,
  lastFileForProject,

  file: undefined,
  lastSelectionForFile,

  showProjectChooser() {
    return navigate("/")
  },

  showEditor(path, selection) {
    if (!path) path = store.file?.path
    // TODO: selection!!!!
    try {
      navigate(new SP.SpellLocation(path!).editorUrl)
      store.compileApp()
    } catch {
      store.showError(`Path '${path}' is invalid!`)
    }
  },

  async showRunner(path) {
    if (!path) path = store.file?.path
    try {
      await navigate(new SP.SpellLocation(path!).runnerUrl)
      store.compileApp()
    } catch {
      store.showError(`Path '${path}' is invalid!`)
    }
  },

  // TODO: these are referenced by `~/app/actions` but not yet implemented.
  showProjectSettings() {
    console.warn("TODO: store.showProjectSettings() not yet implemented")
  },
  aboutSpell() {
    console.warn("TODO: store.aboutSpell() not yet implemented")
  },
  showDocs() {
    console.warn("TODO: store.showDocs() not yet implemented")
  },
  showHelp() {
    console.warn("TODO: store.showHelp() not yet implemented")
  },
  logIn() {
    console.warn("TODO: store.logIn() not yet implemented")
  },
  publishApp() {
    console.warn("TODO: store.publishApp() not yet implemented")
  },

  projectPage: "editor",

  async selectPath(path, selection) {
    let location: SP.SpellLocation
    try {
      location = new SP.SpellLocation(path)
    } catch {
      console.warn(`store.selectPath('${path}'): invalid path`)
      // default to user projects if `new SP.SpellLocation()` throws
      location = new SP.SpellLocation("@user:projects")
    }
    console.info("store.selectPath", { path, location })

    const projectRoot = new SP.SpellProjectRoot(location.projectRoot)
    const sameRoot = store.projectRoot === projectRoot
    if (!sameRoot) {
      console.info("selecting projectRoot", projectRoot)
      await projectRoot.load(undefined)
      store.projectRoot = projectRoot
    }
    const projectPaths = projectRoot.projectPaths

    // Figure out which project to show, using pref if not specified in `path`
    let projectPath =
      location.isProjectPath || location.isFilePath //
        ? location.projectPath
        : store.lastProjectForRoot(location.projectRoot)
    if (!projectPath || !projectPaths.includes(projectPath)) projectPath = projectPaths[0]
    // TODO: what if no project???
    const project = new SP.SpellProject(projectPath)
    // DEBUG: access globally as `window.project`
    window.project = project
    const sameProject = store.project === project
    if (!sameProject) {
      console.info("selecting project", project)
      // stop current compilation
      store.clearCompileAppSoon()
      // remember this project was selected for projectRoot
      store.lastProjectForRoot(location.projectRoot, projectPath)
      await project.load(undefined)
      // Clear application display when switching projects
      const oldProjectRoot = document.getElementById(spellCore.REACT_APP_ROOT_ID) as
        (HTMLElement & { REACT_ROOT?: ReturnType<typeof createRoot> }) | null
      if (typeof oldProjectRoot?.REACT_ROOT?.unmount === "function") {
        oldProjectRoot.REACT_ROOT.unmount()
      }
    }

    // Figure out which file to show, using pref if not specified in `path`
    let filePath = location.isFilePath //
      ? location.filePath
      : store.lastFileForProject(project.path)
    if (!filePath || !project.getFile(filePath)) {
      filePath = project.activeImports[0]?.path || project.files[0]?.path || ""
    }
    // TODO: what if no file???

    const file: StoreFile | undefined = project.getFile(filePath)
    if (!file) throw new Error(`store.selectPath('${path}'): no file found for '${filePath}'.`)
    // if we landed on something else other than the original path, navigate to it
    if (path !== file.path) {
      // console.warn({ path, file: file.path })
      const url = file.location[store.projectPage === "editor" ? "editorUrl" : "runnerUrl"]
      return navigate(url, { replace: true })
    }

    const sameFile = store.file === file
    if (!sameFile) {
      console.info("selecting file", file)
      store.lastFileForProject(project.path, file.path)
      // restore file selection -- we'll use this below as a flag to reselect
      file.initialSelection = store.lastSelectionForFile(file.path)
    }
    // if we were passed a `selection` and path matches full path passed in, select it
    if (selection && path === file.path) file.initialSelection = selection

    // Set store and file together, else <FileDropdown> will blow up.  :-(
    store.project = project
    store.file = file
    await file.load(undefined)
    // If we switched projects, recompile
    if (!sameProject) store.compileApp()
  },

  async showMatch(match) {
    const path = match.getScopeOfType(P.FileScope)?.path
    if (!path) return
    const selection: EditorSelection = {
      anchor: { line: match.line ?? 0, ch: match.char ?? 0 },
      head: { line: match.line ?? 0, ch: (match.char ?? 0) + match.inputText.length },
      // TODO: scroll!!!?!?!?!
      scroll: { event: "cursor", percent: 0, max: 0, current: 0, total: 0, visible: 0 }
    }
    // TODO: showEditor...
    await store.selectPath(path, selection)
    // TODO....???
    store.onInputEffect()
  },

  async createApp(projectRoot = store.projectRoot!, projectId) {
    try {
      const project = await projectRoot.createProject(projectId)
      if (project) {
        store.showEditor(project.path)
        store.showNotice(`Created ${project.type} ${project.projectName}.`)
      }
    } catch (e) {
      store.showError(e)
    }
  },

  async duplicateApp(newProjectId) {
    try {
      const newProject = await store.projectRoot!.duplicateApp(store.project!.projectId, newProjectId)
      // console.warn({ newProject })
      if (newProject) {
        store.showEditor(newProject.path)
        store.showNotice(`${newProject.Type} duplicated.`)
      }
    } catch (e) {
      store.showError(e)
    }
  },
  async renameApp(newProjectId) {
    try {
      const project = await store.projectRoot!.renameApp(store.project!.projectId, newProjectId)
      if (project) {
        store.showEditor(project.path)
        store.showNotice(`${project.Type} renamed.`)
      }
    } catch (e) {
      store.showError(e)
    }
  },
  async deleteApp() {
    try {
      const { projectRoot, project } = store
      const removed = await projectRoot!.deleteApp(project!.projectId, CONFIRM)
      if (removed) {
        // Navigate to nextProject, or the projectRoot, which will select another project
        store.showEditor(projectRoot!.path)
        store.showNotice(`${projectRoot!.Type} removed.`)
      }
    } catch (e) {
      store.showError(e)
    }
  },

  async compileApp() {
    const { project, file } = store
    if (!project || !file) return

    spellCore.console.clear()
    try {
      spellCore.console.group("Compiling", project)

      store.clearCompileAppSoon()
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

        await store.executeCompiledApp()
      }
    } finally {
      spellCore.console.groupEnd()
    }
  },

  async executeCompiledApp() {
    const { project } = store
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

  // Compile after `delay` seconds.
  compileAppSoon(delay = 1) {
    store.clearCompileAppSoon()
    store.compileAppSoonTimer = setTimeout(store.compileApp, delay * 1000)
  },
  clearCompileAppSoon() {
    if (store.compileAppSoonTimer) {
      clearTimeout(store.compileAppSoonTimer)
      delete store.compileAppSoonTimer
    }
  },

  //-----------------
  // Projects actions
  //-----------------
  createProject(projectId) {
    return store.createApp(SP.SpellProjectRoot.projects, projectId)
  },

  //-----------------
  // Examples actions
  //-----------------
  async createExample(projectId) {
    return store.createApp(SP.SpellProjectRoot.examples, projectId)
  },

  //-----------------
  // Guides actions
  //-----------------
  async createGuide(projectId) {
    return store.createApp(SP.SpellProjectRoot.guides, projectId)
  },

  //-----------------
  // File actions
  //-----------------

  async saveFile() {
    const { file } = store
    if (file?.isLoaded) await file.save(undefined)
  },
  async reloadFile() {
    store.clearCompileAppSoon()
    const { file } = store
    if (file) {
      await file.reload()
      store.compileApp()
    }
  },
  async createFile(filePath, contents) {
    store.clearCompileAppSoon()
    try {
      const newFile = await store.project!.createFile(filePath, contents)
      if (newFile) {
        store.showEditor(newFile.path)
        store.showNotice("File created.")
      }
    } catch (e) {
      store.showError(e)
    }
  },
  async duplicateFile(newPath) {
    store.clearCompileAppSoon()
    try {
      const newFile = await store.project!.duplicateFile(store.file!.filePath!, newPath)
      if (newFile) {
        store.showEditor(newFile.path)
        store.showNotice("File duplicated.")
      }
    } catch (e) {
      store.showError(e)
    }
  },
  async renameFile(newPath) {
    store.clearCompileAppSoon()
    try {
      const renamedFile = await store.project!.renameFile(store.file!.filePath!, newPath)
      if (renamedFile) {
        store.showEditor(renamedFile.path)
        store.showNotice("File renamed.")
      }
    } catch (e) {
      store.showError(e)
    }
  },
  async deleteFile() {
    store.clearCompileAppSoon()
    try {
      const project = store.project!
      const file = store.file!
      // figure out what to select next out of `project.imports`
      const files = project.imports.map(({ file }) => file)
      const fileIndex = files.indexOf(file)
      const nextFile = files[fileIndex + (fileIndex === files.length - 1 ? -1 : 1)]
      // actually remove the file
      const removed = await project.deleteFile(file.filePath!, CONFIRM)
      if (removed) {
        // select the nextFile, or the project (which will select another file)
        store.showEditor(nextFile?.path || project.path)
        store.showNotice("File removed.")
      }
    } catch (e) {
      store.showError(e)
    }
  },

  //-----------------
  // Dialogs
  //-----------------

  async testDialog() {
    const reply = await store.confirm({ header: "Header", message: "Message?", ok: "Yep", cancel: "Nope" })
    console.warn("testDialog resolved with ", reply)
  },

  alert(props) {
    if (typeof props === "string") props = { message: props }
    // `UI.Alert` always resolves `undefined` (only an OK button); narrow past `showModal()`'s
    // generic `Promise<unknown>` (`UI.Alert`'s own `ModalComponentProps<AlertModalProps>` defaults
    // its resolve value to `unknown`).
    return store.showModal(props, UI.Alert) as Promise<undefined>
  },

  confirm(props) {
    if (typeof props === "string") props = { message: props }
    return store.showModal(props, UI.Confirm)
  },

  prompt(props) {
    if (typeof props === "string") props = { message: props }
    return store.showModal(props, UI.Prompt)
  },

  promptForNumber(props) {
    if (typeof props === "string") props = { message: props }
    props = { type: "number", inputProps: { step: 1 }, ...props }
    return store.showModal(props, UI.Prompt)
  },

  choose(props) {
    if (!props?.message || !props.options) {
      console.warn("store.choose(): must pass 'message' and 'options', got:", props)
      return Promise.reject(undefined)
    }
    return store.showModal(props, UI.Chooser)
  },

  modalId: 0, // Seqeuence to generate unique modal `id`s.
  modals: [], // Current stack of modals, topmost at start.
  debugModals: false,
  showModal,

  //-----------------
  // InputEditor event handlers
  //-----------------

  inputEditor: undefined,
  onInputDidMount(codeMirror) {
    // console.info("initializing", { codeMirror })
    store.inputEditor = codeMirror
    codeMirror.on("refresh", store.onInputCursor)
  },
  onInputWillUnmount(codeMirror) {
    store.inputEditor = null
    codeMirror.off("refresh", store.onInputCursor)
  },

  selection: undefined,
  onInputCursor,

  onInputEffect() {
    const { inputEditor, file } = store
    const { initialSelection, isLoaded } = file || {}
    if (!inputEditor || !isLoaded || !initialSelection) return

    console.info("TODO: DEFERRING onInputEffect():  see store.onInputEffect")
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
    //   store.lastSelectionForFile(file.path, initialSelection)
    //   // Set `store.selection` after a delay so rendering works better
    //   setTimeout(() => {
    //     console.info("onInputEffect setting selection to ", initialSelection)
    //     store.selection = initialSelection
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

  onInputChanged(_codeMirror, _change, value) {
    const { file, project } = store
    if (!file || !project) return
    file.contents = value
    file.isDirty = true
    project.updatedContentsFor(file)
    // auto-compile 2 seconds after input settles
    store.compileAppSoon(2)
  },

  //-----------------
  // UI
  //-----------------

  showingMatchRuleNames: true,
  toggleMatchRuleNames(on = !store.showingMatchRuleNames) {
    store.showingMatchRuleNames = on
  },

  notice: undefined,
  showNotice(notice) {
    console.info("showNotice:", notice)
    store.notice = notice
  },
  hideNotice() {
    store.notice = undefined
  },

  error: undefined,
  showError(error) {
    console.dir(error)
    store.error = error instanceof Error ? error : new UIError(String(error))
  },
  hideError() {
    store.error = undefined
  }
})
