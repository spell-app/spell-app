import { defineConfig } from "vite-plus"

import { fmtConfig, packageLint, patternLintIn } from "spell-kit/toolchain/lint"

/**
 * Not linted or formatted by oxlint / oxfmt:
 * - the app's builds, in `app/`;  the docs' pictures and old notes (`docs/`)
 * - the `@spell` space's projects (`spaces/@spell/`):  spell source, and what compiling writes beside it
 * - Python (ruff's):  spaces' web server, its `.venv`
 * - the VS Code extension, `vscode/`:  its own yarn project, with its own tools
 */
const NOT_OURS = [
  "build",
  "app/dist",
  "app/dist-runner",
  "app/dist-element",
  "app/dist-page",
  "app/static",
  "docs",
  "spaces/@spell",
  "src/spaces/server/py",
  "vscode"
]

/**
 * spell-app's Vite+ config:  the `lint` / `fmt` blocks (what `vp lint`, `vp fmt` and the Oxc editor extension read),
 * from the toolchain's settings (`spell-kit/toolchain/lint`).
 * - One block for the whole repo, `src/`, `tests/`, `scripts/` and the app's build folder `app/`.
 * - React's rules everywhere:  the cli's terminal screens are Ink's (React for terminals).
 * - The `spell-ui/*` rules on the app's web components, `src/app/components/` (`patternLintIn()`).
 * - Tests:  `vitest.config.ts` beside this.
 */
export default defineConfig({
  fmt: { ...fmtConfig, ignorePatterns: [...fmtConfig.ignorePatterns, ...NOT_OURS.map((folder) => `${folder}/**`)] },
  lint: {
    ...packageLint({ react: true, ignorePatterns: [".cache", ...NOT_OURS] }),
    overrides: patternLintIn(["src/app/components"])
  }
})
