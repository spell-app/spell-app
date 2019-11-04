//----------------------------
//
//    Redux store setup.
//
//----------------------------

import { ReduxFactory, projects } from "./all"

export default ReduxFactory.createStore({
  // Factories to initialize as `{ domain: factory }`
  factories: {
    projects
  },

  // Any other reducers as `{ domain: reducer }`
  reducers: {},

  // Rehydrated state from server
  initialStoreState: undefined,

  // Array of middlewares
  middlewares: [],

  // Set up redux devtools automatically.
  useDevTools: true,

  // Random action creators, not associated with any factories
  actionCreators: {}
})
