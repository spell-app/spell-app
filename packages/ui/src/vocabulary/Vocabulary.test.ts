import { describe, expect, it } from "vite-plus/test"

import { type ComponentVocabulary, type Dictionary, Vocabulary } from "$/ui/vocabulary"

/** Cut-down card vocabulary, shaped like a real `ui-card.vocabulary.en.ts`. */
const card = {
  tag: "ui-card",
  noun: "card",
  plural: "cards",
  attributes: [
    { name: "color", kind: "color", description: "Hue." },
    { name: "size", kind: "size", description: "Size." },
    { name: "fluid", kind: "keyOnly", description: "Fill the container." },
    { name: "only", kind: "multiple", key: "only", description: "Show on devices." },
    { name: "pointing", kind: "keyOrValueAndKey", values: "floats", description: "Arrow." },
    { name: "selected", kind: "boolean", aliases: ["checked"], description: "Chosen." }
  ],
  events: [{ name: "ui-change", detail: "{ value: string }", description: "Value changed." }],
  slots: [
    { name: "", description: "Content." },
    { name: "header", description: "Header." }
  ],
  parts: [{ name: "header", description: "Header part." }],
  states: [{ name: "open", description: "Open." }],
  texts: [],
  ownsParts: ["header", "content", "meta", "description", "extra"]
} as const satisfies ComponentVocabulary

/** Second component, to prove `define()` covers everything registered. */
const button = {
  tag: "ui-button",
  noun: "button",
  attributes: [
    { name: "color", kind: "color", description: "Hue." },
    { name: "animated", kind: "keyOrValueAndKey", values: ["fade", "vertical"], description: "Animation." }
  ],
  events: [],
  slots: [],
  parts: [],
  states: [],
  texts: []
} as const satisfies ComponentVocabulary

/** Fake Spanish dictionary. */
const spanish: Dictionary = {
  lang: "es",
  tags: { "ui-card": "tarjeta", "ui-button": "boton" },
  attributes: { size: "tamano", only: "solo" },
  values: {
    hues: { red: "rojo", blue: "azul" },
    sizes: { small: "pequeno", big: "grande" },
    devices: { mobile: "movil", tablet: "tableta", "large screen": "pantalla grande" },
    floats: { left: "izquierda" },
    booleans: { yes: "si" }
  },
  events: { "ui-change": "cambio" },
  slots: { header: "encabezado" },
  parts: { header: "encabezado" },
  components: {
    "ui-button": { values: { animated: { fade: "desvanecer" } } }
  }
}

/** Fresh registry with both components. */
function registry() {
  const vocabulary = new Vocabulary()
  vocabulary.register(card)
  vocabulary.register(button)
  return vocabulary
}

