import { defineConfig } from "vitest/config"
import { resolve } from "path"

import environment from "./src/environment.ts"

export default defineConfig({
  test: {
    // ... other test options
  },
  resolve: {
    alias: {
      "~": environment.srcDir
    }
  }
})
