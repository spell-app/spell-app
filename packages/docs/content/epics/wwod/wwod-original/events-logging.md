# WWOD spoke — Monitoring, events & logging

House rules for analytics events and logging.
Read with `.agents/WWOD.md` (the hub).

## 20. Monitoring / events

- **Two channels — pick the right one:**
  - `app.trackEvent("some-action")` for UI interaction breadcrumbs (button clicks, menu
    picks). Each app's `trackEvent()` wrapper prepends its category:
    `construct.trackAppEvent(appName, eventName)` → `"CircuitDesigner: some-action"`.
  - `trackPostHogEvent({ event, ...properties })` (`posthog.client.ts`) for typed product
    analytics with payloads. Silently no-ops when PostHog is disabled.
- **Events are TYPED discriminated unions, one module per feature area**
  (`CD-events.ts`, `OPEN-publish-events.ts`, ...).
  - Each variant: `{ event: "name"; ...payload }`; shared payload enums as exported types
    (`CD_SAVE_TYPE = "save" | "save_as" | ...`).
  - Register the feature union into its app union (`OPEN_PUBLISH_EVENTS` → `OPEN_EVENTS`);
    `trackPostHogEvent<E extends CIRCUIT_EVENTS | ... | OPEN_EVENTS>` enforces membership.
  - New feature = new `<AREA>-events.ts` + one line in the union — never inline event
    strings at call sites.
- **Instrument the funnel, not just the outcome.**
  - Kebab-case step names: `publish-initiated`, `publish-show-dialog`,
    `publish-prompt-for-overwrite`, `publish-cancel-overwrite`.
  - Shared flows log via the injected `logEvent(action, options)` callback so the
    controller stays app-agnostic; the app supplies the PostHog binding
    (`CDApp.getPublishOptions()`).
  - One generic payload type per feature (`{ event, type, message?, file? }`), not one
    bespoke shape per step.
- **Track at the decision point**: entry methods log `*-initiated` before gathering options;
  outcome events fire where the outcome is known (controller), not in the UI layer.
- **Local convention wins when extending an existing enum** (snake_case `publish_qre` stays
  snake_case in `CDX_SIGNUP_TRIGGER`).
- **Server-side spans come free**: `APITransaction` opens a span per op; decorate new
  API-layer methods with `@withMethodSpan("api.x.y")` (`decorators.server.ts`) instead of
  hand-rolling Sentry calls. Sentry usage belongs in `$lib/monitoring/`, not app code.

## 21. Logging

- **Structured logging via `makeLogger()`** (`monitoring/consola.ts`), not bare `console.log`.
  - The base logger lives on `AppContext` (`context.logger`) — derive app loggers from it.
- **Derive a tagged child logger per subsystem**, as a class field:
  - `this.logger = makeLogger({ base: context.logger, tag: "cd" })` (`CDApp`)
  - Multiple named streams per class when subsystems differ:
    `authLog = makeLogger({ base: context.logger, tag: "auth" })`, `filesLog` (`ConstructApp`).
  - Tags nest through `base`: child of `MyProcess` logs as `MyProcess:child`.
- **Verbosity is env-controlled per subsystem**:
  - `level: context.environment.construct.debugLevel`,
    fed by `getDebugLevel({ key: "CONSTRUCT_DEBUG" })`
    (`CIRCUITS_DEBUG`, `GITEA_DEBUG`, ... per app section).
  - Pass `level` as a `LogLevel` string (`"DEBUG"`) or `Log.*` number; default is quiet
    (`ERROR`).
- **Message format**: emitting method prefix, then a data object —
  `this.authLog.debug("oaStartSignInFlow(): auth0SDK.signIn result:", result)`.
- **Level semantics**:
  - `debug` for flow tracing (sign-in steps, cache decisions)
  - `warn`/`error` for real problems (`authLog.error("Failed to get circuits logout URL:", error)`)
  - `start`/`success`/`fail` for transaction banners (`APITransaction`:
    `>>>> ${op} START >>>>`).
- **Server routes**: per-op logger via `new APITransaction({ event, op })` —
  `makeLogger({ tag: op, level: debug ? "DEBUG" : "INFO" })`; don't make your own in a route.
- **`console.*` is reserved for**:
  - `console.error` in best-effort `catch (ignored)` blocks where no logger is defined
  - `setDebugGlobal()` for object inspection (see the hub's Working process).
