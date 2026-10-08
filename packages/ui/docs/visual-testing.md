# Visual testing

Screenshot regression tests:  every element example, light and dark, in chromium, firefox and webkit, compared
with baselines kept in git.  Playwright's `toHaveScreenshot`, in its own config, separate from Vitest.  Decided by
Owen on 2026-09-30.

```sh
yarn test:visual                     # linux (Docker), all three browsers
yarn test:visual --os local          # this machine's own browsers
yarn test:visual --grep modal        # one family
yarn test:visual --static            # static server render vs elements (report only)
yarn test:visual:update              # accept the new renders (review first!)
```

## What's captured

- **Every `src/components/ui-<family>/examples/elements/<example>.html`**, found on disk
  (`tools/visual/VisualExamples.ts`):  a new example is a new test with no edits anywhere.
- **Closed state** (`<family>/<example> › closed`):  the example as written, captured as its content box
  (`#example` in the fixture page, 16px padding), not the whole page.
- **Open states** (`<family>/<example> › <state>`):  from the example's optional `<example>.visual.ts` hooks
  ("Adding an open state").  Today:  modal, flyout, popup, dropdown, calendar, sidebar, dimmer (page), toast
  (`UI.toast()`).
- **Light and dark**, each in a FRESH page load with `prefers-color-scheme` emulated before the load.  The
  tokens follow the OS scheme (`color-scheme: light dark` on `:root`, see `docs/theming.md`), so this is the same
  switch a person's OS setting makes.  The page is `<body class="ui-typography">`, so the page background and
  text follow the scheme too.
- **The page** (`tools/visual/fixture.html` + `Fixture.ts`, served by the Vite dev server):  the same setup as the
  `yarn dev` demo -- every family defined, every family sheet on the page, the stub owners, the runtime loaded.
