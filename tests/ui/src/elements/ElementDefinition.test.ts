import { describe, expect, it } from "vite-plus/test"

import type { ComponentVocabulary } from "$/ui/vocabulary"
import { ElementDefinition } from "$/ui/elements"
import { es } from "$/ui/test/dictionary.es"

/** A vocabulary whose tag has another prefix than `ui`. */
const OWNER: ComponentVocabulary = {
  tag: "x-def-owner",
  noun: "owner",
  attributes: [],
  events: [],
  slots: [],
  parts: [],
  states: [],
  texts: []
}

describe("ElementDefinition.tag", () => {
  it("keeps the vocabulary's own tag, prefix included, when none is passed", () => {
    expect(new ElementDefinition(OWNER).tag).toBe("x-def-owner")
  })

  it("takes a passed tag, and a translated one from a dictionary", () => {
    expect(new ElementDefinition(OWNER, { tag: "y-def-owner" }).tag).toBe("y-def-owner")
    expect(new ElementDefinition(OWNER, { tag: "ie-def-owner", dictionary: es }).tag).toBe("ie-def-owner")
  })
})
