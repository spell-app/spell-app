# The example apps, and ideas for yours

```html
<spell-view "tableau" template="pile" description="A column, built down from king to ace, red and black in turn">
	<property "layout">vertical</>
	<spell>
		- it can give up a card if: the card is face up
		- it can take a card if:
			if it is empty
				return the card is a king
			return its color is not the color of the card and its value is the value of the card + 1
	</spell>
```

_Real Spell, from the Solitaire example:  the rule for one column of Klondike._

If you've played Klondike, you just read the rule for a column:
a king on an empty one, and after that, one card lower, in the other color.

That isn't a comment above the code that checks a move.
It IS the check:  click a card, and the game moves it to the first pile that says it can take it.

Eleven example apps ship with the Spell editor, from FizzBuzz up to that solitaire, and two libraries to build on.
Each one is a real project:  open it, and its app runs beside its text;  change a line, and the app follows.
Here to make your own?  [Skip to the ideas](#ideas-for-your-own).

## Eleven apps, simplest first

Open them in this order:  each one adds an idea or two to the one before.
Each picture is the example open in the editor:
its program on the left, the app it makes on the right, and the JavaScript it compiles to under the app.

<!-- The table below is made from the projects themselves:  run `yarn examples:readme` in spell-app (see below). -->
<!-- examples:start -->

| Example | Address | What it shows | Running |
| --- | --- | --- | --- |
| FizzBuzz | [`@spell/examples/fizzbuzz`](spaces/@spell/examples/fizzbuzz/) | Counting to 100 with fizz and buzz:  a loop, `if` and `otherwise`, and `print`, in eight lines | <a href="docs/images/examples/fizzbuzz.png"><img src="docs/images/examples/fizzbuzz.png" width="360" alt="FizzBuzz open in the Spell editor:  its Spell on the left, the app running on the right"></a> |
| Counter | [`@spell/examples/Counter`](spaces/@spell/examples/Counter/) | A button that counts its clicks:  a view with one property, one action and a drawing, in a few lines;  the Counter notebook imports it | <a href="docs/images/examples/Counter.png"><img src="docs/images/examples/Counter.png" width="360" alt="Counter open in the Spell editor:  its Spell on the left, the app running on the right"></a> |
| Calculator | [`@spell/examples/calculator`](spaces/@spell/examples/calculator/) | A pocket calculator on Spell UI:  an app with text properties, actions like `to clear (a calculator)`, and a keypad of buttons whose clicks are Spell | <a href="docs/images/examples/calculator.png"><img src="docs/images/examples/calculator.png" width="360" alt="Calculator open in the Spell editor:  its Spell on the left, the app running on the right"></a> |
| Tic-Tac-Toe | [`@spell/examples/tic-tac-toe`](spaces/@spell/examples/tic-tac-toe/) | Noughts and crosses on a grid of squares that draw themselves:  whose turn it is, and three in a row, written as sentences | <a href="docs/images/examples/tic-tac-toe.png"><img src="docs/images/examples/tic-tac-toe.png" width="360" alt="Tic-Tac-Toe open in the Spell editor:  its Spell on the left, the app running on the right"></a> |
| Bill Splitter | [`@spell/examples/bill-splitter`](spaces/@spell/examples/bill-splitter/) | Who owes what after a meal:  a form of people and what each ordered, a tip shared out the same way, and sums that follow every keystroke | <a href="docs/images/examples/bill-splitter.png"><img src="docs/images/examples/bill-splitter.png" width="360" alt="Bill Splitter open in the Spell editor:  its Spell on the left, the app running on the right"></a> |
| Flash Cards | [`@spell/examples/flash-cards`](spaces/@spell/examples/flash-cards/) | A deck of Spanish words to quiz yourself on:  a card turns over on a click, you say whether you knew it, and a score keeps count | <a href="docs/images/examples/flash-cards.png"><img src="docs/images/examples/flash-cards.png" width="360" alt="Flash Cards open in the Spell editor:  its Spell on the left, the app running on the right"></a> |
| Habit Tracker | [`@spell/examples/habit-tracker`](spaces/@spell/examples/habit-tracker/) | A week of checkboxes per habit:  each habit its own element with a form of its own, its days done and its longest streak worked out as you tick | <a href="docs/images/examples/habit-tracker.png"><img src="docs/images/examples/habit-tracker.png" width="360" alt="Habit Tracker open in the Spell editor:  its Spell on the left, the app running on the right"></a> |
| Task List | [`@spell/examples/TaskList`](spaces/@spell/examples/TaskList/) | A to-do list in spellx, Spell in tags:  each task its own element, with Spell UI's controls;  a toolbar of actions filters it, ticking the one it shows, and a click selects tasks (shift and command for more) for a property editor that changes them all at once | <a href="docs/images/examples/TaskList.png"><img src="docs/images/examples/TaskList.png" width="360" alt="Task List open in the Spell editor:  its Spell on the left, the app running on the right"></a> |
| Lista de tareas | [`@spell/examples/ListaDeTareas`](spaces/@spell/examples/ListaDeTareas/) | Task List's Spanish twin:  a to-do list in the outline style, in Spanish, each task its own element with Spell UI's controls, a click selecting tasks for a property editor that changes them all at once | <a href="docs/images/examples/ListaDeTareas.png"><img src="docs/images/examples/ListaDeTareas.png" width="360" alt="Lista de tareas open in the Spell editor:  its Spell on the left, the app running on the right"></a> |
| Solitaire | [`@spell/examples/Solitaire`](spaces/@spell/examples/Solitaire/) | Klondike solitaire in spellx, Spell in tags:  its own cards, deck and piles, each its own element;  the card a two sided view, the game's moves its actions, with keys and a right-click menu;  `pause for` animates the deal | <a href="docs/images/examples/Solitaire.png"><img src="docs/images/examples/Solitaire.png" width="360" alt="Solitaire open in the Spell editor:  its Spell on the left, the app running on the right"></a> |
| Solitario | [`@spell/examples/Solitario`](spaces/@spell/examples/Solitario/) | Solitaire's Spanish twin:  Klondike in the outline style, in Spanish, with its own cards, deck and piles (`Carta`, `Mazo`, `Pila`), as Solitaire has | <a href="docs/images/examples/Solitario.png"><img src="docs/images/examples/Solitario.png" width="360" alt="Solitario open in the Spell editor:  its Spell on the left, the app running on the right"></a> |
| People | [`@spell/library/people`](spaces/@spell/library/people/) | People, orgs, notes and relationships, each saved in a readable JSON5 file;  compiled to TypeScript for the app's "You" panel and the people store | a library:  no app of its own |

<!-- examples:end -->

They're two groups in Spell's own space:
`@spell/examples`, and `@spell/library`, whose library is for other projects to import.
Every example but Counter has a guide that takes it apart:  [guides](#guides--programs-that-read-as-prose), below.
Counter has a notebook instead, `@spell/notebooks/Counter`, which imports its counter and tries it out.

### Opening one

With Spell set up ([setup from zero](https://github.com/spell-app/spell/blob/main/README.md#setup-from-zero)) and `spell` on your PATH
([setting it up](https://github.com/spell-app/spell/blob/main/README-cli.md#setting-it-up)), one command opens the editor on an example:

```sh
spell app serve @spell/examples/calculator
```

- It opens your browser on the example, until Ctrl-C ([its options](https://github.com/spell-app/spell/blob/main/README-cli.md#spell-app)).
- In the editor, **Home** (the house icon in the top bar) lists every project, these among them.
- `/run/` in place of `/edit/` shows the app alone, full size, with its console
  ([the editor's routes](README-app.md#the-editor--one-object-behind-every-pane)).
- `spell run @spell/examples/fizzbuzz` compiles one and runs it:  in your terminal,
  or, for one with an app, in your browser until Ctrl-C.
- `spell projects @spell/examples` lists them, alphabetically, which is not the order to open them in.

<details>
<summary>How the table is made, and adding an example</summary>

The table and its pictures come from the example projects, so a new example shows up by running one command.
Everything else on this page is written by hand.

1. Make the project in `spaces/@spell/examples/<name>/`:  a `__project.json5` and its `.spell` or `.spellx` files.
   `spell app create <name> --in spaces/@spell/examples` writes a first one.
2. Give its project file a `"description"`:  one line of what it shows.
   - Without one, the table takes the first comment of its first Spell file.
   - A `"title"` names it, when its folder's name can't (`ListaDeTareas` is "Lista de tareas").
3. Add its name to the learning order at the top of [the script](scripts/examples-readme.ts), where it fits;
   one not listed comes after the listed ones, by name.
4. Start the editor, `yarn start` in spell-app, and leave it running.
5. In spell-app's folder, `yarn examples:readme`:
   it opens each example in the editor, headless, in a window 1280 by 800,
   gives it 5 seconds after the page goes quiet to compile, run and draw,
   saves a picture of it into [the pictures folder](docs/images/examples/),
   and rewrites the table between the page's two marker comments.

   ```text
   docs/images/examples/fizzbuzz.png
   docs/images/examples/calculator.png
   ...
   README-examples.md:  7 projects
   ```

- `yarn examples:readme --no-pictures` rewrites only the table, without a browser;
  `yarn examples:readme calculator` takes only that example's picture.
- `yarn examples:readme --check` writes nothing:
  it fails while the table is out of date, or an example has no picture.
  spell-app's tests run it, so a new example fails `yarn test` until the page is made again.
- The table draws each picture 360 pixels wide;  a click opens it whole.
- Opening a project in the editor compiles it:  its declarations and words go in `build/` with its compiled code,
  so nothing beside its source changes.

</details>

## Every app here has four parts

FizzBuzz only prints.
The other nine draw an app, and each is built the same way:
what its things ARE, what they DO, how they DRAW, and one line that starts it.
If you know React, you know all four already, under other names.

The Calculator shows them plainest, in 113 lines, because it keeps each part in a block of its own:

| Part | In the Calculator | In React |
| --- | --- | --- |
| what its things are | `a calculator has a total as a number`, one of its six properties | the component's state |
| what they do | `to clear (a calculator):`, and four more actions | its event handlers |
| how they draw | `to draw (a calculator)`:  a keypad of Spell UI buttons, each with a click like `onClick={append "7" to it}` | its JSX |
| the start | `start the calculator`, which puts its drawing on the page | `createRoot(root).render(<App />)` |

<details>
<summary>The four parts, in the Calculator's own lines</summary>

```spell
a calculator is an app
a calculator has an input as text
a calculator has an output as text
a calculator has a left as text
a calculator has a right as text
a calculator has a total as a number
a calculator has an operator as text
```

```spell
to clear (a calculator):
	set its input to ""
	set its output to ""
	set its left to ""
	set its operator to ""
	set its right to ""
	set its total to 0
```

```spell
to draw (a calculator)
	...
		<div class="Keypad">
			...
			<ui-button onClick={append "7" to it}>7</ui-button>
			<ui-button onClick={append "8" to it}>8</ui-button>
			<ui-button onClick={append "9" to it}>9</ui-button>
			<ui-button primary onClick={apply "×" to it}>×</ui-button>
	...
```

```spell
set calculator to a new calculator
clear the calculator
start the calculator
```

- The whole program, its other four actions too:
  [Calculator.spell](spaces/@spell/examples/calculator/Calculator.spell).
- The keypad's grid, four keys a row, is its own CSS:
  [styles.css](spaces/@spell/examples/calculator/styles.css).

</details>

The difference that matters:  a click handler is a sentence.
`onClick={clear it}` on the C key clears the calculator, and `it` is the calculator being drawn.

So the wording counts.
The operator keys say `apply "+" to it`, the calculator's own action:
a sum already typed carries its total on as the next sum's left number, and the second number starts afresh.

- `set its operator to "+"` would read as well, and only set the property:
  press 7, +, 5, and the 5 would join the 7, for 7 + 75.
- Its action was once named `set the operator of (a calculator) to (op as text)`:
  then `set the operator of it to "+"` ran it, and `set its operator to "+"`, one word apart, set only the property.
  So the action has a name no property has.

Two more things the picture won't tell you:
- The total appears as you type the second number;  the = key makes it the next sum's start.
- The display and the keypad are plain `<div>`s, laid out by the project's own stylesheet;
  the keys are Spell UI's `<ui-button>`, `primary` for an operator, `negative` for C.

## FizzBuzz:  a loop, and printing

The classic programming exercise:
count to 100, saying "fizz" for multiples of 3, "buzz" for multiples of 5, and "fizzbuzz" for both.
Here's all of [FizzBuzz.spell](spaces/@spell/examples/fizzbuzz/FizzBuzz.spell), not an excerpt:

```spell
## File FizzBuzz.spell
to play fizzbuzz
	for each number from 1 to 100
		if the number divided by 15 is an integer: print the number, "fizzbuzz"
		otherwise if the number divided by 3 is an integer: print the number, "fizz"
		otherwise if the number divided by 5 is an integer: print the number, "buzz"
		otherwise print the number

play fizzbuzz
```

- It's a program in two parts, not four:  `to play fizzbuzz` defines a new phrase, and `play fizzbuzz` says it.
- `for each number from 1 to 100` names its loop variable, `number`, and later lines call it "the number".
- It draws nothing, so the editor's App pane stays empty (the picture below):
  what it prints goes to the program's output, under the text, or to your terminal.

```sh
spell run @spell/examples/fizzbuzz
```

<details>
<summary>Output</summary>

```text
✓ Compiling @spell/examples/fizzbuzz
1
2
3 fizz
...
15 fizzbuzz
...
100 buzz
```

</details>

With `--target py`, the same hundred lines come from Python ([the targets](https://github.com/spell-app/spell-parser/blob/main/README-targets.md)).

<details>
<summary>What it compiles to, in JavaScript</summary>

```js
core.heading("File FizzBuzz.spell")
/** File FizzBuzz.spell */
export function playFizzbuzz() {
  core.getRange(1, 100).forEach((number) => {
    if (core.isOfType(number / 15, "integer")) core.console.log(number, "fizzbuzz")
    else if (core.isOfType(number / 3, "integer")) core.console.log(number, "fizz")
    else if (core.isOfType(number / 5, "integer")) core.console.log(number, "buzz")
    else core.console.log(number)
  })
}

playFizzbuzz()
```

- From `spell compile @spell/examples/fizzbuzz --stdout`, its import line left out.
- The new phrase is a function, `playFizzbuzz()`;  "the number" is the loop's `number`.
- `core` is [the runtime](https://github.com/spell-app/spell-parser/blob/main/README-core.md) compiled Spell runs on.

</details>

<img src="docs/images/examples/fizzbuzz.png" width="640" alt="FizzBuzz open in the Spell editor:  its program on the left, an empty App pane on the right, its first line of output at the bottom">

_FizzBuzz in the editor:  nothing to draw, so the App pane stays empty, and the output starts at the bottom left._

## Four small apps:  a game, a form, a quiz and a checklist

Each is one file of Spell and a stylesheet, and each shows one thing the language does well.

| App | What to look at | Its edge |
| --- | --- | --- |
| [Tic-Tac-Toe](spaces/@spell/examples/tic-tac-toe/TicTacToe.spell) | the rule for a win, eight sentences:  `check the line from square 1 through 2 to 3` | inside `repeat 9 times`, `its` is the count, so the board is `the board of tic tac toe` there |
| [Bill Splitter](spaces/@spell/examples/bill-splitter/BillSplitter.spell) | worked-out values a form changes:  `- its "share" is its amount + its tip`, each sum following every keystroke | no word adds up a list, nor writes money:  a loop adds the amounts, and `to write (amount as a number) as money` makes "$12.50" |
| [Flash Cards](spaces/@spell/examples/flash-cards/FlashCards.spell) | a random card, never the one just shown:  `cards in its deck where it is not the card of quiz` | `a random card in ...` reads;  `a random flash card in ...`, two words, doesn't yet |
| [Habit Tracker](spaces/@spell/examples/habit-tracker/HabitTracker.spell) | a streak, worked out from a week of yes and no:  `for each day in its days` | no dates:  the week is seven properties, Monday to Sunday, with no "today" |

```spell
// the same mark in all three squares wins
- to check the line from square (a as a number) through (b as a number) to (c as a number):
	set mark to the mark of square a of its board
	if mark is "" return
	if the mark of square b of its board is mark and the mark of square c of its board is mark
		set its winner to mark
```

_From Tic-Tac-Toe:  a phrase with three blanks, which the game says eight times, once a line._

- Each has a test of its own:  `spell test @spell/examples/tic-tac-toe` plays a game to a win.
- Tic-Tac-Toe, Bill Splitter and Habit Tracker draw their rows as things of their own,
  as Task List does (below):  `<tic-tac-toe-square>`, `<bill-splitter-diner>`, `<habit-tracker-habit>`.

## Task List:  things that draw themselves, a list, and a property editor

Every framework has its to-do list, and this is Spell's:
[Task List](spaces/@spell/examples/TaskList/), 141 lines of Spell in two files, and a style sheet.
- [Task.spellx](spaces/@spell/examples/TaskList/Task.spellx):  what a task is, and how it draws.
- [TaskList.spellx](spaces/@spell/examples/TaskList/TaskList.spellx):  the list of tasks, then the app around it.

It's written in spellx, Spell in tags:  a tag for each template, and inside it a tag for each property, alias and drawing,
with Markdown around them for a person to read
([the spellx page](https://github.com/spell-app/spell-parser/blob/main/README-spellx.md)).
First, what a task IS:

```html
<spell-view "task">
	<property "title" description="What to do">text</>
	<property "notes" description="Anything else about it">text</>
	<property "priority" one-of="low, normal or high" />
	<property "done">yes or no</>
	<alias "is done">if its done is yes</>
	<alias "is active">if it is not done</>

	<group "on the page"
		description="A click selects it, shift and command (ctrl) more, for the property editor;  its grip drags it, the selected ones with it"
	/>
	<spell>
		- it can be selected
		- it can be dragged
	</spell>
```

- `<spell-view "task">` declares a new template;  each `<property>` gives it a property, with its kind.
- `<group "on the page">` is a heading over the members after it, its `description=` what they're for.
- `one-of="low, normal or high"` is a choice of three values.
- The aliases are new ways to talk about a task:  later lines can say `where it is active`.
- A view makes each task an element of its own on the page, `<task-list-task>`.
- A `<spell>` block holds plain Spell, here two outline bullets:
  - `it can be selected`:  a click selects a task, and shift or command (ctrl) selects more.
  - `it can be dragged`:  by its grip, to another place in its list (below).

Then how a task draws, with [Spell UI](https://github.com/spell-app/spell-ui/blob/main/README.md)'s elements:
a form of its own, bound to the task.

```html
<draw description="A form of its own, bound to it:  checking the box, or typing a title, changes the task">
	<html>
		<ui-form value={it}>
			<div part="row">
				<ui-icon part="grip" name="grip vertical" aria-label="Drag"/>
				<ui-checkbox name="done" aria-label="Done"/>
				<ui-input part="title" name="title" aria-label="Task" appearance="transparent"/>
				<ui-label part="priority" size="tiny" color={"red" if its priority is high otherwise "grey"}>{its priority}</ui-label>
			</div>
		</ui-form>
	</html>
</draw>
```

- `<html>` draws its markup exactly as written, Spell UI's elements and the web's own `<div>`;
  Spell goes inside the braces, `{its priority}`.
- There's no change handler anywhere.
  The form is bound to the task (`value={it}`):
  each named field shows its task's property, and writes it back as you type or tick.
- The style sheet shows the priority label only when it isn't normal, and fades a task that's done.
- A press in the title field or on the checkbox is theirs:  a drag starts from the grip, or the task's bare row.

Then the list, which decides which tasks to show:

```html
<spell-view "checklist" template="viewable list of tasks">
	<property "showing" one-of="all, active or done"
		description="What it shows:  every task, the ones still to do, or the ones done"
		alias="is showing (showing)"
	/>

	<spell>
		// on the page, its tasks can be dragged to another place:  they move as the pointer does, gliding there
		- its items can be reordered immediately
		// each task, unless the filter hides it
		- to draw each item:
			if it is showing active and the task is done return nothing
			if it is showing done and the task is active return nothing
			return draw the task
	</spell>
	<draw "placeholder" description="What it shows while it's empty">
		<text part="placeholder">Nothing to do</text>
	</draw>
```

- A viewable list is an element too, `<task-list-checklist>`, around its tasks' elements.
- Each task draws itself;  the list only says which to leave out, and what to show when it's empty.
- `alias="is showing (showing)"` lets a line ask `it is showing active`, one alias for each of its three values.
- `its items can be reordered immediately`:  drag a task, and it moves as the pointer goes, dimmed, each task gliding
  to its new place.
  - Without `immediately`, it stays put while a blue line shows where it would go:
    rest the pointer there 2 seconds (or `after 1 second`), and it moves;  let go, and it moves at once.
  - Drag a selected task, and every selected one goes with it.
  - The page's `move-delay="0.5"` on the list sets the wait for that one list.

<details>
<summary>What the checklist compiles to</summary>

```js
export class Checklist extends ViewableList {
  static instanceType = Task
  static elementTag = core.defineElement(this, "TaskList")

  // ... its showing:  all, active or done
  isShowingShowing(showing) {
    return this.showing === showing
  }

  // each task, unless the filter hides it
  drawEachItem(item) {
    if (this.isShowingShowing("active") && item.isDone) return undefined
    if (this.isShowingShowing("done") && item.isActive) return undefined
    return core.drawThing(item)
  }

  // What it shows while it's empty
  drawItsPlaceholder() {
    return h("ui-text", { part: "placeholder" }, "Nothing to do")
  }

  static reorderItemsAfter = 0

  static exclusive = true
}
```

- Trimmed from `spell compile @spell/examples/TaskList --stdout`.
- The two aliases became getters on the task, `isDone` and `isActive`:  `the task is done` reads `item.isDone`.
- `is showing (showing)` became one method with the blank as its argument, `isShowingShowing("active")`.
- `static reorderItemsAfter = 0` is `immediately`:  no wait before a dragged task moves.
- `static exclusive` is the line `a task belongs to one checklist`:  a task is in one checklist at a time.

</details>

And last, the app:  `<spell-app "task list">`, with its checklist, the new task's field, and its actions.

```html
<action "add the draft" description="The draft, as a new task at the end of the list;  the field empties">
	if its draft is "" return
	add (a new task with title = its draft, priority = normal) to its checklist
	clear its draft
</action>

<group "filter" description="Which tasks the list shows:  the toolbar ticks the one it's showing"/>
<action "show all" icon="list" selected-when="its checklist is showing all">set the showing of its checklist to all</>
<action "show to do" icon="square outline" selected-when="its checklist is showing active">set the showing of its checklist to active</>
<action "show done" icon="check square outline" selected-when="its checklist is showing done">set the showing of its checklist to done</>
<action "remove the done tasks" icon="trash alternate outline">remove tasks in its checklist where it is done</>
```

- An action's body is plain Spell, its steps one a line.
- `icon` and `selected-when` are how a toolbar shows it:  a button with that icon, ticked while the line is true.

How it draws:
- a toolbar across the top:  its title, how many tasks are left to do,
  then the tasks menu's actions as icon buttons, the filter it's showing ticked
- the new task's field, and its Add button, which stays disabled while the field is empty
- the list, and beside it a property editor, `<ui-property-editor>`, bound to `the selection of its checklist`

The property editor edits every selected task at once.
Select three tasks, set the priority to high, and all three change;
a property they disagree on shows "Mixed".

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontFamily":"-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif","fontSize":"15px","primaryColor":"#EFECFB","primaryBorderColor":"#6550CA","primaryTextColor":"#1A1C27","secondaryColor":"#F4F1E9","tertiaryColor":"#F7F6FC","lineColor":"#7F6FD6","textColor":"#7F6FD6","clusterBkg":"#F7F6FC","clusterBorder":"#B9B0E8","titleColor":"#1A1C27","edgeLabelBackground":"#F7F6FC","actorBkg":"#EFECFB","actorBorder":"#6550CA","actorTextColor":"#1A1C27","actorLineColor":"#9C90DE","signalColor":"#7F6FD6","signalTextColor":"#7F6FD6","labelBoxBkgColor":"#EFECFB","labelBoxBorderColor":"#6550CA","labelTextColor":"#1A1C27","loopTextColor":"#7F6FD6","noteBkgColor":"#F1E7D4","noteBorderColor":"#C9B48A","noteTextColor":"#1A1C27","activationBkgColor":"#DCD6F7","activationBorderColor":"#6550CA","sequenceNumberColor":"#FFFFFF"},"flowchart":{"curve":"basis","padding":12,"nodeSpacing":40,"rankSpacing":44}}}%%
flowchart LR
  app["the task list app"] -->|has| list["a checklist:  all, active or done"]
  app -->|has| draft["the new task's field"]
  draft -->|Add| task
  list -->|holds| task["a task:  title, notes, priority, done"]
  task -->|draws itself as| form["its own form:  a checkbox, its title"]
  form -.->|a tick writes back| task
  list -->|its selection| editor["the property editor"]
  editor -.->|edits every selected task| task
  %% the Spell look:  yarn mermaid:pretty
  classDef default fill:#EFECFB,stroke:#6550CA,stroke-width:1.5px,color:#1A1C27,rx:8px,ry:8px
```

_The app keeps a checklist of tasks;  each task draws its own form, and the property editor changes the selected ones._

Its tests are written in Spell, a `<test>` inside the template each one tests:

```sh
spell test @spell/examples/TaskList
```

<details>
<summary>Output</summary>

```text
✓ Compiling @spell/examples/TaskList
✓ test checking one off  (2 checks)
✓ test the filter  (1 check)

2 passed
```

</details>

Nothing is saved, though.
The tasks last as long as the program runs, and Restart starts again from the four it makes.

<img src="docs/images/examples/TaskList.png" width="640" alt="Task List open in the Spell editor:  its Spell on the left;  on the right, the menu with 3 to do and four icon buttons, the new task's field, four tasks, the first ticked and marked high, and the property editor below">

_Task List in the editor:  the first task is ticked, because the program makes it with `done = yes`._

### Lista de tareas:  the same list, in Spanish

[Lista de tareas](spaces/@spell/examples/ListaDeTareas/) is Task List written in Spanish, in the outline style,
as Solitario is Solitaire (below):  its own `tarea`, in `Tarea.es.spell`.

```spell
una "tarea" es una cosa dibujable donde:
	- su "título" es texto
	- su "nota" es texto
	- su "prioridad" es una de baja, normal o alta
	- su "hecha" es sí o no
	- "está hecha" si su hecha es sí
	- "está pendiente" si su hecha es no
```

_A task, in Spanish:  the seven lines of Task List's task, as an outline, their comments left out._

- Its tests are the same two, in Spanish:  `spell test @spell/examples/ListaDeTareas` runs them.
- It draws with Spell UI's Spanish tags (`<es-formulario>`, `<es-casilla>`), and its menu says "3 pendientes".

<img src="docs/images/examples/ListaDeTareas.png" width="640" alt="Lista de tareas open in the Spell editor:  Tarea.es.spell on the left;  on the right, the same task list in Spanish, 3 pendientes, Algo por hacer, Agregar">

_Lista de tareas in the editor:  the same list, its words in Spanish._

## Solitaire:  a game in spellx, and things that draw themselves

Klondike in four files, written in spellx, as Task List is.
Its cards, its deck and its piles are its own files, before the game, in its project file's order:

```json5
[{ "path": "/Card.spellx" }, { "path": "/Deck.spellx" }, { "path": "/Pile.spellx" }, { "path": "/Solitaire.spellx" }]
```

_From [its project file](spaces/@spell/examples/Solitaire/__project.json5), shortened:  each file sees the ones before it._

So [Solitaire.spellx](spaces/@spell/examples/Solitaire/Solitaire.spellx) is only the game:
the solitaire itself, how a click or a drag plays a card, and its kinds of pile, each saying what it may take or give up.

```html
<spell-app "solitaire">
	<property "score">a number</>
	<property "hint" description="What the card being dragged would add to the score, e.g. (+10):  shown beside it">text</>
	<property "deck">a new deck</>

	<group "piles" description="One of each, made with the solitaire"/>
	<property "stock">a new stock pile with name = "stock"</>
	<property "discards">a new discard pile with name = "discards"</>
	<property "clubs">a new foundation with name = "clubs", suit = clubs</>
```

- The same sentences as the Calculator's, each in a tag of its own, without "a solitaire" at the start of every line.
- It isn't a second language:  the tags are more ways to write the same rules
  ([the language, sentence by sentence](https://github.com/spell-app/spell-parser/blob/main/README-spell.md)),
  and a `<spell>` block inside one is plain Spell.
- `<group>` tags and `##` lines are headings:  for a person to read, which the editor shows in bold.
- [Card.spellx](spaces/@spell/examples/Solitaire/Card.spellx) says what its suits, ranks and colors are:
  `suit = clubs` reads one, and a foundation draws its suit's ace, by the card's `picture`.
- The card is a `two sided view` ([Card.spellx](spaces/@spell/examples/Solitaire/Card.spellx)):
  its direction, face up or down, and `turn it over` come from that built-in template,
  so the card draws only its `<draw "front">` and its `<draw "back">`.
- A click on a card is its own handler, `<on click>`:  `play it`, and the game says where it goes.

The deal is a loop with a pause in it, so you watch it happen:

```spell
- animation deal the cards:
	for each card in its deck
		set start pile to the pile of the card
		turn the card face down
		if start pile is not the stock of the solitaire
			add the card to the stock of the solitaire
			pause for 50 msec
	shuffle its stock
	for row from 1 to 7
		turn the last card of its stock face up
		for column from row to 7
			add the last card of its stock to item column of the tableaus
			pause for 50 msec
	wait for: play from the stock
```

_From a `<spell>` block in Solitaire.spellx:  plain Spell, in the outline style._

- `pause for 50 msec` lets the page draw before the next line runs:  28 cards dealt, 50 ms apart.
- Written `animation` instead of `to`, an action runs one at a time:
  asking for it again while it runs does nothing, so a second Restart can't deal on top of the first.
- A card is in one pile at a time, as [Pile.spellx](spaces/@spell/examples/Solitaire/Pile.spellx) says
  (`a card belongs to one pile`):  adding it to the stock takes it off the pile it was in.

What you see:
- Each card is one character, from Unicode's playing cards:  the queen of spades is 🂭, and the card's test checks it.
- Each card is its own element, `<solitaire-card>`;
  each pile is a viewable list, its own element (`<solitaire-tableau>` and the rest), holding its cards' elements.
- Each kind of pile lays its cards out by its `layout`, which [styles.css](spaces/@spell/examples/Solitaire/styles.css) draws:
  a tableau shows the top of each card below the one before;  a stacked pile, the stock, the discards and the
  foundations, shows its last card, over a dashed place for its first.
- Auto play, Cheat and Restart run across the top, and the board's right click shows them as a menu,
  each with its key (A, C, N);  a card onto a foundation scores 10, one from the discards 5.
  Cheat turns up a random face-down card:  `set the pile to a random pile in remaining piles`.

Its tests are written in Spell, a `<test>` inside what each one tests, and run from the command line:
the tests of its card, deck and piles, then the tableau's own, of what each pile may take.

```sh
spell test @spell/examples/Solitaire
```

<details>
<summary>Output</summary>

```text
✓ Compiling @spell/examples/Solitaire
✓ test card setup  (19 checks)
✓ test a new deck  (5 checks)
✓ test piles  (8 checks)
✓ test the moves  (11 checks)

4 passed
```

</details>

<img src="docs/images/examples/Solitaire.png" width="640" alt="Solitaire open in the Spell editor:  its Spell on the left;  on the right the game, dealt, the stock, the discards and four foundations across the top, seven tableaus below">

_Solitaire in the editor, dealt:  its Spell on the left, the game on the right._

### Solitario:  the same game, in Spanish

Spell reads Spanish too, a file at a time, by its name:  `Solitario.es.spell` is Spanish, a name with no language English
([Spell in Spanish](https://github.com/spell-app/spell-parser/blob/main/README-spanish.md)).
[Solitario](spaces/@spell/examples/Solitario/) is Solitaire written in it, in the outline style, cards and all:
its own `Carta`, `Mazo` and `Pila`, as Solitaire has its `Card`, `Deck` and `Pile`, so all of it reads in Spanish.

```spell
// una columna:  se arma hacia abajo, del rey al as, rojo y negro alternados
una "columna" es una pila donde:
	- puede soltar una carta si: la carta está boca arriba
	- puede tomar una carta si:
		si la columna está vacía
			devolver la carta es un rey
		devolver su color no es el color de la carta y su valor es el valor de la carta + 1
```

_The tableau's rule, in Spanish:  a column, `columna`._

- Its tests are six, in Spanish, two of them its jokers', which Solitaire has dropped:
  `spell test @spell/examples/Solitario` runs them.
- Where the two differ, a Spanish word does:  the queen is `dama`, so its short name is D, and the king's R.

<img src="docs/images/examples/Solitario.png" width="640" alt="Solitario open in the Spell editor:  Carta.es.spell on the left;  on the right, the game running, its menu in Spanish, Puntos, Jugar solo, Trampa, Depurar, and the same Klondike board">

_Solitario open in the editor, dealt:  the same board, its menu in Spanish, drawn with Spell UI's Spanish tags (`<es-menu>`, `<es-cuadricula>`)._

## Guides:  programs that read as prose

```spell
## How Tic-Tac-Toe works
// The Tic-Tac-Toe example is the paper game:  X and O take turns, and three in a row wins.
// Its rules fit in three ideas:
// - each square knows its own mark, and draws itself as a button
// - the game knows whose turn it is
// - after each move, the game checks every line of three for a winner
//
// This guide is the same game with one thing missing:  it only checks the ROWS, across.
// Three down, or corner to corner, doesn't win yet.  Adding those is your move, at the end.


## A square:  empty, or holding an X or an O
// "view" means each square shows itself on the page, here as a button
a "square" is a view where:
	- its "mark" is text
	- it "is empty" if its mark is ""
```

_The top of [How Tic-Tac-Toe works](spaces/@spell/guides/how-tic-tac-toe-works/HowTicTacToeWorks.spell):
the story in comments, the program between them._

A guide is a Spell project like any example, so it runs:
the editor shows its `##` headings in bold and its comments in italics, and the app it makes on the right.
Unlike a tutorial page, there's nothing to copy across:  you change a line where you read it, and the app follows.

Twelve of them, in `@spell/guides`, the editor's Guides column:

| Guide | What it teaches |
| --- | --- |
| [`Your first spell`](spaces/@spell/guides/a-first-spell/) | five steps on a hello sign, each a "Your move" and a "What you'll see":  change a name, change what a click does, break a line on purpose, a check that runs by itself |
| [A tour of Spell](spaces/@spell/guides/a-tour-of-spell/) | things, properties, rules and drawing, on a windowsill of plants that say when they need water |
| How FizzBuzz, the Calculator, Tic-Tac-Toe, the Bill Splitter, Flash Cards, the Habit Tracker, the Task List and Solitaire work | one each, in [the guides' folder](spaces/@spell/guides/):  a short program of its own with the example's key lines |
| [Cómo funciona Solitario](spaces/@spell/guides/como-funciona-solitario/), [Cómo funciona Lista de tareas](spaces/@spell/guides/como-funciona-lista-de-tareas/) | the two Spanish twins, written in Spanish |

- A guide opens in the editor, not the runner:  from its card, and from `Read your first spell` on the editor's home.
- Each is 52 to 111 lines, and tested as the examples are:
  compiled against snapshots (in `tests/spell/__guides__/`), type-checked as TypeScript, and run.
  A new folder in `spaces/@spell/guides/` is picked up by those tests by itself.
- A "how it works" guide is NOT the example:  it copies the key lines into a program of its own,
  so the example can change without breaking the guide;  Tic-Tac-Toe's leaves a piece out for you to add.
- **The edges:**  the guides step around a few phrases Spell doesn't read yet,
  such as `is at least`, and `a + b as a number`;
  in the guides' JSX, the spaces next to a `{...}` are dropped.

## Ideas for your own

Six programs worth writing next, each built from what an example already does.
The last column says where to borrow from;  where a part isn't in the language yet, the row says so.

| Idea | What it is | Borrow from |
| --- | --- | --- |
| A recipe scaler | ingredients with amounts, scaled to a number of servings | numbers, derived properties, `to scale (a recipe) to (servings as a number)` |
| Dice games (Yahtzee, Pig) | a die that draws itself, rolled with an animation, scored by aliases | Solitaire's card:  `a "die" is a view`, Solitaire's piles' `layout` and styles.css, `pause for`;  Task List's aliases:  `a roll "is a full house" if ...` |
| Memory | cards face up and face down in a grid | Solitaire's `Card`, `Deck` and `Pile`, copied in or imported from it;  a grid that's a view |
| A collection catalogue | movies, baseball cards:  items with categories, and filter buttons | `one of ...` kinds and Task List's filter;  `it is saved in its own file`, as the people library's person is |
| A sign-up sheet | people and a list of slots, in a form | `@spell/library/people` and Task List's forms and property editor;  🌱 a natural first program to share, once editing together arrives |
| A text adventure | rooms as things, and each way out a button | Task List's clicks, and `print`;  **not yet** typed commands (below) |

**Not yet:  reading what someone types.**
`prompt "Where now?"` shows a dialog in the editor, but the program can't read the answer:
it compiles to `await core.prompt(...)`, and what was typed is dropped.
- In a terminal, `prompt` only prints its question;  Python's runtime hasn't ported it.
- `choose one of ... with prompt`, the natural way to pick a room, is written down in the prompt rule and commented out:
  `spell lint` answers "Don't understand".

Start one, and it runs at once:

```sh
spell app create Flashcards
```

<details>
<summary>What it printed</summary>

```text
<your space>/Flashcards
Made Flashcards:  try  spell run <your space>/Flashcards
```

</details>

- It writes a project file and Flashcards.spell, a comment and one line that prints "hello from Flashcards".
- With no `--in`, it goes in your own space:  [setting one up](README-spaces.md#setting-up-spaces-for-your-own-project)
  says where that is, and how a project imports a library.
- Then, in its folder, `spell app serve` opens the editor on it.

## The frozen test projects

FizzBuzz and the to-do list Task List grew from have frozen twins beside them,
[`@spell/test`](spaces/@spell/test/),
which the tests in [tests/spell/](tests/spell/) compile and compare line for line
([how they're checked](https://github.com/spell-app/spell-parser/blob/main/README-spell.md#the-frozen-test-projects)).
Open them like any other project (`/edit/@spell/test/fizzbuzz`), but change the examples here instead:
even `spell format` leaves the test projects alone.

## See also

- [The editor and the runners](README-app.md):  how the editor runs an example as you type,
  and keeps a game going across an edit
- [Spaces](README-spaces.md):  addresses, your own space, and importing a library into a project
- [The language, sentence by sentence](https://github.com/spell-app/spell-parser/blob/main/README-spell.md):  every kind of sentence these examples use,
  and how the frozen test projects are checked
- [spell-app's commands](https://github.com/spell-app/spell/blob/main/README-cli.md#spell-app):  `spell app create`, `spell app serve` and `spell projects`,
  in full
- [Spell UI's components](https://github.com/spell-app/spell-ui/blob/main/README-components.md):
  the `<ui-*>` elements Task List and Solitaire draw with
