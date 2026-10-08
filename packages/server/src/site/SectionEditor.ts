import { readEdit, serverConfig } from "$/server/site"

/****************
 * ### `<spell-section-editor>`
 * Edit mode for pages the page server serves:  hover a section, click "edit", change its HTML source, save.
 * The page server writes the ORIGINAL file (`PATCH /_server/page`), and live reload shows the result.
 * - on while the site header's pencil is on (this tab);  `SectionEditor.mount()` adds the one instance to `<body>`
 * - what can be edited:
 *   - an element with an `id` (`EDITABLE`:  a docs page's `<ui-section>`, a plan item ...)
 *   - a `section` whose heading has one (the goals pages):
 *     the section, found through its heading's `id` (`parent: "section"`)
 * - the source comes fresh from the server with its `ETag`:
 *   saving is refused (409) if the file changed since, and the dialog says to reload
 * - never commits:  the change sits in the working tree for review
 ****************/
export class SectionEditor extends HTMLElement {
  /** the tag */
  static readonly tag = "spell-section-editor"

  /** define the element, once */
  static define(): void {
    if (!customElements.get(SectionEditor.tag)) customElements.define(SectionEditor.tag, SectionEditor)
  }

  /** add the one editor to the page, if the page server serves it */
  static mount(): void {
    if (!serverConfig()?.token || document.querySelector(SectionEditor.tag)) return
    SectionEditor.define()
    document.body.append(document.createElement(SectionEditor.tag))
  }

  /** what the pointer is over:  the element, and how to address it */
  private target?: { element: Element; id: string; parent?: string }

  /** what's open in the dialog, with the `ETag` its source came with */
  private editing?: { id: string; parent?: string; etag: string }

  connectedCallback(): void {
    if (this.shadowRoot) return
    const shadow = this.attachShadow({ mode: "open" })
    shadow.innerHTML = `<style>${STYLE}</style>
<div class="outline" hidden></div>
<button class="pill" hidden>edit</button>
<dialog>
  <form method="dialog">
    <header><b>Edit</b> <code class="what"></code></header>
    <textarea spellcheck="false" autocomplete="off"></textarea>
    <p class="message" role="status"></p>
    <footer>
      <button value="cancel" formnovalidate>Cancel</button>
      <button class="primary" value="save">Save to file</button>
    </footer>
  </form>
</dialog>`
    shadow.querySelector<HTMLButtonElement>(".pill")!.onclick = () => void this.open()
    shadow.querySelector("form")!.onsubmit = (event) => {
      const button = (event as SubmitEvent).submitter as HTMLButtonElement | null
      if (button?.value !== "save") return
      event.preventDefault()
      void this.save()
    }
    document.addEventListener("pointerover", this.onPointer)
    addEventListener("scroll", this.place, { passive: true })
    document.addEventListener("spell-site:edit", this.place)
  }

  disconnectedCallback(): void {
    document.removeEventListener("pointerover", this.onPointer)
    removeEventListener("scroll", this.place)
    document.removeEventListener("spell-site:edit", this.place)
  }

  /** track the editable thing under the pointer */
  private onPointer = (event: PointerEvent): void => {
    if (!readEdit() || this.shadowRoot!.querySelector("dialog")!.open) return
    const element = event.target instanceof Element ? event.target : undefined
    if (element && this.contains(element)) return
    if (element?.closest(SectionEditor.tag) || element?.closest("spell-site-header")) return
    this.target = element ? editableAt(element) : undefined
    this.place()
  }

  /** put the outline and pill over the target, or hide them */
  private place = (): void => {
    const shadow = this.shadowRoot!
    const outline = shadow.querySelector<HTMLElement>(".outline")!
    const pill = shadow.querySelector<HTMLElement>(".pill")!
    const target = readEdit() ? this.target : undefined
    if (!target?.element.isConnected) {
      outline.hidden = pill.hidden = true
      return
    }
    const box = target.element.getBoundingClientRect()
    Object.assign(outline.style, {
      top: `${box.top}px`,
      left: `${box.left}px`,
      width: `${box.width}px`,
      height: `${box.height}px`
    })
    const top = Math.max(
      box.top,
      Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--spell-site-header-height")) || 0
    )
    Object.assign(pill.style, { top: `${top + 4}px`, left: `${box.right - 52}px` })
    pill.textContent = target.parent ? `edit ${target.parent}` : `edit #${target.id}`
    outline.hidden = pill.hidden = false
  }

