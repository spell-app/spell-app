import { definePlugin, defineRule, type ESTree, type Rule } from "vite-plus/lint/plugins"

/**
 * `spell-ui`:  an oxlint plugin that keeps Spell UI's component files on Spell UI's patterns
 * (`packages/ui/AGENTS.md`, "Solid authoring";  epic `spell-element` P10).
 * - Each rule flags something a component does BY HAND that a decorator or a helper already does,
 *   and its message names that decorator or helper.
 * - Turned on only for the component folders `PATTERN_FOLDERS` names (`vite.lint.ts`):
 *   Spell UI's own, the plan docs' (`epics`) and the brand pages'.  Not the app, not the element core, not tests.
 * - A use that has to stay says why, on the line above:
 *   `// oxlint-disable-next-line spell-ui/no-untrack -- a starting value, read once as the component is built`.
 *   `--report-unused-disable-directives` (every package's `yarn lint`) reports one left behind.
 */

////////////////
// ## Rules
////////////////

/** Solid's own effect and timing calls, which a component never imports:  what to write instead. */
const SOLID_CALLS: Record<string, string> = {
  createEffect:
    'a hand-written effect:  use `@E.onChange("member")` on a method, or `@E.whileConnected` for a listener / ' +
    "observer that stops while the element is out of the page",
  createRenderEffect:
    'a hand-written render effect:  use `@E.onChange("member")` (`{ writesDOMElement: true }` to run on a ' +
    "server too) or an `@E.aria` / `@E.cssState` member",
  onSettled:
    '`onSettled()`:  use `@E.watches` for the light DOM, `@E.onChange("isReady")` for after the first draw, ' +
    "or `E.afterSolidUpdate()`",
  onMount:
    "Solid's `onMount()`:  override the component's own `onMount()` method, or use `@E.onChange` / `@E.whileConnected`"
}

/** `solid-js` imports a component never makes:  each of `SOLID_CALLS`. */
const noSolidEffect = defineRule({
  meta: {
    type: "suggestion",
    docs: { description: "No hand-written Solid effects in a component:  a decorator says it" },
    messages: { call: '{{advice}}  (`packages/ui/AGENTS.md`, "Solid authoring")' }
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value !== "solid-js") return
        for (const specifier of node.specifiers) {
          if (specifier.type !== "ImportSpecifier") continue
          const advice = SOLID_CALLS[nameOf(specifier.imported)]
          if (advice) context.report({ node: specifier, messageId: "call", data: { advice } })
        }
      }
    }
  }
})

/** `new MutationObserver(...)`:  `@E.watches` follows the element's own light DOM. */
const noMutationObserver = defineRule({
  meta: {
    type: "suggestion",
    docs: { description: "No hand-made MutationObserver in a component:  `@E.watches` follows the light DOM" },
    messages: {
      observer:
        "a hand-made `MutationObserver`:  use `@E.watches({ childList: true, ... })` on a getter or method.  " +
        "A watch on ANOTHER element, or one only while connected, stays:  say why"
    }
  },
  create(context) {
    return {
      NewExpression(node) {
        if (node.callee.type === "Identifier" && node.callee.name === "MutationObserver") {
          context.report({ node, messageId: "observer" })
        }
      }
    }
  }
})

/** `this.domElement.addEventListener(...)` (or a `domElement` local's):  `@E.on` or `this.on()`. */
const noDomElementListener = defineRule({
  meta: {
    type: "suggestion",
    docs: { description: "No addEventListener on the DOM element:  `@E.on` or `this.on()` add and remove it" },
    messages: {
      listener:
        'a listener added to the DOM element by hand:  use `@E.on("type") protected onType(event)` for the element\'s ' +
        "whole life, `this.on(type, listener)` for one added later, or `@E.whileConnected` for one that stops " +
        "while the element is out of the page"
    }
  },
  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee
        if (callee.type !== "MemberExpression" || nameOf(callee.property) !== "addEventListener") return
        if (isDomElement(callee.object)) context.report({ node, messageId: "listener" })
      }
    }
  }
})

/** `untrack(...)`:  `@E.untracked` on the method or getter. */
const noUntrack = defineRule({
  meta: {
    type: "suggestion",
    docs: { description: "No untrack() in a component:  `@E.untracked` on the method or getter says it" },
    messages: {
      untrack:
        "`untrack()` by hand:  mark the method or getter `@E.untracked` (an `@E.on` / `@E.onChange` method needs " +
        "none:  it runs untracked already)"
    }
  },
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type === "Identifier" && node.callee.name === "untrack") {
          context.report({ node, messageId: "untrack" })
        }
      }
    }
  }
})

