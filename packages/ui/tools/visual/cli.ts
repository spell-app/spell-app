/// <reference types="node" />

/**
 * `yarn test:visual`:  screenshot regression tests of every element example, light and dark.
 * - Usage:  `yarn test:visual [--os local|linux|both] [--browsers all|chrome|webkit|firefox] [--update]
 *   [--grep <family>[,<family>/<example>...]] [--parity] [--workers <n|n%>]`
 * - Defaults:  `--os linux --browsers all`.  `chrome` ~== chromium;  browsers may be a comma list.
 * - Validates the flags, then hands them to `VisualRunner`.  See `docs/visual-testing.md`.
 */

import { parseArgs } from "node:util"

import { VisualError, type VisualBrowser, type VisualOs } from "./visual.types.ts"
import { VisualRunner } from "./VisualRunner.ts"
import { VisualSettings } from "./VisualSettings.ts"

/** A bad flag value:  printed with the usage. */
class FlagError extends VisualError {}

/** `--os` value => OSes, in run order. */
const OSES: Record<string, readonly VisualOs[]> = { local: ["local"], linux: ["linux"], both: ["local", "linux"] }

const USAGE = `Usage:  yarn test:visual [options]

  --os local|linux|both      where the browsers run (default linux:  Playwright's Docker image)
  --browsers all|chrome|firefox|webkit
                             which browsers, or a comma list (default all)
  --update                   accept the new renders as baselines (review the HTML report first)
  --grep <targets>           only these families / examples, comma separated:  ui-button,ui-modal/types
                             (the ui- may be left out)
  --parity                   also compare class grammar vs elements;  report in tools/results/visual/parity.md
  --workers <n|n%>           Playwright workers (default 50%)
  --help                     this text

See docs/visual-testing.md.`

try {
  const { values } = parseArgs({
    options: {
      os: { type: "string", default: "linux" },
      browsers: { type: "string", default: "all" },
      update: { type: "boolean", default: false },
      grep: { type: "string", multiple: true },
      parity: { type: "boolean", default: false },
      workers: { type: "string" },
      help: { type: "boolean", default: false }
    },
    strict: true,
    allowPositionals: false
  })
  if (values.help) {
    console.log(USAGE)
    process.exit(0)
  }
  const oses = OSES[values.os]
  if (!oses) throw new FlagError(`--os must be local, linux or both, not "${values.os}"`)
  const browsers = new Set<VisualBrowser>()
  for (const word of values.browsers.split(",")) {
    const selected = VisualSettings.BROWSER_FLAGS[word.trim()]
    if (!selected) throw new FlagError(`--browsers must be all, chrome, firefox or webkit, not "${word}"`)
    for (const browser of selected) browsers.add(browser)
  }
  if (values.workers !== undefined && !/^\d+%?$/.test(values.workers)) {
    throw new FlagError(`--workers must be a count or a percentage, not "${values.workers}"`)
  }
  const grep = (values.grep ?? []).flatMap((value) => value.split(",")).map((value) => value.trim())
  const runner = new VisualRunner({
    oses,
    browsers: VisualSettings.BROWSERS.filter((browser) => browsers.has(browser)),
    update: values.update,
    grep: grep.filter(Boolean),
    parity: values.parity,
    workers: values.workers
  })
  process.exitCode = await runner.run()
} catch (error) {
  // a flag problem:  the message and the usage;  a setup problem:  the message says it all;  anything else keeps
  // its stack
  if (error instanceof FlagError || (error as { code?: string }).code?.startsWith("ERR_PARSE_ARGS")) {
    console.error(`[visual] ${(error as Error).message}\n\n${USAGE}`)
    process.exitCode = 2
  } else if (error instanceof VisualError) {
    console.error(`[visual] ${error.message}`)
    process.exitCode = 1
  } else {
    throw error
  }
}
