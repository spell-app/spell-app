/* GENERATED -- do not edit, run `yarn gen:root` (source:  every `<tag>.vocabulary.en.ts`) */

import type { RootCatalogEntry } from "./ui-root.types"

/** Every component tag => what `<ui-root>` needs before its family loads. */
export const ROOT_CATALOG: Readonly<Record<string, RootCatalogEntry>> = {
  "ui-accordion": {
    folder: "ui-accordion",
    skeleton: {
      parts: [
        { shape: "line", length: "long" },
        { shape: "line", length: "long" },
        { shape: "line", length: "long" }
      ]
    }
  },
  "ui-actions": { folder: "ui-parts" },
  "ui-ad": { folder: "ui-ad", skeleton: { width: "18em", height: "15em" } },
  "ui-author": { folder: "ui-parts" },
  "ui-avatar": { folder: "ui-parts" },
  "ui-breadcrumb": {
    folder: "ui-breadcrumb",
    skeleton: { parts: [{ shape: "line", length: "medium" }] }
  },
  "ui-breadcrumb-section": { folder: "ui-breadcrumb" },
  "ui-button": {
    folder: "ui-button",
    skeleton: { display: "inline", width: "6em", height: "2.5em" }
  },
  "ui-buttons": { folder: "ui-button" },
  "ui-calendar": {
    folder: "ui-calendar",
    skeleton: { display: "inline", width: "14em", height: "2.5em" }
  },
  "ui-card": {
    folder: "ui-card",
    skeleton: {
      width: "18em",
      parts: [{ shape: "image", ratio: "square" }, { shape: "header" }, { shape: "paragraph", lines: 3 }]
    }
  },
  "ui-cards": { folder: "ui-card" },
  "ui-checkbox": {
    folder: "ui-checkbox",
    skeleton: { display: "inline", width: "6em", height: "1.25em" }
  },
  "ui-code": { folder: "ui-code", skeleton: { parts: [{ shape: "paragraph", lines: 5 }] } },
  "ui-column": { folder: "ui-grid" },
  "ui-comment": {
    folder: "ui-comment",
    skeleton: {
      parts: [
        { shape: "header", image: true },
        { shape: "paragraph", lines: 2 }
      ]
    }
  },
  "ui-comments": { folder: "ui-comment" },
  "ui-container": { folder: "ui-container" },
  "ui-content": { folder: "ui-parts" },
  "ui-date": { folder: "ui-parts" },
  "ui-description": { folder: "ui-parts" },
  "ui-detail": { folder: "ui-parts" },
  "ui-dimmer": { folder: "ui-dimmer" },
  "ui-divider": { folder: "ui-divider", skeleton: { height: "0.25em" } },
  "ui-docs-api": {
    folder: "ui-docs-api",
    skeleton: {
      parts: [
        { shape: "line", length: "short" },
        { shape: "paragraph", lines: 5 }
      ]
    }
  },
  "ui-docs-example": {
    folder: "ui-docs-example",
    skeleton: { parts: [{ shape: "header" }, { shape: "paragraph", lines: 2 }] }
  },
  "ui-docs-nav": {
    folder: "ui-docs-nav",
    skeleton: {
      width: "15em",
      parts: [
        { shape: "paragraph", lines: 3 },
        { shape: "paragraph", lines: 8 }
      ]
    }
  },
  "ui-docs-search": { folder: "ui-docs-search", skeleton: { width: "16em", height: "2.25em" } },
  "ui-docs-themes": {
    folder: "ui-docs-themes",
    skeleton: { display: "inline", width: "5em", height: "2.25em" }
  },
  "ui-docs-toc": {
    folder: "ui-docs-toc",
    skeleton: {
      parts: [
        { shape: "line", length: "short" },
        { shape: "paragraph", lines: 6 }
      ]
    }
  },
  "ui-docs-tokens": {
    folder: "ui-docs-tokens",
    skeleton: {
      parts: [
        { shape: "line", length: "short" },
        { shape: "paragraph", lines: 5 }
      ]
    }
  },
  "ui-dropdown": {
    folder: "ui-dropdown",
    skeleton: { display: "inline", width: "14em", height: "2.5em" }
  },
  "ui-embed": { folder: "ui-embed", skeleton: { width: "28em", height: "15.75em" } },
  "ui-emoji": { folder: "ui-emoji", skeleton: { display: "inline", width: "1em", height: "1em" } },
  "ui-event": { folder: "ui-feed" },
  "ui-extra": { folder: "ui-parts" },
  "ui-feed": {
    folder: "ui-feed",
    skeleton: {
      parts: [
        { shape: "header", image: true },
        { shape: "paragraph", lines: 2 }
      ]
    }
  },
  "ui-field": { folder: "ui-form", skeleton: { height: "4.5em" } },
  "ui-fields": { folder: "ui-form" },
  "ui-flag": {
    folder: "ui-flag",
    skeleton: { display: "inline", width: "1.1em", height: "0.8em" }
  },
  "ui-flyout": { folder: "ui-flyout" },
  "ui-form": { folder: "ui-form" },
  "ui-grid": { folder: "ui-grid" },
  "ui-header": { folder: "ui-parts", skeleton: { parts: [{ shape: "line", length: "medium" }] } },
  "ui-icon": { folder: "ui-icon", skeleton: { display: "inline", width: "1em", height: "1em" } },
  "ui-icons": { folder: "ui-icon", skeleton: { display: "inline", width: "1em", height: "1em" } },
  "ui-image": {
    folder: "ui-image",
    skeleton: { width: "10em", parts: [{ shape: "image", ratio: "square" }] }
  },
  "ui-images": { folder: "ui-image" },
  "ui-include": { folder: "ui-include", skeleton: { parts: [{ shape: "paragraph", lines: 4 }] } },
  "ui-input": {
    folder: "ui-input",
    skeleton: { display: "inline", width: "14em", height: "2.5em" }
  },
  "ui-item": { folder: "ui-item" },
  "ui-items": {
    folder: "ui-items",
    skeleton: {
      parts: [
        { shape: "header", image: true },
        { shape: "paragraph", lines: 3 }
      ]
    }
  },
  "ui-label": {
    folder: "ui-label",
    skeleton: { display: "inline", width: "4em", height: "1.8em" }
  },
  "ui-labels": { folder: "ui-label" },
  "ui-list": { folder: "ui-list", skeleton: { parts: [{ shape: "paragraph", lines: 3 }] } },
  "ui-loader": { folder: "ui-loader" },
  "ui-markdown": {
    folder: "ui-markdown",
    skeleton: { parts: [{ shape: "header" }, { shape: "paragraph", lines: 4 }] }
  },
  "ui-menu": { folder: "ui-menu", skeleton: { height: "3em" } },
  "ui-message": {
    folder: "ui-message",
    skeleton: { parts: [{ shape: "header" }, { shape: "line", length: "long" }] }
  },
  "ui-meta": { folder: "ui-parts" },
  "ui-modal": { folder: "ui-modal" },
  "ui-nag": { folder: "ui-nag" },
  "ui-or": { folder: "ui-button" },
  "ui-panel": {
    folder: "ui-panel",
    skeleton: { parts: [{ shape: "header" }, { shape: "paragraph" }] }
  },
  "ui-placeholder": { folder: "ui-placeholder" },
  "ui-placeholder-header": { folder: "ui-placeholder" },
  "ui-placeholder-image": { folder: "ui-placeholder" },
  "ui-placeholder-line": { folder: "ui-placeholder" },
  "ui-placeholder-paragraph": { folder: "ui-placeholder" },
  "ui-popup": { folder: "ui-popup" },
  "ui-progress": { folder: "ui-progress", skeleton: { height: "2em" } },
  "ui-pushable": { folder: "ui-sidebar" },
  "ui-pusher": { folder: "ui-sidebar" },
  "ui-radio": {
    folder: "ui-checkbox",
    skeleton: { display: "inline", width: "6em", height: "1.25em" }
  },
  "ui-rail": { folder: "ui-rail" },
  "ui-rating": {
    folder: "ui-rating",
    skeleton: { display: "inline", width: "5.5em", height: "1.1em" }
  },
  "ui-reveal": { folder: "ui-reveal" },
  "ui-root": { folder: "ui-root" },
  "ui-row": { folder: "ui-grid" },
  "ui-search": {
    folder: "ui-search",
    skeleton: { display: "inline", width: "15em", height: "2.5em" }
  },
  "ui-section": {
    folder: "ui-section",
    skeleton: { parts: [{ shape: "header" }, { shape: "paragraph" }] }
  },
  "ui-sections": { folder: "ui-section" },
  "ui-segment": {
    folder: "ui-segment",
    skeleton: { parts: [{ shape: "header" }, { shape: "paragraph" }] }
  },
  "ui-segments": { folder: "ui-segment" },
  "ui-select": {
    folder: "ui-select",
    skeleton: { display: "inline", width: "12em", height: "2.5em" }
  },
  "ui-shape": { folder: "ui-shape" },
  "ui-side": { folder: "ui-shape" },
  "ui-sidebar": { folder: "ui-sidebar" },
  "ui-slider": { folder: "ui-slider", skeleton: { width: "16em", height: "1.25em" } },
  "ui-statistic": {
    folder: "ui-statistic",
    skeleton: { display: "inline", width: "6em", height: "4em" }
  },
  "ui-statistics": { folder: "ui-statistic" },
  "ui-step": { folder: "ui-step" },
  "ui-steps": { folder: "ui-step", skeleton: { height: "5em" } },
  "ui-sticky": { folder: "ui-sticky" },
  "ui-summary": { folder: "ui-parts" },
  "ui-tab": { folder: "ui-tab" },
  "ui-table": {
    folder: "ui-table",
    skeleton: {
      parts: [
        { shape: "line", length: "long" },
        { shape: "paragraph", lines: 4 }
      ]
    }
  },
  "ui-tabs": {
    folder: "ui-tab",
    skeleton: {
      parts: [
        { shape: "line", length: "medium" },
        { shape: "paragraph", lines: 3 }
      ]
    }
  },
  "ui-text": { folder: "ui-text" },
  "ui-textarea": { folder: "ui-input", skeleton: { width: "20em", height: "6em" } },
  "ui-title": { folder: "ui-parts" },
  "ui-toast": { folder: "ui-toast" },
  "ui-transition": { folder: "ui-transition" },
  "ui-value": { folder: "ui-parts" },
  "ui-visibility": { folder: "ui-visibility" }
}
