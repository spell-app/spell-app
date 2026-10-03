/**
 * Native-fallback test cases (`docs/fallback.md`):  when a `ui-*` element's render throws, it shows its family's
 * native fallback (`src/components/ui-<name>/ui-<name>.fallback.ts`) and the page keeps working.
 * - Runtime-agnostic:  DOM, ARIA and forms only.  The Solid-specific parts come in through `FallbackAdapter`
 *   (how to mount and wait, how to make one element's render throw, axe), from `fallback.test.tsx`.
 * - Test-runner-agnostic:  no `vitest` import;  a failed check throws.  Run as
 *   `for (const test of FALLBACK_CASES) it(test.name, () => test.run(adapter))`.
 * - Each case mounts its own markup and leaves it in the document;  the adapter's fixture cleans up.
 * - What the element base MUST do on failure:
 *   - one `console.error` naming the tag (`<ui-button>`) with the cause
 *   - a cancelable, bubbling, composed `ui-error`, `detail: { error }`;  not cancelled => the fallback renders
 *   - `:state(errored)` on the host
 */

/** What the test provides to run the cases. */
export type FallbackAdapter = {
  /**
   * Render `html` into the document and resolve once every element in it has rendered (styles adopted).
   * - Resolves with a container holding `html`.
   */
  mount(html: string): Promise<HTMLElement>
  /**
   * Make `element`'s render throw (an error thrown while it updates, NOT at definition), then resolve once the
   * failure is handled and the fallback is in its shadow root.
   */
  breakRender(element: HTMLElement): Promise<void>
  /** Resolve once pending updates (attribute / property writes) are in the DOM. */
  settle(): Promise<void>
  /** Run axe on `root`;  reject (throw) on violations. */
  axe(root: Element): Promise<void>
}

/** One case:  `run()` resolves when it passes, throws when it fails. */
export type FallbackCase = {
  name: string
  run(adapter: FallbackAdapter): Promise<void>
}

/** The error event name every element dispatches (`E.ERROR_EVENT`).  NOTE: no vocabulary names it yet. */
export const ERROR_EVENT = "ui-error"

/**
 * Per family:  markup of one element, and the selector of its fallback's root inside the shadow root.
 * - The root carries the family's `part`, like the real element's.
 */
