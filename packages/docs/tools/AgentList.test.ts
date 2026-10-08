/**
 * Tests of `AgentList`:  where the list lives (epic, worktree, main), the name prefix, add / set / done, and the file
 * going once the list is empty.  In scratch checkouts.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, describe, expect, test } from "vite-plus/test"

import { AgentList, AgentListError } from "./AgentList"

const SCRATCH = realpathSync(mkdtempSync(join(tmpdir(), "agent-list-")))
afterAll(() => rmSync(SCRATCH, { recursive: true, force: true }))

/** A scratch checkout:  `main`'s root, or worktree `name`'s, with that epic's plan doc when `epic` is set. */
function checkout(worktree?: string, { epic = false } = {}): string {
  const root = worktree ? join(SCRATCH, "repo", ".claude", "worktrees", worktree) : join(SCRATCH, "repo")
  mkdirSync(root, { recursive: true })
  if (epic && worktree) {
    mkdirSync(join(root, "epics", worktree), { recursive: true })
    writeFileSync(join(root, "epics", worktree, `${worktree}.plan.html`), "<!doctype html>")
  }
  return root
}

describe("where the list lives", () => {
  test("a worktree with its epic's plan doc:  the epic's folder, named for the epic", () => {
    const root = checkout("big", { epic: true })
    const list = new AgentList(root)
    expect(list.file).toBe(join(root, "epics", "big", "agents.json"))
    expect(list.prefix).toBe("big")
  })

  test("a worktree with no epic:  its root, named for the worktree", () => {
    const root = checkout("plain")
    const list = new AgentList(root)
    expect(list.file).toBe(join(root, ".spell-agents.json"))
    expect(list.prefix).toBe("plain")
  })

  test("the main checkout:  its root, `main`;  `--epic` picks an epic's list", () => {
    const root = checkout()
    expect(new AgentList(root).prefix).toBe("main")
    expect(new AgentList(root).file).toBe(join(root, ".spell-agents.json"))
    expect(new AgentList(root, { epic: "seo" }).file).toBe(join(root, "epics", "seo", "agents.json"))
    expect(new AgentList(root, { epic: "seo" }).prefix).toBe("seo")
  })
})

describe("redirects", () => {
  test("forPlanDoc():  the list beside a plan doc, named for its epic", () => {
    const root = checkout("doc", { epic: true })
    const list = AgentList.forPlanDoc(join(root, "epics", "doc", "doc.plan.html"))
    expect(list.file).toBe(join(root, "epics", "doc", "agents.json"))
    expect(list.prefix).toBe("doc")
  })

  test("redirect() adds an untold note;  told() marks them;  empty and long notes, and unknown agents, throw", async () => {
    const list = new AgentList(checkout("steer", { epic: true }))
    list.add("aaa", "docstrings")
    await list.redirect("aaa", "only the exported ones")
    await list.redirect("steer-aaa", "and skip the tests")
    expect(list.untold.map((it) => it.note)).toEqual(["only the exported ones", "and skip the tests"])
    expect(list.told("aaa")).toBe(2)
    expect(list.untold).toEqual([])
    expect(list.told("aaa")).toBe(0)
    await expect(list.redirect("aaa", " \n ")).rejects.toThrow(/empty note/)
    await expect(list.redirect("aaa", "x".repeat(4001))).rejects.toThrow(/over 4000/)
    await expect(list.redirect("bbb", "x")).rejects.toThrow(AgentListError)
    list.done("aaa")
  })
})

describe("names", () => {
  test("prefixed once", () => {
    const list = new AgentList(checkout("names"))
    expect(list.fullName("aaa")).toBe("names-aaa")
    expect(list.fullName("names-aaa")).toBe("names-aaa")
  })
})

describe("add, set, done", () => {
  const list = new AgentList(checkout("work", { epic: true }))

  test("add writes an entry with its full name, status and start", () => {
    const entry = list.add("aaa", "docstrings in string.ts", { taskId: "t1" })
    expect(entry).toMatchObject({ name: "work-aaa", task: "docstrings in string.ts", status: "active", taskId: "t1" })
    expect(Date.parse(entry.started)).not.toBeNaN()
    expect(JSON.parse(readFileSync(list.file, "utf8"))).toEqual([entry])
  })

  test("a running name can't be added again;  a status must be one it knows", () => {
    expect(() => list.add("work-aaa", "again")).toThrow(AgentListError)
    expect(() => list.add("bbb", "x", { status: "waiting" })).toThrow(/isn't `active` or `blocked on <name>`/)
  })

  test("set changes the status, by short or full name", () => {
    list.add("bbb", "waits for aaa", { status: "blocked on work-aaa" })
    expect(list.set("bbb", { status: "active" }).status).toBe("active")
    expect(list.set("work-bbb", { taskId: "t2" }).taskId).toBe("t2")
  })

  test("set leaves a field it isn't given alone, even passed as undefined (the CLI's missing flag)", () => {
    const entry = list.set("aaa", { status: undefined, taskId: "t1" })
    expect(entry).toMatchObject({ status: "active", taskId: "t1" })
  })

  test("done takes it off;  an unknown name throws, naming the ones running", () => {
    expect(list.done("aaa").name).toBe("work-aaa")
    expect(() => list.done("aaa")).toThrow(/running:  work-bbb/)
    expect(list.agents.map((it) => it.name)).toEqual(["work-bbb"])
  })

  test("the file goes with the last agent", () => {
    list.done("bbb")
    expect(existsSync(list.file)).toBe(false)
    expect(list.agents).toEqual([])
  })
})
