"""PROPERTY RULES:  what a property's value must be, beyond its type (epic `property-editor` P9).

- Written in spell on the type:  `- its title must not be empty`.
- Compiled into the class:
  - with the property's declaration:  `prop(rules=[...])`
  - for a rule on a line of its own:  `Card.declare_rules("title", [...])`
- Each rule is a dict in Fomantic's object form, as JavaScript's `PropRule` is:
  `{"type": "minLength", "value": "3", "prompt": "Make it longer"}`.
- This module says:
  - whether a value keeps them, for a setter's WARNING (never a refusal)
  - what to say when it doesn't
- The JavaScript side is `$/util`'s `PropRules.ts`:  the same rules, the same words.
"""

import re
from collections.abc import Mapping, Sequence

# a rule, as compiled spell writes it
PropRule = Mapping[str, str]


def broken_rule(value: object, rules: Sequence[PropRule] | None) -> PropRule | None:
    """The first of `rules` that `value` breaks, else `None`.

    - An empty value (`None`, `""`, an empty list) breaks only `empty`:
      "must not be empty" is what says a value is required, so the others pass it, as a form's checks do.
    - Lengths count a list's items, else the text's characters.
    - Numbers are read from text too (`"7"`).
    """
    for rule in rules or ():
        if not _keeps_rule(value, rule):
            return rule
    return None


def rule_warning(property_name: str, rule: PropRule) -> str:
    """What a setter warns when `property_name` breaks `rule`;  the value it got follows.

    - e.g. `title must not be empty`
    - or in the rule's own words (its `prompt`):  `title:  Write it like 1.2.3`
    - JavaScript's `ruleWarning()`, word for word.
    """
    prompt = rule.get("prompt")
    return f"{property_name}:  {prompt}" if prompt else f"{property_name} {rule_text(rule)}"


def rule_text(rule: PropRule) -> str:
    """What `rule` asks for, in English:  `must not be empty`, `must be at least 3 letters long`.

    - Its `prompt` when it has one.
    """
    if rule.get("prompt"):
        return rule["prompt"]
    value = rule.get("value", "")
    low, _, high = value.partition("..")
    texts = {
        "empty": "must not be empty",
        "regExp": f"must match {value}",
        "minLength": f"must be at least {value} letters long",
        "maxLength": f"must be at most {value} letters long",
        "range": f"must be between {low} and {high}",
        "minValue": f"must be at least {value}",
        "maxValue": f"must be at most {value}",
        "email": "must be an email",
        "url": "must be a url",
    }
    return texts.get(rule.get("type", ""), f"must keep its rule {rule.get('type')}")


def rule_pattern(text: str | None) -> re.Pattern[str] | None:
    """Pattern `text` as a regular expression:  `"/^\\d+$/i"`, or a bare `"^\\d+$"`.

    - `None` for one that isn't a pattern, which then passes everything:  a typo in a rule never breaks a program.
    """
    if not text:
        return None
    slashed = re.fullmatch(r"/(.*)/([a-z]*)", text, re.DOTALL)
    source, flags = (slashed.group(1), slashed.group(2)) if slashed else (text, "")
    try:
        return re.compile(source, re.IGNORECASE if "i" in flags else 0)
    except re.error:
        return None


def _keeps_rule(value: object, rule: PropRule) -> bool:
    """Does `value` keep `rule`?  See `broken_rule()`."""
    kind = rule.get("type")
    if _is_empty(value):
        return kind != "empty"
    text = "" if isinstance(value, (list, tuple)) else _text_of(value)
    setting = rule.get("value", "")
    if kind == "regExp":
        pattern = rule_pattern(setting)
        return pattern is None or pattern.search(text) is not None
    if kind == "minLength":
        return _length_of(value) >= float(setting)
    if kind == "maxLength":
        return _length_of(value) <= float(setting)
    if kind == "range":
        low, _, high = setting.partition("..")
        return _in_range(text, low, high)
    if kind == "minValue":
        return _in_range(text, setting, "")
    if kind == "maxValue":
        return _in_range(text, "", setting)
    if kind == "email":
        return EMAIL.search(text) is not None
    if kind == "url":
        return URL.search(text) is not None
    return True


def _is_empty(value: object) -> bool:
    """Nothing to check:  `None`, blank text, an empty list."""
    if value is None:
        return True
    if isinstance(value, (list, tuple)):
        return len(value) == 0
    return isinstance(value, str) and value.strip() == ""


def _text_of(value: object) -> str:
    """`value` as JavaScript's `String()` writes it:  `7`, not `7.0`;  `true`, not `True`."""
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value)


def _length_of(value: object) -> int:
    """A list's items, else its text's characters."""
    return len(value) if isinstance(value, (list, tuple)) else len(_text_of(value))


def _in_range(text: str, low: str, high: str) -> bool:
    """Is `text` a number from `low` to `high`, both included?  A bound left blank is open."""
    try:
        number = float(text)
    except ValueError:
        return False
    if low and number < float(low):
        return False
    return not (high and number > float(high))


# an email address, as Fomantic's `email` rule reads one
EMAIL = re.compile(
    r"^[\w!#$%&'*+./=?^`{|}~-]+@[\da-z]([\da-z-]*[\da-z])?(\.[\da-z]([\da-z-]*[\da-z])?)*$", re.IGNORECASE
)

# a web address, as Fomantic's `url` rule reads one
URL = re.compile(r"(https?://(?:www\.|(?!www))[^\s.]+\.\S{2,}|www\.\S+\.\S{2,})", re.IGNORECASE)
