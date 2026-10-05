import { describe, expect, it } from "vite-plus/test"

import { forcedScheme, SCHEME_CLASSES } from "$/server/site/site.types"

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
