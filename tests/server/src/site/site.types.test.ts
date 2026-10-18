import { describe, expect, it } from "vite-plus/test"

// the leaf, not the barrel:  `SiteHeader` extends `HTMLElement`, which node lacks
import { PROPERTIES, SCHEME_CLASSES, SITE_HOME, docsArea, forcedScheme } from "$/server/site/site.types"

/** The tab the site header lights for page path `path`:  the first property that matches (`SiteHeader.render()`). */
function litTab(path: string): string | undefined {
  return PROPERTIES.find((property) => property.match(path))?.name
}

describe("the site header's tabs", () => {
  it("are in Owen's order (epic-workflow J40), each list page its tab's home", () => {
    expect(PROPERTIES.map((property) => property.name)).toEqual([
      "Guides",
      "Sagas",
      "Epics",
      "Epic/UI",
      "Spell/UI",
      "App",
      "App/UI",
      "Brand",
      "Templates"
    ])
    expect(PROPERTIES.map((property) => property.path)).toEqual([
      "guides/index.html",
      "sagas/index.html",
      "epics/index.html",
      "/components/epics/",
      "/components/ui/",
      "/editor/",
      "/components/app/",
      "brand/index.html",
      "templates/index.html"
    ])
    expect(SITE_HOME).toBe("pages/index.html")
  })

  it.each([
    // served by the page server
    ["/epics/index.html", "Epics"],
    ["/epics/seo/seo.plan.html", "Epics"],
    ["/epics/seo/details/q1.html", "Epics"],
    ["/guides/index.html", "Guides"],
    ["/guides/solid/solid-2.html", "Guides"],
    ["/brand/index.html", "Brand"],
    ["/brand/pony.html", "Brand"],
    ["/brand/compare.html", "Brand"],
    ["/brand/spell-design-system/Logo.spell.html", "Brand"],
    // the component sets:  their address, a worktree's, and their folder's long one (a file:// page too)
    ["/components/ui/", "Spell/UI"],
    ["/components/ui/ui-card.html", "Spell/UI"],
    ["/packages/ui/site/index.html", "Spell/UI"],
    ["/packages/ui/docs/ui-card.html", "Spell/UI"],
    ["/worktrees/w/components/ui/ui-card.html", "Spell/UI"],
    ["/components/epics/", "Epic/UI"],
    ["/components/epics/epic-item.html", "Epic/UI"],
    ["/worktrees/w/components/epics/epic-item.html", "Epic/UI"],
    ["/packages/epics/docs/epic-item.html", "Epic/UI"],
    // spell-epic's, through the checkout's link (epic `epic-eject` I5)
    ["/spell-epic/src/docs/epic-item.html", "Epic/UI"],
    ["/Users/owen/www/spell-app/spell-epic/src/docs/index.html", "Epic/UI"],
    ["/Users/owen/www/spell-app/spell-app/packages/epics/docs/index.html", "Epic/UI"],
    ["/components/app/", "App/UI"],
    ["/components/app/spell-app.html", "App/UI"],
    ["/worktrees/w/components/app/", "App/UI"],
    ["/packages/app/docs/index.html", "App/UI"],
    // the brand's element set lights the Brand tab
    ["/components/brand/", "Brand"],
    ["/components/brand/brand-logo.html", "Brand"],
    ["/packages/brand/docs/brand-logo.html", "Brand"],
    // the old addresses:  no tab
    ["/ui/components/ui-card.html", undefined],
    ["/epic-ui/", undefined],
    ["/packages/app/components/spell-app/SpellApp.tsx", undefined],
    // Epic UI's old element pages, until the merge:  guides
    ["/guides/epic-components/elements/epic-item.html", "Guides"],
    ["/templates/index.html", "Templates"],
    // the plan template is a template, not an epic;  the goals templates aren't goals
    ["/templates/epics/plan.html", "Templates"],
    ["/templates/goals/set/index.html", "Templates"],
    // the saga pages, and the parked goal sets under the same tab (epic `epic-workflow` P15)
    ["/sagas/index.html", "Sagas"],
    ["/sagas/epics/epics.saga.html", "Sagas"],
    ["/goals/index.html", "Sagas"],
    ["/goals/spell/motivation/motivation.html", "Sagas"],
    ["/editor/", "App"],
    // the home and the scratch details pages:  no tab
    ["/pages/index.html", undefined],
    ["/pages/details/x.html", undefined],
    // a worktree's pages, from the main checkout's server:  inside the worktree, whatever it's called
    ["/worktrees/goals/epics/goals/goals.plan.html", "Epics"],
    ["/worktrees/seo/guides/seo/seo.html", "Guides"],
    // from disk, in a checkout and in a worktree
    ["/Users/owen/www/spell-app/spell-app/guides/cli.html", "Guides"],
    ["/Users/owen/www/spell-app/spell-app/.claude/worktrees/brand/templates/durable.html", "Templates"],
    ["/Users/owen/www/spell-app/spell-app-dev/brand/pony.html", "Brand"],
    // older checkouts' paths
    ["/packages/docs/content/epics/seo/seo.html", "Epics"],
    ["/packages/docs/content/templates/durable.html", "Templates"],
    ["/packages/docs/content/solid/solid-2.html", "Guides"],
    ["/packages/docs/content/index.html", undefined],
    ["/packages/docs/epics/seo/seo.html", "Epics"],
    ["/packages/docs/solid/solid-2.html", "Guides"],
    // other packages' files
    ["/packages/server/AGENTS.md", undefined],
    ["/packages/ui/notes/plan.md", undefined]
  ])("light %s:  %s", (path, tab) => {
    expect(litTab(path)).toBe(tab)
  })

  it("docsArea():  the first area folder in the path wins", () => {
    expect(docsArea("/templates/epics/plan.html")).toBe("templates")
    expect(docsArea("/epics/templates/x.html")).toBe("epics")
  })
})

/** A class list holding `names`, as `<html>`'s `classList` answers `contains()`. */
function classes(...names: string[]) {
  return { contains: (token: string) => names.includes(token) }
}

describe("forcedScheme()", () => {
  it("reads the scheme `<html>`'s classes force:  what the site header's icon shows", () => {
    expect(forcedScheme(classes(SCHEME_CLASSES.dark))).toBe("dark")
    expect(forcedScheme(classes("ui-typography", SCHEME_CLASSES.light))).toBe("light")
  })

  it("is `undefined` with neither class:  the page follows the OS", () => {
    expect(forcedScheme(classes())).toBeUndefined()
    expect(forcedScheme(classes("ui-typography"))).toBeUndefined()
  })

  it("keeps Spell UI's class names, which pages switch themselves", () => {
    expect(SCHEME_CLASSES).toEqual({ light: "ui-light", dark: "ui-dark" })
  })
})
