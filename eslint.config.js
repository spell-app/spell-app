import js from "@eslint/js"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import tseslint from "typescript-eslint"
import eslintConfigPrettier from "eslint-config-prettier"

export default tseslint.config(
  {
    // Only lint our own source + root-level config files -- everything else (vendored/generated
    // output, scratch notes, the python venv, yarn's own vendored releases, etc) is skipped.
    ignores: [
      "build",
      "dist",
      ".cache",
      ".venv",
      ".yarn",
      "graphify-out",
      "thoughts",
      "static",
      "src/examples",
      "src/projects",
      "**/.output.js"
    ]
  },
  {
    files: ["src/**/*.{js,jsx,ts,tsx}", "*.{js,ts}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node }
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh
    },
    rules: {
      // Allow e.g. `let { a, b, ...rest} = thing`
      "prefer-const": ["error", { destructuring: "all" }],
      // `eslint-plugin-react-hooks`'s `recommended` config now bundles the full React Compiler
      // rule set (purity/immutability/globals/etc), which assumes components are pure functions
      // of props/state. This app uses `@risingstack/react-easy-state`, where components
      // deliberately read/write an external reactive `store` during render -- incompatible with
      // those rules by design. Stick to the classic hooks-correctness rules instead.
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": ["off", { allowConstantExport: true }],
      // TypeScript (via tsc) already catches unused locals/params; avoid duplicate reporting.
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      // Codebase makes heavy, deliberate use of `any` in dynamic/bridge code.
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
  eslintConfigPrettier
)
