import { execFileSync } from "node:child_process"
import { writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { StyleGenerator } from "$/styles/StyleGenerator"

/**
 * `yarn gen:styles`:  regenerate `src/styles/{tokens,colors,sizes}.css` from `styles.vocabulary.en.ts`.
 * - The generated sheets are COMMITTED, so consumers need no build step;  rerun after any vocabulary change.
 * - NOTE: imports the generator's leaf file, not the `$/styles` barrel -- the barrel pulls in `?raw` / `?inline`
 *   CSS imports that only Vite understands.
 */
class GenStylesCommand {
  /** `src/styles/`, where the sheets live. */
  readonly directory = fileURLToPath(new URL("../src/styles/", import.meta.url))

  /** oxfmt binary, run over the output so `yarn format` is a no-op on generated files. */
  readonly formatter = fileURLToPath(new URL("../node_modules/.bin/oxfmt", import.meta.url))

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
    execFileSync(this.formatter, paths, { stdio: "ignore" })
    for (const path of paths) console.log(`wrote ${path}`)
  }
}

new GenStylesCommand().run()
