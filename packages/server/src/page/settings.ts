import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

import type { PageServerSettings } from "$/server/page"

/**
 * The `"pageServer"` field of the `package.json` at `root`:  route modules, watched folders, the writable folders and
 * the bundles it builds;  `{}` without one.
 * - read fresh on each call:  a server reads it once as it starts, `BundleBuild` and the tools as they need it
 */
export function pageServerSettings(root: string): PageServerSettings {
  const file = join(root, "package.json")
  if (!existsSync(file)) return {}
  return (JSON.parse(readFileSync(file, "utf8")) as { pageServer?: PageServerSettings }).pageServer ?? {}
}
