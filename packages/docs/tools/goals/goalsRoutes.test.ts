/**
 * Tests of goals' route module on a real page server, over HTTP.  Writes nothing:  every write is refused or
 * aimed at a target that doesn't exist.
 * - Run from the repo root:  `TSX_TSCONFIG_PATH=packages/docs/tsconfig.json node --import tsx --test packages/docs/tools/goals/goalsRoutes.test.ts`
 */
import assert from "node:assert/strict"
import { after, before, test } from "node:test"

import { PageServer } from "$/server/page"
import { ask } from "$/server/test/serve"

import { ROOT } from "./targets.js"

let server: PageServer
let port: number

before(async () => {
  process.env.GOALS_DRY_RUN = "1"
  server = await new PageServer({ root: ROOT }).start({ port: 0, pidFile: false })
  port = server.info.port
})

after(() => server.stop())

/** headers of a write from a page this server served */
function page(extra: Record<string, string> = {}) {
  return {
    "content-type": "application/json",
    "x-server-token": server.web.guard.token,
    origin: `http://127.0.0.1:${port}`,
    ...extra
  }
}

test("goals pages say the buttons work here;  docs pages don't", async () => {
  const goals = await ask(port, "GET", "/goals/index.html")
  assert.match(goals.text, /window\.GOALS_SERVER = \{"api":"\/api\/goals"\}/)
  assert.match(goals.text, /window\.SPELL_SERVER = /)
  const docs = await ask(port, "GET", "/pages/index.html")
  assert.equal(docs.status, 200)
  assert.doesNotMatch(docs.text, /GOALS_SERVER/)
})

test("Claude's status, without a token", async () => {
  const answer = await ask(port, "GET", "/api/goals/claude")
  assert.equal(answer.status, 200)
  assert.equal(typeof JSON.parse(answer.text).installed, "boolean")
})

test("writes need the token, our origin and our host", async () => {
  const body = JSON.stringify({ target: "spell", text: "x" })
  const noToken = await ask(port, "POST", "/api/goals/thought", {
    body,
    headers: { "content-type": "application/json" }
  })
  assert.equal(noToken.status, 403)
  const evil = await ask(port, "POST", "/api/goals/thought", { body, headers: page({ origin: "http://evil.example" }) })
  assert.equal(evil.status, 403)
  const rebound = await ask(port, "POST", "/api/goals/thought", { body, headers: page({ host: "evil.example" }) })
  assert.equal(rebound.status, 403)
})

test("goals' own errors keep their answers", async () => {
  const missing = await ask(port, "POST", "/api/goals/thought", {
    body: JSON.stringify({ target: "no-such-set/no-such-topic", text: "x" }),
    headers: page()
  })
  assert.equal(missing.status, 404)
  assert.ok(Array.isArray(JSON.parse(missing.text).choices))
  const skill = await ask(port, "POST", "/api/goals/run", {
    body: JSON.stringify({ skill: "rm", target: "spell" }),
    headers: page()
  })
  assert.equal(skill.status, 400)
  assert.match(JSON.parse(skill.text).error, /no skill/)
})
