// Icon pack index for the Spell UI site's `<ui-root>` page (`components/ui-root.html`):  ONE icon the page's own
// root doesn't load, so its examples can show that `icons` scopes packs to what's inside a root.
// Format:  `packages/ui/docs/icons.md` "Pack format".  Hand-written;  `yarn icons:pack` would keep it.
export default {
  id: "site-demo",
  label: "Spell UI site demo",
  license: "Drawn for the Spell UI docs",
  defaults: { width: 512, height: 512 },
  icons: {
    "spell-sparkle": {}
  }
}
