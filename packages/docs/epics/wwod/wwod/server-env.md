# WWOD spoke -- Server, API & environment

Route handlers, server-side API code, env vars and configuration.  Read with `packages/agents/wwod/WWOD.md` (the hub).
From:  original WWOD §9 "Server / API patterns", §10 "Environment & configuration".

SEE:  `packages/server/AGENTS.md` for `$/server` itself (`SRV.Router`, `SRV.WebServer`, the page server), and
`packages/app/AGENTS.md` for the app's server and `api.test.ts`.

## 10. Server & API

- **One route table, no logic in it:**
  - Each server has ONE `SRV.Router` table wiring paths to named handlers, e.g. `packages/app/src/server/api.ts`.
  - A route line is pattern + handler, nothing else.  Group lines under `////` banners (WWOD §6).
  - Handlers live in the API layer, named `request_<action>`, e.g. `request_createProject` in
    `packages/spell/src/node/project-utils.ts`.

  ```ts
  api.post("/projects/create/project", projectUtils.request_createProject)
  api.get("/projects/file/:projectId/:filePath*", projectUtils.request_getFile)
  ```

- **Route handlers are a few lines, no business logic:**
  - Get and marshal the arguments, make ONE call into the API layer, return its result.
  - Keeps handlers tiny and uniform, and keeps the logic callable without HTTP (tests, `spell` CLI).
  - The work is a plain function beside the handler (`createProject()`), the handler is its HTTP face.
  - Wrap in `respondWithJSON()` (`packages/spell/src/node/response-utils.ts`):  its return value is answered as JSON,
    a throw becomes the error answer.

  ```ts
  export const request_createProject = respondWithJSON(async (request) => {
    const { projectId, filePath, contents } = request.body
    await createProject(projectId, filePath, contents)
    return await getProjectList(projectId)
  })
  ```

- **Caller mistakes throw `SRV.HttpError`:**
  - `throw new SRV.HttpError(status, message)` for anything the caller got wrong:  400 bad input, 403, 404.
  - Anything else thrown answers 500 (`SRV.toListener()`, `packages/server/src/listener.ts`);  `respondWithJSON()`
    MUST answer an `SRV.HttpError` with its own status, not 500.
  - Inside a handler, throw;  NEVER hand-write `reply.status(4xx).send(...)` for an error.
  - ONE error body shape per server, so the client parses one thing.
  - Client side, an answered error becomes `$/util`'s `ResponseError` family (WWOD §5).
- **Grow `response-utils.ts`, don't write route-local helpers:**
  - New request / response capability = a small helper in `response-utils.ts` under its own `////` banner, e.g.
    `getIdParams()` ("Id utilities"), `sendTextFile()` ("Text responses").
  - Generic, app-agnostic pieces (body parsing, static files, routing) belong in `$/server` instead.
- **Shared response constants live with the helpers:**
  - Cache headers, content types, header lists:  named constants in `response-utils.ts` (or `$/server` when
    generic), never string literals in a route file.
- **`...OrDie` throwing twins:**
  - Beside a getter that may return `undefined`, add `getXOrDie(...)` that throws with a useful message.
  - Call sites use the twin instead of inlining `if (!x) throw`.
  - e.g. `Parser.getRuleOrDie(ruleName)` (`packages/parser/src/Parser.ts`).
- **`dieIfCannotX()` guards return the normalized value,** so they double as coercions:

  ```ts
  projectId = await this.dieIfCannotReadProject(projectId)
  ```

- **Subject-first param order:**
  - The thing acted on first, then what it becomes, then options.
  - e.g. `duplicateApp(projectId, newProjectId)`, `SpellLocation.getFileLocation(projectId, filePath)`,
    `sendFile(response, path, options)`.
- **Abstract class = interface + shared policy in one:**
  - `abstract` for the primitives each subclass supplies.
  - Concrete composed logic on the same class, built from those primitives.
  - e.g. `Loadable` (`packages/util/src/spell/Loadable.ts`):  `abstract getLoader()` / `getSaver()`, with the
    load / save state policy on the class.
