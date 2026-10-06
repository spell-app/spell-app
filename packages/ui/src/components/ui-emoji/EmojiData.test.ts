import { afterEach, describe, expect, onTestFinished, test } from "vite-plus/test"

import { EmojiData } from "./EmojiData"

// every test leaves the default name set on
afterEach(() => {
  EmojiData.use("cldr")
})

////////////////
// ## EmojiData.normalize()
////////////////

describe("EmojiData.normalize()", () => {
  test("normalizes names:  colons, case, spaces", () => {
    expect(EmojiData.normalize(" :Smile: ")).toBe("smile")
    expect(EmojiData.normalize("Thumbs  Up")).toBe("thumbs_up")
    expect(EmojiData.normalize("blond-haired_woman")).toBe("blond-haired_woman")
  })
})

////////////////
// ## EmojiData.chunkFor()
////////////////

describe("EmojiData.chunkFor()", () => {
  test("chunks by first letter, digits together", () => {
    expect(EmojiData.chunkFor("smile")).toBe("s")
    expect(EmojiData.chunkFor("100")).toBe("0")
    expect(EmojiData.chunkFor("8ball")).toBe("0")
  })
})

////////////////
// ## EmojiData.get() / .peek()
////////////////

describe("EmojiData.get() / .peek()", () => {
  test("loads a name's chunk lazily, then answers synchronously", async () => {
    expect(EmojiData.peek("high_voltage")).toBeUndefined()
    expect(await EmojiData.get("high_voltage")).toBe("\u26A1")
    expect(EmojiData.peek(":HIGH_VOLTAGE:")).toBe("\u26A1")
    expect(EmojiData.peek("zebra")).toBeUndefined()
    expect(await EmojiData.get("zebra")).toBe("\u{1F993}")
  })

  test("restores U+FE0F where the glyph would otherwise be text", async () => {
    expect(await EmojiData.get("sun")).toBe("\u2600\uFE0F")
    expect(await EmojiData.get("keycap_1")).toBe("1\uFE0F\u20E3")
    expect(await EmojiData.get("flag_united_states")).toBe("\u{1F1FA}\u{1F1F8}")
    expect(await EmojiData.get("hundred_points")).toBe("\u{1F4AF}")
  })

  test("names are CLDR shortcodes by default, and Fomantic's names are NOT resolved", async () => {
    expect(EmojiData.names).toBe("cldr")
    const thumbs = "\u{1F44D}"
    expect(await EmojiData.get("thumbs_up")).toBe(thumbs)
    expect(await EmojiData.get(":thumbs_up:")).toBe(thumbs)
    expect(await EmojiData.get("Thumbs Up")).toBe(thumbs)
    expect(await EmojiData.get("thumbs_up_tone1")).toBe("\u{1F44D}\u{1F3FB}")
    expect(await EmojiData.get("1st_place_medal")).toBe("\u{1F947}")
    // Fomantic-only names (`thumbsup_tone1` is not:  its words, joined, are `thumbs_up_tone1`'s)
    for (const name of ["smile", "flag_us", "sunny"]) {
      expect(await EmojiData.get(name), name).toBeUndefined()
    }
  })

  test("`cldr` means CLDR's pictures:  `dog` is the whole dog, `pencil` the pencil", async () => {
    expect(await EmojiData.get("dog")).toBe("\u{1F415}")
    expect(await EmojiData.get("pencil")).toBe("\u{270F}\u{FE0F}")
    expect(await EmojiData.get("memo")).toBe("\u{1F4DD}")
  })

  test("finds a CLDR name however its words are joined:  spaces, dashes, camelCase, or none", async () => {
    const bubble = "\u{1F441}\uFE0F\u200D\u{1F5E8}\uFE0F"
    for (const name of ["eye in speech bubble", "eye-in-speech-bubble", "eyeInSpeechBubble", "eyeinspeechbubble"]) {
      expect(await EmojiData.get(name), name).toBe(bubble)
    }
    for (const name of ["thumbs up", "thumbs-up", "thumbsUp", "thumbsup"]) {
      expect(await EmojiData.get(name), name).toBe("\u{1F44D}")
    }
  })

  test("adds U+FE0F only to emoji that default to text (the data says which)", async () => {
    expect(await EmojiData.get("hourglass_done")).toBe("⌛")
    expect(await EmojiData.get("eye_in_speech_bubble")).toBe("\u{1F441}️‍\u{1F5E8}️")
    expect(await EmojiData.get("copyright")).toBe("©️")
  })

  test("answers undefined for unknown names, and takes registered ones", async () => {
    expect(await EmojiData.get("no_such_emoji")).toBeUndefined()
    expect(await EmojiData.get("")).toBeUndefined()
    EmojiData.register("Spell", "\u2728")
    expect(EmojiData.peek("spell")).toBe("\u2728")
  })
})

