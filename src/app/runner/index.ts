/**
 * Barrel for the runners:  run a compiled spell project with no editor -- in the VS Code extension's
 * "Run Project" webview, and (soon) the `<spell-app>` web component.
 * - The shared pieces first:  `runCompiled()`, and the split, pane and console runners lay out.
 * - NOTE: `main.tsx` is left out:  it's the bundle's entry, and mounts the moment it's imported.
 */
export * from "./runner.types"

export * from "./runCompiled"
export * from "./RunnerSplit"
export * from "./RunnerPane"
export * from "./RunnerConsole"
export * from "./VSCodeRunner"