- **Node-only code lives in `src/node/`:**
  - Anything touching the file system, `process` or node built-ins goes in the package's `src/node/`, imported as
    `$/spell/node/...` (root "Imports", WWOD §4), so the browser bundle never reaches it.
  - NOT:  `*.server.ts` suffixes scattered through `src/` -- a folder keeps the browser / node line visible in one
    place, and the alias table names it.
- **API docstrings use stock bullets:**
  - A request handler's docstring opens with `` `METHOD /api/path` -- what it does ``, then:
    - `- Client sends:  ...` -- route params, query, body shape
    - `- Returns:  ...`
    - `- Failure:  ...` -- each status and why
  - An API-layer method's:
    - `- Returns ...`
    - `- Throws if ...`
    - `- Does not update <cache>, use X.save()` -- when a caller might assume it does
  - e.g. every `request_*` in `packages/spell/src/node/project-utils.ts`.
- **Server `error.message` strings are user-facing:**
  - The editor shows them as is, so write them for the person using it:  what failed, and what to do.

## 11. Environment & configuration

- **ONE `environment.ts` per package reads `process.env`:**
  - `src/node/environment.ts` (or `src/environment.ts` in a node-only package, e.g. `server`, `cli`) reads every
    env var the package uses and exports ONE `environment` object of normalized values.
  - Every other file imports `environment`;  NEVER a bare `process.env` read elsewhere.
  - e.g. `packages/spell/src/node/environment.ts`.
  - Fields camelCase, named for what they mean, not for the variable.
  - Importing it is silent:  no `console.*` on load.
  - Exempt:
    - build and test configs (`vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`), which run before any
      package code
    - forwarding env to a child process (`{ ...process.env, PORT: String(port) }`), which reads nothing
  - Browser code NEVER reads `process.env`:  vite replaces it with `{}` (`packages/util/src/spell/Schema.ts`).
    Browser config comes from the server (`window.SPELL_SERVER`) or a build-time `define` (`__PACKAGE_VERSION__`).
- **Document each variable where it's read:**
  - A docstring on its `environment` field:  what it does, its default, who sets it.
  - e.g. `SPELL_PROJECTS_DIR`:  "overrides it, so the server's contract test (`api.test.ts`) can point the server at
    a temp copy".
- **Throw at startup for configuration errors,** not at request time:
  - Validate in `environment.ts` as it loads:  a missing required var, a value that doesn't parse, a path that
    isn't there.
  - The message names the variable and the fix (WWOD §5).
- **Guard initialization on feature flags:**
  - Don't create or start what isn't enabled;  check the flag at the top of the start-up method.
  - e.g. `EditorServer.start()` (`packages/app/src/server/EditorServer.ts`) returns at once under
    `SPELL_NO_EDITOR`.
- **`SPELL_*` prefix for our variables:**
  - Every variable we define:  `SPELL_PROJECTS_DIR`, `SPELL_SERVER_PORT`, `SPELL_DEBUG` (WWOD §19).
  - Test-only switches too, e.g. a benchmark or full-run flag.
  - `ui` too, though it stands alone:  `SPELL_UI_<THING>` (`SPELL_UI_TEST_ALL`, not `UI_TEST_ALL`).
    - NOT:  a `UI_*` prefix of its own -- one prefix finds every variable we own.
  - A switch that turns a default OFF is `SPELL_NO_<THING>`:  `SPELL_NO_BROWSER`, `SPELL_NO_EDITOR`,
    `SPELL_NO_SERVER`.
  - Unprefixed only for variables another tool owns or sets:  `PORT`, `NODE_ENV`, `CI`, `INIT_CWD`,
    `TSX_TSCONFIG_PATH`.
- **NEVER parse env vars inline:**
  - Parse through helpers beside `environment.ts`:  `getString()`, `getNumber()`, `getBoolean()`, `getPath()`;
    add the one you need if it's missing.
  - Helpers own the edge cases once:  empty string, `"0"` / `"false"`, relative paths, a default.
  - Promote them when a second package needs them (WWOD §8).

  ```ts
  // NOT
  vitePort: Number(process.env.VITE_PORT) || 3000,
  // but
  vitePort: getNumber("VITE_PORT", 3000),
  ```