  /** fetch the target's source and show it */
  private async open(): Promise<void> {
    const target = this.target
    const config = serverConfig()
    if (!target || !config) return
    const query = new URLSearchParams({
      path: config.file,
      id: target.id,
      ...(target.parent && { parent: target.parent })
    })
    const answer = await fetch(`${config.edit ?? "/_server/page"}?${query}`)
    const body = (await answer.json()) as { html?: string; etag?: string; error?: string }
    const shadow = this.shadowRoot!
    if (!answer.ok || body.html === undefined || !body.etag)
      return this.say(body.error ?? `couldn't read it (${answer.status})`, true)
    this.editing = { id: target.id, parent: target.parent, etag: body.etag }
    shadow.querySelector(".what")!.textContent = target.parent ? `${target.parent} of #${target.id}` : `#${target.id}`
    shadow.querySelector("textarea")!.value = body.html
    this.say("")
    shadow.querySelector("dialog")!.showModal()
  }

  /** write the source back;  the page reloads when the file changes */
  private async save(): Promise<void> {
    const config = serverConfig()
    const editing = this.editing
    if (!config || !editing) return
    const html = this.shadowRoot!.querySelector("textarea")!.value
    const answer = await fetch(`${config.edit ?? "/_server/page"}?path=${encodeURIComponent(config.file)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-server-token": config.token, "if-match": editing.etag },
      body: JSON.stringify({ id: editing.id, parent: editing.parent, html })
    })
    if (answer.ok) {
      this.say("Saved -- reloading")
      return
    }
    const body = (await answer.json().catch(() => ({}))) as { error?: string }
    this.say(`${body.error ?? `failed (${answer.status})`}`, true)
  }

  /** a line under the editor */
  private say(text: string, error = false): void {
    const message = this.shadowRoot!.querySelector<HTMLElement>(".message")!
    message.textContent = text
    message.classList.toggle("error", error)
    if (error && !this.shadowRoot!.querySelector("dialog")!.open) alert(text)
  }
}

/** Elements editable by their own `id`:  `ui-section` is every docs page's section (the goals pages':  `section`). */
const EDITABLE =
  "ui-section, section, article, li, p, figure, blockquote, table, ui-segment, ui-message, ui-card, ui-table, ui-step"

/** The editable thing at `element`:  itself or an ancestor with an id, or a section through its heading. */
function editableAt(element: Element): { element: Element; id: string; parent?: string } | undefined {
  for (let at: Element | null = element; at && at !== document.body; at = at.parentElement) {
    if (at.id && at.matches(EDITABLE)) return { element: at, id: at.id }
    if (at.localName === "section") {
      const heading = at.querySelector(":scope > ui-sticky > :is(h2, h3, h4)[id], :scope > :is(h2, h3, h4)[id]")
      if (heading) return { element: at, id: heading.id, parent: "section" }
    }
  }
  return undefined
}

/** The editor's look. */
const STYLE = `
.outline { position: fixed; z-index: 999; pointer-events: none; border: 2px dashed light-dark(#5b3fd0, #b3a2ff); border-radius: 6px; }
.pill {
  position: fixed; z-index: 1001; transform: translateX(-100%); margin-left: 48px;
  padding: 4px 10px; border: 0; border-radius: 999px; cursor: pointer;
  font: 600 12px/1.2 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  background: light-dark(#5b3fd0, #b3a2ff); color: light-dark(white, #1d1d22);
}
dialog {
  width: min(900px, calc(100vw - 32px)); max-height: calc(100vh - 64px); padding: 0; border: 1px solid light-dark(#e3e0d8, #34343b);
  border-radius: 12px; color: light-dark(#1d1d22, #ececf1); background: light-dark(white, #1d1d22);
  font: 14px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
}
dialog::backdrop { background: rgb(0 0 0 / 0.35); }
form { display: flex; flex-direction: column; gap: 10px; padding: 16px; }
header code { font-size: 13px; opacity: 0.7; }
textarea {
  min-height: 50vh; resize: vertical; padding: 10px; border-radius: 8px; border: 1px solid light-dark(#d8d4ca, #3a3a42);
  font: 13px/1.5 ui-monospace, "SF Mono", Menlo, Consolas, monospace; color: inherit; background: light-dark(#faf9f6, #26272d);
  tab-size: 2;
}
.message { margin: 0; min-height: 1.4em; font-size: 13px; }
.message.error { color: light-dark(#b42318, #ff9b8f); }
footer { display: flex; justify-content: flex-end; gap: 8px; }
footer button {
  padding: 7px 14px; border-radius: 999px; cursor: pointer; font: inherit;
  border: 1px solid light-dark(#d8d4ca, #3a3a42); background: none; color: inherit;
}
footer button.primary { border-color: transparent; background: light-dark(#5b3fd0, #b3a2ff); color: light-dark(white, #1d1d22); }
`
