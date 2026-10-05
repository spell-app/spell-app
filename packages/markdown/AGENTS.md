# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/markdown`.

**READ the repo root's `AGENTS.md` and WWOD (`agents/wwod/WWOD.md`) FIRST:**  the repo's layout, and the
house style every package shares.  Only what's local is below;  a section named like a WWOD rule extends it.

## Overview

- GitHub-flavoured markdown on the generic parser (`$/parser`, `P`), drawing `ui-*` markup -- the second language
  on the parser after spell, and the proof that it knows no language.  The plan:
  `packages/docs/content/epics/markdown/markdown.plan.html`.
- Depends only on `$/parser` and `$/util`.  NEVER import `$/spell` or anything above it.  `ui` NEVER imports
  this package:  it gets a precompiled bundle (as spell's highlighter).
- `src/MarkdownTokenizer.ts` -- words (letters / digits), one symbol per other character, whitespace riding on the
  token before it (`LEADING_ONLY`), so rulex's spacing (`{spaces}`, touching parts) sees it.
- Rules are written in rulex as much as possible (`packages/docs/content/rulex/rulex.html`);  what rulex can't say
  (block nesting, emphasis pairing, "any token but a backtick") is hand-written.
- `src/spec/` -- the GFM spec examples (`gfm-spec.json`, from cmark-gfm's `spec.txt` by `yarn spec:update
  <spec.txt>`) and `spec.test.ts`, which renders each with the PLAIN-HTML tags and pins the pass count per section
  in a snapshot:  a regression fails it, a gain updates it (`vitest -u`, after reading the diff).

## Imports

- As WWOD §4, with `MD` ~== `$/markdown` as our one namespace:  `import { MD } from "$/markdown"`.

## Decorators

As WWOD §12, plus:

- `vitest.config.ts` uses `vite.decorators.ts` (repo root).

## Types / Exports

As WWOD §8, plus our self-namespace:

- `MD` ~== `$/markdown`
