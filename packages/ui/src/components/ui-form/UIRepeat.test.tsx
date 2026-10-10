import { describe, expect, test } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"

import { E } from "$/ui/core"
import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"

import "$/ui/components/ui-form"
import "$/ui/components/ui-input"
import "$/ui/components/ui-checkbox"

////////////////
// ## Fixtures
////////////////

/** One task:  reactive members. */
class Task {
  @E.state accessor title: string
  @E.state accessor completed = false
  @E.state accessor steps: Task[] = []

  constructor(title: string) {
    this.title = title
  }
}

/** A to-do list:  its `tasks` a reactive member, replaced (never changed in place) to change the list. */
class TodoList {
  @E.state accessor tasks: Task[] = []
}

/** A list that is only iterable, as spell's `List` is to the repeat. */
class Bag {
  constructor(private readonly items: Task[]) {}

  *[Symbol.iterator]() {
    yield* this.items
  }
}

/** A `<ui-form>` DOM element, as these tests use it. */
type Form = HTMLElement & { value: unknown }

/** A text control's DOM element. */
type Control = HTMLElement & { value: string; selected?: boolean }

/** A row per task:  a checkbox and a title, side by side. */
const TASK_ROW = `<ui-fields>
  <ui-field width="2"><ui-checkbox name="completed" aria-label="Done"></ui-checkbox></ui-field>
  <ui-field width="14"><ui-input name="title" aria-label="Title"></ui-input></ui-field>
</ui-fields>`

/** A form bound to `value`, its `<form>` holding `content`. */
async function bound(content: string, value: unknown) {
  const host = await ElementFixture.render<Form>(`<ui-form><form>${content}</form></ui-form>`)
  host.value = value
  await settle()
  const repeat = host.querySelector("ui-repeat")!
  return { host, repeat, native: host.querySelector("form")! }
}

/** Let rows come, controls bind and values show:  mutations, microtasks, Solid flushes. */
async function settle() {
  for (let round = 0; round < 4; round++) await ElementFixture.tick()
  await ElementFixture.settle()
}

/** The row elements of `repeat` (its `<ui-fields>`), in order. */
function rows(repeat: Element): Element[] {
  return [...repeat.querySelectorAll(":scope > ui-fields")]
}

/** The titles the rows show. */
function titles(repeat: Element): string[] {
  return rows(repeat).map((row) => row.querySelector<Control>("[name=title]")!.value)
}

////////////////
// ## Tests
////////////////

describe("<ui-repeat>", () => {
  test("repeats its template once per item, each row's controls bound to ITS item", async () => {
    const list = new TodoList()
    const [milk, eggs] = [new Task("Milk"), new Task("Eggs")]
    eggs.completed = true
    list.tasks = [milk, eggs]
    const { repeat } = await bound(`<ui-repeat name="tasks">${TASK_ROW}</ui-repeat>`, list)
    expect(titles(repeat)).toEqual(["Milk", "Eggs"])
    expect(rows(repeat).map((row) => row.querySelector<Control>("[name=completed]")!.selected)).toEqual([false, true])
    const eggsTitle = rows(repeat)[1]!.querySelector("[name=title]")!
    await userEvent.type(eggsTitle.shadowRoot!.querySelector("input")!, "!")
    await settle()
    expect([milk.title, eggs.title]).toEqual(["Milk", "Eggs!"])
    expect(document.activeElement).toBe(eggsTitle)
    milk.title = "Oat milk"
    await settle()
    expect(titles(repeat)).toEqual(["Oat milk", "Eggs!"])
  })

  test("keeps each item's row:  items added, removed and moved add, remove and move only their own nodes", async () => {
    const list = new TodoList()
    const [a, b, c] = [new Task("A"), new Task("B"), new Task("C")]
    list.tasks = [a, b]
    const { repeat } = await bound(`<ui-repeat name="tasks">${TASK_ROW}</ui-repeat>`, list)
    const [rowA, rowB] = rows(repeat)
    list.tasks = [a, b, c]
    await settle()
    expect(rows(repeat).slice(0, 2)).toEqual([rowA, rowB])
    expect(titles(repeat)).toEqual(["A", "B", "C"])
    const rowC = rows(repeat)[2]!
    list.tasks = [a, c]
    await settle()
    expect(rows(repeat)).toEqual([rowA, rowC])
    expect(rowB!.isConnected).toBe(false)
    const titleC = rowC.querySelector<HTMLElement>("[name=title]")!
    titleC.focus()
    list.tasks = [c, a]
    await settle()
    expect(rows(repeat)).toEqual([rowC, rowA])
    expect(document.activeElement).toBe(titleC)
    expect(repeat.lastElementChild!.localName).toBe("template")
  })

  test("shows nothing for an empty or missing list;  a `<template>` child is the template", async () => {
    const list = new TodoList()
    const { host, repeat } = await bound(
      `<ui-repeat name="tasks"><template>${TASK_ROW}</template></ui-repeat><ui-repeat name="nothing">${TASK_ROW}</ui-repeat>`,
      list
    )
    expect(repeat.children.length).toBe(1)
    expect(host.querySelectorAll("ui-fields").length).toBe(0)
    list.tasks = [new Task("Only")]
    await settle()
    expect(titles(repeat)).toEqual(["Only"])
  })

  test("repeats over any iterable, e.g. one that only has `[Symbol.iterator]` (spell's `List`)", async () => {
    const { repeat } = await bound(`<ui-repeat name="tasks">${TASK_ROW}</ui-repeat>`, {
      tasks: new Bag([new Task("X"), new Task("Y")])
    })
    expect(titles(repeat)).toEqual(["X", "Y"])
  })

  test("a repeat inside a row reads its list from that row's item", async () => {
    const list = new TodoList()
    const [trip, party] = [new Task("Trip"), new Task("Party")]
    trip.steps = [new Task("Pack"), new Task("Go")]
    party.steps = [new Task("Invite")]
    list.tasks = [trip, party]
    const { repeat } = await bound(
      `<ui-repeat name="tasks"><section><ui-input name="title" aria-label="Task"></ui-input>` +
        `<ui-repeat name="steps"><ui-input name="title" aria-label="Step"></ui-input></ui-repeat></section></ui-repeat>`,
      list
    )
    const steps = [...repeat.querySelectorAll(":scope > section")].map((section) =>
      [...section.querySelectorAll<Control>(":scope ui-repeat [name=title]")].map((input) => input.value)
    )
    expect(steps).toEqual([["Pack", "Go"], ["Invite"]])
    const go = repeat.querySelectorAll<Control>("ui-repeat ui-repeat [name=title]")[1]!
    await userEvent.type(go.shadowRoot!.querySelector("input")!, "!")
    await settle()
    expect(trip.steps.map((step) => step.title)).toEqual(["Pack", "Go!"])
  })

  test("its rows are light DOM:  the native form submits their controls;  axe passes", async () => {
    const list = new TodoList()
    list.tasks = [new Task("Milk"), new Task("Eggs")]
    const { host, native } = await bound(`<ui-repeat name="tasks">${TASK_ROW}</ui-repeat>`, list)
    expect([...new FormData(native)].filter(([name]) => name === "title")).toEqual([
      ["title", "Milk"],
      ["title", "Eggs"]
    ])
    await expectAccessible(host)
  })
})
