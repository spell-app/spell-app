////////////////////
//
//    Redux store setup.
//
////////////////////

import ReduxFactory from "./ReduxFactory";
import examples from "./examples.js";

export default ReduxFactory.createStore({
    // Factories to initialize as `{ domain: factory }`
    factories: {
      examples
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
});
