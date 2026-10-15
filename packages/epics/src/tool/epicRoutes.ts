/**
 * The Epics page's writes, on the page server:  a ROUTE MODULE (`$/server/page`'s `RouteModule`).
 * - listed in the repo root's `package.json`, `"pageServer": { "routes": [...] }`
 *
 * NEW EPIC (epic `airplane` P7):
 * - Owen writes an idea down on the Epics page:  a title and the kickoff prompt.
 *   - its New epic button (`epics/index.html`), the docs runtime's "New epic"
 *   - no Claude needed, so it works on a plane
 * - It becomes a FUTURE epic at once, as `/epic future` makes one (`spell dev plan-doc new <name> --future`):
 *   - the stub epic page with the prompt quoted, listed on the Epics list page with its seedling
 *   - its log says it came from the page (`FROM_PAGE`),
 *     which is how `/airplane land` finds the ones to offer (`AirplaneInbox`)
 * - `POST /api/epics/new` `{ title, prompt }` -- answers `{ name, page }`, the new epic page's URL path
 *   - `name`:  the title, lower-kebab-cased (`Docs Index` -> `docs-index`);  taken, `-2`, `-3` ...
 *   - 400:  no title, or nothing to name it by
 *
 * FAVORITES:  a card's star, clicked on the Epics page (the docs runtime's "Favorite epics").
 * - epic `airplane` P8, Owen 2026-10-10:
 *   "Add a "favorite" icon in the top-right of the epics cards.  Sort those first."
 * - `POST /api/epics/favorite` `{ name, favorite }` -- stars (`true`) or unstars epic `name`;
 *   answers `{ favorites }`, every starred epic's name, sorted
 *   - 400:  no name, or not an epic's name (lower-kebab-case);  `favorite` not a boolean
 * - stored in ONE shared file, `epics/favorites.json` (`$/epics/list/EpicCards` `FAVORITES_FILE`), a JSON list:
 *   every checkout reads the same one, and the shared repo commits it after the turn
 * - each card goes in its group by it as the page server serves the Epics page (`$/epics/list/RunningEpics`);
 *   `spell dev docs index` writes the stars and groups it says into the page
 * - no Claude needed:  it works on a plane
 *
 * Each needs the page server's token (`x-server-token`) and its own origin (`SRV.Guard`).
 *
 * SEE ALSO (Owen, 2026-10-13:  "There is no easy way to get to a "decisions" or "details" pages from an epic"):  the
 * pages an epic made or leans on, which `<epic-page>` lists in its See Also box, above the Overview
 * - `GET /api/epics/pages?epic=<name>` -- answers `{ pages }`:  each `{ href, title, kind, updated }` (`SeeAlso`)
 *   - its guide (`durable`), its own pages in `epics/<name>/details/` (`details`, `choices`), newest first,
 *     then every guide its epic page and part files link to (`guide`:  epic `epic-workflow` P13), newest first
 *   - `href` from the epic page's folder (`details/analysis.html`), `title` the page's `<title>`
 *   - gathered when asked:  a page made or linked a moment ago is there, one deleted is gone;  nothing to keep up
 *   - a read, so no token;  400 for a name that isn't an epic's, `{ pages: [] }` for one with no such folder
 */
import { existsSync } from "node:fs"
import { join } from "node:path"

import { SRV } from "$/server"
import type { RouteModule } from "$/server/page"
import { FAVORITES_FILE, parseFavorites } from "$/epics/list/EpicCards"

import { PlanDocCommands } from "./PlanDocCommands"
import { PlanDocFiles } from "./PlanDocFiles"
import { SeeAlso } from "./SeeAlso"

/** Where the routes live. */
const API = "/api/epics/new"
const FAVORITE_API = "/api/epics/favorite"
const PAGES_API = "/api/epics/pages"

/** Biggest body accepted:  a kickoff prompt is a few paragraphs. */
const MAX_BODY = 64 * 1024

/** The log line of an epic made from the page:  `/airplane land` offers each one to start. */
export const FROM_PAGE = "Made from the Epics page (New epic)"

