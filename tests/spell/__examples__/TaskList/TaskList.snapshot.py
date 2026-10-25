from __future__ import annotations

from typing import Any

from spell_core import core, List, App, View, ViewableList, prop, h


########################################################################################
# ## A task:  something to do -- in the outline style:  its name, then what's true of it
########################################################################################


class Task(View):
    """A view:  each task is its own element on the page, `<task-list-task>`."""

    element_tag = "test-project-task"

    # - its "title" is text
    title = prop(type="text")

    # - its "notes" is text
    notes = prop(type="text")

    # - its "priority" is one of low, normal or high
    PRIORITIES = ("low", "normal", "high")
    priority = prop(one_of=PRIORITIES)

    # - its "done" is yes or no
    done = prop(type="choice")

    @property
    def is_done(self) -> bool:
        """\"task is done\""""
        return self.done

    @property
    def is_active(self) -> bool:
        """\"task is active\""""
        return not self.done

    @property
    def priority_color(self) -> Any:
        """its priority label's color:  red when it's high"""
        if self.priority == "high":
            return "red"
        return "grey"

    #################################################################################################################
    # ## drawing:  its grip, a checkbox, its title, and its priority -- styles.css shows it only when it isn't normal
    #################################################################################################################

    def draw(self) -> Any:
        """
        a form of its own, bound to it:  checking the box, or typing a title, changes the task
        - its row and its title are parts:  styles.css lays them out
        """
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
                    {"part": "title", "name": "title", "aria-label": "Task", "transparent": True},
                ),
                h(
                    "ui-label",
                    {"part": "priority", "size": "tiny", "color": self.priority_color},
                    self.priority,
                ),
            ),
        )

    can_be_selected = True

    can_be_dragged = True

    @property
    def checklist(self) -> Checklist | None:
        return Checklist.owner_of(self)


# on the page, a click selects it;  shift and command (ctrl) select more,
# so the property editor beside the list changes them all at once
# and dragged, by its grip, to another place in its list:  the selected ones go with it


def test_tasks() -> Any:
    """Tests"""
    with core.test("test tasks"):
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
# The tasks are this project's own:  Task.
# This file adds their list, and the app:  adding a task, filtering the list, and editing what's selected.
# What's where, top to bottom:
#   the checklist:  the tasks, shown as the filter says
#   the app:  its menu, the new task's field, the list and the property editor
#   start
#   tests

##############################################################
# ## The checklist:  the tasks, each its own element inside it
##############################################################


class Checklist(ViewableList):
    """a viewable list:  `<task-list-checklist>`, around its tasks' `<task-list-task>`s"""

    item_type = Task
    element_tag = "test-project-checklist"

    # what it shows:  every task, the ones still to do, or the ones done
    # - its "showing" is one of all, active or done
    SHOWINGS = ("all", "active", "done")
    showing = prop(one_of=SHOWINGS)

    # each task, unless the filter hides it

    def draw_each_item(self, item: Task) -> Any:
        if self.showing == "active" and item.is_done:
            return None
        if self.showing == "done" and item.is_active:
            return None
        return core.draw_thing(item)

    # empty:  says so

    def draw_its_placeholder(self) -> Any:
        return h("div", {"part": "placeholder"}, "Nothing to do")

    reorder_items_after = 0

    exclusive = True


# on the page, its tasks can be dragged to another place:  they move as the pointer does, gliding there

# a task is in one checklist at a time


