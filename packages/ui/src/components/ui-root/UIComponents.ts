import { createEffect, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { ComponentPack } from "./ComponentPack"
import { ComponentsFallback } from "./ui-components.fallback"
import { componentsVocabulary } from "./ui-components.vocabulary.en"
import type { ComponentsVocabulary } from "./ui-root.types"

import rootCSS from "./ui-root.css?inline"

/****************
 * ### `<ui-components>`
 * A component pack for the whole page:  `source` names a JSON list of tags, each with the module that defines it,
 * when to load it and its skeleton (`ComponentPack`);  every `<ui-root>` on the page then loads those tags as it
 * loads its own.  Draws nothing.
 * - Asks for the pack AS IT CONNECTS (in `render()`, which runs then:  `canRenderUnstyled`), so a root upgraded
 *   after it finds the pack on its way and waits for it before calling a tag unknown.  The barrel defines it before
 *   `<ui-root>` for this reason.
 * - A new `source` reads that pack too;  tags are added, never taken back.
 * - `:state(loading | loaded | error)`;  `ui-load { source, tags }`, or a cancelable `ui-error { kind, source,
 *   error }` and a console warning.
 * - Static server render:  nothing is read.
 * - Adopts the family's sheet (`ui-root.css`) for its host's `display: contents`:  nothing in the shadow root to show.
 ****************/
export class UIComponents extends E.UIElement<ComponentsVocabulary> {
  @E.proto static vocabulary = componentsVocabulary
  @E.proto static styles = { root: rootCSS }
  @E.proto static Fallback = ComponentsFallback
  @E.proto static delegatesFocus = false
  @E.proto static canRenderUnstyled = true

  /** Where the latest pack stands;  `undefined` before one is asked for. */
  private readonly status = new E.Cell<PackStatus | undefined>(undefined)

  /** Packs asked for, so a slower earlier one can't set the state. */
  private request = 0

  protected hostStates() {
    const status = this.status.get()
    return { loading: status === STATUS.loading, loaded: status === STATUS.loaded, error: status === STATUS.error }
  }

  render(): JSX.Element {
    if (isServer) return undefined
    this.read(untrack(() => this.attrs.source))
    createEffect(
      () => this.attrs.source,
      (source) => {
        this.read(source)
      },
      { defer: true }
    )
    return undefined
  }

  /**
   * Ask for the pack at `source` (`ComponentPack.load()`, which tells the roots at once), then say how it went.
   * - Writes its state a microtask late or from the load's callbacks:  `render()` calls it, where a write throws.
   */
  private read(source: string | undefined) {
    if (!source) return
    const request = ++this.request
    queueMicrotask(() => {
      if (request === this.request) this.status.set(STATUS.loading)
    })
    void ComponentPack.load(source).then(
      (tags) => {
        if (request !== this.request) return
        this.status.set(STATUS.loaded)
        this.emit("ui-load", { source, tags: tags.map((it) => it.tag) })
      },
      (error: unknown) => {
        if (request !== this.request) return
        this.status.set(STATUS.error)
        const kind = E.SourceError.kindFor(error, "load")
        if (this.emit("ui-error", { kind, source, error })) {
          E.Warnings.warn("<ui-components>", `the pack ${source} didn't load (${kind}):`, error)
        }
      }
    )
  }
}

/** Where a pack stands:  its host states. */
const STATUS = { loading: "loading", loaded: "loaded", error: "error" } as const

/** One of `STATUS`. */
type PackStatus = (typeof STATUS)[keyof typeof STATUS]
