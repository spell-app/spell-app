from __future__ import annotations

from typing import Any

from spell_core import core, List, App, View, ViewableList, prop, h


###########
# ## A task
###########
# Something to do:  its title, its priority, and whether it's done.
# Each task is its own element on the page, `<task-list-task>`.


class Task(View):
    element_tag = "test-project-task"

    # What to do
    # - its "title" is text
    title = prop(type="text")

    # Anything else about it
    # - its "notes" is text
    notes = prop(type="text")

    # - its "priority" is one of low, normal or high
    PRIORITIES = ("low", "normal", "high")
    priority = prop(one_of=PRIORITIES)

    # - its "done" is yes or no
    done = prop(type="choice")

    @property
    def is_done(self) -> bool:
        return self.done

    @property
    def is_active(self) -> bool:
        return not self.is_done

    def draw(self) -> Any:
        """A form of its own, bound to it:  checking the box, or typing a title, changes the task"""
        return h(
            "ui-form",
            {"value": self},
            h(
                "div",
                {"part": "row"},
                h("ui-icon", {"part": "grip", "name": "grip vertical", "aria-label": "Drag"}),
                h("ui-checkbox", {"name": "done", "aria-label": "Done"}),
                h(
                    "ui-input",
                    {"part": "title", "name": "title", "aria-label": "Task", "appearance": "transparent"},
                ),
                h(
                    "ui-label",
                    {
                        "part": "priority",
                        "size": "tiny",
                        "color": "red" if self.priority == "high" else "grey",
                    },
                    self.priority,
                ),
            ),
        )

    can_be_selected = True

    can_be_dragged = True

    @property
    def checklist(self) -> Checklist | None:
        return Checklist.owner_of(self)


# A click selects it, shift and command (ctrl) more, for the property editor;  its grip drags it, the selected ones with it


def test_checking_one_off() -> Any:
    with core.test("test checking one off"):
        it = Task()
        core.echo_test_action("set the task to a new task with title = \"Write the tests\"")
        task = Task(title="Write the tests")
        core.expect(task.is_active, "the task is active", True, "yes")
        core.echo_test_action("set the done of the task to yes")
        task.done = True
        core.expect(task.is_done, "the task is done", True, "yes")


# -----------


##############
# ## Task List
##############
# A to-do list:  add a task, check it off, filter the list, and edit the selected tasks together.
# Its tasks are this project's own `<spell-view "task">`;  this file holds their list, and the app.

##################
# ## The checklist
##################
# The tasks, each its own element inside it:  `<task-list-checklist>`, around its `<task-list-task>`s.


class Checklist(ViewableList):
    item_type = Task
    element_tag = "test-project-checklist"

    # What it shows:  every task, the ones still to do, or the ones done
    # - its "showing" is one of all, active or done
    #   - it "is showing (showing)"
    SHOWINGS = ("all", "active", "done")
    showing = prop(one_of=SHOWINGS)

    def is_showing_showing(self, showing: Any) -> bool:
        return self.showing == showing

    # each task, unless the filter hides it

    def draw_each_item(self, item: Task) -> Any:
        if self.is_showing_showing("active") and item.is_done:
            return None
        if self.is_showing_showing("done") and item.is_active:
            return None
        return core.draw_thing(item)

    # What it shows while it's empty

    def draw_its_placeholder(self) -> Any:
        return h("ui-text", {"part": "placeholder"}, "Nothing to do")

    reorder_items_after = 0

    exclusive = True


# on the page, its tasks can be dragged to another place:  they move as the pointer does, gliding there


def test_the_filter() -> Any:
    with core.test("test the filter"):
        it = Checklist()
        core.echo_test_action("set the tasks to a new checklist")
        tasks = Checklist()
        core.echo_test_action("add (a new task with title = \"a\", done = yes) to the tasks")
        tasks.append(Task(title="a", done=True))
        core.echo_test_action("add (a new task with title = \"b\") to the tasks")
        tasks.append(Task(title="b"))
        core.expect(
            len(tasks.filter(lambda task: task.is_active)),
            "the length of (tasks in the tasks where it is active)",
            1,
            "1",
        )


# a task is in one checklist at a time

############
# ## The app
############
# Its toolbar, the new task's field, then the list beside the property editor.


