/**
 * A Python spell program's web app, `<Project>.app.py` (epic `python-target` P20, Q25 B):
 * what compiling to `py` writes beside a program that draws.
 * - A short Quart app, every route spelled out, for a Python programmer to read and grow:
 *   - `/`:  the page, which loads the javascript core and the program's drawing half, `<Project>.elements.spell.js`
 *   - `/<Project>.elements.spell.js`, and each imported project's:  served from beside the program
 *   - `/spell/...`:  the javascript core, Solid, Spell UI and Semantic UI (`spell_quart.assets_folder()`)
 *   - `/ws`:  the WebSocket:  a click up, the state and what changed down;  a game per visitor
 *   - a place for their own routes
 * - The app is committed beside the project's source.
 * - The program and its page file are BUILT, into the project's build folder (epic `people-and-orgs` P11).
 *   - The app names that folder inside the checkout's `build/`,
 *     and `spell_quart.built_folder()` finds that checkout's (J33):  so no path climbs out of the app's folder.
 * - Run it:  `uv run python Solitaire.app.py`, then open http://localhost:5000 (or `$PORT`).
 * - Compiling again rewrites it only while nobody has edited it:  its first line holds a hash of the rest (J45).
 *   See `isUneditedApp()`.
 */

/** What `quartApp()` writes into the app. */
export type QuartAppSpec = {
  /** The project's name, e.g. `Solitaire`:  the page's title. */
  projectName: string
  /** The compiled program's file, in `outputs`, e.g. `Solitaire.spell.py`. */
  program: string
  /** The program's drawing half, in `outputs`, e.g. `Solitaire.elements.spell.js`. */
  elements: string
  /**
   * The folder holding `program` and `elements`, `/`-separated:
   * - the project's build folder, inside the checkout's `build/`, e.g. `spaces/@spell/examples/solitaire`
   *   - the project index's `buildFolder`
   *   - `spell_quart.built_folder()` finds it
   * - `.`:  beside the app, e.g. in `spell run`'s temp folder, or for a project outside the checkout
   */
  outputs: string
  /**
   * Each project the program imports:  the module its drawing half imports it as, and its drawing half's file,
   * which must sit in `outputs` too, e.g. `{ "@spell/project/@spell/library/cards": "Cards.elements.spell.js" }`.
   */
  projects?: Record<string, string>
}

/**
 * End of a drawing half's file's name, which its route matches, e.g. `Solitaire.elements.spell.js`.
 * - `SP.ELEMENTS_JS_SUFFIX`, which `$/py` can't import:  `spell` imports us.
 */
const ELEMENTS_SUFFIX = ".elements.spell.js"

/** Start of an app's first line, before its hash:  see `isUneditedApp()`. */
const HASH_LINE = "# Written by spell compile, hash "

/** The app for `spec`, its first line holding the hash of the rest -- see the file's docs. */
export function quartApp({ projectName, program, elements, outputs, projects = {} }: QuartAppSpec): string {
  const files = [elements, ...Object.values(projects)]
  const pageProjects = Object.entries(projects).map(([module, file]) => `        ${py(module)}: ${py(`/${file}`)},`)
  const body = `"""${projectName}, as a web app:  \`uv run python ${projectName}.app.py\`, then open http://localhost:5000.

- The program runs here, in Python, a game per visitor:  their clicks come up the WebSocket, \`/ws\`,
  and what each changed goes back down to their page, which draws it.
- Written by \`spell compile --target py\`.  Edit it as you like:  once you do, compiling again leaves it be.
"""

import os
from pathlib import Path

from quart import Quart, make_response, request, send_from_directory, websocket

from spell_quart import ${importsOf(outputs)}

HERE = Path(__file__).parent
${outputsLine(outputs)}

app = Quart(__name__)

# a game per visitor, each running ${program}
sessions = SpellSessions(OUTPUTS / ${py(program)})


@app.get("/")
async def page():
    """The page:  it loads the program's drawing half, and plays over the WebSocket."""
    projects = ${pageProjects.length ? `{\n${pageProjects.join("\n")}\n    }` : "{}"}
    html = page_html(${py(projectName)}, elements=${py(`/${elements}`)}, projects=projects)
    return remember_visitor(await make_response(html), visitor_of(request))


@app.get("/<name>${ELEMENTS_SUFFIX}")
async def elements(name: str):
    """The program's drawing half, and each imported project's."""
    if f"{name}${ELEMENTS_SUFFIX}" not in ${py(files)}:
        return "Not found", 404
    return fresh(await send_from_directory(OUTPUTS, f"{name}${ELEMENTS_SUFFIX}", mimetype="text/javascript"))


@app.get(f"{ASSETS_URL}/<path:path>")
async def assets(path: str):
    """The javascript core, Solid, Spell UI and Semantic UI."""
    return fresh(await send_from_directory(assets_folder(), path))


@app.websocket("/ws")
async def ws():
    """The page's WebSocket:  its clicks up, the state and what changed down."""
    await sessions.serve(websocket, visitor_of(websocket))


# Your own routes go here, e.g.:
#
# @app.get("/scores")
# async def scores():
#     return {"best": 100}


if __name__ == "__main__":
    # $PORT, if set:  5000 is often taken on a Mac (AirPlay)
    # no reloader:  a restart ends every visitor's game, and Quart's restarts this as a module it can't find
    app.run(port=int(os.environ.get("PORT", "5000")), use_reloader=False)
`
  return `${HASH_LINE}${hashOf(body)}:  edit below, and compiling again leaves this file be.\n${body}`
}

/**
 * Is `text` an app `quartApp()` wrote, unedited since:  its first line's hash still that of the rest?
 * - Nothing there (`undefined`, or empty), too:  compiling writes it.
 */
export function isUneditedApp(text: string | undefined): boolean {
  if (!text) return true
  const newline = text.indexOf("\n")
  const first = text.slice(0, newline)
  if (newline < 0 || !first.startsWith(HASH_LINE)) return false
  return first.slice(HASH_LINE.length).startsWith(`${hashOf(text.slice(newline + 1))}:`)
}

/**
 * The app's line saying where the program and its page file are, `OUTPUTS`:
 * beside it, or `outputs` in the checkout's build folder (`built_folder()`).
 */
function outputsLine(outputs: string): string {
  if (outputs === ".") return "# the compiled program and its page file:  beside this app\nOUTPUTS = HERE"
  return `# the compiled program and its page file:  where \`spell compile\` builds them, in this checkout's build/\nOUTPUTS = built_folder(${py(outputs)})`
}

/** What the app imports from `spell_quart`:  `built_folder` only when its program is in the build folder. */
function importsOf(outputs: string): string {
  const names = ["ASSETS_URL", "SpellSessions", "assets_folder", ...(outputs === "." ? [] : ["built_folder"])]
  return [...names, "fresh", "page_html", "remember_visitor", "visitor_of"].join(", ")
}

/** `text`'s hash:  FNV-1a, 32 bits, in hex -- enough to tell an edit, in a browser as in node. */
function hashOf(text: string): string {
  let hash = 0x811c9dc5
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, "0")
}

/** `value` as Python writes it, text or a list of it:  JSON's quoting, a space after each comma. */
function py(value: unknown): string {
  return Array.isArray(value) ? `[${value.map(py).join(", ")}]` : JSON.stringify(value)
}