describe("Vocabulary registry", () => {
  it("registers and gets by canonical tag", () => {
    const vocabulary = registry()
    expect(vocabulary.get("ui-card")).toBe(card)
    expect(vocabulary.get("ui-nope")).toBeUndefined()
  })

  it("ignores registering the same vocabulary twice", () => {
    const vocabulary = registry()
    expect(vocabulary.register(card)).toBe(card)
  })

  it("refuses a second vocabulary for the same tag", () => {
    const vocabulary = registry()
    expect(() => vocabulary.register({ ...card })).toThrow(/already registered/)
  })

  it("replaces a registered vocabulary with a new version of it", () => {
    const vocabulary = registry()
    const next = { ...card }
    expect(vocabulary.replace(next)).toBe(next)
    expect(vocabulary.get("ui-card")).toBe(next)
    // afterwards, the new version is the registered one:  registering it again is a no-op
    expect(vocabulary.register(next)).toBe(next)
    expect(() => vocabulary.register(card)).toThrow(/already registered/)
  })

  it("registers an unknown tag through replace()", () => {
    const vocabulary = new Vocabulary()
    expect(vocabulary.replace(button)).toBe(button)
    expect(vocabulary.get("ui-button")).toBe(button)
  })

  it("re-resolves localized vocabularies of the old version, same prefix and dictionary", () => {
    const vocabulary = registry()
    vocabulary.define("ie", spanish)
    expect(vocabulary.localizedFor("ui-card")?.vocabulary).toBe(card)
    const next = {
      ...card,
      attributes: [...card.attributes, { name: "raised", kind: "keyOnly", description: "Raised." }]
    } as const satisfies ComponentVocabulary
    vocabulary.replace(next)
    const tarjeta = vocabulary.localizedFor("ie-tarjeta")!
    expect(tarjeta.vocabulary).toBe(next)
    expect(tarjeta.tag).toBe("ie-tarjeta")
    expect(vocabulary.canonicalize("ie-tarjeta", "tamano", "pequeno")).toEqual({ attribute: "size", value: "small" })
    expect(vocabulary.canonicalize("ie-tarjeta", "raised")).toEqual({ attribute: "raised", value: undefined })
    expect(vocabulary.localizedFor("ui-card")!.vocabulary).toBe(next)
    // other components untouched
    expect(vocabulary.localizedFor("ie-boton")!.vocabulary).toBe(button)
  })

  it("keeps defaults on the prototype", () => {
    const vocabulary = new Vocabulary()
    expect(vocabulary.prefix).toBe("ui")
    expect(vocabulary.dictionary).toEqual({ lang: "en" })
    expect(Object.hasOwn(vocabulary, "prefix")).toBe(false)
  })
})

describe("Vocabulary.define() with the English identity dictionary", () => {
  const defined = registry().define()
  const localized = defined.get("ui-card")!

  it("resolves every registered component", () => {
    expect([...defined.keys()]).toEqual(["ui-card", "ui-button"])
  })

  it("keeps canonical names", () => {
    expect(localized.tag).toBe("ui-card")
    expect(localized.lang).toBe("en")
    expect([...localized.attributes.keys()]).toEqual([
      "color",
      "size",
      "fluid",
      "only",
      "pointing",
      "selected",
      "checked"
    ])
    expect(localized.attributes.get("checked")).toBe(card.attributes[5])
    expect([...localized.events.keys()]).toEqual(["ui-change"])
    expect([...localized.slots.keys()]).toEqual(["", "header"])
    expect([...localized.parts.keys()]).toEqual(["header"])
  })

  it("maps values to themselves", () => {
    expect(localized.values.get("color")!.get("red")).toBe("red")
    expect(localized.values.get("size")!.get("medium")).toBe("medium")
    expect(localized.values.has("fluid")).toBe(false)
  })
})

describe("Vocabulary.define() with a Spanish dictionary", () => {
  const vocabulary = registry()
  const defined = vocabulary.define("ie", spanish)
  const tarjeta = defined.get("ui-card")!

  it("prefixes and translates tags", () => {
    expect(tarjeta.tag).toBe("ie-tarjeta")
    expect(defined.get("ui-button")!.tag).toBe("ie-boton")
    expect(tarjeta.vocabulary).toBe(card)
  })

  it("translates attribute names, keeping untranslated ones canonical", () => {
    expect(tarjeta.attributes.get("color")!.name).toBe("color")
    expect(tarjeta.attributes.get("tamano")!.name).toBe("size")
    expect(tarjeta.attributes.has("size")).toBe(false)
    expect(tarjeta.names.attributes.get("size")).toBe("tamano")
  })

  it("translates shared value sets", () => {
    const hues = tarjeta.values.get("color")!
    expect(hues.get("rojo")).toBe("red")
    expect(hues.get("green")).toBe("green")
    expect(hues.has("red")).toBe(false)
  })

  it("translates inline enum values per component", () => {
    const animated = defined.get("ui-button")!.values.get("animated")!
    expect(animated.get("desvanecer")).toBe("fade")
    expect(animated.get("vertical")).toBe("vertical")
  })

  it("prefixes and translates events, slots and parts", () => {
    expect(tarjeta.events.get("ie-cambio")!.name).toBe("ui-change")
    expect(tarjeta.slots.get("encabezado")!.name).toBe("header")
    expect(tarjeta.slots.get("")!.name).toBe("")
    expect(tarjeta.parts.get("encabezado")!.name).toBe("header")
  })

  it("remembers localized tags for lookups", () => {
    expect(vocabulary.localizedFor("ie-tarjeta")).toBe(tarjeta)
  })
})

