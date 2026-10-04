Checkbox — round by default (to-do lists, habit items), square for consent/settings forms.

```jsx
<Checkbox label="Drink water" defaultChecked />
<Checkbox label="Read" strike checked={done} onChange={e => setDone(e.target.checked)} />
<Checkbox shape="square" label="Email me product updates" />
```