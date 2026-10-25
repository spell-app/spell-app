import { createSignal, For, Show } from "solid-js"
import { render } from "@solidjs/web"

import { KnownFormat, LoadableFile, parseJSON } from "spell/util"

import type { SPACES } from "spell-app/spaces"
import { UI as SpellUI } from "spell-ui"
import { appTexts } from "spell-app/app/ui/AppTexts"
import { uiReady } from "spell-app/app/solid/loadUI"

import "./YouPanel.css"

/** Where the panel reads and saves this machine's person:  spaces' people routes (`peopleRoutes.ts`). */
const ME_URL = "/api/people/me"

/****************
 * ### `<YouPanel>`
 * The "You" panel (epic `people-and-orgs` P9, Q13):  this machine's person, to change, and their orgs, to read.
 * - A `<ui-modal>` with a `<ui-form>`:
 *   - names, nickname
 *   - emails, one a line
 *   - dated events, each a label and a day, added and removed by row
 * - Their orgs, and their role in each, read only.
 * - What their file got wrong (`checkEntry()`'s problems), above the form:  read anyway.
 * - Save writes their `__me.json5` through the server (`POST /api/people/me`), its comments kept;
 *   Cancel or Escape changes nothing.
 * - The fields keep their own values:  Save reads each `<ui-input>`'s `value`, as `<Chooser>` reads its choices.
 * - Show one with `openYouPanel()`, which reads the person first, mounts it, and cleans up.
 ****************/
export function YouPanel(props: YouPanelProps) {
  let modal: HTMLElement | undefined
  let changes: SPACES.PersonChanges | undefined
  // each row is its own object, so <For> keeps a row's fields while others are added or removed
  const [dates, setDates] = createSignal(props.me.person.dates.map((date) => ({ ...date })))
  return (
    <ui-modal
      class="YouPanel"
      size="small"
      closedby="closerequest"
      heading={appTexts.text("youHeader", { address: props.me.person.address })}
      visible=""
      ref={(element: HTMLElement) => {
        modal = element
        modal.addEventListener("ui-approving", save)
        modal.addEventListener("ui-closed", done, { once: true })
      }}
    >
      <ui-content>
        <Show when={props.me.problems.length > 0}>
          <ui-message state="warning" size="small" heading={appTexts.text("fileProblems")}>
            <ul>
              <For each={props.me.problems}>
                {(problem) => (
                  <li>
                    {problem.file}: {problem.message}
                  </li>
                )}
              </For>
            </ul>
          </ui-message>
        </Show>
        <ui-form>
          <ui-field>
            <label for="YouPanel-names">{appTexts.text("names")}</label>
            <ui-input id="YouPanel-names" name="names" value={props.me.person.names} />
          </ui-field>
          <ui-field>
            <label for="YouPanel-nickname">{appTexts.text("nickname")}</label>
            <ui-input id="YouPanel-nickname" name="nickname" value={props.me.person.nickname} />
          </ui-field>
          <ui-field>
            <label for="YouPanel-emails">{appTexts.text("emails")}</label>
            <ui-textarea id="YouPanel-emails" name="emails" rows="2" value={props.me.person.emails.join("\n")} />
          </ui-field>
          <ui-field>
            <label>{appTexts.text("dates")}</label>
            <For each={dates()}>
              {(date) => (
                <div class="date">
                  <ui-input
                    class="label"
                    aria-label={appTexts.text("dateWhat")}
                    placeholder={appTexts.text("datePlaceholder")}
                    value={date.label}
                  />
                  <ui-input class="day" aria-label={appTexts.text("dateDay")} type="date" value={date.day} />
                  <ui-button
                    icon="trash alternate outline"
                    aria-label={appTexts.text("dateRemove")}
                    appearance="basic"
                    onClick={() => setDates(dates().filter((each) => each !== date))}
                  />
                </div>
              )}
            </For>
            <ui-button icon="plus" appearance="basic" size="small" onClick={() => setDates([...dates(), { label: "", day: "" }])}>
              {appTexts.text("addDate")}
            </ui-button>
          </ui-field>
        </ui-form>
        <h4>{appTexts.text("yourOrgs")}</h4>
        <Show when={props.me.orgs.length > 0} fallback={<p>{appTexts.text("noneYet")}</p>}>
          <ui-list>
            <For each={props.me.orgs}>
              {(org) => (
                <ui-item icon="users">
                  {org.name} · {org.role}
                </ui-item>
              )}
            </For>
          </ui-list>
        </Show>
      </ui-content>
      <ui-actions>
        <ui-button class="cancel">{SpellUI.i18n.t("cancel")}</ui-button>
        <ui-button class="approve" color="primary" onClick={save}>
          {appTexts.text("save")}
        </ui-button>
      </ui-actions>
    </ui-modal>
  )

  /**
   * Save:  note what the fields say now, while they're still in the page.
   * - On the button's own click as well as the modal's `ui-approving`, so the fields are read before anything hides it.
   */
  function save() {
    const field = (selector: string) => modal!.querySelector<HTMLElement & { value: string }>(selector)?.value ?? ""
    const values = (selector: string) =>
      [...modal!.querySelectorAll<HTMLElement & { value: string }>(selector)].map((input) => input.value)
    const labels = values(".date .label")
    const days = values(".date .day")
    changes = {
      names: field("#YouPanel-names"),
      nickname: field("#YouPanel-nickname"),
      emails: field("#YouPanel-emails")
        .split("\n")
        .map((email) => email.trim())
        .filter(Boolean),
      dates: labels.map((label, index) => ({ label, day: days[index] ?? "" }))
    }
  }

  /** Hidden:  hand on the changes (`undefined` unless Save ran `save()`). */
  function done() {
    props.onClose(changes)
  }
}

