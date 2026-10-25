import { UIError, Observable, prop, CONFIRM } from "spell/util"

import { P } from "spell-parser/parser"
import { SP } from "spell-parser/spell"
import { SPACES } from "spell-app/spaces"
import type { SpellConsole } from "spell-parser/core/console"
import type { LSP } from "spell-app/lsp"
import type { SpellRuntime } from "spell-app/app/runner"
import type * as UIT from "spell-app/app/ui/ui.types"
import type { monaco } from "spell-app/app/ui/monaco"
// NOTE: types only:  the dialogs themselves load on first use, see `dialogs()`.
import type * as Modals from "spell-app/app/solid/modals"
import { navigate } from "spell-app/app/pages/navigation"
import { appTexts } from "spell-app/app/ui/AppTexts"
import { editorPrefs } from "spell-app/app/editorPrefs"
// Import directly, NOT through the runner barrel, which brings the runners
import { wordsOfLanguages } from "spell-app/app/runner/words"
import { isStaticBuild } from "spell-app/app/static/staticBuild"
import { staticFiles } from "spell-app/app/static/StaticFiles"

////////////////
// ## The editor
////////////////

/**
 * The editor:  what the app shows -- project root, project, file, selection, notices -- and everything it does.
 * - Its state is spell cells (`@prop`):
 *   `editor.x = y` anywhere, and Solid code reading `editor.x` re-runs
 *   (through the cells bridge, `spell-app/app/solid/cellsBridge`).
 *   A read right after a write sees it.
 * - ONE instance, `editor`, below.
 * - NOTE: methods say `editor.x`, NEVER `this`:  they're handed around unbound, e.g. `setTimeout(editor.compileApp)`.
 * - NOTE: a plain field (`compileAppSoonTimer`, the `last...For...()` helpers) is NOT reactive.
 */
export class EditorStore extends Observable {
  ////////////////
  // ## Project and project actions
  ////////////////

  /**
   * `SPACES.SpellProjectRoot` shown in `SpellEditor`.
   * - Update with `editor.showEditor()`.
   */
  @prop()
  accessor projectRoot: SPACES.SpellProjectRoot | undefined
  /** Get/save last viewed `projectPath` for `projectRootPath`. */
  lastProjectForRoot = lastProjectForRoot

  /**
   * Current `SP.SpellProject` shown in `SpellEditor`.
   * - Update with `editor.showEditor()`.
   */
  @prop()
  accessor project: SP.SpellProject | undefined
  /** Get/save last viewed full `filePath` for `projectPath`. */
  lastFileForProject = lastFileForProject

  /**
   * `SpellFile` etc shown in `SpellEditor`.
   * - Update with `editor.showEditor()`.
   */
  @prop()
  accessor file: EditorFile | undefined
  /** Get/save last `selection` for `filePath`.  */
  lastSelectionForFile = lastSelectionForFile

  /** Show the project / example / guide chooser page. */
  showProjectChooser(): void {
    navigate("/")
  }

  /**
   * Show `<SpellEditor>` for `path` (default:  current file), and compile.
   * - Updates the URL, whose route calls `selectPath()`.
   */
  showEditor(path?: string, selection?: UIT.EditorSelection): void {
    if (!path) path = editor.file?.path
    // TODO: selection!!!!
    try {
      navigate(new SP.SpellLocation(path!).editorUrl)
      void editor.compileApp()
    } catch {
      editor.showError(appTexts.text("pathInvalid", { path: String(path) }))
    }
  }

  /**
   * Show `<SpellEditor>` in Run for `path` (default:  current file), and compile.
   * - Updates the URL, whose route calls `selectPath()`.
   */
  async showRunner(path?: string): Promise<void> {
    if (!path) path = editor.file?.path
    try {
      navigate(new SP.SpellLocation(path!).runnerUrl)
      void editor.compileApp()
    } catch {
      editor.showError(appTexts.text("pathInvalid", { path: String(path) }))
    }
  }

  /**
   * Show the current `project`'s settings, in a dialog (`<ProjectSettings>`).
   * - Through a DYNAMIC `import()`:  `editor.ts` stays free of Solid and `spell-ui`.
   * - NEVER throws:  an error loading the dialog, or saving, shows as the editor's error.
   */
  showProjectSettings(): void {
    const { project, projectRoot } = editor
    if (!project || !projectRoot) return
    void import("spell-app/app/pages/ProjectSettings")
      .then(({ openProjectSettings }) => openProjectSettings(project, projectRoot, (error) => editor.showError(error)))
      .catch((error) => editor.showError(error))
  }

