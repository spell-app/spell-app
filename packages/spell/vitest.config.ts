import { defineConfig } from "vite-plus"

import { standardDecorators } from "../../vite.decorators.ts"
import { packageVersion } from "../../vite.packageVersion.ts"

export default defineConfig({
  plugins: [standardDecorators(), packageVersion()],
  test: {
    // ... other test options
  },
  resolve: {
    tsconfigPaths: true
  }
})
