import { describe, expect, it, onTestFinished } from "vitest"

import { expectAccessible } from "$/ui/test/a11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"

import { EmojiData } from "$/ui/components/emoji"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/emoji/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** Render one emoji and wait for its glyph;  returns it with its root. */
async function render(html: string) {
  const host = await ElementFixture.render<UIHost>(html)
  const root = host.shadowRoot!.firstElementChild as HTMLElement
  const name = host.getAttribute("name")
  if (name) await EmojiData.get(name)
  await ElementFixture.tick()
  return { host, root }
}

describe("EmojiData", () => {
  it("normalizes names:  colons, case, spaces", () => {
    expect(EmojiData.normalize(" :Smile: ")).toBe("smile")
    expect(EmojiData.normalize("Thumbs  Up")).toBe("thumbs_up")
    expect(EmojiData.normalize("blond-haired_woman")).toBe("blond-haired_woman")
  })

  it("chunks by first letter, digits together", () => {
    expect(EmojiData.chunkOf("smile")).toBe("s")
    expect(EmojiData.chunkOf("100")).toBe("0")
    expect(EmojiData.chunkOf("8ball")).toBe("0")
  })

  it("loads a name's chunk lazily, then answers synchronously", async () => {
    expect(EmojiData.peek("zap")).toBeUndefined()
    expect(await EmojiData.get("zap")).toBe("\u26A1")
    expect(EmojiData.peek(":ZAP:")).toBe("\u26A1")
    expect(EmojiData.peek("zebra")).toBe("\u{1F993}")
  })

  it("restores U+FE0F where the glyph would otherwise be text", async () => {
    expect(await EmojiData.get("sunny")).toBe("\u2600\uFE0F")
    expect(await EmojiData.get("one")).toBe("1\uFE0F\u20E3")
    expect(await EmojiData.get("flag_us")).toBe("\u{1F1FA}\u{1F1F8}")
    expect(await EmojiData.get("100")).toBe("\u{1F4AF}")
  })

  it("names are CLDR shortcodes;  Fomantic's names are aliases of the same character", async () => {
    const thumbs = "\u{1F44D}"
    expect(await EmojiData.get("thumbs_up")).toBe(thumbs)
    expect(await EmojiData.get("thumbsup")).toBe(thumbs)
    expect(await EmojiData.get(":thumbsup:")).toBe(thumbs)
    expect(await EmojiData.get("Thumbs Up")).toBe(thumbs)
    expect(await EmojiData.get("thumbsup_tone1")).toBe("\u{1F44D}\u{1F3FB}")
    expect(await EmojiData.get("thumbs_up_tone1")).toBe("\u{1F44D}\u{1F3FB}")
    expect(await EmojiData.get("grinning_face_with_smiling_eyes")).toBe(await EmojiData.get("smile"))
    expect(await EmojiData.get("flag_united_states")).toBe(await EmojiData.get("flag_us"))
    expect(await EmojiData.get("1st_place_medal")).toBe("\u{1F947}")
  })

  it("CLDR's meaning wins where a Fomantic name is another emoji's CLDR name", async () => {
    // Fomantic's `dog` is the face (U+1F436), CLDR's `dog` the whole dog (U+1F415), which is `dog2` in Fomantic
    expect(await EmojiData.get("dog")).toBe("\u{1F415}")
    expect(await EmojiData.get("dog_face")).toBe("\u{1F436}")
    expect(await EmojiData.get("dog2")).toBe("\u{1F415}")
    expect(await EmojiData.get("pencil")).toBe("\u{270F}\u{FE0F}")
    expect(await EmojiData.get("memo")).toBe("\u{1F4DD}")
  })

  it("adds U+FE0F only to emoji that default to text (the data says which)", async () => {
    expect(await EmojiData.get("hourglass")).toBe("⌛")
    expect(await EmojiData.get("eye_in_speech_bubble")).toBe("\u{1F441}️‍\u{1F5E8}️")
    expect(await EmojiData.get("copyright")).toBe("©️")
  })

  it("answers undefined for unknown names, and takes registered ones", async () => {
    expect(await EmojiData.get("no_such_emoji")).toBeUndefined()
    expect(await EmojiData.get("")).toBeUndefined()
    EmojiData.register("Spell", "\u2728")
    expect(EmojiData.peek("spell")).toBe("\u2728")
  })
})

