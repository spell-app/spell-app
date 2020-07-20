import bodyParser from "body-parser"
import Bundler from "parcel-bundler"
import chalk from "chalk"
import express from "express"
import express_json5 from "express-json5"
import "json5/lib/register"
import path from "path"

import { api } from "./src/server/api"

const buildFolder = path.join(__dirname, "build")
const staticFolder = path.join(__dirname, "static")
const port = process.env.PORT || 5000

// Create the parcel bundler
const startFile = path.join(__dirname, "src/index.html")
const parcelOptions = {
  outDir: buildFolder,
  watch: true,
  hmr: false
}
const bundler = new Bundler(startFile, parcelOptions)

const app = express()

// Add JSON5 support
app.use(express_json5())

// Set up body parsers for text, json and form-urlencoded
app.use(bodyParser.text({ limit: "10mb" }))
app.use(bodyParser.json({ limit: "10mb" }))
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }))

// Use our api routines under `/api/...`
app.use("/api", api)

// Use parcel to serve static files.
// This MUST come after `use()` of any other middlewares.
app.use(bundler.middleware())

// Make everything else render `index.html` for front-end routing
app.use("*", (request, response) => {
  response.sendFile("src/index.html")
})

// Go go go!
app.listen(port)

// Add log entry so we can see when app actually started up in console
console.warn("\n\n")
console.warn(
  chalk.green.inverse(
    "/////////////////////////////////////////////////////////////////////\n" +
      "////    A P P    R E S T A R T E D    S U C C E S S F U L L Y    ////\n" +
      "/////////////////////////////////////////////////////////////////////\n"
  ),
  ` - port:          ${port} \n`,
  ` - buildFolder:   ${buildFolder} \n`,
  ` - staticFolder:  ${staticFolder} \n`
)
