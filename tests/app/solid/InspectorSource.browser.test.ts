import { describe, expect, test } from "vite-plus/test"

import { handlersInSource } from "spell-app/app/solid/InspectorSource"

/**
 * `handlersInSource()`:  the handlers an element was written with, found in the program's spell by its tag,
 * words and attributes.
 */

const SOURCE = `
to draw it:
	return <div>
		<ui-button onClick={set its percent to 15}>15%</ui-button>
		<ui-button onClick={set its percent to 18}>18%</ui-button>
		<ui-button appearance="basic" icon="plus" onClick={add someone}>Add someone</ui-button>
		<ui-button part="remove" icon="close" appearance="basic" aria-label="Remove" onClick={remove it}/>
	</div>
`

/** A `<tag>` element with `attributes` and `words`, as the page draws it. */
function drawn(tag: string, attributes: Record<string, string>, words = ""): Element {
  const element = document.createElement(tag)
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value)
  element.textContent = words
  return element
}

describe("handlersInSource()", () => {
  test("finds the tag with the same words:  its handlers, by event", () => {
    expect(handlersInSource(drawn("ui-button", {}, "18%"), [SOURCE])).toEqual({ click: "set its percent to 18" })
    expect(
      handlersInSource(drawn("ui-button", { appearance: "basic", icon: "plus" }, "Add someone"), [SOURCE])
    ).toEqual({
      click: "add someone"
    })
  })

  test("a tag with no words:  by the attributes it has in common", () => {
    const remove = drawn("ui-button", { part: "remove", icon: "close", appearance: "basic", "aria-label": "Remove" })
    expect(handlersInSource(remove, [SOURCE])).toEqual({ click: "remove it" })
  })

  test("nothing that matches:  nothing", () => {
    expect(handlersInSource(drawn("ui-button", {}, "Pay"), [SOURCE])).toEqual({})
    expect(handlersInSource(drawn("ui-input", {}), [SOURCE])).toEqual({})
  })
})
