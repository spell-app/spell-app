// Component-pack fixture (`UIComponents.test.tsx`, `ComponentPack.test.ts`):  one module defining two tags, as a
// family's chunk does;  counts its imports on `globalThis.packWidgetImports`.
globalThis.packWidgetImports = (globalThis.packWidgetImports ?? 0) + 1

customElements.define("x-pack-chart", class extends HTMLElement {})
customElements.define("x-pack-legend", class extends HTMLElement {})