export const FAMILY_FALLBACKS: readonly { family: string; html: string; root: string }[] = [
  { family: "ui-button", html: `<ui-button primary>Save</ui-button>`, root: "button[part~=button]" },
  {
    family: "ui-dropdown",
    html: `<ui-dropdown selection placeholder="Fruit"><ui-item value="a">Apple</ui-item></ui-dropdown>`,
    root: "select[part~=trigger]"
  },
  { family: "ui-icon", html: `<ui-icon name="house" label="Home"></ui-icon>`, root: "[part~=icon]" },
  { family: "ui-label", html: `<ui-label color="red">Tag</ui-label>`, root: "[part~=label]" },
  { family: "ui-segment", html: `<ui-segment raised>Box</ui-segment>`, root: "[part~=segment]" },
  { family: "ui-container", html: `<ui-container text>Text</ui-container>`, root: "[part~=container]" },
  { family: "ui-divider", html: `<ui-divider horizontal>Or</ui-divider>`, root: "[role=separator][part~=divider]" },
  { family: "ui-parts", html: `<ui-header size="large">Title</ui-header>`, root: "[part~=header]" },
  { family: "ui-grid", html: `<ui-grid columns="2"><ui-column>A</ui-column></ui-grid>`, root: "[part~=grid]" },
  { family: "ui-image", html: `<ui-image size="small" src="data:," alt="Photo"></ui-image>`, root: "img[part~=image]" },
  { family: "ui-text", html: `<ui-text color="red">Red</ui-text>`, root: "span[part~=text]" },
  { family: "ui-flag", html: `<ui-flag country="fr"></ui-flag>`, root: "[role=img][part~=flag]" },
  { family: "ui-loader", html: `<ui-loader active inline></ui-loader>`, root: "[role=status][part~=loader]" },
  {
    family: "ui-placeholder",
    html: `<ui-placeholder><ui-placeholder-line></ui-placeholder-line></ui-placeholder>`,
    root: "[part~=placeholder]"
  },
  { family: "ui-message", html: `<ui-message header="Saved" dismissible>Done</ui-message>`, root: "[part~=message]" },
  {
    family: "ui-breadcrumb",
    html: `<ui-breadcrumb><ui-breadcrumb-section active>Home</ui-breadcrumb-section></ui-breadcrumb>`,
    root: "nav[part~=breadcrumb]"
  },
  { family: "ui-input", html: `<ui-input placeholder="Search" aria-label="Search"></ui-input>`, root: "[part~=input]" },
  { family: "ui-checkbox", html: `<ui-checkbox>Agree</ui-checkbox>`, root: "[part~=checkbox]" },
  { family: "ui-form", html: `<ui-form><form></form></ui-form>`, root: "[part~=form]" },
  {
    family: "ui-list",
    html: `<ui-list divided ordered><ui-item>One</ui-item><ui-item>Two</ui-item></ui-list>`,
    root: "ol.ui.divided.ordered.list[part=list][role=list]"
  },
  {
    family: "ui-menu",
    html: `<ui-menu secondary aria-label="Fallback menu"><ui-item href="#a" selected>A</ui-item></ui-menu>`,
    root: "nav[part~=menu]"
  },
  {
    family: "ui-table",
    html:
      `<ui-table celled scrolling><table><caption>People</caption><thead><tr><th>Name</th></tr></thead>` +
      `<tbody><tr><td>Jill</td></tr></tbody></table></ui-table>`,
    root: "[role=region][part~=scroller]"
  },
  { family: "ui-popup", html: `<ui-popup content="Tip" on="manual"></ui-popup>`, root: "[part~=popup]" },
  { family: "ui-modal", html: `<ui-modal header="Saved" closable>Done</ui-modal>`, root: "dialog[part~=modal]" },
  { family: "ui-transition", html: `<ui-transition visible>Shown</ui-transition>`, root: "[part~=transition]" },
  { family: "ui-dimmer", html: `<ui-dimmer active>Dimmed</ui-dimmer>`, root: "div[part~=dimmer]" },
  { family: "ui-flyout", html: `<ui-flyout header="Saved" closable>Done</ui-flyout>`, root: "dialog[part~=flyout]" },
  { family: "ui-sidebar", html: `<ui-sidebar aria-label="Site">Links</ui-sidebar>`, root: "aside[part~=sidebar]" },
  { family: "ui-shape", html: `<ui-shape><ui-side>One</ui-side></ui-shape>`, root: "[part~=shape]" },
  { family: "ui-card", html: `<ui-card header="Kristy" raised>Card</ui-card>`, root: "article[part~=card]" },
  { family: "ui-items", html: `<ui-items divided><ui-item>One</ui-item></ui-items>`, root: "[role=list][part~=items]" },
  {
    family: "ui-feed",
    html: `<ui-feed ordered><ui-event label="A">Joined</ui-event></ui-feed>`,
    root: "ol[part~=feed]"
  },
  {
    family: "ui-comment",
    html: `<ui-comments threaded><ui-comment>Hi</ui-comment></ui-comments>`,
    root: "[part~=comments]"
  },
  {
    family: "ui-statistic",
    html: `<ui-statistic value="5" label="Flights"></ui-statistic>`,
    root: "[part~=statistic]"
  },
  {
    family: "ui-step",
    html: `<ui-steps><ui-step selected header="Billing"></ui-step></ui-steps>`,
    root: "ol[part~=steps]"
  },
  { family: "ui-rail", html: `<ui-rail position="left">Rail</ui-rail>`, root: "[part~=rail]" },
  { family: "ui-root", html: `<ui-root display="immediately" size="small">Page</ui-root>`, root: "slot" },
  {
    family: "ui-reveal",
    html: `<ui-reveal fade><span slot="visible">Front</span><span slot="hidden">Back</span></ui-reveal>`,
    root: "[part~=reveal]"
  },
  { family: "ui-ad", html: `<ui-ad unit="small rectangle" test></ui-ad>`, root: "[part~=ad]" },
  {
    family: "ui-emoji",
    html: `<ui-emoji name="grinning_face_with_smiling_eyes" label="Happy"></ui-emoji>`,
    root: "[part~=emoji]"
  },
  {
    family: "ui-select",
    html: `<ui-select placeholder="Fruit"><ui-item value="a">Apple</ui-item></ui-select>`,
    root: "select[part~=select]"
  },
  { family: "ui-search", html: `<ui-search placeholder="Fruit"></ui-search>`, root: "input[part~=prompt]" },
  { family: "ui-progress", html: `<ui-progress value="40" label="Upload"></ui-progress>`, root: "progress[part~=bar]" },
  {
    family: "ui-rating",
    html: `<ui-rating value="2" aria-label="Fallback rating"></ui-rating>`,
    root: "fieldset[role=radiogroup][part~=rating] label[part~=icon]:not(.icon)"
  },
  {
    family: "ui-slider",
    html: `<ui-slider value="4" aria-label="Fallback slider"></ui-slider>`,
    root: "input[type=range][part~=thumb]"
  },
  {
    family: "ui-accordion",
    html: `<ui-accordion styled open="0"><ui-title>Dogs</ui-title><ui-content>Loyal</ui-content></ui-accordion>`,
    root: "[part~=accordion] > details[open]"
  },
  {
    family: "ui-tab",
    html: `<ui-tabs tabular aria-label="Fallback tabs"><ui-tab label="One">A</ui-tab></ui-tabs>`,
    root: "[part~=tabs] > [role=tablist]"
  },
  { family: "ui-toast", html: `<ui-toast header="Saved" message="Done" closable></ui-toast>`, root: "[part~=box]" },
  { family: "ui-nag", html: `<ui-nag color="teal">Updated</ui-nag>`, root: "[part~=nag]" },
  { family: "ui-sticky", html: `<ui-sticky offset="8">Stuck</ui-sticky>`, root: "[part~=sticky]" },
  { family: "ui-visibility", html: `<ui-visibility><p>Seen</p></ui-visibility>`, root: "[part~=visibility]" },
  {
    family: "ui-embed",
    html: `<ui-embed source="youtube" video-id="x" label="Intro"></ui-embed>`,
    root: "button[part~=play]"
  },
  {
    family: "ui-calendar",
    html: `<ui-calendar type="date" value="2026-09-30" placeholder="Fallback date"></ui-calendar>`,
    root: "[part~=calendar] input[type=date][part~=control]"
  },
  { family: "ui-section", html: `<ui-section header="Details" collapsible>Body</ui-section>`, root: "[part~=section]" },
  {
    family: "ui-include",
    html: `<ui-include source="/test/fixtures/sources/part.html">Placeholder</ui-include>`,
    root: "[part~=content]"
  },
  { family: "ui-code", html: `<ui-code language="text">let x = 1</ui-code>`, root: "[part~=box]" },
  { family: "ui-markdown", html: `<ui-markdown size="small"># Title</ui-markdown>`, root: "[part~=body]" }
]

