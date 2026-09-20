import bodyParser from "body-parser"
import express, { Request, Response } from "express"
import express_json5 from "express-json5"
import path from "path"

import environment from "~/environment"
import { api } from "./api"

const app = express()

// Add JSON / JSON5 body-parser support -- lets request bodies use `express-json5`'s more forgiving syntax.
app.use(express_json5())

// Set up body parsers for text, json and form-urlencoded.
// NOTE: applies globally regardless of HTTP verb, so `DELETE` routes with a JSON body (see `api.ts`) still parse.
app.use(bodyParser.text({ limit: "10mb" }))
app.use(bodyParser.json({ limit: "10mb" }))
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }))

// Trivial liveness route, unrelated to `/api` -- just confirms express itself is up.
app.get("/hello", (request: Request, response: Response) => {
  response.json({ message: "Hello from the API!" })
})

// Mount all real api routines under `/api/...` -- see `./api` for the route table.
app.use("/api", api)

// Serve static files from `dist` in production.
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(process.cwd(), "dist")))

  // Serve `index.html` for all non-API routes so client-side (SPA) routing can take over.
  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), "dist", "index.html"))
  })
} else {
  // Development: serve static files from `environment.staticDir` instead of a built `dist`.
  app.use("/static", express.static(environment.staticDir))
}

app.listen(environment.expressPort, () => {
  console.log(`Server running at http://localhost:${environment.expressPort}`)
})
