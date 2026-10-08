/// <reference types="node" />

import { describe, expect, it } from "vite-plus/test"
import { renderToString } from "@solidjs/web"
import { writeFile, mkdir } from "node:fs/promises"
import { resolve } from "node:path"

import { foundationCSS } from "$/ui/styles"
import { buttonVocabulary } from "$/ui/components/ui-button/UIButton.en"
import { ElementDefinition, type DOMElement } from "$/ui/elements"
import { UIButton } from "$/ui/components/ui-button/UIButton"

import buttonCSS from "$/ui/components/ui-button/UIButton.css?inline"

/**
 * SSR probe:  can `<ui-button primary>Save</ui-button>` be rendered to a Declarative Shadow DOM string?
 * - `@spell-app/solid-element` (like `@solidjs/element`) has no server render yet (it needs a live `HTMLElement`), so
 *   this drives the COMPONENT directly under `@solidjs/web`'s server `renderToString`,
 *   with a stub DOM element standing in for the element (no internals, no observers)
 *   and converted attributes as solid-element would hand them over,
 *   then wraps the result in `<template shadowrootmode>`.
 * - SIDE EFFECT:  writes the string to `.cache/ssr-button.html` for the browser check (`dsd.test.ts`).
 */
describe("<ui-button> server render to Declarative Shadow DOM", () => {
  it("renders <ui-button primary>Save</ui-button> to a DSD string", async () => {
    const definition = new ElementDefinition(buttonVocabulary)
    const attrs = { primary: true } as unknown as ConstructorParameters<typeof UIButton>[2]
    const host = stubHost()
    const html = renderToString(() => new UIButton(host, definition, attrs).onMount())
    const css = [...foundationCSS, buttonCSS].join("\n")
    const dsd =
      `<ui-button primary><template shadowrootmode="open" shadowrootdelegatesfocus>` +
      `<style>${css}</style>${html}</template>Save</ui-button>`
    const cache = resolve(import.meta.dirname, "..", ".cache")
    await mkdir(cache, { recursive: true })
    await writeFile(resolve(cache, "ssr-button.html"), dsd)
    expect(html).toContain('class="ui primary button"')
    expect(html).toContain('part="button"')
    expect(html).toContain("<slot")
  })
})

/** The least of `DOMElement` the component touches while rendering on the server. */
function stubHost(): DOMElement {
  return {
    childNodes: [],
    shadowRoot: null,
    getAttribute: () => null,
    addPropertyChangedCallback() {},
    addReleaseCallback() {},
    setState() {},
    markReady() {},
    internals: {}
  } as unknown as DOMElement
}