class TaskList(App):
    """The app:  its menu, the new task's field, the list, and the property editor"""

    element_tag = "test-project-app"

    # - its "tasks" is a new checklist
    tasks = prop(init=lambda: Checklist(), early=True)

    # what the new task's field holds:  the next task's title
    # - its "draft" is text
    draft = prop(type="text")

    @property
    def active_count(self) -> float:
        return len(self.tasks.filter(lambda task: task.is_active))

    def add_the_draft(self) -> None:
        """the draft, as a new task at the end of the list;  the field empties"""
        if self.draft == "":
            return
        self.tasks.append(Task(title=self.draft, priority="normal"))
        self.draft = ""

    def remove_the_done_tasks(self) -> None:
        self.tasks.remove_where(lambda task: task.is_done)

    def draw(self) -> Any:
        """
        its menu, the new task's field, then the list beside the property editor
        - the menu's buttons are icons, each with a tooltip
        - the property editor edits every selected task at once:  a property they disagree on shows "Mixed"
        """
        def _each_1(event: Any) -> None:
            self.tasks.showing = "all"

        def _each_2(event: Any) -> None:
            self.tasks.showing = "active"

        def _each_3(event: Any) -> None:
            self.tasks.showing = "done"

        return h(
            "ui-container",
            {"class": "TaskList"},
            h(
                "ui-menu",
                h("ui-item", {"type": "header"}, "Task List"),
                h("ui-item", f"{self.active_count} to do"),
                h(
                    "ui-menu",
                    {"position": "right"},
                    h(
                        "ui-item",
                        {
                            "aria-label": "All",
                            "selected": self.tasks.showing == "all",
                            "onClick": _each_1,
                            "style": "cursor:pointer;user-select:none",
                        },
                        h("ui-icon", {"name": "list"}),
                        h("ui-popup", {"content": "All", "inverted": True, "size": "small"}),
                    ),
                    h(
                        "ui-item",
                        {
                            "aria-label": "To do",
                            "selected": self.tasks.showing == "active",
                            "onClick": _each_2,
                            "style": "cursor:pointer;user-select:none",
                        },
                        h("ui-icon", {"name": "square outline"}),
                        h("ui-popup", {"content": "To do", "inverted": True, "size": "small"}),
                    ),
                    h(
                        "ui-item",
                        {
                            "aria-label": "Done",
                            "selected": self.tasks.showing == "done",
                            "onClick": _each_3,
                            "style": "cursor:pointer;user-select:none",
                        },
                        h("ui-icon", {"name": "check square outline"}),
                        h("ui-popup", {"content": "Done", "inverted": True, "size": "small"}),
                    ),
                    h(
                        "ui-item",
                        {
                            "aria-label": "Remove done",
                            "onClick": lambda event: self.remove_the_done_tasks(),
                            "style": "cursor:pointer;user-select:none",
                        },
                        h("ui-icon", {"name": "trash alternate outline"}),
                        h("ui-popup", {"content": "Remove the done tasks", "inverted": True, "size": "small"}),
                    ),
                ),
            ),
            h(
                "ui-form",
                {"value": self},
                h(
                    "div",
                    {"class": "NewTask"},
                    h(
                        "ui-input",
                        {
                            "name": "draft",
                            "placeholder": "Something to do",
                            "aria-label": "New task",
                            "fluid": True,
                        },
                    ),
                    h(
                        "ui-button",
                        {
                            "primary": True,
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
                core.draw_thing(self.tasks),
                h(
                    "ui-property-editor",
                    {
                        "label": "Selected tasks",
                        "schema": "task-list-task",
                        "prop:value": self.tasks.selection,
                    },
                    h("ui-property", {"name": "title"}),
                    h("ui-property", {"name": "priority"}),
                    h("ui-property", {"name": "done"}),
                    h("ui-property", {"name": "notes"}),
                ),
            ),
        )


task_list = TaskList()

# Start
task_list.tasks.showing = "all"
task_list.tasks.append(Task(title="Write the Task List example", priority="high", done=True))
task_list.tasks.append(Task(title="Teach it to draw", priority="normal"))
task_list.tasks.append(Task(title="Select some tasks, then edit them together", priority="normal"))
task_list.tasks.append(Task(title="Drag tasks to reorder them", priority="low"))
task_list.start()


def test_the_filter() -> Any:
    """Tests"""
    with core.test("test the filter"):
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


# -----------


core.install_styles(None, """/* File styles.css:  how the task list looks.
   - The list and each task are elements of their own, so these rules reach them all:
     - the list, <task-list-checklist>, and its tasks inside it, each a <task-list-task>
     - inside a task, by its parts:  its row, ::part(row);  its grip, ::part(grip);  its title, ::part(title);
       its priority label, ::part(priority)
     - an empty list's placeholder, which it draws itself, by its part:  ::part(placeholder) */

/****************
 * The app:  its menu, the new task's field, then the list beside the property editor
 ****************/

.TaskList {
  padding-block: 1em;
}

/* the field and its button on one line */
.NewTask {
  display: flex;
  gap: 0.5em;
  margin-block: 1em;
}

.NewTask > ui-input {
  flex: 1;
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


test_tasks()
test_the_filter()