  // TODO: these are referenced by `spell-app/app/solid`'s `Actions` but not yet implemented.
  /** Show help. TODO: not yet implemented. */
  showHelp(): void {
    console.warn("TODO: editor.showHelp() not yet implemented")
  }
  /**
   * Show the "You" panel (`openYouPanel()`, epic `people-and-orgs` P9):
   * this machine's person to change, and their orgs.
   * - Save writes their `__me.json5`.
   * - An error reading or saving them shows as the editor's error.
   */
  async showYou(): Promise<void> {
    try {
      await (await dialogs()).openYouPanel()
    } catch (error) {
      editor.showError(error)
    }
  }

  /**
   * Last project page shown:  `"editor"` or `"runner"`.
   * - Set by `<SpellEditor>`'s route:  `runner` for `/run/`.
   */
  @prop({ type: "text", default: "editor" })
  accessor projectPage!: "editor" | "runner"

  /**
   * Select a `path` to show in `<SpellEditor>`, in Edit or Run.
   * - Pass `selection` (its `anchor` and `head`) to set the cursor in the file.
   */
  async selectPath(path: string, selection?: UIT.EditorSelection): Promise<void> {
    let location: SP.SpellLocation
    try {
      location = new SP.SpellLocation(path)
    } catch {
      console.warn(`editor.selectPath('${path}'): invalid path`)
      // default to user projects if `new SP.SpellLocation()` throws
      location = new SP.SpellLocation("owen@spell")
    }
    console.info("editor.selectPath", { path, location })

    const projectRoot = new SPACES.SpellProjectRoot(location.projectRoot)
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
  }

  /**
   * Show `match` in its file, with the cursor on it.
   * - May be off if the text has changed since it matched.
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
  }

  /**
   * Create an app in `projectRoot` (default:  the current one), and show it.
   * - No `projectId`:  asks the user for one.
   */
  async createApp(projectRoot?: SPACES.SpellProjectRoot, projectId?: string): Promise<void> {
    // NOTE: defaulted here, NOT in the signature:
    // a default referencing `editor` would make `typeof EDITOR_DEFAULTS` circular,
    // since defaults are part of the member's type.
    projectRoot ??= editor.projectRoot!
    try {
      const project = await projectRoot.createApp(projectId)
      if (project) {
        editor.showEditor(project.path)
        editor.showNotice(appTexts.text("createdApp", { ...appTexts.groupWords(projectRoot), name: project.title }))
      }
    } catch (e) {
      editor.showError(e)
    }
  }

  /** Duplicate current `project` under `newProjectId` (auto-generated if omitted) and show it. */
  async duplicateApp(newProjectId?: string): Promise<void> {
    try {
      const newProject = await editor.projectRoot!.duplicateApp(editor.project!.projectId, newProjectId)
      // console.warn({ newProject })
      if (newProject) {
        editor.showEditor(newProject.path)
        editor.showNotice(appTexts.text("duplicatedApp", appTexts.groupWords(editor.projectRoot)))
      }
    } catch (e) {
      editor.showError(e)
    }
  }
  /** Rename current `project` to `newProjectId` and show it. */
  async renameApp(newProjectId?: string): Promise<void> {
    try {
      const project = await editor.projectRoot!.renameApp(editor.project!.projectId, newProjectId)
      if (project) {
        editor.showEditor(project.path)
        editor.showNotice(appTexts.text("renamedApp", appTexts.groupWords(editor.projectRoot)))
      }
    } catch (e) {
      editor.showError(e)
    }
  }
  /** Delete current `project` (after `CONFIRM`), then navigate to `projectRoot`, which selects another project. */
  async deleteApp(): Promise<void> {
    try {
      const { projectRoot, project } = editor
      const removed = await projectRoot!.deleteApp(project!.projectId, CONFIRM)
      if (removed) {
        // Navigate to nextProject, or the projectRoot, which will select another project
        editor.showEditor(projectRoot!.path)
        editor.showNotice(appTexts.text("removedApp", appTexts.groupWords(projectRoot)))
      }
    } catch (e) {
      editor.showError(e)
    }
  }