- **Stability**, before each capture:
  - viewport 1024 x 768, device scale 1, locale `en-US`, time zone UTC
  - `Date` frozen at `2026-06-15T10:00:00Z` (`page.clock.setFixedTime()`);  native `Temporal.Now` is pointed at
    `Date.now()` by the fixture (the calendar's "today");  the polyfill reads `Date` already
  - reduced motion emulated;  `animations: "disabled"` (finite ones finished, infinite ones -- loaders -- reset);
    caret hidden
  - fonts loaded (`document.fonts.ready`);  every `ui-*` defined and `ready`, through shadow roots;  images
    decoded;  no requests in flight;  the page's element / `<svg>` / shadow-root counts unchanged over two rounds
    (icon glyphs arrive a module import after their icon is `ready`).  Loader-agnostic on purpose:  it waits for
    rendered `<svg>`s, not for any icon API
  - Playwright itself takes screenshots until two in a row match
- Nothing is masked today:  frozen time and disabled animations made every capture deterministic.  A hook can
  still mask a region (`mask` in the hooks).

## Commands and flags

`yarn test:visual [flags]` (`tools/visual/cli.ts`):

| Flag | Values | Default | What |
|---|---|---|---|
| `--os` | `local`, `linux`, `both` | `linux` | where the browsers run;  `both` = `local` then `linux` |
| `--browsers` | `all`, `chrome`, `firefox`, `webkit`, or a comma list | `all` | `chrome` ~== chromium |
| `--update` | | off | accept the new renders as baselines (`--update-snapshots=changed`) |
| `--grep` | families or examples, comma separated:  `ui-button,ui-modal/types` (the `ui-` may be left out) | all | `item` does not select `items` |
| `--parity` | | off | also compare class grammar vs elements ("Parity") |
| `--static` | | off | ONLY compare the static server render vs elements ("Static parity");  `--os` defaults to `local` |
| `--workers` | `4`, `50%` | `50%` | Playwright workers |

- `yarn test:visual:update` ~== `yarn test:visual --update`.
- Exit code:  0 when every OS passed;  1 on a failure or a setup problem (no Docker);  2 on a bad flag.
- NOT part of `yarn review`:  slow, and `linux` needs Docker.  MUST run before a change that alters rendering is
  handed back (`AGENTS.md`).
- Timing on an M-series Mac, `--os local`, all browsers:  about 2.5 minutes for ~560 tests.

## Accepting a change

A change that alters rendering updates its baselines IN THE SAME CHANGE:

1. Run `yarn test:visual` (or `--grep <family>` while iterating).  Failures list the captures that differ.
2. Open the HTML report the run prints:  `yarn playwright show-report tools/results/visual/<os>/report`.  Each
   failure shows expected, actual and a diff (plus a slider).  Look at EVERY one.
3. When every difference is intended, run the same command with `--update`.
4. Run it once more without `--update`:  it must pass.
5. Commit the changed PNGs with the change.  `git diff --stat test/visual/baselines` shows which ones moved.

- `--update` rewrites only the baselines that differ beyond the tolerances, plus missing ones.
- A FULL `--update` run (no `--grep`) also deletes the baselines no example makes any more (a renamed example,
  a removed state), for the OS and browsers it ran.
- A missing baseline fails a plain run once and is written ("A snapshot doesn't exist ..., writing actual"):
  review it, then run again.
- NOTE: the `icon-packs` branch (icons from `UI.icons` packs) will change icon rendering:  expect one
  `--update` of every family with icons after it merges, reviewed like any other.

## Baselines

In plain git (`.gitattributes` marks them `binary`):

```
test/visual/baselines/
  <os>/                    linux | local-<platform>, e.g. local-darwin
    <browser>/             chromium | firefox | webkit
      ui-<family>/
        <example>-<scheme>.png            closed:  ui-button/types-light.png
        <example>.<state>-<scheme>.png    open:    ui-modal/types.open-standard-dark.png
```

- `linux` is the reference:  the same pixels on every machine with Docker.  `local-<platform>` carries the
  platform (`process.platform`), so a Linux laptop running `--os local` never compares against Mac images.
- Diffs and the HTML report go to `tools/results/visual/<os>/` (git-ignored).
- Size:  about 60 kB per PNG on average;  374 PNGs per OS and browser (2026-09-30), about 66 MB per OS for
  all three browsers.

## Docker (`--os linux`)

Linux browsers render the pixels;  everything else stays on the host.

- Our `node_modules` hold macOS-native binaries (rolldown, lightningcss, oxc), so the dev server and the test
  runner can NOT run in the container.  Only a Playwright browser SERVER runs there:
  - image `mcr.microsoft.com/playwright:v<version>-noble`, `<version>` = the installed `@playwright/test`
    (pinned exactly, with `playwright`, in `package.json`:  client, server and browsers MUST match)
  - the host's `node_modules/playwright-core` (pure JS) is mounted read-only and started with the image's Node:
    `run-server --port 3000`, published on `127.0.0.1:<free port>`
  - the tests connect with `connectOptions.wsEndpoint`;  `exposeNetwork: "<loopback>"` tunnels the page's
    `localhost` requests back to the host's dev server
- `tools/visual/DockerBrowserServer.ts`:
  - no `docker` CLI and no `/Applications/Docker.app` => fails, saying how to install it or use `--os local`
  - the CLI missing from `PATH` but Docker Desktop installed => uses the app's own CLI
  - daemon not running => starts Docker Desktop (`open -a Docker`, macOS) and polls `docker info` for up to
    180 s;  on Linux it asks you to start the daemon (that needs root)
  - pulls the image on first use (about 2 GB, once)
  - the container is `--rm`, named `spell-ui-visual-<pid>`, and removed when the run ends:  on success, on
    failure, on Ctrl-C / SIGTERM (the CLI traps them), and on process exit
- Architecture:  Docker runs the image for the host's CPU (arm64 on Apple silicon).  Chromium, Firefox and
  WebKit render the same on arm64 and x86-64 Linux in practice, but that's not guaranteed:  if a CI on x86-64
  ever disagrees with baselines made on a Mac, generate `linux` baselines there.

## Adding an open state

Overlays hidden until opened (modal, flyout, popup, dropdown menu, calendar popup, sidebar, dimmer, toast) only
show their closed state from the example.  To capture them open, add `<example>.visual.ts` next to the example:

```ts
// src/components/ui-modal/examples/elements/types.visual.ts
import { VisualOpen } from "$/ui/test/VisualOpen"
import type { VisualHooks } from "$/ui/test/test.types"

/**
 * Open states of `types.html` for `yarn test:visual`:  each modal shown.
 */
export default {
  states: {
    "open-standard": { open: (root) => VisualOpen.set(root, "#modal-types-standard"), capture: "viewport" }
  }
} satisfies VisualHooks
```

- Each state is its own test on a fresh page, captured light and dark.
- `open(root)` runs IN THE PAGE after the example settled (`root` ~== `#example`), and the page settles again
  after it.  Use the element's own API (`open`, `visible`, `active`, `UI.toast()`), not clicks:  the capture shows
  the state, not the interaction.  `VisualOpen.set(root, selector, property = "open", value = true)` throws when
  the selector matches nothing, so an edited example fails loudly.
- `capture`:  `"example"` (default, the example's box) or `"viewport"` (1024 x 768:  top-layer overlays placed by
  the viewport -- modal, flyout, page dimmer, toast container).  With `"example"`, pick states whose overlay stays
  inside the box, or give the example room (the dropdown example's bottom padding).
- `mask`:  selectors (Playwright CSS, piercing shadow roots) painted over in every capture of the example.  Prefer
  fixing the source (frozen time, disabled animation) over a mask.
- The node side IMPORTS the hook file for its state names, so:  no value imports besides `$/ui/test/VisualOpen`, and
  runtime code imported INSIDE `open()` (`const { UI } = await import("$/ui/runtime")`, see the toast hooks).
- State names are kebab case:  they become part of the file name.

## Tolerances

`VisualSettings.TOLERANCE`, for every capture:

- `threshold: 0.02` -- per-pixel colour distance (pixelmatch, YIQ, 0-1) under which two pixels count as the same.
  Measured on a basic button's 1px border:  0.02 still catches a grey 0.02 OKLCH lightness step (about 5 of 255)
  and a faint hue tint;  Playwright's default (0.2) misses even a 0.05 step.
- `maxDiffPixels: 8` -- differing pixels allowed per image:  a few stray anti-aliased pixels, far fewer than a
  1px border around the smallest control (a 16px checkbox:  60+ pixels).  A 1px -> 2px border on the checkboxes
  changed 142 pixels.
- Same OS + same browser build renders bit-identically run to run (each generation is checked with two clean
  runs), so the tolerances are for cross-machine noise, not flake.

## Parity

`--parity` adds a `parity` test per example that exists both as class grammar (`examples/<x>.html`) and as
elements (`examples/elements/<x>.html`):  both are rendered (light), compared pixel by pixel IN THE BROWSER
(canvas, no image library), and the result is REPORTED in `tools/results/visual/parity.md`, most different first,
with diff images (red = differing pixel).  It never fails the run:  the two markups aren't pixel-identical (headings,
wrappers, shorthands, element-only sections).  Looser tolerance (`VisualSettings.PARITY`):  a channel difference
over 32 of 255, and a pair counts as different over 1% differing pixels (size changes count).

## Static parity

`yarn test:visual --static [--grep <family>] [--browsers chrome]` compares the STATIC server render of each element
example (`$/ui/static`:  `StaticRender` + `StaticStylesheet`, plan `packages/docs/content/plans/seo/seo.html`) with the live
elements, light and dark, using Parity's comparison and tolerances.  Report:  `tools/results/visual/static-parity.md`,
most different first, with diff images, the `ui-*` tags the static page left unrendered, and any page that failed to
render or to be captured (with its error;  Firefox can't capture a page over 32767px tall).

- ONLY the static tests run:  no baselines, nothing to `--update`, never fails.  `--os` defaults to `local` (Docker not
  needed);  about 20 s for chromium.
- Families:  `tools/visual/StaticFamilies.ts`, family folder => the component classes `StaticRender.define()`s.  It
  grows as families become server-ready (plan P3);  a family's examples are compared once it's listed.
- The static page:  `/static/<family>/<example>.html` on the visual dev server (`tools/visual/StaticPages.ts`):
  `fixture.html`'s chrome (body class, `#example` box, viewport) around the rendered example, linking
  `/static/ui.css`, with NO script, so no `ui-*` element is ever defined.  Open one while a run is going, or start the
  same server with `StaticPages` to look at it.
- Rendering runs in node through a second, SSR-only Vite server in vitest's `ssr` posture (`mode: "test"`,
  `test.environment: "node"`):  only then does the Solid plugin compile JSX for the server.  `StaticFixture.verify()`
  fails a page with a `<slot>` left, no `data-ui` root, or a defined tag left unrendered.
- Expect differences that aren't bugs of the render:  icons draw no glyph yet (P3), families not in `StaticFamilies`
  stay bare `ui-*` tags, and an example's own `::part()` CSS matches nothing without shadow roots (plan C3).

## Troubleshooting

- **"Docker isn't installed"** -- install Docker Desktop, or use `--os local` (which compares against your
  platform's `local-*` baselines, not `linux`).
- **"Docker Desktop didn't start within 180s"** -- open Docker Desktop yourself and look for an error or an
  update prompt.  Docker Desktop 4.42.1 crashes at launch on macOS 26 (`SIGSEGV` in `go-m1cpu` during init,
  seen with `open -a Docker --stderr <file>`);  update Docker Desktop.
- **"Executable doesn't exist" for firefox / webkit with `--os local`** -- `yarn test:browsers` once.
- **A capture that differs on every run** (flake) -- fix it at the source, never with retries:
  - an animation or transition the page doesn't disable (Playwright disables CSS animations / transitions and
    Web Animations;  JS-driven motion needs its own `prefers-reduced-motion` handling)
  - time:  anything reading the clock other than `Date` / `Temporal.Now`
  - something loading after the settle:  make it observable (an element, an `<svg>`, a request) so the settle
    loop sees it
  - NEVER switch the colour scheme on a loaded page:  Chromium then repaints only some raster tiles of a
    top-layer overlay (a top flyout's border drawn on one 512px tile, not the next);  each scheme is its own load
- **A diff in a family you didn't touch** -- shared CSS (tokens, reset, a part) or the fixture changed;  check the
  report before updating.
- **Playwright version bump** -- the Docker image follows `@playwright/test`'s version;  new browser builds usually
  move pixels:  bump, run, review, `--update`, all in one change.
- **Ports** -- the dev server takes 5391 or the next free port;  the browser server a free loopback port.
- **Running Playwright by hand** -- the CLI hands each run's choices to Playwright's processes as environment
  variables, `SPELL_UI_VISUAL_OS` / `_BASE_URL` / `_WS` / `_PARITY` / `_STATIC` / `_WORKERS` (`VisualVariables`,
  read back as `environment.visual`, `tools/environment.ts`);  set at least `SPELL_UI_VISUAL_BASE_URL` to a running
  dev server.
- **The HTML report is empty / stale** -- each OS writes its own:  `tools/results/visual/local-darwin/report`,
  `tools/results/visual/linux/report`.
