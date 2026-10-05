# WWOD spoke -- Logging & debug

Logging through `$/util`'s `Logger`, verbosity, and what `console.*` is still for.  Read with
`packages/agents/wwod/WWOD.md` (the hub).
From:  original WWOD §21 "Logging".

## 19. Logging & debug

- **Log through a `Logger`, not bare `console.*`:**
  - `new Logger({ prefix, level })` from `$/util` (`packages/util/src/spell/Logger.ts`).
  - A logger can be turned up or down per subsystem at runtime;  `console.*` can't.
  - TODO:  epic `logger-everywhere` -- today only `Tokenizer` uses `Logger`.
- **One tagged logger per subsystem, as a class field:**

  ```ts
  /** Debug logger. */
  logger = new Logger({ prefix: "tokenizer", level: Logger.ERROR })
  ```

  - e.g. `Tokenizer` (`packages/parser/src/tokenizer/Tokenizer.ts`).
  - Several named streams when a class spans subsystems:  `authLog`, `filesLog`, each its own `Logger`.
  - A sub-subsystem names its parent in its prefix:  `prefix: "server:api"`.
- **Quiet by default:**
  - `Logger`'s default level is `WARN`.  Hot paths start lower (`ERROR`, `OFF`), e.g. the tokenizer.
  - Pass `level` as `Logger.DEBUG` ... `Logger.OFF`, never a bare string.
  - Turn one up while debugging by setting its `level` (`this.logger.level = Logger.DEBUG`), or through
    `SPELL_DEBUG` -- never by editing its default and committing it.
- **`SPELL_DEBUG` sets verbosity per subsystem:**
  - Node packages read it in `environment.server.ts` (WWOD §11), never in `Logger`, which stays browser-safe.
  - Comma-separated logger prefixes, each with an optional level;  a bare prefix means `DEBUG`:
    `SPELL_DEBUG=tokenizer,server:INFO`.
  - A logger takes its level from it when named there, else its coded default.
  - Each package also has its own, `SPELL_<PKG>_DEBUG` (`SPELL_UI_DEBUG`, `SPELL_PARSER_DEBUG`):  same format, for
    that package's loggers only, read in its `environment.server.ts`.
  - In the browser, set `level` from the console instead, on a logger exposed with `setDebugGlobal()` (WWOD §1).
- **Message format:  emitting method first, then the data:**
  - `"method(): what happened:"`, then the values as separate arguments, so the console shows them as objects.

  ```ts
  this.logger.warn("tokenize(): didn't consume:", text.slice(start, end))
  ```

- **Level semantics:**
  - `debug` -- flow tracing:  steps, cache decisions, what was matched
  - `info` -- milestones:  a server listening, a project loaded
  - `warn` -- unexpected but handled:  input skipped, a fallback taken
  - `error` -- real failures:  `this.logger.error("saveFile(): write failed:", error)`
  - `group()` opens a `console.group()` at `INFO`;  ALWAYS pair it with `groupEnd()`, which isn't level-gated.
- **`console.*` is reserved for:**
  - `console.error` in a best-effort `catch` where no logger exists
  - developer warnings a library MUST always show, whatever the level, e.g. `@spell-app/ui`'s one `console.error`
    naming the tag when an element's render throws (`packages/ui/test/fallback.cases.ts`)
  - NOT for inspecting objects while debugging:  expose them with `setDebugGlobal()` (WWOD §1)
  - SEE:  `packages/cli/AGENTS.md` -- in the CLI `console.*` is SILENCED;  output goes to `process.stdout` / `stderr`
