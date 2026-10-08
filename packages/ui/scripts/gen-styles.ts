/**
 * `yarn gen:styles`:  regenerate `src/styles/{tokens,colors,sizes}.css` from `styles.en.ts`.
 * - The generated sheets are COMMITTED, so consumers need no build step;  rerun after any vocabulary change.
 * - NOTE: imports the generator's leaf file, not the `$/ui/styles` barrel -- the barrel pulls in `?raw` / `?inline`
 *   CSS imports that only Vite understands.
 */
import { writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { StyleGenerator } from "../src/styles/StyleGenerator.ts"
import { Terminal } from "../tools/Terminal.ts"

import { formatFiles } from "./generatedFiles.ts"

/****************
 * ### `GenStylesCommand`
 * Writes the generated sheets, formats them (so `yarn format` is a no-op on them), and says so.
 ****************/
class GenStylesCommand {
  /** `src/styles/`, where the sheets live. */
  readonly directory = fileURLToPath(new URL("../src/styles/", import.meta.url))

  /**
   * Write every sheet, format them, report.
   * - SIDE EFFECT:  overwrites the generated files.
   */
  run() {
    const paths: string[] = []
    for (const [name, css] of Object.entries(new StyleGenerator().sheets())) {
      const path = `${this.directory}${name}`
      writeFileSync(path, css)
      paths.push(path)
    }
    formatFiles(paths)
    for (const path of paths) Terminal.out(`wrote ${path}`)
  }
}

new GenStylesCommand().run()
