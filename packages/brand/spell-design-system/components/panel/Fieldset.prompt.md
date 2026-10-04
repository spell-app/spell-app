A labelled control row: label left; actions, value and info icon right; control below with no gap.

```jsx
<Fieldset label="Base color sits on" actions={<AutoToggle />} value="400" tooltip="Which shade your colour becomes.">
  <input type="range" list="steps" />
</Fieldset>
```
Slots: label · actions · value · icon · tooltip. Tooltips: plain language, bold key terms, line breaks.
