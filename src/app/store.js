import global from "global"
import ReactDOM from "react-dom"

import { createStore, setPrefKey, getPref, setPref, CONFIRM, REACT_APP_ROOT_ID } from "~/util"
import { spellSetup, SpellProjectRoot, SpellProject } from "~/languages/spell"

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
  async removeProject() {
    try {
      const removed = await store.projectRoot.removeProject(store.project.projectId, CONFIRM)
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
    const pref = `selectedFileFor:${project.path}`
    if (!filePath) filePath = getPref(pref)
    if (!filePath || !project.getFile(filePath)) {
      filePath = project.activeImports[0]?.path || project.files[0]?.path || ""
    }
    setPref(pref, filePath)
    if (filePath) {
      store.file = project.getFile(filePath)
      global.file = store.file // DEBUG
      await store.reloadFile()
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
  async removeFile() {
    store.clearCompileSoon()
    try {
      const removed = await store.project.removeFile(store.file.filePath, CONFIRM)
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
      store.setScrollOffset()
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
  onInputChanged(codeMirror, change, value) {
    store.file.setContents(value, { isDirty: true })
    store.project.updatedContentsFor(store.file)
    // auto-compile 2 seconds after input settles
    store.compileSoon(2)
  },

  // input CodeMirror position as { line, ch }
  position: { line: 0, ch: 0 },
  onCursorActivity(codeMirror) {
    store.position = codeMirror.doc.sel.ranges[0].head
    store.setScrollOffset()
  },
  // Adjust `store.inputOffset` (and thus scroll of <MatchView/>) to reflect input `position`.
  inputOffset: 0,
  setScrollOffset() {
    if (!store.file?.match) store.inputOffset = 0
    else store.inputOffset = store.file.offsetForPosition(store.position)
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
