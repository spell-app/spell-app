/*
 * Saving for the docs' source elements (`<ui-include>`, `<ui-code>`, `<ui-markdown>`):  `UI.sources.saver`, through
 * the page server's `SPELL_SERVER.saveFile()` (`$/server`'s live client).
 * Bundled into `spell-ui.js` by `scripts/bundle-spell-ui.js`;  side effects only.
 * - Only on a page the page server served (`window.SPELL_SERVER`):  from `file://` there's no server, so no saver,
 *   and `save()` fails with `no-saver`.
 * - `saveFile` is added by the live client (`/_server/live.js`, deferred), so it's read when a save happens.
 * - Failures are thrown as `{ kind, message, status }` (a classic script can't import `SourceError`):  `conflict`
 *   for 409 (the file changed since it was loaded:  reload, then save again), `save` otherwise.
 */

import { UI } from "@spell-app/ui/core"

if (window.SPELL_SERVER) {
  void UI.load().then((ui) => {
    ui.sources.saver ??= saveThroughPageServer
  })
}

/** `UI.sources.saver`:  `{ url, text, etag, fragment }` to `SPELL_SERVER.saveFile()`, by URL path. */
async function saveThroughPageServer({ url, text, etag, fragment }) {
  const saveFile = window.SPELL_SERVER?.saveFile
  if (!saveFile) throw { kind: "no-saver", message: "the page server's live client isn't loaded" }
  const answer = await saveFile({ path: decodeURIComponent(new URL(url).pathname), text, etag, fragment })
  if (answer.ok) return { etag: answer.etag }
  const kind = answer.status === 409 || answer.status === 412 ? "conflict" : "save"
  throw { kind, message: answer.error ?? `the server said ${answer.status}`, status: answer.status }
}
