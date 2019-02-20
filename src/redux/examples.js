////////////////////
//
//  Reducer and associated action creators/handlers for top-level app state data.
//
////////////////////

import JSON5 from "json5";

import ReduxFactory from "./ReduxFactory";
import { getJSON5 } from "../utils/api.js";


const examples = new ReduxFactory({
  domain: "examples",

  initialState: {
    packageIds: [],
    packages: {},
    files: {}
  }
});
export default examples;



//////////////////////
// Load the list of example packages.
//  `packageIds` is a list of folder names.
export const _loadExamplesIndex = examples.addAsyncAction({
  name: "loadExamplesIndex",
  once: true,
  promise(exampleDB) {
    return getJSON5({ url: "api/examples", apiMethod: "loadExamplesIndex" })
  },
  onSuccess(exampleDB, packageIds) {
    return {
      ...exampleDB,
      packageIds
    }
  },
  onError(exampleDB, error) {
    console.error("Unable to load list of examples!");
    return exampleDB;
  }
});

//////////////////////
// Load the index for a single example package.
//  `index` is a JSON5 index for the package.
export const _loadExampleIndex = examples.addAsyncAction({
  name: "loadExampleIndex",
  once(packageId, reload) {
    if (reload) this.resetCall("loadExampleIndex", packageId);
    return packageId;
  },
  promise(exampleDB, packageId) {
    return getJSON5({ url: `api/examples/${packageId}`, apiMethod: "loadExampleIndex" })
  },
  onSuccess(exampleDB, index, packageId) {
    return {
      ...exampleDB,
      packages: {
        ...exampleDB.packages,
        [packageId]: index
      }
    }
  },
  onError(exampleDB, error, packageId) {
    console.error(`Unable to load index of package '${packageId}'!`, error);
    return exampleDB;
  }
});


//////////////////////
// Load a package file.
//  `fileContents` is the contents of the file.
export const _loadExampleFile = examples.addAsyncAction({
  name: "loadExampleFile",
  once(packageId, fileName, reload) {
    const path = getExamplePath(packageId, fileName);
    if (reload) this.resetCall("loadExampleFile", path);
    return path;
  },
  promise(exampleDB, packageId, fileName) {
    return getText({ url: `api/examples/${packageId}`, apiMethod: "loadExampleFile" })
  },
  onSuccess(exampleDB, fileContents, packageId, fileName) {
    const path = getExamplePath(packageId, fileName);
    return {
      ...exampleDB,
      files: {
        ...exampleDB.files,
        [path]: fileContents
      }
    }
  },
  onError(exampleDB, error, packageId, fileName) {
    console.error(`Unable to load file '${getExamplePath(packageId, fileName)}'!`, error);
    return exampleDB;
  }
});

export function getExamplePath(packageId, fileName) {
  return `${packageId}/${fileName}`;
}
