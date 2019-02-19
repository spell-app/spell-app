const express = require("express");
const Bundler = require("parcel-bundler");
const path = require("path");
const serveStatic = require("serve-static");

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
app.use(bundler.middleware());
app.use(serveStatic(buildFolder));
app.listen(port);
console.log("server started at port: " + port + "\nserving from: " + buildFolder);
