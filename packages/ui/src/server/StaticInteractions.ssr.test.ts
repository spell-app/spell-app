/// <reference types="node" />

import { chromium, type Browser, type Page } from "@playwright/test"
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticCatalog, StaticRender, StaticStylesheet } from "$/ui/server"

/**
 * P4:  a static page works WITHOUT scripts where the platform allows.  Rendered in node, then opened in Chromium
 * with JavaScript disabled:  dialogs open and close through invoker commands, click popups through `popovertarget`,
 * accordions through `<details>`.
 */
describe("StaticInteractions (JavaScript off)", { timeout: 30_000 }, () => {
  let browser: Browser
  let page: Page

  beforeAll(async () => {
    StaticRender.define(...StaticCatalog.classes)
    const body = `
      <ui-button id="open" commandfor="m1" command="--show">Open</ui-button>
      <ui-modal id="m1" closable header="Hello">
        <ui-content>Body</ui-content>
        <ui-actions><ui-button id="ok" approve>OK</ui-button></ui-actions>
      </ui-modal>
      <p><ui-button id="target">More</ui-button><ui-popup on="click" content="Popup text"></ui-popup></p>
      <p><ui-button id="hovered">Hover me</ui-button><ui-popup content="Tooltip text"></ui-popup></p>
      <ui-accordion>
        <ui-title id="q1">First</ui-title><ui-content>One</ui-content>
        <ui-title id="q2">Second</ui-title><ui-content>Two</ui-content>
      </ui-accordion>
      <ui-section header="A" collapsible><p>a</p></ui-section>
      <ui-section header="B" collapsible><p>b</p></ui-section>
    `
    const html = `<!doctype html><html><head><title>t</title></head><body>${body}</body></html>`
    await StaticRender.prepare(html)
    const rendered = StaticRender.page(html)
    const families = [...StaticRender.lastTags].map((tag) => StaticRender.families.get(tag)!)
    const css = StaticStylesheet.build(families, StaticRender.sheetUsage)
    browser = await chromium.launch()
    const context = await browser.newContext({ javaScriptEnabled: false })
    page = await context.newPage()
    await page.setContent(rendered.replace("</head>", `<style>${css}</style></head>`))
  }, 60_000)

  afterAll(async () => {
    await browser?.close()
  })

  it("opens the modal from its trigger and closes it from its close icon and approve button", async () => {
    const dialog = page.locator("dialog#m1")
    await expect.poll(() => dialog.evaluate((element) => (element as HTMLDialogElement).open)).toBe(false)
    await page.locator("#open").dispatchEvent("click")
    await expect.poll(() => dialog.evaluate((element) => (element as HTMLDialogElement).open)).toBe(true)
    await page.locator("dialog#m1 [part~='close']").dispatchEvent("click")
    await expect.poll(() => dialog.evaluate((element) => (element as HTMLDialogElement).open)).toBe(false)
    await page.locator("#open").dispatchEvent("click")
    await page.locator("dialog#m1 [approve]").dispatchEvent("click")
    await expect.poll(() => dialog.evaluate((element) => (element as HTMLDialogElement).open)).toBe(false)
  })

  it("toggles a click popup from its target", async () => {
    const popup = page.locator("[popover]").first()
    await expect.poll(() => popup.evaluate((element) => element.matches(":popover-open"))).toBe(false)
    await page.locator("#target").dispatchEvent("click")
    await expect.poll(() => popup.evaluate((element) => element.matches(":popover-open"))).toBe(true)
  })

  it("gives a hover popup's target the popup's text as its title", async () => {
    expect(await page.locator("#hovered").getAttribute("title")).toBe("Tooltip text")
  })

  it("opens accordion panels natively", async () => {
    const second = page.locator("details").nth(1)
    expect(await second.evaluate((element) => (element as HTMLDetailsElement).open)).toBe(false)
    await page.locator("details:nth-of-type(2) > summary").dispatchEvent("click")
    expect(await second.evaluate((element) => (element as HTMLDetailsElement).open)).toBe(true)
  })

  it("keeps ids unique:  each section's content has its own id, its toggle pointing at it", async () => {
    const ids = await page.locator("section [id^='content']").evaluateAll((elements) => elements.map((e) => e.id))
    expect(new Set(ids).size).toBe(ids.length)
    const controls = await page
      .locator("section button[aria-controls]")
      .evaluateAll((elements) => elements.map((e) => e.getAttribute("aria-controls")))
    expect(controls).toEqual(ids)
  })
})
