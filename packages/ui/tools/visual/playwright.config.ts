/// <reference types="node" />

import { defineConfig } from "@playwright/test"

import type { VisualOs } from "./visual.types.ts"
import { VisualSettings } from "./VisualSettings.ts"

/**
 * Playwright config of `yarn test:visual`, separate from Vitest:  run it through the CLI (`tools/visual/cli.ts`),
 * which starts the dev server (and, for `--os linux`, the Docker browser server) and sets `VisualSettings.ENV`.
 * - One project per browser;  the CLI picks them with `--project`.
 * - Baselines:  `test/visual/baselines/<os>/<browser>/<family>/<file>.png` (`snapshotPathTemplate`), where
 *   `<os>` is `linux` or `local-<platform>` (`VisualSettings.osFolder()`).
 * - Results (diffs, the HTML report):  `tools/results/visual/<os>/`, git-ignored.
 * - `linux`:  `connectOptions` points every project at the browser server in Docker;  `exposeNetwork:
 *   "<loopback>"` tunnels the page's `localhost` requests back to this machine's dev server, so pixels are
 *   rendered by Linux while our (macOS-native) toolchain stays on the host.
 * - No retries:  a flaky capture is fixed at its source (`docs/visual-testing.md`, "Troubleshooting").
 */
const env = process.env
const os: VisualOs = env[VisualSettings.ENV.os] === "linux" ? "linux" : "local"
const folder = VisualSettings.osFolder(os)
const ws = env[VisualSettings.ENV.ws]
const workers = env[VisualSettings.ENV.workers]

export default defineConfig({
  testDir: ".",
  testMatch: "visual.spec.ts",
  snapshotPathTemplate: `${VisualSettings.BASELINES}/${folder}/{projectName}/{arg}{ext}`,
  outputDir: `${VisualSettings.RESULTS}/${folder}/output`,
  reporter: [["line"], ["html", { outputFolder: `${VisualSettings.RESULTS}/${folder}/report`, open: "never" }]],
  fullyParallel: true,
  retries: 0,
  workers: workers ? (workers.endsWith("%") ? workers : Number(workers)) : "50%",
  timeout: 90_000,
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      scale: "css",
      ...VisualSettings.TOLERANCE
    }
  },
  use: {
    baseURL: env[VisualSettings.ENV.baseUrl],
    viewport: VisualSettings.VIEWPORT,
    deviceScaleFactor: 1,
    colorScheme: "light",
    locale: "en-US",
    timezoneId: "UTC",
    contextOptions: { reducedMotion: "reduce" },
    connectOptions: ws ? { wsEndpoint: ws, exposeNetwork: "<loopback>" } : undefined
  },
  projects: VisualSettings.BROWSERS.map((name) => ({ name, use: { browserName: name } }))
})
