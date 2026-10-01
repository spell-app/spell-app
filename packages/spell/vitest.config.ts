import { defineConfig } from "vitest/config"
import { resolve } from "path"

import environment from "./src/environment.ts"
import { standardDecorators } from "../../vite.decorators.ts"
import { packageVersion } from "./vite.packageVersion.ts"

export default defineConfig({
  plugins: [standardDecorators(), packageVersion()],
  test: {
    // ... other test options
  },
  resolve: {
    alias: {
      "~": environment.srcDir
    }
  }
})
