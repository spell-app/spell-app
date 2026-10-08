import { describe, expect, test } from "vite-plus/test"

import { FoundationTokens } from "./FoundationTokens.ts"

describe("FoundationTokens.groups()", () => {
  test("groups every :root token of the generated sheets, none left over, colours typed", () => {
    const groups = new FoundationTokens(new URL("../src/styles/", import.meta.url).pathname).groups()
    const ids = groups.map((group) => group.id)
    expect(ids).toEqual(expect.arrayContaining(["typography", "spacing", "radii", "palette", "brand", "semantic"]))
    expect(ids).not.toContain("other")
    const all = groups.flatMap((group) => group.tokens)
    expect(all.find((token) => token.name === "--ui-font-size")).toMatchObject({ default: "16px", type: "length" })
    expect(all.find((token) => token.name === "--ui-red-hover")).toMatchObject({ type: "color" })
    expect(all.some((token) => token.name.startsWith("--ui-sheet-"))).toBe(false)
    expect(all.every((token) => token.description)).toBe(true)
  })
})
