////////////////////
//
//  Reducer and associated action creators/handlers for top-level app state data.
//
////////////////////

import JSON5 from "json5";
import { connect } from "react-redux";

import ReduxFactory from "./ReduxFactory";
import { getJSON5, getText } from "./api.js";

import parser from "../../languages/spell/spell.js";

const factory = new ReduxFactory({
  domain: "packages",

  initialState: {
    packageIds: undefined,    // Array of all known package names.
    indices: {},              // Map of `{ <packageId> => <json5 index> }` for each loaded package.
    files: {},                // Map of `{ <examplePath> => <file contents> }` for all loaded example files.

    packageId: undefined,     // Package currently selected.
    fileId: undefined,        // Package file currently selected.
    input: undefined,         // Current example input.  May be different than what's in `files`!
    output: undefined,        // Current example compiled output.
    dirty: false,             // Is the example input different than what's been saved?
  },

  // Return server path to package file.
  getPackagePath(packageId, fileName = "", extension = "") {
    return `${packageId}/${fileName}${extension}`;
  },

  // Syntactic sugar to get the bits of the data from the state.
  // NOTE: These assume the relevant data is already loaded!
  // NOTE: If you're calling these from an `onSuccess` or `onError` handler
  //       you MUST pass the `packages` passed in, or redux will complain.

  getPackageIndex(packageId, packages = this.getState()) {
    return packages.indices[packageId];
  },

  getPackageFileContents(packageId, fileName, packages = this.getState()) {
    const path = this.getPackagePath(packageId, fileName);
    return packages.files[path];
  },


  // actions
  actions: [
    {
      name: "startup",
      async promise(packages, [ packageId, fileId ]) {
        // Default to the first package
        const packageIds = await factory.call.loadPackageIds();
        if (!packageId) packageId = packageIds[0];

        return factory.call.selectPackage(packageId, fileId);
      },
      onSuccess(packages) {
        return packages;
      },
      onError(packages, error) {
        console.error("Error during startup", error);
        return packages;
      }
    },

    {
      //////////////////////
      // Select a package and example file.
      // If you don't specify an fileId, we'll return the first one in the package.
      name: "selectPackage",
      async promise(packages, [ packageId, fileId ]) {
        // First load the package index
        const index = await factory.call.loadPackageIndex(packageId);
        // if no fileId specified, use the first file in the package
        if (!fileId) fileId = index.files[0].name;
        const exampleFileName = `${fileId}.${index.inputType}`;
        return await factory.call.loadPackageFile(packageId, exampleFileName);
      },
      onSuccess(packages, fileContents, [ packageId, fileId ]) {
        if (!fileId) {
          const index = this.getPackageIndex(packageId, packages);
          fileId = index.files[0].name;
        }
        return {
          ...packages,
          packageId,
          fileId,
          input: fileContents,
          output: undefined,
          dirty: false
        }
      },
      onError(packages, error, [ packageId, fileId ]) {
        console.error("Error in selectPackage():", error);
        return packages;
      }
    },

    //////////////////////
    // Update the current example input
    {
      name: "setInput",
      handler(packages, [ input ]) {
        return {
          ...packages,
          input,
          output: undefined,
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
    // Load the list of packages.
    //  `packageIds` is a list of folder names.
    {
      name: "loadPackageIds",
      promise(packages, reload = false) {
        // Quick exit if already loaded and we're not explicitly to `reload`.
        if (!reload && packages.packageIds) {
          return packages.packageIds;
        }

        return getJSON5({ url: "api/packages", apiMethod: "loadPackageIds" })
      },
      onSuccess(packages, packageIds) {
        return {
          ...packages,
          packageIds
        }
      },
      onError(packages, error) {
        console.error("Unable to load list of packages!");
        return packages;
      }
    },

    //////////////////////
    // Load the index for a single example package.
    //  `index` is a JSON5 index for the package.
    {
      name: "loadPackageIndex",
      async promise(packages, [ packageId, reload ]) {
        // Quick exit if already loaded and we're not to `reload`.
        if (!reload) {
          const index = this.getPackageIndex(packageId, packages);
          if (index) return Promise.resolve(index);
        }

        const url = `api/packages/${packageId}`;
        return getJSON5({ url, apiMethod: "loadPackageIndex" });
      },
      onSuccess(packages, index, [ packageId ]) {
        return {
          ...packages,
          indices: {
            ...packages.indices,
            [packageId]: index
          }
        }
      },
      onError(packages, error, [ packageId ]) {
        console.error(`Unable to load index of package '${packageId}'!`, error);
        return packages;
      }
    },


    //////////////////////
    // Load a package file.
    //  `fileContents` is the contents of the file.
    {
      name: "loadPackageFile",
      getParams(packageId, fileName, reload) {
        const path = this.getPackagePath(packageId, fileName);
        return { packageId, fileName, path, reload };
      },
      promise(packages, { packageId, fileName, path, reload }) {
        // Quick exit if we're not to `reload`
        if (!reload) {
          const contents = this.getPackageFileContents(packageId, fileName, packages);
          if (contents != null) return Promise.resolve(contents);
        }
        const url = `api/packages/${path}`;
        return getText({ url, apiMethod: "loadPackageFile" })
      },
      onSuccess(packages, fileContents, { path }) {
        return {
          ...packages,
          files: {
            ...packages.files,
            [path]: fileContents
          }
        }
      },
      onError(packages, error, { path }) {
        console.error(`Unable to load file '${path}'!`, error);
        return packages;
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


