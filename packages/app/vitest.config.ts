import { defineConfig } from "vitest/config"

import { appConfig } from "./vite.shared.ts"

/**
 * Vitest config for `@spell-app/app`:  tests run in node.
 * - `appConfig()`:  aliases (`$/util` ...) from the repo root's `tsconfig.base.json`, decorator lowering, and the
 *   React / Solid plugins side by side.  Created HERE, so the Solid plugin takes node's server posture:  a Solid
 *   component test renders with `@solidjs/web`'s `renderToString`.
 */
export default defineConfig({
  ...appConfig(),
  // SAID here, not left as vitest's default:  the Solid plugin reads it, and picks jsdom + the client build without it
  test: { environment: "node" }
})
