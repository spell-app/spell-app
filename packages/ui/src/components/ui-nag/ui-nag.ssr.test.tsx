/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/server"
import { UINag } from "$/ui/components/ui-nag/UINag"

/**
 * `<ui-nag>` in the static server render (`$/ui/server`, seo plan P3):  always shown -- a server can't read the
 * reader's dismissal (plan C2).
 */
describe("ui-nag static render", () => {
  beforeAll(() => {
    StaticRender.define(UINag)
  })

  it("renders the bar and its close button", () => {
    const html = StaticRender.fragment(`<ui-nag closable key="cookies">Cookies</ui-nag>`)
    expect(html).toMatch(/^<div [^>]*class="ui nag"[^>]*>Cookies<button /)
    expect(html).toMatch(/<button [^>]*class="close icon"/)
    expect(html).toMatch(/<button [^>]*aria-label="Close"/)
    expect(html).not.toContain(" hidden")
  })

  it("renders no close button when not closable", () => {
    expect(StaticRender.fragment(`<ui-nag closable="false">Hi</ui-nag>`)).not.toContain("<button")
  })
})