export const FALLBACK_CASES: readonly FallbackCase[] = [
  {
    name: "a throw in render shows the native fallback:  one console error, one ui-error, :state(errored)",
    async run(adapter) {
      const container = await adapter.mount(`<form><ui-button type="submit" primary>Save</ui-button></form>`)
      const host = container.querySelector<HTMLElement>("ui-button")!
      const events: CustomEvent[] = []
      container.addEventListener(ERROR_EVENT, (event) => events.push(event as CustomEvent))
      const errors = await captureErrors(() => adapter.breakRender(host))
      const button = host.shadowRoot?.querySelector<HTMLButtonElement>("button[part~=button]")
      check(!!button, "a native <button part=button> in the shadow root")
      check(button!.className === "ui primary button", `the class grammar, got "${button!.className}"`)
      check(host.matches(":state(errored)"), ":state(errored)")
      check(events.length === 1, `one ${ERROR_EVENT}, got ${events.length}`)
      const [event] = events
      check(event!.bubbles && event!.composed && event!.cancelable, `${ERROR_EVENT} bubbles, composed, cancelable`)
      check(event!.detail?.error instanceof Error, `${ERROR_EVENT} detail.error is the cause`)
      const tagged = errors.filter((args) => args.some((arg) => String(arg).includes("<ui-button>")))
      check(tagged.length === 1, `one console.error naming <ui-button>, got ${errors.length} error(s)`)
      check(
        tagged[0]!.some((arg) => arg === event!.detail.error),
        "the console.error carries the cause"
      )
    }
  },
  {
    name: "a cancelled ui-error keeps the fallback out (the page takes over)",
    async run(adapter) {
      const container = await adapter.mount(`<ui-button>Save</ui-button>`)
      const host = container.querySelector<HTMLElement>("ui-button")!
      container.addEventListener(ERROR_EVENT, (event) => event.preventDefault())
      await captureErrors(() => adapter.breakRender(host))
      check(!host.shadowRoot?.querySelector("button[part~=button]"), "no native button after preventDefault()")
      check(host.matches(":state(errored)"), ":state(errored) all the same")
    }
  },
  {
    name: "every family renders its fallback root",
    async run(adapter) {
      const container = await adapter.mount(FAMILY_FALLBACKS.map(({ html }) => html).join(""))
      const hosts = [...container.children] as HTMLElement[]
      await captureErrors(async () => {
        for (const host of hosts) await adapter.breakRender(host)
      })
      FAMILY_FALLBACKS.forEach(({ family, root }, index) => {
        const host = hosts[index]!
        check(host.matches(":state(errored)"), `${family}:  :state(errored) (did the render really fail?)`)
        check(!!host.shadowRoot?.querySelector(root), `${family}:  ${root} in the shadow root`)
      })
    }
  },
  {
    name: "a sibling of a failed element still updates",
    async run(adapter) {
      const container = await adapter.mount(`<ui-button>Broken</ui-button><ui-label>Sibling</ui-label>`)
      await captureErrors(() => adapter.breakRender(container.querySelector<HTMLElement>("ui-button")!))
      const label = container.querySelector<HTMLElement>("ui-label")!
      label.setAttribute("color", "red")
      await adapter.settle()
      const root = label.shadowRoot?.querySelector("[part~=label]")
      check(root?.className === "ui red label", `the sibling re-rendered, got "${root?.className}"`)
      const later = await adapter.mount(`<ui-label color="blue">Later</ui-label>`)
      const laterRoot = later.querySelector("ui-label")!.shadowRoot?.querySelector("[part~=label]")
      check(laterRoot?.className === "ui blue label", "a new element still renders")
    }
  },
  {
    name: "the fallback button submits its form with name=value",
    async run(adapter) {
      const container = await adapter.mount(
        `<form><input name="a" value="1"><ui-button type="submit" name="action" value="save">Save</ui-button></form>`
      )
      const form = container.querySelector("form")!
      const submitted: FormData[] = []
      form.addEventListener("submit", (event) => {
        event.preventDefault()
        submitted.push(new FormData(form))
      })
      const host = container.querySelector<HTMLElement>("ui-button")!
      await captureErrors(() => adapter.breakRender(host))
      host.shadowRoot!.querySelector<HTMLButtonElement>("button[part~=button]")!.click()
      check(submitted.length === 1, `one submit, got ${submitted.length}`)
      const entries = [...submitted[0]!.entries()].map(
        ([key, value]) => `${key}=${typeof value === "string" ? value : value.name}`
      )
      check(entries.join("&") === "a=1&action=save", `a=1&action=save, got ${entries.join("&")}`)
      check(new FormData(form).get("action") === null, "the value is only there during the submit")
    }
  },
  {
    name: "the fallback select changes the host's form value and fires ui-change",
    async run(adapter) {
      const container = await adapter.mount(
        `<form><ui-dropdown name="fruit" selection placeholder="Fruit">` +
          `<ui-item value="a">Apple</ui-item><ui-item value="b" selected>Banana</ui-item><ui-item value="c">Cherry</ui-item>` +
          `</ui-dropdown></form>`
      )
      const form = container.querySelector("form")!
      const host = container.querySelector<HTMLElement & { value?: unknown }>("ui-dropdown")!
      const changes: unknown[] = []
      host.addEventListener("ui-change", (event) => changes.push((event as CustomEvent).detail.value))
      await captureErrors(() => adapter.breakRender(host))
      const select = host.shadowRoot!.querySelector<HTMLSelectElement>("select[part~=trigger]")!
      check(!!select, "a native <select part=trigger>")
      check(select.value === "b", `starts on the chosen value, got "${select.value}"`)
      check(new FormData(form).get("fruit") === "b", "the form value survives the failure")
      select.value = "c"
      select.dispatchEvent(new Event("change", { bubbles: true }))
      check(
        new FormData(form).get("fruit") === "c",
        `the form value follows, got ${JSON.stringify(new FormData(form).get("fruit"))}`
      )
      check(changes.length === 1 && changes[0] === "c", `one ui-change with "c", got ${JSON.stringify(changes)}`)
      check(host.value === "c", `host.value follows, got ${JSON.stringify(host.value)}`)
    }
  },
  {
    name: "axe passes on every family's fallback",
    async run(adapter) {
      const container = await adapter.mount(
        `<main>${FAMILY_FALLBACKS.map(({ html }) => html).join("")}` +
          `<form><ui-button type="submit" name="go" value="1">Go</ui-button></form></main>`
      )
      const main = container.querySelector("main")!
      await captureErrors(async () => {
        for (const host of main.querySelectorAll<HTMLElement>(":scope > :not(form), :scope > form > *"))
          await adapter.breakRender(host)
      })
      await adapter.axe(main)
    }
  }
]

////////////////
// ## Helpers
////////////////

/** Throw `message` unless `condition`. */
function check(condition: boolean, message: string) {
  if (!condition) throw new Error(`fallback case:  expected ${message}`)
}

/**
 * Run `fn` with `console.error` captured (and silenced);  resolves with the argument lists it got.
 * - Every case expects errors (that's the point), so none reach the test output.
 */
async function captureErrors(fn: () => Promise<void> | void): Promise<unknown[][]> {
  const calls: unknown[][] = []
  const original = console.error
  console.error = (...args: unknown[]) => void calls.push(args)
  try {
    await fn()
  } finally {
    console.error = original
  }
  return calls
}