const epicRoutes: RouteModule = {
  name: "epics",
  setup({ root, router, guard }) {
    router.post(API, guard.writeCheck, SRV.parseBodies({ limit: MAX_BODY }), async (request, reply) => {
      const { title, prompt } = (request.body ?? {}) as { title?: unknown; prompt?: unknown }
      if (typeof title !== "string" || !title.trim()) throw new SRV.HttpError(400, "no title")
      const name = await newEpic(root, title.trim(), typeof prompt === "string" ? prompt : "")
      reply.json({ name, page: `/epics/${name}/${name}.plan.html` })
    })
    router.post(FAVORITE_API, guard.writeCheck, SRV.parseBodies({ limit: MAX_BODY }), async (request, reply) => {
      const { name, favorite } = (request.body ?? {}) as { name?: unknown; favorite?: unknown }
      if (typeof name !== "string" || typeof favorite !== "boolean")
        throw new SRV.HttpError(400, "send { name, favorite }:  an epic's name, and true or false")
      reply.json({ favorites: await setFavorite(root, name, favorite) })
    })
    router.get(PAGES_API, (request, reply) => {
      const name = String(request.query.epic ?? "")
      if (!EPIC_NAME.test(name)) throw new SRV.HttpError(400, `not an epic's name:  "${name}"`)
      reply.set("Cache-Control", "no-store").json({ pages: new SeeAlso(root).linksOf(name) })
    })
  }
}

export default epicRoutes

/**
 * Make a future epic called `title` in checkout `root`, `prompt` its kickoff prompt;  resolves to its name.
 * - SIDE EFFECT:  writes `epics/<name>/` and the Epics list page, as `spell dev plan-doc new --future` does
 * - throws `HttpError(400)` when the title holds nothing to name it by, `500` when the tool fails
 */
export async function newEpic(root: string, title: string, prompt: string): Promise<string> {
  const files = new PlanDocFiles({ root })
  const name = freeName(files.epics, epicName(title))
  const commands = new PlanDocCommands({ files })
  // the tool prints what it wrote;  here that goes nowhere
  commands.print = () => {}
  for (const argv of [
    ["new", name, "--future", "--title", title, "--prompt", prompt],
    ["log", name, FROM_PAGE]
  ])
    if ((await commands.run(argv)) !== 0) throw new SRV.HttpError(500, `couldn't make epic ${name}`)
  return name
}

/** `title`, lower-kebab-cased, as `/epic` names an epic (`Docs Index` -> `docs-index`);  at most 40 characters. */
export function epicName(title: string): string {
  const name = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40)
    .replace(/^-+|-+$/g, "")
  if (!name) throw new SRV.HttpError(400, `nothing to name an epic by in "${title}"`)
  return RESERVED.has(name) ? `${name}-epic` : name
}

/** The first words `/epic` takes as a verb, never an epic's name (`.claude/skills/epic/SKILL.md`, "1. Name"). */
const RESERVED = new Set(["review", "resume", "color", "future", "phase", "start"])

/**
 * Star (`favorite`) or unstar epic `name` in checkout `root`'s favourites (`FAVORITES_FILE`);
 * resolves to every starred epic's name after, sorted.
 * - SIDE EFFECT:  writes the file through the page server's one safe write (`SRV.FileOperations.save()`:
 *   read and written under its lock, all at once)
 * - throws `HttpError(400)` when `name` isn't an epic's name (lower-kebab-case, as `epicName()` makes them)
 */
export async function setFavorite(root: string, name: string, favorite: boolean): Promise<string[]> {
  if (!EPIC_NAME.test(name)) throw new SRV.HttpError(400, `not an epic's name:  "${name}"`)
  let list: string[] = []
  await SRV.FileOperations.save(join(root, FAVORITES_FILE), (current) => {
    const favorites = parseFavorites(current || undefined)
    if (favorite) favorites.add(name)
    else favorites.delete(name)
    list = [...favorites].sort()
    return `${JSON.stringify(list, null, 2)}\n`
  })
  return list
}

/** An epic's name:  lower-kebab-case, as `epicName()` makes them and the epics' folders are called. */
const EPIC_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** `name`, or `name-2`, `name-3` ... when `epics/<name>/` is taken. */
function freeName(epics: string, name: string): string {
  let free = name
  for (let n = 2; existsSync(join(epics, free)); n++) free = `${name}-${n}`
  return free
}
