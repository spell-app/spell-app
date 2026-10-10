import { For, Show } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { AgentsClient, ageOf, clockOf, sentence, type RunningAgent } from "$/epics/review"
// the fold every `<epic-*>` fold shares:  its file, not `epic-item`'s barrel
import { Fold } from "$/epics/components/epic-item/Fold"
import { STACK_PROPERTY } from "$/epics/components/epic-page/EpicPage.types"

import { epicAgentsVocabulary } from "./EpicAgents.en"

import agentsCSS from "./EpicAgents.css?inline"

/****************
 * ### `EpicAgents`
 * The component behind `<epic-agents>`:  the epic's RUNNING AGENTS (epic `skillz` P3), drawn by `<epic-page>` right
 * before its blocks:  "Agents running" (a robot, the count when more than one), a row per agent, each with a note box
 * that REDIRECTS it.
 * - it FOLDS from its title, like every titled box (Owen, 2026-10-08);  open to start with:  it's live news
 * - shown ONLY while the page's `AgentsClient` is `listed` (a plan doc served with a token, the list answering) and
 *   an agent runs
 * - in the page's shadow root, NOT a section:
 *   the contents, the rail and the counts never see it (they read the light DOM)
 * - one row per agent, KEYED by name (`row()`):  a poll updates it in place, never touching what's typed in its
 *   box, nor its focus
 * - keeps the reader's place:  read below it, the page scrolls by what it grew or shrank as it comes,
 *   changes or goes (`follow()`)
 * - SIDE EFFECT:  follows the page's agents client while connected (kept alive:  a page that's gone stops listening)
 ****************/
