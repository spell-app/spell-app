/**
 * Barrel for the runners:  run a compiled spell project with no editor -- in the VS Code extension's
 * "Run Project" webview, and the `<spell-app>` web component.
 * - The shared pieces first:  `runCompiled()`, and the split, pane and console runners lay out.
 * - NOTE: left out:  bundle entries, which act the moment they're imported (`main.tsx`, `spellRuntime.ts`).
 *   The element itself, `<spell-app>`, is a family of its own:  `$/app/components/spell-app`.
 */
export * from "./runner.types"

export * from "./runCompiled"
export * from "./RunnerSplit"
export * from "./RunnerPane"
export * from "./RunnerConsole"
export * from "./loadRuntime"
export * from "./fetchFresh"
export * from "./words"
export * from "$/lsp/ScopesSource"
export * from "./shadowStyles"
export * from "./SpellAppRunner"
export * from "./VSCodeRunner"
