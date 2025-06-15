import bodyParser from "body-parser"
import express /*, type { Request, Response } */ from "express"
import express_json5 from "express-json5"

import { api } from "./api.js"

import environment from "../environment.js"
console.log({ environment })

const app = express()

// Add JSON / JSON5 body parser support
app.use(express_json5())

// Set up body parsers for text, json and form-urlencoded
app.use(bodyParser.text({ limit: "10mb" }))
app.use(bodyParser.json({ limit: "10mb" }))
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }))

// TEST API routes
app.get("/hello", (request, response) => {
  response.json({ message: "Hello from the API!" })
})

// Use our api routines under `/api/...`
app.use("/api", api)

// Serve static files from the dist directory
app.use("/static", express.static("../../static"))

// Make everything else render `index.html` for front-end routing
app.use("*", (request, response) => {
  response.sendFile("src/app/_vite/index.html")
})

app.listen(environment.expressPort, () => {
  console.log(`Server running at http://localhost:${environment.expressPort}`)
})
