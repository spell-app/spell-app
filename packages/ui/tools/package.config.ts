/// <reference types="node" />

import { fileURLToPath } from "node:url"

import type { Bucket, ImportMap, PackageConfig } from "./tools.types.ts"
import { COMPONENTS, ENTRIES, SHARED_ENTRIES, SOLID_EXTERNAL } from "../vite.config.ts"

/** Repo root, absolute, with a trailing slash. */
const ROOT = fileURLToPath(new URL("../", import.meta.url))

/** Lib entries measured for their effect on the others' chunks, not as tiers (`PackageConfig.extra`). */
const EXTRA_ENTRIES = { api: ENTRIES.api! }

/**
 * How the tooling reads `@spell-app/ui`:  entries, externals, peer set, buckets.
 * - Two shared entries:  `core` (every family) and `forms` (families with a form VALUE:  dropdown, input, checkbox, form).
 * - `groups` (`bucket()`):
 *   - `solid-js`, `@solidjs/*`, the fork => `library`
 *   - `forms.ts`, `FormElement`, `FormHost`, `Validator`, `MenuOptions`, `ControlLabels` => `shared:forms`
 *   - a family folder => its own classes / sheet / vocabulary / fallback
 *   - `api.ts` and the two barrels it namespaces (`E`, `V`) => `extra:api`:  only `api.js` holds them
 *   - lazy tiers:  runtime services + foundation sheets => `runtime`;  icon name / alias maps => `icons`;  a
 *     family's lazily imported data (`components/ui-<family>/data/`, the emoji chunks) and the Temporal polyfill
 *     (`temporal-polyfill`, loaded only where the browser lacks `Temporal`) => `data`;  so are the source
 *     elements' engines' libraries (highlight.js, marked, DOMPurify) and spell's pre-compiled highlighter
 *     (`src/languages/`), loaded on first use
 *   - `src/docs-components/` (the doc-only `<ui-docs-*>` families) => `docs`:  never in the lib build, which a check
 *     flags (`docsBundled`);  only the docs site's bundle adds them (`DocsFamilies`)
 *   - any other `src/` module (incl. `\0` virtual helpers) => `core`
 */
export const PACKAGE: PackageConfig = {
  name: "@spell-app/ui",
  root: ROOT,
  entries: Object.fromEntries(COMPONENTS.map((name) => [name, `src/components/${name}/index.ts`])),
  shared: [
    { name: "core", entry: SHARED_ENTRIES.core },
    { name: "forms", entry: SHARED_ENTRIES.forms, description: "form base, validation, menu options" }
  ],
  extra: { api: EXTRA_ENTRIES.api },
  external: (id) => SOLID_EXTERNAL.test(id),
  peerEntry: "tools/peers.ts",
  groups: bucket,
  results: "tools/results"
}

/**
 * Import map entries for `dist/` (the vendored Solid ones come from `vendor/importmap.json`).
 * - `@spell-app/ui` ~== every family (`dist/index.js`);  `@spell-app/ui/ui-<family>` one family;  `@spell-app/ui/core`,
 *   `@spell-app/ui/forms`;  `@spell-app/ui/api` the `E` / `V` namespaces.
 */
export const DIST_IMPORTS: ImportMap["imports"] = {
  "@spell-app/ui": "/dist/index.js",
  "@spell-app/ui/core": "/dist/core.js",
  "@spell-app/ui/forms": "/dist/forms.js",
  "@spell-app/ui/api": "/dist/api.js",
  ...Object.fromEntries(COMPONENTS.map((name) => [`@spell-app/ui/${name}`, `/dist/${name}.js`]))
}

/** Bucket of one module id (`PACKAGE.groups`). */
function bucket(id: string): Bucket {
  if (id.startsWith("\0")) return "core"
  if (/\/node_modules\/(solid-js|@solidjs|@spell-app\/solid-element)\/|\/packages\/solid-element\//.test(id)) {
    return "library"
  }
  if (/\/node_modules\/(temporal-(polyfill|utils)|highlight\.js|marked|dompurify)\//.test(id)) return "data"
  const src = /\/src\/(.+)$/.exec(id.split("?")[0]!)?.[1]
  if (!src) return "other"
  if (/^(forms\.ts|elements\/(FormElement|FormHost|Validator|MenuOptions|ControlLabels)\.ts)$/.test(src))
    return "shared:forms"
  if (/^(api\.ts|elements\/index\.ts|vocabulary\/vocabulary\.api\.ts)$/.test(src)) return "extra:api"
  if (/^components\/[\w-]+\/data\/|^languages\//.test(src)) return "data"
  if (src.startsWith("docs-components/")) return "docs"
  const component = /^components\/([\w-]+)\/([\w.-]+)$/.exec(src)
  if (component) {
    const [, family, file] = component as unknown as [string, string, string]
    if (file.endsWith(".css")) return `own:${family}:css`
    if (/\.vocabulary\.\w+\.ts$/.test(file)) return `own:${family}:vocabulary`
    if (file.endsWith(".fallback.ts")) return `own:${family}:fallback`
    return `own:${family}:classes`
  }
  if (src.startsWith("icons/data/") || src.startsWith("icons/icon-packs/")) return "icons"
  if (src.startsWith("runtime/") && !/^runtime\/(load|runtime\.types)\.ts$/.test(src)) return "runtime"
  if (src.startsWith("styles/")) return "runtime"
  return "core"
}
