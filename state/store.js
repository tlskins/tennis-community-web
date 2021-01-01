import { createStore, applyMiddleware, combineReducers } from "redux"
import { HYDRATE, createWrapper } from "next-redux-wrapper"
import thunkMiddleware from "redux-thunk"

import { flashNotificationReducer } from "./ui/reducer"
import { userReducer } from "./user/reducer"
import { recentUploadsReducer } from "./upload/reducer"
import { albumReducer } from "./album/reducer"


const bindMiddleware = (middleware) => {
  if (process.env.NODE_ENV !== "production") {
    const { composeWithDevTools } = require("redux-devtools-extension")
    return composeWithDevTools(applyMiddleware(...middleware))
  }
  return applyMiddleware(...middleware)
}

const combinedReducer = combineReducers({
  flashNotification: flashNotificationReducer,
  user: userReducer,
  recentUploads: recentUploadsReducer,
  album: albumReducer,
})

export const LOG_OUT = "LOG_OUT"

export const logOut = () => ({
  type: LOG_OUT
})
  

const reducer = (state, action) => {
  if (action.type === HYDRATE) {
    return {
      ...state, // use previous state
      ...action.payload, // apply delta from hydration
    }
  } else if (action.type === LOG_OUT) {
    return {}
  }
  else {
    return combinedReducer(state, action)
  }
}

const initStore = () => {
  const isServer = typeof window === "undefined"
  if (isServer) {
    return createStore(reducer, bindMiddleware([thunkMiddleware]))
  } else {
    // we need it only on client side
    const {persistStore, persistReducer} = require("redux-persist")
    const storage = require("redux-persist/lib/storage").default

    const persistConfig = {
      key: "root",
      whitelist: ["user"], // make sure it does not clash with server keys
      storage
    }

    const persistedReducer = persistReducer(persistConfig, reducer)
    const store = createStore(persistedReducer, bindMiddleware([thunkMiddleware]))

    store.__persistor = persistStore(store) // Nasty hack

    return store
  }
}

export const wrapper = createWrapper(initStore)