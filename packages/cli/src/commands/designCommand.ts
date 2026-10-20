import { existsSync } from "fs"
import { join } from "path"

// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { contentFolderOf } from "@spell-app/assembler/contentFolder"
import { CliError } from "$/cli/cli.types"
import { DESIGN_VERBS, TOOLS, runTool } from "$/cli/dev/passThrough"
import { findCheckout } from "$/cli/findCheckout"

/**
 * `spell dev design <verb> ...`:  Spell's claude.ai design system (epic `claude-design`), the nearest checkout's
 * tools, `args` verbatim.  Claude's `/design` skill does the claude.ai half (publish, read) with its Artifact tool.
 * - `build [--out <dir>]`:  `packages/ui`'s `yarn design:build` (`scripts/design-build.ts`), which writes the system's
 *   files to `<dir>/project/` (default `packages/ui/build/design-system/`);  with the checkout's brand
 *   (`designBuildArgs()`), which Spell UI never finds by itself
 * - `bundle [--out <dir>] [--skip-ui-build]`:  the epic engine's `yarn design:bundle`, the system's `bundle.js`
 * - `check [bundle] [outDir]`:  the engine's `yarn design:check`, the bundle proved inlined and on a Design board
 * - `pull <board.dc.html> <page.html>`, `changed`, `pushed`, `state`:  the engine's `src/tools/design.js`
 * - The engine's tools are spell-epic's, through the checkout's `spell-epic` link (epic `epic-eject` I5).
 * - Runs in the current folder (`bundle` / `check` in spell-epic's):  a relative path is relative to it.
 * - Throws `CliError` for no verb, or another one.
 * - Returns the tool's exit code.
 */
export function designCommand(args: string[]): Promise<number> {
  const [verb, ...rest] = args
  if (!DESIGN_VERBS.includes(verb as (typeof DESIGN_VERBS)[number])) {
    const what = verb === undefined ? "which design tool?" : `unknown verb '${verb}':`
    throw new CliError(`${what}  ${DESIGN_VERBS.join(", ")}`)
  }
  if (verb === "build")
    return runTool("design build", [...designBuildArgs(findCheckout(TOOLS["design build"].tool)), ...rest])
  if (verb === "bundle") return runTool("design bundle", ["--design", ...rest])
  if (verb === "check") return runTool("design check", rest)
  return runTool("design sync", [verb!, ...rest])
}

/**
 * What `design build` tells Spell UI's design export about spell-app's brand (epic `repo-split` P5):
 * - `--brand`:  `packages/brand`, its `<brand-*>` cards
 * - `--brand-book`:  Claude Design's brand book, `brand/spell-design-system/readme.md` in the shared content
 *   (`contentFolderOf()`), when it's there
 * - Before the caller's own arguments, so an explicit `--brand` wins (the last one does).
 */
export function designBuildArgs(root: string): string[] {
  const book = join(contentFolderOf(root) ?? root, BRAND_BOOK)
  return ["--brand", join(root, "packages", "brand"), ...(existsSync(book) ? ["--brand-book", book] : [])]
}

/** The brand book (Claude Design's export), in the shared content folder (epic `claude-design`, P11). */
const BRAND_BOOK = "brand/spell-design-system/readme.md"
