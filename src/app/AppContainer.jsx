import React from "react"
import { REACT_APP_ROOT_ID } from "~/util"

import "./AppContainer.less"

/**
 * Container element for the rendered spell `app`
 */
export const AppContainer = React.memo(() => <div id={REACT_APP_ROOT_ID} className="AppContainer" />)
