/**
 * Shiki themes for fenced code (`astro.config.mjs`) AND `<Code>` in `Example.astro`, so both look alike.
 * - Used with `defaultColor: false`:  Shiki then emits only `--shiki-light` / `--shiki-dark` variables, no
 *   inline `color`, and `site.css` picks one with `light-dark()` -- code follows `ui-light` / `ui-dark` /
 *   the OS with no `!important`.
 */
export const SHIKI_THEMES = { light: "github-light", dark: "github-dark" } as const
