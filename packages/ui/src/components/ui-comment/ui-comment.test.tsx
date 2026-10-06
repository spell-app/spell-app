import { describe, expect, it, onTestFinished } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"
import { Keys } from "$/ui/test/Keys"

import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"

import "$/ui/components/ui-comment"
import "$/ui/components/ui-form"
import "$/ui/components/ui-input"
import "$/ui/components/ui-button"
import "$/ui/components/ui-segment"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-comment/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A square picture. */
const AVATAR = `data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22/%3E`

/** One comment's parts. */
const PARTS =
  `<ui-avatar src="${AVATAR}"></ui-avatar><ui-content><ui-author href="#matt">Matt</ui-author>` +
  `<ui-meta><span>Today</span></ui-meta><ui-description>How artistic!</ui-description>` +
  `<ui-actions><button type="button">Reply</button></ui-actions></ui-content>`

/** A comment with a thread of one reply. */
const THREAD = `<ui-comment>${PARTS}<ui-comments><ui-comment>${PARTS}</ui-comment></ui-comments></ui-comment>`

/** Render a comment list;  returns it, its root and its comments. */
async function list(attributes = "", comments = `<ui-comment>${PARTS}</ui-comment><ui-comment>${PARTS}</ui-comment>`) {
  const host = await ElementFixture.render<UIHost>(`<ui-comments ${attributes}>${comments}</ui-comments>`)
  await ElementFixture.settle(host)
  return { host, root: rootOf(host), comments: [...host.querySelectorAll<UIHost>(":scope > ui-comment")] }
}

/** A list's, thread's or comment's root. */
function rootOf(host: Element): HTMLElement {
  return host.shadowRoot!.querySelector<HTMLElement>("[part~=comments], [part~=comment]")!
}

/** A part element's root. */
function partRoot(host: Element): HTMLElement {
  return host.shadowRoot!.firstElementChild as HTMLElement
}

/** Computed style. */
function style(element: Element): CSSStyleDeclaration {
  return getComputedStyle(element)
}

////////////////
// ## <ui-comments> classes and markup
////////////////

describe("<ui-comments> classes and markup", () => {
  it.each([
    ["", "ui comments"],
    ['size="small"', "ui small comments"],
    ["threaded minimal", "ui minimal threaded comments"],
    ["inverted disabled", "ui disabled inverted comments"],
    ['threaded="no" collapsed', "ui collapsed comments"]
  ])("<ui-comments %s>", async (attributes, classes) => {
    const { root } = await list(attributes)
    expect(root.className).toBe(classes)
  })

  it("renders comments as <article>s with :state(in-comments)", async () => {
    const { root, comments } = await list()
    expect(root.localName).toBe("div")
    for (const comment of comments) {
      expect(rootOf(comment).localName).toBe("article")
      expect(rootOf(comment).className).toBe("comment")
      expect(comment.matches(":state(in-comments)")).toBe(true)
    }
  })

  it("gives the content parts comment context:  the content beside the avatar", async () => {
    const { comments } = await list("", `<ui-comment>${PARTS}</ui-comment>`)
    const comment = comments[0]!
    for (const tag of ["ui-avatar", "ui-content", "ui-author", "ui-meta", "ui-description", "ui-actions"])
      expect(comment.querySelector(tag)!.matches(":state(in-comment)"), tag).toBe(true)
    const avatar = partRoot(comment.querySelector("ui-avatar")!)
    const content = partRoot(comment.querySelector("ui-content")!)
    expect(avatar.getBoundingClientRect().width).toBe(40)
    expect(style(content).marginLeft).toBe("56px")
    expect(style(partRoot(comment.querySelector("ui-author")!)).fontWeight).toBe("700")
  })

  it("spaces comments, not before the first", async () => {
    const { comments } = await list()
    expect(style(rootOf(comments[0]!)).marginTop).toBe("0px")
    expect(style(rootOf(comments[1]!)).marginTop).toBe("8px")
    expect(style(rootOf(comments[1]!)).paddingTop).toBe("8px")
  })
})

////////////////
// ## Outside a list
////////////////

describe("<ui-comment> outside a list", () => {
  it("a LONE comment has its defaults:  line height 1.2", async () => {
    const comment = await ElementFixture.render<UIHost>(`<ui-comment>${PARTS}</ui-comment>`)
    await ElementFixture.settle(comment)
    expect(comment.matches(":state(in-comments)")).toBe(false)
    expect(parseFloat(style(rootOf(comment)).lineHeight)).toBeCloseTo(1.2 * 16, 1)
  })
})