class TaskList(App):
    element_tag = "test-project-app"

    # - its "checklist" is a new checklist
    checklist = prop(init=lambda: Checklist(), early=True)

    # The next task's title, as the new task's field holds it
    # - its "draft" is text
    draft = prop(type="text")

    @property
    def active_count(self) -> float:
        return len(self.checklist.filter(lambda task: task.is_active))

    def create(self) -> None:
        """A new task list shows every task, and starts with a few"""
        self.checklist.showing = "all"
        self.checklist.append(Task(title="Write the Task List example", priority="high", done=True))
        self.checklist.append(Task(title="Teach it to draw", priority="normal"))
        self.checklist.append(Task(title="Select some tasks, then edit them together", priority="normal"))
        self.checklist.append(Task(title="Drag tasks to reorder them", priority="low"))

    def add_the_draft(self) -> None:
        """The draft, as a new task at the end of the list;  the field empties"""
        if self.draft == "":
            return
        self.checklist.append(Task(title=self.draft, priority="normal"))
        self.draft = ""

    def draw(self) -> Any:
        """The property editor edits every selected task at once:  a property they disagree on shows Mixed"""
        return h(
            "ui-container",
            {"class": "TaskList"},
            h(
                "ui-toolbar",
                {"menu": "tasks menu", "aria-label": "Tasks"},
                h("ui-text", {"slot": "title", "size": "large"}, "Task List"),
                h("ui-text", {"slot": "right"}, self.active_count, " to do"),
            ),
            h(
                "ui-form",
                {"value": self},
                h(
                    "ui-input",
                    {
                        "name": "draft",
                        "placeholder": "Something to do",
                        "aria-label": "New task",
                        "fluid": True,
                        "action": True,
                    },
                    h(
                        "ui-button",
                        {
                            "slot": "action",
                            "color": "primary",
                            "disabled": self.draft == "",
                            "onClick": lambda event: self.add_the_draft(),
                            "style": "cursor:pointer;user-select:none",
                        },
                        "Add",
                    ),
                ),
            ),
            h(
                "ui-grid",
                {"columns": "2", "stackable": True},
                core.draw_thing(self.checklist),
                h(
                    "ui-property-editor",
                    {
                        "label": "Selected tasks",
                        "schema": "task-list-task",
                        "prop:value": self.checklist.selection,
                    },
                    h("ui-property", {"name": "title"}),
                    h("ui-property", {"name": "priority"}),
                    h("ui-property", {"name": "done"}),
                    h("ui-property", {"name": "notes"}),
                ),
            ),
        )

    def show_all(self) -> None:
        self.checklist.showing = "all"

    @property
    def show_all_is_selected(self) -> bool:
        return self.checklist.is_showing_showing("all")

    def show_to_do(self) -> None:
        self.checklist.showing = "active"

    @property
    def show_to_do_is_selected(self) -> bool:
        return self.checklist.is_showing_showing("active")

    def show_done(self) -> None:
        self.checklist.showing = "done"

    @property
    def show_done_is_selected(self) -> bool:
        return self.checklist.is_showing_showing("done")

    def remove_the_done_tasks(self) -> None:
        self.checklist.remove_where(lambda task: task.is_done)


task_list = TaskList()

# Which tasks the list shows:  the toolbar ticks the one it's showing
core.describe_action(TaskList, "show_all", {"title": "show all", "icon": "list", "selected_when": "show_all_is_selected"})
core.describe_action(TaskList, "show_to_do", {"title": "show to do", "icon": "square outline", "selected_when": "show_to_do_is_selected"})
core.describe_action(TaskList, "show_done", {"title": "show done", "icon": "check square outline", "selected_when": "show_done_is_selected"})
core.describe_action(TaskList, "remove_the_done_tasks", {"title": "remove the done tasks", "icon": "trash alternate outline"})
# - its "tasks menu" is a menu of "show all" , "show to do" , "show done" , "-" and "remove the done tasks"
core.describe_menu(TaskList, "tasks_menu", {"items": ["show_all", "show_to_do", "show_done", "-", "remove_the_done_tasks"]})

task_list.start()


# -----------


core.install_styles(None, """/* File styles.css:  how the task list looks.
   - The list and each task are elements of their own, so these rules reach them all:
     - the list, <task-list-checklist>, and its tasks inside it, each a <task-list-task>
     - inside a task, by its parts:  its row, ::part(row);  its grip, ::part(grip);  its title, ::part(title);
       its priority label, ::part(priority)
     - an empty list's placeholder, which it draws itself, by its part:  ::part(placeholder) */

/****************
 * The app:  its toolbar, the new task's field, then the list beside the property editor
 ****************/

.TaskList {
  padding-block: 1em;
}

/* the new task's field, between the toolbar and the list */
.TaskList > ui-form {
  display: block;
  margin-block: 1em;
}

/****************
 * The list:  one task a line
 ****************/

task-list-checklist {
  display: flex;
  flex-direction: column;
  gap: 0.25em;
}

task-list-checklist::part(placeholder) {
  display: block;
  padding: 1em;
  color: grey;
  text-align: center;
}

/****************
 * A task:  its checkbox, its title, and its priority -- shown only when it isn't normal
 ****************/

task-list-task {
  display: block;
  padding: 0.25em 0.5em;
  border-radius: 0.3em;
}

/* its checkbox, its title filling the line, then its priority */
task-list-task::part(row) {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

/* its grip:  what a drag starts from */
task-list-task::part(grip) {
  flex: none;
  color: grey;
}

task-list-task::part(title) {
  flex: 1;
}

task-list-task::part(priority) {
  flex: none;
}

task-list-task[priority="normal"]::part(priority),
task-list-task:not([priority])::part(priority) {
  display: none;
}

/* selected:  a soft purple band, in place of the outline every selected thing has */
task-list-task:state(selected) {
  --spell-selected-outline: none;
  background: rgb(150 80 255 / 0.12);
}

/* done:  its title fades */
task-list-task[done] {
  opacity: 0.6;
}
""")


# -----------


test_checking_one_off()
test_the_filter()
