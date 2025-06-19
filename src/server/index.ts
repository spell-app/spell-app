import bodyParser from "body-parser"
import express, { Request, Response } from "express"
import express_json5 from "express-json5"

import environment from "../environment.js"
import { api } from "./api.ts"

const app = express()

// Add JSON / JSON5 body parser support
app.use(express_json5())

// Set up body parsers for text, json and form-urlencoded
app.use(bodyParser.text({ limit: "10mb" }))
app.use(bodyParser.json({ limit: "10mb" }))
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }))

// API routes
app.get("/hello", (request: Request, response: Response) => {
  response.json({ message: "Hello from the API!" })
})

// Use our api routines under `/api/...`
app.use("/api", api)

// Serve static files from the dist directory
// REFACTOR: static files are served by vite, so this is not needed?
app.use("/static", express.static(environment.staticDir)) // Make everything else render `index.html` for front-end routing

app.listen(environment.expressPort, () => {
  console.log(`Server running at http://localhost:${environment.expressPort}`)
})
