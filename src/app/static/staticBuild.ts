/**
 * Is this the editor's STATIC build, the public preview (epic `debut` P9)?
 * - Plain files on any web host, no server:  `spell app preview build` writes it, `spell app preview serve` shows it.
 *   - The examples and guides it holds are listed, indexed and compiled at build time.
 *   - What a visitor edits is kept in their browser (`StaticFiles`), with a "Reset Example" to forget it.
 * - ONE flag every part of the app reads to hide what needs a server, or isn't ready to show:
 *   - in code:  `isStaticBuild`
 *   - in CSS:  `:root.spell-static` (`STATIC_BUILD_CLASS`, set by `StaticFiles.install()`)
 * - Vite's MODE says so:  the build runs `vp build --mode static`, so a dev server or a normal build is never static.
 * - NOTE: no imports:  anything may read it, `editor.ts` and the Solid components alike.
 */

/** Vite's mode for the static build:  `vp build --mode static` (`STATIC_MODE` in the preview command, the CLI's). */
export const STATIC_MODE = "static"

/** Is this the static build?  Fixed at build time, so the code it guards drops out of every other build. */
export const isStaticBuild: boolean = import.meta.env?.MODE === STATIC_MODE

/** Class on `<html>` in the static build:  for CSS that hides what it can't show. */
export const STATIC_BUILD_CLASS = "spell-static"
