import { describe, test, expect } from "vite-plus/test"
import { Task, TaskList } from "$/util"

describe("TaskList.forEach", () => {
  test("reads a `list` function when it RUNS, so an earlier task can fill it", async () => {
    const items: string[] = []
    const seen: string[] = []
    const taskList = new TaskList({
      tasks: [
        new Task({ name: "fill", run: async () => void (items.length || items.push("a", "b")) }),
        TaskList.forEach({
          name: "each",
          list: () => items,
          getTask: (item: string) => new Task({ name: item, run: async () => void seen.push(item) })
        })
      ]
    })
    await taskList.start(undefined)
    expect(seen).toEqual(["a", "b"])

    items.push("c")
    await taskList.start(undefined)
    expect(seen).toEqual(["a", "b", "a", "b", "c"])
  })
})
