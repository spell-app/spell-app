/// <reference types="node" />

/**
 * `ui`'s environment variables:  the ONE place `tools/`, `scripts/` and the configs (`vite.config.ts`,
 * `vitest.config.ts`, `tools/visual/playwright.config.ts`) read `process.env` (WWOD §11).
 * - Node only, and at the BOTTOM of the import graph:  imports node built-ins and nothing of ours, so a config
 *   Vite bundles (`vite.config.ts`) and a Playwright worker can both load it.  NEVER imported by `src/` or a page
 *   script:  Vite replaces `process.env` with `{}` in the browser.
 * - Our variables are `SPELL_UI_*`;  `CI` and `INIT_CWD` are other tools' names, read as they are.
 * - Read ONCE, as the module loads;  a bad value throws then (`TypeError`, naming the variable), not mid-run.
 * - Parsed only through the `get*()` helpers below (empty means unset;  `"0"` / `"false"` / `"no"` / `"off"` mean
 *   false);  add one when a variable needs a new shape.
 * - Importing it is silent.
 * - Exempt (WWOD §11):  forwarding `process.env` to a child process, which reads nothing (`VisualRunner`).
 */

import path from "node:path"

/**
 * Variables `yarn test:visual` hands to Playwright:  `VisualRunner` sets them on the child it spawns, the config and
 * the spec read them back through `environment.visual`.
 * - Why variables:  Playwright loads its config and the spec in fresh worker processes, so nothing else reaches them.
 */
export const VisualVariables = {
  /** `local` or `linux` */
  os: "SPELL_UI_VISUAL_OS",
  /** the dev server's origin, e.g. `http://localhost:5391` */
  baseUrl: "SPELL_UI_VISUAL_BASE_URL",
  /** `ws://...` of the Docker browser server (`linux` only) */
  ws: "SPELL_UI_VISUAL_WS",
  /** `1`:  add the parity checks */
  parity: "SPELL_UI_VISUAL_PARITY",
  /** `1`:  ONLY the static checks (static render vs elements), no captures against baselines */
  static: "SPELL_UI_VISUAL_STATIC",
  /** Playwright workers, e.g. `4` or `50%` */
  workers: "SPELL_UI_VISUAL_WORKERS"
} as const

/** Where `yarn test:visual`'s browsers run:  the host's own, or Linux ones in Docker. */
export const VisualOses = ["local", "linux"] as const
/** One of `VisualOses`. */
export type VisualOs = (typeof VisualOses)[number]

// Above `environment`:  the helpers read them while the module loads

/** Values a boolean variable reads as false;  any other non-empty value is true (`CI=woodpecker`). */
const FALSE_VALUES = /^(0|false|no|off)$/i

/** A count (`4`) or a share of the machine's cores (`50%`), as Playwright's `workers` takes it. */
const COUNT_OR_PERCENT = /^(\d+)(%?)$/

/**
 * Every environment variable `ui`'s tooling reads, normalized.
 */
export const environment = {
  /**
   * Run the `browser` test project in chromium, firefox AND webkit, one file at a time (`vitest.config.ts`).
   * - `SPELL_UI_TEST_ALL`, set by `yarn test:all`;  default off (chromium only, files in parallel).
   */
  isAllBrowsers: getBoolean("SPELL_UI_TEST_ALL"),
  /**
   * Solid's PRODUCTION runtime under `vite dev` (no dev diagnostics, no performance tracks), for timing
   * `tools/demo/perf.html` (`vite.config.ts`).
   * - `SPELL_UI_SOLID_PROD`, set by hand;  default off.
   */
  isSolidProduction: getBoolean("SPELL_UI_SOLID_PROD"),
  /**
   * Extracted Font Awesome package `yarn gen:icons` reads (`<dir>/package/...`), resolved against `invocationDir`.
   * - `SPELL_UI_FA_PACKAGE_DIR`, set by hand;  unset:  the script's own cache under the OS temp dir.
   */
  fontAwesomeDir: getPath("SPELL_UI_FA_PACKAGE_DIR"),
  /**
   * Running on a shared CI runner:  tests skip their timing budgets (`inject("ci")`, `vitest.config.ts`).
   * - `CI`, set by the CI service (`true`, `1` ...);  `CI=false` / `CI=0` / unset:  not CI.
   */
  isCI: getBoolean("CI"),
  /**
   * Folder the person ran `yarn` from:  where a relative path argument or variable is resolved.
   * - `INIT_CWD`, set by yarn (a script runs in its package's folder);  default:  the process's own folder.
   */
  invocationDir: getString("INIT_CWD") ?? process.cwd(),
  /** `yarn test:visual`'s per-run choices, set by `VisualRunner` for Playwright (`VisualVariables`). */
  visual: {
    /** where the browsers run;  default `local` (outside a run:  Playwright started by hand) */
    os: getChoice(VisualVariables.os, VisualOses, "local"),
    /** the dev server's origin, e.g. `http://localhost:5391` */
    baseUrl: getString(VisualVariables.baseUrl),
    /** `ws://...` of the Docker browser server;  `linux` only */
    ws: getString(VisualVariables.ws),
    /** add the class-grammar vs elements comparisons (`--parity`) */
    isParity: getBoolean(VisualVariables.parity),
    /** run ONLY the static render vs elements comparisons (`--static`) */
    isStatic: getBoolean(VisualVariables.static),
    /** Playwright workers (`--workers`);  unset:  Playwright's config default */
    workers: getCountOrPercent(VisualVariables.workers)
  }
}

////////////////
// ## Parse helpers
////////////////

/** `name`'s value;  `undefined` when unset or empty. */
function getString(name: string): string | undefined {
  return process.env[name] || undefined
}

/** `name` as a flag:  unset or empty => `defaultValue`;  `FALSE_VALUES` => false;  anything else => true. */
function getBoolean(name: string, defaultValue = false): boolean {
  const value = getString(name)
  if (value === undefined) return defaultValue
  return !FALSE_VALUES.test(value)
}

/** `name` as an absolute path, resolved against the folder `yarn` was run from;  `undefined` when unset. */
function getPath(name: string): string | undefined {
  const value = getString(name)
  if (value === undefined) return undefined
  return path.resolve(getString("INIT_CWD") ?? process.cwd(), value)
}

/**
 * `name` as one of `choices`;  unset => `defaultValue`.
 * - throws `TypeError` for any other value
 */
function getChoice<const Choice extends string>(
  name: string,
  choices: readonly Choice[],
  defaultValue: Choice
): Choice {
  const value = getString(name)
  if (value === undefined) return defaultValue
  if (!(choices as readonly string[]).includes(value)) {
    throw new TypeError(`environment:  ${name} must be ${choices.join(" or ")}, not "${value}";  fix or unset it`)
  }
  return value as Choice
}

/**
 * `name` as a count (`4` => `4`) or a percentage (`50%`, kept as a string);  unset => `undefined`.
 * - throws `TypeError` for anything else
 */
function getCountOrPercent(name: string): number | `${number}%` | undefined {
  const value = getString(name)
  if (value === undefined) return undefined
  const [, count, percent] = COUNT_OR_PERCENT.exec(value) ?? []
  if (count === undefined) {
    throw new TypeError(`environment:  ${name} must be a count or a percentage (4, 50%), not "${value}"`)
  }
  return percent ? `${Number(count)}%` : Number(count)
}
