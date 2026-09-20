# Papercuts

Log of things that slowed down development. Date · symptom · fix · project.

- 2026-09-19 · Browser-only React error (hook-order warning) couldn't be diagnosed from the terminal — no
  browser/console access, and no playwright/puppeteer in the repo, so the real stack trace was invisible and
  static reading of the component turned up nothing. · Drove headless Chrome directly over CDP from a ~90-line
  Node script (`--headless=new --remote-debugging-port`, `PUT /json/new?<url>`, then Node 22's built-in global
  `WebSocket` + `Runtime.enable` to capture `Runtime.consoleAPICalled` / `Runtime.exceptionThrown` with
  `stackTrace.callFrames`). No dependencies needed. Gave the exact frame within a minute. · spell/parser
- 2026-09-19 · Upgraded `semantic-ui-react` and browser-tested it green — against the OLD version. A
  long-running `vite` dev server keeps serving its already-optimized `node_modules/.vite/deps` bundle,
  so a dependency version change is invisible to the browser and every check passes misleadingly. ·
  Assert the version in the page before trusting a result (`typeof SUI.Visibility` told us v2 vs v3),
  and re-verify against a server started with `vite --force`. Restart the dev server after ANY
  dependency change. · spell/parser
