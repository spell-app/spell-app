import { describe, expect, it } from "vite-plus/test"

import { MemberClashes } from "spell-ui/test-helpers/MemberClashes"

/** Every app web component's English vocabulary module, by path (`/`:  the repo's root, Vitest's). */
const MODULES = import.meta.glob<Record<string, unknown>>("/src/app/components/*/*.en.ts", {
  eager: true
})

// as Spell UI's own (`spell-ui/tests/test-helpers/vocabularies.test.ts`):  each set checks its own vocabularies
describe("app vocabulary getters vs base members", () => {
  it("no attribute is named like a member of UIComponent or FormComponent (the base would hide its getter)", async () => {
    const { vocabularies, clashes } = await MemberClashes.find(MODULES)
    expect(vocabularies).toBeGreaterThan(1)
    expect(clashes).toEqual([])
  })
})
