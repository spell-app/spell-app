/**
 * Tests of `GoalsPage` edits that need no files.
 * - Run from the repo root:  `node --test packages/docs/tools/goals/page.test.js`
 */
import assert from "node:assert/strict"
import { test } from "node:test"

import { GoalsPage } from "./page.js"

const ASSETS = "../../../packages/docs/tools/_assets"

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
