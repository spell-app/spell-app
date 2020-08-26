import global from "global"
import ReactDOM from "react-dom"
import { navigate } from "@reach/router"

import { FileScope } from "~/parser"
import { createStore, setPrefKey, getSetPref, CONFIRM } from "~/util"
import { spellCore, SpellProjectRoot, SpellProject, SpellLocation } from "~/languages/spell"
import { UI } from "./ui"

setPrefKey("spellEditor:")
export const store = createStore({
  //-----------------
  // Project and project actions
  //-----------------

  /**
   * `SpellProjectRoot` shown in `SpellEditor`.
   * Update with `store.showEditor()
   */
  projectRoot: undefined,
  /** Get/save last viewed `projectPath` for `projectRootPath`. */
  lastProjectForRoot: getSetPref("projectRootPath", "projectPath"),
  get appType() {
    return store.projectRoot?.Type || "Project"
  },

  /**
   * Current `SpellProject` shown in `SpellEditor`.
   * Update with `store.showEditor()`
   */
  project: undefined,
  /** Get/save last viewed full `filePath` for `projectPath`. */
  lastFileForProject: getSetPref("projectPath", "filePath"),

  /**
   * `SpellFile` etc shown in `SpellEditor`.
   * Update with `store.showEditor()`
   */
  file: undefined,
  /** Get/save last `selection` for `filePath`.  */
  lastSelectionForFile: getSetPref("filePath", "selection"),

  /**
   * Show the project / example / guide chooser page.
   */
  showProjectChooser() {
    return navigate("/")
  },

  /**
   * Show `<SpellEditor>` for a `path` by updating the URL, which will eventually call `selectPath`
   */
  showEditor(path, selection) {
    if (!path) path = store.file?.path
    // TODO: selection!!!!
    try {
      navigate(new SpellLocation(path).editorUrl)
      store.compileApp()
    } catch (e) {
      store.showError(`Path '${path}' is invalid!`)
    }
  },

  /**
   * Show `<SpellRunner>` for a `path` by updating the URL, which will eventually call `selectPath`
   */
  async showRunner(path) {
    if (!path) path = store.file?.path
    try {
      await navigate(new SpellLocation(path).runnerUrl)
      store.compileApp()
    } catch (e) {
      store.showError(`Path '${path}' is invalid!`)
    }
  },

  /**
   * Last project page we were showing: "editor" or "runner".
   * Set by `<SpellEditor>` or `<SpellRunner>`
   */
  projectPage: "editor",

  /**
   * Select a `path` to show in the `<SpellEditor/>` or `<SpellRunner>`.
   * Pass `selection` as `{ line, ch }` to set the cursor in the file.
   *  - ultimately this will always (?) come down to selecting a file.
   *  - Default project = last project selected for projectRoot or first project in root.
   *  - Default file = last file selected for project or first file in project.
   *  - Restores file selection if stored.
   */
  async selectPath(path, selection) {
    let location
    try {
      location = new SpellLocation(path)
    } catch (e) {
      console.warn(`store.selectPath('${path}'): invalid path`)
      // default to user projects if `new SpellLocation()` throws
      location = new SpellLocation("@user:projects")
    }
    console.info("store.selectPath", { path, location })

    const projectRoot = new SpellProjectRoot(location.projectRoot)
    const sameRoot = store.projectRoot === projectRoot
    if (!sameRoot) {
      console.info("selecting projectRoot", projectRoot)
      await projectRoot.load()
      store.projectRoot = projectRoot
    }
    const projectPaths = projectRoot.projectPaths

    // Figure out which project to show, using pref if not specified in `path`
    let projectPath =
      location.isProjectPath || location.isFilePath //
        ? location.projectPath
        : store.lastProjectForRoot(location.projectRoot)
    if (!projectPaths.includes(projectPath)) projectPath = projectPaths[0]
    // TODO: what if no project???
    const project = new SpellProject(projectPath)
    let sameProject = store.project === project
    if (!sameProject) {
      console.info("selecting project", project)
      // stop current compilation
      store.clearCompileAppSoon()
      // remember this project was selected for projectRoot
      store.lastProjectForRoot(location.projectRoot, projectPath)
      await project.load()
      // Clear application display when switching projects
      const appRoot = document.getElementById(spellCore.REACT_APP_ROOT_ID)
      if (appRoot) ReactDOM.unmountComponentAtNode(appRoot)
    }

    // Figure out which file to show, using pref if not specified in `path`
    let filePath = location.isFilePath //
      ? location.filePath
      : store.lastFileForProject(project.path)
    if (!filePath || !project.getFile(filePath)) {
      filePath = project.activeImports[0]?.path || project.files[0]?.path || ""
    }
    // TODO: what if no file???

    const file = project.getFile(filePath)
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
    await file.load()
    // If we switched projects, recompile
    if (!sameProject) store.compileApp()
  },

  /**
   * Given a `match`, attempt to show it and put the cursor in the right spot.
   * This may not be accurate if text has changed since
   */
  async showMatch(match) {
    const path = match.getScopeOfType(FileScope)?.path
    if (!path) return
    const selection = {
      anchor: { line: match.line, ch: match.char },
      head: { line: match.line, ch: match.char + match.inputText.length },
      // TODO: scroll!!!?!?!?!
      scroll: { event: "cursor", percent: 0 }
    }
    // TODO: showEditor...
    await store.selectPath(path, selection)
    // TODO....???
    store.onInputEffect()
  },

  /**
   * Create an app for the specified `projectRoot`.
   * `projectId` is optional, if you don't specify we'll ask the user for one.
   */
  async createApp(projectRoot = store.projectRoot, projectId) {
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
      const newProject = await store.projectRoot.duplicateApp(store.project.projectId, newProjectId)
      // console.warn({ newProject })
      if (newProject) {
        store.showEditor(newProject.path)
        store.showNotice(`${project.Type} duplicated.`)
      }
    } catch (e) {
      store.showError(e)
    }
  },
  async renameApp(newProjectId) {
    try {
      const project = await store.projectRoot.renameApp(store.project.projectId, newProjectId)
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
      const removed = await store.projectRoot.deleteApp(store.project.projectId, CONFIRM)
      if (removed) {
        // Navigate to nextProject, or the projectRoot, which will select another project
        store.showEditor(store.projectRoot.path)
        store.showNotice(`${removed.Type} removed.`)
      }
    } catch (e) {
      store.showError(e)
    }
  },

  async compileApp() {
    if (!store.project || !store.file) return

    spellCore.console.clear()
    try {
      spellCore.console.group("Compiling", store.project)

      store.clearCompileAppSoon()
      await store.project.compile()
      const { compiled } = store.project

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
    if (!store.project?.compiled) return
    spellCore.console.group(`Executing ${store.project.type}`)
    const result = await store.project.executeCompiled()
    spellCore.console.groupEnd()
    if (result instanceof Error) {
      spellCore.console.error(`${store.project.Type} failed with error:`, result)
      // Throw so the error is printed to the browser console.
      // This will have the print the correct line number to the right
      // but we apparently don't have another way to get it???
      throw result
    }
    spellCore.console.info(`${store.project.Type} executed without errors.  exports =`, result)
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
    return store.createApp(SpellProjectRoot.projects, projectId)
  },

  //-----------------
  // Examples actions
  //-----------------
  async createExample(projectId) {
    return store.createApp(SpellProjectRoot.examples, projectId)
  },

  //-----------------
  // Guides actions
  //-----------------
  async createGuide(projectId) {
    return store.createApp(SpellProjectRoot.guides, projectId)
  },

  //-----------------
  // File actions
  //-----------------

  async saveFile() {
    if (store.file?.isLoaded) await store.file.save()
  },
  async reloadFile() {
    store.clearCompileAppSoon()
    if (store.file) {
      await store.file.reload()
      store.compileApp()
    }
  },
  async createFile(filePath, contents) {
    store.clearCompileAppSoon()
    try {
      const newFile = await store.project.createFile(filePath, contents)
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
      const newFile = await store.project.duplicateFile(store.file.filePath, newPath)
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
      const renamedFile = await store.project.renameFile(store.file.filePath, newPath)
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
      const { project, file } = store
      // figure out what to select next out of `project.imports`
      const files = project.imports.map(({ file }) => file)
      const fileIndex = files.indexOf(file)
      const nextFile = files[fileIndex + (fileIndex === files.length - 1 ? -1 : 1)]
      // actually remove the file
      const removed = await project.deleteFile(file.filePath, CONFIRM)
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
    const reply = await store.answer({ header: "Header", message: "Message?", ok: "Yep", cancel: "Nope" })
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
   * Returns a promise which resolves with one of:
   *  - `true` if they clicked the `ok` button
   *  - `false` if they clicked the `cancel` button
   *  - `undefined` if they clicked away from the modal or hit the escape key.
   */
  alert(props = "DOH!") {
    if (typeof props === "string") props = { message: props }
    return store.showModal(props, UI.Alert)
  },

  confirm(props = "Really?") {
    if (typeof props === "string") props = { message: props }
    return store.showModal(props, UI.Confirm)
  },

  prompt(props = "Tell me what you think?") {
    if (typeof props === "string") props = { message: props }
    return store.showModal(props, UI.Prompt)
  },

  // Prompt for a number, by default an integer.
  // Pass `{ inputProps: { step, min, max }` to customize input.
  promptForNumber(props = "How many?") {
    if (typeof props === "string") props = { message: props }
    props = { type: "number", inputProps: { step: 1 }, ...props }
    return store.showModal(props, UI.Prompt)
  },

  // Show chooser dialog.
  // You MUST pass at least `{ message, options }`.
  choose(props) {
    if (!props?.message || !props.options) {
      console.warn("store.choose(): must pass 'message' and 'options', got:", props)
      return Promise.reject(undefined)
    }
    return store.showModal(props, UI.Chooser)
  },

  /**
   * Generic method to show a `component` modal with `props`.
   * Returns a promise which will resolve/reject as per `component` setup.
   */
  modalId: 0, // Seqeuence to generate unique modal `id`s.
  modals: [], // Current stack of modals, topmost at end.
  debugModals: false,
  showModal(props, component) {
    let modalProps
    const promise = new Promise((resolve, reject) => {
      modalProps = { id: store.modalId++, props, component, resolve, reject }
      store.modals = [modalProps, ...store.modals]
    }).finally(() => {
      // make sure `store.modals` gets cleaned up however we resolve the promise
      store.modals = store.modals.filter((it) => it.id !== modalProps.id)
    })

    if (store.debugModals) {
      // NOTE: don't put this in the promise returned to the caller
      promise.then((value) => console.info("Modal resolved with:", value, "\nprops:", modalProps))
      promise.catch((error) => console.info("Modal rejected with:", error, "\nprops:", modalProps))
    }

    return promise
  },

  //-----------------
  // ProjectSettings
  //-----------------

  //-----------------
  // InputEditor event handlers
  //-----------------

  /**
   * Pointer to the `codeMirror` instance for our InputEditor.
   * TODO: generalize this for multiple editors!
   */

  inputEditor: undefined,
  /** Remember `inputEditor` in our <InputEditor editorDidMount /> event. */
  onInputDidMount(codeMirror) {
    // console.info("initializing", { codeMirror })
    store.inputEditor = codeMirror
    codeMirror.on("refresh", store.onInputCursor)
  },
  /** Forget `inputEditor` in our <InputEditor editorWillUnmount /> event. */
  onInputWillUnmount(codeMirror) {
    store.inputEditor = null
    codeMirror.off("refresh", store.onInputCursor)
  },

  /** Handle cursor move or scroll in our inputEditor, remembering the `selection`  */
  selection: undefined,
  onInputCursor(codeMirror) {
    const event = arguments.length === 1 ? "cursor" : "scroll"
    const { direction, current: oldCurrent } = store.selection?.scroll || {}
    // allocate this way to console debugging easier
    const scroll = { event, direction, percent: 0, max: 0 }
    scroll.current = Math.floor(codeMirror.doc.scrollTop)
    scroll.total = Math.floor(codeMirror.doc.height)
    scroll.visible = codeMirror.display.lastWrapHeight
    scroll.max = scroll.total - scroll.visible
    scroll.percent = parseFloat((scroll.current / scroll.max).toPrecision(4), 10)
    // update "direction" if we can
    if (typeof oldCurrent === "number" && oldCurrent !== scroll.current) {
      scroll.direction = oldCurrent < scroll.current ? "down" : "up"
    }

    // Extra stuff we COULD get from codeMirror
    // See:  https://codemirror.net/doc/manual.html#api_sizing
    // scroll.lineHeight = codeMirror.defaultTextHeight()
    // scroll.mouseLine = codeMirror.lineAtHeight(<global-mouse-position>, "window")

    const range = codeMirror.doc.sel.ranges[0]
    const hasContents = !!store.file?.contents
    const anchor = {
      line: range.anchor.line,
      ch: range.anchor.ch,
      top: Math.floor(codeMirror.cursorCoords(range.anchor, "local").top),
      offset: hasContents ? store.file.offsetForPosition(range.anchor) : undefined
    }

    const head = {
      line: range.head.line,
      ch: range.head.ch,
      top: Math.floor(codeMirror.cursorCoords(range.head, "local").top),
      offset: hasContents ? store.file.offsetForPosition(range.head) : undefined
    }

    store.selection = { scroll, anchor, head }
    // store selection as file `pref`, we'll reload it in `selectPath()` above.
    if (store.file) store.lastSelectionForFile(store.file.path, store.selection)
  },

  /**
   * Called from a `useEffect()` hook in our `<InputEditor />`,
   * if `store.file.initialSelection` is set and things are ready to go
   * scroll the codeMirror `inportEditor` and reset the selection.
   */
  onInputEffect() {
    const { inputEditor, file } = store
    const { path, initialSelection, isLoaded } = file || {}
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

  /** Handle change event from our inputEditor. */
  onInputChanged(codeMirror, change, value) {
    store.file.setContents(value, { isDirty: true })
    store.project.updatedContentsFor(store.file)
    // auto-compile 2 seconds after input settles
    store.compileAppSoon(2)
  },

  //-----------------
  // UI
  //-----------------

  /** Show rule names in MatchViewer? */
  showingMatchRuleNames: true,
  toggleMatchRuleNames(on = !store.showingMatchRuleNames) {
    store.showingMatchRuleNames = on
  },

  /** Single `notice` display. */
  notice: undefined,
  showNotice(notice) {
    console.info("showNotice:", notice)
    store.notice = notice
  },
  hideNotice() {
    store.notice = undefined
  },

  /** Single error display. */
  error: undefined,
  /** Show an error to the user. */
  showError(error) {
    console.dir(error)
    store.error = error
  },
  hideError() {
    store.error = undefined
  }
})
global._store = store
