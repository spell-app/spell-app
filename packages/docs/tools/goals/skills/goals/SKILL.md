---
name: goals
description: Talk through a goal set (a project's plan in `goals/`) with Owen, one set, topic, section or item at a time -- present it, then ask a series of questions to fill it in, writing each answer onto the page and its agent notes. Use for `/goals [set/topic/item]` (e.g. `/goals spell/motivation/G1`, `/goals motivation`), `/goals sets`, `/goals use <set>`, and whenever Owen wants to discuss, decide or add to the plan ("let's talk about brand", "app/Q3", "what's next on the plan").
argument-hint: "[set/][topic][/item-or-section] | sets | use <set>"
---

# /goals

A dialog on a goals page:  present what's there, then ask questions -- one or two at a time, each with a
suggestion -- and write every answer down as it happens.

## The tool

- Every command below is `G <command>`, where `G` is `scripts/goals.sh` in THIS skill's base directory (shown
  above when the skill loads), e.g. `.claude/skills/goals/scripts/goals.sh summary spell/motivation`.
  It runs its checkout's `packages/docs/tools/goals/goals.js`, on that checkout's `goals/` folder.
- `G help` lists every command.  Rules for pages, ids and markup:  the goals folder's `AGENTS.md`.  Read it the
  first time in a session.

## 1. Resolve the target

- `$ARGUMENTS` is a TARGET:  `[set/]topic[/anchor]`.
  - set left out:  the active set (`goals.preferences.json5`'s `activeSet`)
  - topic:  folder or short name (`spell-ui`, `spell/ui`, `AI`);  anchor:  an item (`G1`, `Q3`), a section
    (`questions`, `now`), or a thought (`T2`)
- `G resolve <target>`.  On "which goal set?" or "no topic", it prints `maybe:` choices:  AskUserQuestion with
  them (up to 4, the likeliest first), then resolve again.
- `sets`:  `G sets`, show them.  `use <set>`:  `G use <set>`, confirm in one line.  Nothing else to do.
- A target naming a set that isn't the active one:  make it active (`G use <set>`), and say so in a line, so the
  next `/goals motivation` means it too.
- Nothing at all:  `G summary`, then suggest where to start (motivation, goals and audience first:  most topics
  depend on them) with AskUserQuestion.

## 2. Present it

- `G open-vs <target>` the first time a page comes up in a session:  in VS Code, the side bar's "Spell Docs" view
  in this session's window;  anywhere else, a new browser window, as `G open`.  It starts the page server if need
  be.  `G open` only when Owen asks for the browser.
- `G summary <set/topic>`, and read the topic's `.md` and the page's parts that matter for the target.
- Then in chat, short:
  - an ITEM (`G1`, `Q3`):  its title, note and details;  what's around it (related goals, questions, decisions)
  - a SECTION:  what's in it, what's thin or missing
  - a TOPIC:  where it stands (status, open questions, new thoughts), and what you'll ask first
  - a SET:  the topics' status at a glance, and which topic needs Owen most
- New thoughts on the target (`G thoughts <target>`):  mention them, and offer `/goals-update <target>` first.
- A draft topic:  `G status <set/topic> dialog`.

## 3. Ask, to fill it in

- A SERIES of questions that turn the target into real content:  for a goal, what it means, how we'd know it's
  done, by when, what it depends on;  for a question, the options and your suggestion;  for a section or topic,
  its open questions in order.
- One or two at a time, never the whole list.  Each:  the question, the context in a line, your suggestion and
  why.
- AskUserQuestion when the answer is a choice (2-4 options, your recommendation first, marked "(Recommended)").
  Plain chat when it's vision, wording or a story:  quote Owen's own words back onto the page.
- A new idea or a tangent becomes an item (idea, question, risk, goal), not a detour.
- Push back when an answer conflicts with an earlier decision, here or on another topic:  name both ids.

## 4. Write it down, as it happens

After EVERY answer, before the next question:

- A decision:  `G add <set/topic> decision "Short title" --note "one line" --details "<p>Why...</p>"`, then
  `G close <set/topic/Q3>`, then `G log <set/topic> "Q3 → D2:  short title" --icon gavel`.
- Filling in an item:  edit its note or details on the page by hand (minimal edits), or add sub-goals / questions
  with `G add`.  Then `G check <set/topic> --no-browser`.
- New goals, ideas, risks, work:  `G add <set/topic> <kind> "title" --note "..." [--horizon now|next|someday]`.
- Prose that changed (Summary, Today):  edit by hand, minimally.
- Effects on another topic:  add or close items there too, and log it on both.
- Then the `.md`:  decisions under "Decisions", work status (`proposed` → `ready`), the question gone from "Open
  questions".  Same ids and titles as the page.
- The page reloads by itself while the page server runs (`yarn server`).

## 5. Close the session

- Topic settled (no open questions that block work, or Owen says so):  `G status <set/topic> agreed`, and turn the
  `.md`'s "Draft" banner into "Agreed <date>".
- `G check <set/topic>` (with the browser) must pass.
- Reply:  a short bulleted list (decided, added, still open), then AskUserQuestion:
  - "Next:  <set/topic/Q<n>>" (Recommended, when one is open)
  - "Next topic:  <name>"
  - "Hand off <set/topic/W<n>> to an agent" (when work is ready)
  - "Stop here"

## 6. Hand off work

- Only `ready` work.  Brief the agent with the topic's `.md` path, the `W` id, the `G` command path, and:
  "record progress with `G log <set/topic> ... --icon robot`, new risks or questions with `G add`;  never decide an
  open question".  Several phases:  suggest `/epic <name>` instead.
- `G status <set/topic> building` once work starts.

## Style

- Concise, friendly, professional.  "People", never "users".
- Short titles (2-6 words) with a one-line note;  details for the rest.  Numbered or bulleted.
