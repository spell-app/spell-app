---
name: docs-check
description: Make the docs an epic wrote (besides its plan doc) agree with what was chosen and built, then with each other -- its durable doc, guides, AGENTS.md / README files, skills, templates, its changelog entry -- fixed in place, uncommitted, the diff left for Owen to review;  what it can't decide goes into the plan doc as judgement calls.  Use for `/docs-check <epic...>`, `/docs-check` alone (asks which epics), or when Owen says "check the docs for <epic>", "make the docs consistent", "are the docs true to what we chose?", "check the docs before I fly".
argument-hint: "<epic...>"
---

# /docs-check

Owen's words (epic `airplane`, P10, 2026-10-10):
"Make a doc task which:  first makes sure that any docs a plan wrote OTHER THAN THE PLAN DOC are consistent with
what we chose,  then goes through all of those docs as a group, and makes sure things are internally consistent."

- Two passes, in that order:
  1. each doc against the plan doc's DECISIONS:  a statement that contradicts what was chosen or built is fixed
  2. all the epic's docs read TOGETHER:  names, commands, flags, behaviours, numbers made to agree
- Its lists come from `spell dev plan-doc` (`packages/epics/src/tool/EpicDocs.ts`):
  - `spell dev plan-doc docs <name> [--json]`:  the docs, each with why it's listed, in four groups
    - `wrote`:  its durable doc (`<a slot="durable">`) and the pages in its folder, the docs its commits changed,
      the shared pages its turns changed whose path has its name
    - `related`:  docs that name it ("epic `airplane`", "airplane P3"),
      and shared pages its turns changed that the plan doc links to
    - `linked`:  docs the plan doc only links to:  often ones it read, not wrote
    - `swept`:  other shared pages its turns changed:  a turn commits every session's edits, and a tool run over
      every page (`docs offline --fix`) changes them all.  Counted;  only `--json` lists them.  Skipped.
    - and its changelog entry, `guides/changelog.html#<name>`
  - `spell dev plan-doc decisions <name> [--json]`:  what the docs must agree with
    - each phase:  its Done list (what was built) and its Updated notes (how the plan changed)
    - each item:  its status, its chosen option, its answer;  `--json` adds its whole current text
- Not `/fussbudget`:  that one fixes how text READS (WWOD §6);  this one fixes what it SAYS.
  A sentence it rewrites still follows WWOD §6 (`agents/wwod/WWOD.md`, `agents/wwod/writing.md`).

## Forms

```
/docs-check <epic...>      one or more epics:   /docs-check airplane skillz
/docs-check                asks which
```

- Nothing after it:  AskUserQuestion, "Which epics' docs should /docs-check go through?", multi-select:
  - the epics merged since the last flight, or done in the last week:
    `spell dev plan-doc list --json` (`status` `done`), newest first;  at most 4 options, "Other" for names
  - Run by a background agent (no Owen to ask):  the epic this session works on, and say so in the report.
- Several epics:  pass 1 per epic, then pass 2 over ALL their docs together (a doc two epics touched is read once).

## What's binding

From `decisions --json`, later beats earlier:
- an answered question:  its chosen option and its answer card;  a question born answered (a decision):  its title
- a judgement call:
  - closed:  accepted, binding
  - open:  how it was built, binding until Owen says otherwise
  - canceled:  reversed:  a doc that describes it as how things work is wrong
- a closed caveat, issue or todo:  done;  a canceled one:  moot, so a doc still promising it is wrong
- an open caveat:  a real limit;  a doc that says the opposite is wrong, a doc that leaves it out is fine
- a phase's Done list:  what was BUILT, the strongest evidence;  its Updated notes beat its original Goal
- an Original Discussion (`<epic-original>`) is history, never binding
- The code beats every doc when they disagree about what exists:  a command, flag, file or default a doc names is
  checked against the code (`spell dev <noun>` with no verb prints its usage;  grep the source) before a fix.

## What it never touches

- the plan doc itself:  it's the record.  A contradiction INSIDE it goes into the report as a judgement call.
- code, names, strings the code uses
- Owen's own words:  his quotes, kickoff prompts, `<epic-answer>` text
- dated records:  logs (`agents/*.md`), other epics' changelog entries, `<epic-updated>` lines
- generated files:  `pages/index.html`, list pages, bundles, anything `git check-attr linguist-generated` marks

## Steps

1. Is anyone else editing these?  As `/fussbudget`'s step 2:  `spell dev worktree list`, `spell dev agents list`.
   - Another session or agent working on the same docs:  say who, and STOP.  A mixed diff can't be reviewed.
