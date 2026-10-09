import { For, Show, createEffect, createSignal, untrack } from "solid-js"

import { E } from "$/ui/core"

// the fold pieces every `<epic-*>` fold shares:  their files, not `epic-item`'s barrel
import { Chevron } from "$/epics/components/epic-item/Chevron"
import { Fold } from "$/epics/components/epic-item/Fold"
import { ageOf, clockOf, sentence, type AgentsClient, type RunningAgent } from "$/epics/review"

import {
  AGENT,
  AGENT_AGE,
  AGENT_ERROR,
  AGENT_LINE,
  AGENT_NAME,
  AGENT_NOTE,
  AGENT_REDIRECT,
  AGENT_REDIRECTS,
  AGENT_SAID,
  AGENT_SAID_NOTE,
  AGENT_SEND,
  AGENT_TASK,
  AGENTS,
  AGENTS_BOX,
  AGENTS_COUNT,
  AGENTS_TITLE,
  type PageText
} from "./EpicPage.types"

/****************
 * ### `<AgentsPanel>`
 * The epic's RUNNING AGENTS (epic `skillz` P3), drawn by `<epic-page>` right before its blocks:
 * "Agents running" (a robot, the count when more than one), a row per agent, each with a note box that REDIRECTS it.
 * - it FOLDS from its title, like every titled box (Owen, 2026-10-08);  open to start with:  it's live news
 * - shown ONLY while the page's `AgentsClient` is `listed` (a plan doc served with a token, the list answering) and
 *   an agent runs
 * - in the page's shadow root, NOT a section:
 *   the contents, the rail and the counts never see it (they read the light DOM)
 * - one row per agent, KEYED by name (`<AgentRow>`):  a poll updates it in place, never touching what's typed in its
 *   box, nor its focus
 * - keeps the reader's place:  read below it, the page scrolls by what it grew or shrank as it comes,
 *   changes or goes (`follow()`)
 * - Plain Solid, no element of its own:  the caller passes its client, `connected`, the reading line and `text()`;
 *   its look is `AgentsPanel.css`, adopted by `<epic-page>`
 ****************/
export function AgentsPanel(props: AgentsPanelProps) {
  const client = untrack(() => props.client)
  /** The client's `version`, as a signal:  `agents()` tracks it. */
  const [version, setVersion] = createSignal(0)
  let box: HTMLDivElement | undefined
  /** Open or folded:  open, until the reader folds it. */
  const fold = new Fold(() => true)
  // follow the client while connected:  a kept-alive page that's gone stops listening
  createEffect(
    () => props.connected,
    (connected) => {
      if (!connected || !client) return undefined
      setVersion(client.version)
      return client.subscribe(follow)
    }
  )
  return (
    // ALWAYS here, empty without agents:  its bottom edge is how `follow()` keeps the reader's place
    <div ref={(element) => (box = element)} class={AGENTS_BOX}>
      <Show when={agents().length}>
        <div class={AGENTS} role="region" aria-label={props.text("agents")}>
          <button
            type="button"
            class={AGENTS_TITLE}
            aria-expanded={fold.isOpen() ? "true" : "false"}
            aria-controls="agents-list"
            onClick={fold.toggle}
          >
            <Chevron />
            {/* a span around the icon:  `ui-icon`'s host is `display: contents`, which can't be placed */}
            <span>
              <ui-icon name="robot" />
            </span>
            <b>{props.text("agents")}</b>
            <Show when={agents().length > 1}>
              <span class={AGENTS_COUNT}>{agents().length}</span>
            </Show>
          </button>
          <div ref={fold.watch} id="agents-list" class="agents-list" hidden={fold.hidden()}>
            <For each={agents()} keyed={(agent) => agent.name}>
              {(agent) => <AgentRow agent={agent()} client={client!} text={props.text} />}
            </For>
          </div>
        </div>
      </Show>
    </div>
  )

  /** The agents shown:  every one running while listed;  none otherwise. */
  function agents(): RunningAgent[] {
    version()
    return client?.listed ? client.agents : []
  }

  /**
   * The client changed:  show it.  While the reader is below the panel (its bottom edge above the reading line),
   * scroll by what it grew or shrank once it's drawn, so what they read stays put.
   * - after Solid's own flush (a microtask queued after the write runs after it), before the next paint
   * - measured, not assumed:  a browser that anchors the scroll itself leaves nothing to make up
   */
  function follow() {
    const edge = box?.getBoundingClientRect().bottom
    setVersion(client!.version)
    if (edge === undefined || edge >= untrack(() => props.top)) return
    E.afterSolidUpdate(() => {
      const moved = box!.getBoundingClientRect().bottom - edge
      if (Math.abs(moved) >= 1) window.scrollBy({ top: moved, behavior: "instant" })
    })
  }
}

/** Props for `<AgentsPanel>`. */
export type AgentsPanelProps = {
  /** the page's running-agents client;  none in a server render (nothing drawn).  Read once, as it mounts. */
  client: AgentsClient | undefined
  /** the page is connected:  the panel follows its client */
  connected: boolean
  /** the reading line:  where top-level titles stick, px from the viewport top (`EpicPage.signals.top`) */
  top: number
  /** the page's `text()` */
  text: PageText
}

