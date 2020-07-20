import global from "global"
import ReactDOM from "react-dom"
import { navigate } from "@reach/router"

import { createStore, setPrefKey, getSetPref, CONFIRM, REACT_APP_ROOT_ID } from "~/util"
import { SpellProjectRoot, SpellProject, SpellLocation } from "~/languages/spell"

setPrefKey("spellEditor:")
export const store = createStore({
  //-----------------
  // Project and project actions
  //-----------------

  /**
   * `SpellProjectRoot` shown in `SpellEditor`.
   * Update with `store.navigateToPath()
   */
  projectRoot: undefined,
  /** Get/save last viewed `projectPath` for `projectRootPath`. */
  lastProjectForRoot: getSetPref("projectRootPath", "projectPath"),

  /**
   * `SpellProject` shown in `SpellEditor`.
   * Update with `store.navigateToPath()`
   */
  project: undefined,
  /** Get/save last viewed full `filePath` for `projectPath`. */
  lastFileForProject: getSetPref("projectPath", "filePath"),

  /**
   * `SpellFile` etc shown in `SpellEditor`.
   * Update with `store.navigateToPath()`
   */
  file: undefined,
  /** Get/save last `selection` for `filePath`.  */
  lastSelectionForFile: getSetPref("filePath", "selection"),

  /**
   * Navigate to a `path` by updating the URL, which will eventually call `selectPath`
   */
  navigateToPath(path) {
    try {
      navigate(new SpellLocation(path).url)
    } catch (e) {
      store.showError(`Path '${path}' is invalid!`)
    }
  },

  /**
   * Select a `path` to show in the `<SpellEditor/>`.
   *  - ultimately this will always (?) come down to selecting a file.
   *  - Default project = last project selected for projectRoot or first project in root.
   *  - Default file = last file selected for project or first file in project.
   *  - Restores file selection if stored.
   */
  selectPath: async (path) => {
    store.clearCompileSoon()

    let location
    try {
      location = new SpellLocation(path)
    } catch (e) {
      console.warn(`store.selectPath('${path}'): invalid path`)
      // default to user projects if `new SpellLocation()` throws
      location = new SpellLocation("@user:projects")
    }
    console.info("store.selectPath", { path, location })

    store.projectRoot = new SpellProjectRoot(location.projectRoot)
    const projectPaths = await store.projectRoot.load()

    // Figure out which project to show, using pref if not specified in `path`
    let projectPath =
      location.isProjectPath || location.isFilePath //
        ? location.projectPath
        : store.lastProjectForRoot(location.projectRoot)
    if (!projectPaths.includes(projectPath)) projectPath = projectPaths[0]
    // TODO: what if no project???
    const project = new SpellProject(projectPath)
    if (store.project !== project) {
      console.info("selecting project", project)
      store.lastProjectForRoot(location.projectRoot, projectPath)
      await project.load()
      store.project = project
      // clear file while we're loading the project so file menu updates
      store.file = undefined
      // Clear application display when switching projects
      const appRoot = document.getElementById(REACT_APP_ROOT_ID)
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
    if (store.file !== file) {
      console.info("selecting file", file)
      store.lastFileForProject(project.path, file.path)
      // restore file selection -- we'll use this below as a flag to reselect
      file.initialSelection = store.lastSelectionForFile(file.path)
      store.file = file
    }
    await store.reloadFile()
  },

  async createProject(projectId) {
    try {
      const project = await store.projectRoot.createProject(projectId)
      if (project) {
        store.navigateToPath(project.path)
        store.showNotice("Project created.")
      }
    } catch (e) {
      store.showError(e)
    }
  },
  async duplicateProject(newProjectId) {
    try {
      const newProject = await store.projectRoot.duplicateProject(store.project.projectId, newProjectId)
      console.warn({ newProject })
      if (newProject) {
        store.navigateToPath(newProject.path)
        store.showNotice("Project duplicated.")
      }
    } catch (e) {
      store.showError(e)
    }
  },
  async renameProject(newProjectId) {
    try {
      const project = await store.projectRoot.renameProject(store.project.projectId, newProjectId)
      if (project) {
        store.navigateToPath(project.path)
        store.showNotice("Project renamed.")
      }
    } catch (e) {
      store.showError(e)
    }
  },
  async deleteProject() {
    try {
      const removed = await store.projectRoot.deleteProject(store.project.projectId, CONFIRM)
      if (removed) {
        // Navigate to nextProject, or the projectRoot, which will select another project
        store.navigateToPath(store.projectRoot.path)
        store.showNotice("Project removed.")
      }
    } catch (e) {
      store.showError(e)
    }
  },

  //-----------------
  // File actions
  //-----------------

  async saveFile() {
    if (store.file?.isLoaded) await store.file.save()
  },
  async reloadFile() {
    store.clearCompileSoon()
    if (store.file) {
      await store.file.reload()
      store.compile()
    }
  },
  async createFile(filePath, contents) {
    store.clearCompileSoon()
    try {
      const newFile = await store.project.createFile(filePath, contents)
      if (newFile) {
        store.navigateToPath(newFile.path)
        store.showNotice("File created.")
      }
    } catch (e) {
      store.showError(e)
    }
  },
  async duplicateFile(newPath) {
    store.clearCompileSoon()
    try {
      const newFile = await store.project.duplicateFile(store.file.filePath, newPath)
      if (newFile) {
        store.navigateToPath(newFile.path)
        store.showNotice("File duplicated.")
      }
    } catch (e) {
      store.showError(e)
    }
  },
  async renameFile(newPath) {
    store.clearCompileSoon()
    try {
      const renamedFile = await store.project.renameFile(store.file.filePath, newPath)
      if (renamedFile) {
        store.navigateToPath(renamedFile.path)
        store.showNotice("File renamed.")
      }
    } catch (e) {
      store.showError(e)
    }
  },
  async deleteFile() {
    store.clearCompileSoon()
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
        store.navigateToPath(nextFile?.path || project.path)
        store.showNotice("File removed.")
      }
    } catch (e) {
      store.showError(e)
    }
  },
  async compile() {
    if (!store.project || !store.file) return
    try {
      console.group("Compiling", store.project)
      store.clearCompileSoon()
      await store.project.compile()
      store.project.executeCompiled()
    } finally {
      console.groupEnd()
    }
  },

  // Compile after `delay` seconds.
  compileSoon(delay = 1) {
    store.clearCompileSoon()
    store.compileSoonTimer = setTimeout(store.compile, delay * 1000)
  },
  clearCompileSoon() {
    if (store.compileSoonTimer) {
      clearTimeout(store.compileSoonTimer)
      delete store.compileSoonTimer
    }
  },

  //-----------------
  // Event handlers
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
    console.info("initializing input", { path, initialSelection })
    try {
      // HACK: manually set the height of the codeMirror instance
      // so that the bottom scrollbar shows up in the right place.
      // ????
      const { clientWidth, clientHeight } = document.querySelector("#InputEditor")
      inputEditor.setSize(clientWidth, clientHeight - 1)

      const selection = file.initialSelection
      // clear the `initialSelection` flag so we don't try to scroll again
      delete file.initialSelection
      store.lastSelectionForFile(store.file.path, selection)

      store.selection = selection
      inputEditor.scrollTo(0, selection.scroll?.scroll || 0)
      inputEditor.doc.setSelection(selection.anchor, selection.head)
      inputEditor.focus()
    } catch (e) {
      console.warn("CM scroll error:", e)
    }
    store.scrollViewers()
  },

  /** Handle change event from our inputEditor. */
  onInputChanged(codeMirror, change, value) {
    store.file.setContents(value, { isDirty: true })
    store.project.updatedContentsFor(store.file)
    // auto-compile 2 seconds after input settles
    store.compileSoon(2)
  },

  /**
   * Adjust scroll of <ASTViewer /> and <MatchViewer />
   * by updating `inputOffset` to match `store.selection`.
   */
  inputOffset: 0,
  scrollViewers() {
    const { file, selection } = store
    if (!file || !file.contents || !selection) store.inputOffset = 0
    else store.inputOffset = file.offsetForPosition(selection.head)
  },

  //-----------------
  // UI
  //-----------------
  message: undefined,
  showNotice(message) {
    console.info("showNotice:", message)
    store.message = message
  },
  hideNotice() {
    store.message = undefined
  },
  error: undefined,
  showError(error) {
    console.warn("showError:", error)
    store.error = error.message
  },
  hideError() {
    store.error = undefined
  }
})
global._store = store
