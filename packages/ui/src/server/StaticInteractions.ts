import type { ServerIds } from "./ServerIds"

/****************
 * ### `StaticInteractions`
 * Wires a flattened page so what the platform can do without scripts still works (plan P4):
 * - invoker commands:  a `commandfor` button aimed at a `<dialog>` or a `[popover]` gets the NATIVE command for
 *   what the element's custom one meant (`--show` => `show-modal` / `show-popover`, `--close` => `close` /
 *   `hide-popover`, `--toggle` => `show-modal` / `toggle-popover`)
 * - dialogs:  their close icon and `approve` / `deny` buttons close them (`command="close"`)
 * - popovers:  the button a click popup controls (`aria-controls`) gets `popovertarget`, unless it has `commandfor`
 * - ids:  a fixed id a render repeats (`ui-section`'s `content`) is renamed after its first use, with the references
 *   inside the same component root (`aria-controls`, `for`, `commandfor` ...) following it
 * - Runs after `StaticFlattener`, on the whole document.  Anything else stays as rendered (tabs, hover popups:
 *   no zero-JS path, caveat C1).
 ****************/
export class StaticInteractions {
  /** Wire `document`;  `ids` hands out fresh ids (dialogs without one). */
  static wire(document: Document, ids: ServerIds) {
    StaticInteractions.uniqueIds(document, ids)
    for (const dialog of document.querySelectorAll("dialog")) StaticInteractions.dialog(dialog, ids)
    for (const invoker of document.querySelectorAll("[commandfor]")) StaticInteractions.invoker(document, invoker)
    for (const popover of document.querySelectorAll("[popover][id]")) StaticInteractions.popover(document, popover)
  }

  /** A `commandfor` button's custom command => the native one its target understands. */
  private static invoker(document: Document, invoker: Element) {
    const target = document.getElementById(invoker.getAttribute("commandfor") ?? "")
    const command = invoker.getAttribute("command") ?? ""
    if (!target) return
    const table =
      target.localName === "dialog" ? DIALOG_COMMANDS : target.hasAttribute("popover") ? POPOVER_COMMANDS : undefined
    const native = table?.[command]
    if (native) invoker.setAttribute("command", native)
  }

  /** A dialog's close icon and approve / deny buttons close it natively. */
  private static dialog(dialog: Element, ids: ServerIds) {
    const closers = dialog.querySelectorAll(CLOSERS)
    if (!closers.length) return
    const id = ids.ensure(dialog, "ui-dialog")
    for (const closer of closers) {
      if (closer.localName !== "button" || closer.hasAttribute("commandfor")) continue
      // only buttons this dialog owns, not a nested dialog's
      if (closer.closest("dialog") !== dialog) continue
      closer.setAttribute("commandfor", id)
      closer.setAttribute("command", "close")
    }
  }

  /**
   * The button a popover's controls point at (`aria-controls`) toggles it natively;  a tooltip (hover / focus, no
   * zero-JS way to open) lends its text to the element it describes (`aria-describedby`) as a native `title`, as the
   * element's own fallback does.
   */
  private static popover(document: Document, popover: Element) {
    const id = popover.id
    if (popover.getAttribute("role") === "tooltip") {
      const text = (popover.textContent ?? "").replace(/\s+/g, " ").trim()
      for (const target of document.querySelectorAll("[aria-describedby]")) {
        if (!(target.getAttribute("aria-describedby") ?? "").split(/\s+/).includes(id)) continue
        if (text && !target.hasAttribute("title")) target.setAttribute("title", text)
      }
    }
    // tokens compared in code, not a selector:  an id may hold quotes
    for (const button of document.querySelectorAll("button[aria-controls]")) {
      if (!(button.getAttribute("aria-controls") ?? "").split(/\s+/).includes(id)) continue
      if (!button.hasAttribute("commandfor") && !button.hasAttribute("popovertarget")) {
        button.setAttribute("popovertarget", id)
      }
    }
  }

  /**
   * Rename every repeat of an id after its first element, and the references to it inside the repeat's component
   * root (`[data-ui]`), so a render's fixed id (`content`) stays unique on the page.
   */
  private static uniqueIds(document: Document, ids: ServerIds) {
    const seen = new Set<string>()
    for (const element of document.querySelectorAll("[id]")) {
      const id = element.id
      if (!id) continue
      if (!seen.has(id)) {
        seen.add(id)
        continue
      }
      const fresh = ids.next(id)
      element.id = fresh
      seen.add(fresh)
      const scope = element.closest("[data-ui]") ?? document.body
      for (const attribute of REFERENCES) {
        for (const reference of scope.querySelectorAll(`[${attribute}]`)) {
          const tokens = (reference.getAttribute(attribute) ?? "").split(/\s+/)
          if (tokens.includes(id)) {
            reference.setAttribute(attribute, tokens.map((token) => (token === id ? fresh : token)).join(" "))
          }
        }
      }
    }
  }
}

/** A dialog's custom commands => native invoker commands. */
const DIALOG_COMMANDS: Readonly<Record<string, string>> = {
  "--show": "show-modal",
  "--open": "show-modal",
  "--toggle": "show-modal",
  "--close": "close",
  "--hide": "close"
}

/** A popover's custom commands => native invoker commands. */
const POPOVER_COMMANDS: Readonly<Record<string, string>> = {
  "--show": "show-popover",
  "--open": "show-popover",
  "--toggle": "toggle-popover",
  "--close": "hide-popover",
  "--hide": "hide-popover"
}

/** Buttons that close their dialog. */
const CLOSERS = '[part~="close"], [approve], [deny]'

/** Attributes that refer to ids (space-separated lists). */
const REFERENCES = [
  "aria-controls",
  "aria-labelledby",
  "aria-describedby",
  "aria-owns",
  "aria-details",
  "aria-errormessage",
  "aria-activedescendant",
  "for",
  "form",
  "headers",
  "list",
  "commandfor",
  "popovertarget",
  "anchor"
]
