/**
 * Shared types of the doc-only elements (`src/docs-components/`):  the shape of the site's generated data file,
 * `site/_data/components.json`, which `<ui-docs-api>`, `<ui-docs-tokens>`, `<ui-docs-nav>` ... read through `SiteData`.
 * - Why a data file, not the vocabularies:  `ComponentDefinitions` imports every vocabulary (~325 KB of source);  a
 *   docs element importing it would drag all of that into the site bundle (and into docs' `spell-ui.js`, whose
 *   `<ui-root>` glob reaches these families too).  The file is written by `yarn site:data`
 *   (`scripts/gen-site-data.ts`, built by `tools/SiteDataBuilder.ts`) and committed;
 *   `tools/SiteDataBuilder.test.ts` fails while it's stale.
 * - Also the JSX types of the `<ui-*>` tags the docs elements render in their shadow roots (`DocsJSXTags`).
 * - Runtime-light:  types and constants only.
 */

import type { JSX } from "@solidjs/web"

////////////////
// ## `<ui-*>` in JSX
////////////////

/**
 * The `<ui-*>` tags a docs element may render in its JSX, each as loose attributes:  `@spell-app/ui`'s components
 * build their shadow markup from native elements, so `ui` declares no JSX types for its own tags;  the docs elements
 * are the first to COMPOSE widgets.
 * - Named tags, NOT `` [tag: `ui-${string}`] ``:  `app`'s `solid.types.ts` declares that index signature, and two
 *   identical index signatures in one program are an error (TS2374) the moment `app` compiles a file of ours.
 * - A docs element that renders another tag adds it here.  NOT `ui-dropdown`:  `tools/frameworks/solid/app.tsx`
 *   declares it, and a second declaration here would clash.  That one takes any attribute too, so docs elements
 *   (`<ui-docs-themes>`) render `<ui-dropdown>` typed by it.
 * - Loose on purpose:  any attribute as a string, `prop:` for rich data;  a misspelt attribute isn't caught.
 */
declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements extends DocsJSXTags {}
  }
}

/** Attributes of a `<ui-*>` tag in a docs element's JSX:  HTML attributes, plus any attribute or `prop:`. */
export type DocsJSXAttributes = JSX.HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }

/** Every `<ui-*>` tag the docs elements render in JSX. */
export type DocsJSXTags = {
  "ui-button": DocsJSXAttributes
  "ui-buttons": DocsJSXAttributes
  "ui-code": DocsJSXAttributes
  "ui-divider": DocsJSXAttributes
  "ui-header": DocsJSXAttributes
  "ui-icon": DocsJSXAttributes
  "ui-input": DocsJSXAttributes
  "ui-item": DocsJSXAttributes
  "ui-label": DocsJSXAttributes
  "ui-labels": DocsJSXAttributes
  "ui-markdown": DocsJSXAttributes
  "ui-menu": DocsJSXAttributes
  "ui-message": DocsJSXAttributes
  "ui-segment": DocsJSXAttributes
  "ui-table": DocsJSXAttributes
}

////////////////
// ## The data file
////////////////

/** `site/_data/components.json`:  everything the docs pages know about the tags, generated. */
export type SiteDataFile = {
  /** what wrote it, and how to regenerate it */
  readonly $comment: string
  /** format version:  bumped when a field changes meaning */
  readonly version: typeof SITE_DATA_VERSION
  /** every topic, in `ValueSets.topics` order (curated:  newcomer topics first, Fomantic's groups last) */
  readonly topics: readonly SiteTopic[]
  /** every COMPONENT tag, A-Z by name:  what the nav and the component index list */
  readonly components: readonly SiteTag[]
  /** the doc-only `<ui-docs-*>` tags, A-Z:  kept apart so the nav can leave them out */
  readonly docs: readonly SiteTag[]
  /** folder => its family (page title, summary, status, tags, CSS tokens), components and docs families both */
  readonly families: Readonly<Record<string, SiteFamily>>
  /**
   * the FOUNDATION tokens (`--ui-font-size`, palette, radii, motion ...), grouped, from the generated sheets
   * (`tools/FoundationTokens.ts`):  `<ui-docs-tokens global>`
   */
  readonly foundation: readonly SiteFoundationGroup[]
  /**
   * every theme sheet (`src/styles/themes/*.css`, `classic` and `dark` included), A-Z:  its title and the families
   * it touches (`tools/ThemeFamilies.ts`):  `<ui-docs-themes>` titles and filters by it
   */
  readonly themes: readonly SiteTheme[]
}

/** One theme sheet:  its title, and which families it restyles. */
export type SiteTheme = {
  /** sheet name, as `ThemeSheets` knows it, e.g. `github` */
  readonly name: string
  /** display title, from `pages.json` `themes`, e.g. `GitHub` */
  readonly title: string
  /**
   * folders of the families whose markup or `--ui-<tag>-*` tokens the sheet touches, A-Z, e.g. `["ui-button"]`
   * - read from the sheet's class grammar (`.ui.button`), tag selectors (`:where(ui-table)`) and declared tokens
   */
  readonly families: readonly string[]
  /** also re-declares a foundation token (`--ui-font-family`, palette ...) or styles page markup:  site-wide */
  readonly global: boolean
}

