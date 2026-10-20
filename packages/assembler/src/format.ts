/**
 * Formatting a page's text in memory, as `vp fmt` would format its file:  no `yarn vp fmt` per write (about 0.5s
 * each), and a page written once, already tidy.
 * - Imports `vite-plus/fmt` (oxfmt) and the toolchain's format settings (`@spell-app/toolchain/lint`), nothing else
 *   of another package.
 * - From the docs tools' `plan-parts.js` (epic `epic-components`, P7;  spell-epic's `src/tools/` now).
 */
import { basename } from "node:path"

import { format } from "vite-plus/fmt"

// The format settings every package shares, by the toolchain's npm name (another repo's)
import { fmtConfig } from "@spell-app/toolchain/lint"

/** oxfmt's settings, as `vp fmt` reads them from the toolchain's (`@spell-app/toolchain/lint`), minus what only the CLI uses. */
const FORMAT = Object.fromEntries(
  Object.entries(fmtConfig).filter(([key]) => !["ignorePatterns", "sortPackageJson"].includes(key))
)

/**
 * `html` formatted as `vp fmt` would format the file at `file`, in this process.
 * - `file`'s extension picks the parser (`.html`, an epic page's `.htm` part ...);  it's never read
 * - throws on a parse error, naming the file
 */
export async function formatHTML(file: string, html: string): Promise<string> {
  const { code, errors } = await format(basename(file), html, FORMAT)
  if (errors.length) throw new Error(`${basename(file)}:  ${errors.map((error) => error.message).join(";  ")}`)
  return code
}