/** Props for `<YouPanel>`. */
export type YouPanelProps = {
  /** The person, their orgs and their file's problems:  `GET /api/people/me`'s answer. */
  me: SPACES.MeAnswer
  /** Called once, after the panel has hidden:  with what to save, or `undefined` for Cancel. */
  onClose: (changes: SPACES.PersonChanges | undefined) => void
}

/**
 * Show the "You" panel:  read this machine's person, show `<YouPanel>`, and save what it says on Save.
 * - Resolves the person as saved, or as read for Cancel.
 * - SIDE EFFECT:  a `<div class="YouPanelRoot">` in `<body>` holding the panel, until it has hidden.
 * - throws if the server can't read or save them:  the editor shows it.
 */
export async function openYouPanel(): Promise<SPACES.MeAnswer> {
  const [me] = await Promise.all([meRequest("GET"), uiReady])
  const root = document.createElement("div")
  root.className = "YouPanelRoot"
  document.body.append(root)
  const changes = await new Promise<SPACES.PersonChanges | undefined>((resolve) => {
    const dispose = render(() => <YouPanel me={me} onClose={finish} />, root)

    /** Unmount, then resolve. */
    function finish(value: SPACES.PersonChanges | undefined) {
      dispose()
      root.remove()
      resolve(value)
    }
  })
  return changes ? meRequest("POST", changes) : me
}

/**
 * `GET` or `POST /api/people/me`, its answer read;  throws with the server's message if it fails.
 * - Through `LoadableFile.fetch`, as every file is read:  the editor's static build refuses it (`StaticFiles`),
 *   and hides the panel.
 */
async function meRequest(method: "GET" | "POST", changes?: SPACES.PersonChanges): Promise<SPACES.MeAnswer> {
  try {
    return await LoadableFile.fetch<SPACES.MeAnswer>({
      url: ME_URL,
      method,
      format: KnownFormat.json,
      ...(changes && { contents: changes, requestFormat: KnownFormat.json })
    })
  } catch (error) {
    throw new Error(serverMessage(error) ?? `${method} ${ME_URL}:  ${String(error)}`, { cause: error })
  }
}

/** First message of the server's `{ errors: [{ message }] }` answer in `error`, if that's what it holds. */
function serverMessage(error: unknown): string | undefined {
  const text = (error as { props?: { message?: unknown } })?.props?.message
  if (typeof text !== "string") return undefined
  const answer = parseJSON(text, ME_URL, true) as { errors?: { message: string }[] } | undefined
  return answer?.errors?.[0]?.message
}
