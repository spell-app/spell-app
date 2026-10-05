/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { ServerRuntime, StaticRender } from "$/ui/server"
import { UIBreadcrumb } from "$/ui/components/ui-breadcrumb/UIBreadcrumb"
import { UIBreadcrumbSection } from "$/ui/components/ui-breadcrumb/UIBreadcrumbSection"

/**
 * `<ui-breadcrumb>` / `<ui-breadcrumb-section>` in the static server render (`$/ui/server`, seo plan P3):  the class
 * grammar's semantic form, `<nav><ol><li><span class="divider"></span><a class="section">`.
 */
describe("ui-breadcrumb static render", () => {
  beforeAll(async () => {
    StaticRender.define(UIBreadcrumb, UIBreadcrumbSection)
    await ServerRuntime.icons()
  })

  it("renders a <nav> landmark around an <ol> of one <li> per section", () => {
    const html = StaticRender.fragment(
      `<ui-breadcrumb aria-label="Trail"><ui-breadcrumb-section href="#home">Home</ui-breadcrumb-section>` +
        `<ui-breadcrumb-section active>Shirt</ui-breadcrumb-section></ui-breadcrumb>`
    )
    expect(sorted(html)).toBe(
      sorted(
        `<nav data-ui="breadcrumb" class="ui breadcrumb" part="breadcrumb" aria-label="Trail"><ol part="list">` +
          `<li data-ui-slotted="" data-ui="breadcrumb-section"><span class="divider" part="divider" aria-hidden="true"></span>` +
          `<a class="section" part="section" href="#home">Home</a></li>` +
          `<li data-ui-slotted="" data-ui="breadcrumb-section" data-state="active">` +
          `<span class="divider" part="divider" aria-hidden="true"></span>` +
          `<span class="active section" part="section" aria-current="page">Shirt</span></li></ol></nav>`
      )
    )
  })

  it("publishes a text divider and an icon divider as inline tokens", () => {
    const text = StaticRender.fragment(`<ui-breadcrumb divider="›"></ui-breadcrumb>`)
    expect(text).toContain(`--ui-breadcrumb-divider:&quot;›&quot;`)
    const icon = StaticRender.fragment(`<ui-breadcrumb divider-icon="chevron right"></ui-breadcrumb>`)
    expect(icon).toMatch(/--ui-breadcrumb-divider-icon:url\(&quot;data:image\/svg\+xml,%3Csvg%20xmlns%3D/)
    expect(icon).toContain(`--_ui-breadcrumb-divider-layout:icon`)
  })
})

/** `html` with each tag's attributes sorted by name:  linkedom adds attributes at the front. */
function sorted(html: string): string {
  return html.replace(/<([a-z][\w-]*)((?:\s+[\w:-]+(?:="[^"]*")?)*)\s*(\/?)>/g, (_match, tag, attributes, close) => {
    const list = (attributes.match(/[\w:-]+(?:="[^"]*")?/g) ?? []).sort()
    return `<${tag}${list.map((each: string) => " " + each).join("")}${close}>`
  })
}