describe("Vocabulary.canonicalize() / localize()", () => {
  const vocabulary = registry()
  vocabulary.define("ie", spanish)

  it("canonicalizes a translated attribute and value", () => {
    expect(vocabulary.canonicalize("ie-tarjeta", "color", "rojo")).toEqual({ attribute: "color", value: "red" })
    expect(vocabulary.canonicalize("ie-tarjeta", "tamano", "grande")).toEqual({ attribute: "size", value: "big" })
  })

  it("localizes a canonical attribute and value", () => {
    expect(vocabulary.localize("ie-tarjeta", "color", "red")).toEqual({ attribute: "color", value: "rojo" })
    expect(vocabulary.localize("ie-tarjeta", "size", "small")).toEqual({ attribute: "tamano", value: "pequeno" })
  })

  it("round-trips every value of every attribute", () => {
    const tarjeta = vocabulary.localizedFor("ie-tarjeta")!
    for (const [attribute, values] of tarjeta.names.values) {
      for (const value of values.keys()) {
        const localized = vocabulary.localize("ie-tarjeta", attribute, value)!
        expect(vocabulary.canonicalize("ie-tarjeta", localized.attribute, localized.value)).toEqual({
          attribute,
          value
        })
      }
    }
  })

  it("maps multiple values token by token, keeping multi-word tokens whole", () => {
    expect(vocabulary.canonicalize("ie-tarjeta", "solo", "movil pantalla grande")).toEqual({
      attribute: "only",
      value: "mobile large screen"
    })
    expect(vocabulary.localize("ie-tarjeta", "only", "large screen tablet")!.value).toBe("pantalla grande tableta")
  })

  it("takes boolean words on keyOrValueAndKey attributes", () => {
    expect(vocabulary.canonicalize("ie-tarjeta", "pointing", "si")!.value).toBe("yes")
    expect(vocabulary.canonicalize("ie-tarjeta", "pointing", "izquierda")!.value).toBe("left")
  })

  it("passes unknown values through for the converter to warn about", () => {
    expect(vocabulary.canonicalize("ie-tarjeta", "color", "magenta")!.value).toBe("magenta")
  })

  it("accepts canonical aliases untranslated", () => {
    expect(vocabulary.canonicalize("ie-tarjeta", "checked", "")).toEqual({ attribute: "selected", value: "" })
  })

  it("returns undefined for unknown tags and attributes", () => {
    expect(vocabulary.canonicalize("ie-nada", "color", "rojo")).toBeUndefined()
    expect(vocabulary.canonicalize("ie-tarjeta", "size", "big")).toBeUndefined()
    expect(vocabulary.localize("ie-tarjeta", "nope")).toBeUndefined()
  })

  it("resolves canonical tags without define()", () => {
    const fresh = registry()
    expect(fresh.canonicalize("ui-card", "color", "red")).toEqual({ attribute: "color", value: "red" })
    expect(fresh.localize("ui-card", "size")).toEqual({ attribute: "size", value: undefined })
  })
})

describe("Vocabulary collisions", () => {
  it("throws when two attributes translate to the same name", () => {
    const vocabulary = registry()
    expect(() => vocabulary.define("ie", { lang: "es", attributes: { size: "color" } })).toThrow(/used twice/)
  })

  it("throws when two values translate to the same word", () => {
    const vocabulary = registry()
    expect(() => vocabulary.define("ie", { lang: "es", values: { hues: { red: "rojo", orange: "rojo" } } })).toThrow(
      /used twice/
    )
  })

  it("throws when two components translate to the same tag", () => {
    const vocabulary = registry()
    expect(() => vocabulary.define("ie", { lang: "es", tags: { "ui-card": "cosa", "ui-button": "cosa" } })).toThrow(
      /would name both/
    )
  })
})
