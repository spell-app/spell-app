import { For, Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { SPACES } from "spell-app/spaces"
import { appTexts } from "spell-app/app/ui/AppTexts"
import {
  Actions,
  AppMenu,
  MoreMenu,
  SpellPage,
  Submenu,
  ThemeMenu,
  openProject,
  trackProjectRoot,
  type ProjectRootState
} from "spell-app/app/solid"

import "./ProjectChooser.css"

/****************
 * ### `<ProjectChooser>`
 * The landing page:  a hero line over cards for the examples, the guides and your own projects.
 * - Laid out as the facelift boards' home (epic `debut` P4):  a hero with the first example a click away,
 *   then a grid of cards per group, each card a project's title and the first phrase of its description.
 * - No empty columns:  a group with nothing in it says so in one quiet card;  "create" buttons sit in their
 *   group's header.
 * - In dev, also the test fixtures (`@spell/test`) -- open one to look at it, edit it, then
 *   `yarn spell:test:fixtures:bless`.  No "create" for those:  copy a project into `spaces/@spell/test/`.
 * - Every route the others don't take (`routes.tsx`).
 * - Its look follows the editor's theme:  the hero and cards are tokens (`ProjectChooser.css`).
 ****************/
export function ProjectChooser() {
  const { projects, examples, guides, fixtures } = SPACES.SpellProjectRoot
  // a dev-only root is there in every build -- just not listed outside dev
  const showFixtures = !!import.meta.env?.DEV || !fixtures.devOnly
  const exampleList = trackProjectRoot(() => examples)
  const guideList = trackProjectRoot(() => guides)

  return (
    <SpellPage id="ProjectChooser" fillWindow dark scrolling>
      <div class="Home">
        <ChooserToolbar />
        <Hero examples={exampleList()} guides={guideList()} />
        <ProjectCards
          id="examples"
          projectRoot={examples}
          line={appTexts.text("homeExamplesLine")}
          create={<Actions.createExample button basic="" size="small" />}
        />
        <ProjectCards
          id="guides"
          projectRoot={guides}
          line={appTexts.text("homeGuidesLine")}
          empty={appTexts.text("homeNoGuides")}
          useRunner
          create={<Actions.createGuide button basic="" size="small" />}
        />
        <ProjectCards
          id="projects"
          projectRoot={projects}
          line={appTexts.text("homeProjectsLine")}
          create={<Actions.createProject button basic="" size="small" />}
        />
        <Show when={showFixtures}>
          <ProjectCards id="fixtures" projectRoot={fixtures} line={appTexts.text("homeFixturesLine")} small />
        </Show>
      </div>
    </SpellPage>
  )
}

/****************
 * ### `<Hero>`
 * The landing page's first box:  what Spell is, in a line, with buttons to the first example and the first guide,
 * beside a few lines of the Task List.
 ****************/
function Hero(props: { examples: ProjectRootState; guides: ProjectRootState }) {
  const firstExample = () => props.examples.projects[0]?.path
  const firstGuide = () => props.guides.projects[0]?.path
  return (
    <section class="Hero">
      <div class="pitch">
        <span class="eyebrow">{appTexts.text("homeEyebrow")}</span>
        <h1>{appTexts.text("homeTitle")}</h1>
        <p class="tagline">{appTexts.text("homeTagline")}</p>
        <p class="intro">{appTexts.text("homeIntro")}</p>
        <div class="buttons">
          <ui-button
            primary=""
            size="large"
            icon="magic"
            disabled={!firstExample()}
            onClick={() => firstExample() && openProject(firstExample()!)}
          >
            {appTexts.text("tryAnExample")}
          </ui-button>
          <ui-button
            basic=""
            size="large"
            icon="book"
            onClick={() => {
              if (firstGuide()) openProject(firstGuide()!, true)
              else document.getElementById("guides")?.scrollIntoView({ behavior: "smooth" })
            }}
          >
            {appTexts.text("readFirstSpell")}
          </ui-button>
        </div>
      </div>
      <figure class="quote">
        <figcaption>{appTexts.text("homeQuoteTitle")}</figcaption>
        <blockquote>{appTexts.text("homeQuote")}</blockquote>
        <span class="note">
          <ui-icon name="magic" />
          {appTexts.text("homeQuoteNote")}
        </span>
      </figure>
    </section>
  )
}

/****************
 * ### `<ProjectCards>`
 * One group of the landing page:  its title and line, its "create" button, then a card per project.
 * - A card:  a coloured tile with the project's initial, its title, and the first phrase of its description.
 * - Clicking one opens it in the editor (`useRunner`:  in the runner).
 * - Nothing in it:  one quiet card saying so (`empty`, else "No examples yet!").
 ****************/
function ProjectCards(props: ProjectCardsProps) {
  const root = trackProjectRoot(() => props.projectRoot)
  return (
    <section id={props.id} class={["ProjectCards", { small: !!props.small }]}>
      <header>
        <h2>
          {root().words.title}. <span class="line">{props.line}</span>
        </h2>
        {props.create}
      </header>
      <div class="cards">
        <Show
          when={root().loaded}
          fallback={
            <div class="card empty">
              {root().failed ? appTexts.text("couldNotLoadGroup", root().words) : appTexts.text("loadingGroup")}
            </div>
          }
        >
          <For
            each={root().projects}
            fallback={<div class="card empty">{props.empty ?? appTexts.text("nothingInGroup", root().words)}</div>}
          >
            {(project) => (
              <a
                class="card"
                href={project.path}
                onClick={(event) => {
                  event.preventDefault()
                  openProject(project.path, props.useRunner)
                }}
              >
                <span class="tile" style={{ "--ProjectCards-hue": hueFor(project.path) }} aria-hidden="true">
                  {project.name.charAt(0)}
                </span>
                <span class="text">
                  <span class="title">{project.name}</span>
                  <Show when={firstPhrase(project.description)}>
                    <span class="description">{firstPhrase(project.description)}</span>
                  </Show>
                </span>
              </a>
            )}
          </For>
        </Show>
      </div>
    </section>
  )
}

/** Props for `<ProjectCards>`. */
type ProjectCardsProps = {
  /** The section's id:  a link target (`#examples`). */
  id: string
  /** The group whose projects to show. */
  projectRoot: SPACES.SpellProjectRoot
  /** The quiet line after its title. */
  line: string
  /** Its "create" button, in its header. */
  create?: JSX.Element
  /** What its one card says while it's empty;  default "No examples yet!". */
  empty?: string
  /** Open its projects in the runner, not the editor. */
  useRunner?: boolean
  /** Smaller cards, e.g. the test fixtures. */
  small?: boolean
}

/**
 * The first phrase of a project's description, for its card:  up to its first `:`, `;` or sentence's end.
 * - `"A to-do list in the outline style:  each task ..."` => `"A to-do list in the outline style"`.
 */
function firstPhrase(description: string | undefined): string | undefined {
  return description?.split(/[:;]\s|\.\s/)[0]?.trim() || undefined
}

/** A hue for a project's tile, the same every time:  from its address. */
function hueFor(path: string): string {
  let hash = 0
  for (const char of path) hash = (hash * 31 + char.charCodeAt(0)) % 360
  return `${hash}`
}

/****************
 * ### `<ChooserToolbar>`
 * Top menu of `<ProjectChooser>`:  the chooser (active), the looks, and about.
 ****************/
export function ChooserToolbar() {
  return (
    <AppMenu>
      <Submenu left spring />
      <Submenu center spring>
        <Actions.showProjectChooser active />
      </Submenu>
      <Submenu right spring>
        <ThemeMenu />
        <Actions.aboutSpell />
        <Actions.you />
        <MoreMenu stub />
      </Submenu>
    </AppMenu>
  )
}
