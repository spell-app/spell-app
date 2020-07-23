import React from "react"
import * as SUI from "semantic-ui-react"

import { view } from "~/util"
import { store } from "./store"

// const Error = view(function Error() {
//   const { error } = store
//   if (typeof error !== "string") return null
//   const split = error.split("::")
//   let header
//   let message
//   if (split.length === 1) {
//     header = "Error"
//     message = error
//   } else {
//     header = split[0]
//     message = split.slice(1).join("::")
//   }
//   const lines = message.split("\n")
//   return (
//     <div style={{ position: "fixed", top: 60, left: "calc(50% - 250px)", width: 500, zIndex: 100 }}>
//       <Toast onClose={store.hideError} style={{ maxWidth: "100%", background: "red", color: "white" }}>
//         <Toast.Header>
//           <i className="large exclamation triangle icon" />
//           <div style={{ marginLeft: "0.25em", marginRight: "auto", fontSize: "1.5em", fontWeight: "bold" }}>
//             {header}
//           </div>
//         </Toast.Header>
//         <Toast.Body>
//           {lines.map((line, index) => (
//             <div key={index}>{line}</div>
//           ))}
//         </Toast.Body>
//       </Toast>
//     </div>
//   )
// })

export const ErrorNotice = view(function ErrorNotice({ autoHide = false }) {
  const { error } = store

  // autoHide on timeout
  React.useEffect(() => {
    if (!autoHide || error === null) return
    setTimeout(() => {
      if (store.error === error) store.hideError()
    }, 3000)
  }, [error])

  if (!error) return null
  const message = error instanceof Error ? error.message : `${error}`

  const props = {
    error: true,
    style: { position: "fixed", top: 60, left: "calc(50% - 250px)", width: 500, zIndex: 100 },
    onDismiss: store.hideError,
    children: []
  }

  const lines = message.split("\n")
  const split = lines[0].split("::")
  let header, content, list
  if (split.length === 1) {
    header = "Error"
    content = lines[0]
  } else {
    header = split[0]
    content = split.slice(1).join("::")
  }
  if (lines.length > 1) {
    list = lines.slice(1)
  }
  return (
    <SUI.Message {...props}>
      {header && <SUI.Message.Header>{header}</SUI.Message.Header>}
      {content && <SUI.Message.Content>{content}</SUI.Message.Content>}
      {list && (
        <SUI.Message.List>
          {list.map((text, index) => (
            <SUI.Message.Item key={index}>{text}</SUI.Message.Item>
          ))}
        </SUI.Message.List>
      )}
    </SUI.Message>
  )
})
