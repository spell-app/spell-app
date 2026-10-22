import { describe, expect, test } from "vite-plus/test"

import { APP_TEXTS } from "spell-app/app/ui/AppTexts.en"
import { appTexts } from "spell-app/app/ui/AppTexts"

/**
 * The editor's texts in English, under node:  no Spell UI runtime, so `appTexts` reads `APP_TEXTS` itself.
 * - Spanish, through `UI.i18n`:  `AppTexts.browser.test.ts`.
 */
describe("appTexts.text()", () => {
  test("reads the English text for a key, and fills its placeholders", () => {
    expect(appTexts.text("save")).toBe("Save")
    expect(appTexts.text("doIt", { action: "flip" })).toBe("Do it:  flip()")
    expect(appTexts.text("listOf", { type: "deck", count: 52 })).toBe("deck of 52")
  })

  test("a placeholder with no param stays as written, so the gap SHOWS", () => {
    expect(appTexts.text("pathInvalid")).toBe("Path '{path}' is invalid!")
  })

  test("stays English under node:  nothing to load", async () => {
    await appTexts.load()
    expect(appTexts.lang).toBe("en")
    expect(appTexts.text("restart")).toBe(APP_TEXTS.restart)
  })
})

describe("appTexts.groupWords()", () => {
  test("a project group's words, by its `type`, for the texts that name it", () => {
    const examples = { type: "example", Type: "Example", title: "Examples", description: "Example projects" }
    const words = appTexts.groupWords(examples)
    expect(words).toEqual({
      type: "example",
      Type: "Example",
      theType: "the example",
      title: "Examples",
      titleLower: "examples",
      description: "Example projects"
    })
    expect(appTexts.text("createdApp", { ...words, name: "Solitaire" })).toBe("Created example Solitaire.")
    expect(appTexts.text("nothingInGroup", words)).toBe("No Examples yet!")
  })

  test("a group the texts don't know keeps its own words;  none at all is a `Project`", () => {
    const words = appTexts.groupWords({ type: "recipe", Type: "Recipe", title: "Recipes", description: "Food" })
    expect(words).toMatchObject({ type: "recipe", Type: "Recipe", theType: "the recipe", title: "Recipes" })
    expect(appTexts.text("editApp", appTexts.groupWords(undefined))).toBe("Edit Project")
  })
})
