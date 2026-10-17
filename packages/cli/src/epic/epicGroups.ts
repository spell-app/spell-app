/**
 * The verbs of `epic`'s groups (`ask`, `choices`, `comments`, `notes`, `agents`, `airplane`), for their help:
 * `epic ask new --help` prints that verb's usage, what it does and an example;  `epic ask --help` lists them
 * (epic `epic-workflow` P19).
 * - Help only:  each group's tool reads its own arguments (`packages/epics/tools/`), passed through verbatim.
 *   Its header comment says the same in more words:  keep the two agreeing.
 * - A verb not listed here is refused before the tool runs (`epicProgram.ts`), so each list is every verb the
 *   tool has.
 * - Lean:  data only, so `epic` starts without loading spell.
 */
export const GROUP_VERBS: Record<GroupName, GroupVerb[]> = {
  ask: [
    {
      name: "new",
      usage: '<slug> [--title "..."] [--epic <epic>] [--description "..."] [--from <questions.json5>]',
      description:
        "make a details page from the template, and print its path;  --epic:  in that epic's details/ (else a " +
        "scratch page, swept after 14 days);  --from:  the whole page from a list of questions",
      example: 'epic ask new pick-layout --epic seo --title "Pick a layout"'
    },
    {
      name: "show",
      usage: "<page> [--wait] [--timeout 8h]",
      description: "show the page in this session's VS Code side bar (the Review tab);  --wait:  then wait",
      example: "epic ask show seo/pick-layout --wait"
    },
    {
      name: "wait",
      usage: "<page> [--timeout 8h]",
      description:
        "wait until Owen sends an answer, print it and exit 0 (timeout:  exit 2);  run it in the background:  " +
        "its exit wakes the session",
      example: "epic ask wait seo/pick-layout"
    },
    {
      name: "answer",
      usage: "<page>",
      description: "print the answer Owen already sent (exit 1 if none)",
      example: "epic ask answer seo/pick-layout"
    },
    {
      name: "draft",
      usage: "<page>",
      description:
        "print what Owen typed on the page and hasn't sent (exit 1 if nothing);  run it before rewriting a page " +
        "he may have open",
      example: "epic ask draft seo/pick-layout"
    },
    {
      name: "list",
      usage: "[<epic>]",
      description: "every details page, answered or waiting;  with an epic, only that epic's (epics/<epic>/details/)",
      example: "epic ask list seo"
    },
    {
      name: "sweep",
      usage: "[--days 14]",
      description: "delete the scratch pages (and their answers) older than that;  never an epic's",
      example: "epic ask sweep --days 7"
    }
  ],
  choices: [
    {
      name: "new",
      usage: '<slug> --rows <rows.json5> [--title "..."] [--epic <epic>] [--description "..."]',
      description:
        "make a choice page from its rows (a table of names Claude recommends, Owen's call on each), and print its path",
      example: "epic choices new boolean-names --rows rows.json5 --epic seo"
    },
    {
      name: "show",
      usage: "<page> [--wait] [--timeout 8h]",
      description: "show the page in this session's VS Code side bar;  --wait:  then wait",
      example: "epic choices show seo/boolean-names --wait"
    },
    {
      name: "wait",
      usage: "<page> [--timeout 8h]",
      description:
        'wait until Owen presses "Do it", print his answer and exit 0 (timeout:  exit 2);  run it in the background',
      example: "epic choices wait seo/boolean-names"
    },
    {
      name: "answer",
      usage: "<page>",
      description: "print the answer Owen already sent (exit 1 if none)",
      example: "epic choices answer seo/boolean-names"
    },
    {
      name: "list",
      usage: "[<epic>]",
      description: "every choice page:  answered, draft or waiting;  with an epic, only that epic's",
      example: "epic choices list seo"
    }
  ],
  comments: [
    {
      name: "list",
      usage: "[<epic>] [--all] [--json]",
      description:
        "every comment Owen left on a docs page, still waiting for Claude;  with an epic, only that epic's;  " +
        "--all:  taken and answered ones too",
      example: "epic comments list seo"
    },
    {
      name: "wait",
      usage: "[<page>...] [--timeout 8h]",
      description:
        "wait until a comment starts waiting (on those pages, else on any), print it and exit 0;  run it in the " +
        "background",
      example: "epic comments wait guides/solid/solid-2.html"
    },
    {
      name: "gather",
      usage: "[<page>... | --all] [--epic <epic>] [--json]",
      description: "the waiting comments (and new page notes) into epic guide-changes, one phase per page",
      example: "epic comments gather guides/solid/solid-2.html"
    },
    {
      name: "working",
      usage: "<page>#<id> on | off",
      description: 'Claude is thinking about the comment (on), or stopped:  its thread shows "Claude: thinking…"',
      example: "epic comments working guides/solid/solid-2.html#M3 on"
    },
    {
      name: "answer",
      usage: "<page>#<id> --file <reply.html> [--commit <sha>]",
      description: "Claude's answer on the comment's thread;  --commit:  the commit it was built in",
      example: "epic comments answer guides/solid/solid-2.html#M3 --file reply.html"
    }
  ],
  notes: [
    {
      name: "list",
      usage: "[<epic>] [--all] [--json]",
      description:
        "every new page note Owen left on a docs page;  with an epic, only on the pages it owns;  --all:  answered " +
        "and done ones too",
      example: "epic notes list seo"
    },
    {
      name: "answer",
      usage: "<page>#<id> --file <reply.html>",
      description: "Claude's reply under the note, which is then answered",
      example: "epic notes answer guides/solid/solid-2.html#n3 --file reply.html"
    },
    {
      name: "done",
      usage: "<page>#<id>",
      description: "the note is done:  nothing more to do for it",
      example: "epic notes done guides/solid/solid-2.html#n3"
    }
  ],
  agents: [
    {
      name: "list",
      usage: "[--json] [--epic <epic>]",
      description: "the agents running now, one line each, oldest first (the default verb)",
      example: "epic agents"
    },
    {
      name: "add",
      usage: '<name> "<task>" [--status "blocked on <name>"] [--task-id <id>]',
      description: "an agent starting:  prints its full name, <epic>-<name>;  exit 1 if it's running already",
      example: 'epic agents add docstrings "docstrings in string.ts"'
    },
    {
      name: "set",
      usage: '<name> [--status active | "blocked on <name>"] [--task-id <id>]',
      description: "an agent's status, or its task id",
      example: "epic agents set docstrings --task-id a1b2c3"
    },
    {
      name: "done",
      usage: "<name>",
      description: "an agent is back:  off the list",
      example: "epic agents done docstrings"
    },
    {
      name: "wait",
      usage: "[--every <s>] [--max <s>] [--json]",
      description:
        "wait until Owen sends an agent a note from the epic page (exit 0, printing it), or none is left running " +
        "(exit 3);  run it in the background",
      example: "epic agents wait"
    },
    {
      name: "told",
      usage: "<name>",
      description: "Owen's notes to the agent were passed on:  the page shows them told",
      example: "epic agents told docstrings"
    }
  ],
  airplane: [
    {
      name: "status",
      usage: "[--json]",
      description: "airplane mode on or off, and since when (the default verb)",
      example: "epic airplane"
    },
    {
      name: "on",
      usage: "",
      description: "turn airplane mode on:  everything Owen leaves on the pages waits for /airplane land",
      example: "epic airplane on"
    },
    { name: "off", usage: "", description: "turn airplane mode off", example: "epic airplane off" },
    {
      name: "check",
      usage: "[--fix] [--json]",
      description: "is this laptop ready to fly?  exit 1 while anything isn't;  --fix:  fix what can be",
      example: "epic airplane check --fix"
    },
    {
      name: "inbox",
      usage: "[--since <iso>] [--json]",
      description: "everything Owen left while flying, by place:  what /airplane land works through",
      example: "epic airplane inbox"
    }
  ]
}

/** A group of `epic`'s:  a docs tool passed through. */
export type GroupName = "ask" | "choices" | "comments" | "notes" | "agents" | "airplane"

/** One verb of a group, for its help:  `epic <group> <name> <usage>`, what it does, a whole command line. */
export type GroupVerb = {
  /** the verb:  `new` */
  name: string
  /** its arguments:  `<slug> [--epic <epic>]` */
  usage: string
  /** what it does, for Owen */
  description: string
  /** a whole command line:  `epic ask new pick-layout --epic seo` */
  example: string
}
