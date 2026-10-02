/**
 * Families `yarn test:visual --static` compares, and the controller classes `StaticRender.define()`s for them.
 * - Grows as families become server-ready (plan P3, `packages/docs/plans/seo/seo.html`):  add the family folder and
 *   the classes that render cleanly in node;  nothing else changes.
 * - PURE DATA, no imports:  the CLI and the Playwright spec (no Vite) read it for WHICH examples to compare,
 *   `StaticFixture` (loaded through Vite's SSR) for WHAT to define.
 * - Classes by NAME:  one class per file, so `UIButton` lives in `src/components/ui-button/UIButton.ts(x)`.
 *   Imported from their files, never the family's `index.ts`, which calls `customElements.define()`.
 */
export class StaticFamilies {
  /**
   * Family folder => controller classes, defined together for every page (a card example needs the parts).
   * - A family without `examples/elements/` (`ui-item`) only lends its classes.
   */
  static readonly CLASSES: Readonly<Record<string, readonly string[]>> = {
    "ui-button": ["UIButton", "UIButtons", "UIOr"],
    "ui-segment": ["UISegment", "UISegments"],
    "ui-card": ["UICard", "UICards"],
    "ui-parts": [
      "UIContent",
      "UIHeader",
      "UIMeta",
      "UIDescription",
      "UIExtra",
      "UITitle",
      "UIActions",
      "UIAuthor",
      "UIAvatar",
      "UIDate",
      "UIDetail",
      "UISummary",
      "UIValue"
    ],
    "ui-list": ["UIList"],
    "ui-item": ["UIItem"],
    "ui-section": ["UISection"]
  }

  /** `family` (`ui-button`) is compared statically. */
  static covers(family: string): boolean {
    return Object.hasOwn(StaticFamilies.CLASSES, family)
  }

  /** Source path of `name` in `family`, as Vite globs it, without the extension:  `/src/components/ui-button/UIButton`. */
  static classPath(family: string, name: string): string {
    return `/src/components/${family}/${name}`
  }
}
