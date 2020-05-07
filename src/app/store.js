import global from "global"

import { createStore, setPrefKey, getPref, setPref, CONFIRM } from "~/util"
import { SpellProjectList, SpellProject, SpellFile } from "~/languages/spell"

setPrefKey("spellEditor:")

export const store = createStore({
  //-----------------
  // Project and project actions
  //-----------------

  /** Singleton list of all projects. */
  projectList: new SpellProjectList(),
  start: async () => {
    await store.projectList.load()
    store.selectProject()
  },
  /** Current project as `SpellProject`. */
  project: undefined,
  /** Select a project. */
  selectProject: async (path = getPref("selectedProject")) => {
    console.info("selecting project", path)
    const projectPaths = await store.projectList.load()
    if (!projectPaths.includes(path)) path = projectPaths[0]
    setPref("selectedProject", path)
    store.project = new SpellProject(path)
    global.project = store.project // DEBUG
    await store.project.load()
    store.selectFile()
  },
  async createProject(projectName) {
    try {
      const project = await store.projectList.createProject(projectName)
      if (project) {
        store.selectProject(project.path)
        store.showNotice("Project created.")
      }
    } catch (e) {
      store.showError(e)
    }
  },
  async duplicateProject(newPath) {
    try {
      const project = await store.projectList.duplicateProject(store.project.path, newPath)
      if (project) {
        store.selectProject(project.path)
        store.showNotice("Project duplicated.")
      }
    } catch (e) {
      store.showError(e)
    }
  },
  async renameProject(newPath) {
    try {
      const project = await store.projectList.renameProject(store.project.path, newPath)
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
      const removed = await store.projectList.removeProject(store.project.path, CONFIRM)
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

  /** Current file as `SpellFile`. */
  file: undefined,
  /** Select a file from the `selectedProject`. */
  selectFile: async filePath => {
    // TODO: switch project if filePath doesn't match selected project?
    // NOTE: assumes `store.project` is a valid, loaded project!
    const { project } = store
    const pref = `selectedFileFor:${project.path}`
    if (!filePath) filePath = getPref(pref)
    if (!project.filePaths.includes(filePath)) filePath = project.filePaths[0]
    setPref(pref, filePath)
    store.file = new SpellFile(filePath)
    global.file = store.file // DEBUG
    await store.reloadFile()
  },
  async saveFile() {
    if (store.file?.isLoaded) await store.file.save()
  },
  async reloadFile() {
    if (store.file) {
      await store.file.reload()
      store.compile()
    }
  },
  async createFile(path, contents) {
    try {
      const newFile = await store.project.createFile(path, contents)
      if (newFile) {
        store.selectFile(newFile.path)
        store.showNotice("File created.")
      }
    } catch (e) {
      store.showError(e)
    }
  },
  async duplicateFile(newPath) {
    try {
      const newFile = await store.project.duplicateFile(store.file.path, newPath)
      if (newFile) {
        store.selectFile(newFile.path)
        store.showNotice("File duplicated.")
      }
    } catch (e) {
      store.showError(e)
    }
  },
  async renameFile(newPath) {
    try {
      const renamedFile = store.project.renameFile(store.file.path, newPath)
      if (renamedFile) {
        store.selectFile(renamedFile.path)
        store.showNotice("File renamed.")
      }
    } catch (e) {
      store.showError(e)
    }
  },
  async removeFile() {
    try {
      const removed = await store.project.removeFile(store.file.path, CONFIRM)
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
    console.groupCollapsed("Compiling", store.project)
    try {
      await store.project.compile()
      store.project.executeCompiled()
    } finally {
      console.groupEnd()
    }
  },
  onInputChanged(codeMirror, change, value) {
    store.file.setContents(value, { isDirty: true })
    store.project.updatedContentsFor(store.file)
  },

  //-----------------
  // UI
  //-----------------
  message: undefined,
  showNotice(message) {
    store.message = message
  },
  hideNotice() {
    store.message = undefined
  },
  error: undefined,
  showError(error) {
    store.error = error.message
  },
  hideError() {
    store.error = undefined
  }
})
global._store = store