////////////////
// ## EmojiData.use()
////////////////

describe("EmojiData.use()", () => {
  test("`chunkLoader` replaces the lazy `import()`s (a single-file build loads chunks as scripts)", async () => {
    const asked: string[] = []
    EmojiData.chunkLoader = async (set, chunk) => {
      asked.push(`${set}/${chunk}`)
      return { quokka_wave: "\u{1F44B}" }
    }
    onTestFinished(() => {
      EmojiData.chunkLoader = undefined
    })
    EmojiData.use("fomantic")
    expect(await EmojiData.get("Quokka Wave")).toBe("\u{1F44B}")
    expect(await EmojiData.get("quokkaWave")).toBe("\u{1F44B}")
    expect(asked).toEqual(["fomantic/q"])
  })

  test("`fomantic` is Fomantic's names with Fomantic's meanings, and no CLDR-only name", async () => {
    EmojiData.use("fomantic")
    expect(EmojiData.names).toBe("fomantic")
    expect(await EmojiData.get("thumbsup")).toBe("\u{1F44D}")
    expect(await EmojiData.get(":smile:")).toBe("\u{1F604}")
    expect(await EmojiData.get("flag_us")).toBe("\u{1F1FA}\u{1F1F8}")
    expect(await EmojiData.get("dog")).toBe("\u{1F436}")
    expect(await EmojiData.get("pencil")).toBe("\u{1F4DD}")
    // CLDR-only names (`thumbs_up` is not:  its words, joined, are Fomantic's `thumbsup`)
    for (const name of ["grinning_face_with_smiling_eyes", "red_heart", "high_voltage"]) {
      expect(await EmojiData.get(name), name).toBeUndefined()
    }
  })

  test("`fomantic` keeps the loose lookup, and an exact `icecream` beats `ice_cream`", async () => {
    EmojiData.use("fomantic")
    for (const name of ["thumbs up", "thumbs-up", "thumbsUp"]) expect(await EmojiData.get(name), name).toBe("\u{1F44D}")
    expect(await EmojiData.get("icecream")).toBe("\u{1F366}")
    expect(await EmojiData.get("ice_cream")).toBe("\u{1F368}")
    for (const name of ["ice cream", "ice-cream", "iceCream"]) expect(await EmojiData.get(name), name).toBe("\u{1F368}")
  })

  test("each set keeps its own names, side by side:  `pencil` is \u270F\uFE0F in cldr, \u{1F4DD} in fomantic", async () => {
    EmojiData.reset()
    expect(await EmojiData.get("pencil", "cldr")).toBe("\u270F\uFE0F")
    expect(EmojiData.peek("pencil", "fomantic")).toBeUndefined()
    expect(await EmojiData.get("pencil", "fomantic")).toBe("\u{1F4DD}")
    expect(EmojiData.peek("pencil", "cldr")).toBe("\u270F\uFE0F")
    EmojiData.use("fomantic")
    expect(EmojiData.peek("pencil")).toBe("\u{1F4DD}")
  })

  test("a chunk loading for one set lands in that set only", async () => {
    EmojiData.reset()
    const pending = EmojiData.get("thumbs_up", "cldr")
    EmojiData.use("fomantic")
    await pending
    expect(EmojiData.peek("thumbs_up")).toBeUndefined()
    expect(EmojiData.peek("thumbs_up", "cldr")).toBe("\u{1F44D}")
  })

  test("an unknown set means the default", () => {
    EmojiData.use("fomantic")
    EmojiData.use("klingon")
    expect(EmojiData.names).toBe("cldr")
  })

  test("registered names survive a switch and apply to any set", async () => {
    EmojiData.register("Approve", "\u{1F44D}")
    expect(EmojiData.peek("approve")).toBe("\u{1F44D}")
    EmojiData.use("fomantic")
    expect(EmojiData.peek("approve")).toBe("\u{1F44D}")
    EmojiData.use("cldr")
    expect(EmojiData.peek("approve")).toBe("\u{1F44D}")
  })
})
