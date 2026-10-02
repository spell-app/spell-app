// FIRST:  defines `__PACKAGE_VERSION__`, which vite would, before anything reads it
import "$/spell/node/packageVersion.node"

import JSON5 from "json5"
import path from "path"

import { SRV } from "$/server"
import environment from "$/spell/node/environment"
import { api } from "./api"

/**
 * The app's API server, on `$/server`'s `WebServer` (it was Express):  `yarn start:server`.
 * - `/api/...` -- see `./api` for the route table;  `/hello` -- liveness
 * - bodies parse for EVERY verb (a `DELETE` with a JSON body too), as JSON5 (forgiving JSON), text or a form, up to
 *   10mb
 * - production (`NODE_ENV=production`):  `dist/`, and `index.html` for any other path (the SPA's client routing)
 * - development:  `/static`, `/element` (`<spell-app>`'s bundle) and `/demo`;  the editor UI itself is vite's
 * - binds 0.0.0.0, as Express did:  vite (and a LAN device) reach it;  no `Host` check, since vite's proxy and the
 *   page server pass requests on with their own
 */
const server = new SRV.WebServer({
  checkHost: false,
  mounts:
    process.env.NODE_ENV === "production"
      ? [{ prefix: "/", dir: path.join(process.cwd(), "dist") }]
      : [
          { prefix: "/static", dir: environment.staticDir },
          { prefix: "/element", dir: path.join(process.cwd(), "dist-element") },
          { prefix: "/demo", dir: path.join(process.cwd(), "demo") }
        ]
})

server.router.use(SRV.parseBodies({ limit: 10 * 1024 * 1024, parseJson: JSON5.parse }))

// Trivial liveness route, unrelated to `/api` -- just confirms the server itself is up.
server.router.get("/hello", (_request, reply) => reply.json({ message: "Hello from the API!" }))

// Mount all real api routines under `/api/...` -- see `./api` for the route table.
server.router.use("/api", api)

// Production:  `index.html` for every other path, so client-side (SPA) routing can take over.
if (process.env.NODE_ENV === "production") {
  server.fallback.get("*", (_request, reply) => reply.sendFile(path.join(process.cwd(), "dist", "index.html")))
}

await server.listen({ port: environment.expressPort, host: "0.0.0.0", fallback: false })
console.log(`Server running at http://localhost:${server.port}`)
