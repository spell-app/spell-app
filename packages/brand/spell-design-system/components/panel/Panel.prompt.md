Inspector-style side panel for tools and editors (e.g. the Color Set Chooser left pane).

```jsx
<Panel>
  <PanelHeader title="Color" tooltip="…" open={a} onToggle={…}>…</PanelHeader>
  <PanelSubHead title="Tweak" open={b} onToggle={…}>
    <Fieldset label="Vibrancy" value="100%" tooltip="How bold the colours are."><input type="range" /></Fieldset>
  </PanelSubHead>
</Panel>
```
Rules: 16px padding; 8px between items; bands are full-bleed; collapsed bands stack with 4px between.