/** One topic a tag is filed under. */
export type SiteTopic = {
  /** id, as in a vocabulary's `topics`, e.g. `date & time` */
  readonly id: string
  /** display title, e.g. `Date & time` */
  readonly title: string
}

/** One tag:  its names, where it's documented, and its whole vocabulary. */
export type SiteTag = {
  /** e.g. `ui-or` */
  readonly tag: string
  /** display name from the tag, e.g. `Or`, `Breadcrumb section` */
  readonly name: string
  /** its family's folder, e.g. `ui-button` */
  readonly folder: string
  /** its family's main tag (`ui-<folder>`'s own tag), e.g. `ui-button` */
  readonly mainTag: string
  /** `true` for the family's main tag, whose page IS the family page */
  readonly main: boolean
  /**
   * docs page, relative to the site root:  `components/ui-button.html`, plus `#ui-or` for a sub-tag;  `undefined`
   * for a doc-only tag (no page of its own)
   */
  readonly href?: string
  /** topic ids */
  readonly topics: readonly string[]
  /** other names people search for */
  readonly aka: readonly string[]
  /** the vocabulary's one-line summary */
  readonly description?: string
  /** class-grammar noun, e.g. `button` */
  readonly noun: string
  readonly attributes: readonly SiteAttribute[]
  readonly slots: readonly SiteNamed[]
  readonly events: readonly SiteEvent[]
  readonly parts: readonly SiteNamed[]
  readonly states: readonly SiteNamed[]
  readonly texts: readonly SiteText[]
}

/** One attribute of a tag, as its vocabulary declares it. */
export type SiteAttribute = {
  /** canonical attribute name, e.g. `text-align` */
  readonly name: string
  /** `AttributeKind`:  how it becomes a class or a property (`keyOnly`, `size`, `string` ...) */
  readonly kind: string
  /** allowed values, resolved (a shared set's values, or the inline list);  absent:  free text / boolean */
  readonly values?: readonly string[]
  /** the shared value set they come from, e.g. `hues`;  absent for an inline list */
  readonly valueSet?: string
  /** value when absent */
  readonly default?: string | number | boolean | null
  /** other attribute names accepted for it, e.g. `checked` for `selected` */
  readonly aliases?: readonly string[]
  /** JS property name, when it isn't `camelCase(name)` */
  readonly property?: string
  /** `false`:  not reflected to the attribute (rich data) */
  readonly reflect?: boolean
  readonly description: string
}

/** A slot, part or state:  a name and what it is;  the default slot's name is `""`. */
export type SiteNamed = {
  readonly name: string
  readonly description: string
}

/** A `ui-*` event a tag dispatches. */
export type SiteEvent = {
  /** e.g. `ui-change` */
  readonly name: string
  /** `event.detail`'s shape, as text, e.g. `{ value: string }` */
  readonly detail: string
  /** `preventDefault()` vetoes it */
  readonly cancelable?: boolean
  readonly description: string
}

/** A user-visible text string, looked up through `UI.i18n`. */
export type SiteText = {
  /** lookup key, e.g. `noResults` */
  readonly key: string
  /** English text */
  readonly text: string
  readonly description?: string
}

/** One family:  a folder of tags and its docs page. */
export type SiteFamily = {
  /** e.g. `ui-button` */
  readonly folder: string
  /** its main tag, e.g. `ui-button` */
  readonly mainTag: string
  /** page title, e.g. `Button` */
  readonly title: string
  /** one-line tagline under the title, Fomantic style */
  readonly summary: string
  /** how far along the port is;  anything but `done` gets a badge */
  readonly status: SiteStatus
  /** `true` for a doc-only family (`src/docs-components/`) */
  readonly docs: boolean
  /** its tags, the main tag first, then A-Z */
  readonly tags: readonly string[]
  /** its public CSS tokens (`--ui-<tag>-*`), main sheet's first */
  readonly tokens: readonly SiteToken[]
}

/** How far along a family's port is. */
export type SiteStatus = "planned" | "in-progress" | "done"

/** One public CSS custom property of a family. */
export type SiteToken = {
  /** e.g. `--ui-button-radius` */
  readonly name: string
  /** default, with private aliases read by their public names, e.g. `var(--ui-radius)` */
  readonly default: string
  /** the sheet's comment above it */
  readonly description?: string
  /** guessed from the name and default:  `color` gets a live swatch */
  readonly type: SiteTokenType
}

/** What a token's value is, for the token table. */
export type SiteTokenType = "color" | "length" | "time" | "number" | "other"

/** One group of foundation tokens:  a table of its own on the theming page. */
export type SiteFoundationGroup = {
  /** e.g. `palette`, `typography`;  `<ui-docs-tokens global groups="...">` picks by it */
  readonly id: string
  /** display title, e.g. `Palette` */
  readonly title: string
  /** one or two sentences above its table;  `` `x` `` is code */
  readonly description: string
  /** its tokens, in sheet order */
  readonly tokens: readonly SiteToken[]
}

