---
name: fussbudget
description: Rewrite the TEXT of code and docs so a reader new to it can follow -- docstrings, comments, READMEs, `AGENTS.md` files, docs pages, plan-doc prose -- to WWOD §6's writing rules, in place and uncommitted, the diff left for Owen to review.  Never code, names or generated files.  Use for `/fussbudget <path...>` (folders, a package, files), `/fussbudget epic <name>` (a plan doc), `/fussbudget branch` (what this branch changed), `/fussbudget` alone (asks what to cover), or when Owen says "clean up the docstrings", "make these comments readable", "fussbudget this folder", "fussbudget the plan doc".
argument-hint: "[<path...> | epic <name> | branch]"
---

# /fussbudget

Rewrites the words around the code, so future-Owen can read them cold (epic `skillz`, P7).
- What it fixes:  text written from inside the builder's head.
  - dense paragraphs, lines broken at the column instead of at phrases
  - implementation words ("the fork") where the plain name ("the element layer") belongs
  - why a squirrely choice was made, before what the thing IS
- The rules are WWOD §6, "Comments & docs" (`agents/wwod/WWOD.md`),
  and its long before / afters, `agents/wwod/writing.md`.
  This skill says how to run a pass;  those files say what good looks like.
- Its checker:  `spell dev docs fuss <paths...> | --branch [--json]`.
  - It lists the mechanical misses by file and line, and exits 1 on any:
    - `phrase-split`:  a line ending in the first 1-4 words of a new phrase
    - `dense`:  a docstring paragraph or bullet of 3+ sentences
    - `jargon`:  a banned implementation word, from a short list per package
  - It can't see the rest:  that's what the reading pass is for.
- Every epic's Doc Review runs it:  `.claude/skills/epic/SKILL.md`, "6. Doc Review".

## Forms

```
/fussbudget <path...>       folders, a package, files:   /fussbudget packages/server/src
/fussbudget epic <name>     a plan doc:                  /fussbudget epic skillz
/fussbudget branch          what this branch changed since `main`, uncommitted work included
/fussbudget                 asks what to cover
```

- `<path...>`:  every file under each path, whole.
- `epic <name>`:  the plan doc's prose:  Overview, phases, items' details.
  - Through its part files, at the shared REAL path:
    `/Users/owen/www/spell-app/spell-app-dev/epics/<name>/parts/<id>.html`.
  - Never its structure:  no ids, no sections, no item lines, nothing `spell dev plan-doc` writes.
- `branch`:  every file this branch changed or added since `main`, WHOLE.
  - The files:
    - `git diff --name-only main...HEAD` and `git diff --name-only HEAD`
    - `git ls-files --others --exclude-standard` (new, untracked)
  - Whole files, not just the changed lines:  Owen can always undo a hunk (J14 of `skillz`).
  - On `main` with nothing changed:  say so and stop.
- Nothing after it:  AskUserQuestion, "What should /fussbudget cover?", options:
  - "This branch's changes" (Recommended):  as `branch`
  - "A folder or files":  Owen types the paths in "Other"
  - "A plan doc":  the epic this session works on, if any, else Owen types its name in "Other"
  - Run by a background agent (no Owen to ask):  take `branch`, and say so in the report.
- Doc Review names its scope in full (`branch`, `epic <name>`), so nothing asks.

## What it rewrites

- Yes:
  - docstrings and comments, in `.ts` / `.tsx` / `.js` / `.mjs`
  - READMEs, `AGENTS.md` files, other Markdown
  - docs pages (`guides/`, `ui/`, `pages/`):  their prose
  - plan-doc prose, as "Forms" says
- Never:
  - code, names, strings the code uses, marker words (`NOTE:`, `HACK:`, `REFACTOR:` ...)
  - generated files:  any `git check-attr linguist-generated` marks, `vendor/`, bundles, snapshots, fixtures
  - Owen's own words:  his quotes, a plan doc's kickoff prompt, `<epic-original>`, `<epic-answer>`
  - dated records:  a plan doc's `log.html`, `<epic-updated>` lines, the changelog's old entries