  /**
   * Compile current `project` and, if compilation produced output, execute it.
   * - SIDE EFFECT: clears `runtimeConsole()` and cancels any pending `compileAppSoon()` timer first.
   */
  async compileApp(): Promise<void> {
    const { project, file } = editor
    if (!project || !file) return

    const output = (await editor.loadRuntime()).core.console
    output.clear()
    try {
      output.group(appTexts.text("consoleCompiling"), project)

      editor.clearCompileAppSoon()
      await project.compile()
      // the Types tab:  its tree follows the code, compiled or not
      await editor.refreshScopes()
      const { compiled } = project

      if (compiled) {
        output.groupCollapsed(appTexts.text("consoleCompiledTo"))
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
  }

  /**
   * Compile current `project` and run it afresh, on purpose:  the Restart button, a new deal (Q25).
   * - Every other compile keeps the program's things, e.g. the game in progress -- see `executeCompiledApp()`.
   */
  async restartApp(): Promise<void> {
    editor.startAfresh = true
    await editor.compileApp()
  }

  /**
   * The static build's "Reset Example":  forget the visitor's edits to current `project`, after asking,
   * and show it as the build has it (`StaticFiles.reset()`).
   * - SIDE EFFECT:  reloads the page, so every file, model and run starts from the build's copy.
   */
  async resetApp(): Promise<void> {
    const { project, projectRoot } = editor
    if (!project) return
    const message = appTexts.text("resetAppConfirm", appTexts.groupWords(projectRoot))
    if (!(await editor.confirm({ message }))) return
    await staticFiles.reset(project.projectId)
    location.reload()
  }

  /**
   * Keep `file`'s edit at once, in the static build:  its visitors never press Save, and a reload keeps their edit.
   * - Saved through `LoadableFile.fetch`, which keeps it in the browser (`StaticFiles`).
   * - Elsewhere it waits for Save, as ever.
   * - NEVER throws:  a failure is logged.
   */
  keepEdit(file: SP.AnySpellFile): void {
    if (!isStaticBuild) return
    void file.save(undefined)?.catch((error) => console.error(`couldn't keep the edit to ${file.path}:`, error))
  }

  /** Does the next run start afresh?  Set by `restartApp()`, and cleared as the run starts. */
  startAfresh = false

  /** Path of the project run last:  a compile of the same project keeps its things. */
  lastExecutedPath: string | undefined = undefined

  /**
   * Run current `project`, already `compiled`, on the runtime programs run on.
   * - Logs how it went to `runtimeConsole()`.  See `runCompiled()`.
   * - The project run last, compiled again:  its things carry over, e.g. the game in progress
   *   (epic `drawable-thing` P16), unless:
   *   - `restartApp()` asked for a fresh start
   *   - or the edit changed the program's start (`runCompiled()`, P17)
   * - Runs what it wrote to `<Project>.spell.js`:  its declarations are in `<Project>.declarations.json5`.
   * - Its remembered props come back from its last run, kept under its project id (`runCompiled()`).
   * - Each project it imports is fetched afresh, so a recompiled library shows at once.
   * - An error's stack goes to devtools too -- `runCompiled()` logs it.
   */
  async executeCompiledApp(): Promise<void> {
    const { project } = editor
    const compiled = project?.outputFile.contents ?? project?.compiled
    if (!project || !compiled) return
    const runtime = await editor.loadRuntime()
    const output = runtime.core.console
    const words = appTexts.groupWords(editor.projectRoot)
    output.group(appTexts.text("consoleExecuting", words))
    const keepThings = !editor.startAfresh && editor.lastExecutedPath === project.path
    editor.startAfresh = false
    editor.lastExecutedPath = project.path
    // a program in another language draws with that language's tags (`<es-texto>`) and says its tests' lines in it,
    // as `<SpellAppRunner>` runs it:  Spell UI defines the tags first (epic `spanish` P21)
    const lang = project.wordsLanguages[0]
    // the Things tab's words:  a words file per language its files are in, the one it speaks first
    editor.programWords = wordsOfLanguages(project.wordsFiles.map((file) => SP.SpellWords.read(file.contents ?? "")))
    if (lang && lang !== "en") {
      const { RootLoader } = await import("spell-ui/components/ui-root")
      // oxlint-disable-next-line react-hooks/rules-of-hooks -- Spell UI's `useLanguage()` is no React hook
      await RootLoader.useLanguage(lang)
    }
    const error = await runtime.runApp(compiled, {
      appRoot,
      coreUrl: runtimeUrl(),
      keepConsole: true,
      keepThings,
      loadImport: fetchCompiled,
      messages: lang ? SP.SpellWords.messagesFor(lang) : undefined,
      projectId: project.projectId
    })
    output.groupEnd()
    if (error) output.error(appTexts.text("consoleFailed", words), error)
    else output.info(appTexts.text("consoleExecuted", words))
  }

  /** Timer id for a pending `compileAppSoon()`, if any. */
  compileAppSoonTimer: ReturnType<typeof setTimeout> | undefined = undefined
  /** Compile after `delay` seconds. */
  compileAppSoon(delay: number = 1): void {
    editor.clearCompileAppSoon()
    editor.compileAppSoonTimer = setTimeout(editor.compileApp, delay * 1000)
  }
  /** Cancel pending `compileAppSoon()` timer, if any. */
  clearCompileAppSoon(): void {
    if (editor.compileAppSoonTimer) {
      clearTimeout(editor.compileAppSoonTimer)
      editor.compileAppSoonTimer = undefined
    }
  }

  ////////////////
  // ## Running
  ////////////////

  /**
   * Has the runtime programs run on loaded?  See `loadRuntime()`.
   * - The runtime itself is NOT spell state:  read it with `runtimeCore()` / `runtimeConsole()`.
   */
  @prop({ type: "choice", default: false })
  accessor runtimeLoaded!: boolean

  /**
   * The runtime programs run on, loaded the first time it's asked for.
   * - ONE for the page:  the editor runs one program at a time.
   * - Where it's loaded from (see `runtimeUrl()`):
   *   - dev:  `src/runner/spellRuntime.ts`, as vite serves it
   *   - a build:  its own `spell-runtime.js`, see `vite.config.ts`
   * - SIDE EFFECT:  parse errors show on its console, as program output does -- see `SP.SpellFile.errorConsole`.
   */
  loadRuntime(): Promise<SpellRuntime> {
    loadingRuntime ??= (import(/* @vite-ignore */ runtimeUrl()) as Promise<SpellRuntime>).then((runtime) => {
      appRuntime = runtime
      SP.SpellFile.errorConsole = runtime.core.console
      editor.runtimeLoaded = true
      return runtime
    })
    return loadingRuntime
  }

  /**
   * Set where the running app draws:  `<AppRoot>` hands it over, as a ref.
   * - NOT spell state.
   * - A new place while a program's compiled, e.g. moving from Edit to Run:  the program starts again there,
   *   afresh (`executeCompiledApp()`), as moving to the same project doesn't recompile it.
   *   - Afresh:  a run that carries its things over skips starting its app, so the new place would stay empty.
   */
  setAppRoot(element: HTMLElement | null): void {
    // the old page's `<AppRoot>` may have let go first (`releaseAppRoot()`):  any element but the current is new
    const isNewPlace = !!element && element !== appRoot
    appRoot = element ?? undefined
    if (isNewPlace && editor.project?.compiled) {
      editor.startAfresh = true
      void editor.executeCompiledApp().catch(editor.showError)
    }
  }
  /**
   * Forget `element` as where the running app draws -- if it still is:  `<AppRoot>`'s cleanup.
   * - Why "if":  moving between the editor and the runner,
   *   the old page's cleanup may run AFTER the new page's `<AppRoot>` handed its own over,
   *   which must not be forgotten.
   */
  releaseAppRoot(element: HTMLElement): void {
    if (appRoot === element) appRoot = undefined
  }

  ////////////////
  // ## Explorers:  the Types and Things tabs
  ////////////////

  /**
   * Scope tree of current `project`, for the Types tab -- see `LSP.ScopeExplorer`.
   * - Worked out again after each compile, by `refreshScopes()`.
   * - `undefined` until the editor's language service has loaded, with Monaco.
   */
  @prop()
  accessor scopeTree: LSP.ScopeNode | undefined

  /**
   * Spell's words for the members of the running program's types, for the Things tab -- see `SP.SpellWords`.
   * - From the project's own words files, read as each run starts.
   */
  @prop()
  accessor programWords: SP.SpellWordsData | undefined

  /**
   * Hand over the scope explorer on the editor's in-page language service:  `LazyMonaco` does, once Monaco loads.
   * - NOT spell state.
   * - Handed over, not made here:  `spell-app/lsp` is in Monaco's lazy chunk, and `editor.ts` is in the main one.
   * - SIDE EFFECT:  works out the current project's tree at once.
   */
  setScopeExplorer(explorer: LSP.ScopeExplorer): void {
    scopeExplorer = explorer
    void editor.refreshScopes()
  }

  /**
   * Work out current `project`'s scope tree again, into `scopeTree`:  after each compile.
   * - Parses the projects it imports compiled first, once each, to show their sources (see `LSP.ScopeExplorer`).
   * - NEVER throws:  a tree that can't be worked out keeps the last one, and says why in devtools.
   */
  async refreshScopes(): Promise<void> {
    const { project } = editor
    const explorer = scopeExplorer
    if (!project || !explorer) return
    try {
      // its class's static, through the instance:  `editor.ts` imports LSP's TYPES only, see `setScopeExplorer()`
      const { importedProjects } = explorer.constructor as typeof LSP.ScopeExplorer
      for (const imported of importedProjects(project)) {
        if (parsedImports.has(imported)) continue
        await imported.parse()
        parsedImports.add(imported)
      }
      // another project shown meanwhile:  its own refresh is on the way
      if (project !== editor.project) return
      editor.scopeTree = explorer.tree(project)
    } catch (error) {
      console.error("editor.refreshScopes():  couldn't work out the scope tree", error)
    }
  }

  /**
   * Details of Types tab node or member `path` -- `null` if it isn't in the last tree.
   * - An arrow:  handed to `<TypeExplorer loadDetails>` as is.
   */
  scopeDetails = async (path: string): Promise<LSP.ScopeDetails | null> => {
    const { project } = editor
    return project && scopeExplorer ? scopeExplorer.details(project, path) : null
  }

  /**
   * Show the place a Types tab link points to, e.g. `spell:/@spell/examples/Solitaire/Card.spell#L12`.
   * - The editor's own addresses (`AppAddresses`):  `spell:/<file.path>`, then the line, if any.
   * - Anything else opens in a new browser tab, e.g. a link in a docstring.
   */
  openScopeLink = (href: string): void => {
    const [, encodedPath, line] = href.match(/^spell:\/([^#]*)(?:#L(\d+))?/) ?? []
    if (encodedPath === undefined) {
      window.open(href, "_blank", "noopener")
      return
    }
    const at = { line: Math.max(Number(line ?? 1) - 1, 0), ch: 0 }
    void editor.showFileAt(decodeURIComponent(encodedPath), { anchor: at, head: at })
  }

  ////////////////
  // ## Projects actions
  ////////////////
  /** Create a new project under `SPACES.SpellProjectRoot.projects`. */
  createProject(projectId?: string): Promise<void> {
    return editor.createApp(SPACES.SpellProjectRoot.projects, projectId)
  }

  ////////////////
  // ## Examples actions
  ////////////////
  /** Create a new example under `SPACES.SpellProjectRoot.examples`. */
  async createExample(projectId?: string): Promise<void> {
    return editor.createApp(SPACES.SpellProjectRoot.examples, projectId)
  }

  ////////////////
  // ## Guides actions
  ////////////////
  /** Create a new guide under `SPACES.SpellProjectRoot.guides`. */
  async createGuide(projectId?: string): Promise<void> {
    return editor.createApp(SPACES.SpellProjectRoot.guides, projectId)
  }

  ////////////////
  // ## File actions
  ////////////////

  /** Save current `file` if it's loaded. */
  async saveFile(): Promise<void> {
    const { file } = editor
    if (file?.isLoaded) await file.save(undefined)
  }
  /** Reload current `file` from disk/storage and recompile. */
  async reloadFile(): Promise<void> {
    editor.clearCompileAppSoon()
    const { file } = editor
    if (file) {
      await file.reload()
      void editor.compileApp()
    }
  }
  /** Create `filePath` (with optional `contents`) in current `project` and show it. */
  async createFile(filePath?: string, contents?: string): Promise<void> {
    editor.clearCompileAppSoon()
    try {
      const newFile = await new SPACES.ProjectFiles(editor.project!).create(filePath, contents)
      if (newFile) {
        editor.showEditor(newFile.path)
        editor.showNotice(appTexts.text("fileCreated"))
      }
    } catch (e) {
      editor.showError(e)
    }
  }
  /** Duplicate current `file` to `newPath` and show it. */
  async duplicateFile(newPath?: string): Promise<void> {
    editor.clearCompileAppSoon()
    try {
      const newFile = await new SPACES.ProjectFiles(editor.project!).duplicate(editor.file!.filePath!, newPath)
      if (newFile) {
        editor.showEditor(newFile.path)
        editor.showNotice(appTexts.text("fileDuplicated"))
      }
    } catch (e) {
      editor.showError(e)
    }
  }
  /** Rename current `file` to `newPath` and show it. */
  async renameFile(newPath?: string): Promise<void> {
    editor.clearCompileAppSoon()
    try {
      const renamedFile = await new SPACES.ProjectFiles(editor.project!).rename(editor.file!.filePath!, newPath)
      if (renamedFile) {
        editor.showEditor(renamedFile.path)
        editor.showNotice(appTexts.text("fileRenamed"))
      }
    } catch (e) {
      editor.showError(e)
    }
  }
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
      const removed = await new SPACES.ProjectFiles(project).delete(file.filePath!, CONFIRM)
      if (removed) {
        // select the nextFile, or the project (which will select another file)
        editor.showEditor(nextFile?.path || project.path)
        editor.showNotice(appTexts.text("fileRemoved"))
      }
    } catch (e) {
      editor.showError(e)
    }
  }

  /**
   * Make a property editor PAGE for one of current `project`'s types, and show it (epic `property-editor` P6).
   * - e.g. `Card.editor.html`, for its type `Card`
   * - No `type`:  asks which (`choose()`), of the types its declarations list;  cancelled:  nothing happens.
   * - What it writes, and from what:  `PropertyEditorFiles` (`spell-app/app/ui/PropertyEditorFiles`).
   *   - the type's schema:  the running program's class when it runs this project, else its declarations
   *   - a name that's taken:  `Card2.editor.html`, never the page that's there
   * - Through a DYNAMIC `import()`:  `editor.ts` stays free of `spell-ui`.
   * - NEVER throws:  an error shows, e.g. a project never compiled has no types yet.
   */
  async createPropertyEditor(type?: string): Promise<void> {
    const { project } = editor
    if (!project) return
    // its group's words, for the errors:  `Example Solitaire has no types yet`
    const named = { ...appTexts.groupWords(editor.projectRoot), name: project.title }
    try {
      const { PropertyEditorFiles } = await import("spell-app/app/ui/PropertyEditorFiles")
      if (!type) {
        const types = await PropertyEditorFiles.typesOf(project)
        if (!types.length) throw new UIError(appTexts.text("noTypesYet", named))
        type = (await editor.choose({
          header: appTexts.text("propertyEditorHeader"),
          message: appTexts.text("propertyEditorMessage"),
          options: types,
          defaultValue: types[0],
          ok: appTexts.text("create")
        })) as string | undefined
        if (!type) return
      }
      const schema = await PropertyEditorFiles.schemaForType(project, type)
      if (!schema) throw new UIError(appTexts.text("noSuchType", { ...named, typeName: type }))
      await editor.createFile(PropertyEditorFiles.fileNameFor(project, type), PropertyEditorFiles.pageFor(schema))
    } catch (e) {
      editor.showError(e)
    }
  }

  ////////////////
  // ## Dialogs
  ////////////////

  /** Dev helper -- show a `confirm()` dialog and log the resolved answer. */
  async testDialog(): Promise<void> {
    const reply = await editor.confirm({ header: "Header", message: "Message?", ok: "Yep", cancel: "Nope" })
    console.warn("testDialog resolved with ", reply)
  }

  /**
   * Get the user's answer to some question:  a `<ui-modal>` (`spell-app/app/solid/modals`, on `spell-ui`).
   * - `props`, or just the `message` string, for the other defaults:
   *   - `message` (required):  message to show
   *   - `header` (optional):  header for the dialog;  default:  no header
   *   - `ok` (optional):  OK button text;  default `"OK"`
   *   - `cancel` (optional):  Cancel button text;  default `"Cancel"`
   * - What each resolves:
   *   - `alert()`:  always `undefined` (there's only an OK button)
   *   - `confirm()`:  `true` / `false` for the OK / Cancel buttons (Escape is Cancel)
   *   - `prompt()` / `promptForNumber()`:  the field's string value, or `undefined` if cancelled or empty
   */
  alert(props: string | Modals.AlertModalProps): Promise<undefined> {
    return dialogs().then((modals) => modals.alert(props))
  }

  /** See `alert()` above for shared `props` docs.  Resolves `true`/`false` for OK/Cancel button. */
  confirm(props: string | Modals.ConfirmModalProps): Promise<boolean> {
    return dialogs().then((modals) => modals.confirm(props))
  }

  /** See `alert()` above for shared `props` docs.  Resolves field's string value, or `undefined` if cancelled. */
  prompt(props: string | Modals.PromptModalProps): Promise<string | undefined> {
    return dialogs().then((modals) => modals.prompt(props))
  }

  /** Like `prompt()`, but numeric input -- defaults `type: "number"` and `step: 1`. */
  promptForNumber(props: string | Modals.PromptModalProps): Promise<string | undefined> {
    return dialogs().then((modals) => modals.promptForNumber(props))
  }

  /** Show a chooser modal.  Rejects instead of showing anything if `message`/`options` are missing. */
  choose(props?: Modals.ChooserModalProps): Promise<unknown> {
    if (!props?.message || !props.options) {
      console.warn("editor.choose(): must pass 'message' and 'options', got:", props)
      return Promise.reject(undefined)
    }
    return dialogs().then((modals) => modals.choose(props))
  }

  ////////////////
  // ## InputEditor event handlers
  ////////////////

  /**
   * Monaco editor of our `<InputEditor>`, if one's mounted.
   * - NEVER spell state:  nothing should follow Monaco's internals -- see `inputEditorInstance`.
   * TODO: generalize this for multiple editors!
   */
  getInputEditor(): monaco.editor.IStandaloneCodeEditor | undefined {
    return inputEditorInstance
  }
  /**
   * Remember `inputEditor`, showing `editor.file`, in our `<InputEditor onMount />` event.
   * - `api` is Monaco itself, handed over as Monaco is loaded lazily -- see `spell-app/app/solid`'s `LazyMonaco`.
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
  }
  /** Forget `inputEditor` in our `<InputEditor onUnmount />` event. */
  onInputWillUnmount(inputEditor: monaco.editor.IStandaloneCodeEditor): void {
    if (inputEditorInstance === inputEditor) inputEditorInstance = undefined
  }

  /** Cursor, selection and scroll in `inputEditor`, kept by `onInputCursor()`. */
  @prop()
  accessor selection: UIT.EditorSelection | undefined
  /** Track cursor/scroll position in `inputEditor` -- see `onInputCursor()` below. */
  onInputCursor = onInputCursor

  /**
   * Scroll `inputEditor` to `editor.file.initialSelection` and select it, if it's set and things are ready.
   * - `<InputEditor />` calls it once its editor is made,
   *   and again when the file, its `isLoaded` or its `initialSelection` change.
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
  }

  /**
   * `file` was edited in its Monaco model, and has taken the text -- see `SpellModels`.
   * - Compiles 2 seconds after input settles, if it's in the project we're showing.
   * - The static build keeps the edit at once (`keepEdit()`).
   */
  onFileEdited(file: SP.AnySpellFile): void {
    editor.keepEdit(file)
    // by path:  cheap, and the same however the project was reached
    if (file.project.path === editor.project?.path) editor.compileAppSoon(2)
  }

  /**
   * Show the file at `path`, selecting `selection`, e.g. "go to definition" in another file.
   * - Selects it straight away, THEN updates the URL, whose route finds the file already showing.
   */
  async showFileAt(path: string, selection?: UIT.EditorSelection): Promise<void> {
    await editor.selectPath(path, selection)
    navigate(new SP.SpellLocation(path).editorUrl)
    editor.onInputEffect()
  }

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
    editor.keepEdit(file)
    // auto-compile 2 seconds after input settles
    editor.compileAppSoon(2)
  }

  ////////////////
  // ## UI
  ////////////////

  /** Text of the notice banner, if one's showing. */
  @prop({ type: "text" })
  accessor notice: string | undefined
  /** Show the notice banner, with `notice` as its text. */
  showNotice(notice: string): void {
    console.info("showNotice:", notice)
    editor.notice = notice
  }
  /** Clear `notice` banner. */
  hideNotice(): void {
    editor.notice = undefined
  }

  /** Error shown in the error banner, if any. */
  @prop()
  accessor error: Error | undefined
  /** Show an error to the user. */
  showError(error: unknown): void {
    console.dir(error)
    editor.error = error instanceof Error ? error : new UIError(String(error))
  }
  /** Clear `error` banner. */
  hideError(): void {
    editor.error = undefined
  }
}

/** The runtime programs run on, once loaded -- NOT spell state:  nothing follows it.  See `loadRuntime()`. */
let appRuntime: SpellRuntime | undefined
/** Loading `appRuntime`, once asked for. */
let loadingRuntime: Promise<SpellRuntime> | undefined
/** Where the running app draws -- NOT spell state either.  See `editor.setAppRoot()`. */
let appRoot: HTMLElement | undefined
/** Scope explorer on the in-page language service, once Monaco's loaded -- NOT spell state.  See `editor.setScopeExplorer()`. */
let scopeExplorer: LSP.ScopeExplorer | undefined
/** Projects imported compiled that `refreshScopes()` has parsed:  once each. */
const parsedImports = new WeakSet<SP.SpellProject>()

/**
 * `core` of the runtime programs run on -- `undefined` until it's loaded, see `editor.loadRuntime()`.
 * - NOT an import of `spell-parser/core`:  the app MUST NOT load one of its own, see `spellRuntime.ts`.
 * - A function, NOT a getter on `editor`:  callers outside the editor read it too.
 * - Reads `editor.runtimeLoaded`, so a reader calling it re-runs once it's loaded.
 */
export function runtimeCore(): SpellRuntime["core"] | undefined {
  return editor.runtimeLoaded ? appRuntime?.core : undefined
}

/** Console programs print to -- where the editor says what it's compiling, too.  See `runtimeCore()`. */
export function runtimeConsole(): SpellConsole | undefined {
  return runtimeCore()?.console
}

/** Monaco editor of our `<InputEditor>`, if one's mounted -- NOT spell state, see `editor.getInputEditor()`. */
let inputEditorInstance: monaco.editor.IStandaloneCodeEditor | undefined
/** Path of the file `inputEditorInstance` shows. */
let inputEditorPath: string | undefined

/** The `editor` singleton. */
export const editor = new EditorStore({})

////////////////
// ## Supporting types
////////////////

/**
 * Any of the file classes `editor.file` can hold, plus an ad-hoc `initialSelection`:
 * `editor.selectPath()` stashes it there, to tell `<InputEditor>` where to restore the cursor.
 */
export type EditorFile = SP.AnySpellFile & { initialSelection?: UIT.EditorSelection }

////////////////
// ## Overloaded helpers (`arguments.length`-sensitive, so plain `function`s rather than arrows)
////////////////

/** Get/save last viewed `projectPath` for `projectRootPath`. */
function lastProjectForRoot(projectRootPath: string): string | undefined
function lastProjectForRoot(projectRootPath: string, projectPath: string): string
function lastProjectForRoot(projectRootPath: string, projectPath?: string): string | undefined {
  if (arguments.length === 1) return editorPrefs.get<string>(projectRootPath)
  return editorPrefs.set(projectRootPath, projectPath)
}

/** Get/save last viewed full `filePath` for `projectPath`. */
function lastFileForProject(projectPath: string): string | undefined
function lastFileForProject(projectPath: string, filePath: string): string
function lastFileForProject(projectPath: string, filePath?: string): string | undefined {
  if (arguments.length === 1) return editorPrefs.get<string>(projectPath)
  return editorPrefs.set(projectPath, filePath)
}

/** Get/save last `selection` for `filePath`. */
function lastSelectionForFile(filePath: string): UIT.EditorSelection | undefined
function lastSelectionForFile(filePath: string, selection: UIT.EditorSelection): UIT.EditorSelection
function lastSelectionForFile(filePath: string, selection?: UIT.EditorSelection): UIT.EditorSelection | undefined {
  if (arguments.length === 1) return editorPrefs.get<UIT.EditorSelection>(filePath)
  return editorPrefs.set(filePath, selection)
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
 * The app's dialogs (`spell-app/app/solid/modals`), loaded on first use.
 * - Dynamic:  they bring Solid and `spell-ui`, which `editor.ts` -- imported by nearly everything -- shouldn't.
 */
function dialogs() {
  return import("spell-app/app/solid/modals")
}

////////////////
// ## Running helpers
////////////////

/**
 * URL of the runtime programs run on -- also their `@spell/core`, so it MUST be the one `loadRuntime()` imports.
 * - dev:  vite serves its source, beside this file (`runner/spellRuntime.ts`, outside the app's Vite root `app/`:
 *   wherever vite serves this file from);  a build has it as its own entry, at a FIXED name -- see `vite.config.ts`.
 * - NOTE: NOT `new URL(..., import.meta.url)`:  vite takes that for an asset to bundle, and inlines it.
 */
function runtimeUrl(): string {
  if (import.meta.env.DEV)
    return `${import.meta.url.slice(0, import.meta.url.lastIndexOf("/") + 1)}runner/spellRuntime.ts`
  return new URL(`${import.meta.env.BASE_URL}spell-runtime.js`, location.href).href
}

/**
 * Compiled javascript of project `projectId`, which the program imports -- fetched afresh, from the server:
 * its `<Project>.spell.js`, at `/spaces/<project>/<Project>.spell.js` (`SP.SpellUrls`).
 */
async function fetchCompiled(projectId: string): Promise<string> {
  const { projectName } = new SP.SpellLocation(projectId)
  const url = SP.SpellUrls.fileUrl(SP.SpellLocation.join(projectId, `${projectName}${SP.COMPILED_JS_SUFFIX}`))
  const response = await fetch(url, { cache: "no-cache" })
  if (!response.ok) throw new Error(`Couldn't load project '${projectId}':  ${response.status} ${response.statusText}`)
  return response.text()
}
