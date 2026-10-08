import { describe, expect, test } from "vite-plus/test"

import { EmbedSources } from "./EmbedSources"

describe("EmbedSources.resolve()", () => {
  test("fills the source's URL and its player parameters", () => {
    const youtube = new URL(EmbedSources.resolve({ source: "youtube", id: "a b", autoplay: false, brandedUI: false })!)
    expect(youtube.pathname).toBe("/embed/a%20b")
    expect(Object.fromEntries(youtube.searchParams)).toEqual({
      autohide: "1",
      autoplay: "0",
      hq: "1",
      modestbranding: "1"
    })
    const vimeo = new URL(EmbedSources.resolve({ source: "vimeo", id: "42", autoplay: true, brandedUI: true })!)
    expect(vimeo.origin + vimeo.pathname).toBe("https://player.vimeo.com/video/42")
    expect(Object.fromEntries(vimeo.searchParams)).toEqual({ autoplay: "1", byline: "1", portrait: "1", title: "1" })
  })

  test("refuses non-http(s) urls and needs an id or url", () => {
    expect(EmbedSources.resolve({ url: "javascript:alert(1)", autoplay: true, brandedUI: false })).toBeUndefined()
    expect(EmbedSources.resolve({ url: "data:text/html,x", autoplay: true, brandedUI: false })).toBeUndefined()
    expect(EmbedSources.resolve({ source: "youtube", autoplay: true, brandedUI: false })).toBeUndefined()
  })
})

describe("EmbedSources.sourceFor()", () => {
  test("recognises a source by its url's domain, and leaves other urls' parameters alone", () => {
    expect(EmbedSources.sourceFor("https://player.vimeo.com/video/1")).toBe("vimeo")
    expect(EmbedSources.sourceFor("https://www.youtube.com/embed/1")).toBe("youtube")
    expect(EmbedSources.sourceFor("https://notyoutube.com/x")).toBeUndefined()
    expect(EmbedSources.resolve({ url: "https://example.com/a?b=1", autoplay: true, brandedUI: false })).toBe(
      "https://example.com/a?b=1"
    )
  })
})