2. The right checkout:  `spell dev plan-doc list --json`, each epic's `checkout`.
   - Merged (`main`):  run from the main checkout.  Not merged:  from its worktree (`.claude/worktrees/<name>`),
     where its code and its tracked docs are.  Elsewhere:  say so in one line, and stop.
3. The lists, per epic, saved to the scratchpad:
   - `spell dev plan-doc docs <name> --json > <scratch>/<name>.docs.json`
   - `spell dev plan-doc decisions <name> --json > <scratch>/<name>.decisions.json`
   - The docs to read:  every `wrote` and `related` one;  a `linked` one only where it describes this epic's work
     (search it for the epic's name, its commands, its elements);  the changelog entry, its `<ui-section>` only.
4. Big:  more than 8 docs to read, or several epics:  fan out ("Fanning out").  Else the session does it itself.
5. Pass 1, each doc, top to bottom, against the decisions:
   - every statement about what the epic chose or built:  names, commands and flags, defaults, numbers, where things
     live, what happens when, what's NOT done
   - contradicts what's binding:  fix the sentence, in place, keeping its shape;  never rewrite a block that's true
   - says something the decisions don't cover:  check the code;  still unsure:  leave it, and note it for step 7
6. Pass 2, the docs TOGETHER (the session itself, never split:  it needs one reader):
   - a list of the facts the docs state (command names, flags, paths, element and option names, numbers,
     behaviours), each with the docs that state it and how
   - where two docs disagree:  the one that matches the decisions and the code wins;  fix the others
   - the same thing called two names:  the name the code (or the durable doc) uses, everywhere
   - the changelog entry lists everything the phases' Done lists say was shipped, and nothing they don't
7. What it couldn't decide (two readings both defensible, or the plan doc contradicting itself):
   ONE judgement call per question, in the epic's plan doc, never one per fix:
   `spell dev plan-doc add <epic> judgement "Docs:  <the question, short>" --details "<p>what the docs say, where;
   what the decisions say</p><epic-net-effect><ul><li>what this run did meanwhile</li></ul></epic-net-effect>"`
8. Write in place.  Stage NOTHING, commit NOTHING.
   - Tracked docs (`AGENTS.md`, `README.md`, skills):  the diff waits in Source Control.
   - Shared docs (`guides/`, `templates/`, `ui/`, `agents/wwod/`):  edit at the REAL path,
     `/Users/owen/www/spell-app/spell-app-dev/<path>` (root `AGENTS.md`, "Shared content").
     The turn's end commits them (`auto: guides/...`), one commit per folder, which Owen can revert whole.
   - An edited docs page:  `packages/docs/AGENTS.md`, "Finishing a page", steps 2-4 (format, links, check-spell).
9. Report ("Report").

## Fanning out

- Pass 1 only:  one background agent per doc, or per group of neighbouring docs, up to 4 in all.
  Pass 2 waits for every one, and is the session's.
- Each one NAMED and LISTED, as the root `CLAUDE.md`'s "Delegated work" says (`.claude/skills/bg/SKILL.md`, "Names"):
  - `spell dev agents add docs-check-<n> "<its docs>"`:  prints its full name
  - an `Agent` call (`general-purpose`, `run_in_background: true`), its `description` starting with that full name
  - `spell dev agents done docs-check-<n>` when it's back
- Its prompt carries:
  - its docs (checkout paths, and the REAL path for shared ones), and the decisions file's path
  - this skill's "What's binding" and "What it never touches", word for word
  - "Fix each statement that contradicts what's binding, in place.  Never rewrite a block that's true.
    Stage nothing, commit nothing.  In a worktree:  plain separate shell commands."
  - "Report:  each fix as `doc · before -> after · the decision (Q3, J5, P4's Done)`;
    then what you couldn't decide, with both readings."
- Each agent's notice, as it arrives:  a short reply, its first line bold, by itself:
  `**Agent <full name> came back with:**` (the root `CLAUDE.md`).

## Report

Short, per epic, in this order:
1. The lists:  `<n> docs (<wrote> wrote, <related> related, <linked> linked)`, and how many were read.
2. Pass 1:  each fix, one line:  `[doc](path) · what changed · the decision behind it`.
3. Pass 2:  each disagreement settled, one line:  the fact, the docs, which way it went.
4. Judgement calls added:  their ids, each in words ("the default port (J14)").
5. Where to review:  Source Control (tracked docs);  the shared docs' `auto:` commits in `spell-app-dev`;
   the plan doc's link, `spell dev docs link <plan doc> --review`.