/** The platform's timing calls, and the helper (`packages/ui/src/util/timing.ts`) that says WHEN instead. */
const TIMERS: Record<string, string> = {
  setTimeout: "`E.after(seconds, fn)` (or `E.soon(fn)` for a zero delay)",
  setInterval: "`E.every(seconds, fn)`",
  queueMicrotask: "`E.afterSolidUpdate(fn)`",
  requestAnimationFrame: "`E.beforeNextPaint(fn)`"
}

/** Globals a timer may be called through:  `window.setTimeout()` is still `setTimeout()`. */
const GLOBALS = new Set(["window", "globalThis", "self"])

/** A raw `setTimeout()`, `setInterval()`, `queueMicrotask()` or `requestAnimationFrame()`. */
const noRawTimer = defineRule({
  meta: {
    type: "suggestion",
    docs: { description: "No raw timers in a component:  a timing helper says when" },
    messages: { timer: "`{{name}}()` by hand:  use {{helper}}, which says WHEN it runs and can be canceled" }
  },
  create(context) {
    return {
      CallExpression(node) {
        const name = timerName(node.callee)
        if (name) context.report({ node, messageId: "timer", data: { name, helper: TIMERS[name]! } })
      }
    }
  }
})

/** An exported function that draws JSX with a PascalCase name:  a function component. */
const noFunctionComponent = defineRule({
  meta: {
    type: "suggestion",
    docs: { description: "No exported function components in a family folder:  a family is a class" },
    messages: {
      component:
        "`{{name}}` is a function component:  a family is a class (`class {{name}} extends E.UIComponent`, a tag of " +
        "its own), and a piece one family draws is a private render method of that class"
    }
  },
  create(context) {
    function check(node: ESTree.Node | null | undefined) {
      for (const { name, fn } of exportedFunctions(node)) {
        if (/^[A-Z][a-z]\w*$/.test(name) && hasJSX(fn))
          context.report({ node: fn, messageId: "component", data: { name } })
      }
    }
    return {
      ExportNamedDeclaration: (node) => check(node.declaration),
      ExportDefaultDeclaration: (node) => check(node.declaration as ESTree.Node)
    }
  }
})

////////////////
// ## Helpers
////////////////

/** The name of an identifier, a string literal (`import { "x" as y }`) or a property key;  `""` for anything else. */
function nameOf(node: ESTree.Node): string {
  if (node.type === "Identifier") return node.name
  if (node.type === "Literal" && typeof node.value === "string") return node.value
  return ""
}

/** Is `node` `this.domElement`, or a local named `domElement`? */
function isDomElement(node: ESTree.Node): boolean {
  if (node.type === "Identifier") return node.name === "domElement"
  return (
    node.type === "MemberExpression" && node.object.type === "ThisExpression" && nameOf(node.property) === "domElement"
  )
}

/** The timer `callee` calls (`setTimeout`, `window.setTimeout` ...), if it's one of `TIMERS`. */
function timerName(callee: ESTree.Node): string | undefined {
  if (callee.type === "Identifier") return callee.name in TIMERS ? callee.name : undefined
  if (callee.type !== "MemberExpression" || callee.object.type !== "Identifier") return undefined
  const name = nameOf(callee.property)
  return GLOBALS.has(callee.object.name) && name in TIMERS ? name : undefined
}

/** The named functions an `export` declares:  `export function X`, `export const X = () => ...`. */
function exportedFunctions(node: ESTree.Node | null | undefined): { name: string; fn: ESTree.Node }[] {
  if (!node) return []
  if (node.type === "FunctionDeclaration") return node.id ? [{ name: node.id.name, fn: node }] : []
  if (node.type !== "VariableDeclaration") return []
  return node.declarations.flatMap(({ id, init }) =>
    id.type === "Identifier" && (init?.type === "ArrowFunctionExpression" || init?.type === "FunctionExpression")
      ? [{ name: id.name, fn: init }]
      : []
  )
}

/** Does any node under `root` draw JSX? */
function hasJSX(root: ESTree.Node): boolean {
  const pending: unknown[] = [root]
  while (pending.length) {
    const node = pending.pop() as Record<string, unknown> | undefined
    if (!node || typeof node !== "object") continue
    if (node.type === "JSXElement" || node.type === "JSXFragment") return true
    for (const [key, value] of Object.entries(node)) {
      if (key !== "parent" && value && typeof value === "object")
        pending.push(...(Array.isArray(value) ? value : [value]))
    }
  }
  return false
}

////////////////
// ## Plugin
////////////////

/** The rules, by name:  `spell-ui/<name>` in a config or a disable comment. */
export const PATTERN_RULES = {
  "no-solid-effect": noSolidEffect,
  "no-mutation-observer": noMutationObserver,
  "no-dom-element-listener": noDomElementListener,
  "no-untrack": noUntrack,
  "no-raw-timer": noRawTimer,
  "no-function-component": noFunctionComponent
} satisfies Record<string, Rule>

export default definePlugin({ meta: { name: "spell-ui" }, rules: PATTERN_RULES })