describe("<ui-emoji>", () => {
  it.each([
    ["", "ui emoji"],
    ['size="small"', "ui small emoji"],
    ['size="medium"', "ui emoji"],
    ['size="big" link', "ui big link emoji"],
    ["disabled loading", "ui disabled loading emoji"]
  ])("<ui-emoji name=smile %s>", async (attributes, classes) => {
    const { root } = await render(`<ui-emoji name="smile" ${attributes}></ui-emoji>`)
    expect(root.className).toBe(classes)
    expect(root.getAttribute("part")).toBe("emoji")
    expect(root.localName).toBe("span")
  })

  it("draws the native emoji as plain text by default:  assistive tech reads its Unicode name", async () => {
    const { root } = await render(`<ui-emoji name=":smile:"></ui-emoji>`)
    expect(root.textContent).toBe("\u{1F604}")
    expect(root.hasAttribute("role")).toBe(false)
    expect(root.hasAttribute("aria-hidden")).toBe(false)
  })

  it("is a named image with label, decorative with a bare label", async () => {
    const { root } = await render(`<ui-emoji name="thumbsup" label="Approved"></ui-emoji>`)
    expect(root.getAttribute("role")).toBe("img")
    expect(root.getAttribute("aria-label")).toBe("Approved")
    const decorative = await render(`<ui-emoji name="sparkles" label></ui-emoji>`)
    expect(decorative.root.getAttribute("aria-hidden")).toBe("true")
    expect(decorative.root.hasAttribute("role")).toBe(false)
  })

  it("renders an empty box, with no role, for an unknown name", async () => {
    const { root } = await render(`<ui-emoji name="no_such_emoji" label="Nothing"></ui-emoji>`)
    expect(root.textContent).toBe("")
    expect(root.hasAttribute("role")).toBe(false)
  })

  it("follows name changes, the latest request winning", async () => {
    const { host, root } = await render(`<ui-emoji name="smile"></ui-emoji>`)
    host.setAttribute("name", "yum")
    host.setAttribute("name", "rocket")
    await EmojiData.get("rocket")
    await EmojiData.get("yum")
    await ElementFixture.tick()
    expect(root.textContent).toBe("\u{1F680}")
  })

  it("sizes on Fomantic's ladder against the text, and dims / spins", async () => {
    const holder = await ElementFixture.render(
      `<p style="font-size: 20px"><ui-emoji name="smile"></ui-emoji><ui-emoji name="smile" size="small"></ui-emoji>` +
        `<ui-emoji name="smile" size="large"></ui-emoji><ui-emoji name="smile" size="big" disabled loading></ui-emoji></p>`
    )
    const roots = [...holder.querySelectorAll<UIHost>("ui-emoji")].map(
      (host) => host.shadowRoot!.firstElementChild as HTMLElement
    )
    expect(roots.map((root) => parseFloat(getComputedStyle(root).fontSize))).toEqual([20, 30, 120, 150])
    expect(parseFloat(getComputedStyle(roots[3]!).opacity)).toBeCloseTo(0.45, 2)
    expect(getComputedStyle(roots[3]!).animationName).toBe("ui-emoji-spin")
    expect(holder.querySelectorAll("ui-emoji")[3]!.matches(":state(loading):state(disabled)")).toBe(true)
  })

  it("isn't scaled twice inside a sized component", async () => {
    const holder = await ElementFixture.render(
      `<div class="ui-large" style="--ui-scale: 2; font-size: 16px"><ui-emoji name="smile"></ui-emoji></div>`
    )
    const root = holder.querySelector<UIHost>("ui-emoji")!.shadowRoot!.firstElementChild!
    expect(parseFloat(getComputedStyle(root).fontSize)).toBe(16)
  })
})

describe("<ui-emoji> tokens from outside", () => {
  /** The inner box's opacity. */
  function measure(host: Element): string {
    return getComputedStyle(host.shadowRoot!.querySelector("[part~=emoji]")!).opacity
  }

  /** The element under test. */
  const MARKUP = `<ui-emoji name="smile"></ui-emoji>`

  it("takes a token set on the HOST", async () => {
    const host = await ElementFixture.render(MARKUP.replace("<ui-emoji", `<ui-emoji style="--ui-emoji-opacity: 0.5"`))
    expect(measure(host)).toBe("0.5")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-emoji-opacity: 0.5"><div>${MARKUP}</div></section>`
    )
    expect(measure(wrapper.querySelector("ui-emoji")!)).toBe("0.5")
  })

  it("takes a token set through `::part(emoji)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(emoji) { --ui-emoji-opacity: 0.5 }</style>${MARKUP.replace("<ui-emoji", '<ui-emoji class="themed"')}</div>`
    )
    expect(measure(wrapper.querySelector("ui-emoji")!)).toBe("0.5")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-emoji-opacity", "0.5")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-emoji-opacity")
    })
    const host = await ElementFixture.render(MARKUP)
    expect(measure(host)).toBe("0.5")
  })

  it("keeps its defaults when nothing is set", async () => {
    const host = await ElementFixture.render(MARKUP)
    expect(measure(host)).toBe("1")
  })

  it("variations:  a size reads its ratio token", async () => {
    const host = await ElementFixture.render(
      `<div style="font-size: 16px"><ui-emoji name="smile" size="large" style="--ui-emoji-size-large: 4"></ui-emoji></div>`
    )
    const root = host.querySelector("ui-emoji")!.shadowRoot!.querySelector("[part~=emoji]")!
    expect(getComputedStyle(root).fontSize).toBe("64px")
  })
})

describe("<ui-emoji> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await Promise.all([...root.querySelectorAll("ui-emoji")].map((host) => EmojiData.get(host.getAttribute("name")!)))
    await ElementFixture.tick()
    await expectAccessible(root)
  })
})