////////////////
// ## <ui-comments> tokens from outside
////////////////

describe("<ui-comments> tokens from outside", () => {
  /** The second comment's top margin, in `host`. */
  function distance(host: Element): string {
    return getComputedStyle(rootOf(host.querySelectorAll(":scope > ui-comment")[1]!)).marginTop
  }

  it("takes a token set on the HOST", async () => {
    const { host } = await list(`style="--ui-comment-distance: 20px"`)
    expect(distance(host)).toBe("20px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-comment-distance: 20px"><ui-comments><ui-comment>${PARTS}</ui-comment>` +
        `<ui-comment>${PARTS}</ui-comment></ui-comments></section>`
    )
    expect(distance(wrapper.querySelector("ui-comments")!)).toBe("20px")
  })

  it("takes a token set through `::part(comments)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(comments) { --ui-comment-distance: 20px }</style><ui-comments class="themed">` +
        `<ui-comment>${PARTS}</ui-comment><ui-comment>${PARTS}</ui-comment></ui-comments></div>`
    )
    expect(distance(wrapper.querySelector("ui-comments")!)).toBe("20px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-comment-distance", "20px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-comment-distance")
    })
    const { host } = await list()
    expect(distance(host)).toBe("20px")
  })

  it("owner tokens:  a part look token set on the list reaches an author", async () => {
    const red = "rgb(255, 0, 0)"
    const { comments } = await list(`style="--ui-comment-author-color: ${red}"`)
    const author = comments[0]!.querySelector("ui-author")!.shadowRoot!.firstElementChild!
    expect(getComputedStyle(author).color).toBe(red)
  })
})

////////////////
// ## <ui-comments> threads
////////////////

describe("<ui-comments> threads", () => {
  it("renders a list inside a comment as its thread:  `comments`, no `ui`, indented", async () => {
    const { comments } = await list('size="large"', THREAD)
    const thread = comments[0]!.querySelector<UIHost>("ui-comments")!
    await ElementFixture.settle(thread)
    expect(thread.matches(":state(in-comment)")).toBe(true)
    expect(rootOf(thread).className).toBe("comments")
    expect(style(rootOf(thread)).paddingLeft).toBe("18px")
    // the reply is a comment of the thread, with the same parts
    const reply = thread.querySelector<UIHost>("ui-comment")!
    expect(reply.matches(":state(in-comments)")).toBe(true)
    expect(reply.querySelector("ui-author")!.matches(":state(in-comment)")).toBe(true)
  })

  it("draws the thread line when threaded", async () => {
    const { host, comments } = await list("", THREAD)
    const thread = comments[0]!.querySelector<UIHost>("ui-comments")!
    await ElementFixture.settle(thread)
    expect(style(rootOf(thread)).boxShadow).toBe("none")
    host.setAttribute("threaded", "")
    await ElementFixture.tick()
    expect(style(rootOf(thread)).boxShadow).not.toBe("none")
    expect(style(rootOf(thread)).paddingTop).toBe("48px")
  })

  it("folds a collapsed thread or comment away", async () => {
    const { comments } = await list("", THREAD)
    const thread = comments[0]!.querySelector<UIHost>("ui-comments")!
    await ElementFixture.settle(thread)
    thread.setAttribute("collapsed", "")
    await ElementFixture.tick()
    expect(rootOf(thread).className).toBe("collapsed comments")
    expect(style(rootOf(thread)).display).toBe("none")
    expect(thread.matches(":state(collapsed)")).toBe(true)
    comments[0]!.setAttribute("collapsed", "")
    await ElementFixture.tick()
    expect(style(rootOf(comments[0]!)).display).toBe("none")
  })
})

////////////////
// ## <ui-comments> variations
////////////////

describe("<ui-comments> variations", () => {
  it("hides a minimal list's actions until the comment is hovered -- or holds keyboard focus", async () => {
    const { comments } = await list("minimal", `<ui-comment>${PARTS}</ui-comment>`)
    const actions = partRoot(comments[0]!.querySelector("ui-actions")!)
    expect(style(actions).opacity).toBe("0")
    expect(style(actions).position).toBe("absolute")
    await userEvent.hover(partRoot(comments[0]!.querySelector("ui-content")!))
    await expect.poll(() => style(actions).opacity).toBe("1")
    await userEvent.unhover(partRoot(comments[0]!.querySelector("ui-content")!))
    await expect.poll(() => style(actions).opacity).toBe("0")
    comments[0]!.querySelector("button")!.focus()
    await expect.poll(() => style(actions).opacity).toBe("1")
  })

  it("inverts:  the dark scheme, a dark surface behind each comment", async () => {
    const { root, comments } = await list("inverted")
    expect(style(root).colorScheme).toBe("dark")
    expect(style(rootOf(comments[0]!)).backgroundColor).not.toBe("rgba(0, 0, 0, 0)")
    const author = partRoot(comments[0]!.querySelector("ui-author")!)
    expect(style(author).getPropertyValue("--ui-inverted").trim()).toBe("1")
  })

  it("scales with `size`, keeps to 650px", async () => {
    const wrapper = await ElementFixture.render(
      `<div style="width: 1000px"><ui-comments size="small"></ui-comments></div>`
    )
    const root = rootOf(wrapper.querySelector("ui-comments")!)
    expect(style(root).fontSize).toBe("14px")
    expect(root.getBoundingClientRect().width).toBe(650)
  })

  it("fades a disabled comment, marked aria-disabled", async () => {
    const { comments } = await list("", `<ui-comment disabled>${PARTS}</ui-comment>`)
    const root = rootOf(comments[0]!)
    expect(root.getAttribute("aria-disabled")).toBe("true")
    expect(Number(style(root).opacity)).toBeLessThan(1)
    expect(comments[0]!.matches(":state(disabled)")).toBe(true)
  })
})

////////////////
// ## <ui-comments> reply form
////////////////

describe("<ui-comments> reply form", () => {
  it("puts a slotted reply form in a spaced `reply` box, below the comments", async () => {
    const { host } = await list(
      "",
      `<ui-comment>${PARTS}</ui-comment><ui-form slot="reply"><form><ui-textarea aria-label="Reply"></ui-textarea></form></ui-form>`
    )
    const reply = host.shadowRoot!.querySelector<HTMLElement>("[part~=reply]")!
    expect(reply.className).toBe("reply")
    expect(style(reply).marginTop).toBe("16px")
    const plain = await list()
    expect(plain.host.shadowRoot!.querySelector("[part~=reply]")).toBeNull()
  })

  it("puts a reply form under a comment too", async () => {
    const { comments } = await list(
      "",
      `<ui-comment>${PARTS}<ui-form slot="reply"><form><ui-textarea aria-label="Reply"></ui-textarea></form></ui-form></ui-comment>`
    )
    const reply = comments[0]!.shadowRoot!.querySelector<HTMLElement>("[part~=reply]")!
    expect(reply.getBoundingClientRect().width).toBe(rootOf(comments[0]!).getBoundingClientRect().width)
  })

  it.each(Object.keys(EXAMPLES))("never navigates away from a reply form in %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    for (const form of root.querySelectorAll("form")) {
      let navigates: boolean | undefined
      // bubbling, so after `<ui-form>`'s own handling;  always cancelled here, so the test page survives
      root.addEventListener(
        "submit",
        (event) => {
          navigates = !event.defaultPrevented && form.method !== "dialog"
          event.preventDefault()
        },
        { once: true }
      )
      form.requestSubmit()
      expect(navigates, path).toBe(false)
    }
  })
})

////////////////
// ## <ui-comments> keyboard
////////////////

describe("<ui-comments> keyboard", () => {
  it("reaches the author link and each action in reading order", async () => {
    const { comments } = await list("minimal", `<ui-comment>${PARTS}</ui-comment>`)
    const author = partRoot(comments[0]!.querySelector("ui-author")!)
    const button = comments[0]!.querySelector("button")!
    author.focus()
    expect(comments[0]!.querySelector("ui-author")!.shadowRoot!.activeElement).toBe(author)
    await Keys.tab()
    expect(document.activeElement).toBe(button)
    // a minimal comment's action is visible while focused
    await expect.poll(() => style(partRoot(comments[0]!.querySelector("ui-actions")!)).opacity).toBe("1")
  })
})

////////////////
// ## <ui-comments> accessibility
////////////////

describe("<ui-comments> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await ElementFixture.settle(root)
    await expectAccessible(root)
  })
})