////////////////
// ## The pages seed
////////////////

/**
 * `site/_data/pages.json`:  the hand-kept per-family facts the vocabularies don't hold -- title, summary, status,
 * and how to read its tokens.  `yarn site:data` reads it and writes `components.json`.
 * - Seeded ONCE per new family from its vocabulary (`SiteDataBuilder`);  from then on THIS file is the source.  Edit
 *   it by hand.  (The first seeds came from the old Astro site's MDX pages, deleted in epic `spell-ui-pages` P7.)
 */
export type SitePagesFile = {
  readonly $comment: string
  readonly families: Readonly<Record<string, SitePageSeed>>
  /**
   * theme sheet name => its hand-kept facts;  a new sheet is seeded from its header comment's first words
   * (`GitHub theme:` => `GitHub`)
   */
  readonly themes?: Readonly<Record<string, SiteThemeSeed>>
}

/** One theme sheet's hand-kept facts. */
export type SiteThemeSeed = {
  /** display title in the theme picker, e.g. `Bootstrap 3` */
  readonly title: string
}

/** One family's hand-kept facts. */
export type SitePageSeed = {
  readonly title: string
  readonly summary: string
  readonly status: SiteStatus
  /** its main tag, when no tag is named like the folder (`ui-parts` => `ui-header`) */
  readonly mainTag?: string
  /** how to read its tokens;  absent:  every `--<folder>-*` token its sheets alias or read */
  readonly tokens?: SiteTokenSeed
}

/** Overrides for a family's token table. */
export type SiteTokenSeed = {
  /** name prefixes to keep, default `["--<folder>-"]`, e.g. `["--ui-card-", "--ui-cards-"]` */
  readonly prefixes?: readonly string[]
  /** readable default text by token name, in place of the sheet's plumbing */
  readonly defaults?: Readonly<Record<string, string>>
  /** a hand-written table, in place of reading the sheets (a family whose tokens are private plumbing) */
  readonly list?: readonly { name: string; default: string; description?: string }[]
}

////////////////
// ## The icons file
////////////////

/**
 * `site/_data/icons.json`:  what the icon browser (`site/icons.html`) needs beyond the packs' own indexes, which it
 * loads through `UI.icons` like any page.  GENERATED by `yarn site:data` from `src/icons/data/search.json`.
 * - Fetched only on the first search:  ~100 KB.
 */
export type SiteIconsFile = {
  readonly $comment: string
  /**
   * Font Awesome's search terms by its file name (`address-book` => `["contact", "directory" ...]`);  an outline or
   * Fomantic name matches through its solid icon's file name
   */
  readonly terms: Readonly<Record<string, readonly string[]>>
}

////////////////
// ## Constants
////////////////

/** `SiteDataFile.version`. */
export const SITE_DATA_VERSION = 1

/** Tag prefix of every doc-only element. */
export const DOCS_TAG_PREFIX = "ui-docs-"

/** Where the data file sits, relative to the site root (`packages/ui/site/`). */
export const SITE_DATA_PATH = "_data/components.json"

/** `<meta name>` a page may point at its data file with (`SiteData`). */
export const SITE_DATA_META = "ui-docs-data"

////////////////
// ## The viewer's look
////////////////

/**
 * A docs page's colour scheme (`ThemePreference`):  `light` / `dark` put `ui-light` / `ui-dark` on `<html>`;
 * `system` neither, so `color-scheme: light dark` follows the OS.
 */
export type DocsScheme = "light" | "dark" | "system"

/** The viewer's look:  theme and colour scheme (`ThemePreference.look`). */
export type DocsLook = {
  /** a `ThemeSheets` name (`spell`, `github`, `classic`);  `undefined`:  our own look, no theme */
  readonly theme: string | undefined
  readonly scheme: DocsScheme
}

/** Every `DocsScheme`, in the order the picker shows them. */
export const DOCS_SCHEMES: readonly DocsScheme[] = ["light", "dark", "system"]

/** The theme a viewer who never picked one sees:  the Spell brand (`ThemeSheets.OWN`). */
export const DOCS_DEFAULT_THEME = "spell"

/** What the `theme` key holds for our own look, no theme (the key is absent for `DOCS_DEFAULT_THEME`). */
export const DOCS_PLAIN_THEME = "default"

/**
 * `<html>` class `ThemePreference.applyScheme()` sets for one frame:  a theme turns transitions off under it
 * (`spell.css`), so a scheme switch doesn't animate every colour.
 */
export const DOCS_SCHEME_SWITCHING = "ui-scheme-switching"

/**
 * `localStorage` keys of the viewer's look (`ThemePreference`).
 * - `scheme`:  the Astro site's key, kept:  `light` / `dark`, absent for `system`.
 * - `theme`:  a `ThemeSheets` name (`github`, `classic`), `DOCS_PLAIN_THEME` for our own look, absent for
 *   `DOCS_DEFAULT_THEME`.
 */
export const DOCS_LOOK_KEYS = { scheme: "spell-ui-site:scheme", theme: "spell-ui-site:theme" } as const
