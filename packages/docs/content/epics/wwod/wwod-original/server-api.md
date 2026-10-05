# WWOD spoke — Server / API + environment

House rules for routes, server APIs, and configuration.
Read with `.agents/WWOD.md` (the hub).

## 9. Server / API patterns

- **Route handlers are uniform ~10-line tx bodies with no business logic:**
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

  - One `[requiredParam]` or `[[optionalParam]]` route file holding GET/POST/PUT/DELETE —
    not one file per verb.

- **Grow `APITransaction`, don't write local route helpers:** New capability =
  - a `@memoize` (+ `@withMethodSpan("api.x.get")`) getter (`tx.publishAPI`), or
  - a small accessor under its own banner (`getRouteParamOrDie`, `getHeaderOrDie`, `get formData`).
- **`tx.*API` getters are auth-gated if auth is required:**
  - `/api/*` routes force `tx.authorize()` even for cheap reads.
  - The only anonymous surfaces are `(open)` `/public/*` routes.
- **`...OrDie` throwing twins** beside nullable getters.
  - `getXData(param)` + `getXDataOrDie(param, message = "default message")`.
  - Avoid inlining `if (!x) throw` at call sites.
- **`dieIfCannotX` guards return the normalized value** so they double as coercions:
  `sourceBranch = await this.dieIfCannotReadBranch(sourceBranch)`.
- **Subject-first param order**: the thing being acted on first, credentials/options after —
  `matchKeyOrDie(metadata, unhashedKey, userId)`.
- **Two-layer storage split:**
  - `FilesAPI` owns cache + URL validation; `abstract StorageAdapter` owns I/O.
  - The API subclass builds its adapter in its constructor and narrows via generic +
    `declare public adapter: GiteaAdapter`.
  - Server-only code in `*.server.ts`.
- **Abstract class = interface + shared policy in one:**
  - `public abstract` for primitives.
  - Concrete composed logic on the same class (`StorageAdapter.duplicateProject`).
- **API methods: normalize the URL on line 1, one-line delegate to the adapter:**
  - Stock docstring bullets: `- Returns …`, `- Throws if …`,
    `- Does not update cache, use \`X.save()\``.
- **One overloaded request helper per external API** (`GiteaFilesAPI.server.ts`).
  - Thread an `apiMethod` label into every error cause.
  - One status-code ladder mapping to house errors.
- **Shared response constants are `APITransaction` statics** — not route-local strings.
  - `CACHE_IMMUTABLE`, `CACHE_REVALIDATE`, `CACHE_SHORT`, `FORWARD_EXCLUDE_HEADERS`.
  - Anonymous endpoints still use `new APITransaction({ event, op })`
    for uniform logging/span/error mapping.
- **Server `error.message` strings should be user-facing.**

## 10. Environment & configuration

- **Throw at startup for configuration errors** not at request time
  - e.g. missing required vars, no auth providers
- **ONLY access `process.env` in `environment.server.ts` and `environment.client.ts`**
  - NEVER have bare import of `process.env` in any other file if it can be avoided.
- **Guard initialization on feature flags**:
  - Don't initialize modules that aren't enabled.
  - `if (environment.rex.enabled) context.rex = new RexApp(context)`.
- **New env vars use app-specific prefixes** (`CONSTRUCT_*`, `CIRCUITS_*`) when behavior may
  differ per app; use unprefixed for shared config.
- **Never parse env vars inline** — add missing helpers (`getNumber()`, `getBoolean()`,
  `getString()`) to `environment-helpers.ts`.
