////////////////////
//
//  Reducer and associated action creators/handlers for top-level app state data.
//
////////////////////

import JSON5 from "json5";
import { connect } from "react-redux";

import ReduxFactory from "./ReduxFactory";
import { getJSON5, getText, postText, DELETE } from "./api.js";

import parser from "../../languages/spell/spell.js";

export const Formats = {
  TEXT: "TEXT",
  JSON5: "JSON5"
};

export const INPUT = "INPUT";

const factory = new ReduxFactory({
  domain: "packages",

  initialState: {
    files: {},                // Map of `{ <examplePath> => <file contents> }` for all loaded files.

    // Selection
    packageId: undefined,     // Package currently selected.
    fileId: undefined,        // Package file currently selected.
    input: undefined,         // Current example input.  May be different than what's in `files`!
    output: undefined,        // Current example compiled output.
    dirty: false,             // Is the example input different than what's been saved?
  },

  // Return server path to package file.
  getPath(packageId, fileId = "", extension = "") {
    return `packages/${packageId}/${fileId}${extension}`;
  },

  getIndexFileName(packageId) {
    return "index.json5";
  },

  getInputFileName(packageId, fileId) {
    return `${fileId}.spell`;
  },

  getOutputFileName(packageId, fileId) {
    return `${fileId}.jsx`;
  },

  // Syntactic sugar to get the bits of the data from the state.
  // NOTE: These assume the relevant data is already loaded!
  // NOTE: If you're calling these from an `onSuccess` or `onError` handler
  //       you MUST pass the `packages` passed in, or redux will complain.

  getPackageIds(packages) {
    return packages.files.packages;
  },

  getPackageIndex(packages, packageId) {
    const fileName = this.getIndexFileName(packageId);
    const path = this.getPath(packageId, fileName);
    return packages.files[path];
  },

  getInputFile(packages, packageId, fileId) {
    const fileName = this.getInputFileName(packageId, fileId);
    const path = this.getPath(packageId, fileName);
    return packages.files[path];
  },

  // Update file contents immutably
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
      async promise(packages, { packageId, fileId } = {}) {
        // Default to the first package
        const packageIds = await factory.call.loadPackageIds();
        if (!packageId) packageId = packageIds[0];

        return factory.call.selectFile({ packageId, fileId });
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
          output = parser.compile(input);
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
      promise({ packageId, fileId, input }) {
        const fileName = this.getInputFileName(packageId, fileId);
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
        const { packageId, fileId } = packages;
        const input = this.getInputFile(packages, packageId, fileId);
        return {
          ...packages,
          input,
          output: "",
          dirty: false
        }
      }
    },

    //////////////////////
    // Duplicate the input under a nw `fileId`
    {
      name: "duplicateInputFile",
      ACTION: "NEW_INPUT_FILE",
      async: true,
      getParams({ fileId }) {
        return { fileId, contents: INPUT };
      }
    },


    //
    //  Manipulating the selected package/File
    //

    {
      //////////////////////
      // Select a package and example file.
      // If you don't specify an fileId, we'll return the first one in the package.
      name: "selectFile",
      async promise(packages, { packageId, fileId, reload }) {
        // Make sure the package index is loaded
        const index = await factory.call.loadPackageIndex({ packageId, reload });
        // if no fileId specified, use the first file in the package
        if (!fileId) fileId = index.files[0].id;

        const fileName = this.getInputFileName(packageId, fileId);
        return factory.call.loadFile({ packageId, fileName, reload });
      },
      onSuccess(packages, contents, { packageId, fileId }) {
        if (!fileId) {
          const index = this.getPackageIndex(packages, packageId);
          fileId = index.files[0].id;
        }
        return {
          ...packages,
          packageId,
          fileId,
          input: contents,
          output: "",
          dirty: false
        }
      },
      onError(packages, error, { packageId, fileId }) {
        console.error("Error in selectFile():", error);
        return { ...packages };
      }
    },

    //////////////////////
    // Reload the selected file (and the indices as well).
    {
      name: "reloadSelected",
      handler(packages) {
        const { packageId, fileId } = packages;
        return factory.call.selectFile({ packageId, fileId, reload: true });
      }
    },

    //////////////////////
    // Create a new input file in the current package.
    {
      name: "newInputFile",
      async promise(packages, { packageId = packages.packageId, fileId, contents = "" }) {
        if (!fileId) throw new TypeError("packages.newFile(): You must specify 'fileId'");
        if (contents === INPUT) contents = packages.input;

        // if there's already a file with that id, just return a resolved promise
        //  and we'll select it in the onSuccess handler
        let index = await factory.call.loadPackageIndex({ packageId });
        if (!index)  throw new TypeError(`packages.newFile(): Can't load package index for ${packageId}`);
        const existing = index.files.find(file => file.id === fileId);
        if (existing) return Promise.resolve("");

        // add an entry to the index and save it
        index = {
          ...index,
          files: [
            ...index.files,
            { id: fileId }
          ]
        }
        await this.call.savePackageIndex({ packageId, index });
        await this.call.saveInputFile({ packageId, fileId, contents });
        return this.call.selectFile({ packageId, fileId });
      },
      onSuccess(packages) {
        return {...packages};
      },
      onError(packages) {
        return {...packages};
      }
    },


    //////////////////////
    // Delete an input file from the specified package.
    {
      name: "deleteInputFile",
      async promise(packages, { packageId = packages.packageId, fileId }) {
        if (!fileId) throw new TypeError("packages.deleteFile(): You must specify 'fileId'");

        // if there's already a file with that id, just return a resolved promise
        //  and we'll select it in the onSuccess handler
        let index = await factory.call.loadPackageIndex({ packageId });
        if (!index)  throw new TypeError(`packages.newFile(): Can't load package index for ${packageId}`);

        // add an entry to the index and save it
        index = {
          ...index,
          files: index.files.filter( file => file.id !== fileId )
        }
        const fileName = this.getInputFileName(packageId, fileId);
        await this.call.savePackageIndex({ packageId, index });
        await this.call.deleteFile({ packageId, fileName });
        // select the first item in the package
        return this.call.selectFile({ packageId });
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
        const fileName = this.getIndexFileName(packageId);
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
        const fileName = this.getIndexFileName(packageId);
        return { packageId, fileName, contents: index}
      }
    },

    //////////////////////
    // Load a single input file.
    {
      name: "loadInputFile",
      ACTION: "LOAD_FILE",
      async: true,
      getParams({ packageId, fileId, reload }) {
        const fileName = this.getInputFileName(packageId, fileId);
        return { packageId, fileName, reload, format: Formats.TEXT }
      },
    },

    //////////////////////
    // Save an input file.
    {
      name: "saveInputFile",
      ACTION: "SAVE_FILE",
      async: true,
      getParams({ packageId, fileId, contents }) {
        const fileName = this.getInputFileName(packageId, fileId);
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
          return getText({ url, apiMethod: "loadFile" })
        else
          return getJSON5({ url, apiMethod: "loadFile" });
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
        return postText({ url, body: contents, apiMethod: "saveFile" })
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
        return DELETE({ url, apiMethod: "deleteFile" })
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
export default factory;

// DEBUG
window.packages = factory;


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


