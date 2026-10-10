# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/markdown`.

**READ the repo root's `AGENTS.md` and [WWOD](../../agents/wwod/WWOD.md) FIRST:**
- the root's:  the repo's layout
- WWOD:  the house style every package shares
- Only what's local is below.
  A section named like a WWOD rule extends it.

## Overview

- GitHub-flavoured markdown on the generic parser (`$/parser`, `P`), drawing `ui-*` markup.
  - It's the second language on the parser, after spell:  the proof that the parser knows no language.
  - The plan:  [its plan doc](../../epics/markdown/markdown.plan.html).
- It depends only on `$/parser` and `$/util`.
  - NEVER import `$/spell`, or anything above it.
  - `ui` NEVER imports this package:  it gets a precompiled bundle (as with spell's highlighter).
- [MarkdownTokenizer.ts](src/MarkdownTokenizer.ts):  how text becomes tokens.
  - words:  letters / digits
  - one symbol per other character
  - whitespace rides on the token before it (`LEADING_ONLY`), so rulex's spacing (`{spaces}`, touching parts) sees it
- Rules are written in rulex as much as possible ([the Rulex guide](../../guides/rulex/rulex.html)).
  - What rulex can't say is hand-written:  block nesting, emphasis pairing, "any token but a backtick".
- `src/spec/`:  the GFM spec examples, and their test.
  - `gfm-spec.json`:  the examples, from cmark-gfm's `spec.txt`, by `yarn spec:update <spec.txt>`
  - `spec.test.ts` renders each with the PLAIN-HTML tags, and pins the pass count per section in a snapshot.
    - A regression fails it.
    - A gain updates it:  `vitest -u`, after reading the diff.

## Decorators

As WWOD §12, plus:

- `vitest.config.ts` uses `vite.decorators.ts` (repo root).

## Types / Exports

As WWOD §8, plus our self-namespace:

- `MD` ~== `$/markdown`
