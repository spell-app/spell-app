Modal for confirmations and short forms; serif title, actions right-aligned.

```jsx
<Dialog open={open} onClose={close} title="Publish your app?" actions={<><Button variant="ghost" onClick={close}>Not yet</Button><Button>Publish</Button></>}>Anyone with the link can use it.</Dialog>
```