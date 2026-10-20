import { describe, expect, it } from "vite-plus/test"

import { MemberClashes } from "@spell-app/ui/test/MemberClashes"

/** Every app web component's English vocabulary module, by path. */
const MODULES = import.meta.glob<Record<string, unknown>>("../../../packages/app/components/*/*.en.ts", {
  eager: true
})

// as Spell UI's own (`tests/ui/test/vocabularies.test.ts`):  each set checks its own vocabularies
describe("app vocabulary getters vs base members", () => {
  it("no attribute is named like a member of UIComponent or FormComponent (the base would hide its getter)", async () => {
    const { vocabularies, clashes } = await MemberClashes.find(MODULES)
    expect(vocabularies).toBeGreaterThan(1)
    expect(clashes).toEqual([])
  })
})
