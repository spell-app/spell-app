/// <reference types="node" />

import { fileURLToPath } from "node:url"

import { NodePackage } from "../NodePackage.ts"
import type { VisualBrowser, VisualOs } from "./visual.types.ts"

/**
 * ### `VisualSettings`
 * Constants of `yarn test:visual`, shared by the CLI (`VisualRunner`), the Playwright config and the spec.
 * - The per-run choices travel to Playwright as environment variables instead:  `VisualVariables` and
 *   `environment.visual` (`tools/environment.ts`).
 * - STATIC only:  constants and two pure lookups, no state.
 * - See `docs/visual-testing.md`.
 */
export class VisualSettings {
  /** repo root, with a trailing slash */
  static readonly ROOT = fileURLToPath(new URL("../../", import.meta.url))
  /** baselines, in git:  `<os>/<browser>/ui-<family>/<file>.png` */
  static readonly BASELINES = `${VisualSettings.ROOT}test/visual/baselines`
  /** diffs, HTML reports, the parity report (git-ignored) */
  static readonly RESULTS = `${VisualSettings.ROOT}tools/results/visual`
  /** the fixture page, served by the Vite dev server */
  static readonly FIXTURE = "/tools/visual/fixture.html"
  /**
   * `--static`'s pages, served by the same dev server (`StaticPages`):
   * - `<prefix><family>/<example>.html` -- the element example, rendered statically
   * - `<prefix>ui.css` -- the stylesheet every static page links
   */
  static readonly STATIC_PAGES = "/static/"
  /** browsers, by Playwright project name */
  static readonly BROWSERS = ["chromium", "firefox", "webkit"] as const
  /** colour schemes every state is captured in, by `prefers-color-scheme` emulation */
  static readonly SCHEMES = ["light", "dark"] as const
  /** fixed viewport:  wide enough for Fomantic's computer layouts (768px+), no device scaling */
  static readonly VIEWPORT = { width: 1024, height: 768 }
  /**
   * `Date.now()` in every page (`page.clock.setFixedTime()`);  `Temporal.Now` follows (`Fixture.ts`)
   * - NOT an example's own date (2026-09-30), so "today" is visibly its own cell in a calendar
   */
  static readonly TIME = "2026-06-15T10:00:00Z"
  /**
   * Screenshot comparison (`expect.toHaveScreenshot`), see `docs/visual-testing.md`, "Tolerances"
   * - `threshold` -- per-pixel colour distance (pixelmatch, 0-1, YIQ) under which two pixels count as SAME.
   *   Measured on a basic button's 1px border (2026-09-30):  0.02 still sees a grey 0.02 OKLCH lightness step
   *   (~5 of 255) and a faint hue tint;  Playwright's default 0.2 misses a 0.05 step
   * - `maxDiffPixels` -- differing pixels allowed per image:  a few stray anti-aliased pixels, far fewer than a
   *   1px border around even a 16px checkbox (60+)
   * - NOTE: same OS + same browser build renders bit-identically run to run (checked twice per generation), so
   *   these absorb cross-machine noise, not flake
   */
  static readonly TOLERANCE = { threshold: 0.02, maxDiffPixels: 8 }
  /**
   * `--parity` comparison of the class-grammar and element renders (and `--static`'s, of the static and element
   * renders):  looser, and it only REPORTS
   * - `threshold` -- per-pixel colour distance (0-255 per channel, max over RGB)
   * - `ratio` -- share of differing pixels over which a pair is listed as different
   */
  static readonly PARITY = { threshold: 32, ratio: 0.01 }

  /** Browser name on the command line => Playwright project name. */
  static readonly BROWSER_FLAGS: Record<string, readonly VisualBrowser[]> = {
    all: VisualSettings.BROWSERS,
    chrome: ["chromium"],
    chromium: ["chromium"],
    firefox: ["firefox"],
    webkit: ["webkit"]
  }

  /**
   * Baseline folder of `os`:  `linux`, or `local-<platform>` (`local-darwin`), so a Linux laptop running
   * `--os local` never compares against Mac images.
   */
  static osFolder(os: VisualOs): string {
    return os === "linux" ? "linux" : `local-${process.platform}`
  }

  /** Installed `@playwright/test` version:  the Docker image and the browser server MUST match it. */
  static playwrightVersion(): string {
    NodePackage.need("@playwright/test")
    return NodePackage.version("@playwright/test")!
  }
}
