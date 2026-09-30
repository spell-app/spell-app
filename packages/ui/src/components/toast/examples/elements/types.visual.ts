import type { VisualHooks } from "$test/test.types"

/**
 * Open states of `types.html` for `yarn test:visual`:  toasts from `UI.toast()`, in their popover container.
 * - `viewport`:  the container is placed by the viewport (top right by default).
 * - `displayTime: 0`:  they stay until dismissed, so nothing moves during the capture.
 * - `$/runtime` is imported INSIDE `open()`:  the node side imports this file for its state names only.
 */
export default {
  states: {
    "open-stack": {
      capture: "viewport",
      async open() {
        const { UI } = await import("$/runtime")
        UI.toast({ message: "I am a toast, nice to meet you!", displayTime: 0 })
        UI.toast({ title: "Better?", message: "Hey, I am a nice message!", type: "success", displayTime: 0 })
        UI.toast({ message: "Close me with the icon.", type: "warning", closeIcon: true, displayTime: 0 })
      }
    },
    "open-bottom-progress": {
      capture: "viewport",
      async open() {
        const { UI } = await import("$/runtime")
        UI.toast({
          message: "Counting down",
          position: "bottom center",
          showProgress: "bottom",
          type: "info",
          showIcon: true,
          displayTime: 0
        })
      }
    }
  }
} satisfies VisualHooks
