/**
 * New epics from the Epics page, on the page server:  a ROUTE MODULE (`$/server/page`'s `RouteModule`), listed in the
 * repo root's `package.json` `"pageServer": { "routes": [...] }` (epic `airplane` P7).
 * - Owen writes an idea down on the Epics page (`epics/index.html`'s New epic button, the docs runtime's "New epic"):
 *   a title and the kickoff prompt.  No Claude needed, so it works on a plane.
 * - It becomes a FUTURE epic at once, as `/epic future` makes one (`spell dev plan-doc new <name> --future`):  the
 *   stub plan doc with the prompt quoted, listed in the Epics index with its seedling;  its log says it came from
 *   the page (`FROM_PAGE`), which is how `/airplane land` finds the ones to offer (`AirplaneInbox`)
 * - `POST /api/epics/new` `{ title, prompt }` -- answers `{ name, page }`, the new plan doc's URL path
 *   - `name`:  the title, lower-kebab-cased (`Docs Index` -> `docs-index`);  taken, `-2`, `-3` ...
 *   - 400:  no title, or nothing to name it by
 * - each needs the page server's token (`x-server-token`) and its own origin (`SRV.Guard`)
 */
import { existsSync } from "node:fs"
import { join } from "node:path"

import { SRV } from "$/server"
import type { RouteModule } from "$/server/page"

import { PlanDocCommands } from "./PlanDocCommands"
import { PlanDocFiles } from "./PlanDocFiles"

/** Where the route lives. */
const API = "/api/epics/new"

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
  }
}

export default epicRoutes

/**
 * Make a future epic called `title` in checkout `root`, `prompt` its kickoff prompt;  resolves to its name.
 * - SIDE EFFECT:  writes `epics/<name>/` and the docs index, as `spell dev plan-doc new --future` does
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

/** `name`, or `name-2`, `name-3` ... when `epics/<name>/` is taken. */
function freeName(epics: string, name: string): string {
  let free = name
  for (let n = 2; existsSync(join(epics, free)); n++) free = `${name}-${n}`
  return free
}
