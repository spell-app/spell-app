//----------------------------
//
//  Reducer and associated action creators/handlers for top-level app state data.
//
//----------------------------

import global from "global"
import { connect } from "react-redux"
import prettier from "prettier/standalone"
import babylon from "prettier/parser-babylon"

import { spellParser } from ".."

import { api, getPref, setPref, setPrefKey, ReduxFactory } from "."

const Formats = {
  TEXT: "TEXT",
  JSON5: "JSON5"
}

// FIXME: this is lame...
export const INPUT = "INPUT"

const PROJECT_MANIFEST_FILE_NAME = ".manifest"

// HACK: we should do this in the app somewhere rather than here...
setPrefKey("spellEditor:")

function getDefaultProject() {
  return getPref("selectedProject")
}
function setDefaultProject(projectId) {
  setPref("selectedProject", projectId)
}
function getDefaultFileForProject(projectId) {
  return projectId && getPref(`selectedFileFor:${projectId}`)
}
function setDefaultFileForProject(projectId, filename) {
  setPref(`selectedFileFor:${projectId}`, filename)
}

// Try to figure out the projectId/filename we used last time
const defaultProjectId = getDefaultProject()
const defaultFilename = getDefaultFileForProject(defaultProjectId)

const factory = new ReduxFactory({
  domain: "projects",

  initialState: {
    files: {}, // Map of `{ <examplePath> => <file contents> }` for all loaded files.

    // Selection
    projectId: defaultProjectId, // Project currently selected, defaults to pref value.
    filename: defaultFilename, // Module currently selected, defaults to pref value.
    input: undefined, // Current example input.  May be different than what's in `files`!
    output: undefined, // Current example compiled output.
    dirty: false // Is the example input different than what's been saved?
  },

  // Return server path to project file.
  getPath(projectId, filename = "") {
    return `project/${projectId}/${filename}`
  },

  // Syntactic sugar to get the bits of the data from the state.
  // NOTE: These assume the relevant data is already loaded!
  // NOTE: If you're calling these from an `onSuccess` or `onError` handler
  //       you MUST pass the `projects` passed in, or redux will complain.

  // Return loaded list of projectIds given the full `products` state.
  getProjectIds(projects) {
    return projects.files.projects
  },

  // Return loaded project index given the full `products` state.
  getProjectIndex(projects, projectId) {
    const path = this.getPath(projectId, PROJECT_MANIFEST_FILE_NAME)
    return projects.files[path]
  },

  // Return project file index data given the `index` for its project.
  getFileData(index, filename) {
    return index?.files.find(file => file.name === filename)
  },

  // Return loaded file source file given the full `products` state.
  getFileSource(projects, projectId, filename) {
    const path = this.getPath(projectId, filename)
    return projects.files[path]
  },

  // Update file contents immutably.
  updateFileContents(projects, path, contents) {
    projects = {
      ...projects,
      files: { ...projects.files }
    }
    if (contents != null) projects.files[path] = contents
    else delete projects.files[path]

    return projects
  },

  // actions
  actions: [
    {
      name: "startup",
      async promise(projects, { projectId = projects.projectId, filename = projects.filename } = {}) {
        // Default to the first project
        const projectIds = await factory.call.loadProjectIds()
        // eslint-disable-next-line prefer-destructuring
        if (!projectId || !projectIds.includes(projectId)) projectId = projectIds[0]

        return factory.call.selectProjectFile({ projectId, filename }).then(() => factory.call.compileInput())
      },
      onSuccess(projects) {
        return { ...projects }
      },
      onError(projects, error) {
        console.error("Error during startup", error)
        return { ...projects }
      }
    },

    //----------------------------
    // Update the current example input, e.g. when typing
    {
      name: "updateInput",
      handler(projects, input) {
        return {
          ...projects,
          input,
          output: "",
          dirty: true
        }
      }
    },

    //----------------------------
    // Compile the current example text
    {
      name: "compileInput",
      handler(projects) {
        const { input = "", filename } = projects
        let output
        console.group(`Parsing ${input.length} chars (${input.split("\n").length} lines)`)
        try {
          const scope = spellParser.getScope(filename)
          console.info("scope: ", scope)

          // assign scope and parsing shorthand functions globally
          // for ad-hoc testing of what was just parsed.
          global.scope = scope
          global.parse = scope.parse.bind(scope)
          global.statement = text => scope.parse(text, "statement")
          global.exp = text => scope.parse(text, "expression")

          // Break parse/compile into 2 steps so we can time it
          const start = Date.now()
          const match = spellParser.parse(input, undefined, scope)
          const afterParse = Date.now()
          output = match.compile()
          const afterCompile = Date.now()

          console.info(`parsed in ${afterParse - start} msec, compiled in ${afterCompile - afterParse} msec`)
        } catch (e) {
          console.error(e)
          output = e.message
        }

        // Attempt to format the javascript, then excute it if formatting goes ok
        let pretty = output
        try {
          // Use prettier to format the output,
          // This will throw if the code is bad.
          pretty = prettier.format(output, { parser: "babel", plugins: [babylon] })

          // add all types to `global` for local hacking
          try {
            const scriptEl = document.createElement("script")
            scriptEl.setAttribute("id", "compileOutput")
            scriptEl.setAttribute("type", "module")
            scriptEl.innerHTML = output

            const existingEl = document.getElementById("compileOutput")
            console.group("attempting to execute contents:")
            setTimeout(() => console.groupEnd(), 100) // groupEnd after compile finishes asynchronously

            if (existingEl) {
              existingEl.replaceWith(scriptEl)
            } else {
              document.body.append(scriptEl)
            }
          } catch (e) {
            console.error("error evaling output:", e)
          }
        } catch (e) {
          console.warn("Prettier error:", e)
        }

        console.groupEnd()

        return {
          ...projects,
          output: pretty
        }
      }
    },

    //----------------------------
    // Save the input.
    {
      name: "saveInput",
      promise({ projectId, filename, input }) {
        return factory.call.saveFile({ projectId, filename, contents: input })
      },
      onSuccess(projects) {
        return {
          ...projects,
          dirty: false
        }
      },
      onError(projects) {
        return { ...projects }
      }
    },

    //----------------------------
    // Revert the input to the value when we loaded it last.
    {
      name: "revertInput",
      handler(projects) {
        const { projectId, filename } = projects
        const input = this.getFileSource(projects, projectId, filename)
        return {
          ...projects,
          input,
          output: "",
          dirty: false
        }
      }
    },

    //
    //  Manipulating the selected project/File
    //

    {
      //----------------------------
      // Select a project and example file.
      // If you don't specify a filename, we'll return the first one in the project.
      name: "selectProjectFile",
      async promise(projects, { projectId = projects.projectId, filename, reload }) {
        // Load the project index.
        const index = await factory.call.loadProjectIndex({ projectId, reload })

        // If no filename specified, use the first file in the project if there is one
        if (!filename && index.files.length) filename = index.files[0].name

        // If file is found, load its contents
        let contents = ""
        if (this.getFileData(index, filename)) {
          contents = await factory.call.loadProjectFile({ projectId, filename, reload })
        }

        return {
          projectId,
          filename,
          contents
        }
      },
      onSuccess(projects, { projectId, filename, contents, reload }) {
        setDefaultProject(projectId)
        setDefaultFileForProject(projectId, filename)
        return {
          ...projects,
          projectId,
          filename,
          input: contents,
          output: "",
          dirty: false
        }
      },
      onError(projects, error, { projectId, filename }) {
        console.error("Error in selectProjectFile():", error)
        return { ...projects }
      }
    },

    //----------------------------
    // Reload the selected file (and the indices as well).
    {
      name: "reloadSelected",
      handler(projects) {
        const { projectId, filename } = projects
        return factory.call.selectProjectFile({ projectId, filename, reload: true })
      }
    },

    //----------------------------
    // Create a new file in the current project.
    {
      name: "newProjectFile",
      async promise(projects, { projectId = projects.projectId, filename, contents = "" }) {
        if (!filename) throw new TypeError("projects.newProjectFile(): You must specify 'filename'")
        if (contents === INPUT) contents = projects.input

        // if there's already a file with that name, just return a resolved promise
        //  and we'll select it in the onSuccess handler
        let index = await factory.call.loadProjectIndex({ projectId })
        if (!index) throw new TypeError(`projects.newProjectFile(): Can't load project index for ${projectId}`)
        const existing = index.files.find(file => file.name === filename)
        if (existing) return Promise.resolve("")

        // add an entry to the index and save it
        index = {
          ...index,
          files: [...index.files, { name: filename, path: `${projectId}/${filename}` }]
        }
        await this.call.saveProjectIndex({ projectId, index })
        await this.call.saveProjectFile({ projectId, filename, contents })
        return this.call.selectProjectFile({ projectId, filename })
      },
      onSuccess(projects) {
        return { ...projects }
      },
      onError(projects) {
        return { ...projects }
      }
    },

    //----------------------------
    // Duplicate the input under a new `filename`
    {
      name: "duplicateProjectFile",
      async promise(projects, params) {
        const { projectId = projects.projectId, filename = projects.filename, newFilename } = params
        let { contents } = params
        if (!newFilename) throw new TypeError("projects.duplicateProjectFile(): You must specify 'newFilename'")

        if (contents == null) {
          contents = await factory.call.loadProjectFile({ projectId, filename })
          if (!contents) throw new TypeError(`projects.duplicateProjectFile(): Couldn't load contents for ${filename}`)
        } else if (contents === INPUT) {
          contents = projects.input
        }

        return factory.call.newProjectFile({ projectId, filename: newFilename, contents })
      },
      onSuccess(projects) {
        return { ...projects }
      },
      onError(projects) {
        return { ...projects }
      }
    },

    //----------------------------
    // Rename a project file from the specified project.
    {
      name: "renameProjectFile",
      async promise(projects, params) {
        const { projectId = projects.projectId, filename = projects.filename, newFilename } = params
        let { contents } = params
        if (!newFilename) throw new TypeError("projects.duplicateProjectFile(): You must specify 'newFilename'")

        if (contents == null) {
          contents = await factory.call.loadProjectFile({ projectId, filename })
          if (!contents) throw new TypeError(`projects.duplicateProjectFile(): Couldn't load contents for ${filename}`)
        } else if (contents === INPUT) {
          contents = projects.input
        }

        // Load the index so we can muck with it
        let index = await factory.call.loadProjectIndex({ projectId })
        if (!index) throw new TypeError(`projects.newProjectFile(): Can't load project index for ${projectId}`)

        // Update the index entry in-place so the item does't move
        index = {
          ...index,
          files: index.files.map(file => {
            if (file.name === filename) return { ...file, name: newFilename, path: `${projectId}/${newFilename}` }
            return file
          })
        }
        await factory.call.saveProjectFile({ projectId, filename: newFilename, contents })
        return factory.call.deleteProjectFile({ projectId, filename, index })
      },
      onSuccess(projects) {
        return { ...projects }
      },
      onError(projects) {
        return { ...projects }
      }
    },

    //----------------------------
    // Delete a file from the specified project.
    {
      name: "deleteProjectFile",
      async promise(projects, { projectId = projects.projectId, filename, index }) {
        if (!filename) throw new TypeError("projects.deleteProjectFile(): You must specify 'filename'")

        // If not provided, load the index so we can muck with it
        if (!index) {
          index = await factory.call.loadProjectIndex({ projectId })
          if (!index) throw new TypeError(`projects.newProjectFile(): Can't load project index for ${projectId}`)
        }

        // Remove entry from the index.
        index = {
          ...index,
          files: index.files.filter(file => file.name !== filename)
        }
        await this.call.saveProjectIndex({ projectId, index })
        await this.call.deleteFile({ projectId, filename })
        // select the first item in the project
        return this.call.selectProjectFile({ projectId })
      },
      onSuccess(projects) {
        return { ...projects }
      },
      onError(projects) {
        return { ...projects }
      }
    },

    //
    //  Specific loaders/etc
    //

    //----------------------------
    // Load the list of projects.
    //  `projectIds` is a list of folder names.
    {
      name: "loadProjectIds",
      ACTION: "LOAD_FILE",
      async: true,
      getParams({ reload } = {}) {
        return { path: "projects", reload, format: Formats.JSON5 }
      }
    },

    //----------------------------
    // Load the index for a single project.
    //  `index` is a JSON5 index for the project.
    {
      name: "loadProjectIndex",
      ACTION: "LOAD_FILE",
      async: true,
      getParams({ projectId, reload }) {
        return { projectId, filename: PROJECT_MANIFEST_FILE_NAME, reload, format: Formats.JSON5 }
      }
    },

    //----------------------------
    // Save the index for a single project.
    //  `index` is a JSON5 index for the project.
    {
      name: "saveProjectIndex",
      ACTION: "UPDATE_CONTENTS",
      getParams({ projectId, index }) {
        return { projectId, filename: PROJECT_MANIFEST_FILE_NAME, contents: index }
      }
    },

    //----------------------------
    // Load a single file.
    {
      name: "loadProjectFile",
      ACTION: "LOAD_FILE",
      async: true,
      getParams({ projectId, filename, reload }) {
        return { projectId, filename, reload, format: Formats.TEXT }
      }
    },

    //----------------------------
    // Save a file.
    {
      name: "saveProjectFile",
      ACTION: "SAVE_FILE",
      async: true,
      getParams({ projectId, filename, contents }) {
        return { projectId, filename, contents }
      }
    },

    //
    //  Generic load/save/delete -- you'll generally use one of the methods above
    //

    //----------------------------
    // Update a project file in memory, including an index.
    // NOTE: doesn't update the disk at all!
    //  `contents` is the contents of the file.
    {
      name: "updateContents",
      handler(projects, { path, projectId, filename, contents }) {
        if (!path) path = this.getPath(projectId, filename)
        return this.updateFileContents(projects, path, contents)
      }
    },

    //----------------------------
    // Load a project file.
    //  `projectId`
    //  `filename` (including extension)
    //  `reload` we'll reload the file if true, otherwise we'll return the cached contents
    //  `format`: one of Formats (defaults to Format.TEXT)
    {
      name: "loadFile",
      promise(projects, { path, projectId, filename, reload, format = Formats.TEXT }) {
        if (!path) path = this.getPath(projectId, filename)

        // Quick exit if we're not to `reload`
        if (!reload) {
          const contents = projects.files[path]
          if (contents != null) return Promise.resolve(contents)
        }

        const url = `api/${path}`
        if (format === Formats.TEXT) return api.getText({ url, apiMethod: "loadFile" })
        return api.getJSON5({ url, apiMethod: "loadFile" })
      },
      onSuccess(projects, contents, { path, projectId, filename }) {
        if (!path) path = this.getPath(projectId, filename)
        return this.updateFileContents(projects, path, contents)
      },
      onError(projects, error, { projectId, filename }) {
        const path = this.getPath(projectId, filename)
        console.error(`Unable to load file '${path}'!`, error)
        return { ...projects }
      }
    },

    //----------------------------
    // Save a project file, including the project index.
    //  `contents` is the contents of the file.
    {
      name: "saveFile",
      promise(projects, { path, projectId, filename, contents }) {
        if (!path) path = this.getPath(projectId, filename)
        const url = `api/${path}`
        return api.postText({ url, body: contents, apiMethod: "saveFile" })
      },
      onSuccess(projects, _, { path, projectId, filename, contents }) {
        if (!path) path = this.getPath(projectId, filename)
        return this.updateFileContents(projects, path, contents)
      },
      onError(projects, error, { path }) {
        console.error(`Unable to save file '${path}'!`, error)
        return { ...projects }
      }
    },

    //----------------------------
    // Delete a project file.
    {
      name: "deleteFile",
      promise(projects, { path, projectId, filename }) {
        if (!path) path = this.getPath(projectId, filename)
        const url = `api/${path}`
        return api.delete({ url, apiMethod: "deleteFile" })
      },
      onSuccess(projects, _, { path, projectId, filename, contents }) {
        if (!path) path = this.getPath(projectId, filename)
        return this.updateFileContents(projects, path, null)
      },
      onError(projects, error, { path }) {
        console.error(`Unable to delete file '${path}'!`, error)
        return { ...projects }
      }
    }
  ]
})
export { factory as projects }

//----------------------------
//  `withProjects` HOC
//  Wrap a component class with this to get access to `props.projects` as above.
export function withProjects(Component) {
  return connect(function mapStateToProps(reduxState, props) {
    const { projects } = reduxState
    return { projects }
  })(Component)
}
