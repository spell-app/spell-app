import global from "global"

import { createStore, setPrefKey, getPref, setPref } from "../util"
import { SpellProjectList } from "../languages/spell/SpellProjectList"
import { SpellProject } from "../languages/spell/SpellProject"
import { SpellFile } from "../languages/spell/SpellFile"

setPrefKey("spellEditor:")

export const store = createStore({
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
    const project = new SpellProject(path)
    store.project = project
    await project.load()
    store.selectFile()
  },
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
    await store.reloadFile()
  },
  async saveFile() {
    if (store.file?.isLoaded) await store.file.save()
  },
  async reloadFile() {
    if (store.file) {
      await store.file.reload()
      store.compileFile()
    }
  },
  onInputChanged(codeMirror, change, value) {
    store.file.setContents(value, { isDirty: true })
  },
  async createFile() {
    const fileName = prompt("Name for the new file?", "Untitled.spell")
    if (!fileName) return
    const contents = `## File ${fileName}`
    const file = await store.project.createFile(fileName, contents)
    store.selectFile(file.path)
  },
  async duplicateFile() {
    const { fileName } = store.file
    const newFileName = prompt("Name for the new file?", fileName)
    if (!newFileName) return
    const file = await store.project.duplicateFile(fileName, newFileName)
    store.selectFile(file.path)
  },
  async renameFile() {
    const { fileName } = store.file
    const newFileName = prompt(`New name for '${fileName}'?`, fileName)
    if (!newFileName || newFileName === fileName) return
    const file = await store.project.renameFile(fileName, newFileName)
    store.selectFile(file.path)
  },
  async removeFile() {
    const { fileName } = store.file
    if (!confirm(`Really delete '${fileName}'?`)) return
    await store.project.removeFile(fileName)
    store.selectFile()
  },
  async compileFile() {
    if (!store.file) return
    await store.file.compile()
    store.file.executeCompiled()
  }
})
global._store = store
