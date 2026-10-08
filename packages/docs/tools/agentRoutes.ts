/**
 * An epic's running agents, on the page server (epic `skillz`, P3):  a ROUTE MODULE (`$/server/page`'s
 * `RouteModule`), listed in the repo root's `package.json` `"pageServer": { "routes": [...] }`.
 * - The plan doc shows them in its "Agents running" box (`<epic-page>`, `packages/epics`), each with a note box:
 *   Owen's note REDIRECTS that agent.  It waits in the list (`AgentList.ts`) until a Claude session waiting on it
 *   (`spell dev agents wait`) passes it on, and marks it told.
 * - `page`:  the plan doc's URL path, as it was served (`/epics/x/x.plan.html`, or a worktree's
 *   `/worktrees/<w>/...`);  ONLY a plan doc:  anything else is a 403 (`$/epics/tool/reviewRoutes.ts` `planDoc()`)
 * - `GET /api/agents?page=<path>` -- `{ agents }`:  the epic's list (`[]` when none run);  the page polls it
 * - `POST /api/agents/redirect` `{ page, name, note }` -- Owen's note for agent `name`;  answers `{ agents }`, the
 *   list after.  400:  an empty or long note, or no such agent running.
 * - writes:  under the list's lock, atomic (`AgentList`);  each needs the page server's token (`x-server-token`) and
 *   its own origin (`SRV.Guard`), as the review routes' do
 */
import { SRV } from "$/server"
import type { RouteModule } from "$/server/page"

import { planDoc } from "$/epics/tool/reviewRoutes"

import { AgentList, AgentListError } from "./AgentList"

/** Where the routes live. */
const API = "/api/agents"

/** Biggest body accepted:  a note is a few paragraphs (`AgentList`'s cap is 4000 characters). */
const MAX_BODY = 32 * 1024

const agentRoutes: RouteModule = {
  name: "agents",
  setup({ router, guard, web }) {
    const api = new SRV.Router()
    api.get("/", (request, reply) => {
      const list = AgentList.forPlanDoc(planDoc(web.files, request.query.page))
      reply.set("Cache-Control", "no-store").json({ agents: list.agents })
    })
    api.use(guard.writeCheck, SRV.parseBodies({ limit: MAX_BODY }))
    api.post("/redirect", async (request, reply) => {
      const body = request.body as { page?: unknown; name?: unknown; note?: unknown }
      const list = AgentList.forPlanDoc(planDoc(web.files, body.page))
      if (typeof body.name !== "string" || typeof body.note !== "string") {
        throw new SRV.HttpError(400, "redirect:  needs a `name` and a `note`")
      }
      try {
        reply.json({ agents: await list.redirect(body.name, body.note) })
      } catch (error) {
        if (error instanceof AgentListError) throw new SRV.HttpError(400, error.message)
        throw error
      }
    })
    router.use(API, api)
  }
}

export default agentRoutes