- Keeps every fact, number and caveat (WWOD §6).
  - Shorter is good;  less said is not.
  - Unsure whether a clause matters:  keep it, moved to the end.

## Steps

1. Read the rules WHOLE, first:  WWOD §6 and `agents/wwod/writing.md`.
   - Every pass, even a small one:  this skill exists because the rule, half-remembered, hasn't worked.
2. Is anyone else editing it?
   - `spell dev worktree list`:  another session (not this one, not the one that started you)
     working in this checkout.
   - `spell dev agents list`:  another agent whose task names these files.
     For a plan doc:  any other plan-doc agent (`<epic>-plan-doc`).
   - Either:  say who, and STOP.  A mixed diff can't be reviewed.
3. The scope, as "Forms" says:  a list of files.
   - Drop what "What it rewrites" says never to touch.
4. The checker, for the mechanical list, and its count BEFORE:
   - `spell dev docs fuss <paths...> --json`, or `spell dev docs fuss --branch --json`
   - a plan doc:  `spell dev docs fuss /Users/owen/www/spell-app/spell-app-dev/epics/<name>/parts --json`
   - In HTML it checks density and jargon only:  the formatter wraps those lines.
5. Big scope:  fan out ("Fanning out").  Else the session does it itself.
6. Each file, top to bottom:
   - fix each of the checker's misses
   - then READ, for what no tool sees:
     - written from inside the builder's head:  would someone new to this part follow it?
     - implementation words, where the plain name belongs
     - why before what:  say what it IS and how to use it first
     - run-together sentences, where bullets belong
   - a block that already reads well:  leave it.  No churn for its own sake.
7. Write in place.  Stage NOTHING, commit NOTHING.
   - The diff IS the proposal:  Owen reviews it in Source Control,
     and discards a file or a hunk he doesn't like.
   - A plan doc has no branch diff:  each turn's edits are one `auto:` commit in `spell-app-dev`,
     which can be reverted whole.  Then `spell dev plan-doc check <name>`.
8. The checker again:  the count AFTER.
   - A miss left on purpose (a false hit, a line that can't break better):  name it in the report.
9. Report ("Report").

## Fanning out

- One folder, a few files, or a plan doc:  no agents, the session does it.
- Several packages or folders:  one agent each, up to 5 in all.
  - Or fewer, when you were given a smaller budget (`/bg` with `n`).
  - More folders than agents:  group neighbours, one agent a group.
  - Why:  one voice per package, and the session stays free.
- Each one NAMED and LISTED, as the root `CLAUDE.md`'s "Delegated work" says (`.claude/skills/bg/SKILL.md`, "Names"):
  - `spell dev agents add fussbudget-<folder> "<its task>"`:  prints its full name
  - an `Agent` call (`general-purpose`, `run_in_background: true`),
    its `description` starting with that full name
  - `spell dev agents done fussbudget-<folder>` when it's back
- Its prompt carries:
  - its files, and the checker line for them
  - "Read `agents/wwod/WWOD.md` §6 and `agents/wwod/writing.md` WHOLE, first."
  - "Rewrite TEXT only:  never code, names, or generated files.  Keep every fact, number and caveat."
  - "Write in place;  stage nothing, commit nothing.  In a worktree:  plain separate shell commands."
  - "Report:  files touched, docstrings rewritten, the checker's count before and after,
    and your 2-3 best before / afters."
- The session picks the report's before / afters from theirs.

## Report

Short, in this order:
1. Scope, and the files touched:  `[file.ts](path)` each, or a count per folder when there are many.
2. Docstrings and comments rewritten:  a count.
3. The checker:  `<before> -> <after>` misses;  any left, and why.
4. 2-3 before / afters for Owen to judge FIRST:  the boldest changes, where a fact moved or a name changed.
   - Each a short `before` / `after` pair, in fenced blocks.
5. Where to review:  Source Control (code);  a plan doc:  its link, `spell dev docs link <plan doc> --review`.
- Fanned out:  each agent's notice, as it arrives, gets a short reply,
  its first line bold, by itself:  `**Agent <full name> came back with:**` (the root `CLAUDE.md`).
  - The full report above comes once the last one is back.
