import type { SiteDataFile, SiteSearchFile, SiteTag } from "$/ui/docs-components"

/**
 * `<ui-docs-search>`'s test data, shared by its element test and `SearchIndex.test.ts` / `PageOutline.test.ts`:  the
 * site's data file, its search file, and the page shown.
 * - Test-only:  in `test/`, so the library's build (`src/`) never ships it.
 */

/** The test data:  Button (+ Or), Divider, Modal, Label;  each with a few attributes. */
export const DATA: SiteDataFile = {
  $comment: "test",
  version: 1,
  topics: [
    { id: "buttons", title: "Buttons" },
    { id: "dialogs", title: "Dialogs" }
  ],
  components: [
    siteTag("Button", "ui-button", { topics: ["buttons"], attributes: [attribute("circular"), attribute("color")] }),
    siteTag("Divider", "ui-divider", { attributes: [attribute("vertical"), attribute("horizontal")] }),
    siteTag("Label", "ui-label", { attributes: [attribute("circular"), attribute("color")] }),
    siteTag("Modal", "ui-modal", { topics: ["dialogs"], aka: ["dialog", "lightbox"] }),
    siteTag("Or", "ui-or", { folder: "ui-button" })
  ],
  docs: [],
  families: {
    "ui-button": family("ui-button", "Button"),
    "ui-divider": family("ui-divider", "Divider"),
    "ui-label": family("ui-label", "Label"),
    "ui-modal": family("ui-modal", "Modal")
  },
  foundation: [],
  themes: []
}

/** The test search file:  the overview, Theming, Button's page and Divider's. */
export const SEARCH: SiteSearchFile = {
  $comment: "test",
  pages: [
    { path: "index.html", title: "Overview", summary: "What it is.", sections: [{ id: "design", title: "Design" }] },
    {
      path: "theming.html",
      title: "Theming",
      summary: "Tokens and themes.",
      sections: [
        { id: "tokens", title: "Tokens" },
        { id: "tokens-vertical-rhythm", title: "Vertical rhythm", parent: 0 }
      ]
    },
    {
      path: "components/ui-button.html",
      title: "Button",
      tag: "ui-button",
      tabs: { examples: "Examples", usage: "Usage" },
      sections: [
        { id: "examples-variations", title: "Variations", tab: "examples" },
        { id: "examples-variations-circular", title: "Circular", parent: 0 },
        { id: "usage-keyboard", title: "Keyboard", tab: "usage" }
      ]
    },
    {
      path: "components/ui-divider.html",
      title: "Divider",
      tag: "ui-divider",
      tabs: { examples: "Examples" },
      sections: [
        { id: "examples-types", title: "Types", tab: "examples" },
        { id: "examples-types-vertical-divider", title: "Vertical Divider", parent: 0 }
      ]
    }
  ]
}

/** The page shown in the element's tests:  Divider's, as tabs of sections (an example's demo section ignored). */
export const PAGE = `
  <main id="test-page">
    <ui-tabs id="site-tabs">
      <ui-tab value="examples" label="Examples">
        <ui-section id="examples-types" header="Types">
          <ui-section id="examples-types-divider" header="Divider"></ui-section>
          <ui-section id="examples-types-vertical-divider" header="Vertical Divider">
            <ui-docs-example><ui-section id="demo" header="Vertical demo"></ui-section></ui-docs-example>
          </ui-section>
        </ui-section>
      </ui-tab>
      <ui-tab value="usage" label="Usage">
        <ui-section id="usage-keyboard" header="Keyboard"></ui-section>
      </ui-tab>
    </ui-tabs>
  </main>`

/** A tag of the test data;  a sub-tag when `extra.folder` isn't its own. */
export function siteTag(name: string, tagName: string, extra: Partial<SiteTag> = {}): SiteTag {
  const folder = extra.folder ?? tagName
  return {
    tag: tagName,
    name,
    folder,
    mainTag: folder,
    main: folder === tagName,
    page: folder === tagName,
    href: folder === tagName ? `components/${folder}.html` : `components/${folder}.html#${tagName}`,
    topics: [],
    aka: [],
    noun: name.toLowerCase(),
    attributes: [],
    slots: [],
    events: [],
    parts: [],
    states: [],
    texts: [],
    ...extra
  }
}

/** An attribute of the test data. */
function attribute(name: string, aliases?: string[]) {
  return { name, kind: "keyOnly", description: "", ...(aliases && { aliases }) }
}

/** A family of the test data. */
function family(folder: string, title: string) {
  return {
    folder,
    mainTag: folder,
    title,
    summary: "",
    status: "done" as const,
    docs: false,
    tags: [folder],
    tokens: []
  }
}