export class EpicAgents extends E.UIComponent<typeof epicAgentsVocabulary> {
  @E.proto static vocabulary = epicAgentsVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "epic-agents": agentsCSS },
    // a panel:  a click on its words must not jump to its first button
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## The agents
  ////////////////

  /** The epic's running agents, one client per page;  none in a server render (nothing drawn). */
  readonly client = isServer ? undefined : AgentsClient.forPage()

  /** The client's `version`, as last heard:  `agents` reads it, so the panel redraws on every change. */
  @E.state accessor version = 0

  /** The agents shown:  every one running while listed;  none otherwise. */
  get agents(): RunningAgent[] {
    void this.version
    return this.client?.listed ? this.client.agents : []
  }

  /** Follow the client while connected. */
  @E.whileConnected
  protected followAgents() {
    const client = this.client
    if (!client) return undefined
    this.version = client.version
    return client.subscribe(() => this.follow())
  }

  /**
   * The client changed:  show it.  While the reader is below the panel (its bottom edge above the reading line),
   * scroll by what it grew or shrank once it's drawn, so what they read stays put.
   * - the reading line:  where top-level titles stick, the page's `--epic-stack`
   * - after Solid's own flush (a microtask queued after the write runs after it), before the next paint
   * - measured, not assumed:  a browser that anchors the scroll itself leaves nothing to make up
   */
  private follow() {
    const edge = this.box?.getBoundingClientRect().bottom
    this.version = this.client!.version
    if (edge === undefined || edge >= this.readingLine()) return
    E.afterSolidUpdate(() => {
      const moved = this.box!.getBoundingClientRect().bottom - edge
      if (Math.abs(moved) >= 1) window.scrollBy({ top: moved, behavior: "instant" })
    })
  }

  /** Where top-level titles stick, px from the viewport top:  the page's `--epic-stack`;  0 outside a page. */
  private readingLine(): number {
    const stack = parseFloat(getComputedStyle(this.domElement).getPropertyValue(STACK_PROPERTY))
    return Number.isNaN(stack) ? 0 : stack
  }

  ////////////////
  // ## Drawing
  ////////////////

  /** Open or folded:  open, until the reader folds it. */
  readonly fold = new Fold(() => true)

  /** Its box, as drawn:  its bottom edge is how `follow()` keeps the reader's place. */
  private box: HTMLDivElement | undefined

  render(): JSX.Element {
    return (
      // ALWAYS here, empty without agents:  its bottom edge is how `follow()` keeps the reader's place
      <div ref={(element) => (this.box = element)} class={AGENTS_BOX} part={this.partForName("base")}>
        <Show when={this.agents.length}>
          <div class={AGENTS} role="region" aria-label={this.translationForKey("agents")}>
            <button
              type="button"
              class={AGENTS_TITLE}
              aria-expanded={this.fold.isOpen() ? "true" : "false"}
              aria-controls={AGENTS_LIST}
              onClick={this.fold.toggle}
            >
              {Fold.chevron()}
              {/* a span around the icon:  `ui-icon`'s host is `display: contents`, which can't be placed */}
              <span>
                <ui-icon name="robot" />
              </span>
              <b>{this.translationForKey("agents")}</b>
              <Show when={this.agents.length > 1}>
                <span class={AGENTS_COUNT}>{this.agents.length}</span>
              </Show>
            </button>
            <div ref={this.fold.watch} id={AGENTS_LIST} class="agents-list" hidden={this.fold.hidden()}>
              <For each={this.agents} keyed={(agent) => agent.name}>
                {(agent) => this.row(agent, this.redirectFor(agent))}
              </For>
            </div>
          </div>
        </Show>
      </div>
    )
  }

  /**
   * One running agent:  its name, status (`active` blue, `blocked on <name>` orange, else grey) and age (its start
   * time in the tooltip), its task, the redirects so far ("You · 10:42 · told 10:43", or "waiting for the session"),
   * then a note box that grows as it's typed in, with Send (`Redirect`).
   * - the box is the DOM's own (never set from the agent):  a poll redraws everything around it, never it
   */
  private row(agent: () => RunningAgent, redirect: Redirect): JSX.Element {
    const name = redirect.name
    return (
      <div class={AGENT} data-name={name}>
        <div class={AGENT_LINE}>
          <b>
            <code class={AGENT_NAME}>{agent().name}</code>
          </b>
          <ui-label size="mini" basic="" color={statusColorOf(agent().status)}>
            {agent().status}
          </ui-label>
          <span class={AGENT_AGE} title={this.startedTip(agent())}>
            {ageOf(agent().started, Date.now())}
          </span>
        </div>
        <p class={AGENT_TASK}>{agent().task}</p>
        <Show when={agent().redirects.length}>
          <ul class={AGENT_REDIRECTS}>
            {/* by position:  redirects only ever append */}
            <For each={agent().redirects} keyed={false}>
              {(said) => (
                <li>
                  <span class={AGENT_SAID}>
                    <span>
                      <ui-icon name="comment" />
                    </span>
                    <b>{this.translationForKey("agentYou")}</b> · {clockOf(said().at)} ·{" "}
                    {said().told
                      ? this.translationForKey("agentTold", { time: clockOf(said().told) })
                      : this.translationForKey("agentWaiting")}
                  </span>
                  <span class={AGENT_SAID_NOTE}>{said().note}</span>
                </li>
              )}
            </For>
          </ul>
        </Show>
        <div class={AGENT_REDIRECT}>
          <textarea
            ref={(element) => (redirect.note = element)}
            class={AGENT_NOTE}
            rows="1"
            placeholder={this.translationForKey("agentNote", { name })}
            aria-label={this.translationForKey("agentNoteLabel", { name })}
            onInput={() => redirect.typed()}
            onKeyDown={(event: KeyboardEvent) => redirect.onKey(event)}
          />
          <ui-button
            class={AGENT_SEND}
            circular=""
            color="blue"
            icon="paper plane"
            size="mini"
            disabled={redirect.canSend ? undefined : ""}
            loading={redirect.isSending ? "" : undefined}
            onClick={() => redirect.sendNote()}
          >
            {this.translationForKey("agentSend")}
          </ui-button>
        </div>
        <Show when={redirect.error}>
          <p class={AGENT_ERROR} role="alert">
            {redirect.error}
          </p>
        </Show>
      </div>
    )
  }

  /** A row's note box:  for its agent, keyed by name, read once as the row is made. */
  @E.untracked
  private redirectFor(agent: () => RunningAgent): Redirect {
    return new Redirect(agent().name, this.client!)
  }

  /** An age's tooltip:  when it started;  none when unknown. */
  private startedTip(agent: RunningAgent): string | undefined {
    const time = clockOf(agent.started)
    return time ? this.translationForKey("agentStarted", { time }) : undefined
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicAgents extends E.AttributeValues<typeof epicAgentsVocabulary> {}

/****************
 * ### `Redirect`
 * One agent's note box, as its row draws it:  what can be sent, a send on its way, and why the last one failed.
 * - Send, or Cmd / Ctrl + Enter:  `POST redirect`;  the box empties once sent (unless typed on meanwhile), else the
 *   error shows under it, as a sentence
 * - MUST be created under the row's owner:  its members are signals
 ****************/
class Redirect {
  /** Something is typed:  Send is on. */
  @E.state accessor canSend = false

  /** A redirect on its way:  Send spins. */
  @E.state accessor isSending = false

  /** Why the last one failed, as a sentence;  `""` for none. */
  @E.state accessor error = ""

  /** The note box, as drawn. */
  note: HTMLTextAreaElement | undefined

  /** A redirect on its way:  a second Send waits for it (a plain flag:  read right after it's set). */
  private busy = false

  /** `name`:  the row's agent, its key, the same for the row's life. */
  constructor(
    readonly name: string,
    private readonly client: AgentsClient
  ) {}

  /** A key typed:  Send on while there's something to send. */
  typed() {
    this.canSend = !!this.note!.value.trim()
  }

  /** Cmd / Ctrl + Enter in the box:  Send. */
  onKey(event: KeyboardEvent) {
    if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey)) return
    event.preventDefault()
    this.sendNote()
  }

  /** Send, clicked or keyed. */
  sendNote() {
    void this.send().catch((failure: unknown) => console.error("EpicAgents:  couldn't send", failure))
  }

  /**
   * Send the box's note to the agent:  the box empties once it's in the list (unless typed on meanwhile), else the
   * error shows under it.  Nothing for an empty box, or while one is on its way.
   */
  private async send() {
    const note = this.note!
    const typed = note.value.trim()
    if (!typed || this.busy) return
    this.busy = true
    this.isSending = true
    this.error = ""
    try {
      await this.client.redirect(this.name, typed)
      if (note.value.trim() === typed) note.value = ""
    } catch (failure) {
      this.error = sentence((failure as Error).message)
    } finally {
      this.busy = false
      this.isSending = false
      this.canSend = !!note.value.trim()
    }
  }
}

/** An agent's status label colour:  `active` blue, `blocked on <name>` orange, anything else grey. */
function statusColorOf(status: string): "blue" | "orange" | "grey" {
  return status === "active" ? "blue" : /^blocked\b/.test(status) ? "orange" : "grey"
}

/** Classes of the shadow markup:  its box, title and count, and each agent's row. */
const AGENTS_BOX = "agents-box"
const AGENTS = "agents"
const AGENTS_TITLE = "agents-title"
const AGENTS_COUNT = "agents-count"
const AGENT = "agent"
const AGENT_LINE = "agent-line"
const AGENT_NAME = "agent-name"
const AGENT_AGE = "agent-age"
const AGENT_TASK = "agent-task"
const AGENT_REDIRECTS = "agent-redirects"
const AGENT_SAID = "agent-said"
const AGENT_SAID_NOTE = "agent-said-note"
const AGENT_REDIRECT = "agent-redirect"
const AGENT_NOTE = "agent-note"
const AGENT_SEND = "agent-send"
const AGENT_ERROR = "agent-error"

/** `id` of the rows' box, which the title controls. */
const AGENTS_LIST = "agents-list"
