# WWOD spoke — Server / API + environment

House rules for routes, server APIs, and configuration.
Read with `.agents/WWOD.md` (the hub).

## 9. Server / API patterns

- [ADAPT:  APITransaction → respondWithJSON + SRV.HttpError] **Route handlers are uniform ~10-line tx bodies with no business logic:**
  - Concentrate on getting/marshalling arguments, then pass off to controller/api layer.
  - This keeps route handlers tiny and helps with logging.
  - Pattern:

  ```
    const tx = new APITransaction({ event, op })`
    try {
      tx.authorize()
      `*OrDie` getters →
      one API call →
      transform data if necessary →
      `tx.returnJSON(...)`.
    } catch (error) {
      return tx.throw(error)
    }
  ```

  - [DROP:  SvelteKit file routes;  ours is one table (app api.ts)] One `[requiredParam]` or `[[optionalParam]]` route file holding GET/POST/PUT/DELETE —
    not one file per verb.

- [ADAPT:  grow response-utils.ts helpers, not route-local ones] **Grow `APITransaction`, don't write local route helpers:** New capability =
  - [DROP:  no @memoize decorator, no spans here] a `@memoize` (+ `@withMethodSpan("api.x.get")`) getter (`tx.publishAPI`), or
  - a small accessor under its own banner (`getRouteParamOrDie`, `getHeaderOrDie`, `get formData`).
- [DROP:  no auth;  local servers use SRV.Guard] **`tx.*API` getters are auth-gated if auth is required:**
  - `/api/*` routes force `tx.authorize()` even for cheap reads.
  - The only anonymous surfaces are `(open)` `/public/*` routes.
- [ADOPT] **`...OrDie` throwing twins** beside nullable getters.
  - `getXData(param)` + `getXDataOrDie(param, message = "default message")`.
  - Avoid inlining `if (!x) throw` at call sites.
- [ADOPT] **`dieIfCannotX` guards return the normalized value** so they double as coercions:
  `sourceBranch = await this.dieIfCannotReadBranch(sourceBranch)`.
- [ADOPT] **Subject-first param order**: the thing being acted on first, credentials/options after —
  `matchKeyOrDie(metadata, unhashedKey, userId)`.
- [DROP:  FilesAPI / StorageAdapter / Gitea are construct-app's] **Two-layer storage split:**
  - `FilesAPI` owns cache + URL validation; `abstract StorageAdapter` owns I/O.
  - The API subclass builds its adapter in its constructor and narrows via generic +
    `declare public adapter: GiteaAdapter`.
  - [ADAPT:  *.server.ts → src/node/ (AGENTS.md "Imports")] Server-only code in `*.server.ts`.
- [ADOPT] **Abstract class = interface + shared policy in one:**
  - `public abstract` for primitives.
  - Concrete composed logic on the same class (`StorageAdapter.duplicateProject`).
- [DROP:  FilesAPI-adapter shape;  line-1 normalize is in §11] **API methods: normalize the URL on line 1, one-line delegate to the adapter:**
  - [ADOPT] Stock docstring bullets: `- Returns …`, `- Throws if …`,
    `- Does not update cache, use \`X.save()\``.
- [DROP:  no external API here (Gitea-only)] **One overloaded request helper per external API** (`GiteaFilesAPI.server.ts`).
  - Thread an `apiMethod` label into every error cause.
  - One status-code ladder mapping to house errors.
- [ADAPT:  APITransaction statics → response-utils.ts constants] **Shared response constants are `APITransaction` statics** — not route-local strings.
  - `CACHE_IMMUTABLE`, `CACHE_REVALIDATE`, `CACHE_SHORT`, `FORWARD_EXCLUDE_HEADERS`.
  - [DROP:  no APITransaction or spans;  SRV.toListener maps errors] Anonymous endpoints still use `new APITransaction({ event, op })`
    for uniform logging/span/error mapping.
- [ADOPT] **Server `error.message` strings should be user-facing.**

## 10. Environment & configuration

- [ADOPT] **Throw at startup for configuration errors** not at request time
  - e.g. missing required vars, no auth providers
- [ADAPT:  one environment.ts per package;  strays → CODE-DEBT (D3)] **ONLY access `process.env` in `environment.server.ts` and `environment.client.ts`**
  - NEVER have bare import of `process.env` in any other file if it can be avoided.
- [ADOPT] **Guard initialization on feature flags**:
  - Don't initialize modules that aren't enabled.
  - [DROP:  construct-app example (RexApp)] `if (environment.rex.enabled) context.rex = new RexApp(context)`.
- [ADAPT:  SPELL_* for ours (SPELL_PROJECTS_DIR), bare for shared] **New env vars use app-specific prefixes** (`CONSTRUCT_*`, `CIRCUITS_*`) when behavior may
  differ per app; use unprefixed for shared config.
- [ADAPT:  helpers beside environment.ts;  none exist yet] **Never parse env vars inline** — add missing helpers (`getNumber()`, `getBoolean()`,
  `getString()`) to `environment-helpers.ts`.
