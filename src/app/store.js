import global from "global"
import ReactDOM from "react-dom"

import { createStore, setPrefKey, getPref, setPref, CONFIRM, REACT_APP_ROOT_ID } from "~/util"
import { spellSetup, SpellProjectRoot, SpellProject } from "~/languages/spell"

const EMPTY_SELECTION = {
  scroll: { top: 0, total: 0, visible: 0 },
  anchor: { line: 0, ch: 0 },
  head: { line: 0, ch: 0 }
}

setPrefKey("spellEditor:")
export const store = createStore({
  //-----------------
  // Project and project actions
  //-----------------

  /** Singleton list of all projects. */
  projectRoot: new SpellProjectRoot(spellSetup.projectRoots.projects),

  start: async () => {
    await store.projectRoot.load()
    store.selectProject()
  },
  /** Current project as `SpellProject`. */
  project: undefined,
  /** Select a project. */
  selectProject: async (path = getPref("selectedProject")) => {
    console.info("selecting project", path)
    const projectPaths = await store.projectRoot.load()
    if (!projectPaths.includes(path)) path = projectPaths[0]
    setPref("selectedProject", path)
    store.project = new SpellProject(path)
    store.file = undefined
    global.project = store.project // DEBUG
    await store.project.load()
    const appRoot = document.getElementById(REACT_APP_ROOT_ID)
    if (appRoot) ReactDOM.unmountComponentAtNode(appRoot)
    store.selectFile()
  },
  async createProject(projectId) {
    try {
      const project = await store.projectRoot.createProject(projectId)
      if (project) {
        store.selectProject(project.path)
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
        store.selectProject(newProject.path)
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
        store.selectProject(project.path)
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
        store.selectProject()
        store.showNotice("Project removed.")
      }
    } catch (e) {
      store.showError(e)
    }
  },

  //-----------------
  // File and file actions
  //-----------------

  /** Current file as `SpellFile` or `SpellCSSFile`. */
  file: undefined,
  /** Select a file from the `selectedProject`. */
  selectFile: async (filePath) => {
    store.clearCompileSoon()
    // TODO: switch project if filePath doesn't match selected project?
    // NOTE: assumes `store.project` is a valid, loaded project!
    const { project } = store
    if (!filePath) filePath = getPref(project.path)
    if (!filePath || !project.getFile(filePath)) {
      filePath = project.activeImports[0]?.path || project.files[0]?.path || ""
    }
    setPref(project.path, filePath)
    if (filePath) {
      store.file = project.getFile(filePath)
      global.file = store.file // DEBUG
      if (store.file) {
        // set `store.file.initialSelection` to our prefence value
        //  we'll use this as a flag to scroll the line into view on initial render
        store.file.initialSelection = getPref(store.file.path) || EMPTY_SELECTION
        await store.reloadFile()
      }
    } else {
      console.error("TODO: show UI when no files in project!")
    }
  },
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
        store.selectFile(newFile.path)
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
        store.selectFile(newFile.path)
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
        store.selectFile(renamedFile.path)
        store.showNotice("File renamed.")
      }
    } catch (e) {
      store.showError(e)
    }
  },
  async deleteFile() {
    store.clearCompileSoon()
    try {
      const removed = await store.project.deleteFile(store.file.filePath, CONFIRM)
      if (removed) {
        store.selectFile()
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
      // store.scrollViewers()
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
    console.info("initializing", { codeMirror })
    store.inputEditor = codeMirror
    codeMirror.on("refresh", store.onInputCursor)
  },
  /** Forget `inputEditor` in our <InputEditor editorWillUnmount /> event. */
  onInputWillUnmount(codeMirror) {
    codeMirror.off("refresh", store.onInputCursor)
    store.inputEditor = null
  },

  /** Handle cursor move or scroll in our inputEditor, remembering the `selection`  */
  selection: EMPTY_SELECTION,
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
    // store selection as file `pref`, we'll reload it in `selectFile()` above.
    if (store.file) setPref(store.file.path, store.selection)
  },

  /**
   * Called from a `useEffect()` hook in our `<InputEditor />`,
   * if `store.file.initialSelection` is set and things are ready to go
   * scroll the codeMirror `inportEditor` and reset the selection.
   */
  onInputEffect() {
    const { inputEditor, file } = store
    if (!inputEditor || !file?.isLoaded || !file?.initialSelection) return
    console.warn("onInputEffect firing", file.path, file.initialSelection)
    try {
      const selection = file.initialSelection
      // clear the `initialSelection` flag so we don't try to scroll again
      delete file.initialSelection
      setPref(store.file.path, selection)

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
