////////////////////
//
//  Reducer and associated action creators/handlers for top-level app state data.
//
////////////////////

import global from "global";
import JSON5 from "json5";
import { connect } from "react-redux";

import {
  spellParser,
  Scope
} from "../all.js";

import {
  api,
  getPref,
  setPref,
  setPrefKey,
  ReduxFactory,
} from "./all.js";

const Formats = {
  TEXT: "TEXT",
  JSON5: "JSON5"
};

// FIXME: this is lame...
export const INPUT = "INPUT";

const PROJECT_INDEX_FILE_NAME = "index";

//HACK: we should do this in the app somewhere rather than here...
setPrefKey("spell_editor_");

function getDefaultProject() { return getPref("projectId") }
function setDefaultProject(projectId) { setPref("projectId", projectId) }
function getDefaultModule(projectId) { return projectId && getPref(`module4_${projectId}`) }
function setDefaultModule(projectId, moduleId) { setPref(`module4_${projectId}`, moduleId) }

// Try to figure out the projectId/moduleId we used last time
const projectId = getDefaultProject();
const moduleId = getDefaultModule(projectId);

const factory = new ReduxFactory({
  domain: "projects",

  initialState: {
    files: {},                // Map of `{ <examplePath> => <file contents> }` for all loaded files.

    // Selection
    projectId,                // Project currently selected, defaults to pref value.
    moduleId,                 // Module currently selected, defaults to pref value.
    input: undefined,         // Current example input.  May be different than what's in `files`!
    output: undefined,        // Current example compiled output.
    dirty: false,             // Is the example input different than what's been saved?
  },

  // Return server path to project file.
  getPath(projectId, moduleId = "", extension = "") {
    return `projects/${projectId}/${moduleId}${extension}`;
  },

  // Syntactic sugar to get the bits of the data from the state.
  // NOTE: These assume the relevant data is already loaded!
  // NOTE: If you're calling these from an `onSuccess` or `onError` handler
  //       you MUST pass the `projects` passed in, or redux will complain.

  // Return loaded list of projectIds given the full `products` state.
  getProjectIds(projects) {
    return projects.files.projects;
  },

  // Return loaded project index given the full `products` state.
  getProjectIndex(projects, projectId) {
    const path = this.getPath(projectId, PROJECT_INDEX_FILE_NAME);
    return projects.files[path];
  },

  // Return module index data given the `index` for its project.
  getModuleData(index, moduleId) {
    return index?.modules.find(module => module.id === moduleId);
  },

  // Return loaded module source file given the full `products` state.
  getModuleSource(projects, projectId, moduleId) {
    const path = this.getPath(projectId, moduleId);
    return projects.files[path];
  },

  // Update file contents immutably.
  updateFileContents(projects, path, contents) {
    projects = {
      ...projects,
      files: { ...projects.files }
    }
    if (contents != null)
      projects.files[path] = contents;
    else
      delete projects.files[path];

    return projects;
  },

  // actions
  actions: [
    {
      name: "startup",
      async promise(projects, { projectId = projects.projectId, moduleId = projects.moduleId } = {}) {
        // Default to the first project
        const projectIds = await factory.call.loadProjectIds();
        if (!projectId || !projectIds.includes(projectId))
          projectId = projectIds[0];

        return factory.call.selectModule({ projectId, moduleId })
          .then(() => factory.call.compileInput());
      },
      onSuccess(projects) {
        return { ...projects };
      },
      onError(projects, error) {
        console.error("Error during startup", error);
        return { ...projects };
      }
    },

    //////////////////////
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

    //////////////////////
    // Compile the current example text
    {
      name: "compileInput",
      handler(projects) {
        const { input, moduleId } = projects;
        let output;
        try {
          const scope = spellParser.getScope(moduleId);
          console.info("scope: ", scope);

          // assign scope and parsing shorthand functions globally
          // for ad-hoc testing of what was just parsed.
          global.scope = scope;
          global.parse = scope.parse.bind(scope);
          global.statement = scope.statement.bind(scope);
          global.exp = scope.exp.bind(scope);

          output = spellParser.compile(input, undefined, scope);
          global.output = output
console.info("output:\n", output)

          const scriptEl = document.createElement("script")
          scriptEl.setAttribute("id", "compileOutput")
          scriptEl.setAttribute("type", "module")
          scriptEl.innerHTML = output
global.scriptEl = scriptEl

          const existingEl = document.getElementById("compileOutput")
          if (existingEl) existing.replaceWidth(scriptEl)
          else document.body.append(scriptEl)
        } catch (e) {
          console.error(e);
          output = e.message;
        }

        return {
          ...projects,
          output
        }
      }
    },

    //////////////////////
    // Save the input.
    {
      name: "saveInput",
      promise({ projectId, moduleId, input }) {
        return factory.call.saveFile({ projectId, fileName: moduleId, contents: input });
      },
      onSuccess(projects) {
        return {
          ...projects,
          dirty: false
        }
      },
      onError(projects) {
        return { ...projects };
      },
    },

    //////////////////////
    // Revert the input to the value when we loaded it last.
    {
      name: "revertInput",
      handler(projects) {
        const { projectId, moduleId } = projects;
        const input = this.getModuleSource(projects, projectId, moduleId);
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
      //////////////////////
      // Select a project and example module.
      // If you don't specify a moduleId, we'll return the first one in the project.
      name: "selectModule",
      async promise(projects, { projectId = projects.projectId, moduleId, reload }) {
        // Load the project index.
        const index = await factory.call.loadProjectIndex({ projectId, reload });

        // If no moduleId specified, use the first module in the project if there is one
        if (!moduleId && index.modules.length) moduleId = index.modules[0].id;

        // If module is found, load its contents
        let contents = ""
        if (this.getModuleData(index, moduleId)) {
          contents = await factory.call.loadModule({ projectId, moduleId, reload });
        }

        return {
          projectId,
          moduleId,
          contents
        }
      },
      onSuccess(projects, { projectId, moduleId, contents, reload }) {
        setDefaultProject(projectId);
        setDefaultModule(projectId, moduleId);
        return {
          ...projects,
          projectId,
          moduleId,
          input: contents,
          output: "",
          dirty: false
        }
      },
      onError(projects, error, { projectId, moduleId }) {
        console.error("Error in selectModule():", error);
        return { ...projects };
      }
    },

    //////////////////////
    // Reload the selected module (and the indices as well).
    {
      name: "reloadSelected",
      handler(projects) {
        const { projectId, moduleId } = projects;
        return factory.call.selectModule({ projectId, moduleId, reload: true });
      }
    },

    //////////////////////
    // Create a new module in the current project.
    {
      name: "newModule",
      async promise(projects, { projectId = projects.projectId, moduleId, contents = "" }) {
        if (!moduleId) throw new TypeError("projects.newModule(): You must specify 'moduleId'");
        if (contents === INPUT) contents = projects.input;

        // if there's already a module with that id, just return a resolved promise
        //  and we'll select it in the onSuccess handler
        let index = await factory.call.loadProjectIndex({ projectId });
        if (!index)  throw new TypeError(`projects.newModule(): Can't load project index for ${projectId}`);
        const existing = index.modules.find(module => module.id === moduleId);
        if (existing) return Promise.resolve("");

        // add an entry to the index and save it
        index = {
          ...index,
          modules: [
            ...index.modules,
            { id: moduleId }
          ]
        }
        await this.call.saveProjectIndex({ projectId, index });
        await this.call.saveModule({ projectId, moduleId, contents });
        return this.call.selectModule({ projectId, moduleId });
      },
      onSuccess(projects) {
        return {...projects};
      },
      onError(projects) {
        return {...projects};
      }
    },

    //////////////////////
    // Duplicate the input under a new `moduleId`
    {
      name: "duplicateModule",
      async promise(projects, params) {
        let {
          projectId = projects.projectId,
          moduleId = projects.moduleId,
          newModuleId,
          contents
        } = params;
        if (!newModuleId) throw new TypeError("projects.duplicateModule(): You must specify 'newModuleId'");

        if (contents == null) {
          contents = await factory.call.loadModule({ projectId, moduleId });
          if (!contents)  throw new TypeError(`projects.duplicateModule(): Couldn't load contents for ${moduleId}`);
        }
        else if (contents === INPUT) {
          contents = projects.input;
        }

        return await factory.call.newModule({ projectId, moduleId: newModuleId, contents });
      },
      onSuccess(projects) {
        return {...projects};
      },
      onError(projects) {
        return {...projects};
      }
    },

    //////////////////////
    // Rename a module from the specified project.
    {
      name: "renameModule",
      async promise(projects, params) {
        let {
          projectId = projects.projectId,
          moduleId = projects.moduleId,
          newModuleId,
          contents
        } = params;
        if (!newModuleId) throw new TypeError("projects.duplicateModule(): You must specify 'newModuleId'");

        if (contents == null) {
          contents = await factory.call.loadModule({ projectId, moduleId });
          if (!contents)  throw new TypeError(`projects.duplicateModule(): Couldn't load contents for ${moduleId}`);
        }
        else if (contents === INPUT) {
          contents = projects.input;
        }

        // Load the index so we can muck with it
        let index = await factory.call.loadProjectIndex({ projectId });
        if (!index)  throw new TypeError(`projects.newModule(): Can't load project index for ${projectId}`);

        // Update the index entry in-place so the item does't move
        index = {
          ...index,
          modules: index.modules.map( module => {
            if (module.id === moduleId) return { ...module, id: newModuleId };
            return module;
          })
        }
        await factory.call.saveModule({ projectId, moduleId: newModuleId, contents });
        return factory.call.deleteModule({ projectId, moduleId, index });
      },
      onSuccess(projects) {
        return {...projects};
      },
      onError(projects) {
        return {...projects};
      }
    },


    //////////////////////
    // Delete a module from the specified project.
    {
      name: "deleteModule",
      async promise(projects, { projectId = projects.projectId, moduleId, index }) {
        if (!moduleId) throw new TypeError("projects.deleteModule(): You must specify 'moduleId'");

        // If not provided, load the index so we can muck with it
        if (!index) {
          index = await factory.call.loadProjectIndex({ projectId });
          if (!index)  throw new TypeError(`projects.newModule(): Can't load project index for ${projectId}`);
        }

        // Remove entry from the index.
        index = {
          ...index,
          modules: index.modules.filter( module => module.id !== moduleId )
        }
        await this.call.saveProjectIndex({ projectId, index });
        await this.call.deleteFile({ projectId, fileName: moduleId });
        // select the first item in the project
        return this.call.selectModule({ projectId });
      },
      onSuccess(projects) {
        return {...projects};
      },
      onError(projects) {
        return {...projects};
      }
    },


    //
    //  Specific loaders/etc
    //

    //////////////////////
    // Load the list of projects.
    //  `projectIds` is a list of folder names.
    {
      name: "loadProjectIds",
      ACTION: "LOAD_FILE",
      async: true,
      getParams({ reload } = {}) {
        return { path: "projects", reload, format: Formats.JSON5 };
      }
    },

    //////////////////////
    // Load the index for a single project.
    //  `index` is a JSON5 index for the project.
    {
      name: "loadProjectIndex",
      ACTION: "LOAD_FILE",
      async: true,
      getParams({ projectId, reload }) {
        return { projectId, fileName: PROJECT_INDEX_FILE_NAME, reload, format: Formats.JSON5 }
      },
    },

    //////////////////////
    // Save the index for a single project.
    //  `index` is a JSON5 index for the project.
    {
      name: "saveProjectIndex",
      ACTION: "UPDATE_CONTENTS",
      getParams({ projectId, index }) {
        return { projectId, fileName: PROJECT_INDEX_FILE_NAME, contents: index}
      }
    },

    //////////////////////
    // Load a single module.
    {
      name: "loadModule",
      ACTION: "LOAD_FILE",
      async: true,
      getParams({ projectId, moduleId, reload }) {
        return { projectId, fileName: moduleId, reload, format: Formats.TEXT }
      },
    },

    //////////////////////
    // Save a module.
    {
      name: "saveModule",
      ACTION: "SAVE_FILE",
      async: true,
      getParams({ projectId, moduleId, contents }) {
        return { projectId, fileName: moduleId, contents }
      }
    },


    //
    //  Generic load/save/delete -- you'll generally use one of the methods above
    //

    //////////////////////
    // Update a project file in memory, including an index.
    // NOTE: doesn't update the disk at all!
    //  `contents` is the contents of the file.
    {
      name: "updateContents",
      handler(projects, { path, projectId, fileName, contents }) {
        if (!path) path = this.getPath(projectId, fileName);
        return this.updateFileContents(projects, path, contents);
      }
    },

    //////////////////////
    // Load a project file.
    //  `projectId`
    //  `fileName` (including extension)
    //  `reload` we'll reload the file if true, otherwise we'll return the cached contents
    //  `format`: one of Formats (defaults to Format.TEXT)
    {
      name: "loadFile",
      promise(projects, { path, projectId, fileName, reload, format = Formats.TEXT }) {
        if (!path) path = this.getPath(projectId, fileName);

        // Quick exit if we're not to `reload`
        if (!reload) {
          const contents = projects.files[path];
          if (contents != null) return Promise.resolve(contents);
        }

        const url = `api/${path}`;
        if (format === Formats.TEXT)
          return api.getText({ url, apiMethod: "loadFile" })
        else
          return api.getJSON5({ url, apiMethod: "loadFile" });
      },
      onSuccess(projects, contents, { path, projectId, fileName }) {
        if (!path) path = this.getPath(projectId, fileName);
        return this.updateFileContents(projects, path, contents);
      },
      onError(projects, error, { projectId, fileName }) {
        const path = this.getPath(projectId, fileName);
        console.error(`Unable to load file '${path}'!`, error);
        return { ...projects };
      }
    },

    //////////////////////
    // Save a project file, including the project index.
    //  `contents` is the contents of the file.
    {
      name: "saveFile",
      promise(projects, { path, projectId, fileName, contents }) {
        if (!path) path = this.getPath(projectId, fileName);
        const url = `api/${path}`;
        return api.postText({ url, body: contents, apiMethod: "saveFile" })
      },
      onSuccess(projects, _, { path, projectId, fileName, contents }) {
        if (!path) path = this.getPath(projectId, fileName);
        return this.updateFileContents(projects, path, contents);
      },
      onError(projects, error, { path }) {
        console.error(`Unable to save file '${path}'!`, error);
        return { ...projects };
      }
    },


    //////////////////////
    // Delete a project file.
    {
      name: "deleteFile",
      promise(projects, { path, projectId, fileName }) {
        if (!path) path = this.getPath(projectId, fileName);
        const url = `api/${path}`;
        return api.delete({ url, apiMethod: "deleteFile" })
      },
      onSuccess(projects, _, { path, projectId, fileName, contents }) {
        if (!path) path = this.getPath(projectId, fileName);
        return this.updateFileContents(projects, path, null);
      },
      onError(projects, error, { path }) {
        console.error(`Unable to delete file '${path}'!`, error);
        return { ...projects };
      }
    }

  ]
});
export { factory as projects };


////////////////////
//  `withProjects` HOC
//  Wrap a component class with this to get access to `props.projects` as above.
export function withProjects(Component) {
  return connect(
    function mapStateToProps(reduxState, props) {
      const { projects } = reduxState;
      return { projects };
    }
  )(Component);
};


