/**
 * Links to sagas, epics, phases and items, on the page server (epic `epic-workflow` P15, J32):  a ROUTE MODULE
 * (`$/server/page`'s `RouteModule`), listed in the repo root's `package.json` `"pageServer": { "routes": [...] }`.
 *
 * TYPED ADDRESSES:  `/saga/<saga>[/<epic>]` redirects to the page, and the browser keeps the `#id`:
 * - `/saga/drawable-spell` -> `/sagas/drawable-spell/drawable-spell.saga.html`
 * - `/saga/drawable-spell/python-target#T1` -> `/epics/python-target/python-target.plan.html#T1`, where the docs
 *   runtime lands on `#t1` (ids in any case)
 * - the same under `/worktrees/<w>/`, which stays in front
 * - 404, saying why, when the page isn't there;  an epic under a saga it doesn't name still goes (the link check
 *   minds, not the click)
 *
 * WHAT A LINK POINTS AT, for `<epic-link>` on another page:  its title for the tooltip, and its short form
 * - `GET /api/epics/target?saga=&epic=&item=&phase=` -- answers `TargetAnswer`:  `{ href, title, label, found }`,
 *   `href` from the checkout's root (`EpicTargets`)
 * - 400 for attributes that aren't an address (a bad name, an item AND a phase)
 * - a read:  no token
 */
import { SRV } from "$/server"
import type { RouteModule } from "$/server/page"

import { EpicAddress, TARGET_API } from "$/epics/links"

import { EpicTargets } from "./EpicTargets"

const linkRoutes: RouteModule = {
  name: "links",
  setup({ root, router }) {
    const targets = new EpicTargets(root)
    router.get(TARGET_API, (request, reply) => {
      const [saga, epic, item, phase] = ["saga", "epic", "item", "phase"].map((name) => {
        const value = request.query[name]
        return typeof value === "string" && value ? value : undefined
      })
      let address: EpicAddress
      try {
        address = new EpicAddress({ saga, epic, item, phase })
      } catch (error) {
        throw new SRV.HttpError(400, (error as Error).message)
      }
      if (!address.page) throw new SRV.HttpError(400, "send a saga or an epic:  the page itself is the caller's")
      reply.set("Cache-Control", "no-store").json(targets.answerFor(address))
    })
    for (const pattern of ["/saga/*", "/worktrees/:worktree/saga/*"])
      router.get(pattern, (request, reply) => {
        const path = request.path
        const address = EpicAddress.fromPath(path)
        if (!address?.page) throw new SRV.HttpError(404, `not a saga's address:  ${path}`)
        const { found, problem } = targets.resolve(address)
        if (!found) throw new SRV.HttpError(404, problem ?? `nothing at ${path}`)
        const worktree = /^\/worktrees\/[^/]+/.exec(path)?.[0] ?? ""
        reply.redirect(`${worktree}/${address.page}`)
      })
  }
}

export default linkRoutes
