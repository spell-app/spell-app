/****************
 * ### `StaticFamilies`
 * Families `yarn test:visual --static` compares, and the controller classes `StaticRender.define()`s for them.
 * - Grows as families become server-ready (epic `seo`, P3:  `epics/seo/seo.plan.html`):  add the family folder and
 *   the classes that render cleanly in node;  nothing else changes.
 * - PURE DATA, no imports:  the CLI and the Playwright spec (no Vite) read it for WHICH examples to compare,
 *   `StaticFixture` (loaded through Vite's SSR) for WHAT to define.
 * - Classes by NAME:  one class per file, so `UIButton` lives in `src/components/ui-button/UIButton.ts(x)`.
 *   Imported from their files, never the family's `index.ts`, which calls `customElements.define()`.
 * - STATIC:  a table and two lookups.
 ****************/
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
    "ui-section": ["UISection"],
    "ui-icon": ["UIIcon", "UIIcons"],
    // agent A (P3)
    "ui-label": ["UILabel", "UILabels"],
    "ui-divider": ["UIDivider"],
    "ui-image": ["UIImage", "UIImages"],
    "ui-text": ["UIText"],
    "ui-flag": ["UIFlag"],
    "ui-emoji": ["UIEmoji"],
    "ui-loader": ["UILoader"],
    "ui-placeholder": [
      "UIPlaceholder",
      "UIPlaceholderHeader",
      "UIPlaceholderImage",
      "UIPlaceholderLine",
      "UIPlaceholderParagraph"
    ],
    "ui-rail": ["UIRail"],
    "ui-ad": ["UIAd"],
    "ui-container": ["UIContainer"],
    "ui-grid": ["UIGrid", "UIRow", "UIColumn"],
    "ui-statistic": ["UIStatistic", "UIStatistics"],
    "ui-step": ["UIStep", "UISteps"],
    "ui-breadcrumb": ["UIBreadcrumb", "UIBreadcrumbSection"],
    "ui-message": ["UIMessage"],
    "ui-progress": ["UIProgress"],
    "ui-nag": ["UINag"],
    "ui-embed": ["UIEmbed"],
    "ui-reveal": ["UIReveal"],
    "ui-sticky": ["UISticky"],
    "ui-transition": ["UITransition"],
    "ui-visibility": ["UIVisibility"],
    // agent C (P3)
    "ui-form": ["UIForm", "UIField", "UIFields"],
    "ui-input": ["UIInput", "UITextarea"],
    "ui-checkbox": ["UICheckbox", "UIRadio"],
    "ui-select": ["UISelect"],
    "ui-dropdown": ["UIDropdown"],
    "ui-search": ["UISearch"],
    "ui-slider": ["UISlider"],
    "ui-rating": ["UIRating"],
    "ui-calendar": ["UICalendar"],
    // agent B (P3)
    "ui-items": ["UIItems"],
    "ui-feed": ["UIFeed", "UIFeedEvent"],
    "ui-comment": ["UIComment", "UIComments"],
    "ui-menu": ["UIMenu"],
    "ui-table": ["UITable"],
    "ui-root": ["UIRoot"],
    // agent D (P3)
    "ui-accordion": ["UIAccordion"],
    "ui-tab": ["UITab", "UITabs"],
    "ui-modal": ["UIModal"],
    "ui-flyout": ["UIFlyout"],
    "ui-dimmer": ["UIDimmer"],
    "ui-popup": ["UIPopup"],
    "ui-sidebar": ["UISidebar", "UIPushable", "UIPusher"],
    "ui-toast": ["UIToast"],
    "ui-shape": ["UIShape", "UISide"]
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
