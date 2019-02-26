////////////////////
//
//  Reducer and associated action creators/handlers for top-level app state data.
//
////////////////////

import JSON5 from "json5";
import { connect } from "react-redux";

import {
  spell
} from "../all.js";

import {
  api,
  ReduxFactory,
} from "./all.js";

const Formats = {
  TEXT: "TEXT",
  JSON5: "JSON5"
};

// FIXME: this is lame...
export const INPUT = "INPUT";

export const factory = new ReduxFactory({
  domain: "packages",

  initialState: {
    files: {},                // Map of `{ <examplePath> => <file contents> }` for all loaded files.

    // Selection
    packageId: undefined,     // Package currently selected.
    moduleId: undefined,      // Module currently selected.
    input: undefined,         // Current example input.  May be different than what's in `files`!
    output: undefined,        // Current example compiled output.
    dirty: false,             // Is the example input different than what's been saved?
  },

  // Return server path to package file.
  getPath(packageId, moduleId = "", extension = "") {
    return `packages/${packageId}/${moduleId}${extension}`;
  },

  getIndexName(packageId) {
    return "index.json5";
  },

  getModuleFileName(packageId, moduleId) {
    return `${moduleId}.spell`;
  },

  // Syntactic sugar to get the bits of the data from the state.
  // NOTE: These assume the relevant data is already loaded!
  // NOTE: If you're calling these from an `onSuccess` or `onError` handler
  //       you MUST pass the `packages` passed in, or redux will complain.

  getPackageIds(packages) {
    return packages.files.packages;
  },

  getPackageIndex(packages, packageId) {
    const fileName = this.getIndexName(packageId);
    const path = this.getPath(packageId, fileName);
    return packages.files[path];
  },

  getModule(packages, packageId, moduleId) {
    const fileName = this.getModuleFileName(packageId, moduleId);
    const path = this.getPath(packageId, fileName);
    return packages.files[path];
  },

  // Update file contents immutably.
  updateFileContents(packages, path, contents) {
    packages = {
      ...packages,
      files: { ...packages.files }
    }
    if (contents != null)
      packages.files[path] = contents;
    else
      delete packages.files[path];

    return packages;
  },

  // actions
  actions: [
    {
      name: "startup",
      async promise(packages, { packageId, moduleId } = {}) {
        // Default to the first package
        const packageIds = await factory.call.loadPackageIds();
        if (!packageId) packageId = packageIds[0];

        return factory.call.selectModule({ packageId, moduleId });
      },
      onSuccess(packages) {
        return { ...packages };
      },
      onError(packages, error) {
        console.error("Error during startup", error);
        return { ...packages };
      }
    },

    //////////////////////
    // Update the current example input, e.g. when typing
    {
      name: "updateInput",
      handler(packages, input) {
        return {
          ...packages,
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
      handler(packages) {
        const { input } = packages;
        let output;
        try {
          output = spell.compile(input);
        } catch (e) {
          output = e.message;
        }

        return {
          ...packages,
          output
        }
      }
    },

    //////////////////////
    // Save the input.
    {
      name: "saveInput",
      promise({ packageId, moduleId, input }) {
        const fileName = this.getModuleFileName(packageId, moduleId);
        return factory.call.saveFile({ packageId, fileName, contents: input });
      },
      onSuccess(packages) {
        return {
          ...packages,
          dirty: false
        }
      },
      onError(packages) {
        return { ...packages };
      },
    },

    //////////////////////
    // Revert the input to the value when we loaded it last.
    {
      name: "revertInput",
      handler(packages) {
        const { packageId, moduleId } = packages;
        const input = this.getModule(packages, packageId, moduleId);
        return {
          ...packages,
          input,
          output: "",
          dirty: false
        }
      }
    },



    //
    //  Manipulating the selected package/File
    //

    {
      //////////////////////
      // Select a package and example module.
      // If you don't specify a moduleId, we'll return the first one in the package.
      name: "selectModule",
      async promise(packages, { packageId = packages.packageId, moduleId, reload }) {
        // Make sure the package index is loaded
        const index = await factory.call.loadPackageIndex({ packageId, reload });
        // if no moduleId specified, use the first module in the package
        if (!moduleId) moduleId = index.modules[0].id;

        const fileName = this.getModuleFileName(packageId, moduleId);
        return factory.call.loadFile({ packageId, fileName, reload });
      },
      onSuccess(packages, contents, { packageId = packages.packageId, moduleId }) {
        if (!moduleId) {
          const index = this.getPackageIndex(packages, packageId);
          moduleId = index.modules[0].id;
        }
        return {
          ...packages,
          packageId,
          moduleId,
          input: contents,
          output: "",
          dirty: false
        }
      },
      onError(packages, error, { packageId, moduleId }) {
        console.error("Error in selectModule():", error);
        return { ...packages };
      }
    },

    //////////////////////
    // Reload the selected module (and the indices as well).
    {
      name: "reloadSelected",
      handler(packages) {
        const { packageId, moduleId } = packages;
        return factory.call.selectModule({ packageId, moduleId, reload: true });
      }
    },

    //////////////////////
    // Create a new module in the current package.
    {
      name: "newModule",
      async promise(packages, { packageId = packages.packageId, moduleId, contents = "" }) {
        if (!moduleId) throw new TypeError("packages.newModule(): You must specify 'moduleId'");
        if (contents === INPUT) contents = packages.input;

        // if there's already a module with that id, just return a resolved promise
        //  and we'll select it in the onSuccess handler
        let index = await factory.call.loadPackageIndex({ packageId });
        if (!index)  throw new TypeError(`packages.newModule(): Can't load package index for ${packageId}`);
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
        await this.call.savePackageIndex({ packageId, index });
        await this.call.saveModule({ packageId, moduleId, contents });
        return this.call.selectModule({ packageId, moduleId });
      },
      onSuccess(packages) {
        return {...packages};
      },
      onError(packages) {
        return {...packages};
      }
    },

    //////////////////////
    // Duplicate the input under a new `moduleId`
    {
      name: "duplicateModule",
      async promise(packages, params) {
        let {
          packageId = packages.packageId,
          moduleId = packages.moduleId,
          newModuleId,
          contents
        } = params;
        if (!newModuleId) throw new TypeError("packages.duplicateModule(): You must specify 'newModuleId'");

        if (contents == null) {
          contents = await factory.call.loadModule({ packageId, moduleId });
          if (!contents)  throw new TypeError(`packages.duplicateModule(): Couldn't load contents for ${moduleId}`);
        }
        else if (contents === INPUT) {
          contents = packages.input;
        }

        return await factory.call.newModule({ packageId, moduleId: newModuleId, contents });
      },
      onSuccess(packages) {
        return {...packages};
      },
      onError(packages) {
        return {...packages};
      }
    },

    //////////////////////
    // Rename a module from the specified package.
    {
      name: "renameModule",
      async promise(packages, params) {
        let {
          packageId = packages.packageId,
          moduleId = packages.moduleId,
          newModuleId,
          contents
        } = params;
        if (!newModuleId) throw new TypeError("packages.duplicateModule(): You must specify 'newModuleId'");

        if (contents == null) {
          contents = await factory.call.loadModule({ packageId, moduleId });
          if (!contents)  throw new TypeError(`packages.duplicateModule(): Couldn't load contents for ${moduleId}`);
        }
        else if (contents === INPUT) {
          contents = packages.input;
        }

        // Load the index so we can muck with it
        let index = await factory.call.loadPackageIndex({ packageId });
        if (!index)  throw new TypeError(`packages.newModule(): Can't load package index for ${packageId}`);

        // Update the index entry in-place so the item does't move
        index = {
          ...index,
          modules: index.modules.map( module => {
            if (module.id === moduleId) return { ...module, id: newModuleId };
            return module;
          })
        }
        await factory.call.saveModule({ packageId, moduleId: newModuleId, contents });
        return factory.call.deleteModule({ packageId, moduleId, index });
      },
      onSuccess(packages) {
        return {...packages};
      },
      onError(packages) {
        return {...packages};
      }
    },


    //////////////////////
    // Delete a module from the specified package.
    {
      name: "deleteModule",
      async promise(packages, { packageId = packages.packageId, moduleId, index }) {
        if (!moduleId) throw new TypeError("packages.deleteModule(): You must specify 'moduleId'");

        // If not provided, load the index so we can muck with it
        if (!index) {
          index = await factory.call.loadPackageIndex({ packageId });
          if (!index)  throw new TypeError(`packages.newModule(): Can't load package index for ${packageId}`);
        }

        // Remove entry from the index.
        index = {
          ...index,
          modules: index.modules.filter( module => module.id !== moduleId )
        }
        await this.call.savePackageIndex({ packageId, index });
        const fileName = this.getModuleFileName(packageId, moduleId);
        await this.call.deleteFile({ packageId, fileName });
        // select the first item in the package
        return this.call.selectModule({ packageId });
      },
      onSuccess(packages) {
        return {...packages};
      },
      onError(packages) {
        return {...packages};
      }
    },


    //
    //  Specific loaders/etc
    //

    //////////////////////
    // Load the list of packages.
    //  `packageIds` is a list of folder names.
    {
      name: "loadPackageIds",
      ACTION: "LOAD_FILE",
      async: true,
      getParams({ reload } = {}) {
        return { path: "packages", reload, format: Formats.JSON5 };
      }
    },

    //////////////////////
    // Load the index for a single package.
    //  `index` is a JSON5 index for the package.
    {
      name: "loadPackageIndex",
      ACTION: "LOAD_FILE",
      async: true,
      getParams({ packageId, reload }) {
        const fileName = this.getIndexName(packageId);
        return { packageId, fileName, reload, format: Formats.JSON5 }
      },
    },

    //////////////////////
    // Save the index for a single package.
    //  `index` is a JSON5 index for the package.
    {
      name: "savePackageIndex",
      ACTION: "SAVE_FILE",
      async: true,
      getParams({ packageId, index }) {
        const fileName = this.getIndexName(packageId);
        return { packageId, fileName, contents: index}
      }
    },

    //////////////////////
    // Load a single module.
    {
      name: "loadModule",
      ACTION: "LOAD_FILE",
      async: true,
      getParams({ packageId, moduleId, reload }) {
        const fileName = this.getModuleFileName(packageId, moduleId);
        return { packageId, fileName, reload, format: Formats.TEXT }
      },
    },

    //////////////////////
    // Save a module.
    {
      name: "saveModule",
      ACTION: "SAVE_FILE",
      async: true,
      getParams({ packageId, moduleId, contents }) {
        const fileName = this.getModuleFileName(packageId, moduleId);
        return { packageId, fileName, contents }
      }
    },


    //
    //  Generic load/save/delete -- you'll generally use one of the methods above
    //

    //////////////////////
    // Load a package file.
    //  `packageId`
    //  `fileName` (including extension)
    //  `reload` we'll reload the file if true, otherwise we'll return the cached contents
    //  `format`: one of Formats (defaults to Format.TEXT)
    {
      name: "loadFile",
      promise(packages, { path, packageId, fileName, reload, format = Formats.TEXT }) {
        if (!path) path = this.getPath(packageId, fileName);

        // Quick exit if we're not to `reload`
        if (!reload) {
          const contents = packages.files[path];
          if (contents != null) return Promise.resolve(contents);
        }

        const url = `api/${path}`;
        if (format === Formats.TEXT)
          return api.getText({ url, apiMethod: "loadFile" })
        else
          return api.getJSON5({ url, apiMethod: "loadFile" });
      },
      onSuccess(packages, contents, { path, packageId, fileName }) {
        if (!path) path = this.getPath(packageId, fileName);
        return this.updateFileContents(packages, path, contents);
      },
      onError(packages, error, { packageId, fileName }) {
        const path = this.getPath(packageId, fileName);
        console.error(`Unable to load file '${path}'!`, error);
        return { ...packages };
      }
    },


    //////////////////////
    // Save a package file, including the package index.
    //  `contents` is the contents of the file.
    {
      name: "saveFile",
      promise(packages, { path, packageId, fileName, contents }) {
        if (!path) path = this.getPath(packageId, fileName);
        const url = `api/${path}`;
        return api.postText({ url, body: contents, apiMethod: "saveFile" })
      },
      onSuccess(packages, _, { path, packageId, fileName, contents }) {
        if (!path) path = this.getPath(packageId, fileName);
        return this.updateFileContents(packages, path, contents);
      },
      onError(packages, error, { path }) {
        console.error(`Unable to save file '${path}'!`, error);
        return { ...packages };
      }
    },


    //////////////////////
    // Delete a package file.
    {
      name: "deleteFile",
      promise(packages, { path, packageId, fileName }) {
        if (!path) path = this.getPath(packageId, fileName);
        const url = `api/${path}`;
        return api.delete({ url, apiMethod: "deleteFile" })
      },
      onSuccess(packages, _, { path, packageId, fileName, contents }) {
        if (!path) path = this.getPath(packageId, fileName);
        return this.updateFileContents(packages, path, null);
      },
      onError(packages, error, { path }) {
        console.error(`Unable to delete file '${path}'!`, error);
        return { ...packages };
      }
    }

  ]
});
export { factory as packages };


////////////////////
//  `withPackages` HOC
//  Wrap a component class with this to get access to `props.packages` as above.
export function withPackages(Component) {
  return connect(
    function mapStateToProps(reduxState, props) {
      const { packages } = reduxState;
      return { packages };
    }
  )(Component);
};


