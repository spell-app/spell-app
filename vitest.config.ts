import { defineConfig } from "vitest/config"
import { resolve } from "path"

import environment from "./src/environment.ts"
import { standardDecorators } from "./vite.decorators.ts"

export default defineConfig({
  plugins: [standardDecorators()],
  test: {
    // ... other test options
  },
  resolve: {
    alias: {
      "~": environment.srcDir
    }
  }
})
