/**
 * Tests of `GoalsPage` edits that need no files.
 * - Run from the repo root:  `node --test packages/docs/tools/goals/page.test.js`
 */
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"

import { TEMPLATES } from "../pages.js"
import { GoalsPage } from "./page.js"

const ASSETS = "../../../packages/docs/tools/_assets"

/** The shared topic page template:  a hero with its status label, and a history. */
const TOPIC_TEMPLATE = `${TEMPLATES}/goals/set/topic/topic.html`

/** A page's `<head>` linking `sheets`, in order. */
function pageLinking(...sheets) {
  const links = sheets.map((sheet) => `<link rel="stylesheet" href="${ASSETS}/${sheet}" />`).join("")
  return GoalsPage.parse(`<!doctype html><html><head>${links}</head><body></body></html>`)
}

/** The stylesheets `page` links, in order. */
function sheetsOf(page) {
  return Array.from(page.document.querySelectorAll('link[rel="stylesheet"]'), (link) => link.getAttribute("href"))
}

test("restyle() drops plan-doc.css from a page that links goals.css too", () => {
  const page = pageLinking("spell-doc.css", "plan-doc.css", "goals.css")
  assert.equal(page.restyle(), true)
  assert.deepEqual(sheetsOf(page), [`${ASSETS}/spell-doc.css`, `${ASSETS}/goals.css`])
})

test("restyle() puts goals.css where plan-doc.css was, when the page had none", () => {
  const page = pageLinking("spell-doc.css", "plan-doc.css")
  assert.equal(page.restyle(), true)
  assert.deepEqual(sheetsOf(page), [`${ASSETS}/spell-doc.css`, `${ASSETS}/goals.css`])
})

test("restyle() leaves a page that links goals.css alone", () => {
  const page = pageLinking("spell-doc.css", "goals.css")
  assert.equal(page.restyle(), false)
  assert.deepEqual(sheetsOf(page), [`${ASSETS}/spell-doc.css`, `${ASSETS}/goals.css`])
})

// the colour scheme (Q20 of epic `epic-components`):  agreed and building OUTLINED (not done yet), shipped solid
test("setStatus() colours the hero's label by the scheme, outlined until done", () => {
  const page = GoalsPage.parse(readFileSync(TOPIC_TEMPLATE, "utf8"))
  const look = () => {
    const label = page.document.querySelector("ui-label.goals-status")
    return [label.getAttribute("color"), label.hasAttribute("basic")]
  }
  page.setStatus("agreed")
  assert.deepEqual(look(), ["green", true])
  page.setStatus("dialog")
  assert.deepEqual(look(), ["yellow", false])
  page.setStatus("shipped")
  assert.deepEqual(look(), ["green", false])
})