/****************
 * ### `<AgentRow>`
 * One running agent:  its name, status (`active` blue, `blocked on <name>` orange, else grey) and age (its start
 * time in the tooltip), its task, the redirects so far ("You · 10:42 · told 10:43", or "waiting for the session"),
 * then a note box that grows as it's typed in, with Send.
 * - Send, or Cmd / Ctrl + Enter:  `POST redirect`;  the box empties once sent (unless typed on meanwhile), else the
 *   error shows under it, as a sentence
 * - the box is the DOM's own (never set from the agent):  a poll redraws everything around it, never it
 ****************/
function AgentRow(props: AgentRowProps) {
  let note: HTMLTextAreaElement | undefined
  /** A redirect on its way:  a second Send waits for it (a plain flag:  read right after it's set). */
  let busy = false
  /** The row's agent:  its key, the same for the row's life. */
  const name = untrack(() => props.agent.name)
  const [canSend, setCanSend] = createSignal(false)
  const [sending, setSending] = createSignal(false)
  const [error, setError] = createSignal("")
  return (
    <div class={AGENT} data-name={name}>
      <div class={AGENT_LINE}>
        <b>
          <code class={AGENT_NAME}>{props.agent.name}</code>
        </b>
        <ui-label size="mini" basic="" color={statusColorOf(props.agent.status)}>
          {props.agent.status}
        </ui-label>
        <span class={AGENT_AGE} title={startedTip()}>
          {ageOf(props.agent.started, Date.now())}
        </span>
      </div>
      <p class={AGENT_TASK}>{props.agent.task}</p>
      <Show when={props.agent.redirects.length}>
        <ul class={AGENT_REDIRECTS}>
          {/* by position:  redirects only ever append */}
          <For each={props.agent.redirects} keyed={false}>
            {(redirect) => (
              <li>
                <span class={AGENT_SAID}>
                  <span>
                    <ui-icon name="comment" />
                  </span>
                  <b>{props.text("agentYou")}</b> · {clockOf(redirect().at)} ·{" "}
                  {redirect().told
                    ? props.text("agentTold", { time: clockOf(redirect().told) })
                    : props.text("agentWaiting")}
                </span>
                <span class={AGENT_SAID_NOTE}>{redirect().note}</span>
              </li>
            )}
          </For>
        </ul>
      </Show>
      <div class={AGENT_REDIRECT}>
        <textarea
          ref={(element) => (note = element)}
          class={AGENT_NOTE}
          rows="1"
          placeholder={props.text("agentNote", { name })}
          aria-label={props.text("agentNoteLabel", { name })}
          onInput={() => setCanSend(!!note!.value.trim())}
          onKeyDown={onKeyDown}
        />
        <ui-button
          class={AGENT_SEND}
          circular=""
          color="blue"
          icon="paper plane"
          size="mini"
          disabled={canSend() ? undefined : ""}
          loading={sending() ? "" : undefined}
          onClick={sendNote}
        >
          {props.text("agentSend")}
        </ui-button>
      </div>
      <Show when={error()}>
        <p class={AGENT_ERROR} role="alert">
          {error()}
        </p>
      </Show>
    </div>
  )

  /** The age's tooltip:  when it started;  none when unknown. */
  function startedTip(): string | undefined {
    const time = clockOf(props.agent.started)
    return time ? props.text("agentStarted", { time }) : undefined
  }

  /** Cmd / Ctrl + Enter in the box:  Send. */
  function onKeyDown(event: KeyboardEvent) {
    if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey)) return
    event.preventDefault()
    sendNote()
  }

  /** Send, clicked or keyed. */
  function sendNote() {
    void send().catch((failure: unknown) => console.error("AgentRow:  couldn't send", failure))
  }

  /**
   * Send the box's note to the agent:  the box empties once it's in the list (unless typed on meanwhile), else the
   * error shows under it.  Nothing for an empty box, or while one is on its way.
   */
  async function send() {
    const typed = note!.value.trim()
    if (!typed || busy) return
    busy = true
    setSending(true)
    setError("")
    try {
      await props.client.redirect(name, typed)
      if (note!.value.trim() === typed) note!.value = ""
    } catch (failure) {
      setError(sentence((failure as Error).message))
    } finally {
      busy = false
      setSending(false)
      setCanSend(!!note!.value.trim())
    }
  }
}

/** Props for `<AgentRow>`. */
type AgentRowProps = {
  /** the agent, as last read:  a new object each read, the same `name` */
  agent: RunningAgent
  /** the page's running-agents client:  where Send goes */
  client: AgentsClient
  /** the page's `text()` */
  text: PageText
}

/** An agent's status label colour:  `active` blue, `blocked on <name>` orange, anything else grey. */
function statusColorOf(status: string): "blue" | "orange" | "grey" {
  return status === "active" ? "blue" : /^blocked\b/.test(status) ? "orange" : "grey"
}
