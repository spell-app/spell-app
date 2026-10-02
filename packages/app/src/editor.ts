import { UIError, createStore, setPrefKey, getPref, setPref, CONFIRM } from "$/util"

import { P } from "$/parser"
import { SP } from "$/spell"
import type { SpellConsole } from "$/core/console"
import type { SpellRuntime } from "$/app/runner"
import type * as UIT from "$/app/ui/ui.types"
import type { monaco } from "$/app/ui/monaco"
// NOTE: types only:  the dialogs themselves load on first use, see `dialogs()`.
import type * as Modals from "$/app/solid/modals"
import { navigate } from "$/app/pages/navigation"

////////////////
// ## The editor
////////////////

setPrefKey("spellEditor:")
/**
 * Initial contents of the `editor` singleton.
 * - NOTE: `EditorStore` is derived from this with `typeof`,
 *   so the docstrings below serve BOTH the constant and the type.
 * - NOTE: methods reach the reactive proxy via `editor.x`, NEVER `this`.
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
  showProjectChooser(): void {
    navigate("/")
  },

  /** Show `<SpellEditor>` for a `path` by updating the URL, which will eventually call `selectPath` */
  showEditor(path?: string, selection?: UIT.EditorSelection): void {
    if (!path) path = editor.file?.path
    // TODO: selection!!!!
    try {
      navigate(new SP.SpellLocation(path!).editorUrl)
      void editor.compileApp()
    } catch {
      editor.showError(`Path '${path}' is invalid!`)
    }
  },

  /** Show `<SpellRunner>` for a `path` by updating the URL, which will eventually call `selectPath` */
  async showRunner(path?: string): Promise<void> {
    if (!path) path = editor.file?.path
    try {
      navigate(new SP.SpellLocation(path!).runnerUrl)
      void editor.compileApp()
    } catch {
      editor.showError(`Path '${path}' is invalid!`)
    }
  },

  // TODO: these are referenced by `$/app/solid`'s `Actions` but not yet implemented.
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
      appRuntime?.unmountApp()
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
      navigate(url, { replace: true })
      return
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
      anchor: { line: match.line ?? 0, ch: match.char ?? 0, offset: match.start },
      head: { line: match.line ?? 0, ch: (match.char ?? 0) + match.inputText.length, offset: match.end },
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
   * - SIDE EFFECT: clears `runtimeConsole()` and cancels any pending `compileAppSoon()` timer first.
   */
  async compileApp(): Promise<void> {
    const { project, file } = editor
    if (!project || !file) return

    const output = (await editor.loadRuntime()).spellCore.console
    output.clear()
    try {
      output.group("Compiling", project)

      editor.clearCompileAppSoon()
      await project.compile()
      const { compiled } = project

      if (compiled) {
        output.groupCollapsed("Compiled to javascript:")
        const lines = compiled
          .replace(/\t/g, "   ")
          .split("\n")
          .map((line, lineNum) => `${lineNum}`.padStart(4, " ") + `  ${line}`)
          .join("\n")
        output.log(lines)
        output.groupEnd()

        await editor.executeCompiledApp()
      }
    } finally {
      output.groupEnd()
    }
  },

  /**
   * Run already-`compiled` current `project` afresh, on the runtime programs run on -- logging how it went to
   * `runtimeConsole()`.  See `runCompiled()`.
   * - Runs what it wrote to `<Project>.compiled.js`, declarations header and all.
   * - Each project it imports is fetched afresh, so a recompiled library shows at once.
   * - An error's stack goes to devtools too -- `runCompiled()` logs it.
   */
  async executeCompiledApp(): Promise<void> {
    const { project } = editor
    const compiled = project?.outputFile.contents ?? project?.compiled
    if (!project || !compiled) return
    const runtime = await editor.loadRuntime()
    const output = runtime.spellCore.console
    output.group(`Executing ${project.type}`)
    const error = await runtime.runApp(compiled, {
      appRoot,
      coreUrl: runtimeUrl(),
      keepConsole: true,
      loadImport: fetchCompiled
    })
    output.groupEnd()
    if (error) output.error(`${project.Type} failed with error:`, error)
    else output.info(`${project.Type} executed without errors.`)
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
  // ## Running
  ////////////////

  /**
   * Has the runtime programs run on loaded?  See `loadRuntime()`.
   * - The runtime itself is NOT in the store:  read it with `runtimeSpellCore()` / `runtimeConsole()`.
   */
  runtimeLoaded: false,

  /**
   * The runtime programs run on, loaded the first time it's asked for -- ONE for the page:  the editor runs one
   * program at a time.
   * - dev:  `src/runner/spellRuntime.ts`, as vite serves it;  a build:  its own `spell-runtime.js`, see
   *   `vite.config.ts`.  See `runtimeUrl()`.
   * - SIDE EFFECT:  parse errors show on its console, as program output does -- see `SP.SpellFile.errorConsole`.
   */
  loadRuntime(): Promise<SpellRuntime> {
    loadingRuntime ??= (import(/* @vite-ignore */ runtimeUrl()) as Promise<SpellRuntime>).then((runtime) => {
      appRuntime = runtime
      SP.SpellFile.errorConsole = runtime.spellCore.console
      editor.runtimeLoaded = true
      return runtime
    })
    return loadingRuntime
  },

  /** Where the running app draws -- `<AppRoot>` hands it over, as a ref.  Kept OUTSIDE the store. */
  setAppRoot(element: HTMLElement | null): void {
    appRoot = element ?? undefined
  },
  /**
   * Forget `element` as where the running app draws -- if it still is:  `<AppRoot>`'s cleanup.
   * - Why "if":  moving between the editor and the runner, the old page's cleanup may run AFTER the new page's
   *   `<AppRoot>` handed its own over, which must not be forgotten.
   */
  releaseAppRoot(element: HTMLElement): void {
    if (appRoot === element) appRoot = undefined
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
   * Get the user's answer to some question:  a `<ui-modal>` (`$/app/solid/modals`, on `@spell-app/ui`).
   * `props`:
   *  - `message` (required) Message to show.
   *  - `header` (optional) Header for the dialog.  Default is no header.
   *  - `ok` (optional) OK button text.  Default is `"OK"`.
   *  - `cancel` (optional) Cancel button text.  Default is `"Cancel"`.
   * Instead of passing `props`, you can simply pass string `message` to use other defaults.
   *
   * `alert()` always resolves `undefined` (there's only an OK button).
   * `confirm()` resolves `true`/`false` for the OK/Cancel buttons (Escape is Cancel).
   * `prompt()`/`promptForNumber()` resolve the field's string value, or `undefined` if cancelled or empty.
   */
  alert(props: string | Modals.AlertModalProps): Promise<undefined> {
    return dialogs().then((modals) => modals.alert(props))
  },

  /** See `alert()` above for shared `props` docs.  Resolves `true`/`false` for OK/Cancel button. */
  confirm(props: string | Modals.ConfirmModalProps): Promise<boolean> {
    return dialogs().then((modals) => modals.confirm(props))
  },

  /** See `alert()` above for shared `props` docs.  Resolves field's string value, or `undefined` if cancelled. */
  prompt(props: string | Modals.PromptModalProps): Promise<string | undefined> {
    return dialogs().then((modals) => modals.prompt(props))
  },

  /** Like `prompt()`, but numeric input -- defaults `type: "number"` and `step: 1`. */
  promptForNumber(props: string | Modals.PromptModalProps): Promise<string | undefined> {
    return dialogs().then((modals) => modals.promptForNumber(props))
  },

  /** Show a chooser modal.  Rejects instead of showing anything if `message`/`options` are missing. */
  choose(props?: Modals.ChooserModalProps): Promise<unknown> {
    if (!props?.message || !props.options) {
      console.warn("editor.choose(): must pass 'message' and 'options', got:", props)
      return Promise.reject(undefined)
    }
    return dialogs().then((modals) => modals.choose(props))
  },

  ////////////////
  // ## InputEditor event handlers
  ////////////////

  /**
   * Monaco editor of our `<InputEditor>`, if one's mounted.
   * - NEVER kept in the store:  read through it inside a reaction, it would come back wrapped in a tracking proxy,
   *   and Monaco's internals would crawl through it -- see `inputEditorInstance`.
   * TODO: generalize this for multiple editors!
   */
  getInputEditor(): monaco.editor.IStandaloneCodeEditor | undefined {
    return inputEditorInstance
  },
  /**
   * Remember `inputEditor`, showing `editor.file`, in our `<InputEditor onMount />` event.
   * - `api` is Monaco itself, handed over as Monaco is loaded lazily -- see `$/app/solid`'s `LazyMonaco`.
   * - SIDE EFFECT:  adds our save / reload / compile keys, and follows its cursor + scrolling into `selection`.
   *   Monaco disposes of both with the editor.
   */
  onInputDidMount(inputEditor: monaco.editor.IStandaloneCodeEditor, api: typeof monaco): void {
    inputEditorInstance = inputEditor
    inputEditorPath = editor.file?.path
    const { KeyMod, KeyCode } = api
    inputEditor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyS, () => void editor.saveFile())
    inputEditor.addCommand(KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyR, () => void editor.reloadFile())
    inputEditor.addCommand(KeyMod.CtrlCmd | KeyCode.Enter, () => void editor.compileApp())
    inputEditor.onDidChangeCursorSelection(() => editor.onInputCursor("cursor"))
    inputEditor.onDidScrollChange((event) => {
      if (event.scrollTopChanged) editor.onInputCursor("scroll")
    })
  },
  /** Forget `inputEditor` in our `<InputEditor onUnmount />` event. */
  onInputWillUnmount(inputEditor: monaco.editor.IStandaloneCodeEditor): void {
    if (inputEditorInstance === inputEditor) inputEditorInstance = undefined
  },

  /** Handle cursor move or scroll in our inputEditor, remembering the `selection`  */
  selection: undefined as UIT.EditorSelection | undefined,
  /** Track cursor/scroll position in `inputEditor` -- see `onInputCursor()` below. */
  onInputCursor,

  /**
   * Called from a `useEffect()` hook in our `<InputEditor />`:  if `editor.file.initialSelection` is set and
   * things are ready to go, scroll `inputEditor` and select it.
   * - Prefers each position's `offset` over its `line` / `ch`, which go stale as the text changes.
   * - SIDE EFFECT:  clears `initialSelection`, so we only do it once, and focuses `inputEditor`.
   */
  onInputEffect(): void {
    const { file } = editor
    const inputEditor = inputEditorInstance
    const model = inputEditor?.getModel()
    const { initialSelection } = file || {}
    if (!inputEditor || !model || !file?.isLoaded || !initialSelection) return
    // still showing the last file:  the new one's editor will do it when it mounts
    if (inputEditorPath !== file.path) return
    delete file.initialSelection

    const { scroll, anchor, head } = initialSelection
    if (scroll) inputEditor.setScrollTop(scroll.current)
    if (anchor && head) {
      const start = positionIn(model, anchor)
      const end = positionIn(model, head)
      const selection = {
        selectionStartLineNumber: start.lineNumber,
        selectionStartColumn: start.column,
        positionLineNumber: end.lineNumber,
        positionColumn: end.column
      }
      inputEditor.setSelection(selection)
      inputEditor.revealRangeInCenterIfOutsideViewport(inputEditor.getSelection()!)
    }
    inputEditor.focus()

    /** Monaco position of `position` in `model`:  by `offset` if it has one, else `line` / `ch`. */
    function positionIn(textModel: monaco.editor.ITextModel, position: UIT.EditorPosition): monaco.IPosition {
      if (position.offset !== undefined) return textModel.getPositionAt(position.offset)
      return textModel.validatePosition({ lineNumber: position.line + 1, column: position.ch + 1 })
    }
  },

  /**
   * `file` was edited in its Monaco model, and has taken the text -- see `SpellModels`.
   * - Compiles 2 seconds after input settles, if it's in the project we're showing.
   */
  onFileEdited(file: SP.AnySpellFile): void {
    // by path:  one of them may be a store proxy of the other
    if (file.project.path === editor.project?.path) editor.compileAppSoon(2)
  },

  /**
   * Show the file at `path`, selecting `selection`, e.g. "go to definition" in another file.
   * - Selects it straight away, THEN updates the URL, whose route finds the file already showing.
   */
  async showFileAt(path: string, selection?: UIT.EditorSelection): Promise<void> {
    await editor.selectPath(path, selection)
    navigate(new SP.SpellLocation(path).editorUrl)
    editor.onInputEffect()
  },

  /**
   * The user edited `inputEditor`'s text to `value`, in `<InputEditor>`'s fallback editor, which has no model.
   * - The normal editor's edits go through `SpellModels` instead -- see `onFileEdited()`.
   */
  onInputChanged(value: string): void {
    const { file, project } = editor
    if (!file || !project) return
    file.isDirty = true
    if (file instanceof SP.SpellFile) void project.updateText(file, value)
    else {
      file.contents = value
      project.updatedContentsFor(file)
    }
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

/** The runtime programs run on, once loaded -- OUTSIDE the store, whose proxies would wrap it.  See `loadRuntime()`. */
let appRuntime: SpellRuntime | undefined
/** Loading `appRuntime`, once asked for. */
let loadingRuntime: Promise<SpellRuntime> | undefined
/** Where the running app draws -- OUTSIDE the store too.  See `editor.setAppRoot()`. */
let appRoot: HTMLElement | undefined

/**
 * `spellCore` of the runtime programs run on -- `undefined` until it's loaded, see `editor.loadRuntime()`.
 * - NOT an import of `$/core`:  the app MUST NOT load one of its own, see `spellRuntime.ts`.
 * - A function, NOT a getter on `editor`:  the store would hand it out wrapped in a proxy -- see "Store proxies
 *   stand in for the real objects" in `CODE-DEBT.md`.  Worse, its class is named `spellCore`, which the proxy
 *   library looks up on `window` -- where `debug.ts` puts THIS, so a store getter recursed forever.
 * - Reads `editor.runtimeLoaded`, so a `view()` calling it redraws once it's loaded.
 */
export function runtimeSpellCore(): SpellRuntime["spellCore"] | undefined {
  return editor.runtimeLoaded ? appRuntime?.spellCore : undefined
}

/** Console programs print to -- where the editor says what it's compiling, too.  See `runtimeSpellCore()`. */
export function runtimeConsole(): SpellConsole | undefined {
  return runtimeSpellCore()?.console
}

/** Monaco editor of our `<InputEditor>`, if one's mounted -- OUTSIDE the store, see `editor.getInputEditor()`. */
let inputEditorInstance: monaco.editor.IStandaloneCodeEditor | undefined
/** Path of the file `inputEditorInstance` shows. */
let inputEditorPath: string | undefined

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

/**
 * `inputEditor`'s cursor moved (`event` `"cursor"`) or it scrolled (`"scroll"`):  remember where, in `selection`.
 * - SIDE EFFECT:  saves it as the file's pref too, for `selectPath()` to restore.
 */
function onInputCursor(event: UIT.EditorScrollInfo["event"]): void {
  const { file } = editor
  const inputEditor = inputEditorInstance
  const model = inputEditor?.getModel()
  const selection = inputEditor?.getSelection()
  if (!inputEditor || !model || !selection) return

  const { direction, current: oldCurrent } = editor.selection?.scroll || {}
  // allocate this way to make console debugging easier
  const scroll: UIT.EditorScrollInfo = { event, direction, percent: 0, max: 0, current: 0, total: 0, visible: 0 }
  scroll.current = Math.floor(inputEditor.getScrollTop())
  scroll.total = Math.floor(inputEditor.getScrollHeight())
  scroll.visible = inputEditor.getLayoutInfo().height
  scroll.max = scroll.total - scroll.visible
  scroll.percent = parseFloat((scroll.current / scroll.max).toPrecision(4))
  // update "direction" if we can
  if (typeof oldCurrent === "number" && oldCurrent !== scroll.current) {
    scroll.direction = oldCurrent < scroll.current ? "down" : "up"
  }

  const anchor = editorPosition(selection.selectionStartLineNumber, selection.selectionStartColumn)
  const head = editorPosition(selection.positionLineNumber, selection.positionColumn)
  editor.selection = { scroll, anchor, head }
  // store selection as file `pref`, we'll reload it in `selectPath()` above.
  if (file) editor.lastSelectionForFile(file.path, editor.selection)

  /** `UIT.EditorPosition` for Monaco's 1-based `lineNumber` + `column`. */
  function editorPosition(lineNumber: number, column: number): UIT.EditorPosition {
    return {
      line: lineNumber - 1,
      ch: column - 1,
      top: Math.floor(inputEditor!.getTopForPosition(lineNumber, column)),
      offset: model!.getOffsetAt({ lineNumber, column })
    }
  }
}

/**
 * The app's dialogs (`$/app/solid/modals`), loaded on first use.
 * - Dynamic:  they bring Solid and `$/ui`, which `editor.ts` -- imported by nearly everything -- shouldn't.
 */
function dialogs() {
  return import("$/app/solid/modals")
}

////////////////
// ## Running helpers
////////////////

/**
 * URL of the runtime programs run on -- also their `@spell/core`, so it MUST be the one `loadRuntime()` imports.
 * - dev:  vite serves its source;  a build has it as its own entry, at a FIXED name -- see `vite.config.ts`.
 */
function runtimeUrl(): string {
  const path = import.meta.env.DEV ? "/src/runner/spellRuntime.ts" : `${import.meta.env.BASE_URL}spell-runtime.js`
  return new URL(path, location.href).href
}

/** Compiled javascript of project `projectId`, which the program imports -- fetched afresh, from the server. */
async function fetchCompiled(projectId: string): Promise<string> {
  const response = await fetch(`/api/projects/compiled/${projectId}`, { cache: "no-cache" })
  if (!response.ok) throw new Error(`Couldn't load project '${projectId}':  ${response.status} ${response.statusText}`)
  return response.text()
}
