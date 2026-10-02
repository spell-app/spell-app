/// <reference types="node" />

import { beforeAll, describe, expect, it } from "vitest"

import { StaticRender } from "$/ui/server"
import { UIButton } from "$/ui/components/ui-button/UIButton"
import { UICard } from "$/ui/components/ui-card/UICard"
import { UICards } from "$/ui/components/ui-card/UICards"
import { UIItem } from "$/ui/components/ui-item/UIItem"
import { UIList } from "$/ui/components/ui-list/UIList"
import { UIContent } from "$/ui/components/ui-parts/UIContent"
import { UIDescription } from "$/ui/components/ui-parts/UIDescription"
import { UIHeader } from "$/ui/components/ui-parts/UIHeader"
import { UIMeta } from "$/ui/components/ui-parts/UIMeta"
import { UISection } from "$/ui/components/ui-section/UISection"
import { UISegment } from "$/ui/components/ui-segment/UISegment"

/**
 * `StaticRender` on the P1 families (button, segment, card + parts, list + items, section):  real page markup in,
 * flattened light-DOM HTML out, compared with the class grammar of each family's `examples/*.html`.
 */
describe("StaticRender", () => {
  beforeAll(() => {
    StaticRender.define(
      UIButton,
      UISegment,
      UICards,
      UICard,
      UIContent,
      UIHeader,
      UIMeta,
      UIDescription,
      UIList,
      UIItem,
      UISection
    )
  })

  it("renders a button to its native <button>, slotted text inside", () => {
    const html = StaticRender.fragment(`<ui-button primary size="large" id="save">Save</ui-button>`)
    expect(sorted(html)).toBe(
      sorted(
        `<button type="button" class="ui large primary button" part="button" data-ui="button" id="save">Save</button>`
      )
    )
  })

  it("renders a segment around its children", () => {
    const html = StaticRender.fragment(`<ui-segment raised><p>Body</p></ui-segment>`)
    expect(sorted(html)).toBe(
      sorted(`<div class="ui raised segment" part="segment" data-ui="segment"><p>Body</p></div>`)
    )
  })

  it("renders cards:  a <ul> of <li>-wrapped cards, owned parts marked in-card", () => {
    const html = StaticRender.fragment(
      `<ui-cards><ui-card><ui-content><ui-header>Spell</ui-header><ui-meta>2026</ui-meta>` +
        `<ui-description>Words that run.</ui-description></ui-content></ui-card></ui-cards>`
    )
    expect(sorted(html)).toBe(
      sorted(
        `<ul class="ui cards" part="group" role="list" data-ui="cards"><li>` +
          `<article class="ui card in-cards" part="card" data-ui="card">` +
          `<div class="content in-card" part="content" data-ui="content">` +
          `<div class="header in-card" part="header" data-ui="header">Spell</div>` +
          `<div class="meta in-card" part="meta" data-ui="meta">2026</div>` +
          `<div class="description in-card" part="description" data-ui="description">Words that run.</div>` +
          `</div></article></li></ul>`
      )
    )
  })

  it("renders a list:  owned items, each in an <li>", () => {
    const html = StaticRender.fragment(`<ui-list bulleted><ui-item>One</ui-item><ui-item>Two</ui-item></ui-list>`)
    expect(sorted(html)).toBe(
      sorted(
        `<ul class="ui bulleted list" part="list" role="list" data-ui="list">` +
          `<li><div class="item in-list" part="item" data-ui="item">One</div></li>` +
          `<li><div class="item in-list" part="item" data-ui="item">Two</div></li></ul>`
      )
    )
  })

  it("renders nested sections:  the inner heading one level down", () => {
    const html = StaticRender.fragment(
      `<ui-section header="Outer"><p>A</p><ui-section header="Inner"><p>B</p></ui-section></ui-section>`
    )
    expect(html).toMatch(/<h2 [^>]*>.*Outer.*<\/h2>/)
    expect(html).toMatch(/<h3 [^>]*>.*Inner.*<\/h3>/)
    expect(html).toMatch(/<p>A<\/p><section [^>]*class="ui section in-section"/)
    expect(html).not.toContain("<ui-")
    expect(html).not.toContain("<slot")
  })

  it("keeps author attributes, drops vocabulary attributes, moves slot assignment", () => {
    const html = StaticRender.fragment(
      `<ui-segment basic id="intro" class="hero" data-x="1" title="Intro" lang="fr">Salut</ui-segment>`
    )
    expect(sorted(html)).toBe(
      sorted(
        `<div class="ui basic segment hero" part="segment" data-ui="segment" id="intro" data-x="1" ` +
          `title="Intro" lang="fr">Salut</div>`
      )
    )
  })

  it("leaves tags of families it doesn't know", () => {
    expect(StaticRender.fragment(`<ui-unknown>x</ui-unknown>`)).toBe(`<ui-unknown>x</ui-unknown>`)
  })
})

/** `html` with each tag's attributes sorted by name:  linkedom adds attributes at the front. */
function sorted(html: string): string {
  return html.replace(/<([a-z][\w-]*)((?:\s+[\w:-]+(?:="[^"]*")?)*)\s*(\/?)>/g, (_match, tag, attributes, close) => {
    const list = (attributes.match(/[\w:-]+(?:="[^"]*")?/g) ?? []).sort()
    return `<${tag}${list.map((each: string) => " " + each).join("")}${close}>`
  })
}
