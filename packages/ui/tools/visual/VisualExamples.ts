/// <reference types="node" />

import { existsSync, readdirSync } from "node:fs"
import { pathToFileURL } from "node:url"

import type { VisualHooks } from "../../test/test.types.ts"
import type { VisualBrowser, VisualExample, VisualScheme } from "./visual.types.ts"
import { VisualSettings } from "./VisualSettings.ts"

/****************
 * ### `VisualExamples`
 * Finds what `yarn test:visual` captures:  every `src/components/ui-<family>/examples/elements/<name>.html`, with its
 * optional `<name>.visual.ts` hooks, and names the baseline files they make.
 * - Discovery, not a list:  a new example (or hook file) is a new test with no edit anywhere.
 * - Hooks are IMPORTED here for their state names, `capture` and `mask`;  their `open()` runs in the page.
 * - STATIC:  discovery and naming, no state.
 ****************/
export class VisualExamples {
  /** Every element example, by family then name. */
  static async load(): Promise<VisualExample[]> {
    const components = `${VisualSettings.ROOT}src/components`
    const examples: VisualExample[] = []
    for (const family of readdirSync(components).sort()) {
      const folder = `${components}/${family}/examples/elements`
      if (!existsSync(folder)) continue
      for (const file of readdirSync(folder).sort()) {
        if (!file.endsWith(".html")) continue
        const name = file.slice(0, -".html".length)
        const hookFile = `${folder}/${name}.visual.ts`
        const hooks = existsSync(hookFile)
          ? ((await import(pathToFileURL(hookFile).href)) as { default: VisualHooks }).default
          : {}
        examples.push({
          id: `${family}/${name}`,
          family,
          name,
          hasClasses: existsSync(`${components}/${family}/examples/${file}`),
          hooks
        })
      }
    }
    return examples
  }

  /**
   * Baseline name of one capture, as the spec passes it to `toHaveScreenshot()`:  `[family, file]`.
   * - closed:  `ui-button/types-light.png`
   * - a state:  `ui-modal/types.open-standard-dark.png`
   */
  static baselineName(example: VisualExample, scheme: VisualScheme, state?: string): [string, string] {
    return [example.family, `${example.name}${state ? `.${state}` : ""}-${scheme}.png`]
  }

  /** Every baseline path `examples` make for one browser, relative to `<os>/<browser>/`. */
  static baselines(examples: readonly VisualExample[]): Set<string> {
    const paths = new Set<string>()
    for (const example of examples) {
      for (const state of [undefined, ...Object.keys(example.hooks.states ?? {})]) {
        for (const scheme of VisualSettings.SCHEMES) {
          paths.add(VisualExamples.baselineName(example, scheme, state).join("/"))
        }
      }
    }
    return paths
  }

  /** Folder of one OS folder's (`linux`, `local-darwin`) baselines for `browser`. */
  static folder(osFolder: string, browser: VisualBrowser): string {
    return `${VisualSettings.BASELINES}/${osFolder}/${browser}`
  }
}
