import { describe, expect, test } from "vite-plus/test"

import type { SiteDataFile, SiteTag } from "$/ui/docs-components"

import { NavIndex } from "./NavIndex"

/** 5 components (one a sub-tag, one in progress), a docs tag, 4 topics (one unused). */
const DATA = {
  $comment: "test",
  version: 1,
  topics: [
    { id: "buttons", title: "Buttons" },
    { id: "forms", title: "Forms" },
    { id: "date & time", title: "Date & time" },
    { id: "unused", title: "Unused" }
  ],
  components: [
    tagOf("Button", "ui-button", ["buttons"]),
    tagOf("Buttons", "ui-buttons", ["buttons"], { folder: "ui-button" }),
    tagOf("Calendar", "ui-calendar", ["forms", "date & time"], { aka: ["date picker"] }),
    tagOf("Input", "ui-input", ["forms"], { aka: ["text field"] }),
    tagOf("Checkbox", "ui-checkbox", ["forms", "buttons"])
  ],
  docs: [tagOf("Docs example", "ui-docs-example", ["documentation"])],
  families: {
    "ui-button": familyOf("ui-button"),
    "ui-calendar": familyOf("ui-calendar", "in-progress"),
    "ui-input": familyOf("ui-input"),
    "ui-checkbox": familyOf("ui-checkbox")
  },
  foundation: [],
  themes: []
} as SiteDataFile

describe("NavIndex.normalize()", () => {
  test.each([
    ["Date & Time", "datetime"],
    ["date-time", "datetime"],
    ["ui-date", "uidate"],
    ["  Ünïcode ", "unicode"]
  ])("normalizes %j", (text, normalized) => {
    expect(NavIndex.normalize(text)).toBe(normalized)
  })
})

describe("NavIndex.matches()", () => {
  test("never matches across two terms", () => {
    const key = NavIndex.key(["Button", "ui-button"])
    expect(NavIndex.matches(key, "button")).toBe(true)
    expect(NavIndex.matches(key, "buttonui")).toBe(false)
    expect(NavIndex.matches(key, "")).toBe(true)
  })
})

describe("new NavIndex()", () => {
  test("builds rows A-Z and the used topics, in the data's order", () => {
    const index = new NavIndex(DATA)
    expect(index.rows.map((row) => row.tag)).toEqual([
      "ui-button",
      "ui-buttons",
      "ui-calendar",
      "ui-checkbox",
      "ui-input"
    ])
    expect(index.topics.map((topic) => topic.id)).toEqual(["buttons", "forms", "date & time"])
    expect(index.row("ui-calendar")!.status).toBe("in-progress")
    expect(index.row("ui-docs-example")).toBeUndefined()
  })
})

describe("NavIndex.matching()", () => {
  test("finds tags by name, tag, topic and other names;  EVERY tag for an empty query", () => {
    const index = new NavIndex(DATA)
    expect([...index.matching("textfield")]).toEqual(["ui-input"])
    expect([...index.matching("datetime")]).toEqual(["ui-calendar"])
    expect([...index.matching("uibutton")]).toEqual(["ui-button", "ui-buttons"])
    expect(index.matching("").size).toBe(5)
  })
})

/** A component tag of the test data;  a sub-tag when `extra.folder` isn't its own. */
function tagOf(name: string, tag: string, topics: string[], extra: Partial<SiteTag> = {}): SiteTag {
  const folder = extra.folder ?? tag
  return {
    tag,
    name,
    folder,
    mainTag: folder,
    main: folder === tag,
    page: folder === tag,
    href: `components/${folder}.html`,
    topics,
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

/** A family of the test data. */
function familyOf(folder: string, status: "done" | "in-progress" | "planned" = "done") {
  return { folder, mainTag: folder, title: folder, summary: "", status, docs: false, tags: [folder], tokens: [] }
}
