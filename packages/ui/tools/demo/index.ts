/**
 * `yarn dev` home page:  every example fragment of `src/components/ui-<name>/examples/` (class grammar, light DOM)
 * beside its element markup in `examples/elements/`, for every family that has examples.
 * - The originals need the component sheets on the PAGE (`FamilySheets`);  the runtime already puts the foundation
 *   there.
 * - `item` has no examples of its own:  its look is its owners' (`ui-list.css`, `ui-menu.css`, `ui-items.css`).
 * - The parts' own examples use `stub-*` owners (`StubOwner`) only where the real owner is a hidden overlay
 *   (modal, popup) or owns no parts yet (accordion, toast, search).
 * - `?only=<family>` shows one family's pairs, `ui-button` or `button` (`yarn screenshots`).
 * - A page script, served by Vite:  `$/ui` aliases.
 */

import { UI } from "$/ui/runtime"
import { StubOwner } from "$/ui/test/StubOwner"

import { FamilySheets } from "./FamilySheets.ts"

import "$/ui/index"

/** Original fragments, by path. */
const ORIGINALS = import.meta.glob<string>("/src/components/*/examples/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** Element rewrites, by path. */
const ELEMENTS = import.meta.glob<string>("/src/components/*/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** An element example's path:  its family folder and file, `ui-button` and `content.html`. */
const ELEMENT_EXAMPLE = /\/components\/([\w-]+)\/examples\/elements\/([\w-]+\.html)$/

StubOwner.defineFomanticOwners()
await UI.load()
FamilySheets.register()

const only = new URLSearchParams(location.search).get("only")?.replace(/^ui-/, "")
const main = document.getElementById("examples")!
for (const [path, html] of Object.entries(ELEMENTS)) {
  const [, folder = "", file] = ELEMENT_EXAMPLE.exec(path) ?? []
  if (only && folder !== `ui-${only}`) continue
  const name = `${folder}/${file}`
  const original = ORIGINALS[`/src/components/${folder}/examples/${file}`] ?? ""
  const pair = document.createElement("section")
  pair.className = "pair"
  pair.innerHTML = `<div><h3>${name} -- class grammar</h3>${original}</div><div><h3>${name} -- elements</h3>${html}</div>`
  main.append(pair)
}
