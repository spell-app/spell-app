/**
 * Every name `<spell-app>` adds to a root's:  tag, attributes, events, texts.
 * Schema:  `E.ComponentVocabulary` (`$/ui/core`).
 * - `<spell-app>` is a root (`UIRoot`):
 *   its whole vocabulary is `<ui-root>`'s names, then these (`SpellApp.vocabulary`, `SpellApp.tsx`).
 * - Where both name an attribute, this one wins:
 *   `display` and `icons` (other defaults), `width`, `height` and `assets` (other meanings).
 * - Pure data:  `import type` only, so node can read it (the component pack's catalog, `vite.element.config.ts`).
 */

import type { E } from "$/ui/core"

/****************
 * ### `<spell-app>`
 * Runs a compiled spell project in any page, in its own shadow root:  no editor.
 * A root, as `<ui-root>` is.
 ****************/
export const spellAppVocabulary = {
  tag: "spell-app",
  topics: ["containers", "views"],
  aka: ["app runner", "program", "playground", "embed"],
  noun: "app",
  ui: false,
  description:
    "Runs a compiled spell project in any page, in its own shadow root:  from the spell server (`project`), from " +
    "files anywhere (`src`), or what a `<spell-editor>` compiles (`editor`, `run()`).  A root, as `<ui-root>` is:  " +
    "it loads the Spell UI widgets it draws, and the other spell tags inside it, as they appear.",
  attributes: [
    {
      name: "project",
      kind: "string",
      description:
        "What to run, from the spell server's `/api`, sources and all:  `@system:examples:Solitaire`, or " +
        "`@examples/Solitaire`.  The Type Explorer shows each declaration's spell and compiled code."
    },
    {
      name: "src",
      kind: "string",
      description:
        "What to run, from anywhere:  `apps/Solitaire.compiled.js`.  Its scope pack (`Solitaire.scopes.js`), " +
        "declarations (`Solitaire.declarations.json`) and the projects it imports (`Cards.compiled.js`) are beside it."
    },
    { name: "scopes", kind: "string", description: "Where its scope pack is, if not where `project` / `src` says." },
    { name: "name", kind: "string", description: "Its name in the toolbar;  default, its project's." },
    {
      name: "editor",
      kind: "string",
      description:
        "A CSS selector for a `<spell-editor>` in the same document or shadow root:  runs what it compiles, and " +
        "what it compiled already.  Waits for it without `project` or `src`."
    },
    { name: "toolbar", kind: "boolean", description: "Shows the toolbar:  its name, Restart, Debug." },
    {
      name: "debug",
      kind: "enum",
      values: ["explorer", "things", "console"],
      description: "Opens the debug pane to start, on that tab."
    },
    {
      name: "width",
      kind: "string",
      description: "`fluid` (the default) or a CSS length (`50%`, `30em`), set as its inline style."
    },
    {
      name: "height",
      kind: "string",
      description:
        "`fluid` (the default:  as tall as the app, plus the debug pane if open) or a CSS length, set as its " +
        "inline style."
    },
    {
      name: "assets",
      kind: "string",
      description:
        "Where Semantic UI, Lato, `spell-app.css` and the icon packs (`icon-packs/`) are;  default, beside its " +
        "script.  Semantic UI's sheets are read as it joins the page."
    },
    {
      name: "display",
      kind: "enum",
      values: ["skeleton", "when-ready", "immediately"],
      default: "immediately",
      description:
        "While the Spell UI widgets it draws load, as `<ui-root>`'s:  `immediately` (the default) -- draw as they " +
        "arrive;  `when-ready` -- nothing (space kept) until they're ready;  `skeleton` -- placeholders."
    },
    {
      name: "icons",
      kind: "string",
      default: "fomantic",
      description:
        "Icon packs for everything inside, as `<ui-root>`'s:  default `fomantic`, the names its toolbar and panes " +
        "use.  The page's own icons, outside it, keep theirs."
    },
    {
      name: "pushed",
      kind: "json",
      reflect: false,
      description:
        "A PROPERTY:  the code pushed to it last (`run()`, or its `editor`), a `SpellCompiled`.  Dropped when " +
        "`project`, `src`, `scopes`, `name` or `editor` changes."
    }
  ],
  events: [
    {
      name: "spell-open",
      detail: "{ href: string }",
      description:
        "A Type Explorer link was clicked:  `href` is the spell source it points at, e.g. " +
        "`spell:/@system:examples:Solitaire/Card.spell#L12`."
    }
  ],
  slots: [],
  parts: [],
  states: [],
  texts: [
    { key: "nothingToRun", text: "Give <spell-app> a project or src to run.", description: "Nothing to run." },
    {
      key: "waitingForEditor",
      text: "Waiting for its editor, {editor}, to compile…",
      description: "An `editor` that hasn't compiled yet, and nothing else to run."
    }
  ]
} as const satisfies E.ComponentVocabulary
