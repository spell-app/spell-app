---
name: goals-thought
description: Jot a thought onto a goals page (a set, topic, section or item) for Claude to digest later with /goals-update -- no dialog, just save it. Use for `/goals-thought [set/topic/item] [text]`, e.g. `/goals-thought spell/motivation/G1 maybe teachers first?`, or when Owen says "note this on the plan" / "add a thought to app/Q3".
argument-hint: "[set/][topic][/item-or-section] [the thought]"
---

# /goals-thought

Save a thought where it belongs on a goals page, marked new.
- Don't discuss it, don't change anything else:  digesting is `/goals-update`'s job.

- `G` is `scripts/goals.sh` in the `goals` skill's base directory, this skill's sibling.
  - That's `../goals/scripts/goals.sh` from this skill's base directory,
    e.g. `.claude/skills/goals/scripts/goals.sh`.

1. Split `$ARGUMENTS`:  the first word is the TARGET (`[set/]topic[/anchor]`);  the rest is the thought.
   - The first word isn't a target (`G resolve <word>` fails with no close choice):
     - the thought is all of `$ARGUMENTS`
     - the target is the topic under discussion in this session
     - none:  ask (AskUserQuestion, with `G sets` / `G resolve` choices)
   - "which goal set?":  AskUserQuestion with the printed choices.
2. No thought text:  ask for it in plain chat, one line ("What's the thought?").
   Take Owen's words verbatim.
3. Save it, with the text on stdin so quotes survive:

   ```sh
   G thought <target> - <<'THOUGHT'
   <Owen's words, verbatim>
   THOUGHT
   ```

4. Reply in one line:  the new id and where it went (`spell/motivation/T3, on G1`),
   and that `/goals-update <target>` will work it in.
