import Bundler from "parcel-bundler";
import chalk from "chalk";
import express from "express";
import express_json5 from "express-json5";
import "json5/lib/register";
import path from "path";

import responseUtils from "./src/server/response-utils.js";
import api from "./src/server/api.js";


const buildFolder = path.join(__dirname, "build");
const port = process.env.PORT || 5000;

// Create the parcel bundler
const startFile = path.join(__dirname, "src/index.html");
const parcelOptions = {
  outDir: "./build",
  watch: true
}
const bundler = new Bundler(startFile, parcelOptions);

const app = express();
app.use(express_json5());
app.use("/api", api);
// Use parcel to serve static files.
// This MUST come after `use()` of any other middlewares.
app.use(bundler.middleware());
app.listen(port);


// Add log entry so we can see when app actually started up in console
console.warn("\n\n");
console.warn(
  chalk.green.inverse(
      "/////////////////////////////////////////////////////////////////////\n"
    + "////    A P P    R E S T A R T E D    S U C C E S S F U L L Y    ////\n"
    + "/////////////////////////////////////////////////////////////////////\n"
  ),
 ` - port:     ${port} \n`,
 ` - buildDir: ${buildFolder} \n`
);
